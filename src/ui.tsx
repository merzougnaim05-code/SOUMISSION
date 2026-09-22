import type {ReactNode} from 'react';

export function Section({title, children, actions}: {title: string; children: ReactNode; actions?: ReactNode}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function Field({label, children, wide}: {label: string; children: ReactNode; wide?: boolean}) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label className="app-label">{label}</label>
      {children}
    </div>
  );
}

export function Grid({children, cols = 3}: {children: ReactNode; cols?: 2 | 3 | 4}) {
  const c = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  return <div className={`grid grid-cols-1 gap-4 ${c}`}>{children}</div>;
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  small?: boolean;
}) {
  const base =
    variant === 'primary'
      ? 'bg-teal-700 hover:bg-teal-800 text-white'
      : variant === 'danger'
        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200';
  return (
    <button
      onClick={onClick}
      className={`${base} ${small ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-semibold transition inline-flex items-center gap-1.5`}
    >
      {children}
    </button>
  );
}

export function NumInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      className={`app-input ${className}`}
      value={Number.isFinite(value) ? value : 0}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      dir="ltr"
      style={{textAlign: 'center'}}
    />
  );
}
