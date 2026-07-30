import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom's Blob doesn't implement arrayBuffer(); polyfill via FileReader so
// Blob-handling code (e.g. the zip builder) can be unit-tested. Real browsers
// provide this natively.
if (typeof Blob !== 'undefined' && typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    })
  }
}

// Reset the DOM and any localStorage between tests for isolation.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
