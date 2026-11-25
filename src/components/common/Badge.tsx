import React from 'react';
import { useApp } from '../../context/AppContext';
import { DealStatus, ChatPriority } from '../../types';
import {
  Sparkle,
  Sparkles,
  BadgeCheck,
  FileText,
  Handshake,
  Trophy,
  CircleX,
  User,
  AlertCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

/** Configuration mapping deal statuses to visual styles and icons */
const DEAL_STATUS_CONFIG: Record<DealStatus, { badgeClass: string; icon: React.FC<{ className?: string }> }> = {
  new: { badgeClass: 'info', icon: Sparkle },
  qualified: { badgeClass: 'brand', icon: BadgeCheck },
  proposal: { badgeClass: 'gold', icon: FileText },
  negotiation: { badgeClass: 'warn', icon: Handshake },
  won: { badgeClass: 'ok', icon: Trophy },
  lost: { badgeClass: 'danger', icon: CircleX },
};

/**
 * Renders a pill badge representing the deal's current pipeline status.
 */
export const DealStatusBadge: React.FC<{ status: DealStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const { t } = useApp();
  const config = DEAL_STATUS_CONFIG[status] || DEAL_STATUS_CONFIG.new;
  const Icon = config.icon;

  return (
    <span className={`badge ${config.badgeClass} ${className}`.trim()}>
      <Icon className="w-3.5 h-3.5" />
      <span>{t('ds_' + status)}</span>
    </span>
  );
};

/**
 * Renders an AI autonomy badge indicating whether AI is actively replying or paused.
 */
export const AiBadge: React.FC<{ active: boolean; className?: string }> = ({
  active,
  className = '',
}) => {
  const { t } = useApp();

  return active ? (
    <span className={`badge ai ${className}`.trim()}>
      <Sparkles className="w-3.5 h-3.5" />
      <span>{t('ai_on')}</span>
    </span>
  ) : (
    <span className={`badge outline ${className}`.trim()}>
      <User className="w-3.5 h-3.5" />
      <span>{t('ai_off')}</span>
    </span>
  );
};

/** Configuration mapping priority levels to visual severity */
const PRIORITY_CONFIG: Record<ChatPriority, { badgeClass: string; icon: React.FC<{ className?: string }> }> = {
  low: { badgeClass: '', icon: Clock },
  normal: { badgeClass: '', icon: Clock },
  high: { badgeClass: 'warn', icon: AlertTriangle },
  urgent: { badgeClass: 'danger', icon: AlertCircle },
};

/**
 * Renders a priority indicator badge for customer tickets or chat threads.
 */
export const PriorityBadge: React.FC<{ priority: ChatPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const { t } = useApp();
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;
  const Icon = config.icon;

  return (
    <span className={`badge ${config.badgeClass} ${className}`.trim()}>
      <Icon className="w-3 h-3" />
      <span>{t('pr_' + priority)}</span>
    </span>
  );
};

export default DealStatusBadge;
