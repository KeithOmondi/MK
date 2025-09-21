

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function Select({
  name,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
}: SelectProps) {
  return (
    <div className={`relative ${className || ""}`}>
      <select
        name={name}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        ▼
      </span>
    </div>
  );
}
