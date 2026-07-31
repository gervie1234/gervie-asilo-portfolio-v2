import { useState } from "react";

const projectTypes = [
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

function ContactPage({ Icon }) {
  const endpoint = (import.meta.env.VITE_CONTACT_FORM_ENDPOINT || "").trim();
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("website")) {
      setStatus({ kind: "success", message: "Thanks — your message has been received." });
      form.reset();
      return;
    }

    if (!endpoint) {
      setStatus({
        kind: "setup",
        message: "Online delivery is being connected. For now, email me directly at gervieasilo@gmail.com.",
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
      source: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    setStatus({ kind: "submitting", message: "Sending your project details…" });

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      form.reset();
      setStatus({ kind: "success", message: "Message sent. I’ll reply through email as soon as I can." });
    } catch {
      setStatus({
        kind: "error",
        message: "The form could not connect. Please retry or email gervieasilo@gmail.com directly.",
      });
    }
  };

  const isSubmitting = status.kind === "submitting";

  return (
    <section className="contact-page content-width" aria-labelledby="contact-page-title">
      <header className="contact-page-header">
        <a className="contact-page-back" href="/#profile"><span aria-hidden="true">←</span> Back home</a>
        <div>
          <p className="eyebrow">06 / START A PROJECT</p>
          <h1 id="contact-page-title">Start a project<span>.</span></h1>
          <p className="contact-page-lead">Share the goal, timeline, and constraints. I’ll reply with the clearest next step.</p>
        </div>
      </header>

      <div className="contact-page-layout">
        <aside className="contact-process" aria-label="What happens next">
          <p className="contact-kicker">WHAT HAPPENS NEXT</p>
          <ol>
            <li><span>01</span><div><strong>Inquiry saved</strong><p>Your details are recorded in my private project tracker.</p></div></li>
            <li><span>02</span><div><strong>Email notification</strong><p>I receive the full brief at gervieasilo@gmail.com.</p></div></li>
            <li><span>03</span><div><strong>Personal reply</strong><p>I’ll respond by email with the clearest next step.</p></div></li>
          </ol>
          <div className="contact-direct">
            <span>Prefer regular email?</span>
            <a href="mailto:gervieasilo@gmail.com">gervieasilo@gmail.com <Icon name="arrow" size={13} /></a>
          </div>
        </aside>

        <form className="project-form" onSubmit={handleSubmit} noValidate={false}>
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
              <label htmlFor="contact-type">Project type <span aria-hidden="true">*</span></label>
              <select id="contact-type" name="projectType" required defaultValue="">
                <option value="" disabled>Select a project type</option>
                {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-field form-field-wide">
              <label htmlFor="contact-budget">Budget range <small>optional</small></label>
              <select id="contact-budget" name="budget" defaultValue="">
                <option value="">Prefer not to say yet</option>
                {budgetRanges.map((budget) => <option key={budget} value={budget}>{budget}</option>)}
              </select>
            </div>
            <div className="form-field form-field-wide">
              <label htmlFor="contact-message">Project brief <span aria-hidden="true">*</span></label>
              <textarea id="contact-message" name="message" required minLength="20" maxLength="2000" rows="7" placeholder="What are you trying to build, improve, or fix?" aria-describedby="message-help" />
              <small id="message-help">Include the goal, timeline, and any important constraints.</small>
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
