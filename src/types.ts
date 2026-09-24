export type LossType = 
  | 'Water'
  | 'Fire/Smoke'
  | 'Storm/Wind'
  | 'Mold'
  | 'Impact'
  | 'Other';

export type CarrierCheckStatus = 'Yes' | 'No' | 'Pending' | 'N/A';

export interface IntakeFormData {
  // Section 1: Job & Customer Profile
  jobNumber: string;
  customerName: string;
  lossAddress: string;
  mailingAddress: string;
  phone: string;
  altPhone: string;
  customerEmail: string;

  // Section 2: Insurance & Adjuster Info
  insuranceCarrier: string;
  claimNumber: string;
  policyNumber: string;
  adjusterName: string;
  adjusterPhone: string;
  adjusterEmail: string;
  brokerInfo: string;

  // Section 3: Financials & Auto-Calculations
  contractAmount: number | '';
  deductibleAmount: number | '';
  deductibleCollected: 'Yes' | 'No';
  deductiblePlan: string;
  carrierCheckSent: CarrierCheckStatus;

  // Section 4: Team Assignment & Loss Parameters
  estimator: string;
  supervisor: string;
  projectManager: string;
  lossType: LossType;
  dateOfLoss: string;
  lossNarrative: string;
  templateDocId?: string;
}

export interface CalculatedMilestones {
  totalContractRcv: number;
  downPayment50: number;
  midPoint25: number;
  completion25: number;
  deductibleAmount: number;
  insurancePortion: number;
  isDeductibleCollected: boolean;
}

export interface ApiResponseFiles {
  templateFilledUrl?: string;
  sraUrl?: string;
  mortgageAuthUrl?: string;
  productionChecklistUrl?: string;
  welcomeLetterUrl?: string;
  [key: string]: string | undefined;
}

export interface ApiResponseData {
  success: boolean;
  folderUrl?: string;
  folderId?: string;
  customerName?: string;
  jobNumber?: string;
  templateDocId?: string;
  templateDocName?: string;
  files?: ApiResponseFiles;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface MergeTagItem {
  tag: string;
  label: string;
  category: 'Customer' | 'Insurance' | 'Financials' | 'Loss & Scope' | 'Team & Office' | 'System';
  sampleValue: string;
  description: string;
}

export type ChangeOrderType = 'Addition' | 'Deduction';

export interface ChangeOrderLineItem {
  id: string;
  description: string;
  amount: number | '';
}

export interface ChangeOrderData {
  id: string;
  changeOrderNumber: number;
  date: string;
  
  // Customer & Job Info (auto-filled)
  jobNumber: string;
  customerName: string;
  lossAddress: string;
  phone: string;
  customerEmail: string;
  insuranceCarrier: string;
  claimNumber: string;
  policyNumber: string;
  estimator: string;
  supervisor: string;
  originalContractAmount: number;
  priorChangesTotal: number;
  
  // User Input Fields
  changeType: ChangeOrderType;
  changeAmount: number | '';
  details: string;
  category: string;
  paymentTerms: string;
  scheduleImpactDays: number;
  lineItems: ChangeOrderLineItem[];
  
  // Status & Generated artifacts
  status: 'Draft' | 'Submitted' | 'Approved';
  folderUrl?: string;
  changeOrderDocUrl?: string;
  createdAt: string;
}

