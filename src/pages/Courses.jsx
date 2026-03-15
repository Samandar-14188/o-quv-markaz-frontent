import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n).toLocaleString('uz-UZ') + ' so\'m';
const ICONS = ['🐍','🌐','📱','⚙️','🎯','🔧','🖥️','🧠'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:'', duration_months:6, price:'' });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const r = await api.get('/courses');
    setCourses(r.data);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (c) => {
    setForm({ name:c.name, duration_months:c.duration_months, price:c.price });
    setEditing(c.id); setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Nom va narx kerak!');
    try {
      if (editing) { await api.put(`/courses/${editing}`, form); toast.success('Yangilandi ✅'); }
      else { await api.post('/courses', form); toast.success('Kurs qo\'shildi ✅'); }
      setModal(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Xato'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" kursini o'chirasizmi?`)) return;
    await api.delete(`/courses/${id}`);
    toast.success('O\'chirildi'); load();
  };

  return (
    <div>
      <div className="sticky top-0 z-40 bg-[#111827] border-b border-[#1e2d45] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Kurslar 📚</h1>
          <p className="text-slate-400 text-xs mt-0.5">Jami: {courses.length} ta</p>
        </div>
        <button onClick={() => { setForm({name:'',duration_months:6,price:''}); setEditing(null); setModal(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition">
          + Kurs qo'sh
        </button>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-5">
          {courses.map((c, i) => (
            <div key={c.id} className="bg-[#111827] border border-[#1e2d45] rounded-2xl p-6 hover:border-blue-500/30 transition">
              <div className="text-4xl mb-4">{ICONS[i % ICONS.length]}</div>
              <h3 className="text-base font-bold mb-1">{c.name}</h3>
              <p className="text-slate-400 text-xs mb-4">{c.duration_months} oy davomiylik</p>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-base font-bold text-green-400">{fmt(c.price)}</span>
                <span className="bg-blue-500/10 text-cyan-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {c.student_count || 0} o'quvchi
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="flex-1 bg-[#1a2235] hover:bg-blue-500/10 border border-[#1e2d45] text-slate-300 hover:text-blue-400 rounded-lg py-2 text-xs font-semibold transition">
                  ✏️ Tahrirlash
                </button>
                <button onClick={() => handleDelete(c.id, c.name)} className="bg-[#1a2235] hover:bg-red-500/10 border border-[#1e2d45] text-slate-400 hover:text-red-400 rounded-lg px-3 py-2 text-xs transition">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e2d45]">
              <h2 className="font-bold text-base">{editing ? 'Tahrirlash' : 'Yangi Kurs'}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 w-7 h-7 bg-[#1a2235] rounded-lg flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Kurs nomi</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Python, Web..."
                  className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Davomiyligi (oy)</label>
                  <input type="number" value={form.duration_months} onChange={e => setForm(f => ({ ...f, duration_months: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Narxi (so'm)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#1e2d45] justify-end">
              <button onClick={() => setModal(false)} className="bg-[#1a2235] border border-[#1e2d45] text-slate-300 rounded-lg px-4 py-2 text-sm font-semibold">Bekor</button>
              <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold">
                ✅ {editing ? 'Yangilash' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}