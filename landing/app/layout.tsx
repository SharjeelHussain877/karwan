import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DadSmith | Manage Google & Meta Ads, Securely",
  description:
    "DadSmith connects to your Google and Meta ads accounts to manage campaigns and publish ads for you. Your data is never shared with anyone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}var d=document,r=d.documentElement;r.setAttribute("data-js","");var io=new IntersectionObserver(function(es){es.forEach(function(e){var t=e.target;if(e.isIntersecting){t.classList.add("in","live")}else{t.classList.remove("live")}})},{rootMargin:"0px 0px -8% 0px"});var tick=false;function upd(){tick=false;var h=d.querySelector("[data-hero]");if(!h)return;var p=Math.min(1,Math.max(0,scrollY/(innerHeight*0.5)));h.style.setProperty("--p",p.toFixed(3));h.classList.toggle("off",p>=1)}function scan(){d.querySelectorAll("[data-reveal]").forEach(function(el){if(!el.__o){el.__o=1;io.observe(el)}});upd()}new MutationObserver(scan).observe(d,{childList:true,subtree:true});d.addEventListener("DOMContentLoaded",scan);addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});addEventListener("resize",upd);document.addEventListener("click",function(e){var b=e.target&&e.target.closest&&e.target.closest("[data-theme-toggle]");if(!b)return;var r=document.documentElement;var n=r.getAttribute("data-theme")==="dark"?"light":"dark";r.setAttribute("data-theme",n);try{localStorage.setItem("theme",n)}catch(x){}})})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <button
          type="button"
          data-theme-toggle
          aria-label="Toggle light and dark theme"
          className="fixed right-4 top-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-accent shadow-sm transition hover:scale-105 hover:border-accent"
        >
          <svg viewBox="0 0 24 24" className="pointer-events-none hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg viewBox="0 0 24 24" className="pointer-events-none block h-5 w-5 dark:hidden" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
          </svg>
        </button>

        <div className="flex flex-1 flex-col">{children}</div>

        <footer className="border-t border-line px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
            <p>© 2026 DadSmith. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="transition-colors hover:text-foreground">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
