"use client";

import dynamic from "next/dynamic";

const IntelligentCopilot = dynamic(
  () => import("./intelligent-copilot").then(mod => ({ default: mod.IntelligentCopilot })),
  { loading: () => null }
);

export function CopilotWrapper() {
  return <IntelligentCopilot />;
}
