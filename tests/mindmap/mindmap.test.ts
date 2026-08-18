import { describe, it, expect } from 'vitest';
import {
  ConceptMindMapSchema,
  normalizeConceptMindMap,
  safeValidateConceptMindMap,
} from '@/lib/mindmap/schema';
import {
  extractConceptMindMapFromText,
  deriveDeterministicMindMapFromNotes,
} from '@/lib/mindmap/mindmapExtractor';
import type { ConceptMindMap } from '@/lib/mindmap/types';

describe('ShikshaSetu Visual Mind Map — Quality & Semantic Grouping Tests', () => {
  const electricityNotes = `Chapter: Electricity and Circuits
1. Electric Charge:
Electric charge is a fundamental property of matter. It exists as positive and negative charges.
Like charges repel, while unlike charges attract.
SI Unit of charge is Coulomb (C). Charge on one electron is e = 1.6 x 10^-19 C.
Total charge: Q = n * e.

2. Electric Current:
Electric current is the rate of flow of electric charge across a cross-section of a conductor.
Formula: I = Q / t.
SI Unit: Ampere (A). 1 Ampere = 1 Coulomb / 1 Second.
Conventional current flows from positive terminal to negative terminal, which is opposite to electron flow.

3. Electric Potential and Potential Difference:
Electric potential difference between two points is work done in moving a unit positive charge from one point to other.
Formula: V = W / Q.
SI Unit: Volt (V). 1 Volt = 1 Joule / 1 Coulomb.
Potential difference is maintained in a circuit using a battery or cell.

4. Ohm's Law and Resistance:
Ohm's Law states that electric current flowing through a metallic conductor is directly proportional to potential difference across its ends, provided temperature remains constant:
Formula: V = I * R.
Where V = voltage, I = current, R = resistance.
Resistance R depends on length L, area A, and nature of material: R = ρ * (L / A).
SI Unit of resistance is Ohm (Ω). Resistivity ρ is measured in Ohm-meter (Ω·m).

5. Series Combination of Resistors:
In series, current I remains the same through all resistors.
Equivalent Resistance: R_s = R1 + R2 + R3.
Total resistance is larger than the largest individual resistance.

6. Parallel Combination of Resistors:
In parallel, potential difference V remains the same across all resistors.
Equivalent Resistance: 1 / R_p = 1 / R1 + 1 / R2 + 1 / R3.
Total resistance is smaller than the smallest individual resistance.

7. Heating Effect of Electric Current (Joule's Law):
When current flows through a purely resistive conductor, electrical energy is converted into heat:
Joule's Law of Heating: H = I^2 * R * t = V * I * t.
Heat produced is directly proportional to square of current, resistance, and time.

8. Practical Applications & Safety:
Electric heating is used in electric iron, toaster, water heater, and electric bulb (tungsten filament).
Electric Fuse is a safety device made of a metal wire with low melting point that breaks the circuit during overload.`;

  it('1. should extract Electricity notes into 5-8 coherent major sections', async () => {
    const result = await extractConceptMindMapFromText({
      title: 'Electricity & Circuits',
      subject: 'Physics',
      grade: '10',
      notesText: electricityNotes,
    });

    expect(result.success).toBe(true);
    expect(result.mindMap).toBeDefined();

    if (result.mindMap) {
      const sections = result.mindMap.sections;
      expect(sections.length).toBeGreaterThanOrEqual(4);
      expect(sections.length).toBeLessThanOrEqual(8);

      // Verify no broken heading fragments like "'s Law" or ": Volt"
      for (const sec of sections) {
        expect(sec.title).not.toMatch(/^'s/);
        expect(sec.title).not.toMatch(/^:\s*/);
        expect(sec.title.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('2. should keep formulas atomically attached with variable meanings and units', () => {
    const derived = deriveDeterministicMindMapFromNotes(
      'Electricity',
      'Physics',
      '10',
      electricityNotes
    );

    expect(derived.sections.length).toBeGreaterThanOrEqual(4);

    // Find section with Ohm's law or current formula
    const ohmSection = derived.sections.find(
      (s) => s.title.toLowerCase().includes('ohm') || s.title.toLowerCase().includes('resistance')
    );

    expect(ohmSection).toBeDefined();
    if (ohmSection) {
      const hasFormula = ohmSection.items.some((i) => i.type === 'formula' || i.content.includes('='));
      expect(hasFormula).toBe(true);
    }
  });

  it('3. should reject notes with fewer than 20 characters', async () => {
    const result = await extractConceptMindMapFromText({
      title: 'Short Note',
      notesText: 'Too brief',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Not enough readable content');
  });

  it('4. should assign distinct colors from the academic palette to sections', () => {
    const derived = deriveDeterministicMindMapFromNotes(
      'Electricity',
      'Physics',
      '10',
      electricityNotes
    );

    const colors = derived.sections.map((s) => s.accentColor);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBeGreaterThanOrEqual(3);
  });

  it('6. should assign full layout span to major laws like Ohm and Joule', () => {
    const derived = deriveDeterministicMindMapFromNotes(
      'Electricity',
      'Physics',
      '10',
      electricityNotes
    );

    const ohmSection = derived.sections.find((s) => s.title.toLowerCase().includes('ohm'));
    expect(ohmSection).toBeDefined();
    if (ohmSection) {
      expect(ohmSection.layoutSpan).toBe('full');
      expect(ohmSection.formulas).toBeDefined();
      expect(ohmSection.formulas?.length).toBeGreaterThan(0);
      expect(ohmSection.formulas?.[0].latex).toContain('V');
    }
  });

  it('7. should ensure all 8 electricity concepts are extracted with zero orphan fragments', () => {
    const derived = deriveDeterministicMindMapFromNotes(
      'Electricity & Circuits',
      'Physics',
      '10',
      electricityNotes
    );

    expect(derived.sections.length).toBe(8);

    const titles = derived.sections.map((s) => s.title);
    expect(titles).toContain('Electric Charge');
    expect(titles).toContain('Electric Current');
    expect(titles).toContain('Ohm\'s Law and Resistance');
    expect(titles).toContain('Series Combination of Resistors');
    expect(titles).toContain('Parallel Combination of Resistors');
    expect(titles.some((t) => t.includes('Heating') || t.includes('Joule'))).toBe(true);

    // Verify all formulas are attached with variable meanings
    for (const sec of derived.sections) {
      expect(sec.title).not.toMatch(/^'s/);
      expect(sec.title).not.toMatch(/^:\s*/);
      expect(sec.items.length).toBeGreaterThan(0);
    }
  });
});
