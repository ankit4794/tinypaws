import React from 'react';
import Widget, { WidgetProps } from './Widget';

interface StatWidgetProps extends Omit<WidgetProps, 'children'> {
  value: number;
  description: string;
  prefix?: string;
  suffix?: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({
  value,
  description,
  prefix = '',
  suffix = '',
  ...rest
}) => {
  return (
    <Widget {...rest}>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}{suffix}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Widget>
  );
};

export default StatWidget;