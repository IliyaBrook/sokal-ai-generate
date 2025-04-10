declare module 'react-day-picker' {
  import * as React from 'react';

  export interface CustomComponents {
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
  }

  export interface DayPickerProps {
    className?: string;
    classNames?: Record<string, string>;
    components?: Partial<CustomComponents>;
    showOutsideDays?: boolean;
    mode?: 'single' | 'multiple' | 'range';
    selected?: Date | Date[] | { from: Date; to: Date };
    onSelect?: (date: Date | undefined) => void;
    disabled?: (date: Date) => boolean;
    initialFocus?: boolean;
  }

  export interface DayPickerComponentProps extends DayPickerProps {
    [key: string]: any;
  }

  export const DayPicker: React.FC<DayPickerComponentProps>;
} 