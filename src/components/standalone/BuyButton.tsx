'use client';

import { useRouter } from 'next/navigation';

interface Props {
  slug: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  couponCode?: string;
}

export default function BuyButton({ slug, label, className, style, couponCode }: Props) {
  const router = useRouter();

  function handleBuy() {
    const checkoutPath = `/courses-app/checkout/${slug}`;
    router.push(couponCode ? `${checkoutPath}?coupon=${encodeURIComponent(couponCode)}` : checkoutPath);
  }

  return (
    <button onClick={handleBuy} className={className} style={style}>
      {label}
    </button>
  );
}
