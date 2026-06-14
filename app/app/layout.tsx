import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "aly",
  description: "Your money, ideas & goals — in focus.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "aly" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {children}
    </div>
  );
}
