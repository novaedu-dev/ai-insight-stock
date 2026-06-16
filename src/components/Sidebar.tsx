import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Flame,
  Bot,
  Search,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useT } from '@/i18n';
import { LanguageToggle } from './LanguageToggle';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, key: 'nav.dashboard' as const },
  { path: '/themes', icon: Flame, key: 'nav.themes' as const },
  { path: '/ai-agent', icon: Bot, key: 'nav.aiAgent' as const },
  { path: '/stock', icon: Search, key: 'nav.stockDeepDive' as const },
  { path: '/market', icon: BarChart3, key: 'nav.marketOverview' as const },
  { path: '/settings', icon: Settings, key: 'nav.settings' as const },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useT();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0" style={{ borderBottom: '1px solid #1e293b' }}>
        <img src="/ai-insight-logo.svg" alt="AI Insight" className="h-7" />
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
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <motion.button
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => handleNav(item.path)}
              className="relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200"
              style={{
                color: isActive ? '#f1f5f9' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                  style={{ backgroundColor: '#6366f1' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={18} />
              <span>{t(item.key)}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom: Language toggle + User */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #1e293b' }}>
        <div className="lg:hidden mb-3">
          <LanguageToggle />
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: '#1e293b' }}
          >
            <span className="text-xs font-semibold text-[#6366f1]">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#f1f5f9]">AI Insight</span>
            <span className="text-[10px] text-[#64748b]">VIP Member</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-[260px] flex-col"
        style={{
          backgroundColor: '#0f172a',
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
              className="fixed left-0 top-0 bottom-0 z-[70] w-[280px] flex-col lg:hidden flex"
              style={{
                backgroundColor: '#0f172a',
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
