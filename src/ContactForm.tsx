import { useState, type FormEvent } from "react";
import { ArrowUpRight, Mail, Send } from "lucide-react";

type SubmissionState = "idle" | "sending" | "success" | "error";

const rawEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT?.trim();
const endpoint = (() => {
  if (!rawEndpoint) return null;
  try {
    const url = new URL(rawEndpoint);
    return url.protocol === "https:" &&
      url.hostname === "formspree.io" &&
      /^\/f\/[A-Za-z0-9]+$/.test(url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
})();

export default function ContactForm() {
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint) {
      setState("error");
      setMessage(rawEndpoint
        ? "The configured form endpoint is invalid. Please use the direct email link below."
        : "The form is not connected yet. Please use the direct email link below.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get("_gotcha") ?? "").trim()) {
      setState("error");
      setMessage("Message not sent. Please leave the extra verification field blank and try again.");
      return;
    }

    setState("sending");
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`The form service returned ${response.status}. Please try the email link instead.`);
      }
      setState("success");
      setMessage("Thanks — your message has been sent.");
      form.reset();
    } catch (error: unknown) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The message could not be sent. Please use the email link instead.");
    }
  }

  return (
    <div className="contact-grid">
      <div className="contact-copy">
        <p className="eyebrow">05 / Contact</p>
        <h2 id="contact-heading">Have a problem worth building for?</h2>
        <p>I'm open to developer roles, internships and freelance work. If you're building for a practical need, I'd be glad to hear from you.</p>
        <a className="contact-email" href="mailto:ngangabryansoftware@gmail.com">
          <Mail size={17} /> ngangabryansoftware@gmail.com <ArrowUpRight size={15} />
        </a>
      </div>
      <form className="contact-form" onSubmit={handleSubmit} aria-describedby="form-status">
        <label>
          Your email
          <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </label>
        <label>
          Message
          <textarea name="message" rows={4} placeholder="A little context about what you have in mind…" required />
        </label>
        <label className="honeypot" aria-hidden="true">
          Leave this field empty
          <input name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <button className="button button-primary" type="submit" disabled={state === "sending"}>
          <Send size={15} /> {state === "sending" ? "Sending…" : "Send a message"}
        </button>
        <p id="form-status" className={`form-status form-${state}`} role={state === "error" ? "alert" : "status"} aria-live="polite">
          {message || (endpoint ? "The form is connected to Formspree." : "Form not configured yet — direct email is ready to use.")}
        </p>
      </form>
    </div>
  );
}
