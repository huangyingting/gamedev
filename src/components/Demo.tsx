"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createDemoState, renderDemo } from "@/lib/demos";
import type { Concept } from "@/lib/concepts";
import { clamp } from "@/lib/math";
import { useLocale } from "@/components/LocaleProvider";
import { animationLabel, messages } from "@/lib/i18n";

function subscribeReducedMotion(callback: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerSnapshot = () => false;

export function Demo({ concept, large = false }: { concept: Concept; large?: boolean }) {
  const locale = useLocale();
  const t = messages[locale];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulation = useRef(createDemoState());
  const settings = useRef({ paused: false, speed: 1 });
  const [pauseOverride, setPauseOverride] = useState<boolean | null>(null);
  const [seed, setSeed] = useState(42);
  const [variant, setVariant] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerSnapshot);
  const paused = pauseOverride ?? reducedMotion;
  const modeControl = ["particle-system", "draw-calls", "overdraw"].includes(concept.slug);

  useEffect(() => { settings.current.paused = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let visible = false;
    let frame = 0;
    let previous = 0;
    let dirty = true;
    let stopped = false;
    const draw = (timestamp: number) => {
      if (stopped || !visible || document.hidden) { frame = 0; previous = 0; return; }
      const dt = previous ? Math.min((timestamp - previous) / 1000, 0.05) * settings.current.speed : 0;
      previous = timestamp;
      const state = simulation.current;
      if (!settings.current.paused || dirty) {
        const elapsed = settings.current.paused ? 0 : dt;
        state.time += elapsed;
        ctx.save();
        ctx.setTransform(canvas.width / 420, 0, 0, canvas.height / 250, 0, 0);
        renderDemo(ctx, concept.slug, concept.category, state, elapsed, locale, concept.title);
        ctx.restore();
        state.frame++;
        canvas.dataset.frame = String(state.frame);
        canvas.dataset.ready = "true";
        dirty = false;
      }
      frame = requestAnimationFrame(draw);
    };
    const start = () => { if (!frame && visible && !document.hidden && !stopped) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * dpr);
      canvas.height = Math.round(bounds.height * dpr);
      dirty = true; start();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { dirty = true; start(); }
      else { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    }, { rootMargin: "100px" });
    const resizeObserver = new ResizeObserver(resize);
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
      else start();
    };
    const onPointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      simulation.current.pointer = { x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 420, y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1) * 250 };
      simulation.current.pointing = true; dirty = true;
    };
    const onLeave = () => { simulation.current.pointing = false; dirty = true; };
    const onKey = (event: KeyboardEvent) => {
      const offsets: Record<string, [number, number]> = { ArrowLeft: [-15, 0], ArrowRight: [15, 0], ArrowUp: [0, -15], ArrowDown: [0, 15] };
      const offset = offsets[event.key];
      if (!offset) return;
      event.preventDefault();
      simulation.current.pointing = true;
      simulation.current.pointer.x = clamp(simulation.current.pointer.x + offset[0], 0, 420);
      simulation.current.pointer.y = clamp(simulation.current.pointer.y + offset[1], 30, 220);
      dirty = true;
    };
    const onRefresh = () => { dirty = true; };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("keydown", onKey);
    canvas.addEventListener("demo-refresh", onRefresh);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(canvas); resizeObserver.observe(canvas); resize();
    return () => {
      stopped = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointer); canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("keydown", onKey);
      canvas.removeEventListener("demo-refresh", onRefresh); document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [concept.slug, concept.category, concept.title, locale]);

  function replay(nextSeed = seed, nextVariant = variant) {
    simulation.current = createDemoState(nextSeed);
    simulation.current.variant = nextVariant;
    canvasRef.current?.dispatchEvent(new Event("demo-refresh"));
  }

  return (
    <div className={`demo${large ? " demo--large" : ""}`}>
      <canvas ref={canvasRef} width={420} height={250} role="img" tabIndex={0}
        aria-label={`${concept.title}: ${concept.tagline}. ${t.demoInstructions}`} />
      <div className="demo__caption">{t.demoCaption} <span aria-hidden="true">·</span> {t.demoExplore}</div>
      <div className="demo__controls">
        <button type="button" onClick={() => setPauseOverride(!paused)} aria-label={animationLabel(locale, paused ? "play" : "pause", concept.title)} aria-pressed={paused}>{paused ? t.play : t.pause}</button>
        <button type="button" onClick={() => replay()} aria-label={animationLabel(locale, "replay", concept.title)}>{t.replay}</button>
        {concept.slug === "seeded-noise" && <button type="button" onClick={() => { const next = seed + 137; setSeed(next); replay(next); }}>{t.newSeed} <span>{seed}</span></button>}
        {modeControl && <button type="button" onClick={() => { const next = variant + 1; setVariant(next); replay(seed, next); }}>{concept.slug === "particle-system" ? t.changeEffect : t.toggleView}</button>}
        {large && <label className="demo__speed">{t.speed} <input type="range" min="0.25" max="2" step="0.25" defaultValue="1" onChange={event => { settings.current.speed = Number(event.target.value); }} aria-label={t.animationSpeed} /></label>}
      </div>
    </div>
  );
}
