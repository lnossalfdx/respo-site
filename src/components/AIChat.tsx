"use client";

import { motion } from "framer-motion";
import { Bot, User, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

// Added a Typewriter component for AI responses
const TypewriterText = ({ text, delayStart = 0 }: { text: string; delayStart?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const typingDelay = setTimeout(() => {
      typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else if (typingInterval) {
          clearInterval(typingInterval);
        }
      }, 30); // typing speed
    }, delayStart);

    return () => {
      clearTimeout(typingDelay);
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [text, delayStart]);

  return <span>{displayedText}</span>;
};

const messagesData = [
  { sender: "user", text: "Como a Responsyva ajuda minha empresa a vender mais?", delay: 0.5 },
  { sender: "ai", text: "Nossa IA se conecta ao seu WhatsApp, site e redes sociais. Nós qualificamos todos os seus leads automaticamente 24h por dia, tiramos as dúvidas deles em tempo real, e enviamos os dados organizados direto para a sua equipe no CRM.", delay: 3.0 },
  { sender: "user", text: "Isso realmente aumenta a conversão final?", delay: 10.0 },
  { sender: "ai", text: "Sim! Como respondemos o lead em menos de 3 segundos com respostas humanizadas, a taxa de engajamento sobe drasticamente e sua equipe foca apenas em fechar as vendas já quentes.", delay: 13.0 },
];

export function AIChat() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!inView) return;

    const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];

    messagesData.forEach((msg, index) => {
      // Set typing indicator before AI messages
      if (msg.sender === "ai") {
        timeoutIds.push(
          setTimeout(() => setIsTyping(true), (msg.delay - 1.5) * 1000)
        );
      }

      timeoutIds.push(
        setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages(index + 1);
        }, msg.delay * 1000)
      );
    });

    return () => timeoutIds.forEach(clearTimeout);
  }, [inView]);

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        <div className="lg:w-1/2 text-left mb-16 lg:mb-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-brand-green uppercase tracking-widest box-glow mb-6">
            <Cpu className="w-4 h-4" />
            Superando o Humano
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading text-glow tracking-tight text-white">
            UM VENDEDOR QUE <br/> NUNCA DORME
          </h2>
          <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-8">
            Nossa Inteligência Artificial é treinada com os dados da sua empresa. Ela atende, negocia, contorna objeções e qualifica os leads perfeitamente antes mesmo da sua equipe abrir o CRM.
          </p>
          <ul className="space-y-4 text-white/80">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green glow" />
              Respostas em menos de 3 segundos
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green glow" />
              Tom de voz 100% humanizado
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green glow" />
              Integração simultânea (WhatsApp, Insta, Site)
            </li>
          </ul>
        </div>

        <div className="lg:w-1/2 w-full">
          <div className="w-full min-h-[500px] md:min-h-[550px] bg-[#030805] backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-brand-green/20 shadow-[0_0_80px_rgba(0,255,136,0.15)] relative overflow-hidden flex flex-col justify-between">
            
            {/* Header of the Chat Window */}
            <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-4 relative z-20">
              <div className="w-12 h-12 rounded-full bg-brand-green/20 border-2 border-brand-green box-glow flex items-center justify-center text-brand-green relative">
                <Bot className="w-6 h-6" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-brand-green rounded-full border-2 border-[#030805]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">IA Responsyva</h3>
                <span className="text-brand-green text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  Online e Operando
                </span>
              </div>
            </div>

            {/* Decorative animated backgrounds */}
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 -right-20 w-64 h-64 bg-brand-green/10 blur-[100px] rounded-full pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-20 -left-20 w-64 h-64 bg-brand-green/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col gap-6 relative z-10 overflow-y-auto pr-2 pb-4 scrollbar-hide flex-1 justify-end">
              {messagesData.slice(0, visibleMessages).map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0 mt-auto shadow-[0_0_15px_rgba(0,255,136,0.2)] border border-brand-green/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                    msg.sender === "user" 
                      ? "bg-[#1f1f1f] text-white border border-white/10 rounded-br-sm" 
                      : "bg-[#0a2e1a] text-[#00ff88] border border-brand-green/30 rounded-bl-sm box-glow backdrop-blur-md"
                  }`}>
                    {msg.sender === "ai" ? (
                      <TypewriterText text={msg.text} delayStart={200} />
                    ) : (
                      <span className="text-white/90">{msg.text}</span>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white/50 shrink-0 mt-auto border border-white/10">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center text-brand-green shrink-0 mt-auto shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-5 py-4 bg-[#0a2e1a] border border-brand-green/30 rounded-2xl rounded-bl-sm flex items-center gap-2 box-glow shadow-xl">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_8px_#00ff88]" />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-brand-green/70 shadow-[0_0_8px_#00ff88]" />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-brand-green/40 shadow-[0_0_8px_#00ff88]" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
