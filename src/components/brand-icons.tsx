// Simple brand marks for gift-card boxes.
export function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Google Play">
      <path fill="#00C3FF" d="M7 4.5 26.5 24 7 43.5c-.6-.4-1-1.1-1-2V6.5c0-.9.4-1.6 1-2Z" />
      <path fill="#FFCE00" d="m33 30.5-6.5-6.5 6.5-6.5 7.4 4.2c1.6.9 1.6 3.3 0 4.2L33 30.5Z" />
      <path fill="#00F076" d="M26.5 24 7 4.5c.6-.4 1.5-.5 2.3 0L33 17.5 26.5 24Z" />
      <path fill="#F43249" d="M26.5 24 33 30.5 9.3 43.5c-.8.5-1.7.4-2.3 0L26.5 24Z" />
    </svg>
  );
}

export function AmazonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Amazon">
      <rect width="48" height="48" rx="10" fill="#232F3E" />
      <text x="24" y="27" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="20" fill="#fff">a</text>
      <path d="M11 32c7 4.5 19 4.5 26 0" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="m33 29.5 4.5 2.5-2 4.5" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
