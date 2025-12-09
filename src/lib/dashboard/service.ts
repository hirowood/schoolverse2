import { mockDashboardSummary } from "@/lib/dashboard/mock-data";
import { DashboardSummary } from "@/lib/dashboard/types";

// TODO: Prisma連携時に差し替え
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return mockDashboardSummary;
}
