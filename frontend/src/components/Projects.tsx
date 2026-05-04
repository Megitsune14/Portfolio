import { projects } from '../data/constants';

const Projects = () => {
  return (
    <section id="projects" className="w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-14">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="font-jp text-4xl leading-[1.2] pb-1 font-bold gradient-text sm:text-5xl">My Projects</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--accent))]" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project, index) => (
            <div
              key={index}
              className="surface-card flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[color-mix(in_oklch,var(--secondary)_76%,transparent)]">
                <div className="absolute inset-0 bg-[linear-gradient(140deg,color-mix(in_oklch,var(--primary)_12%,transparent),transparent,color-mix(in_oklch,var(--accent)_16%,transparent))]" />
                <i className={`${project.icon} relative text-5xl text-(--primary)`} />
              </div>

              <div className="flex grow flex-col p-6 lg:p-8">
                <h3 className="mb-4 text-xl font-semibold text-foreground lg:text-2xl">{project.title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-muted lg:text-base">{project.description}</p>

                {project.techStack && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-lg font-semibold text-foreground">Tech Stack</h4>
                    {project.techStack.backend && (
                      <div className="mb-3">
                        <h5 className="mb-2 text-sm font-medium text-(--primary)">
                          {project.title === 'Jinx' ? 'Backend (Discord Bot)' : 'Backend'}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.backend.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="rounded-full border border-[color-mix(in_oklch,var(--primary)_35%,transparent)] bg-[color-mix(in_oklch,var(--primary)_20%,transparent)] px-3 py-1 text-xs font-medium text-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.techStack.frontend && (
                      <div>
                        <h5 className="mb-2 text-sm font-medium text-(--chart-5)">
                          {project.title === 'Jinx' ? 'Frontend (Website)' : 'Frontend'}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.frontend.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="rounded-full border border-[color-mix(in_oklch,var(--chart-5)_36%,transparent)] bg-[color-mix(in_oklch,var(--chart-5)_20%,transparent)] px-3 py-1 text-xs font-medium text-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="rounded-full border border-[color-mix(in_oklch,var(--accent)_35%,transparent)] bg-[color-mix(in_oklch,var(--accent)_20%,transparent)] px-3 py-1 text-sm font-medium text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex flex-wrap justify-center gap-3 pt-6 lg:gap-4">
                  {project.links.repository && (
                    <a
                      href={project.links.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--chart-3)_38%,transparent)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--chart-3)_30%,transparent),color-mix(in_oklch,var(--primary)_34%,transparent))] px-4 py-2 text-xs font-semibold text-foreground transition hover:-translate-y-0.5 lg:px-6 lg:py-3 lg:text-sm"
                    >
                      <i className="fab fa-github" />
                      Repository
                    </a>
                  )}

                  {project.links.app && (
                    <a
                      href={project.links.app}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--primary)_45%,transparent)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_34%,transparent),color-mix(in_oklch,var(--accent)_26%,transparent))] px-4 py-2 text-xs font-semibold text-foreground transition hover:-translate-y-0.5 lg:px-6 lg:py-3 lg:text-sm"
                    >
                      <i className="fas fa-external-link-alt" />
                      Use App
                    </a>
                  )}

                  {project.links.support && (
                    <a
                      href={project.links.support}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--chart-4)_42%,transparent)] bg-[color-mix(in_oklch,var(--chart-4)_22%,transparent)] px-4 py-2 text-xs font-semibold text-foreground transition hover:-translate-y-0.5 lg:px-6 lg:py-3 lg:text-sm"
                    >
                      <i className="fab fa-discord" />
                      Support
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
