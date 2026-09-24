import React from 'react';
import { 
  FolderOpen, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  PlusCircle, 
  X, 
  FileCheck2, 
  Building, 
  Mail, 
  ShieldCheck, 
  ClipboardList,
  Code
} from 'lucide-react';
import { ApiResponseData, ApiResponseFiles } from '../types';

interface SubmissionModalProps {
  isOpen: boolean;
  isLoading: boolean;
  loadingStep: number;
  loadingMessage: string;
  response: ApiResponseData | null;
  error: string | null;
  scriptProjectId?: string;
  onOpenScriptModal?: () => void;
  onClose: () => void;
  onRetry: () => void;
  onStartNew: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  isLoading,
  loadingStep,
  loadingMessage,
  response,
  error,
  scriptProjectId = "1WL8Apt_HSfeEi6Z5J_NSCrI5exG08Woa1T39Xi_Pc6L9kcgpiCRNUrh-",
  onOpenScriptModal,
  onClose,
  onRetry,
  onStartNew,
}) => {
  if (!isOpen) return null;

  const loadingSteps = [
    { id: 1, title: 'Generating Job Packet Folder...', desc: 'Creating dedicated Google Drive directory' },
    { id: 2, title: 'Building SRA & Mortgage Authorization...', desc: 'Generating customized legal agreements' },
    { id: 3, title: 'Populating Production Checklist...', desc: 'Structuring milestones & mobilization steps' },
    { id: 4, title: 'Finalizing Customer Welcome Letter...', desc: 'Attaching estimator profile & policy contacts' },
  ];

  const files: ApiResponseFiles = response?.files || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top brand header */}
        <div className="bg-[#111827] text-white px-6 py-4 border-t-4 border-[#D32F2F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D32F2F] flex items-center justify-center font-bold text-white text-lg">
              H+
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white uppercase">
                {isLoading 
                  ? 'Project File Creation In Progress' 
                  : error 
                    ? 'Submission Issue Detected' 
                    : 'Project Packet Generated Successfully'}
              </h2>
              <p className="text-xs text-slate-400">
                Hays + Sons Document Automation Engine
              </p>
            </div>
          </div>
          {!isLoading && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* 1. LOADING STATE */}
          {isLoading && (
            <div className="py-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-red-50 text-[#D32F2F] mb-1 animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {loadingMessage}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Communicating with Google Apps Script to construct drive folders, merge templates, and calculate legal payment milestones.
                </p>
              </div>

              {/* Step indicator */}
              <div className="space-y-3 max-w-lg mx-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
                {loadingSteps.map((step) => {
                  const isDone = loadingStep > step.id;
                  const isCurrent = loadingStep === step.id;

                  return (
                    <div 
                      key={step.id} 
                      className={`flex items-start gap-3 transition-opacity ${
                        isDone ? 'opacity-100' : isCurrent ? 'opacity-100 font-semibold' : 'opacity-40'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#D32F2F] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            {step.id}
                          </div>
                        )}
                      </div>
                      <div className="text-left text-xs">
                        <div className={isCurrent ? 'text-slate-900 font-bold' : isDone ? 'text-slate-800' : 'text-slate-500'}>
                          {step.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. ERROR STATE */}
          {!isLoading && error && (
            <div className="py-4 space-y-5">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#D32F2F] shrink-0 mt-0.5" />
                <div className="space-y-2 text-left">
                  <h4 className="text-sm font-bold text-red-900">
                    Connection or Processing Error
                  </h4>
                  <p className="text-xs text-red-800 leading-relaxed font-medium">
                    {error}
                  </p>

                  <div className="p-3 bg-white/90 border border-red-200 rounded-md text-[11px] text-slate-700 space-y-1.5 mt-2">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Quick Resolution Checklist:</span>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>
                        Open your Google Apps Script project{' '}
                        {scriptProjectId && (
                          <a
                            href={`https://script.google.com/d/${scriptProjectId}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-[#D32F2F] hover:underline"
                          >
                            <span>(Project: {scriptProjectId.substring(0, 10)}...)</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}.
                      </li>
                      <li>Click <strong className="text-slate-800">Deploy &gt; Manage deployments</strong>.</li>
                      <li>Click the <strong className="text-slate-800">Edit (pencil icon)</strong> next to the active Web App deployment.</li>
                      <li>Confirm <strong className="text-slate-800">Execute as:</strong> is set to <span className="font-semibold text-slate-800">"Me"</span>.</li>
                      <li>Confirm <strong className="text-slate-800">Who has access:</strong> is set to <span className="font-semibold text-[#D32F2F]">"Anyone"</span> (if set to "Only myself", external app requests will be blocked by Google).</li>
                      <li>Click <strong className="text-slate-800">Deploy</strong> to save changes.</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {onOpenScriptModal && (
                  <button
                    type="button"
                    onClick={onOpenScriptModal}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <Code className="w-4 h-4 text-emerald-600" />
                    <span>View / Copy Script Code</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Submission
                </button>
              </div>
            </div>
          )}

          {/* 3. SUCCESS STATE */}
          {!isLoading && response?.success && (
            <div className="py-2 space-y-6">
              {/* Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3.5">
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950">
                    Project Packet Initialized & Filed
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                    All contract agreements, mortgage disclosures, and production checklists have been generated and filed in the Hays + Sons Drive repository.
                  </p>
                  {response.message && (
                    <p className="text-[11px] text-emerald-700 font-mono mt-1">
                      {response.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Main Drive Folder Action */}
              {response.folderUrl && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Primary Repository
                      </div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{response.customerName ? `Folder: ${response.customerName}` : 'Google Drive Project Folder'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm">
                        {response.folderUrl}
                      </div>
                    </div>
                  </div>

                  <a
                    href={response.folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#111827] hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-2 shrink-0"
                  >
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    <span>Open Drive Project Folder</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              )}

              {/* Document Quick Links Grid */}
              <div className="space-y-3 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#D32F2F]" />
                  <span>Generated Contract Documents</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* SRA */}
                  <a
                    href={files.sraUrl || response.folderUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-[#D32F2F] hover:shadow-md transition-all group flex items-start justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-[#D32F2F] mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#D32F2F]">
                          View Structural Repair Agreement (SRA)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Includes 50/25/25 payment terms & scope
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D32F2F] shrink-0" />
                  </a>

                  {/* Mortgage Auth */}
                  <a
                    href={files.mortgageAuthUrl || response.folderUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-[#D32F2F] hover:shadow-md transition-all group flex items-start justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <Building className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#D32F2F]">
                          View Mortgage Auth
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Escrow endorsement & draft release form
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D32F2F] shrink-0" />
                  </a>

                  {/* Production Checklist */}
                  <a
                    href={files.productionChecklistUrl || response.folderUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-[#D32F2F] hover:shadow-md transition-all group flex items-start justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <ClipboardList className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#D32F2F]">
                          View Production Checklist
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Hand-off checklist for Project Manager
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D32F2F] shrink-0" />
                  </a>

                  {/* Welcome Letter */}
                  <a
                    href={files.welcomeLetterUrl || response.folderUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-[#D32F2F] hover:shadow-md transition-all group flex items-start justify-between"
                  >
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#D32F2F]">
                          View Customer Welcome Letter
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Personalized restoration guide & expectations
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D32F2F] shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Dismiss
          </button>

          {!isLoading && (
            <button
              type="button"
              onClick={onStartNew}
              className="px-4 py-2 text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Intake</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
