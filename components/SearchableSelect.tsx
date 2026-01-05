import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ElementType;
  className?: string;
  emptyMessage?: string;
}

export const SearchableSelect: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = '-- Pilih --',
  disabled = false,
  icon: Icon,
  className = '',
  emptyMessage = 'Tidak ada data'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  if (disabled) {
    return (
      <div className={`relative w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 ${Icon ? 'pl-12' : ''} text-[12px] font-black text-gray-400 ${className}`}>
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />}
        <span className="truncate">{selectedOption?.label || placeholder}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-2xl px-5 py-4 ${Icon ? 'pl-12' : ''} text-[12px] font-black cursor-pointer flex items-center justify-between transition-all shadow-sm
          ${isOpen ? 'border-black ring-2 ring-black/5' : 'border-gray-200 hover:border-gray-300'}
          ${!selectedOption ? 'text-gray-400' : 'text-black'}
        `}
      >
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />}
        <span className="truncate flex-1 text-left">
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center gap-1 ml-2">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ketik untuk mencari..."
                className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-[12px] font-bold outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-3 cursor-pointer transition-all flex items-center justify-between group
                    ${option.value === value 
                      ? 'bg-black text-white' 
                      : 'hover:bg-gray-50 text-black'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-black truncate ${option.value === value ? 'text-white' : 'text-black'}`}>
                      {option.label}
                    </p>
                    {option.subLabel && (
                      <p className={`text-[10px] font-medium truncate mt-0.5 ${option.value === value ? 'text-white/70' : 'text-gray-400'}`}>
                        {option.subLabel}
                      </p>
                    )}
                  </div>
                  {option.value === value && (
                    <Check size={16} className="text-white shrink-0 ml-2" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{emptyMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
