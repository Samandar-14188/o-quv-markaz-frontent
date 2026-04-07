import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const fmt = (n) => Number(n).toLocaleString("uz-UZ") + " so'm";
const MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear(),
    payment_date: new Date().toISOString().split("T")[0],
    status: "paid",
    note: "",
  });

  const load = async () => {
    const [p, s] = await Promise.all([
      api.get(`/payments${filter !== "all" ? `?status=${filter}` : ""}`),
      api.get("/students"),
    ]);
    setPayments(p.data);
    setStudents(s.data);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const filtered = payments.filter((p) => {
    const name = `${p.firstname} ${p.lastname}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      p.month.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleStudentChange = (id) => {
    const s = students.find((s) => s.id === parseInt(id));
    setForm((f) => ({
      ...f,
      student_id: id,
      amount: s ? s.monthly_fee : f.amount,
    }));
  };
  const generateMonthly = async () => {
    if (!confirm("Aprel oylik to'lovlarini yaratishni tasdiqlaysizmi?")) return;
    try {
      const { data } = await api.post("/payments/generate-monthly");
      toast.success(data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Xato");
    }
  };

  const handleSave = async () => {
    if (!form.student_id || !form.amount)
      return toast.error("Student va miqdor kerak!");
    try {
      await api.post("/payments", form);
      toast.success("To'lov saqlandi 💳");
      setModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Xato");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("To'lovni o'chirasizmi?")) return;
    await api.delete(`/payments/${id}`);
    toast.success("O'chirildi");
    load();
  };

  const tabs = [
    { key: "all", label: "Barchasi" },
    { key: "paid", label: "✅ To'langan" },
    { key: "pending", label: "⏳ Kutilmoqda" },
    { key: "overdue", label: "⚠️ Muddati o'tgan" },
  ];

  return (
    <div>
      <div className="sticky top-0 z-40 bg-[#111827] border-b border-[#1e2d45] px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">To'lovlar 💰</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Jami: {filtered.length} ta
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Qidirish..."
            className="bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-4 py-2 text-sm w-44 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => {
              setForm({
                student_id: "",
                amount: "",
                month: MONTHS[new Date().getMonth()],
                year: new Date().getFullYear(),
                payment_date: new Date().toISOString().split("T")[0],
                status: "paid",
                note: "",
              });
              setModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            + To'lov qo'sh
          </button>
          <button
            onClick={generateMonthly}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
          >
            📅 Oylik to'lovlar yarat
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl overflow-hidden">
          <div className="flex gap-1 px-5 pt-4 border-b border-[#1e2d45]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition
                  ${
                    filter === t.key
                      ? "text-blue-400 border-blue-400"
                      : "text-slate-400 border-transparent hover:text-white"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02]">
                {[
                  "#",
                  "O'quvchi",
                  "Kurs",
                  "Oy",
                  "Miqdor",
                  "Sana",
                  "Holat",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-[#1e2d45]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    📭 To'lov topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#1e2d45]/50 hover:bg-blue-500/5 transition"
                  >
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                          {p.firstname?.[0]}
                          {p.lastname?.[0]}
                        </div>
                        <span className="text-sm font-semibold">
                          {p.firstname} {p.lastname}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-500/10 text-cyan-400 text-[11px] px-2 py-1 rounded-md">
                        {p.course_name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.month} {p.year}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-green-400">
                      +{fmt(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {p.payment_date || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
                      ${
                        p.status === "paid"
                          ? "bg-green-500/10 text-green-400"
                          : p.status === "overdue"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                      >
                        {p.status === "paid"
                          ? "✅ To'langan"
                          : p.status === "overdue"
                          ? "⚠️ O'tgan"
                          : "⏳ Kutilmoqda"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs bg-[#1a2235] text-slate-400 hover:text-red-400 border border-[#1e2d45] px-2.5 py-1.5 rounded-lg"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1e2d45] rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e2d45]">
              <h2 className="font-bold text-base">Yangi To'lov</h2>
              <button
                onClick={() => setModal(false)}
                className="text-slate-400 w-7 h-7 bg-[#1a2235] rounded-lg flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                  O'quvchi
                </label>
                <select
                  value={form.student_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tanlang</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstname} {s.lastname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                    Miqdor
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                    Holat
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="paid">✅ To'langan</option>
                    <option value="pending">⏳ Kutilmoqda</option>
                    <option value="overdue">⚠️ Muddati o'tgan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                    Oy
                  </label>
                  <select
                    value={form.month}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, month: e.target.value }))
                    }
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {MONTHS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                    Sana
                  </label>
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, payment_date: e.target.value }))
                    }
                    className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">
                  Izoh
                </label>
                <input
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  placeholder="Ixtiyoriy..."
                  className="w-full bg-[#1a2235] border border-[#1e2d45] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#1e2d45] justify-end">
              <button
                onClick={() => setModal(false)}
                className="bg-[#1a2235] border border-[#1e2d45] text-slate-300 rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Bekor
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold"
              >
                💳 Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
