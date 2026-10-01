const stackGroups = [
  { number: "01", title: "WordPress websites", description: "I build WordPress websites, update existing pages, and fix website issues.", tools: ["WordPress"] },
  { number: "02", title: "Backend & business logic", description: "ASP.NET Core services, public APIs, authentication, permissions, and validation in my IMS and portfolio CMS.", tools: ["C#", "ASP.NET Core", "Entity Framework Core", "REST APIs", "ASP.NET Core Identity"], href: "/projects/portfolio-cms", evidence: "Explore the portfolio CMS" },
  { number: "03", title: "Data & persistence", description: "Relational data and migrations for business records and content. My IMS uses MySQL; the portfolio CMS uses SQLite.", tools: ["MySQL", "SQL", "SQLite", "EF Core migrations"], href: "/projects/megalight-ims", evidence: "Explore the inventory system" },
  { number: "04", title: "Web interfaces", description: "React and Vite power this portfolio. My Nexpak Packaging project uses Next.js, TypeScript, and Tailwind CSS.", tools: ["React", "Vite", "Next.js", "TypeScript", "JavaScript", "HTML / CSS", "Tailwind CSS"], href: "/projects/nexpak-packaging", evidence: "Explore Nexpak Packaging" },
  { number: "05", title: "Testing & delivery", description: "Git-based development, focused automated checks, and deployments to IIS and Vercel. IMS tests cover receipt edit validation and record preservation.", tools: ["Git", "GitHub", "xUnit", "IIS", "Vercel"], href: "/projects/megalight-ims", evidence: "Read the implementation details" },
];

function TechStackPage({ Icon }) {


  return (
    <section className="stack-page content-width" aria-labelledby="stack-page-title">
      <header className="stack-page-header">
        <a className="stack-page-back" href="/#profile"><span aria-hidden="true">←</span> Back home</a>
        <div className="stack-page-heading">
          <p className="eyebrow">04 / CAPABILITIES</p>
          <h1 id="stack-page-title">Tech stack<span>.</span></h1>
          <p className="stack-page-lead">The technologies I use, with project examples showing where they fit.</p>

        </div>
      </header>

      <div className="stack-groups">
        {stackGroups.map((group, index) => (
          <section className="stack-group" key={group.title} style={{ "--stack-delay": String(index * 55) + "ms" }}>
            <div className="stack-group-meta">
              <span>{group.number}</span>
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>{group.href && <a className="stack-evidence-link" href={group.href}>{group.evidence} <Icon name="arrow" size={13} /></a>}
              </div>
            </div>
            <ul className="stack-chip-list" aria-label={group.title + " technologies"}>
              {group.tools.map((tool) => <li key={tool}>{tool}</li>)}
            </ul>
          </section>
        ))}
      </div>

      <div className="stack-page-cta">
        <div>
          <p className="eyebrow">THE TOOL FOLLOWS THE PROBLEM</p>
          <p>I choose the smallest reliable stack that can do the job well and stay maintainable.</p>
        </div>
        <a href="/contact?type=hiring">Discuss an opportunity <Icon name="arrow" size={16} /></a>
      </div>
    </section>
  );
}

export default TechStackPage;
