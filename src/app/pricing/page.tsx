import { redirect } from 'next/navigation';

// 301 redirect /pricing → /precios (canonical Spanish URL)
export default function PricingRedirect() {
  redirect('/precios');
}
