"use client";

import { motion, Variants } from "framer-motion";

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
      


      {/* Hero Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-5xl w-full"
      >
        <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-brand-green uppercase tracking-widest box-glow">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          A Revolução do Atendimento
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-[8rem] font-bold tracking-tighter leading-[0.9] text-glow mb-8"
        >
          CONVERSAS QUE <br className="hidden md:block"/> VENDEM
        </motion.h1>
        
        <motion.p 
          variants={itemVariants}
          className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12 font-light"
        >
          IA, automação e CRM transformando atendimento em faturamento.
        </motion.p>
        


      </motion.div>

    </section>
  );
}
