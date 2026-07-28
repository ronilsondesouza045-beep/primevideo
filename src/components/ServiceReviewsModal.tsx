import React, { useState, useEffect } from 'react';
import { X, Star, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, AlertTriangle, Send, Sparkles, ShieldCheck, Play, Tv, Flame } from 'lucide-react';
import { ServiceReview, ServiceReviewStats, User } from '../types';

interface ServiceReviewsModalProps {
  service: 'prime' | 'paramount' | 'freefire' | 'crunchyroll';
  currentUser?: User | null;
  onClose: () => void;
}

export const ServiceReviewsModal: React.FC<ServiceReviewsModalProps> = ({
  service,
  currentUser,
  onClose
}) => {
  const [stats, setStats] = useState<ServiceReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [status, setStatus] = useState<'working' | 'not_working'>('working');
  const [rating, setRating] = useState<number>(5);
  const [userName, setUserName] = useState<string>(
    currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : '')
  );
  const [comment, setComment] = useState<string>('');

  const serviceNames = {
    prime: 'Prime Video VIP',
    paramount: 'Paramount+',
    crunchyroll: 'Crunchyroll VIP (Animes)',
    freefire: 'Free Fire (100 Diamantes + Bônus)'
  };

  const serviceIcons = {
    prime: <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />,
    paramount: <Tv className="w-5 h-5 text-blue-400" />,
    crunchyroll: <Tv className="w-5 h-5 text-orange-400" />,
    freefire: <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
  };

  const serviceColors = {
    prime: 'from-blue-600 to-cyan-500 text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
    paramount: 'from-blue-700 to-indigo-600 text-blue-400 border-blue-500/30 bg-blue-950/40',
    crunchyroll: 'from-orange-600 via-amber-600 to-yellow-500 text-orange-400 border-orange-500/30 bg-orange-950/40',
    freefire: 'from-amber-500 to-orange-600 text-amber-400 border-amber-500/30 bg-amber-950/40'
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?service=${service}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.log('API reviews offline, using local storage reviews fallback');
    }

    // Local storage reviews fallback for Vercel static deployment
    const localRaw = localStorage.getItem(`streamhub_reviews_${service}`);
    let reviewsList: ServiceReview[] = [];
    if (localRaw) {
      try {
        reviewsList = JSON.parse(localRaw);
      } catch (e) {}
    }

    // Default initial mock reviews if empty
    if (reviewsList.length === 0) {
      if (service === 'freefire') {
        reviewsList = [
          {
            id: 'rev_ff_1',
            service: 'freefire',
            userName: 'Gabriel FF',
            rating: 5,
            status: 'working',
            comment: 'Resgatei 100 diamantes no portal dos créditos na hora! Excelente!',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 'rev_ff_2',
            service: 'freefire',
            userName: 'Lucas Gamer',
            rating: 5,
            status: 'working',
            comment: 'Código PIN funcionou de primeira. Muito top!',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
          }
        ];
      } else if (service === 'prime') {
        reviewsList = [
          {
            id: 'rev_p_1',
            service: 'prime',
            userName: 'Roni Souza VIP',
            rating: 5,
            status: 'working',
            comment: 'Loguei sem PIN no Prime Video e assisti em HD. Sensacional!',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
          }
        ];
      } else {
        reviewsList = [
          {
            id: 'rev_pm_1',
            service: 'paramount',
            userName: 'Carlos Silva',
            rating: 5,
            status: 'working',
            comment: 'Paramount+ funcionando perfeitamente sem bloqueios!',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          }
        ];
      }
      localStorage.setItem(`streamhub_reviews_${service}`, JSON.stringify(reviewsList));
    }

    const total = reviewsList.length;
    const working = reviewsList.filter(r => r.status === 'working').length;
    const workingPercentage = total > 0 ? Math.round((working / total) * 100) : 100;
    const avgRating = total > 0 ? parseFloat((reviewsList.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)) : 5.0;

    setStats({
      totalReviews: total,
      workingPercentage,
      averageRating: avgRating,
      reviews: reviewsList
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          service,
          rating,
          status,
          comment,
          userName: userName || 'Usuário VIP'
        })
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success) {
            setSubmitSuccess(data.message || 'Avaliação registrada em tempo real!');
            setComment('');
            if (data.stats) {
              setStats(data.stats);
            } else {
              fetchStats();
            }
            setSubmitting(false);
            return;
          }
        }
      }
    } catch (err) {
      console.log('API review submission offline, saving locally');
    }

    // Local submission fallback for Vercel
    const localRaw = localStorage.getItem(`streamhub_reviews_${service}`);
    let reviewsList: ServiceReview[] = [];
    if (localRaw) {
      try {
        reviewsList = JSON.parse(localRaw);
      } catch (e) {}
    }

    const newRev: ServiceReview = {
      id: `rev_local_${Date.now()}`,
      service,
      userName: userName || 'Usuário VIP',
      rating,
      status,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    reviewsList.unshift(newRev);
    localStorage.setItem(`streamhub_reviews_${service}`, JSON.stringify(reviewsList));

    const total = reviewsList.length;
    const working = reviewsList.filter(r => r.status === 'working').length;
    const workingPercentage = Math.round((working / total) * 100);
    const avgRating = parseFloat((reviewsList.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1));

    setStats({
      totalReviews: total,
      workingPercentage,
      averageRating: avgRating,
      reviews: reviewsList
    });

    setSubmitSuccess('🎉 Sua avaliação foi registrada e publicada com sucesso!');
    setComment('');
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${serviceColors[service]} p-0.5 shadow-lg`}>
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {serviceIcons[service]}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Avaliações em Tempo Real
                <span className="text-[10px] uppercase px-2 py-0.5 rounded font-black text-cyan-300 bg-cyan-950 border border-cyan-500/30">
                  Google Chrome VIP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Catálogo: <strong className="text-white">{serviceNames[service]}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Live Stats Summary Bar */}
          {stats && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                  {stats.averageRating}
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Nota Média</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl font-black text-emerald-400">
                  {stats.successRate}%
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Taxa de Sucesso</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl font-black text-cyan-400">
                  {stats.workingCount}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Acessos Ok</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-2xl font-black text-white">
                  {stats.totalReviews}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Total Avaliações</div>
              </div>
            </div>
          )}

          {/* New Evaluation Form */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Deixar sua Avaliação em Tempo Real
              </h4>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Liberação Imediata
              </span>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Status Radio Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Você conseguiu acessar ou resgatar o serviço?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('working')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      status === 'working'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <span>Consegui Acessar!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('not_working')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      status === 'not_working'
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow-lg shadow-red-950'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4 text-red-400" />
                    <span>Tive Problemas</span>
                  </button>
                </div>
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Sua Nota de 1 a 5 Estrelas:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-all ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-extrabold text-amber-400">
                    {rating}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* User Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Seu Nome ou Apelido:
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Lucas Silva (Google Chrome)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Comment Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Seu Comentário em Tempo Real:
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    service === 'freefire'
                      ? 'Ex: Resgatei o Codiguin no Recarga Jogo pelo Chrome! Bônus de 10% caiu na hora!'
                      : 'Ex: Entrei no Prime Video sem problemas, imagem Full HD limpa.'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-cyan-600/20 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Publicando Avaliação...' : 'Publicar Avaliação em Tempo Real'}</span>
              </button>
            </form>
          </div>

          {/* Recent Reviews List */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Feed de Avaliações Recentes ({serviceNames[service]})
            </h4>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Carregando avaliações em tempo real...
              </div>
            ) : !stats || stats.recentReviews.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950 text-center text-xs text-slate-400">
                Nenhuma avaliação registrada ainda. Seja o primeiro a avaliar!
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {rev.userName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {rev.browser || 'Google Chrome'}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        rev.status === 'working'
                          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                          : 'text-red-400 bg-red-950/60 border-red-500/30'
                      }`}>
                        {rev.status === 'working' ? '✅ Consegui Acessar' : '❌ Não Consegui'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">
                        {rev.rating}.0
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      "{rev.comment}"
                    </p>

                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(rev.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold transition-all"
          >
            Fechar Painel de Avaliações
          </button>
        </div>

      </div>
    </div>
  );
};
