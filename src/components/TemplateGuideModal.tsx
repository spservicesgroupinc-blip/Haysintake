/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Sparkles, 
  Search, 
  FolderCheck, 
  Layers, 
  ArrowRight, 
  HelpCircle,
  FileCode,
  CheckCircle2,
  Bookmark,
  Share2
} from 'lucide-react';
import { IntakeFormData, CalculatedMilestones } from '../types';

interface TemplateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateDocId: string;
  onSaveTemplateDocId: (id: string) => void;
  formData: IntakeFormData;
  milestones: CalculatedMilestones;
}

export const MERGE_TAGS = [
  // Customer & Job Profile
  { tag: '{{CUSTOMER_NAME}}', label: 'Customer / Owner Name', category: 'Customer', sample: 'Marcus & Elena Vance', description: 'Full customer name or business property entity' },
  { tag: '{{JOB_NUMBER}}', label: 'Job Number', category: 'Customer', sample: 'F-26-0377-R', description: 'Unique Hays + Sons job file number' },
  { tag: '{{LOSS_ADDRESS}}', label: 'Loss Property Address', category: 'Customer', sample: '4821 Rothman Rd, Fort Wayne, IN 46835', description: 'Address where damage occurred' },
  { tag: '{{MAILING_ADDRESS}}', label: 'Mailing Address', category: 'Customer', sample: '4821 Rothman Rd, Fort Wayne, IN 46835', description: 'Customer billing or correspondence address' },
  { tag: '{{PHONE}}', label: 'Primary Phone', category: 'Customer', sample: '(260) 414-8829', description: 'Customer primary telephone number' },
  { tag: '{{ALT_PHONE}}', label: 'Secondary / Cell Phone', category: 'Customer', sample: '(260) 414-9930', description: 'Spouse, tenant, or alternate number' },
  { tag: '{{EMAIL}}', label: 'Customer Email', category: 'Customer', sample: 'm.vance@example.com', description: 'Customer primary email address' },

  // Insurance & Adjuster
  { tag: '{{INSURANCE_CARRIER}}', label: 'Insurance Carrier', category: 'Insurance', sample: 'State Farm Fire & Casualty', description: 'Underwriting insurance company' },
  { tag: '{{CLAIM_NUMBER}}', label: 'Claim Number', category: 'Insurance', sample: 'SF-99210-44A', description: 'Carrier loss claim identifier' },
  { tag: '{{POLICY_NUMBER}}', label: 'Policy Number', category: 'Insurance', sample: 'HO-8849201-9', description: 'Homeowners or commercial policy number' },
  { tag: '{{ADJUSTER_NAME}}', label: 'Primary Adjuster Name', category: 'Insurance', sample: 'David Miller', description: 'Insurance desk or field adjuster' },
  { tag: '{{ADJUSTER_PHONE}}', label: 'Adjuster Phone', category: 'Insurance', sample: '(317) 555-0142', description: 'Direct phone number for adjuster' },
  { tag: '{{ADJUSTER_EMAIL}}', label: 'Adjuster Email', category: 'Insurance', sample: 'david.miller@statefarm.com', description: 'Direct email for adjuster' },
  { tag: '{{BROKER_INFO}}', label: 'Broker / Agency Info', category: 'Insurance', sample: 'Midwest Insurance Partners', description: 'Local agent or broker details' },

  // Financials & Milestone Payments
  { tag: '{{CONTRACT_AMOUNT}}', label: 'Total Contract RCV ($)', category: 'Financials', sample: '$38,450.00', description: 'Gross replacement cost value of contract' },
  { tag: '{{DOWN_PAYMENT_50}}', label: '50% Down Payment ($)', category: 'Financials', sample: '$19,225.00', description: 'Initial mobilization deposit (50%)' },
  { tag: '{{MIDPOINT_25}}', label: '25% Mid-Point Draw ($)', category: 'Financials', sample: '$9,612.50', description: 'Progress draw at drywall / mechanical rough-in' },
  { tag: '{{COMPLETION_25}}', label: '25% Final Completion ($)', category: 'Financials', sample: '$9,612.50', description: 'Final balance due at punch-list signoff' },
  { tag: '{{DEDUCTIBLE}}', label: 'Policy Deductible ($)', category: 'Financials', sample: '$1,000.00', description: 'Customer out-of-pocket deductible portion' },
  { tag: '{{INSURANCE_PORTION}}', label: 'Insurance Net Portion ($)', category: 'Financials', sample: '$37,450.00', description: 'Contract amount minus customer deductible' },
  { tag: '{{DEDUCTIBLE_COLLECTED}}', label: 'Deductible Collected', category: 'Financials', sample: 'Yes', description: 'Whether deductible was collected at signing' },
  { tag: '{{DEDUCTIBLE_PLAN}}', label: 'Deductible Payment Plan', category: 'Financials', sample: 'Check #1042 collected at signing', description: 'Plan or notes on deductible collection' },
  { tag: '{{CARRIER_CHECK_SENT}}', label: 'Carrier Check Status', category: 'Financials', sample: 'Pending', description: 'Status of carrier loss draft check' },

  // Scope & Loss Parameters
  { tag: '{{LOSS_TYPE}}', label: 'Type of Loss', category: 'Loss & Scope', sample: 'Water', description: 'Water, Fire/Smoke, Storm/Wind, Mold, Impact, Other' },
  { tag: '{{DATE_OF_LOSS}}', label: 'Date of Loss', category: 'Loss & Scope', sample: '09/18/2026', description: 'Date property damage occurred' },
  { tag: '{{LOSS_NARRATIVE}}', label: 'Loss Scope Narrative', category: 'Loss & Scope', sample: 'Upstairs master bath supply line ruptured...', description: 'Summary of damage scope and affected areas' },

  // Team & Hays + Sons Contact
  { tag: '{{ESTIMATOR_NAME}}', label: 'Project Estimator', category: 'Team & Office', sample: 'Ryan Russell', description: 'Dedicated Hays + Sons Estimator' },
  { tag: '{{ESTIMATOR_TITLE}}', label: 'Estimator Title', category: 'Team & Office', sample: 'Estimator', description: 'Estimator corporate title' },
  { tag: '{{ESTIMATOR_CELL}}', label: 'Estimator Cell Phone', category: 'Team & Office', sample: '260.210.0415', description: 'Direct mobile phone from business card' },
  { tag: '{{ESTIMATOR_EMAIL}}', label: 'Estimator Email', category: 'Team & Office', sample: 'rrussell@haysandsons.com', description: 'Estimator direct email address' },
  { tag: '{{SUPERVISOR_NAME}}', label: 'General Manager', category: 'Team & Office', sample: 'Kenny Belford', description: 'Fort Wayne Division General Manager' },
  { tag: '{{PROJECT_MANAGER}}', label: 'Project Manager', category: 'Team & Office', sample: 'Unassigned', description: 'Production project manager assigned to job' },
  { tag: '{{COMPANY_NAME}}', label: 'Company Name', category: 'Team & Office', sample: 'Hays + Sons', description: 'Hays + Sons Restoration' },
  { tag: '{{DIVISION}}', label: 'Division Office', category: 'Team & Office', sample: 'Fort Wayne Division', description: 'Local operational branch' },
  { tag: '{{OFFICE_PHONE}}', label: 'Division Office Phone', category: 'Team & Office', sample: '260.471.9110', description: 'Main office line from business card' },
  { tag: '{{OFFICE_ADDRESS}}', label: 'Office Address', category: 'Team & Office', sample: '909 Production Rd., Fort Wayne, IN 46808', description: 'Local branch dispatch facility' },
  { tag: '{{WEBSITE}}', label: 'Company Website', category: 'Team & Office', sample: 'haysandsons.com', description: 'Official corporate website' },

  // Dates & System
  { tag: '{{DATE_TODAY}}', label: 'Current Date', category: 'System', sample: new Date().toLocaleDateString('en-US'), description: 'Current system execution date (MM/DD/YYYY)' },
  { tag: '{{YEAR_TODAY}}', label: 'Current Year', category: 'System', sample: new Date().getFullYear().toString(), description: 'Current calendar year' },
];

export const SAMPLE_TEMPLATE_MARKDOWN = `# HAYS + SONS RESTORATION AGREEMENT & JOB PACKET
**Fort Wayne Division** · 909 Production Rd., Fort Wayne, IN 46808 · (260) 471-9110

---
### 1. PROPERTY OWNER & LOSS IDENTIFICATION
- **Customer / Property Owner:** {{CUSTOMER_NAME}}
- **Job Reference Number:** {{JOB_NUMBER}}
- **Property Loss Address:** {{LOSS_ADDRESS}}
- **Primary Contact Phone:** {{PHONE}}
- **Customer Email:** {{EMAIL}}
- **Type of Loss:** {{LOSS_TYPE}}
- **Date of Loss:** {{DATE_OF_LOSS}}

### 2. INSURANCE CLAIM SPECIFICATIONS
- **Insurance Carrier:** {{INSURANCE_CARRIER}}
- **Claim Number:** {{CLAIM_NUMBER}}
- **Policy Number:** {{POLICY_NUMBER}}
- **Assigned Adjuster:** {{ADJUSTER_NAME}} | Phone: {{ADJUSTER_PHONE}} | Email: {{ADJUSTER_EMAIL}}

### 3. CONTRACT SUM & PAYMENT MILESTONES
- **Total Contract RCV:** {{CONTRACT_AMOUNT}}
- **Customer Deductible:** {{DEDUCTIBLE}} (Collected: {{DEDUCTIBLE_COLLECTED}})
- **Net Insurance Proceeds:** {{INSURANCE_PORTION}}
- **Phase I (50% Down Payment Mobilization):** {{DOWN_PAYMENT_50}}
- **Phase II (25% Mid-Point Draw):** {{MIDPOINT_25}}
- **Phase III (25% Final Completion Balance):** {{COMPLETION_25}}

### 4. SCOPE OF RESTORATION WORK
{{LOSS_NARRATIVE}}

### 5. AUTHORIZATION & SIGNATURES
By signing below, Property Owner authorizes Hays + Sons to perform the agreed restoration services in accordance with the 50/25/25 milestone schedule:

Property Owner Signature: ___________________________________   Date: {{DATE_TODAY}}
Hays + Sons Representative: {{ESTIMATOR_NAME}} ({{ESTIMATOR_CELL}})   Date: {{DATE_TODAY}}
`;

export const TemplateGuideModal: React.FC<TemplateGuideModalProps> = ({
  isOpen,
  onClose,
  templateDocId,
  onSaveTemplateDocId,
  formData,
  milestones,
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'tags' | 'preview' | 'starter'>('plan');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedStarter, setCopiedStarter] = useState(false);
  const [localTemplateInput, setLocalTemplateInput] = useState(templateDocId || '');
  const [isSaved, setIsSaved] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setLocalTemplateInput(templateDocId || '');
  }, [templateDocId]);

  if (!isOpen) return null;

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const handleCopyStarter = () => {
    navigator.clipboard.writeText(SAMPLE_TEMPLATE_MARKDOWN);
    setCopiedStarter(true);
    setTimeout(() => setCopiedStarter(false), 2000);
  };

  const handleSaveTemplateInput = () => {
    onSaveTemplateDocId(localTemplateInput.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Filtered tags
  const filteredTags = MERGE_TAGS.filter((item) => {
    const matchesSearch = 
      item.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Customer', 'Insurance', 'Financials', 'Loss & Scope', 'Team & Office', 'System'];

  // Current values mapping for Live Preview
  const liveValues: { [key: string]: string } = {
    '{{CUSTOMER_NAME}}': formData.customerName || '[Customer Name Not Entered]',
    '{{JOB_NUMBER}}': formData.jobNumber || '[Job Number Not Entered]',
    '{{LOSS_ADDRESS}}': formData.lossAddress || '[Loss Address Not Entered]',
    '{{MAILING_ADDRESS}}': formData.mailingAddress || formData.lossAddress || '[Mailing Address]',
    '{{PHONE}}': formData.phone || '[Phone Not Entered]',
    '{{ALT_PHONE}}': formData.altPhone || 'N/A',
    '{{EMAIL}}': formData.customerEmail || '[Email Not Entered]',
    '{{INSURANCE_CARRIER}}': formData.insuranceCarrier || '[Carrier Not Entered]',
    '{{CLAIM_NUMBER}}': formData.claimNumber || '[Claim # Not Entered]',
    '{{POLICY_NUMBER}}': formData.policyNumber || '[Policy # Not Entered]',
    '{{ADJUSTER_NAME}}': formData.adjusterName || 'Pending Assignment',
    '{{ADJUSTER_PHONE}}': formData.adjusterPhone || 'On File',
    '{{ADJUSTER_EMAIL}}': formData.adjusterEmail || 'On File',
    '{{BROKER_INFO}}': formData.brokerInfo || 'N/A',
    '{{CONTRACT_AMOUNT}}': milestones.totalContractRcv ? `$${milestones.totalContractRcv.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    '{{DOWN_PAYMENT_50}}': milestones.downPayment50 ? `$${milestones.downPayment50.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    '{{MIDPOINT_25}}': milestones.midPoint25 ? `$${milestones.midPoint25.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    '{{COMPLETION_25}}': milestones.completion25 ? `$${milestones.completion25.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00',
    '{{DEDUCTIBLE}}': `$${milestones.deductibleAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    '{{INSURANCE_PORTION}}': `$${milestones.insurancePortion.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    '{{DEDUCTIBLE_COLLECTED}}': formData.deductibleCollected,
    '{{DEDUCTIBLE_PLAN}}': formData.deductiblePlan || 'Standard terms',
    '{{CARRIER_CHECK_SENT}}': formData.carrierCheckSent,
    '{{LOSS_TYPE}}': formData.lossType,
    '{{DATE_OF_LOSS}}': formData.dateOfLoss || 'Recent',
    '{{LOSS_NARRATIVE}}': formData.lossNarrative || 'Standard emergency mitigation & structural reconstruction.',
    '{{ESTIMATOR_NAME}}': formData.estimator || 'Ryan Russell',
    '{{ESTIMATOR_TITLE}}': 'Estimator',
    '{{ESTIMATOR_CELL}}': '260.210.0415',
    '{{ESTIMATOR_EMAIL}}': 'rrussell@haysandsons.com',
    '{{SUPERVISOR_NAME}}': formData.supervisor || 'Kenny Belford',
    '{{PROJECT_MANAGER}}': formData.projectManager || 'Unassigned',
    '{{COMPANY_NAME}}': 'Hays + Sons',
    '{{DIVISION}}': 'Fort Wayne Division',
    '{{OFFICE_PHONE}}': '260.471.9110',
    '{{OFFICE_ADDRESS}}': '909 Production Rd., Fort Wayne, IN 46808',
    '{{WEBSITE}}': 'haysandsons.com',
    '{{DATE_TODAY}}': new Date().toLocaleDateString('en-US'),
    '{{YEAR_TODAY}}': new Date().getFullYear().toString(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-[#111827] text-white px-6 py-4 border-t-4 border-[#D32F2F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D32F2F] to-[#991B1B] flex items-center justify-center font-bold text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white uppercase">
                  Google Doc Template & Merge Tag Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-300 border border-red-500/40">
                  Custom Template Run Plan
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure your master Google Doc template to automatically clone and populate for each job run
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Input Bar */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-2xl">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Active Master Google Doc Template (URL or Document ID):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={localTemplateInput}
                  onChange={(e) => setLocalTemplateInput(e.target.value)}
                  placeholder="Paste Google Doc URL (e.g. https://docs.google.com/document/d/1Xyz.../edit) or Doc ID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-[#D32F2F]"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveTemplateInput}
                className="px-3 py-1.5 rounded-lg bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved for Runs!' : 'Save Template'}</span>
              </button>
            </div>
          </div>
          {localTemplateInput && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 shrink-0 self-end md:self-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Template Active for Submissions</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'plan'
                ? 'border-[#D32F2F] text-[#D32F2F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Execution Plan (How It Runs)</span>
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tags'
                ? 'border-[#D32F2F] text-[#D32F2F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Available Merge Tags ({MERGE_TAGS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-[#D32F2F] text-[#D32F2F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Tag Fill Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('starter')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'starter'
                ? 'border-[#D32F2F] text-[#D32F2F] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Pre-Made Template Copy</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* TAB 1: THE EXECUTION PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D32F2F]" />
                  Architecture: How Your Template Is Used For Each Run
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Instead of generating a static document from scratch, the system uses your Google Doc as a master blueprint. 
                  Every time you submit an intake in the portal or through Google Forms, the script executes the following automated pipeline:
                </p>

                {/* 4 Step Visual Workflow */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs mb-2">
                        1
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Dedicated Customer Folder</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Creates a folder in Google Drive named strictly after the customer (e.g. <code>Marcus & Elena Vance</code>).
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <FolderCheck className="w-3.5 h-3.5 text-blue-600" />
                      Drive Isolation
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs mb-2">
                        2
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Clone Template File</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Clones your Master Google Doc Template directly into the customer's new folder, preserving all original tables and fonts.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5 text-amber-600" />
                      Zero Template Overwrite
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs mb-2">
                        3
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Merge Tag Replacement</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Scans the entire document (body, tables, headers, footers) and replaces tags like <code>{`{{CUSTOMER_NAME}}`}</code> with the live job data.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Full Body & Tables
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-7 h-7 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-bold text-xs mb-2">
                        4
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Immediate Deliverable</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Saves document, returns direct link in the portal modal, and logs the customer folder in the Master Sheet.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                      1-Click Doc Access
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Step Action Plan to Set Up Your Google Doc Template */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Step-by-Step Setup Plan:
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      A
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Open or Create Your Master Google Doc</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        In your Google Drive, create or open your existing Structural Repair Agreement (SRA), Work Authorization, or Intake Packet document. 
                        Make sure the sharing setting is accessible to your Google account (or set to "Anyone with link can view").
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      B
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Add Merge Tags with Double Curly Brackets</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Wherever you want customer or claim details to appear, place the corresponding merge tag:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1.5 font-mono text-[11px]">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">{`{{CUSTOMER_NAME}}`}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">{`{{JOB_NUMBER}}`}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">{`{{LOSS_ADDRESS}}`}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">{`{{CONTRACT_AMOUNT}}`}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">{`{{DOWN_PAYMENT_50}}`}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">{`{{ESTIMATOR_NAME}}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      C
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Paste Template Link & Run</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Paste the Google Doc link into the input bar above and click <strong className="text-slate-800">Save Template</strong> (or paste into Apps Script <code>PropertiesService</code> under <code>MASTER_TEMPLATE_ID</code>). 
                        Whenever you click <strong className="text-slate-800">Submit Project File</strong> in the portal, your template will be copied, filled, and returned immediately!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MERGE TAGS DIRECTORY */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              {/* Filter and search */}
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search merge tags or fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#D32F2F]"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#111827] text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredTags.map((item) => (
                  <div
                    key={item.tag}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-start justify-between gap-3 hover:border-slate-300 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#D32F2F] bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        {item.label}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Sample output: <span className="text-slate-600 font-medium">{item.sample}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTag(item.tag)}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                      title="Copy tag"
                    >
                      {copiedTag === item.tag ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE PREVIEW OF CURRENT FORM FILL */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase">
                      Current Intake Form Mapping
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      This shows the live values currently typed in the intake form that will replace the merge tags in your template:
                    </p>
                  </div>
                  <div className="text-xs font-bold text-[#D32F2F] bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    Job: {formData.jobNumber || 'PENDING'}
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Template Merge Tag</th>
                        <th className="py-2 px-3">Field Label</th>
                        <th className="py-2 px-3">Live Replaced Value in Output Doc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {MERGE_TAGS.map((item) => (
                        <tr key={item.tag} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                            {item.tag}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600 text-xs">
                            {item.label}
                          </td>
                          <td className="py-1.5 px-3 font-medium text-slate-900 text-xs">
                            {liveValues[item.tag] || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRE-MADE TEMPLATE STARTER */}
          {activeTab === 'starter' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    Ready-to-Use Hays + Sons SRA & Job Packet Starter
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Copy this text and paste it into a blank Google Doc to create an instant template with all tags in place:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyStarter}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                    copiedStarter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white'
                  }`}
                >
                  {copiedStarter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStarter ? 'Copied Template Text!' : 'Copy Template Text'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-800">
                <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">
                  {SAMPLE_TEMPLATE_MARKDOWN}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {localTemplateInput ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                Template will be duplicated and filled for each run
              </span>
            ) : (
              <span className="text-slate-500">
                Tip: Paste your Google Doc template link above to run with custom templates
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateGuideModal;
