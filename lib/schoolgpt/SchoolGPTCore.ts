import type { SchoolGPTRole, SchoolGPTContext } from './types';
import { PermissionEngine } from './PermissionEngine';
import { ResponseGuard } from './ResponseGuard';
import { PromptBuilder, SuggestedPrompt } from './PromptBuilder';
import { ToolRouter, SchoolGPTTool } from './ToolRouter';
import { generateSchoolGPTResponse, SchoolGPTResponse } from './generateResponse';

export interface SchoolGPTCoreRequest {
  userQuery: string;
  context: SchoolGPTContext;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  retrievedData?: string;
}

export class SchoolGPTCore {
  /**
   * Single unified entry point for SchoolGPT across all portals.
   */
  static async processQuery(request: SchoolGPTCoreRequest): Promise<SchoolGPTResponse> {
    const { userQuery, context, conversationHistory = [], retrievedData = '' } = request;
    const role = context.role || 'student';

    // 1. Audit & Filter Data Context via PermissionEngine
    const dataContext = PermissionEngine.isFieldAllowed(retrievedData, role)
      ? retrievedData
      : 'Restricted administrative dataset.';

    // 2. Query execution via LLM / Fast-Path Strategy
    const rawResponse = await generateSchoolGPTResponse(
      userQuery,
      dataContext,
      role,
      conversationHistory,
      'unknown',
      'HIGH',
      ['School Operating System Database']
    );

    // 3. Security & Privacy Inspection via ResponseGuard
    const sanitizedText = ResponseGuard.sanitizeResponse(rawResponse.text, role);

    // 4. Role-specific suggested follow-ups
    const rolePrompts = PromptBuilder.getSuggestedPrompts(role).map(p => p.label);

    return {
      ...rawResponse,
      text: sanitizedText,
      suggestedFollowUps: rawResponse.suggestedFollowUps || rolePrompts.slice(0, 3),
    };
  }

  /**
   * Get role-aware suggested prompts
   */
  static getSuggestedPrompts(role: SchoolGPTRole): SuggestedPrompt[] {
    return PromptBuilder.getSuggestedPrompts(role);
  }

  /**
   * Get authorized tools for role
   */
  static getAuthorizedTools(role: SchoolGPTRole): SchoolGPTTool[] {
    return ToolRouter.getToolsForRole(role);
  }
}
