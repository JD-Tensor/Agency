import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { submitInquiryApi } from '../../services/api';
import './landing.css';

/* ---------- content ---------- */

const SERVICES = [
  { k: 'web', title: 'Web Applications', text: 'Blazing-fast web apps and SaaS platforms engineered to scale from day one, with pixel-perfect interfaces.', tags: ['React', 'Next.js', 'Node'] },
  { k: 'mobile', title: 'Mobile Apps', text: 'Native-feel iOS and Android apps with buttery animations, offline-first resilience and store-ready polish.', tags: ['React Native', 'Swift', 'Kotlin'] },
  { k: 'ai', title: 'AI & Automation', text: 'LLM copilots, RAG pipelines and workflow automation that turn your data into a real competitive edge.', tags: ['LLMs', 'Python', 'RAG'] },
  { k: 'cloud', title: 'Cloud & DevOps', text: 'Resilient cloud architecture, CI/CD and observability that scale quietly without the 3am pages.', tags: ['AWS', 'Docker', 'K8s'] },
  { k: 'design', title: 'Product Design', text: 'Research-led UI/UX and motion-rich design systems that look incredible and convert even better.', tags: ['Figma', 'Motion', 'Systems'] },
  { k: 'secure', title: 'Security & QA', text: 'Automated testing, audits and hardening so everything you ship is rock solid and safe.', tags: ['Testing', 'Audits', 'SOC2'] },
];

const STATS = [
  { to: 120, s: '+', l: 'Projects delivered' },
  { to: 45, s: '+', l: 'Happy clients' },
  { to: 8, s: 'yrs', l: 'Engineering craft' },
  { to: 99, s: '%', l: 'Client retention' },
];

const STEPS = [
  { t: 'Discover', d: 'We dig into your goals, users and constraints, then shape a sharp, measurable scope.' },
  { t: 'Design', d: 'Rapid prototypes and a polished design system you can click through before we code.' },
  { t: 'Build', d: 'Weekly demos, clean code and automated tests. Real progress every single sprint.' },
  { t: 'Launch', d: 'Zero-downtime deploys, monitoring and continuous iteration as your product scales.' },
];

const PROJECTS = [
  { cat: 'FinTech · Web', title: 'Nimbus Pay', text: 'Real-time payments dashboard processing 2M+ transactions a day.', art: 'bars', gx: '25%' },
  { cat: 'HealthTech · Mobile', title: 'PulseCare', text: 'Patient companion app with live vitals, bookings and video consults.', art: 'pulse', gx: '70%' },
  { cat: 'AI · SaaS', title: 'Lumen AI', text: 'Document intelligence copilot that cuts research time by 70%.', art: 'dots', gx: '40%' },
  { cat: 'E-commerce · Platform', title: 'Orbit Market', text: 'Headless commerce engine with sub-second pages across 12 regions.', art: 'wave', gx: '80%' },
];

const STACK = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Go', 'PostgreSQL', 'Supabase', 'GraphQL', 'React Native', 'Flutter', 'AWS', 'Docker', 'Kubernetes', 'Tailwind', 'OpenAI', 'Redis', 'Terraform'];

const TESTIMONIALS = [
  { q: 'They shipped our MVP in six weeks and it felt like a product from a ten-person team. Communication was flawless.', n: 'Aarav Mehta', r: 'CEO, Nimbus Pay' },
  { q: 'A rare mix of design taste and engineering depth. Our conversion rate jumped 38% after the redesign.', n: 'Sofia Laurent', r: 'Head of Product, PulseCare' },
  { q: 'The AI copilot they built is now core to how our analysts work. Honestly the best agency we have used.', n: 'Daniel Okafor', r: 'CTO, Lumen AI' },
];

const STATEMENT = 'We are a software agency turning ambitious ideas into fast elegant scalable products. Design, engineering and AI under one roof, shipped with obsessive craft.';
const HL = new Set(['ambitious', 'fast', 'elegant', 'scalable', 'obsessive', 'craft.']);

const clamp = (v: number, a = 0, b = 1) => Math.min(Math.max(v, a), b);

/* ---------- small pieces ---------- */

const Brand: React.FC<{ onClick?: (e: React.MouseEvent) => void }> = ({ onClick }) => (
  <a href="#top" className="lp-logo" onClick={onClick}>
    <span className="lp-logo-mark">J&amp;D</span>
    <span className="lp-logo-name">JD Tensor</span>
  </a>
);

const Letters: React.FC<{ text: string; start?: number; className?: string }> = ({ text, start = 0, className }) => (
  <span className={`lp-line ${className ?? ''}`}>
    {text.split('').map((c, i) => (
      <span key={i} className="lp-ch" style={{ ['--i' as string]: start + i }}>{c === ' ' ? ' ' : c}</span>
    ))}
  </span>
);

const Counter: React.FC<{ to: number; suffix: string }> = ({ to, suffix }) => {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / 2000, 1);
        setV(Math.round(to * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <strong ref={ref}>{v}<em>{suffix}</em></strong>;
};

/* ---------- loader ---------- */

const Loader: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1500, 1);
      setN(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setTimeout(() => { setDone(true); onDone(); }, 250); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return (
    <div className={`lp-loader ${done ? 'done' : ''}`}>
      <div className="lp-curtain t" /><div className="lp-curtain b" />
      <div className="lp-load-core">
        <div className="lp-load-num" style={{ ['--c' as string]: `${100 - n}%` }}>{n}<i>{n}</i></div>
        <div className="lp-load-tag">JD Tensor · Loading experience</div>
      </div>
    </div>
  );
};

/* ---------- hero canvases ---------- */

const FlowField: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, t = 0;
    const m = { x: -9999, y: -9999 };
    type P = { x: number; y: number; s: number };
    let ps: P[] = [];
    const resize = () => {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: Math.min(700, Math.floor(w * h / 2400)) }, () => ({ x: Math.random() * w, y: Math.random() * h, s: 0.5 + Math.random() * 1.2 }));
    };
    const onMove = (e: MouseEvent) => { const b = cv.getBoundingClientRect(); m.x = e.clientX - b.left; m.y = e.clientY - b.top; };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = () => {
      t += 0.004;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1.2;
      for (const p of ps) {
        const a = Math.sin(p.x * 0.003 + t) * 2 + Math.cos(p.y * 0.004 - t * 1.3) * 2 + Math.sin((p.x + p.y) * 0.002 + t * 0.7) * 1.5;
        let vx = Math.cos(a) * p.s, vy = Math.sin(a) * p.s;
        const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
        if (d < 160) { const f = (1 - d / 160) * 6; vx += (dx / d) * f; vy += (dy / d) * f; }
        const nx = p.x + vx, ny = p.y + vy;
        ctx.strokeStyle = `rgba(${217 + (d < 160 ? 38 : 0)},${114 + (d < 160 ? 40 : 0)},${54 + (d < 160 ? 38 : 0)},${d < 160 ? 0.9 : 0.5})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) { p.x = Math.random() * w; p.y = Math.random() * h; }
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    resize(); frame();
    window.addEventListener('resize', resize); window.addEventListener('mousemove', onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); };
  }, []);
  return <canvas ref={ref} className="lp-flow" />;
};

const Globe: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let S = 0, raf = 0, ry = 0, tx = 0.35, tTx = 0.35, tRy = 0;
    const resize = () => { S = cv.clientWidth; cv.width = S * dpr; cv.height = S * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const onMove = (e: MouseEvent) => { tTx = 0.35 + (e.clientY / innerHeight - 0.5) * 0.7; tRy = (e.clientX / innerWidth - 0.5) * 1.2; };
    // fixed network nodes on the sphere
    const nodes = Array.from({ length: 34 }, () => {
      const u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = Math.sqrt(1 - u * u);
      return { x: r * Math.cos(th), y: u, z: r * Math.sin(th), ph: Math.random() * 6.283 };
    });
    const rot = (x: number, y: number, z: number, a: number, b: number) => {
      const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      const y2 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
      return [x1, y2, z2];
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let time = 0;
    const frame = () => {
      time += 0.016; ry += 0.006 + tRy * 0.01; tx += (tTx - tx) * 0.05;
      ctx.clearRect(0, 0, S, S);
      const R = S * 0.33, c = S / 2;
      const P = (x: number, y: number, z: number) => { const [a, b, d] = rot(x, y, z, ry, tx); const k = 1 + d * 0.18; return [c + a * R * k, c + b * R * k, d]; };
      const seg = (p: number[], q: number[], base: number) => {
        const d = (p[2] + q[2]) / 2;
        ctx.strokeStyle = `rgba(217,114,54,${base * (0.25 + 0.75 * (d + 1) / 2)})`;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      };
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) { // latitudes
        const phi = (i / 5) * (Math.PI / 2), y = Math.sin(phi), r = Math.cos(phi);
        let prev = P(r, y, 0);
        for (let k = 1; k <= 48; k++) { const a = (k / 48) * 6.283, cur = P(r * Math.cos(a), y, r * Math.sin(a)); seg(prev, cur, 0.55); prev = cur; }
      }
      for (let j = 0; j < 12; j++) { // meridians
        const th = (j / 12) * Math.PI;
        let prev = P(Math.cos(th) * 0, 1, 0);
        for (let k = 1; k <= 48; k++) {
          const a = (k / 48) * 6.283;
          const cur = P(Math.cos(a) * Math.cos(th), Math.sin(a), Math.cos(a) * Math.sin(th));
          seg(prev, cur, 0.5); prev = cur;
        }
      }
      // network nodes + links
      const pn = nodes.map((n) => P(n.x, n.y, n.z));
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
        if (d < 0.7) { ctx.lineWidth = 1.2; seg(pn[i], pn[j], 1.2 * (1 - d / 0.7) + 0.2); }
      }
      pn.forEach((p, i) => {
        const pulse = 2 + Math.sin(time * 2 + nodes[i].ph) * 1.2;
        ctx.fillStyle = `rgba(255,154,92,${0.3 + 0.7 * (p[2] + 1) / 2})`;
        ctx.beginPath(); ctx.arc(p[0], p[1], pulse * (0.6 + 0.5 * (p[2] + 1)), 0, 6.283); ctx.fill();
      });
      // satellites
      [[1.35, 0.5, 1], [1.55, -0.9, -0.7], [1.2, 1.5, 1.4]].forEach(([r, tilt, sp], i) => {
        ctx.lineWidth = 1; ctx.setLineDash([3, 7]);
        let prev = P(r, 0, 0);
        const pt = (a: number) => { const x = r * Math.cos(a), z = r * Math.sin(a); return P(x, z * Math.sin(tilt), z * Math.cos(tilt)); };
        for (let k = 1; k <= 64; k++) { const cur = pt((k / 64) * 6.283); seg(prev, cur, 0.35); prev = cur; }
        ctx.setLineDash([]);
        const sp1 = pt(time * sp * 0.9 + i * 2);
        ctx.shadowColor = '#ff9a5c'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(sp1[0], sp1[1], 3.5, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      });
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    resize(); frame();
    window.addEventListener('resize', resize); window.addEventListener('mousemove', onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); };
  }, []);
  return <canvas ref={ref} className="lp-globe" />;
};

const OrbitVisual: React.FC = () => (
  <div className="lp-orbit-wrap">
    <svg className="lp-ringsvg" viewBox="0 0 400 400" fill="none">
      <circle className="r1" cx="200" cy="200" r="192" stroke="rgba(217,114,54,0.45)" strokeWidth="1" strokeDasharray="2 10" />
      <g className="r2"><circle cx="200" cy="200" r="178" stroke="rgba(255,237,220,0.15)" strokeWidth="1" /><circle cx="200" cy="22" r="5" fill="#d97236" /></g>
      <g className="r3"><circle cx="200" cy="200" r="160" stroke="rgba(217,114,54,0.25)" strokeWidth="1" strokeDasharray="30 14" /><rect x="395" y="195" width="10" height="10" fill="#ff9a5c" transform="translate(-44 0)" /></g>
    </svg>
    <Globe />
    <div className="lp-badge-box">
      <svg className="lp-badge" viewBox="0 0 100 100">
        <defs><path id="lpc" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
        <text><textPath href="#lpc">Web · Mobile · AI · Cloud · Design ·</textPath></text>
      </svg>
      <div className="lp-badge-core"><ArrowUpRight size={26} /></div>
    </div>
  </div>
);

/* ---------- service motion graphics (SMIL) ---------- */

const ServiceArt: React.FC<{ k: string }> = ({ k }) => {
  switch (k) {
    case 'web': return (
      <svg viewBox="0 0 200 140">
        <rect x="10" y="10" width="180" height="120" rx="10" className="lp-art-dim" />
        <line x1="10" y1="30" x2="190" y2="30" className="lp-art-dim" />
        {[22, 34, 46].map((x, i) => <circle key={x} cx={x} cy="20" r="3" className="lp-art-fill"><animate attributeName="opacity" values="1;0.2;1" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" /></circle>)}
        {[0, 1, 2].map((i) => <rect key={i} x="24" y={44 + i * 16} height="7" rx="3.5" className="lp-art-fill"><animate attributeName="width" values={`0;${110 - i * 24};${110 - i * 24};0`} keyTimes="0;0.4;0.8;1" dur="4s" begin={`${i * 0.35}s`} repeatCount="indefinite" /></rect>)}
        <rect x="24" y="96" width="60" height="26" rx="6" className="lp-art-fill-dim"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" /></rect>
        <rect x="132" y="44" width="46" height="78" rx="6" className="lp-art-stroke"><animate attributeName="stroke-dasharray" values="0 250;250 0" dur="3s" repeatCount="indefinite" /></rect>
        <path d="M0 0 L0 14 L4 10.5 L7 17 L9.5 16 L6.5 9.5 L11.5 9.5 Z" fill="#fff"><animateTransform attributeName="transform" type="translate" values="40 100;140 70;60 56;40 100" dur="5s" repeatCount="indefinite" /></path>
      </svg>);
    case 'mobile': return (
      <svg viewBox="0 0 200 140">
        <defs><clipPath id="lpph"><rect x="70" y="18" width="60" height="104" rx="8" /></clipPath></defs>
        <rect x="64" y="8" width="72" height="124" rx="14" className="lp-art-stroke" />
        <g clipPath="url(#lpph)"><g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -64;0 0" dur="6s" repeatCount="indefinite" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <g key={i}><rect x="76" y={26 + i * 22} width="14" height="14" rx="4" className="lp-art-fill" opacity={i % 2 ? 0.5 : 1} /><rect x="96" y={28 + i * 22} width="26" height="4" rx="2" fill="rgba(255,237,220,0.6)" /><rect x="96" y={35 + i * 22} width="16" height="3" rx="1.5" fill="rgba(255,237,220,0.25)" /></g>)}
        </g></g>
        <rect x="88" y="11" width="24" height="4" rx="2" className="lp-art-fill" />
        {[[30, 40], [165, 90], [28, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" className="lp-art-fill"><animate attributeName="cy" values={`${y};${y - 14};${y}`} dur={`${3 + i}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="1;0.2;1" dur={`${3 + i}s`} repeatCount="indefinite" /></circle>)}
      </svg>);
    case 'ai': {
      const L = [[30, 30], [30, 70], [30, 110]], M = [[100, 20], [100, 55], [100, 90], [100, 125]], O = [[170, 50], [170, 90]];
      return (
        <svg viewBox="0 0 200 140">
          {[...L.flatMap((a) => M.map((b) => [a, b])), ...M.flatMap((a) => O.map((b) => [a, b]))].map(([a, b], i) => (
            <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="lp-art-stroke" strokeWidth="1" strokeDasharray="4 8" opacity="0.7"><animate attributeName="stroke-dashoffset" values="0;-24" dur={`${1.2 + (i % 4) * 0.3}s`} repeatCount="indefinite" /></line>
          ))}
          {[...L, ...M, ...O].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" className="lp-art-fill"><animate attributeName="r" values="5;9;5" dur="2.4s" begin={`${(i % 5) * 0.25}s`} repeatCount="indefinite" /></circle>)}
        </svg>);
    }
    case 'cloud': return (
      <svg viewBox="0 0 200 140">
        <g transform="translate(78 70)"><circle r="34" fill="none" stroke="#d97236" strokeWidth="12" strokeDasharray="10.7 10.7"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" /></circle><circle r="26" className="lp-art-dim" /><circle r="6" className="lp-art-fill" /></g>
        <g transform="translate(142 98)"><circle r="22" fill="none" stroke="rgba(255,237,220,0.55)" strokeWidth="9" strokeDasharray="8.6 8.6"><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="9s" repeatCount="indefinite" /></circle><circle r="4" fill="#fff" /></g>
        <g transform="translate(150 34)"><circle r="12" className="lp-art-stroke"><animate attributeName="r" values="10;16;10" dur="3s" repeatCount="indefinite" /></circle><circle r="3" className="lp-art-fill" /></g>
      </svg>);
    case 'design': return (
      <svg viewBox="0 0 200 140">
        <rect x="55" y="25" width="90" height="90" className="lp-art-stroke" rx="0">
          <animate attributeName="rx" values="0;45;0" dur="5s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate" values="0 100 70;180 100 70;360 100 70" dur="10s" repeatCount="indefinite" />
        </rect>
        <rect x="75" y="45" width="50" height="50" className="lp-art-fill-dim" rx="25"><animate attributeName="rx" values="25;0;25" dur="5s" repeatCount="indefinite" /></rect>
        {[[55, 25], [145, 25], [145, 115], [55, 115]].map(([x, y], i) => <rect key={i} x={x - 4} y={y - 4} width="8" height="8" fill="#fff"><animate attributeName="opacity" values="1;0.3;1" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" /></rect>)}
        <circle cx="100" cy="70" r="5" className="lp-art-fill" />
      </svg>);
    default: return (
      <svg viewBox="0 0 200 140">
        <path d="M100 12 L160 36 V70 C160 100 134 120 100 130 C66 120 40 100 40 70 V36 Z" className="lp-art-stroke"><animate attributeName="stroke-dasharray" values="0 400;400 0" dur="3s" repeatCount="indefinite" /></path>
        <path d="M76 70 L94 88 L126 54" className="lp-art-stroke" strokeWidth="4"><animate attributeName="stroke-dasharray" values="0 100;100 0;100 0" keyTimes="0;0.5;1" dur="3s" repeatCount="indefinite" /></path>
        <rect x="44" y="30" width="112" height="3" fill="#ff9a5c" opacity="0.8"><animate attributeName="y" values="26;122;26" dur="3.5s" repeatCount="indefinite" /></rect>
      </svg>);
  }
};

const ProjectArt: React.FC<{ k: string }> = ({ k }) => (
  <svg className="lp-proj-art" viewBox="0 0 560 290" preserveAspectRatio="xMidYMid slice">
    {k === 'bars' && Array.from({ length: 14 }).map((_, i) => (
      <rect key={i} x={40 + i * 36} width="22" rx="5" fill="#d97236" opacity={0.35 + (i % 4) * 0.15}>
        <animate attributeName="height" values={`${40 + (i * 37) % 120};${60 + (i * 53) % 140};${40 + (i * 37) % 120}`} dur={`${2 + (i % 5) * 0.4}s`} repeatCount="indefinite" />
        <animate attributeName="y" values={`${230 - (40 + (i * 37) % 120)};${230 - (60 + (i * 53) % 140)};${230 - (40 + (i * 37) % 120)}`} dur={`${2 + (i % 5) * 0.4}s`} repeatCount="indefinite" />
      </rect>))}
    {k === 'pulse' && <>
      <path d="M0 150 H170 L195 90 L225 210 L250 120 L270 150 H560" fill="none" stroke="#ff9a5c" strokeWidth="3" strokeLinecap="round" strokeDasharray="700" ><animate attributeName="stroke-dashoffset" values="700;0;-700" dur="4s" repeatCount="indefinite" /></path>
      {[60, 110, 160].map((r, i) => <circle key={r} cx="440" cy="150" r={r} fill="none" stroke="#d97236" opacity="0.3"><animate attributeName="r" values={`${r - 30};${r + 50}`} dur="3s" begin={`${i}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="0.6;0" dur="3s" begin={`${i}s`} repeatCount="indefinite" /></circle>)}
    </>}
    {k === 'dots' && Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={40 + (i % 12) * 44} cy={40 + Math.floor(i / 12) * 48} r="4" fill="#d97236"><animate attributeName="r" values="2;9;2" dur="3s" begin={`${((i % 12) + Math.floor(i / 12)) * 0.18}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin={`${((i % 12) + Math.floor(i / 12)) * 0.18}s`} repeatCount="indefinite" /></circle>))}
    {k === 'wave' && [0, 1, 2, 3, 4].map((i) => (
      <path key={i} fill="none" stroke={i === 2 ? '#ff9a5c' : '#d97236'} strokeWidth="2" opacity={1 - i * 0.15}>
        <animate attributeName="d" dur={`${5 + i}s`} repeatCount="indefinite" values={`M0 ${120 + i * 14} Q 140 ${40 + i * 14} 280 ${120 + i * 14} T 560 ${120 + i * 14};M0 ${120 + i * 14} Q 140 ${200 + i * 14} 280 ${120 + i * 14} T 560 ${120 + i * 14};M0 ${120 + i * 14} Q 140 ${40 + i * 14} 280 ${120 + i * 14} T 560 ${120 + i * 14}`} />
      </path>))}
  </svg>
);

/* ---------- page ---------- */

export const LandingPage: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setFormError('');
    try { await submitInquiryApi(form); setSent(true); setForm({ name: '', email: '', message: '' }); }
    catch { setFormError('Something went wrong. Please try again or email us directly.'); }
    finally { setSending(false); }
  };
  const [ti, setTi] = useState(0);

  const onLoaded = React.useCallback(() => { setReady(true); setTimeout(() => setLoading(false), 1100); }, []);

  // testimonial autoplay
  useEffect(() => {
    const id = setInterval(() => setTi((x) => (x + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, [ti]);

  // reveal on scroll
  useEffect(() => {
    const els = root.current!.querySelectorAll<HTMLElement>('.lp-reveal, .lp-mask, .lp-mega');
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // one rAF loop: cursor, progress, nav, skew, pinned/scrubbed scroll effects
  useEffect(() => {
    const r = root.current!;
    const $ = <T extends HTMLElement>(s: string) => Array.from(r.querySelectorAll<T>(s));
    const bar = r.querySelector<HTMLElement>('.lp-progress')!;
    const nav = r.querySelector<HTMLElement>('.lp-nav')!;
    const dot = r.querySelector<HTMLElement>('.lp-dot')!;
    const ring = r.querySelector<HTMLElement>('.lp-ring')!;
    const skews = $('[data-skew]');
    const words = $('[data-words]');
    const hs = r.querySelector<HTMLElement>('[data-hs]');
    const hsTrack = r.querySelector<HTMLElement>('[data-hs-track]');
    const cards = $('[data-card]');
    const proc = r.querySelector<HTMLElement>('[data-proc]');
    const draw = r.querySelector<SVGPathElement>('[data-draw]');
    const head = r.querySelector<SVGCircleElement>('[data-head]');
    const steps = $('[data-step]');
    const pars = $('[data-par]');

    const mouse = { x: innerWidth / 2, y: innerHeight / 2 }, rp = { x: mouse.x, y: mouse.y };
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onOver = (e: MouseEvent) => { ring.classList.toggle('hot', !!(e.target as HTMLElement).closest('a, button, [data-hot]')); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);

    let last = scrollY, vel = 0, raf = 0;
    const tick = () => {
      const y = scrollY, vh = innerHeight;
      vel += ((y - last) - vel) * 0.12; last = y;
      const max = document.documentElement.scrollHeight - vh;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      nav.style.transform = vel > 1 && y > 300 ? 'translateY(-130%)' : vel < -1 || y <= 300 ? 'translateY(0)' : nav.style.transform;

      rp.x += (mouse.x - rp.x) * 0.16; rp.y += (mouse.y - rp.y) * 0.16;
      dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      ring.style.transform = `translate(${rp.x}px, ${rp.y}px)`;

      const sk = clamp(vel * -0.35, -10, 10);
      skews.forEach((el) => { el.style.transform = `skewX(${sk}deg)`; });

      pars.forEach((el) => {
        const b = el.getBoundingClientRect();
        el.style.transform = `translateY(${(b.top + b.height / 2 - vh / 2) * -Number(el.dataset.par)}px)`;
      });

      words.forEach((el) => {
        const b = el.getBoundingClientRect();
        const p = clamp((vh * 0.9 - b.top) / (vh * 0.55 + b.height * 0.6));
        const ws = el.querySelectorAll<HTMLElement>('.w');
        ws.forEach((w, i) => { w.style.opacity = String(0.14 + 0.86 * clamp(p * (ws.length + 3) - i)); });
      });

      if (hs && hsTrack) {
        const b = hs.getBoundingClientRect();
        const p = clamp(-b.top / (b.height - vh));
        hsTrack.style.transform = `translateX(${-p * Math.max(hsTrack.scrollWidth - innerWidth, 0)}px)`;
        hs.style.setProperty('--hp', String(p));
      }

      cards.forEach((c, i) => {
        const nxt = cards[i + 1];
        if (!nxt) return;
        const top = parseFloat(c.dataset.top || '0');
        const h = c.offsetHeight;
        const d = clamp(1 - (nxt.getBoundingClientRect().top - top - 24) / (h + 10));
        c.style.transform = `scale(${1 - d * 0.07})`;
        c.style.filter = `brightness(${1 - d * 0.5})`;
      });

      if (proc && draw && head) {
        const b = proc.getBoundingClientRect();
        const p = clamp((vh * 0.75 - b.top) / (b.height * 0.9));
        const len = draw.getTotalLength();
        draw.style.strokeDasharray = `${len}`;
        draw.style.strokeDashoffset = `${len * (1 - p)}`;
        const pt = draw.getPointAtLength(len * p);
        head.setAttribute('cx', String(pt.x)); head.setAttribute('cy', String(pt.y));
        steps.forEach((s, i) => s.classList.toggle('on', p > i / steps.length + 0.02));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseover', onOver); };
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  const magnet = (e: React.MouseEvent<HTMLElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.25}px, ${(e.clientY - b.top - b.height / 2) * 0.35}px)`;
  };
  const unmagnet = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = ''; };

  const big = ['Web', 'Mobile', 'AI', 'Cloud', 'Design', 'Security'];
  const bigRow = [...big, ...big];
  const pill = [...STACK, ...STACK];
  const half = Math.ceil(STACK.length / 2);

  return (
    <div className={`lp ${ready ? 'ready' : ''} ${loading ? 'is-loading' : ''}`} ref={root}>
      <Loader onDone={onLoaded} />
      <div className="lp-progress" /><div className="lp-dot" /><div className="lp-ring" />

      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Brand onClick={go('top')} />
          <nav className="lp-links">
            <a href="#services" onClick={go('services')}>Services</a>
            <a href="#work" onClick={go('work')}>Work</a>
            <a href="#process" onClick={go('process')}>Process</a>
            <a href="#clients" onClick={go('clients')}>Clients</a>
          </nav>
          <a href="#contact" onClick={go('contact')} className="lp-btn lp-btn-primary lp-btn-sm" onMouseMove={magnet} onMouseLeave={unmagnet}>Start a project <ArrowRight size={16} /></a>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero" id="top">
        <FlowField />
        <div className="lp-wrap">
          <div className="lp-hero-grid">
            <div>
              <div className="lp-pill"><span className="lp-live" />Booking projects for Q4</div>
              <h1 className="lp-h1">
                <Letters text="We build" start={0} />
                <Letters text="software" start={8} className="lp-outline" />
                <span className="lp-line"><span className="lp-serif">{'that moves.'.split('').map((c, i) => <span key={i} className="lp-ch" style={{ ['--i' as string]: 17 + i }}>{c === ' ' ? ' ' : c}</span>)}</span></span>
              </h1>
              <p className="lp-lead">JD Tensor crafts high-performance web, mobile and AI products. Strategy, design and engineering under one roof, shipped fast and built to last.</p>
              <div className="lp-cta-row">
                <a href="#contact" onClick={go('contact')} className="lp-btn lp-btn-primary" onMouseMove={magnet} onMouseLeave={unmagnet}>Book a free consultation <ArrowRight size={18} /></a>
                <a href="#work" onClick={go('work')} className="lp-btn lp-btn-ghost" onMouseMove={magnet} onMouseLeave={unmagnet}>View our work</a>
              </div>
              <div className="lp-hero-meta"><div><b>120+</b>Projects shipped</div><div><b>45+</b>Global clients</div><div><b>8 yrs</b>Of craft</div></div>
            </div>
            <OrbitVisual />
          </div>
        </div>
        <div className="lp-scroll-hint">Scroll<i /></div>
      </section>

      {/* STATEMENT */}
      <section className="lp-section">
        <div className="lp-wrap">
          <span className="lp-eyebrow">About us</span>
          <p className="lp-statement" data-words>
            {STATEMENT.split(' ').map((w, i) => <React.Fragment key={i}><span className={`w ${HL.has(w) ? 'hl' : ''}`}>{w}</span>{' '}</React.Fragment>)}
          </p>
        </div>
      </section>

      {/* BIG MARQUEE */}
      <div style={{ overflow: 'hidden' }}>
        <div className="lp-bigmq" data-skew><div className="lp-bigrow">{bigRow.map((t, i) => <span key={i}>{t}</span>)}</div></div>
        <div className="lp-bigmq" data-skew><div className="lp-bigrow rev">{bigRow.map((t, i) => <span key={i}>{t}</span>)}</div></div>
      </div>

      {/* STATS */}
      <section className="lp-section" style={{ paddingBottom: 0 }}>
        <div className="lp-wrap lp-stats">
          {STATS.map((s, i) => <div className="lp-stat lp-reveal" key={s.l} style={{ ['--d' as string]: `${i * 0.1}s` }}><Counter to={s.to} suffix={s.s} /><span>{s.l}</span></div>)}
        </div>
      </section>

      {/* SERVICES */}
      <section className="lp-section" id="services">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="lp-eyebrow">What we do</span>
            <h2 className="lp-h2"><span className="lp-mask"><span>Everything you need to</span></span><span className="lp-mask"><span style={{ ['--d' as string]: '0.12s' } as React.CSSProperties}><span className="lp-serif">build &amp; scale</span> software</span></span></h2>
          </div>
          <div className="lp-stackwrap">
            {SERVICES.map((s, i) => (
              <article className="lp-svc" key={s.k} data-card data-top={110 + i * 22} data-n={`0${i + 1}`} style={{ ['--top' as string]: `${110 + i * 22}px` }}>
                <div><h3>{s.title}</h3><p>{s.text}</p><div className="lp-tags">{s.tags.map((t) => <span key={t}>{t}</span>)}</div></div>
                <div className="lp-svc-art"><ServiceArt k={s.k} /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WORK (horizontal scroll) */}
      <section className="lp-hs" id="work" data-hs>
        <div className="lp-hs-pin">
          <div className="lp-wrap lp-hs-head">
            <div>
              <span className="lp-eyebrow">Selected work</span>
              <h2 className="lp-h2">Products people <span className="lp-serif">love to use</span></h2>
            </div>
            <div className="lp-hs-bar"><i /></div>
          </div>
          <div className="lp-hs-track" data-hs-track>
            {PROJECTS.map((p, i) => (
              <article className="lp-proj" key={p.title} data-hot>
                <div className="lp-proj-bg" style={{ ['--gx' as string]: p.gx, ['--ga' as string]: 0.35 + i * 0.08 }} />
                <ProjectArt k={p.art} />
                <span className="idx">0{i + 1} / 0{PROJECTS.length}</span>
                <div className="go"><ArrowUpRight size={20} /></div>
                <small>{p.cat}</small><h3>{p.title}</h3><p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="lp-section" id="process">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="lp-eyebrow">How we work</span>
            <h2 className="lp-h2"><span className="lp-mask"><span>A process that removes</span></span><span className="lp-mask"><span style={{ ['--d' as string]: '0.12s' } as React.CSSProperties}>the <span className="lp-serif">chaos.</span></span></span></h2>
          </div>
          <div className="lp-proc" data-proc>
            <svg className="lp-proc-svg" viewBox="0 0 1200 150" preserveAspectRatio="none">
              <path className="base" d="M0 75 C 150 -10, 300 160, 450 75 S 750 -10, 900 75 S 1100 140 1200 75" />
              <path className="draw" data-draw d="M0 75 C 150 -10, 300 160, 450 75 S 750 -10, 900 75 S 1100 140 1200 75" />
              <circle className="head" data-head r="9" cx="0" cy="75" />
            </svg>
            <div className="lp-steps">
              {STEPS.map((s, i) => <div className="lp-step" data-step key={s.t}><div className="num">0{i + 1}</div><h3>{s.t}</h3><p>{s.d}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section style={{ padding: '30px 0 110px' }}>
        <div className="lp-wrap lp-head lp-reveal" style={{ marginBottom: 44 }}>
          <span className="lp-eyebrow">Our toolbox</span>
          <h2 className="lp-h2">Modern tech, <span className="lp-serif">chosen deliberately</span></h2>
        </div>
        <div className="lp-pills">
          <div className="lp-pillrow">{[...STACK.slice(0, half), ...STACK.slice(0, half)].map((s, i) => <span key={i}>{s}</span>)}</div>
          <div className="lp-pillrow rev">{[...STACK.slice(half), ...STACK.slice(half), ...pill.slice(0, 0)].map((s, i) => <span key={i}>{s}</span>)}</div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-section" id="clients">
        <div className="lp-wrap">
          <span className="lp-eyebrow">Client love</span>
          <div className="lp-tcar">
            <div className="lp-tq" key={ti}>
              <blockquote>{TESTIMONIALS[ti].q}</blockquote>
              <div className="lp-tq-who"><i>{TESTIMONIALS[ti].n.charAt(0)}</i><div><b>{TESTIMONIALS[ti].n}</b><span>{TESTIMONIALS[ti].r}</span></div></div>
            </div>
          </div>
          <div className="lp-tdots">{TESTIMONIALS.map((t, i) => <button key={t.n} aria-label={t.n} className={i === ti ? 'on' : i < ti ? 'past' : ''} onClick={() => setTi(i)}><i /></button>)}</div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="lp-section" id="contact" style={{ paddingTop: 20 }}>
        <div className="lp-wrap">
          <div className="lp-cta lp-reveal">
            <i className="lp-blob" /><i className="lp-blob two" />
            <div>
              <span className="lp-eyebrow">Let’s talk</span>
              <h2 className="lp-h2">Have an idea? Let’s build it <span className="lp-serif">together.</span></h2>
              <ul>{['Free 30-minute strategy call', 'Transparent, fixed-scope pricing', 'NDA signed before we talk details'].map((x) => <li key={x}><CheckCircle2 size={18} />{x}</li>)}</ul>
            </div>
            <form className="lp-form" onSubmit={submit}>
              <input className="lp-field" required maxLength={200} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="lp-field" required type="email" maxLength={320} placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea className="lp-field" required rows={4} maxLength={5000} placeholder="Tell us about your project…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {formError && <div className="lp-ok" style={{ color: '#ff9a5c' }}>{formError}</div>}
              {sent ? <div className="lp-ok">Thanks! We got your message and will be in touch shortly.</div>
                : <button type="submit" disabled={sending} className="lp-btn lp-btn-primary" onMouseMove={magnet} onMouseLeave={unmagnet}>{sending ? 'Sending…' : 'Send message'} <ArrowRight size={18} /></button>}
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-foot-grid">
            <div><Brand onClick={go('top')} /><p style={{ color: 'var(--muted)', marginTop: 18, lineHeight: 1.7, maxWidth: 320, fontSize: 15 }}>A software development agency building fast, beautiful and scalable digital products.</p></div>
            <div><h4>Services</h4><ul><li><a href="#services" onClick={go('services')}>Web Apps</a></li><li><a href="#services" onClick={go('services')}>Mobile Apps</a></li><li><a href="#services" onClick={go('services')}>AI &amp; Automation</a></li><li><a href="#services" onClick={go('services')}>Cloud &amp; DevOps</a></li></ul></div>
            <div><h4>Company</h4><ul><li><a href="#work" onClick={go('work')}>Work</a></li><li><a href="#process" onClick={go('process')}>Process</a></li><li><a href="#clients" onClick={go('clients')}>Clients</a></li><li><a href="#contact" onClick={go('contact')}>Contact</a></li></ul></div>
            <div><h4>Team</h4><ul><li><Link to="/admin">Admin Portal</Link></li></ul></div>
          </div>
        </div>
        <div className="lp-mega" aria-hidden>{'JD TENSOR'.split('').map((c, i) => <span key={i} style={{ ['--i' as string]: i }}>{c === ' ' ? ' ' : c}</span>)}</div>
        <div className="lp-wrap"><div className="lp-copy"><span>© {new Date().getFullYear()} JD Tensor. All rights reserved.</span><span>Crafted with code &amp; caffeine.</span></div></div>
      </footer>
    </div>
  );
};

export default LandingPage;
