import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MarketingScrollProvider } from "@/components/layout/MarketingScrollProvider";
import { PromoBannerBar } from "@/components/layout/PromoBannerBar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingScrollProvider>
      <PromoBannerBar />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </MarketingScrollProvider>
  );
}
