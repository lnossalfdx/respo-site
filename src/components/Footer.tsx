"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Mail, MessageCircle, Instagram, Linkedin, Twitter, ExternalLink } from "lucide-react";

const footerLinks = {
  Produto: ["Atendimento IA", "Qualificação de Leads", "CRM Inteligente", "Automação WhatsApp"],
  Empresa: ["Sobre nós", "Blog", "Parceiros", "Carreiras"],
  Suporte: ["Central de ajuda", "Documentação", "Status", "Contato"],
};

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Twitter, label: "Twitter" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-black overflow-hidden">
      {/* Ambient glow top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-green/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-brand-green/5 blur-[80px] pointer-events-none" />

      {/* CTA Banner inside footer */}
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass border border-brand-green/20 rounded-3xl p-10 md:p-16 text-center mb-20 relative overflow-hidden shadow-[0_0_80px_rgba(0,255,136,0.08)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.08)_0%,transparent_70%)] pointer-events-none" />

          <p className="text-brand-green text-sm uppercase tracking-[0.3em] font-medium mb-4">Comece agora</p>
          <h3 className="text-4xl md:text-5xl font-bold text-white text-glow mb-4 relative z-10">
            Transforme conversa em receita
          </h3>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto relative z-10">
            A Responsyva une IA, automação e CRM para acelerar atendimento e aumentar conversões.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button className="group px-8 py-4 bg-brand-green text-black font-bold rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,255,136,0.4)] overflow-hidden relative">
              <span className="relative z-10">Ver a Responsyva em ação</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <button className="px-8 py-4 border border-white/20 text-white/80 rounded-full hover:bg-white/5 transition-all flex items-center gap-2 glass">
              <Mail className="w-4 h-4" />
              Falar com especialista
            </button>
          </div>
        </motion.div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">

          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-6">
            <div className="relative w-32 h-10">
              <Image src="/logo.png" alt="Responsyva" fill className="object-contain object-left" />
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Plataforma de Inteligência Artificial para vendas e atendimento. A ia que nunca para de qualificar.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <button key={s.label} className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-brand-green hover:border-brand-green/30 transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                  <s.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MessageCircle className="w-4 h-4 text-brand-green" />
              <span>responsyva@gmail.com</span>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="text-white font-semibold text-sm tracking-wider uppercase">{category}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/40 hover:text-white/80 text-sm transition-colors hover:translate-x-1 inline-flex items-center gap-1 group">
                      {link}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Responsyva. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white/60 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white/60 transition-colors">Cookies</a>
          </div>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            Todos os sistemas operacionais
          </p>
        </div>
      </div>
    </footer>
  );
}
