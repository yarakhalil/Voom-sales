import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { ChannelBadge, DealStatusBadge, Drawer, Avatar, CustomSelect } from '../components/common';
import { Chat, Channel, DealStatus } from '../types';
import {
  Route,
  Tags,
  Plus,
  SquareKanban,
  Table2,
  AlarmClock,
  Clock,
  Hand,
  Sparkles,
  Trophy,
  CircleX,
  ArrowUp,
  ArrowDown,
  MessagesSquare,
  ChevronRight,
  BriefcaseBusiness,
  Wallet,
  Hourglass,
  X,
} from 'lucide-react';

interface DealItem {
  id: string;
  chat: string | null;
  name: { en: string; ar: string };
  ch: Channel;
  project: string;
  stage: string;
  ds: DealStatus;
  value: number;
  unit: string;
  owner: string | null;
  ai: boolean;
  hot: boolean;
  age: number;
}

const EXTRA_DEALS: [string, string, Channel, string, string, DealStatus, number, string][] = [
  ['Turki Al-Shammari', 'تركي الشمري', 'whatsapp', 'sadeel', 's1', 'new', 0, '—'],
  ['Nada Al-Rashid', 'ندى الراشد', 'instagram', 'jawharat-al-ruba', 's1', 'new', 0, '—'],
  ['Mahmoud Saeed', 'محمود سعيد', 'phone', 'nile-view', 's2', 'new', 2400000, 'Tower C · 2BR'],
  ['Abeer Al-Qasimi', 'عبير القاسمي', 'whatsapp', 'stax', 's2', 'qualified', 1350000, 'T1 · 1BR'],
  ['Saud Al-Anazi', 'سعود العنزي', 'tour', 'sadeel', 's2', 'qualified', 2250000, 'Model 3'],
  ['Rana Mostafa', 'رنا مصطفى', 'messenger', 'nile-view', 's3', 'proposal', 2800000, 'Tower A · 3BR'],
  ['Majed Al-Subaie', 'ماجد السبيعي', 'tour', 'jawharat-al-ruba', 's3', 'qualified', 2950000, 'Villa D-02'],
  ['Hessa Al-Kaabi', 'حصة الكعبي', 'email', 'stax', 's4', 'proposal', 2100000, 'T2-2204 · 3BR'],
  ['Bandar Al-Harthi', 'بندر الحارثي', 'whatsapp', 'flamant', 's4', 'negotiation', 1180000, 'B2-F7-704'],
  ['Dina Adel', 'دينا عادل', 'phone', 'nile-view', 's5', 'negotiation', 3400000, 'Penthouse B'],
  ['Nawaf Al-Dossary', 'نواف الدوسري', 'instagram', 'sadeel', 's1', 'new', 0, '—'],
];

/** Currency conversion rates relative to Saudi Riyal (SAR) for unified aggregation */
const FX_RATES_TO_SAR: Record<string, number> = { SAR: 1, AED: 1.02, EGP: 0.077 };

/** Sequential sales pipeline stage identifiers (s1 through s5) */
const STAGE_ORDER = ['s1', 's2', 's3', 's4', 's5'];

/** Open pipeline deal statuses displayed when grouped by deal status */
const ACTIVE_DEAL_STATUSES: DealStatus[] = ['new', 'qualified', 'proposal', 'negotiation'];

export const PipelinePage: React.FC = () => {
  const { t, L, money, pct, n, lang, timeAgo, toast } = useApp();
  const { chats, stages, projects, team, agents } = useData();

  // State
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.id || 'ag1');
  const [groupBy, setGroupBy] = useState<'stage' | 'status'>('stage');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');

  const [sortKey, setSortKey] = useState<'name' | 'value' | 'age'>('value');
  const [sortDir, setSortDir] = useState<number>(-1);

  const [draggingDealId, setDraggingDealId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(null);

  // Drawer edit states
  const [drawerStage, setDrawerStage] = useState<string>('s1');
  const [drawerStatus, setDrawerStatus] = useState<DealStatus>('new');

  // Stage lookup
  const stageMap = useMemo(() => {
    return Object.fromEntries(stages.map((s) => [s.id, s]));
  }, [stages]);

  // Initial deals constructed from chats + extra deals matching prototype
  const [dealList, setDealList] = useState<DealItem[]>(() => {
    const chatDeals: DealItem[] = chats
      .filter((c: Chat) => c.status !== 'closed')
      .map((c: Chat) => ({
        id: 'd' + c.id,
        chat: c.id,
        name: c.name,
        ch: c.ch,
        project: c.project,
        stage: c.stage,
        ds: c.ds,
        value: c.budget,
        unit: c.unit,
        owner: c.assigned,
        ai: c.ai,
        hot: !c.ai && (c.priority === 'high' || c.priority === 'urgent'),
        age: 1 + (c.mins % 9),
      }));

    const extra: DealItem[] = EXTRA_DEALS.map((e, i) => ({
      id: 'dx' + i,
      chat: null,
      name: { en: e[0], ar: e[1] },
      ch: e[2],
      project: e[3],
      stage: e[4],
      ds: e[5],
      value: e[6],
      unit: e[7],
      owner: ([null, 'u2', 'u3', null, 'u4'] as (string | null)[])[i % 5],
      ai: i % 4 !== 3,
      hot: false,
      age: [0, 1, 3, 2, 6, 4, 9, 2, 5, 1, 0][i] || 0,
    }));

    return chatDeals.concat(extra);
  });

  // Converts deal value into SAR equivalent for unified summation and sorting
  const convertToSar = (deal: DealItem): number => {
    const project = projects[deal.project];
    const currency = project?.cur || 'SAR';
    return deal.value * (FX_RATES_TO_SAR[currency] || 1);
  };

  // Filtered visible deals
  const visibleDeals = useMemo(() => {
    return dealList.filter((d: DealItem) => {
      if (projectFilter && d.project !== projectFilter) return false;
      if (channelFilter && d.ch !== channelFilter) return false;
      if (ownerFilter) {
        if (ownerFilter === 'ai' && !d.ai) return false;
        if (ownerFilter !== 'ai' && d.owner !== ownerFilter) return false;
      }
      return true;
    });
  }, [dealList, projectFilter, channelFilter, ownerFilter]);

  // Total SAR value across visible deals
  const totalValue = useMemo(() => {
    return visibleDeals.reduce((sum, deal) => sum + convertToSar(deal), 0);
  }, [visibleDeals]);

  // Move deal handler
  const handleMoveDeal = (id: string, target: string) => {
    const targetDeal = dealList.find((x) => x.id === id);
    if (!targetDeal) return;

    let targetLabel = '';
    if (target === 'won' || target === 'lost') {
      targetDeal.ds = target as DealStatus;
      setDealList((prev) => prev.filter((x) => x.id !== id));
      targetLabel = t('ds_' + target);
    } else if (groupBy === 'stage') {
      targetDeal.stage = target;
      targetDeal.age = 0;
      targetLabel = stageMap[target] ? L(stageMap[target].name) : target;
      setDealList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, stage: target, age: 0 } : item))
      );
    } else {
      targetDeal.ds = target as DealStatus;
      targetLabel = t('ds_' + target);
      setDealList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ds: target as DealStatus } : item))
      );
    }

    toast(
      t('moved_deal')
        .replace('{who}', L(targetDeal.name))
        .replace('{to}', targetLabel)
    );
  };

  // Open deal drawer
  const handleOpenDeal = (deal: DealItem) => {
    setSelectedDeal(deal);
    setDrawerStage(deal.stage);
    setDrawerStatus(deal.ds);
  };

  const handleSaveDrawer = () => {
    if (!selectedDeal) return;
    if (drawerStatus === 'won' || drawerStatus === 'lost') {
      handleMoveDeal(selectedDeal.id, drawerStatus);
    } else {
      const stageChanged = drawerStage !== selectedDeal.stage;
      setDealList((prev) =>
        prev.map((d) =>
          d.id === selectedDeal.id
            ? {
                ...d,
                stage: drawerStage,
                ds: drawerStatus,
                age: stageChanged ? 0 : d.age,
              }
            : d
        )
      );
      toast(t('saved'));
    }
    setSelectedDeal(null);
  };

  // Kanban board columns grouped by funnel stage or deal status
  const boardColumns = useMemo(() => {
    if (groupBy === 'stage') {
      return STAGE_ORDER.map((stageId) => {
        const stageObj = stageMap[stageId];
        const followUpMeta =
          stageObj && stageObj.fu && stageObj.fu.max
            ? t('fu').replace('{h}', n(stageObj.fu.interval)).replace('{m}', n(stageObj.fu.max))
            : t('no_fu');
        return {
          id: stageId,
          name: stageObj ? L(stageObj.name) : stageId,
          meta: followUpMeta,
          items: visibleDeals.filter((deal) => deal.stage === stageId),
        };
      });
    } else {
      return ACTIVE_DEAL_STATUSES.map((statusId) => ({
        id: statusId,
        name: t('ds_' + statusId),
        meta: '',
        items: visibleDeals.filter((deal) => deal.ds === statusId),
      }));
    }
  }, [groupBy, stageMap, visibleDeals, t, n, L]);

  const maxColumnItems = Math.max(...boardColumns.map((col) => col.items.length), 1);

  // Table sorted deals
  const sortedTableDeals = useMemo(() => {
    return visibleDeals.slice().sort((a, b) => {
      if (sortKey === 'value') {
        return (convertToSar(a) - convertToSar(b)) * sortDir;
      }
      if (sortKey === 'name') {
        return L(a.name).localeCompare(L(b.name), lang) * sortDir;
      }
      return (a.age - b.age) * sortDir;
    });
  }, [visibleDeals, sortKey, sortDir, L, lang]);

  const handleSort = (key: 'name' | 'value' | 'age') => {
    if (sortKey === key) {
      setSortDir((prev) => -prev);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  // Selected deal drawer calculations
  const selectedProj = selectedDeal ? projects[selectedDeal.project] : null;
  const selectedStageIndex = selectedDeal ? STAGE_ORDER.indexOf(selectedDeal.stage) : 0;
  const stageStack = selectedDeal ? STAGE_ORDER.slice(selectedStageIndex + 1, selectedStageIndex + 3) : [];
  const selectedDetails = useMemo(() => {
    if (!selectedDeal || !selectedProj) return null;
    return {
      project: selectedDeal.project,
      unit: selectedDeal.unit,
      budget: selectedDeal.value,
      currency: selectedProj.cur,
      timeline: '3-6 months',
      financing: selectedProj.cc === 'SA' ? 'mortgage + MOH' : 'installments',
      household: 7,
      purpose: 'residence',
    };
  }, [selectedDeal, selectedProj]);

  return (
    <>
      {/* Toolbar */}
      <section className="toolbar">
        <div
          className="pipe-sel"
          data-api="GET /tenants/{tid}/agents/ · GET /stages/ (filter by agent_id client-side)"
        >
          <label className="sr-only" htmlFor="agentSel">
            {t('pipeline_of')}
          </label>
          <CustomSelect
            id="agentSel"
            value={selectedAgent}
            onChange={setSelectedAgent}
            options={agents.map((ag) => ({
              value: ag.id,
              label: L(ag.name),
            }))}
            placeholder={t('pipeline_of')}
          />
        </div>

        {/* Group By Segment */}
        <div className="seg" role="group" aria-label="Group by" id="groupSeg">
          <button
            type="button"
            aria-pressed={groupBy === 'stage'}
            onClick={() => setGroupBy('stage')}
          >
            <Route className="ico-sm w-4 h-4" />
            <span>{t('by_stage')}</span>
          </button>
          <button
            type="button"
            aria-pressed={groupBy === 'status'}
            onClick={() => setGroupBy('status')}
          >
            <Tags className="ico-sm w-4 h-4" />
            <span>{t('by_status')}</span>
          </button>
        </div>

        <div className="spacer" />

        {/* Project Filter */}
        <CustomSelect
          id="projF"
          value={projectFilter}
          onChange={setProjectFilter}
          options={[
            { value: '', label: t('all_projects') },
            ...Object.entries(projects).map(([k, p]) => ({
              value: k,
              label: L(p.name),
            })),
          ]}
          placeholder={t('all_projects')}
        />

        {/* Channel Filter */}
        <CustomSelect
          id="chF"
          value={channelFilter}
          onChange={setChannelFilter}
          options={[
            { value: '', label: t('all_channels') },
            ...(['whatsapp', 'instagram', 'telegram', 'messenger', 'phone', 'tour', 'email'] as Channel[]).map(
              (c) => ({
                value: c,
                label: t('ch_' + c),
              })
            ),
          ]}
          placeholder={t('all_channels')}
        />

        {/* Owner Filter */}
        <CustomSelect
          id="ownF"
          value={ownerFilter}
          onChange={setOwnerFilter}
          options={[
            { value: '', label: t('all_owners') },
            { value: 'ai', label: t('ai_only') },
            ...team.map((u) => ({
              value: u.id,
              label: L(u.name),
            })),
          ]}
          placeholder={t('all_owners')}
        />

        {/* View Segment (Board / Table) */}
        <div className="seg" role="group" aria-label="View" id="viewSeg">
          <button
            type="button"
            aria-label="Board"
            aria-pressed={viewMode === 'board'}
            onClick={() => setViewMode('board')}
          >
            <SquareKanban className="ico-sm w-4 h-4" />
            <span className="hide-sm">{t('board')}</span>
          </button>
          <button
            type="button"
            aria-label="Table"
            aria-pressed={viewMode === 'table'}
            onClick={() => setViewMode('table')}
          >
            <Table2 className="ico-sm w-4 h-4" />
            <span className="hide-sm">{t('table')}</span>
          </button>
        </div>

        {/* New Deal Button */}
        <button
          className="btn primary"
          type="button"
          id="newDeal"
          onClick={() => toast(t('new_deal') + ' → POST /tenants/{tid}/deals/')}
        >
          <Plus className="w-4 h-4" />
          <span>{t('new_deal')}</span>
        </button>
      </section>

      {/* Summary KPI Cards */}
      <section
        className="summary gap"
        id="summary"
        data-api="NEW GET /analytics/pipeline?agent_id= (stage durations need timestamps)"
      >
        <div className="card sum">
          <span className="s-ico">
            <BriefcaseBusiness className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_open')}</div>
            <div className="s-v num">{n(visibleDeals.length)}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Wallet className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_value')}</div>
            <div className="s-v num">{money(totalValue)}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Hourglass className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_age')}</div>
            <div className="s-v num">
              {t('days').replace('{n}', n(3.4, { maximumFractionDigits: 1 }))}
            </div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_win')}</div>
            <div className="s-v num">{pct(0.284, 1)}</div>
          </div>
        </div>
      </section>

      {/* Main View (Board / Table) */}
      <section id="view">
        {viewMode === 'board' ? (
          <div
            className="board-wrap"
            data-api="GET /deals/ · PATCH /deals/{id} {stage_id | deal_status} · NEW activity_log entry on manual move"
            onWheel={(e) => {
              if (e.deltaY !== 0 && e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
                if (Math.abs(e.deltaX) === 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }
            }}
          >
            <div className="board">
              {boardColumns.map((col, idx) => {
                const colSum = col.items.reduce((acc, d) => acc + convertToSar(d), 0);
                const nextCol = boardColumns[idx + 1];
                const convRate = [0.58, 0.51, 0.53, 0.36][idx] || 0.4;
                const sortedItems = col.items.slice().sort((a, b) => {
                  const hotDiff = (b.hot ? 1 : 0) - (a.hot ? 1 : 0);
                  if (hotDiff !== 0) return hotDiff;
                  return convertToSar(b) - convertToSar(a);
                });

                return (
                  <section
                    key={col.id}
                    className="col"
                    data-col={col.id}
                    aria-label={col.name}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('over');
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        e.currentTarget.classList.remove('over');
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('over');
                      const dealId = e.dataTransfer.getData('text/plain');
                      if (dealId) handleMoveDeal(dealId, col.id);
                      setDraggingDealId(null);
                    }}
                  >
                    <header className="col-h">
                      <div className="ct">
                        <span className="cn">{col.name}</span>
                        <span className="cc num">{n(col.items.length)}</span>
                        <span className="cv num">{money(colSum)}</span>
                      </div>
                      <div className="col-bar">
                        <i style={{ width: `${(col.items.length / maxColumnItems) * 100}%` }} />
                      </div>
                      <div className="cm">
                        {col.meta ? (
                          <span className="badge">
                            <AlarmClock className="w-3.5 h-3.5" />
                            {col.meta}
                          </span>
                        ) : null}
                        {nextCol ? (
                          <span>{t('conv_next').replace('{p}', pct(convRate))}</span>
                        ) : null}
                      </div>
                    </header>

                    <div className="col-b">
                      {sortedItems.map((d: DealItem) => {
                        const p = projects[d.project];
                        const owner = team.find((u) => u.id === d.owner);
                        return (
                          <article
                            key={d.id}
                            className={`deal ${d.hot ? 'hot' : ''} ${
                              draggingDealId === d.id ? 'dragging' : ''
                            }`}
                            draggable
                            data-id={d.id}
                            tabIndex={0}
                            role="button"
                            aria-label={L(d.name)}
                            onDragStart={(e) => {
                              setDraggingDealId(d.id);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', d.id);
                            }}
                            onDragEnd={() => {
                              setDraggingDealId(null);
                            }}
                            onClick={() => handleOpenDeal(d)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleOpenDeal(d);
                              }
                            }}
                          >
                            <div className="d-top">
                              <ChannelBadge channel={d.ch} size="sm" />
                              <span className="d-name">{L(d.name)}</span>
                            </div>
                            <div className="d-sub">
                              {p ? L(p.name) : d.project}
                              {d.unit && d.unit !== '—' && ` · ${d.unit}`}
                            </div>
                            <div className="d-val num">
                              {d.value > 0 && p ? (
                                money(d.value, p.cur, false)
                              ) : (
                                <span className="muted" style={{ fontWeight: 500, fontSize: '13px' }}>
                                  {lang === 'ar' ? 'قيد التحديد' : 'To be qualified'}
                                </span>
                              )}
                            </div>
                            <div className="d-foot">
                              {d.hot ? (
                                <span className="badge danger">
                                  <Hand className="w-3 h-3" />
                                  {t('needs_human')}
                                </span>
                              ) : d.ai ? (
                                <span className="badge ai">
                                  <Sparkles className="w-3 h-3" />
                                  AI
                                </span>
                              ) : null}

                              {groupBy === 'stage' ? (
                                <DealStatusBadge status={d.ds} />
                              ) : (
                                <span className="badge outline">
                                  {stageMap[d.stage] ? L(stageMap[d.stage].name) : d.stage}
                                </span>
                              )}

                              <span
                                className={`age ${d.age >= 5 ? 'stale' : ''}`}
                                title={t('th_age')}
                              >
                                <Clock className="ico-sm w-3.5 h-3.5" />
                                {t('d_short').replace('{n}', n(d.age))}
                              </span>

                              {owner && (
                                <Avatar name={L(owner.name)} size="sm" />
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <button
                      className="col-add"
                      type="button"
                      onClick={() => toast(t('add_deal'))}
                    >
                      <Plus className="ico-sm w-3.5 h-3.5" />
                      {t('add_deal')}
                    </button>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card tbl-card">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th
                      aria-sort={
                        sortKey === 'name' ? (sortDir > 0 ? 'ascending' : 'descending') : 'none'
                      }
                    >
                      <button type="button" onClick={() => handleSort('name')}>
                        {t('th_client')}
                        {sortKey === 'name' &&
                          (sortDir > 0 ? (
                            <ArrowUp className="ico-sm w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="ico-sm w-3.5 h-3.5" />
                          ))}
                      </button>
                    </th>
                    <th>{t('th_project')}</th>
                    <th
                      className="end"
                      aria-sort={
                        sortKey === 'value' ? (sortDir > 0 ? 'ascending' : 'descending') : 'none'
                      }
                    >
                      <button type="button" onClick={() => handleSort('value')}>
                        {t('th_value')}
                        {sortKey === 'value' &&
                          (sortDir > 0 ? (
                            <ArrowUp className="ico-sm w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="ico-sm w-3.5 h-3.5" />
                          ))}
                      </button>
                    </th>
                    <th>{t('th_stage')}</th>
                    <th>{t('th_status')}</th>
                    <th>{t('th_owner')}</th>
                    <th
                      className="end"
                      aria-sort={
                        sortKey === 'age' ? (sortDir > 0 ? 'ascending' : 'descending') : 'none'
                      }
                    >
                      <button type="button" onClick={() => handleSort('age')}>
                        {t('th_age')}
                        {sortKey === 'age' &&
                          (sortDir > 0 ? (
                            <ArrowUp className="ico-sm w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="ico-sm w-3.5 h-3.5" />
                          ))}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTableDeals.map((d: DealItem) => {
                    const p = projects[d.project];
                    const owner = team.find((u) => u.id === d.owner);
                    return (
                      <tr
                        key={d.id}
                        data-id={d.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenDeal(d)}
                      >
                        <td>
                          <div className="who">
                            <ChannelBadge channel={d.ch} size="sm" />
                            <div style={{ minWidth: 0 }}>
                              <div className="name">{L(d.name)}</div>
                              {d.hot && (
                                <div className="meta" style={{ color: 'var(--danger)' }}>
                                  {t('needs_human')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {p ? L(p.name) : d.project}
                          {d.unit && d.unit !== '—' && (
                            <span className="muted"> · {d.unit}</span>
                          )}
                        </td>
                        <td className="end num">
                          {d.value > 0 && p ? (
                            money(d.value, p.cur, false)
                          ) : (
                            <span className="muted" style={{ fontWeight: 500, fontSize: '12.5px' }}>
                              {lang === 'ar' ? 'قيد التحديد' : 'To be qualified'}
                            </span>
                          )}
                        </td>
                        <td>{stageMap[d.stage] ? L(stageMap[d.stage].name) : d.stage}</td>
                        <td>
                          <DealStatusBadge status={d.ds} />
                        </td>
                        <td>
                          {owner ? (
                            L(owner.name)
                          ) : d.ai ? (
                            <span className="badge ai">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          ) : (
                            <span className="muted">{t('unassigned_deal')}</span>
                          )}
                        </td>
                        <td className="end num">{t('d_short').replace('{n}', n(d.age))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Drag & Drop floating Bottom Bar */}
      <div
        className={`dropbar ${draggingDealId ? 'show' : ''}`}
        id="dropbar"
        aria-hidden={!draggingDealId}
      >
        <div
          className="drop won"
          data-drop="won"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('over');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('over');
            const dealId = e.dataTransfer.getData('text/plain');
            if (dealId) handleMoveDeal(dealId, 'won');
            setDraggingDealId(null);
          }}
        >
          <Trophy className="w-5 h-5" />
          <span>{t('drop_won')}</span>
        </div>

        <div
          className="drop lost"
          data-drop="lost"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('over');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('over');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('over');
            const dealId = e.dataTransfer.getData('text/plain');
            if (dealId) handleMoveDeal(dealId, 'lost');
            setDraggingDealId(null);
          }}
        >
          <CircleX className="w-5 h-5" />
          <span>{t('drop_lost')}</span>
        </div>
      </div>

      {/* Deal Details Drawer */}
      <Drawer
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        hideHeader
      >
        {selectedDeal && selectedProj && (
          <>
            {/* Custom Drawer Header */}
            <div className="drawer-h">
              <ChannelBadge channel={selectedDeal.ch} size="lg" />
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="dh-name" id="dTitle">
                  {L(selectedDeal.name)}
                </div>
                <div className="muted" style={{ fontSize: '12.5px' }}>
                  {L(selectedProj.name)} · {L(selectedProj.city)}
                </div>
              </div>
              <button
                className="icon-btn"
                type="button"
                id="dClose"
                aria-label={t('close')}
                onClick={() => setSelectedDeal(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="drawer-b">
              {/* Value & Status */}
              <div>
                <div className="sec-t">{t('d_value')}</div>
                <div className="row">
                  <div className="big-val num grow">
                    {selectedDeal.value > 0
                      ? money(selectedDeal.value, selectedProj.cur, false)
                      : (
                        <span className="muted" style={{ fontWeight: 500, fontSize: '18px' }}>
                          {lang === 'ar' ? 'قيد التحديد' : 'To be qualified'}
                        </span>
                      )}
                  </div>
                  <DealStatusBadge status={selectedDeal.ds} />
                </div>
                {selectedProj.cur !== 'SAR' && selectedDeal.value > 0 && (
                  <div className="muted num" style={{ fontSize: '12.5px' }}>
                    ≈ {money(convertToSar(selectedDeal), 'SAR', false)}
                  </div>
                )}
              </div>

              {/* Stage & Status selectors */}
              <div className="row wrap" style={{ gap: 'var(--s3)' }}>
                <div className="field grow" style={{ minWidth: 160 }}>
                  <label htmlFor="dStage">{t('d_stage')}</label>
                  <CustomSelect
                    id="dStage"
                    value={drawerStage}
                    onChange={setDrawerStage}
                    options={STAGE_ORDER.map((sid) => ({
                      value: sid,
                      label: stageMap[sid] ? L(stageMap[sid].name) : sid,
                    }))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="field grow" style={{ minWidth: 160 }}>
                  <label htmlFor="dStatus">{t('d_status')}</label>
                  <CustomSelect
                    id="dStatus"
                    value={drawerStatus}
                    onChange={(val) => setDrawerStatus(val as DealStatus)}
                    options={(['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as DealStatus[]).map(
                      (s) => ({
                        value: s,
                        label: t('ds_' + s),
                      })
                    )}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Queued stages stack */}
              <div data-api="deal.stage_stack (raw stage ids)">
                <div className="sec-t">{t('d_stack')}</div>
                <div className="stack-q">
                  {stageStack.length > 0 ? (
                    stageStack.map((sid, idx) => (
                      <React.Fragment key={sid}>
                        {idx > 0 && (
                          <ChevronRight className="flip-rtl ico-sm muted w-3.5 h-3.5" />
                        )}
                        <span className="badge info">
                          {stageMap[sid] ? L(stageMap[sid].name) : sid}
                        </span>
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="muted">{t('empty_stack')}</span>
                  )}
                </div>
              </div>

              {/* Qualification Details */}
              <div data-api="deal.details (free-form JSON)">
                <div className="sec-t">{t('d_details')}</div>
                <dl className="kv">
                  <dt>{t('th_project')}</dt>
                  <dd>
                    {L(selectedProj.name)} · {selectedDeal.unit}
                  </dd>
                  <dt>{t('timeline')}</dt>
                  <dd>{lang === 'ar' ? '٣–٦ أشهر' : '3–6 months'}</dd>
                  <dt>{t('financing')}</dt>
                  <dd>
                    {selectedProj.cc === 'SA'
                      ? lang === 'ar'
                        ? 'تمويل عقاري + دعم سكني'
                        : 'Mortgage + MOH subsidy'
                      : lang === 'ar'
                      ? 'تقسيط'
                      : 'Installments'}
                  </dd>
                  <dt>{t('family')}</dt>
                  <dd>{n(7)}</dd>
                </dl>
                <details style={{ marginTop: 10 }}>
                  <summary className="muted" style={{ cursor: 'pointer', fontSize: '12.5px' }}>
                    {t('d_raw')}
                  </summary>
                  <div className="json" style={{ marginTop: 8 }}>
                    {JSON.stringify(selectedDetails, null, 2)}
                  </div>
                </details>
              </div>

              {/* Activity Log */}
              <div data-api="deal.activity_log[]">
                <div className="sec-t">{t('d_log')}</div>
                <ul className="log">
                  {STAGE_ORDER.slice(1, selectedStageIndex + 1)
                    .reverse()
                    .map((s, k) => {
                      const prevStageId = STAGE_ORDER[STAGE_ORDER.indexOf(s) - 1];
                      return (
                        <li key={s}>
                          <span className="li-ico ai">
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <div>
                              {stageMap[prevStageId] ? L(stageMap[prevStageId].name) : prevStageId} →{' '}
                              <b>{stageMap[s] ? L(stageMap[s].name) : s}</b>
                            </div>
                            <div className="li-m">
                              {t('log_deal_ai')} · reason: ai_advance ·{' '}
                              {timeAgo((k + 1) * 900 + selectedDeal.age * 1440)}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  <li>
                    <span className="li-ico">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div>
                        {t('log_deal_created').replace('{ch}', t('ch_' + selectedDeal.ch))}
                      </div>
                      <div className="li-m">
                        {timeAgo((selectedStageIndex + 2) * 1000 + selectedDeal.age * 1440)}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-f">
              {selectedDeal.chat && (
                <NavLink
                  className="btn"
                  to={`/inbox?chat=${selectedDeal.chat}`}
                  onClick={() => setSelectedDeal(null)}
                >
                  <MessagesSquare className="w-4 h-4" />
                  {t('open_chat')}
                </NavLink>
              )}
              <button
                className="btn primary"
                type="button"
                id="dSave"
                onClick={handleSaveDrawer}
              >
                {t('save')}
              </button>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};
