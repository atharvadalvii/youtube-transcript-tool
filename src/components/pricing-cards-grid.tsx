import Link from "next/link";

export type PricingPlanVM = {
  id: string;
  name: string;
  price: string;
  interval: string;
  desc: string;
  highlight: boolean;
};

function normalizePlans(plans: unknown): PricingPlanVM[] {
  const list = Array.isArray(plans) ? plans : null;
  if (!list?.length) {
    return [
      {
        id: "free",
        name: "Free",
        price: "0",
        interval: "mo",
        desc: "5 videos/day · Basic export formats",
        highlight: false,
      },
      {
        id: "pro",
        name: "Pro",
        price: "19",
        interval: "mo",
        desc: "Unlimited videos · All formats · Bulk ZIP",
        highlight: true,
      },
      {
        id: "team",
        name: "Team",
        price: "49",
        interval: "mo",
        desc: "Everything in Pro · Team workspace · API",
        highlight: false,
      },
    ];
  }
  return list.map((p: any, i: number) => ({
    id: String(p.id ?? p.product_id ?? `api-${i}`),
    name: p.name ?? `Plan ${i + 1}`,
    price: (p.amount / 100).toFixed(0),
    interval: p.interval || "mo",
    desc: p.description || "",
    highlight: i === 1,
  }));
}

export function PricingCardsGrid({
  plans,
  appUnlocked,
}: {
  plans: unknown;
  appUnlocked: boolean;
}) {
  const list = normalizePlans(plans);

  return (
    <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 items-stretch max-w-4xl mx-auto">
      {list.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col h-full rounded-2xl p-6 sm:p-7 border transition-shadow ${
            plan.highlight
              ? "bg-black dark:bg-zinc-100 border-black dark:border-zinc-100 text-white dark:text-zinc-950 shadow-xl shadow-black/10 dark:shadow-zinc-900/20"
              : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-gray-200/80 dark:hover:border-zinc-700"
          }`}
        >
          {plan.highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
              Most popular
            </div>
          )}
          <div
            className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
              plan.highlight
                ? "text-gray-400 dark:text-zinc-600"
                : "text-gray-400 dark:text-zinc-500"
            }`}
          >
            {plan.name}
          </div>
          <div
            className={`text-4xl font-bold tracking-tight tabular-nums mb-1 ${
              plan.highlight
                ? "text-white dark:text-zinc-950"
                : "text-gray-900 dark:text-zinc-50"
            }`}
          >
            ${plan.price}
            <span
              className={`text-base font-normal ml-1 ${
                plan.highlight
                  ? "text-gray-400 dark:text-zinc-500"
                  : "text-gray-400 dark:text-zinc-500"
              }`}
            >
              /{plan.interval}
            </span>
          </div>
          <p
            className={`text-sm mt-3 mb-6 sm:mb-8 leading-relaxed flex-1 ${
              plan.highlight
                ? "text-gray-400 dark:text-zinc-600"
                : "text-gray-500 dark:text-zinc-400"
            }`}
          >
            {plan.desc}
          </p>
          <Link
            href={appUnlocked ? "/dashboard" : "/sign-up"}
            className={`mt-auto block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
              plan.highlight
                ? "bg-white dark:bg-zinc-950 text-black dark:text-zinc-50 hover:bg-gray-100 dark:hover:bg-zinc-800"
                : "bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-gray-700 dark:hover:bg-white"
            }`}
          >
            Get started
          </Link>
        </div>
      ))}
    </div>
  );
}
