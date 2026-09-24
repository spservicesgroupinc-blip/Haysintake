import React, { useState } from 'react';
import { 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  ShieldAlert,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { CalculatedMilestones } from '../types';

interface MilestoneWidgetProps {
  milestones: CalculatedMilestones;
  carrierCheckSent: string;
  hasDeductiblePlan?: boolean;
}

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
};

export const MilestoneWidget: React.FC<MilestoneWidgetProps> = ({
  milestones,
  carrierCheckSent,
  hasDeductiblePlan,
}) => {
  const [copied, setCopied] = useState(false);

  const {
    totalContractRcv,
    downPayment50,
    midPoint25,
    completion25,
    deductibleAmount,
    insurancePortion,
    isDeductibleCollected,
  } = milestones;

  const copyBreakdown = () => {
    const text = `HAYS + SONS - CONTRACT MILESTONE SCHEDULE
Job RCV: ${formatCurrency(totalContractRcv)}
Deductible: ${formatCurrency(deductibleAmount)} (Collected: ${isDeductibleCollected ? 'YES' : 'NO - Plan Required'})
Insurance Portion: ${formatCurrency(insurancePortion)}
Carrier Check Status: ${carrierCheckSent}
----------------------------------------
• 50% Down Payment (Start of Work): ${formatCurrency(downPayment50)}
• 25% Progress Draw (Mid-Point): ${formatCurrency(midPoint25)}
• 25% Final Draw (Substantial Completion): ${formatCurrency(completion25)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <aside className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top red header brand stripe */}
      <div className="bg-[#111827] text-white px-5 py-4 border-t-4 border-[#D32F2F] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D32F2F]/20 flex items-center justify-center text-[#D32F2F]">
            <TrendingUp className="w-4 h-4 text-[#D32F2F]" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase">
              Financial Milestones
            </h3>
            <p className="text-[11px] text-slate-400">
              Live Contract & Payment Calculations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyBreakdown}
          title="Copy milestone breakdown to clipboard"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Total Contract Hero */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Contract RCV
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#111827] font-mono tabular-nums tracking-tight mt-0.5">
            {formatCurrency(totalContractRcv)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
            <span>Insurance Portion:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              {formatCurrency(insurancePortion)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
            <span>Customer Deductible:</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              {formatCurrency(deductibleAmount)}
            </span>
          </div>
        </div>

        {/* Visual Milestone Distribution Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Milestone Allocation</span>
            <span className="text-slate-400 text-[11px] font-normal">50% · 25% · 25%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-md overflow-hidden flex shadow-inner">
            <div 
              style={{ width: '50%' }} 
              className="bg-[#D32F2F] transition-all duration-300 relative group"
              title="50% Mobilization Down Payment"
            />
            <div 
              style={{ width: '25%' }} 
              className="bg-amber-500 transition-all duration-300 relative group"
              title="25% Mid-Point Progress Draw"
            />
            <div 
              style={{ width: '25%' }} 
              className="bg-emerald-600 transition-all duration-300 relative group"
              title="25% Final Completion Balance"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1.5 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D32F2F]"></span>
              <span>50% Down</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>25% Mid</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>25% Final</span>
            </div>
          </div>
        </div>

        {/* Detailed Milestone Rows */}
        <div className="space-y-2.5 pt-1">
          {/* 50% Mobilization */}
          <div className="p-3 rounded-lg border border-red-100 bg-red-50/40 flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-[#D32F2F] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="text-xs font-bold text-slate-900">
                  50% Down Payment
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Required prior to starting restoration work
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#D32F2F] font-mono tabular-nums">
                {formatCurrency(downPayment50)}
              </span>
            </div>
          </div>

          {/* 25% Mid-point */}
          <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/30 flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="text-xs font-bold text-slate-900">
                  25% Mid-Point Payment
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Due at mechanicals / dry-in milestone
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">
                {formatCurrency(midPoint25)}
              </span>
            </div>
          </div>

          {/* 25% Completion */}
          <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-xs font-bold text-slate-900">
                  25% Completion Balance
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6.5">
                Due upon substantial completion walk
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-800 font-mono tabular-nums">
                {formatCurrency(completion25)}
              </span>
            </div>
          </div>
        </div>

        {/* Deductible & Carrier Check Status Checks */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              Deductible Collected:
            </span>
            {isDeductibleCollected ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Yes ({formatCurrency(deductibleAmount)})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#D32F2F] font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-[#D32F2F]" />
                No {hasDeductiblePlan ? '(Plan Documented)' : '(Pending Plan)'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Carrier Check:
            </span>
            <span className="font-semibold text-slate-800">
              {carrierCheckSent || 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Trust Guarantee */}
      <div className="mt-auto bg-slate-50 border-t border-slate-200 px-5 py-3 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Standard SRA Terms</span>
        <span className="font-medium text-slate-700">50 / 25 / 25 Schedule</span>
      </div>
    </aside>
  );
};

export default MilestoneWidget;
