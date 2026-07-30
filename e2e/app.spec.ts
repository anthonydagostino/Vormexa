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
