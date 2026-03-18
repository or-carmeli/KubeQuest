import { Settings, Globe, ShieldCheck, HardDrive, Wrench, Monitor, RefreshCw } from "lucide-react";

const TOPIC_ICONS = {
  workloads: Settings,
  networking: Globe,
  config: ShieldCheck,
  storage: HardDrive,
  troubleshooting: Wrench,
  linux: Monitor,
  argo: RefreshCw,
};

export default function TopicIcon({ name, size = 18, color, style }) {
  const C = TOPIC_ICONS[name];
  return C ? <C size={size} strokeWidth={1.5} color={color} style={{ flexShrink: 0, ...style }} /> : null;
}
