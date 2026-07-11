import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { resolvePublicAssetUrl } from '@/lib/assets'
import { cn } from '@/lib/utils'

export const portfolioCardClass = 'glass stat-card'

type PortfolioAccent = 'primary' | 'gold' | 'accent'

const accentIconStyles: Record<PortfolioAccent, string> = {
  primary: 'bg-primary/15 text-primary ring-primary/35',
  gold: 'bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] text-(--gold) ring-(--gold)/40',
  accent: 'bg-accent/12 text-accent ring-accent/35',
}

export function PortfolioSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold font-heading tracking-tight sm:text-3xl">{children}</h2>
    </div>
  )
}

export function PortfolioEmptyState({ message }: { message: string }) {
  return (
    <div className={cn(portfolioCardClass, 'mt-14 px-6 py-8 text-center')}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function PortfolioCardDivider() {
  return (
    <div
      className="h-px w-full border-0"
      style={{
        background:
          'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 35%, transparent), color-mix(in srgb, var(--gold) 45%, transparent), color-mix(in srgb, var(--primary) 35%, transparent), transparent)',
      }}
    />
  )
}

function parseProjectStack(techStack: string) {
  return techStack
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':')
      if (colon === -1) {
        return { category: null as string | null, tags: [line] }
      }

      const category = line.slice(0, colon).trim()
      const tags = line
        .slice(colon + 1)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      return { category, tags }
    })
}

export function ProjectCard({
  title,
  description,
  techStack,
  imageUrl,
  links,
  linksLabel,
}: {
  title: string
  description: string
  techStack: string
  imageUrl?: string
  links: { label: string; url: string }[]
  linksLabel: string
}) {
  const stack = parseProjectStack(techStack)

  return (
    <article
      className={cn(
        portfolioCardClass,
        'group flex h-full flex-col p-5 transition-all duration-300 sm:p-6',
        'hover:-translate-y-1 hover:border-primary/50',
        'hover:shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_15%,transparent)]',
      )}
    >
      {imageUrl && (
        <div className="mb-4 overflow-hidden rounded-lg border border-border/50">
          <img
            src={resolvePublicAssetUrl(imageUrl)}
            alt=""
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <header>
        <h3 className="font-heading text-xl font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </header>

      {stack.length > 0 && (
      <div className="mt-5 space-y-2.5">
        {stack.map((row) => (
          <div
            key={`${row.category ?? 'line'}-${row.tags.join(',')}`}
            className="rounded-lg border border-border/50 bg-background/30 px-3.5 py-2.5"
          >
            {row.category && (
              <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                {row.category}
              </p>
            )}
            <div className={cn('flex flex-wrap gap-1.5', row.category && 'mt-2')}>
              {row.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-primary/25 bg-primary/8 px-2 py-0.5 text-xs font-medium text-foreground/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      {links.length > 0 && (
        <footer className="mt-auto pt-5">
          <PortfolioCardDivider />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {linksLabel}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {links.map((link, linkIndex) => (
                <span key={`${link.label}-${link.url}`} className="inline-flex items-center gap-2">
                  {linkIndex > 0 && (
                    <span className="text-muted-foreground/40" aria-hidden>
                      ·
                    </span>
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    {link.label}
                    <ExternalLink className="size-3.5 opacity-70" />
                  </a>
                </span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </article>
  )
}

const socialAccents: PortfolioAccent[] = ['primary', 'accent', 'gold', 'primary', 'accent', 'gold', 'primary', 'accent', 'gold', 'primary']

export function SocialCard({
  index,
  name,
  username,
  url,
  icon,
}: {
  index: number
  name: string
  username?: string
  url?: string
  icon?: string
}) {
  const accent = socialAccents[index % socialAccents.length]!
  const initial = name.charAt(0).toUpperCase()

  const content = (
    <div
      className={cn(
        'flex h-full items-center gap-4 rounded-xl border px-4 py-3.5 transition-all duration-300',
        accent === 'primary' && 'border-primary/30 bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]',
        accent === 'gold' && 'border-(--gold)/30 bg-[color-mix(in_srgb,var(--gold)_5%,transparent)]',
        accent === 'accent' && 'border-accent/30 bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]',
        url && 'group hover:-translate-y-0.5 hover:border-primary/45',
      )}
    >
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl font-heading text-base font-bold',
          !icon && cn('ring-1', accentIconStyles[accent]),
        )}
      >
        {icon ? (
          <img src={resolvePublicAssetUrl(icon)} alt="" className="size-9 object-contain" />
        ) : (
          initial
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {name}
        </p>
        <p className="mt-0.5 truncate font-medium text-foreground">{username ?? name}</p>
      </div>
      {url ? (
        <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      ) : (
        <span className="w-4 shrink-0" aria-hidden />
      )}
    </div>
  )

  if (!url) {
    return content
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group block h-full">
      {content}
    </a>
  )
}
