import type { SchoolGPTRole } from './types';

export interface SchoolGPTTool {
  name: string;
  description: string;
  category: string;
}

export const ROLE_TOOL_REGISTRY: Record<SchoolGPTRole, SchoolGPTTool[]> = {
  teacher: [
    { name: 'attendance_sync', description: 'Auto-sync class attendance from gate RFID scans', category: 'Roll Call' },
    { name: 'lesson_planner', description: 'CBSE-aligned lesson plan & worksheet creator', category: 'Academics' },
    { name: 'ptm_generator', description: 'Personalized PTM progress report builder', category: 'Parent Comms' },
    { name: 'quiz_generator', description: 'Instant practice quiz & rubric creator', category: 'Assessments' },
  ],
  parent: [
    { name: 'bus_gps_tracker', description: 'Real-time GPS bus location & ETA monitor', category: 'Transit' },
    { name: 'gate_pass_request', description: 'Digital early exit & pickup pass generator', category: 'Safety' },
    { name: 'homework_tracker', description: 'Student assignment submission status', category: 'Academics' },
    { name: 'teacher_messenger', description: 'Direct WhatsApp & push message channel', category: 'Comms' },
  ],
  student: [
    { name: 'ai_tutor', description: 'Interactive step-by-step topic explainer', category: 'Learning' },
    { name: 'quiz_practice', description: 'Adaptive self-study practice questions', category: 'Revision' },
    { name: 'worry_jar', description: 'Anonymous wellness & emotional check-in', category: 'Wellness' },
  ],
  admin: [
    { name: 'campus_control', description: 'Total school operations telemetry dashboard', category: 'Operations' },
    { name: 'bus_fleet_monitor', description: 'Speed & route compliance monitoring', category: 'Logistics' },
    { name: 'gate_security_console', description: 'Multi-gate scan verification engine', category: 'Security' },
    { name: 'financial_summary', description: 'Quarterly fee collection status', category: 'Finance' },
  ],
  driver: [
    { name: 'route_navigator', description: 'Turn-by-turn stop sequence & student ETA', category: 'Navigation' },
    { name: 'passenger_manifest', description: 'Student RFID boarding verification', category: 'Roster' },
  ],
  gate: [
    { name: 'pass_verifier', description: 'Sub-second QR & RFID gate pass scanner', category: 'Verification' },
    { name: 'visitor_registry', description: 'Government ID visitor check-in log', category: 'Visitors' },
  ],
  vendor: [
    { name: 'cafeteria_orders', description: 'Daily meal & inventory tracking', category: 'Inventory' },
  ],
};

export class ToolRouter {
  static getToolsForRole(role: SchoolGPTRole): SchoolGPTTool[] {
    return ROLE_TOOL_REGISTRY[role] || ROLE_TOOL_REGISTRY.student;
  }

  static isToolAuthorized(toolName: string, role: SchoolGPTRole): boolean {
    const allowed = this.getToolsForRole(role);
    return allowed.some(t => t.name === toolName);
  }
}
