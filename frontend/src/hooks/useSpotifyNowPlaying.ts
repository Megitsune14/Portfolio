import { useCallback, useEffect, useRef, useState } from 'react'
import { getSpotifyNowPlaying } from '@/lib/api'
import type { SpotifyNowPlaying } from '@/types/api'

const SYNC_INTERVAL_MS = 8000
const TICK_INTERVAL_MS = 1000

function trackKey(track: SpotifyNowPlaying | null): string | null {
  if (!track?.name) return null
  return `${track.name}::${track.artist ?? ''}`
}

type UseSpotifyNowPlayingOptions = {
  onTrackChange?: () => void
  onTrackEnd?: () => void
}

export function useSpotifyNowPlaying(options: UseSpotifyNowPlayingOptions = {}) {
  const [snapshot, setSnapshot] = useState<SpotifyNowPlaying | null>(null)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endTrackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTrackKeyRef = useRef<string | null>(null)
  const hasInitializedRef = useRef(false)
  const onTrackChangeRef = useRef(options.onTrackChange)
  const onTrackEndRef = useRef(options.onTrackEnd)
  const syncFnRef = useRef<(isInitial?: boolean) => Promise<void>>(async () => {})
  const snapshotRef = useRef<SpotifyNowPlaying | null>(null)

  useEffect(() => {
    onTrackChangeRef.current = options.onTrackChange
  }, [options.onTrackChange])

  useEffect(() => {
    onTrackEndRef.current = options.onTrackEnd
  }, [options.onTrackEnd])

  const triggerEndTrackSync = useCallback(() => {
    onTrackEndRef.current?.()
    void syncFnRef.current(false)
  }, [])

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (endTrackRef.current) {
      clearTimeout(endTrackRef.current)
      endTrackRef.current = null
    }
  }, [])

  const scheduleEndTrackSync = useCallback((track: SpotifyNowPlaying) => {
    if (endTrackRef.current) {
      clearTimeout(endTrackRef.current)
      endTrackRef.current = null
    }

    if (
      !track.isPlaying ||
      track.progress === undefined ||
      track.duration === undefined
    ) {
      return
    }

    const remaining = track.duration - track.progress
    if (remaining <= 0) {
      endTrackRef.current = setTimeout(() => {
        triggerEndTrackSync()
      }, 500)
      return
    }

    endTrackRef.current = setTimeout(() => {
      triggerEndTrackSync()
    }, remaining)
  }, [triggerEndTrackSync])

  const startTick = useCallback(() => {
    if (tickRef.current) return

    tickRef.current = setInterval(() => {
      if (document.hidden) return

      setDisplayProgress((prev) => {
        const current = snapshotRef.current
        if (!current?.isPlaying || current.duration === undefined) return prev

        const next = Math.min(prev + TICK_INTERVAL_MS, current.duration)
        if (next >= current.duration) {
          stopTick()
          endTrackRef.current = setTimeout(() => {
            triggerEndTrackSync()
          }, 500)
        }
        return next
      })
    }, TICK_INTERVAL_MS)
  }, [stopTick, triggerEndTrackSync])

  const applySnapshot = useCallback(
    (data: SpotifyNowPlaying) => {
      const key = trackKey(data)
      const trackChanged = key !== null && key !== lastTrackKeyRef.current
      if (trackChanged) {
        if (hasInitializedRef.current) {
          onTrackChangeRef.current?.()
        }
        lastTrackKeyRef.current = key
      }

      if (key !== null) {
        hasInitializedRef.current = true
      }

      snapshotRef.current = data
      setSnapshot(data)

      const progress = data.progress ?? 0
      setDisplayProgress(progress)

      stopTick()

      if (data.isPlaying && data.duration !== undefined) {
        startTick()
        scheduleEndTrackSync({ ...data, progress })
      }
    },
    [scheduleEndTrackSync, startTick, stopTick],
  )

  const sync = useCallback(
    async (isInitial = false) => {
      try {
        const data = await getSpotifyNowPlaying()
        setError(null)
        applySnapshot(data)
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('Spotify fetch failed')
        setError(nextError)
        if (isInitial) {
          setSnapshot(null)
          setDisplayProgress(0)
        }
      } finally {
        if (isInitial) setLoading(false)
      }
    },
    [applySnapshot],
  )

  useEffect(() => {
    syncFnRef.current = sync
  }, [sync])

  useEffect(() => {
    void sync(true)

    syncRef.current = setInterval(() => {
      void sync(false)
    }, SYNC_INTERVAL_MS)

    return () => {
      if (syncRef.current) clearInterval(syncRef.current)
      stopTick()
    }
  }, [sync, stopTick])

  const progressPercent =
    snapshot?.duration && snapshot.duration > 0
      ? Math.min(100, (displayProgress / snapshot.duration) * 100)
      : 0

  return {
    snapshot,
    displayProgress,
    progressPercent,
    loading,
    error,
    refetch: () => sync(false),
  }
}
