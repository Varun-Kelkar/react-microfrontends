import React from 'react';

export interface BadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'primary' | 'danger';
}

const Badge: React.FC<BadgeProps> = ({
  count,
  maxCount = 99,
  variant = 'danger',
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : String(count);
  const colorClass =
    variant === 'danger' ? 'bg-danger-500' : 'bg-primary-600';

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white
        rounded-full ${colorClass}
      `}
    >
      {displayCount}
    </span>
  );
};

export default Badge;
