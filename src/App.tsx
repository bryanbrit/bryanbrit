import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Github, Mail, Sun, Volume2, VolumeX } from "lucide-react";
import ContactForm from "./ContactForm";
import { ConfettiBurst, CursorFX, MagneticFX } from "./DelightFX";
import GitHubStats from "./GitHubStats";
import HireTerminal from "./HireTerminal";
import { CvDownload } from "./OptionalAsset";
import ProfileAvatar from "./ProfileAvatar";
import Projects from "./Projects";
import SceneErrorBoundary from "./SceneErrorBoundary";

const WorldScene = lazy(() => import("./WorldScene"));

function detectDevice() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency ?? 0;
  const memory = "deviceMemory" in navigator && typeof navigator.deviceMemory === "number"
    ? navigator.deviceMemory
    : undefined;
  let webglAvailable = false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webglAvailable = context !== null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch (error) {
    console.warn("WebGL capability could not be checked; using the simple view.", error);
  }

  return {
    reducedMotion,
    webglAvailable,
    preferSimple: reducedMotion || !webglAvailable || (memory !== undefined && memory <= 4) || (cores > 0 && cores <= 4),
  };
}

const sections = [
  ["About", "about"],
  ["Projects", "projects"],
  ["Skills", "skills"],
  ["Contact", "contact"],
];

function App() {
  const [environment] = useState(detectDevice);
  const [simpleView, setSimpleView] = useState(environment.preferSimple);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hireTerminalOpen, setHireTerminalOpen] = useState(() => window.location.pathname.replace(/\/+$/, "") === "/hire-me");
  const [confetti, setConfetti] = useState(0);
  const [truckHonked, setTruckHonked] = useState(false);
  const scrollProgress = useRef(0);
  const invalidateScene = useRef<() => void>(() => undefined);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: "main",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
        invalidateScene.current();
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (environment.reducedMotion) return;
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 84%", once: true },
          },
        );
      });
    });
    return () => context.revert();
  }, [environment.reducedMotion]);

  useEffect(() => {
    let honkTimer = 0;
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if (target instanceof HTMLElement && target.closest('[role="dialog"]')) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.key.toLowerCase() === "h") {
        setConfetti((count) => count + 1);
        setTruckHonked(true);
        window.clearTimeout(honkTimer);
        honkTimer = window.setTimeout(() => setTruckHonked(false), 1800);
        if (soundEnabled && "AudioContext" in window) {
          const audio = new AudioContext();
          const oscillator = audio.createOscillator();
          const volume = audio.createGain();
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(240, audio.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(130, audio.currentTime + 0.28);
          volume.gain.setValueAtTime(0.12, audio.currentTime);
          volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.32);
          oscillator.connect(volume);
          volume.connect(audio.destination);
          oscillator.start();
          oscillator.stop(audio.currentTime + 0.32);
          oscillator.onended = () => { void audio.close(); };
        }
      }

      if (event.key === "/") {
        event.preventDefault();
        setHireTerminalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.clearTimeout(honkTimer);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [soundEnabled]);

  return (
    <div className={simpleView ? "app simple-view" : "app"}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {!simpleView && (
        <SceneErrorBoundary onFallback={() => setSimpleView(true)}>
          <Suspense fallback={<div className="scene-loader" role="status"><span className="loader-spinner" /><span className="sr-only">Loading Shamba to Soko…</span><span className="loader-bar" aria-hidden="true" /></div>}>
            <WorldScene progress={scrollProgress} reducedMotion={environment.reducedMotion} invalidateScene={invalidateScene} />
          </Suspense>
        </SceneErrorBoundary>
      )}
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Bryan, go to top">
          <span className="brand-mark">b.</span>
          <span>BRYAN<span className="brand-dot">/</span>DEV</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {sections.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <button
          className="simple-toggle"
          type="button"
          aria-pressed={simpleView}
          disabled={simpleView && !environment.webglAvailable}
          onClick={() => setSimpleView((current) => !current)}
        >
          <Sun size={15} aria-hidden="true" />
          {simpleView ? "3D view" : "Simple view"}
        </button>
        <button
          className="sound-toggle"
          type="button"
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Turn sound off" : "Turn sound on"}
          onClick={() => setSoundEnabled((enabled) => !enabled)}
        >
          {soundEnabled ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
          <span>{soundEnabled ? "Sound on" : "Sound off"}</span>
        </button>
      </header>

      <main id="main-content">
        <section className="hero section-shell" id="home" aria-labelledby="hero-title">
          <div className="hero-copy reveal-on-scroll">
            <p className="eyebrow"><span className="status-light" /> SOFTWARE ENGINEERING STUDENT · NAKURU, KE</p>
            <h1 id="hero-title">Building software<br />for <span className="text-signal">real life.</span></h1>
            <p className="hero-subtitle">Software engineering student building for Kenya.</p>
            <p className="hero-intro">
              I'm Bryan, 19, a software engineering student in Nakuru, Kenya.
              I build practical software for African problems.
            </p>
            <div className="hero-actions">
              <a className="button button-primary magnetic" href="#projects">View projects <ArrowDown size={16} /></a>
              <a className="button button-outline magnetic" href="https://github.com/bryanbrit" target="_blank" rel="noopener noreferrer"><Github size={16} /> GitHub</a>
              <a className="button button-outline magnetic" href="#contact"><Mail size={16} /> Contact</a>
            </div>
          </div>
          <a className="scroll-cue" href="#about"><span>Scroll to explore</span><ArrowDown size={14} /></a>
        </section>
        <section className="section-shell about-section" id="about" aria-labelledby="about-heading">
          <div className="about-layout reveal-on-scroll">
            <ProfileAvatar />
            <div className="about-copy">
              <p className="eyebrow">01 / About</p>
              <h2 id="about-heading">Practical software.<br />Grounded in real needs.</h2>
              <p>I'm Bryan, a 19-year-old software engineering student in Nakuru, Kenya. I build practical software for African problems.</p>
              <p>I'm looking for a developer job or internship, and freelance work where I can keep learning by building.</p>
              <CvDownload />
              <p className="about-location">BASED IN <span>NAKURU, KENYA</span></p>
            </div>
          </div>
        </section>
        <section className="section-shell projects-section" id="projects" aria-labelledby="projects-heading">
          <div className="section-intro-row">
            <div><p className="eyebrow">02 / Selected work</p><h2 id="projects-heading">From shamba<br />to <span className="text-signal">soko.</span></h2></div>
            <p>Two projects in development. Open a case study for an interactive preview and the design decisions behind it.</p>
          </div>
          <Projects />
        </section>
        <section className="section-shell technology-section" id="skills" aria-labelledby="technology-heading">
          <div className="section-intro-row">
            <div><p className="eyebrow">03 / Project technologies</p><h2 id="technology-heading">Tools in<br />the work.</h2></div>
            <p>These are the technologies named for the two projects—not an expanded skills list.</p>
          </div>
          <div className="technology-cards reveal-on-scroll">
            <article><span>01 / SOKOLINK</span><p>Python <i>·</i> Django <i>·</i> Africa's Talking USSD <i>·</i> Safaricom Daraja B2C</p></article>
            <article><span>02 / DRIFT</span><p>Node.js <i>·</i> SQLite</p></article>
          </div>
          <GitHubStats />
        </section>
        <section className="section-shell contact-section reveal-on-scroll" id="contact" aria-labelledby="contact-heading">
          <ContactForm />
        </section>
      </main>
      <footer className="site-footer"><div className="kenya-stripe" aria-hidden="true" /><div><span>© 2026 Bryan · Built in Nakuru, Kenya</span><a href="#home">Back to top ↑</a></div></footer>
      {truckHonked && <p className="honk-message" role="status">Truck honk! Confetti delivered.</p>}
      <ConfettiBurst burst={confetti} />
      {hireTerminalOpen && <HireTerminal onClose={() => setHireTerminalOpen(false)} />}
      <CursorFX />
      <MagneticFX />
    </div>
  );
}

export default App;
