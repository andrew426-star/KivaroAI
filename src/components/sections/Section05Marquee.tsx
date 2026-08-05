import { SERVICES, TOOLS } from '@/constants/mockData';
import { DIVISIONS } from '@/components/features/AgentTeamSection';
import TextMarquee from '@/components/features/TextMarquee';
import TickerStrip from '@/components/features/data-graphs/TickerStrip';

const SERVICE_TITLES = SERVICES.map((s) => s.title);
const AGENT_NAME_ROLES = DIVISIONS.flatMap((d) => d.agents.map((a) => `${a.name} — ${a.role}`));
const TOOL_NAMES = TOOLS.map((t) => t.name);

// Connective tissue between Trust and Deploy — no nav entry, same role
// Home's marquee dividers played previously. Deliberately real data rows
// only, not illustrative Slack-style examples: at this low-opacity
// background treatment, an unlabeled invented command string risks being
// misread as a real captured screenshot.
export default function Section05Marquee() {
  return (
    <div className="relative z-base py-10 lg:py-14 space-y-4">
      <TextMarquee words={SERVICE_TITLES} className="py-3" />
      <TextMarquee words={AGENT_NAME_ROLES} className="py-3" reverse />
      <TextMarquee words={TOOL_NAMES} className="py-3" />
      <TickerStrip count={56} reverse />
    </div>
  );
}
