import { prisma } from "@/lib/prisma";
import PlanClient from "./PlanClient";

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  const plans = await prisma.pricingPlan.findMany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Subscription Plans</h1>
        <p className="text-gray-400 mt-2">Manage pricing, credits logic, and feature sets visible on the frontend.</p>
      </div>

      <PlanClient initialPlans={plans} />
    </div>
  );
}
