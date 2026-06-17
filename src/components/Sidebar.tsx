import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '대시보드' },
  { path: '/themes', icon: Layers, label: '테마분석' },
  { path: '/market', icon: TrendingUp, label: '시장동향' },
  { path: '/policy', icon: BookOpen, label: '정책예측' },
  { path: '/ai-agent', icon: Bot, label: 'AI 에이전트' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <Lightbulb size={22} className="text-indigo-400" />
        <span className="text-sm font-bold text-slate-100 tracking-tight">
          AI 주도주 발굴
        </span>
        <span className="relative flex h-2 w-2 ml-auto">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: '#10b981' }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: '#10b981' }}
          />
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => handleNav(item.path)}
              className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200"
              style={{
                color: active ? '#f1f5f9' : '#94a3b8',
                backgroundColor: active ? 'rgba(99,102,241,0.12)' : 'transparent',
              }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                  style={{ backgroundColor: '#6366f1' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: '#1e293b' }}
          >
            <span className="text-xs font-semibold text-indigo-400">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-100">AI Insight</span>
            <span className="text-[10px] text-slate-500">VIP Member</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-[240px] flex-col"
        style={{
          backgroundColor: 'rgba(15,23,42,0.95)',
          borderRight: '1px solid #1e293b',
          backdropFilter: 'blur(12px)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] lg:hidden"
              style={{ backgroundColor: 'rgba(2, 6, 23, 0.8)' }}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-[260px] flex-col lg:hidden flex"
              style={{
                backgroundColor: 'rgba(15,23,42,0.98)',
                borderRight: '1px solid #1e293b',
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
