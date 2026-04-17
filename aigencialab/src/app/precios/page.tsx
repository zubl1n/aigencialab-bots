import type { Metadata } from 'next';
import { getUSDtoCLP } from '@/lib/fx-rates';
import { PLANS } from '@/config/plans';
import { MainLayout } from '@/components/landing/MainLayout';
import PricingPageClient from './PricingPageClient';

export const metadata: Metadata = {
  title: 'Planes y Precios — AIgenciaLab · Agentes IA para Empresas',
  description:
    'Elige el plan de IA conversacional para tu empresa. Basic desde $45.000 CLP/mes. Starter, Pro y Enterprise disponibles. Implementación guiada incluida.',
  alternates: { canonical: 'https://aigencialab.cl/precios' },
};

export default async function PreciosPage() {
  const usdRate = await getUSDtoCLP();
  const plans = Object.values(PLANS);
  return (
    <MainLayout>
      <PricingPageClient plans={plans} usdRate={usdRate} />
    </MainLayout>
  );
}
