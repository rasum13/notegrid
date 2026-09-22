export function Tag({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] px-3 py-1 rounded-full border transition-colors ${
        active
          ? "bg-accent-50 border-accent-100 text-accent-700 font-medium"
          : "border-line text-muted hover:border-faint"
      }`}
    >
      {children}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 max-w-[340px]">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-[13.5px] rounded-md border border-line bg-surface focus:border-accent-400 outline-none placeholder:text-faint"
      />
    </div>
  );
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-accent-600 text-white text-[13.5px] font-medium hover:bg-accent-700 transition-colors whitespace-nowrap"
    >
      {children}
    </button>
  );
}
