export function Card({ children, className = "", ticket = false }) {
  const base = ticket
    ? "ticket-edge pt-3 bg-crema-50 border-crema-200 shadow-[0_1px_0_rgba(0,0,0,0.04)] text-espresso-900"
    : "bg-crema-50 border-crema-200 text-espresso-900";
  return (
    <div className={`rounded-xl border overflow-hidden ${base} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-black/8 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold font-display ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}
