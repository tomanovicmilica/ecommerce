interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export default function RadioButtonGroup({ options, selectedValue, onChange }: Props) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="radio-group"
            value={opt.value}
            checked={selectedValue === opt.value}
            onChange={() => onChange(opt.value)}
            className="text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}