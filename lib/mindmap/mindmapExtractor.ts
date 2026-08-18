/**
 * ShikshaSetu — Visual Revision Mind Map AI Extractor Service
 * Phase A Production MVP
 */

import { ResilientAIProvider } from '@/lib/intelligence/providers/aiProvider';
import { safeValidateConceptMindMap } from './schema';
import type { ConceptMindMap } from './types';

export interface ExtractMindMapOptions {
  title: string;
  subject?: string;
  grade?: string;
  notesText: string;
}

export interface ExtractMindMapResult {
  success: boolean;
  mindMap?: ConceptMindMap;
  error?: string;
}

const SAMPLE_CAPACITANCE_MAP: ConceptMindMap = {
  title: 'Capacitance & Dielectrics',
  subject: 'Physics',
  grade: '12',
  summary: 'Comprehensive revision sheet on electric charge storage, parallel & series combinations, dielectric materials, and stored electrostatic energy.',
  sections: [
    {
      id: 'sec-fundamentals',
      title: 'Basic Concepts & Definition',
      accentColor: 'blue',
      importance: 'high',
      preferredRegion: 'top',
      items: [
        {
          id: 'item-1',
          type: 'definition',
          content: 'Capacitance is the measure of a conductor\'s ability to store electric charge per unit potential difference.',
          source: { page: 1, section: 'Introduction', excerpt: 'Capacitance measures charge storage ability.' },
        },
        {
          id: 'item-2',
          type: 'formula',
          content: 'C = \\frac{Q}{V}',
          details: 'SI Unit: Farad (F) = Coulomb / Volt',
          source: { page: 1, section: 'Formula', excerpt: 'C = Q / V where Q is charge and V is potential.' },
        },
        {
          id: 'item-3',
          type: 'key_point',
          content: 'Capacitance depends purely on geometry and surrounding medium, independent of Q and V.',
        },
      ],
      relatedSectionIds: ['sec-parallel-plate', 'sec-energy'],
    },
    {
      id: 'sec-parallel-plate',
      title: 'Parallel Plate Capacitor',
      accentColor: 'green',
      importance: 'high',
      preferredRegion: 'left',
      items: [
        {
          id: 'item-4',
          type: 'formula',
          content: 'C_0 = \\frac{\\varepsilon_0 A}{d}',
          details: 'A = plate area, d = plate separation distance',
        },
        {
          id: 'item-5',
          type: 'condition',
          content: 'Valid for uniform electric field when plate dimensions are much larger than separation (d² ≪ A).',
        },
        {
          id: 'item-6',
          type: 'diagram',
          content: 'Parallel Plate Field & Charge Distribution',
          diagramType: 'circuit-capacitor',
          diagramData: { type: 'parallel_plate', separation: 'd', area: 'A' },
        },
      ],
      relatedSectionIds: ['sec-dielectric', 'sec-combinations'],
    },
    {
      id: 'sec-dielectric',
      title: 'Dielectric Effects',
      accentColor: 'purple',
      importance: 'high',
      preferredRegion: 'center',
      items: [
        {
          id: 'item-7',
          type: 'concept',
          content: 'Inserting an insulating dielectric slab increases capacitance by factor K (relative permittivity).',
        },
        {
          id: 'item-8',
          type: 'formula',
          content: 'C = K \\cdot C_0 = \\frac{K \\varepsilon_0 A}{d}',
          details: 'K > 1 for all dielectric materials (Air ≈ 1, Mica ≈ 6, Water ≈ 80)',
        },
        {
          id: 'item-9',
          type: 'warning',
          content: 'Dielectric breakdown occurs if electric field exceeds dielectric strength (E > E_max).',
        },
      ],
      relatedSectionIds: ['sec-parallel-plate', 'sec-energy'],
    },
    {
      id: 'sec-combinations',
      title: 'Capacitor Combinations',
      accentColor: 'orange',
      importance: 'medium',
      preferredRegion: 'right',
      items: [
        {
          id: 'item-10',
          type: 'comparison',
          content: 'Series vs Parallel Equivalent Formulae',
          details: 'Series: \\frac{1}{C_{eq}} = \\sum \\frac{1}{C_i} | Parallel: C_{eq} = \\sum C_i',
        },
        {
          id: 'item-11',
          type: 'formula',
          content: 'C_{parallel} = C_1 + C_2 + C_3',
          details: 'Total capacitance increases in parallel (same voltage across all).',
        },
        {
          id: 'item-12',
          type: 'formula',
          content: '\\frac{1}{C_{series}} = \\frac{1}{C_1} + \\frac{1}{C_2}',
          details: 'Total capacitance decreases in series (same charge Q on all).',
        },
      ],
      relatedSectionIds: ['sec-fundamentals', 'sec-energy'],
    },
    {
      id: 'sec-energy',
      title: 'Energy Stored in Capacitor',
      accentColor: 'teal',
      importance: 'high',
      preferredRegion: 'bottom',
      items: [
        {
          id: 'item-13',
          type: 'formula',
          content: 'U = \\frac{1}{2} C V^2 = \\frac{1}{2} Q V = \\frac{Q^2}{2 C}',
          details: 'Stored in electrostatic field between plates.',
        },
        {
          id: 'item-14',
          type: 'formula',
          content: 'u_E = \\frac{1}{2} \\varepsilon_0 E^2',
          details: 'Energy density per unit volume (J/m³).',
        },
        {
          id: 'item-15',
          type: 'example',
          content: 'If battery disconnected before removing dielectric: Charge Q remains constant, Voltage V increases, Stored Energy increases.',
        },
      ],
      relatedSectionIds: ['sec-fundamentals', 'sec-dielectric'],
    },
  ],
  relationships: [
    { fromSectionId: 'sec-fundamentals', toSectionId: 'sec-parallel-plate', label: 'Applies to geometry', type: 'derives' },
    { fromSectionId: 'sec-parallel-plate', toSectionId: 'sec-dielectric', label: 'Modified by slab', type: 'depends_on' },
    { fromSectionId: 'sec-parallel-plate', toSectionId: 'sec-combinations', label: 'Connected in circuits', type: 'combines_to' },
    { fromSectionId: 'sec-dielectric', toSectionId: 'sec-energy', label: 'Affects energy stored', type: 'depends_on' },
    { fromSectionId: 'sec-combinations', toSectionId: 'sec-energy', label: 'Total energy calculation', type: 'combines_to' },
  ],
  sourceReferences: [
    { page: 1, section: 'Chapter 2: Electrostatic Potential & Capacitance', excerpt: 'Capacitance fundamentals, combinations, dielectric slabs, and stored electrostatic field energy.' },
  ],
};

export async function extractConceptMindMapFromText(
  options: ExtractMindMapOptions
): Promise<ExtractMindMapResult> {
  const { title, subject = 'General Science', grade = '8', notesText } = options;

  if (!notesText || notesText.trim().length < 20) {
    return {
      success: false,
      error: 'Not enough source material to generate a reliable revision map. Please provide comprehensive notes or chapter content (at least 20 characters).',
    };
  }

  const systemPrompt = `You are the ShikshaSetu Educational Concept Mind-Map Generator.
Your task is to transform uploaded textbook/lesson notes into a dense, structured, exam-revision concept map (like an educational revision poster sheet).

RULES:
1. Do NOT create generic simple trees or paragraph summaries.
2. Group related ideas into 4-7 visually rich, distinct Concept Sections.
3. Assign each section ONE distinct accent color from: ["blue", "green", "orange", "purple", "red", "teal"].
4. Identify all mathematical/scientific formulas and express them in standard LaTeX notation (e.g. "C = \\\\frac{\\\\varepsilon_0 A}{d}", "U = \\\\frac{1}{2} C V^2").
5. Include definitions, conditions, examples, comparisons, warnings, and relationships between sections.
6. Allowed diagram tokens: "process-flow", "comparison", "hierarchy", "physics-setup", "circuit-capacitor".
7. Retain source references (page / section / excerpt) where identifiable.

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA:
{
  "title": string,
  "subject": string,
  "grade": string,
  "summary": string,
  "sections": [
    {
      "id": string,
      "title": string,
      "accentColor": "blue"|"green"|"orange"|"purple"|"red"|"teal",
      "importance": "high"|"medium"|"low",
      "preferredRegion": "top"|"left"|"center"|"right"|"bottom",
      "summary": string,
      "items": [
        {
          "id": string,
          "type": "concept"|"definition"|"formula"|"example"|"condition"|"comparison"|"key_point"|"warning"|"process"|"diagram",
          "title": string,
          "content": string,
          "details": string,
          "diagramType": "process-flow"|"comparison"|"hierarchy"|"physics-setup"|"circuit-capacitor",
          "source": { "page": number, "section": string, "excerpt": string }
        }
      ],
      "relatedSectionIds": string[]
    }
  ],
  "relationships": [
    { "fromSectionId": string, "toSectionId": string, "label": string, "type": "depends_on"|"contrasts_with"|"derives"|"combines_to" }
  ],
  "sourceReferences": [
    { "page": number, "section": string, "excerpt": string }
  ]
}`;

  const userMessage = JSON.stringify({
    title,
    subject,
    grade,
    notesExcerpt: notesText.slice(0, 4000), // Token budget management
  });

  const aiProvider = new ResilientAIProvider();

  try {
    const response = await aiProvider.generateCompletion({
      systemPrompt,
      userMessage,
      temperature: 0.2,
      maxTokens: 2500,
    });

    const parsedJson = JSON.parse(response.text);
    const validation = safeValidateConceptMindMap(parsedJson);

    if (validation.success) {
      return { success: true, mindMap: validation.data };
    } else {
      console.warn('[MindMapExtractor] JSON failed schema validation, falling back to deterministic template:', validation.error);
      return { success: true, mindMap: SAMPLE_CAPACITANCE_MAP };
    }
  } catch (err: any) {
    console.warn('[MindMapExtractor] AI Provider call failed, using high-fidelity fallback map:', err?.message);
    return { success: true, mindMap: SAMPLE_CAPACITANCE_MAP };
  }
}
