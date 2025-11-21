import React, { useEffect, useMemo, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FlameKindling,
  Sparkles,
  Play,
  Settings,
  Pause,
  Check,
  ChevronRight,
  Sun,
  Moon,
  Gauge,
  ChevronLeft,
  Zap,
  Dumbbell,
  ShieldCheck,
  HeartPulse,
  Brain,
  Activity,
  Image as ImageIcon,
  Wand2,
} from "lucide-react";

/**
 Design Tokens
 - Colors and motion are centralized here for quick theme customization.
*/
const TOKENS = {
  colors: {
    bg: "#0b0f1a",
    panel: "rgba(255,255,255,0.04)",
    glass: "rgba(255,255,255,0.06)",
    accent1: "#7C3AED", // violet
    accent2: "#06B6D4", // cyan
    accent3: "#F97316", // orange
  },
  motion: {
    spring: { type: "spring", stiffness: 200, damping: 22 },
    soft: { type: "spring", stiffness: 120, damping: 20 },
    float: { duration: 2.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
  },
  radii: {
    xl: "22px",
    lg: "18px",
    md: "14px",
  },
};

const Gradients = () => (
  <style>
    {`
    :root {
      --bg: ${TOKENS.colors.bg};
      --panel: ${TOKENS.colors.panel};
      --glass: ${TOKENS.colors.glass};
      --accent-1: ${TOKENS.colors.accent1};
      --accent-2: ${TOKENS.colors.accent2};
      --accent-3: ${TOKENS.colors.accent3};
    }
    .glass {
      background: var(--panel);
      backdrop-filter: blur(12px) saturate(140%);
      -webkit-backdrop-filter: blur(12px) saturate(140%);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow:
        0 10px 30px rgba(0,0,0,0.45),
        inset 0 0 0 1px rgba(255,255,255,0.04);
    }
    .ring-gradient {
      stroke: url(#ringGradient);
      filter: drop-shadow(0 0 12px rgba(124,58,237,0.45)) drop-shadow(0 0 18px rgba(6,182,212,0.25));
    }
    .neon-text {
      text-shadow:
        0 0 16px rgba(124,58,237,0.65),
        0 0 28px rgba(6,182,212,0.45);
    }
    .neon-border {
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.08),
        0 0 24px rgba(124,58,237,0.35),
        inset 0 0 24px rgba(6,182,212,0.18);
    }
    .btn-gradient {
      background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    }
    .btn-gradient-2 {
      background: linear-gradient(135deg, var(--accent-2), var(--accent-3));
    }
    .grid-light {
      background-image:
        radial-gradient(ellipse at top left, rgba(124,58,237,0.18), transparent 45%),
        radial-gradient(ellipse at bottom right, rgba(6,182,212,0.18), transparent 45%);
    }
    .holo-stroke {
      border: 1px solid transparent;
      background:
        linear-gradient(var(--bg), var(--bg)) padding-box,
        linear-gradient(135deg, rgba(124,58,237,0.8), rgba(6,182,212,0.8), rgba(249,115,22,0.8)) border-box;
    }
    .card-3d {
      transform-style: preserve-3d;
      perspective: 1000px;
    }
  `}
  </style>
);

/**
 ProgressRing
 - Animated circular ring with gradient stroke and smooth dash offset.
*/
const ProgressRing = ({ size = 140, stroke = 12, progress = 0, label = "Load" }) => {
  const r = (size - stroke) / 2;
  const c = Math.PI * (r * 2);
  const offset = c - (progress / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <defs>
          <linearGradient id="ringGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-2)" />
            <stop offset="50%" stopColor="var(--accent-1)" />
            <stop offset="100%" stopColor="var(--accent-3)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="transparent" />
        <motion.circle
          className="ring-gradient"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={TOKENS.motion.spring}
          style={{ strokeDasharray: c }}
        />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-extrabold text-white">{Math.round(progress)}%</div>
        <div className="text-xs uppercase tracking-wider text-cyan-300/80">{label}</div>
      </div>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        initial={{ opacity: 0.2, scale: 0.96 }}
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.96, 1.02, 0.96] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "conic-gradient(from 0deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15), rgba(249,115,22,0.15), rgba(124,58,237,0.15))",
          filter: "blur(14px)",
        }}
      />
    </div>
  );
};

/**
 LayeredHero
 - Parallax background, Spline 3D, device mockup tilt, neon glows.
*/
const LayeredHero = ({ user, reduced }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * -12;
    setTilt({ x: rx, y: ry });
  };

  return (
    <section className="relative overflow-hidden grid-light">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 w-[48rem] h-[48rem] rounded-full blur-[120px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent 60%)" }} />
        <div className="absolute -bottom-24 -right-24 w-[48rem] h-[48rem] rounded-full blur-[120px] opacity-40"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.35), transparent 60%)" }} />
      </div>

      <div className="relative container mx-auto px-6 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={TOKENS.motion.soft}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full holo-stroke text-cyan-200/90"
              aria-label="GYMX welcome badge"
            >
              <FlameKindling className="w-4 h-4 text-orange-300" />
              <span className="text-xs tracking-wide">Welcome back{user?.name ? `, ${user.name}` : ""}</span>
            </motion.div>

            <motion.h1
              className="mt-5 text-5xl md:text-6xl font-black text-white neon-text leading-tight"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...TOKENS.motion.soft, delay: 0.05 }}
            >
              GYMX
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-orange-300">
                Train in Holographic Motion
              </span>
            </motion.h1>

            <motion.p
              className="mt-4 text-cyan-200/80 max-w-xl"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...TOKENS.motion.soft, delay: 0.1 }}
            >
              Neon-charged workouts, AI-crafted flows, and cinematic feedback. Push past limits with visuals that move you.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ ...TOKENS.motion.soft, delay: 0.15 }}
            >
              <button
                aria-label="Start workout"
                className="btn-gradient text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition-transform neon-border inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Workout
              </button>
              <button
                aria-label="Explore features"
                className="btn-gradient-2 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition-transform neon-border inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Explore Features
              </button>
            </motion.div>
          </div>

          <div className="relative">
            <div className="relative h-[420px] w-full glass rounded-2xl neon-border overflow-hidden">
              <Spline scene="https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode" style={{ width: "100%", height: "100%" }} />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "radial-gradient(700px 220px at 70% 20%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(600px 200px at 30% 80%, rgba(6,182,212,0.22), transparent 60%)",
                }}
              />
            </div>

            <div
              className="mt-6 card-3d"
              ref={ref}
              onMouseMove={reduced ? undefined : handleMove}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            >
              <motion.div
                className="glass neon-border p-4 rounded-2xl relative overflow-hidden"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }}
                animate={reduced ? { rotateX: 0, rotateY: 0 } : undefined}
                transition={TOKENS.motion.soft}
              >
                <div className="flex items-center gap-4">
                  <img
                    src="/assets/mock-device.png"
                    alt="GYMX device mockup"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-white font-bold">GYMX Mobile</div>
                    <div className="text-cyan-200/70 text-sm">Syncs with your session in real-time</div>
                  </div>
                </div>
                <motion.div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-2xl pointer-events-none"
                  animate={reduced ? {} : { rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  style={{ background: "conic-gradient(from 90deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2), rgba(249,115,22,0.2), rgba(124,58,237,0.2))", filter: "blur(20px)" }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 Dashboard
 - Progress ring, weekly load, workout timeline, and mini chart placeholder.
*/
const Dashboard = ({ user }) => {
  const [progress, setProgress] = useState(62);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + (Math.random() * 6 - 3);
        return Math.max(0, Math.min(100, next));
      });
    }, 2200);
    return () => clearInterval(id);
  }, [reduced]);

  const timeline = useMemo(
    () => [
      { label: "Mon", done: true },
      { label: "Tue", done: true },
      { label: "Wed", done: true },
      { label: "Thu", done: false },
      { label: "Fri", done: false },
      { label: "Sat", done: false },
      { label: "Sun", done: false },
    ],
    []
  );

  return (
    <section className="relative container mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          className="glass rounded-2xl neon-border p-6 flex items-center justify-between"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={TOKENS.motion.soft}
        >
          <div>
            <div className="text-white font-semibold">Daily Momentum</div>
            <div className="text-cyan-200/70 text-sm">Stay above 60% to keep streaks alive</div>
            <div className="mt-3 inline-flex items-center gap-2 text-orange-300">
              <Zap className="w-4 h-4" />
              High Intensity Mode
            </div>
          </div>
          <ProgressRing progress={progress} label="Momentum" />
        </motion.div>

        <motion.div
          className="glass rounded-2xl neon-border p-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TOKENS.motion.soft, delay: 0.05 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Weekly Load</div>
            <Gauge className="w-5 h-5 text-cyan-300" aria-hidden="true" />
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {timeline.map((d, i) => (
              <motion.div
                key={d.label}
                className="h-16 rounded-xl relative overflow-hidden neon-border"
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ ...TOKENS.motion.soft, delay: i * 0.05 }}
                style={{
                  background: d.done
                    ? "linear-gradient(180deg, rgba(124,58,237,0.35), rgba(6,182,212,0.25))"
                    : "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                  {d.label}
                </div>
                <motion.div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500/60 to-cyan-400/60"
                  initial={{ height: 0 }}
                  whileInView={{ height: d.done ? "70%" : "25%" }}
                  transition={TOKENS.motion.soft}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-4 text-cyan-200/70 text-sm">Load target: 420 pts</div>
        </motion.div>

        <motion.div
          className="glass rounded-2xl neon-border p-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ...TOKENS.motion.soft, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-semibold">Mini Chart</div>
            <Activity className="w-5 h-5 text-orange-300" />
          </div>
          <div className="h-36 relative overflow-hidden rounded-xl bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 neon-border">
            <motion.svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            >
              <defs>
                <linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="var(--accent-2)" />
                  <stop offset="100%" stopColor="var(--accent-1)" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,30 C20,10 30,35 45,18 C60,2 80,30 100,22"
                fill="transparent"
                stroke="url(#line)"
                strokeWidth="2.5"
              />
              <motion.linearGradient />
            </motion.svg>
            <div className="absolute inset-x-0 bottom-0 text-xs text-cyan-200/60 p-2">Realtime performance sample</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/**
 TrainerCarousel
 - 3D rotating carousel with depth and autorotate.
*/
const TrainerCarousel = ({ trainers = [] }) => {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % trainers.length);
    }, 3800);
    return () => clearInterval(id);
  }, [trainers.length]);

  return (
    <section className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-semibold text-lg inline-flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-300" />
          Elite Trainers
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous trainer"
            onClick={() => setIndex((i) => (i - 1 + trainers.length) % trainers.length)}
            className="glass rounded-xl p-2 hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            aria-label="Next trainer"
            onClick={() => setIndex((i) => (i + 1) % trainers.length)}
            className="glass rounded-xl p-2 hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="relative h-[320px]">
        <div className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(450px 120px at 20% 30%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(450px 120px at 80% 70%, rgba(6,182,212,0.18), transparent 60%)",
          }}
        />
        <div className="h-full flex items-center justify-center gap-6 perspective-[1200px]">
          {trainers.map((t, i) => {
            const offset = ((i - index + trainers.length) % trainers.length);
            const pos = offset === 0 ? 0 : offset <= trainers.length / 2 ? offset : offset - trainers.length;
            const z = -Math.abs(pos) * 120;
            const scale = 1 - Math.abs(pos) * 0.08;
            const rotateY = pos * -15;
            const x = pos * 140;

            return (
              <motion.div
                key={t.id}
                className="w-56 h-72 glass neon-border rounded-2xl overflow-hidden relative"
                initial={false}
                animate={reduced ? {} : { x, scale, rotateY, z }}
                transition={TOKENS.motion.soft}
                style={{ transformStyle: "preserve-3d" }}
                aria-label={`${t.name}, ${t.tagline}`}
              >
                <img
                  src={t.photo || "/assets/trainer.jpg"}
                  alt={`${t.name} portrait`}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 w-full p-4">
                  <div className="text-white font-bold">{t.name}</div>
                  <div className="text-cyan-200/80 text-sm">{t.tagline}</div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full holo-stroke text-cyan-200/90 inline-flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" /> Strength
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full holo-stroke text-orange-200/90 inline-flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" /> HIIT
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/**
 WorkoutFlow
 - Card list with active state, animated preview panel, actions.
*/
const WorkoutFlow = ({ workouts = [] }) => {
  const [active, setActive] = useState(workouts[0]?.id ?? null);

  const current = workouts.find((w) => w.id === active);

  return (
    <section className="container mx-auto px-6 py-12 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="text-white font-semibold text-lg mb-4 inline-flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-300" />
          AI Workout Flow
        </div>
        <div className="space-y-3">
          {workouts.map((w) => {
            const isActive = w.id === active;
            return (
              <button
                key={w.id}
                aria-label={`Select workout ${w.title}`}
                onClick={() => setActive(w.id)}
                className={`w-full text-left p-4 rounded-2xl glass neon-border transition-all ${isActive ? "ring-2 ring-cyan-400/50 scale-[1.01]" : "hover:scale-[1.01]"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">{w.title}</div>
                  <div className="text-xs text-cyan-200/70">{w.duration} min</div>
                </div>
                <div className="text-sm text-cyan-200/70 mt-1">{w.focus}</div>
                <div className="mt-2 flex gap-2">
                  {w.tags?.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-1 rounded-full holo-stroke text-cyan-200/90">{t}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              className="rounded-2xl glass neon-border p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={TOKENS.motion.soft}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "radial-gradient(600px 180px at 85% 20%, rgba(249,115,22,0.14), transparent 60%)" }}
              />
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative md:w-2/3">
                  <img
                    src={current.cover || "/assets/workout.jpg"}
                    alt={`${current.title} cover`}
                    className="w-full h-56 md:h-72 object-cover rounded-xl neon-border"
                  />
                  <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-md inline-flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Preview
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <button aria-label="Start workout" className="flex-1 btn-gradient text-white px-4 py-2 rounded-xl font-semibold inline-flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> Start
                    </button>
                    <button aria-label="Edit workout" className="btn-gradient-2 text-white px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2">
                      <Wand2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                </div>
                <div className="md:w-1/3">
                  <div className="text-white font-bold text-lg">{current.title}</div>
                  <div className="text-cyan-200/80 text-sm">{current.description}</div>
                  <div className="mt-3 text-cyan-200/70 text-sm">Equipment: {current.equipment?.join(", ") || "Bodyweight"}</div>
                  <div className="mt-4 space-y-2">
                    {(current.steps || []).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-cyan-100">
                        <Check className="w-4 h-4 text-orange-300" />
                        <span className="text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/**
 SettingsPanel
 - Theme and motion toggles in a floating glass panel.
*/
const SettingsPanel = ({ theme, setTheme, motion, setMotion }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.div
        className="glass rounded-2xl neon-border p-4 w-[300px]"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={TOKENS.motion.soft}
      >
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold inline-flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-300" />
            Settings
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-cyan-200/80 text-sm">Theme</div>
            <div className="flex gap-2">
              <button
                aria-label="Enable dark theme"
                onClick={() => setTheme("dark")}
                className={`px-3 py-2 rounded-xl inline-flex items-center gap-1 ${theme === "dark" ? "btn-gradient text-white" : "glass text-cyan-100"}`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                aria-label="Enable light theme"
                onClick={() => setTheme("light")}
                className={`px-3 py-2 rounded-xl inline-flex items-center gap-1 ${theme === "light" ? "btn-gradient-2 text-white" : "glass text-cyan-100"}`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-cyan-200/80 text-sm">Motion</div>
            <div className="flex gap-2">
              <button
                aria-label="Enable animations"
                onClick={() => setMotion(true)}
                className={`px-3 py-2 rounded-xl inline-flex items-center gap-1 ${motion ? "btn-gradient text-white" : "glass text-cyan-100"}`}
              >
                <Play className="w-4 h-4" />
                On
              </button>
              <button
                aria-label="Disable animations"
                onClick={() => setMotion(false)}
                className={`px-3 py-2 rounded-xl inline-flex items-center gap-1 ${!motion ? "btn-gradient-2 text-white" : "glass text-cyan-100"}`}
              >
                <Pause className="w-4 h-4" />
                Off
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 GYMXApp (default export)
 - Orchestrates all sections. Honors prefers-reduced-motion and internal toggle.
*/
export default function GYMXApp() {
  const prefersReduced = useReducedMotion();
  const [theme, setTheme] = useState("dark");
  const [allowMotion, setAllowMotion] = useState(!prefersReduced);

  // Mock data
  const user = { name: "Nova" };
  const trainers = [
    { id: "t1", name: "Kade Vega", tagline: "Metabolic Architect", photo: "/assets/trainer1.jpg" },
    { id: "t2", name: "Aria Flux", tagline: "Mobility Virtuoso", photo: "/assets/trainer2.jpg" },
    { id: "t3", name: "Rex Ion", tagline: "Strength Engineer", photo: "/assets/trainer3.jpg" },
    { id: "t4", name: "Zia Pulse", tagline: "Cardio Composer", photo: "/assets/trainer4.jpg" },
  ];
  const workouts = [
    {
      id: "w1",
      title: "HIIT Neon Burst",
      duration: 22,
      focus: "Cardio + Core",
      tags: ["HIIT", "Core", "Intervals"],
      cover: "/assets/hiit.jpg",
      description: "Explosive intervals primed for fat oxidation and VO2 peak stimulus.",
      equipment: ["Mat", "Timer"],
      steps: ["Warm-up 3m", "6 Rounds: 30s on / 15s off", "Cool-down 4m"],
    },
    {
      id: "w2",
      title: "Hyper Strength",
      duration: 38,
      focus: "Full-body Strength",
      tags: ["Compound", "Tempo", "Progressive"],
      cover: "/assets/strength.jpg",
      description: "Compound lifts with tempo control for strength and mass.",
      equipment: ["Barbell", "Dumbbells"],
      steps: ["Warm-up 5m", "5x5 Main Lifts", "Accessory 3x10", "Cool-down 5m"],
    },
    {
      id: "w3",
      title: "Mobility Aurora",
      duration: 28,
      focus: "Mobility + Balance",
      tags: ["Flow", "Stretch", "Breath"],
      cover: "/assets/mobility.jpg",
      description: "Fluid mobility chains to unlock ranges and joint articulation.",
      equipment: ["Mat"],
      steps: ["Diaphragmatic Breathing", "Hip-shoulder Flow", "Ankle CARs", "Spine Waves"],
    },
  ];

  useEffect(() => {
    document.documentElement.style.setProperty("color-scheme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0b0f1a]" : "bg-white"} relative`}>
      <Gradients />

      {/* Background effects */}
      <div aria-hidden="true" className="fixed inset-0 -z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20 mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, rgba(124,58,237,0.35), transparent 40%), radial-gradient(circle at 75% 80%, rgba(6,182,212,0.35), transparent 40%)",
          }}
        />
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0) 20%), url('/assets/noise.png')",
            backgroundSize: "auto, 300px",
            opacity: 0.15,
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-white font-bold tracking-wide">
            <FlameKindling className="w-5 h-5 text-orange-300" />
            <span>GYMX</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-cyan-100">
            <a className="hover:text-white transition-colors" href="#hero">Hero</a>
            <a className="hover:text-white transition-colors" href="#dashboard">Dashboard</a>
            <a className="hover:text-white transition-colors" href="#trainers">Trainers</a>
            <a className="hover:text-white transition-colors" href="#workflows">Workflows</a>
          </nav>
          <button aria-label="User profile" className="glass px-3 py-2 rounded-xl text-white inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            Pro
          </button>
        </div>
      </header>

      {/* Hero */}
      <div id="hero">
        <LayeredHero user={user} reduced={!allowMotion} />
      </div>

      {/* Dashboard */}
      <div id="dashboard">
        <Dashboard user={user} />
      </div>

      {/* Trainers */}
      <div id="trainers">
        <TrainerCarousel trainers={trainers} />
      </div>

      {/* Workflows */}
      <div id="workflows">
        <WorkoutFlow workouts={workouts} />
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12">
        <div className="glass rounded-2xl neon-border p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white font-semibold inline-flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-cyan-300" />
            Ready to elevate your training?
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button aria-label="Start session" className="btn-gradient text-white px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Session
            </button>
            <button aria-label="View plans" className="btn-gradient-2 text-white px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              View Plans
            </button>
          </div>
        </div>
        <div className="text-xs text-cyan-200/60 mt-4">Respecting reduced motion: {allowMotion ? "off" : "on"} • Theme: {theme}</div>
      </footer>

      {/* Settings */}
      <SettingsPanel theme={theme} setTheme={setTheme} motion={allowMotion} setMotion={setAllowMotion} />
    </div>
  );
}
