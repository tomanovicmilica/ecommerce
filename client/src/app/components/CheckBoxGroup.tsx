type Option = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
};

export default function CheckBoxGroup({ label, options, selectedValues, onChange }: Props) {
  const toggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{label}</h3>
      <div className="flex flex-col space-y-2">
        {options.map(opt => (
          <label key={opt.value} className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedValues.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}