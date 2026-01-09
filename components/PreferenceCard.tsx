
import React from 'react';

interface PreferenceCardProps {
  label: string;
  options: string[];
  selected: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
}

const PreferenceCard: React.FC<PreferenceCardProps> = ({ label, options, selected, onChange, multiple = false }) => {
  const isSelected = (option: string) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(option);
    }
    return selected === option;
  };

  const handleClick = (option: string) => {
    if (multiple && Array.isArray(selected)) {
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    } else {
      onChange(option);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{label}</h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleClick(option)}
            className={`px-3 py-2 rounded-xl border transition-all duration-200 text-xs font-bold ${
              isSelected(option)
                ? 'bg-blue-700 border-blue-700 text-white shadow-md shadow-blue-100 scale-[1.02]'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PreferenceCard;
