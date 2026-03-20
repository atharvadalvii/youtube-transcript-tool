import PricingCard from "@/components/pricing-card";
import { createClient } from "../../../supabase/server";
import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans } = await supabase.functions.invoke(
    "supabase-functions-get-plans"
  );

  return (
    <div
      className="min-h-screen font-space"
      style={{ backgroundColor: "#0F1117", color: "#F0EDE6" }}
    >
      <nav
        className="border-b"
        style={{ backgroundColor: "#0A0C11", borderColor: "#2A2D35" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 flex items-center justify-center"
              style={{ backgroundColor: "#C8FF00" }}
            >
              <Terminal className="w-4 h-4" style={{ color: "#0F1117" }} />
            </div>
            <span
              className="text-base font-bold tracking-wider font-syne"
              style={{ color: "#F0EDE6" }}
            >
              BULK<span style={{ color: "#C8FF00" }}>SCRIPT</span>
            </span>
          </Link>
          <Link
            href={user ? "/dashboard" : "/sign-up"}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold tracking-wider"
            style={{ backgroundColor: "#C8FF00", color: "#0F1117" }}
          >
            {user ? "Open App" : "Get Started"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-16">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#C8FF00" }}>
            PRICING
          </p>
          <h1 className="font-syne font-bold text-4xl mb-4" style={{ color: "#F0EDE6" }}>
            Simple, honest pricing
          </h1>
          <p className="text-lg" style={{ color: "#8A8D95" }}>
            Choose the perfect plan for your extraction needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {plans && plans.length > 0 ? (
            plans.map((item: any) => (
              <PricingCard key={item.id} item={item} user={user} />
            ))
          ) : (
            [
              { name: "FREE", price: "0", features: ["5 videos/day", "TXT export only", "Single video only", "7-day history"], highlight: false },
              { name: "PRO", price: "19", features: ["Unlimited videos", "All export formats", "Playlist & channel", "Bulk ZIP download", "Global search", "Unlimited history"], highlight: true },
              { name: "TEAM", price: "49", features: ["Everything in Pro", "5 team seats", "API access", "Priority support"], highlight: false },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className="p-8 relative"
                style={{
                  border: "1px solid #2A2D35",
                  marginLeft: i > 0 ? "-1px" : "0",
                  backgroundColor: plan.highlight ? "#1A1D24" : "transparent",
                }}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: "#C8FF00" }} />
                )}
                <div className="text-xs tracking-widest uppercase mb-2" style={{ color: "#8A8D95" }}>{plan.name}</div>
                <div className="font-syne font-bold text-3xl mb-1" style={{ color: "#F0EDE6" }}>
                  ${plan.price}<span className="text-sm font-normal" style={{ color: "#8A8D95" }}>/mo</span>
                </div>
                <ul className="mt-6 mb-8 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#8A8D95" }}>
                      <span style={{ color: "#C8FF00" }}>→</span>{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={user ? "/dashboard" : "/sign-up"}
                  className="block w-full text-center py-3 text-sm font-bold tracking-wider hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: plan.highlight ? "#C8FF00" : "transparent",
                    color: plan.highlight ? "#0F1117" : "#C8FF00",
                    border: plan.highlight ? "none" : "1px solid #C8FF00",
                  }}
                >
                  GET STARTED
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}