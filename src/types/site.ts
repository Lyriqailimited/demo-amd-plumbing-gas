export interface LinkConfig {
  label: string;
  href: string;
}

export interface AnnouncementConfig {
  label: string;
  text: string;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  cta: LinkConfig;
}

export interface NavigationItem {
  label: string;
  href?: string;
  action?: "scroll" | "open_agent";
}

export interface ThemeConfig {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  primary: string;
  primarySoft: string;
  accent: string;
  border: string;
}

export interface HeroProposalConfig {
  label: string;
  title: string;
  description: string;
  documentLabel: string;
  documentTitle: string;
  documentDescription: string;
  documentUrl: string;
  documentType?: "auto" | "pdf" | "doc" | "docx" | "ppt" | "pptx" | "xls" | "xlsx";
  openDocumentCta: LinkConfig;
  knowledgeBaseLabel: string;
}

export interface HeroPartyConfig {
  label: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
  website: string;
  industry: string;
  contactName: string;
  contactRole: string;
  summary: string;
  highlights: string[];
}

export interface HeroSection {
  id: string;
  type: "hero";
  layout: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: LinkConfig;
  secondaryCta: LinkConfig;
  proposal: HeroProposalConfig;
  // sender: HeroPartyConfig;
  recipient: HeroPartyConfig;
}

export type SupplementalSection =
  | MetricsSection
  | BentoSection
  | ProcessSection
  | ShowcaseSection
  | PricingSection
  | FaqSection
  | CtaSection;

export interface MetricsSection {
  id: string;
  type: "metrics";
  layout: string;
  items: Array<{
    value: string;
    label: string;
  }>;
}

export interface BentoSection {
  id: string;
  type: "bento";
  layout: string;
  eyebrow: string;
  headline: string;
  description: string;
  items: Array<{
    title: string;
    description: string;
    accent: string;
    icon: string;
    span: "standard" | "wide" | "tall";
  }>;
}

export interface ProcessSection {
  id: string;
  type: "process";
  layout: string;
  eyebrow: string;
  headline: string;
  description: string;
  steps: Array<{
    step: string;
    title: string;
    description: string;
    outcome: string;
  }>;
}

export interface ShowcaseSection {
  id: string;
  type: "showcase";
  layout: string;
  eyebrow: string;
  headline: string;
  description: string;
  items: Array<{
    title: string;
    description: string;
    tags: string[];
  }>;
}

export interface PricingSection {
  id: string;
  type: "pricing";
  layout: string;
  eyebrow: string;
  headline: string;
  description: string;
  tiers: Array<{
    name: string;
    price: string;
    cadence: string;
    featured: boolean;
    description: string;
    cta: LinkConfig;
    points: string[];
  }>;
}

export interface FaqSection {
  id: string;
  type: "faq";
  layout: string;
  eyebrow: string;
  headline: string;
  description: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CtaSection {
  id: string;
  type: "cta";
  layout: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: LinkConfig;
  secondaryCta: LinkConfig;
  note: string;
}

export type PageSection =
  | HeroSection
  | MetricsSection
  | BentoSection
  | ProcessSection
  | ShowcaseSection
  | PricingSection
  | FaqSection
  | CtaSection;

export interface WidgetColors {
  primary: string;
  primaryHover: string;
  accent: string;
  endButton: string;
  endButtonHover: string;
  text: string;
  subtitle: string;
  success: string;
  panel: string;
  panelStrong: string;
}

export interface WidgetConfig {
  autoOpen: boolean;
  autoOpenDelayMs: number;
  backendUrl: string;
  assistantId: string;
  launcherLabel: string;
  badgeText: string;
  title: string;
  subtitle: string;
  startButtonText: string;
  endButtonText: string;
  statusReady: string;
  statusConnected: string;
  greetingText: string;
  connectingText: string;
  connectedText: string;
  agentReadyText: string;
  disconnectedText: string;
  connectionFailedText: string;
  colors: WidgetColors;
}

export interface FooterConfig {
  caption: string;
  copyright: string;
}

export interface SiteShellContent {
  meta: {
    title: string;
    description: string;
  };
  announcement: AnnouncementConfig;
  brand: BrandConfig;
  navigation: NavigationItem[];
  footer: FooterConfig;
  theme: ThemeConfig;
  hero: Omit<HeroSection, "proposal" | "sender" | "recipient">;
  sections?: SupplementalSection[];
}

export interface TargetCompanyContent {
  proposal: HeroProposalConfig;
  recipient: HeroPartyConfig;
}

export interface SiteContent {
  meta: {
    title: string;
    description: string;
  };
  announcement: AnnouncementConfig;
  brand: BrandConfig;
  navigation: NavigationItem[];
  footer: FooterConfig;
  theme: ThemeConfig;
  sections: PageSection[];
  widget: WidgetConfig;
}
