import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | DadSmith",
  description:
    "The terms that apply when you connect your Google and Meta ads accounts and use the DadSmith dashboard.",
};

const sections = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using DadSmith, you agree to these Terms & Conditions. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "2. The service",
    body: [
      "DadSmith provides a dashboard where you connect your Google Ads and Meta Ads accounts through OAuth, create campaigns and publish ads. With your permission, we read and write to your ad accounts and securely manage your campaigns on your behalf to help them grow.",
    ],
  },
  {
    title: "3. Connecting your accounts",
    body: [
      "You must own, or be authorised to manage, every ad account you connect. Access is granted through the official OAuth flows of Google and Meta, and you can revoke it at any time from your Google or Meta account settings.",
    ],
  },
  {
    title: "4. Your responsibilities",
    body: [
      "You are responsible for the content of your ads, your budgets and your campaign settings, and for complying with the advertising policies of Google, Meta and any applicable laws.",
      "Ad spend is charged by Google and Meta to your ad accounts under their own terms.",
    ],
  },
  {
    title: "5. Acceptable use",
    body: [
      "You agree not to use the service for unlawful, misleading or harmful advertising, to interfere with the service, or to attempt to access accounts you are not authorised to use.",
    ],
  },
  {
    title: "6. Data & privacy",
    body: [
      "Your data is used only to provide the service and will never be shared with anyone. See our Privacy Policy for details.",
    ],
  },
  {
    title: "7. No guarantee of results",
    body: [
      "We work to help your campaigns grow, but advertising results depend on many factors outside our control. We do not guarantee any specific performance, reach or return.",
    ],
  },
  {
    title: "8. Availability & changes",
    body: [
      "We may update, suspend or discontinue parts of the service at any time. The service also depends on third-party platforms (Google and Meta), whose changes may affect its features.",
    ],
  },
  {
    title: "9. Limitation of liability",
    body: [
      "To the extent permitted by law, DadSmith is provided \"as is\" and is not liable for indirect or consequential losses, including lost profit, ad spend or data, arising from your use of the service.",
    ],
  },
  {
    title: "10. Termination",
    body: [
      "You may stop using the service and disconnect your accounts at any time. We may suspend access if these terms are breached.",
    ],
  },
  {
    title: "11. Changes to these terms",
    body: [
      "We may update these terms from time to time. Continued use of the service after changes means you accept the updated terms.",
    ],
  },
  {
    title: "12. Contact",
    body: ["If you have questions about these terms, please contact us."],
  },
];

export default function TermsAndConditions() {
  return (
    <main className="relative flex-1 px-6 pb-24 pt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,var(--glow-1),transparent_70%)]" />

      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-muted">
          Please read these terms carefully before connecting your Google and Meta ads accounts.
        </p>

        <div className="mt-12 space-y-6">
          {sections.map((s) => (
            <section key={s.title} data-reveal suppressHydrationWarning className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
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
  );
}
