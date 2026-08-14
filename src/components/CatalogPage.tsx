import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { 
  Search, Filter, Star, Sparkles, CheckCircle, ShieldCheck, 
  ArrowRight, Tag, Zap, X, Copy, ExternalLink, HelpCircle, Lock
} from 'lucide-react';
import { ServiceCards } from './ServiceCards';

interface CatalogPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onSelectService: (serviceKey: string) => void;
  primeBlocked?: boolean;
  primeError?: string | null;
  freeFireStock?: {
    total: number;
    available: number;
    claimed: number;
    outOfStock: boolean;
  };
  onOpenReviews?: (service: 'prime' | 'paramount' | 'freefire' | 'crunchyroll' | 'chatgpt') => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  user,
  onOpenAuth,
  onSelectService,
  primeBlocked = false,
  primeError = null,
  freeFireStock = { total: 2, available: 2, claimed: 0, outOfStock: false },
  onOpenReviews
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSort, setSelectedSort] = useState<'popular' | 'price_asc' | 'price_desc' | 'name'>('popular');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const OFFICIAL_IMAGES: Record<string, string> = {
    prod_prime: 'https://uploads.tracklist.com.br/file/uploads-tracklist-com-br/2024/10/amazon-prime-video.jpg',
    prod_paramount: 'https://t2.tudocdn.net/703654?w=1200&h=1200',
    prod_crunchyroll: 'https://t2.tudocdn.net/793619?w=776&h=338',
    prod_chatgpt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuW-nECwMijLt1prYNV5Dz9FM9D6p5NNBMmFk63QExCVn6d2pyu5_5ZEqj&s=10',
    prod_netflix: 'https://cdn.prod.website-files.com/6615907cf43a722162c27a58/67aca413ce96c91ff946e3f1_netflix.webp',
    prod_freefire: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDn8lFduZ9xS9171yqCOBDrUXUXdqFddrtXYUa0FJKL_12pDpx98a2db0&s=10',
    prod_iptv: 'https://static.wixstatic.com/media/70fc80_a1dda17e8d344e9eadde4ed437267403~mv2.jpeg/v1/fill/w_1000,h_750,al_c,q_85,usm_0.66_1.00_0.01/70fc80_a1dda17e8d344e9eadde4ed437267403~mv2.jpeg',
    prod_social_boost: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    prod_tiktok_live: 'https://opalcodigital.com.br/site/wp-content/uploads/2019/11/tiktok.jpg'
  };

  const FALLBACK_PRODUCTS: Product[] = [
    {
      id: 'prod_tiktok_live',
      name: 'Monitor TikTok Live (Chat & Presentes em Tempo Real)',
      description: 'Monitore chat ao vivo, mensagens de viewers, contagem de espectadores, envio de presentes (gifts), curtidas e engajamento em tempo real pelo navegador.',
      category: 'Ao Vivo',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_tiktok_live'],
      banner: OFFICIAL_IMAGES['prod_tiktok_live'],
      stockStatus: 'DISPONIVEL',
      rating: 5.0,
      badge: 'AO VIVO · 100% GRÁTIS',
      features: [
        'Chat ao vivo instantâneo sem delay',
        'Detecção de presentes (gifts) e doações',
        'Contador de espectadores e curtidas',
        'Monitoramento de qualquer streamer do TikTok',
        'Acesso web direto integrado'
      ],
      instructions: [
        'Clique em "Resgatar" ou "Acessar Monitor".',
        'No monitor, digite o @username do streamer que está em live no TikTok.',
        'Clique em Conectar e acompanhe todas as mensagens, gifts e métricas ao vivo!'
      ],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_prime',
      name: 'Prime Video VIP (Acesso Grátis)',
      description: 'Acesso completo ao catálogo de filmes, séries e produções originais do Prime Video em resolução 4K Ultra HD.',
      category: 'Streaming',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_prime'],
      banner: OFFICIAL_IMAGES['prod_prime'],
      stockStatus: 'DISPONIVEL',
      rating: 4.9,
      badge: '100% GRÁTIS',
      features: ['Qualidade 4K Ultra HD', 'Multi-perfis liberados', 'Ativação Instantânea 24/7', 'Suporte VIP via Chatbot'],
      instructions: ['Acesse o site oficial do Prime Video (primevideo.com).', 'Insira o e-mail e a senha liberados na aba "Meus Acessos".', 'Escolha qualquer perfil e aproveite sem limites.'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_paramount',
      name: 'Paramount+ VIP (Gratuito)',
      description: 'Desfrute de séries exclusivas, filmes campeões de bilheteria e esportes ao vivo na plataforma Paramount+.',
      category: 'Streaming',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_paramount'],
      banner: OFFICIAL_IMAGES['prod_paramount'],
      stockStatus: 'DISPONIVEL',
      rating: 4.8,
      badge: 'DE GRAÇA',
      features: ['Séries exclusivas', 'Transmissões esportivas', 'Catálogo Infantil Nickelodeon', 'Acesso direto'],
      instructions: ['Acesse paramountplus.com.', 'Digite as credenciais disponibilizadas.', 'Selecione o perfil e divirta-se.'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_crunchyroll',
      name: 'Crunchyroll Premium VIP',
      description: 'A maior biblioteca de animes do mundo! Assista em HD com legendas e dublagens em português sem anúncios.',
      category: 'Entretenimento',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_crunchyroll'],
      banner: OFFICIAL_IMAGES['prod_crunchyroll'],
      stockStatus: 'DISPONIVEL',
      rating: 4.9,
      badge: 'ANIMES HD',
      features: ['Lançamentos simulcast', 'Sem comerciais', 'Qualidade 1080p Full HD', 'Catálogo completo'],
      instructions: ['Entre no site ou app Crunchyroll.', 'Insira a conta fornecida no painel.'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_chatgpt',
      name: 'ChatGPT Plus / Pro (GPT-4o)',
      description: 'Acesso grátis ao ChatGPT Plus com Inteligência Artificial GPT-4o! Inclui criação de imagens com Thinking, agentes Codex e Work, memória expandida e GPTs personalizados.',
      category: 'Inteligência Artificial',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_chatgpt'],
      banner: OFFICIAL_IMAGES['prod_chatgpt'],
      stockStatus: 'DISPONIVEL',
      rating: 5.0,
      badge: 'GPT-4o PRO GRÁTIS',
      features: [
        'Modelos avançados',
        'Criação avançada de imagens com Thinking',
        'Memória expandida entre chats',
        'Agente do Work para tarefas em várias etapas',
        'Agente Codex para programação',
        'Pesquisa profunda expandida',
        'Projetos e GPTs personalizados'
      ],
      instructions: ['Copie o e-mail (souzaroni187@gmail.com) e a senha.', 'Acesse chatgpt.com ou baixe o app oficial na Play Store.', 'Faça login com a conta disponibilizada e aproveite!'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_netflix',
      name: 'Netflix VIP Ultra HD (Perfil Individual)',
      description: 'Conta individual com perfil próprio na Netflix, qualidade 4K HDR e garantia de estabilidade durante todo o mês.',
      category: 'Premium',
      price: 10.00,
      isFree: false,
      image: OFFICIAL_IMAGES['prod_netflix'],
      banner: OFFICIAL_IMAGES['prod_netflix'],
      stockStatus: 'ESTOQUE_BAIXO',
      rating: 5.0,
      badge: 'PROMOÇÃO R$ 10',
      features: ['Perfil com PIN exclusivo', 'Qualidade 4K Ultra HD', 'Garantia de 30 dias', 'Suporte prioritário'],
      instructions: ['Após o pagamento aprovado no Ton/Pix, a credencial será revelada em "Meus Acessos".', 'Use a conta na Netflix e acesse apenas o perfil com seu nome e PIN.'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_iptv',
      name: 'Servidor IPTV Lista M3U & Xtream',
      description: 'Mais de 30 canais ao vivo, filmes e séries para Smart TV, TV Box, celular e computador no servidor ger99.xyz.',
      category: 'Entretenimento',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_iptv'],
      banner: OFFICIAL_IMAGES['prod_iptv'],
      stockStatus: 'DISPONIVEL',
      rating: 4.8,
      badge: '31 CONTAS',
      features: ['Servidor ger99.xyz:80', 'Suporte Xtream API', 'Canais Full HD', 'Atualização mensal'],
      instructions: ['Abra seu reprodutor IPTV (IPTV Smarters, XCIPTV, TViMate).', 'Insira o servidor http://ger99.xyz:80 e os dados de um dos 31 usuários da lista.'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_social_boost',
      name: 'Impulso Redes Sociais - SMM Boost',
      description: 'Engajamento real para Instagram, TikTok e YouTube. Teste 50 unidades gratuitas a cada 24 horas.',
      category: 'Premium',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_social_boost'],
      banner: OFFICIAL_IMAGES['prod_social_boost'],
      stockStatus: 'DISPONIVEL',
      rating: 4.9,
      badge: 'AUTOMÁTICO',
      features: ['Entrega ultra rápida', 'Seguidores & Curtidas', 'Teste Grátis 50 unidades', 'Painel de acompanhamento'],
      instructions: ['Cole o link do seu perfil ou publicação.', 'Solicite o teste grátis ou compre com seu saldo de carteira.'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_freefire',
      name: 'Free Fire - Codiguin & 100 Diamantes (Gratuito)',
      description: 'Resgate de códigos promocionais e recargas de diamantes diretamente na sua conta Free Fire.',
      category: 'Games',
      price: 0,
      isFree: true,
      image: OFFICIAL_IMAGES['prod_freefire'],
      banner: OFFICIAL_IMAGES['prod_freefire'],
      stockStatus: 'DISPONIVEL',
      rating: 4.7,
      badge: 'CODIGUIN',
      features: ['Códigos válidos', 'Resgate no site da Garena', 'Entrega de Diamantes', 'Grátis para membros'],
      instructions: ['Acesse o site oficial de resgate da Garena (reward.ff.garena.com).', 'Insira o Codiguin gerado.'],
      updatedAt: new Date().toISOString()
    }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          const normalized = data.products.map((p: Product) => ({
            ...p,
            image: OFFICIAL_IMAGES[p.id] || p.image,
            banner: OFFICIAL_IMAGES[p.id] || p.banner || p.image
          }));
          setProducts(normalized);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Erro ao buscar produtos:', e);
    }
    setProducts(FALLBACK_PRODUCTS);
    setLoading(false);
  };

  const categories = ['Todos', 'Streaming', 'Inteligência Artificial', 'Entretenimento', 'Games', 'Premium', 'Gratuitos'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'Todos') return matchesSearch;
    if (selectedCategory === 'Gratuitos') return matchesSearch && product.isFree;
    return matchesSearch && product.category === selectedCategory;
  }).sort((a, b) => {
    if (selectedSort === 'price_asc') return a.price - b.price;
    if (selectedSort === 'price_desc') return b.price - a.price;
    if (selectedSort === 'name') return a.name.localeCompare(b.name);
    return (b.rating || 0) - (a.rating || 0); // popular
  });

  const handleActionClick = (product: Product) => {
    if (product.id === 'prod_tiktok_live') {
      onSelectService('tiktok-live');
    } else if (product.id === 'prod_prime') {
      onSelectService('prime');
    } else if (product.id === 'prod_paramount') {
      onSelectService('paramount');
    } else if (product.id === 'prod_crunchyroll') {
      onSelectService('crunchyroll');
    } else if (product.id === 'prod_chatgpt') {
      onSelectService('chatgpt');
    } else if (product.id === 'prod_netflix') {
      onSelectService('netflix');
    } else if (product.id === 'prod_iptv') {
      onSelectService('iptv');
    } else if (product.id === 'prod_social_boost') {
      onSelectService('smm');
    } else if (product.id === 'prod_freefire') {
      onSelectService('freefire');
    } else {
      setSelectedProduct(product);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      {/* Header Hero Banner */}
      <div className="mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Catálogo VIP Oficial STREAMHUB 2.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Portal Exclusivo de <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">
              Streaming & Entretenimento VIP
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Resgate acessos gratuitos de <strong className="text-cyan-400">Prime Video</strong>, <strong className="text-blue-400">Paramount+</strong>, <strong className="text-orange-400">Crunchyroll</strong>, códigos <strong className="text-amber-400">Free Fire</strong> e servidores <strong className="text-emerald-400">IPTV</strong> com liberação instantânea 24/7.
          </p>

          {/* Trust Badges */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Acesso Seguro 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Liberação Instantânea</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Contas Testadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Grátis & VIP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main VIP Service Cards Grid */}
      <ServiceCards
        onGeneratePrime={() => onSelectService('prime')}
        onGenerateParamount={() => onSelectService('paramount')}
        onGenerateCrunchyroll={() => onSelectService('crunchyroll')}
        onGenerateChatGpt={() => onSelectService('chatgpt')}
        onGenerateFreeFire={() => onSelectService('freefire')}
        onBuyNetflix={() => onSelectService('netflix')}
        onGenerateIptv={() => onSelectService('iptv')}
        onOpenTikTokLive={() => onSelectService('tiktok-live')}
        onOpenReviews={onOpenReviews}
        primeBlocked={primeBlocked}
        primeError={primeError}
        freeFireStock={freeFireStock}
      />

      {/* Filter Bar & All Products Section */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome do serviço, streaming ou código..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedSort}
            onChange={(e: any) => setSelectedSort(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="popular">Mais Populares ⭐</option>
            <option value="price_asc">Menor Preço 💲</option>
            <option value="price_desc">Maior Preço 💎</option>
            <option value="name">Nome (A-Z) 🔤</option>
          </select>
        </div>
      </div>

      {/* Categories Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-900/60 rounded-3xl border border-slate-800 animate-pulse p-6 flex flex-col justify-between">
              <div className="w-full h-32 bg-slate-800/80 rounded-2xl mb-4"></div>
              <div className="w-3/4 h-5 bg-slate-800/80 rounded mb-2"></div>
              <div className="w-full h-4 bg-slate-800/60 rounded mb-4"></div>
              <div className="w-full h-10 bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-slate-900/90 rounded-3xl border border-slate-800/90 hover:border-red-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-red-600/10"
            >
              {/* Product Cover Image */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                {/* Badge top-left */}
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 border border-amber-500/40 backdrop-blur-md rounded-lg shadow-md">
                    {product.badge}
                  </span>
                )}

                {/* Stock Status top-right */}
                <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-black uppercase rounded-lg backdrop-blur-md border shadow-md ${
                  product.stockStatus === 'DISPONIVEL'
                    ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40'
                    : product.stockStatus === 'ESTOQUE_BAIXO'
                    ? 'text-amber-400 bg-amber-500/20 border-amber-500/40'
                    : 'text-red-400 bg-red-500/20 border-red-500/40'
                }`}>
                  {product.stockStatus === 'DISPONIVEL' ? '● Disponível' : product.stockStatus === 'ESTOQUE_BAIXO' ? '⚠️ Estoque Baixo' : '🔒 Em Breve'}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      {product.category}
                    </span>
                    {product.rating && (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {product.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors leading-snug mb-2">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Primary CTA Button */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Valor</span>
                    <span className="text-base font-black text-white">
                      {product.isFree || product.price === 0 ? (
                        <span className="text-emerald-400">100% GRÁTIS</span>
                      ) : (
                        `R$ ${product.price.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
                      title="Ver Detalhes do Produto"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleActionClick(product)}
                      className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>{product.isFree ? 'Resgatar' : 'Adquirir'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Nenhum serviço encontrado</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
            Não encontramos resultados para "{searchQuery}". Tente pesquisar com outro termo ou selecione uma categoria diferente.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Cover Image */}
            <div className="relative h-48 bg-slate-950">
              <img
                src={selectedProduct.banner || selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded-md inline-block mb-1">
                  {selectedProduct.category}
                </span>
                <h2 className="text-xl font-black text-white">{selectedProduct.name}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Descrição do Serviço</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Features List */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Recursos & Vantagens</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduct.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-semibold text-slate-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {selectedProduct.instructions && selectedProduct.instructions.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 mb-2">
                    <Zap className="w-4 h-4" />
                    Como Utilizar / Instruções de Acesso
                  </h4>
                  <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-300 font-medium">
                    {selectedProduct.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Valor Total</span>
                <span className="text-lg font-black text-white">
                  {selectedProduct.isFree || selectedProduct.price === 0 ? (
                    <span className="text-emerald-400">100% GRÁTIS</span>
                  ) : (
                    `R$ ${selectedProduct.price.toFixed(2)}`
                  )}
                </span>
              </div>

              <button
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProduct(null);
                  handleActionClick(p);
                }}
                className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
              >
                <span>{selectedProduct.isFree ? 'Resgatar Acesso Agora' : 'Adquirir com Ton / PIX'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
