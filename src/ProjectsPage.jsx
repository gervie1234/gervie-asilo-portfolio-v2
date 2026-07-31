function ProjectsPage({ Icon, ProjectVisual, projects }) {
  return (
    <section className="projects-page content-width" aria-labelledby="projects-page-title">
      <header className="projects-page-header">
        <a className="projects-page-back" href="/#projects"><span aria-hidden="true">←</span> Back home</a>
        <div className="projects-page-heading">
          <p className="eyebrow">02 / PROJECT ARCHIVE</p>
          <h1 id="projects-page-title">Projects<span>.</span></h1>
          <p className="projects-page-lead">Websites, business systems, and focused digital experiences built to solve practical problems.</p>
        </div>
      </header>

      <div className="projects-archive-meta" aria-label="Project archive summary">
        <span><strong>{String(projects.length).padStart(2, "0")}</strong> featured projects</span>
        <span>Websites · systems · digital products</span>
      </div>

      <div className="projects-archive-grid">
        {projects.map((project) => (
          <a
            className="archive-project-card"
            href={project.href}
            target="_blank"
            rel="noreferrer"
            key={project.title}
            aria-label={`Open ${project.title} project`}
          >
            <div className="archive-project-kicker">
              <span>{project.number}</span>
              <span>{project.label}</span>
            </div>
            <ProjectVisual kind={project.kind} accent={project.accent} />
            <div className="archive-project-copy">
              <div>
                <h2>{project.title}</h2>
                <p>{project.summary}</p>
              </div>
              <span className="round-arrow"><Icon name="arrow" size={15} /></span>
            </div>
          </a>
        ))}
      </div>

      <div className="projects-page-contact">
        <div>
          <p className="eyebrow">HAVE A PROJECT IN MIND?</p>
          <p>Let’s turn the next useful idea into something people can actually use.</p>
        </div>
        <a href="/contact">Start a project <Icon name="arrow" size={15} /></a>
      </div>
    </section>
  );
}

export default ProjectsPage;
