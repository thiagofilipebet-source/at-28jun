import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ value, onChange, options, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilter(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFilter(value);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-semibold text-white/60 block w-full mb-1">{label}</label>
      <div 
        className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5 cursor-pointer transition-all focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 focus-within:bg-indigo-500/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <input
          type="text"
          value={isOpen ? filter : value}
          onChange={(e) => {
            const newValue = e.target.value;
            setFilter(newValue);
            onChange(newValue);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
        />
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen ? "rotate-180" : "")} />
      </div>

      {isOpen && (
        <div className="absolute z-60 w-full mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt}
                className="px-4 py-2 text-sm text-white hover:bg-indigo-500/20 cursor-pointer"
                onClick={() => {
                  onChange(opt);
                  setFilter(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">Nenhum resultado</div>
          )}
        </div>
      )}
    </div>
  );
};
