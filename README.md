# aly — landing page

Premium, minimal, black-and-white marketing site for **aly**, a personal life
dashboard (money · ideas · goals · productivity · a Mind reading section).

Built to feel expensive, cinematic and ultra-clean — Apple / Linear / Nothing energy.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** — strict monochrome design system
- **Framer Motion** — reveals, magnetic buttons, hover states
- **GSAP + ScrollTrigger** — pinned scroll, scrub, horizontal gallery
- **React Three Fiber / Three.js** — floating 3D phone (desktop)
- **Lenis** — buttery smooth scroll

## Sections

Hero · Showcase · Features · **Book Reading Mode** · Experience · App Preview · CTA

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Notes

- Mobile-first & fully responsive — the WebGL phone renders only on desktop;
  mobile gets a crisp CSS phone for performance.
- Respects `prefers-reduced-motion`.

🤖 Built with [Claude Code](https://claude.com/claude-code)
