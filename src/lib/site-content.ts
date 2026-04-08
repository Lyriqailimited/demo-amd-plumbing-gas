import type { CSSProperties } from "react";

// import senderCompany from "@/data/sender-company.json";
import siteShell from "@/data/site-shell.json";
import targetCompany from "@/data/target-company.json";
import widgetContent from "@/data/widget-content.json";
import type {
  HeroSection,
  SiteContent,
  SiteShellContent,
  TargetCompanyContent,
} from "@/types/site";

export function getSiteContent() {
  const shell = siteShell as SiteShellContent;
  const target = targetCompany as TargetCompanyContent;

  const heroSection: HeroSection = {
    ...shell.hero,
    proposal: target.proposal,
    // sender: senderCompany,
    recipient: target.recipient,
  };

  return {
    meta: shell.meta,
    announcement: shell.announcement,
    brand: shell.brand,
    navigation: shell.navigation,
    footer: shell.footer,
    theme: shell.theme,
    sections: [heroSection, ...(shell.sections ?? [])],
    widget: widgetContent,
  } as SiteContent;
}

export function getThemeStyle(theme: SiteContent["theme"]): CSSProperties {
  return {
    "--page-bg": theme.background,
    "--page-bg-secondary": theme.backgroundSecondary,
    "--page-surface": theme.surface,
    "--page-surface-strong": theme.surfaceStrong,
    "--page-text": theme.text,
    "--page-muted": theme.muted,
    "--page-primary": theme.primary,
    "--page-primary-soft": theme.primarySoft,
    "--page-accent": theme.accent,
    "--page-border": theme.border,
  } as CSSProperties;
}
