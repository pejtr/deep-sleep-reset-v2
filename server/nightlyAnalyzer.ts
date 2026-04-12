/**
 * Nightly AI Analyzer — runs at midnight every day
 * Analyzes funnel data, identifies conversion bottlenecks,
 * applies behavioral psychology insights, and sends report to owner.
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

export interface NightlyReport {
  date: string;
  metrics: FunnelMetrics;
  insights: string[];
  recommendations: string[];
  abTestWinner: string | null;
  estimatedMonthlyRevenue: number;
}

interface FunnelMetrics {
  quizStarts: number;
  quizCompletions: number;
  quizCompletionRate: number;
  tripwirePurchases: number;
  tripwireConversionRate: number;
  oto1Purchases: number;
  oto1Rate: number;
  oto2Purchases: number;
  oto2Rate: number;
  oto3Purchases: number;
  oto3Rate: number;
  totalRevenue: number;
  avgOrderValue: number;
  emailLeads: number;
  topChronotype: string;
  pageViews: Record<string, number>;
  dropoffPoints: string[];
}

export async function runNightlyAnalysis(): Promise<NightlyReport> {
  const db = await getDb();
  const today = new Date().toISOString().split("T")[0];

  if (!db) {
    return {
      date: today,
      metrics: getEmptyMetrics(),
      insights: ["Database not available"],
      recommendations: [],
      abTestWinner: null,
      estimatedMonthlyRevenue: 0,
    };
  }

  const exec = async (query: ReturnType<typeof sql>) => {
    const result = await db.execute(query);
    return (result[0] as unknown as any[]) || [];
  };

  // Gather all funnel data from last 24 hours + cumulative
  const [
    quizRows, quizTodayRows, tripwireRows, oto1Rows, oto2Rows, oto3Rows,
    revenueRows, leadsRows, chronotypeRows, abTestRows, behaviorRows,
    weeklyRevenueRows,
  ] = await Promise.all([
    exec(sql`SELECT COUNT(*) as count FROM quiz_results`),
    exec(sql`SELECT COUNT(*) as count FROM quiz_results WHERE DATE(createdAt) = CURDATE()`),
    exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'tripwire' AND status = 'paid'`),
    exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'oto1' AND status = 'paid'`),
    exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'oto2' AND status = 'paid'`),
    exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'oto3' AND status = 'paid'`),
    exec(sql`SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total FROM orders WHERE status = 'paid'`),
    exec(sql`SELECT COUNT(*) as count FROM email_leads`),
    exec(sql`SELECT chronotype, COUNT(*) as count FROM quiz_results GROUP BY chronotype ORDER BY count DESC LIMIT 1`),
    exec(sql`SELECT testName, variant,
      SUM(CASE WHEN eventType = 'impression' THEN 1 ELSE 0 END) as impressions,
      SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as clicks
      FROM ab_test_events GROUP BY testName, variant`),
    exec(sql`SELECT event_type, page, COUNT(*) as count FROM behavior_events WHERE DATE(created_at) = CURDATE() GROUP BY event_type, page ORDER BY count DESC LIMIT 20`).catch(() => []),
    exec(sql`SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total FROM orders WHERE status = 'paid' AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`),
  ]);

  const quizTotal = parseInt(quizRows[0]?.count || "0");
  const quizToday = parseInt(quizTodayRows[0]?.count || "0");
  const tripwire = parseInt(tripwireRows[0]?.count || "0");
  const oto1 = parseInt(oto1Rows[0]?.count || "0");
  const oto2 = parseInt(oto2Rows[0]?.count || "0");
  const oto3 = parseInt(oto3Rows[0]?.count || "0");
  const totalRevenue = parseFloat(revenueRows[0]?.total || "0");
  const leads = parseInt(leadsRows[0]?.count || "0");
  const topChronotype = chronotypeRows[0]?.chronotype || "bear";
  const weeklyRevenue = parseFloat(weeklyRevenueRows[0]?.total || "0");

  // Calculate rates
  const quizCompletionRate = quizTotal > 0 ? (tripwire / quizTotal) * 100 : 0;
  const tripwireRate = quizTotal > 0 ? (tripwire / quizTotal) * 100 : 0;
  const oto1Rate = tripwire > 0 ? (oto1 / tripwire) * 100 : 0;
  const oto2Rate = oto1 > 0 ? (oto2 / oto1) * 100 : 0;
  const oto3Rate = oto2 > 0 ? (oto3 / oto2) * 100 : 0;
  const avgOrderValue = tripwire > 0 ? totalRevenue / tripwire : 0;

  // Page views from behavior events
  const pageViews: Record<string, number> = {};
  for (const row of behaviorRows as any[]) {
    if (row.event_type === "page_view") {
      pageViews[row.page] = parseInt(row.count || "0");
    }
  }

  // Identify drop-off points (behavioral psychology analysis)
  const dropoffPoints: string[] = [];
  if (quizCompletionRate < 40) dropoffPoints.push("Quiz → Order (low quiz completion)");
  if (oto1Rate < 15) dropoffPoints.push("Tripwire → OTO1 (low upsell 1 take rate)");
  if (oto2Rate < 10) dropoffPoints.push("OTO1 → OTO2 (low upsell 2 take rate)");

  // A/B test winner analysis
  let abTestWinner: string | null = null;
  const abByVariant: Record<string, { impressions: number; clicks: number }> = {};
  for (const row of abTestRows as any[]) {
    const key = `${row.testName}:${row.variant}`;
    abByVariant[key] = {
      impressions: parseInt(row.impressions || "0"),
      clicks: parseInt(row.clicks || "0"),
    };
  }
  // Find highest CTR variant
  let bestCTR = 0;
  for (const [key, data] of Object.entries(abByVariant)) {
    const ctr = data.impressions > 0 ? data.clicks / data.impressions : 0;
    if (ctr > bestCTR && data.impressions >= 10) {
      bestCTR = ctr;
      abTestWinner = key;
    }
  }

  const metrics: FunnelMetrics = {
    quizStarts: quizTotal,
    quizCompletions: quizTotal,
    quizCompletionRate,
    tripwirePurchases: tripwire,
    tripwireConversionRate: tripwireRate,
    oto1Purchases: oto1,
    oto1Rate,
    oto2Purchases: oto2,
    oto2Rate,
    oto3Purchases: oto3,
    oto3Rate,
    totalRevenue,
    avgOrderValue,
    emailLeads: leads,
    topChronotype,
    pageViews,
    dropoffPoints,
  };

  // Estimated monthly revenue (based on last 7 days)
  const estimatedMonthlyRevenue = (weeklyRevenue / 7) * 30;

  // AI-powered insights using behavioral psychology
  let insights: string[] = [];
  let recommendations: string[] = [];

  try {
    const prompt = `You are a conversion rate optimization expert specializing in behavioral psychology and neuromarketing for digital sales funnels.

Analyze this Deep Sleep Reset funnel data and provide actionable insights:

FUNNEL METRICS (last 24h + cumulative):
- Quiz completions today: ${quizToday}
- Total quiz completions: ${quizTotal}
- Tripwire ($1) purchases: ${tripwire} (${tripwireRate.toFixed(1)}% conversion)
- OTO1 ($7) purchases: ${oto1} (${oto1Rate.toFixed(1)}% of tripwire buyers)
- OTO2 ($17) purchases: ${oto2} (${oto2Rate.toFixed(1)}% of OTO1 buyers)
- OTO3 ($27) purchases: ${oto3} (${oto3Rate.toFixed(1)}% of OTO2 buyers)
- Total revenue: $${totalRevenue.toFixed(2)}
- Average order value: $${avgOrderValue.toFixed(2)}
- Email leads captured: ${leads}
- Top chronotype: ${topChronotype}
- Drop-off points: ${dropoffPoints.join(", ") || "none identified yet"}
- A/B test winner: ${abTestWinner || "insufficient data"}
- Estimated monthly revenue: $${estimatedMonthlyRevenue.toFixed(0)}

BEHAVIORAL PSYCHOLOGY CONTEXT:
- Target: English-speaking markets (US/UK/AU/CA tier 1, India/Philippines tier 2)
- Traffic source: Organic Facebook/Instagram
- Goal: 100% conversion rate (every visitor becomes a buyer)
- Product: Sleep optimization digital guides

Provide:
1. 3-5 specific insights about what the data reveals about user behavior
2. 3-5 concrete recommendations to improve conversion rates using behavioral psychology principles (loss aversion, social proof, scarcity, reciprocity, commitment/consistency)
3. Identify the biggest revenue opportunity right now

Respond in JSON format:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "biggestOpportunity": "description"
}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a conversion optimization expert. Always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "funnel_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              insights: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              biggestOpportunity: { type: "string" },
            },
            required: ["insights", "recommendations", "biggestOpportunity"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : null;
    if (content) {
      const parsed = JSON.parse(content);
      insights = parsed.insights || [];
      recommendations = parsed.recommendations || [];
      if (parsed.biggestOpportunity) {
        recommendations.unshift(`🎯 BIGGEST OPPORTUNITY: ${parsed.biggestOpportunity}`);
      }
    }
  } catch (err) {
    console.error("[Nightly Analysis] LLM failed:", err);
    // Fallback rule-based insights
    insights = generateRuleBasedInsights(metrics);
    recommendations = generateRuleBasedRecommendations(metrics);
  }

  const report: NightlyReport = {
    date: today,
    metrics,
    insights,
    recommendations,
    abTestWinner,
    estimatedMonthlyRevenue,
  };

  // Send report to owner via notification
  await sendNightlyReport(report);

  return report;
}

function generateRuleBasedInsights(m: FunnelMetrics): string[] {
  const insights: string[] = [];

  if (m.tripwireConversionRate < 5) {
    insights.push(`Low tripwire conversion (${m.tripwireConversionRate.toFixed(1)}%) — quiz result page needs stronger loss aversion messaging`);
  } else if (m.tripwireConversionRate > 10) {
    insights.push(`Strong tripwire conversion (${m.tripwireConversionRate.toFixed(1)}%) — the $1 price point is working well`);
  }

  if (m.oto1Rate < 20) {
    insights.push(`OTO1 take rate low (${m.oto1Rate.toFixed(1)}%) — the 30-day program needs stronger social proof or urgency`);
  }

  if (m.topChronotype) {
    insights.push(`Most common chronotype: ${m.topChronotype} — consider creating targeted content for this group`);
  }

  if (m.emailLeads > m.tripwirePurchases * 2) {
    insights.push(`Email leads (${m.emailLeads}) significantly exceed purchases (${m.tripwirePurchases}) — strong follow-up email sequence opportunity`);
  }

  return insights;
}

function generateRuleBasedRecommendations(m: FunnelMetrics): string[] {
  const recs: string[] = [];

  if (m.tripwireConversionRate < 8) {
    recs.push("Add a countdown timer (48h) on the order page — scarcity increases urgency by 30-40%");
    recs.push("Add 3 more testimonials with specific sleep improvement numbers (e.g., 'went from 4h to 7.5h sleep')");
  }

  if (m.oto1Rate < 25) {
    recs.push("Test a 'one-time offer' banner on OTO1 page — emphasize this price disappears after they leave");
  }

  if (m.dropoffPoints.includes("Quiz → Order")) {
    recs.push("Add progress bar showing '87% of people with your chronotype improved sleep in 7 days' on quiz result page");
  }

  recs.push("Post 1 new FB/IG Reel today with hook: 'Why you wake up at 3am (and the 60-second fix)'");

  return recs;
}

async function sendNightlyReport(report: NightlyReport): Promise<void> {
  const { date, metrics: m, insights, recommendations, estimatedMonthlyRevenue } = report;

  const targetCZK = 500000;
  const currentMonthlyCZK = estimatedMonthlyRevenue * 25; // USD to CZK approx
  const progressPercent = Math.min((currentMonthlyCZK / targetCZK) * 100, 100).toFixed(1);

  const title = `🌙 Nightly Funnel Report — ${date}`;
  const content = `
**Deep Sleep Reset — Daily Analysis**

📊 **Key Metrics (Today)**
- Quiz completions: ${m.quizStarts}
- Tripwire sales: ${m.tripwirePurchases} (${m.tripwireConversionRate.toFixed(1)}% CVR)
- OTO1 sales: ${m.oto1Purchases} (${m.oto1Rate.toFixed(1)}%)
- OTO2 sales: ${m.oto2Purchases} (${m.oto2Rate.toFixed(1)}%)
- OTO3 sales: ${m.oto3Purchases} (${m.oto3Rate.toFixed(1)}%)
- Total revenue: $${m.totalRevenue.toFixed(2)}
- Email leads: ${m.emailLeads}

💰 **Monthly Projection**
- Estimated: $${estimatedMonthlyRevenue.toFixed(0)}/month (~${currentMonthlyCZK.toFixed(0)} CZK)
- Goal progress: ${progressPercent}% of 500k CZK target

🧠 **AI Insights**
${insights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

🎯 **Recommendations**
${recommendations.map((r, idx) => `${idx + 1}. ${r}`).join("\n")}

${report.abTestWinner ? `🏆 **A/B Test Winner:** ${report.abTestWinner}` : ""}
${m.dropoffPoints.length > 0 ? `⚠️ **Drop-off Points:** ${m.dropoffPoints.join(", ")}` : ""}
  `.trim();

  await notifyOwner({ title, content });
}

function getEmptyMetrics(): FunnelMetrics {
  return {
    quizStarts: 0, quizCompletions: 0, quizCompletionRate: 0,
    tripwirePurchases: 0, tripwireConversionRate: 0,
    oto1Purchases: 0, oto1Rate: 0,
    oto2Purchases: 0, oto2Rate: 0,
    oto3Purchases: 0, oto3Rate: 0,
    totalRevenue: 0, avgOrderValue: 0,
    emailLeads: 0, topChronotype: "bear",
    pageViews: {}, dropoffPoints: [],
  };
}
