# Design System UI/UX — Shu Vermillon Violet

Documentation portable pour reproduire l'identité visuelle et les patterns UI/UX de Megitsune sur **tout type de site** : landing, portfolio, app web, dashboard, docs, e-commerce, auth, etc.

Inspiré de l'esthétique **wabi-chic cyber** : chaleur vermillon (朱) et or (金) en touches légères, violet profond comme fil conducteur, duo typographique **Geist** (UI) + **Shippori Mincho** (titres).

---

## 1. Identité visuelle

### Philosophie

- **Clair + sombre** : `:root` = mode clair (défaut), `.dark` = mode sombre — les deux sont first-class
- **Triade chromatique** : violet (structure, CTA) · vermillon (chaleur, highlights) · or (premium, featured)
- **Glassmorphism** : surfaces semi-transparentes avec `backdrop-blur`
- **Glow subtil** : halo violet + touche vermillon sur actions primaires et éléments mis en avant
- **Minimalisme** : pas d'éléments décoratifs sans fonction (sections remplissage, labels superflus…)
- **Cohérence** : mêmes tokens, mêmes utilities et mêmes composants shadcn quel que soit le type de site

### Palette (tokens CSS)

Toujours utiliser les tokens Tailwind (`bg-background`, `text-primary`, `text-accent`, `border-border`) — jamais de couleurs en dur dans les composants, sauf cas documentés ci-dessous.

| Token | Clair (`:root`) | Sombre (`.dark`) | Usage |
|-------|-----------------|------------------|-------|
| `--background` | `#faf6f0` | `#07070f` | Fond page (papier washi / nuit profonde) |
| `--foreground` | `#1c1525` | `#f5f0eb` | Texte principal |
| `--primary` | `#7c3aed` | `#8b5cf6` | CTA, icônes actives, structure |
| `--accent` | `#e85d4c` | `#f07167` | Highlights chauds, liens secondaires |
| `--gold` | `#c9a227` | `#e8b84a` | Featured, pricing, accents premium |
| `--muted-foreground` | `#6b5f7a` | `#a89ec4` | Texte secondaire, labels |
| `--border` | `rgba(124, 58, 237, 0.14)` | `rgba(139, 92, 246, 0.2)` | Bordures |
| `--card` | `rgba(255, 252, 248, 0.85)` | `rgba(15, 15, 26, 0.75)` | Fond glass |
| `--sidebar` | `#f5f0e8` | `#0f0f1a` | Sidebar app / dashboard |
| `--radius` | `0.75rem` | `0.75rem` | Rayon de base |

**Rôles des accents :**

| Couleur | Quand l'utiliser | Classes |
|---------|------------------|---------|
| Violet (`--primary`) | CTA, nav active, icônes, focus ring | `text-primary`, `bg-primary`, `border-primary` |
| Vermillon (`--accent`) | Highlights chauds, liens secondaires, hover chaleureux | `text-accent`, `bg-accent/10`, `border-accent/40` |
| Or (`--gold`) | Plan featured, prix, titres décoratifs ponctuels | `text-(--gold)`, `border-(--gold)/50` |

**Exceptions autorisées (hardcodées) :**

- Navbar shell sombre : `#0a0a14/95` (uniquement sous `.dark`)
- Orbes décoratifs : `bg-rose-600/15`, `bg-amber-500/12`, `bg-violet-600/20`
- Gradient texte : vermillon → or → violet (voir `.text-gradient`)

### Changer la couleur de marque

Modifier uniquement les tokens CSS (`--primary`, `--accent`, `--gold`, `--border`, dérivés) — les deux thèmes et tous les types de site s'adaptent automatiquement.

---

## 2. Stack et bootstrap

### Dépendances

| Package | Rôle |
|---------|------|
| React 19 + Vite 8 + TypeScript | Base app |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Styling |
| shadcn/ui style `radix-nova` | Composants UI |
| `@fontsource-variable/geist` | UI, corps, labels, formulaires |
| `@fontsource/shippori-mincho` | Titres et display (latin + latin-ext) |
| `tw-animate-css` | Animations (accordion, dialogs…) |
| `lucide-react` | Icônes |
| `clsx` + `tailwind-merge` | Utilitaire `cn()` |

### Imports CSS (`src/index.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";
@import "@fontsource/shippori-mincho/latin-500.css";
@import "@fontsource/shippori-mincho/latin-600.css";
@import "@fontsource/shippori-mincho/latin-700.css";
@import "@fontsource/shippori-mincho/latin-ext-500.css";
@import "@fontsource/shippori-mincho/latin-ext-600.css";
@import "@fontsource/shippori-mincho/latin-ext-700.css";

@custom-variant dark (&:is(.dark *));
```

### Typographie : Geist + Shippori Mincho

Deux polices complémentaires — le contenu est en **français ou multilingue (alphabet latin)**, sans texte japonais dans l'UI.

| Police | Rôle | Token Tailwind |
|--------|------|----------------|
| **Geist Variable** | Corps, navigation, labels, formulaires, boutons | `font-sans` (défaut) |
| **Shippori Mincho** | Titres H1–H3, hero, stats / prix | `font-heading` |

Importer **uniquement** les subsets `latin` + `latin-ext` pour Shippori Mincho (pas de subset `japanese` — le texte ne contient pas de caractères JP).

```css
@theme inline {
  --font-sans: "Geist Variable", "Geist", system-ui, sans-serif;
  --font-heading: "Shippori Mincho", "Georgia", serif;
}
```

### Alias de chemins

```json
// tsconfig + vite.config.ts
"@/*": ["./src/*"]
```

### Utilitaire `cn()`

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### HTML racine et thème

```html
<html lang="fr" suppressHydrationWarning>
```

Ne pas forcer `class="dark"` — le thème est géré dynamiquement (voir section 2 bis).

Meta `theme-color` dynamique :

| Mode | `theme-color` |
|------|---------------|
| Clair | `#faf6f0` |
| Sombre | `#07070f` |

Script anti-flash (optionnel, dans `<head>` avant le rendu) :

```html
<script>
  (function () {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const theme = stored ?? (prefersDark ? "dark" : "light")
    if (theme === "dark") document.documentElement.classList.add("dark")
  })()
</script>
```

### 2 bis. Gestion du thème clair / sombre

Hook minimal — créer une fois, réutiliser partout :

```typescript
// src/hooks/useTheme.ts
import { useEffect, useState } from "react"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem("theme") as Theme | null
  if (stored) return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute("content", theme === "dark" ? "#07070f" : "#faf6f0")
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" }
}
```

Composant toggle (à placer dans Navbar ou header app) — voir aussi section 7.

---

## 3. Tokens et utilities CSS

Coller dans `src/index.css` après les imports. **Obligatoire sur tout projet**, quel que soit le type de site.

### Tokens `:root` (clair) et `.dark` (sombre)

`:root` = mode clair par défaut. `.dark` surcharge pour le mode sombre.

```css
:root {
  --radius: 0.75rem;
  --background: #faf6f0;
  --foreground: #1c1525;
  --card: rgba(255, 252, 248, 0.85);
  --card-foreground: #1c1525;
  --primary: #7c3aed;
  --primary-foreground: #ffffff;
  --secondary: rgba(232, 93, 76, 0.1);
  --secondary-foreground: #5c1f18;
  --muted: rgba(124, 58, 237, 0.06);
  --muted-foreground: #6b5f7a;
  --accent: #e85d4c;
  --accent-foreground: #ffffff;
  --gold: #c9a227;
  --destructive: #dc2626;
  --border: rgba(124, 58, 237, 0.14);
  --input: rgba(124, 58, 237, 0.12);
  --ring: #7c3aed;
  --sidebar: #f5f0e8;
  --sidebar-foreground: #1c1525;
  --sidebar-primary: #7c3aed;
  --sidebar-border: rgba(124, 58, 237, 0.14);
  --section-alt: color-mix(in srgb, var(--primary) 9%, var(--sidebar));
}

.dark {
  --background: #07070f;
  --foreground: #f5f0eb;
  --card: rgba(15, 15, 26, 0.75);
  --card-foreground: #f5f0eb;
  --primary: #8b5cf6;
  --primary-foreground: #ffffff;
  --secondary: rgba(240, 113, 103, 0.12);
  --secondary-foreground: #fde8e6;
  --muted: rgba(139, 92, 246, 0.08);
  --muted-foreground: #a89ec4;
  --accent: #f07167;
  --accent-foreground: #ffffff;
  --gold: #e8b84a;
  --destructive: #ef4444;
  --border: rgba(139, 92, 246, 0.2);
  --input: rgba(139, 92, 246, 0.15);
  --ring: #8b5cf6;
  --sidebar: #0f0f1a;
  --sidebar-foreground: #f5f0eb;
  --sidebar-primary: #8b5cf6;
  --sidebar-border: rgba(139, 92, 246, 0.2);
  --section-alt: color-mix(in srgb, var(--primary) 7%, var(--background));
}
```

### Base layer

```css
@layer base {
  * { @apply border-border outline-ring/50; }
  html { scroll-behavior: smooth; @apply font-sans; }
  body { @apply font-sans antialiased bg-background text-foreground; min-height: 100svh; }
  #root { min-height: 100svh; }
}
```

### Utilities custom

| Classe | Usage |
|--------|-------|
| `.site-container` | Conteneur principal (toute page) |
| `.site-container-narrow` | Colonne de lecture (docs, auth, formulaires) |
| `.glass` | Cartes, panneaux, modales |
| `.navbar-shell` | Header / navbar flottante |
| `.glow-primary` | Action primaire (violet + touche vermillon) |
| `.glow-primary-hover` | Intensifier le glow au hover |
| `.glow-gold` | Élément featured / premium |
| `.text-gradient` | Titres hero — vermillon → or → violet |
| `.text-gradient-subtle` | Sous-titres décoratifs — or → violet |
| `.grid-bg` | Fond décoratif (optionnel) |
| `.section-alt` | Fond alterné des sections marketing (1 sur 2) |
| `.stat-card` | Cartes stats / widgets live (bandeau triade + glow) |
| `.stat-divider` | Séparateur dégradé vermillon → or → violet |
| `.avatar-triad` | Cadre PDP circulaire — bordure triade + glow |
| `.avatar-triad-inner` | Conteneur image intérieur (ring fond) |
| `.hero-avatar` | Variante hero — padding et glow renforcés |

```css
@layer utilities {
  .site-container {
    @apply mx-auto w-full;
    padding-inline: clamp(1rem, 4vw, 4rem);
  }

  .site-container-narrow {
    @apply mx-auto w-full;
    padding-inline: clamp(1rem, 4vw, 4rem);
    max-width: 48rem;
  }

  .glass {
    @apply border border-border/60 bg-card/80 backdrop-blur-xl;
  }

  .section-alt {
    background-color: var(--section-alt);
  }

  .navbar-shell {
    @apply border border-primary/30 bg-card/95 backdrop-blur-2xl;
    box-shadow:
      0 8px 32px color-mix(in srgb, var(--foreground) 6%, transparent),
      0 0 0 1px color-mix(in srgb, var(--primary) 12%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--foreground) 4%, transparent);
  }

  .dark .navbar-shell {
    @apply border-primary/40 bg-[#0a0a14]/95;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(139, 92, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .glow-primary {
    box-shadow:
      0 0 20px color-mix(in srgb, var(--primary) 35%, transparent),
      0 0 50px color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .glow-primary-hover:hover {
    box-shadow:
      0 0 25px color-mix(in srgb, var(--primary) 50%, transparent),
      0 0 70px color-mix(in srgb, var(--accent) 18%, transparent);
  }

  .glow-gold {
    box-shadow:
      0 0 20px color-mix(in srgb, var(--gold) 30%, transparent),
      0 0 50px color-mix(in srgb, var(--primary) 12%, transparent);
  }

  .text-gradient {
    @apply bg-linear-to-r from-rose-500 via-amber-400 to-violet-500 bg-clip-text text-transparent;
  }

  .dark .text-gradient {
    @apply from-rose-400 via-amber-300 to-violet-400;
  }

  .text-gradient-subtle {
    @apply bg-linear-to-r from-amber-500 to-violet-500 bg-clip-text text-transparent;
  }

  .grid-bg {
    background-image:
      linear-gradient(color-mix(in srgb, var(--primary) 7%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 70%);
  }

  .stat-card {
    @apply relative overflow-hidden border-primary/35;
    box-shadow:
      0 0 28px color-mix(in srgb, var(--primary) 12%, transparent),
      0 0 60px color-mix(in srgb, var(--accent) 6%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .stat-card::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 0;
    z-index: 1;
    height: 2px;
    background: linear-gradient(to right, var(--accent), var(--gold), var(--primary));
  }

  .stat-divider {
    height: 1px;
    border: none;
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in srgb, var(--accent) 40%, transparent),
      color-mix(in srgb, var(--gold) 50%, transparent),
      color-mix(in srgb, var(--primary) 40%, transparent),
      transparent
    );
  }

  .avatar-triad {
    @apply relative shrink-0 rounded-full p-[2px];
    background: linear-gradient(135deg, var(--accent), var(--gold), var(--primary));
    box-shadow:
      0 0 16px color-mix(in srgb, var(--primary) 18%, transparent),
      0 0 32px color-mix(in srgb, var(--accent) 8%, transparent);
  }

  .avatar-triad-inner {
    @apply size-full overflow-hidden rounded-full ring-2 ring-background/90;
  }

  .hero-avatar {
    @apply p-[3px];
    box-shadow:
      0 0 28px color-mix(in srgb, var(--primary) 22%, transparent),
      0 0 56px color-mix(in srgb, var(--accent) 10%, transparent);
  }
}
```

> **Tailwind v4** : utiliser `bg-linear-to-r` et `bg-linear-to-br`, pas `bg-gradient-to-r`.

### Animations custom

```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
.animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
```

---

## 4. Typographie

**Geist Variable** pour tout le texte d'interface (lisibilité, densité UI). **Shippori Mincho** pour les titres — serif élégante qui renforce l'identité wabi-chic sans nécessiter de contenu japonais.

| Élément | Classes | Police |
|---------|---------|--------|
| H1 page | `text-3xl sm:text-4xl lg:text-5xl font-bold font-heading tracking-tight leading-tight` | Shippori Mincho |
| H1 hero | `text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight` + `.text-gradient` | Shippori Mincho |
| H2 section | `text-2xl sm:text-3xl font-bold font-heading tracking-tight` | Shippori Mincho |
| H3 card | `text-lg font-heading font-medium` | Shippori Mincho |
| Body | `text-base leading-relaxed` | Geist (défaut) |
| Body secondaire | `text-sm text-muted-foreground leading-relaxed` | Geist |
| Label / nav | `text-sm font-medium text-foreground/80 hover:text-foreground` | Geist |
| Caption | `text-xs text-muted-foreground` | Geist |
| Footer | `text-sm text-muted-foreground` | Geist |
| Stat / prix | `text-4xl font-bold font-heading text-(--gold)` | Shippori Mincho |

> **i18n** : textes en français ou multilingue (Latin). Ne pas ajouter de subset `japanese` ni de chaînes en japonais dans les fichiers de traduction.

---

## 5. Primitives de layout

Composants réutilisables sur **tout** projet. Créer une fois, adapter partout.

### SiteContainer

```tsx
// components/layout/SiteContainer.tsx
export function SiteContainer({ narrow, className, ...props }) {
  return (
    <div className={cn(narrow ? "site-container-narrow" : "site-container", className)} {...props} />
  )
}

export function SiteSection({ className, ...props }) {
  return <section className={cn("py-16 sm:py-20", className)} {...props} />
}
```

| Variante | Quand l'utiliser |
|----------|------------------|
| `site-container` | Pages standard, dashboards, grilles |
| `site-container-narrow` | Auth, docs, formulaires, FAQ, articles |
| `SiteSection` | Blocs verticaux avec espacement cohérent |

### Alternance de fond (sections marketing)

Sur les landings et pages vitrine empilées, alterner le fond **une section sur deux** pour rythmer la page sans surcharger :

| Bloc | Fond |
|------|------|
| Hero (`<section>` plein écran, hors `SiteSection`) | Normal — `bg-background` (hérité du shell) |
| 1ᵉ `SiteSection` après le hero | `className="section-alt"` |
| 2ᵉ `SiteSection` | Normal — pas de classe de fond |
| 3ᵉ `SiteSection` | `section-alt` |
| … | Alternance identique |
| Footer | Normal — `border-t` uniquement, jamais `section-alt` |

```tsx
{/* Hero — fond normal */}
<section className="relative flex min-h-svh items-center">{/* … */}</section>

{/* 1ère section — fond atténué */}
<SiteSection id="features" className="section-alt">{/* … */}</SiteSection>

{/* 2ème section — fond normal */}
<SiteSection id="pricing">{/* … */}</SiteSection>

{/* 3ème section — fond atténué */}
<SiteSection id="faq" className="section-alt">{/* … */}</SiteSection>
```

Utiliser la utility `.section-alt` (token `--section-alt`) — **pas** `bg-muted/30`, trop faible en mode clair. Le token mélange `--primary` + `--sidebar` (clair) ou `--background` (sombre) via `color-mix`. Si une page n'a qu'une seule `SiteSection`, lui appliquer `section-alt` pour conserver la respiration visuelle.

### Shell racine

Wrapper commun à tous les sites :

```tsx
<div className="relative min-h-screen overflow-x-hidden bg-background">
  {/* BackgroundEffects : optionnel, surtout marketing / portfolio */}
  {/* Header / Sidebar selon l'architecture */}
  <main>{children}</main>
  {/* Footer : optionnel sur apps authentifiées */}
</div>
```

Le thème (`dark` sur `<html>`) est géré par `useTheme()` — ne pas le hardcoder dans le shell.

### BackgroundEffects (optionnel)

Fond décoratif — utile sur landing, portfolio, pages publiques. **À éviter** sur dashboards denses ou apps utilitaires.

```tsx
<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
  <div className="grid-bg absolute inset-0" />
  <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-rose-600/15 blur-3xl animate-pulse-glow" />
  <div className="absolute top-1/3 -right-20 size-80 rounded-full bg-amber-500/12 blur-3xl animate-pulse-glow [animation-delay:1s]" />
  <div className="absolute -bottom-20 left-1/3 size-72 rounded-full bg-violet-600/20 blur-3xl animate-pulse-glow [animation-delay:2s]" />
</div>
```

---

## 6. Architectures de site

Choisir **une** architecture selon le projet. Les composants universels (section 7) s'assemblent différemment.

### A. Site marketing (landing, one-page)

```
BackgroundEffects → Navbar fixed → main (sections scroll) → Footer
```

- Navbar pill flottante, ancres smooth scroll
- Sections empilées avec `SiteSection` + `id` pour la nav
- Hero plein écran (`min-h-svh`) en tête de page — **fond normal** (voir alternance section 5)
- Alternance de fond une `SiteSection` sur deux (`section-alt`), en commençant par la première section après le hero

### B. Site multi-pages (portfolio, vitrine, blog)

```
BackgroundEffects (optionnel) → Navbar → main (contenu par route) → Footer
```

- Même navbar et footer sur toutes les pages
- Chaque page : en-tête (`PageHeader`) + contenu dans `SiteContainer`
- Pages longues : `site-container-narrow` pour la lecture

### C. Application web / dashboard

```
Sidebar fixe → zone principale (header + contenu scrollable)
```

```tsx
<div className="flex min-h-svh">
  <aside className="glass hidden w-64 shrink-0 border-r border-border/60 lg:block">
    {/* Nav app : icône + label, item actif bg-primary/15 text-primary */}
  </aside>
  <div className="flex flex-1 flex-col">
    <header className="navbar-shell border-b border-border/60 px-6 py-3">
      {/* Titre page, actions, avatar */}
    </header>
    <main className="flex-1 overflow-y-auto p-6">
      <SiteContainer>{children}</SiteContainer>
    </main>
  </div>
</div>
```

- Pas de `BackgroundEffects` ni footer marketing
- Cartes `.glass` pour widgets, tableaux, formulaires
- Sidebar : tokens `--sidebar-*`

### D. Page auth (login, register, reset)

```
BackgroundEffects (optionnel) → contenu centré verticalement
```

```tsx
<div className="flex min-h-svh items-center justify-center p-4">
  <SiteContainer narrow>
    <Card className="glass w-full">
      <CardHeader>
        <CardTitle>Titre</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>{/* formulaire */}</CardContent>
    </Card>
  </SiteContainer>
</div>
```

### E. Page contenu / docs / article

```
Navbar ou Sidebar → colonne étroite centrée
```

```tsx
<SiteContainer narrow className="py-12">
  <article className="prose dark:prose-invert max-w-none">
    <h1>Titre</h1>
    <p className="text-muted-foreground">Contenu…</p>
  </article>
</SiteContainer>
```

---

## 7. Composants universels

Patterns réutilisables quel que soit le type de site.

### ThemeToggle

À placer dans la Navbar (sites publics) ou le header app (dashboard).

```tsx
// components/layout/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
```

### Navbar (pill flottante)

Pour sites publics (marketing, portfolio, docs publics).

```tsx
<header className="fixed inset-x-0 top-0 z-50">
  <SiteContainer>
    <nav className="navbar-shell mt-4 flex w-full items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
      {/* Logo : icône dans carré bg-primary/20 ring-1 ring-primary/40 */}
      {/* Liens : hidden md:flex gap-8 */}
      {/* ThemeToggle + CTA : Button className="glow-primary glow-primary-hover" */}
      {/* Mobile : menu collapsible max-h-0/64 opacity-0/100 transition-all */}
    </nav>
  </SiteContainer>
</header>
```

### Footer (minimal)

```tsx
<footer className="border-t border-border/60 py-6 sm:py-8">
  <SiteContainer>
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">© 2026 Projet</p>
      <p className="text-sm text-muted-foreground">Made by Auteur ❤️</p>
    </div>
  </SiteContainer>
</footer>
```

### PageHeader (toute page intérieure)

```tsx
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Titre de page</h1>
    <p className="mt-2 text-muted-foreground">Description ou breadcrumb</p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline">Action secondaire</Button>
    <Button className="glow-primary glow-primary-hover">Action primaire</Button>
  </div>
</div>
```

### Boutons et CTA

| Type | Pattern |
|------|---------|
| Primaire | `Button className="glow-primary glow-primary-hover"` |
| Secondaire chaud | `Button variant="outline" className="border-accent/40 hover:bg-accent/10"` |
| Secondaire | `Button variant="outline"` |
| Ghost / nav | `Button variant="ghost" size="sm"` |
| Lien | `Button asChild` + `<a href="…">` |
| Destructif | `Button variant="destructive"` |
| Mobile full-width | `className="w-full sm:w-auto"` |

### Carte glass (base)

Surface standard pour tout contenu encapsulé.

```tsx
<Card className="glass">
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{children}</CardContent>
</Card>
```

### Carte interactive (hover)

Pour grilles de features, projets, produits, widgets cliquables.

```tsx
<Card className={cn(
  "glass group transition-all duration-300",
  "hover:-translate-y-1 hover:border-primary/50",
  "hover:shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_15%,transparent)]",
)}>
```

### Conteneur d'icône

```tsx
<div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
  <Icon className="size-5 text-primary" />
</div>
```

### Élément mis en avant (featured)

Pour plan tarifaire, offre, item sélectionné, card active. Utiliser l'or pour le plan premium :

```tsx
className={cn(
  "glass",
  isFeatured && "scale-[1.02] border-(--gold)/50 glow-gold",
)}
```

### Liste avec icônes (check, statut)

```tsx
<li className="flex items-start gap-2.5 text-sm">
  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
  <span className="text-muted-foreground">{item}</span>
</li>
```

### Accordion (FAQ obligatoire) / settings

**FAQ** (landing ou page dédiée) : toujours un **Accordion** shadcn — jamais des cartes statiques empilées. **Settings** et panneaux repliables : même pattern.

```tsx
<Accordion type="single" collapsible className="space-y-4">
  <AccordionItem
    value="item-1"
    className="glass rounded-xl border px-4 data-[state=open]:border-primary/40"
  >
    <AccordionTrigger className="text-left font-heading hover:no-underline">
      Question
    </AccordionTrigger>
    <AccordionContent className="text-muted-foreground leading-relaxed">
      Réponse…
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Formulaire dans une carte

```tsx
<Card className="glass">
  <CardContent className="space-y-4 pt-6">
    {/* inputs shadcn : border-input bg-background/50 */}
    <Button type="submit" className="w-full glow-primary glow-primary-hover">Envoyer</Button>
  </CardContent>
</Card>
```

### Empty state

```tsx
<div className="glass flex flex-col items-center justify-center rounded-xl py-16 text-center">
  <Icon className="size-10 text-muted-foreground" />
  <p className="mt-4 font-medium">Aucun élément</p>
  <p className="mt-1 text-sm text-muted-foreground">Description</p>
  <Button className="mt-6 glow-primary" size="sm">Action</Button>
</div>
```

### Cartes stats (widgets live)

Pour sections **Stats** du portfolio, dashboards de métriques ou cartes de données externes (Discord, Spotify, jeux…). Réutiliser les primitives `components/stats/StatCardUi.tsx`.

**Shell carte** — combiner `glass` + `stat-card` :

```tsx
export const statCardClass = 'glass stat-card'

<Card className={statCardClass}>{/* … */}</Card>
```

**Répartition des accents (triade)** :

| Élément | Couleur | Pattern |
|---------|---------|---------|
| Bordure / glow carte | Violet | `.stat-card`, `border-primary/35` |
| Titres de section | Or → violet | `.text-gradient-subtle` |
| Valeurs featured / niveau / #1 | Or | `text-(--gold)`, `tone="gold"`, `.glow-gold` |
| Highlights chauds / Spotify | Vermillon | `tone="accent"`, `text-accent`, `bg-accent/10` |
| Stats structure / LP / listes | Violet | `tone="primary"`, `text-primary`, `bg-primary/8` |
| Tags / labels discrets | Vermillon | `StatTag` — bordure `accent/35`, **pas** de Badge shadcn |
| PDP (avatar circulaire) | Triade | `.avatar-triad` + `.avatar-triad-inner` — hero : ajouter `.hero-avatar` |

**Avatar Discord** (chevauche la bannière) :

```tsx
<div className="avatar-triad size-16 md:size-20">
  <div className="avatar-triad-inner">
    <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
  </div>
</div>
```

**Composants primitives** :

| Composant | Rôle |
|-----------|------|
| `StatCardHeader` | Icône + titre ; prop `accent`: `primary` \| `gold` \| `accent` |
| `StatSection` | Titre section en dégradé + contenu |
| `StatItem` | Tuile label + valeur ; props `highlight`, `tone` |
| `StatGrid` | Grille 2–4 colonnes de tuiles |
| `StatPanel` | Panneau encapsulé (ex. morceau Spotify en cours) |
| `StatRankBanner` | Rang mis en avant : titre `.text-gradient`, sous-stats LP / W-L / WR |
| `StatChampionRow` | Ligne classement : rang, nom, maîtrise / points |
| `StatDivider` | `<hr className="stat-divider" />` — séparateur triade |
| `StatTag` | Label discret (badges Discord, etc.) |

**Exemple header avec stat inline** (niveau à droite, sans mini-carte) :

```tsx
<CardHeader>
  <div className="flex items-start justify-between gap-4">
    <StatCardHeader accent="gold" icon={…} title="League of Legends" subtitle={riotId} />
    <div className="shrink-0 text-right">
      <p className="text-xs text-muted-foreground">Level</p>
      <p className="text-2xl font-bold font-heading text-(--gold)">{level}</p>
    </div>
  </div>
</CardHeader>
```

**Tuiles** — fond teinté via `color-mix`, jamais de couleur en dur :

```tsx
<StatItem label="Mastery levels" value={572} highlight tone="gold" />
<StatItem label="Mastery points" value="3 094 956" tone="accent" />
```

**Séparateurs** — entre blocs logiques (header → contenu, sections internes) :

```tsx
<StatDivider />
```

> **Pas de Badge shadcn** pour les stats — utiliser `StatTag` ou texte sémantique (`text-primary`, `text-accent`).

### Pas de Badge

**Ne pas utiliser** le composant shadcn `Badge` — aucun cas d'usage (ni statut, ni plan, ni « Nouveau », ni compteur).

Alternatives :

| Besoin | Pattern |
|--------|---------|
| Statut (actif, erreur…) | `text-sm` + couleur sémantique (`text-primary`, `text-accent`, `text-destructive`) |
| Plan / offre featured | Bordure or + `glow-gold` sur la carte (voir Élément mis en avant) |
| Label discret | `text-xs text-muted-foreground` |
| Action secondaire | `Button variant="outline" size="sm"` |

### Séparateur

```tsx
<Separator className="bg-border/60" />
```

---

## 8. Patterns spécifiques landing

Section optionnelle — à utiliser **uniquement** pour sites marketing one-page. Voir architecture A (section 6).

### Hero plein écran

```tsx
<section className="relative flex min-h-svh items-center">
  <SiteContainer className="grid w-full items-center gap-12 py-24 lg:grid-cols-2 lg:gap-16">
    <div className="text-center lg:text-left">
      <h1><span className="text-gradient">Titre</span></h1>
      <p className="mt-6 max-w-xl text-muted-foreground">Sous-titre</p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
        <Button size="lg" className="w-full sm:w-auto glow-primary glow-primary-hover">CTA</Button>
        <Button variant="outline" size="lg" className="w-full sm:w-auto">Secondaire</Button>
      </div>
    </div>
    <div className="animate-float mx-auto w-full max-w-md lg:max-w-none">
      <div className="avatar-triad hero-avatar mx-auto aspect-square w-full max-w-xs lg:max-w-md">
        <div className="avatar-triad-inner">
          <img src="…" alt="…" className="size-full object-cover" />
        </div>
      </div>
    </div>
  </SiteContainer>
</section>
```

### En-tête de section marketing

```tsx
<div className="text-center">
  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Titre</h2>
  <p className="mt-4 text-muted-foreground">Sous-titre</p>
</div>
{/* Contenu : mt-14 */}
```

### Grilles landing

| Section | Grille |
|---------|--------|
| Features / services | `mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3` |
| Pricing / offres | `mt-14 grid gap-6 lg:grid-cols-3` |
| Témoignages | `mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3` |
| FAQ | `SiteContainer narrow` + Accordion (section 7) — fond `section-alt` si alternance active |

### FAQ landing

```tsx
<SiteSection id="faq" className="section-alt">
  <SiteContainer narrow>
    <div className="text-center">
      <h2 className="text-2xl font-bold font-heading tracking-tight sm:text-3xl">Questions fréquentes</h2>
    </div>
    <Accordion type="single" collapsible className="mt-14 space-y-4">
      {/* AccordionItem glass — voir section 7 */}
    </Accordion>
  </SiteContainer>
</SiteSection>
```

### Mockup glass (visuel hero)

```tsx
<div className="glass overflow-hidden rounded-2xl shadow-2xl ring-1 ring-primary/20">
  <div className="border-b border-border/60 bg-black/30 px-4 py-3">
    {/* Barre titre + traffic lights */}
  </div>
  <div className="p-4 sm:p-5">{/* Contenu simulé */}</div>
</div>
```

---

## 9. Responsive et accessibilité

Règles communes à **tous** les types de site :

- **Mobile-first** : empiler avant d'élargir (`flex-col sm:flex-row`, grilles 1 → 2 → 3 cols)
- **CTAs** : `w-full sm:w-auto` sur mobile
- **Touch targets** : minimum `h-8` (shadcn `size="default"`) pour les actions
- **Menu mobile** : `max-h-0 opacity-0` fermé → `max-h-64 opacity-100` ouvert
- **Sidebar app** : `hidden lg:block` + drawer mobile si nécessaire
- **Ancres** : `scroll-behavior: smooth` sur `html`
- **Aria** : `aria-label` sur toggles (menu, langue, thème)
- **Focus** : rings via token `--ring`, ne jamais supprimer `outline-none` sans alternative
- **Thème** : respecter `prefers-color-scheme` au premier chargement, puis mémoriser le choix utilisateur (`localStorage`)
- **ThemeToggle** : `aria-label` explicite (clair / sombre), icône Sun / Moon
- **Contraste** : vérifier les deux modes — texte secondaire via `text-muted-foreground`, pas d'opacité arbitraire sur le body

---

## 10. Conventions de code

### Arborescence recommandée

```
src/
├── index.css                 # tokens + utilities + @theme (obligatoire)
├── lib/utils.ts              # cn()
├── hooks/useTheme.ts         # thème clair / sombre
├── components/
│   ├── layout/               # SiteContainer, ThemeToggle, PageHeader…
│   ├── ui/                   # shadcn (button, card, input, dialog…)
│   └── stats/                # StatCardUi + cartes métier (Discord, LoL…)
├── pages/ ou routes/         # Pages / vues par route
└── i18n/                     # optionnel : JSON + useTranslation()
```

Nommer les dossiers par **rôle** (`layout`, `ui`, `dashboard`, `auth`…), pas par type de site.

### Règles

- Exports nommés : `export function MyComponent()`
- Classes : toujours via `cn()`
- Textes UI : i18n si multilingue (français par défaut, alphabet latin) — pas de contenu japonais
- Boutons-liens : `Button asChild` + `<a>` ou `<Link>`
- Pas de glow / gradient sans raison fonctionnelle — **pas de Badge** (voir section 7)
- shadcn : style `radix-nova`, ajouter les composants au fil des besoins (`npx shadcn add …`)

---

## 11. Checklist nouveau projet

### Base (tout projet)

- [ ] Initialiser React + Vite + TypeScript + Tailwind v4
- [ ] Configurer shadcn/ui (style `radix-nova`, alias `@/`)
- [ ] Copier tokens + utilities dans `src/index.css` (clair **et** sombre)
- [ ] Ajouter `cn()` dans `src/lib/utils.ts`
- [ ] Installer Geist Variable + Shippori Mincho (latin + latin-ext, poids 500–700) + `tw-animate-css`
- [ ] Configurer `@theme inline` : `--font-sans` (Geist), `--font-heading` (Shippori Mincho)
- [ ] Créer `useTheme()` + `ThemeToggle`
- [ ] Créer `SiteContainer` (+ `SiteSection` si besoin)
- [ ] Choisir l'architecture (section 6) et assembler le shell
- [ ] Adapter `--primary`, `--accent`, `--gold` à la couleur de marque

### Selon le type de site

**Marketing / landing :**
- [ ] `BackgroundEffects`, Navbar pill, Footer minimal (`text-sm`)
- [ ] Hero + sections (patterns section 8)
- [ ] Alternance de fond une `SiteSection` sur deux (`section-alt`, hero et footer en fond normal)
- [ ] FAQ en Accordion — pas de cartes statiques
- [ ] Cartes stats : `stat-card` + primitives `StatCardUi` si section live (section 7)
- [ ] Aucun composant `Badge`

**App / dashboard :**
- [ ] Sidebar + header app, pas de footer marketing
- [ ] `PageHeader` sur chaque vue, cartes glass pour le contenu
- [ ] Aucun composant `Badge` — statuts en texte sémantique

**Auth :**
- [ ] Layout centré, `site-container-narrow`, carte glass

**Docs / blog :**
- [ ] `site-container-narrow`, typographie body confortable

### Avant livraison

- [ ] Vérifier responsive mobile
- [ ] Vérifier les deux thèmes (clair + sombre) sur toutes les pages clés
- [ ] Vérifier focus clavier et aria-labels
- [ ] Aucun `Badge` sur le site
- [ ] Pas d'éléments décoratifs inutiles