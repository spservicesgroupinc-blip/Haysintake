import React from 'react';
import { X, Printer, CheckCircle2, FileText, Download, Building2, Calendar, Shield, DollarSign } from 'lucide-react';
import { ChangeOrderData } from '../types';
import { formatCurrency } from './MilestoneWidget';
import HaysSonsLogo from './HaysSonsLogo';

interface ChangeOrderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ChangeOrderData;
  onPrint?: () => void;
}

export const ChangeOrderPreviewModal: React.FC<ChangeOrderPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  onPrint,
}) => {
  if (!isOpen) return null;

  const originalContract = Number(data.originalContractAmount) || 0;
  const priorChanges = Number(data.priorChangesTotal) || 0;
  const rawChange = Number(data.changeAmount) || 0;
  const changeSigned = data.changeType === 'Deduction' ? -rawChange : rawChange;
  const contractPriorToThis = originalContract + priorChanges;
  const revisedContractTotal = contractPriorToThis + changeSigned;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formattedDate = data.date 
    ? new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full my-6 overflow-hidden print:border-none print:shadow-none print:max-w-none print:my-0">
        
        {/* Modal Top Bar - Hidden when printing */}
        <div className="bg-[#111827] text-white px-6 py-3.5 border-t-4 border-[#D32F2F] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#D32F2F] flex items-center justify-center text-white font-bold text-xs">
              CO
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Official Change Order Document Preview
              </h3>
              <p className="text-[11px] text-slate-400">
                Change Order #{data.changeOrderNumber} · Job #{data.jobNumber || 'PENDING'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 text-xs font-bold bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 text-slate-800 text-xs sm:text-sm font-sans space-y-6 print:p-6 print:space-y-4">
          
          {/* Top Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-300 pb-4 gap-4">
            <div className="space-y-1">
              <HaysSonsLogo size="md" />
              <div className="text-[10px] text-slate-500 font-medium">
                Fort Wayne Division · Property Restoration Experts
              </div>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-900 text-xs">
                {data.estimator || 'Ryan Russell'} · Estimator
              </div>
              <div>rrussell@haysandsons.com</div>
              <div>909 Production Rd., Fort Wayne, IN 46808</div>
              <div>Office: 260.471.9110 | Cell: 260.210.0415</div>
              <div className="font-bold text-[#D32F2F]">haysandsons.com</div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-[#111827] text-white px-4 py-2.5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1 print:bg-slate-900">
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-wider uppercase">
                Contract Change Order Authorization
              </h1>
              <div className="text-[10px] text-slate-300 font-mono">
                Indiana Structural Repair Agreement (SRA) Scope & Financial Modification
              </div>
            </div>
            <div className="text-right font-mono text-xs font-bold text-amber-400">
              Change Order #{data.changeOrderNumber}
            </div>
          </div>

          {/* Project & Insurance Reference Table */}
          <div className="border border-slate-300 rounded-md overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-[11px] uppercase tracking-wider text-slate-700">
              1. Project & Customer Identification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3 space-y-1.5">
                <div>
                  <span className="text-slate-500 text-[11px] block">Property Owner(s):</span>
                  <span className="font-bold text-slate-900 text-sm">{data.customerName || 'Customer on File'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Loss Property Address:</span>
                  <span className="font-semibold text-slate-800">{data.lossAddress || 'Address on File'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Contact Phone:</span>
                    <span className="font-medium text-slate-800">{data.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Customer Email:</span>
                    <span className="font-medium text-slate-800 truncate block">{data.customerEmail || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-1.5 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Job Number:</span>
                    <span className="font-mono font-bold text-[#D32F2F] text-sm">{data.jobNumber || 'PENDING'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Change Order Date:</span>
                    <span className="font-medium text-slate-800">{formattedDate}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Insurance Carrier:</span>
                  <span className="font-semibold text-slate-800">{data.insuranceCarrier || 'Pending Carrier'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Claim #:</span>
                    <span className="font-mono font-medium text-slate-800">{data.claimNumber || 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Policy #:</span>
                    <span className="font-mono font-medium text-slate-800">{data.policyNumber || 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Adjustment Accounting Grid */}
          <div className="border border-slate-300 rounded-md overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-[11px] uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>2. Financial Accounting & Contract Price Reconciliation</span>
              <span className="text-[10px] text-slate-500 font-normal">All amounts in USD</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
                  <th className="py-2 px-3 font-semibold">Accounting Item</th>
                  <th className="py-2 px-3 text-right font-semibold">Calculation</th>
                  <th className="py-2 px-3 text-right font-semibold">Contract Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    1. Original Contract Price (Initial SRA / RCV Agreement)
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">Base Contract</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(originalContract)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    2. Net Prior Approved Change Orders (#1 through #{data.changeOrderNumber > 1 ? data.changeOrderNumber - 1 : 0})
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                    {priorChanges > 0 ? '+ Prior Additions' : priorChanges < 0 ? '- Prior Credits' : 'No prior changes'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(priorChanges)}
                  </td>
                </tr>

                <tr className="bg-slate-50/70">
                  <td className="py-2.5 px-3 text-slate-800 font-semibold">
                    3. Total Contract Price Prior to this Change Order
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">Line 1 + Line 2</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(contractPriorToThis)}
                  </td>
                </tr>

                <tr className={data.changeType === 'Addition' ? 'bg-emerald-50/50' : 'bg-red-50/50'}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>4. THIS CHANGE ORDER #{data.changeOrderNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        data.changeType === 'Addition' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {data.changeType === 'Addition' ? '+ Addition to Contract' : '- Deduction / Credit'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Category: <span className="font-medium text-slate-700">{data.category || 'General Scope Modification'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600 font-medium text-xs">
                    {data.changeType === 'Addition' ? '+' : '-'} {data.changeType}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-black text-sm sm:text-base ${
                    data.changeType === 'Addition' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {data.changeType === 'Addition' ? '+' : '-'} {formatCurrency(rawChange)}
                  </td>
                </tr>

                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900 print:bg-slate-900 print:text-white">
                  <td className="py-3 px-3">
                    <div className="text-sm uppercase tracking-wide">
                      5. REVISED TOTAL CONTRACT PRICE
                    </div>
                    <div className="text-[10px] text-slate-300 font-normal">
                      Original Contract + All Approved Additions & Deductions to Date
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 text-[11px]">Line 3 ± Line 4</td>
                  <td className="py-3 px-3 text-right font-mono text-base sm:text-lg font-black text-amber-300">
                    {formatCurrency(revisedContractTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Scope of Work Details / Narrative */}
          <div className="border border-slate-300 rounded-md overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 font-bold text-[11px] uppercase tracking-wider text-slate-700">
              3. Description of Work / Specification Modifications
            </div>
            <div className="p-4 space-y-3">
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-3 rounded border border-slate-200">
                {data.details || 'No detailed narrative provided. Refer to attached itemization.'}
              </div>

              {/* Optional Itemized Line Items if present */}
              {data.lineItems && data.lineItems.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Itemized Breakdown:
                  </div>
                  <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                    {data.lineItems.map((item, idx) => (
                      <div key={item.id || idx} className="py-1.5 px-3 flex items-center justify-between">
                        <span className="text-slate-700">{item.description}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {item.amount !== '' ? formatCurrency(Number(item.amount)) : '$0.00'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms and schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px] block">Payment Terms for this Change:</span>
                  <span className="font-semibold text-slate-900">
                    {data.paymentTerms || 'Billed to Insurance Carrier Supplement'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Impact on Completion Schedule:</span>
                  <span className="font-semibold text-slate-900">
                    {data.scheduleImpactDays > 0 
                      ? `+${data.scheduleImpactDays} working day(s) added to project duration` 
                      : 'Zero (0) schedule delay. Standard timeline applies.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Statutory Terms */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded text-[10px] text-slate-600 leading-relaxed space-y-1.5">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Terms of Authorization & Indiana Statutory Disclosures
            </div>
            <p>
              All work specified in this Change Order shall be executed under the exact terms, specifications, and conditions of the original Hays + Sons Structural Repair Agreement (SRA) except as specifically modified herein. In accordance with Indiana Code 24-5-11 (Indiana Home Improvement Contracts Act), this Change Order represents an agreed-upon adjustment to the scope of work and contract price.
            </p>
            <p>
              The undersigned Property Owner(s) authorize Hays + Sons to perform the alterations, additions, or deductions described above. If this Change Order is designated as an insurance supplement, Hays + Sons will submit line-item documentation to the insurance carrier for reimbursement; if designated as an elective customer upgrade or out-of-pocket change, the Owner agrees to payment per the terms specified above.
            </p>
          </div>

          {/* Signature Block */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-t border-slate-300">
            {/* Property Owner Signature */}
            <div className="space-y-4">
              <div className="font-bold text-slate-900 uppercase text-[11px]">
                Property Owner / Insured Acceptance:
              </div>
              <div className="border-b border-slate-400 h-8 flex items-end">
                <span className="text-[10px] text-slate-400 italic">Signature</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Printed Name:</span>
                  <span className="font-semibold text-slate-800 border-b border-slate-300 block pb-0.5">
                    {data.customerName || ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date Signed:</span>
                  <span className="border-b border-slate-300 block pb-0.5 text-slate-400">____/____/________</span>
                </div>
              </div>
            </div>

            {/* Contractor Signature */}
            <div className="space-y-4">
              <div className="font-bold text-slate-900 uppercase text-[11px]">
                Hays + Sons Authorized Representative:
              </div>
              <div className="border-b border-slate-400 h-8 flex items-end">
                <span className="text-[10px] text-slate-400 italic">Signature</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Representative:</span>
                  <span className="font-semibold text-slate-800 border-b border-slate-300 block pb-0.5">
                    {data.estimator || 'Ryan Russell'} (Estimator)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date Signed:</span>
                  <span className="border-b border-slate-300 block pb-0.5 text-slate-800">{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-200">
            Hays + Sons · We Do Restoration Right · 909 Production Rd., Fort Wayne, IN 46808 · Phone: 260.471.9110 · haysandsons.com
          </div>

        </div>

      </div>
    </div>
  );
};

export default ChangeOrderPreviewModal;
