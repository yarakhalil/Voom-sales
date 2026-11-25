import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { Drawer, Avatar } from '../components/common';
import {
  UserPlus,
  Users,
  CircleDot,
  Mail,
  Armchair,
  MoreVertical,
  Pencil,
  KeyRound,
  Ban,
  CircleCheck,
  Trash2,
  X,
  Check,
  Link,
  Send,
  Plug,
  TriangleAlert,
  Minus,
} from 'lucide-react';

/** Team member account record */
interface MemberItem {
  id: string;
  name: { en: string; ar: string };
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
  online: boolean;
  /** Minutes elapsed since user was last active */
  last: number;
  /** Real estate project IDs assigned to this member */
  projects: string[];
  /** Availability toggle for receiving automatic lead assignments */
  avail: boolean;
}

/** Pending workspace invitation */
interface InviteItem {
  id: string;
  email: string;
  role: 'admin' | 'user';
  /** User ID of the inviter */
  by: string;
  /** Minutes elapsed since invitation was dispatched */
  mins: number;
}

const INITIAL_MEMBERS: MemberItem[] = [
  {
    id: 'u1',
    name: { en: 'Ahmed Saleh', ar: 'أحمد صالح' },
    email: 'ahmed.saleh@alruba.sa',
    role: 'admin',
    status: 'active',
    online: true,
    last: 3,
    projects: ['sadeel', 'stax', 'nile-view', 'jawharat-al-ruba', 'flamant'],
    avail: true,
  },
  {
    id: 'u2',
    name: { en: 'Layla Nasser', ar: 'ليلى ناصر' },
    email: 'layla.nasser@alruba.sa',
    role: 'user',
    status: 'active',
    online: true,
    last: 40,
    projects: ['jawharat-al-ruba', 'flamant'],
    avail: true,
  },
  {
    id: 'u3',
    name: { en: 'Hassan Ali', ar: 'حسن علي' },
    email: 'hassan.ali@alruba.sa',
    role: 'user',
    status: 'active',
    online: false,
    last: 1260,
    projects: ['stax', 'nile-view'],
    avail: true,
  },
  {
    id: 'u4',
    name: { en: 'Mona Fathy', ar: 'منى فتحي' },
    email: 'mona.fathy@alruba.sa',
    role: 'user',
    status: 'active',
    online: true,
    last: 12,
    projects: ['sadeel'],
    avail: false,
  },
  {
    id: 'u5',
    name: { en: 'Saad Al-Qahtani', ar: 'سعد القحطاني' },
    email: 'saad.q@alruba.sa',
    role: 'admin',
    status: 'active',
    online: false,
    last: 4300,
    projects: ['sadeel', 'stax', 'nile-view', 'jawharat-al-ruba', 'flamant'],
    avail: false,
  },
  {
    id: 'u6',
    name: { en: 'Rania Mostafa', ar: 'رانيا مصطفى' },
    email: 'rania.m@alruba.sa',
    role: 'user',
    status: 'disabled',
    online: false,
    last: 43000,
    projects: ['nile-view'],
    avail: false,
  },
];

const INITIAL_INVITES: InviteItem[] = [
  { id: 'i1', email: 'khaled.harbi@alruba.sa', role: 'user', by: 'u1', mins: 180 },
  { id: 'i2', email: 'sales.stax@alruba.ae', role: 'user', by: 'u5', mins: 4320 },
];

const SEATS_TOTAL = 10;

const PERMISSION_ROWS = [
  { group: 'g_conv' },
  { key: 'p_reply', admin: true, user: true },
  { key: 'p_all_chats', admin: true, user: false },
  { group: 'g_sales' },
  { key: 'p_deals', admin: true, user: true },
  { key: 'p_contacts_exp', admin: true, user: false },
  { group: 'g_conf' },
  { key: 'p_agents', admin: true, user: false },
  { key: 'p_channels', admin: true, user: false },
  { key: 'p_team', admin: true, user: false },
  { key: 'p_billing', admin: true, user: false },
];

export const TeamPage: React.FC = () => {
  const { t, L, toast, lang, timeAgo, n } = useApp();
  const { chats, projects } = useData();

  const [members, setMembers] = useState<MemberItem[]>(INITIAL_MEMBERS);
  const [invites, setInvites] = useState<InviteItem[]>(INITIAL_INVITES);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user' | 'off'>('all');
  const [routingMode, setRoutingMode] = useState<'rr' | 'proj' | 'manual'>('proj');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [formEmail, setFormEmail] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formRole, setFormRole] = useState<'admin' | 'user'>('user');
  const [formProjects, setFormProjects] = useState<string[]>(['sadeel']);
  const [formMsg, setFormMsg] = useState<string>('');

  const PK = Object.keys(projects);

  const openChatsCount = (uid: string) =>
    chats.filter((c) => c.assigned === uid && c.status !== 'closed').length;

  const onlineMembers = members.filter((m) => m.online && m.status === 'active');
  const offlineMembers = members.filter((m) => !m.online && m.status === 'active');
  const usedSeats = members.filter((m) => m.status !== 'disabled').length + invites.length;

  // Filtered members
  const filteredList = members.filter((m) => {
    if (filterRole === 'all') return true;
    if (filterRole === 'off') return m.status === 'disabled';
    return m.role === filterRole && m.status !== 'disabled';
  });

  // Drawer handlers
  const handleOpenInvite = () => {
    setEditingMember(null);
    setFormEmail('');
    setFormName('');
    setFormRole('user');
    setFormProjects(['sadeel']);
    setFormMsg('');
    setDrawerOpen(true);
  };

  const handleOpenEdit = (m: MemberItem) => {
    setEditingMember(m);
    setFormEmail(m.email);
    setFormName(L(m.name));
    setFormRole(m.role);
    setFormProjects([...m.projects]);
    setFormMsg('');
    setDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (!formEmail.trim() || !formEmail.includes('@')) {
      toast(t('err_email'));
      return;
    }

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== editingMember.id) return m;
          return {
            ...m,
            role: formRole,
            projects: [...formProjects],
            name: formName ? { en: formName, ar: formName } : m.name,
          };
        })
      );
      toast(t('saved'));
    } else {
      if (members.some((m) => m.email === formEmail) || invites.some((i) => i.email === formEmail)) {
        toast(t('err_dup').replace('{e}', formEmail));
        return;
      }
      setInvites((prev) => [
        {
          id: 'i' + Date.now(),
          email: formEmail.trim(),
          role: formRole,
          by: 'u1',
          mins: 0,
        },
        ...prev,
      ]);
      toast(t('inv_sent').replace('{e}', formEmail));
    }
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Header */}
      <section className="head">
        <div>
          <p className="sub">{t('team_sub')}</p>
        </div>
        <div className="tools">
          <button
            className="btn primary"
            type="button"
            id="inviteBtn"
            onClick={handleOpenInvite}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('invite')}</span>
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

      {/* Online now Hero Card */}
      <section className="card on-card gap">
        <div className="o-h">
          <h2>{t('online_now')}</h2>
          <span className="muted" id="onN">
            {n(onlineMembers.length)} / {n(onlineMembers.length + offlineMembers.length)}
          </span>
        </div>
        <div className="o-row" id="onRow">
          {onlineMembers.map((m) => (
            <div key={m.id} className="o-p">
              <Avatar name={L(m.name)} ring={m.id === 'u1'} online={true} />
              <span className="o-n">{L(m.name).split(' ')[0]}</span>
              <span className="o-r">{t(m.role === 'admin' ? 'r_admin' : 'r_user')}</span>
            </div>
          ))}
          {offlineMembers.length > 0 && (
            <div className="o-p">
              <span
                className="o-more num"
                title={offlineMembers.map((m) => L(m.name)).join(', ')}
              >
                +{n(offlineMembers.length)}
              </span>
              <span className="o-n muted">{t('offline')}</span>
            </div>
          )}
        </div>
      </section>

      {/* Summary KPI Cards */}
      <section className="summary" id="summary">
        <div className="card sum">
          <span className="s-ico">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_members')}</div>
            <div className="s-v num">{n(members.length)}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <CircleDot className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_online')}</div>
            <div className="s-v num">{n(onlineMembers.length)}</div>
          </div>
        </div>

        <div className="card sum">
          <span className="s-ico">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_pending')}</div>
            <div className="s-v num">{n(invites.length)}</div>
          </div>
        </div>

        <div className="card sum gap">
          <span className="s-ico">
            <Armchair className="w-5 h-5" />
          </span>
          <div>
            <div className="s-l">{t('s_seats')}</div>
            <div className="s-v num">
              {t('seats_of')
                .replace('{a}', n(usedSeats))
                .replace('{b}', n(SEATS_TOTAL))}
            </div>
            <div className="seats">
              <i style={{ width: `${(usedSeats / SEATS_TOTAL) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Section: Table on left, Invites & Routing on right */}
      <section className="grid-a">
        {/* Members Table Card */}
        <div className="card">
          <div className="card-h">
            <div>
              <h3>{t('members')}</h3>
              <div className="sub">{t('members_s')}</div>
            </div>
            <div className="spacer" />
            <div className="seg" role="group" id="segF">
              <button
                type="button"
                aria-pressed={filterRole === 'all'}
                onClick={() => setFilterRole('all')}
              >
                {t('f_all')}
              </button>
              <button
                type="button"
                aria-pressed={filterRole === 'admin'}
                onClick={() => setFilterRole('admin')}
              >
                {t('f_admin')}
              </button>
              <button
                type="button"
                aria-pressed={filterRole === 'user'}
                onClick={() => setFilterRole('user')}
              >
                {t('f_user')}
              </button>
              <button
                type="button"
                aria-pressed={filterRole === 'off'}
                onClick={() => setFilterRole('off')}
              >
                {t('f_off')}
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table" id="tbl">
              <thead>
                <tr>
                  <th>{t('th_member')}</th>
                  <th className="col-role">{t('th_role')}</th>
                  <th>{t('th_status')}</th>
                  <th className="col-load">{t('th_load')}</th>
                  <th className="col-proj">{t('th_proj')}</th>
                  <th className="end col-last">{t('th_last')}</th>
                  <th className="act">
                    <span className="sr-only">…</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((m) => {
                  const n = openChatsCount(m.id);
                  const isMe = m.id === 'u1';
                  const isMenuOpen = openMenuId === m.id;

                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="who">
                          <span className="av-wrap">
                            <Avatar name={L(m.name)} size="sm" />
                            {m.online && (
                              <span className="online" title="Online" />
                            )}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="name">
                              <span>{L(m.name)}</span>
                              {isMe && <span className="you">{t('you')}</span>}
                            </div>
                            <div className="meta ltr">{m.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="col-role">
                        <select
                          className="select role-sel"
                          disabled={isMe || m.status === 'disabled'}
                          value={m.role}
                          onChange={(e) => {
                            const val = e.target.value as 'admin' | 'user';
                            setMembers((prev) =>
                              prev.map((x) =>
                                x.id === m.id ? { ...x, role: val } : x
                              )
                            );
                            toast(t('saved'));
                          }}
                        >
                          <option value="admin">{t('r_admin')}</option>
                          <option value="user">{t('r_user')}</option>
                        </select>
                      </td>

                      <td>
                        {m.status === 'active' ? (
                          <span className="badge ok">
                            <CircleCheck className="w-3 h-3" />
                            <span>{t('u_active')}</span>
                          </span>
                        ) : (
                          <span className="badge outline">
                            <Ban className="w-3 h-3" />
                            <span>{t('u_disabled')}</span>
                          </span>
                        )}
                      </td>

                      <td className="col-load">
                        <div className="load">
                          <div className="m-track">
                            <div
                              className={`m-fill ${n >= 3 ? 'hi' : ''}`}
                              style={{ width: `${Math.min(100, (n / 4) * 100)}%` }}
                            />
                          </div>
                          <span className="num">{n}</span>
                        </div>
                      </td>

                      <td className="col-proj">
                        <div className="projs">
                          {m.projects.length >= PK.length ? (
                            <span className="badge brand">{t('all_p')}</span>
                          ) : (
                            m.projects.map((p) => (
                              <span key={p} className="badge outline">
                                {projects[p] ? L(projects[p].name) : p}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="end muted col-last" style={{ whiteSpace: 'nowrap' }}>
                        {m.online ? (
                          <span style={{ color: 'var(--ok)' }}>
                            ● {lang === 'ar' ? 'الآن' : 'Now'}
                          </span>
                        ) : (
                          timeAgo(m.last)
                        )}
                      </td>

                      <td className="act">
                        <div className="menu-wrap">
                          <button
                            className="icon-btn"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : m.id);
                            }}
                            aria-expanded={isMenuOpen}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {isMenuOpen && (
                            <div className="menu open" role="menu">
                              <button
                                role="menuitem"
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleOpenEdit(m);
                                }}
                              >
                                <Pencil className="ico-sm" />
                                <span>{t('m_edit')}</span>
                              </button>
                              <button
                                role="menuitem"
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  toast(t('reset_t').replace('{e}', m.email));
                                }}
                              >
                                <KeyRound className="ico-sm" />
                                <span>{t('m_reset')}</span>
                              </button>
                              {!isMe && (
                                <>
                                  <button
                                    role="menuitem"
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      const nextStatus =
                                        m.status === 'disabled'
                                          ? 'active'
                                          : 'disabled';
                                      setMembers((prev) =>
                                        prev.map((x) =>
                                          x.id === m.id
                                            ? { ...x, status: nextStatus, online: false }
                                            : x
                                        )
                                      );
                                      toast(
                                        t(
                                          nextStatus === 'disabled'
                                            ? 'disabled_t'
                                            : 'enabled_t'
                                        ).replace('{n}', L(m.name))
                                      );
                                    }}
                                  >
                                    <Ban className="ico-sm" />
                                    <span>
                                      {t(
                                        m.status === 'disabled'
                                          ? 'm_enable'
                                          : 'm_disable'
                                      )}
                                    </span>
                                  </button>
                                  <hr />
                                  <button
                                    role="menuitem"
                                    type="button"
                                    className="danger"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      if (
                                        confirm(
                                          t('rm_confirm').replace('{n}', L(m.name))
                                        )
                                      ) {
                                        setMembers((prev) =>
                                          prev.filter((x) => x.id !== m.id)
                                        );
                                        toast(t('removed').replace('{n}', L(m.name)));
                                      }
                                    }}
                                  >
                                    <Trash2 className="ico-sm" />
                                    <span>{t('m_remove')}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Stack: Pending invites + Routing */}
        <div className="side">
          {/* Pending Invites Card */}
          <div className="card">
            <div className="card-h">
              <div>
                <h3>{t('pending')}</h3>
                <div className="sub">{t('pending_s')}</div>
              </div>
            </div>
            <div id="invites">
              {invites.length === 0 ? (
                <div className="empty" style={{ padding: 'var(--s5)' }}>
                  {t('no_inv')}
                </div>
              ) : (
                invites.map((inv) => {
                  const byMember = members.find((m) => m.id === inv.by);
                  return (
                    <div key={inv.id} className="inv">
                      <span className="i-ico">
                        <Mail className="w-4 h-4" />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div
                          className="ltr"
                          style={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {inv.email}
                        </div>
                        <div className="i-m">
                          {t(inv.role === 'admin' ? 'r_admin' : 'r_user')} ·{' '}
                          {t('inv_by')
                            .replace(
                              '{u}',
                              byMember ? L(byMember.name).split(' ')[0] : '—'
                            )
                            .replace('{t}', timeAgo(inv.mins))}
                        </div>
                      </div>
                      <div className="i-acts">
                        <button
                          className="btn sm ghost"
                          type="button"
                          title={t('copy_code')}
                          onClick={() => toast(t('copied'))}
                        >
                          <Link className="ico-sm" />
                        </button>
                        <button
                          className="btn sm ghost gap"
                          type="button"
                          title={t('resend')}
                          onClick={() => toast(t('resent'))}
                        >
                          <Send className="ico-sm" />
                        </button>
                        <button
                          className="btn sm ghost danger"
                          type="button"
                          title={t('revoke')}
                          onClick={() => {
                            setInvites((prev) =>
                              prev.filter((x) => x.id !== inv.id)
                            );
                            toast(t('revoked'));
                          }}
                        >
                          <X className="ico-sm" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Handoff Routing Card */}
          <div className="card gap">
            <div className="card-h">
              <div>
                <h3>{t('route_t')}</h3>
                <div className="sub">{t('route_s')}</div>
              </div>
            </div>
            <div className="card-b route" id="route">
              <div className="field">
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: 'var(--text-2)',
                  }}
                >
                  {t('r_mode')}
                </span>
                <div
                  className="seg"
                  role="group"
                  id="modeSeg"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <button
                    type="button"
                    aria-pressed={routingMode === 'rr'}
                    onClick={() => setRoutingMode('rr')}
                  >
                    {t('m_rr')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={routingMode === 'proj'}
                    onClick={() => setRoutingMode('proj')}
                  >
                    {t('m_proj')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={routingMode === 'manual'}
                    onClick={() => setRoutingMode('manual')}
                  >
                    {t('m_manual')}
                  </button>
                </div>
              </div>

              <div>
                {members
                  .filter((m) => m.status === 'active')
                  .map((m) => {
                    const n = openChatsCount(m.id);
                    return (
                      <div key={m.id} className="avail">
                        <span className="av-wrap">
                          <Avatar name={L(m.name)} size="sm" />
                          {m.online && <span className="online" />}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{L(m.name)}</div>
                          <div className="a-m">
                            {t('avail_n')
                              .replace('{n}', String(n))
                              .replace(
                                '{p}',
                                m.projects.length >= PK.length
                                  ? t('all_p')
                                  : m.projects
                                      .map((p) =>
                                        projects[p] ? L(projects[p].name) : p
                                      )
                                      .join('، ')
                              )}
                          </div>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={m.avail}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setMembers((prev) =>
                                prev.map((x) =>
                                  x.id === m.id ? { ...x, avail: checked } : x
                                )
                              );
                              toast(t('saved'));
                            }}
                          />
                          <span className="track" />
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles & Permissions Matrix Card */}
      <section className="card gap">
        <div className="card-h">
          <div>
            <h3>{t('perm_t')}</h3>
            <div className="sub">{t('perm_s')}</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="perm" id="perm">
            <thead>
              <tr>
                <th />
                <th className="c">{t('r_admin')}</th>
                <th className="c">{t('r_user')}</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_ROWS.map((row, idx) => {
                if (row.group) {
                  return (
                    <tr key={idx} className="grp">
                      <td colSpan={3}>{t(row.group)}</td>
                    </tr>
                  );
                }
                return (
                  <tr key={idx}>
                    <td>{t(row.key!)}</td>
                    <td className="c">
                      {row.admin ? (
                        <Check className="yes inline w-4 h-4 text-emerald-600" />
                      ) : (
                        <Minus className="no inline w-4 h-4 opacity-40" />
                      )}
                    </td>
                    <td className="c">
                      {row.user ? (
                        <Check className="yes inline w-4 h-4 text-emerald-600" />
                      ) : (
                        <Minus className="no inline w-4 h-4 opacity-40" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer for Invite / Edit Member */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="min(540px, 100%)"
        footer={
          <div className="drawer-f w-full flex items-center justify-end gap-2">
            <button
              className="btn"
              type="button"
              onClick={() => setDrawerOpen(false)}
            >
              {t('cancel')}
            </button>
            <button
              className="btn primary"
              type="button"
              onClick={handleSaveDrawer}
            >
              {editingMember ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('save')}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('send_inv')}</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="drawer-h">
          {editingMember ? (
            <Avatar name={L(editingMember.name)} />
          ) : (
            <span className="avatar">
              <UserPlus className="ico-sm" />
            </span>
          )}
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="dh-name">
              {editingMember
                ? t('d_edit').replace('{n}', L(editingMember.name))
                : t('d_invite')}
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

        <div className="drawer-b">
          <div className="field">
            <label htmlFor="fEmail">
              {t('f_email')}
              <span className="req">*</span>
            </label>
            <input
              className="input ltr"
              id="fEmail"
              type="email"
              readOnly={Boolean(editingMember)}
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="e.g. name@alruba.sa"
              required
            />
            <span className="help">{t('f_email_help')}</span>
          </div>

          {editingMember && (
            <div className="field">
              <label htmlFor="fName">{t('f_name')}</label>
              <input
                className="input"
                id="fName"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          )}

          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend
              style={{
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'var(--text-2)',
                marginBottom: '6px',
              }}
            >
              {t('f_role')}
            </legend>
            <div className="roles">
              <label className="role-card">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formRole === 'user'}
                  onChange={() => setFormRole('user')}
                />
                <span>
                  <b>{t('r_user')}</b>
                  <div className="r-d">{t('r_user_d')}</div>
                </span>
              </label>

              <label className="role-card">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formRole === 'admin'}
                  onChange={() => setFormRole('admin')}
                />
                <span>
                  <b>{t('r_admin')}</b>
                  <div className="r-d">{t('r_admin_d')}</div>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset
            className="field gap"
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            <legend
              style={{
                fontSize: '12.5px',
                fontWeight: 500,
                color: 'var(--text-2)',
                marginBottom: '6px',
              }}
            >
              {t('f_projects')}
            </legend>
            <div className="chk-grid">
              {PK.map((p) => {
                const isChecked = formProjects.includes(p);
                return (
                  <label key={p}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormProjects([...formProjects, p]);
                        } else {
                          setFormProjects(formProjects.filter((x) => x !== p));
                        }
                      }}
                    />
                    <span>{projects[p] ? L(projects[p].name) : p}</span>
                  </label>
                );
              })}
            </div>
            <span className="help">{t('f_projects_help')}</span>
          </fieldset>

          {!editingMember && (
            <div className="field">
              <label htmlFor="fMsg">{t('f_msg')}</label>
              <textarea
                className="textarea"
                id="fMsg"
                rows={3}
                value={formMsg}
                onChange={(e) => setFormMsg(e.target.value)}
              />
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};
