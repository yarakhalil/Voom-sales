import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import { Shell } from './components/layout/Shell';
import { OverviewPage } from './pages/OverviewPage';
import { InboxPage } from './pages/InboxPage';
import { PipelinePage } from './pages/PipelinePage';
import { ContactsPage } from './pages/ContactsPage';
import { AgentsPage } from './pages/AgentsPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Shell />}>
              <Route index element={<OverviewPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="channels" element={<ChannelsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AppProvider>
  );
};

export default App;
