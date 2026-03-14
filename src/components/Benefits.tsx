"use client";

import { motion, Variants } from "framer-motion";
import { Zap, Sparkles, Database, AreaChart } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Atendimento Inteligente",
    description: "IA responde clientes instantaneamente.",
  },
  {
    icon: Sparkles,
    title: "Qualificação Automática",
    description: "Leads são analisados automaticamente.",
  },
  {
    icon: Database,
    title: "CRM Inteligente",
    description: "Oportunidades organizadas para sua equipe.",
  },
  {
    icon: AreaChart,
    title: "Mais Conversão",
    description: "Atendimento rápido gera mais vendas.",
  },
];

export function Benefits() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, type: "spring", stiffness: 100 },
    },
  };

  return (
    <section id="beneficios" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-glow">
            VANTAGENS COMPETITIVAS
          </h2>
          <p className="text-white/60 text-lg md:text-xl font-light">
            Recursos projetados para maximizar seus resultados.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full"
        >
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="group relative glass p-8 rounded-3xl overflow-hidden hover:bg-white/5 transition-colors border border-white/5 box-glow"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-black border border-brand-green/30 flex items-center justify-center text-brand-green mb-6 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-white/50 leading-relaxed font-light">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
