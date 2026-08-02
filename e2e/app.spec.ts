import { test, expect, type Page } from '@playwright/test'

/** Build N distinct PNG File payloads inside the page. */
async function makePngFiles(page: Page, n: number) {
  const files: { name: string; mimeType: string; buffer: Buffer }[] = []
  for (let i = 0; i < n; i++) {
    const dataUrl = await page.evaluate((idx) => {
      const c = document.createElement('canvas')
      c.width = 200
      c.height = 140
      const x = c.getContext('2d')!
      x.fillStyle = ['#4f46e5', '#06b6d4', '#e11d48', '#22c55e'][idx % 4]
      x.fillRect(0, 0, 200, 140)
      x.fillStyle = '#fff'
      x.font = 'bold 40px sans-serif'
      x.fillText('#' + (idx + 1), 60, 85)
      return c.toDataURL('image/png')
    }, i)
    files.push({
      name: `img${i + 1}.png`,
      mimeType: 'image/png',
      buffer: Buffer.from(dataUrl.split(',')[1], 'base64'),
    })
  }
  return files
}

/** Build a tiny but valid 16-bit PCM WAV (0.1s @ 44.1kHz, a soft 440Hz tone). */
function wavBuffer(): Buffer {
  const sampleRate = 44100
  const numSamples = 4410
  const dataSize = numSamples * 2
  const buf = Buffer.alloc(44 + dataSize)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate * 2, 28) // byte rate
  buf.writeUInt16LE(2, 32) // block align
  buf.writeUInt16LE(16, 34) // bits/sample
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < numSamples; i++) {
    buf.writeInt16LE(Math.round(Math.sin((i / sampleRate) * 2 * Math.PI * 440) * 3000), 44 + i * 2)
  }
  return buf
}

test('marketing home renders and is cross-origin isolated', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Vormexa/)
  await expect(page.getByText('All in one place.')).toBeVisible()
  expect(await page.evaluate(() => self.crossOriginIsolated)).toBe(true)
})

test('workspace lists tools and routes to a tool page', async ({ page }) => {
  await page.goto('/app')
  await expect(page.getByRole('heading', { name: 'Your media toolbox' })).toBeVisible()
  await page.goto('/app/pdf/merge')
  await expect(page.getByRole('heading', { name: 'Merge PDF' })).toBeVisible()
})

test('image conversion runs fully on-device (Canvas pipeline)', async ({ page }) => {
  await page.goto('/app/image/convert')
  const [file] = await makePngFiles(page, 1)
  await page.locator('input[type=file]').first().setInputFiles(file)
  await expect(page.getByText('img1.png')).toBeVisible()
  await page.selectOption('select', 'webp')
  await page.getByRole('button', { name: 'Convert image' }).click()
  await expect(page.getByText('saved on your device')).toBeVisible()
})

test('Pro paywall gates bulk jobs and a license unlocks them', async ({ page, context }) => {
  // Free user: 4 images on a batch-gated tool → paywall.
  await page.goto('/app/image/merge')
  await page
    .locator('input[type=file]')
    .first()
    .setInputFiles(await makePngFiles(page, 4))
  await expect(page.getByText('Pro feature')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Merge images' })).toHaveCount(0)

  // Seed an active license and reload → gate lifts, job completes.
  await context.addInitScript(() => {
    localStorage.setItem(
      'vormexa-license',
      JSON.stringify({
        state: {
          key: 'TEST-KEY',
          instanceId: 'inst_1',
          status: 'active',
          valid: true,
          activatedAt: 1,
        },
        version: 0,
      }),
    )
  })
  await page.goto('/app/image/merge')
  await page
    .locator('input[type=file]')
    .first()
    .setInputFiles(await makePngFiles(page, 4))
  await expect(page.getByText('Pro feature')).toHaveCount(0)
  await page.getByRole('button', { name: 'Merge images' }).click()
  await expect(page.getByText('saved on your device')).toBeVisible()
})

test('ffmpeg.wasm audio pipeline runs under the production CSP (no violations)', async ({
  page,
}) => {
  // The preview server serves the same CSP as production. This exercises the
  // riskiest CSP surface — ffmpeg.wasm needs 'wasm-unsafe-eval' + blob: workers
  // — and asserts the engine loads, encodes, and triggers zero CSP violations.
  const cspViolations: string[] = []
  const isCsp = (s: string) => /Refused to|Content Security Policy/i.test(s)
  page.on('console', (msg) => {
    if (msg.type() === 'error' && isCsp(msg.text())) cspViolations.push(msg.text())
  })
  page.on('pageerror', (err) => {
    if (isCsp(String(err))) cspViolations.push(String(err))
  })

  await page.goto('/app/audio/convert')
  await page.locator('input[type=file]').first().setInputFiles({
    name: 'tone.wav',
    mimeType: 'audio/wav',
    buffer: wavBuffer(),
  })
  await expect(page.getByText('tone.wav')).toBeVisible()

  // Clicking the action auto-loads the on-device engine, then encodes WAV → MP3.
  await page.getByRole('button', { name: 'Convert audio' }).click()
  await expect(page.getByText('saved on your device')).toBeVisible({ timeout: 90_000 })

  expect(cspViolations, `Unexpected CSP violations:\n${cspViolations.join('\n')}`).toEqual([])
})
