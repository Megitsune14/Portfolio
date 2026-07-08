import type { LocalizedString } from '@/lib/localized'

export interface Project {
  id: string
  title: LocalizedString
  description: LocalizedString
  techStack: LocalizedString
  url?: string
  links?: { label: LocalizedString; url: string }[]
  imageUrl?: string
}

export const projects: Project[] = []
