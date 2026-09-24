/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Shield, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  FileCheck, 
  Info,
  RotateCcw,
  Eye,
  Check,
  ExternalLink,
  Code,
  Sparkles,
  FileEdit,
  FilePlus2
} from 'lucide-react';
import HaysSonsLogo, { HaysSonsBadge } from './components/HaysSonsLogo';
import MilestoneWidget, { formatCurrency } from './components/MilestoneWidget';
import SubmissionModal from './components/SubmissionModal';
import JobSummaryModal from './components/JobSummaryModal';
import AppsScriptCodeModal from './components/AppsScriptCodeModal';
import TemplateGuideModal from './components/TemplateGuideModal';
import ChangeOrderPage from './components/ChangeOrderPage';
import { 
  IntakeFormData, 
  CalculatedMilestones, 
  ApiResponseData, 
  LossType, 
  CarrierCheckStatus 
} from './types';

// Clean blank initial form state
const INITIAL_FORM_DATA: IntakeFormData = {
  jobNumber: '',
  customerName: '',
  lossAddress: '',
  mailingAddress: '',
  phone: '',
  altPhone: '',
  customerEmail: '',

  insuranceCarrier: '',
  claimNumber: '',
  policyNumber: '',
  adjusterName: '',
  adjusterPhone: '',
  adjusterEmail: '',
  brokerInfo: '',

  contractAmount: '',
  deductibleAmount: 0.00,
  deductibleCollected: 'No',
  deductiblePlan: '',
  carrierCheckSent: 'Pending',

  estimator: 'Ryan Russell',
  supervisor: 'Kenny Belford',
  projectManager: '',
  lossType: 'Water',
  dateOfLoss: new Date().toISOString().split('T')[0],
  lossNarrative: '',
  templateDocId: '',
};

// 1. Apps Script Project & Deployment Config
const APPSCRIPT_PROJECT_ID = "1WL8Apt_HSfeEi6Z5J_NSCrI5exG08Woa1T39Xi_Pc6L9kcgpiCRNUrh-";
const APPSCRIPT_PROJECT_URL = `https://script.google.com/d/${APPSCRIPT_PROJECT_ID}/edit`;
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz0RnU8_ASKJqTD3V559-EE0jlkcslTPNI0vfTs0O4OetbQIhYjTRRtup_VT5b6jGo3zw/exec";
const SCRIPT_URL = DEFAULT_SCRIPT_URL;

async function submitJobPacket(formData: any) {
  const payload = JSON.stringify({
    ...formData,
    scriptId: APPSCRIPT_PROJECT_ID,
    appscriptId: APPSCRIPT_PROJECT_ID,
  });
  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: payload,
  });

  const rawText = await response.text();
  try {
    return JSON.parse(rawText);
  } catch {
    if (rawText && rawText.includes("drive.google.com")) {
      const match = rawText.match(/https:\/\/drive\.google\.com\/[^\s"')]+/);
      return {
        success: true,
        folderUrl: match ? match[0] : rawText.trim(),
      };
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    throw new Error(`Unable to parse response from Apps Script: ${rawText.substring(0, 150)}`);
  }
}

export default function App() {
  const [formData, setFormData] = useState<IntakeFormData>(() => {
    const saved = localStorage.getItem('hays_estimator_intake_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear out any old mock data
        if (parsed.customerName === 'Marcus & Elena Vance' || parsed.jobNumber === 'F-26-0377-R') {
          localStorage.removeItem('hays_estimator_intake_draft');
          return INITIAL_FORM_DATA;
        }
        return parsed;
      } catch (e) {
        return INITIAL_FORM_DATA;
      }
    }
    return INITIAL_FORM_DATA;
  });

  const [currentPage, setCurrentPage] = useState<'intake' | 'change_order'>('intake');
  const [activeTab, setActiveTab] = useState<number>(1);
  const [accordionOpen, setAccordionOpen] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [viewMode, setViewMode] = useState<'tabs' | 'accordion'>('tabs');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('Generating Job Packet Folder...');
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponseData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Summary preview modal
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  // Apps Script code helper modal
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  // Template & Merge Tags guide modal
  const [templateGuideOpen, setTemplateGuideOpen] = useState(false);
  const [templateDocId, setTemplateDocId] = useState<string>(() => {
    return localStorage.getItem('hays_master_template_doc_id') || '';
  });

  const handleSaveTemplateDocId = (newId: string) => {
    setTemplateDocId(newId);
    localStorage.setItem('hays_master_template_doc_id', newId);
    handleChange('templateDocId', newId);
  };

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('hays_estimator_intake_draft', JSON.stringify(formData));
  }, [formData]);

  // Handle field change
  const handleChange = (
    field: keyof IntakeFormData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Real-time calculated milestones
  const milestones: CalculatedMilestones = useMemo(() => {
    const rcv = typeof formData.contractAmount === 'number' ? formData.contractAmount : 0;
    const deductible = typeof formData.deductibleAmount === 'number' ? formData.deductibleAmount : 0;

    return {
      totalContractRcv: rcv,
      downPayment50: Math.round(rcv * 0.5 * 100) / 100,
      midPoint25: Math.round(rcv * 0.25 * 100) / 100,
      completion25: Math.round(rcv * 0.25 * 100) / 100,
      deductibleAmount: deductible,
      insurancePortion: Math.max(0, Math.round((rcv - deductible) * 100) / 100),
      isDeductibleCollected: formData.deductibleCollected === 'Yes',
    };
  }, [formData.contractAmount, formData.deductibleAmount, formData.deductibleCollected]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.jobNumber.trim()) {
      errors.jobNumber = 'Job Number is required (e.g. F-26-0377-R)';
    }
    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer / Property Owner Name is required';
    }
    if (!formData.lossAddress.trim()) {
      errors.lossAddress = 'Loss Address is required';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone Number is required';
    }
    if (formData.contractAmount === '' || Number(formData.contractAmount) <= 0) {
      errors.contractAmount = 'Contract Amount ($ RCV) must be greater than $0.00';
    }

    setFormErrors(errors);

    // Switch tab to first error if using tabs
    if (Object.keys(errors).length > 0) {
      if (errors.jobNumber || errors.customerName || errors.lossAddress || errors.phone) {
        setActiveTab(1);
      } else if (errors.contractAmount) {
        setActiveTab(3);
      }
      return false;
    }

    return true;
  };

  // Handle Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setApiResponse(null);
    setSubmissionModalOpen(true);
    setLoadingStep(1);
    setLoadingMessage('Generating Job Packet Folder...');

    // Progress animation timers
    const step2Timer = setTimeout(() => {
      setLoadingStep(2);
      setLoadingMessage('Building SRA & Mortgage Authorization...');
    }, 1300);

    const step3Timer = setTimeout(() => {
      setLoadingStep(3);
      setLoadingMessage('Populating Production Checklist...');
    }, 2800);

    const step4Timer = setTimeout(() => {
      setLoadingStep(4);
      setLoadingMessage('Finalizing Customer Welcome Letter...');
    }, 4200);

    try {
      // Gather form data matching exact Google Apps Script expected keys
      const payload = {
        // Section 1: Job & Customer
        jobNumber: formData.jobNumber.trim(),
        customerName: formData.customerName.trim(),
        lossAddress: formData.lossAddress.trim(),
        mailingAddress: formData.mailingAddress?.trim() || formData.lossAddress.trim(),
        phone: formData.phone.trim(),
        altPhone: formData.altPhone?.trim() || '',
        email: formData.customerEmail?.trim() || '',
        customerEmail: formData.customerEmail?.trim() || '',

        // Section 2: Insurance & Adjuster
        carrier: formData.insuranceCarrier?.trim() || '',
        insuranceCarrier: formData.insuranceCarrier?.trim() || '',
        claimNumber: formData.claimNumber?.trim() || '',
        policyNumber: formData.policyNumber?.trim() || '',
        adjusterName: formData.adjusterName?.trim() || '',
        adjusterPhone: formData.adjusterPhone?.trim() || '',
        adjusterEmail: formData.adjusterEmail?.trim() || '',
        brokerInfo: formData.brokerInfo?.trim() || '',

        // Section 3: Financials & Auto-Calculations
        contractAmount: formData.contractAmount.toString(),
        deductible: formData.deductibleAmount.toString(),
        deductibleAmount: Number(formData.deductibleAmount) || 0,
        deductibleCollected: formData.deductibleCollected,
        deductiblePlan: formData.deductiblePlan || '',
        carrierCheckSent: formData.carrierCheckSent,

        // Milestone Financial Calculations
        rcv: milestones.totalContractRcv,
        totalContractRcv: milestones.totalContractRcv,
        downPayment50: milestones.downPayment50,
        midPoint25: milestones.midPoint25,
        completion25: milestones.completion25,
        insurancePortion: milestones.insurancePortion,
        calculatedMilestones: milestones,

        // Section 4: Team & Loss Details
        estimator: formData.estimator,
        gm: formData.supervisor,
        supervisor: formData.supervisor,
        projectManager: formData.projectManager?.trim() || '',
        lossType: formData.lossType,
        dateOfLoss: formData.dateOfLoss,
        lossNarrative: formData.lossNarrative?.trim() || '',
        templateDocId: (templateDocId || formData.templateDocId || '').trim(),

        submittedAt: new Date().toISOString(),
        portalSource: 'Hays + Sons Official Estimator Portal v2.6',
      };

      // Submit packet using helper function
      const result = await submitJobPacket(payload);

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);

      if (result && (result.success === true || result.folderUrl)) {
        setApiResponse({
          success: true,
          folderUrl: result.folderUrl || '',
          customerName: result.customerName || formData.customerName.trim(),
          jobNumber: result.jobNumber || formData.jobNumber.trim(),
          templateDocId: result.templateDocId,
          templateDocName: result.templateDocName,
          files: result.files || (result.folderUrl ? {
            templateFilledUrl: result.files?.templateFilledUrl,
            sraUrl: result.files?.sraUrl || result.folderUrl,
            mortgageAuthUrl: result.files?.mortgageAuthUrl || result.folderUrl,
            productionChecklistUrl: result.files?.productionChecklistUrl || result.folderUrl,
            welcomeLetterUrl: result.files?.welcomeLetterUrl || result.folderUrl,
          } : undefined),
          message: result.message || 'Job packet files generated successfully.',
        });
        setIsSubmitting(false);
      } else {
        throw new Error(result?.error || result?.message || 'Apps Script returned an unverified status.');
      }
    } catch (err: any) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
      
      console.warn('Apps Script submission error:', err);
      setApiError(err.message || 'Network error communicating with Google Apps Script Web App.');
      setIsSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setSubmissionModalOpen(false);
    setApiResponse(null);
    setApiError(null);
    setActiveTab(1);
    localStorage.removeItem('hays_estimator_intake_draft');
  };

  const copyLossAddressToMailing = () => {
    setFormData((prev) => ({
      ...prev,
      mailingAddress: prev.lossAddress,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 selection:bg-red-100 selection:text-red-900">
      {/* ============================================================ */}
      {/* 1. VISUAL IDENTITY & EXECUTIVE HEADER                         */}
      {/* ============================================================ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Top Sharp Red Accent Line */}
        <div className="h-1 bg-[#D32F2F] w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand lockup */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <HaysSonsLogo size="md" />
            <div className="hidden md:block h-7 w-px bg-slate-200" />
            
            {/* Main Portal View Switcher */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentPage('intake')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                  currentPage === 'intake'
                    ? 'bg-white text-[#D32F2F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Job Intake Packet</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('change_order')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                  currentPage === 'change_order'
                    ? 'bg-white text-[#D32F2F] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Create a Change Order automatically filled with this job's information"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#D32F2F]" />
                <span>Change Order</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#D32F2F]">
                  Auto-Fill
                </span>
              </button>
            </nav>
          </div>

          {/* Estimator Quick Profile Badge / Header Action */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Quick Review Sheet & Connected Script Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTemplateGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-xs"
                title="Configure Master Google Doc Template & browse all merge tags"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>Template & Tags</span>
                {templateDocId ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Master Template Connected" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setScriptModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                title="View and copy the complete Google Apps Script code with doPost(e)"
              >
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>Script Code</span>
              </button>

              <a
                href={APPSCRIPT_PROJECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title={`Connected Apps Script ID: ${APPSCRIPT_PROJECT_ID} (Click to open project editor)`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Script: {APPSCRIPT_PROJECT_ID.substring(0, 10)}...</span>
                <ExternalLink className="w-3 h-3 text-emerald-600 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => setSummaryModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors inline-flex items-center gap-1.5"
                title="View printable intake packet sheet"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Review Sheet</span>
              </button>
            </div>

            {/* Estimator Card: "Ryan Russell | Estimator | Fort Wayne Division" */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs border-2 border-[#D32F2F] shadow-xs">
                RR
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-900 leading-tight">
                  Ryan Russell
                </div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  Estimator <span className="text-slate-300">·</span> Fort Wayne Division
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'change_order' ? (
          <ChangeOrderPage
            currentJobData={formData}
            scriptUrl={SCRIPT_URL}
            onNavigateBack={() => setCurrentPage('intake')}
            onOpenScriptModal={() => setScriptModalOpen(true)}
          />
        ) : (
          <>
            {/* Change Order Callout Banner */}
            <div className="mb-6 bg-gradient-to-r from-red-50 via-amber-50 to-red-50 border border-red-200/80 rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#D32F2F] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Each Form May Require A Change Order
                    </span>
                    <span className="text-[10px] bg-red-100 text-[#D32F2F] font-bold px-2 py-0.5 rounded-full">
                      Automated Customer Sync
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {formData.customerName 
                      ? `Syncs directly with ${formData.customerName} (Job #${formData.jobNumber || 'PENDING'}). Only input the scope details and dollar amount.`
                      : 'Have scope modifications or an insurance supplement? Opens a dedicated Change Order form pre-filled with customer & job data.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('change_order')}
                className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Create Change Order</span>
              </button>
            </div>

            {/* Page Context Banner */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D32F2F]">
              <span>Official Document Automation</span>
              <span>·</span>
              <span className="text-slate-500">Google Drive & Apps Script Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Restoration Job Intake & Contract Packet Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Initiate official project files, compute 50/25/25 mobilization milestones, and trigger instant Google Drive folder creation with SRA agreements, mortgage authorizations, and production checklists.
            </p>
          </div>

          {/* View mode switch (Tabs vs Accordion) */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg self-start md:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('tabs')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'tabs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step Wizard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('accordion')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'accordion'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Form View
            </button>
          </div>
        </div>

        {/* Master Template Integration Run Banner */}
        <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-3.5 px-4 shadow-sm border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D32F2F] flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Master Google Doc Template Run Engine
                </span>
                {templateDocId ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Template Connected
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    Standard Branded Letterhead Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {templateDocId 
                  ? `Active Template: ${templateDocId.substring(0, 36)}... (clones & populates all {{tags}} directly into customer folder)` 
                  : 'Have a pre-made Google Doc template? Set it up once and the system will clone and populate it on every run.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTemplateGuideOpen(true)}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{templateDocId ? 'Manage Template & Tags' : 'Set Up Master Template'}</span>
          </button>
        </div>

        {/* 2-Column Grid: Form on Left (8 cols) + Real-time Milestone Card on Right (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ============================================================ */}
          {/* FORM CONTAINER (Col 1-8)                                      */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 space-y-6">
            {/* If in Tabs mode, render Tab Bar */}
            {viewMode === 'tabs' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 1
                      ? 'bg-white text-[#D32F2F] shadow-xs border-b-2 border-[#D32F2F]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="truncate">1. Customer & Job</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 2
                      ? 'bg-white text-[#D32F2F] shadow-xs border-b-2 border-[#D32F2F]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="truncate">2. Insurance & Adjuster</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab(3)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 3
                      ? 'bg-white text-[#D32F2F] shadow-xs border-b-2 border-[#D32F2F]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span className="truncate">3. Financials & RCV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab(4)}
                  className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 4
                      ? 'bg-white text-[#D32F2F] shadow-xs border-b-2 border-[#D32F2F]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">4. Team & Scope</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ============================================================ */}
              {/* SECTION 1: JOB & CUSTOMER PROFILE                            */}
              {/* ============================================================ */}
              {(viewMode === 'accordion' || activeTab === 1) && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div 
                    onClick={() => {
                      if (viewMode === 'accordion') {
                        setAccordionOpen((prev) => ({ ...prev, 1: !prev[1] }));
                      }
                    }}
                    className="bg-slate-50 px-6 py-4 border-b border-slate-200 border-l-4 border-l-[#D32F2F] flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                          Section 1: Job & Customer Profile
                        </h2>
                        <p className="text-xs text-slate-500">
                          Core project identification and property owner contact details
                        </p>
                      </div>
                    </div>
                    {viewMode === 'accordion' && (
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          accordionOpen[1] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {(viewMode === 'tabs' || accordionOpen[1]) && (
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        {/* Job Number */}
                        <div className="sm:col-span-5">
                          <label htmlFor="jobNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Job Number <span className="text-[#D32F2F]">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id="jobNumber"
                              type="text"
                              value={formData.jobNumber}
                              onChange={(e) => handleChange('jobNumber', e.target.value.toUpperCase())}
                              placeholder="F-26-0377-R"
                              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 font-mono font-medium focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all ${
                                formErrors.jobNumber ? 'border-[#D32F2F] bg-red-50/20' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {formErrors.jobNumber ? (
                            <p className="text-[11px] text-[#D32F2F] mt-1 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {formErrors.jobNumber}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Format: F-[YY]-[Sequential]-[R=Recon/M=Mit]
                            </p>
                          )}
                        </div>

                        {/* Customer / Property Owner Name */}
                        <div className="sm:col-span-7">
                          <label htmlFor="customerName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Customer / Property Owner Name <span className="text-[#D32F2F]">*</span>
                          </label>
                          <input
                            id="customerName"
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => handleChange('customerName', e.target.value)}
                            placeholder="e.g., Marcus & Elena Vance"
                            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all ${
                              formErrors.customerName ? 'border-[#D32F2F] bg-red-50/20' : 'border-slate-300'
                            }`}
                          />
                          {formErrors.customerName && (
                            <p className="text-[11px] text-[#D32F2F] mt-1 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {formErrors.customerName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Loss Address */}
                      <div>
                        <label htmlFor="lossAddress" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Loss Address <span className="text-[#D32F2F]">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            id="lossAddress"
                            type="text"
                            value={formData.lossAddress}
                            onChange={(e) => handleChange('lossAddress', e.target.value)}
                            placeholder="Full physical street address, city, state, zip"
                            className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all ${
                              formErrors.lossAddress ? 'border-[#D32F2F] bg-red-50/20' : 'border-slate-300'
                            }`}
                          />
                        </div>
                        {formErrors.lossAddress && (
                          <p className="text-[11px] text-[#D32F2F] mt-1 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {formErrors.lossAddress}
                          </p>
                        )}
                      </div>

                      {/* Mailing Address */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="mailingAddress" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Mailing Address <span className="text-slate-400 font-normal">(if different from loss)</span>
                          </label>
                          <button
                            type="button"
                            onClick={copyLossAddressToMailing}
                            className="text-[11px] font-semibold text-[#D32F2F] hover:underline"
                          >
                            Same as Loss Address
                          </button>
                        </div>
                        <input
                          id="mailingAddress"
                          type="text"
                          value={formData.mailingAddress}
                          onChange={(e) => handleChange('mailingAddress', e.target.value)}
                          placeholder="Mailing address for insurance drafts & notices (optional)"
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                        />
                      </div>

                      {/* Phones & Email Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Primary Phone */}
                        <div>
                          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Primary Phone <span className="text-[#D32F2F]">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleChange('phone', e.target.value)}
                              placeholder="(260) 555-0100"
                              className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all ${
                                formErrors.phone ? 'border-[#D32F2F] bg-red-50/20' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {formErrors.phone && (
                            <p className="text-[11px] text-[#D32F2F] mt-1 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {formErrors.phone}
                            </p>
                          )}
                        </div>

                        {/* Mobile / Alt Phone */}
                        <div>
                          <label htmlFor="altPhone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Mobile / Alt Phone
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="altPhone"
                              type="tel"
                              value={formData.altPhone}
                              onChange={(e) => handleChange('altPhone', e.target.value)}
                              placeholder="(260) 555-0199"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                            />
                          </div>
                        </div>

                        {/* Customer Email */}
                        <div>
                          <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Customer Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="email"
                              type="email"
                              value={formData.customerEmail}
                              onChange={(e) => handleChange('customerEmail', e.target.value)}
                              placeholder="customer@domain.com"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Next button in Tabs mode */}
                      {viewMode === 'tabs' && (
                        <div className="pt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveTab(2)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span>Continue to Insurance Info</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* SECTION 2: INSURANCE & ADJUSTER INFO                         */}
              {/* ============================================================ */}
              {(viewMode === 'accordion' || activeTab === 2) && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div 
                    onClick={() => {
                      if (viewMode === 'accordion') {
                        setAccordionOpen((prev) => ({ ...prev, 2: !prev[2] }));
                      }
                    }}
                    className="bg-slate-50 px-6 py-4 border-b border-slate-200 border-l-4 border-l-[#D32F2F] flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                          Section 2: Insurance & Adjuster Info
                        </h2>
                        <p className="text-xs text-slate-500">
                          Carrier parameters, claim identifiers, and assigned field adjuster
                        </p>
                      </div>
                    </div>
                    {viewMode === 'accordion' && (
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          accordionOpen[2] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {(viewMode === 'tabs' || accordionOpen[2]) && (
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Insurance Carrier */}
                        <div>
                          <label htmlFor="carrier" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Insurance Carrier
                          </label>
                          <input
                            id="carrier"
                            type="text"
                            value={formData.insuranceCarrier}
                            onChange={(e) => handleChange('insuranceCarrier', e.target.value)}
                            placeholder="e.g., State Farm, Erie, Auto-Owners"
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          />
                          {/* Quick suggestions */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {['State Farm', 'Erie', 'Auto-Owners', 'Self-Pay'].map((carrier) => (
                              <button
                                key={carrier}
                                type="button"
                                onClick={() => handleChange('insuranceCarrier', carrier)}
                                className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                              >
                                {carrier}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Claim Number */}
                        <div>
                          <label htmlFor="claimNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Claim Number
                          </label>
                          <input
                            id="claimNumber"
                            type="text"
                            value={formData.claimNumber}
                            onChange={(e) => handleChange('claimNumber', e.target.value)}
                            placeholder="e.g., 14-789K-42M"
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          />
                        </div>

                        {/* Policy Number */}
                        <div>
                          <label htmlFor="policyNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Policy Number
                          </label>
                          <input
                            id="policyNumber"
                            type="text"
                            value={formData.policyNumber}
                            onChange={(e) => handleChange('policyNumber', e.target.value)}
                            placeholder="e.g., HO-982144-88"
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          />
                        </div>
                      </div>

                      {/* Adjuster Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
                        {/* Primary Adjuster Name */}
                        <div>
                          <label htmlFor="adjusterName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Primary Adjuster Name
                          </label>
                          <input
                            id="adjusterName"
                            type="text"
                            value={formData.adjusterName}
                            onChange={(e) => handleChange('adjusterName', e.target.value)}
                            placeholder="e.g., Bradley Campbell"
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          />
                        </div>

                        {/* Adjuster Phone */}
                        <div>
                          <label htmlFor="adjusterPhone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Adjuster Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="adjusterPhone"
                              type="tel"
                              value={formData.adjusterPhone}
                              onChange={(e) => handleChange('adjusterPhone', e.target.value)}
                              placeholder="(317) 555-0192"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                            />
                          </div>
                        </div>

                        {/* Adjuster Email */}
                        <div>
                          <label htmlFor="adjusterEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Adjuster Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              id="adjusterEmail"
                              type="email"
                              value={formData.adjusterEmail}
                              onChange={(e) => handleChange('adjusterEmail', e.target.value)}
                              placeholder="adjuster@carrier.com"
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Broker / Agency Info */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Broker / Agency Name & Phone
                        </label>
                        <input
                          type="text"
                          value={formData.brokerInfo}
                          onChange={(e) => handleChange('brokerInfo', e.target.value)}
                          placeholder="e.g., Stuckey & Associates Insurance Agency (260) 484-2100"
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                        />
                      </div>

                      {/* Tab navigation */}
                      {viewMode === 'tabs' && (
                        <div className="pt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setActiveTab(1)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab(3)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span>Continue to Financials</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* SECTION 3: FINANCIALS & AUTO-CALCULATIONS                    */}
              {/* ============================================================ */}
              {(viewMode === 'accordion' || activeTab === 3) && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div 
                    onClick={() => {
                      if (viewMode === 'accordion') {
                        setAccordionOpen((prev) => ({ ...prev, 3: !prev[3] }));
                      }
                    }}
                    className="bg-slate-50 px-6 py-4 border-b border-slate-200 border-l-4 border-l-[#D32F2F] flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                          Section 3: Financials & Auto-Calculations
                        </h2>
                        <p className="text-xs text-slate-500">
                          Contract RCV, deductible collection status, and milestone payment schedules
                        </p>
                      </div>
                    </div>
                    {viewMode === 'accordion' && (
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          accordionOpen[3] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {(viewMode === 'tabs' || accordionOpen[3]) && (
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Contract Amount ($ RCV) */}
                        <div>
                          <label htmlFor="contractAmount" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Contract Amount ($ RCV) <span className="text-[#D32F2F]">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">$</span>
                            <input
                              id="contractAmount"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.contractAmount}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                handleChange('contractAmount', val);
                              }}
                              placeholder="0.00"
                              className={`w-full pl-8 pr-3.5 py-2.5 text-base font-bold font-mono rounded-lg border bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all ${
                                formErrors.contractAmount ? 'border-[#D32F2F] bg-red-50/20' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {formErrors.contractAmount ? (
                            <p className="text-[11px] text-[#D32F2F] mt-1 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {formErrors.contractAmount}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Total Replacement Cost Value (RCV) agreed estimate
                            </p>
                          )}
                        </div>

                        {/* Deductible Amount ($) */}
                        <div>
                          <label htmlFor="deductible" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Deductible Amount ($)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">$</span>
                            <input
                              id="deductible"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.deductibleAmount}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                handleChange('deductibleAmount', val);
                              }}
                              placeholder="0.00"
                              className="w-full pl-8 pr-3.5 py-2.5 text-base font-bold font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Homeowner out-of-pocket deductible balance
                          </p>
                        </div>
                      </div>

                      {/* Deductible Collected Radio & Carrier Check Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
                        {/* Has Deductible Been Collected? */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Has Deductible Been Collected?
                          </label>
                          <div className="flex items-center gap-3">
                            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                              formData.deductibleCollected === 'Yes'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}>
                              <input
                                type="radio"
                                name="deductibleCollected"
                                value="Yes"
                                checked={formData.deductibleCollected === 'Yes'}
                                onChange={() => handleChange('deductibleCollected', 'Yes')}
                                className="sr-only"
                              />
                              <CheckCircle className={`w-4 h-4 ${formData.deductibleCollected === 'Yes' ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>Yes, Collected</span>
                            </label>

                            <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer font-bold text-xs transition-all ${
                              formData.deductibleCollected === 'No'
                                ? 'bg-red-50 border-[#D32F2F] text-red-900 shadow-xs'
                                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                            }`}>
                              <input
                                type="radio"
                                name="deductibleCollected"
                                value="No"
                                checked={formData.deductibleCollected === 'No'}
                                onChange={() => handleChange('deductibleCollected', 'No')}
                                className="sr-only"
                              />
                              <AlertCircle className={`w-4 h-4 ${formData.deductibleCollected === 'No' ? 'text-[#D32F2F]' : 'text-slate-400'}`} />
                              <span>No (Pending)</span>
                            </label>
                          </div>
                        </div>

                        {/* Has Carrier Check Been Sent? */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Has Carrier Check Been Sent?
                          </label>
                          <select
                            value={formData.carrierCheckSent}
                            onChange={(e) => handleChange('carrierCheckSent', e.target.value as CarrierCheckStatus)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          >
                            <option value="Yes">Yes — Check Received or Sent</option>
                            <option value="No">No — Not Yet Issued by Carrier</option>
                            <option value="Pending">Pending — In Underwriting / Processing</option>
                            <option value="N/A">N/A — Self-Pay or Direct Pay</option>
                          </select>
                        </div>
                      </div>

                      {/* Conditional Deductible Collection Plan (if No) */}
                      {formData.deductibleCollected === 'No' && (
                        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5 animate-in fade-in duration-200">
                          <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                            Deductible Collection Plan / Notes <span className="text-[#D32F2F]">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={formData.deductiblePlan}
                            onChange={(e) => handleChange('deductiblePlan', e.target.value)}
                            placeholder="Specify collection arrangements: e.g., Due at material delivery, homeowner to pay via credit card on 1st mobilization day..."
                            className="w-full px-3 py-2 text-xs rounded-md border border-amber-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden"
                          />
                          <p className="text-[11px] text-amber-800">
                            Hays + Sons policy requires deductible collection prior to or at commencement of physical repairs.
                          </p>
                        </div>
                      )}

                      {/* Tab navigation */}
                      {viewMode === 'tabs' && (
                        <div className="pt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setActiveTab(2)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab(4)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span>Continue to Team Assignment</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* SECTION 4: TEAM ASSIGNMENT & LOSS PARAMETERS                 */}
              {/* ============================================================ */}
              {(viewMode === 'accordion' || activeTab === 4) && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div 
                    onClick={() => {
                      if (viewMode === 'accordion') {
                        setAccordionOpen((prev) => ({ ...prev, 4: !prev[4] }));
                      }
                    }}
                    className="bg-slate-50 px-6 py-4 border-b border-slate-200 border-l-4 border-l-[#D32F2F] flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                          Section 4: Team Assignment & Loss Parameters
                        </h2>
                        <p className="text-xs text-slate-500">
                          Hays + Sons operations crew, loss classification, and restoration scope narrative
                        </p>
                      </div>
                    </div>
                    {viewMode === 'accordion' && (
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          accordionOpen[4] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>

                  {(viewMode === 'tabs' || accordionOpen[4]) && (
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Estimator */}
                        <div>
                          <label htmlFor="estimator" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Estimator
                          </label>
                          <select
                            id="estimator"
                            value={formData.estimator}
                            onChange={(e) => handleChange('estimator', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          >
                            <option value="Ryan Russell">Ryan Russell</option>
                            <option value="Russell Shive">Russell Shive</option>
                            <option value="Kenny Belford">Kenny Belford</option>
                          </select>
                        </div>

                        {/* Supervisor / GM */}
                        <div>
                          <label htmlFor="gm" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Supervisor / GM
                          </label>
                          <select
                            id="gm"
                            value={formData.supervisor}
                            onChange={(e) => handleChange('supervisor', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          >
                            <option value="Kenny Belford">Kenny Belford</option>
                            <option value="Todd Wagner">Todd Wagner</option>
                          </select>
                        </div>

                        {/* Project Manager */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Project Manager
                          </label>
                          <input
                            type="text"
                            value={formData.projectManager}
                            onChange={(e) => handleChange('projectManager', e.target.value)}
                            placeholder="e.g., Tyler Hensley"
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          />
                        </div>
                      </div>

                      {/* Loss Type & Date of Loss */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                        {/* Primary Loss Type */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Primary Loss Type
                          </label>
                          <select
                            value={formData.lossType}
                            onChange={(e) => handleChange('lossType', e.target.value as LossType)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                          >
                            <option value="Water">Water Damage</option>
                            <option value="Fire/Smoke">Fire / Smoke Damage</option>
                            <option value="Storm/Wind">Storm / Wind Damage</option>
                            <option value="Mold">Mold Remediation</option>
                            <option value="Impact">Vehicle / Structural Impact</option>
                            <option value="Other">Other Loss Type</option>
                          </select>
                        </div>

                        {/* Date of Loss */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Date of Loss
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="date"
                              value={formData.dateOfLoss}
                              onChange={(e) => handleChange('dateOfLoss', e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Loss Narrative / Scope Summary */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Loss Narrative / Scope Summary
                        </label>
                        <textarea
                          rows={4}
                          value={formData.lossNarrative}
                          onChange={(e) => handleChange('lossNarrative', e.target.value)}
                          placeholder="Provide a concise description of cause of loss, affected rooms, structural assemblies, and restoration scope..."
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#D32F2F] focus:outline-hidden transition-all leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* PRIMARY SUBMISSION ACTION BAR                                 */}
              {/* ============================================================ */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-[#D32F2F]">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-[#D32F2F] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Ready to Generate Intake Packet?
                    </div>
                    <div className="text-xs text-slate-500">
                      Auto-builds SRA, Mortgage Auth, Production Checklist & Drive Folder
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Documents...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Generate Project Packet & Documents</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ============================================================ */}
          {/* REAL-TIME MILESTONE SIDEBAR WIDGET (Col 9-12)                */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <MilestoneWidget
              milestones={milestones}
              carrierCheckSent={formData.carrierCheckSent}
              hasDeductiblePlan={!!formData.deductiblePlan}
            />

            {/* Estimator Quick Card / Branch Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  Branch & Division
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Fort Wayne Hub
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Estimator:</span>
                  <span className="font-semibold text-slate-800">{formData.estimator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Regional Supervisor:</span>
                  <span className="font-semibold text-slate-800">{formData.supervisor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Loss Type:</span>
                  <span className="font-semibold text-slate-800">{formData.lossType}</span>
                </div>
              </div>
            </div>

            {/* Document Generation Assurance */}
            <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Submitted data connects directly to the Hays + Sons Google Apps Script repository to create and file your job documents in realtime.
              </p>
            </div>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HaysSonsBadge size="sm" />
            <div>
              <span className="font-bold text-white tracking-tight">Hays + Sons Restoration</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">We Do Restoration Right</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Official Estimator Intake System · Fort Wayne Division · Confidential Internal Portal
          </div>
        </div>
      </footer>

      {/* Submission Loading & Success Dialog Modal */}
      <SubmissionModal
        isOpen={submissionModalOpen}
        isLoading={isSubmitting}
        loadingStep={loadingStep}
        loadingMessage={loadingMessage}
        response={apiResponse}
        error={apiError}
        scriptProjectId={APPSCRIPT_PROJECT_ID}
        onOpenScriptModal={() => setScriptModalOpen(true)}
        onOpenTemplateGuide={() => setTemplateGuideOpen(true)}
        onClose={() => setSubmissionModalOpen(false)}
        onRetry={() => handleSubmit()}
        onStartNew={handleStartNew}
        onCreateChangeOrder={() => {
          setSubmissionModalOpen(false);
          setCurrentPage('change_order');
        }}
      />

      {/* Apps Script Code & Deployment Guide Modal */}
      <AppsScriptCodeModal
        isOpen={scriptModalOpen}
        onClose={() => setScriptModalOpen(false)}
        scriptProjectId={APPSCRIPT_PROJECT_ID}
        scriptUrl={SCRIPT_URL}
      />

      {/* Template Guide & Merge Tags Modal */}
      <TemplateGuideModal
        isOpen={templateGuideOpen}
        onClose={() => setTemplateGuideOpen(false)}
        templateDocId={templateDocId}
        onSaveTemplateDocId={handleSaveTemplateDocId}
        formData={formData}
        milestones={milestones}
      />

      {/* Printable Sheet Modal */}
      <JobSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        data={formData}
        milestones={milestones}
        onCreateChangeOrder={() => {
          setSummaryModalOpen(false);
          setCurrentPage('change_order');
        }}
      />
    </div>
  );
}
