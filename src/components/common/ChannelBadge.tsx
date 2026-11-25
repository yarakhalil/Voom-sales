import React from 'react';
import { Channel } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  Camera,
  Send,
  MessagesSquare,
  Phone,
  Box,
  Mail,
  Gamepad2,
} from 'lucide-react';

export interface ChannelBadgeProps {
  /** Channel protocol identifier (e.g. 'whatsapp', 'instagram', 'phone') */
  channel: Channel;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom CSS class */
  className?: string;
  /** Whether to append the localized channel name beside the icon */
  showLabel?: boolean;
}

/** Mapping of channel protocols to their corresponding Lucide icon components */
const CHANNEL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  telegram: Send,
  messenger: MessagesSquare,
  phone: Phone,
  tour: Box,
  email: Mail,
  discord: Gamepad2,
  gmail: Mail,
  outlook: Mail,
};

/**
 * Renders a colored channel icon badge (e.g. WhatsApp green, Telegram blue, Instagram pink)
 * matching the authentic design tokens of each messaging platform.
 */
export const ChannelBadge: React.FC<ChannelBadgeProps> = ({
  channel,
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const { t } = useApp();
  const Icon = CHANNEL_ICONS[channel] || MessageCircle;
  const label = t('ch_' + channel);
  const sizeClass = size === 'lg' ? 'lg' : '';

  const badgeElement = (
    <span
      className={`ch ch-${channel} ${sizeClass} ${className}`.trim()}
      title={label}
      aria-label={label}
    >
      <Icon />
    </span>
  );

  if (showLabel) {
    return (
      <span className="row" style={{ gap: '6px', alignItems: 'center' }}>
        {badgeElement}
        <span>{label}</span>
      </span>
    );
  }

  return badgeElement;
};

export default ChannelBadge;
