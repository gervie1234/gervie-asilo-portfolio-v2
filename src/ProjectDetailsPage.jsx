import { useEffect, useMemo, useState } from "react";
import BackendPreloader from "./BackendPreloader";

function inlineMarkdown(text) {
  const parts = [];
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let cursor = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    if (match[2] && match[3]) {
      parts.push(<a href={match[3]} target="_blank" rel="noreferrer" key={`${match.index}-link`}>{match[2]}</a>);
    } else if (match[4]) {
      parts.push(<strong key={`${match.index}-strong`}>{match[4]}</strong>);
    } else if (match[5]) {
      parts.push(<em key={`${match.index}-em`}>{match[5]}</em>);
    }
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function MarkdownContent({ value }) {
  const blocks = useMemo(() => {
    const lines = (value || "").replace(/\r/g, "").split("\n");
    const output = [];
    let paragraph = [];
    let list = [];
    const flushParagraph = () => {
      if (!paragraph.length) return;
      const text = paragraph.join(" ").trim();
      if (text) output.push(<p key={`p-${output.length}`}>{inlineMarkdown(text)}</p>);
      paragraph = [];
    };
    const flushList = () => {
      if (!list.length) return;
      output.push(<ul key={`ul-${output.length}`}>{list.map((item, index) => <li key={`${item}-${index}`}>{inlineMarkdown(item)}</li>)}</ul>);
      list = [];
    };
    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph();
        flushList();
      } else if (/^#{1,3}\s+/.test(line)) {
        flushParagraph();
        flushList();
        const level = Math.min(3, line.match(/^#+/)[0].length);
        const text = line.replace(/^#{1,3}\s+/, "");
        const Heading = `h${level + 1}`;
        output.push(<Heading key={`h-${output.length}`}>{inlineMarkdown(text)}</Heading>);
      } else if (/^[-*]\s+/.test(line)) {
        flushParagraph();
        list.push(line.replace(/^[-*]\s+/, ""));
      } else {
        flushList();
        paragraph.push(line);
      }
    });
    flushParagraph();
    flushList();
    return output;
  }, [value]);
  return <div className="project-detail-markdown">{blocks}</div>;
}

function ProjectDetailsPage({ Icon, slug, apiBaseUrl, resolveImage, projects }) {
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setProject(null);
    fetch(`${apiBaseUrl}/projects/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) throw new Error("not-found");
        if (!response.ok) throw new Error(`CMS returned ${response.status}`);
        return response.json();
      })
      .then((content) => {
        setProject(content);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setStatus(error.message === "not-found" ? "not-found" : "error");
      });
    return () => controller.abort();
  }, [apiBaseUrl, slug]);

  useEffect(() => {
    if (!project) return undefined;
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content") || "";
    document.title = `${project.title} ? Gervie Asilo`;
    description?.setAttribute("content", project.summary || project.description || "");
    return () => {
      document.title = previousTitle;
      description?.setAttribute("content", previousDescription);
    };
  }, [project]);

  if (status !== "ready") {
    return (
      <>
        <BackendPreloader active={status === "loading"} message="Opening the project story" />
        <section className="project-detail-state content-width">
          <p className="eyebrow">PROJECT / {status === "loading" ? "LOADING" : "UNAVAILABLE"}</p>
          <h1>{status === "not-found" ? "Project not found." : status === "error" ? "Couldn?t load this project." : "Loading project?"}</h1>
          <p>{status === "loading" ? "Fetching the latest published case study." : "The project may be unpublished or the CMS is temporarily offline."}</p>
          {status !== "loading" && <a href="/projects">Back to projects <Icon name="arrow" size={15} /></a>}
        </section>
      </>
    );
  }

  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];
  const features = Array.isArray(project.features) ? project.features : [];
  const related = projects.filter((item) => item.slug !== slug).slice(0, 3);
  const hero = resolveImage(project.featuredImageUrl);

  return (
    <article className="project-detail-page content-width">
      <header className="project-detail-header">
        <a className="projects-page-back" href="/projects"><span aria-hidden="true">?</span> All projects</a>
        <div className="project-detail-title-row">
          <div>
            <p className="eyebrow">{project.number} / {project.category || "PROJECT"}</p>
            <h1>{project.title}<span>.</span></h1>
          </div>
          <p>{project.summary}</p>
        </div>
        <div className="project-detail-actions">
          {project.projectUrl && <a className="project-detail-primary" href={project.projectUrl} target="_blank" rel="noreferrer">Live demo <Icon name="arrow" size={14} /></a>}
          {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">GitHub <Icon name="arrow" size={14} /></a>}
        </div>
      </header>

      {hero && <figure className="project-detail-hero"><img src={hero} alt={project.featuredImageAlt || project.title} /></figure>}

      <div className="project-detail-body">
        <section className="project-detail-story">
          <p className="eyebrow">01 / OVERVIEW</p>
          <MarkdownContent value={project.description || project.summary} />
        </section>
        <aside className="project-detail-meta">
          <div><span>ROLE / CATEGORY</span><strong>{project.category || "Digital product"}</strong></div>
          {technologies.length > 0 && <div><span>TECH STACK</span><ul>{technologies.map((item) => <li key={item}>{item}</li>)}</ul></div>}
        </aside>
      </div>

      {features.length > 0 && (
        <section className="project-detail-features">
          <p className="eyebrow">02 / KEY FEATURES</p>
          <div>{features.map((feature, index) => <article key={feature}><span>{String(index + 1).padStart(2, "0")}</span><p>{feature}</p></article>)}</div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="project-detail-gallery">
          <p className="eyebrow">03 / GALLERY</p>
          <div>{gallery.map((image, index) => <figure key={`${image.imageUrl}-${index}`}><img src={resolveImage(image.imageUrl)} alt={image.altText || `${project.title} screenshot ${index + 1}`} loading="lazy" />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div>
        </section>
      )}

      {related.length > 0 && (
        <section className="project-detail-related">
          <p className="eyebrow">NEXT / MORE WORK</p>
          <div>{related.map((item) => <a href={`/projects/${item.slug}`} key={item.slug}><span>{item.label}</span><strong>{item.title}</strong><Icon name="arrow" size={15} /></a>)}</div>
        </section>
      )}
    </article>
  );
}

export default ProjectDetailsPage;
