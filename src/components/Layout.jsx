import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/students', icon: '👨‍💻', label: "O'quvchilar" },
  { to: '/payments', icon: '💰', label: "To'lovlar" },
  { to: '/courses', icon: '📚', label: 'Kurslar' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0e1a] text-white">
      <aside className="w-60 bg-[#111827] border-r border-[#1e2d45] flex flex-col fixed top-0 bottom-0 left-0 z-50">
        <div className="flex items-center gap-3 px-5 py-6 border-b border-[#1e2d45]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg flex-shrink-0">
            💻
          </div>
          <div>
            <div className="font-bold text-sm">CodeCenter</div>
            <div className="text-[11px] text-slate-500">O'quv Markazi</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 py-2">
            Menyu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
                ${isActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:bg-[#1a2235] hover:text-white'
                }`
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e2d45]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            <div>
              <div className="text-sm font-semibold">{user?.name || 'Admin'}</div>
              <div className="text-[11px] text-slate-500">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-slate-400 hover:text-red-400 bg-[#1a2235] hover:bg-red-500/10 border border-[#1e2d45] hover:border-red-500/30 rounded-lg py-2 transition"
          >
            🚪 Chiqish
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}