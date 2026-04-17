"use client";

import { User } from "@supabase/supabase-js";
import { AUTH_DISABLED } from "@/lib/auth-config";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { supabase } from "../../supabase/supabase";

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      if (AUTH_DISABLED) {
        return;
      }
      window.location.href = "/sign-in?next=/pricing";
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <Card
      className={`w-full max-w-[350px] relative overflow-hidden rounded-2xl border transition-shadow ${
        item.popular
          ? "border-gray-900 dark:border-zinc-100 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10"
          : "border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
      }`}
    >
      {item.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-white to-gray-100/50 dark:from-zinc-800/30 dark:via-zinc-900 dark:to-zinc-800/20 pointer-events-none" />
      )}
      <CardHeader className="relative">
        {item.popular && (
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-white bg-blue-500 rounded-full w-fit mb-4 uppercase">
            Most popular
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl font-bold tabular-nums text-gray-900 dark:text-zinc-50">
            ${item?.amount / 100}
          </span>
          <span className="text-gray-500 dark:text-zinc-400">
            /{item?.interval}
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="relative">
        <Button
          onClick={async () => {
            await handleCheckout(item.id);
          }}
          className="w-full py-6 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Get started
        </Button>
      </CardFooter>
    </Card>
  );
}
