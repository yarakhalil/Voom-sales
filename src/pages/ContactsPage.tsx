import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { ChannelBadge, DealStatusBadge, AiBadge, Drawer, Avatar, CustomSelect } from '../components/common';
import { Channel, Chat } from '../types';
import {
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  X,
  Phone,
  MessageSquare,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  Sparkles,
  Users,
  BriefcaseBusiness,
  Trophy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plug,
  TriangleAlert,
  Check,
  SearchX,
  Hand,
  Wallet,
} from 'lucide-react';

/** Extended qualification and demographic metadata for real estate prospects */
interface ContactExtra {
  /** Maximum target property budget */
  budget: number;
  /** Property unit type requested (e.g. '3BR Villa') */
  unit: string;
  /** Inferred nationality / country code from phone prefix ('SA', 'AE', 'EG') */
  nat: string;
  /** Sakani / Ministry of Housing subsidy eligible flag */
  moh: boolean;
  /** Originating communication source channel */
  src: string;
}

/** Unified prospect contact record presented in the contacts CRM directory */
interface ContactItem {
  id: string;
  /** Associated active chat ID, or null if lead was imported standalone */
  chat: string | null;
  /** Bilingual customer name */
  name: { en: string; ar: string };
  phone: string;
  email: string;
  /** List of communication channels prospect interacted through */
  chs: string[];
  /** Associated real estate project ID */
  project: string;
  /** Current deal status in pipeline (e.g. 'qualified', 'proposal'), or null */
  ds: string | null;
  /** Funnel stage ID (e.g. 's1', 's2'), or null */
  stage: string | null;
  /** ID of assigned human advisor, or null */
  owner: string | null;
  /** Segment tags attached to contact */
  tags: string[];
  /** Whether the AI assistant is handling messages */
  ai: boolean;
  /** Minutes elapsed since last interaction */
  mins: number;
  /** Days elapsed since contact was created */
  created: number;
  /** Preferred language ('ar' or 'en') */
  lang: string;
  /** Extended prospect qualification metadata */
  extra: ContactExtra;
  /** Whether this contact requires human takeover attention */
  human: boolean;
}

const TAGS_MAP: Record<string, { en: string; ar: string }> = {
  vip: { en: 'VIP', ar: 'كبار العملاء' },
  investor: { en: 'Investor', ar: 'مستثمر' },
  moh: { en: 'MOH eligible', ar: 'مؤهل سكني' },
  cash: { en: 'Cash buyer', ar: 'دفع نقدي' },
  expat: { en: 'Expat', ar: 'مقيم' },
  family: { en: 'Big family', ar: 'عائلة كبيرة' },
};
const TAG_KEYS = Object.keys(TAGS_MAP);

const tagsForChat: Record<string, string[]> = {
  c1: ['vip', 'moh'],
  c2: ['family'],
  c3: ['investor'],
  c4: ['expat', 'cash'],
  c6: ['moh'],
  c9: ['vip', 'cash'],
  c11: ['investor'],
  c12: ['moh', 'family'],
  c13: ['vip'],
  c14: ['cash'],
};

const getEmail = (enName: string) =>
  enName
    .toLowerCase()
    .replace(/^al-/, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/, '.')
    .replace(/\s+/g, '') + '@gmail.com';

const CHANNELS_LIST: Channel[] = [
  'whatsapp',
  'instagram',
  'telegram',
  'messenger',
  'phone',
  'tour',
  'email',
  'discord',
];

export const ContactsPage: React.FC = () => {
  const { t, L, money, toast, lang, timeAgo } = useApp();
  const {
    chats,
    projects,
    stages,
    team,
  } = useData();

  // Initialize initial contacts from chats + standalone
  const [contactsList, setContactsList] = useState<ContactItem[]>(() => {
    const list: ContactItem[] = chats.map((c: Chat, i: number) => ({
      id: 'k' + (i + 1),
      chat: c.id,
      name: c.name,
      phone: c.phone,
      email: i % 3 === 1 ? '' : getEmail(c.name.en),
      chs: [c.ch, ...(i % 4 === 0 ? ['phone'] : [])],
      project: c.project,
      ds: c.ds || null,
      stage: c.stage || null,
      owner: c.assigned || null,
      tags: tagsForChat[c.id] || [],
      ai: c.ai,
      mins: c.mins,
      created: 2 + i * 3,
      lang: c.lang,
      extra: {
        budget: c.budget,
        unit: c.unit || '',
        nat: c.phone.startsWith('+20') ? 'EG' : c.phone.startsWith('+971') ? 'AE' : 'SA',
        moh: (tagsForChat[c.id] || []).includes('moh'),
        src: c.ch,
      },
      human: !c.ai && c.status !== 'closed' && (c.priority === 'high' || c.priority === 'urgent'),
    }));

    const standalones: Partial<ContactItem>[] = [
      { name: { en: 'Turki Al-Subaie', ar: 'تركي السبيعي' }, phone: '+966 55 310 7742', chs: ['tour'], project: 'sadeel', tags: ['investor'], mins: 4300, created: 12 },
      { name: { en: 'Aisha Al-Amri', ar: 'عائشة العامري' }, phone: '+971 56 201 9934', chs: ['instagram'], project: 'stax', tags: ['expat'], mins: 520, created: 1 },
      { name: { en: 'Mostafa Ragab', ar: 'مصطفى رجب' }, phone: '+20 10 9981 2210', chs: ['phone'], project: 'nile-view', tags: [], mins: 8600, created: 33 },
      { name: { en: 'Nawaf Al-Harthi', ar: 'نواف الحارثي' }, phone: '+966 50 118 4096', chs: ['whatsapp'], project: 'jawharat-al-ruba', tags: ['family', 'moh'], mins: 1500, created: 4 },
      { name: { en: 'Dana Al-Khaldi', ar: 'دانة الخالدي' }, phone: '+966 54 772 0310', chs: ['telegram'], project: 'flamant', tags: ['cash'], mins: 11200, created: 51 },
      { name: { en: 'Ibrahim Sadek', ar: 'إبراهيم صادق' }, phone: '+20 11 3040 5581', chs: ['messenger'], project: 'nile-view', tags: [], mins: 260, created: 0 },
    ];

    standalones.forEach((x, j) => {
      list.push({
        id: 'k' + (15 + j),
        chat: null,
        name: x.name!,
        phone: x.phone!,
        email: j % 2 ? '' : getEmail(x.name!.en),
        chs: x.chs!,
        project: x.project!,
        ds: null,
        stage: null,
        owner: null,
        tags: x.tags!,
        ai: true,
        mins: x.mins!,
        created: x.created!,
        lang: 'ar',
        human: false,
        extra: {
          budget: 0,
          unit: '',
          nat: x.phone!.startsWith('+20') ? 'EG' : x.phone!.startsWith('+971') ? 'AE' : 'SA',
          moh: x.tags!.includes('moh'),
          src: x.chs![0],
        },
      });
    });

    return list;
  });

  // Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'open' | 'human' | 'won'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<'name' | 'proj' | 'last' | 'created'>('last');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);

  // Drawer State
  const [activeContact, setActiveContact] = useState<ContactItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'deals' | 'activity'>('profile');
  const [drawerTags, setDrawerTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  // Form Fields State inside Drawer
  const [formName, setFormName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formBudget, setFormBudget] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('');
  const [formNat, setFormNat] = useState<string>('SA');
  const [formLang, setFormLang] = useState<string>('ar');
  const [formMoh, setFormMoh] = useState<boolean>(false);

  // Bulk actions
  const [bulkTag, setBulkTag] = useState<string>('');
  const [bulkOwner, setBulkOwner] = useState<string>('');

  // Delete Confirm Modal
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  // Filtered contacts
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let res = contactsList.filter((c) => {
      if (q) {
        const match =
          c.name.en.toLowerCase().includes(q) ||
          c.name.ar.toLowerCase().includes(q) ||
          c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          (c.email && c.email.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (segmentFilter === 'open' && (!c.ds || ['won', 'lost'].includes(c.ds))) return false;
      if (segmentFilter === 'human' && !c.human) return false;
      if (segmentFilter === 'won' && c.ds !== 'won') return false;
      if (projectFilter && c.project !== projectFilter) return false;
      if (channelFilter && !c.chs.includes(channelFilter)) return false;
      if (tagFilter && !c.tags.includes(tagFilter)) return false;
      return true;
    });

    res.sort((a, b) => {
      if (sortKey === 'name') {
        const va = L(a.name);
        const vb = L(b.name);
        const cmp = va.localeCompare(vb, lang);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'proj') {
        const va = projects[a.project]?.name ? L(projects[a.project].name) : a.project;
        const vb = projects[b.project]?.name ? L(projects[b.project].name) : b.project;
        const cmp = va.localeCompare(vb, lang);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'last') {
        return sortDir === 'asc' ? a.mins - b.mins : b.mins - a.mins;
      }
      if (sortKey === 'created') {
        return sortDir === 'asc' ? a.created - b.created : b.created - a.created;
      }
      return 0;
    });

    return res;
  }, [contactsList, searchQuery, segmentFilter, projectFilter, channelFilter, tagFilter, sortKey, sortDir, lang, projects, L]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / perPage));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedRows = useMemo(() => {
    return filteredList.slice(currentPage * perPage, currentPage * perPage + perPage);
  }, [filteredList, currentPage, perPage]);

  const allOnPageSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selectedIds.has(r.id));

  // Toggle selection
  const handleToggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allOnPageSelected) {
      pagedRows.forEach((r) => next.delete(r.id));
    } else {
      pagedRows.forEach((r) => next.add(r.id));
    }
    setSelectedIds(next);
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Sorting helper
  const handleSort = (key: 'name' | 'proj' | 'last' | 'created') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Open Drawer for Contact
  const handleOpenContact = (c: ContactItem) => {
    setActiveContact(c);
    setIsAddingNew(false);
    setDrawerTab('profile');
    setDrawerTags([...c.tags]);
    setFormName(L(c.name));
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormBudget(c.extra.budget ? String(c.extra.budget) : '');
    setFormUnit(c.extra.unit || '');
    setFormNat(c.extra.nat || 'SA');
    setFormLang(c.lang || 'ar');
    setFormMoh(c.extra.moh || false);
  };

  const handleOpenAddNew = () => {
    setActiveContact(null);
    setIsAddingNew(true);
    setDrawerTab('profile');
    setDrawerTags([]);
    setFormName('');
    setFormPhone('+966 5');
    setFormEmail('');
    setFormBudget('');
    setFormUnit('');
    setFormNat('SA');
    setFormLang('ar');
    setFormMoh(false);
  };

  const handleCloseDrawer = () => {
    setActiveContact(null);
    setIsAddingNew(false);
  };

  // Save Contact Drawer
  const handleSaveContact = () => {
    if (!formName.trim()) {
      toast(t('err_name'));
      return;
    }

    if (isAddingNew) {
      const newContact: ContactItem = {
        id: 'k' + (contactsList.length + 101),
        chat: null,
        name: { en: formName, ar: formName },
        phone: formPhone.trim(),
        email: formEmail.trim(),
        chs: ['whatsapp'],
        project: 'sadeel',
        ds: null,
        stage: null,
        owner: null,
        tags: [...drawerTags],
        ai: true,
        mins: 0,
        created: 0,
        lang: formLang,
        human: false,
        extra: {
          budget: Number(formBudget) || 0,
          unit: formUnit,
          nat: formNat,
          moh: formMoh,
          src: 'whatsapp',
        },
      };
      setContactsList((prev) => [newContact, ...prev]);
      toast(t('created'));
    } else if (activeContact) {
      setContactsList((prev) =>
        prev.map((c) => {
          if (c.id !== activeContact.id) return c;
          return {
            ...c,
            name: formName === L(c.name) ? c.name : { en: formName, ar: formName },
            phone: formPhone.trim(),
            email: formEmail.trim(),
            tags: [...drawerTags],
            lang: formLang,
            extra: {
              ...c.extra,
              budget: Number(formBudget) || 0,
              unit: formUnit,
              nat: formNat,
              moh: formMoh,
            },
          };
        })
      );
      toast(t('saved'));
    }
    handleCloseDrawer();
  };

  // Delete confirmation
  const handleExecuteDelete = () => {
    setContactsList((prev) => prev.filter((c) => !deleteIds.includes(c.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      deleteIds.forEach((id) => next.delete(id));
      return next;
    });
    toast(t('deleted').replace('{n}', String(deleteIds.length)));
    setShowConfirmDelete(false);
    handleCloseDrawer();
  };

  // KPI Metrics
  const totalContacts = contactsList.length;
  const newThisWeek = contactsList.filter((c) => c.created <= 7).length;
  const openDealsCount = contactsList.filter((c) => c.ds && !['won', 'lost'].includes(c.ds)).length;
  const wonCount = contactsList.filter((c) => c.ds === 'won').length;

  const currentChatForActive = activeContact?.chat
    ? chats.find((ch) => ch.id === activeContact.chat)
    : null;
  const currentProjectForActive = activeContact
    ? projects[activeContact.project]
    : null;
  const currentStageForActive = activeContact?.stage
    ? stages.find((s) => s.id === activeContact.stage)
    : null;

  const pageRangeA = filteredList.length ? currentPage * perPage + 1 : 0;
  const pageRangeB = Math.min(filteredList.length, (currentPage + 1) * perPage);

  return (
    <>
      {/* Top Header */}
      <section className="head">
        <div>
          <p className="sub" id="cSub">
            {t('contacts_sub').replace('{n}', String(totalContacts))}
          </p>
        </div>
        <div className="tools">
          <button
            className="btn gap"
            type="button"
            onClick={() =>
              toast(
                lang === 'ar'
                  ? 'الاستيراد يحتاج واجهة جديدة (نموذج أولي)'
                  : 'Import needs a new endpoint (prototype)'
              )
            }
          >
            <Upload className="w-4 h-4" />
            <span>{t('import')}</span>
          </button>
          <button
            className="btn gap"
            type="button"
            onClick={() => toast(t('exported'))}
          >
            <Download className="w-4 h-4" />
            <span>{t('export')}</span>
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={handleOpenAddNew}
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_contact')}</span>
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

      {/* Summary KPI Cards */}
      <section className="summary">
        <div className="card sum">
          <span className="s-ico">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_total')}</div>
            <div className="s-v num">{totalContacts}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Plus className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_new')}</div>
            <div className="s-v num">{newThisWeek}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <BriefcaseBusiness className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_open')}</div>
            <div className="s-v num">{openDealsCount}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_won')}</div>
            <div className="s-v num">{wonCount}</div>
          </div>
        </div>
      </section>

      {/* Main Filter & Table Card */}
      <section className="card" style={{ overflow: 'hidden' }}>
        <div className="filters">
          <div className="f-row">
            <label className="search-in">
              <Search className="w-4 h-4" />
              <input
                className="input"
                type="search"
                placeholder={t('search_c')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
              />
            </label>

            {/* Segmented Filter Pills */}
            <div className="seg" role="group">
              <button
                type="button"
                aria-pressed={segmentFilter === 'all'}
                onClick={() => {
                  setSegmentFilter('all');
                  setPage(0);
                }}
              >
                {t('f_all')}
              </button>
              <button
                type="button"
                aria-pressed={segmentFilter === 'open'}
                onClick={() => {
                  setSegmentFilter('open');
                  setPage(0);
                }}
              >
                {t('f_open')}
              </button>
              <button
                type="button"
                aria-pressed={segmentFilter === 'human'}
                onClick={() => {
                  setSegmentFilter('human');
                  setPage(0);
                }}
              >
                {t('f_human')}
              </button>
              <button
                type="button"
                aria-pressed={segmentFilter === 'won'}
                onClick={() => {
                  setSegmentFilter('won');
                  setPage(0);
                }}
              >
                {t('f_won')}
              </button>
            </div>

            {/* Project Filter */}
            <CustomSelect
              value={projectFilter}
              onChange={(val) => {
                setProjectFilter(val);
                setPage(0);
              }}
              options={[
                { value: '', label: t('all_projects') },
                ...Object.entries(projects).map(([k, p]) => ({
                  value: k,
                  label: L(p.name),
                })),
              ]}
              placeholder={t('all_projects')}
              style={{ minWidth: 160 }}
            />

            {/* Channel Filter */}
            <CustomSelect
              value={channelFilter}
              onChange={(val) => {
                setChannelFilter(val);
                setPage(0);
              }}
              options={[
                { value: '', label: t('all_channels') },
                ...CHANNELS_LIST.map((k) => ({
                  value: k,
                  label: t('ch_' + k),
                })),
              ]}
              placeholder={t('all_channels')}
              style={{ minWidth: 150 }}
            />
          </div>

          {/* Tags Filter Row */}
          <div className="f-row gap">
            <span className="tag-lbl">{t('tags_l')}</span>
            {TAG_KEYS.map((k) => {
              const count = contactsList.filter((c) => c.tags.includes(k)).length;
              const isSelected = tagFilter === k;
              return (
                <button
                  key={k}
                  className="chip"
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setTagFilter(isSelected ? '' : k);
                    setPage(0);
                  }}
                >
                  <TagIcon className="ico-sm" />
                  <span>{L(TAGS_MAP[k])}</span>
                  <span className="n num">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bulk Action Bar */}
        <div className={`bulk ${selectedIds.size > 0 ? 'show' : ''}`} role="region">
          <span className="b-n">
            {t('sel_n').replace('{n}', String(selectedIds.size))}
          </span>
          <select
            className="select"
            style={{ width: 'auto', height: '32px' }}
            value={bulkTag}
            onChange={(e) => {
              const tag = e.target.value;
              if (!tag) return;
              setContactsList((prev) =>
                prev.map((c) =>
                  selectedIds.has(c.id) && !c.tags.includes(tag)
                    ? { ...c, tags: [...c.tags, tag] }
                    : c
                )
              );
              toast(t('tag_added').replace('{n}', String(selectedIds.size)));
              setBulkTag('');
            }}
          >
            <option value="">{t('b_tag')}</option>
            {TAG_KEYS.map((k) => (
              <option key={k} value={k}>
                {L(TAGS_MAP[k])}
              </option>
            ))}
          </select>

          <select
            className="select"
            style={{ width: 'auto', height: '32px' }}
            value={bulkOwner}
            onChange={(e) => {
              const uId = e.target.value;
              const member = team.find((u) => u.id === uId);
              if (!member) return;
              setContactsList((prev) =>
                prev.map((c) =>
                  selectedIds.has(c.id) ? { ...c, owner: uId } : c
                )
              );
              toast(t('assigned').replace('{u}', L(member.name)));
              setBulkOwner('');
            }}
          >
            <option value="">{t('b_assign')}</option>
            {team.map((u) => (
              <option key={u.id} value={u.id}>
                {L(u.name)}
              </option>
            ))}
          </select>

          <button
            className="btn sm"
            type="button"
            onClick={() => toast(t('exported'))}
          >
            <Download className="ico-sm" />
            <span>{t('b_export')}</span>
          </button>
          <button
            className="btn sm danger"
            type="button"
            onClick={() => {
              setDeleteIds([...selectedIds]);
              setShowConfirmDelete(true);
            }}
          >
            <Trash2 className="ico-sm" />
            <span>{t('b_delete')}</span>
          </button>
          <span className="spacer" style={{ flex: 1 }} />
          <button
            className="btn sm ghost"
            type="button"
            onClick={() => setSelectedIds(new Set())}
          >
            {t('b_clear')}
          </button>
        </div>

        {/* Data Table */}
        <div className="table-wrap">
          {filteredList.length === 0 ? (
            <div className="empty" style={{ padding: '40px 20px' }}>
              <SearchX style={{ width: '32px', height: '32px' }} />
              <h3 style={{ margin: '10px 0 4px' }}>{t('empty_t')}</h3>
              <p style={{ marginBottom: '14px' }}>{t('empty_b')}</p>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSegmentFilter('all');
                  setProjectFilter('');
                  setChannelFilter('');
                  setTagFilter('');
                }}
              >
                {t('clear_f')}
              </button>
            </div>
          ) : (
            <table className="table" id="tbl">
              <thead>
                <tr>
                  <th className="chk">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={handleToggleSelectAll}
                      aria-label={t('select_all')}
                    />
                  </th>
                  <th
                    aria-sort={
                      sortKey === 'name'
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button type="button" onClick={() => handleSort('name')}>
                      {t('th_contact')}
                      {sortKey === 'name' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="col-ch">{t('th_ch')}</th>
                  <th
                    className="col-proj"
                    aria-sort={
                      sortKey === 'proj'
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button type="button" onClick={() => handleSort('proj')}>
                      {t('th_project')}
                      {sortKey === 'proj' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th>{t('th_deal')}</th>
                  <th className="col-stage">{t('th_stage')}</th>
                  <th className="col-owner">{t('th_owner')}</th>
                  <th className="col-tags">{t('th_tags')}</th>
                  <th className="col-ai">{t('th_ai')}</th>
                  <th
                    className="end"
                    aria-sort={
                      sortKey === 'last'
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button type="button" onClick={() => handleSort('last')}>
                      {t('th_last_act')}
                      {sortKey === 'last' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th
                    className="end col-created"
                    aria-sort={
                      sortKey === 'created'
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button type="button" onClick={() => handleSort('created')}>
                      {t('th_created')}
                      {sortKey === 'created' ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  const p = projects[c.project];
                  const stg = stages.find((s) => s.id === c.stage);
                  const o = team.find((u) => u.id === c.owner);

                  return (
                    <tr
                      key={c.id}
                      className={isSelected ? 'sel' : ''}
                      onClick={() => handleOpenContact(c)}
                    >
                      <td className="chk" onClick={(e) => handleToggleRow(c.id, e)}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={t('select_row').replace('{name}', L(c.name))}
                        />
                      </td>
                      <td>
                        <div className="who">
                          <Avatar name={L(c.name)} size="sm" />
                          <div style={{ minWidth: 0 }}>
                            <div className="name">{L(c.name)}</div>
                            <div className="meta ltr">{c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="col-ch">
                        <div className="chs">
                          {c.chs.map((chKey) => (
                            <ChannelBadge key={chKey} channel={chKey as Channel} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="col-proj">
                        {p ? L(p.name) : c.project}
                      </td>
                      <td>
                        {c.ds ? (
                          <DealStatusBadge status={c.ds as any} />
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="col-stage">
                        <span className="stage">
                          {stg ? L(stg.name) : '—'}
                        </span>
                      </td>
                      <td className="col-owner">
                        {o ? (
                          <span className="row" style={{ gap: '6px' }}>
                            <Avatar name={L(o.name)} size="sm" />
                            <span>{L(o.name).split(' ')[0]}</span>
                          </span>
                        ) : (
                          <span className="muted">{t('unassigned_o') || 'Unassigned'}</span>
                        )}
                      </td>
                      <td className="col-tags">
                        <div className="tags">
                          {c.tags.map((tg) => (
                            <span
                              key={tg}
                              className={`badge ${tg === 'vip' ? 'gold' : 'outline'}`}
                            >
                              {TAGS_MAP[tg] ? L(TAGS_MAP[tg]) : tg}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="col-ai">
                        {c.human ? (
                          <span className="badge danger">
                            <Hand className="w-3 h-3" />
                            <span>{t('needs_human')}</span>
                          </span>
                        ) : (
                          <AiBadge active={c.ai} />
                        )}
                      </td>
                      <td className="end muted" style={{ whiteSpace: 'nowrap' }}>
                        {timeAgo(c.mins)}
                      </td>
                      <td className="end muted num col-created" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(Date.now() - c.created * 864e5).toLocaleDateString(
                          lang === 'ar' ? 'ar-SA' : 'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pager Footer */}
        <div className="pager">
          <label className="row" style={{ gap: '6px' }}>
            <span>{t('per')}</span>
            <select
              className="select"
              style={{ width: 'auto', height: '32px' }}
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(0);
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="spacer" />
          <span className="num">
            {t('pg')
              .replace('{a}', String(pageRangeA))
              .replace('{b}', String(pageRangeB))
              .replace('{n}', String(filteredList.length))}
          </span>
          <button
            className="icon-btn"
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label={t('prev')}
          >
            <ChevronLeft className="flip-rtl w-4 h-4" />
          </button>
          <button
            className="icon-btn"
            type="button"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            aria-label={t('next_pg')}
          >
            <ChevronRight className="flip-rtl w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Slide-over Contact Drawer */}
      <Drawer
        open={Boolean(activeContact || isAddingNew)}
        onClose={handleCloseDrawer}
        width="min(560px, 100%)"
        footer={
          <div className="drawer-f w-full flex items-center gap-2">
            {!isAddingNew && activeContact && (
              <button
                className="btn danger"
                style={{ marginInlineEnd: 'auto' }}
                type="button"
                onClick={() => {
                  setDeleteIds([activeContact.id]);
                  setShowConfirmDelete(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('delete')}</span>
              </button>
            )}
            <button className="btn" type="button" onClick={handleCloseDrawer}>
              {t('cancel')}
            </button>
            <button className="btn primary" type="button" onClick={handleSaveContact}>
              <Check className="w-4 h-4" />
              <span>{isAddingNew ? t('add_contact') : t('save')}</span>
            </button>
          </div>
        }
      >
        {isAddingNew ? (
          <div className="drawer-h">
            <span className="avatar">
              <Plus className="ico-sm" />
            </span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div className="dh-name">{t('new_contact')}</div>
            </div>
            <button
              className="icon-btn"
              type="button"
              onClick={handleCloseDrawer}
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : activeContact ? (
          <>
            <div className="c-hero">
              <button
                className="icon-btn c-close"
                type="button"
                onClick={handleCloseDrawer}
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
              <Avatar name={L(activeContact.name)} size="xl" />
              <div className="dh-name">{L(activeContact.name)}</div>
              <div className="muted ltr num" style={{ fontSize: '12.5px' }}>
                {activeContact.phone}
              </div>
              {currentProjectForActive && (
                <div className="muted" style={{ fontSize: '12.5px' }}>
                  {L(currentProjectForActive.name)} · {L(currentProjectForActive.city)}
                </div>
              )}
              <div className="quick">
                {activeContact.chat ? (
                  <NavLink to={`/inbox?chat=${activeContact.chat}`}>
                    <span className="icon-btn">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <span>{t('q_chat')}</span>
                  </NavLink>
                ) : (
                  <a aria-disabled="true" className="is-dis">
                    <span className="icon-btn">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <span>{t('q_chat')}</span>
                  </a>
                )}
                <a href={`tel:${activeContact.phone.replace(/\s/g, '')}`}>
                  <span className="icon-btn">
                    <Phone className="w-4 h-4" />
                  </span>
                  <span>{t('q_call')}</span>
                </a>
                <a
                  href={`https://wa.me/${activeContact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="icon-btn">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  <span>{t('q_wa')}</span>
                </a>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-u c-tabs" role="tablist">
              <button
                role="tab"
                type="button"
                aria-selected={drawerTab === 'profile'}
                onClick={() => setDrawerTab('profile')}
              >
                {t('ctab_profile')}
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={drawerTab === 'deals'}
                onClick={() => setDrawerTab('deals')}
              >
                {t('ctab_deals')}
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={drawerTab === 'activity'}
                onClick={() => setDrawerTab('activity')}
              >
                {t('ctab_activity')}
              </button>
            </div>
          </>
        ) : null}

        {/* Drawer Body */}
        <div className="drawer-b">
          {/* TAB 1: Profile */}
          {drawerTab === 'profile' && (
            <>
              <section>
                <div className="sec-t">{t('sec_profile')}</div>
                <div className="form-grid">
                  <div className="field full">
                    <label htmlFor="cName">
                      {t('f_name')}
                      <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      id="cName"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="cPhone">
                      {t('f_phone')}
                      <span className="req">*</span>
                    </label>
                    <input
                      className="input ltr"
                      id="cPhone"
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                    />
                    <span className="help">{t('help_phone')}</span>
                  </div>

                  <div className="field">
                    <label htmlFor="cEmail">{t('f_email')}</label>
                    <input
                      className="input ltr"
                      id="cEmail"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>

                  <div className="field full">
                    <label>{t('f_tags')}</label>
                    <div className="tag-edit">
                      {drawerTags.map((tKey, idx) => (
                        <span
                          key={tKey}
                          className={`badge ${tKey === 'vip' ? 'gold' : 'brand'}`}
                        >
                          <span>{TAGS_MAP[tKey] ? L(TAGS_MAP[tKey]) : tKey}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawerTags((prev) => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        id="tagIn"
                        placeholder={t('f_tag_ph')}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            e.preventDefault();
                            const val = tagInput.trim().toLowerCase();
                            const matchedKey =
                              TAG_KEYS.find(
                                (k) =>
                                  L(TAGS_MAP[k]).toLowerCase() === val ||
                                  TAGS_MAP[k].en.toLowerCase() === val ||
                                  TAGS_MAP[k].ar.toLowerCase() === val
                              ) || val;
                            if (!drawerTags.includes(matchedKey)) {
                              setDrawerTags([...drawerTags, matchedKey]);
                            }
                            setTagInput('');
                          } else if (e.key === 'Backspace' && !tagInput && drawerTags.length > 0) {
                            setDrawerTags(drawerTags.slice(0, -1));
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="gap">
                <div className="sec-t">{t('sec_extra')}</div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="xBudget">{t('f_budget')}</label>
                    <input
                      className="input ltr"
                      id="xBudget"
                      type="number"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="xUnit">{t('f_unit')}</label>
                    <input
                      className="input"
                      id="xUnit"
                      type="text"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="xNat">{t('f_nat')}</label>
                    <select
                      className="select"
                      id="xNat"
                      value={formNat}
                      onChange={(e) => setFormNat(e.target.value)}
                    >
                      <option value="SA">{lang === 'ar' ? 'سعودي' : 'Saudi'}</option>
                      <option value="AE">{lang === 'ar' ? 'إماراتي' : 'Emirati'}</option>
                      <option value="EG">{lang === 'ar' ? 'مصري' : 'Egyptian'}</option>
                      <option value="XX">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="xLang">{t('f_lang')}</label>
                    <select
                      className="select"
                      id="xLang"
                      value={formLang}
                      onChange={(e) => setFormLang(e.target.value)}
                    >
                      <option value="ar">{t('lang_ar') || 'العربية'}</option>
                      <option value="en">{t('lang_en') || 'English'}</option>
                    </select>
                  </div>

                  <label className="switch full">
                    <input
                      type="checkbox"
                      checked={formMoh}
                      onChange={(e) => setFormMoh(e.target.checked)}
                    />
                    <span className="track" />
                    <span>{t('f_moh')}</span>
                  </label>
                </div>
              </section>
            </>
          )}

          {/* TAB 2: Deals & Conversations */}
          {!isAddingNew && activeContact && drawerTab === 'deals' && (
            <>
              <section>
                <div className="sec-t">{t('sec_deals')}</div>
                {activeContact.ds && currentProjectForActive ? (
                  <div className="links">
                    <NavLink to="/pipeline" className="link-row">
                      <span className="grow" style={{ minWidth: 0 }}>
                        <b>{L(currentProjectForActive.name)}</b> · {activeContact.extra.unit || '—'}
                        <div className="lr-m">
                          {currentStageForActive ? L(currentStageForActive.name) : ''}
                        </div>
                      </span>
                      <span className="lr-end">
                        <span className="num" style={{ fontWeight: 600 }}>
                          {activeContact.extra.budget
                            ? money(activeContact.extra.budget, currentProjectForActive.cur)
                            : '—'}
                        </span>
                        <DealStatusBadge status={activeContact.ds as any} />
                      </span>
                    </NavLink>
                  </div>
                ) : (
                  <p className="muted">{t('no_deals')}</p>
                )}
              </section>

              <section className="gap">
                <div className="sec-t">{t('sec_convs')}</div>
                {currentChatForActive ? (
                  <div className="links">
                    {activeContact.chs.map((chKey, i) => (
                      <NavLink
                        key={chKey}
                        to={`/inbox?chat=${currentChatForActive.id}`}
                        className="link-row"
                      >
                        <ChannelBadge channel={chKey as Channel} size="md" />
                        <span className="grow" style={{ minWidth: 0 }}>
                          <b>{t('ch_' + chKey)}</b>
                          <div
                            className="lr-m"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {i === 0 ? currentChatForActive.preview : '—'}
                          </div>
                        </span>
                        <span className="lr-end muted" style={{ fontSize: '12px' }}>
                          {timeAgo(i === 0 ? activeContact.mins : activeContact.mins + 2880)}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <p className="muted">{t('no_convs')}</p>
                )}
              </section>
            </>
          )}

          {/* TAB 3: Activity Timeline */}
          {!isAddingNew && activeContact && drawerTab === 'activity' && (
            <section className="gap">
              <div className="sec-t">{t('sec_log')}</div>
              <ul className="log">
                {currentStageForActive && (
                  <>
                    <li>
                      <span className="li-ico ai">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div>
                          {t('log_stage').replace(
                            '{s}',
                            ` ${L(currentStageForActive.name)}`
                          )}
                        </div>
                        <div className="li-m">{timeAgo(activeContact.mins + 60)}</div>
                      </div>
                    </li>
                    <li>
                      <span className="li-ico ai">
                        <Wallet className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <div>{t('log_ai')}</div>
                        <div className="li-m">{timeAgo(activeContact.mins + 400)}</div>
                      </div>
                    </li>
                  </>
                )}

                {activeContact.tags[0] && (
                  <li>
                    <span className="li-ico">
                      <TagIcon className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div>
                        {t('log_tag')
                          .replace(
                            '{t}',
                            TAGS_MAP[activeContact.tags[0]]
                              ? L(TAGS_MAP[activeContact.tags[0]])
                              : activeContact.tags[0]
                          )
                          .replace('{u}', team[1] ? L(team[1].name) : 'Admin')}
                      </div>
                      <div className="li-m">{timeAgo(activeContact.mins + 900)}</div>
                    </div>
                  </li>
                )}

                <li>
                  <span className="li-ico">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div>
                      {t('log_created').replace(
                        '{ch}',
                        t('ch_' + activeContact.extra.src)
                      )}
                    </div>
                    <div className="li-m">
                      {new Date(
                        Date.now() - activeContact.created * 864e5
                      ).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  </div>
                </li>
              </ul>
            </section>
          )}
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div
          className="modal open"
          role="alertdialog"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            zIndex: 90,
            padding: 'var(--s4)',
          }}
        >
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(3px)',
            }}
            onClick={() => setShowConfirmDelete(false)}
          />
          <div className="m-card" style={{ position: 'relative', zIndex: 91 }}>
            <div className="m-ico">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3>{t('del_t').replace('{n}', String(deleteIds.length))}</h3>
            <p className="muted" style={{ fontSize: '13.5px' }}>
              {t('del_b')}
            </p>
            <div className="m-acts">
              <button
                className="btn"
                type="button"
                onClick={() => setShowConfirmDelete(false)}
              >
                {t('cancel')}
              </button>
              <button
                className="btn danger-solid"
                type="button"
                onClick={handleExecuteDelete}
              >
                {t('del_yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
