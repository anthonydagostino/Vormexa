/** Lightweight, dependency-free media metadata probing via native elements. */

export interface VideoMeta {
  width: number
  height: number
  duration: number
}

export interface AudioMeta {
  duration: number
}

export interface ImageMeta {
  width: number
  height: number
}

export function probeVideo(file: File | Blob): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    const cleanup = () => URL.revokeObjectURL(url)
    video.onloadedmetadata = () => {
      const meta = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      }
      cleanup()
      resolve(meta)
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('Could not read video metadata'))
    }
    video.src = url
  })
}

export function probeAudio(file: File | Blob): Promise<AudioMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const cleanup = () => URL.revokeObjectURL(url)
    audio.onloadedmetadata = () => {
      const meta = { duration: Number.isFinite(audio.duration) ? audio.duration : 0 }
      cleanup()
      resolve(meta)
    }
    audio.onerror = () => {
      cleanup()
      reject(new Error('Could not read audio metadata'))
    }
    audio.src = url
  })
}

export function probeImage(file: File | Blob): Promise<ImageMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const cleanup = () => URL.revokeObjectURL(url)
    img.onload = () => {
      const meta = { width: img.naturalWidth, height: img.naturalHeight }
      cleanup()
      resolve(meta)
    }
    img.onerror = () => {
      cleanup()
      reject(new Error('Could not read image metadata'))
    }
    img.src = url
  })
}

/** Generate a poster/thumbnail data URL from a video at a given time. */
export function videoThumbnail(file: File | Blob, atSeconds = 0.1): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const cleanup = () => URL.revokeObjectURL(url)
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(atSeconds, (video.duration || 1) / 2)
    }
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('no canvas context')
        ctx.drawImage(video, 0, 0)
        const data = canvas.toDataURL('image/jpeg', 0.7)
        cleanup()
        resolve(data)
      } catch (e) {
        cleanup()
        reject(e)
      }
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('Could not render video thumbnail'))
    }
    video.src = url
  })
}
