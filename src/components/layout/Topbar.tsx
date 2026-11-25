import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../common';
import { Menu, Search, PlugZap, Bell } from 'lucide-react';

/**
 * Global Topbar header component.
 * Displays page title with breadcrumbs, global search, API inspector toggle,
 * language switcher, notifications, and user profile avatar.
 */
export const Topbar: React.FC = () => {
  const {
    t,
    lang,
    setLang,
    showApi,
    setShowApi,
    setMobileNavOpen,
    toast,
  } = useApp();
  const location = useLocation();

  // Resolves the current page title and optional parent section crumb
  const getPageInfo = (): { title: string; crumb?: string } => {
    const path = location.pathname;
    if (path.startsWith('/inbox')) return { title: t('nav_inbox') };
    if (path.startsWith('/pipeline')) return { title: t('nav_pipeline') };
    if (path.startsWith('/contacts')) return { title: t('nav_contacts') };
    if (path.startsWith('/agents')) return { title: t('nav_agents'), crumb: t('nav_config') };
    if (path.startsWith('/channels')) return { title: t('nav_channels'), crumb: t('nav_config') };
    if (path.startsWith('/team')) return { title: t('nav_team'), crumb: t('nav_config') };
    if (path.startsWith('/settings')) return { title: t('nav_settings'), crumb: t('nav_config') };
    return { title: t('nav_overview') };
  };

  const pageInfo = getPageInfo();
  const adminName = lang === 'ar' ? 'أحمد صالح' : 'Ahmed Saleh';

  return (
    <header className="topbar" id="topbar">
      {/* Mobile Hamburger Menu Button */}
      <button
        className="icon-btn menu-btn"
        type="button"
        id="menuBtn"
        aria-label={t('menu')}
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title with Breadcrumb */}
      <div className="page-title">
        {pageInfo.crumb && <span className="crumb">{pageInfo.crumb}</span>}
        <span>{pageInfo.title}</span>
      </div>

      {/* Global Search Bar */}
      <label className="search" role="search">
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="sr-only">{t('search_ph')}</span>
        <input
          type="search"
          placeholder={t('search_ph')}
          aria-label={t('search_ph')}
        />
        <kbd>Ctrl K</kbd>
      </label>

      {/* API Map Toggle (Inspect backend endpoint bindings) */}
      <button
        className={`icon-btn api-toggle ${showApi ? 'active' : ''}`}
        type="button"
        id="apiBtn"
        aria-pressed={showApi}
        title={t('api_map')}
        aria-label={t('api_map')}
        onClick={() => {
          setShowApi(!showApi);
          toast(showApi ? 'API map disabled' : 'API map enabled');
        }}
      >
        <PlugZap className="w-4 h-4" />
      </button>

      {/* Language Switcher (EN / ع) */}
      <div className="lang-toggle" role="group" aria-label="Language">
        <button
          type="button"
          data-lang="en"
          aria-pressed={lang === 'en'}
          lang="en"
          onClick={() => setLang('en')}
        >
          EN
        </button>
        <button
          type="button"
          data-lang="ar"
          aria-pressed={lang === 'ar'}
          lang="ar"
          onClick={() => setLang('ar')}
        >
          ع
        </button>
      </div>

      {/* Notifications Bell */}
      <button
        className="icon-btn hide-sm"
        type="button"
        title={t('notifications')}
        aria-label={t('notifications')}
        onClick={() => toast(t('notifications'))}
      >
        <Bell className="w-4 h-4" />
        <span className="pip" aria-hidden="true" />
      </button>

      {/* Current User Monogram / Avatar */}
      <span
        style={{ cursor: 'pointer', display: 'inline-flex' }}
        onClick={() =>
          toast(lang === 'ar' ? 'أحمد صالح · مدير المنشأة' : 'Ahmed Saleh · Workspace Admin')
        }
      >
        <Avatar
          name={adminName}
          ring={true}
          online={true}
          title={`${adminName} · Admin`}
        />
      </span>
    </header>
  );
};

export default Topbar;
