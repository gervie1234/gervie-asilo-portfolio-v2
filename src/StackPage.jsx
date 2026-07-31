const stackGroups = [
  {
    number: "01",
    title: "Frontend",
    description: "Interfaces that stay fast, clear, and responsive across screens.",
    tools: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Vite", "Responsive UI"],
  },
  {
    number: "02",
    title: "Backend & APIs",
    description: "Maintainable application logic, integrations, and business systems.",
    tools: ["C#", "ASP.NET Core", ".NET 9", "Entity Framework Core", "REST APIs", "JWT", "SignalR", "WPF"],
  },
  {
    number: "03",
    title: "Data & Storage",
    description: "Structured data foundations for reliable day-to-day operations.",
    tools: ["MySQL", "SQL", "Data Modeling", "Migrations", "JSON", "Excel Data Workflows"],
  },
  {
    number: "04",
    title: "Mobile & Delivery",
    description: "Practical deployment paths from local build to production use.",
    tools: ["Flutter", "Android", "Git", "GitHub", "IIS", "Azure", "VPS Hosting", "npm"],
  },
  {
    number: "05",
    title: "Design & AI Workflow",
    description: "Visual systems and assisted workflows that help ideas ship with polish.",
    tools: [
      "UI/UX",
      "Canva",
      "Adobe Creative Suite",
      "Brand Systems",
      "Google AI Studio",
      "OpenAI",
      "Claude",
      "DeepSeek",
      "OpenCode",
      "Codex",
      "Llama",
      "Large Language Models (LLMs)",
      "n8n Automation",
    ],
  },
];

function TechStackPage({ Icon }) {
  const toolCount = stackGroups.reduce((total, group) => total + group.tools.length, 0);

  return (
    <section className="stack-page content-width" aria-labelledby="stack-page-title">
      <header className="stack-page-header">
        <a className="stack-page-back" href="/#profile"><span aria-hidden="true">←</span> Back home</a>
        <div className="stack-page-heading">
          <p className="eyebrow">05 / CAPABILITIES</p>
          <h1 id="stack-page-title">Tech stack<span>.</span></h1>
          <p className="stack-page-lead">The tools, frameworks, and platforms I use to connect clean interfaces, dependable systems, and practical delivery.</p>
          <div className="stack-page-overview" aria-label="Stack overview">
            <span><strong>{String(stackGroups.length).padStart(2, "0")}</strong> groups</span>
            <span><strong>{toolCount}</strong> tools</span>
            <span><strong>01</strong> workflow</span>
          </div>
        </div>
      </header>

      <div className="stack-groups">
        {stackGroups.map((group, index) => (
          <section className="stack-group" key={group.title} style={{ "--stack-delay": String(index * 55) + "ms" }}>
            <div className="stack-group-meta">
              <span>{group.number}</span>
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
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
        <a href="/contact">Start a project <Icon name="arrow" size={16} /></a>
      </div>
    </section>
  );
}

export default TechStackPage;
