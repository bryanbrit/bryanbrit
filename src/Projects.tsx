import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Code2, LockKeyhole, X } from "lucide-react";
import { ProjectScreenshot } from "./OptionalAsset";

type ProjectKey = "sokolink" | "drift";
type DeliveryStatus = "Pending" | "Confirmed" | "Paid";
type SubmissionStatus = "On time" | "Late" | "Not submitted";

const projectDetails: Record<ProjectKey, {
  title: string;
  number: string;
  category: string;
  technologies: string[];
  status: string[];
}> = {
  sokolink: {
    title: "SokoLink",
    number: "01",
    category: "Agriculture · Market access",
    technologies: ["Python", "Django", "Africa's Talking", "Daraja B2C"],
    status: ["MVP in development", "Sandbox tested"],
  },
  drift: {
    title: "Drift",
    number: "02",
    category: "Education · Privacy-first study tools",
    technologies: ["Node.js", "SQLite"],
    status: ["In development"],
  },
};

const ussdMessages = [
  "Welcome to SokoLink.\n1. Register\n2. Log a delivery",
  "Choose your crop:\n1. Tomatoes\n2. Maize\n3. Beans",
  "Enter quantity in kg:",
  "Recorded 120 kg of Tomatoes. Ref SL-000001. Hub staff will confirm the quantity, then you get paid by M-Pesa.",
];

function PreviewFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="preview-frame">
      <div className="preview-label"><span className="preview-live" /> {label} <span>Sample data</span></div>
      {children}
    </div>
  );
}

function UssdPhone() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % ussdMessages.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const showPrevious = () => setMessageIndex((index) => (index + ussdMessages.length - 1) % ussdMessages.length);
  const showNext = () => setMessageIndex((index) => (index + 1) % ussdMessages.length);

  return (
    <div className="ussd-phone">
      <div className="phone-speaker" />
      <div className="phone-screen">
        <div className="phone-status"><span>SIM</span><span>Network</span><span>100%</span></div>
        <div className="ussd-dialog">
          <span>USSD · INTERACTIVE PREVIEW</span>
          <p key={messageIndex}>{ussdMessages[messageIndex]}</p>
          <span className="ussd-response">Reply: {messageIndex === 0 ? "2" : messageIndex === 1 ? "1" : messageIndex === 2 ? "120" : "OK"}</span>
        </div>
      </div>
      <div className="phone-controls">
        <button type="button" onClick={showPrevious} aria-label="Previous USSD message"><ChevronLeft size={15} /></button>
        <span>{messageIndex + 1} / {ussdMessages.length}</span>
        <button type="button" onClick={showNext} aria-label="Next USSD message"><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function DeliveryTable() {
  const [statusStep, setStatusStep] = useState(0);
  const states: DeliveryStatus[] = ["Pending", "Confirmed", "Paid"];

  useEffect(() => {
    const timer = window.setInterval(() => setStatusStep((step) => (step + 1) % states.length), 1900);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="sample-table-wrap">
      <table className="sample-table">
        <caption>Interactive preview · delivery workflow · Sample data</caption>
        <thead><tr><th>Delivery</th><th>Crop</th><th>Qty.</th><th>Status</th></tr></thead>
        <tbody>
          <tr>
            <td>SL-000001</td>
            <td>Tomatoes</td>
            <td>120 kg</td>
            <td><span className={`text-badge badge-${states[statusStep].toLowerCase()}`}>{states[statusStep]}</span></td>
          </tr>
          <tr>
            <td>SL-000002</td>
            <td>Maize</td>
            <td>80 kg</td>
            <td><span className="text-badge badge-pending">Pending</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function WorkflowDiagram({ steps, label }: { steps: string[]; label: string }) {
  return (
    <div className="workflow-preview" aria-label={label}>
      <p className="preview-subtitle">FLOW / INTERACTIVE PREVIEW</p>
      <div className="workflow-nodes">
        {steps.map((step, index) => (
          <span className="workflow-node" key={step}>
            <i>{String(index + 1).padStart(2, "0")}</i>{step}
            {index < steps.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
          </span>
        ))}
      </div>
    </div>
  );
}

function DriftDashboard() {
  return (
    <div className="drift-dashboard">
      <div className="dashboard-top"><span>drift / student</span><span className="dashboard-avatar">S</span></div>
      <div className="dashboard-welcome"><span>STUDENT WORKSPACE · SAMPLE DATA</span><h4>Study space</h4></div>
      <div className="dashboard-task">
        <span className="task-icon"><Check size={14} /></span>
        <span><b>Assigned by teachers</b><small>Class tasks and submission status</small></span>
        <ArrowRight size={15} />
      </div>
      <div className="dashboard-task private-task">
        <span className="task-icon"><LockKeyhole size={14} /></span>
        <span><b>My personal tasks</b><small>Private to the student</small></span>
        <span className="private-tag">PRIVATE</span>
      </div>
    </div>
  );
}

function TeacherStatusTable() {
  const records: { student: string; status: SubmissionStatus }[] = [
    { student: "Student A", status: "On time" },
    { student: "Student B", status: "Late" },
    { student: "Student C", status: "Not submitted" },
  ];
  return (
    <div className="sample-table-wrap">
      <table className="sample-table teacher-table">
        <caption>Interactive preview · teacher sees status only · Sample data</caption>
        <thead><tr><th>Student</th><th>Task status</th></tr></thead>
        <tbody>{records.map(({ student, status }) => (
          <tr key={student}>
            <td>{student}</td>
            <td><span className={`text-badge badge-${status === "On time" ? "confirmed" : status === "Late" ? "late" : "pending"}`}>{status}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function PrivacyDiagram() {
  return (
    <div className="privacy-diagram" aria-label="Teacher can access submission status; private student data remains blocked">
      <div className="privacy-zone">
        <span>TEACHER VIEW</span>
        <div className="privacy-node">Submission status</div>
        <div className="privacy-path"><span /><span /><span /></div>
      </div>
      <div className="privacy-wall"><LockKeyhole size={21} /><b>SERVER-SIDE PRIVACY BOUNDARY</b></div>
      <div className="privacy-zone private-zone">
        <span>STUDENT PRIVATE SPACE</span>
        <div className="privacy-node"><LockKeyhole size={14} /> Personal tasks · notes · timetable · progress</div>
        <div className="privacy-blocked">NOT VISIBLE TO TEACHERS</div>
      </div>
    </div>
  );
}

function highlightCode(source: string) {
  const tokenPattern = /(#[^\n]*|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:const|let|var|function|return|if|else|async|await|export|default|import|from|class|def|for|in|True|False|None)\b|\b\d+\b)/g;
  return source.split(tokenPattern).filter(Boolean).map((token, index) => {
    let kind = "code-plain";
    if (token.startsWith("#") || token.startsWith("//")) kind = "code-comment";
    else if (token.startsWith("\"") || token.startsWith("'")) kind = "code-string";
    else if (/^\d+$/.test(token)) kind = "code-number";
    else if (/^(const|let|var|function|return|if|else|async|await|export|default|import|from|class|def|for|in|True|False|None)$/.test(token)) kind = "code-keyword";
    return <span className={kind} key={`${index}-${token}`}>{token}</span>;
  });
}

function CodeExcerpt({ project }: { project: ProjectKey }) {
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState("");
  const path = project === "sokolink" ? "/code-excerpts/sokolink.py" : "/code-excerpts/drift.js";

  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Code excerpt could not be loaded (HTTP ${response.status}).`);
        const excerpt = await response.text();
        if (excerpt.length > 20_000) throw new Error("Keep the pasted code excerpt under 20 KB.");
        setSource(excerpt);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Code excerpt could not be loaded.");
      });
    return () => controller.abort();
  }, [path]);

  const isPlaceholder = source?.includes("PLACEHOLDER:") ?? false;

  return (
    <section className="code-card" aria-labelledby={`${project}-code-title`}>
      <div className="code-card-heading">
        <span id={`${project}-code-title`}><Code2 size={15} /> SOURCE EXCERPT</span>
        <code>{path.replace("/", "")}</code>
      </div>
      {error ? <p className="code-note code-error">{error}</p> : source === null ? <p className="code-note">Loading local excerpt…</p> : isPlaceholder ? (
        <div className="code-note"><b>No project source was included in this portfolio repository.</b><br />Replace the labelled slot at <code>public{path}</code> with a real excerpt to display it here.</div>
      ) : (
        <pre className="code-block"><code>{highlightCode(source)}</code></pre>
      )}
    </section>
  );
}

function SokoLinkPreview() {
  return (
    <div className="preview-grid sokolink-preview">
      <PreviewFrame label="Interactive preview · USSD">
        <UssdPhone />
      </PreviewFrame>
      <PreviewFrame label="Interactive preview · hub admin">
        <DeliveryTable />
      </PreviewFrame>
      <div className="preview-wide">
        <WorkflowDiagram steps={["Farmer", "USSD", "Server", "Admin", "M-Pesa", "Farmer"]} label="Sample farm delivery flow from farmer to USSD, server, admin, M-Pesa, and farmer" />
      </div>
    </div>
  );
}

function DriftPreview() {
  return (
    <div className="preview-grid drift-preview">
      <PreviewFrame label="Interactive preview · student">
        <DriftDashboard />
      </PreviewFrame>
      <PreviewFrame label="Interactive preview · teacher">
        <TeacherStatusTable />
      </PreviewFrame>
      <div className="preview-wide">
        <PreviewFrame label="Privacy boundary · server-enforced">
          <PrivacyDiagram />
        </PreviewFrame>
      </div>
    </div>
  );
}

function Narrative({ project }: { project: ProjectKey }) {
  if (project === "sokolink") {
    return (
      <div className="case-narrative">
        <article><h4>The problem</h4><p>Post-harvest losses, middlemen, and farmers without smartphones can make market access difficult.</p></article>
        <article><h4>Design rationale</h4><p>USSD works on any phone. Hub staff confirm weight and price before the Daraja B2C payout, keeping each hand-off explicit.</p></article>
        <article><h4>Trade-off</h4><p>Delivery confirmation depends on the hub workflow; the farmer can log a delivery without needing a smartphone.</p></article>
        <article><h4>What I learned</h4><p>A personal learning note has not been supplied yet. Add a specific lesson from sandbox testing here.</p></article>
        <article><h4>Potential next steps</h4><p>Possible questions to explore—not a committed roadmap—include validating the delivery flow and payout process with the people who would use them.</p></article>
      </div>
    );
  }
  return (
    <div className="case-narrative">
      <article><h4>The problem</h4><p>Students and teachers need accountability without turning a study workspace into surveillance.</p></article>
      <article><h4>Design rationale</h4><p>Teachers create classes and assign tasks, then see only whether work was on time, late or not submitted. Student tasks, notes, timetable and progress remain private.</p></article>
      <article><h4>Trade-off</h4><p>Status-only visibility supports assignment follow-up while deliberately withholding personal workspace details. The privacy boundary is enforced server-side.</p></article>
      <article><h4>What I learned</h4><p>A personal learning note has not been supplied yet. Add a specific lesson from building Drift here.</p></article>
      <article><h4>Potential next steps</h4><p>Possible questions to explore—not a committed roadmap—include testing whether the status-only view gives teachers enough context without revealing private student data.</p></article>
    </div>
  );
}

function CaseStudy({ project, onClose }: { project: ProjectKey; onClose: () => void }) {
  const details = projectDetails[project];

  return (
    <div className="case-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="case-panel" data-case-dialog role="dialog" aria-modal="true" aria-labelledby="case-title">
        <header className="case-panel-header">
          <div><span>{details.number} / CASE STUDY</span><p>{details.category}</p></div>
          <button className="case-close" type="button" onClick={onClose} aria-label="Close case study"><X size={20} /></button>
        </header>
        <div className="case-panel-scroll">
          <div className="case-title-row">
            <div><p className="eyebrow">{details.category}</p><h3 id="case-title">{details.title}</h3></div>
            <div className="case-statuses">{details.status.map((status) => <span className="case-status" key={status}>{status}</span>)}</div>
          </div>
          <p className="case-technologies">{details.technologies.join(" · ")}</p>
          <ProjectScreenshot
            path={`/images/${project}-screenshot.png`}
            alt={`${details.title} project screenshot`}
          />
          <div className="case-section-heading"><span>01</span><h4>Interactive product preview</h4></div>
          {project === "sokolink" ? <SokoLinkPreview /> : <DriftPreview />}
          <div className="case-section-heading"><span>02</span><h4>The story &amp; design decisions</h4></div>
          <Narrative project={project} />
          <div className="case-section-heading"><span>03</span><h4>Code from the project</h4></div>
          <CodeExcerpt project={project} />
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: ProjectKey; onOpen: (project: ProjectKey) => void }) {
  const detail = projectDetails[project];
  const summary = project === "sokolink"
    ? "A farm-to-market flow: USSD delivery logs, hub confirmation, then M-Pesa through Daraja B2C."
    : "A study workspace that gives teachers assignment status without exposing students' private work.";
  return (
    <article className={`project-card project-${project}`}>
      <div className="project-card-top"><span>PROJECT / {detail.number}</span><span>{detail.status.join(" · ")}</span></div>
      <button
        className={`project-object object-${project}`}
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Open ${detail.title} case study`}
      >
        <span className="object-scene" aria-hidden="true">
          {project === "sokolink" ? (
            <>
              <i className="object-island" />
              <i className="object-hub"><b>S</b></i>
              <i className="object-tree" />
              <i className="object-glow" />
            </>
          ) : (
            <>
              <i className="object-desk" />
              <i className="object-screen"><b>drift<span>.</span></b></i>
              <i className="object-lamp" />
              <i className="object-glow" />
            </>
          )}
        </span>
      </button>
      <div className="project-card-body">
        <div>
          <p className="project-category">{detail.category}</p>
          <h3>{detail.title}</h3>
          <p>{summary}</p>
        </div>
        <button className="case-open-button magnetic" type="button" onClick={() => onOpen(project)}>
          Explore case study <ArrowRight size={16} />
        </button>
      </div>
      <div className="project-card-footer">{detail.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
    </article>
  );
}

export default function Projects() {
  const [openProject, setOpenProject] = useState<ProjectKey | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!openProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>("[data-case-dialog]");
    const focusable = dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, textarea, [tabindex]:not([tabindex='-1'])");
    focusable?.[0]?.focus();
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenProject(null);
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
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
      opener.current?.focus();
    };
  }, [openProject]);

  const openCaseStudy = (project: ProjectKey) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpenProject(project);
  };

  return (
    <>
      <div className="projects-grid reveal-on-scroll">
        <ProjectCard project="sokolink" onOpen={openCaseStudy} />
        <ProjectCard project="drift" onOpen={openCaseStudy} />
      </div>
      {openProject && createPortal(
        <CaseStudy project={openProject} onClose={() => setOpenProject(null)} />,
        document.body,
      )}
    </>
  );
}
