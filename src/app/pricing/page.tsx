import PricingCard from "@/components/pricing-card";
import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingCardsGrid } from "@/components/pricing-cards-grid";
import { createClient } from "../../../supabase/server";
import { AUTH_DISABLED } from "@/lib/auth-config";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUnlocked = AUTH_DISABLED || !!user;

  const { data: plans } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  const hasRemotePlans = Array.isArray(plans) && plans.length > 0;

  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader appUnlocked={appUnlocked} variant="minimal" />

      <main className={`${SITE_SHELL} pt-28 sm:pt-32 pb-16 sm:pb-24`}>
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">
            Pricing
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            Simple, honest pricing
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-3 text-base leading-relaxed">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {hasRemotePlans ? (
          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {(plans as any[]).map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))}
          </div>
        ) : (
          <PricingCardsGrid plans={plans} appUnlocked={appUnlocked} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
