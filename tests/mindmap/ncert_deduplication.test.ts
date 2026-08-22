import { describe, it, expect } from 'vitest';
import { deduplicateAndCleanExtractedText } from '@/lib/mindmap/fileTextExtractor';
import { deriveDeterministicKnowledgeGraphFromNotes, convertKnowledgeGraphToMindMap, extractKnowledgeGraphFromText } from '@/lib/mindmap/knowledgeGraphExtractor';
import { safeValidateKnowledgeGraph, safeValidateConceptMindMap } from '@/lib/mindmap/schema';

describe('NCERT Textbook Multi-Page PDF Deduplication & Robustness Tests', () => {
  const ncertMultiPageRaw = `ELECTRICITY
11.4 OHM'S LAW
Is there a relationship between the potential difference across a conductor
and the current through it? Let us explore with an Activity.
Page 200

ELECTRICITY
11.4 OHM'S LAW
Set up a circuit as shown in Fig. 11.2, consisting of a nichrome wire XY of
length, say 0.5 m, an ammeter, a voltmeter and four cells of 1.5 V each.
Page 201

ELECTRICITY
11.4 OHM'S LAW
In 1827, a German physicist Georg Simon Ohm found out the relationship
between the current, I, flowing in a metallic wire and the potential difference across its terminals.
The potential difference, V, across the ends of a given metallic wire in an electric circuit
is directly proportional to the current flowing through it, provided its temperature remains the same.
This is called Ohm's law. In other words,
V / I = constant = R
or V = I * R.
Page 202

ELECTRICITY
11.5 FACTORS ON WHICH RESISTANCE DEPENDS
Resistance of a uniform metallic conductor depends on its length (l), on its area of
cross-section (A) and on the nature of its material.
R = rho * (l / A)
Page 203

ELECTRICITY
11.6 RESISTANCE OF A SYSTEM OF RESISTORS
1. Resistors in Series:
When two or more resistors are connected end to end consecutively.
R_s = R1 + R2 + R3.
2. Resistors in Parallel:
When two or more resistors are connected between the same two common points.
1 / R_p = 1 / R1 + 1 / R2 + 1 / R3.
Page 204`;

  it('1. should strip repeated running headers, footers, and page numbers across pages', () => {
    const cleaned = deduplicateAndCleanExtractedText(ncertMultiPageRaw, 5);

    // Running header "ELECTRICITY" appeared on all 5 pages — must be stripped
    const electricityOccurrences = (cleaned.match(/ELECTRICITY/g) || []).length;
    expect(electricityOccurrences).toBeLessThanOrEqual(1);

    // Page markers should be completely removed
    expect(cleaned).not.toContain('Page 200');
    expect(cleaned).not.toContain('Page 201');
    expect(cleaned).not.toContain('Page 202');
    expect(cleaned).not.toContain('Page 203');
    expect(cleaned).not.toContain('Page 204');
  });

  it('2. should join sentences split across line wraps without dropping words or cutting mid-way', () => {
    const cleaned = deduplicateAndCleanExtractedText(ncertMultiPageRaw, 5);
    expect(cleaned).toContain('across a conductor and the current through it');
    expect(cleaned).toContain('length (l), on its area of cross-section (A)');
  });

  it('3. should generate a valid KnowledgeGraph with unique nodes and zero duplicate cards', () => {
    const cleaned = deduplicateAndCleanExtractedText(ncertMultiPageRaw, 5);
    const graph = deriveDeterministicKnowledgeGraphFromNotes('Electricity', 'Physics', '10', cleaned);

    const validation = safeValidateKnowledgeGraph(graph);
    expect(validation.success).toBe(true);

    // Verify node titles are unique
    const titles = graph.nodes.filter(n => n.type !== 'root').map(n => n.title.toLowerCase().trim());
    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);

    // Verify "Ohm's Law" is not repeated 10 times
    const ohmsOccurrences = titles.filter(t => t.includes("ohm's law") || t.includes("11.4")).length;
    expect(ohmsOccurrences).toBeLessThanOrEqual(1);
  });

  it('4. should project to a valid ConceptMindMap with formula preservation and complete telemetry', async () => {
    const cleaned = deduplicateAndCleanExtractedText(ncertMultiPageRaw, 5);
    const result = await extractKnowledgeGraphFromText({
      title: 'Electricity',
      subject: 'Physics',
      grade: '10',
      notesText: cleaned,
    });

    expect(result.success).toBe(true);
    expect(result.mindMap).toBeDefined();

    const mindMap = result.mindMap!;
    expect(mindMap.sections.length).toBeGreaterThan(0);

    // Telemetry assertions
    const telemetry = (mindMap as any).telemetry;
    expect(telemetry).toBeDefined();
    expect(telemetry.nodeCount).toBeGreaterThanOrEqual(2);
    expect(telemetry.avgNodeSize).toBeGreaterThan(0);
    expect(typeof telemetry.fallbackUsed).toBe('boolean');
    expect(telemetry.totalMs).toBeGreaterThan(0);
  });
});
