"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  ExternalLink,
  FileJson,
  FileText,
  Globe,
  LayoutGrid,
  Mic,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  AnnouncementConfig,
  BentoSection,
  BrandConfig,
  CtaSection,
  FaqSection,
  FooterConfig,
  HeroSection,
  MetricsSection,
  NavigationItem,
  PageSection,
  PricingSection,
  ProcessSection,
  ShowcaseSection,
} from "@/types/site";

const iconMap = {
  FileJson,
  LayoutGrid,
  Sparkles,
  Mic,
  Rocket,
  ShieldCheck,
} as const;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

function resolveIcon(name: keyof typeof iconMap) {
  return iconMap[name] ?? Sparkles;
}

function isRenderableUrl(url: string) {
  return /^https?:\/\//.test(url) && !url.includes("<");
}

function inferDocumentType(url: string) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const extension = pathname.split(".").pop();
    return extension ?? "pdf";
  } catch {
    return "pdf";
  }
}

function getDocumentPreviewUrl(url: string, type?: string) {
  if (!isRenderableUrl(url)) {
    return null;
  }

  const resolvedType = (type && type !== "auto" ? type : inferDocumentType(url)).toLowerCase();

  if (resolvedType === "pdf") {
    return `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  }

  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(resolvedType)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }

  return url;
}

function openAgentWidget() {
  window.dispatchEvent(new CustomEvent("pipecat-widget:open"));
}

function PartyCard({
  party,
  tone,
}: {
  party: HeroSection["recipient"];
  tone: "sender" | "recipient";
}) {
  const showLogo = isRenderableUrl(party.logoUrl);
  const labelToneClass =
    tone === "sender"
      ? "text-[color:var(--page-primary)]"
      : "text-[color:var(--page-accent)]";

  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${labelToneClass}`}>
        {party.label}
      </p>

      <div className="mt-4 flex h-20 items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.03] px-4">
        {showLogo ? (
          // The logo URL is intentionally fully dynamic and may come from Cloudinary or a third-party source.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={party.logoUrl}
            alt={party.logoAlt}
            className="max-h-12 w-auto object-contain"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white">
            {party.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <h3 className="mt-5 text-2xl font-semibold text-white">{party.name}</h3>

      <div className="mt-5 space-y-3 text-sm text-[color:var(--page-muted)]">
        <div className="flex gap-3">
          <Globe className="mt-0.5 h-4 w-4 text-[color:var(--page-primary)]" />
          <span>{party.website}</span>
        </div>
        <div className="flex gap-3">
          <Building2 className="mt-0.5 h-4 w-4 text-[color:var(--page-primary)]" />
          <span>{party.industry}</span>
        </div>
        <div className="flex gap-3">
          <UserRound className="mt-0.5 h-4 w-4 text-[color:var(--page-primary)]" />
          <span>
            {party.contactName} · {party.contactRole}
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-[color:var(--page-muted)]">
        {party.summary}
      </p>

      <div className="mt-5 space-y-3">
        {party.highlights.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-4 text-sm leading-6 text-white/90"
          >
            <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--page-primary)]" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  headline,
  description,
}: {
  eyebrow: string;
  headline: string;
  description: string;
}) {
  return (
    <motion.div {...reveal} className="max-w-3xl">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {headline}
      </h2>
      <p className="section-copy mt-4">{description}</p>
    </motion.div>
  );
}

function HeaderNavItem({
  item,
  mobile = false,
}: {
  item: NavigationItem;
  mobile?: boolean;
}) {
  const className = mobile
    ? "flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
    : "text-sm text-[color:var(--page-muted)] transition hover:text-white";

  if (item.action === "open_agent") {
    return (
      <button type="button" onClick={openAgentWidget} className={className}>
        {item.label}
      </button>
    );
  }

  return (
    <a href={item.href ?? "#hero"} className={className}>
      {item.label}
    </a>
  );
}

export function SiteHeader({
  announcement,
  brand,
  navigation,
}: {
  announcement: AnnouncementConfig;
  brand: BrandConfig;
  navigation: NavigationItem[];
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className="section-shell pt-4">
        <div className="panel rounded-[28px] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <a href="#hero" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-white">
                    {brand.name}
                  </p>
                  <p className="hidden text-sm text-[color:var(--page-muted)] sm:block">
                    {brand.tagline}
                  </p>
                </div>
              </a>

              <a
                href={brand.cta.href}
                className="cta-button-secondary shrink-0 px-4 py-3 text-sm md:hidden"
              >
                {brand.cta.label}
              </a>

              <div className="hidden flex-1 justify-end md:flex">
                <div className="max-w-3xl rounded-full border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-[color:var(--page-muted)] sm:px-4 sm:text-sm">
                  <span className="mr-2 inline-flex rounded-full bg-[color:var(--page-primary-soft)] px-2 py-1 font-semibold text-[color:var(--page-primary)]">
                    {announcement.label}
                  </span>
                  <span>{announcement.text}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              <nav className="grid grid-cols-2 gap-2 rounded-[24px] border border-white/10 bg-black/10 p-2">
                {navigation.map((item) => (
                  <HeaderNavItem
                    key={`${item.label}-${item.href ?? item.action ?? "mobile"}`}
                    item={item}
                    mobile
                  />
                ))}
              </nav>

              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-[color:var(--page-muted)]">
                <span className="mr-2 inline-flex rounded-full bg-[color:var(--page-primary-soft)] px-2 py-1 font-semibold text-[color:var(--page-primary)]">
                  {announcement.label}
                </span>
                <span>{announcement.text}</span>
              </div>
            </div>

            <div className="hidden flex-wrap items-center gap-3 md:flex">
              <nav className="flex items-center gap-4 rounded-full border border-white/10 bg-black/10 px-5 py-3">
                {navigation.map((item) => (
                  <HeaderNavItem
                    key={`${item.label}-${item.href ?? item.action ?? "desktop"}`}
                    item={item}
                  />
                ))}
              </nav>
              <a href={brand.cta.href} className="cta-button-secondary">
                {brand.cta.label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSectionView({ section }: { section: HeroSection }) {
  const documentPreviewUrl = getDocumentPreviewUrl(
    section.proposal.documentUrl,
    section.proposal.documentType,
  );

  return (
    <section id={section.id} className="section-shell pb-16 pt-8 sm:pb-20">
      <div className="panel rounded-[36px] p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6">
          <motion.div
            {...reveal}
            className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] px-6 py-10 text-center sm:px-10"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at top, color-mix(in srgb, var(--page-primary) 14%, transparent), transparent 58%)",
              }}
            />
            <div className="relative mx-auto max-w-4xl">
              <span className="section-eyebrow">{section.eyebrow}</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {section.title}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[color:var(--page-muted)] sm:text-base">
                {section.description}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a href={section.primaryCta.href} className="cta-button-primary">
                  {section.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a href={section.secondaryCta.href} className="cta-button-secondary">
                  {section.secondaryCta.label}
                </a>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2.45fr)_320px]">
            <motion.article
              {...reveal}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-[color:var(--page-surface)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--page-accent)]">
                    {section.proposal.documentLabel}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {section.proposal.documentTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">
                    {section.proposal.documentDescription}
                  </p>
                </div>
                <a
                  href={section.proposal.openDocumentCta.href}
                  target="_blank"
                  rel="noreferrer"
                  className="cta-button-secondary"
                >
                  {section.proposal.openDocumentCta.label}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>

              <div className="relative min-h-[620px] bg-black/20">
                {documentPreviewUrl ? (
                  <iframe
                    src={documentPreviewUrl}
                    title={section.proposal.documentTitle}
                    className="h-[620px] w-full bg-white"
                  />
                ) : (
                  <div className="flex h-[620px] flex-col items-center justify-center px-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <FileText className="h-7 w-7 text-[color:var(--page-primary)]" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-white">
                      Add your Cloudinary proposal URL
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--page-muted)]">
                      Replace the placeholder document URL in the target-company JSON with a Cloudinary-hosted proposal file. PDF links render directly here, and Office formats fall back to an embed viewer automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-[color:var(--page-muted)] sm:px-6">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-[color:var(--page-primary)]" />
                  <span>{section.proposal.knowledgeBaseLabel}</span>
                </div>
                <span>{section.proposal.documentType?.toUpperCase() ?? "AUTO"}</span>
              </div>
            </motion.article>

            <motion.aside
              {...reveal}
              className="flex h-full flex-col gap-5 rounded-[30px] border border-white/10 bg-[color:var(--page-surface)] p-5 sm:p-6"
            >
              {/* <PartyCard party={section.sender} tone="sender" /> */}
              <PartyCard party={section.recipient} tone="recipient" />
            </motion.aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricsSectionView({ section }: { section: MetricsSection }) {
  return (
    <section id={section.id} className="section-shell py-2">
      <motion.div
        {...reveal}
        className="panel grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4"
      >
        {section.items.map((item) => (
          <div
            key={`${item.value}-${item.label}`}
            className="rounded-[22px] border border-white/10 bg-black/10 p-5"
          >
            <p className="text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--page-muted)]">
              {item.label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function BentoSectionView({ section }: { section: BentoSection }) {
  return (
    <section id={section.id} className="section-shell py-16 sm:py-20">
      <SectionIntro
        eyebrow={section.eyebrow}
        headline={section.headline}
        description={section.description}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {section.items.map((item, index) => {
          const Icon = resolveIcon(item.icon as keyof typeof iconMap);

          return (
            <motion.article
              key={item.title}
              className={cn(
                "panel relative overflow-hidden p-6",
                item.span === "wide" && "lg:col-span-2",
                item.span === "tall" && "lg:min-h-[24rem]",
              )}
              style={{
                backgroundImage:
                  "radial-gradient(circle at top, color-mix(in srgb, var(--page-primary) 10%, transparent), transparent 68%)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.07,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-40"
                style={{
                  background:
                    "radial-gradient(circle at top, color-mix(in srgb, var(--page-primary) 16%, transparent), transparent 70%)",
                }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Icon className="h-5 w-5 text-[color:var(--page-primary)]" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--page-accent)]">
                  {item.accent}
                </span>
              </div>
              <h3 className="relative mt-10 text-2xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="relative mt-4 text-sm leading-7 text-[color:var(--page-muted)]">
                {item.description}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function ProcessSectionView({ section }: { section: ProcessSection }) {
  return (
    <section id={section.id} className="section-shell py-16 sm:py-20">
      <SectionIntro
        eyebrow={section.eyebrow}
        headline={section.headline}
        description={section.description}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {section.steps.map((step, index) => (
          <motion.article
            key={step.step}
            className="panel p-6"
            initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.08,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--page-accent)]">
                Step {step.step}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">{step.title}</h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--page-muted)]">
              {step.description}
            </p>
            <p className="mt-5 rounded-[20px] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-7 text-white/90">
              {step.outcome}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ShowcaseSectionView({ section }: { section: ShowcaseSection }) {
  return (
    <section id={section.id} className="section-shell py-16 sm:py-20">
      <SectionIntro
        eyebrow={section.eyebrow}
        headline={section.headline}
        description={section.description}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {section.items.map((item, index) => (
          <motion.article
            key={item.title}
            className="panel h-full p-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.08,
            }}
          >
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--page-accent)]">
              Use case {index + 1}
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">{item.title}</h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--page-muted)]">
              {item.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-black/10 px-3 py-2 text-xs font-medium text-[color:var(--page-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function PricingSectionView({ section }: { section: PricingSection }) {
  return (
    <section id={section.id} className="section-shell py-16 sm:py-20">
      <SectionIntro
        eyebrow={section.eyebrow}
        headline={section.headline}
        description={section.description}
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {section.tiers.map((tier, index) => (
          <motion.article
            key={tier.name}
            className={cn(
              "panel relative p-6",
              tier.featured && "border-[color:var(--page-primary-soft)]",
            )}
            style={
              tier.featured
                ? {
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--page-primary) 14%, transparent), rgba(255,255,255,0.04))",
                  }
                : undefined
            }
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.08,
            }}
          >
            {tier.featured ? (
              <span className="absolute right-6 top-6 rounded-full bg-[color:var(--page-primary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                Recommended
              </span>
            ) : null}
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--page-accent)]">
              {tier.name}
            </p>
            <div className="mt-5 flex items-end gap-2">
              <p className="text-5xl font-semibold text-white">{tier.price}</p>
              <span className="pb-2 text-sm text-[color:var(--page-muted)]">
                {tier.cadence}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[color:var(--page-muted)]">
              {tier.description}
            </p>

            <div className="mt-6 space-y-3">
              {tier.points.map((point) => (
                <div key={point} className="flex gap-3 text-sm leading-6 text-white/90">
                  <Check className="mt-0.5 h-4 w-4 text-[color:var(--page-primary)]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <a href={tier.cta.href} className="cta-button-primary mt-8 inline-flex">
              {tier.cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function FaqSectionView({ section }: { section: FaqSection }) {
  return (
    <section id={section.id} className="section-shell py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <SectionIntro
          eyebrow={section.eyebrow}
          headline={section.headline}
          description={section.description}
        />

        <div className="space-y-4">
          {section.items.map((item, index) => (
            <motion.details
              key={item.question}
              className="panel group overflow-hidden p-0"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.05,
              }}
            >
              <summary className="cursor-pointer list-none px-6 py-5 text-lg font-semibold text-white marker:hidden">
                {item.question}
              </summary>
              <div className="border-t border-white/10 px-6 py-5 text-sm leading-7 text-[color:var(--page-muted)]">
                {item.answer}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSectionView({ section }: { section: CtaSection }) {
  return (
    <section id={section.id} className="section-shell py-16 sm:py-20">
      <motion.div
        {...reveal}
        className="panel relative overflow-hidden px-6 py-12 text-center sm:px-10"
      >
        <div
          className="absolute inset-x-1/4 top-[-6rem] h-40 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--page-primary) 30%, transparent), transparent 70%)",
          }}
        />
        <span className="section-eyebrow">{section.eyebrow}</span>
        <h2 className="mx-auto mt-6 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          {section.title}
        </h2>
        <p className="section-copy mx-auto mt-5 max-w-2xl">{section.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={section.primaryCta.href} className="cta-button-primary">
            {section.primaryCta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <a href={section.secondaryCta.href} className="cta-button-secondary">
            {section.secondaryCta.label}
          </a>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[color:var(--page-muted)]">
          {section.note}
        </p>
      </motion.div>
    </section>
  );
}

export function PageSections({ sections }: { sections: PageSection[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return <HeroSectionView key={section.id} section={section} />;
          case "metrics":
            return <MetricsSectionView key={section.id} section={section} />;
          case "bento":
            return <BentoSectionView key={section.id} section={section} />;
          case "process":
            return <ProcessSectionView key={section.id} section={section} />;
          case "showcase":
            return <ShowcaseSectionView key={section.id} section={section} />;
          case "pricing":
            return <PricingSectionView key={section.id} section={section} />;
          case "faq":
            return <FaqSectionView key={section.id} section={section} />;
          case "cta":
            return <CtaSectionView key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}

export function SiteFooter({ footer }: { footer: FooterConfig }) {
  return (
    <footer className="section-shell pb-10 pt-4">
      <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-[color:var(--page-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl">{footer.caption}</p>
        <p>{footer.copyright}</p>
      </div>
    </footer>
  );
}
