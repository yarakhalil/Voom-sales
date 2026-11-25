import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toast } from '../common';
import { useApp } from '../../context/AppContext';

/**
 * Main application shell wrapping the navigation rail, topbar, and routed content outlet.
 */
export const Shell: React.FC = () => {
  const { railX, mobileNavOpen, setMobileNavOpen } = useApp();
  const location = useLocation();

  // Determine specific layout class based on active route requirements
  const isInboxPage = location.pathname.startsWith('/inbox');
  const isPipelinePage = location.pathname.startsWith('/pipeline');
  const isAgentsStudioPage = location.pathname.startsWith('/agents');

  let contentLayoutClass = 'content';
  if (isInboxPage) {
    contentLayoutClass = 'content inbox';
  } else if (isPipelinePage) {
    contentLayoutClass = 'content pipe';
  } else if (isAgentsStudioPage) {
    contentLayoutClass = 'content studio';
  }

  return (
    <div className={`app ${railX ? 'rail-x' : ''}`}>
      {/* Mobile Drawer Backdrop Scrim */}
      {mobileNavOpen && (
        <div
          className="scrim open"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Navigation Sidebar */}
      <Sidebar />

      {/* Central Viewport Area */}
      <div className="main" style={isInboxPage ? { overflow: 'hidden' } : undefined}>
        <Topbar />
        <main className={contentLayoutClass} id="content">
          <Outlet />
        </main>
      </div>

      {/* Global Notification Toast */}
      <Toast />
    </div>
  );
};

export default Shell;
