import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n).toLocaleString('uz-UZ') + ' so\'m';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, stu, pay] = await Promise.all([
          api.get('/payments/stats'),
          api.get('/students'),
          api.get('/payments'),
        ]);
        setStats(s.data);
        setRecentStudents(stu.data.slice(0, 5));
        setRecentPayments(pay.data.slice(0, 6));
      } catch {
        toast.error('Ma\'lumot yuklashda xato');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-slate-400">⏳ Yuklanmoqda...</div>
    </div>
  );

  const chartData = stats?.monthlyIncome?.slice(0, 6).reverse().map(m => ({
    name: m.month.slice(0, 3),
    summa: Math.round(m.total / 1000)
  })) || [];

  const statCards = [
    { label: "O'quvchilar", value: stats?.totalStudents, icon: '👨‍💻', color: '#3b82f6' },
    { label: 'Jami tushum', value: stats ? (stats.totalIncome / 1000000).toFixed(1) + 'M' : '0', icon: '💰', color: '#10b981' },
    { label: 'Kutilmoqda', value: stats?.pendingCount, icon: '⏳', color: '#f59e0b' },
    { label: 'Muddati o\'tgan', value: stats?.overdueCount, icon: '⚠️', color: '#ef4444' },
  ];

  return (
    <div>
      <div className="sticky top-0 z-40 bg-[#111827] border-b border-[#1e2d45] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Dashboard 📊</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-7">
          {statCards.map((s, i) => (
            <div key={i} className="bg-[#111827] border border-[#1e2d45] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: s.color }} />
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-3xl font-black font-mono" style={{ color: s.color }}>{s.value ?? 0}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">
          <div className="col-span-2 bg-[#111827] border border-[#1e2d45] rounded-2xl p-5">
            <div className="text-sm font-bold mb-5">Oylik tushum (ming so'm)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 8 }}
                  formatter={(v) => [`${v}K so'm`, 'Tushum']}
                />
                <Bar dataKey="summa" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e2d45] text-sm font-bold">So'nggi to'lovlar</div>
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#1e2d45]/50">
                <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center text-base flex-shrink-0">💳</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{p.firstname} {p.lastname}</div>
                  <div className="text-[11px] text-slate-500">{p.month}</div>
                </div>
                <div className={`text-xs font-bold font-mono ${p.status === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
                  +{(p.amount / 1000).toFixed(0)}K
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e2d45] text-sm font-bold">So'nggi o'quvchilar</div>
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                {["O'quvchi", 'Kurs', 'Oylik', 'Holat'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-[#1e2d45]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s.id} className="border-b border-[#1e2d45]/50 hover:bg-blue-500/5 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                        {s.firstname?.[0]}{s.lastname?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{s.firstname} {s.lastname}</div>
                        <div className="text-[11px] text-slate-500">{s.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-500/10 text-cyan-400 text-[11px] font-medium px-2 py-1 rounded-md">{s.course_name || '—'}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-sm font-semibold">{fmt(s.monthly_fee)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
                      ${s.last_payment_status === 'paid' ? 'bg-green-500/10 text-green-400' :
                        s.last_payment_status === 'overdue' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'}`}>
                      {s.last_payment_status === 'paid' ? '✅ To\'langan' :
                       s.last_payment_status === 'overdue' ? '⚠️ O\'tgan' : '⏳ Kutilmoqda'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}