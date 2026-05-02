import Link from 'next/link';

export default function MarketplaceNav() {
  return (
    <header
      className="flex items-center justify-between px-5 sm:px-10 h-14 border-b sticky top-0 z-10"
      style={{ backgroundColor: '#18191a', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <Link href="/marketplace">
        <img src="/Aorthar Logo long complete.svg" alt="Aorthar" width={99} height={43} />
      </Link>
      <Link
        href="/"
        className="text-[13px] font-medium transition-colors"
        style={{ color: '#b1b1b1' }}
      >
        aorthar.com →
      </Link>
    </header>
  );
}
