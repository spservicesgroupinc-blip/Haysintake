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
  files?: ApiResponseFiles;
  message?: string;
  error?: string;
  timestamp?: string;
}
