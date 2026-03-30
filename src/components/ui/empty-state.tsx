import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-[32px] p-12 text-center border-none shadow-2xl flex flex-col items-center">
      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-on-surface-variant/30" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold text-on-background mb-2">{title}</h2>
      <p className="text-on-surface-variant/60 max-w-sm mx-auto text-sm leading-relaxed mb-6">
        {description}
      </p>
      {ctaLabel && onCta && (
        <Button
          onClick={onCta}
          className="m3-button-premium px-8 h-12 border-none"
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
