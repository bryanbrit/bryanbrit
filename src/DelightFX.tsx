import { useEffect, useRef, useState, type CSSProperties } from "react";

// A tiny pointer trail is drawn with DOM transforms instead of React rerenders.
export function CursorFX() {
  const cursor = useRef<HTMLSpanElement>(null);
  const trail = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    let x = -100;
    let y = -100;
    let trailX = x;
    let trailY = y;
    let frame = 0;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      document.documentElement.classList.add("has-custom-cursor");
    };
    const burst = (event: PointerEvent) => {
      const marker = document.createElement("span");
      marker.className = "click-particles";
      marker.setAttribute("aria-hidden", "true");
      marker.style.left = `${event.clientX}px`;
      marker.style.top = `${event.clientY}px`;
      document.body.append(marker);
      window.setTimeout(() => marker.remove(), 720);
    };

    const animate = () => {
      trailX += (x - trailX) * 0.18;
      trailY += (y - trailY) * 0.18;
      if (cursor.current) cursor.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (trail.current) trail.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
      frame = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", burst, { passive: true });
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", burst);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <span className="cursor-dot" ref={cursor} aria-hidden="true" />
      <span className="cursor-trail" ref={trail} aria-hidden="true" />
    </>
  );
}

// Small button offsets are applied directly so pointer movement stays inexpensive.
export function MagneticFX() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const targets = document.querySelectorAll<HTMLElement>(".magnetic");
    const handlers = new Map<HTMLElement, { move: (event: PointerEvent) => void; leave: () => void }>();
    for (const target of targets) {
      const move = (event: PointerEvent) => {
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        target.style.setProperty("--magnetic-x", `${x * 5}px`);
        target.style.setProperty("--magnetic-y", `${y * 5}px`);
      };
      const leave = () => {
        target.style.setProperty("--magnetic-x", "0px");
        target.style.setProperty("--magnetic-y", "0px");
      };
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerleave", leave);
      handlers.set(target, { move, leave });
    }
    return () => {
      for (const [target, { move, leave }] of handlers) {
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerleave", leave);
      }
    };
  }, []);
  return null;
}

export function ConfettiBurst({ burst }: { burst: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!burst) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1400);
    return () => window.clearTimeout(timer);
  }, [burst]);

  if (!burst || !visible) return null;
  const colors = ["#8dff8a", "#ff8d52", "#ffc76d", "#a49aff"];
  return (
    <div className="confetti-burst" key={burst} aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => (
        <i
          key={index}
          style={{
            "--confetti-x": `${Math.cos(index * 0.27) * (70 + (index % 5) * 14)}px`,
            "--confetti-y": `${Math.sin(index * 0.27) * (70 + (index % 5) * 14)}px`,
            "--confetti-rotation": `${index * 67}deg`,
            "--confetti-color": colors[index % colors.length],
            "--confetti-delay": `${index * 8}ms`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
