import { useEffect, useState } from 'react'
import { probeAudio, probeImage, probeVideo } from '@/lib/probe'

export interface MediaInfo {
  duration: number
  width: number
  height: number
  loading: boolean
}

const EMPTY: MediaInfo = { duration: 0, width: 0, height: 0, loading: false }

export function useMediaInfo(file: File | null, kind: 'video' | 'audio' | 'image'): MediaInfo {
  const [info, setInfo] = useState<MediaInfo>(EMPTY)

  useEffect(() => {
    if (!file) {
      setInfo(EMPTY)
      return
    }
    let active = true
    setInfo((prev) => ({ ...prev, loading: true }))
    const probe =
      kind === 'video'
        ? probeVideo(file).then((m) => ({ duration: m.duration, width: m.width, height: m.height }))
        : kind === 'audio'
          ? probeAudio(file).then((m) => ({ duration: m.duration, width: 0, height: 0 }))
          : probeImage(file).then((m) => ({ duration: 0, width: m.width, height: m.height }))

    probe
      .then((m) => active && setInfo({ ...m, loading: false }))
      .catch(() => active && setInfo({ ...EMPTY, loading: false }))
    return () => {
      active = false
    }
  }, [file, kind])

  return info
}
