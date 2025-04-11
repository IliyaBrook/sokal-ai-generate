"use client";

import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerInputProps {
  selected: Date | undefined;
  onChange: (date: Date | null) => void;
  dateFormat?: string;
  minDate?: Date;
  placeholderText?: string;
  className?: string;
  wrapperClassName?: string;
  showPopperArrow?: boolean;
  todayButton?: string;
  highlightDates?: Date[];
}

export const DatePickerInput = ({
  selected,
  onChange,
  dateFormat = "MMMM d, yyyy",
  minDate = new Date(),
  placeholderText = "Select a date",
  className = "w-full border rounded p-2 pl-10",
  wrapperClassName = "w-full",
  showPopperArrow = false,
  todayButton = "Today",
  highlightDates = [new Date()],
}: DatePickerInputProps) => {
  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        minDate={minDate}
        placeholderText={placeholderText}
        className={className}
        wrapperClassName={wrapperClassName}
        showPopperArrow={showPopperArrow}
        todayButton={todayButton}
        highlightDates={highlightDates}
      />
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
    </div>
  );
}; 