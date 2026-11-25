import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Languages,
  Sparkles,
  Bell,
  Plug,
  ShieldCheck,
  TriangleAlert,
  Upload,
  Crown,
  Minus,
  Plus,
  Copy,
  RefreshCw,
  BookOpenText,
  ExternalLink,
  Download,
  Pause,
  Trash2,
  CircleDot,
  Check,
} from 'lucide-react';

interface SettingsState {
  wname: string;
  wname_ar: string;
  slug: string;
  cr: string;
  vat: string;
  ui_lang: string;
  digits: 'latn' | 'arab';
  cal: 'both' | 'greg' | 'hijri';
  tz: string;
  cur: string;
  week: 'fs' | 'ss' | 'f';
  hours: Record<string, [number, string, string]>;
  prayer: boolean;
  ramadan: boolean;
  ai_lang: string;
  disclose: boolean;
  fu: number;
  q_from: string;
  q_to: string;
  h_ask: boolean;
  h_pay: boolean;
  h_neg: boolean;
  h_price: boolean;
  h_vip: boolean;
  price: boolean;
  n: Record<string, [number, number, number]>;
  ret: string;
  consent: string;
  mask: boolean;
  ext: string;
}

const DEFAULTS: SettingsState = {
  wname: 'Al Ruba Developments',
  wname_ar: 'الربى للتطوير العقاري',
  slug: 'alruba',
  cr: '1010 123456',
  vat: '300 1234 5678 0003',
  ui_lang: 'ar',
  digits: 'latn',
  cal: 'both',
  tz: 'Asia/Riyadh',
  cur: 'SAR',
  week: 'fs',
  hours: {
    sun: [1, '09:00', '18:00'],
    mon: [1, '09:00', '18:00'],
    tue: [1, '09:00', '18:00'],
    wed: [1, '09:00', '18:00'],
    thu: [1, '09:00', '16:00'],
    fri: [0, '16:00', '22:00'],
    sat: [1, '16:00', '22:00'],
  },
  prayer: true,
  ramadan: true,
  ai_lang: 'auto',
  disclose: true,
  fu: 3,
  q_from: '23:00',
  q_to: '08:00',
  h_ask: true,
  h_pay: true,
  h_neg: true,
  h_price: false,
  h_vip: true,
  price: false,
  n: {
    human: [1, 1, 1],
    won: [1, 1, 0],
    visit: [1, 0, 1],
    down: [1, 1, 0],
    digest: [0, 1, 0],
  },
  ret: '24',
  consent:
    'مرحباً! نحفظ بياناتك لخدمتك في شراء العقار وفق نظام حماية البيانات الشخصية. هل توافق على المتابعة؟ / Hi! We keep your details only to help with your property search, per data-protection law. OK to continue?',
  mask: true,
  ext: 'https://smaia.voom.cc/api/v1/process',
};

const SECTIONS = [
  { key: 'workspace', ico: Building2 },
  { key: 'locale', ico: Languages },
  { key: 'ai', ico: Sparkles },
  { key: 'notify', ico: Bell },
  { key: 'api', ico: Plug },
  { key: 'privacy', ico: ShieldCheck },
  { key: 'danger', ico: TriangleAlert },
];

const API_TAGS: Record<string, string> = {
  workspace: 'GET/PATCH /tenants/{id} {name, slug, plan} · admin only',
  locale: 'tenant.settings.locale (convention, not read by backend)',
  ai: 'tenant.settings.ai_defaults · agents read agent.settings only',
  notify: 'NEW notifications service',
  api: 'tenant.settings.webhook_api_key · settings.external_ai_base_url (env)',
  privacy: 'NEW retention job + masking',
  danger: 'PATCH /tenants/{id} {status: suspended} · DELETE /tenants/{id}',
};

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const SettingsPage: React.FC = () => {
  const { t, lang, setLang, toast, timeAgo, formatDate, hijriDate } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const secParam = searchParams.get('section');
  const activeSec = SECTIONS.some((s) => s.key === secParam) ? secParam! : 'workspace';

  const [saved, setSaved] = useState<SettingsState>(DEFAULTS);
  const [st, setSt] = useState<SettingsState>(DEFAULTS);

  // Validation
  const [wnameError, setWnameError] = useState<boolean>(false);

  // API keys reveal/rotate states
  const [whkRevealed, setWhkRevealed] = useState<boolean>(false);
  const [whkFull, setWhkFull] = useState<string>('whk_live_8c1e0b77d2a94f6e9b153f9a');
  const [aiRevealed, setAiRevealed] = useState<boolean>(false);
  const aiFull = 'aik_live_f3a09d2c55e14b0a8e2271c0';

  // Modal dialog state
  const [modalType, setModalType] = useState<'pause' | 'delete' | null>(null);
  const [deleteInput, setDeleteInput] = useState<string>('');

  const isDirty = useMemo(() => {
    return JSON.stringify(st) !== JSON.stringify(saved);
  }, [st, saved]);

  const setSection = (k: string) => {
    setSearchParams({ section: k });
  };

  const updateSt = (patch: Partial<SettingsState>) => {
    setSt((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    if (!st.wname.trim()) {
      setSection('workspace');
      setWnameError(true);
      return;
    }
    setSaved(JSON.parse(JSON.stringify(st)));
    toast(t('saved'));
  };

  const handleDiscard = () => {
    setSt(JSON.parse(JSON.stringify(saved)));
    setWnameError(false);
    toast(t('discarded'));
  };

  const handleRotateWhk = () => {
    const tail = Math.random().toString(16).slice(2, 6);
    const newKey = 'whk_live_' + Math.random().toString(16).slice(2, 18) + tail;
    setWhkFull(newKey);
    toast(t('rotated'));
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard?.writeText(txt);
    toast(t('copied'));
  };

  // Preview formatted text for Locale tab
  const previewData = useMemo(() => {
    const now = new Date();
    const isAr = lang === 'ar';
    const loc = isAr
      ? st.digits === 'arab'
        ? 'ar-SA'
        : 'ar-SA-u-nu-latn'
      : 'en-US';

    let d = '';
    if (st.cal === 'greg') {
      d = new Intl.DateTimeFormat(loc, { dateStyle: 'medium' }).format(now);
    } else if (st.cal === 'hijri') {
      d = new Intl.DateTimeFormat(
        loc + (loc.includes('-u-') ? '-ca-islamic-umalqura' : '-u-ca-islamic-umalqura'),
        { dateStyle: 'medium' }
      ).format(now);
    } else {
      const greg = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' }).format(now);
      const hij = new Intl.DateTimeFormat(
        loc + (loc.includes('-u-') ? '-ca-islamic-umalqura' : '-u-ca-islamic-umalqura'),
        { day: 'numeric', month: 'short' }
      ).format(now);
      d = `${greg} · ${hij}`;
    }

    const n = new Intl.NumberFormat(loc).format(1284750);
    const m = new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: st.cur,
      maximumFractionDigits: 0,
    }).format(2450000);

    return { d, n, m };
  }, [lang, st.digits, st.cal, st.cur]);

  return (
    <>
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

      {/* Main Settings Grid */}
      <div className="set-grid">
        {/* Sticky Subnav */}
        <nav className="subnav" id="subnav" aria-label="Settings sections">
          {SECTIONS.map((sec) => {
            const Icon = sec.ico;
            const isDanger = sec.key === 'danger';
            const isActive = sec.key === activeSec;
            return (
              <a
                key={sec.key}
                href={`?section=${sec.key}`}
                className={isDanger ? 'dz' : ''}
                aria-current={isActive ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setSection(sec.key);
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{t('sec_' + sec.key)}</span>
              </a>
            );
          })}
        </nav>

        {/* Panel Content */}
        <div id="panel" className="panel set-panel">
          <header>
            <h2 tabIndex={-1}>{t('sec_' + activeSec)}</h2>
            <p>{t('d_' + activeSec)}</p>
          </header>

          {/* TAB 1: WORKSPACE */}
          {activeSec === 'workspace' && (
            <section className="card" data-api={API_TAGS.workspace}>
              <div className="card-b">
                <div className="form-grid">
                  <div className="field full">
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)' }}>
                      {t('f_logo')}
                    </span>
                    <div className="logo-up">
                      <span className="logo-box">AR</span>
                      <div className="stack" style={{ gap: '6px' }}>
                        <button
                          className="btn sm"
                          type="button"
                          onClick={() => toast(lang === 'ar' ? 'رفع الشعار' : 'Upload logo')}
                        >
                          <Upload className="ico-sm" />
                          <span>{t('up_logo')}</span>
                        </button>
                        <span className="help" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {t('logo_help')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`field ${wnameError ? 'invalid' : ''}`} id="w-wname">
                    <label htmlFor="fWname">
                      {t('f_wname')}
                      <span className="req" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      className="input"
                      id="fWname"
                      value={st.wname}
                      onChange={(e) => {
                        updateSt({ wname: e.target.value });
                        if (e.target.value.trim()) setWnameError(false);
                      }}
                      onBlur={() => {
                        setWnameError(!st.wname.trim());
                      }}
                      required
                      aria-describedby="e-wname"
                    />
                    <span
                      className="help"
                      id="e-wname"
                      role="alert"
                      style={{ color: 'var(--danger)', display: wnameError ? 'block' : 'none' }}
                    >
                      {t('err_wname')}
                    </span>
                  </div>

                  <div className="field">
                    <label htmlFor="fWnameAr">{t('f_wname_ar')}</label>
                    <input
                      className="input"
                      id="fWnameAr"
                      dir="rtl"
                      lang="ar"
                      value={st.wname_ar}
                      onChange={(e) => updateSt({ wname_ar: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="fSlug">{t('f_slug')}</label>
                    <div className="input-group ltr">
                      <span className="addon">app.voom.cc/</span>
                      <input
                        className="input"
                        id="fSlug"
                        value={st.slug}
                        onChange={(e) => updateSt({ slug: e.target.value })}
                        aria-describedby="h-slug"
                      />
                    </div>
                    <span className="help" id="h-slug">
                      {t('f_slug_help')}
                    </span>
                  </div>

                  <div className="field">
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)' }}>
                      {t('f_plan')}
                    </span>
                    <div className="row" style={{ minHeight: '40px' }}>
                      <span className="badge gold">
                        <Crown className="w-3.5 h-3.5" />
                        <span>{t('plan_v')}</span>
                      </span>
                      <a
                        className="btn sm ghost"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          toast(t('manage_plan'));
                        }}
                      >
                        {t('manage_plan')}
                      </a>
                    </div>
                  </div>

                  <div className="field gap" data-api="NEW tenant.settings.cr_number">
                    <label htmlFor="fCr">{t('f_cr')}</label>
                    <input
                      className="input ltr"
                      id="fCr"
                      value={st.cr}
                      onChange={(e) => updateSt({ cr: e.target.value })}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="field gap" data-api="NEW tenant.settings.vat_number">
                    <label htmlFor="fVat">{t('f_vat')}</label>
                    <input
                      className="input ltr"
                      id="fVat"
                      value={st.vat}
                      onChange={(e) => updateSt({ vat: e.target.value })}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: LOCALE & REGION */}
          {activeSec === 'locale' && (
            <>
              <section className="card gap" data-api={API_TAGS.locale}>
                <div className="card-b">
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="lUi">{t('f_ui_lang')}</label>
                      <select
                        className="select"
                        id="lUi"
                        value={st.ui_lang}
                        onChange={(e) => {
                          const newLang = e.target.value as 'ar' | 'en';
                          updateSt({ ui_lang: newLang });
                          setLang(newLang);
                        }}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="lTz">{t('f_tz')}</label>
                      <select
                        className="select"
                        id="lTz"
                        value={st.tz}
                        onChange={(e) => updateSt({ tz: e.target.value })}
                      >
                        <option value="Asia/Riyadh">Riyadh (GMT+3)</option>
                        <option value="Asia/Dubai">Dubai (GMT+4)</option>
                        <option value="Africa/Cairo">Cairo (GMT+2/+3)</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="lDg">{t('f_digits')}</label>
                      <select
                        className="select"
                        id="lDg"
                        value={st.digits}
                        onChange={(e) => updateSt({ digits: e.target.value as any })}
                      >
                        <option value="latn">{t('dg_latn')}</option>
                        <option value="arab">{t('dg_arab')}</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="lCal">{t('f_cal')}</label>
                      <select
                        className="select"
                        id="lCal"
                        value={st.cal}
                        onChange={(e) => updateSt({ cal: e.target.value as any })}
                      >
                        <option value="both">{t('cal_both')}</option>
                        <option value="greg">{t('cal_greg')}</option>
                        <option value="hijri">{t('cal_hijri')}</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="lCur">{t('f_cur')}</label>
                      <select
                        className="select"
                        id="lCur"
                        value={st.cur}
                        onChange={(e) => updateSt({ cur: e.target.value })}
                      >
                        <option value="SAR">SAR · ﷼</option>
                        <option value="AED">AED · د.إ</option>
                        <option value="EGP">EGP · ج.م</option>
                        <option value="USD">USD · $</option>
                      </select>
                      <span className="help">{t('f_cur_help')}</span>
                    </div>

                    <div className="field">
                      <label htmlFor="lWk">{t('f_week')}</label>
                      <select
                        className="select"
                        id="lWk"
                        value={st.week}
                        onChange={(e) => updateSt({ week: e.target.value as any })}
                      >
                        <option value="fs">{t('wk_fs')}</option>
                        <option value="ss">{t('wk_ss')}</option>
                        <option value="f">{t('wk_f')}</option>
                      </select>
                    </div>

                    <div className="field full">
                      <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)' }}>
                        {t('preview')}
                      </span>
                      <div className="preview" id="preview" aria-live="polite">
                        <div>
                          <div className="pl">{t('pv_date')}</div>
                          <div className="pv">{previewData.d}</div>
                        </div>
                        <div>
                          <div className="pl">{t('pv_num')}</div>
                          <div className="pv">{previewData.n}</div>
                        </div>
                        <div>
                          <div className="pl">{t('pv_money')}</div>
                          <div className="pv">{previewData.m}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Working Hours Card */}
              <section
                className="card gap"
                data-api="NEW tenant.settings.working_hours (used by handoff + follow-up scheduling)"
              >
                <div className="card-h">
                  <h3>{t('hours_t')}</h3>
                </div>
                <div className="card-b">
                  <p className="muted" style={{ fontSize: '12.5px', marginBottom: 'var(--s3)' }}>
                    {t('hours_d')}
                  </p>
                  <div className="hours">
                    {DAYS.map((d) => {
                      const item = st.hours[d] || [1, '09:00', '18:00'];
                      const isOpen = item[0] === 1;
                      return (
                        <div key={d} className={`day ${isOpen ? '' : 'off'}`}>
                          <span style={{ fontWeight: 500 }}>{t('days_' + d)}</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={isOpen}
                              onChange={(e) => {
                                const nextVal = e.target.checked ? 1 : 0;
                                updateSt({
                                  hours: {
                                    ...st.hours,
                                    [d]: [nextVal, item[1], item[2]],
                                  },
                                });
                              }}
                            />
                            <span className="track" />
                            <span className="sr-only">
                              {t('open_l').replace('{d}', t('days_' + d))}
                            </span>
                          </label>
                          <div className="times">
                            {isOpen ? (
                              <>
                                <input
                                  className="input ltr"
                                  type="time"
                                  value={item[1]}
                                  onChange={(e) => {
                                    updateSt({
                                      hours: {
                                        ...st.hours,
                                        [d]: [1, e.target.value, item[2]],
                                      },
                                    });
                                  }}
                                  aria-label={`${t('days_' + d)} from`}
                                />
                                <span className="muted">{t('to')}</span>
                                <input
                                  className="input ltr"
                                  type="time"
                                  value={item[2]}
                                  onChange={(e) => {
                                    updateSt({
                                      hours: {
                                        ...st.hours,
                                        [d]: [1, item[1], e.target.value],
                                      },
                                    });
                                  }}
                                  aria-label={`${t('days_' + d)} to`}
                                />
                              </>
                            ) : (
                              <span className="closed">{t('closed')}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <hr className="divider" style={{ margin: 'var(--s4) 0' }} />

                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('prayer_t')}</div>
                      <div className="rs-d">{t('prayer_d')}</div>
                    </div>
                    <div className="rs-c">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={st.prayer}
                          onChange={(e) => updateSt({ prayer: e.target.checked })}
                        />
                        <span className="track" />
                      </label>
                    </div>
                  </div>

                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('ramadan_t')}</div>
                      <div className="rs-d">{t('ramadan_d')}</div>
                    </div>
                    <div className="rs-c">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={st.ramadan}
                          onChange={(e) => updateSt({ ramadan: e.target.checked })}
                        />
                        <span className="track" />
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* TAB 3: AI BEHAVIOUR */}
          {activeSec === 'ai' && (
            <>
              <section className="card gap" data-api={API_TAGS.ai}>
                <div className="card-b">
                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('ai_lang')}</div>
                    </div>
                    <div className="rs-c">
                      <select
                        className="select"
                        value={st.ai_lang}
                        onChange={(e) => updateSt({ ai_lang: e.target.value })}
                      >
                        <option value="auto">{t('al_auto')}</option>
                        <option value="ar-SA">{t('al_sa')}</option>
                        <option value="ar-EG">{t('al_eg')}</option>
                        <option value="en">{t('al_en')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('ai_disclose')}</div>
                      <div className="rs-d">{t('ai_disclose_d')}</div>
                    </div>
                    <div className="rs-c">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={st.disclose}
                          onChange={(e) => updateSt({ disclose: e.target.checked })}
                        />
                        <span className="track" />
                      </label>
                    </div>
                  </div>

                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('ai_fu')}</div>
                      <div className="rs-d">{t('ai_fu_d')}</div>
                    </div>
                    <div className="rs-c">
                      <div className="stepper">
                        <button
                          type="button"
                          onClick={() => updateSt({ fu: Math.max(0, st.fu - 1) })}
                          aria-label="−"
                        >
                          <Minus className="ico-sm" />
                        </button>
                        <input
                          className="num"
                          value={st.fu}
                          onChange={(e) =>
                            updateSt({
                              fu: Math.max(0, Math.min(10, parseInt(e.target.value, 10) || 0)),
                            })
                          }
                          inputMode="numeric"
                          aria-label={t('ai_fu')}
                        />
                        <button
                          type="button"
                          onClick={() => updateSt({ fu: Math.min(10, st.fu + 1) })}
                          aria-label="+"
                        >
                          <Plus className="ico-sm" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('ai_quiet')}</div>
                      <div className="rs-d">{t('ai_quiet_d')}</div>
                    </div>
                    <div className="rs-c">
                      <input
                        className="input ltr"
                        type="time"
                        value={st.q_from}
                        onChange={(e) => updateSt({ q_from: e.target.value })}
                        style={{ width: '134px' }}
                        aria-label={`${t('ai_quiet')} from`}
                      />
                      <span className="muted">{t('to')}</span>
                      <input
                        className="input ltr"
                        type="time"
                        value={st.q_to}
                        onChange={(e) => updateSt({ q_to: e.target.value })}
                        style={{ width: '134px' }}
                        aria-label={`${t('ai_quiet')} to`}
                      />
                    </div>
                  </div>

                  <div className="row-set">
                    <div className="grow">
                      <div className="rs-t">{t('ai_price')}</div>
                      <div className="rs-d">{t('ai_price_d')}</div>
                    </div>
                    <div className="rs-c">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={st.price}
                          onChange={(e) => updateSt({ price: e.target.checked })}
                        />
                        <span className="track" />
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="card gap"
                data-api="transition_rules + NEW tenant.settings.handoff_triggers"
              >
                <div className="card-h">
                  <h3>{t('ai_handoff')}</h3>
                </div>
                <div className="card-b">
                  <div className="checks">
                    {(['ask', 'pay', 'neg', 'price', 'vip'] as const).map((k) => (
                      <label key={k}>
                        <input
                          type="checkbox"
                          checked={st[`h_${k}` as keyof SettingsState] as boolean}
                          onChange={(e) =>
                            updateSt({
                              [`h_${k}`]: e.target.checked,
                            } as any)
                          }
                        />
                        <span>{t('h_' + k)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeSec === 'notify' && (
            <section className="card" data-api={API_TAGS.notify}>
              <div className="card-b">
                <div className="table-wrap">
                  <table className="ntab">
                    <thead>
                      <tr>
                        <th>{t('n_event')}</th>
                        <th>{t('n_app')}</th>
                        <th>{t('n_email')}</th>
                        <th>{t('n_wa')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ['human', 1],
                          ['won', 0],
                          ['visit', 0],
                          ['down', 0],
                          ['digest', 1],
                        ] as [string, number][]
                      ).map(([k, d]) => (
                        <tr key={k}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{t('ne_' + k)}</div>
                            {d ? <div className="n-d">{t('ne_' + k + '_d')}</div> : null}
                          </td>
                          {[0, 1, 2].map((i) => (
                            <td key={i} className="c">
                              <label className="switch" style={{ justifyContent: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={!!st.n[k]?.[i]}
                                  onChange={(e) => {
                                    const next = [...st.n[k]] as [number, number, number];
                                    next[i] = e.target.checked ? 1 : 0;
                                    updateSt({
                                      n: {
                                        ...st.n,
                                        [k]: next,
                                      },
                                    });
                                  }}
                                />
                                <span className="track" />
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: API & INTEGRATIONS */}
          {activeSec === 'api' && (
            <section className="card">
              <div className="card-b">
                <div className="stack" style={{ gap: 'var(--s5)' }}>
                  {/* Webhook key */}
                  <div
                    className="field gap"
                    data-api="tenant.settings.webhook_api_key · NEW rotate endpoint"
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)' }}>
                      {t('k_webhook')}
                    </span>
                    <div className="copy-field">
                      <code>
                        {whkRevealed
                          ? whkFull
                          : `whk_live_••••••••••••••••${whkFull.slice(-4)}`}
                      </code>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => setWhkRevealed(!whkRevealed)}
                      >
                        {t(whkRevealed ? 'k_hide' : 'k_reveal')}
                      </button>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => handleCopy(whkFull)}
                      >
                        <Copy className="ico-sm" />
                        <span>{t('k_copy')}</span>
                      </button>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={handleRotateWhk}
                      >
                        <RefreshCw className="ico-sm" />
                        <span>{t('k_rotate')}</span>
                      </button>
                    </div>
                    <span className="help">
                      {t('k_webhook_d')} · {t('k_last').replace('{t}', timeAgo(2))}
                    </span>
                  </div>

                  {/* AI callback key */}
                  <div
                    className="field gap"
                    data-api="AiApiKeyGuard · settings.ai_api_key (env, not per tenant)"
                  >
                    <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-2)' }}>
                      {t('k_ai_callback')}
                    </span>
                    <div className="copy-field">
                      <code>
                        {aiRevealed
                          ? aiFull
                          : `aik_live_••••••••••••••••${aiFull.slice(-4)}`}
                      </code>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => setAiRevealed(!aiRevealed)}
                      >
                        {t(aiRevealed ? 'k_hide' : 'k_reveal')}
                      </button>
                      <button
                        className="btn sm ghost"
                        type="button"
                        onClick={() => handleCopy(aiFull)}
                      >
                        <Copy className="ico-sm" />
                        <span>{t('k_copy')}</span>
                      </button>
                    </div>
                    <span className="help">{t('k_ai_d')}</span>
                  </div>

                  {/* External AI endpoint */}
                  <div
                    className="field gap"
                    data-api="settings.external_ai_base_url (env) · agent.settings.external_endpoint"
                  >
                    <label htmlFor="kExt">{t('k_ext')}</label>
                    <input
                      className="input ltr"
                      id="kExt"
                      value={st.ext}
                      onChange={(e) => updateSt({ ext: e.target.value })}
                      type="url"
                    />
                    <span className="help">{t('k_ext_d')}</span>
                  </div>

                  <a
                    className="btn"
                    href="#"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={(e) => {
                      e.preventDefault();
                      toast(t('k_docs'));
                    }}
                  >
                    <BookOpenText className="w-4 h-4" />
                    <span>{t('k_docs')}</span>
                    <ExternalLink className="ico-sm" />
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* TAB 6: DATA & PRIVACY */}
          {activeSec === 'privacy' && (
            <section className="card gap" data-api={API_TAGS.privacy}>
              <div className="card-b">
                <div className="row-set">
                  <div className="grow">
                    <div className="rs-t">{t('p_ret')}</div>
                    <div className="rs-d">{t('p_ret_d')}</div>
                  </div>
                  <div className="rs-c">
                    <select
                      className="select"
                      value={st.ret}
                      onChange={(e) => updateSt({ ret: e.target.value })}
                    >
                      <option value="6">{t('r_6')}</option>
                      <option value="12">{t('r_12')}</option>
                      <option value="24">{t('r_24')}</option>
                      <option value="inf">{t('r_inf')}</option>
                    </select>
                  </div>
                </div>

                <div className="row-set">
                  <div className="grow">
                    <div className="rs-t">{t('p_mask')}</div>
                    <div className="rs-d">{t('p_mask_d')}</div>
                  </div>
                  <div className="rs-c">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={st.mask}
                        onChange={(e) => updateSt({ mask: e.target.checked })}
                      />
                      <span className="track" />
                    </label>
                  </div>
                </div>

                <div className="row-set" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div>
                    <div className="rs-t">
                      <label htmlFor="pCons">{t('p_consent')}</label>
                    </div>
                    <div className="rs-d">{t('p_consent_d')}</div>
                  </div>
                  <textarea
                    className="textarea"
                    id="pCons"
                    rows={3}
                    value={st.consent}
                    onChange={(e) => updateSt({ consent: e.target.value })}
                  />
                </div>

                <div className="row-set">
                  <div className="grow">
                    <div className="rs-t">{t('p_export')}</div>
                    <div className="rs-d">{t('p_export_d')}</div>
                  </div>
                  <div className="rs-c">
                    <button
                      className="btn"
                      type="button"
                      id="expBtn"
                      onClick={() => toast(t('exp_toast'))}
                    >
                      <Download className="ico-sm" />
                      <span>{t('p_export_b')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 7: DANGER ZONE */}
          {activeSec === 'danger' && (
            <section className="card dz-card" data-api={API_TAGS.danger}>
              <div className="card-b">
                <div className="row-set">
                  <div className="grow">
                    <div className="rs-t">{t('dz_suspend')}</div>
                    <div className="rs-d">{t('dz_suspend_d')}</div>
                  </div>
                  <div className="rs-c">
                    <button
                      className="btn danger"
                      type="button"
                      id="pauseBtn"
                      onClick={() => setModalType('pause')}
                    >
                      <Pause className="ico-sm" />
                      <span>{t('dz_suspend_b')}</span>
                    </button>
                  </div>
                </div>

                <div className="row-set">
                  <div className="grow">
                    <div className="rs-t">{t('dz_delete')}</div>
                    <div className="rs-d">{t('dz_delete_d')}</div>
                  </div>
                  <div className="rs-c">
                    <button
                      className="btn danger-solid"
                      type="button"
                      id="delBtn"
                      onClick={() => {
                        setDeleteInput('');
                        setModalType('delete');
                      }}
                    >
                      <Trash2 className="ico-sm" />
                      <span>{t('dz_delete_b')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Floating Savebar */}
      <div
        className={`savebar ${isDirty ? 'show' : ''}`}
        id="savebar"
        role="region"
        aria-live="polite"
      >
        <span className="sb-t">
          <CircleDot className="w-4 h-4" />
          <span>{t('unsaved')}</span>
        </span>
        <button className="btn" type="button" id="discardBtn" onClick={handleDiscard}>
          {t('discard')}
        </button>
        <button className="btn primary" type="button" id="saveBtn" onClick={handleSave}>
          <Check className="w-4 h-4" />
          <span>{t('save')}</span>
        </button>
      </div>

      {/* Scrim & Confirmation Dialog Modal */}
      {modalType !== null && (
        <>
          <div
            className="scrim open"
            id="scrim"
            onClick={() => setModalType(null)}
          />
          <div
            className="modal open"
            id="confirm"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="m-card">
              <div className="m-ico">
                <TriangleAlert className="w-5 h-5" />
              </div>
              <h3>
                {modalType === 'pause' ? t('cf_pause_t') : t('cf_del_t')}
              </h3>
              <p className="muted" style={{ fontSize: '13.5px' }}>
                {modalType === 'pause' ? t('cf_pause_b') : t('cf_del_b')}
              </p>

              {modalType === 'delete' && (
                <div className="field">
                  <label htmlFor="cfIn">
                    {t('cf_del_l').replace('{s}', st.slug)}
                  </label>
                  <input
                    className="input ltr"
                    id="cfIn"
                    autoComplete="off"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                  />
                </div>
              )}

              <div className="m-acts">
                <button
                  className="btn"
                  type="button"
                  onClick={() => setModalType(null)}
                >
                  {t('cancel')}
                </button>
                <button
                  className="btn danger-solid"
                  type="button"
                  disabled={modalType === 'delete' && deleteInput.trim() !== st.slug}
                  onClick={() => {
                    if (modalType === 'pause') {
                      toast(t('paused'));
                    } else {
                      const d = new Date(Date.now() + 30 * 864e5);
                      toast(
                        t('del_sched').replace(
                          '{d}',
                          `${formatDate(d)} · ${hijriDate(d)}`
                        )
                      );
                    }
                    setModalType(null);
                  }}
                >
                  {modalType === 'pause' ? t('cf_pause_y') : t('cf_del_y')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
