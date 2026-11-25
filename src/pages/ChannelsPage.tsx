import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { ChannelBadge, Drawer } from '../components/common';
import { Channel } from '../types';
import {
  RadioTower,
  MessagesSquare,
  Timer,
  UserPlus,
  Plus,
  Settings2,
  FlaskConical,
  CircleCheck,
  CircleX,
  CirclePause,
  Clock,
  Bot,
  Plug,
  TriangleAlert,
  PlugZap,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';

/** Connected channel item in the channels configuration dashboard */
interface ChannelItem {
  id: string;
  /** Messaging protocol type */
  protocol: Channel;
  /** Bilingual channel label */
  name: { en: string; ar: string };
  /** Account phone number, handle (@handle), or URL */
  ident: string;
  /** Integration status */
  status: 'active' | 'disabled';
  /** Health check diagnostic status */
  health: 'ok' | 'down';
  /** ID of assigned AI agent persona */
  agent: string;
  /** Default entry pipeline stage for new leads arriving via this channel */
  entry: string;
  /** Associated real estate project ID */
  project: string;
  /** Total messages processed */
  msgs: number;
  /** Qualified leads captured */
  leads: number;
  /** Average response latency in seconds */
  resp: number;
  /** Minutes elapsed since last synchronization */
  mins: number;
}

const INITIAL_CHANNELS: ChannelItem[] = [
  { id: 'ch1', protocol: 'whatsapp', name: { en: 'Al Ruba · WhatsApp sales', ar: 'الربى · واتساب المبيعات' }, ident: '+966 11 520 4400', status: 'active', health: 'ok', agent: 'ag1', entry: 's1', project: 'sadeel', msgs: 2140, leads: 88, resp: 0.4, mins: 2 },
  { id: 'ch2', protocol: 'instagram', name: { en: 'Stax Dubai · Instagram', ar: 'ستاكس دبي · إنستغرام' }, ident: '@stax.dubai', status: 'active', health: 'down', agent: 'ag1', entry: 's1', project: 'stax', msgs: 612, leads: 31, resp: 0.6, mins: 190 },
  { id: 'ch3', protocol: 'instagram', name: { en: 'Jawharat Al Ruba · Instagram', ar: 'جوهرة الربى · إنستغرام' }, ident: '@jawharat.alruba', status: 'active', health: 'ok', agent: 'ag1', entry: 's2', project: 'jawharat-al-ruba', msgs: 734, leads: 42, resp: 0.5, mins: 2 },
  { id: 'ch4', protocol: 'tour', name: { en: 'Sadeel · 3D tour widget', ar: 'سديل · جولة ثلاثية الأبعاد' }, ident: 'tours.alruba.sa/sadeel', status: 'active', health: 'ok', agent: 'ag2', entry: 's1', project: 'sadeel', msgs: 3310, leads: 97, resp: 0.1, mins: 33 },
  { id: 'ch5', protocol: 'phone', name: { en: 'Nile View · Phone line', ar: 'نايل فيو · خط الهاتف' }, ident: '+20 2 2461 9000', status: 'active', health: 'ok', agent: 'ag3', entry: 's1', project: 'nile-view', msgs: 402, leads: 36, resp: 0.02, mins: 14 },
  { id: 'ch6', protocol: 'telegram', name: { en: 'Al Ruba · Telegram bot', ar: 'الربى · بوت تيليجرام' }, ident: '@AlRubaHomesBot', status: 'active', health: 'ok', agent: 'ag1', entry: 's1', project: 'sadeel', msgs: 188, leads: 9, resp: 0.3, mins: 48 },
  { id: 'ch7', protocol: 'messenger', name: { en: 'Nile View · Messenger', ar: 'نايل فيو · ماسنجر' }, ident: 'fb.com/nileview.benha', status: 'active', health: 'ok', agent: 'ag1', entry: 's1', project: 'nile-view', msgs: 240, leads: 12, resp: 0.7, mins: 95 },
  { id: 'ch8', protocol: 'email', name: { en: 'Flamant · sales@ inbox', ar: 'فلامنت · بريد المبيعات' }, ident: 'sales@flamant.sa', status: 'active', health: 'ok', agent: 'ag1', entry: 's2', project: 'flamant', msgs: 96, leads: 7, resp: 4.2, mins: 130 },
  { id: 'ch9', protocol: 'discord', name: { en: 'Investor community · Discord', ar: 'مجتمع المستثمرين · ديسكورد' }, ident: 'discord.gg/alruba', status: 'disabled', health: 'ok', agent: 'ag1', entry: 's1', project: 'stax', msgs: 0, leads: 0, resp: 0, mins: 20160 },
];

const AVAILABLE_PLATFORMS: Channel[] = [
  'whatsapp',
  'instagram',
  'messenger',
  'telegram',
  'gmail',
  'outlook',
  'email',
  'discord',
  'phone',
  'tour',
];

const PLATFORM_DESCS: Record<string, { en: string; ar: string }> = {
  whatsapp: { en: 'Cloud API or QR session', ar: 'Cloud API أو جلسة QR' },
  instagram: { en: 'DMs and story mentions', ar: 'الرسائل المباشرة والقصص' },
  messenger: { en: 'Facebook page messages', ar: 'رسائل صفحات فيسبوك' },
  telegram: { en: 'Bot for groups and private chat', ar: 'بوت للمجموعات والخاص' },
  gmail: { en: 'OAuth integration', ar: 'ربط مباشر عبر OAuth' },
  outlook: { en: 'Microsoft 365 OAuth', ar: 'ربط Microsoft 365' },
  email: { en: 'IMAP / SMTP custom mailbox', ar: 'بريد مخصص IMAP / SMTP' },
  discord: { en: 'Community bot and ticket channel', ar: 'بوت المجتمعات والتذاكر' },
  phone: { en: 'LiveKit SIP trunk inbound calling', ar: 'مكالمات واردة عبر LiveKit SIP' },
  tour: { en: '3D virtual tour interactive widget', ar: 'نافذة الجولة الافتراضية' },
};

const CREDS_CONFIG: Record<string, [string, string, number][]> = {
  whatsapp: [
    ['phone_number_id', 'Phone number ID', 0],
    ['waba_id', 'WhatsApp Business Account ID', 0],
    ['access_token', 'Permanent access token', 1],
    ['verify_token', 'Webhook verify token', 1],
  ],
  instagram: [
    ['ig_account_id', 'Instagram account ID', 0],
    ['page_id', 'Linked Facebook page ID', 0],
    ['page_access_token', 'Page access token', 1],
  ],
  messenger: [
    ['page_id', 'Facebook page ID', 0],
    ['page_access_token', 'Page access token', 1],
    ['app_secret', 'App secret', 1],
  ],
  telegram: [
    ['bot_username', 'Bot username', 0],
    ['bot_token', 'Bot token (from @BotFather)', 1],
  ],
  discord: [
    ['application_id', 'Application ID', 0],
    ['bot_token', 'Bot token', 1],
  ],
  email: [
    ['imap_host', 'IMAP host', 0],
    ['smtp_host', 'SMTP host', 0],
    ['username', 'Mailbox', 0],
    ['password', 'App password', 1],
  ],
  gmail: [['oauth', 'Google OAuth', 2]],
  outlook: [['oauth', 'Microsoft OAuth', 2]],
  phone: [
    ['sip_number', 'Inbound number', 0],
    ['sip_trunk_id', 'LiveKit SIP trunk ID', 0],
  ],
  tour: [
    ['project_id', 'Tour project', 0],
    ['embed_domain', 'Allowed embed domain', 0],
  ],
};

export const ChannelsPage: React.FC = () => {
  const { t, L, toast, lang, timeAgo } = useApp();
  const { agents, stages, projects } = useData();

  const [channelList, setChannelList] = useState<ChannelItem[]>(INITIAL_CHANNELS);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerStep, setDrawerStep] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Channel>('whatsapp');

  // Form Fields State inside Drawer
  const [formName, setFormName] = useState<string>('');
  const [formAgent, setFormAgent] = useState<string>('ag1');
  const [formEntry, setFormEntry] = useState<string>('s1');
  const [formStatus, setFormStatus] = useState<boolean>(true);
  const [formHours, setFormHours] = useState<boolean>(true);
  const [formCreds, setFormCreds] = useState<Record<string, string>>({
    phone_number_id: '1092837419208',
    waba_id: '2093847291029',
    access_token: 'EAABwzL9a1b8BAKx...',
    verify_token: 'alruba_wh_secret_2026',
    page_access_token: 'EAABwzL9a1b8BAKx...',
  });
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Expired / Down channel
  const downChannels = channelList.filter((c) => c.status === 'active' && c.health === 'down');
  const activeCount = channelList.filter((c) => c.status === 'active').length;
  const disabledCount = channelList.length - activeCount;

  const totalMsgs = channelList
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.msgs, 0);
  const totalLeads = channelList
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.leads, 0);

  const formatDuration = (m: number) => {
    if (m < 1) {
      return `${Math.round(m * 60)} ${lang === 'ar' ? 'ث' : 's'}`;
    }
    return `${m.toFixed(1)} ${lang === 'ar' ? 'د' : 'min'}`;
  };

  // Toggle active/disabled
  const handleToggleChannel = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setChannelList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: checked ? 'active' : 'disabled' } : c))
    );
    const target = channelList.find((c) => c.id === id);
    if (target) {
      toast(
        checked
          ? t('enabled_toast').replace('{n}', L(target.name))
          : t('disabled_toast').replace('{n}', L(target.name))
      );
    }
  };

  // Quick Test from card
  const handleTestChannel = (c: ChannelItem) => {
    setTimeout(() => {
      if (c.health === 'down') {
        toast(t('test_bad'));
      } else {
        toast(t('test_ok').replace('{p}', t('p_' + c.protocol)));
      }
    }, 600);
  };

  // Open Drawer for New
  const handleOpenNew = (platform: Channel = 'whatsapp') => {
    setEditingId(null);
    setSelectedProtocol(platform);
    setDrawerStep(2);
    setFormName('');
    setFormAgent('ag1');
    setFormEntry('s1');
    setFormStatus(true);
    setFormHours(true);
    setTestResult(null);
    setDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleOpenEdit = (c: ChannelItem, step: number = 2) => {
    setEditingId(c.id);
    setSelectedProtocol(c.protocol);
    setDrawerStep(step);
    setFormName(L(c.name));
    setFormAgent(c.agent);
    setFormEntry(c.entry);
    setFormStatus(c.status === 'active');
    setFormHours(true);
    setTestResult(null);
    setDrawerOpen(true);
  };

  // Disconnect Channel
  const handleDisconnect = (id: string) => {
    const target = channelList.find((c) => c.id === id);
    if (!target) return;
    if (confirm(t('disc_confirm').replace('{n}', L(target.name)))) {
      setChannelList((prev) => prev.filter((c) => c.id !== id));
      toast(t('disc_toast').replace('{n}', L(target.name)));
      setDrawerOpen(false);
    }
  };

  // Test inside drawer
  const handleRunDrawerTest = () => {
    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      const isBad = editingId === 'ch2';
      if (isBad) {
        setTestResult({ ok: false, msg: t('test_bad') });
      } else {
        setTestResult({
          ok: true,
          msg: t('test_ok').replace('{p}', t('p_' + selectedProtocol)),
        });
      }
    }, 800);
  };

  // Save drawer
  const handleSaveDrawer = () => {
    if (editingId) {
      setChannelList((prev) =>
        prev.map((c) => {
          if (c.id !== editingId) return c;
          return {
            ...c,
            name: formName ? { en: formName, ar: formName } : c.name,
            agent: formAgent,
            entry: formEntry,
            status: formStatus ? 'active' : 'disabled',
            health: 'ok',
          };
        })
      );
      toast(t('saved_t') || 'Channel saved');
    } else {
      const newCh: ChannelItem = {
        id: 'ch' + (channelList.length + 10),
        protocol: selectedProtocol,
        name: formName
          ? { en: formName, ar: formName }
          : { en: `${t('p_' + selectedProtocol)}`, ar: `${t('p_' + selectedProtocol)}` },
        ident: selectedProtocol === 'whatsapp' ? '+966 50 123 4567' : `@alruba.${selectedProtocol}`,
        status: formStatus ? 'active' : 'disabled',
        health: 'ok',
        agent: formAgent,
        entry: formEntry,
        project: 'sadeel',
        msgs: 0,
        leads: 0,
        resp: 0.2,
        mins: 0,
      };
      setChannelList((prev) => [newCh, ...prev]);
      toast(t('created').replace('{n}', formName || t('p_' + selectedProtocol)));
    }
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Header */}
      <section className="head">
        <div>
          <p className="sub">{t('channels_sub')}</p>
        </div>
        <div className="tools">
          <button
            className="btn primary"
            type="button"
            id="connectBtn"
            onClick={() => {
              setEditingId(null);
              setSelectedProtocol('whatsapp');
              setDrawerStep(1);
              setDrawerOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('connect')}</span>
          </button>
        </div>
      </section>

      {/* API Legend */}
      <div className="api-legend row wrap" style={{ fontSize: '12px' }}>
        <span className="badge info">
          <Plug className="w-3 h-3" />
          <span>{t('api_legend_ok')}</span>
        </span>
        <span className="badge warn">
          <TriangleAlert className="w-3 h-3" />
          <span>{t('api_legend_gap')}</span>
        </span>
      </div>

      {/* Down / Expired Alert Banner */}
      {downChannels.length > 0 && (
        <section className="alert danger gap" id="downAlert">
          <div className="a-ico">
            <PlugZap className="w-5 h-5" />
          </div>
          <div className="grow">
            <h4>{t('down_t')}</h4>
            <p>{t('down_b')}</p>
          </div>
          <button
            className="btn primary"
            type="button"
            onClick={() => handleOpenEdit(downChannels[0], 2)}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('reconnect')}</span>
          </button>
        </section>
      )}

      {/* Summary KPI Cards */}
      <section className="summary gap" id="summary">
        <div className="card sum">
          <span className="s-ico">
            <RadioTower className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_conn')}</div>
            <div className="s-v num">{activeCount}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <MessagesSquare className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_msgs')}</div>
            <div className="s-v num">{totalMsgs.toLocaleString()}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Timer className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_first')}</div>
            <div className="s-v num">{formatDuration(0.5)}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <UserPlus className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_leads')}</div>
            <div className="s-v num">{totalLeads.toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* Connected Channels Grid */}
      <section className="stack" style={{ gap: 'var(--s3)' }}>
        <div className="sec-h">
          <h2>{t('connected')}</h2>
          <span className="sub" id="connN">
            {t('conn_n')
              .replace('{a}', String(activeCount))
              .replace('{d}', String(disabledCount))}
          </span>
        </div>

        <div className="grid" id="grid">
          {channelList.map((c) => {
            const ag = agents.find((a) => a.id === c.agent);
            const stg = stages.find((s) => s.id === c.entry);
            const pr = projects[c.project];
            const isOff = c.status !== 'active';
            const isDown = !isOff && c.health === 'down';

            return (
              <article
                key={c.id}
                className={`card chc ${isOff ? 'off' : ''} ${isDown ? 'down' : ''}`}
              >
                <div className="chc-top">
                  <ChannelBadge channel={c.protocol} size="lg" />
                  <div style={{ minWidth: 0 }}>
                    <div className="t-name">{L(c.name)}</div>
                    <div className="t-id ltr">{c.ident}</div>
                  </div>
                  <label className="switch" title={t('f_status')}>
                    <input
                      type="checkbox"
                      checked={!isOff}
                      onChange={(e) => handleToggleChannel(c.id, e)}
                      aria-label={t('enable').replace('{n}', L(c.name))}
                    />
                    <span className="track" />
                  </label>
                </div>

                <div className="chc-mid">
                  <dl className="kv2">
                    <dt>{t('k_health')}</dt>
                    <dd className="gap">
                      {isOff ? (
                        <span className="badge outline">
                          <CirclePause className="w-3 h-3" />
                          <span>{t('h_off')}</span>
                        </span>
                      ) : isDown ? (
                        <span className="badge danger">
                          <CircleX className="w-3 h-3" />
                          <span>{t('h_down')}</span>
                        </span>
                      ) : (
                        <span className="badge ok">
                          <CircleCheck className="w-3 h-3" />
                          <span>{t('h_ok')}</span>
                        </span>
                      )}
                    </dd>

                    <dt>{t('k_agent')}</dt>
                    <dd>
                      <Bot className="ico-sm muted" />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ag ? L(ag.name) : '—'}
                      </span>
                    </dd>

                    <dt>{t('k_entry')}</dt>
                    <dd>
                      {stg ? (
                        <span className="badge info">{L(stg.name)}</span>
                      ) : (
                        '—'
                      )}
                    </dd>

                    <dt>{t('k_proj')}</dt>
                    <dd>
                      <span>{pr ? L(pr.name) : c.project}</span>
                      {pr && <span className="muted">· {L(pr.city)}</span>}
                    </dd>
                  </dl>
                </div>

                <div className="stats gap">
                  <div>
                    <span className="v num">{c.msgs.toLocaleString()}</span>
                    <span className="l">{t('st_msgs')}</span>
                  </div>
                  <div>
                    <span className="v num">{c.leads.toLocaleString()}</span>
                    <span className="l">{t('st_leads')}</span>
                  </div>
                  <div>
                    <span className="v num">
                      {c.msgs ? formatDuration(c.resp) : '—'}
                    </span>
                    <span className="l">{t('st_resp')}</span>
                  </div>
                </div>

                <div className="chc-foot">
                  <span className="when">
                    <Clock className="ico-sm" />
                    <span>{t('last_evt').replace('{t}', timeAgo(c.mins))}</span>
                  </span>
                  <button
                    className="btn sm ghost"
                    type="button"
                    onClick={() => handleTestChannel(c)}
                  >
                    <FlaskConical className="ico-sm" />
                    <span>{t('test')}</span>
                  </button>
                  <button
                    className="btn sm"
                    type="button"
                    onClick={() => handleOpenEdit(c, 2)}
                  >
                    <Settings2 className="ico-sm" />
                    <span>{t('configure')}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Available Channels */}
      <section className="stack" style={{ gap: 'var(--s3)' }}>
        <div className="sec-h">
          <h2>{t('available')}</h2>
          <span className="sub">{t('available_s')}</span>
        </div>

        <div className="avail ch-avail" id="avail">
          {AVAILABLE_PLATFORMS.map((p) => {
            const desc = PLATFORM_DESCS[p];
            return (
              <button
                key={p}
                className="av"
                type="button"
                onClick={() => handleOpenNew(p)}
              >
                <ChannelBadge channel={p} size="lg" />
                <div className="av-info">
                  <div className="av-n">{t('p_' + p)}</div>
                  <div className="av-s">{desc ? L(desc) : ''}</div>
                </div>
                <Plus className="plus w-4 h-4" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Configure / Connect Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="min(580px, 100%)"
        footer={
          <div className="drawer-f w-full flex items-center gap-2">
            {drawerStep > 1 && (
              <button
                className="btn back"
                style={{ marginInlineEnd: 'auto' }}
                type="button"
                onClick={() => setDrawerStep((s) => s - 1)}
              >
                {t('back')}
              </button>
            )}
            <button
              className="btn"
              type="button"
              onClick={() => setDrawerOpen(false)}
            >
              {t('cancel')}
            </button>
            {drawerStep < 3 ? (
              <button
                className="btn primary"
                type="button"
                onClick={() => setDrawerStep((s) => s + 1)}
              >
                {t('next')}
              </button>
            ) : (
              <button
                className="btn primary"
                type="button"
                onClick={handleSaveDrawer}
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? t('save_changes') || t('save') : t('finish')}</span>
              </button>
            )}
          </div>
        }
      >
        <div className="drawer-h">
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="dh-name">
              {editingId
                ? t('d_edit').replace('{n}', formName || t('p_' + selectedProtocol))
                : t('d_new')}
            </div>
          </div>
          <button
            className="icon-btn"
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Indicator */}
        <ol className="steps">
          <li
            aria-current={drawerStep === 1 ? 'step' : undefined}
            className={drawerStep > 1 ? 'done' : ''}
          >
            <span className="n">1</span>
            <span className="lbl">{t('step1')}</span>
          </li>
          <li
            aria-current={drawerStep === 2 ? 'step' : undefined}
            className={drawerStep > 2 ? 'done' : ''}
          >
            <span className="n">2</span>
            <span className="lbl">{t('step2')}</span>
          </li>
          <li aria-current={drawerStep === 3 ? 'step' : undefined}>
            <span className="n">3</span>
            <span className="lbl">{t('step3')}</span>
          </li>
        </ol>

        <div className="drawer-b">
          {/* STEP 1: Platform Selection */}
          {drawerStep === 1 && (
            <section>
              <div className="sec-t">{t('pick_h')}</div>
              <div className="pick">
                {AVAILABLE_PLATFORMS.map((p) => {
                  const isSel = selectedProtocol === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={isSel}
                      onClick={() => {
                        setSelectedProtocol(p);
                        setDrawerStep(2);
                      }}
                    >
                      <ChannelBadge channel={p} size="lg" />
                      <div>
                        <b>{t('p_' + p)}</b>
                        <div className="p-s">
                          {PLATFORM_DESCS[p] ? L(PLATFORM_DESCS[p]) : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 2: Credentials & Webhook */}
          {drawerStep === 2 && (
            <>
              <section>
                <div className="field">
                  <label htmlFor="chName">
                    {t('f_name')}
                    <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    id="chName"
                    type="text"
                    value={formName}
                    placeholder="e.g. Sadeel · WhatsApp sales line"
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <span className="help">{t('f_name_help')}</span>
                </div>
              </section>

              <section className="gap">
                <div className="sec-t">{t('cred_h')}</div>
                <div className="form-grid">
                  {(CREDS_CONFIG[selectedProtocol] || []).map(([fKey, fLabel, fType]) => {
                    const isSecret = fType === 1;
                    const isOAuth = fType === 2;
                    if (isOAuth) {
                      return (
                        <div key={fKey} className="full">
                          <button
                            type="button"
                            className="btn gap"
                            onClick={() => toast('Redirecting to OAuth...')}
                          >
                            <ChannelBadge channel={selectedProtocol} size="sm" />
                            <span>Connect via Google / Microsoft OAuth</span>
                          </button>
                        </div>
                      );
                    }
                    const isRevealed = Boolean(revealedKeys[fKey]);
                    return (
                      <div key={fKey} className={`field ${isSecret ? 'full' : ''}`}>
                        <label htmlFor={fKey}>
                          {fLabel}
                          <span className="req">*</span>
                        </label>
                        <div className="secret-in">
                          <input
                            className="input ltr"
                            id={fKey}
                            type={isSecret && !isRevealed ? 'password' : 'text'}
                            value={formCreds[fKey] || ''}
                            onChange={(e) =>
                              setFormCreds({ ...formCreds, [fKey]: e.target.value })
                            }
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedKeys({
                                  ...revealedKeys,
                                  [fKey]: !isRevealed,
                                })
                              }
                            >
                              {isRevealed ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="gap">
                <div className="sec-t">{t('webhook_h')}</div>
                <div className="copy-field">
                  <code>https://api.voom.sa/v1/webhooks/{selectedProtocol}/whk_live_99214</code>
                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://api.voom.sa/v1/webhooks/${selectedProtocol}/whk_live_99214`
                      );
                      toast(t('copied'));
                    }}
                    title={t('copy')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <span className="help" style={{ display: 'block', marginTop: '6px' }}>
                  {t('webhook_help')}
                </span>

                <div style={{ marginTop: '14px' }}>
                  <button
                    className="btn gap"
                    type="button"
                    disabled={isTesting}
                    onClick={handleRunDrawerTest}
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FlaskConical className="w-4 h-4" />
                    )}
                    <span>{isTesting ? t('testing') : t('test_conn')}</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`test-res ${testResult.ok ? 'ok' : 'bad'}`}
                    style={{ display: 'flex', marginTop: '10px' }}
                  >
                    {testResult.ok ? (
                      <CircleCheck className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <CircleX className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{testResult.msg}</span>
                  </div>
                )}
              </section>
            </>
          )}

          {/* STEP 3: Routing */}
          {drawerStep === 3 && (
            <>
              <section>
                <div className="sec-t">{t('route_h')}</div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="rAgent">{t('f_agent')}</label>
                    <select
                      className="select"
                      id="rAgent"
                      value={formAgent}
                      onChange={(e) => setFormAgent(e.target.value)}
                    >
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {L(ag.name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="rEntry">{t('f_entry')}</label>
                    <select
                      className="select"
                      id="rEntry"
                      value={formEntry}
                      onChange={(e) => setFormEntry(e.target.value)}
                    >
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {L(s.name)}
                        </option>
                      ))}
                    </select>
                    <span className="help">{t('f_entry_help')}</span>
                  </div>

                  <label className="switch full">
                    <input
                      type="checkbox"
                      checked={formStatus}
                      onChange={(e) => setFormStatus(e.target.checked)}
                    />
                    <span className="track" />
                    <div>
                      <b>{t('f_status')}</b>
                      <div className="muted" style={{ fontSize: '11.5px' }}>
                        {t('f_status_help')}
                      </div>
                    </div>
                  </label>

                  <label className="switch full">
                    <input
                      type="checkbox"
                      checked={formHours}
                      onChange={(e) => setFormHours(e.target.checked)}
                    />
                    <span className="track" />
                    <div>
                      <b>{t('f_hours')}</b>
                      <div className="muted" style={{ fontSize: '11.5px' }}>
                        {t('f_hours_help')}
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {editingId && (
                <section className="gap">
                  <div className="danger-zone">
                    <div className="grow" style={{ minWidth: 0 }}>
                      <b style={{ color: 'var(--danger)' }}>{t('dz_t')}</b>
                      <div>{t('dz_b')}</div>
                    </div>
                    <button
                      className="btn danger"
                      type="button"
                      onClick={() => handleDisconnect(editingId)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('disconnect')}</span>
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};
