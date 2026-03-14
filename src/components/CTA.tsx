"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-brand-green/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.15)_0%,transparent_70%)] blur-2xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex flex-col items-center"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6 font-heading tracking-tight text-glow">
            Transforme conversa <br className="hidden md:block"/> em receita
          </h2>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 font-light">
            A Responsyva une IA, automação e CRM para acelerar atendimento e aumentar conversões.
          </p>
          
          <button className="group relative px-10 py-5 bg-brand-green text-black text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_0_30px_rgba(0,255,136,0.4)]">
            <span className="relative z-10">Ver a Responsyva em ação</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
            
            {/* Hover Glint Effect */}
            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </button>
        </motion.div>

      </div>

    </section>
  );
}
