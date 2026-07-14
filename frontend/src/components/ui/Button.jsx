export function Button({ children, className = "", variant = "primary", ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary-600 text-crema-50 hover:bg-primary-700 focus-visible:ring-primary-500",
    secondary: "bg-transparent text-current border border-current/20 hover:bg-current/5 focus-visible:ring-primary-500",
    danger: "bg-cherry-600 text-crema-50 hover:bg-cherry-500 focus-visible:ring-cherry-500",
    ghost: "bg-transparent text-current hover:bg-current/8 focus-visible:ring-primary-500",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
