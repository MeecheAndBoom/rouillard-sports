import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { CookieConsent } from "@/components/site/CookieConsent";
import { PageFade } from "@/components/site/PageFade";
import { RouteProgress } from "@/components/site/RouteProgress";
import { ToastProvider } from "@/components/ui/Toast";

/** Public chrome — top bar, veils/progress, cart panel, footer, cookie gate. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Nav />
      <CartDrawer />
      <CookieConsent />
      <PageFade />
      <RouteProgress />
      <main id="main" className="min-h-[70vh] pt-[16px] md:pt-[52px]">
        {children}
      </main>
      <Footer />
    </ToastProvider>
  );
}
