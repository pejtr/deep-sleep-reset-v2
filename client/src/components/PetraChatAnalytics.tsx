import { trpc } from "@/lib/trpc";

const CHRONOTYPE_COLOR: Record<string, string> = {
  lion: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  bear: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  wolf: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  dolphin: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
};
const CHRONOTYPE_EMOJI: Record<string, string> = {
  lion: "🦁", bear: "🐻", wolf: "🐺", dolphin: "🐬",
};

export default function PetraChatAnalytics() {
  const { data, isLoading, error } = trpc.chatbot.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[oklch(0.65_0.22_280)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
        Failed to load chat analytics: {error.message}
      </div>
    );
  }

  const stats = data ?? {
    totalSessions: 0,
    totalMessages: 0,
    conversions: 0,
    conversionRate: 0,
    topChronotypes: [],
    recentSessions: [],
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: stats.totalSessions, icon: "💬", color: "text-blue-400" },
          { label: "Total Messages", value: stats.totalMessages, icon: "📨", color: "text-purple-400" },
          { label: "Conversions", value: stats.conversions, icon: "🎯", color: "text-green-400" },
          { label: "Conv. Rate", value: `${stats.conversionRate}%`, icon: "📈", color: "text-amber-400" },
        ].map((item) => (
          <div key={item.label} className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-xs text-[oklch(0.55_0.04_265)] font-semibold mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Chronotype Distribution */}
      <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">🧬 Detected Chronotypes</h3>
        {stats.topChronotypes.length === 0 ? (
          <p className="text-xs text-[oklch(0.45_0.04_265)]">No chronotypes detected yet — data will appear as users chat with Petra.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.topChronotypes.map((ct: { chronotype: string | null; count: number }) => {
              const key = ct.chronotype ?? "unknown";
              return (
                <div key={key} className={`rounded-xl p-3 border ${CHRONOTYPE_COLOR[key] ?? "text-gray-400 bg-gray-400/10 border-gray-400/30"}`}>
                  <div className="text-2xl mb-1">{CHRONOTYPE_EMOJI[key] ?? "❓"}</div>
                  <div className="text-xl font-black">{ct.count}</div>
                  <div className="text-xs font-semibold capitalize">{key}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[oklch(0.22_0.03_265)]">
          <h3 className="text-sm font-bold text-white">🕐 Recent Chat Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.22_0.03_265)]">
                {["Session ID", "Chronotype", "Messages", "Email", "Converted", "Source", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs text-[oklch(0.5_0.04_265)] font-semibold uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[oklch(0.4_0.03_265)] text-xs">
                    No chat sessions yet — data will appear as users interact with Petra.
                  </td>
                </tr>
              ) : (
                stats.recentSessions.map((session: {
                  id: number;
                  sessionId: string;
                  chronotype: string | null;
                  messageCount: number;
                  email: string | null;
                  converted: boolean;
                  source: string | null;
                  createdAt: Date | string;
                }) => (
                  <tr key={session.id} className="border-b border-[oklch(0.18_0.03_265)] hover:bg-[oklch(0.14_0.025_265)]">
                    <td className="px-4 py-2.5 text-[oklch(0.5_0.04_265)] font-mono text-xs">
                      {session.sessionId.slice(0, 16)}…
                    </td>
                    <td className="px-4 py-2.5">
                      {session.chronotype ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CHRONOTYPE_COLOR[session.chronotype] ?? ""}`}>
                          {CHRONOTYPE_EMOJI[session.chronotype] ?? "❓"} {session.chronotype}
                        </span>
                      ) : (
                        <span className="text-xs text-[oklch(0.4_0.04_265)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[oklch(0.7_0.04_265)] font-bold">{session.messageCount}</td>
                    <td className="px-4 py-2.5 text-xs text-[oklch(0.6_0.04_265)]">
                      {session.email ?? <span className="text-[oklch(0.4_0.04_265)]">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      {session.converted ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">✓ Yes</span>
                      ) : (
                        <span className="text-xs text-[oklch(0.4_0.04_265)]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[oklch(0.55_0.04_265)]">{session.source ?? "organic"}</td>
                    <td className="px-4 py-2.5 text-xs text-[oklch(0.5_0.04_265)]">
                      {new Date(session.createdAt).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[oklch(0.4_0.03_265)] text-center">
        Data updates in real-time as users interact with Petra. Conversions = users who clicked the quiz/order CTA from chat.
      </p>
    </div>
  );
}
