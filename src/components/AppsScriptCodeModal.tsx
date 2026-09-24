/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, X, Code, AlertTriangle, Sparkles, CheckCircle2, ShieldCheck, Palette, FileText } from 'lucide-react';

interface AppsScriptCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptProjectId: string;
  scriptUrl: string;
}

export const COMPLETE_APPS_SCRIPT_CODE = `/**
 * HAYS + SONS - EXECUTIVE INTAKE & PACKET AUTOMATION ENGINE (v3.0)
 * Official Fort Wayne Division Branding & Professional Styling Engine
 *
 * Automatically generates:
 * 1. Isolated Drive Folder named by Customer Name
 * 2. Executive Customer Welcome Letter & Claims Roadmap
 * 3. Formal Mortgage Authorization & Loss Draft Release
 * 4. Structural Repair Agreement (Indiana) with 50/25/25 Milestones
 * 5. Production Mobilization & Quality Verification Checklist
 *
 * Project ID: 1WL8Apt_HSfeEi6Z5J_NSCrI5exG08Woa1T39Xi_Pc6L9kcgpiCRNUrh-
 */

// -------------------------------------------------------------
// BRAND DESIGN CONSTANTS (Matched to Hays + Sons Business Card)
// -------------------------------------------------------------
var BRAND = {
  RED: '#D32F2F',         // Hays Crimson Red
  DARK: '#111827',        // Charcoal / Dark Slate
  TEXT_MAIN: '#1E293B',   // Deep slate body text
  TEXT_MUTED: '#64748B',  // Slate secondary text
  BG_LIGHT: '#F8FAFC',    // Soft slate table background
  BORDER: '#CBD5E1',      // Professional subtle border
  WHITE: '#FFFFFF',
  
  // Official Business Card Information
  COMPANY_NAME: 'Hays + Sons',
  TAGLINE: 'We Do Restoration Right',
  DIVISION: 'Fort Wayne Division',
  ADDRESS: '909 Production Rd., Fort Wayne, IN 46808',
  OFFICE_PHONE: '260.471.9110',
  CELL_PHONE: '260.210.0415',
  ESTIMATOR_NAME: 'Ryan Russell',
  ESTIMATOR_TITLE: 'Estimator',
  ESTIMATOR_EMAIL: 'rrussell@haysandsons.com',
  GM_NAME: 'Kenny Belford',
  GM_TITLE: 'General Manager',
  WEBSITE: 'haysandsons.com'
};

// -------------------------------------------------------------
// WEB APP API ENTRY POINT (Invoked by Estimator Web Portal)
// -------------------------------------------------------------
function doPost(e) {
  try {
    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (err) {
        rawData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    var result = processIntakeData(rawData);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    var errorResult = {
      success: false,
      error: error.message || error.toString()
    };
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Health Check Endpoint
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ONLINE',
    service: 'Hays + Sons Executive Document Engine',
    version: '3.0 - Branded Edition',
    brand: BRAND.COMPANY_NAME + ' - ' + BRAND.TAGLINE,
    estimator: BRAND.ESTIMATOR_NAME,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// CORE PROCESSOR: FOLDER CREATION & DOCUMENT GENERATION
// -------------------------------------------------------------
function processIntakeData(data) {
  // 1. Hub Folder setup
  var hubFolderId = PropertiesService.getScriptProperties().getProperty('HUB_FOLDER_ID');
  var rootFolder;
  if (hubFolderId) {
    try {
      rootFolder = DriveApp.getFolderById(hubFolderId);
    } catch (fErr) {
      rootFolder = null;
    }
  }
  if (!rootFolder) {
    var folders = DriveApp.getFoldersByName('Hays + Sons - Job Packets Hub');
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder('Hays + Sons - Job Packets Hub');
    }
    PropertiesService.getScriptProperties().setProperty('HUB_FOLDER_ID', rootFolder.getId());
  }

  // 2. Normalize Incoming Data
  var jobNum = (data.jobNumber || data['Job Number'] || 'PENDING').toString().trim().toUpperCase();
  var clientName = (data.customerName || data['Customer Name'] || 'Client').toString().trim();
  var address = (data.lossAddress || data['Loss Address'] || 'Property Address').toString().trim();
  var phone = (data.phone || data['Phone Number'] || '').toString().trim();
  var altPhone = (data.altPhone || data['Alt / Mobile Phone Number'] || '').toString().trim();
  var email = (data.customerEmail || data['Customer Email'] || '').toString().trim();
  var carrier = (data.carrier || data['Insurance Carrier'] || 'Pending Carrier').toString().trim();
  var claimNum = (data.claimNumber || data['Claim #'] || 'Pending').toString().trim();
  var policyNum = (data.policyNumber || data['Policy #'] || 'Pending').toString().trim();
  var adjuster = (data.adjusterName || data['Primary Adjuster Name'] || '').toString().trim();
  var adjPhone = (data.adjusterPhone || data['Adjuster Phone Number'] || '').toString().trim();
  var adjEmail = (data.adjusterEmail || data['Adjuster Email'] || '').toString().trim();
  var lossType = (data.lossType || 'Water').toString().trim();
  var dateOfLoss = (data.dateOfLoss || 'Recent').toString().trim();
  
  var rawContractAmt = (data.contractAmount || data['Contract Amount ($)'] || '0').toString().replace(/[^0-9.]/g, '');
  var contractAmt = parseFloat(rawContractAmt) || 0;
  var rawDeductible = (data.deductible || data['Deductible Amount ($)'] || '0').toString().replace(/[^0-9.]/g, '');
  var deductible = parseFloat(rawDeductible) || 0;
  
  var estimator = (data.estimator || BRAND.ESTIMATOR_NAME).toString().trim();
  var gm = (data.gm || data.supervisor || BRAND.GM_NAME).toString().trim();

  // Milestone Calculations
  var downPayment = (contractAmt * 0.50).toFixed(2);
  var midPayment = (contractAmt * 0.25).toFixed(2);
  var insPortion = (contractAmt - deductible).toFixed(2);
  var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Indiana/Indianapolis', 'MM/dd/yyyy');

  // 3. Create Folder named strictly by Customer Name
  var folderName = clientName ? clientName : (jobNum || 'New Client Packet');
  var currentJobFolder = rootFolder.createFolder(folderName);

  // 4. Generate all 4 Executive Branded Documents
  var welcomeDoc = generateWelcomeLetter(currentJobFolder, jobNum, clientName, address, phone, email, carrier, claimNum, gm, estimator, todayStr);
  var mortgageDoc = generateMortgageAuth(currentJobFolder, jobNum, clientName, address, phone, carrier, claimNum, policyNum, todayStr);
  var sraDoc = generateSRA(currentJobFolder, jobNum, clientName, address, phone, email, todayStr, contractAmt, insPortion, deductible, downPayment, midPayment, adjuster, claimNum, carrier, estimator, gm);
  var checklistDoc = generateProductionChecklist(currentJobFolder, jobNum, clientName, address, phone, email, deductible, carrier, adjuster, adjPhone, adjEmail, claimNum, contractAmt, downPayment, estimator, gm, lossType, dateOfLoss);

  // 5. Append to Master Google Sheet if configured
  try {
    var masterSheetId = PropertiesService.getScriptProperties().getProperty('MASTER_SHEET_ID');
    if (masterSheetId) {
      var sheet = SpreadsheetApp.openById(masterSheetId).getActiveSheet();
      sheet.appendRow([
        new Date(),
        jobNum,
        clientName,
        address,
        phone,
        email,
        carrier,
        claimNum,
        contractAmt,
        deductible,
        downPayment,
        estimator,
        gm,
        currentJobFolder.getUrl()
      ]);
    }
  } catch (sheetErr) {
    Logger.log('Optional sheet logging notice: ' + sheetErr.toString());
  }

  return {
    success: true,
    folderUrl: currentJobFolder.getUrl(),
    jobNumber: jobNum,
    customerName: clientName,
    files: {
      welcomeLetterUrl: welcomeDoc.getUrl(),
      mortgageAuthUrl: mortgageDoc.getUrl(),
      sraUrl: sraDoc.getUrl(),
      productionChecklistUrl: checklistDoc.getUrl()
    },
    message: 'Job folder "' + folderName + '" and 4 executive branded documents created successfully.'
  };
}

// -------------------------------------------------------------
// GOOGLE FORM TRIGGER HANDLER (Backwards compatible)
// -------------------------------------------------------------
function onNewIntakeSubmitted(e) {
  var values = e.namedValues;
  var flatData = {};
  for (var key in values) {
    flatData[key] = (values[key] && values[key][0]) ? values[key][0] : '';
  }
  processIntakeData(flatData);
}

// -------------------------------------------------------------
// EXECUTIVE BRANDING ENGINE & LETTERHEAD BUILDER
// -------------------------------------------------------------
function applyExecutiveLetterhead(doc, docTitle, docSubtitle, jobNum, dateStr) {
  var body = doc.getBody();
  
  // 0.5-inch professional margins
  body.setMarginTop(36);
  body.setMarginBottom(36);
  body.setMarginLeft(40);
  body.setMarginRight(40);

  // Top Letterhead Header Table (2 Columns)
  var headerTable = body.appendTable([
    ['', '']
  ]);
  headerTable.setBorderWidth(0);

  var leftCell = headerTable.getRow(0).getCell(0);
  var rightCell = headerTable.getRow(0).getCell(1);
  leftCell.setPaddingTop(0).setPaddingBottom(4).setPaddingLeft(0).setPaddingRight(10);
  rightCell.setPaddingTop(0).setPaddingBottom(4).setPaddingLeft(10).setPaddingRight(0);

  // LEFT COLUMN: Hays + Sons Logo & Slogan
  var pLogo = leftCell.appendParagraph('');
  pLogo.setSpacingBefore(0).setSpacingAfter(2);
  var tHays = pLogo.appendText('Hays ');
  tHays.setFontFamily('Arial').setFontSize(22).setBold(true).setForegroundColor(BRAND.DARK);
  var tPlus = pLogo.appendText('+');
  tPlus.setFontFamily('Arial').setFontSize(22).setBold(true).setForegroundColor(BRAND.RED);
  var tSons = pLogo.appendText(' Sons');
  tSons.setFontFamily('Arial').setFontSize(22).setBold(true).setForegroundColor(BRAND.DARK);

  var pTagline = leftCell.appendParagraph(BRAND.TAGLINE.toUpperCase());
  pTagline.setSpacingBefore(0).setSpacingAfter(3);
  pTagline.setFontFamily('Arial').setFontSize(8.5).setBold(true).setForegroundColor(BRAND.RED);

  var pDiv = leftCell.appendParagraph(BRAND.DIVISION + ' · Property Restoration Experts');
  pDiv.setSpacingBefore(0).setSpacingAfter(0);
  pDiv.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MUTED);

  // RIGHT COLUMN: Ryan Russell Business Card Contact Info (Right-Aligned)
  var pEst = rightCell.appendParagraph(BRAND.ESTIMATOR_NAME);
  pEst.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setSpacingBefore(0).setSpacingAfter(1);
  pEst.setFontFamily('Arial').setFontSize(10).setBold(true).setForegroundColor(BRAND.DARK);

  var pTitle = rightCell.appendParagraph(BRAND.ESTIMATOR_TITLE + '  |  ' + BRAND.ESTIMATOR_EMAIL);
  pTitle.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setSpacingBefore(0).setSpacingAfter(2);
  pTitle.setFontFamily('Arial').setFontSize(8.5).setForegroundColor(BRAND.TEXT_MUTED);

  var pAddr = rightCell.appendParagraph(BRAND.ADDRESS);
  pAddr.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setSpacingBefore(0).setSpacingAfter(1);
  pAddr.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MUTED);

  var pPhones = rightCell.appendParagraph('Office: ' + BRAND.OFFICE_PHONE + '   |   Cell: ' + BRAND.CELL_PHONE);
  pPhones.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setSpacingBefore(0).setSpacingAfter(2);
  pPhones.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MUTED);

  var pWeb = rightCell.appendParagraph(BRAND.WEBSITE);
  pWeb.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setSpacingBefore(0).setSpacingAfter(0);
  pWeb.setFontFamily('Arial').setFontSize(8.5).setBold(true).setForegroundColor(BRAND.RED);

  // RED ACCENT DIVIDER BAR (Exact crimson line from business card)
  var dividerTable = body.appendTable([['']]);
  dividerTable.setBorderWidth(0);
  var divCell = dividerTable.getRow(0).getCell(0);
  divCell.setBackgroundColor(BRAND.RED).setPaddingTop(1.5).setPaddingBottom(1.5);

  // DOCUMENT TITLE BANNER (Charcoal dark bar with white bold text)
  var titleTable = body.appendTable([['']]);
  titleTable.setBorderWidth(0);
  var titleCell = titleTable.getRow(0).getCell(0);
  titleCell.setBackgroundColor(BRAND.DARK);
  titleCell.setPaddingTop(7).setPaddingBottom(7).setPaddingLeft(10).setPaddingRight(10);

  var pTitle = titleCell.appendParagraph(docTitle.toUpperCase());
  pTitle.setSpacingBefore(0).setSpacingAfter(2);
  pTitle.setFontFamily('Arial').setFontSize(12.5).setBold(true).setForegroundColor(BRAND.WHITE);

  var metaText = 'Job ID: ' + (jobNum || 'PENDING') + '   |   Date: ' + dateStr;
  if (docSubtitle) metaText += '   |   ' + docSubtitle;
  var pMeta = titleCell.appendParagraph(metaText);
  pMeta.setSpacingBefore(0).setSpacingAfter(0);
  pMeta.setFontFamily('Arial').setFontSize(8.5).setForegroundColor('#CBD5E1');

  // Spacer
  var spacer = body.appendParagraph('');
  spacer.setFontSize(4).setSpacingBefore(0).setSpacingAfter(4);

  // Footer Setup
  var footer = doc.addFooter();
  var pFoot = footer.appendParagraph('Hays + Sons · We Do Restoration Right · 909 Production Rd., Fort Wayne, IN 46808 · (260) 471-9110 · haysandsons.com');
  pFoot.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  pFoot.setFontFamily('Arial').setFontSize(7.5).setForegroundColor('#94A3B8');
}

// Section Header with Crimson Red Brand Accent
function addSectionHeader(body, title) {
  var table = body.appendTable([[title.toUpperCase()]]);
  table.setBorderWidth(0);
  var cell = table.getRow(0).getCell(0);
  cell.setBackgroundColor(BRAND.BG_LIGHT);
  cell.setPaddingTop(4).setPaddingBottom(4).setPaddingLeft(8).setPaddingRight(8);
  var p = cell.getChild(0).asParagraph();
  p.setFontFamily('Arial').setFontSize(9).setBold(true).setForegroundColor(BRAND.RED);
  p.setSpacingBefore(0).setSpacingAfter(0);

  var sp = body.appendParagraph('');
  sp.setFontSize(2).setSpacingBefore(0).setSpacingAfter(2);
}

// Clean Key-Value Data Grid
function addKeyValueGrid(body, rows) {
  var table = body.appendTable(rows);
  table.setBorderColor(BRAND.BORDER).setBorderWidth(0.5);
  for (var r = 0; r < rows.length; r++) {
    var row = table.getRow(r);
    for (var c = 0; c < row.getNumCells(); c++) {
      var cell = row.getCell(c);
      cell.setPaddingTop(3.5).setPaddingBottom(3.5).setPaddingLeft(6).setPaddingRight(6);
      var p = cell.getChild(0).asParagraph();
      p.setSpacingBefore(0).setSpacingAfter(0);
      if (c % 2 === 0) {
        cell.setBackgroundColor(BRAND.BG_LIGHT);
        p.setFontFamily('Arial').setFontSize(8.5).setBold(true).setForegroundColor(BRAND.DARK);
      } else {
        p.setFontFamily('Arial').setFontSize(8.5).setForegroundColor(BRAND.TEXT_MAIN);
      }
    }
  }
  var sp = body.appendParagraph('');
  sp.setFontSize(3).setSpacingBefore(0).setSpacingAfter(3);
}

// -------------------------------------------------------------
// DOCUMENT 1: WELCOME CUSTOMER LETTER & ROADMAP
// -------------------------------------------------------------
function generateWelcomeLetter(folder, jobNum, clientName, address, phone, email, carrier, claimNum, gm, estimator, dateStr) {
  var docName = (clientName || jobNum || 'Customer') + ' - Welcome Letter';
  var doc = DocumentApp.create(docName);
  var body = doc.getBody();

  applyExecutiveLetterhead(doc, 'Customer Welcome & Restoration Roadmap', 'Fort Wayne Division', jobNum, dateStr);

  // Recipient Box
  addSectionHeader(body, 'Project & Insurance Reference');
  addKeyValueGrid(body, [
    ['Property Owner:', clientName, 'Insurance Carrier:', carrier],
    ['Loss Address:', address, 'Claim Number:', claimNum],
    ['Contact Phone:', phone || 'On File', 'Project Estimator:', estimator]
  ]);

  // Salutation
  var pSalute = body.appendParagraph('Dear ' + clientName + ',');
  pSalute.setFontFamily('Arial').setFontSize(9.5).setBold(true).setForegroundColor(BRAND.DARK);
  pSalute.setSpacingBefore(4).setSpacingAfter(4);

  var pIntro = body.appendParagraph(
    'On behalf of everyone at Hays + Sons, please accept our sincere regrets regarding the recent misfortune to your property. ' +
    'We understand that property damage causes disruption to your daily life. Our entire team is committed to communicating clearly, ' +
    'advocating on your behalf with your insurance carrier, and restoring your home to its pre-loss condition with the highest craftsmanship.'
  );
  pIntro.setFontFamily('Arial').setFontSize(8.5).setForegroundColor(BRAND.TEXT_MAIN);
  pIntro.setSpacingBefore(0).setSpacingAfter(6);

  addSectionHeader(body, 'Our Proven 4-Phase Restoration Process');

  var phases = [
    {
      num: 'PHASE I: EMERGENCY MITIGATION & SECURING PROPERTY',
      desc: 'Immediate emergency board-up, water extraction, and drying equipment installation. Comprehensive documentation through Matterport 3D imaging, thermal scanning, and detailed photo logs submitted to ' + carrier + ' for initial authorization.'
    },
    {
      num: 'PHASE II: STRUCTURAL SCOPE & INSURANCE RECONCILIATION',
      desc: 'Your dedicated structural estimator (' + estimator + ') completes a line-by-line itemized scope. We directly negotiate and reconcile all structural requirements with your insurance adjuster to secure full claim approval.'
    },
    {
      num: 'PHASE III: PROJECT MANAGEMENT & PRE-CONSTRUCTION',
      desc: 'You will be introduced to your dedicated Project Manager for a pre-construction walkthrough. Together, we review the approved scope, finalize material selections, establish the construction calendar, and collect the required mobilization deposit.'
    },
    {
      num: 'PHASE IV: FINAL WALKTHROUGH & 5-YEAR WORKMANSHIP WARRANTY',
      desc: 'A comprehensive quality walkthrough with your Project Manager to review punch-list completion, execute final closing documentation, and present your Hays + Sons Certificate of Satisfaction and warranty packet.'
    }
  ];

  for (var i = 0; i < phases.length; i++) {
    var pPhaseTitle = body.appendParagraph(phases[i].num);
    pPhaseTitle.setFontFamily('Arial').setFontSize(8.5).setBold(true).setForegroundColor(BRAND.RED);
    pPhaseTitle.setSpacingBefore(2).setSpacingAfter(1);

    var pPhaseDesc = body.appendParagraph(phases[i].desc);
    pPhaseDesc.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN);
    pPhaseDesc.setSpacingBefore(0).setSpacingAfter(4);
  }

  // Emergency & Direct Contact
  var pClose = body.appendParagraph(
    'If you have any questions or require immediate support, please contact our Fort Wayne office at ' + BRAND.OFFICE_PHONE + 
    ' or your estimator, ' + estimator + ', directly at ' + BRAND.CELL_PHONE + '.'
  );
  pClose.setFontFamily('Arial').setFontSize(8.5).setForegroundColor(BRAND.TEXT_MAIN);
  pClose.setSpacingBefore(4).setSpacingAfter(12);

  // Sign-off
  var pSign = body.appendParagraph('Sincerely,');
  pSign.setFontFamily('Arial').setFontSize(8.5).setForegroundColor(BRAND.TEXT_MAIN);
  pSign.setSpacingBefore(0).setSpacingAfter(16);

  var pTeam = body.appendParagraph(gm + ' (General Manager)  &  ' + estimator + ' (Estimator)\nHays + Sons - Fort Wayne Division\n' + BRAND.WEBSITE);
  pTeam.setFontFamily('Arial').setFontSize(8.5).setBold(true).setForegroundColor(BRAND.DARK);

  doc.saveAndClose();
  moveFileToFolder(doc.getId(), folder);
  return doc;
}

// -------------------------------------------------------------
// DOCUMENT 2: MORTGAGE AUTHORIZATION FORM
// -------------------------------------------------------------
function generateMortgageAuth(folder, jobNum, clientName, address, phone, carrier, claimNum, policyNum, dateStr) {
  var docName = (clientName || jobNum || 'Customer') + ' - Mortgage Authorization';
  var doc = DocumentApp.create(docName);
  var body = doc.getBody();

  applyExecutiveLetterhead(doc, 'Mortgage Authorization & Insurance Claim Release', 'Lender Loss Drafts Division', jobNum, dateStr);

  addSectionHeader(body, 'Borrower & Insurance Information');
  addKeyValueGrid(body, [
    ['Property Owner:', clientName, 'Insurance Carrier:', carrier],
    ['Loss Address:', address, 'Claim Number:', claimNum],
    ['Phone Number:', phone || 'On File', 'Policy Number:', policyNum || 'On File']
  ]);

  addSectionHeader(body, 'Mortgage Lender / Servicing Institution Information');
  addKeyValueGrid(body, [
    ['Mortgage Company:', '________________________________________', 'Loan / Account #:', '____________________'],
    ['Loss Draft Phone:', '________________________________________', 'Lender Email / Fax:', '____________________']
  ]);

  addSectionHeader(body, 'Formal Borrower Authorization & Disbursement Instructions');

  var clauses = [
    'AUTHORIZATION TO COMMUNICATE: On behalf of Property Owner / Borrower, this agreement authorizes Hays + Sons to communicate directly with mortgage company, loss draft specialists, and insurance adjusters regarding the claim for the life of the restoration project.',
    'INSPECTION ACCESS: Hays + Sons is authorized to request and facilitate all mandatory interim and final property draw inspections on behalf of the homeowner.',
    'PAYMENT DIRECTION & ENDORSEMENT: Property Owner authorizes all insurance loss draft settlement checks to be made payable to Hays + Sons only and mailed directly to:\n   Hays + Sons - Fort Wayne Division\n   909 Production Road, Fort Wayne, IN 46808\n   Attn: Claims & Accounting Division'
  ];

  for (var i = 0; i < clauses.length; i++) {
    var pClause = body.appendParagraph('• ' + clauses[i]);
    pClause.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN);
    pClause.setSpacingBefore(2).setSpacingAfter(4);
  }

  // Dual Owner Signature Block
  addSectionHeader(body, 'Borrower & Property Owner Execution');
  
  var sigTable = body.appendTable([
    ['PRIMARY BORROWER / PROPERTY OWNER', 'CO-BORROWER / SPOUSE'],
    [
      'Signature: _____________________________________\n\nPrinted Name: ' + clientName + '\n\nDate: ____________________\n\nSSN (Last 4): XXX-XX-__________',
      'Signature: _____________________________________\n\nPrinted Name: __________________________________\n\nDate: ____________________\n\nSSN (Last 4): XXX-XX-__________'
    ]
  ]);
  sigTable.setBorderColor(BRAND.BORDER).setBorderWidth(0.5);
  
  for (var c = 0; c < 2; c++) {
    sigTable.getRow(0).getCell(c).setBackgroundColor(BRAND.BG_LIGHT).setPaddingTop(4).setPaddingBottom(4);
    sigTable.getRow(0).getCell(c).getChild(0).asParagraph().setFontFamily('Arial').setFontSize(8).setBold(true).setForegroundColor(BRAND.DARK);
    
    sigTable.getRow(1).getCell(c).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(8).setPaddingRight(8);
    sigTable.getRow(1).getCell(c).getChild(0).asParagraph().setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN);
  }

  doc.saveAndClose();
  moveFileToFolder(doc.getId(), folder);
  return doc;
}

// -------------------------------------------------------------
// DOCUMENT 3: STRUCTURAL REPAIR AGREEMENT (INDIANA)
// -------------------------------------------------------------
function generateSRA(folder, jobNum, clientName, address, phone, email, dateStr, contractAmt, insPortion, deductible, downPayment, midPayment, adjuster, claimNum, carrier, estimator, gm) {
  var docName = (clientName || jobNum || 'Customer') + ' - Structural Repair Agreement';
  var doc = DocumentApp.create(docName);
  var body = doc.getBody();

  applyExecutiveLetterhead(doc, 'Structural Repair Agreement (Indiana)', 'Standard Construction Contract', jobNum, dateStr);

  addSectionHeader(body, 'Project & Insurance Reference');
  addKeyValueGrid(body, [
    ['Property Owner:', clientName, 'Insurance Carrier:', carrier],
    ['Loss Address:', address, 'Claim Number:', claimNum],
    ['Owner Phone:', phone || 'On File', 'Primary Adjuster:', adjuster || 'Assigned'],
    ['Owner Email:', email || 'On File', 'Hays Estimator:', estimator]
  ]);

  addSectionHeader(body, 'Contract Value & Milestone Payment Breakdown');

  // Milestone Table
  var milestoneData = [
    ['PAYMENT SCHEDULE & MILESTONE', 'AMOUNT ($)', 'TERMS & VERIFICATION CONDITIONS'],
    ['Total Approved Contract (RCV)', '$' + contractAmt.toFixed(2), 'Total approved scope authorized by insurance carrier'],
    ['Carrier Policy Portion', '$' + insPortion, 'Direct carrier settlement disbursement'],
    ['Homeowner Deductible', '$' + deductible.toFixed(2), 'Owner statutory deductible obligation'],
    ['50% Mobilization Down Payment', '$' + downPayment, 'REQUIRED TO COMMENCE: Pre-construction, permits, and engineering'],
    ['25% Mid-Point Construction Draw', '$' + midPayment, 'Due upon completion of drywall / rough mechanical milestones'],
    ['25% Substantial Completion Balance', '$' + midPayment, 'Due upon final walkthrough and punch-list sign-off']
  ];

  var table = body.appendTable(milestoneData);
  table.setBorderColor(BRAND.BORDER).setBorderWidth(0.5);

  var hRow = table.getRow(0);
  for (var c = 0; c < 3; c++) {
    var hCell = hRow.getCell(c);
    hCell.setBackgroundColor(BRAND.DARK);
    hCell.setPaddingTop(4).setPaddingBottom(4).setPaddingLeft(6).setPaddingRight(6);
    var hp = hCell.getChild(0).asParagraph();
    hp.setSpacingBefore(0).setSpacingAfter(0);
    hp.setFontFamily('Arial').setFontSize(8).setBold(true).setForegroundColor(BRAND.WHITE);
  }

  for (var r = 1; r < milestoneData.length; r++) {
    var bRow = table.getRow(r);
    var isDown = (r === 4);
    for (var c = 0; c < 3; c++) {
      var cell = bRow.getCell(c);
      cell.setPaddingTop(3.5).setPaddingBottom(3.5).setPaddingLeft(6).setPaddingRight(6);
      var p = cell.getChild(0).asParagraph();
      p.setSpacingBefore(0).setSpacingAfter(0);
      p.setFontFamily('Arial').setFontSize(8);
      if (isDown) {
        cell.setBackgroundColor('#FEF2F2');
        if (c === 1) p.setBold(true).setForegroundColor(BRAND.RED);
      } else if (r % 2 === 1) {
        cell.setBackgroundColor(BRAND.BG_LIGHT);
      }
      if (c === 1 && !isDown) p.setBold(true);
    }
  }

  var sp = body.appendParagraph('');
  sp.setFontSize(2).setSpacingBefore(0).setSpacingAfter(2);

  addSectionHeader(body, 'Standard Terms, Conditions & Indiana Statutory Notice');

  var terms = [
    'SCOPE & COMMENCEMENT: Project will commence within ten (10) business days following receipt of required 50% mobilization down payment, full insurance carrier approval, and building permit issuance. Estimated substantial completion within sixty (60) days thereafter, subject to material lead times and weather.',
    'SUPPLEMENTS & CODE UPGRADES: If unforeseen structural damage or mandatory building code upgrades are discovered during demolition or production, Hays + Sons will submit an itemized supplement directly to ' + carrier + ' for carrier approval prior to performing supplemental work.',
    'INDIANA STATUTORY CANCELLATION NOTICE: You may cancel this agreement before midnight on the third (3rd) business day after signing, or upon written notification that your insurance company has denied coverage for the claim, by delivering written notice to Hays + Sons, 909 Production Road, Fort Wayne, IN 46808.'
  ];

  for (var i = 0; i < terms.length; i++) {
    var pTerm = body.appendParagraph((i + 1) + '. ' + terms[i]);
    pTerm.setFontFamily('Arial').setFontSize(7.5).setForegroundColor(BRAND.TEXT_MAIN);
    pTerm.setSpacingBefore(1).setSpacingAfter(3);
  }

  // Formal Dual Execution Block
  addSectionHeader(body, 'Contract Execution & Authorization');

  var sigTable = body.appendTable([
    ['PROPERTY OWNER / AUTHORIZED AGENT', 'HAYS + SONS RESTORATION REPRESENTATIVE'],
    [
      'Signature: _____________________________________\n\nPrinted Name: ' + clientName + '\n\nDate: ________________________',
      'Signature: _____________________________________\n\nRepresentative: ' + estimator + ' (' + BRAND.ESTIMATOR_TITLE + ')\n\nOffice: ' + BRAND.OFFICE_PHONE + '   |   Cell: ' + BRAND.CELL_PHONE + '\n\nDate: ' + dateStr
    ]
  ]);
  sigTable.setBorderColor(BRAND.BORDER).setBorderWidth(0.5);
  for (var c = 0; c < 2; c++) {
    sigTable.getRow(0).getCell(c).setBackgroundColor(BRAND.BG_LIGHT).setPaddingTop(4).setPaddingBottom(4);
    sigTable.getRow(0).getCell(c).getChild(0).asParagraph().setFontFamily('Arial').setFontSize(8).setBold(true).setForegroundColor(BRAND.DARK);

    sigTable.getRow(1).getCell(c).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(8).setPaddingRight(8);
    sigTable.getRow(1).getCell(c).getChild(0).asParagraph().setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN);
  }

  doc.saveAndClose();
  moveFileToFolder(doc.getId(), folder);
  return doc;
}

// -------------------------------------------------------------
// DOCUMENT 4: PRODUCTION CHECKLIST
// -------------------------------------------------------------
function generateProductionChecklist(folder, jobNum, clientName, address, phone, email, deductible, carrier, adjuster, adjPhone, adjEmail, claimNum, contractAmt, downPayment, estimator, gm, lossType, dateOfLoss) {
  var docName = (clientName || jobNum || 'Customer') + ' - Production Checklist';
  var doc = DocumentApp.create(docName);
  var body = doc.getBody();

  applyExecutiveLetterhead(doc, 'Production Mobilization & Quality Checklist', 'Internal File Verification', jobNum, Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Indiana/Indianapolis', 'MM/dd/yyyy'));

  addSectionHeader(body, 'Job File Metadata');
  addKeyValueGrid(body, [
    ['Job Number:', jobNum, 'Loss Type:', lossType],
    ['Customer Name:', clientName, 'Date of Loss:', dateOfLoss],
    ['Loss Address:', address, 'Contract Amount:', '$' + Number(contractAmt).toFixed(2)],
    ['Insurance Carrier:', carrier, 'Deductible Amount:', '$' + Number(deductible).toFixed(2)],
    ['Adjuster Name:', adjuster || 'Assigned', '50% Down Required:', '$' + downPayment],
    ['Estimator Assigned:', estimator, 'Branch GM Approval:', gm]
  ]);

  addSectionHeader(body, '1. Scope & Insurance Documentation Status');
  var checkList1 = [
    '[  ] Preliminary Inspection Report with photos uploaded into DASH',
    '[  ] 3D Matterport Scan completed and active in DASH system',
    '[  ] Signed Structural Repair Agreement (SRA) on file with office',
    '[  ] Insurance Adjuster Approved Scope line-item reconciled (2 hard copies enclosed)',
    '[  ] Deductible verified & 50% mobilization down payment collected ($' + downPayment + ')'
  ];
  for (var i = 0; i < checkList1.length; i++) {
    var p = body.appendParagraph(checkList1[i]);
    p.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN).setSpacingBefore(1).setSpacingAfter(2);
  }

  addSectionHeader(body, '2. Legal, Financing & Regulatory Compliance');
  var checkList2 = [
    '[  ] Signed Mortgage Authorization executed and enclosed in packet',
    '[  ] Direct communication established with lender loss draft department',
    '[  ] City / County Building & Trade Permits pulled and posted on job site',
    '[  ] Subcontractor Work Orders & material purchase orders budgeted in DASH'
  ];
  for (var i = 0; i < checkList2.length; i++) {
    var p = body.appendParagraph(checkList2[i]);
    p.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN).setSpacingBefore(1).setSpacingAfter(2);
  }

  addSectionHeader(body, '3. Third-Party Program / IPC Compliance');
  var checkList3 = [
    '[  ] Customer Authorizations uploaded to Contractor Connection / IMACC / Carrier Portal',
    '[  ] New Customer Welcome Letter sent to client with portal access link',
    '[  ] Pre-construction conference scheduled with Homeowner & Project Manager'
  ];
  for (var i = 0; i < checkList3.length; i++) {
    var p = body.appendParagraph(checkList3[i]);
    p.setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN).setSpacingBefore(1).setSpacingAfter(2);
  }

  // Management Sign-Off Table
  addSectionHeader(body, 'Production Management Sign-Off');
  var mgmtTable = body.appendTable([
    ['ESTIMATOR VERIFICATION', 'GENERAL MANAGER APPROVAL', 'PROJECT MANAGER ACCEPTANCE'],
    [
      'Signed: _____________________\n\nEstimator: ' + estimator + '\n\nDate: _______________________',
      'Signed: _____________________\n\nGeneral Mgr: ' + gm + '\n\nDate: _______________________',
      'Assigned PM: _________________\n\nStart Date: _________________\n\nTarget Completion: _________'
    ]
  ]);
  mgmtTable.setBorderColor(BRAND.BORDER).setBorderWidth(0.5);

  for (var c = 0; c < 3; c++) {
    mgmtTable.getRow(0).getCell(c).setBackgroundColor(BRAND.BG_LIGHT).setPaddingTop(4).setPaddingBottom(4);
    mgmtTable.getRow(0).getCell(c).getChild(0).asParagraph().setFontFamily('Arial').setFontSize(8).setBold(true).setForegroundColor(BRAND.DARK);

    mgmtTable.getRow(1).getCell(c).setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(6).setPaddingRight(6);
    mgmtTable.getRow(1).getCell(c).getChild(0).asParagraph().setFontFamily('Arial').setFontSize(8).setForegroundColor(BRAND.TEXT_MAIN);
  }

  doc.saveAndClose();
  moveFileToFolder(doc.getId(), folder);
  return doc;
}

// Utility: Move created document to job subfolder safely
function moveFileToFolder(fileId, folder) {
  var file = DriveApp.getFileById(fileId);
  folder.addFile(file);
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (e) {
    // Suppress if already isolated
  }
}
`;

export const AppsScriptCodeModal: React.FC<AppsScriptCodeModalProps> = ({
  isOpen,
  onClose,
  scriptProjectId,
  scriptUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(COMPLETE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = COMPLETE_APPS_SCRIPT_CODE;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const projectEditUrl = `https://script.google.com/d/${scriptProjectId}/edit`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Executive Google Apps Script Engine</span>
                <span className="text-xs bg-red-950 text-red-300 border border-red-700/60 px-2 py-0.5 rounded-full font-mono font-bold">
                  v3.0 Official Card Branding
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generates all 4 Google Docs with the Hays + Sons letterhead, red accent bar, Ryan Russell business card details, and 50/25/25 milestone tables.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Highlights Bar */}
        <div className="bg-slate-900 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D32F2F]" />
              <span className="font-semibold text-white">Crimson Accent (#D32F2F)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#111827] border border-slate-600" />
              <span>Charcoal Titles (#111827)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>4 Complete Executive Documents</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Ryan Russell · Fort Wayne Division · 260.471.9110
          </div>
        </div>

        {/* 3 Simple Setup Steps */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">3-Step Deployment:</span>
            </div>
            <a
              href={projectEditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#D32F2F] text-white hover:bg-[#B71C1C] transition-colors self-start sm:self-auto shadow-xs"
            >
              <span>Open Apps Script Project</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">1. Paste Code</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Click <strong className="text-slate-700">Copy Entire Script</strong>, open <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Code.gs</code>, replace all code, and save.</p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">2. Deploy New Version</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Click <strong className="text-slate-700">Deploy &gt; Manage deployments</strong> &gt; Edit (pencil) &gt; Version: <strong className="text-slate-700">New version</strong>.</p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">3. Keep Permissions</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Ensure <strong className="text-slate-700">Execute as: Me</strong> and <strong className="text-slate-700">Who has access: Anyone</strong>, then click Deploy.</p>
            </div>
          </div>
        </div>

        {/* Code viewer with copy button */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 relative select-text">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Entire Script'}</span>
            </button>
          </div>
          <pre className="pr-36 leading-relaxed whitespace-pre font-mono text-[11px] text-emerald-300">
            {COMPLETE_APPS_SCRIPT_CODE}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 truncate max-w-lg">
            Active Endpoint: <span className="font-mono font-medium text-slate-800">{scriptUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsScriptCodeModal;
