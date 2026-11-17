import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | DadSmith",
  description:
    "How DadSmith accesses, uses and protects your Google and Meta ads account data.",
};

const sections = [
  {
    title: "1. Information we access",
    body: [
      "When you connect your accounts, we access your Google Ads and Meta Ads accounts. This includes campaign, ad set, ad, audience, budget and performance data, as well as basic account details needed to identify the account.",
    ],
  },
  {
    title: "2. How we use your access",
    body: [
      "We read and write to your ad accounts in order to help publish ads and securely manage your ad campaigns so they can grow.",
      "We use your data only to provide this service to you. We do not use it for any other purpose.",
    ],
  },
  {
    title: "3. We never share your data",
    body: [
      "Your data will never be shared with anyone. We do not sell, rent or trade your information, and we do not disclose it to third parties for their own use.",
    ],
  },
  {
    title: "4. Data security",
    body: [
      "We take reasonable technical and organisational measures to protect your data and account access from unauthorised access, loss or misuse.",
    ],
  },
  {
    title: "5. Data retention & deletion",
    body: [
      "We keep your data only as long as needed to provide the service. You can disconnect your Google and Meta accounts at any time, and you may ask us to delete the data we hold about you.",
    ],
  },
  {
    title: "6. Revoking access",
    body: [
      "You can revoke our access at any time from your Google account permissions page or your Meta business settings. Once revoked, we can no longer read or modify your ad accounts.",
    ],
  },
  {
    title: "7. Changes to this policy",
    body: [
      "We may update this policy from time to time. Changes will be posted on this page.",
    ],
  },
  {
    title: "8. Contact",
    body: [
      "If you have any questions about this policy or your data, please contact us.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="relative flex-1 px-6 pb-24 pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,var(--glow-1),transparent_70%)]" />

        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Back to home
          </Link>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted">
            We take your Google and Meta ads account access to read and write
            your ads and help publish ads. We securely manage ad campaigns to
            help them grow, and your data will never be shared with anyone.
          </p>

          <div className="mt-12 space-y-6">
            {sections.map((s) => (
              <section
                key={s.title}
                data-reveal suppressHydrationWarning
                className="rounded-2xl border border-line bg-surface p-6 sm:p-8"
              >
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-muted">
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
