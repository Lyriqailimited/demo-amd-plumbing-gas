import { BackgroundEffects } from "@/components/ui/background-effects";
import {
  PageSections,
  SiteFooter,
  SiteHeader,
} from "@/components/page-sections";
import VoiceWidget from "../../VoiceWidget";
import { getSiteContent, getThemeStyle } from "@/lib/site-content";

export default function HomePage() {
  const siteContent = getSiteContent();

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[color:var(--page-bg)] text-[color:var(--page-text)]"
      style={getThemeStyle(siteContent.theme)}
    >
      <BackgroundEffects />
      <SiteHeader
        announcement={siteContent.announcement}
        brand={siteContent.brand}
        navigation={siteContent.navigation}
      />
      <PageSections sections={siteContent.sections} />
      <SiteFooter footer={siteContent.footer} />
      <VoiceWidget config={siteContent.widget} />
    </main>
  );
}
