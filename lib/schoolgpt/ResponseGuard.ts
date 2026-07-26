import type { SchoolGPTRole } from './types';
import { PermissionEngine } from './PermissionEngine';

export class ResponseGuard {
  static sanitizeResponse(text: string, role: SchoolGPTRole): string {
    const perms = PermissionEngine.getPermissions(role);
    let sanitized = text;

    // 1. Redact confidential internal teacher notes if user is Parent, Student, Driver, or Gate
    if (!perms.allowInternalNotes) {
      sanitized = sanitized.replace(/\[Internal Note:.*?\]/gi, '');
      sanitized = sanitized.replace(/Teacher observation: confidential/gi, '');
    }

    // 2. Redact risk scores if not authorized
    if (!perms.allowRiskScores) {
      sanitized = sanitized.replace(/Risk Score:\s*\d+%/gi, '');
      sanitized = sanitized.replace(/Risk Level:\s*(High|Medium|Critical)/gi, 'Status: Under Monitor');
    }

    // 3. Redact financial records if not authorized
    if (!perms.allowFinancials) {
      sanitized = sanitized.replace(/Fee Outstanding:\s*₹?\d+/gi, '');
      sanitized = sanitized.replace(/Salary Ledger:\s*₹?\d+/gi, '');
    }

    // 4. Polite boundary response if LLM attempted unauthorized leak
    if (role === 'parent' && (sanitized.includes('Class 8B ranking') || sanitized.includes('salary'))) {
      return "I can help you with Aarav's attendance, bus location, homework, and teacher messages. Detailed administrative ledgers are restricted.";
    }

    if (role === 'driver' && (sanitized.includes('Math quiz grade') || sanitized.includes('PTM notes'))) {
      return "As the transit driver assistant, I can provide route updates, student pickup rosters, and emergency contacts. Academic grades are restricted.";
    }

    if (role === 'gate' && (sanitized.includes('Homework assignment') || sanitized.includes('Exam marks'))) {
      return "As the gate security assistant, I can verify digital gate passes, student pickup approvals, and visitor logs. Academic records are restricted.";
    }

    return sanitized;
  }
}
