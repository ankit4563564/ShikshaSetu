export async function generatePerformanceSummary(
  studentName: string,
  subject: string,
  trend: { percentage: number; assessmentName: string; date: string }[],
  classAverage: number
): Promise<string> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('gsk_')) {
      // Use rule-based fallback
      return generateFallbackSummary(trend, classAverage);
    }

    const prompt = `You are a teacher's assistant. Generate a brief, encouraging performance summary for ${studentName} in ${subject}.

Recent scores (chronological order):
${trend.map(t => `- ${t.assessmentName}: ${t.percentage}%`).join('\n')}

Class average: ${classAverage}%

Keep it to 2-3 sentences. Focus on trends, strengths, and areas for growth. Be encouraging and constructive.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return generateFallbackSummary(trend, classAverage);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || generateFallbackSummary(trend, classAverage);
  } catch {
    return generateFallbackSummary(trend, classAverage);
  }
}

function generateFallbackSummary(
  trend: { percentage: number; assessmentName: string; date: string }[],
  classAverage: number
): string {
  if (trend.length === 0) {
    return 'No assessment data available yet.';
  }

  const latest = trend[trend.length - 1].percentage;
  const first = trend[0].percentage;
  const diff = latest - first;

  let summary = '';

  if (trend.length === 1) {
    const vsClass = latest - classAverage;
    if (vsClass > 10) {
      summary = `Scored ${latest}%, which is well above the class average of ${classAverage}%. Strong performance to build on.`;
    } else if (vsClass > -10) {
      summary = `Scored ${latest}%, close to the class average of ${classAverage}%. Consistent work will help improve further.`;
    } else {
      summary = `Scored ${latest}%. Let's work on strengthening the fundamentals to bring this up toward the class average of ${classAverage}%.`;
    }
  } else {
    const direction = diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'stable';
    const vsClass = latest - classAverage;

    if (direction === 'improving') {
      summary = `Showing a positive trend — from ${first}% to ${latest}%. `;
      if (vsClass > 10) {
        summary += `This is well above the class average of ${classAverage}%. Keep up the great effort.`;
      } else if (vsClass > -10) {
        summary += `Currently near the class average of ${classAverage}%. Continued focus will lead to further gains.`;
      } else {
        summary += `Still below the class average of ${classAverage}%, but the upward trend is encouraging.`;
      }
    } else if (direction === 'declining') {
      summary = `Scores have gone from ${first}% to ${latest}%. `;
      if (vsClass > 10) {
        summary += `Despite the drop, performance remains above the class average of ${classAverage}%. Let's identify areas to stabilize.`;
      } else {
        summary += `This is below the class average of ${classAverage}%. Let's work on revisiting the fundamentals together.`;
      }
    } else {
      summary = `Scores have been stable around ${latest}%. `;
      if (vsClass > 10) {
        summary += `This is above the class average of ${classAverage}%. Consistent effort is paying off.`;
      } else if (vsClass > -10) {
        summary += `This is close to the class average of ${classAverage}%. Small improvements can make a big difference.`;
      } else {
        summary += `Let's work on strategies to bring this up toward the class average of ${classAverage}%.`;
      }
    }

    if (trend.length > 2) {
      const best = Math.max(...trend.map(t => t.percentage));
      const worst = Math.min(...trend.map(t => t.percentage));
      if (best === latest) {
        summary += ` The most recent score of ${latest}% is your best yet!`;
      } else if (worst === latest) {
        summary += ` Everyone has off days. Let's focus on regrouping for the next assessment.`;
      }
    }
  }

  return summary;
}
