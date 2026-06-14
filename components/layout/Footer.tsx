"use client";

import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="text-[19px] font-semibold tracking-tightest">aly</span>
        <div className="flex items-center gap-7 text-[13px] text-white/45">
          <a href="#" className="transition-colors hover:text-white">{t("Privacy", "Конфиденциальность")}</a>
          <a href="#" className="transition-colors hover:text-white">{t("Terms", "Условия")}</a>
          <a href="#" className="transition-colors hover:text-white">{t("Support", "Поддержка")}</a>
        </div>
        <span className="text-[13px] text-white/30">© 2026 aly</span>
      </div>
    </footer>
  );
}
