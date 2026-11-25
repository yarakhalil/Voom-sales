import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface KpiCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  delta?: number;
  footerText?: string;
  className?: string;
}

/**
 * Reusable KPI stat card with icon, title, formatted value, and trending badge.
 */
export const KpiCard: React.FC<KpiCardProps> = ({
  icon: Icon,
  title,
  value,
  delta,
  footerText,
  className = '',
}) => {
  const { pct } = useApp();
  const hasDelta = typeof delta === 'number';
  const isUp = (delta ?? 0) >= 0;

  return (
    <article className={`card kpi ${className}`}>
      <div className="k-top">
        <span className="k-ico">
          <Icon />
        </span>
        <span>{title}</span>
      </div>

      <div className="k-val num">{value}</div>

      {(hasDelta || footerText) && (
        <div className="k-foot">
          {hasDelta && (
            <span className={`delta ${isUp ? 'up' : 'down'}`}>
              {isUp ? <TrendingUp className="ico-sm" /> : <TrendingDown className="ico-sm" />}
              <span>{pct(Math.abs(delta!) / 100, 1)}</span>
            </span>
          )}
          {footerText && <span>{footerText}</span>}
        </div>
      )}
    </article>
  );
};

export default KpiCard;
