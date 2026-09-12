import { UpsurgeHome } from "@/components/public/upsurge-home";
import { getTranslations } from "next-intl/server";
import { getCurrentTenantId, getCurrentTenant } from "@/lib/supabase/tenant";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SchoolLandingPage } from "@/components/public/school-landing-page";
import type { Metadata } from "next";
import { buildPageMetadata, getRequestBaseUrl } from "@/lib/seo";
import { JsonLd, organizationJsonLd } from "@/lib/structured-data";
import { PuckPageRenderer } from "@/components/public/landing-page/puck-page-renderer";
import type { Data } from "@measured/puck";
import { getLandingData } from "@/lib/puck/utils/landing-data";

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return buildPageMetadata({ title: t('home.title'), description: t('defaultDescription'), path: '/', locale })
}

export default async function LandingPage() {
  // Branch to school landing page on subdomains
  const tenantId = await getCurrentTenantId()
  if (tenantId !== DEFAULT_TENANT_ID) {
    const [tenant, supabase, baseUrl] = await Promise.all([getCurrentTenant(), createClient(), getRequestBaseUrl()])
    if (tenant) {
      const orgStructuredData = organizationJsonLd({
        name: tenant.name,
        url: baseUrl,
        logo: tenant.logo_url,
      })
      // Custom landing pages are available on every plan (free is capped at one
      // page at creation time — see app/actions/admin/landing-pages.ts)
      const adminClient = createAdminClient()
      const { data: customPage } = await adminClient
        .from('landing_pages')
        .select('puck_data')
        .eq('tenant_id', tenantId)
        .eq('slug', 'home')
        .eq('is_published', true)
        .maybeSingle()
      if (customPage?.puck_data && typeof customPage.puck_data === 'object') {
        const landingData = await getLandingData(tenantId)
        return (
          <>
            <JsonLd data={orgStructuredData} />
            <PuckPageRenderer data={customPage.puck_data as unknown as Data} landingData={landingData} />
          </>
        )
      }

      // Fallback: default school landing page
      const { data: products } = await supabase
        .from('products')
        .select('product_id, name, description, price, currency, image')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(9)
      return (
        <>
          <JsonLd data={orgStructuredData} />
          <SchoolLandingPage tenant={tenant} products={products ?? []} />
        </>
      )
    }
  }

  return <UpsurgeHome />;
}
