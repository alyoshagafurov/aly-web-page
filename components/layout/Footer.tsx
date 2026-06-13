export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="text-[19px] font-semibold tracking-tightest">aly</span>
        <div className="flex items-center gap-7 text-[13px] text-white/45">
          <a href="#" className="transition-colors hover:text-white">Privacy</a>
          <a href="#" className="transition-colors hover:text-white">Terms</a>
          <a href="#" className="transition-colors hover:text-white">Support</a>
        </div>
        <span className="text-[13px] text-white/30">© 2026 aly</span>
      </div>
    </footer>
  );
}
