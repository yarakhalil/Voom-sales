import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useData } from '../../context/DataContext';
import {
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronsUpDown,
  LayoutGrid,
  MessageSquare,
  SquareKanban,
  Users,
  Bot,
  RadioTower,
  UserCog,
  Settings,
  Activity,
  ChevronUp,
  Box,
  MessageSquareText,
  PhoneCall,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    t,
    railX,
    setRailX,
    theme,
    toggleTheme,
    svcOpen,
    setSvcOpen,
    mobileNavOpen,
    setMobileNavOpen,
    toast,
  } = useApp();
  const { chats } = useData();

  const humanNeededCount = chats.filter(
    (c) => !c.ai && c.status !== 'closed' && (c.priority === 'high' || c.priority === 'urgent')
  ).length;

  const SERVICES = [
    { key: 'svc_tour', state: 'online', ok: true, icon: Box },
    { key: 'svc_social', state: 'degraded', ok: false, icon: MessageSquareText },
    { key: 'svc_call', state: 'online', ok: true, icon: PhoneCall },
  ];

  const worstDegraded = SERVICES.some((s) => !s.ok);

  return (
    <aside
      className={`sidebar ${railX || mobileNavOpen ? 'x' : ''} ${mobileNavOpen ? 'open' : ''}`}
      id="sidebar"
    >
      {/* Top Header: Toggle + Brand + Tenant Switcher */}
      <div className="r-top">
        <div className="r-head">
          <button
            className="rail-btn rail-toggle"
            type="button"
            id="railBtn"
            aria-controls="sidebar"
            aria-expanded={railX}
            aria-label={t(mobileNavOpen ? 'close_menu' : railX ? 'collapse' : 'expand')}
            title={t(mobileNavOpen ? 'close_menu' : railX ? 'collapse' : 'expand')}
            onClick={() => {
              if (mobileNavOpen) {
                setMobileNavOpen(false);
              } else {
                setRailX(!railX);
              }
            }}
          >
            {mobileNavOpen ? (
              <X className="w-5 h-5" />
            ) : railX ? (
              <PanelLeftClose className="w-5 h-5 flip-rtl" />
            ) : (
              <PanelLeftOpen className="w-5 h-5 flip-rtl" />
            )}
            <span className="lbl">{t(railX ? 'collapse' : 'expand')}</span>
          </button>

          <NavLink
            className="brand"
            to="/"
            title={t('brand')}
            onClick={() => setMobileNavOpen(false)}
          >
            <span className="brand-mark">
              <Flame className="w-6 h-6" />
            </span>
            <span className="lbl">
              <span className="brand-name">{t('brand')}</span>
              <span className="brand-sub">{t('brand_sub')}</span>
            </span>
          </NavLink>
        </div>

        <button
          className="tenant-switch"
          type="button"
          title={t('tenant')}
          onClick={() => toast(t('tenant') + ' · ' + t('plan'))}
        >
          <span className="tenant-logo">AR</span>
          <span className="lbl">
            <span className="t-name">{t('tenant')}</span>
            <span className="t-plan">{t('plan')}</span>
          </span>
          <ChevronsUpDown className="chev w-4 h-4" />
        </button>
      </div>

      {/* Nav Group 1: Workspace */}
      <nav aria-label={t('nav_main')}>
        <span className="nav-label">{t('nav_main')}</span>
        <div className="nav">
          <NavLink
            to="/"
            end
            title={t('nav_overview')}
            onClick={() => setMobileNavOpen(false)}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="lbl">{t('nav_overview')}</span>
          </NavLink>

          <NavLink
            to="/inbox"
            title={t('nav_inbox')}
            onClick={() => setMobileNavOpen(false)}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="lbl">{t('nav_inbox')}</span>
            {humanNeededCount > 0 && (
              <span className="count">{humanNeededCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/pipeline"
            title={t('nav_pipeline')}
            onClick={() => setMobileNavOpen(false)}
          >
            <SquareKanban className="w-5 h-5" />
            <span className="lbl">{t('nav_pipeline')}</span>
          </NavLink>

          <NavLink
            to="/contacts"
            title={t('nav_contacts')}
            onClick={() => setMobileNavOpen(false)}
          >
            <Users className="w-5 h-5" />
            <span className="lbl">{t('nav_contacts')}</span>
          </NavLink>
        </div>
      </nav>

      <div className="nav-sep" />

      {/* Nav Group 2: Configure */}
      <nav aria-label={t('nav_config')}>
        <span className="nav-label">{t('nav_config')}</span>
        <div className="nav">
          <NavLink
            to="/agents"
            title={t('nav_agents')}
            onClick={() => setMobileNavOpen(false)}
          >
            <Bot className="w-5 h-5" />
            <span className="lbl">{t('nav_agents')}</span>
          </NavLink>

          <NavLink
            to="/channels"
            title={t('nav_channels')}
            onClick={() => setMobileNavOpen(false)}
          >
            <RadioTower className="w-5 h-5" />
            <span className="lbl">{t('nav_channels')}</span>
          </NavLink>

          <NavLink
            to="/team"
            title={t('nav_team')}
            onClick={() => setMobileNavOpen(false)}
          >
            <UserCog className="w-5 h-5" />
            <span className="lbl">{t('nav_team')}</span>
          </NavLink>

          <NavLink
            to="/settings"
            title={t('nav_settings')}
            onClick={() => setMobileNavOpen(false)}
          >
            <Settings className="w-5 h-5" />
            <span className="lbl">{t('nav_settings')}</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer Tools: AI Services Accordion, Theme, Sign Out */}
      <div className="side-foot">
        <div className="svc-acc">
          <button
            className="rail-btn"
            type="button"
            id="svcBtn"
            aria-expanded={svcOpen}
            aria-controls="svcList"
            title={t('svc_title') + ' · ' + t(svcOpen ? 'hide_list' : 'show_list')}
            onClick={() => setSvcOpen(!svcOpen)}
          >
            <Activity className="w-5 h-5" />
            <span className="lbl">{t('svc_title')}</span>
            <span className={`dot ${worstDegraded ? 'warn' : ''}`} aria-hidden="true" />
            <ChevronUp className="s-chev w-4 h-4" />
          </button>

          <div className={`svc-list ${svcOpen ? 'open' : ''}`} id="svcList">
            <div className="svc-inner">
              <div className="svc-box" role="list">
                {SERVICES.map((s) => {
                  const SvcIcon = s.icon;
                  return (
                    <div
                      key={s.key}
                      className="svc"
                      role="listitem"
                      tabIndex={svcOpen ? 0 : -1}
                      title={t(s.key) + ' · ' + t(s.state)}
                    >
                      <span className="s-ico">
                        <SvcIcon className="w-4 h-4" />
                        <span className={`dot ${s.ok ? '' : 'warn'}`} aria-hidden="true" />
                      </span>
                      <span className="lbl s-txt">
                        <span className="s-name">{t(s.key)}</span>
                        <span className={`state ${s.ok ? '' : 'warn'}`}>{t(s.state)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button
          className="rail-btn"
          type="button"
          id="themeBtn"
          title={t('theme')}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="lbl">{t('theme')}</span>
        </button>

        <button
          className="rail-btn"
          type="button"
          title={t('sign_out')}
          onClick={() => toast(t('sign_out'))}
        >
          <LogOut className="w-5 h-5 flip-rtl" />
          <span className="lbl">{t('sign_out')}</span>
        </button>
      </div>
    </aside>
  );
};
