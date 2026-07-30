import { describe, expect, it } from 'vitest'
import { createZip } from './download'

const LOCAL_HEADER = 0x04034b50
const EOCD = 0x06054b50

describe('createZip', () => {
  it('produces a structurally valid STORE zip', async () => {
    const data = new TextEncoder().encode('Hi Vormexa')
    const blob = await createZip([{ name: 'hello.txt', data }])
    expect(blob.type).toBe('application/zip')

    const bytes = new Uint8Array(await blob.arrayBuffer())
    const view = new DataView(bytes.buffer)

    // Local file header signature at the start.
    expect(view.getUint32(0, true)).toBe(LOCAL_HEADER)

    // Filename is stored at offset 30.
    const name = new TextDecoder().decode(bytes.slice(30, 30 + 'hello.txt'.length))
    expect(name).toBe('hello.txt')

    // End-of-central-directory record with a total entry count of 1.
    const eocdOffset = bytes.length - 22
    expect(view.getUint32(eocdOffset, true)).toBe(EOCD)
    expect(view.getUint16(eocdOffset + 10, true)).toBe(1)
  })

  it('is deterministic (no timestamps) and records every entry', async () => {
    const files = [
      { name: 'a.txt', data: new TextEncoder().encode('aaa') },
      { name: 'b.txt', data: new TextEncoder().encode('bbbb') },
    ]
    const one = new Uint8Array(await (await createZip(files)).arrayBuffer())
    const two = new Uint8Array(await (await createZip(files)).arrayBuffer())
    expect(one).toEqual(two)

    const view = new DataView(two.buffer)
    expect(view.getUint16(two.length - 22 + 10, true)).toBe(2)
  })

  it('accepts Blob inputs as well as byte arrays', async () => {
    const blob = await createZip([{ name: 'x.bin', data: new Blob([new Uint8Array([1, 2, 3])]) }])
    const bytes = new Uint8Array(await blob.arrayBuffer())
    expect(new DataView(bytes.buffer).getUint32(0, true)).toBe(LOCAL_HEADER)
  })
})
