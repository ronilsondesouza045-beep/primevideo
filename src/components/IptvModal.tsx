import React, { useState } from 'react';
import { X, Tv, Copy, Check, AlertTriangle, Sparkles, RefreshCw, Search, ExternalLink, ShieldCheck, Play, Server } from 'lucide-react';
import { IPT_ACCOUNTS } from '../data/iptvAccounts';
import { IptvAccount } from '../types';

interface IptvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IptvModal: React.FC<IptvModalProps> = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState<'generator' | 'catalog'>('generator');
  const [selectedAccount, setSelectedAccount] = useState<IptvAccount | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateRandom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * IPT_ACCOUNTS.length);
      setSelectedAccount(IPT_ACCOUNTS[randomIndex]);
      setIsGenerating(false);
    }, 400);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredAccounts = IPT_ACCOUNTS.filter(acc =>
    acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.expiration.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 border-b border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Tv className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  100% GRÁTIS
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {IPT_ACCOUNTS.length} Acessos Ativos
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Catálogo & Gerador de IPTV Grátis
              </h2>
            </div>
          </div>
        </div>

        {/* PROMINENT WARNING MESSAGE AS REQUESTED BY USER */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 px-6 flex items-start gap-3 text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-300 block mb-0.5">
              ⚠️ Aviso Importante sobre os Acessos Gratuitos:
            </strong>
            <p className="text-amber-200/90 leading-relaxed">
              Algumas listas ou usuários podem não estar funcionando no momento devido ao limite de conexões simultâneas (1 conexão por conta) ou manutenção do servidor. Se o acesso gerado não conectar, basta clicar para <strong>gerar outro usuário</strong> da lista!
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveView('generator')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeView === 'generator'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gerador Instantâneo
          </button>
          <button
            onClick={() => setActiveView('catalog')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeView === 'catalog'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-4 h-4" />
            Lista Completa de Acessos ({IPT_ACCOUNTS.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeView === 'generator' ? (
            <div className="space-y-6">
              
              {/* Generator Action Box */}
              {!selectedAccount ? (
                <div className="text-center py-8 px-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                    <Tv className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Gere seu Teste de IPTV Grátis Agora
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
                    Clique no botão abaixo para selecionar aleatoriamente um dos 31 acessos com usuário, senha e servidor prontos para o seu aplicativo IPTV (IPTV Smarters, XCIPTV, SS IPTV, Smartone, etc).
                  </p>
                  
                  <button
                    onClick={handleGenerateRandom}
                    disabled={isGenerating}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Gerando Acesso IPTV...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Gerar Acesso IPTV Grátis
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Display Generated Credentials */
                <div className="bg-slate-950/80 rounded-2xl border border-cyan-500/40 p-6 space-y-5 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Acesso Gerado com Sucesso!</span>
                    </div>
                    <button
                      onClick={handleGenerateRandom}
                      disabled={isGenerating}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-slate-700"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      Gerar Outro Usuário
                    </button>
                  </div>

                  {/* Credentials Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* User */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">USUÁRIO</span>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-extrabold text-cyan-300 select-all">{selectedAccount.username}</code>
                        <button
                          onClick={() => copyToClipboard(selectedAccount.username, 'user')}
                          className="px-2.5 py-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 transition-all flex items-center gap-1"
                        >
                          {copiedField === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedField === 'user' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SENHA</span>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-extrabold text-cyan-300 select-all">{selectedAccount.password}</code>
                        <button
                          onClick={() => copyToClipboard(selectedAccount.password, 'pass')}
                          className="px-2.5 py-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 transition-all flex items-center gap-1"
                        >
                          {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedField === 'pass' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Server */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SERVIDOR / URL (DNS)</span>
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-bold text-slate-200 select-all">http://{selectedAccount.server}</code>
                        <button
                          onClick={() => copyToClipboard(`http://${selectedAccount.server}`, 'server')}
                          className="px-2.5 py-1 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 transition-all flex items-center gap-1"
                        >
                          {copiedField === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedField === 'server' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Expiration */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">EXPIRAÇÃO / CONEXÕES</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">{selectedAccount.expiration}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">1 Conexão</span>
                      </div>
                    </div>

                  </div>

                  {/* Full M3U Playlist URL */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">LINK DA LISTA M3U COMPLETA</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`http://${selectedAccount.server}/get.php?username=${selectedAccount.username}&password=${selectedAccount.password}&type=m3u_plus&output=ts`}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(`http://${selectedAccount.server}/get.php?username=${selectedAccount.username}&password=${selectedAccount.password}&type=m3u_plus&output=ts`, 'm3u')}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded hover:opacity-90 transition-all shrink-0 flex items-center gap-1"
                      >
                        {copiedField === 'm3u' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedField === 'm3u' ? 'Copiado!' : 'Copiar M3U'}
                      </button>
                    </div>
                  </div>

                  {/* Quick Copy All Text */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        const fullText = `━●USUÁRIO: ${selectedAccount.username}\n┋├●SENHA: ${selectedAccount.password}\n┋├●EXPIRA: ${selectedAccount.expiration}\n┋├●CONEXÕES: 1\n┋├●STATUS: Active\n┋╰━●SERVIDOR: ${selectedAccount.server}`;
                        copyToClipboard(fullText, 'all');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-2"
                    >
                      {copiedField === 'all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                      {copiedField === 'all' ? 'Dados Copiados!' : 'Copiar Bloco Completo'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* Catalog View */
            <div className="space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por usuário, servidor ou data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Accounts List */}
              <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
                {filteredAccounts.map((acc, index) => (
                  <div
                    key={acc.id || index}
                    className="p-3.5 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-cyan-300">{acc.username}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          Senha: {acc.password}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span>Servidor: <strong className="text-slate-200">http://{acc.server}</strong></span>
                        <span>Expira: <strong className="text-emerald-400">{acc.expiration}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setActiveView('generator');
                        }}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-lg border border-cyan-500/30 transition-all flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Usar Este
                      </button>
                      <button
                        onClick={() => {
                          const fullText = `━●USUÁRIO: ${acc.username}\n┋├●SENHA: ${acc.password}\n┋├●EXPIRA: ${acc.expiration}\n┋├●CONEXÕES: 1\n┋├●STATUS: Active\n┋╰━●SERVIDOR: ${acc.server}`;
                          copyToClipboard(fullText, `list-${acc.id}`);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                      >
                        {copiedField === `list-${acc.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedField === `list-${acc.id}` ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                ))}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Nenhum usuário IPTV encontrado para "{searchTerm}".
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Compatível com Xtream Codes & M3U Plus</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
