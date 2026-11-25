import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { ChannelBadge } from '../components/common/ChannelBadge';
import { Stage, Agent, Channel } from '../types';
import {
  MessageSquareText,
  Box,
  PhoneCall,
  CircleCheck,
  Cpu,
  Languages,
  Building2,
  Pause,
  Save,
  Route,
  UserRoundCog,
  RadioTower,
  BookOpenText,
  Plug,
  ArrowRight,
  Plus,
  Minus,
  AlarmClock,
  Zap,
  GitBranch,
  CornerDownRight,
  MessageCircleQuestion,
  ChevronDown,
  ChevronRight,
  Hand,
  KeyRound,
  Copy,
  RefreshCw,
  FlaskConical,
  X,
  Send,
} from 'lucide-react';

type AgentTab = 'pipeline' | 'persona' | 'channels' | 'knowledge' | 'settings';

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SMAIA: MessageSquareText,
  Voomi: Box,
  Calling: PhoneCall,
};

const STAGE_RULES: Record<string, [string, string, number][]> = {
  s1: [['s2', '{"intent":"buy|invest"}', 0]],
  s2: [
    ['s3', '{"has":["budget","timeline"]}', 0],
    ['s5', '{"asks_human":true}', 10],
  ],
  s3: [
    ['s4', '{"wants_visit":true}', 0],
    ['s5', '{"ready_to_reserve":true}', 10],
  ],
  s4: [['s5', '{"visit_booked":true}', 0]],
  s5: [],
};

const STAGE_ACTIONS: Record<string, [string, string][]> = {
  s1: [],
  s2: [['POST', 'https://crm.alruba.sa/api/leads']],
  s3: [
    ['GET', 'https://realestate-api.voom.cc/api/v1/companies/{project}/units'],
    ['POST', 'https://api.alruba.sa/brochures/send'],
  ],
  s4: [['POST', 'https://calendar.alruba.sa/api/visits']],
  s5: [['POST', 'https://crm.alruba.sa/api/handover']],
};

const STAGE_QA = [
  {
    q: {
      en: 'Is the price inclusive of VAT and registration?',
      ar: 'هل السعر شامل الضريبة ورسوم التسجيل؟',
    },
    a: {
      en: 'Prices exclude 5% real-estate transaction tax; the first-home buyer exemption applies up to SAR 1M.',
      ar: 'الأسعار لا تشمل ضريبة التصرفات العقارية ٥٪، ويُعفى المسكن الأول حتى مليون ريال.',
    },
  },
  {
    q: {
      en: 'Do you accept MOH (Sakani) subsidy?',
      ar: 'هل تقبلون دعم سكني؟',
    },
    a: {
      en: 'Yes — Sadeel villas are listed on Sakani; models 1–4 qualify for the MOH price.',
      ar: 'نعم — فلل سديل مدرجة في سكني، والنماذج ١–٤ مؤهلة لسعر الدعم.',
    },
  },
  {
    q: {
      en: 'What is the handover date?',
      ar: 'متى موعد التسليم؟',
    },
    a: {
      en: 'Phase 1 hands over Q2 2027; phase 2 in Q1 2028.',
      ar: 'تسليم المرحلة الأولى الربع الثاني ٢٠٢٧، والثانية الربع الأول ٢٠٢٨.',
    },
  },
];

const CHANNEL_METAS: Record<string, string> = {
  whatsapp: '+966 11 520 8800',
  instagram: '@alruba.developments',
  telegram: '@AlRubaSalesBot',
  messenger: 'Al Ruba Developments',
  email: 'sales@alruba.sa',
  discord: 'Al Ruba Community',
  tour: 'tours.alruba.sa/sadeel',
  phone: '+20 2 2461 0090',
};

const DEALS_PER_STAGE: Record<string, number> = {
  s1: 3,
  s2: 4,
  s3: 7,
  s4: 4,
  s5: 2,
};

export const AgentsPage: React.FC = () => {
  const { t, L, toast, lang, n, pct } = useApp();
  const { agents, stages, projects, updateStage } = useData();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'ag1');
  const [activeTab, setActiveTab] = useState<AgentTab>('pipeline');
  const [selectedStageId, setSelectedStageId] = useState<string>('s3');

  // Active agent and project
  const activeAgent = useMemo(() => {
    return agents.find((a: Agent) => a.id === selectedAgentId) || agents[0];
  }, [agents, selectedAgentId]);

  const activeProject = useMemo(() => {
    return (projects as any)[activeAgent.project] || projects.sadeel;
  }, [projects, activeAgent]);

  // Current stage in flow
  const currentStage = useMemo(() => {
    return stages.find((s: Stage) => s.id === selectedStageId) || stages[0];
  }, [stages, selectedStageId]);

  // Stage editor state
  const [stageName, setStageName] = useState<string>(
    typeof currentStage.name === 'string'
      ? currentStage.name
      : (currentStage.name as any)[lang] || currentStage.name.en
  );
  const [stageDesc, setStageDesc] = useState<string>(
    typeof currentStage.desc === 'string'
      ? currentStage.desc
      : (currentStage.desc as any)[lang] || currentStage.desc.en
  );
  const [stageInstruction, setStageInstruction] = useState<string>(
    typeof currentStage.instruction === 'string'
      ? currentStage.instruction
      : (currentStage.instruction as any)[lang] || currentStage.instruction.en
  );
  const [stageNotes, setStageNotes] = useState<string>('');
  const [fuInterval, setFuInterval] = useState<number>(currentStage.fu?.interval || 4);
  const [fuMax, setFuMax] = useState<number>(currentStage.fu?.max || 3);
  const [fuPrompt, setFuPrompt] = useState<string>(
    typeof currentStage.fu?.prompt === 'string'
      ? currentStage.fu.prompt
      : (currentStage.fu?.prompt as any)?.[lang] || currentStage.fu?.prompt?.en || ''
  );

  // Persona State
  const [selectedPersona, setSelectedPersona] = useState<string>(activeAgent.persona || 'fahd');
  const [selectedModel, setSelectedModel] = useState<string>(activeAgent.model);
  const [selectedProvider, setSelectedProvider] = useState<string>(activeAgent.provider || 'google');
  const [selectedLang, setSelectedLang] = useState<string>(activeAgent.language);

  // System Prompt State
  const defaultPrompt = `{% extends "base.jinja2" %}
{% block persona %}
أنت {{ persona.name_ar }}، مستشار مبيعات في {{ tenant.name }}.
تتحدث باللهجة السعودية باحترام، وتتحول للإنجليزية فقط إذا كتب العميل بها.
{% endblock %}

{% block rules %}
- Never state a price or availability before calling get_project_units.
- Offer a 3D tour link with every unit you recommend.
- Avoid scheduling visits during Friday prayer (11:30–13:30).
- Currency: {{ project.currency }} · City: {{ project.city }}
{% endblock %}`;

  const [systemPrompt, setSystemPrompt] = useState<string>(defaultPrompt);

  // Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simMessages, setSimMessages] = useState<
    Array<{ sender: 'user' | 'agent'; text: string; time: string }>
  >([
    {
      sender: 'agent',
      text:
        lang === 'ar'
          ? 'أهلاً بك! معك فهد من الربى للتطوير العقاري. كيف يمكنني خدمتك اليوم بخصوص مشروع سديل؟'
          : 'Welcome! I am Fahad from Al Ruba Developments. How can I assist you with the Sadeel project today?',
      time: 'Just now',
    },
  ]);
  const [simInput, setSimInput] = useState<string>('');

  // Switch Stage
  const handleSelectStage = (stg: Stage) => {
    setSelectedStageId(stg.id);
    setStageName(typeof stg.name === 'string' ? stg.name : (stg.name as any)[lang] || stg.name.en);
    setStageDesc(typeof stg.desc === 'string' ? stg.desc : (stg.desc as any)[lang] || stg.desc.en);
    setStageInstruction(
      typeof stg.instruction === 'string'
        ? stg.instruction
        : (stg.instruction as any)[lang] || stg.instruction.en
    );
    setFuInterval(stg.fu?.interval || 4);
    setFuMax(stg.fu?.max || 3);
    setFuPrompt(
      typeof stg.fu?.prompt === 'string'
        ? stg.fu.prompt
        : (stg.fu?.prompt as any)?.[lang] || stg.fu?.prompt?.en || ''
    );
  };

  const handleSaveStage = () => {
    updateStage(currentStage.id, {
      instruction: { en: stageInstruction, ar: stageInstruction },
      fu: {
        interval: fuInterval,
        max: fuMax,
        prompt: { en: fuPrompt, ar: fuPrompt },
      },
    });
    toast(t('saved'));
  };

  const handleSendSimulator = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simInput.trim()) return;

    const userText = simInput.trim();
    setSimMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Just now' },
    ]);
    setSimInput('');

    setTimeout(() => {
      let reply = '';
      if (userText.includes('سعر') || userText.includes('price')) {
        reply =
          lang === 'ar'
            ? 'أسعار فلل سديل تبدأ من ٢،٤٥٠،٠٠٠ ر.س للنماذج المستقلة. هل ترغب بالاطلاع على المخطط ثلاثي الأبعاد للفيلا؟'
            : 'Sadeel standalone villas start from SAR 2,450,000. Would you like to view the 3D floor plan?';
      } else if (userText.includes('زيارة') || userText.includes('visit')) {
        reply =
          lang === 'ar'
            ? 'يسعدنا استقبالكم في مركز المبيعات بمشروع سديل. هل يناسبكم غداً في تمام الساعة الخامسة مساءً؟'
            : 'We would love to welcome you at the Sadeel sales center. Does tomorrow at 5:00 PM suit you?';
      } else {
        reply =
          lang === 'ar'
            ? 'أهلاً بك! نوفر خيارات دفع ميسرة تشمل دفعة أولى ١٠٪ وأقساط حتى موعد التسليم في الربع الثاني ٢٠٢٧. هل تحب مشاركة بروشور المشروع معك؟'
            : 'Welcome! We offer flexible payment plans starting with a 10% down payment until delivery in Q2 2027. Would you like me to send you the project brochure?';
      }

      setSimMessages((prev) => [
        ...prev,
        { sender: 'agent', text: reply, time: 'Just now' },
      ]);
    }, 800);
  };

  const ServiceIcon = SERVICE_ICONS[activeAgent.service] || MessageSquareText;

  // Rules, Actions, QA for current stage
  const rules = STAGE_RULES[currentStage.id] || [];
  const actions = STAGE_ACTIONS[currentStage.id] || [];

  return (
    <>
      <div className="studio-grid">
        {/* Left Agent List Navigation */}
        <nav
          className="ag-list"
          id="agList"
          aria-label="Agents"
          data-api="GET /tenants/{tid}/agents/"
        >
          <div className="l-h">
            <h2>{t('agents_h')}</h2>
            <button
              className="btn sm"
              type="button"
              onClick={() => toast(t('new_agent'))}
            >
              <Plus className="ico-sm w-3.5 h-3.5" />
              <span>{t('new_agent')}</span>
            </button>
          </div>

          {agents.map((ag: Agent) => {
            const isSelected = ag.id === selectedAgentId;
            const AgIcon = SERVICE_ICONS[ag.service] || MessageSquareText;
            return (
              <button
                key={ag.id}
                className="ag"
                type="button"
                data-id={ag.id}
                aria-current={isSelected}
                onClick={() => {
                  setSelectedAgentId(ag.id);
                  setSelectedPersona(ag.persona || 'fahd');
                  setSelectedModel(ag.model);
                  setSelectedProvider(ag.provider || 'google');
                  setSelectedLang(ag.language);
                }}
              >
                <div className="a-top">
                  <span className={`ag-av ${ag.service}`}>
                    <AgIcon className="w-5 h-5" />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="a-name">{L(ag.name)}</div>
                    <div className="a-svc">{t('svc_' + ag.service)}</div>
                  </div>
                </div>
                <div className="a-foot">
                  {ag.channels.slice(0, 5).map((ch: Channel) => (
                    <ChannelBadge key={ch} channel={ch} size="sm" />
                  ))}
                  {ag.channels.length > 5 && (
                    <span className="muted" style={{ fontSize: '12px' }}>
                      +{ag.channels.length - 5}
                    </span>
                  )}
                  <span className="live-dot">{t('live')}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Right Content Stack */}
        <div className="stack" style={{ gap: 'var(--s4)', minWidth: 0 }}>
          {/* Agent Header Card */}
          <section className="card" id="agHead">
            <div className="ag-head">
              <span className={`ag-av lg ${activeAgent.service}`}>
                <ServiceIcon className="w-7 h-7" />
              </span>
              <div style={{ minWidth: 0 }}>
                <h1>{L(activeAgent.name)}</h1>
                <div className="meta">
                  <span className="badge ok">
                    <CircleCheck className="w-3.5 h-3.5" />
                    <span>{t('live')}</span>
                  </span>
                  <span className="badge outline">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="ltr">
                      {activeAgent.provider} · {activeAgent.model}
                    </span>
                  </span>
                  <span className="badge outline">
                    <Languages className="w-3.5 h-3.5" />
                    <span>
                      {t(activeAgent.language === 'ar-EG' ? 'lang_ar_eg' : 'lang_ar_sa')} +{' '}
                      {t('lang_en')}
                    </span>
                  </span>
                  <span className="badge brand">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>
                      {activeProject ? L(activeProject.name) : activeAgent.project} ·{' '}
                      {activeProject ? L(activeProject.city) : ''}
                    </span>
                  </span>
                </div>
              </div>
              <div className="acts" data-api="PATCH /agents/{id}">
                <button
                  className="btn"
                  type="button"
                  onClick={() => toast(t('paused'))}
                >
                  <Pause className="w-4 h-4" />
                  <span>{t('pause')}</span>
                </button>
                <button
                  className="btn primary"
                  type="button"
                  id="saveTop"
                  onClick={() => toast(t('saved'))}
                >
                  <Save className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </div>

            {/* Dynamic 4 KPI Stats */}
            <div className="ag-stats gap" data-api="NEW GET /analytics/agents/{id}">
              <div>
                <div className="l">{t('st_convs')}</div>
                <div className="v num">{n(activeAgent.convs)}</div>
              </div>
              <div>
                <div className="l">{t('st_leads')}</div>
                <div className="v num">{n(activeAgent.leads)}</div>
              </div>
              <div>
                <div className="l">{t('st_rate')}</div>
                <div className="v num">
                  {pct(activeAgent.leads / (activeAgent.convs || 1))}
                </div>
              </div>
              <div>
                <div className="l">{t('st_hand')}</div>
                <div className="v num">{n(activeAgent.handoffs)}</div>
              </div>
            </div>

            {/* 5 Tab Navigation Bar */}
            <div className="tabbar" role="tablist">
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === 'pipeline'}
                onClick={() => setActiveTab('pipeline')}
              >
                <Route className="ico-sm w-4 h-4" />
                <span>{t('tab_pipeline')}</span>
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === 'persona'}
                onClick={() => setActiveTab('persona')}
              >
                <UserRoundCog className="ico-sm w-4 h-4" />
                <span>{t('tab_persona')}</span>
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === 'channels'}
                onClick={() => setActiveTab('channels')}
              >
                <RadioTower className="ico-sm w-4 h-4" />
                <span>{t('tab_channels')}</span>
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === 'knowledge'}
                onClick={() => setActiveTab('knowledge')}
              >
                <BookOpenText className="ico-sm w-4 h-4" />
                <span>{t('tab_knowledge')}</span>
              </button>
              <button
                role="tab"
                type="button"
                aria-selected={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              >
                <Plug className="ico-sm w-4 h-4" />
                <span>{t('tab_settings')}</span>
              </button>
            </div>
          </section>

          {/* TAB 1: PIPELINE STAGES */}
          {activeTab === 'pipeline' && (
            <section id="tabBody" className="stack" style={{ gap: 'var(--s4)' }}>
              {/* Flowchart */}
              <div
                className="card"
                data-api="GET /stages/ (filter agent_id) · POST /stages/"
              >
                <div className="card-h">
                  <div>
                    <h3>{t('flow_h')}</h3>
                    <div className="sub">{t('flow_s')}</div>
                  </div>
                </div>
                <div className="card-b">
                  <div className="flow-wrap">
                    <div className="flow">
                      {stages.map((s, i) => (
                        <React.Fragment key={s.id}>
                          {i > 0 && (
                            <span className="arrow">
                              <ArrowRight className="flip-rtl w-4 h-4" />
                            </span>
                          )}
                          <button
                            className="stg"
                            type="button"
                            data-stage={s.id}
                            aria-pressed={s.id === selectedStageId}
                            onClick={() => handleSelectStage(s)}
                          >
                            <span className="deals-n num">
                              {t('deals_in').replace('{n}', n(DEALS_PER_STAGE[s.id] || 0))}
                            </span>
                            <span className="n">{n(i + 1)}</span>
                            <span className="t">{L(s.name)}</span>
                            <span className="d">{L(s.desc)}</span>
                            <span className="counts">
                              <span>
                                <BookOpenText className="ico-sm w-3 h-3" />
                                {n(s.knowledge)}
                              </span>
                              <span>
                                <Zap className="ico-sm w-3 h-3" />
                                {n(s.actions)}
                              </span>
                              <span>
                                <GitBranch className="ico-sm w-3 h-3" />
                                {n(s.rules)}
                              </span>
                            </span>
                            <span className={`fu ${s.fu?.max ? '' : 'none'}`}>
                              <AlarmClock className="ico-sm w-3 h-3" />
                              {s.fu?.max
                                ? t('fu_s')
                                    .replace('{h}', n(s.fu.interval))
                                    .replace('{m}', n(s.fu.max))
                                : t('no_fu')}
                            </span>
                          </button>
                        </React.Fragment>
                      ))}
                      <button
                        className="add-stg"
                        type="button"
                        onClick={() => toast(t('add_stage'))}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('add_stage')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Settings Editor */}
              <div className="editor">
                {/* Left Card: Form & Followups */}
                <div
                  className="card"
                  data-api="PATCH /stages/{id} {name, description, instruction, notes}"
                >
                  <div className="card-h">
                    <h3>
                      {t('stage_h')} · {L(currentStage.name)}
                    </h3>
                  </div>
                  <div className="card-b">
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="fName">{t('f_name')}</label>
                        <input
                          className="input"
                          id="fName"
                          dir="auto"
                          value={stageName}
                          onChange={(e) => setStageName(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="fDesc">{t('f_desc')}</label>
                        <input
                          className="input"
                          id="fDesc"
                          dir="auto"
                          value={stageDesc}
                          onChange={(e) => setStageDesc(e.target.value)}
                        />
                      </div>
                      <div className="field full">
                        <label htmlFor="fInstr">{t('f_instr')}</label>
                        <textarea
                          className="textarea"
                          id="fInstr"
                          dir="auto"
                          rows={4}
                          value={stageInstruction}
                          onChange={(e) => setStageInstruction(e.target.value)}
                        />
                        <span className="help">{t('f_instr_help')}</span>
                      </div>
                      <div className="field full">
                        <label htmlFor="fNotes">{t('f_notes')}</label>
                        <input
                          className="input"
                          id="fNotes"
                          dir="auto"
                          value={stageNotes}
                          onChange={(e) => setStageNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card-b" style={{ paddingTop: 0 }}>
                    <div
                      className="fu-card"
                      data-api="stage.follow_up_interval (hours) · follow_up_max_attempts · follow_up_prompt"
                    >
                      <h4>
                        <AlarmClock className="w-4 h-4" />
                        <span>{t('fu_h')}</span>
                      </h4>
                      <div
                        className="row wrap"
                        style={{ gap: 'var(--s4)', alignItems: 'flex-end' }}
                      >
                        <div className="field">
                          <label htmlFor="fuI">{t('fu_every')}</label>
                          <div className="input-group" style={{ width: 160 }}>
                            <input
                              className="input num"
                              id="fuI"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={fuInterval}
                              onChange={(e) => setFuInterval(Number(e.target.value) || 0)}
                            />
                            <span className="addon">{t('hours')}</span>
                          </div>
                        </div>
                        <div className="field">
                          <label>{t('fu_max')}</label>
                          <div className="stepper">
                            <button
                              type="button"
                              aria-label="-"
                              onClick={() => setFuMax((prev) => Math.max(0, prev - 1))}
                            >
                              <Minus className="ico-sm w-3.5 h-3.5" />
                            </button>
                            <output id="fuM" className="num">
                              {n(fuMax)}
                            </output>
                            <button
                              type="button"
                              aria-label="+"
                              onClick={() => setFuMax((prev) => Math.min(10, prev + 1))}
                            >
                              <Plus className="ico-sm w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="fuP">{t('fu_prompt')}</label>
                        <textarea
                          className="textarea"
                          id="fuP"
                          dir="auto"
                          rows={2}
                          style={{ minHeight: 64 }}
                          value={fuPrompt}
                          onChange={(e) => setFuPrompt(e.target.value)}
                        />
                      </div>
                      <div className="fu-timeline">
                        {Array.from({ length: fuMax }).map((_, idx) => (
                          <React.Fragment key={idx}>
                            <span className="pt">
                              <AlarmClock className="ico-sm w-3.5 h-3.5" />
                              {t('fu_n').replace('{n}', n(idx + 1))} · +
                              {n(fuInterval * (idx + 1))}h
                            </span>
                            <ChevronRight className="flip-rtl ico-sm w-3.5 h-3.5" />
                          </React.Fragment>
                        ))}
                        <span className="pt end">
                          <Hand className="ico-sm w-3.5 h-3.5" />
                          {t('fu_then')}
                        </span>
                      </div>
                      <span
                        className="help"
                        style={{ fontSize: 12, color: 'var(--text-2)' }}
                      >
                        {t('fu_help')}
                      </span>
                    </div>

                    <div style={{ marginTop: 'var(--s3)' }}>
                      <button
                        className="btn primary gap"
                        type="button"
                        onClick={handleSaveStage}
                      >
                        <Save className="ico-sm w-4 h-4" />
                        <span>{t('save')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Stack: Rules, Actions, Knowledge */}
                <div className="stack" style={{ gap: 'var(--s4)' }}>
                  {/* Transition Rules */}
                  <div
                    className="card sub-card gap"
                    data-api="/transition_rules · stored only — NOT evaluated by backend"
                  >
                    <div className="card-h">
                      <h3>
                        <GitBranch className="ico-sm w-4 h-4" />
                        {t('rules_h')}
                      </h3>
                      <span className="sub">{t('rules_s')}</span>
                      <div className="spacer" />
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast(t('add_rule'))}
                      >
                        <Plus className="ico-sm w-3.5 h-3.5" />
                        {t('add_rule')}
                      </button>
                    </div>
                    {rules.length > 0 ? (
                      rules.map(([to, c, pr], idx) => {
                        const targetStage = stages.find((s) => s.id === to);
                        return (
                          <div key={idx} className="li-row">
                            <CornerDownRight className="flip-rtl ico-sm muted w-3.5 h-3.5" />
                            <span>
                              {t('to')}{' '}
                              <b>{targetStage ? L(targetStage.name) : to}</b>
                            </span>
                            <span className="cond">{c}</span>
                            <span className="prio">
                              {t('prio').replace('{n}', n(pr))}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="li-row muted">—</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="card sub-card gap"
                    data-api="/actions · forwarded to AI, NOT executed by backend"
                  >
                    <div className="card-h">
                      <h3>
                        <Zap className="ico-sm w-4 h-4" />
                        {t('actions_h')}
                      </h3>
                      <span className="sub">{t('actions_s')}</span>
                      <div className="spacer" />
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast(t('add_action'))}
                      >
                        <Plus className="ico-sm w-3.5 h-3.5" />
                        {t('add_action')}
                      </button>
                    </div>
                    {actions.length > 0 ? (
                      actions.map(([m, u], idx) => (
                        <div key={idx} className="li-row">
                          <span className={`method ${m}`}>{m}</span>
                          <span className="url" title={u}>
                            {u}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="li-row muted">—</div>
                    )}
                  </div>

                  {/* Knowledge */}
                  <div
                    className="card sub-card"
                    data-api="/knowledge {stage_id, question, answer}"
                  >
                    <div className="card-h">
                      <h3>
                        <BookOpenText className="ico-sm w-4 h-4" />
                        {t('know_h')}
                      </h3>
                      <span className="sub">{n(currentStage.knowledge)}</span>
                      <div className="spacer" />
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast(t('add_qa'))}
                      >
                        <Plus className="ico-sm w-3.5 h-3.5" />
                        {t('add_qa')}
                      </button>
                    </div>
                    {STAGE_QA.map((item, i) => (
                      <details key={i} className="qa" open={i === 0}>
                        <summary>
                          <MessageCircleQuestion
                            className="ico-sm w-4 h-4"
                            style={{ color: 'var(--brand-ink)' }}
                          />
                          <span dir="auto">{L(item.q)}</span>
                          <ChevronDown className="chev ico-sm w-4 h-4" />
                        </summary>
                        <p dir="auto">{L(item.a)}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: PERSONA & PROMPT */}
          {activeTab === 'persona' && (
            <section id="tabBody" className="stack" style={{ gap: 'var(--s4)' }}>
              {/* Persona Options & Settings */}
              <div
                className="card"
                data-api="PATCH /agents/{id} {provider, model, language, settings.persona}"
              >
                <div className="card-h">
                  <h3>{t('p_identity')}</h3>
                </div>
                <div className="card-b stack" style={{ gap: 'var(--s4)' }}>
                  <div className="field">
                    <label>{t('p_persona')}</label>
                    <div className="opt-grid">
                      {(['fahd', 'shahad', 'nour'] as const).map((p) => (
                        <label key={p} className="opt">
                          <input
                            type="radio"
                            name="persona"
                            checked={selectedPersona === p}
                            onChange={() => setSelectedPersona(p)}
                          />
                          <span>
                            <span className="o-t">{t('persona_' + p)}</span>
                            <br />
                            <span className="o-s">{t('persona_' + p + '_s')}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="pProv">{t('p_provider')}</label>
                      <select
                        className="select"
                        id="pProv"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                      >
                        {['google', 'openai', 'anthropic', 'custom'].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="pModel">{t('p_model')}</label>
                      <input
                        className="input ltr"
                        id="pModel"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="pLang">{t('p_lang')}</label>
                      <select
                        className="select"
                        id="pLang"
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                      >
                        <option value="ar-SA">{t('lang_ar_sa')}</option>
                        <option value="ar-EG">{t('lang_ar_eg')}</option>
                        <option value="en">{t('lang_en')}</option>
                        <option value="auto">{t('lang_auto')}</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="pVoice">{t('p_voice')}</label>
                      <select className="select" id="pVoice">
                        <option>Aoede (female)</option>
                        <option>Charon (male)</option>
                        <option>Kore (female)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div className="card" data-api="agent.system_prompt">
                <div className="card-h">
                  <div>
                    <h3>{t('p_prompt')}</h3>
                    <div className="sub">{t('p_prompt_help')}</div>
                  </div>
                </div>
                <div className="card-b">
                  <textarea
                    className="textarea prompt-box"
                    dir="auto"
                    spellCheck={false}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: CHANNELS */}
          {activeTab === 'channels' && (
            <section id="tabBody" className="stack" style={{ gap: 'var(--s4)' }}>
              <div
                className="card"
                data-api="GET/PATCH /channels/ {status, entry_stage_id*, protocol_config} · *entry stage unused by backend"
              >
                <div className="card-h">
                  <div>
                    <h3>{t('ch_h')}</h3>
                    <div className="sub">{t('ch_s')}</div>
                  </div>
                  <div className="spacer" />
                  <button
                    className="btn sm"
                    type="button"
                    onClick={() => toast(t('connect'))}
                  >
                    <Plus className="ico-sm w-3.5 h-3.5" />
                    <span>{t('connect')}</span>
                  </button>
                </div>

                {activeAgent.channels.map((c: Channel, i: number) => (
                  <div key={c} className="ch-row">
                    <div className="who">
                      <ChannelBadge channel={c} size="lg" />
                      <div style={{ minWidth: 0 }}>
                        <div className="name">{t('ch_' + c)}</div>
                        <div className="meta ltr">{CHANNEL_METAS[c] || c}</div>
                      </div>
                    </div>
                    <div className="field hide-sm2">
                      <label className="sr-only">{t('entry')}</label>
                      <select className="select" aria-label={t('entry')}>
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>
                            {t('entry')}: {L(s.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="secret hide-sm2">
                      <KeyRound className="ico-sm w-4 h-4" />
                      <span>EAAG••••••••{7231 + i * 97}</span>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast(t('copied'))}
                      >
                        {t('reveal')}
                      </button>
                    </div>
                    <label
                      className="switch"
                      title={i === 1 ? t('down') : t('active')}
                    >
                      <input type="checkbox" defaultChecked={c !== 'discord'} />
                      <span className="track" />
                      <span className="sr-only">{t('active')}</span>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 4: KNOWLEDGE */}
          {activeTab === 'knowledge' && (
            <section id="tabBody" className="stack" style={{ gap: 'var(--s4)' }}>
              <div className="card">
                <div className="card-h">
                  <h3>{t('know_h')}</h3>
                  <div className="spacer" />
                  <button
                    className="btn sm primary"
                    type="button"
                    onClick={() => toast(t('add_qa'))}
                  >
                    <Plus className="ico-sm w-3.5 h-3.5" />
                    <span>{t('add_qa')}</span>
                  </button>
                </div>
                <div className="card-b flush table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t('tab_pipeline')}</th>
                        <th className="end">{t('kn')}</th>
                        <th className="end">{t('ac')}</th>
                        <th className="end">{t('ru')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stages.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <b>{L(s.name)}</b>
                            <div className="muted" style={{ fontSize: '12px' }}>
                              {L(s.desc)}
                            </div>
                          </td>
                          <td className="end num">{n(s.knowledge)}</td>
                          <td className="end num">{n(s.actions)}</td>
                          <td className="end num">{n(s.rules)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: INTEGRATION */}
          {activeTab === 'settings' && (
            <section id="tabBody" className="stack" style={{ gap: 'var(--s4)' }}>
              <div className="card">
                <div className="card-h">
                  <h3>{t('tab_settings')}</h3>
                </div>
                <div
                  className="card-b stack"
                  style={{ gap: 'var(--s5)', maxWidth: 760 }}
                >
                  <div className="field" data-api="agent.settings.external_endpoint">
                    <label htmlFor="ep">{t('int_endpoint')}</label>
                    <input
                      className="input ltr"
                      id="ep"
                      defaultValue="https://smaia.voom.cc/api/v1/agent"
                    />
                    <span className="help">{t('int_endpoint_help')}</span>
                  </div>

                  <div
                    className="field"
                    data-api="POST /webhooks/{tenant_int}/{channel_int}?api_key="
                  >
                    <label>{t('int_webhook')}</label>
                    <div className="copy-field">
                      <code>https://api.voom.cc/webhooks/12/48?api_key=••••••••</code>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast(t('copied'))}
                      >
                        <Copy className="ico-sm w-3.5 h-3.5" />
                        <span>{t('copy')}</span>
                      </button>
                    </div>
                    <span className="help">{t('int_webhook_help')}</span>
                  </div>

                  <div
                    className="field gap"
                    data-api="tenant.settings.webhook_api_key · NEW rotate endpoint"
                  >
                    <label>{t('int_key')}</label>
                    <div className="copy-field">
                      <code>whk_live_••••••••••••••••3f9a</code>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast(t('copied'))}
                      >
                        {t('reveal')}
                      </button>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => toast('Key rotated')}
                      >
                        <RefreshCw className="ico-sm w-3.5 h-3.5" />
                        <span>{t('rotate')}</span>
                      </button>
                    </div>
                    <span className="help">{t('int_key_help')}</span>
                  </div>

                  <div className="field" data-api="SMAIA GET /api/v1/channels/health">
                    <label>{t('int_health')}</label>
                    <div className="row wrap">
                      {activeAgent.channels.map((c: Channel, i: number) => {
                        const isDegraded = i === 1 && activeAgent.service === 'SMAIA';
                        return (
                          <span
                            key={c}
                            className={`badge ${isDegraded ? 'danger' : 'ok'}`}
                          >
                            <ChannelBadge channel={c} size="sm" />
                            <span>
                              {t('ch_' + c)} · {isDegraded ? t('down') : t('ok')}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Floating Simulator FAB Button */}
      <button
        className="btn primary test-fab"
        type="button"
        id="testBtn"
        onClick={() => setIsSimulatorOpen(true)}
      >
        <FlaskConical className="w-4 h-4" />
        <span>{t('test_agent')}</span>
      </button>

      {/* Simulator Modal Dialog */}
      {isSimulatorOpen && (
        <div
          className="modal open"
          role="dialog"
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
            onClick={() => setIsSimulatorOpen(false)}
          />
          <div
            className="m-card"
            style={{
              position: 'relative',
              zIndex: 91,
              width: 'min(500px, 100%)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            {/* Modal Header */}
            <div
              className="p-4 border-b border-border flex items-center justify-between"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-2.5">
                <span className={`ag-av sm ${activeAgent.service}`}>
                  <ServiceIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>
                    {t('test_agent')} · {L(activeAgent.name)}
                  </h3>
                  <div className="text-[11px] text-muted">
                    {activeAgent.model} · {currentStage ? L(currentStage.name) : ''}
                  </div>
                </div>
              </div>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setIsSimulatorOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Chat Messages */}
            <div
              className="p-4 flex-1 overflow-y-auto flex flex-col gap-3"
              style={{
                minHeight: '300px',
                maxHeight: '420px',
                background: 'var(--panel)',
              }}
            >
              {simMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'agent' && (
                    <span className="avatar sm">
                      <ServiceIcon className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <div
                    className="p-3 rounded-2xl text-xs max-w-[80%]"
                    style={{
                      background:
                        msg.sender === 'user' ? 'var(--brand)' : 'var(--surface)',
                      color:
                        msg.sender === 'user'
                          ? 'var(--on-brand)'
                          : 'var(--text)',
                      boxShadow: 'var(--shadow-1)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Input */}
            <form
              onSubmit={handleSendSimulator}
              className="p-3 border-t border-border flex items-center gap-2"
              style={{ background: 'var(--surface)' }}
            >
              <input
                className="input"
                style={{ flex: 1, height: '40px' }}
                placeholder={
                  lang === 'ar'
                    ? 'اكتب رسالة لتجربة رد الوكيل...'
                    : 'Type a message to test agent reply...'
                }
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
              />
              <button
                className="btn primary"
                type="submit"
                style={{ height: '40px' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
