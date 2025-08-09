type JudgesBarProps = {
  judges: string[];
  label: string;
};

export default function JudgesBar({ judges, label }: JudgesBarProps) {
  if (!judges.length) return null;
  return (
    <div className="text-sm text-slate-300 mt-2">
      {label}: {judges.join(', ')}
    </div>
  );
}
