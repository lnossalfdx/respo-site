"use client";

import { motion } from "framer-motion";
import { MessageCircle, Brain, Zap, Database, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const nodes = [
  { id: "equipe",    icon: Users,          label: "Equipe Comercial", color: "#EC4899" }, // top
  { id: "whatsapp",  icon: MessageCircle,  label: "WhatsApp",         color: "#25D366" }, // right
  { id: "automacao", icon: Zap,            label: "Automação",        color: "#F59E0B" }, // bottom
  { id: "crm",       icon: Database,       label: "CRM",              color: "#3B82F6" }, // left
];

const ORBIT_R = 200; // px from center to node center
const CENTER  = 300; // half of SVG/container size

export function Ecosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgSize, setSvgSize] = useState(600);

  useEffect(() => {
    const observe = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setSvgSize(Math.min(w, 600));
      }
    };
    observe();
    const ro = new ResizeObserver(observe);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = svgSize / 600;
  const cx = CENTER * scale;
  const cy = CENTER * scale;
  const r  = ORBIT_R * scale;

  return (
    <section id="ecossistema" className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-brand-green uppercase tracking-widest box-glow mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            Integração Total
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-glow tracking-tight mb-6">
            ECOSSISTEMA INTEGRADO
          </h2>
          <p className="text-white/60 text-lg md:text-xl font-light max-w-2xl">
            A Responsyva une todas as suas plataformas em uma única inteligência comercial.
          </p>
        </motion.div>

        {/* Diagram */}
        <div ref={containerRef} className="relative w-full max-w-[600px] mx-auto">
          <svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="overflow-visible"
          >
            <defs>
              {/* Radial glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Particle trail gradient per node */}
              {nodes.map((n, i) => {
                const angle = (i * 90 - 90) * (Math.PI / 180);
                const nx = cx + Math.cos(angle) * r;
                const ny = cy + Math.sin(angle) * r;
                return (
                  <linearGradient
                    key={n.id}
                    id={`lg-${n.id}`}
                    x1={nx} y1={ny}
                    x2={cx} y2={cy}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={n.color} stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#00ff88" stopOpacity="0.6" />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Orbit ring */}
            <circle cx={cx} cy={cy} r={r}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
            <circle cx={cx} cy={cy} r={r * 0.65}
              fill="none"
              stroke="rgba(0,255,136,0.04)"
              strokeWidth="1"
            />

            {/* Connection lines & data packets */}
            {nodes.map((n, i) => {
              const angle = (i * 90 - 90) * (Math.PI / 180);
              const nx = cx + Math.cos(angle) * r;
              const ny = cy + Math.sin(angle) * r;
              const dur = (1.8 + i * 0.35).toFixed(2);
              const delay = (i * 0.5).toFixed(2);

              return (
                <g key={n.id}>
                  {/* Static glow line */}
                  <line
                    x1={nx} y1={ny} x2={cx} y2={cy}
                    stroke={`url(#lg-${n.id})`}
                    strokeWidth="1.5"
                  />

                  {/* Laser streak — animates FROM node TO center */}
                  <circle r="3" fill={n.color} filter="url(#glow)">
                    <animateMotion
                      dur={`${dur}s`}
                      repeatCount="indefinite"
                      begin={`${delay}s`}
                    >
                      <mpath href={`#path-${n.id}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0;1;0" dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`} />
                  </circle>

                  {/* Invisible motion path (node → center) */}
                  <path
                    id={`path-${n.id}`}
                    d={`M ${nx} ${ny} L ${cx} ${cy}`}
                    fill="none"
                    stroke="none"
                  />
                </g>
              );
            })}

            {/* Satellite nodes — rendered in SVG using foreignObject for icon */}
            {nodes.map((n, i) => {
              const angle = (i * 90 - 90) * (Math.PI / 180);
              const nx = cx + Math.cos(angle) * r;
              const ny = cy + Math.sin(angle) * r;
              const nodeSize = 68 * scale;
              const labelY = ny + nodeSize / 2 + 18 * scale;

              return (
                <g key={n.id}>
                  {/* Pulse ring */}
                  <circle cx={nx} cy={ny} r={nodeSize / 2 + 4}>
                    <animate attributeName="r" values={`${nodeSize / 2 + 2};${nodeSize / 2 + 14};${nodeSize / 2 + 2}`} dur="2.5s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
                    <animate attributeName="stroke" values={n.color} dur="0s" />
                    <set attributeName="fill" to="none" />
                    <set attributeName="stroke" to={n.color} />
                    <set attributeName="strokeWidth" to="1" />
                  </circle>
                  {/* Node circle */}
                  <circle
                    cx={nx} cy={ny}
                    r={nodeSize / 2}
                    fill="#0d0d0d"
                    stroke={n.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                  <circle
                    cx={nx} cy={ny}
                    r={nodeSize / 2 - 8}
                    fill={n.color}
                    fillOpacity="0.06"
                  />
                  {/* Label */}
                  <text
                    x={nx} y={labelY}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.85)"
                    fontSize={12 * scale}
                    fontFamily="system-ui, sans-serif"
                    fontWeight="600"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}

            {/* Floating icons inside nodes via foreignObject */}
            {nodes.map((n, i) => {
              const angle = (i * 90 - 90) * (Math.PI / 180);
              const nx = cx + Math.cos(angle) * r;
              const ny = cy + Math.sin(angle) * r;
              const iconSize = 28 * scale;
              return (
                <foreignObject
                  key={`fo-${n.id}`}
                  x={nx - iconSize / 2}
                  y={ny - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                  style={{ overflow: "visible", pointerEvents: "none" }}
                >
                  <n.icon
                    style={{
                      width: iconSize,
                      height: iconSize,
                      color: n.color,
                      filter: `drop-shadow(0 0 6px ${n.color})`,
                    }}
                  />
                </foreignObject>
              );
            })}

            {/* Center node */}
            <circle cx={cx} cy={cy} r={62 * scale} fill="#05140b" stroke="#00ff88" strokeWidth="1.5" strokeOpacity="0.6" />
            <circle cx={cx} cy={cy} r={52 * scale} fill="#00ff88" fillOpacity="0.04" />
            {/* Rotating tech border */}
            <circle cx={cx} cy={cy} r={74 * scale}
              fill="none" stroke="#00ff88" strokeWidth="1" strokeOpacity="0.25"
              strokeDasharray={`${8 * scale} ${6 * scale}`}
            >
              <animateTransform
                attributeName="transform" type="rotate"
                from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
                dur="18s" repeatCount="indefinite"
              />
            </circle>

            <foreignObject
              x={cx - 24 * scale}
              y={cy - 32 * scale}
              width={48 * scale}
              height={48 * scale}
            >
              <Brain
                style={{
                  width: 48 * scale,
                  height: 48 * scale,
                  color: "#00ff88",
                  filter: "drop-shadow(0 0 10px #00ff88)",
                }}
              />
            </foreignObject>
            <text
              x={cx} y={cy + 34 * scale}
              textAnchor="middle"
              fill="#00ff88"
              fontSize={13 * scale}
              fontFamily="system-ui, sans-serif"
              fontWeight="700"
              style={{ textShadow: "0 0 10px #00ff88" }}
            >
              IA Responsyva
            </text>
          </svg>
        </div>

      </div>
    </section>
  );
}
