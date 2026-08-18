import { describe, it, expect } from 'vitest';
import {
  ConceptMindMapSchema,
  normalizeConceptMindMap,
  safeValidateConceptMindMap,
} from '@/lib/mindmap/schema';
import { extractConceptMindMapFromText } from '@/lib/mindmap/mindmapExtractor';
import type { ConceptMindMap } from '@/lib/mindmap/types';

describe('ShikshaSetu Visual Mind Map — Phase A Tests', () => {
  const validMockMap: ConceptMindMap = {
    title: 'Kinematics & Motion',
    subject: 'Physics',
    grade: '9',
    summary: 'One-dimensional motion, velocity, acceleration, and kinematic equations.',
    sections: [
      {
        id: 'sec-speed-velocity',
        title: 'Speed & Velocity',
        accentColor: 'blue',
        importance: 'high',
        items: [
          {
            id: 'item-1',
            type: 'definition',
            content: 'Speed is scalar distance per time; velocity is vector displacement per time.',
            source: { page: 2, section: '1.1 Speed vs Velocity', excerpt: 'Speed is scalar.' },
          },
          {
            id: 'item-2',
            type: 'formula',
            content: 'v = \\frac{\\Delta x}{\\Delta t}',
            details: 'Average velocity formula',
          },
        ],
        relatedSectionIds: ['sec-acceleration'],
      },
      {
        id: 'sec-acceleration',
        title: 'Acceleration & Equations of Motion',
        accentColor: 'green',
        importance: 'high',
        items: [
          {
            id: 'item-3',
            type: 'formula',
            content: 'v = u + a t',
            details: 'First equation of motion under constant acceleration',
          },
          {
            id: 'item-4',
            type: 'formula',
            content: 's = u t + \\frac{1}{2} a t^2',
            details: 'Second equation of motion',
          },
          {
            id: 'item-5',
            type: 'diagram',
            content: 'Velocity-Time Graph Setup',
            diagramType: 'process-flow',
            diagramData: { steps: ['Origin (t=0)', 'Acceleration Phase', 'Constant Velocity'] },
          },
        ],
        relatedSectionIds: ['sec-speed-velocity'],
      },
    ],
    relationships: [
      {
        fromSectionId: 'sec-speed-velocity',
        toSectionId: 'sec-acceleration',
        label: 'Derives rate of change',
        type: 'derives',
      },
    ],
    sourceReferences: [
      { page: 2, section: 'Chapter 8: Motion', excerpt: 'Equations of uniformly accelerated motion.' },
    ],
  };

  it('1. should validate a compliant ConceptMindMap schema', () => {
    const result = ConceptMindMapSchema.safeParse(validMockMap);
    expect(result.success).toBe(true);
  });

  it('2. should reject empty notes or notes with less than 20 characters', async () => {
    const result = await extractConceptMindMapFromText({
      title: 'Empty Test',
      notesText: 'Too short',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Not enough readable content');
  });

  it('3. should normalize and assign controlled academic accent colors', () => {
    const uncoloredMap = {
      ...validMockMap,
      sections: [
        {
          id: 'sec-1',
          title: 'Topic 1',
          importance: 'high',
          items: [{ id: 'i1', type: 'concept', content: 'Test concept' }],
          relatedSectionIds: [],
        },
        {
          id: 'sec-2',
          title: 'Topic 2',
          importance: 'medium',
          items: [{ id: 'i2', type: 'concept', content: 'Test concept 2' }],
          relatedSectionIds: [],
        },
      ],
    };

    const normalized = normalizeConceptMindMap(uncoloredMap);
    expect(normalized.sections[0].accentColor).toBe('blue');
    expect(normalized.sections[1].accentColor).toBe('green');
  });

  it('4. should gracefully validate and recover from malformed JSON via safeValidateConceptMindMap', () => {
    const badJson = { title: 123 }; // invalid types
    const validation = safeValidateConceptMindMap(badJson);
    expect(validation.success).toBe(false);
    expect(validation).toHaveProperty('error');
  });

  it('5. should retain source traceability (page, section, excerpt)', () => {
    const validation = safeValidateConceptMindMap(validMockMap);
    expect(validation.success).toBe(true);
    if (validation.success) {
      const item = validation.data.sections[0].items[0];
      expect(item.source?.page).toBe(2);
      expect(item.source?.section).toBe('1.1 Speed vs Velocity');
    }
  });

  it('6. should validate diagram types strictly against allowed set', () => {
    const validDiagramMap = {
      ...validMockMap,
      sections: [
        {
          id: 'sec-diag',
          title: 'Circuit Diagram Test',
          accentColor: 'purple',
          importance: 'high',
          items: [
            {
              id: 'diag-item',
              type: 'diagram',
              content: 'Capacitor setup',
              diagramType: 'circuit-capacitor',
            },
          ],
          relatedSectionIds: [],
        },
      ],
    };

    const result = safeValidateConceptMindMap(validDiagramMap);
    expect(result.success).toBe(true);
  });

  it('7. should reject invalid/unsupported diagram types', () => {
    const invalidDiagramMap = {
      ...validMockMap,
      sections: [
        {
          id: 'sec-bad-diag',
          title: 'Invalid Diagram',
          importance: 'low',
          items: [
            {
              id: 'diag-bad',
              type: 'diagram',
              content: 'Bad diagram',
              diagramType: 'unsupported-arbitrary-svg',
            },
          ],
          relatedSectionIds: [],
        },
      ],
    };

    const result = safeValidateConceptMindMap(invalidDiagramMap);
    expect(result.success).toBe(false);
  });

  it('8. should validate and enforce relationships structure between sections', () => {
    const mapWithRelationships = {
      ...validMockMap,
      relationships: [
        {
          fromSectionId: 'sec-speed-velocity',
          toSectionId: 'sec-acceleration',
          label: 'Derives acceleration',
          type: 'derives' as const,
        },
      ],
    };

    const result = safeValidateConceptMindMap(mapWithRelationships);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.relationships.length).toBe(1);
      expect(result.data.relationships[0].type).toBe('derives');
    }
  });

  it('9. should strictly extract uploaded Mathematics content without leaking Physics/Capacitance concepts', async () => {
    const mathNotes = `Chapter: Quadratic Equations
1. Standard Form:
A quadratic equation is of standard form a*x^2 + b*x + c = 0 where a is not equal to 0.
2. Quadratic Formula:
x = (-b ± sqrt(b^2 - 4*a*c)) / (2*a).
3. Discriminant:
D = b^2 - 4*a*c determines nature of roots:
If D > 0, two distinct real roots.
If D = 0, two equal real roots.
If D < 0, no real roots.`;

    const result = await extractConceptMindMapFromText({
      title: 'Quadratic Equations',
      subject: 'Mathematics',
      grade: '10',
      notesText: mathNotes,
    });

    expect(result.success).toBe(true);
    expect(result.mindMap).toBeDefined();
    if (result.mindMap) {
      expect(result.mindMap.title).toBe('Quadratic Equations');
      expect(result.mindMap.subject).toBe('Mathematics');
      // Verify NO hardcoded Physics/Capacitance/Dielectric terms are present
      const allText = JSON.stringify(result.mindMap).toLowerCase();
      expect(allText).not.toContain('capacitance');
      expect(allText).not.toContain('dielectric');
      expect(allText).not.toContain('farad');
      // Verify math concepts ARE present
      expect(allText).toContain('quadratic');
    }
  });

  it('10. should strictly extract uploaded Biology content without leaking other subjects', async () => {
    const bioNotes = `Chapter: Cell Respiration & ATP
1. Cellular Respiration:
Process by which organisms combine oxygen with foodstuff molecules, diverting chemical energy into cellular activities:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + ATP.
2. Glycolysis:
Occurs in cytoplasm without oxygen, breaking glucose into pyruvate.
3. Mitochondria & Krebs Cycle:
Aerobic stage producing high yield ATP in mitochondrial matrix.`;

    const result = await extractConceptMindMapFromText({
      title: 'Cellular Respiration',
      subject: 'Biology',
      grade: '11',
      notesText: bioNotes,
    });

    expect(result.success).toBe(true);
    expect(result.mindMap).toBeDefined();
    if (result.mindMap) {
      const allText = JSON.stringify(result.mindMap).toLowerCase();
      expect(allText).not.toContain('capacitance');
      expect(allText).not.toContain('dielectric');
      expect(allText).toContain('respiration');
      expect(allText).toContain('atp');
    }
  });
});
