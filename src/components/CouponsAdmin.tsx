import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Percent, DollarSign, Shield, Calendar } from 'lucide-react';
import { Coupon, User } from '../types';

interface CouponsAdminProps {
  currentUser: User | null;
}

export const CouponsAdmin: React.FC<CouponsAdminProps> = ({ currentUser }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New coupon form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [validUntil, setValidUntil] = useState('');
  const [onlyVip, setOnlyVip] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/admin/coupons', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.coupons) setCoupons(data.coupons);
      }
    } catch (e) {
      console.error('Error fetching coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minAmount: minAmount ? Number(minAmount) : undefined,
          maxUses: maxUses ? Number(maxUses) : undefined,
          validUntil: validUntil || undefined,
          onlyVip,
          active: true
        })
      });

      if (res.ok) {
        setIsCreating(false);
        setCode('');
        setDiscountValue(10);
        setMinAmount('');
        setMaxUses('');
        setValidUntil('');
        setOnlyVip(false);
        fetchCoupons();
      }
    } catch (e) {
      console.error('Error creating coupon:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ active: !coupon.active })
      });

      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error('Error toggling coupon:', e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Deseja realmente apagar este cupom?')) return;
    try {
      const token = localStorage.getItem('streamhub_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.email) headers['x-user-email'] = currentUser.email;

      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error('Error deleting coupon:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            Gerenciador de Cupons & Promoções
          </h2>
          <p className="text-xs text-slate-400">
            Crie códigos promocionais de desconto em porcentagem ou valor fixo com restrições VIP.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Cupom
          </button>
        )}
      </div>

      {/* CREATE FORM */}
      {isCreating && (
        <form onSubmit={handleCreateCoupon} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Novo Código de Cupom</h3>
            <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-slate-400 hover:text-slate-200">
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Código do Cupom *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: VIP2026, STREAM20"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo de Desconto</label>
              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor do Desconto *</label>
              <input
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valor Mínimo do Pedido (R$)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="Opcional"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Limite Máximo de Usos</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 100"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Data de Validade</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="onlyVip"
              checked={onlyVip}
              onChange={(e) => setOnlyVip(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="onlyVip" className="text-xs font-bold text-amber-400 flex items-center gap-1">
              Exclusivo para Membros VIP
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              {submitting ? 'Salvando...' : 'Cadastrar Cupom'}
            </button>
          </div>
        </form>
      )}

      {/* LIST OF COUPONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Carregando cupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Nenhum cupom cadastrado.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                      {c.code}
                    </span>
                    {c.onlyVip && (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        VIP APENAS
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {c.active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Desconto: <strong>{c.discountType === 'percentage' ? `${c.discountValue}%` : `R$ ${c.discountValue.toFixed(2)}`}</strong>
                    {c.minAmount ? ` • Mínimo R$ ${c.minAmount.toFixed(2)}` : ''}
                    {c.validUntil ? ` • Válido até ${new Date(c.validUntil).toLocaleDateString()}` : ''}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Usado {c.usedCount} vez(es) {c.maxUses ? `/ limite ${c.maxUses}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                      c.active
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {c.active ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
