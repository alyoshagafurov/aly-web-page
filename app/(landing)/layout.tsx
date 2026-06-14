import SmoothScroll from "@/components/providers/SmoothScroll";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <Nav />
      <main>{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
