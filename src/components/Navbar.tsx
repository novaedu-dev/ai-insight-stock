import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useT } from '@/i18n';
import { LanguageToggle } from './LanguageToggle';

interface NavbarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const { t } = useT();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  const pageTitles: Record<string, string> = {
    '/': t('nav.dashboard'),
    '/themes': t('nav.themes'),
    '/ai-agent': t('nav.aiAgent'),
    '/stock': t('nav.stockDeepDive'),
  };

  const currentPath = location.pathname;
  const pageTitle = pageTitles[currentPath] || t('nav.dashboard');

  return (
    <header
      className="sticky top-0 z-40 flex items-center h-14 px-4 lg:px-6"
      style={{
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e293b',
      }}
    >
      {/* Left: Hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-8 h-8 mr-3 rounded-lg"
        style={{ color: '#94a3b8' }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Center: Page title */}
      <h1 className="text-sm font-semibold text-[#f1f5f9] lg:text-base">
        {pageTitle}
      </h1>

      {/* Right: Search + Live indicator + Language */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div
          className="hidden md:flex items-center h-8 rounded-lg px-3 transition-all duration-200"
          style={{
            backgroundColor: searchFocused ? '#1e293b' : '#0f172a',
            border: `1px solid ${searchFocused ? '#334155' : '#1e293b'}`,
            width: searchFocused ? '240px' : '200px',
          }}
        >
          <Search size={14} style={{ color: '#64748b' }} className="flex-shrink-0" />
          <input
            type="text"
            placeholder={t('nav.search')}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="ml-2 bg-transparent outline-none text-xs text-[#f1f5f9] placeholder-[#64748b] w-full"
          />
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: '#10b981' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: '#10b981' }}
            />
          </span>
          <span
            className="hidden sm:inline text-[11px] font-semibold tracking-wider"
            style={{ color: '#10b981' }}
          >
            {t('nav.live')}
          </span>
        </div>

        {/* Language toggle */}
        <div className="hidden lg:block">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
