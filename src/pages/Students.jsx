import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) => Number(n).toLocaleString('uz-UZ') + ' so\'m';
const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const initForm = { firstname:'', lastname:'', phone:'', course_id:'', monthly_fee:'', start_date: new Date().toISOString().split('T')[0] };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editing, setEditing] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount:'', month: MONTHS[new Date().getMonth()], payment_date: new Date().toISOString().split('T')[0] });

  const load = async () => {
    const [s, c] = await Promise.all([api.get(`/students?search=${search}`), api.get('/courses')]);
    setStudents(s.data);
    setCourses(c.data);
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setForm(initForm); setEditing(null); setModal(true); };
  const openEdit = (s) => {
    setForm({ firstname:s.firstname, lastname:s.lastname, phone:s.phone, course_id:s.course_id, monthly_fee:s.monthly_fee, start_date:s.start_date });
    setEditing(s.id); setModal(true);
  };

  const handleSave = async () => {
    if (!form.firstname || !form.lastname || !form.phone || !form.course_id || !form.monthly_fee)
      return toast.error("Barcha maydonlarni to'ldiring!");
    try {
      if (editing) { await api.put(`/students/${editing}`, form); toast.success('Yangilandi ✅'); }
      else { await api.post('/students', form); toast.success('Qo\'shildi ✅'); }
      setModal(false); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Xato'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" ni o'chirasizmi?`)) return;
    await api.delete(`/students/${id}`);
    toast.success('O\'chirildi'); load();
  };

  const handleCourseChange = (courseId) => {
    const c = courses.find(c => c.id === parseInt(courseId));
    setForm(f => ({ ...f, course_id: courseId, monthly_fee: c ? c.price : f.monthly_fee }));
  };

  const openPayModal = (s) => {
    setPayModal(s);
    setPayForm({ amount: s.monthly_fee, month: MONTHS[new Date().getMonth()], payment_date: new Date().toISOString().split('T')[0] });
  };

  const handleQuickPay = async () => {
    try {
      await api.post('/payments', { student_id: payModal.id, ...payForm, year: new Date().getFullYear(), status: 'paid' });
      toast.success('To\'lov saqlandi 💳');
      setPayModal(null); load();
    } catch (e) { toast.error(e.response?.data?.message || 'Xato'); }
  };

  return (
    <div>
      <div className="sticky top-0 z-40 bg-[#111827] border-b border-[#1e2d45] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">O'quvchilar 👨‍💻</h1>
          <p className="text-slate-400 text-xs mt-0.5">Jami: {students.length} ta</p>
        </div>
        <div className="flex gap-3 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Qidirish..."
            className="bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-4 py-2 text-sm w-48 focus:outline-none focus:border-blue-500" />
          <button onClick={openAdd} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition">
            + Qo'shish
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                {['#', "O'quvchi", 'Telefon', 'Kurs', 'Oylik', 'Holat', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-[#1e2d45]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">📭 O'quvchi topilmadi</td></tr>
              ) : students.map((s, i) => (
                <tr key={s.id} className="border-b border-[#1e2d45]/50 hover:bg-blue-500/5 transition">
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{i + 1}</td>
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
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{s.phone}</td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-500/10 text-cyan-400 text-[11px] px-2 py-1 rounded-md">{s.course_name || '—'}</span>
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
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openPayModal(s)} className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-2.5 py-1.5 rounded-lg">💳</button>
                      <button onClick={() => openEdit(s)} className="text-xs bg-[#1a2235] text-slate-400 hover:text-blue-400 border border-[#1e2d45] px-2.5 py-1.5 rounded-lg">✏️</button>
                      <button onClick={() => handleDelete(s.id, `${s.firstname} ${s.lastname}`)} className="text-xs bg-[#1a2235] text-slate-400 hover:text-red-400 border border-[#1e2d45] px-2.5 py-1.5 rounded-lg">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e2d45]">
              <h2 className="font-bold text-base">{editing ? 'Tahrirlash' : "Yangi O'quvchi"}</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 w-7 h-7 bg-[#1a2235] rounded-lg flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Ism</label>
                  <input value={form.firstname} onChange={e => setForm(f => ({ ...f, firstname: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Familiya</label>
                  <input value={form.lastname} onChange={e => setForm(f => ({ ...f, lastname: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Telefon</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+998 90 ..."
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Kurs</label>
                  <select value={form.course_id} onChange={e => handleCourseChange(e.target.value)}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Tanlang</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Oylik to'lov</label>
                  <input type="number" value={form.monthly_fee} onChange={e => setForm(f => ({ ...f, monthly_fee: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Boshlanish</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#1e2d45] justify-end">
              <button onClick={() => setModal(false)} className="bg-[#1a2235] border border-[#1e2d45] text-slate-300 rounded-lg px-4 py-2 text-sm font-semibold">Bekor</button>
              <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold">
                {editing ? '✅ Yangilash' : '✅ Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e2d45]">
              <div>
                <h2 className="font-bold text-base">💳 To'lov qabul qilish</h2>
                <p className="text-xs text-slate-400 mt-0.5">{payModal.firstname} {payModal.lastname}</p>
              </div>
              <button onClick={() => setPayModal(null)} className="text-slate-400 w-7 h-7 bg-[#1a2235] rounded-lg flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Miqdor</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Oy</label>
                  <select value={payForm.month} onChange={e => setPayForm(f => ({ ...f, month: e.target.value }))}
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Sana</label>
                <input type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))}
                  className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#1e2d45] justify-end">
              <button onClick={() => setPayModal(null)} className="bg-[#1a2235] border border-[#1e2d45] text-slate-300 rounded-lg px-4 py-2 text-sm font-semibold">Bekor</button>
              <button onClick={handleQuickPay} className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-5 py-2 text-sm font-semibold">
                💳 Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}