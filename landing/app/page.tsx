import Link from "next/link";

/* ---------- Google & Meta marks ---------- */

function GoogleMark({ x = 0, y = 0, size = 24 }: { x?: number; y?: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 48})`}>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.991 21.991 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </g>
  );
}

function MetaMark({ x = 0, y = 0, width = 32 }: { x?: number; y?: number; width?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${width / 64})`}>
      <defs>
        <linearGradient id="meta-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0064E0" />
          <stop offset="1" stopColor="#0081FB" />
        </linearGradient>
      </defs>
      <path
        d="M32 20C26 10 20 4 14 4 7 4 4 12 4 20s3 16 10 16c6 0 12-6 18-16 6-10 12-16 18-16 7 0 10 8 10 16s-3 16-10 16c-6 0-12-6-18-16z"
        fill="none"
        stroke="url(#meta-grad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <GoogleMark size={48} />
    </svg>
  );
}

function MetaIcon({ className = "h-5 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <MetaMark width={64} />
    </svg>
  );
}

/* ---------- Animated SVG illustrations (growth over time) ---------- */

const HeroArt = (
  <svg viewBox="0 0 800 440" className="mx-auto h-auto w-full" role="img" aria-label="Dashboard where campaigns are created and ads are published">
    <defs>
      <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--accent-2)" stopOpacity="0.35" />
        <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="dash-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="var(--accent)" />
        <stop offset="1" stopColor="var(--accent-3)" />
      </linearGradient>
    </defs>

    {/* window */}
    <rect x="8" y="8" width="784" height="424" rx="22" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
    <line x1="8" x2="792" y1="52" y2="52" stroke="var(--line)" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={34 + i * 18} cy="30" r="5" fill="var(--line)" />
    ))}
    <rect x="300" y="21" width="200" height="18" rx="9" fill="var(--accent-soft)" />

    {/* sidebar */}
    <rect x="8" y="53" width="150" height="379" fill="var(--accent-soft)" fillOpacity="0.5" />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x="30" y={84 + i * 44} width="22" height="22" rx="7" fill={i === 0 ? "var(--accent)" : "var(--line)"} />
        <rect x="62" y={90 + i * 44} width={i === 0 ? 70 : 56} height="10" rx="5" fill={i === 0 ? "var(--accent)" : "var(--line)"} />
      </g>
    ))}

    {/* KPI cards */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={184 + i * 200} y="72" width="184" height="84" rx="14" fill="var(--background)" stroke="var(--line)" />
        <rect x={200 + i * 200} y="90" width="60" height="8" rx="4" fill="var(--line)" />
        <rect className="grow-x" x={200 + i * 200} y="112" width={70 + i * 24} height="22" rx="7" fill="var(--accent)" style={{ animationDelay: `${i * 0.3}s` }} />
        <path className="draw" pathLength="1" d={`M${300 + i * 200} 140 l14 -8 l12 4 l16 -16`} fill="none" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${i * 0.3}s` }} />
      </g>
    ))}

    {/* growth chart */}
    <rect x="184" y="176" width="384" height="234" rx="14" fill="var(--background)" stroke="var(--line)" />
    {[226, 266, 306, 346].map((y) => (
      <line key={y} x1="204" x2="548" y1={y} y2={y} stroke="var(--line)" strokeDasharray="4 6" />
    ))}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const h = 24 + i * 15;
      return <rect key={i} className="rise" x={210 + i * 42} y={390 - h} width="24" height={h} rx="6" fill="var(--accent-soft)" stroke="var(--line)" style={{ animationDelay: `${i * 0.12}s` }} />;
    })}
    <path className="fade" d="M214 372 C270 360 300 340 350 322 S440 280 484 240 S530 214 540 206 L540 392 L214 392 Z" fill="url(#dash-area)" />
    <path className="draw" pathLength="1" d="M214 372 C270 360 300 340 350 322 S440 280 484 240 S530 214 540 206" fill="none" stroke="url(#dash-line)" strokeWidth="5" strokeLinecap="round" />
    <g className="fade">
      <circle className="pulse" cx="540" cy="206" r="9" fill="var(--accent)" />
      <circle cx="540" cy="206" r="7" fill="var(--accent)" stroke="var(--surface)" strokeWidth="3" />
    </g>

    {/* campaigns list */}
    <rect x="588" y="176" width="190" height="234" rx="14" fill="var(--background)" stroke="var(--line)" />
    <rect x="606" y="194" width="70" height="9" rx="4.5" fill="var(--line)" />
    {[0, 1, 2].map((i) => (
      <g key={i} className="fade" style={{ animationDelay: `${i * 0.4}s` }}>
        <rect x="604" y={216 + i * 42} width="158" height="32" rx="9" fill="var(--surface)" stroke="var(--line)" />
        <circle cx="620" cy={232 + i * 42} r="5" fill="var(--accent)" />
        <rect x="634" y={228 + i * 42} width={68 - i * 8} height="8" rx="4" fill="var(--line)" />
      </g>
    ))}
    <g className="float">
      <rect x="604" y="354" width="158" height="38" rx="19" fill="var(--accent)" />
      <text x="683" y="378" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--on-accent)">Publish ads</text>
    </g>
  </svg>
);

const ReadWriteArt = (
  <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x="20" y={20 + i * 24} width="90" height="10" rx="5" fill="var(--line)" />
        <rect className="grow-x" x="20" y={20 + i * 24} width={40 + i * 14} height="10" rx="5" fill="var(--accent)" style={{ animationDelay: `${i * 0.25}s` }} />
      </g>
    ))}
    <path className="flow" d="M125 60 H175" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M168 52 L178 60 L168 68" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const ManageArt = (
  <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden="true">
    <line x1="15" x2="185" y1="100" y2="100" stroke="var(--line)" />
    <path className="draw" pathLength="1" d="M15 95 L55 78 L90 84 L130 50 L185 18" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle className="fade" cx="185" cy="18" r="6" fill="var(--accent-2)" />
    <circle className="pulse" cx="185" cy="18" r="6" fill="var(--accent-2)" />
  </svg>
);

const SafeArt = (
  <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden="true">
    <circle className="pulse" cx="100" cy="60" r="26" fill="var(--accent-2)" />
    <circle className="pulse" cx="100" cy="60" r="26" fill="var(--accent-2)" style={{ animationDelay: "1s" }} />
    <path d="M100 26 L134 38 V62 C134 84 118 98 100 104 C82 98 66 84 66 62 V38 Z" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
    <path className="draw" pathLength="1" d="M85 62 L96 73 L116 50" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CampaignArt = (
  <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="22" y={16 + i * 28} width="156" height="20" rx="8" fill="var(--surface)" stroke="var(--line)" />
        <rect className="grow-x" x="30" y={23 + i * 28} width={60 + i * 20} height="6" rx="3" fill="var(--accent)" style={{ animationDelay: `${i * 0.35}s` }} />
      </g>
    ))}
    <rect x="22" y="100" width="156" height="4" rx="2" fill="var(--line)" />
    <rect className="grow-x" x="22" y="100" width="110" height="4" rx="2" fill="var(--accent-2)" />
    <circle className="fade" cx="132" cy="102" r="7" fill="var(--accent)" stroke="var(--surface)" strokeWidth="3" />
  </svg>
);

const ConnectArt = (
  <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden="true">
    <rect x="14" y="20" width="46" height="34" rx="9" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
    <GoogleMark x={26} y={26} size={22} />
    <rect x="14" y="66" width="46" height="34" rx="9" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
    <MetaMark x={21} y={74} width={32} />
    <path className="flow" d="M62 37 C95 37 90 60 128 60" fill="none" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" />
    <path className="flow" d="M62 83 C95 83 90 60 128 60" fill="none" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" />
    <circle className="pulse" cx="150" cy="60" r="20" fill="var(--accent)" />
    <circle cx="150" cy="60" r="20" fill="var(--accent)" />
    <path d="M141 60 L148 67 L160 53" fill="none" stroke="var(--on-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PublishArt = (
  <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden="true">
    <g className="float">
      <rect x="44" y="14" width="112" height="80" rx="12" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
      <rect x="56" y="26" width="88" height="30" rx="7" fill="var(--accent-soft)" />
      <rect x="56" y="64" width="60" height="7" rx="3.5" fill="var(--line)" />
      <rect x="56" y="77" width="38" height="7" rx="3.5" fill="var(--line)" />
      <path className="draw" pathLength="1" d="M62 48 L82 38 L100 44 L134 30" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g className="fade">
      <circle cx="160" cy="98" r="15" fill="var(--accent)" />
      <path d="M160 106 V91 M153 98 L160 91 L167 98" fill="none" stroke="var(--on-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

const TrustArt = (
  <svg viewBox="0 0 320 120" className="mx-auto h-auto w-full max-w-sm" aria-hidden="true">
    <path className="flow" d="M20 60 H110" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path className="flow" d="M210 60 H300" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle className="pulse" cx="160" cy="60" r="30" fill="var(--accent)" />
    <path d="M160 24 L196 37 V62 C196 85 179 100 160 106 C141 100 124 85 124 62 V37 Z" fill="var(--accent)" />
    <rect x="148" y="58" width="24" height="18" rx="4" fill="var(--on-accent)" />
    <path d="M153 58 V52 a7 7 0 0 1 14 0 V58" fill="none" stroke="var(--on-accent)" strokeWidth="3" />
  </svg>
);

/* ---------- Content ---------- */

const features = [
  { title: "Secure OAuth sign-in", body: "Connect Meta and Google with the official OAuth login. No passwords to share, and you stay in control.", art: SafeArt },
  { title: "One simple dashboard", body: "Every campaign and ad from both platforms in one clean place, so everything feels smooth and easy.", art: ReadWriteArt },
  { title: "Managed to grow", body: "We securely manage your campaigns and read and write your ads to help them grow. Your data is never shared.", art: ManageArt },
];

const steps = [
  { n: "01", title: "Connect with OAuth", body: "Sign in with Meta and Google in a few clicks. Your ad accounts are linked securely, no technical setup.", art: ConnectArt },
  { n: "02", title: "Create your campaign", body: "Pick your goal, audience and budget in our user-friendly dashboard. Guided steps make it effortless.", art: CampaignArt },
  { n: "03", title: "Publish & watch it grow", body: "Publish your ads to Google and Meta in one click, then track growth right from the same dashboard.", art: PublishArt },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero: stays pinned, zooms out and fades away while you scroll, then the rest rises in */}
      <section data-hero suppressHydrationWarning className="relative md:h-[150svh]">
        <div className="isolate overflow-hidden md:sticky md:top-0 md:h-svh">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10rem] h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-glow-1 blur-[120px]" />
          <div className="absolute right-[-8rem] top-40 h-72 w-72 rounded-full bg-glow-2 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--line)_1px,transparent_1px),linear-gradient(to_bottom,var(--line)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>

        <div data-hero-content className="flex min-h-svh flex-col items-center justify-center px-5 pb-10 pt-20 sm:px-6 md:h-full md:min-h-0 md:pb-8 md:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Connect once.
              <br />
              <span className="bg-gradient-to-r from-accent via-accent-2 to-accent-3 bg-clip-text text-transparent">
                Publish ads effortlessly.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Connect your Meta and Google accounts through secure OAuth, then create campaigns and publish ads from one friendly dashboard. We read and write your ads on your behalf and manage campaigns to help them grow, and your data will never be shared with anyone.
            </p>
            <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <a href="#how-it-works" className="w-full rounded-full text-center sm:w-auto bg-accent px-7 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-strong">
                See how it works
              </a>
              <Link href="/privacy-policy" className="w-full rounded-full border border-line text-center sm:w-auto px-7 py-3 text-sm font-semibold text-foreground transition hover:bg-accent-soft">
                Read our privacy policy
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span>Connects with</span>
              <span aria-label="Google Ads" className="flex items-center gap-2 font-medium text-foreground">
                <GoogleIcon /> <span className="hidden sm:inline">Google Ads</span>
              </span>
              <span aria-label="Meta Ads" className="flex items-center gap-2 font-medium text-foreground">
                <MetaIcon /> <span className="hidden sm:inline">Meta Ads</span>
              </span>
            </div>
          </div>

        </div>
        </div>
      </section>

      <div className="relative z-10 md:-mt-[55svh]">
      {/* Dashboard preview */}
      <section className="px-5 pt-6 sm:px-6 md:pt-0">
        <div data-reveal suppressHydrationWarning className="mx-auto w-full max-w-4xl rounded-3xl border border-line bg-surface p-2 shadow-sm sm:p-3">
          {HeroArt}
        </div>
      </section>

      {/* Features */}
      <section className="cv px-5 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} data-reveal suppressHydrationWarning style={{ "--d": `${i * 120}ms` } as React.CSSProperties} className="card group">
              <div className="card-art">{f.art}</div>
              <div className="px-3 pb-3 pt-6">
                <h3 className="text-xl font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="cv px-5 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal suppressHydrationWarning className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">How it works</h2>
            <p className="mt-4 text-muted">From connecting your accounts to live ads, every step is smooth and simple.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.n} data-reveal suppressHydrationWarning style={{ "--d": `${i * 120}ms` } as React.CSSProperties} className="card group">
                <div className="card-art">
                  {s.art}
                </div>
                <div className="relative px-3 pb-3 pt-6">
                  <span className="pointer-events-none absolute right-3 top-3 select-none font-mono text-4xl font-semibold text-accent/25">{s.n}</span>
                  <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="cv px-5 py-14 sm:px-6 sm:py-20">
        <div data-reveal suppressHydrationWarning className="mx-auto max-w-4xl rounded-[2rem] border border-line bg-gradient-to-br from-accent-soft via-surface to-surface p-6 text-center sm:p-16">
          {TrustArt}
          <h2 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">Securely managed. Never shared.</h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
            Your accounts connect through OAuth, and your ad data is used only to run and grow your campaigns. It will never be shared with anyone.
          </p>
          <Link href="/privacy-policy" className="mt-8 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-strong">
            Privacy Policy
          </Link>
        </div>
      </section>
      </div>
    </main>
  );
}
