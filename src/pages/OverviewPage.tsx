import React, { useState, useMemo, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { ChannelBadge, Avatar } from '../components/common';
import {
  Download,
  ArrowRight,
  UserPlus,
  MessagesSquare,
  Sparkles,
  Wallet,
  Trophy,
  ChevronRight,
  Info,
  Plug,
  TriangleAlert,
  MessageSquareText,
  Box,
  PhoneCall,
  BadgeDollarSign,
  UserRound,
  TimerOff,
  Hand,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// Pseudorandom number generator with a deterministic seed to yield consistent, realistic demo chart data
const seededRandom = (seed: number) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), 2246822507) ^ Math.imul(seed ^ (seed >>> 13), 3266489909);
  return (seed >>> 0) / 4294967296;
};

/**
 * Generates paired daily conversation volume series:
 * Series A: Total inbound conversations started
 * Series B: Conversations resolved autonomously by AI
 */
function generateSeries(days: number) {
  const random = seededRandom(days * 7 + 3);
  const startedSeries: { d: Date; v: number }[] = [];
  const aiResolvedSeries: { d: Date; v: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - (days - 1 - i) * 86400000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday & Saturday in GCC
    const thursdayBonus = dayOfWeek === 4 ? 12 : 0;
    const baseVolume = 70 + i * (40 / days) + (isWeekend ? 28 : 0) + thursdayBonus;
    const startedCount = Math.round(baseVolume + random() * 22);

    startedSeries.push({ d: date, v: startedCount });
    aiResolvedSeries.push({ d: date, v: Math.round(startedCount * (0.78 + random() * 0.1)) });
  }

  return [startedSeries, aiResolvedSeries] as const;
}

export const OverviewPage: React.FC = () => {
  const { t, L, money, formatDate, hijriDate, timeAgo, lang, n, pct, toast, initials } = useApp();
  const { chats, agents, projects, stages, team } = useData();

  const [range, setRange] = useState<number>(30);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const f = range / 30;

  // Property development performance table rows from prototype
  const projectRows = useMemo(
    () => [
      { key: 'sadeel', leads: 214, visits: 38, pipelineValue: 96400000, dealsWon: 9 },
      { key: 'jawharat-al-ruba', leads: 168, visits: 27, pipelineValue: 118200000, dealsWon: 6 },
      { key: 'flamant', leads: 97, visits: 19, pipelineValue: 41800000, dealsWon: 4 },
      { key: 'stax', leads: 88, visits: 14, pipelineValue: 63500000, dealsWon: 3 },
      { key: 'nile-view', leads: 58, visits: 11, pipelineValue: 212000000, dealsWon: 1 },
    ],
    []
  );

  // Takeover list from prototype: D.chats.filter(c => !c.ai && c.status !== 'closed' && (c.priority === 'high' || c.priority === 'urgent'))
  const takeoverList = useMemo(() => {
    return chats.filter(
      (c) => !c.ai && c.status !== 'closed' && (c.priority === 'high' || c.priority === 'urgent')
    );
  }, [chats]);

  // Top-level KPI cards matching dashboard/index.html lines 327-345
  const kpis = [
    {
      ico: UserPlus,
      title: t('k_leads'),
      val: n(Math.round(625 * f)),
      d: 12.4,
      foot: t('vs_prev'),
    },
    {
      ico: MessagesSquare,
      title: t('k_active'),
      val: n(184),
      d: 8.1,
      foot: t('k_active_f'),
    },
    {
      ico: Sparkles,
      title: t('k_ai'),
      val: pct(0.87),
      d: 3.2,
      foot: t('k_ai_f'),
    },
    {
      ico: Wallet,
      title: t('k_pipe'),
      val: money(Math.round(48600000 * (0.9 + f / 10)), 'SAR'),
      d: -2.3,
      foot: t('k_pipe_f'),
    },
    {
      ico: Trophy,
      title: t('k_won'),
      val: n(Math.round(23 * f)),
      d: 15.0,
      foot: t('k_won_f'),
    },
  ];

  // Generate deterministic chart series for conversation analytics
  const [seriesA, seriesB] = useMemo(() => generateSeries(range), [range]);

  // SVG Chart Layout & Scaling
  const W = 700;
  const H = 260;
  const P = { l: 36, r: 10, t: 10, b: 26 };
  const dataMax = Math.max(...seriesA.map((point) => point.v), 10);
  const rawStep = dataMax / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep || 1));
  const stepY = ([1, 2, 5, 10].find((m) => m * magnitude >= rawStep) || 10) * magnitude;
  const maxVal = Math.ceil(dataMax / stepY) * stepY;
  const getX = (index: number) => P.l + (index * (W - P.l - P.r)) / (seriesA.length - 1);
  const getY = (value: number) => P.t + (1 - value / maxVal) * (H - P.t - P.b);
  const ticksY = Array.from({ length: Math.round(maxVal / stepY) + 1 }, (_, i) => i * stepY);
  const stepX = Math.ceil(seriesA.length / 6);

  const linePathA = seriesA.map((p, i) => `${i ? 'L' : 'M'}${getX(i).toFixed(1)},${getY(p.v).toFixed(1)}`).join('');
  const linePathB = seriesB.map((p, i) => `${i ? 'L' : 'M'}${getX(i).toFixed(1)},${getY(p.v).toFixed(1)}`).join('');
  const areaPathA = `${linePathA}L${getX(seriesA.length - 1)},${getY(0)}L${getX(0)},${getY(0)}Z`;

  // Pipeline conversion funnel counts matching dashboard/index.html lines 397-410
  const funnelRows = [
    { key: 'new', val: Math.round(412 * f) },
    { key: 'qualified', val: Math.round(238 * f) },
    { key: 'proposal', val: Math.round(121 * f) },
    { key: 'negotiation', val: Math.round(64 * f) },
    { key: 'won', val: Math.round(23 * f) },
  ];
  const funnelTop = funnelRows[0].val;
  const lostVal = Math.round(58 * f);

  // Inbound channel distribution mix matching dashboard/index.html lines 412-421
  const mixRows: [string, number][] = [
    ['whatsapp', 38],
    ['tour', 24],
    ['instagram', 14],
    ['phone', 11],
    ['telegram', 5],
    ['messenger', 4],
    ['email', 3],
    ['discord', 1],
  ];
  const totalMix = 625 * f;

  // Priority conversations requiring human attention matching dashboard/index.html lines 439-450
  const attentionList = useMemo(() => {
    return chats
      .filter((c) => !c.ai && c.status !== 'closed' && (c.priority === 'high' || c.priority === 'urgent'))
      .slice(0, 5);
  }, [chats]);

  // Timeline feed events matching dashboard/index.html lines 466-481
  const stageMap = useMemo(() => Object.fromEntries(stages.map((s) => [s.id, s])), [stages]);
  const getChatName = (id: string) => {
    const c = chats.find((ch) => ch.id === id);
    return c ? L(c.name) : '';
  };
  const teamMember2 = team[2] ? L(team[2].name) : (lang === 'ar' ? 'حسن علي' : 'Hassan Ali');
  const nileViewName = projects['nile-view'] ? L(projects['nile-view'].name) : (lang === 'ar' ? 'نايل فيو' : 'Nile View');
  const flamantName = projects['flamant'] ? L(projects['flamant'].name) : (lang === 'ar' ? 'فلامنت' : 'Flamant');

  const feedEvents = [
    {
      id: 'e1',
      icon: Sparkles,
      badgeClass: 'ai',
      title: t('ev_ai_adv')
        .replace('{agent}', 'Fahad')
        .replace('{who}', getChatName('c2')),
      meta: (
        <span className="row" style={{ gap: '6px' }}>
          <span className="stage-mv">
            {stageMap['s2'] ? L(stageMap['s2'].name) : (lang === 'ar' ? 'التأهيل' : 'Qualification')}
            <ArrowRight className="flip-rtl ico-sm inline mx-1" />
            {stageMap['s3'] ? L(stageMap['s3'].name) : (lang === 'ar' ? 'ترشيح الوحدات' : 'Unit matching')}
          </span>
          <ChannelBadge channel="instagram" size="sm" />
        </span>
      ),
      timeAgoMinutes: 4,
    },
    {
      id: 'e2',
      icon: Trophy,
      badgeClass: 'win',
      title: t('ev_won')
        .replace('{user}', teamMember2)
        .replace('{who}', getChatName('c14')),
      meta: `${money(2950000, 'EGP')} · ${nileViewName}`,
      timeAgoMinutes: 52,
    },
    {
      id: 'e3',
      icon: TimerOff,
      badgeClass: '',
      title: t('ev_takeover').replace('{who}', getChatName('c1')),
      meta: (
        <span className="badge danger">
          <Hand className="ico-sm inline" />
          <span>{t('needs_human')}</span>
        </span>
      ),
      timeAgoMinutes: 66,
    },
    {
      id: 'e4',
      icon: Sparkles,
      badgeClass: 'ai',
      title: t('ev_ai_adv')
        .replace('{agent}', 'Nour')
        .replace('{who}', getChatName('c3')),
      meta: (
        <span className="row" style={{ gap: '6px' }}>
          <span className="stage-mv">
            {stageMap['s1'] ? L(stageMap['s1'].name) : (lang === 'ar' ? 'الترحيب' : 'Greeting')}
            <ArrowRight className="flip-rtl ico-sm inline mx-1" />
            {stageMap['s2'] ? L(stageMap['s2'].name) : (lang === 'ar' ? 'التأهيل' : 'Qualification')}
          </span>
          <ChannelBadge channel="phone" size="sm" />
        </span>
      ),
      timeAgoMinutes: 88,
    },
    {
      id: 'e5',
      icon: UserPlus,
      badgeClass: 'ai',
      title: t('ev_lead')
        .replace('{agent}', 'Fahad')
        .replace('{who}', getChatName('c5')),
      meta: (
        <span className="row" style={{ gap: '6px' }}>
          <ChannelBadge channel="tour" size="sm" />
          <span>{flamantName} · B3-F5-502</span>
        </span>
      ),
      timeAgoMinutes: 121,
    },
  ];

  const now = new Date();

  return (
    <>
      {/* Hello & Date Toolbar */}
      <section className="hello">
        <div>
          <h1 id="greet">{t('greet')}</h1>
          <p className="date" id="today">
            {formatDate(now)} · {hijriDate(now)}
          </p>
        </div>
        <div className="tools">
          <div className="seg" role="group" id="rangeSeg" aria-label="Date range">
            <button
              type="button"
              data-r="7"
              aria-pressed={range === 7}
              onClick={() => setRange(7)}
            >
              {t('last7')}
            </button>
            <button
              type="button"
              data-r="30"
              aria-pressed={range === 30}
              onClick={() => setRange(30)}
            >
              {t('last30')}
            </button>
            <button
              type="button"
              data-r="90"
              aria-pressed={range === 90}
              onClick={() => setRange(90)}
            >
              {t('last90')}
            </button>
          </div>

          <select
            className="select"
            id="projSel"
            style={{ width: 'auto', minWidth: '170px' }}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            aria-label={t('all_projects')}
          >
            <option value="">{t('all_projects')}</option>
            {Object.entries(projects).map(([k, p]) => (
              <option key={k} value={k}>
                {L(p.name)} — {L(p.city)}
              </option>
            ))}
          </select>

          <button className="btn" type="button" onClick={() => toast(t('exported'))}>
            <Download className="ico-sm" />
            <span>{t('export')}</span>
          </button>
        </div>
      </section>

      {/* API Legend */}
      <div className="api-legend row wrap" style={{ fontSize: '12px' }}>
        <span className="badge info">
          <Plug className="ico-sm" />
          <span>{t('api_legend_ok')}</span>
        </span>
        <span className="badge warn">
          <TriangleAlert className="ico-sm" />
          <span>{t('api_legend_gap')}</span>
        </span>
      </div>

      {/* Takeover Banner */}
      <section
        className="card now-card"
        id="takeover"
        data-api="GET /tenants/{tid}/chats/ → priority∈{high,urgent} & !ai_enabled (client filter)"
      >
        <div className="n-txt">
          <h4>
            <span className="dotp" aria-hidden="true" />
            <span id="toTitle">{t('to_title').replace('{n}', n(takeoverList.length))}</span>
          </h4>
          <p>{t('to_body')}</p>
        </div>

        <div className="now-people" id="toAvatars">
          {takeoverList.slice(0, 4).map((c) => (
            <NavLink
              key={c.id}
              to={`/inbox?chat=${c.id}`}
              title={t('why_' + (c.takeover || 'followups'))}
            >
              <Avatar name={L(c.name)} ring="alert" online={c.online} />
              <span className="nm">{L(c.name).split(' ')[0]}</span>
              <span className="rs">{t('why_' + (c.takeover || 'followups'))}</span>
            </NavLink>
          ))}
        </div>

        <NavLink className="btn primary" to="/inbox?filter=human">
          <span>{t('to_cta')}</span>
          <ArrowRight className="flip-rtl ico-sm" />
        </NavLink>
      </section>

      {/* KPIs Grid */}
      <section
        className="kpis gap"
        id="kpis"
        data-api="NEW GET /tenants/{tid}/analytics/summary?range=30d"
      >
        {kpis.map((x, idx) => (
          <article key={idx} className="card kpi">
            <div className="k-top">
              <span className="k-ico">
                <x.ico />
              </span>
              <span>{x.title}</span>
            </div>
            <div className="k-val num">{x.val}</div>
            <div className="k-foot">
              <span className={`delta ${x.d >= 0 ? 'up' : 'down'}`}>
                {x.d >= 0 ? (
                  <TrendingUp className="ico-sm" />
                ) : (
                  <TrendingDown className="ico-sm" />
                )}
                <span>{pct(Math.abs(x.d) / 100, 1)}</span>
              </span>
              <span>{x.foot}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Grid A: Line Chart & Funnel */}
      <section className="grid-a">
        {/* Line Chart */}
        <div className="card gap" data-api="NEW GET /analytics/conversations?bucket=day">
          <div className="card-h">
            <div>
              <h3>{t('conv_title')}</h3>
              <div className="sub">{t('conv_sub')}</div>
            </div>
            <div className="spacer" />
            <div className="legend" id="lineLegend">
              <span>
                <span className="sw" style={{ background: 'var(--series-1)' }} />
                <span>{t('s_started')}</span>
              </span>
              <span>
                <span className="sw" style={{ background: 'var(--series-2)' }} />
                <span>{t('s_ai')}</span>
              </span>
            </div>
          </div>
          <div className="card-b">
            <div className="chart-box" id="lineChart" ref={containerRef}>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={t('conv_title')}
                style={{ display: 'block', width: '100%', height: '100%' }}
              >
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="var(--series-1)" stopOpacity="0.16" />
                    <stop offset="1" stopColor="var(--series-1)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid lines & Ticks */}
                {ticksY.map((tickVal) => (
                  <g key={tickVal}>
                    <line
                      x1={P.l}
                      x2={W - P.r}
                      y1={getY(tickVal)}
                      y2={getY(tickVal)}
                      stroke={tickVal ? 'var(--grid)' : 'var(--axis)'}
                      strokeWidth="1"
                    />
                    <text
                      className="tick"
                      x={P.l - 8}
                      y={getY(tickVal) + 4}
                      textAnchor="end"
                    >
                      {n(tickVal)}
                    </text>
                  </g>
                ))}

                {/* X Axis Date Ticks */}
                {seriesA.map((p, i) => {
                  if (i % stepX === 0 || i === seriesA.length - 1) {
                    return (
                      <text
                        key={i}
                        className="tick"
                        x={getX(i)}
                        y={H - 6}
                        textAnchor="middle"
                      >
                        {formatDate(p.d, { day: 'numeric', month: 'short' })}
                      </text>
                    );
                  }
                  return null;
                })}

                {/* Gradient Area Fill */}
                <path d={areaPathA} fill="url(#g1)" />

                {/* Started Line */}
                <path
                  d={linePathA}
                  fill="none"
                  stroke="var(--series-1)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Resolved by AI Line */}
                <path
                  d={linePathB}
                  fill="none"
                  stroke="var(--series-2)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Vertical Tracker & Dots on Hover */}
                {hoverIndex !== null && (
                  <>
                    <line
                      x1={getX(hoverIndex)}
                      x2={getX(hoverIndex)}
                      y1={P.t}
                      y2={getY(0)}
                      stroke="var(--axis)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={getX(hoverIndex)}
                      cy={getY(seriesA[hoverIndex].v)}
                      r="4.5"
                      fill="var(--series-1)"
                      stroke="var(--surface)"
                      strokeWidth="2"
                    />
                    <circle
                      cx={getX(hoverIndex)}
                      cy={getY(seriesB[hoverIndex].v)}
                      r="4.5"
                      fill="var(--series-2)"
                      stroke="var(--surface)"
                      strokeWidth="2"
                    />
                  </>
                )}

                {/* Transparent Hit Rect */}
                <rect
                  x={P.l}
                  y={P.t}
                  width={W - P.l - P.r}
                  height={H - P.t - P.b}
                  fill="transparent"
                  style={{ cursor: 'crosshair', touchAction: 'none' }}
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const rx = (e.clientX - rect.left) / rect.width;
                    const idx = Math.round(rx * (seriesA.length - 1));
                    setHoverIndex(Math.max(0, Math.min(seriesA.length - 1, idx)));
                  }}
                  onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const rx = (e.clientX - rect.left) / rect.width;
                    const idx = Math.round(rx * (seriesA.length - 1));
                    setHoverIndex(Math.max(0, Math.min(seriesA.length - 1, idx)));
                  }}
                  onPointerLeave={() => setHoverIndex(null)}
                />
              </svg>

              {/* Tooltip */}
              {hoverIndex !== null && (
                <div
                  className="tip show"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  style={{
                    left: `${(getX(hoverIndex) / W) * 100}%`,
                    top: '8px',
                    transform:
                      getX(hoverIndex) > W / 2
                        ? 'translateX(calc(-100% - 12px))'
                        : 'translateX(12px)',
                  }}
                >
                  <div className="t-h">
                    {formatDate(seriesA[hoverIndex].d, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="t-r">
                    <span>
                      <span className="dotc" style={{ background: 'var(--series-1)' }} />
                      <span> {t('s_started')}</span>
                    </span>
                    <b className="num">{n(seriesA[hoverIndex].v)}</b>
                  </div>
                  <div className="t-r">
                    <span>
                      <span className="dotc" style={{ background: 'var(--series-2)' }} />
                      <span> {t('s_ai')}</span>
                    </span>
                    <b className="num">{n(seriesB[hoverIndex].v)}</b>
                  </div>
                  <div className="t-r muted" style={{ marginTop: '4px' }}>
                    <span>AI %</span>
                    <b className="num">
                      {pct(seriesB[hoverIndex].v / seriesA[hoverIndex].v)}
                    </b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Funnel */}
        <div className="card" data-api="GET /tenants/{tid}/deals/ → group by deal_status">
          <div className="card-h">
            <div>
              <h3>{t('funnel_title')}</h3>
              <div className="sub">{t('funnel_sub')}</div>
            </div>
          </div>
          <div className="card-b">
            <div className="funnel" id="funnel">
              {funnelRows.map((r, i) => (
                <div key={r.key} className="f-row">
                  <span className="f-lbl">{t('ds_' + r.key)}</span>
                  <div className="f-track">
                    <div
                      className="f-bar"
                      style={{
                        width: `${(r.val / funnelTop) * 100}%`,
                        background:
                          r.key === 'won' ? 'var(--ok)' : `var(--ord-${i + 1})`,
                      }}
                    />
                  </div>
                  <span className="f-val num">
                    {n(r.val)}
                    <small>{pct(r.val / funnelTop, i ? 1 : 0)}</small>
                  </span>
                </div>
              ))}
              <div className="f-sep" />
              <div className="f-row">
                <span className="f-lbl">{t('ds_lost')}</span>
                <div className="f-track">
                  <div
                    className="f-bar"
                    style={{
                      width: `${(lostVal / funnelTop) * 100}%`,
                      background: 'var(--danger)',
                    }}
                  />
                </div>
                <span className="f-val num">
                  {n(lostVal)}
                  <small>{pct(lostVal / funnelTop, 1)}</small>
                </span>
              </div>
            </div>
            <p className="f-note">
              <Info className="ico-sm" />
              <span>{t('funnel_note')}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Grid B: Mix, Agents, Attention */}
      <section className="grid-b">
        {/* Leads by channel */}
        <div className="card" data-api="GET chats + channels.protocol (client join)">
          <div className="card-h">
            <div>
              <h3>{t('mix_title')}</h3>
              <div className="sub">{t('mix_sub')}</div>
            </div>
          </div>
          <div className="card-b">
            <div className="bars" id="mix">
              {mixRows.map(([ch, p]) => (
                <div key={ch} className="b-row">
                  <span className="b-lbl">
                    <ChannelBadge channel={ch as any} size="sm" />
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('ch_' + ch)}
                    </span>
                  </span>
                  <div className="b-track" title={n(Math.round(totalMix * p / 100))}>
                    <div
                      className="b-bar"
                      style={{ width: `${(p / 38) * 100}%` }}
                    />
                  </div>
                  <span className="b-val num">{pct(p / 100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Agent Performance */}
        <div className="card gap" data-api="NEW GET /analytics/agents (leads, handoffs)">
          <div className="card-h">
            <div>
              <h3>{t('agents_title')}</h3>
              <div className="sub">{t('agents_sub')}</div>
            </div>
            <div className="spacer" />
            <NavLink className="btn sm ghost" to="/agents">
              <span>{t('manage')}</span>
              <ChevronRight className="flip-rtl ico-sm" />
            </NavLink>
          </div>
          <div className="card-b">
            <div className="ap-list" id="agentsTbl">
              {agents.map((a) => {
                const rate = a.leads / a.convs;
                const AgentIcon =
                  a.service === 'SMAIA'
                    ? MessageSquareText
                    : a.service === 'Voomi'
                    ? Box
                    : PhoneCall;
                return (
                  <NavLink
                    key={a.id}
                    className="ap"
                    to="/agents"
                    aria-label={L(a.name)}
                  >
                    <div className="ap-head">
                      <span className="agent-av">
                        <AgentIcon />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="ap-name">{L(a.name)}</div>
                        <div className="ap-sub">
                          {a.channels.slice(0, 4).map((ch) => (
                            <ChannelBadge key={ch} channel={ch as any} size="sm" />
                          ))}
                          {a.channels.length > 4 && (
                            <span>+{n(a.channels.length - 4)}</span>
                          )}
                        </div>
                      </div>
                      <span className="live">{t('live')}</span>
                    </div>
                    <dl className="ap-stats">
                      <div>
                        <dt>{t('th_convs')}</dt>
                        <dd className="num">
                          {n(Math.round((a.convs * range) / 30))}
                        </dd>
                      </div>
                      <div>
                        <dt>{t('th_lead')}</dt>
                        <dd>
                          <span className="num">{pct(rate)}</span>
                          <span className="m-track" aria-hidden="true">
                            <span
                              className="m-fill"
                              style={{ width: `${Math.min(100, rate * 100)}%` }}
                            />
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt>{t('th_hand')}</dt>
                        <dd className="num">
                          {n(Math.round((a.handoffs * range) / 30))}
                        </dd>
                      </div>
                    </dl>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>

        {/* Needs attention */}
        <div className="card" data-api="GET /chats/ → priority∈{high,urgent} (client filter)">
          <div className="card-h">
            <div>
              <h3>{t('att_title')}</h3>
              <div className="sub">{t('att_sub')}</div>
            </div>
            <div className="spacer" />
            <NavLink className="btn sm ghost" to="/inbox?filter=human">
              {t('view_all')}
            </NavLink>
          </div>
          <div className="att-list" id="attList">
            {attentionList.map((c) => {
              const WhyIcon =
                c.takeover === 'handover'
                  ? BadgeDollarSign
                  : c.takeover === 'question'
                  ? UserRound
                  : TimerOff;
              return (
                <NavLink key={c.id} className="att" to={`/inbox?chat=${c.id}`}>
                  <span className="avatar sm">{initials(L(c.name))}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="row" style={{ gap: '6px' }}>
                      <span style={{ fontWeight: 500 }}>{L(c.name)}</span>
                      <ChannelBadge channel={c.ch} size="sm" />
                    </div>
                    <div className="why">
                      <WhyIcon className="ico-sm" />
                      <span>{t('why_' + (c.takeover || 'followups'))}</span>
                    </div>
                  </div>
                  <span className="when">{timeAgo(c.mins)}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid C: Projects Table & Stage Movements Feed */}
      <section className="grid-c">
        {/* Projects table */}
        <div className="card gap proj-card" data-api="deal.details.project (convention) + NEW analytics">
          <div className="card-h">
            <div>
              <h3>{t('proj_title')}</h3>
              <div className="sub">{t('proj_sub')}</div>
            </div>
          </div>
          <div className="card-b flush table-wrap">
            <table className="table" id="projTbl">
              <thead>
                <tr>
                  <th>{t('th_proj')}</th>
                  <th className="end">{t('th_leads')}</th>
                  <th className="end c-visits">{t('th_visits')}</th>
                  <th className="end">{t('th_pipe')}</th>
                  <th className="end c-won">{t('th_won')}</th>
                </tr>
              </thead>
              <tbody>
                {projectRows.map((row) => {
                  const project = projects[row.key];
                  if (!project) return null;
                  return (
                    <tr key={row.key}>
                      <td>
                        <div className="who">
                          <div style={{ minWidth: 0 }}>
                            <div className="name">
                              <span>{L(project.name)}</span>
                              <span className="flag">{project.cc}</span>
                            </div>
                            <div className="meta">
                              {L(project.city)} · {L(project.kind)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="end num">{n(Math.round(row.leads * f))}</td>
                      <td className="end num c-visits">
                        {n(Math.round(row.visits * f))}
                      </td>
                      <td className="end num">{money(row.pipelineValue, project.cur)}</td>
                      <td className="end num c-won">{n(Math.round(row.dealsWon * f))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stage movements feed */}
        <div className="card gap" data-api="deal.activity_log · NEW tenant-wide feed">
          <div className="card-h">
            <div>
              <h3>{t('feed_title')}</h3>
              <div className="sub">{t('feed_sub')}</div>
            </div>
          </div>
          <div className="feed" id="feed">
            {feedEvents.map((event) => {
              const EventIcon = event.icon;
              return (
                <div key={event.id} className="ev">
                  <span className={`e-ico ${event.badgeClass}`}>
                    <EventIcon />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      className="e-t"
                      dangerouslySetInnerHTML={{ __html: event.title }}
                    />
                    <div className="e-m">{event.meta}</div>
                  </div>
                  <span className="e-w">{timeAgo(event.timeAgoMinutes)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
