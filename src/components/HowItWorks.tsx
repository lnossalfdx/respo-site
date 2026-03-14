"use client";

import { motion } from "framer-motion";
import { User, Brain, MessageSquare, CheckCircle, Database, Users, TrendingUp } from "lucide-react";

const steps = [
  { id: 1, text: "Lead Entra", icon: User },
  { id: 2, text: "IA Responde", icon: Brain },
  { id: 3, text: "Chat Autônomo", icon: MessageSquare },
  { id: 4, text: "Qualificação", icon: CheckCircle },
  { id: 5, text: "Enviado ao CRM", icon: Database },
  { id: 6, text: "Equipe Recebe", icon: Users },
  { id: 7, text: "Venda Geração", icon: TrendingUp },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading text-glow">
            O FLUXO DA CONVERSÃO
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Veja como a Responsyva transforma um contato inicial em uma venda concluída, 100% no automático.
          </p>
        </motion.div>

        <div className="relative w-full max-w-3xl mx-auto">
          {/* Luminous track line */}
          <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-0.5 bg-gradient-to-b from-brand-green/20 via-brand-green to-brand-green/20 -translate-x-1/2" />
          
          <div className="flex flex-col gap-12 md:gap-20 relative z-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;
              
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
                  className={`flex items-center w-full ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`hidden md:block w-1/2 ${isEven ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <h3 className="text-2xl font-bold text-white">{step.text}</h3>
                    <p className="text-white/50 text-sm mt-2">Etapa automática {index + 1}</p>
                  </div>
                  
                  {/* Node icon */}
                  <div className="relative z-20 flex-shrink-0 w-14 h-14 rounded-full bg-black border border-brand-green/50 box-glow flex items-center justify-center text-brand-green ml-0 md:-ml-7 md:-mr-7 shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Mobile Text */}
                  <div className="md:hidden ml-6">
                    <h3 className="text-xl font-bold text-white">{step.text}</h3>
                  </div>

                  {/* Empty space placeholder for symmetric layout on desktop */}
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
