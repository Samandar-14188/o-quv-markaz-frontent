import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('admin@oquv.uz');
  const [password, setPassword] = useState('admin123');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleClick = async () => {
    console.log('Bosildi:', email, password);
    const ok = await login(email, password);
    console.log('Natija:', ok);
    if (ok) navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl mb-4">
            💻
          </div>
          <h1 className="text-2xl font-bold text-white">CodeCenter</h1>
          <p className="text-slate-400 text-sm mt-1">O'quv Markaz Boshqaruv Paneli</p>
        </div>

        <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-6">Kirish</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="button"
              onClick={handleClick}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm transition mt-2"
            >
              {loading ? '⏳ Yuklanmoqda...' : '🔐 Kirish'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Default: admin@oquv.uz / admin123
        </p>
      </div>
    </div>
  );
}