import React, { useState, useEffect } from 'react';
import { Home, Save, Plus, Trash2, Layout, Megaphone, Star } from 'lucide-react';
import { HomeContentConfig, User } from '../types';

interface HomeConfigAdminProps {
  currentUser: User | null;
}

export const HomeConfigAdmin: React.FC<HomeConfigAdminProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<HomeContentConfig>({
    heroTitle: 'STREAMHUB VIP 2.0 — Plataforma de Streaming & IPTV',
    heroSubtitle: 'Acesse contas Premium gratuitas de Prime Video e Paramount+, servidores IPTV Xtream e serviços de mídias sociais.',
    announcementBarText: '🚀 LANÇAMENTO ETAPA 2 — STREAMHUB VIP PROFESSIONAL+ COM PRESENÇA EM TEMPO REAL E CUPONS VIP!',
    announcementBarActive: true,
    banners: [],
    featuredProductIds: []
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/home-config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) setConfig(data.config);
      }
    } catch (e) {
      console.error('Error loading home config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/admin/home-config', {
        method: 'POST',
        headers,
        body: JSON.stringify(config)
      });

      if (res.ok) {
        alert('Configurações da Home atualizadas com sucesso!');
      }
    } catch (e) {
      console.error('Error saving home config:', e);
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    const newB: HomeContentConfig['banners'][0] = {
      id: `banner_${Date.now()}`,
      title: 'Novo Banner Promocional',
      description: 'Aproveite nossas promoções exclusivas para membros VIP.',
      imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80',
      buttonText: 'Ver Oferta',
      buttonLink: 'catalog',
      active: true
    };
    setConfig(prev => ({ ...prev, banners: [...prev.banners, newB] }));
  };

  const removeBanner = (id: string) => {
    setConfig(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== id) }));
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-400" />
            Gerenciador do Layout da Home
          </h2>
          <p className="text-xs text-slate-400">
            Personalize os textos da Hero, barra de avisos global, banners promocionais e destaques.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Carregando layout...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Announcement Bar Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Barra de Aviso Global (Topo da Página)
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="announcementActive"
                checked={config.announcementBarActive}
                onChange={(e) => setConfig({ ...config, announcementBarActive: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="announcementActive" className="text-xs font-bold text-slate-200">
                Exibir barra de avisos no topo do site
              </label>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Texto da Barra de Aviso</label>
              <input
                type="text"
                value={config.announcementBarText}
                onChange={(e) => setConfig({ ...config, announcementBarText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hero Section Texts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Home className="w-4 h-4" />
              Título Principal & Subtítulo (Hero Header)
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Título Principal (H1)</label>
              <input
                type="text"
                value={config.heroTitle}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Subtítulo Explicativo</label>
              <textarea
                rows={2}
                value={config.heroSubtitle}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Banners Manager */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4" />
                Banners Promocionais
              </h3>
              <button
                type="button"
                onClick={addBanner}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                Adicionar Banner
              </button>
            </div>

            {config.banners.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum banner cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {config.banners.map((b, idx) => (
                  <div key={b.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Banner #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeBanner(b.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Título</label>
                        <input
                          type="text"
                          value={b.title}
                          onChange={(e) => {
                            const newBanners = [...config.banners];
                            newBanners[idx].title = e.target.value;
                            setConfig({ ...config, banners: newBanners });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">URL da Imagem</label>
                        <input
                          type="text"
                          value={b.imageUrl}
                          onChange={(e) => {
                            const newBanners = [...config.banners];
                            newBanners[idx].imageUrl = e.target.value;
                            setConfig({ ...config, banners: newBanners });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>
      )}

    </div>
  );
};
