import { Decimal } from "@prisma/client/runtime/library";
import { CommissionType, Currency } from "@prisma/client";

export interface CommissionRuleInput {
  type: CommissionType;
  currency: Currency;
  amount?: number | null;
  percent?: number | null;
}

export interface ProjectFinancialInput {
  clientRatePerHour: number;
  payRatePerHour: number;
  hoursWorked: number;
  vendorFees?: number;
  commissionRules: CommissionRuleInput[];
}

export interface ProjectFinancials {
  markupPerHour: number;
  totalRevenue: number;
  consultantCost: number;
  totalCommissions: number;
  vendorFees: number;
  totalCost: number;
  netProfit: number;
  grossProfitPerHour: number;
}

function toNumber(value: Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : value.toNumber();
}

export function calculateCommissionAmount(
  rule: CommissionRuleInput,
  context: {
    markupPerHour: number;
    hoursWorked: number;
    monthsActive?: number;
  }
): number {
  const amount = rule.amount ?? 0;
  const percent = rule.percent ?? 0;

  switch (rule.type) {
    case "FLAT_ONE_TIME":
      return amount;
    case "MONTHLY":
      return amount * (context.monthsActive ?? 1);
    case "HOURLY":
      return amount * context.hoursWorked;
    case "PERCENT_MARKUP":
      return context.markupPerHour * context.hoursWorked * (percent / 100);
    default:
      return 0;
  }
}

export function calculateProjectFinancials(
  input: ProjectFinancialInput
): ProjectFinancials {
  const { clientRatePerHour, payRatePerHour, hoursWorked } = input;
  const vendorFees = input.vendorFees ?? 0;

  const markupPerHour = clientRatePerHour - payRatePerHour;
  const totalRevenue = clientRatePerHour * hoursWorked;
  const consultantCost = payRatePerHour * hoursWorked;

  const totalCommissions = input.commissionRules.reduce(
    (sum, rule) =>
      sum +
      calculateCommissionAmount(rule, {
        markupPerHour,
        hoursWorked,
      }),
    0
  );

  const totalCost = consultantCost + totalCommissions + vendorFees;
  const netProfit = totalRevenue - totalCost;
  const grossProfitPerHour =
    hoursWorked > 0
      ? (totalRevenue - consultantCost - totalCommissions) / hoursWorked
      : markupPerHour - totalCommissions / Math.max(hoursWorked, 1);

  return {
    markupPerHour,
    totalRevenue,
    consultantCost,
    totalCommissions,
    vendorFees,
    totalCost,
    netProfit,
    grossProfitPerHour,
  };
}

export { toNumber };
