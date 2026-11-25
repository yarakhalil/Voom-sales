import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { ChannelBadge, DealStatusBadge } from '../components/common';
import { Chat, Channel, DealStatus } from '../types';
import {
  Search,
  SquarePen,
  ArrowDownWideNarrow,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  Phone,
  CircleCheckBig,
  Sparkles,
  Hand,
  Check,
  CheckCheck,
  FileText,
  Download,
  Play,
  Pause,
  Captions,
  Rotate3d,
  AlarmClock,
  GitCommitHorizontal,
  PhoneCall,
  PencilLine,
  WandSparkles,
  Mic,
  Image as ImageIcon,
  Paperclip,
  SendHorizontal,
  Info,
  Contact,
  NotebookPen,
  Briefcase,
  Route,
  CircleDot,
  Images,
  EllipsisVertical,
  FolderOpen,
  Link2,
  Flag,
  UserRound,
  SquareKanban,
  House,
  Building2,
  X,
  Inbox as InboxIcon,
} from 'lucide-react';

interface OutboundTextMessage {
  direction: 'out';
  isAi: false;
  text: string;
  sentAt: number;
  status: 'sent';
}

export const InboxPage: React.FC = () => {
  const { t, L, money, timeAgo, toast, lang, initials, avatarTone, n } = useApp();
  const {
    chats,
    team,
    projects,
    stages,
    toggleChatAi,
    assignAdvisor,
    updateDealStatus,
  } = useData();

  const [searchParams] = useSearchParams();
  const paramFilter = searchParams.get('filter');
  const paramChat = searchParams.get('chat');

  const [activeTab, setActiveTab] = useState<'all' | 'human' | 'ai' | 'mine' | 'closed'>(
    paramFilter === 'human' ? 'human' : 'all'
  );
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string>(paramChat || chats[0]?.id || 'c1');
  const [extraMessages, setExtraMessages] = useState<Record<string, OutboundTextMessage[]>>({});
  const [activeDetailsTab, setActiveDetailsTab] = useState<'details' | 'deal' | 'files'>('details');

  const [hideLeftColumn, setHideLeftColumn] = useState<boolean>(false);
  const [hideRightColumn, setHideRightColumn] = useState<boolean>(false);
  const [mobileThreadOpen, setMobileThreadOpen] = useState<boolean>(!!paramChat);
  const [mobilePanelOpen, setMobilePanelOpen] = useState<boolean>(false);

  const [replyText, setReplyText] = useState<string>('');
  const [notes, setNotes] = useState<Record<string, string>>({
    c1: 'يفضّل التواصل بعد صلاة العصر. عائلة كبيرة — يهمه قرب المدارس.',
  });
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  const msgsContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync paramChat
  useEffect(() => {
    if (paramChat && chats.some((c: Chat) => c.id === paramChat)) {
      setSelectedId(paramChat);
      setMobileThreadOpen(true);
    }
  }, [paramChat, chats]);

  // Current chat & project
  const currentChat = useMemo(() => {
    return chats.find((c: Chat) => c.id === selectedId) || chats[0];
  }, [chats, selectedId]);

  const currentProject = useMemo(() => {
    return currentChat ? projects[currentChat.project] : null;
  }, [projects, currentChat]);

  const currentChatIndex = useMemo(() => {
    return chats.findIndex((c: Chat) => c.id === selectedId);
  }, [chats, selectedId]);

  // Needs human predicate
  const isNeedsHuman = (c: Chat) =>
    !c.ai && c.status !== 'closed' && (c.priority === 'high' || c.priority === 'urgent');

  // Urgent list
  const urgentList = useMemo(() => {
    return chats.filter(isNeedsHuman);
  }, [chats]);

  // Filtered chat list
  const filteredChats = useMemo(() => {
    return chats
      .filter((c: Chat) => {
        if (activeTab === 'all') return c.status !== 'closed';
        if (activeTab === 'human') return isNeedsHuman(c);
        if (activeTab === 'ai') return c.ai && c.status !== 'closed';
        if (activeTab === 'mine') return c.assigned === 'u1';
        if (activeTab === 'closed') return c.status === 'closed';
        return true;
      })
      .filter((c: Chat) => !selectedChannel || c.ch === selectedChannel)
      .filter((c: Chat) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        const text = [c.name.en, c.name.ar, c.phone, c.unit].join(' ').toLowerCase();
        return text.includes(q);
      })
      .sort((a: Chat, b: Chat) => {
        const diffHuman = (isNeedsHuman(b) ? 1 : 0) - (isNeedsHuman(a) ? 1 : 0);
        if (diffHuman !== 0) return diffHuman;
        return a.mins - b.mins;
      });
  }, [chats, activeTab, selectedChannel, searchQuery]);

  // Scroll to bottom on new message or change chat
  useEffect(() => {
    if (msgsContainerRef.current) {
      msgsContainerRef.current.scrollTop = msgsContainerRef.current.scrollHeight;
    }
  }, [selectedId, extraMessages]);

  // Name helper
  const nm = (c?: Chat) => (c ? L(c.name) : '');
  const agentName = (c?: Chat) =>
    c?.ch === 'phone' ? (lang === 'ar' ? 'نور' : 'Nour') : (lang === 'ar' ? 'فهد' : 'Fahad');

  // Avatar helper
  const renderAvatar = (
    name: string,
    opts: {
      size?: string;
      ring?: 'alert' | 'ok' | boolean;
      online?: boolean | null;
      title?: boolean;
    } = {}
  ) => {
    const ini = initials(name);
    const tone = avatarTone(ini);
    const ringClass = opts.ring ? `ring ${opts.ring === true ? '' : `ring-${opts.ring}`}` : '';
    return (
      <span
        className={`avatar ${opts.size || ''} ${ringClass} t${tone}`}
        data-tone
        title={opts.title !== false ? name : undefined}
      >
        {ini}
        {opts.online !== undefined && opts.online !== null && (
          <i className={`presence ${opts.online ? '' : 'off'}`} aria-hidden="true" />
        )}
      </span>
    );
  };

  const handleSelectChat = (id: string) => {
    setSelectedId(id);
    const target = chats.find((c: Chat) => c.id === id);
    if (target) target.unread = 0;
    setMobileThreadOpen(true);
  };

  const handleToggleAi = (on: boolean) => {
    if (!currentChat) return;
    toggleChatAi(currentChat.id);
    toast(t(on ? 'ai_on_toast' : 'ai_off_toast'));
  };

  const handleSend = () => {
    if (!replyText.trim() || !currentChat) return;
    const text = replyText.trim();
    setExtraMessages((prev) => ({
      ...prev,
      [currentChat.id]: [
        ...(prev[currentChat.id] || []),
        { direction: 'out', isAi: false, text, sentAt: Date.now(), status: 'sent' },
      ],
    }));
    currentChat.preview = text;
    currentChat.mins = 0;
    currentChat.typing = null;
    if (currentChat.priority === 'high') currentChat.priority = 'normal';
    setReplyText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    toast(t('sent_toast'));
  };

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // 34 audio wave bar heights using the same deterministic formula as the prototype
  const waveHeights = useMemo(() => {
    let s = 7;
    return Array.from({ length: 34 }, () => {
      s = (s * 9301 + 49297) % 233280;
      return 6 + (s / 233280) * 20;
    });
  }, []);

  // Stage lookup
  const stageMap = useMemo(() => {
    return Object.fromEntries(stages.map((s) => [s.id, s]));
  }, [stages]);

  const STAGE_ORDER = ['s1', 's2', 's3', 's4', 's5'];

  // Current stage index in pipeline
  const currentStageIndex = currentChat ? STAGE_ORDER.indexOf(currentChat.stage) : 0;
  const currentOwner = currentChat ? team.find((u) => u.id === currentChat.assigned) : null;

  // Media, files, links computed identically to data.js
  const chatMedia = useMemo(() => {
    if (!currentChat || !currentProject) return [];
    return [0, 1, 2, 3].map((k) => ({
      label:
        k === 0 && currentChat.unit !== '—'
          ? currentChat.unit
          : `${currentProject.kind.en === 'Villas' ? 'Villa' : 'Unit'} ${String.fromCharCode(
              65 + ((currentChatIndex + k) % 5)
            )}-${(k + 1) * 3 + currentChatIndex}`,
      hue: (currentChatIndex * 47 + k * 61) % 360,
      kind: currentProject.kind.en === 'Villas' ? 'house' : 'building-2',
    }));
  }, [currentChat, currentProject, currentChatIndex]);

  const slug = (str: string) => str.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const chatFiles = useMemo(() => {
    if (!currentChat || !currentProject) return [];
    const pSlug = slug(currentProject.name.en);
    const uSlug = slug(currentChat.unit === '—' ? 'Typical' : currentChat.unit);
    return [
      { name: `${pSlug}-Brochure.pdf`, size: '2.4 MB', days: 1 + (currentChatIndex % 3) },
      { name: `Payment-Plan-${pSlug}-2026.pdf`, size: '640 KB', days: 2 + (currentChatIndex % 4) },
      { name: `Floor-Plan-${uSlug}.pdf`, size: '1.1 MB', days: 4 + (currentChatIndex % 5) },
    ];
  }, [currentChat, currentProject, currentChatIndex]);

  const chatLinks = useMemo(() => {
    if (!currentChat) return [];
    const uSlug = slug(currentChat.unit === '—' ? 'showroom' : currentChat.unit).toLowerCase();
    return [`https://tours.alruba.sa/${currentChat.project}/${uSlug}`];
  }, [currentChat]);

  // Tab definitions
  const TABS = [
    { id: 'all', label: t('tab_all'), count: chats.filter((c) => c.status !== 'closed').length },
    { id: 'human', label: t('tab_human'), count: chats.filter(isNeedsHuman).length, hot: true },
    { id: 'ai', label: t('tab_ai'), count: chats.filter((c) => c.ai && c.status !== 'closed').length },
    { id: 'mine', label: t('tab_mine'), count: chats.filter((c) => c.assigned === 'u1').length },
    { id: 'closed', label: t('tab_closed'), count: chats.filter((c) => c.status === 'closed').length },
  ];

  const CHANNELS: Channel[] = ['whatsapp', 'instagram', 'telegram', 'messenger', 'phone', 'tour', 'email'];

  return (
    <div
      className={`ibx ${hideLeftColumn ? 'no-l' : ''} ${hideRightColumn ? 'no-r' : ''} ${
        mobileThreadOpen ? 'show-thread' : ''
      }`}
      id="ibx"
    >
      {/* ============================================================== */}
      {/* PANE 1: Conversation List                                      */}
      {/* ============================================================== */}
      <section
        className="pane list-pane"
        id="listPane"
        aria-labelledby="lh"
        data-api="GET /tenants/{tid}/chats/ (+contacts, deals) · filters are NEW"
      >
        <div className="l-scroll">
          {/* Urgent "Needs you now" Carousel */}
          {urgentList.length > 0 && (
            <div
              className="now gap"
              id="now"
              data-api="chats where !ai_enabled & priority∈{high,urgent} (client filter)"
            >
              <div className="now-h">
                <h2>{t('needs_you_now')}</h2>
                <span className="muted">
                  {t('waiting_n').replace('{n}', n(urgentList.length))}
                </span>
              </div>
              <div className="now-row">
                {urgentList.slice(0, 4).map((c: Chat) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectChat(c.id)}
                    aria-label={`${nm(c)} · ${t('why_' + (c.takeover || 'followups'))}`}
                    title={t('why_' + (c.takeover || 'followups'))}
                  >
                    {renderAvatar(nm(c), { ring: 'alert', online: c.online, title: false })}
                    <span className="nm">{nm(c).split(' ')[0]}</span>
                  </button>
                ))}
                {urgentList.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('human')}
                    aria-label={t('tab_human')}
                  >
                    <span className="more num">+{n(urgentList.length - 4)}</span>
                    <span className="nm">{t('view_all')}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List Title & Header Icons */}
          <div className="l-title">
            <h2 id="lh">{t('messages_t')}</h2>
            <span className="badge num" id="lcount">
              {n(filteredChats.length)}
            </span>
            <span style={{ flex: 1 }} />
            <button
              className="icon-btn"
              type="button"
              title={t('new_msg')}
              aria-label={t('new_msg')}
              onClick={() => toast(t('new_msg'))}
            >
              <SquarePen className="w-4 h-4" />
            </button>
            <button
              className="icon-btn"
              type="button"
              title={t('sort')}
              aria-label={t('sort')}
              onClick={() => toast(t('sort'))}
            >
              <ArrowDownWideNarrow className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <label className="l-search">
            <Search className="ico-sm w-4 h-4" />
            <span className="sr-only">{t('search_chats')}</span>
            <input
              type="search"
              id="q"
              placeholder={t('search_chats')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          {/* Segmented Filter Tabs */}
          <div className="ltabs" role="tablist" id="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={activeTab === tab.id}
                className={tab.hot && tab.count > 0 ? 'hot' : ''}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
                <span className="n num">{n(tab.count)}</span>
              </button>
            ))}
          </div>

          {/* Channel Filter Chips */}
          <div
            className="chips"
            id="chFilter"
            role="group"
            aria-label="Channels"
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <button
              className="chip"
              type="button"
              aria-pressed={!selectedChannel}
              onClick={() => setSelectedChannel('')}
            >
              {t('all_channels')}
            </button>
            {CHANNELS.map((ch) => (
              <button
                key={ch}
                className="chip"
                type="button"
                aria-pressed={selectedChannel === ch}
                onClick={() => setSelectedChannel(ch)}
              >
                <ChannelBadge channel={ch} size="sm" />
                {t('ch_' + ch)}
              </button>
            ))}
          </div>

          {/* Conversations List */}
          <div className="list" id="list" role="list">
            {filteredChats.length > 0 ? (
              filteredChats.map((c: Chat) => {
                const p = projects[c.project];
                const isSelected = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    className={`item ${c.unread ? 'unread' : ''}`}
                    type="button"
                    role="listitem"
                    aria-current={isSelected}
                    onClick={() => handleSelectChat(c.id)}
                  >
                    <span className="av-wrap">
                      {renderAvatar(nm(c), { online: c.online, title: false })}
                      <ChannelBadge channel={c.ch} />
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span className="i-top">
                        <span className="i-name">{nm(c)}</span>
                        <span className="i-time">{timeAgo(c.mins)}</span>
                      </span>
                      <span className="i-mid">
                        {c.typing ? (
                          <span className="i-prev typing-t">
                            <PencilLine className="w-3.5 h-3.5" />
                            {t(c.typing === 'ai' ? 'ai_typing' : 'client_typing')}
                          </span>
                        ) : (
                          <span className="i-prev" dir="auto">
                            {c.preview}
                          </span>
                        )}
                        {c.unread > 0 && (
                          <span className="count num" aria-label={`${c.unread} unread`}>
                            {n(c.unread)}
                          </span>
                        )}
                      </span>
                      <span className="i-tags">
                        {isNeedsHuman(c) ? (
                          <span className="badge danger">
                            <Hand className="w-3 h-3" />
                            {t('needs_human')}
                          </span>
                        ) : c.ai ? (
                          <span className="badge ai">
                            <Sparkles className="w-3 h-3" />
                            {t('ai_short')}
                          </span>
                        ) : null}
                        {p && <span className="badge outline">{L(p.name)}</span>}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="empty">
                <InboxIcon className="w-8 h-8" />
                <p>—</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PANE 2: Thread                                                 */}
      {/* ============================================================== */}
      {currentChat && (
        <section className="pane thread" aria-label="Conversation">
          {/* Thread Header */}
          <div className="t-head" id="thead">
            {/* Back button for mobile */}
            <button
              className="icon-btn back-btn"
              type="button"
              id="backBtn"
              aria-label={t('back')}
              onClick={() => setMobileThreadOpen(false)}
            >
              <ArrowLeft className="flip-rtl w-4 h-4" />
            </button>

            {/* Toggle left list pane button on desktop */}
            <button
              className="icon-btn pane-tg"
              type="button"
              id="lToggle"
              aria-controls="listPane"
              aria-expanded={!hideLeftColumn}
              aria-label={t(hideLeftColumn ? 'show_conv' : 'hide_conv')}
              title={t(hideLeftColumn ? 'show_conv' : 'hide_conv')}
              onClick={() => setHideLeftColumn((p) => !p)}
            >
              {hideLeftColumn ? (
                <PanelLeftOpen className="flip-rtl w-4 h-4" />
              ) : (
                <PanelLeftClose className="flip-rtl w-4 h-4" />
              )}
            </button>

            {/* Avatar */}
            {renderAvatar(nm(currentChat), {
              size: 'lg',
              ring: isNeedsHuman(currentChat) ? 'alert' : currentChat.ai ? true : 'ok',
              online: currentChat.online,
              title: false,
            })}

            {/* Contact details */}
            <div className="t-who">
              <div className="t-name">{nm(currentChat)}</div>
              <div className="t-meta">
                <ChannelBadge channel={currentChat.ch} size="sm" />
                <span>{t('ch_' + currentChat.ch)}</span>
                <span className="hide-c">·</span>
                <span className="ltr num hide-c">{currentChat.phone}</span>
                <span>·</span>
                <span>{currentProject ? L(currentProject.name) : currentChat.project}</span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="t-actions">
              {/* AI Switch */}
              <label
                className={`ai-switch ${currentChat.ai ? 'on' : ''}`}
                data-api="PATCH /chats/{id} {ai_enabled}"
              >
                <span className="switch">
                  <input
                    type="checkbox"
                    id="aiToggle"
                    checked={currentChat.ai}
                    onChange={(e) => handleToggleAi(e.target.checked)}
                  />
                  <span className="track" />
                </span>
                <span className="lbl">{t('ai_replies')}</span>
              </label>

              {/* Assign Dropdown */}
              <select
                className="select assign"
                aria-label={t('assign')}
                id="assignSel"
                data-api="PATCH /chats/{id} {assigned_to}"
                value={currentChat.assigned || ''}
                onChange={(e) => {
                  assignAdvisor(currentChat.id, e.target.value || null);
                  toast(t('saved'));
                }}
              >
                <option value="">{t('unassigned_opt')}</option>
                {team.map((u) => (
                  <option key={u.id} value={u.id}>
                    {L(u.name)}
                  </option>
                ))}
              </select>

              {/* Call Link */}
              <a
                className="icon-btn call-btn"
                href={`tel:${currentChat.phone.replace(/\s/g, '')}`}
                aria-label={t('call')}
                title={t('call')}
              >
                <Phone className="w-4 h-4" />
              </a>

              {/* Mark closed button */}
              <button
                className="icon-btn close-btn"
                type="button"
                title={t('mark_closed')}
                aria-label={t('mark_closed')}
                onClick={() => toast(t('saved'))}
              >
                <CircleCheckBig className="w-4 h-4" />
              </button>

              {/* Toggle right context panel button */}
              <button
                className="icon-btn pane-tg"
                type="button"
                id="panelBtn"
                aria-controls="panel"
                aria-expanded={!hideRightColumn}
                aria-label={t(!hideRightColumn ? 'hide_details' : 'show_details')}
                title={t(!hideRightColumn ? 'hide_details' : 'show_details')}
                onClick={() => {
                  if (window.innerWidth <= 1360) {
                    setMobilePanelOpen(true);
                  } else {
                    setHideRightColumn((p) => !p);
                  }
                }}
              >
                {hideRightColumn ? (
                  <PanelRightOpen className="flip-rtl w-4 h-4" />
                ) : (
                  <PanelRightClose className="flip-rtl w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            className="msgs"
            id="msgs"
            ref={msgsContainerRef}
            aria-live="polite"
            data-api="GET /tenants/{tid}/messages/cursor · NEW ?chat_id= filter"
          >
            {/* Conversation Render */}
            {currentChat.id === 'c1' ? (
              <>
                <div className="day">{t('yesterday')}</div>

                {/* Msg 1 */}
                <div className="m in">
                  <div className="m-av">
                    {renderAvatar(nm(currentChat), { title: false })}
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {nm(currentChat)}
                      <span className="tm num">{timeAgo(1500)}</span>
                    </div>
                    <div className="bubble" dir="auto">
                      السلام عليكم، شفت إعلان مشروع سديل في مكة. فيه فلل متاحة؟
                    </div>
                  </div>
                </div>

                {/* Msg 2 (AI) */}
                <div className="m out">
                  <div className="m-av">
                    <span className="avatar ai-av" data-tone>
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {agentName(currentChat)}
                      <span className="ai-tag">
                        <Sparkles className="w-3 h-3" />
                        {t('ai_short')}
                      </span>
                      <span className="tm num">{timeAgo(1499)}</span>
                      <CheckCheck className="tk read w-3.5 h-3.5" />
                    </div>
                    <div className="bubble" dir="auto">
                      وعليكم السلام ورحمة الله، حيّاك الله! إيه عندنا فلل متاحة في سديل بثمانية نماذج. الفيلا لسكن العائلة ولا للاستثمار؟
                    </div>
                  </div>
                </div>

                {/* Msg 3 */}
                <div className="m in">
                  <div className="m-av">
                    {renderAvatar(nm(currentChat), { title: false })}
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {nm(currentChat)}
                      <span className="tm num">{timeAgo(1480)}</span>
                    </div>
                    <div className="bubble" dir="auto">
                      للسكن، عندي ٥ عيال. الميزانية حول ٢٫٤ مليون
                    </div>
                  </div>
                </div>

                {/* Msg 4 (AI Units) */}
                <div className="m out cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="units">
                      <div className="unit">
                        <div className="tile" style={{ '--h': 32 } as React.CSSProperties}>
                          <House className="w-9 h-9" />
                          <span className="badge">{t('avail')}</span>
                        </div>
                        <div className="u-b">
                          <div className="u-t">Model 4 · B-12</div>
                          <div className="u-s">
                            <span>5 {t('beds')}</span>
                            <span>420 {t('sqm')}</span>
                          </div>
                          <div className="u-p num">{money(2350000, 'SAR', false)}</div>
                          <a className="u-a" href="#" onClick={(e) => e.preventDefault()}>
                            <Rotate3d className="ico-sm w-4 h-4" />
                            {t('tour_open')}
                          </a>
                        </div>
                      </div>
                      <div className="unit">
                        <div className="tile" style={{ '--h': 168 } as React.CSSProperties}>
                          <House className="w-9 h-9" />
                          <span className="badge">{t('avail')}</span>
                        </div>
                        <div className="u-b">
                          <div className="u-t">Model 6 · D-03</div>
                          <div className="u-s">
                            <span>5 {t('beds')}</span>
                            <span>455 {t('sqm')}</span>
                          </div>
                          <div className="u-p num">{money(2480000, 'SAR', false)}</div>
                          <a className="u-a" href="#" onClick={(e) => e.preventDefault()}>
                            <Rotate3d className="ico-sm w-4 h-4" />
                            {t('tour_open')}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Msg 5 (PDF Brochure) */}
                <div className="m out cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="file">
                      <span className="f-ico pdf">
                        <FileText className="w-5 h-5" />
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <div className="f-n">Sadeel-Model-4-Brochure.pdf</div>
                        <div className="f-s">PDF · 2.4 MB</div>
                      </span>
                      <button
                        className="icon-btn"
                        style={{ marginInlineStart: 'auto', width: 34, height: 34 }}
                        aria-label="download"
                        onClick={() => toast('Downloading brochure...')}
                      >
                        <Download className="ico-sm w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sys move */}
                <div className="sys move" role="note">
                  <GitCommitHorizontal className="w-4 h-4" />
                  <span>
                    {t('moved')
                      .replace('{a}', stageMap.s3 ? L(stageMap.s3.name) : '')
                      .replace('{b}', stageMap.s4 ? L(stageMap.s4.name) : '')}
                  </span>
                </div>

                {/* Msg 6 (Voice Note) */}
                <div className="m in">
                  <div className="m-av">
                    {renderAvatar(nm(currentChat), { title: false })}
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {nm(currentChat)}
                      <span className="tm num">{timeAgo(1460)}</span>
                    </div>
                    <div className="bubble">
                      <div className="voice">
                        <button
                          className="play"
                          aria-label="play"
                          type="button"
                          onClick={() => setIsAudioPlaying((p) => !p)}
                        >
                          {isAudioPlaying ? (
                            <Pause className="ico-sm w-4 h-4" />
                          ) : (
                            <Play className="ico-sm w-4 h-4 ms-0.5" />
                          )}
                        </button>
                        <span className="wave">
                          {waveHeights.map((h, i) => (
                            <i
                              key={i}
                              style={{
                                height: `${h}px`,
                                background: isAudioPlaying ? 'var(--brand)' : undefined,
                              }}
                            />
                          ))}
                        </span>
                        <span className="dur num">0:18</span>
                      </div>
                      <div className="transcript">
                        <Captions className="ico-sm w-4 h-4" />
                        <span dir="auto">ممكن أزور الموقع وأشوف الفيلا على الطبيعة؟</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Msg 7 (AI Response) */}
                <div className="m out">
                  <div className="m-av">
                    <span className="avatar ai-av" data-tone>
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {agentName(currentChat)}
                      <span className="ai-tag">
                        <Sparkles className="w-3 h-3" />
                        {t('ai_short')}
                      </span>
                      <span className="tm num">{timeAgo(1459)}</span>
                      <CheckCheck className="tk read w-3.5 h-3.5" />
                    </div>
                    <div className="bubble" dir="auto">
                      أكيد! نرتب لك زيارة لمركز المبيعات. يناسبك الخميس ٤:٣٠ العصر ولا السبت ١١ الصبح؟
                    </div>
                  </div>
                </div>

                {/* Sys fu 1 */}
                <div className="sys fu" role="note">
                  <AlarmClock className="w-4 h-4" />
                  <span>{t('fu_sent').replace('{n}', n(1))}</span>
                </div>

                {/* Msg 8 (Follow up 1) */}
                <div className="m out cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="who-line">
                      {agentName(currentChat)}
                      <span className="ai-tag">
                        <Sparkles className="w-3 h-3" />
                        {t('ai_short')}
                      </span>
                      <span className="tm num">{timeAgo(740)}</span>
                      <CheckCheck className="tk w-3.5 h-3.5" />
                    </div>
                    <div className="bubble" dir="auto">
                      أبو فهد، حبيت أتأكد وصلتك مواعيد الزيارة؟ الفلل نموذج ٤ عليها طلب عالي هالأسبوع.
                    </div>
                  </div>
                </div>

                {/* Sys fu 2 */}
                <div className="sys fu" role="note">
                  <AlarmClock className="w-4 h-4" />
                  <span>{t('fu_sent').replace('{n}', n(2))}</span>
                </div>

                {/* Msg 9 (Follow up 2) */}
                <div className="m out cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="who-line">
                      {agentName(currentChat)}
                      <span className="ai-tag">
                        <Sparkles className="w-3 h-3" />
                        {t('ai_short')}
                      </span>
                      <span className="tm num">{timeAgo(20)}</span>
                      <CheckCheck className="tk w-3.5 h-3.5" />
                    </div>
                    <div className="bubble" dir="auto">
                      نقدر كمان نسوي لك جولة افتراضية ثلاثية الأبعاد من البيت لو ما يناسبك تجي.
                    </div>
                  </div>
                </div>

                <div className="day">{t('today_d')}</div>

                {/* Sys stop takeover */}
                <div className="sys stop" role="note">
                  <Hand className="w-4 h-4" />
                  <span>{t('takeover')}</span>
                </div>

                {/* Msg 10, 11, 12 in */}
                <div className="m in">
                  <div className="m-av">
                    {renderAvatar(nm(currentChat), { title: false })}
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {nm(currentChat)}
                      <span className="tm num">{timeAgo(8)}</span>
                    </div>
                    <div className="bubble" dir="auto">
                      أبغى أشوف الفيلا نموذج ٤ يوم الخميس بعد العصر
                    </div>
                  </div>
                </div>

                <div className="m in cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="bubble" dir="auto">
                      وهل فيه خصم للدفع كاش؟
                    </div>
                  </div>
                </div>

                <div className="m in cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="bubble" dir="auto">
                      ياليت أحد يتواصل معي اليوم
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="day">{t('today_d')}</div>

                <div className="m in">
                  <div className="m-av">
                    {renderAvatar(nm(currentChat), { title: false })}
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {nm(currentChat)}
                      <span className="tm num">{timeAgo(currentChat.mins + 40)}</span>
                    </div>
                    <div className="bubble" dir="auto">
                      {currentChat.lang === 'en'
                        ? 'Hi, I saw your listing and I am interested.'
                        : 'السلام عليكم، مهتم بالمشروع'}
                    </div>
                  </div>
                </div>

                <div className="m out">
                  <div className="m-av">
                    <span className="avatar ai-av" data-tone>
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="m-col">
                    <div className="who-line">
                      {agentName(currentChat)}
                      <span className="ai-tag">
                        <Sparkles className="w-3 h-3" />
                        {t('ai_short')}
                      </span>
                      <span className="tm num">{timeAgo(currentChat.mins + 39)}</span>
                      <CheckCheck className="tk read w-3.5 h-3.5" />
                    </div>
                    <div className="bubble" dir="auto">
                      {currentChat.lang === 'en'
                        ? `Welcome! Happy to help you with ${
                            currentProject ? L(currentProject.name) : currentChat.project
                          }. Are you looking to live in or invest?`
                        : `وعليكم السلام، حيّاك الله! يسعدني أساعدك في مشروع ${
                            currentProject?.name.ar || ''
                          }. تبحث عن سكن ولا استثمار؟`}
                    </div>
                  </div>
                </div>

                {currentChat.ch === 'phone' && (
                  <div className="sys move" role="note">
                    <PhoneCall className="w-4 h-4" />
                    <span>
                      Call · 4:12 ·{' '}
                      {currentChat.lang === 'en' ? 'summary saved by Nour' : 'حفظت نور ملخص المكالمة'}
                    </span>
                  </div>
                )}

                <div className="m in cont">
                  <div className="m-av" />
                  <div className="m-col">
                    <div className="bubble" dir="auto">
                      {currentChat.preview}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Extra sent messages */}
            {(extraMessages[currentChat.id] || []).map((msg, idx) => (
              <div key={idx} className="m out human">
                <div className="m-av">
                  {renderAvatar(L(team[0].name), { title: false })}
                </div>
                <div className="m-col">
                  <div className="who-line">
                    {t('you')}
                    <span className="tm num">{timeAgo(0)}</span>
                    <Check className="tk w-3.5 h-3.5" />
                  </div>
                  <div className="bubble" dir="auto">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing line */}
            {currentChat.typing && (
              <div className="typing-line">
                {currentChat.typing === 'ai' ? (
                  <span className="avatar ai-av sm" data-tone>
                    <Sparkles className="w-3 h-3" />
                  </span>
                ) : (
                  renderAvatar(nm(currentChat), { size: 'sm', title: false })
                )}
                <span>
                  <b>{currentChat.typing === 'ai' ? agentName(currentChat) : nm(currentChat)}</b>{' '}
                  {t('typing')}
                </span>
                <span className="typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="composer" id="composer">
            {currentChat.ai ? (
              <div className="ai-lock">
                <span className="pulse">
                  <Sparkles className="ico-sm w-4 h-4" />
                </span>
                <div className="grow">
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                    {t('ai_lock_t')}{' '}
                    <span className="typing" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: '12.5px' }}>
                    {t('ai_lock_s')}
                  </div>
                </div>
                <button
                  className="btn primary"
                  type="button"
                  id="takeBtn"
                  onClick={() => {
                    currentChat.assigned = 'u1';
                    handleToggleAi(false);
                  }}
                >
                  <Hand className="w-4 h-4" />
                  {t('take_over')}
                </button>
              </div>
            ) : (
              <>
                <div className="quick">
                  {(['qr1', 'qr2', 'qr3', 'qr4'] as const).map((k) => (
                    <button
                      key={k}
                      className="chip"
                      type="button"
                      onClick={() => {
                        setReplyText(t(k));
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                    >
                      {t(k)}
                    </button>
                  ))}
                </div>
                <div
                  className="c-pill gap"
                  data-api="NEW POST /chats/{id}/reply → Message Service (no send path today)"
                >
                  <PencilLine className="pen ico-sm w-4 h-4" />
                  <label className="sr-only" htmlFor="reply">
                    {t('ph_reply')}
                  </label>
                  <textarea
                    id="reply"
                    ref={textareaRef}
                    rows={1}
                    dir="auto"
                    placeholder={t('ph_reply')}
                    value={replyText}
                    onChange={autoGrow}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    className="icon-btn wand"
                    type="button"
                    id="suggestBtn"
                    aria-label={t('suggest')}
                    title={t('suggest')}
                    onClick={() => {
                      setReplyText(t('draft'));
                      if (textareaRef.current) {
                        textareaRef.current.focus();
                      }
                    }}
                  >
                    <WandSparkles className="w-4 h-4" />
                  </button>
                  <button
                    className="icon-btn hide-sm"
                    type="button"
                    aria-label={t('mic')}
                    title={t('mic')}
                    onClick={() => toast(t('mic'))}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    className="icon-btn hide-sm"
                    type="button"
                    aria-label={t('send_unit')}
                    title={t('send_unit')}
                    onClick={() => toast(t('send_unit'))}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label={t('attach')}
                    title={t('attach')}
                    onClick={() => toast(t('attach'))}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    className="icon-btn send"
                    type="button"
                    id="sendBtn"
                    aria-label={t('send')}
                    title={t('send')}
                    onClick={handleSend}
                  >
                    <SendHorizontal className="flip-rtl w-4 h-4" />
                  </button>
                </div>
                <div className="c-hint">
                  <Info className="ico-sm w-3.5 h-3.5" />
                  {t('hint')}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* PANE 3: Context Panel                                          */}
      {/* ============================================================== */}
      {currentChat && (
        <aside
          className={`pane panel ${mobilePanelOpen ? 'open' : ''}`}
          id="panel"
          aria-label="Details"
        >
          <div className="p-scroll">
            {/* Hero */}
            <div className="p-hero">
              <button
                className="icon-btn panel-close"
                type="button"
                id="pClose"
                aria-label={t('close')}
                onClick={() => setMobilePanelOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
              {renderAvatar(nm(currentChat), {
                size: 'xl',
                ring: true,
                online: currentChat.online,
                title: false,
              })}
              <div className="p-name">{nm(currentChat)}</div>
              <div className="p-sub ltr num">{currentChat.phone}</div>
              <div className="tags">
                {isNeedsHuman(currentChat) && (
                  <span className="badge danger">
                    <Hand className="w-3 h-3" />
                    {t('needs_human')}
                  </span>
                )}
                <span
                  className={`badge ${
                    currentChat.priority === 'urgent' || currentChat.priority === 'high'
                      ? 'warn'
                      : 'outline'
                  }`}
                >
                  <Flag className="w-3 h-3" />
                  {t('pr_' + currentChat.priority)}
                </span>
                <span className="badge outline">{t('st_' + currentChat.status)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-acts">
              <a href={`tel:${currentChat.phone.replace(/\s/g, '')}`}>
                <span className="icon-btn">
                  <Phone className="w-4 h-4" />
                </span>
                {t('call')}
              </a>
              <NavLink to={`/contacts?contact=k${currentChatIndex + 1}`}>
                <span className="icon-btn">
                  <UserRound className="w-4 h-4" />
                </span>
                {t('open_contact')}
              </NavLink>
              <NavLink to="/pipeline">
                <span className="icon-btn">
                  <SquareKanban className="w-4 h-4" />
                </span>
                {t('sec_deal')}
              </NavLink>
            </div>

            {/* Context Tabs */}
            <div className="tabs-u p-tabs" role="tablist">
              {(['details', 'deal', 'files'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  type="button"
                  aria-selected={activeDetailsTab === tab}
                  onClick={() => setActiveDetailsTab(tab)}
                >
                  {t('ptab_' + tab)}
                </button>
              ))}
            </div>

            {/* Context Body */}
            <div className="p-body" role="tabpanel">
              {activeDetailsTab === 'details' && (
                <>
                  <div className="p-sec" data-api="GET /contacts/{id} · tags, extra">
                    <h4>
                      <Contact className="ico-sm w-4 h-4" />
                      {t('sec_contact')}
                    </h4>
                    <dl className="kv">
                      <dt>{t('channel')}</dt>
                      <dd className="row" style={{ gap: 6 }}>
                        <ChannelBadge channel={currentChat.ch} size="sm" />
                        {t('ch_' + currentChat.ch)}
                      </dd>
                      <dt>{t('language')}</dt>
                      <dd>{t(currentChat.lang === 'en' ? 'lang_en' : 'lang_ar')}</dd>
                      <dt>{t('owner')}</dt>
                      <dd>
                        {currentOwner ? (
                          <span className="row" style={{ gap: 6 }}>
                            {renderAvatar(L(currentOwner.name), { size: 'sm', title: false })}
                            {L(currentOwner.name)}
                          </span>
                        ) : (
                          <span className="muted">{t('unassigned_opt')}</span>
                        )}
                      </dd>
                    </dl>
                    {currentProject && (
                      <div className="tags">
                        <span className="badge brand">{L(currentProject.name)}</span>
                        <span className="badge outline">{L(currentProject.kind)}</span>
                        <span className="badge outline">{L(currentProject.city)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-sec" data-api="PATCH /chats/{id} {notes}">
                    <h4>
                      <NotebookPen className="ico-sm w-4 h-4" />
                      {t('sec_notes')}
                    </h4>
                    <label className="sr-only" htmlFor="notes">
                      {t('sec_notes')}
                    </label>
                    <textarea
                      className="textarea"
                      id="notes"
                      dir="auto"
                      placeholder={t('notes_ph')}
                      value={notes[currentChat.id] || ''}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [currentChat.id]: e.target.value }))
                      }
                    />
                  </div>
                </>
              )}

              {activeDetailsTab === 'deal' && (
                <>
                  <div className="p-sec" data-api="GET/PATCH /deals/{id} {deal_status, details}">
                    <h4>
                      <Briefcase className="ico-sm w-4 h-4" />
                      {t('sec_deal')}
                    </h4>
                    <div className="row">
                      <div className="deal-val num grow">
                        {currentChat.budget && currentProject
                          ? money(currentChat.budget, currentProject.cur, false)
                          : '—'}
                      </div>
                      <DealStatusBadge status={currentChat.ds} />
                    </div>
                    <dl className="kv">
                      <dt>{t('unit')}</dt>
                      <dd>{currentChat.unit}</dd>
                      <dt>{t('project')}</dt>
                      <dd>
                        {currentProject
                          ? `${L(currentProject.name)} · ${L(currentProject.city)}`
                          : currentChat.project}
                      </dd>
                      <dt>{t('next_fu')}</dt>
                      <dd className={currentChat.ai ? '' : 'muted'}>
                        {currentChat.ai
                          ? lang === 'ar'
                            ? 'خلال ٣ ساعات'
                            : 'in 3 hours'
                          : t('none')}
                      </dd>
                    </dl>
                    <label className="field">
                      <span className="sr-only">{t('status')}</span>
                      <select
                        className="select"
                        id="dsSel"
                        value={currentChat.ds}
                        onChange={(e) => {
                          updateDealStatus(currentChat.id, e.target.value as DealStatus);
                          toast(t('saved'));
                        }}
                      >
                        {(['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const).map(
                          (s) => (
                            <option key={s} value={s}>
                              {t('ds_' + s)}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>

                  <div className="p-sec" data-api="deal.stage_id + stage_stack + activity_log">
                    <h4>
                      <Route className="ico-sm w-4 h-4" />
                      {t('sec_stages')}
                      <span className="act muted" style={{ fontWeight: 400, fontSize: 12 }}>
                        {L(stages[0]?.name || { en: 'Fahad', ar: 'فهد' })}
                      </span>
                    </h4>
                    <ol className="steps">
                      {STAGE_ORDER.map((sid, i) => {
                        const cls =
                          i < currentStageIndex
                            ? 'done'
                            : i === currentStageIndex
                            ? 'cur'
                            : i === currentStageIndex + 1
                            ? 'todo queued'
                            : 'todo';
                        const stg = stageMap[sid];
                        return (
                          <li key={sid} className={`step ${cls}`}>
                            <span className="sd">
                              {i < currentStageIndex ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : i === currentStageIndex ? (
                                <CircleDot className="w-3.5 h-3.5" />
                              ) : null}
                            </span>
                            <div>
                              <div className="sn">{stg ? L(stg.name) : sid}</div>
                              <div className="ss">
                                {i < currentStageIndex
                                  ? `${t('done_at')} · ${timeAgo((currentStageIndex - i) * 700 + currentChat.mins)}`
                                  : i === currentStageIndex
                                  ? t('current')
                                  : i === currentStageIndex + 1
                                  ? t('upcoming')
                                  : stg
                                  ? L(stg.desc)
                                  : ''}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </>
              )}

              {activeDetailsTab === 'files' && (
                <>
                  <div
                    className="p-sec gap"
                    data-api="NEW GET /chats/{id}/attachments (media messages)"
                  >
                    <h4>
                      <Images className="ico-sm w-4 h-4" />
                      {t('sec_media')}
                      <button className="icon-btn act" type="button" aria-label={t('more')}>
                        <EllipsisVertical className="ico-sm w-4 h-4" />
                      </button>
                    </h4>
                    <div className="media-g">
                      {chatMedia.map((m, idx) => (
                        <div
                          key={idx}
                          className="tile"
                          style={{ '--h': m.hue } as React.CSSProperties}
                          role="img"
                          aria-label={m.label}
                        >
                          {m.kind === 'house' ? (
                            <House className="w-8 h-8" />
                          ) : (
                            <Building2 className="w-8 h-8" />
                          )}
                          <span>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-sec gap" data-api="NEW attachments (documents)">
                    <h4>
                      <FolderOpen className="ico-sm w-4 h-4" />
                      {t('sec_files')}
                    </h4>
                    {chatFiles.map((f, idx) => (
                      <div key={idx} className="sf">
                        <span className="f-ico">
                          <FileText className="ico-sm w-4 h-4" />
                        </span>
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <div className="f-n">{f.name}</div>
                          <div className="f-s num">{f.size}</div>
                        </span>
                        <button
                          className="icon-btn"
                          type="button"
                          aria-label={t('file_menu')}
                          onClick={() => toast(`File actions for ${f.name}`)}
                        >
                          <EllipsisVertical className="ico-sm w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-sec">
                    <h4>
                      <Link2 className="ico-sm w-4 h-4" />
                      {t('sec_links')}
                    </h4>
                    {chatLinks.map((l, idx) => (
                      <div key={idx} className="sl">
                        <span className="f-ico">
                          <Link2 className="ico-sm w-4 h-4" />
                        </span>
                        <a href={l} target="_blank" rel="noopener noreferrer">
                          {l}
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Scrim backdrop for narrow screen context panel */}
      <div
        className={`scrim ${mobilePanelOpen ? 'open' : ''}`}
        id="pScrim"
        onClick={() => setMobilePanelOpen(false)}
      />
    </div>
  );
};
