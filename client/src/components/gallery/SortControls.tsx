import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortControlsProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortControls = ({ value, onChange }: SortControlsProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date_desc">Newest First</SelectItem>
        <SelectItem value="date_asc">Oldest First</SelectItem>
        <SelectItem value="name_asc">Name A-Z</SelectItem>
        <SelectItem value="name_desc">Name Z-A</SelectItem>
        <SelectItem value="views_desc">Most Viewed</SelectItem>
        <SelectItem value="size_desc">Largest First</SelectItem>
      </SelectContent>
    </Select>
  );
};