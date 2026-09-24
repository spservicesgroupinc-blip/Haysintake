import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileEdit, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Printer, 
  Send, 
  ArrowLeft, 
  History, 
  RefreshCw, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Shield, 
  User, 
  Calendar, 
  FileText, 
  ExternalLink,
  ChevronDown,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { IntakeFormData, ChangeOrderData, ChangeOrderLineItem, ChangeOrderType } from '../types';
import { formatCurrency } from './MilestoneWidget';
import ChangeOrderPreviewModal from './ChangeOrderPreviewModal';

interface ChangeOrderPageProps {
  currentJobData: IntakeFormData;
  scriptUrl: string;
  onNavigateBack: () => void;
  onOpenScriptModal?: () => void;
}

const COMMON_PRESETS = [
  {
    label: 'Subfloor & Framing Supplement',
    amount: 1850,
    type: 'Addition' as ChangeOrderType,
    category: 'Insurance Scope Supplement',
    text: 'Remove and replace water-damaged 3/4-inch tongue-and-groove OSB subflooring in master bathroom and adjacent hallway. Treat exposed floor joists with EPA-registered antimicrobial disinfectant barrier prior to replacement. Supplement reconciled with carrier adjuster.',
  },
  {
    label: 'Flooring Upgrade (LVP)',
    amount: 2400,
    type: 'Addition' as ChangeOrderType,
    category: 'Customer Requested Upgrade',
    text: 'Customer requested elective upgrade from builder-grade carpet to 100% waterproof commercial-grade Luxury Vinyl Plank (LVP) flooring with integrated 1.5mm acoustic underlayment throughout main living spaces. Difference paid directly by property owner.',
  },
  {
    label: 'Dryout Equipment Supplement',
    amount: 975,
    type: 'Addition' as ChangeOrderType,
    category: 'Insurance Scope Supplement',
    text: 'Supplement for three (3) additional days of commercial LGR dehumidification and six (6) centrifugal air movers due to high moisture trapped in insulated exterior wall cavity, verified by daily psychrometric dry logs.',
  },
  {
    label: 'Concealed Mold Remediation',
    amount: 3200,
    type: 'Addition' as ChangeOrderType,
    category: 'Unforeseen Concealed Damage',
    text: 'Remediation of unforeseen mold colonization discovered behind kitchen base cabinetry. Includes negative air containment barrier, HEPA air scrubber operation, physical removal of contaminated drywall, and HEPA vacuum micro-cleaning per IICRC S520 standards.',
  },
  {
    label: 'Code Electrical AFCI Upgrade',
    amount: 650,
    type: 'Addition' as ChangeOrderType,
    category: 'Code Compliance / Building Dept',
    text: 'Install required Dual Function AFCI/GFCI breakers in main electrical distribution panel to comply with current Indiana Residential Code requirements triggered by kitchen circuit repair.',
  },
  {
    label: 'Scope Credit / Deletion',
    amount: 450,
    type: 'Deduction' as ChangeOrderType,
    category: 'Scope Credit / Deduction',
    text: 'Credit for homeowner electing to retain and personally paint interior bedroom trim and doors. Deducted from final contract price.',
  },
];

export const ChangeOrderPage: React.FC<ChangeOrderPageProps> = ({
  currentJobData,
  scriptUrl,
  onNavigateBack,
  onOpenScriptModal,
}) => {
  // Load saved change orders history for this job
  const jobKey = currentJobData.jobNumber.trim() || 'CURRENT_ACTIVE_JOB';
  const storageKey = `hays_change_orders_${jobKey}`;

  const [savedOrders, setSavedOrders] = useState<ChangeOrderData[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate prior approved changes total
  const priorChangesTotal = useMemo(() => {
    return savedOrders.reduce((sum, order) => {
      const amt = Number(order.changeAmount) || 0;
      return order.changeType === 'Deduction' ? sum - amt : sum + amt;
    }, 0);
  }, [savedOrders]);

  // Next change order number
  const nextOrderNumber = useMemo(() => {
    if (savedOrders.length === 0) return 1;
    const maxNum = Math.max(...savedOrders.map(o => o.changeOrderNumber || 1));
    return maxNum + 1;
  }, [savedOrders]);

  // Form State - User only needs to input details and dollar amount!
  const [changeAmount, setChangeAmount] = useState<number | ''>('');
  const [changeType, setChangeType] = useState<ChangeOrderType>('Addition');
  const [details, setDetails] = useState<string>('');
  const [category, setCategory] = useState<string>('Insurance Scope Supplement');
  const [paymentTerms, setPaymentTerms] = useState<string>('Billed to Insurance Carrier Supplement');
  const [scheduleImpactDays, setScheduleImpactDays] = useState<number>(0);
  const [changeOrderNumber, setChangeOrderNumber] = useState<number>(nextOrderNumber);
  const [lineItems, setLineItems] = useState<ChangeOrderLineItem[]>([]);
  const [showItemizer, setShowItemizer] = useState<boolean>(false);

  // Preview Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitDocUrl, setSubmitDocUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync order number when savedOrders change
  useEffect(() => {
    setChangeOrderNumber(nextOrderNumber);
  }, [nextOrderNumber]);

  // Financial Calculations
  const originalContract = typeof currentJobData.contractAmount === 'number' 
    ? currentJobData.contractAmount 
    : (Number(currentJobData.contractAmount) || 0);

  const contractPriorToThis = originalContract + priorChangesTotal;
  const numericChange = typeof changeAmount === 'number' ? changeAmount : 0;
  const signedChange = changeType === 'Deduction' ? -numericChange : numericChange;
  const revisedContractTotal = contractPriorToThis + signedChange;

  // Milestone adjustments on revised total
  const revisedDownPayment = Math.round(revisedContractTotal * 0.5 * 100) / 100;
  const revisedMidPoint = Math.round(revisedContractTotal * 0.25 * 100) / 100;
  const revisedCompletion = Math.round(revisedContractTotal * 0.25 * 100) / 100;

  // Compile active change order object
  const currentChangeOrder: ChangeOrderData = useMemo(() => {
    return {
      id: `co-${Date.now()}`,
      changeOrderNumber,
      date: new Date().toISOString().split('T')[0],
      jobNumber: currentJobData.jobNumber || 'PENDING',
      customerName: currentJobData.customerName || 'Customer on File',
      lossAddress: currentJobData.lossAddress || '',
      phone: currentJobData.phone || '',
      customerEmail: currentJobData.customerEmail || '',
      insuranceCarrier: currentJobData.insuranceCarrier || 'Pending Carrier',
      claimNumber: currentJobData.claimNumber || 'Pending',
      policyNumber: currentJobData.policyNumber || 'Pending',
      estimator: currentJobData.estimator || 'Ryan Russell',
      supervisor: currentJobData.supervisor || 'Kenny Belford',
      originalContractAmount: originalContract,
      priorChangesTotal,
      changeType,
      changeAmount,
      details,
      category,
      paymentTerms,
      scheduleImpactDays,
      lineItems,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };
  }, [
    changeOrderNumber,
    currentJobData,
    originalContract,
    priorChangesTotal,
    changeType,
    changeAmount,
    details,
    category,
    paymentTerms,
    scheduleImpactDays,
    lineItems,
  ]);

  // Quick preset apply handler
  const handleApplyPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setChangeAmount(preset.amount);
    setChangeType(preset.type);
    setCategory(preset.category);
    setDetails(preset.text);
    if (preset.category === 'Customer Requested Upgrade') {
      setPaymentTerms('Customer Out-of-Pocket (50% Deposit / 50% Upon Completion)');
    } else if (preset.category === 'Scope Credit / Deduction') {
      setPaymentTerms('Credit Applied to Final Contract Invoicing');
    } else {
      setPaymentTerms('Billed to Insurance Carrier Supplement');
    }
  };

  // Add line item
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: `li-${Date.now()}`, description: '', amount: '' }
    ]);
  };

  const handleUpdateLineItem = (id: string, field: 'description' | 'amount', val: any) => {
    setLineItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      });
      // If updating amounts, optionally sync total
      const total = updated.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      if (total > 0) {
        setChangeAmount(total);
      }
      return updated;
    });
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Save to Local History
  const handleSaveToHistory = (orderToSave: ChangeOrderData) => {
    const updated = [orderToSave, ...savedOrders.filter(o => o.id !== orderToSave.id)];
    setSavedOrders(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // Delete from history
  const handleDeleteHistory = (id: string) => {
    const updated = savedOrders.filter(o => o.id !== id);
    setSavedOrders(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete from localStorage', e);
    }
  };

  // Submit to Google Apps Script
  const handleSubmitToDrive = async () => {
    if (!details.trim()) {
      setSubmitError('Please enter the details / description of the change order.');
      return;
    }
    if (changeAmount === '' || Number(changeAmount) <= 0) {
      setSubmitError('Please enter a dollar amount greater than $0.00.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload = {
      packetType: 'CHANGE_ORDER',
      isChangeOrder: true,
      changeOrderNumber,
      changeType,
      changeAmount: Number(changeAmount),
      changeSignedAmount: signedChange,
      details: details.trim(),
      category,
      paymentTerms,
      scheduleImpactDays,
      lineItems,

      // Job & Customer Profile (Auto-filled)
      jobNumber: currentJobData.jobNumber.trim(),
      customerName: currentJobData.customerName.trim(),
      lossAddress: currentJobData.lossAddress.trim(),
      phone: currentJobData.phone.trim(),
      customerEmail: currentJobData.customerEmail.trim(),
      insuranceCarrier: currentJobData.insuranceCarrier.trim(),
      claimNumber: currentJobData.claimNumber.trim(),
      policyNumber: currentJobData.policyNumber.trim(),
      estimator: currentJobData.estimator,
      supervisor: currentJobData.supervisor,

      // Financials
      originalContractAmount: originalContract,
      priorChangesTotal,
      contractPriorToThis,
      revisedContractTotal,
      revisedDownPayment,
      revisedMidPoint,
      revisedCompletion,

      date: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let resData: any = {};
      try {
        resData = JSON.parse(rawText);
      } catch {
        if (rawText.includes('drive.google.com')) {
          resData = { success: true, folderUrl: rawText.trim() };
        } else {
          throw new Error(`Apps Script Response: ${rawText.substring(0, 140)}`);
        }
      }

      if (resData.success || resData.folderUrl || resData.changeOrderDocUrl) {
        const docUrl = resData.changeOrderDocUrl || resData.files?.changeOrderDocUrl || resData.folderUrl;
        setSubmitSuccess(`Change Order #${changeOrderNumber} document successfully created in customer Google Drive folder.`);
        setSubmitDocUrl(docUrl || null);

        // Save order to history
        const savedRecord: ChangeOrderData = {
          ...currentChangeOrder,
          status: 'Submitted',
          folderUrl: resData.folderUrl || currentChangeOrder.folderUrl,
          changeOrderDocUrl: docUrl,
        };
        handleSaveToHistory(savedRecord);
      } else {
        throw new Error(resData.error || resData.message || 'Unknown response from Apps Script endpoint.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error communicating with Google Apps Script.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setChangeAmount('');
    setDetails('');
    setLineItems([]);
    setSubmitSuccess(null);
    setSubmitError(null);
    setSubmitDocUrl(null);
    setChangeOrderNumber(nextOrderNumber);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
            title="Return to Main Intake Form"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D32F2F]">
                Change Order Engine
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-medium text-slate-500">
                Indiana SRA Scope & Contract Modification
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Change Order Generator
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Preview & Print</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitToDrive}
            disabled={isSubmitting || !details.trim() || changeAmount === ''}
            className="px-4 py-2 text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Creating in Drive...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Create & Save to Drive</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Filled Customer Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Customer Information Auto-Filled
            </span>
            <span className="text-xs text-slate-400">
              Synchronized with active job intake record
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#D32F2F] bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
              JOB #: {currentJobData.jobNumber || 'PENDING'}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              CO #{changeOrderNumber}
            </span>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Customer / Property Owner
            </span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {currentJobData.customerName || <span className="text-amber-600 italic">No customer name on active form</span>}
            </span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              {currentJobData.phone ? `Phone: ${currentJobData.phone}` : ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Property / Loss Address
            </span>
            <span className="font-medium text-slate-800 block mt-0.5">
              {currentJobData.lossAddress || <span className="text-slate-400 italic">No address on file</span>}
            </span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              {currentJobData.customerEmail || ''}
            </span>
          </div>

          <div>
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Insurance & Claim Reference
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {currentJobData.insuranceCarrier || 'Pending Carrier'}
            </span>
            <span className="font-mono text-slate-500 text-[11px] block mt-0.5">
              Claim #: {currentJobData.claimNumber || 'Pending'} {currentJobData.policyNumber ? `| Pol: ${currentJobData.policyNumber}` : ''}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
              Original Contract (RCV)
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5">
              {formatCurrency(originalContract)}
            </span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              Prior Changes: <strong className="text-slate-700">{formatCurrency(priorChangesTotal)}</strong> ({savedOrders.length} logged)
            </span>
          </div>
        </div>
      </div>

      {/* Submission Success/Error Banner */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold">{submitSuccess}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Change Order #{changeOrderNumber} has been logged to this job's history.
              </p>
            </div>
          </div>
          {submitDocUrl && (
            <a
              href={submitDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0 shadow-xs"
            >
              <span>Open Document</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Submission Notice</p>
            <p className="text-red-700 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout: Left (Inputs) + Right (Accounting Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: CHANGE ORDER INPUTS (8 Cols)                     */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Card: Details & Dollar Amount */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-[#D32F2F]" />
                <h2 className="text-base font-bold text-slate-900">
                  Change Order Specifications
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Only input details & dollar amount below
              </span>
            </div>

            {/* Quick Presets for Fast 1-Click Fill */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Preset Templates (1-Click Fill):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:border-red-400 hover:text-[#D32F2F] text-slate-700 transition-colors shadow-2xs"
                  >
                    {preset.label} ({preset.type === 'Addition' ? '+' : '-'}${preset.amount})
                  </button>
                ))}
              </div>
            </div>

            {/* 1. Dollar Amount & Type Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* Type Switcher: Addition (+) vs Deduction (-) */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setChangeType('Addition')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      changeType === 'Addition'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Addition (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChangeType('Deduction')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      changeType === 'Deduction'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Credit (-)</span>
                  </button>
                </div>
              </div>

              {/* Dollar Amount Input */}
              <div className="sm:col-span-7 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Dollar Amount of Change ($)</span>
                  <span className="text-[11px] font-normal text-slate-400">Required</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={changeAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChangeAmount(val === '' ? '' : Math.max(0, parseFloat(val)));
                    }}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-slate-300 focus:border-[#D32F2F] focus:ring-2 focus:ring-red-100 rounded-xl text-slate-900 font-mono font-bold text-base transition-colors"
                  />
                  {typeof changeAmount === 'number' && changeAmount > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        changeType === 'Addition' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {changeType === 'Addition' ? '+' : '-'}{formatCurrency(changeAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Details of Change (Scope Narrative) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Details of Change (Work Description & Scope Modifications)</span>
                <span className="text-[11px] font-normal text-slate-400">Required</span>
              </label>
              <textarea
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the exact modifications, materials added/deleted, location of work, and reason for this change order. e.g. 'Remove and replace water-damaged subflooring in master bath. Treat joists with antimicrobial agent. Reconciled with insurance adjuster.'"
                className="w-full p-3.5 bg-white border border-slate-300 focus:border-[#D32F2F] focus:ring-2 focus:ring-red-100 rounded-xl text-xs sm:text-sm text-slate-900 leading-relaxed transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                This exact description is embedded into the official SRA Change Order agreement and submitted to Google Drive.
              </p>
            </div>

            {/* Optional Itemized Breakdown Section */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowItemizer(!showItemizer)}
                  className="text-xs font-bold text-slate-700 hover:text-[#D32F2F] inline-flex items-center gap-1.5 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showItemizer ? 'rotate-180' : ''}`} />
                  <span>Optional: Itemized Sub-Item Breakdown ({lineItems.length} items)</span>
                </button>
                {showItemizer && (
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {showItemizer && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {lineItems.length === 0 ? (
                    <div className="text-center py-3 text-xs text-slate-500">
                      No itemized lines added. You can simply use the total dollar amount above, or add specific line items here.
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleAddLineItem}
                          className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          + Add First Line Item
                        </button>
                      </div>
                    </div>
                  ) : (
                    lineItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Item description (e.g. Labor / Materials / Dumpster)"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <div className="w-32 relative">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs">$</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={item.amount}
                            onChange={(e) => handleUpdateLineItem(item.id, 'amount', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="w-full pl-5 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Metadata Settings (Pre-filled with defaults) */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Change Order #
                </label>
                <input
                  type="number"
                  min="1"
                  value={changeOrderNumber}
                  onChange={(e) => setChangeOrderNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Change Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Insurance Scope Supplement">Insurance Scope Supplement</option>
                  <option value="Customer Requested Upgrade">Customer Requested Upgrade</option>
                  <option value="Unforeseen Concealed Damage">Unforeseen Concealed Damage</option>
                  <option value="Code Compliance / Building Dept">Code Compliance / Building Dept</option>
                  <option value="Material Substitution">Material Substitution</option>
                  <option value="Scope Credit / Deduction">Scope Credit / Deduction</option>
                  <option value="Other">Other Modification</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Schedule Impact
                </label>
                <select
                  value={scheduleImpactDays}
                  onChange={(e) => setScheduleImpactDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value={0}>+0 Working Days (No Delay)</option>
                  <option value={1}>+1 Working Day</option>
                  <option value={2}>+2 Working Days</option>
                  <option value={3}>+3 Working Days</option>
                  <option value={5}>+5 Working Days</option>
                  <option value={7}>+7 Working Days</option>
                  <option value={10}>+10 Working Days</option>
                </select>
              </div>
            </div>

            {/* Payment Terms field */}
            <div className="pt-1 text-xs">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Payment Terms for this Change
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option value="Billed to Insurance Carrier Supplement">Billed to Insurance Carrier Supplement (Direct Reconcile)</option>
                <option value="Customer Out-of-Pocket (50% Deposit / 50% Upon Completion)">Customer Out-of-Pocket (50% Deposit / 50% Upon Completion)</option>
                <option value="Customer Out-of-Pocket (100% Due Upon Authorization)">Customer Out-of-Pocket (100% Due Upon Authorization)</option>
                <option value="100% Due Upon Substantial Completion">100% Due Upon Substantial Completion</option>
                <option value="Credit Applied to Final Invoicing">Credit Applied to Final Invoicing</option>
              </select>
            </div>

            {/* Actions Toolbar */}
            <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearForm}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Clear Inputs
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Preview & Print Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitToDrive}
                  disabled={isSubmitting || !details.trim() || changeAmount === ''}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting to Drive...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit & Generate Google Doc</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Previous Change Orders History Drawer / List */}
          {savedOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Change Order History for Job #{currentJobData.jobNumber || 'ACTIVE'} ({savedOrders.length})
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Net Changes: {formatCurrency(priorChangesTotal)}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {savedOrders.map((order) => {
                  const amt = Number(order.changeAmount) || 0;
                  return (
                    <div key={order.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            Change Order #{order.changeOrderNumber}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            order.changeType === 'Addition' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {order.changeType === 'Addition' ? '+' : '-'}{formatCurrency(amt)}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {order.date} · {order.category}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2">
                          {order.details}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {order.changeOrderDocUrl && (
                          <a
                            href={order.changeOrderDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Open Google Doc"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(order.id)}
                          className="p-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: FINANCIAL ACCOUNTING CARD (4 Cols)             */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#111827] text-white rounded-xl shadow-lg border border-slate-800 overflow-hidden sticky top-20">
            {/* Top Accent */}
            <div className="h-1.5 bg-[#D32F2F] w-full" />

            <div className="p-5 space-y-5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#D32F2F]">
                  Financial Reconciliation
                </div>
                <h3 className="text-base font-black tracking-tight text-white mt-0.5">
                  Change Order #{changeOrderNumber} Calculation
                </h3>
              </div>

              {/* Stacked Accounting Summary */}
              <div className="space-y-3 font-mono text-xs border-y border-slate-800 py-4">
                
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-sans text-slate-400">1. Original Contract:</span>
                  <span className="font-bold text-white">{formatCurrency(originalContract)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-sans text-slate-400">2. Net Prior Changes:</span>
                  <span className="font-bold text-slate-300">
                    {priorChangesTotal > 0 ? '+' : ''}{formatCurrency(priorChangesTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="font-sans text-slate-400">3. Current Total:</span>
                  <span className="font-bold text-white">{formatCurrency(contractPriorToThis)}</span>
                </div>

                {/* THIS CHANGE ORDER HIGHLIGHT */}
                <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  changeType === 'Addition' 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}>
                  <span className="font-sans font-bold text-xs">
                    4. This Change (#{changeOrderNumber}):
                  </span>
                  <span className="font-mono font-black text-sm">
                    {changeType === 'Addition' ? '+' : '-'}{formatCurrency(numericChange)}
                  </span>
                </div>

                {/* REVISED CONTRACT TOTAL */}
                <div className="pt-2 border-t border-slate-700">
                  <div className="text-[10px] uppercase font-sans text-slate-400 tracking-wider">
                    5. Revised Total Contract Price
                  </div>
                  <div className="text-2xl font-black text-amber-400 tracking-tight mt-0.5">
                    {formatCurrency(revisedContractTotal)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    {originalContract > 0 
                      ? `${((revisedContractTotal - originalContract) / originalContract * 100).toFixed(1)}% net scope change from base contract` 
                      : 'Base contract pending'}
                  </div>
                </div>

              </div>

              {/* Revised Milestone Impact */}
              <div className="space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Revised 50/25/25 Milestones:
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                  <div className="flex justify-between py-1 px-2 rounded bg-slate-800/50">
                    <span className="font-sans text-slate-400">50% Mobilization:</span>
                    <span className="font-bold text-white">{formatCurrency(revisedDownPayment)}</span>
                  </div>
                  <div className="flex justify-between py-1 px-2 rounded bg-slate-800/50">
                    <span className="font-sans text-slate-400">25% Mid-Point:</span>
                    <span className="font-bold text-white">{formatCurrency(revisedMidPoint)}</span>
                  </div>
                  <div className="flex justify-between py-1 px-2 rounded bg-slate-800/50">
                    <span className="font-sans text-slate-400">25% Completion:</span>
                    <span className="font-bold text-white">{formatCurrency(revisedCompletion)}</span>
                  </div>
                </div>
              </div>

              {/* Fast Actions inside card */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span>Preview & Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitToDrive}
                  disabled={isSubmitting || !details.trim() || changeAmount === ''}
                  className="w-full py-2.5 px-3 bg-[#D32F2F] hover:bg-[#B71C1C] disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Generate Google Doc</span>
                </button>
              </div>

            </div>

            {/* Estimator Card Footer */}
            <div className="bg-slate-950 p-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Ryan Russell</span>
                <span>Estimator · Fort Wayne</span>
              </div>
              <span className="font-mono text-emerald-400 text-[10px]">
                Online
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Official Print/Preview Modal */}
      <ChangeOrderPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        data={currentChangeOrder}
      />

    </div>
  );
};

export default ChangeOrderPage;
