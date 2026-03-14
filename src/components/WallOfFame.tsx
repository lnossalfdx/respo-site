"use client";

import Script from "next/script";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upload, Users, Loader2, AlertCircle } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

interface PhotoEntry {
  name: string;
  imageSrc: string;
}

interface PhotoApiRecord {
  id: string;
  name: string;
  image_path: string;
  image_url: string;
  created_at: string;
}

interface MatterBody {
  position: { x: number; y: number };
  render?: {
    sprite?: {
      texture?: string;
      xScale?: number;
      yScale?: number;
    };
    visible?: boolean;
  };
  _userData?: { name: string; dataUrl: string };
}

interface MatterComposite {
  add: (world: unknown, body: unknown | unknown[]) => void;
  remove: (world: unknown, body: unknown) => void;
}

interface MatterNamespace {
  Engine: {
    create: (options: { gravity: { y: number } }) => { world: unknown };
  };
  Render: {
    create: (options: {
      canvas: HTMLCanvasElement;
      engine: { world: unknown };
      options: { width: number; height: number; background: string; wireframes: boolean };
    }) => { canvas: HTMLCanvasElement; options: { width: number; height: number } };
    run: (render: { canvas: HTMLCanvasElement }) => void;
    stop: (render: { canvas: HTMLCanvasElement }) => void;
  };
  Runner: {
    create: () => unknown;
    run: (runner: unknown, engine: { world: unknown }) => void;
    stop: (runner: unknown) => void;
  };
  Bodies: {
    rectangle: (
      x: number,
      y: number,
      width: number,
      height: number,
      options: Record<string, unknown>
    ) => MatterBody;
  };
  Composite: MatterComposite;
  Events: {
    on: (target: unknown, eventName: string, callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Matter?: MatterNamespace;
  }
}

const MAX_PHOTOS = 500;
const ITEM_SIZE = 44;

export function WallOfFame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<{ world: unknown } | null>(null);
  const runnerRef = useRef<unknown>(null);
  const renderRef = useRef<{ canvas: HTMLCanvasElement } | null>(null);
  const bodiesRef = useRef<MatterBody[]>([]);
  const tooltipRef = useRef<{ x: number; y: number; name: string } | null>(null);
  const matterReadyRef = useRef(false);
  const lastOverlayRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [matterLoaded, setMatterLoaded] = useState(false);

  // Resize image to the sprite size while preserving a square crop.
  const resizeImage = (src: string, size: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;

        const cx = c.getContext("2d");
        if (!cx) {
          console.error("[WallOfFame] Failed to get 2D context for image resize.", { src });
          reject(new Error("Failed to create resize canvas."));
          return;
        }

        const minS = Math.min(img.width, img.height);
        const sx = (img.width - minS) / 2;
        const sy = (img.height - minS) / 2;

        cx.drawImage(img, sx, sy, minS, minS, 0, 0, size, size);

        try {
          resolve(c.toDataURL("image/webp", 0.8));
        } catch (error) {
          console.error("[WallOfFame] Failed to export resized image from canvas.", {
            src,
            error,
          });
          reject(error instanceof Error ? error : new Error("Canvas export failed."));
        }
      };

      img.onerror = (event) => {
        console.error("[WallOfFame] Failed to load image for canvas processing.", {
          src,
          event,
        });
        reject(new Error("Image load failed."));
      };

      img.crossOrigin = "anonymous";
      img.src = src;
    });
  };

  const initPhysics = useCallback(() => {
    if (!canvasRef.current || !matterReadyRef.current || engineRef.current) return;
    const M = window.Matter;
    if (!M) return;
    const { Engine, Render, Runner, Bodies, Composite, Events } = M;

    const W = canvasRef.current.width;
    const H = canvasRef.current.height;

    const engine = Engine.create({ gravity: { y: 1.2 } });
    engineRef.current = engine;

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: {
        width: W,
        height: H,
        background: "transparent",
        wireframes: false,
      },
    });
    renderRef.current = render;

    // Walls and floor
    const wallOpts = { isStatic: true, render: { visible: false }, friction: 0.8 };
    const floor = Bodies.rectangle(W / 2, H + 25, W + 10, 50, wallOpts);
    const wallL = Bodies.rectangle(-25, H / 2, 50, H * 2, wallOpts);
    const wallR = Bodies.rectangle(W + 25, H / 2, 50, H * 2, wallOpts);
    Composite.add(engine.world, [floor, wallL, wallR]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;
    Render.run(render);

    // Mouse hover tooltip
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = W;
    overlayCanvas.height = H;
    overlayCanvas.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;z-index:10;width:${W}px;height:${H}px;`;
    canvasRef.current.parentElement?.appendChild(overlayCanvas);
    lastOverlayRef.current = overlayCanvas;

    Events.on(render, "afterRender", () => {
      const oc = overlayCanvas.getContext("2d")!;
      oc.clearRect(0, 0, W, H);
      if (tooltipRef.current) {
        const { x, y, name } = tooltipRef.current;
        const padding = 8;
        oc.font = "bold 12px system-ui, sans-serif";
        const tw = oc.measureText(name).width;
        const bx = Math.min(x - tw / 2 - padding, W - tw - padding * 2 - 2);
        const by = Math.max(y - ITEM_SIZE / 2 - 32, 4);

        oc.fillStyle = "rgba(0,0,0,0.85)";
        oc.fillRect(bx, by, tw + padding * 2, 26);

        oc.fillStyle = "#00ff88";
        oc.fillText(name, bx + padding, by + 17);
      }
    });
  }, []);

  const addPhoto = useCallback(async (entry: PhotoEntry) => {
    if (!engineRef.current) return;
    const M = window.Matter;
    if (!M) return;
    const { Bodies, Composite } = M;

    let resized: string;
    try {
      resized = await resizeImage(entry.imageSrc, ITEM_SIZE);
    } catch (error) {
      console.error("[WallOfFame] Failed to prepare image sprite.", {
        name: entry.name,
        imageSrc: entry.imageSrc,
        error,
      });
      return;
    }

    const W = canvasRef.current!.width;
    const x = ITEM_SIZE + Math.random() * (W - ITEM_SIZE * 2);
    const y = -ITEM_SIZE;

    const body = Bodies.rectangle(x, y, ITEM_SIZE, ITEM_SIZE, {
      restitution: 0.25,
      friction: 0.6,
      frictionAir: 0.01,
      angle: (Math.random() - 0.5) * 0.8,
      render: {
        sprite: {
          texture: resized,
          xScale: 1,
          yScale: 1,
        },
      },
    });

    body._userData = { name: entry.name, dataUrl: resized };
    bodiesRef.current.push(body);
    Composite.add(engineRef.current.world, body);

    // Keep under limit
    if (bodiesRef.current.length > MAX_PHOTOS) {
      const old = bodiesRef.current.shift();
      Composite.remove(engineRef.current.world, old);
    }

    setCount((c) => Math.min(c + 1, MAX_PHOTOS));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Apenas imagens são permitidas.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Tamanho máximo: 5MB.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  // Load persisted photos from server on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const res = await fetch("/api/photos");
        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
          photos?: PhotoApiRecord[];
        };

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Falha ao carregar fotos.");
        }

        const savedPhotos = data.photos ?? [];

        if (savedPhotos.length) {
          // Wait until Matter is ready then drop them all in
          const waitForMatter = setInterval(() => {
            if (matterReadyRef.current && canvasRef.current) {
              clearInterval(waitForMatter);
              initPhysics();
              // Stagger drops so they don't all land at once
              savedPhotos.forEach((p, i: number) => {
                setTimeout(() => {
                  addPhoto({ name: p.name, imageSrc: p.image_url });
                }, i * 120);
              });
            }
          }, 200);
        }
      } catch (err) {
        // Silently fail — photos just won't be pre-loaded
        console.warn("[WallOfFame] Could not load photos from API", err);
      }
    };
    loadSaved();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      const M = window.Matter;
      if (M && runnerRef.current && engineRef.current) {
        M.Runner.stop(runnerRef.current);
      }
      if (M && renderRef.current) {
        M.Render.stop(renderRef.current);
      }
      engineRef.current = null;
      runnerRef.current = null;
      renderRef.current = null;
      bodiesRef.current = [];
      lastOverlayRef.current?.remove();
      lastOverlayRef.current = null;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Digite seu nome."); return; }
    if (!file) { setError("Selecione uma imagem."); return; }
    if (!matterLoaded) { setError("Aguarde o carregamento do motor de física."); return; }

    setLoading(true);
    setError(null);

    if (!engineRef.current) initPhysics();

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", file);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        photo?: PhotoApiRecord;
      };

      if (!res.ok || !data.success || !data.photo) {
        setError(data.error || "Erro ao salvar. Tente novamente.");
        setLoading(false);
        return;
      }

      await addPhoto({ name: data.photo.name, imageSrc: data.photo.image_url });
    } catch (err) {
      console.error("[WallOfFame] Upload failed", err);
      setError("Nao foi possivel enviar sua foto agora. Tente novamente.");
    }

    setName("");
    setFile(null);
    setPreview(null);
    setLoading(false);
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!engineRef.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const bodies = bodiesRef.current;
    for (const b of bodies) {
      const { x, y } = b.position;
      const half = ITEM_SIZE / 2;
      if (mx >= x - half && mx <= x + half && my >= y - half && my <= y + half) {
        tooltipRef.current = { x, y, name: b._userData?.name ?? "" };
        return;
      }
    }
    tooltipRef.current = null;
  }, []);

  const onMatterLoaded = useCallback(() => {
    matterReadyRef.current = true;
    setMatterLoaded(true);
    initPhysics();
  }, [initPhysics]);

  return (
    <>
      <Script
        src="/vendor/matter.min.js"
        strategy="lazyOnload"
        onLoad={onMatterLoaded}
      />

      <section className="relative py-24 px-6 overflow-hidden">
        {/* Decorative ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 relative z-10">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/30 text-xs font-medium text-brand-green uppercase tracking-widest mb-6 bg-brand-green/5">
              <Users className="w-4 h-4" />
              Comunidade
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-glow tracking-tight mb-4">
              DEIXE SUA MARCA
            </h2>
            <p className="text-white/60 text-lg font-light">
              Quem constrói o futuro com IA passa por aqui.
              <span className="ml-2 text-brand-green/70 font-medium">{count} marcas deixadas</span>
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="w-full max-w-lg flex flex-col gap-4"
          >
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-green/50 focus:bg-white/8 transition-all"
            />

            <label className="relative cursor-pointer group">
              <div className={`w-full px-5 py-3.5 rounded-xl border border-dashed text-sm transition-all flex items-center gap-3 ${
                preview
                  ? "border-brand-green/50 bg-brand-green/5 text-brand-green"
                  : "border-white/10 bg-white/5 text-white/40 group-hover:border-white/20"
              }`}>
                {preview ? (
                  <>
                    <Image src={preview} alt="" width={32} height={32} className="w-8 h-8 rounded-lg object-cover" unoptimized />
                    <span className="text-white/70 text-xs truncate">{file?.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 shrink-0" />
                    Clique para enviar uma foto (máx. 5MB)
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </label>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !matterLoaded}
              className="group w-full px-8 py-4 bg-brand-green text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,255,136,0.3)] relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Deixar minha marca</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </>
              )}
            </button>
          </motion.form>

          {/* Physics Canvas Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            {/* Outer glow halo */}
            <div className="absolute left-1/2 -translate-x-1/2 w-3/4 h-8 bg-brand-green/20 blur-2xl rounded-full pointer-events-none" />

            <div
              ref={containerRef}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => { tooltipRef.current = null; }}
              className="relative w-full overflow-hidden"
              style={{
                height: 460,
                borderRadius: 24,
                background: "linear-gradient(180deg, rgba(0,18,9,0.95) 0%, rgba(0,8,4,0.98) 100%)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(0,255,136,0.18)",
                boxShadow: "0 0 0 1px rgba(0,255,136,0.04), 0 0 80px rgba(0,255,136,0.08), inset 0 0 120px rgba(0,0,0,0.6)",
              }}
            >
              {/* Top shine line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-green/50 to-transparent" />
              {/* Bottom ground line */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent" />

              {/* Corner decorations — top left */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-brand-green/50 rounded-tl-md" />
              {/* Corner — top right */}
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-brand-green/50 rounded-tr-md" />
              {/* Corner — bottom left */}
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-brand-green/50 rounded-bl-md" />
              {/* Corner — bottom right */}
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-brand-green/50 rounded-br-md" />

              {/* Subtle grid lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: "linear-gradient(rgba(0,255,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,1) 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />

              {/* Scanline overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.015]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.5) 2px, rgba(0,255,136,0.5) 3px)",
                }}
              />

              {/* Top status bar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 pointer-events-none">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 text-[10px] font-mono text-brand-green/70 tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  SIMULATION ACTIVE · {count} ENTRIES
                </div>
              </div>

              {/* Ambient green glow from the floor */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-green/[0.06] to-transparent pointer-events-none" />

              {/* Empty state */}
              {count === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/15 pointer-events-none select-none gap-4 mt-6">
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/25 mb-1">Câmara vazia</p>
                    <p className="text-xs text-white/15 font-mono">AGUARDANDO ENTRADAS...</p>
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={800}
                height={460}
                className="w-full h-full"
                style={{ display: "block" }}
              />
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}
