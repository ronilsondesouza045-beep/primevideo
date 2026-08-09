import React, { useState } from 'react';
import { 
  Zap, ShieldCheck, Lock, Tv, Sparkles, Check, X, HelpCircle, 
  ChevronDown, ArrowRight, Award, Clock, Smartphone, Headphones
} from 'lucide-react';

interface BenefitsPageProps {
  onOpenCatalog: () => void;
}

export const BenefitsPage: React.FC<BenefitsPageProps> = ({ onOpenCatalog }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Os acessos gratuitos (Prime Video, Paramount+ e Crunchyroll) realmente funcionam?',
      a: 'Sim! As contas são ativas, renovadas periodicamente pela nossa equipe técnica e disponibilizadas instantaneamente na sua área de "Meus Acessos". Basta copiar os dados e entrar.'
    },
    {
      q: 'Como funciona o perfil da Netflix VIP por R$ 10,00?',
      a: 'Ao solicitar a contratação via Ton / Pix, você recebe um perfil individual com seu nome e PIN de segurança de 4 dígitos. A qualidade é 4K Ultra HD com 30 dias de garantia total.'
    },
    {
      q: 'Qual o servidor e porta do serviço IPTV?',
      a: 'Nosso servidor principal utiliza o endereço http://ger99.xyz:80 compatível com Xtream API e listas M3U para Smart TVs, celulares e TV Boxes. Contamos com mais de 30 usuários atualizados.'
    },
    {
      q: 'Como funciona o Teste Grátis do SMM Social Boost?',
      a: 'Você pode solicitar 50 seguidores ou curtidas gratuitamente a cada 24 horas diretamente no painel inserindo apenas o link público da sua publicação ou perfil do Instagram/TikTok.'
    },
    {
      q: 'Os meus dados estão seguros no STREAMHUB VIP 2.0?',
      a: 'Totalmente! Utilizamos criptografia de ponta a ponta, tokens JWT seguros para sessão e não armazenamos informações confidenciais de pagamento.'
    }
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh] space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3.5 py-1 text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          Por Que Escolher O STREAMHUB VIP 2.0
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          A Plataforma Definitiva de <span className="bg-gradient-to-r from-red-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">Streaming & Mídia</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Combinamos velocidade automatizada, estabilidade máxima de servidores e custo zero para os principais serviços do mercado de entretenimento digital.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 shadow-xl transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Liberação Instantânea 24/7</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esqueça filas de espera ou atendimentos demorados. Nosso sistema libera suas credenciais e códigos no exato segundo da confirmação.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 shadow-xl transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">100% Legítimo & Testado</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Todas as contas, PINs e listas IPTV são monitorados automaticamente por scripts de saúde do servidor para garantir zero quedas ou mensagens de erro.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all duration-300">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Compatibilidade Total</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Assista no celular, tablet, computador, Smart TV (Samsung, LG, Android TV) ou aparelhos TV Box com interface responsiva e fácil navegação.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            Comparativo de Mercado
          </h2>
          <p className="text-xs text-slate-400">
            Veja como o STREAMHUB VIP 2.0 se destaca frente a assinaturas tradicionais e outros fornecedores.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="py-4 px-4">Recurso / Benefício</th>
                <th className="py-4 px-4 text-center text-red-400 font-black bg-red-950/20 rounded-t-xl">
                  STREAMHUB VIP 2.0
                </th>
                <th className="py-4 px-4 text-center">Assinaturas Diretas</th>
                <th className="py-4 px-4 text-center">Outros Grupos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              <tr>
                <td className="py-4 px-4 font-bold text-white">Prime, Paramount e Crunchyroll Grátis</td>
                <td className="py-4 px-4 text-center text-emerald-400 font-bold bg-red-950/10"><Check className="w-4 h-4 mx-auto" /> Sim (100% Grátis)</td>
                <td className="py-4 px-4 text-center text-red-400"><X className="w-4 h-4 mx-auto" /> Não (R$ 100+/mês)</td>
                <td className="py-4 px-4 text-center text-slate-500">Raro / Quedas Frequentes</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-white">Netflix VIP 4K Ultra HD com PIN</td>
                <td className="py-4 px-4 text-center text-emerald-400 font-bold bg-red-950/10"><Check className="w-4 h-4 mx-auto" /> R$ 10,00/mês</td>
                <td className="py-4 px-4 text-center text-slate-400">R$ 59,90/mês</td>
                <td className="py-4 px-4 text-center text-slate-500">R$ 20,00 - R$ 30,00</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-white">Entrega Automatizada em Segundos</td>
                <td className="py-4 px-4 text-center text-emerald-400 font-bold bg-red-950/10"><Check className="w-4 h-4 mx-auto" /> Instantânea 24/7</td>
                <td className="py-4 px-4 text-center text-emerald-400"><Check className="w-4 h-4 mx-auto" /> Instantânea</td>
                <td className="py-4 px-4 text-center text-red-400"><X className="w-4 h-4 mx-auto" /> Manual / Demorada</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-white">Chatbot de Suporte Especializado 24h</td>
                <td className="py-4 px-4 text-center text-emerald-400 font-bold bg-red-950/10"><Check className="w-4 h-4 mx-auto" /> Suporte VIP Ativo</td>
                <td className="py-4 px-4 text-center text-slate-400">Suporte Básico</td>
                <td className="py-4 px-4 text-center text-red-400"><X className="w-4 h-4 mx-auto" /> Sem Atendimento</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-white">Teste SMM Social Boost Grátis</td>
                <td className="py-4 px-4 text-center text-emerald-400 font-bold bg-red-950/10"><Check className="w-4 h-4 mx-auto" /> 50 Unid./24h</td>
                <td className="py-4 px-4 text-center text-slate-500">N/A</td>
                <td className="py-4 px-4 text-center text-red-400"><X className="w-4 h-4 mx-auto" /> Não Oferecem</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-red-500" />
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-xs text-slate-400">
            Tire suas dúvidas sobre o funcionamento do STREAMHUB VIP 2.0.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-red-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-red-500' : ''}`} />
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-red-950/60 via-slate-900 to-purple-950/60 border border-slate-800 text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Pronto Para Aproveitar Os Melhores Acessos VIP?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Acesse nosso catálogo agora e resgate seus serviços de streaming favoritos em poucos segundos.
        </p>
        <button
          onClick={onOpenCatalog}
          className="px-8 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 shadow-xl shadow-red-600/30 transition-all inline-flex items-center gap-2 active:scale-95"
        >
          <span>Ir Para O Catálogo VIP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
