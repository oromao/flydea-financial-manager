import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  secondaryCta?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, onCta, secondaryCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {(ctaLabel && onCta) || secondaryCta ? (
        <div className="flex gap-3">
          {secondaryCta && (
            <Button variant="outline" onClick={secondaryCta.onClick} className="h-11">
              {secondaryCta.label}
            </Button>
          )}
          {ctaLabel && onCta && (
            <Button onClick={onCta} className="h-11 px-6">
              {ctaLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
