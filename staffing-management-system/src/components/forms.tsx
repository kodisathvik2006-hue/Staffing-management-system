import { cn } from "@/lib/utils";

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const variants = {
    primary: "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 hover:-translate-y-0.5 border border-transparent dark:from-brand-500 dark:to-indigo-500",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow dark:bg-dark-card dark:border-dark-border dark:text-slate-200 dark:hover:bg-dark-border-hover dark:hover:text-white",
    danger: "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 border border-transparent dark:from-rose-500 dark:to-red-500",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-dark-card dark:hover:text-slate-200",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function Input({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-dark-border dark:bg-dark-card dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500 dark:focus:border-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-dark-border dark:bg-dark-card dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-500/20",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500 dark:focus:border-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  options,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-dark-border dark:bg-dark-card dark:text-white dark:focus:border-brand-500 dark:focus:ring-brand-500/20",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500 dark:focus:border-rose-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">{error}</p>}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-xl bg-rose-50/50 border border-rose-200/50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/50 dark:text-rose-400">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {message}
      </div>
    </div>
  );
}

export function FormCard({
  title,
  children,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      <h2 className="mb-6 text-xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">{title}</h2>
      <div className="space-y-4">{children}</div>
    </form>
  );
}
