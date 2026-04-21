
"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const [hour, setHour] = React.useState<string>('');
  const [minute, setMinute] = React.useState<string>('');
  const [period, setPeriod] = React.useState<'AM' | 'PM' | ''>('');

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hour24 = parseInt(h, 10);
      const currentPeriod = hour24 >= 12 ? 'PM' : 'AM';
      let hour12 = hour24 % 12;
      if (hour12 === 0) hour12 = 12;

      setHour(hour12.toString().padStart(2, '0'));
      setMinute(m);
      setPeriod(currentPeriod);
    } else {
        setHour('');
        setMinute('');
        setPeriod('');
    }
  }, [value]);

  const handleTimeChange = (newHour: string, newMinute: string, newPeriod: string) => {
    if (!newHour || !newMinute || !newPeriod) return;

    let hour24 = parseInt(newHour, 10);
    if (newPeriod === 'PM' && hour24 < 12) {
      hour24 += 12;
    } else if (newPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    onChange(`${hour24.toString().padStart(2, '0')}:${newMinute}`);
  };

  const onHourChange = (newHour: string) => {
    setHour(newHour);
    if (minute && period) {
        handleTimeChange(newHour, minute, period);
    }
  }
  
  const onMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    if (hour && period) {
        handleTimeChange(hour, newMinute, period);
    }
  }

  const onPeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    if (hour && minute) {
        handleTimeChange(hour, minute, newPeriod);
    }
    setOpen(false);
  }

  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const displayTime = value && hour && minute && period
    ? `${hour}:${minute} ${period}`
    : "Select time";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex gap-2">
        <div className="flex flex-col space-y-2 p-4">
            <p className="text-sm font-medium">Time</p>
            <div className="flex items-center gap-2">
                <Select value={hour} onValueChange={onHourChange}>
                    <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                        {hours12.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                </Select>
                <span>:</span>
                <Select value={minute} onValueChange={onMinuteChange}>
                    <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                        {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={period} onValueChange={onPeriodChange as (value: string) => void}>
                    <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    