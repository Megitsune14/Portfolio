import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import badAppleVideo from '@/assets/video/bad-apple.mp4'

type BadApplePhase = 'idle' | 'exiting' | 'playing' | 'entering'

interface BadAppleContextValue {
  phase: BadApplePhase
  activate: () => void
  deactivate: () => void
  completeExit: () => void
  completeEnter: () => void
}

const BadAppleContext = createContext<BadAppleContextValue | null>(null)

function useBadApple() {
  const ctx = useContext(BadAppleContext)
  if (!ctx) {
    throw new Error('useBadApple must be used within BadAppleProvider')
  }
  return ctx
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

export function BadAppleProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<BadApplePhase>('idle')

  const activate = useCallback(() => {
    setPhase((current) => (current === 'idle' ? 'exiting' : current))
  }, [])

  const deactivate = useCallback(() => {
    setPhase((current) => (current === 'playing' ? 'entering' : current))
  }, [])

  const completeExit = useCallback(() => {
    setPhase((current) => (current === 'exiting' ? 'playing' : current))
  }, [])

  const completeEnter = useCallback(() => {
    setPhase((current) => (current === 'entering' ? 'idle' : current))
  }, [])

  const value = useMemo(
    () => ({ phase, activate, deactivate, completeExit, completeEnter }),
    [phase, activate, deactivate, completeExit, completeEnter],
  )

  useEffect(() => {
    if (phase === 'idle') return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  return (
    <BadAppleContext.Provider value={value}>
      {children}
    </BadAppleContext.Provider>
  )
}

export function BadAppleContentWrapper({ children }: { children: ReactNode }) {
  const { phase, completeExit, completeEnter } = useBadApple()
  const [enterReady, setEnterReady] = useState(false)

  useEffect(() => {
    if (phase !== 'entering') {
      setEnterReady(false)
      return
    }

    const frame = requestAnimationFrame(() => setEnterReady(true))
    return () => cancelAnimationFrame(frame)
  }, [phase])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return

    if (phase === 'exiting') {
      completeExit()
    }

    if (phase === 'entering' && enterReady) {
      completeEnter()
    }
  }

  if (phase === 'playing') {
    return null
  }

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        'relative transition-all duration-700 ease-in-out',
        phase === 'exiting' && 'pointer-events-none scale-[0.98] opacity-0 blur-sm',
        phase === 'entering' && !enterReady && 'opacity-0',
        phase === 'entering' && enterReady && 'opacity-100',
      )}
    >
      {children}
    </div>
  )
}

export function BadAppleTrigger() {
  const { phase, activate } = useBadApple()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={activate}
      disabled={phase !== 'idle'}
      aria-label="Bad Apple"
    >
      <AppleIcon className="size-4" />
    </Button>
  )
}

export function BadAppleOverlay() {
  const { phase, deactivate } = useBadApple()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (phase !== 'playing') return

    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      void video.play()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        deactivate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, deactivate])

  useEffect(() => {
    if (phase === 'entering' || phase === 'idle') {
      const video = videoRef.current
      if (video) {
        video.pause()
        video.currentTime = 0
      }
    }
  }, [phase])

  if (phase !== 'playing') return null

  return (
    <div className="pointer-events-none fixed inset-0 z-100 overflow-hidden">
      <video
        ref={videoRef}
        src={badAppleVideo}
        playsInline
        className="absolute top-1/2 left-1/2 h-auto w-auto min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={deactivate}
        aria-label="Fermer"
        className="pointer-events-auto fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-110 size-10 rounded-full bg-white/90 text-black hover:bg-white hover:text-black sm:size-11"
      >
        <X className="size-5" />
      </Button>
    </div>
  )
}
