/**
 * useSubscription — Subscription management hook
 *
 * Provides:
 *   - Current subscription status/plan
 *   - Subscribe (create checkout session)
 *   - Cancel subscription
 *   - Switch plan
 *
 * Backend collections: subscriptions, payments
 * Backend endpoints: /api/payments/create-checkout, /api/payments/cancel-subscription
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "./useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  plan: "monthly" | "annual";
  status: "active" | "past_due" | "cancelled" | "expired" | "trial";
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  flutterwave_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  payment_gateway: "stripe" | "flutterwave" | null;
}

export interface PaymentRecord {
  id: string;
  payment_type: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  created_at: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapSubscription(doc: Record<string, any>): Subscription {
  return {
    id: doc.id,
    plan: doc.plan,
    status: doc.status,
    stripe_subscription_id: doc.stripeSubscriptionId ?? null,
    stripe_customer_id: doc.stripeCustomerId ?? null,
    flutterwave_subscription_id: doc.flutterwaveSubscriptionId ?? null,
    current_period_start: doc.currentPeriodStart ?? null,
    current_period_end: doc.currentPeriodEnd ?? null,
    cancelled_at: doc.cancelledAt ?? null,
    payment_gateway: doc.paymentGateway ?? null,
  };
}

function mapPayment(doc: Record<string, any>): PaymentRecord {
  return {
    id: doc.id,
    payment_type: doc.paymentType,
    amount: doc.amount,
    currency: doc.currency,
    gateway: doc.gateway,
    status: doc.status,
    created_at: doc.createdAt,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current active subscription
  const {
    data: subscription,
    isLoading: loading,
    refetch: refreshSubscription,
  } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const res = await api.find("subscriptions", {
        where: {
          and: [
            { user: { equals: user!.id } },
            { status: { in: ["active", "trial", "past_due"] } },
          ],
        },
        sort: "-createdAt",
        limit: 1,
      });
      if (res.docs.length === 0) return null;
      return mapSubscription(res.docs[0] as Record<string, any>);
    },
    enabled: !!user,
  });

  // Fetch payment history
  const { data: payments = [] } = useQuery({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      const res = await api.find("payments", {
        where: { user: { equals: user!.id } },
        sort: "-createdAt",
        limit: 50,
      });
      return (res.docs as Record<string, any>[]).map(mapPayment);
    },
    enabled: !!user,
  });

  // Subscribe — creates a checkout session and returns the URL
  const subscribeMutation = useMutation({
    mutationFn: async (params: {
      plan: "monthly" | "annual";
      gateway?: "stripe" | "flutterwave";
    }) => {
      return api.createCheckout({
        type: "subscription",
        plan: params.plan,
        gateway: params.gateway || "stripe",
      });
    },
  });

  const subscribe = useCallback(
    async (plan: "monthly" | "annual", gateway: "stripe" | "flutterwave" = "stripe") => {
      const result = await subscribeMutation.mutateAsync({ plan, gateway });
      // Redirect user to checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
      return result;
    },
    [subscribeMutation]
  );

  // Cancel subscription
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!subscription) throw new Error("No active subscription");
      return api.cancelSubscription(subscription.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  const cancel = useCallback(async () => {
    return cancelMutation.mutateAsync();
  }, [cancelMutation]);

  // Buy day pass
  const buyDayPass = useCallback(
    async (gateway: "stripe" | "flutterwave" = "stripe") => {
      const result = await api.createCheckout({
        type: "day_pass",
        gateway,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
      return result;
    },
    []
  );

  // Derived state
  const isActive = subscription?.status === "active" || subscription?.status === "trial";
  const isPastDue = subscription?.status === "past_due";
  const daysRemaining = subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / 86400000))
    : 0;

  return {
    subscription,
    payments,
    loading,
    isActive,
    isPastDue,
    daysRemaining,
    subscribe,
    cancel,
    buyDayPass,
    refreshSubscription,
    isSubscribing: subscribeMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
