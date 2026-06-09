type Option = { value: string; label: string };

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

const selectClass =
  'focus-ring w-full rounded-xl border border-theme bg-(--input) px-3 py-2 text-sm text-foreground';

export function StatusSelect({ id, value, onChange, options }: Props) {
  return (
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
