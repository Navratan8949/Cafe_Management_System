import React, { forwardRef } from "react";

export const Input = forwardRef(({ label, id, error, className = "", ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-current/60 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`block w-full rounded-md border px-3 py-2.5 text-sm transition-colors bg-crema-50 text-espresso-900 placeholder:text-espresso-900/35 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? "border-cherry-500 text-cherry-600" : "border-espresso-900/15"}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-cherry-600">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
