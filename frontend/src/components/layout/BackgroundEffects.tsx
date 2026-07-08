export function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-rose-600/15 blur-3xl animate-pulse-glow" />
      <div className="absolute top-1/3 -right-20 size-80 rounded-full bg-amber-500/12 blur-3xl animate-pulse-glow [animation-delay:1s]" />
      <div className="absolute -bottom-20 left-1/3 size-72 rounded-full bg-violet-600/20 blur-3xl animate-pulse-glow [animation-delay:2s]" />
    </div>
  )
}
