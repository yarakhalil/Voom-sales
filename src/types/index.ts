/**
 * Core domain types and data contracts for the VOOM Sales AI Agent Platform.
 */

/** Application display language: 'en' for English (LTR), 'ar' for Arabic (RTL) */
export type Locale = 'en' | 'ar';

/** Application color theme: 'light' mode or 'dark' mode */
export type Theme = 'light' | 'dark';

/** Number numeral presentation: 'latn' (0-9) or 'arab' (٠-٩) */
export type DigitMode = 'latn' | 'arab';

/** Supported communication and messaging channel protocols */
export type Channel =
  | 'whatsapp'
  | 'instagram'
  | 'telegram'
  | 'messenger'
  | 'phone'
  | 'tour'
  | 'email'
  | 'discord'
  | 'gmail'
  | 'outlook';

/** Pipeline deal progression status */
export type DealStatus = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

/** Priority tier for conversation triage and SLA escalations */
export type ChatPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Status of the active chat thread */
export type ChatStatus = 'open' | 'pending' | 'closed';

/** Bilingual localized text container with English and Arabic versions */
export interface LocalizedString {
  en: string;
  ar: string;
}

/** A field that can be either a bilingual LocalizedString object or a simple string */
export type LocalizedField = LocalizedString | string;

/** Real estate development project / property portfolio */
export interface Project {
  /** Unique project identifier (e.g. 'sadeel', 'flamant') */
  id: string;
  /** Bilingual project marketing name */
  name: LocalizedString;
  /** Bilingual city location */
  city: LocalizedString;
  /** ISO 3166-1 alpha-2 country code (e.g. 'SA', 'AE', 'EG') */
  cc: string;
  /** Currency code for pricing (e.g. 'SAR', 'AED', 'EGP') */
  cur: string;
  /** Property development type (e.g. 'Luxury Residential', 'Off-plan Towers') */
  kind: LocalizedString;
}

/** Human sales advisor or administrative workspace user */
export interface TeamMember {
  /** Unique user identifier (e.g. 'u1') */
  id: string;
  /** Bilingual user display name */
  name: LocalizedString;
  /** User authorization level */
  role: 'admin' | 'user' | 'manager';
  /** Live presence status indicator */
  online: boolean;
  /** User business email address */
  email: string;
  /** Number of active ongoing conversations assigned to this advisor */
  activeChats?: number;
  /** Project identifiers this advisor has access to */
  assignedProjects?: string[];
}

/** AI sales agent persona configured to interact with prospects */
export interface Agent {
  /** Unique agent identifier (e.g. 'ag1') */
  id: string;
  /** Bilingual agent persona name */
  name: LocalizedString;
  /** Underlying AI service integration type */
  service: 'SMAIA' | 'Voomi' | 'Calling';
  /** Personality and conversational tone prompt */
  persona: string;
  /** LLM provider name (e.g. 'Anthropic', 'OpenAI') */
  provider: string;
  /** Specific model identifier (e.g. 'Claude 3.5 Sonnet', 'GPT-4o') */
  model: string;
  /** Primary spoken language configuration */
  language: string;
  /** Channels enabled for this AI agent */
  channels: Channel[];
  /** Associated real estate project ID */
  project: string;
  /** Operational deployment status */
  status: 'live' | 'paused';
  /** Lifetime conversations handled */
  convs: number;
  /** Qualified leads captured by this agent */
  leads: number;
  /** Human advisor takeover handoffs executed */
  handoffs: number;
}

/** Sales funnel stage in the pipeline */
export interface Stage {
  /** Unique stage identifier (e.g. 's1', 's2') */
  id: string;
  /** Bilingual stage title (e.g. 'Greeting & Interest', 'Site Visit') */
  name: LocalizedString;
  /** Bilingual stage overview and purpose */
  desc: LocalizedString;
  /** AI agent operating instructions when dealing with prospects in this stage */
  instruction: LocalizedString;
  /** Follow-up cadence and prompt rules */
  fu: {
    /** Time interval between follow-ups in minutes */
    interval: number;
    /** Maximum number of automated follow-up attempts */
    max: number;
    /** Bilingual follow-up prompt instructions */
    prompt: LocalizedString;
  };
  /** Count of knowledge base articles assigned */
  knowledge: number;
  /** Count of automated actions connected */
  actions: number;
  /** Count of conditional stage transition rules */
  rules: number;
}

/** Single message bubble inside a chat thread */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Origin sender of the message */
  sender: 'client' | 'ai' | 'agent' | 'system';
  /** Text content of the message */
  text: string;
  /** Formatted human-readable time string (e.g. '10:14 AM') */
  time: string;
  /** Numeric epoch timestamp in milliseconds */
  timestamp?: number;
  /** Content presentation type */
  type?: 'text' | 'unit' | 'file' | 'audio' | 'event';
  /** Attached real estate unit card data */
  unitData?: {
    title: string;
    subtitle: string;
    price: string;
    bedrooms: string;
    hue: number;
  };
  /** Attached document or brochure file data */
  fileData?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'link';
  };
  /** Attached voice note audio data */
  audioData?: {
    duration: string;
    transcript: string;
  };
  /** System event category if type is 'event' */
  systemType?: 'fu' | 'stop' | 'move';
}

/** Customer conversation and lead record */
export interface Chat {
  /** Unique chat session identifier */
  id: string;
  /** Bilingual customer contact name */
  name: LocalizedString;
  /** International phone number */
  phone: string;
  /** Inbound communication channel */
  ch: Channel;
  /** Associated real estate project ID */
  project: string;
  /** Conversation language preference */
  lang: 'ar' | 'en';
  /** Overall conversation triage status */
  status: ChatStatus;
  /** SLA and urgency priority */
  priority: ChatPriority;
  /** Whether the AI agent is actively replying (true) or human advisor has taken over (false) */
  ai: boolean;
  /** Elapsed minutes since last customer message */
  mins: number;
  /** Unread incoming messages counter */
  unread: number;
  /** ID of assigned human team member, or null if unassigned */
  assigned: string | null;
  /** Current sales funnel stage ID */
  stage: string;
  /** Current deal status in the pipeline */
  ds: DealStatus;
  /** Estimated customer budget in local project currency */
  budget: number;
  /** Unit type or property description sought by prospect */
  unit: string;
  /** Brief snippet preview of the latest message */
  preview: string;
  /** Reason for human advisor takeover flag, if attention is required */
  takeover?: 'followups' | 'question' | 'handover';
  /** Customer online presence state */
  online: boolean;
  /** Current typing indicator status */
  typing?: 'ai' | 'client' | null;
  /** Attached media floor plans or property renderings */
  media: Array<{
    label: string;
    hue: number;
    kind: 'house' | 'building-2';
  }>;
  /** Attached exchange files and contracts */
  files: Array<{
    name: string;
    size: string;
    days: number;
  }>;
  /** Relevant web links shared during conversation */
  links: string[];
  /** Complete message transcript */
  messages: ChatMessage[];
  /** Internal collaborative team notes on this lead */
  notes?: Array<{
    id: string;
    author: string;
    text: string;
    time: string;
  }>;
  /** Segment classification tags (e.g. 'VIP', 'Investor', 'Mortgage') */
  tags?: string[];
  /** ISO date string when contact was created */
  createdAt?: string;
}

/** Channel integration connection configuration */
export interface ChannelConfig {
  /** Unique channel configuration identifier */
  id: string;
  /** Platform protocol type */
  type: Channel;
  /** Bilingual channel display label */
  name: LocalizedField;
  /** Integration protocol version or provider */
  protocol: string;
  /** High-level operational status */
  status: 'active' | 'degraded' | 'offline';
  /** Webhook and connection health diagnostic */
  health?: 'ok' | 'down' | 'off';
  /** Administrative toggle state */
  enabled: boolean;
  /** ID of default AI agent assigned to respond on this channel */
  agentId: string;
  /** Default entry stage for new leads arriving via this channel */
  entryStage?: string;
  /** Real estate project associated with this channel line */
  project?: string;
  /** Account handle, phone number, or URL */
  handle: string;
  /** Total incoming messages processed */
  messagesCount: number;
  /** Total new leads originated */
  leadsCount?: number;
  /** Uptime reliability percentage */
  uptime: number;
  /** Average response latency string */
  avgResponse: string;
  /** Time elapsed since last successful sync */
  lastSync: string;
  /** Secure credentials or API tokens */
  credentials?: Record<string, string>;
  /** Whether out-of-office automated greeting is enabled */
  afterHoursReply?: boolean;
}

/** Real-time activity timeline event for dashboard feed */
export interface ActivityEvent {
  /** Unique activity event identifier */
  id: string;
  /** Event category */
  type: 'ai_adv' | 'won' | 'takeover' | 'lead';
  /** Name of AI agent involved, if applicable */
  agentName?: string;
  /** Name of human user involved, if applicable */
  userName?: string;
  /** Customer or lead name */
  clientName: string;
  /** Relative time display string */
  timeAgo: string;
  /** Minutes elapsed since event occurred */
  timeMinutes: number;
  /** Descriptive context or property title */
  details?: string;
}
