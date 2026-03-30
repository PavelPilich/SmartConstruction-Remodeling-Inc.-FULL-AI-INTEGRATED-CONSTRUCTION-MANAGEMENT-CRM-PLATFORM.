import type { LucideIcon } from "lucide-react";

export type { PositionType, Registrant, RegistrantDoc, RegistrantStatus } from "./registration";
export { DOC_STATUS_COLORS, REGISTRANT_STATUS_COLORS, REGISTRANT_STATUS_LABELS } from "./registration";

export type LineItem = {
  code: string;
  desc: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
};

export type EstimateStatus = "draft" | "pending" | "approved" | "submitted";

export type Estimate = {
  id: string;
  project: string;
  customer: string;
  address: string;
  insurance: {
    company: string;
    claim: string;
    adjuster: string;
    adjPhone: string;
    deductible: number;
  };
  status: EstimateStatus;
  dateCreated: string;
  dateApproved: string | null;
  totalRCV: number;
  totalACV: number;
  depreciation: number;
  supplement: boolean;
  version: number;
  lines: LineItem[];
};

export type XactCategoryCode = "RFG" | "SDG" | "WDW" | "GTR" | "INT" | "PNT" | "DRY" | "PLM" | "ELC" | "GEN";

export type XactCategory = {
  code: XactCategoryCode;
  name: string;
  color: string;
};

export type PriceItem = {
  code: string;
  desc: string;
  unit: string;
  price: number;
  cat: XactCategoryCode;
};

export type SupplementStatus = "approved" | "submitted" | "pending" | "denied";

export type Supplement = {
  id: string;
  estimate: string;
  date: string;
  reason: string;
  addedItems: number;
  addedAmount: number;
  status: SupplementStatus;
};

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  section?: string;
};
