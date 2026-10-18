import "flag-icons/css/flag-icons.min.css";

// Real flag pictures (bundled SVGs) — emoji flags don't render on every phone.
export function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`fi fi-${code.toLowerCase()} overflow-hidden rounded-[3px] align-middle ${className}`}
    />
  );
}
