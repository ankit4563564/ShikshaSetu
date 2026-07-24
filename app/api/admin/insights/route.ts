import { NextRequest, NextResponse } from 'next/server';
import { 
  getAiInsightsAction, 
  getAvailableInsightDatesAction,
  generateInsightsNowAction,
  dismissInsightAction,
  getInsightStatsAction,
  getInsightComparisonAction,
} from '@/app/actions/aiInsightsActions';
import type { AiInsight, InsightCategory, InsightSeverity } from '@/lib/insights/types';
import { requireRole } from '@/lib/auth/routeGuard';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(['admin']);
    if (auth instanceof NextResponse) return auth;

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'dates') {
      const dates = await getAvailableInsightDatesAction();
      return NextResponse.json({ success: true, data: dates });
    }

    if (action === 'stats') {
      const stats = await getInsightStatsAction();
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'comparison') {
      const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const mode = searchParams.get('mode') || 'today_yesterday';
      const comparison = await getInsightComparisonAction(date, mode);
      return NextResponse.json({ success: true, data: comparison });
    }

    if (action === 'download') {
      const date = searchParams.get('date') || undefined;
      const category = searchParams.get('category') as InsightCategory | undefined;
      const severity = searchParams.get('severity') as InsightSeverity | undefined;
      const format = searchParams.get('format') || 'csv';

      const insights = await getAiInsightsAction(date, category, severity, true);

      if (format === 'csv') {
        return generateCSV(insights);
      }
      if (format === 'excel') {
        return generateCSV(insights, true);
      }
      if (format === 'pdf') {
        return generatePDFResponse(insights, date);
      }

      return generateCSV(insights);
    }

    const date = searchParams.get('date');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const includeDismissed = searchParams.get('includeDismissed') === 'true';

    const insights = await getAiInsightsAction(date || undefined, category as any, severity as any, includeDismissed);
    return NextResponse.json({ success: true, data: insights });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(['admin']);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { action, date, insightId } = body;

    if (action === 'generate') {
      const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const result = await generateInsightsNowAction(targetDate);
      return NextResponse.json({ success: result.success, count: result.count, error: result.error });
    }

    if (action === 'dismiss' && insightId) {
      const result = await dismissInsightAction(insightId);
      return NextResponse.json({ success: result.success, error: result.error });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

function generateCSV(insights: AiInsight[], isExcel = false): NextResponse {
  const headers = ['Date', 'Category', 'Severity', 'Title', 'Description', 'Recommendation', 'Actions', 'Risk Alert', 'Metrics'];
  const rows = insights.map(i => [
    i.insightDate,
    i.category,
    i.severity,
    `"${(i.title || '').replace(/"/g, '""')}"`,
    `"${(i.description || '').replace(/"/g, '""')}"`,
    `"${(i.recommendation || '').replace(/"/g, '""')}"`,
    `"${(i.actionSuggestions || []).join('; ').replace(/"/g, '""')}"`,
    i.riskAlert ? 'Yes' : 'No',
    `"${JSON.stringify(i.metrics || {}).replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const mimeType = isExcel ? 'application/vnd.ms-excel' : 'text/csv';
  const ext = isExcel ? 'xls' : 'csv';

  return new NextResponse(csv, {
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="insights-${new Date().toISOString().split('T')[0]}.${ext}"`,
    },
  });
}

function generatePDFResponse(insights: AiInsight[], date?: string): NextResponse {
  const reportDate = date || new Date().toISOString().split('T')[0];
  const critical = insights.filter(i => i.severity === 'critical').length;
  const warnings = insights.filter(i => i.severity === 'warning').length;
  const positive = insights.filter(i => i.severity === 'positive').length;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AI Insights Report - ${reportDate}</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 40px; color: #1F4E5F; }
  h1 { color: #1F4E5F; border-bottom: 3px solid #1F4E5F; padding-bottom: 10px; }
  h2 { color: #3f51b5; margin-top: 30px; }
  .summary { background: #f8fafb; padding: 20px; border-radius: 12px; margin: 20px 0; }
  .stat { display: inline-block; margin: 5px 15px 5px 0; font-weight: bold; }
  .critical { color: #C1502E; }
  .warning { color: #E8A33D; }
  .positive { color: #6B9080; }
  .insight { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0; }
  .insight-title { font-weight: bold; font-size: 14px; }
  .severity-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
  .sev-critical { background: #C1502E20; color: #C1502E; }
  .sev-warning { background: #E8A33D20; color: #E8A33D; }
  .sev-info { background: #3f51b520; color: #3f51b5; }
  .sev-positive { background: #6B908020; color: #6B9080; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
  th { background: #f8fafb; font-weight: bold; }
  .footer { margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 10px; }
</style>
</head>
<body>
<h1>School AI Insights Report</h1>
<p><strong>Date:</strong> ${reportDate} | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>

<div class="summary">
  <h2 style="margin-top:0">Summary</h2>
  <span class="stat">Total Insights: ${insights.length}</span>
  <span class="stat critical">Critical: ${critical}</span>
  <span class="stat warning">Warnings: ${warnings}</span>
  <span class="stat positive">Positive: ${positive}</span>
</div>

<h2>All Insights</h2>
<table>
  <thead>
    <tr><th>Category</th><th>Severity</th><th>Title</th><th>Description</th><th>Risk</th></tr>
  </thead>
  <tbody>
    ${insights.map(i => `
      <tr>
        <td>${i.category.replace(/_/g, ' ')}</td>
        <td><span class="severity-badge sev-${i.severity}">${i.severity}</span></td>
        <td>${i.title}</td>
        <td>${(i.description || '').substring(0, 120)}${(i.description || '').length > 120 ? '...' : ''}</td>
        <td>${i.riskAlert ? '⚠ Yes' : 'No'}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<h2>Recommendations & Actions</h2>
${insights.filter(i => i.recommendation || i.actionSuggestions?.length).map(i => `
  <div class="insight">
    <div class="insight-title">${i.title}</div>
    ${i.recommendation ? `<p><strong>Recommendation:</strong> ${i.recommendation}</p>` : ''}
    ${i.actionSuggestions?.length ? `<p><strong>Actions:</strong> ${i.actionSuggestions.join(' | ')}</p>` : ''}
  </div>
`).join('')}

<div class="footer">
  <p>Report generated by EduSync AI Insights | Confidential - For School Administration Only</p>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="insights-report-${reportDate}.html"`,
    },
  });
}
