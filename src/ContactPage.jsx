import { useRef, useState } from "react";

const projectTypes = [
  "Hiring / Job opportunity",
  "Website or landing page",
  "Business system or dashboard",
  "Mobile or desktop app",
  "UI/UX or brand design",
  "Automation or technical support",
  "Something else",
];

const budgetRanges = [
  "Still exploring",
  "Below ₱25,000",
  "₱25,000 – ₱75,000",
  "₱75,000 – ₱150,000",
  "₱150,000+",
];

function getApiErrorMessage(payload, fallback) {
  if (payload?.errors) {
    const firstError = Object.values(payload.errors).flat().find(Boolean);
    if (firstError) return firstError;
  }

  return payload?.detail || payload?.message || payload?.title || fallback;
}

function ContactPage({ Icon, profile, apiBaseUrl }) {
  const normalizedApiBaseUrl = String(apiBaseUrl || "").trim().replace(/\/$/, "");
  const defaultEndpoint = normalizedApiBaseUrl ? `${normalizedApiBaseUrl}/contact-inquiries` : "";
  const endpoint = (import.meta.env.VITE_CONTACT_FORM_ENDPOINT || defaultEndpoint).trim();
  const phoneDigits = profile.phone.replace(/[^+\d]/g, "");
  const phoneHref = `tel:${phoneDigits.startsWith("0") ? "+63" + phoneDigits.slice(1) : phoneDigits}`;
  const [inquiryType, setInquiryType] = useState(() => new URLSearchParams(window.location.search).get("type") === "hiring" ? "Hiring / Job opportunity" : "");
  const isHiring = inquiryType === "Hiring / Job opportunity";
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const submittingRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("website")) {
      setStatus({ kind: "success", message: "Thanks - your message has been received." });
      form.reset();
      setInquiryType("");
      return;
    }

    if (!endpoint) {
      setStatus({
        kind: "setup",
        message: `Online delivery is being connected. For now, email me directly at ${profile.email}.`,
      });
      return;
    }

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      projectType: String(formData.get("projectType") || "").trim(),
      budget: String(formData.get("budget") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      website: "",
      sourceUrl: window.location.href,
    };

    submittingRef.current = true;
    setStatus({ kind: "submitting", message: "Sending your message…" });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json().catch(() => null);
      if (!response.ok) {
        const fallback = response.status === 429
          ? "Too many attempts were sent. Please wait a minute and try again."
          : "Your inquiry could not be saved. Please review the form and try again.";
        throw new Error(getApiErrorMessage(responsePayload, fallback));
      }

      form.reset();
      setInquiryType("");
      setStatus({
        kind: "success",
        message: responsePayload?.message || "Message sent. I’ll reply through email as soon as I can.",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error && error.message
          ? error.message
          : `The form could not connect. Please retry or email ${profile.email} directly.`,
      });
    } finally {
      submittingRef.current = false;
    }
  };

  const isSubmitting = status.kind === "submitting";

  return (
    <section className="contact-page content-width" aria-labelledby="contact-page-title">
      <header className="contact-page-header">
        <a className="contact-page-back" href="/#profile"><span aria-hidden="true">←</span> Back home</a>
        <div>
          <p className="eyebrow">CONTACT / OPPORTUNITIES & PROJECTS</p>
          <h1 id="contact-page-title">Let’s talk<span>.</span></h1>
          <p className="contact-page-lead">Hiring a Full-stack / .NET Developer? Share the role and your team. Project inquiries are welcome too.</p>
        </div>
      </header>

      <div className="contact-page-layout">
        <aside className="contact-process" aria-label="What happens next">
          <p className="contact-kicker">GET IN TOUCH</p>
          <ol>
            <li><span>01</span><div><strong>Tell me about the opportunity</strong><p>Include the role, company, and work arrangement, or the project you have in mind.</p></div></li>
            <li><span>02</span><div><strong>Share useful context</strong><p>A job description or a short project outline helps me give you a relevant reply.</p></div></li>
            <li><span>03</span><div><strong>Personal reply</strong><p>I’ll respond by email with the clearest next step.</p></div></li>
          </ol>
          <div className="contact-direct">
            <span>Prefer to email directly?</span>
            <a href={`mailto:${profile.email}?subject=Full-stack%20Developer%20opportunity`}>{profile.email} <Icon name="arrow" size={13} /></a>
            <a href={phoneHref}><Icon name="phone" size={13} /> {profile.phone}</a>
          </div>
        </aside>

        <form className="project-form" onSubmit={handleSubmit} noValidate={false} aria-busy={isSubmitting}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="contact-name">Name <span aria-hidden="true">*</span></label>
              <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength="100" placeholder="Your name" />
            </div>
            <div className="form-field">
              <label htmlFor="contact-email">Email <span aria-hidden="true">*</span></label>
              <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength="160" placeholder="you@company.com" />
            </div>
            <div className="form-field">
              <label htmlFor="contact-company">Company <small>optional</small></label>
              <input id="contact-company" name="company" type="text" autoComplete="organization" maxLength="120" placeholder="Company or team" />
            </div>
            <div className="form-field">
              <label htmlFor="contact-type">Inquiry type <span aria-hidden="true">*</span></label>
              <select id="contact-type" name="projectType" required value={inquiryType} onChange={(event) => setInquiryType(event.target.value)}>
                <option value="" disabled>Select an inquiry type</option>
                {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            {!isHiring && <div className="form-field form-field-wide">
              <label htmlFor="contact-budget">Budget range <small>optional</small></label>
              <select id="contact-budget" name="budget" defaultValue="">
                <option value="">Prefer not to say yet</option>
                {budgetRanges.map((budget) => <option key={budget} value={budget}>{budget}</option>)}
              </select>
            </div>}
            <div className="form-field form-field-wide">
              <label htmlFor="contact-message">{isHiring ? "Role details" : "Message"} <span aria-hidden="true">*</span></label>
              <textarea id="contact-message" name="message" required minLength="20" maxLength="2000" rows="7" placeholder={isHiring ? "Role title, job description or link, location / remote arrangement, and next steps." : "What are you trying to build, improve, or fix?"} aria-describedby="message-help" />
              <small id="message-help">{isHiring ? "Include the role, company, work arrangement, and a job description if available." : "Include the goal, timeline, and any important constraints."}</small>
            </div>
          </div>

          <div className="form-honeypot" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" type="text" tabIndex="-1" autoComplete="off" />
          </div>

          <div className="form-submit-row">
            <p className={"contact-form-status is-" + status.kind} role={status.kind === "error" ? "alert" : "status"} aria-live="polite">
              {status.message || "Your details are only used to reply to this inquiry."}
            </p>
            <button type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "SENDING…" : "SEND INQUIRY"}</span>
              <Icon name={status.kind === "success" ? "check" : "arrow"} size={18} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ContactPage;
