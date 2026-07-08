import { SiteContainer, SiteSection } from '@/components/layout/SiteContainer'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { useTranslation } from '@/i18n/I18nProvider'
import { getPortfolioProjects } from '@/lib/api'
import { pickLocalized } from '@/lib/localized'
import { PortfolioSectionTitle, ProjectCard, PortfolioEmptyState } from './PortfolioCardUi'

export function ProjectsSection() {
  const { t, locale } = useTranslation()
  const { data: projects, loading, error } = useFetch(getPortfolioProjects)
  const list = projects ?? []

  return (
    <SiteSection id="projects" className="section-alt">
      <SiteContainer>
        <PortfolioSectionTitle>{t('projects.title')}</PortfolioSectionTitle>

        {loading ? (
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        ) : error ? (
          <PortfolioEmptyState message={t('projects.unavailable')} />
        ) : list.length === 0 ? (
          <PortfolioEmptyState message={t('projects.empty')} />
        ) : (
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {list.map((project) => {
              const links =
                project.links && project.links.length > 0
                  ? project.links.map((link) => ({
                      label: pickLocalized(link.label, locale),
                      url: link.url,
                    }))
                  : project.url
                    ? [{ label: t('projects.linkFallback'), url: project.url }]
                    : []

              return (
                <ProjectCard
                  key={project.id}
                  title={pickLocalized(project.title, locale)}
                  description={pickLocalized(project.description, locale)}
                  techStack={pickLocalized(project.techStack, locale)}
                  imageUrl={project.imageUrl}
                  links={links}
                  linksLabel={t('projects.links')}
                />
              )
            })}
          </div>
        )}
      </SiteContainer>
    </SiteSection>
  )
}
