import React, { useState } from 'react';
import { ServiceCredentials } from '../types';
import { 
  X, Copy, Check, Bot, ExternalLink, Smartphone, Sparkles, AlertTriangle,
  Cpu, Image, Brain, Briefcase, Code2, Search, FolderKanban, CheckCircle2
} from 'lucide-react';
import { ChatGptTimer } from './ChatGptTimer';

interface ChatGptModalProps {
  credentials: ServiceCredentials | null;
  onClose: () => void;
  onOpenChat: () => void;
}

export const ChatGptModal: React.FC<ChatGptModalProps> = ({
  credentials,
  onClose,
  onOpenChat,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  if (!credentials) return null;

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg my-auto bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/60 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-400 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              100% GRATUITO & ILIMITADO
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              ChatGPT Plus / Pro Grátis
            </h3>
          </div>
        </div>

        {/* Banner Image / AI Visual */}
        <div className="relative mb-5 rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-lg">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuW-nECwMijLt1prYNV5Dz9FM9D6p5NNBMmFk63QExCVn6d2pyu5_5ZEqj&s=10"
            alt="ChatGPT Pro"
            referrerPolicy="no-referrer"
            className="w-full h-32 sm:h-36 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-emerald-200">
            <span className="bg-slate-950/85 px-2.5 py-0.5 rounded-md border border-emerald-500/30 backdrop-blur-sm">
              GPT-4o & Inteligência Artificial
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-500/40 backdrop-blur-sm">
              StreamHub VIP
            </span>
          </div>
        </div>

        {/* Real-time Expiration Timer */}
        <ChatGptTimer variant="modal" />

        {/* Info/Warning Banner - Google Login Requirement */}
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs font-semibold leading-relaxed mb-6 flex items-start gap-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-amber-300 font-black flex items-center gap-1.5 uppercase tracking-wide">
              ⚡ IMPORTANTE: LOGIN EXCLUSIVO VIA GOOGLE
            </p>
            <p className="text-amber-100/90 leading-normal">
              Esta conta <strong>ChatGPT Plus / Pro</strong> deve ser acessada clicando na opção <strong>&quot;Continuar com o Google&quot;</strong> (Log in with Google). Insira o e-mail e a senha do Google disponibilizados abaixo.
            </p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 mb-6 shadow-inner">
          
          {/* Email Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              E-mail Google (ChatGPT Plus)
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={credentials.email}
                className="bg-transparent text-emerald-300 font-mono text-sm w-full focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(credentials.email, 'email')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/30 shrink-0"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Senha Google (ChatGPT Plus)
            </label>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2.5">
              <input
                type="text"
                readOnly
                value={credentials.password}
                className="bg-transparent text-emerald-300 font-mono text-sm w-full focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-500/30 shrink-0"
              >
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassword ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Catálogo Organizado de Recursos Pro */}
        <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-inner">
          <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
              Catálogo de Recursos Pro Inclusos
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Modelos avançados</p>
                <p className="text-[10px] text-slate-400 leading-tight">GPT-4o e modelos de inteligência de alta performance.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <Image className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Criação avançada de imagens com Thinking</p>
                <p className="text-[10px] text-slate-400 leading-tight">Geração visual ultra-detalhada com raciocínio analítico.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <Brain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Memória expandida entre chats</p>
                <p className="text-[10px] text-slate-400 leading-tight">Retenção de preferências e histórico de contexto contínuo.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <Briefcase className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Agente do Work para tarefas em várias etapas</p>
                <p className="text-[10px] text-slate-400 leading-tight">Automação fluida de fluxos de trabalho e projetos corporativos.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <Code2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Agente Codex para programação</p>
                <p className="text-[10px] text-slate-400 leading-tight">Criação, refatoração e depuração avançada de código.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <Search className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Pesquisa profunda expandida</p>
                <p className="text-[10px] text-slate-400 leading-tight">Varredura profunda da web e síntese de informações em tempo real.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors sm:col-span-2">
              <FolderKanban className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Projetos e GPTs personalizados</p>
                <p className="text-[10px] text-slate-400 leading-tight">Espaço de trabalho organizado e criação de assistentes exclusivos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Link Buttons */}
        <div className="space-y-3 mb-6">
          <a
            href="https://chatgpt.com/auth/login?next=%2F"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Entrar no ChatGPT Web</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=com.openai.chatgpt"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Baixar App ChatGPT na Google Play Store</span>
          </a>
        </div>

        {/* Instructions */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Passo a passo para login com Google:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
            <li>Copie o e-mail (<code className="text-emerald-300 font-mono">gatomemu22@gmail.com</code>) e a senha (<code className="text-emerald-300 font-mono">14182131rr</code>).</li>
            <li>Clique no botão &quot;Entrar no ChatGPT Web&quot; ou abra o aplicativo oficial no celular.</li>
            <li>Na tela de login do ChatGPT, selecione <strong>&quot;Continuar com o Google&quot;</strong>.</li>
            <li>Insira o e-mail e a senha do Google fornecidos e aproveite os recursos do GPT-4o Plus/Pro!</li>
          </ol>
        </div>

        {/* Footer Support Button */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Dúvidas ou suporte?</span>
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="text-emerald-400 font-bold hover:underline"
          >
            Falar com Atendimento
          </button>
        </div>

      </div>
    </div>
  );
};
