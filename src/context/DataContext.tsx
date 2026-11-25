import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Project,
  TeamMember,
  Agent,
  Stage,
  Chat,
  ChannelConfig,
  ActivityEvent,
  DealStatus,
  ChatMessage,
} from '../types';
import {
  initialProjects,
  initialTeam,
  initialAgents,
  initialStages,
  initialChats,
  initialChannels,
  initialEvents,
} from '../data/mockData';

interface DataContextType {
  // Collections
  /** Map of real estate projects indexed by unique project key */
  projects: Record<string, Project>;
  /** List of workspace human team members and sales advisors */
  team: TeamMember[];
  /** Configured AI agent personas */
  agents: Agent[];
  /** Sales funnel stages in the sales pipeline */
  stages: Stage[];
  /** Ongoing customer conversation sessions */
  chats: Chat[];
  /** Inbound messaging and telephony channel lines */
  channels: ChannelConfig[];
  /** Real-time activity feed events */
  events: ActivityEvent[];

  // Conversation Operations
  /** Sends an outbound text message within a chat thread */
  sendChatMessage: (chatId: string, text: string, sender?: 'agent' | 'client') => void;
  /** Toggles AI auto-reply autonomy on or off for a specific conversation */
  toggleChatAi: (chatId: string) => void;
  /** Assigns or reassigns a conversation to a human advisor (or null to unassign) */
  assignAdvisor: (chatId: string, advisorId: string | null) => void;
  /** Transitions a conversation and its deal to a new funnel stage */
  updateChatStage: (chatId: string, stageId: string) => void;
  /** Updates the deal status (e.g. won, lost, proposal, negotiation) */
  updateDealStatus: (chatId: string, ds: DealStatus) => void;
  /** Appends an internal collaborative note to the contact record */
  addChatNote: (chatId: string, text: string, author: string) => void;

  // Pipeline & Channel Configuration
  /** Modifies prompt instructions, follow-up timers, or rules for a stage */
  updateStage: (stageId: string, updates: Partial<Stage>) => void;
  /** Enables or disables a communication channel */
  toggleChannel: (channelId: string) => void;
  /** Updates channel settings, webhooks, or credentials */
  updateChannel: (channelId: string, updates: Partial<ChannelConfig>) => void;
  /** Toggles operational status of a channel (active vs offline) */
  toggleChannelStatus: (channelId: string) => void;

  // Team Management
  /** Invites a new team member to the workspace */
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  /** Updates user authorization role */
  updateTeamMemberRole: (memberId: string, role: 'admin' | 'user' | 'manager') => void;

  // Contact Operations
  /** Creates a new prospective contact lead */
  addContact: (contact: Partial<Chat>) => void;
  /** Permanently deletes a single contact record */
  deleteContact: (contactId: string) => void;
  /** Deletes multiple contact records in bulk */
  bulkDeleteContacts: (contactIds: string[]) => void;
  /** Reassigns multiple contacts to a specific advisor in bulk */
  bulkAssignContacts: (contactIds: string[], advisorId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects] = useState<Record<string, Project>>(initialProjects);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [agents] = useState<Agent[]>(initialAgents);
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [channels, setChannels] = useState<ChannelConfig[]>(initialChannels);
  const [events] = useState<ActivityEvent[]>(initialEvents);

  const sendChatMessage = (chatId: string, text: string, sender: 'agent' | 'client' = 'agent') => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender,
      text: text.trim(),
      time: timeStr,
      timestamp: Date.now(),
      type: 'text',
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          preview: text.trim(),
          mins: 0,
          messages: [...(c.messages || []), newMsg],
          ai: sender === 'agent' ? false : c.ai, // If human sends, disable AI takeover automatically
        };
      })
    );
  };

  const toggleChatAi = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const newAi = !c.ai;
        const newMsg: ChatMessage = {
          id: 'sys-' + Date.now(),
          sender: 'system',
          text: newAi
            ? 'تم تفعيل الرد الآلي للذكاء الاصطناعي على هذه المحادثة'
            : 'تم استلام المحادثة من قبل الموظف يدوياً وإيقاف الذكاء الاصطناعي',
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          type: 'event',
          systemType: newAi ? 'move' : 'stop',
        };
        return {
          ...c,
          ai: newAi,
          messages: [...c.messages, newMsg],
        };
      })
    );
  };

  const assignAdvisor = (chatId: string, advisorId: string | null) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, assigned: advisorId } : c))
    );
  };

  const updateChatStage = (chatId: string, stageId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const stageObj = stages.find((s) => s.id === stageId);
        const stageName = stageObj?.name.ar || stageId;
        const newMsg: ChatMessage = {
          id: 'sys-' + Date.now(),
          sender: 'system',
          text: `تم نقل الصفقة إلى مرحلة: ${stageName}`,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          type: 'event',
          systemType: 'move',
        };
        return {
          ...c,
          stage: stageId,
          messages: [...c.messages, newMsg],
        };
      })
    );
  };

  const updateDealStatus = (chatId: string, ds: DealStatus) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          ds,
          status: ds === 'won' || ds === 'lost' ? 'closed' : c.status,
        };
      })
    );
  };

  const addChatNote = (chatId: string, text: string, author: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const newNote = {
      id: 'note-' + Date.now(),
      author,
      text: text.trim(),
      time: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          notes: [...(c.notes || []), newNote],
        };
      })
    );
  };

  const updateStage = (stageId: string, updates: Partial<Stage>) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, ...updates } : s))
    );
  };

  const toggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch))
    );
  };

  const updateChannel = (channelId: string, updates: Partial<ChannelConfig>) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, ...updates } : ch))
    );
  };

  const toggleChannelStatus = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        const newEnabled = !ch.enabled;
        return {
          ...ch,
          enabled: newEnabled,
          status: newEnabled ? 'active' : 'offline',
          health: newEnabled ? (ch.health === 'down' ? 'ok' : ch.health) : 'off',
        };
      })
    );
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMem: TeamMember = {
      ...member,
      id: 'u' + (team.length + 1),
    };
    setTeam((prev) => [...prev, newMem]);
  };

  const updateTeamMemberRole = (memberId: string, role: 'admin' | 'user' | 'manager') => {
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m))
    );
  };

  const addContact = (contact: Partial<Chat>) => {
    const id = 'c' + (chats.length + 1);
    const newChat: Chat = {
      id,
      name: contact.name || { en: 'New Contact', ar: 'عميل جديد' },
      phone: contact.phone || '+966 50 000 0000',
      ch: contact.ch || 'whatsapp',
      project: contact.project || 'sadeel',
      lang: contact.lang || 'ar',
      status: 'open',
      priority: contact.priority || 'normal',
      ai: true,
      mins: 0,
      unread: 0,
      assigned: contact.assigned || null,
      stage: contact.stage || 's1',
      ds: contact.ds || 'new',
      budget: contact.budget || 1500000,
      unit: contact.unit || '—',
      preview: contact.preview || 'محادثة جديدة تم إنشاؤها',
      online: true,
      media: [],
      files: [],
      links: [],
      messages: [
        {
          id: 'init-' + Date.now(),
          sender: 'ai',
          text: 'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
          time: 'Now',
          type: 'text',
        },
      ],
      tags: contact.tags || ['New Lead'],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setChats((prev) => [newChat, ...prev]);
  };

  const deleteContact = (contactId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== contactId));
  };

  const bulkDeleteContacts = (contactIds: string[]) => {
    setChats((prev) => prev.filter((c) => !contactIds.includes(c.id)));
  };

  const bulkAssignContacts = (contactIds: string[], advisorId: string) => {
    setChats((prev) =>
      prev.map((c) => (contactIds.includes(c.id) ? { ...c, assigned: advisorId } : c))
    );
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        team,
        agents,
        stages,
        chats,
        channels,
        events,
        sendChatMessage,
        toggleChatAi,
        assignAdvisor,
        updateChatStage,
        updateDealStatus,
        addChatNote,
        updateStage,
        toggleChannel,
        updateChannel,
        toggleChannelStatus,
        addTeamMember,
        updateTeamMemberRole,
        addContact,
        deleteContact,
        bulkDeleteContacts,
        bulkAssignContacts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
