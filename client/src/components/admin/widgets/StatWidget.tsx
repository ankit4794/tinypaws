import React from 'react';
import Widget, { WidgetProps } from './Widget';
import { LucideIcon } from 'lucide-react';

interface StatWidgetProps extends Omit<WidgetProps, 'children'> {
  value: number | string;
  description?: string;
  icon: React.ReactNode;
}

const StatWidget: React.FC<StatWidgetProps> = ({
  value,
  description,
  icon,
  ...rest
}) => {
  return (
    <Widget {...rest} icon={icon}>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Widget>
  );
};

export default StatWidget;