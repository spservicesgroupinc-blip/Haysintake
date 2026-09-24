import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Shield, 
  DollarSign, 
  Calendar,
  Building2
} from 'lucide-react';
import { IntakeFormData, CalculatedMilestones } from '../types';
import { formatCurrency } from './MilestoneWidget';
import HaysSonsLogo from './HaysSonsLogo';

interface JobSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IntakeFormData;
  milestones: CalculatedMilestones;
  onCreateChangeOrder?: () => void;
}

export const JobSummaryModal: React.FC<JobSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  milestones,
  onCreateChangeOrder,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden print:border-none print:shadow-none print:max-w-none">
        {/* Header - Not printed controls */}
        <div className="bg-slate-900 text-white px-6 py-4 border-t-4 border-[#D32F2F] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D32F2F]" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Executive Job Intake Summary
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            {onCreateChangeOrder && (
              <button
                type="button"
                onClick={onCreateChangeOrder}
                className="px-3 py-1.5 text-xs font-bold bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Open Change Order page with this customer's details"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Create Change Order</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="p-8 space-y-6 text-slate-800 text-sm">
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-[#D32F2F] pb-4 gap-4">
            <HaysSonsLogo size="lg" />
            <div className="text-right text-xs space-y-0.5">
              <div className="font-bold text-slate-900 text-sm">Ryan Russell · Estimator</div>
              <div className="text-slate-600 font-mono text-[11px]">rrussell@haysandsons.com</div>
              <div className="text-slate-500 text-[11px]">909 Production Rd., Fort Wayne, IN 46808</div>
              <div className="text-slate-500 text-[11px]">Office 260.471.9110 | Cell 260.210.0415</div>
              <div className="font-bold text-[#D32F2F] text-[11px]">haysandsons.com</div>
              <div className="pt-2 text-slate-400 font-mono text-[11px]">
                Job #: <span className="font-bold text-slate-900">{data.jobNumber || 'PENDING'}</span> | Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Grid of Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Location */}
            <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Customer & Loss Location
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Customer Name: </span>
                  <span className="font-semibold text-slate-900">{data.customerName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Loss Address: </span>
                  <span className="font-semibold text-slate-900">{data.lossAddress || '—'}</span>
                </div>
                {data.mailingAddress && (
                  <div>
                    <span className="text-slate-400">Mailing Address: </span>
                    <span className="text-slate-700">{data.mailingAddress}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Phone: </span>
                  <span className="font-medium text-slate-900">{data.phone || '—'}</span>
                  {data.altPhone && <span className="text-slate-500"> / {data.altPhone}</span>}
                </div>
                <div>
                  <span className="text-slate-400">Email: </span>
                  <span className="font-medium text-slate-900">{data.customerEmail || '—'}</span>
                </div>
              </div>
            </div>

            {/* Insurance & Claim */}
            <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Insurance & Adjuster Details
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Insurance Carrier: </span>
                  <span className="font-semibold text-slate-900">{data.insuranceCarrier || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Claim #: </span>
                  <span className="font-medium font-mono text-slate-900">{data.claimNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Policy #: </span>
                  <span className="font-medium font-mono text-slate-900">{data.policyNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Adjuster: </span>
                  <span className="font-medium text-slate-900">{data.adjusterName || '—'}</span>
                  {data.adjusterPhone && <span className="text-slate-500"> ({data.adjusterPhone})</span>}
                </div>
                {data.adjusterEmail && (
                  <div>
                    <span className="text-slate-400">Adjuster Email: </span>
                    <span className="text-slate-700">{data.adjusterEmail}</span>
                  </div>
                )}
                {data.brokerInfo && (
                  <div>
                    <span className="text-slate-400">Broker / Agency: </span>
                    <span className="text-slate-700">{data.brokerInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D32F2F] flex items-center gap-1.5 mb-3">
              <DollarSign className="w-3.5 h-3.5" />
              Contract Financials & Standard SRA Milestones
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Contract RCV</div>
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(milestones.totalContractRcv)}
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Deductible</div>
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(milestones.deductibleAmount)}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  {data.deductibleCollected === 'Yes' ? 'Collected: YES' : 'Collected: NO'}
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">50% Down Payment</div>
                <div className="text-base font-extrabold text-[#D32F2F] font-mono">
                  {formatCurrency(milestones.downPayment50)}
                </div>
                <div className="text-[10px] text-slate-500">Required To Start</div>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">25% Progress Draw</div>
                <div className="text-base font-extrabold text-slate-800 font-mono">
                  {formatCurrency(milestones.midPoint25)}
                </div>
                <div className="text-[10px] text-slate-500">Mid-Point Milestones</div>
              </div>
            </div>

            {data.deductiblePlan && data.deductibleCollected === 'No' && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Deductible Payment Plan: </span>
                <span>{data.deductiblePlan}</span>
              </div>
            )}
          </div>

          {/* Loss Parameters & Team Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Team Assignment
              </h4>
              <div><span className="text-slate-400">Estimator: </span><span className="font-semibold text-slate-900">{data.estimator}</span></div>
              <div><span className="text-slate-400">Supervisor / GM: </span><span className="font-semibold text-slate-900">{data.supervisor}</span></div>
              <div><span className="text-slate-400">Project Manager: </span><span className="font-semibold text-slate-900">{data.projectManager || 'To Be Assigned'}</span></div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Loss Parameters
              </h4>
              <div><span className="text-slate-400">Loss Type: </span><span className="font-semibold text-slate-900">{data.lossType}</span></div>
              <div><span className="text-slate-400">Date of Loss: </span><span className="font-semibold text-slate-900">{data.dateOfLoss || '—'}</span></div>
              <div><span className="text-slate-400">Carrier Check Sent: </span><span className="font-semibold text-slate-900">{data.carrierCheckSent}</span></div>
            </div>
          </div>

          {/* Narrative */}
          {data.lossNarrative && (
            <div className="space-y-1.5 text-xs border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Loss Narrative & Scope Summary
              </h4>
              <p className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                {data.lossNarrative}
              </p>
            </div>
          )}

          {/* Signatures for Print */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-12 text-xs">
            <div className="border-t border-slate-400 pt-2 text-slate-500">
              Estimator Signature: <span className="font-bold text-slate-800">{data.estimator}</span>
            </div>
            <div className="border-t border-slate-400 pt-2 text-slate-500">
              Supervisor Signoff / Approval: <span className="font-bold text-slate-800">{data.supervisor}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobSummaryModal;
