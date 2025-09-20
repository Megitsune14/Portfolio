import { projects } from '../data/constants';

const Projects = () => {
  return (
    <section id="projects" className="py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 gradient-text">My Projects</h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <div 
              key={index}
              className="glass-effect rounded-3xl overflow-hidden hover-lift hover:border-jinx transition-all duration-300 flex flex-col"
            >
              {/* Project Image Placeholder */}
              <div className="h-48 bg-darker flex items-center justify-center">
                <i className={`${project.icon} text-5xl text-jinx`}></i>
              </div>
              
              {/* Project Content */}
              <div className="p-6 lg:p-8 flex flex-col flex-grow">
                <h3 className="text-xl lg:text-2xl font-semibold text-light mb-4">{project.title}</h3>
                <p className="text-gray mb-6 leading-relaxed text-sm lg:text-base">{project.description}</p>
                
                {/* Tech Stack */}
                {project.techStack && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-light mb-3">Tech Stack</h4>
                     {project.techStack.backend && (
                       <div className="mb-3">
                         <h5 className="text-sm font-medium text-orange mb-2">
                           {project.title === 'Jinx' ? 'Backend (Discord Bot)' : 'Backend'}
                         </h5>
                         <div className="flex flex-wrap gap-2">
                           {project.techStack.backend.map((tech, techIndex) => (
                             <span 
                               key={techIndex}
                               className="bg-gradient-to-r from-rouge to-orange text-light px-3 py-1 rounded-full text-xs font-medium"
                             >
                               {tech}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                     {project.techStack.frontend && (
                       <div>
                         <h5 className="text-sm font-medium text-vert mb-2">
                           {project.title === 'Jinx' ? 'Frontend (Website)' : 'Frontend'}
                         </h5>
                         <div className="flex flex-wrap gap-2">
                           {project.techStack.frontend.map((tech, techIndex) => (
                             <span 
                               key={techIndex}
                               className="bg-gradient-to-r from-vert to-jinx text-light px-3 py-1 rounded-full text-xs font-medium"
                             >
                               {tech}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
                )}
                
                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="bg-gradient-secondary text-light px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 lg:gap-4 justify-center mt-auto pt-6">
                  {project.links.repository && (
                    <a 
                      href={project.links.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-jinx to-violet text-light px-4 lg:px-6 py-2 lg:py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-jinx/30 flex items-center gap-2 text-xs lg:text-sm"
                    >
                      <i className="fab fa-github"></i>
                      Repository
                    </a>
                  )}
                  
                  {project.links.app && (
                    <a 
                      href={project.links.app}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-orange to-rouge text-light px-4 lg:px-6 py-2 lg:py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange/30 flex items-center gap-2 text-xs lg:text-sm"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      Use App
                    </a>
                  )}
                  
                  {project.links.support && (
                    <a 
                      href={project.links.support}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-discord/20 text-discord border-2 border-discord/30 px-4 lg:px-6 py-2 lg:py-3 rounded-full font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-discord/30 hover:bg-discord/30 hover:border-discord flex items-center gap-2 text-xs lg:text-sm"
                    >
                      <i className="fab fa-discord"></i>
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
