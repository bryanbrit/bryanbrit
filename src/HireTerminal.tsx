import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Terminal, X } from "lucide-react";

const commands: Record<string, { label: string; href: string }> = {
  about: { label: "About Bryan", href: "#about" },
  projects: { label: "Project case studies", href: "#projects" },
  skills: { label: "Project technologies", href: "#skills" },
  contact: { label: "Contact", href: "#contact" },
};

export default function HireTerminal({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Type help to see available commands.");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    inputRef.current?.focus();
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), input, [tabindex]:not([tabindex='-1'])");
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim().toLowerCase();
    setInput("");
    if (command === "help") {
      setOutput("Commands: about · projects · skills · contact");
      return;
    }
    const destination = commands[command];
    if (destination) {
      setOutput(`Opening ${destination.label}…`);
      window.location.hash = destination.href.slice(1);
      onClose();
      return;
    }
    setOutput(command ? `Command not found: ${command}. Type help.` : "Type help to see available commands.");
  }

  return (
    <div className="terminal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="hire-terminal" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="terminal-title">
        <header><span id="terminal-title"><Terminal size={15} /> /hire-me</span><button type="button" onClick={onClose} aria-label="Close terminal"><X size={18} /></button></header>
        <div className="terminal-output" aria-live="polite">
          <p><span>$</span> welcome, visitor</p>
          <p>{output}</p>
        </div>
        <form onSubmit={runCommand}>
          <label htmlFor="terminal-command"><span aria-hidden="true">$</span><span className="sr-only">Terminal command</span></label>
          <input id="terminal-command" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} autoComplete="off" spellCheck={false} />
          <button type="submit" aria-label="Run command"><ArrowUpRight size={17} /></button>
        </form>
      </section>
    </div>
  );
}
