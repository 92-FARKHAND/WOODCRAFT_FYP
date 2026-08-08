import React from 'react';

const StatCard = ({ title, value, icon, description, trend, trendValue, color = "primary" }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', text: 'text-emerald-500' },
    indigo: { bg: 'bg-indigo-500', bgLight: 'bg-indigo-500/10', text: 'text-indigo-500' },
    blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', text: 'text-blue-500' },
    rose: { bg: 'bg-rose-500', bgLight: 'bg-rose-500/10', text: 'text-rose-500' },
    primary: { bg: 'bg-primary', bgLight: 'bg-primary/10', text: 'text-primary' },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      {/* Decorative background gradient */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 ${colors.bg}`} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight">{value}</h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-[10px] text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colors.bgLight} ${colors.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
