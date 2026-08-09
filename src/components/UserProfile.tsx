import React, { useState } from 'react';
import { User } from '../types';
import { 
  User as UserIcon, Lock, Wallet, ShieldCheck, KeyRound, 
  CheckCircle2, AlertCircle, RefreshCw, Smartphone, Globe
} from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatarUrl })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser({
          ...user,
          name: data.user.name,
          avatarUrl: data.user.avatarUrl
        });
        setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Erro ao atualizar perfil.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    setIsChangingPass(true);
    setPassMsg(null);

    try {
      const token = localStorage.getItem('streamhub_token');
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPassMsg({ type: 'success', text: 'Sua senha foi alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassMsg({ type: 'error', text: data.error || 'Erro ao alterar senha.' });
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Erro de conexão ao alterar senha.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[85vh] space-y-8">
      {/* Header Profile Card */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-amber-400 to-purple-600 p-1 shadow-xl shrink-0">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.email)}&background=dc2626&color=ffffff&bold=true`}
            alt={name || user.email}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full bg-slate-950"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'VIP')}&background=dc2626&color=ffffff&bold=true`;
            }}
          />
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">{name || user.email.split('@')[0]}</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full">
              {user.role === 'admin' ? '👑 Administrador VIP' : '⭐ Cliente VIP'}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">{user.email}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              IP Recente: {user.lastIp || '127.0.0.1'}
            </span>
            {user.createdAt && (
              <span className="text-slate-400">
                Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center sm:text-right w-full sm:w-auto shrink-0 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Saldo na Carteira</span>
          <span className="text-2xl font-black text-emerald-400 block">
            R$ {(user.walletBalance || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block">Ativação Instantânea</span>
        </div>
      </div>

      {/* Main Grid Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <UserIcon className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-extrabold text-white">Dados do Perfil</h2>
          </div>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nome"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">O e-mail não pode ser alterado por razões de segurança.</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">URL da Imagem do Avatar (Opcional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/minha-foto.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isUpdatingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Atualizando...</span>
                </>
              ) : (
                <span>Salvar Alterações de Perfil</span>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-extrabold text-white">Segurança & Senha</h2>
          </div>

          {passMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              passMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repita a nova senha"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              {isChangingPass ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Alterando Senha...</span>
                </>
              ) : (
                <span>Atualizar Senha de Acesso</span>
              )}
            </button>
          </form>

          {/* Session Security - Logout Other Devices */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              Sessões Ativas & Dispositivos
            </h3>
            <p className="text-[11px] text-slate-400">
              Caso suspeite de acessos não autorizados, você pode encerrar todas as outras sessões ativas do seu e-mail.
            </p>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('streamhub_token');
                  const res = await fetch('/api/user/logout-other-sessions', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (res.ok) {
                    setPassMsg({ type: 'success', text: 'Todas as outras sessões foram encerradas!' });
                  } else {
                    setPassMsg({ type: 'error', text: 'Não foi possível encerrar outras sessões.' });
                  }
                } catch (e) {
                  setPassMsg({ type: 'error', text: 'Erro ao conectar ao servidor.' });
                }
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition flex items-center justify-center gap-2"
            >
              Desconectar de Outros Dispositivos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
