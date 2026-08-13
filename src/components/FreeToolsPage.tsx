import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Activity, 
  Search, 
  Tv, 
  Layers, 
  ExternalLink, 
  Zap, 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  Maximize2, 
  Minimize2, 
  RotateCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Globe,
  Languages,
  Loader2
} from 'lucide-react';
import { FREE_TOOLS_CONFIG, FreeTool, FreeToolCategory } from '../config/freeTools';

export const FreeToolsPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<FreeTool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FreeToolCategory>('TODOS');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeLoadFailed, setIframeLoadFailed] = useState(false);
  const [showTranslateTip, setShowTranslateTip] = useState(false);

  // Available enabled tools
  const availableTools = useMemo(() => {
    return FREE_TOOLS_CONFIG.filter(tool => tool.enabled);
  }, []);

  // Filtered tools based on search and category
  const filteredTools = useMemo(() => {
    return availableTools.filter(tool => {
      // Category match
      if (selectedCategory !== 'TODOS') {
        const catUpper = tool.category.toUpperCase();
        if (selectedCategory === 'RASTREAMENTO' && catUpper !== 'RASTREAMENTO') return false;
        if (selectedCategory === 'AO VIVO' && catUpper !== 'AO VIVO') return false;
        if (selectedCategory === 'SALAS' && catUpper !== 'SALAS') return false;
        if (selectedCategory === 'OUTROS' && ['RASTREAMENTO', 'AO VIVO', 'SALAS'].includes(catUpper)) return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tool.title.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesCat = tool.category.toLowerCase().includes(q);
        const matchesTags = tool.tags?.some(tag => tag.toLowerCase().includes(q)) ?? false;
        return matchesTitle || matchesDesc || matchesCat || matchesTags;
      }

      return true;
    });
  }, [availableTools, selectedCategory, searchQuery]);

  const categories: FreeToolCategory[] = ['TODOS', 'RASTREAMENTO', 'AO VIVO', 'SALAS', 'OUTROS'];

  const getToolIcon = (iconName: FreeTool['iconName']) => {
    switch (iconName) {
      case 'Radio':
        return <Radio className="w-6 h-6 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-red-400" />;
      case 'Search':
        return <Search className="w-6 h-6 text-cyan-400" />;
      case 'Tv':
        return <Tv className="w-6 h-6 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-400" />;
      default:
        return <Layers className="w-6 h-6 text-indigo-400" />;
    }
  };

  const handleOpenTool = (tool: FreeTool) => {
    setIframeLoadFailed(false);
    setIframeLoading(true);
    setIframeKey(prev => prev + 1);
    setSelectedTool(tool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTranslated = (url: string) => {
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=pt&u=${encodeURIComponent(url)}`;
    window.open(translateUrl, '_blank', 'noopener,noreferrer');
  };

  // If a tool is selected, render the dedicated in-app viewer
  if (selectedTool) {
    return (
      <div className={`min-h-screen bg-slate-950 text-slate-100 ${isFullscreen ? 'fixed inset-0 z-50 p-0 m-0' : 'py-6 px-4 max-w-7xl mx-auto'}`}>
        {/* Viewer Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedTool(null);
                setIsFullscreen(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Catálogo
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                {getToolIcon(selectedTool.iconName)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-white">{selectedTool.title}</h2>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {selectedTool.badge}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    Serviço Externo
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                    🇧🇷 Português
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provedor oficial · <span className="font-semibold text-slate-300">{selectedTool.provider}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-end lg:self-auto justify-end flex-wrap">
            <button
              onClick={() => handleOpenTranslated(selectedTool.url)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Abrir versão com tradução para Português"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Traduzir para Português</span>
            </button>

            <button
              onClick={() => {
                setIframeLoading(true);
                setIframeLoadFailed(false);
                setIframeKey(k => k + 1);
              }}
              title="Atualizar"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Atualizar</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition hidden sm:flex items-center gap-1.5"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Sair da tela cheia</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Tela cheia</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenExternal(selectedTool.url)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Abrir em nova guia</span>
            </button>
          </div>
        </div>

        {/* Security & Language Disclaimer */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl px-4 py-2 mb-3 text-[11px] text-slate-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span>
              Esta ferramenta é fornecida por um serviço externo. Alguns textos podem permanecer no idioma original caso o provedor não disponibilize tradução nativa.
            </span>
          </div>
          <button
            onClick={() => setShowTranslateTip(!showTranslateTip)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 whitespace-nowrap flex-shrink-0"
          >
            {showTranslateTip ? 'Ocultar dica' : 'Dica do navegador'}
          </button>
        </div>

        {/* Browser Translation Tip Drawer */}
        {showTranslateTip && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 mb-3 text-xs text-slate-300 animate-fadeIn flex items-start gap-3">
            <Languages className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white mb-1">Como traduzir no seu navegador:</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                No Google Chrome, Edge ou Safari, clique com o botão direito sobre a página externa ou na barra de endereço e escolha <strong>"Traduzir para o português"</strong>. Se preferir, use o botão <strong>"Traduzir para Português"</strong> acima para abrir diretamente traduzido.
              </p>
            </div>
            <button
              onClick={() => setShowTranslateTip(false)}
              className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Iframe Viewport or Fallback */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[600px] md:min-h-[750px] flex flex-col">
          {iframeLoading && !iframeLoadFailed && (
            <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm font-bold text-white">Carregando ferramenta...</p>
              <p className="text-xs text-slate-400 mt-1">Conectando aos servidores oficiais do {selectedTool.provider}</p>
            </div>
          )}

          {iframeLoadFailed ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Erro ao carregar ferramenta</h3>
              <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                Esta ferramenta externa precisa ser aberta diretamente no serviço oficial ou com tradução automática devido a políticas de segurança do provedor.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => {
                    setIframeLoadFailed(false);
                    setIframeLoading(true);
                    setIframeKey(k => k + 1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Tentar novamente
                </button>

                <button
                  onClick={() => handleOpenTranslated(selectedTool.url)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-900/40 flex items-center gap-2 transition"
                >
                  <Languages className="w-4 h-4" />
                  Abrir Traduzido (Português)
                </button>

                <button
                  onClick={() => handleOpenExternal(selectedTool.url)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir em nova guia
                </button>
              </div>
            </div>
          ) : (
            <>
              <iframe
                key={iframeKey}
                src={selectedTool.url}
                title={selectedTool.title}
                className="w-full flex-1 min-h-[650px] md:min-h-[800px] border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setIframeLoadFailed(true);
                }}
              />

              {/* Fallback helper bottom card */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  URL carregada: <code className="text-slate-300 font-mono text-[11px]">{selectedTool.url}</code>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenTranslated(selectedTool.url)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-2"
                  >
                    <Languages className="w-3 h-3" />
                    Traduzir para Português
                  </button>
                  <button
                    onClick={() => handleOpenExternal(selectedTool.url)}
                    className="text-slate-300 hover:text-white font-bold flex items-center gap-1 underline underline-offset-2"
                  >
                    Abrir em nova guia
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Primary Catalog View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 mb-8 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Catálogo 100% Gratuito
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Central de Ferramentas Gratuitas
            </h1>
            <p className="text-sm sm:text-base text-slate-400 font-medium">
              Ferramentas gratuitas disponíveis para você utilizar. Escolha uma opção abaixo e comece a usar gratuitamente.
            </p>
          </div>

          {/* Dynamic Counter Box */}
          <div className="flex-shrink-0 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {availableTools.length}
              </div>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                {availableTools.length === 1 ? 'Ferramenta disponível' : 'Ferramentas disponíveis'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-8 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar ferramenta gratuita..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tool Cards Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredTools.map(tool => {
            const isLive = tool.category.toUpperCase() === 'AO VIVO';

            return (
              <div
                key={tool.id}
                className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                {/* Card Top Row */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 flex items-center justify-center transition-colors">
                        {getToolIcon(tool.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                            {tool.title}
                          </h3>
                          {isLive && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-extrabold animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              AO VIVO
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {tool.category}
                        </span>
                      </div>
                    </div>

                    {/* Free Badge */}
                    <div className={`px-2.5 py-1 rounded-xl text-xs font-black tracking-wider uppercase border flex items-center gap-1.5 ${
                      tool.badge === 'GRÁTIS'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {tool.badge}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Row & Action Buttons */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                      Serviço fornecido por terceiro · {tool.provider}
                    </span>
                    <button
                      onClick={() => handleOpenExternal(tool.url)}
                      title="Abrir diretamente em nova guia"
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-xs flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Nova guia</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleOpenTool(tool)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition transform active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      {tool.buttonText}
                    </button>

                    <button
                      onClick={() => handleOpenExternal(tool.url)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      ABRIR NO SITE OFICIAL
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">Nenhuma ferramenta encontrada</h4>
          <p className="text-xs text-slate-400 mb-4">
            Tente pesquisar por outro termo ou limpar os filtros de categoria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('TODOS');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

