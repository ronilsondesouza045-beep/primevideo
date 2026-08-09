import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, User } from '../types';

interface FavoritesPageProps {
  currentUser: User | null;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateTab: (tab: any) => void;
  onToggleFavorite: (productId: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  currentUser,
  products,
  onSelectProduct,
  onNavigateTab,
  onToggleFavorite
}) => {
  const favoriteIds = currentUser?.favorites || [];
  const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            Meus Produtos Favoritos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sua lista pessoal de serviços, assinaturas e jogos favoritados para acesso rápido.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('catalog')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition border border-slate-700"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          Ver Catálogo Completo
        </button>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Sua lista de favoritos está vazia</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore o catálogo de produtos e clique no ícone de coração em qualquer card para guardar seus itens prediletos aqui.
          </p>
          <button
            onClick={() => onNavigateTab('catalog')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 transition"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <button
                  onClick={() => onToggleFavorite(p.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-red-500 backdrop-blur-md hover:bg-slate-900 transition"
                  title="Remover dos favoritos"
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                </button>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-400 text-[10px] font-bold border border-amber-500/20 backdrop-blur-md">
                  {p.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {p.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Valor</span>
                    <span className="text-sm font-black text-emerald-400">
                      {p.price === 0 ? 'GRÁTIS' : `R$ ${p.price.toFixed(2)}`}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProduct(p)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-amber-500/10"
                  >
                    Resgatar / Adquirir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
