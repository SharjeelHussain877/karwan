import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_EMAIL = "support@dadsmith.com";
const UPDATED = "November 18, 2026";

export const metadata: Metadata = {
  title: "Terms & Conditions | DadSmith",
  description:
    "The terms that apply when you connect your Google and Meta ad accounts and use the DadSmith dashboard to create and publish campaigns.",
};

type Section = { id: string; title: string; body?: string[]; list?: string[]; after?: string[] };

function linkify(text: string) {
  return text.split(/(https?:\/\/[^\s]+?)(?=[.,)]?(?:\s|$))/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4 hover:text-accent-strong">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

const intro = (
  <>
    These Terms &amp; Conditions govern your use of DadSmith, a dashboard that lets you create campaigns and publish ads to Google and Meta smoothly and securely. By creating an account, connecting an ad account or using the service, you agree to these terms and to our Privacy Policy.
  </>
);

const sections: Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    body: ["If you do not agree to these terms, do not use DadSmith. If you use DadSmith on behalf of a company, you confirm you have authority to bind that company."],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    body: ["You must be at least 18 years old and able to form a binding contract. You must own, or be authorised to manage, every Google and Meta account you connect."],
  },
  {
    id: "service",
    title: "3. The service",
    body: ["DadSmith provides a user-friendly dashboard where you can:"],
    list: [
      "connect your Google Ads and Meta accounts using official OAuth sign-in;",
      "create campaigns, ad sets and ads with guided steps;",
      "publish, edit, pause and resume campaigns on Google and Meta;",
      "view performance and let us manage campaigns on your behalf to help them grow.",
    ],
    after: ["Features may change as Google and Meta change their platforms."],
  },
  {
    id: "authorisation",
    title: "4. Connecting your accounts and authorisation",
    body: [
      "When you connect an account, you authorise DadSmith to read and write to it within the permissions you approve on the Google or Meta consent screen. We act only on your instructions and for the purposes described in our Privacy Policy.",
      "You can revoke this authorisation at any time from your Google or Meta account settings, or by disconnecting the account in the dashboard. Keep your login credentials secure and tell us immediately about any unauthorised use.",
    ],
  },
  {
    id: "your-content",
    title: "5. Your campaigns and content",
    body: ["You are solely responsible for the campaigns, ad copy, images, landing pages, targeting, budgets and any other content you create or publish through DadSmith. You confirm that you have the rights to use it and that it:"],
    list: [
      "complies with the Google Ads policies, the Meta Advertising Standards and Meta Platform Terms, and the Google API Services Terms of Service;",
      "complies with applicable laws, including consumer protection, privacy and advertising rules;",
      "is not unlawful, deceptive, infringing, hateful or harmful.",
    ],
    after: ["Google and Meta may review, reject or disable ads at their discretion. We are not responsible for their decisions."],
  },
  {
    id: "ad-spend",
    title: "6. Ad spend and billing",
    body: ["Advertising costs are charged directly by Google and Meta to the payment method on your ad accounts, under their terms. DadSmith does not control or guarantee pricing. You are responsible for setting and monitoring your budgets."],
  },
  {
    id: "acceptable-use",
    title: "7. Acceptable use",
    body: ["You agree not to:"],
    list: [
      "use DadSmith for illegal, misleading or prohibited advertising;",
      "access accounts or data you are not authorised to use;",
      "interfere with, overload or reverse engineer the service, or bypass its security;",
      "resell or provide the service to others without our written permission.",
    ],
  },
  {
    id: "third-party",
    title: "8. Third-party platforms",
    body: ["DadSmith depends on Google and Meta. Their services, APIs, policies and availability are outside our control and may change, which can affect features. Your use of Google and Meta remains subject to their own terms."],
  },
  {
    id: "privacy",
    title: "9. Privacy and your data",
    body: ["Our Privacy Policy explains what data we access and how we protect it. We use your Google and Meta data only to provide the service and never share it with anyone for their own use."],
  },
  {
    id: "ip",
    title: "10. Intellectual property",
    body: ["DadSmith, its software, design and branding belong to us. You keep ownership of your content and data, and grant us a limited licence to process it solely to provide the service to you."],
  },
  {
    id: "no-guarantee",
    title: "11. No guarantee of results",
    body: ["We work to make publishing smooth and to help campaigns grow, but advertising results depend on many factors outside our control. We do not guarantee any specific reach, performance or return."],
  },
  {
    id: "disclaimer",
    title: "12. Disclaimer and limitation of liability",
    body: [
      "DadSmith is provided \"as is\" and \"as available\" without warranties of any kind, to the extent permitted by law.",
      "To the extent permitted by law, DadSmith is not liable for indirect, incidental or consequential losses, including lost profit, ad spend, revenue or data, and our total liability is limited to the amount you paid us in the 12 months before the claim.",
    ],
  },
  {
    id: "indemnity",
    title: "13. Indemnity",
    body: ["You agree to indemnify DadSmith against claims arising from your content, your campaigns or your breach of these terms or of Google or Meta policies."],
  },
  {
    id: "termination",
    title: "14. Termination",
    body: ["You may stop using DadSmith and disconnect your accounts at any time. We may suspend or end access if you breach these terms or if required by Google, Meta or law. On termination, your data is handled as described in our Privacy Policy and on the Data Deletion page."],
  },
  {
    id: "law",
    title: "15. Governing law",
    body: ["These terms are governed by the laws of [your jurisdiction], and disputes will be handled by the courts of [your jurisdiction]."],
  },
  {
    id: "changes",
    title: "16. Changes to these terms",
    body: ["We may update these terms. We will post the new version here with a new date and notify you of material changes. Continuing to use DadSmith after changes means you accept them."],
  },
  {
    id: "contact",
    title: "17. Contact",
    body: ["Questions about these terms: " + CONTACT_EMAIL],
  },
];

export default function Page() {
  return (
    <main className="relative flex-1 px-6 pb-24 pt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(ellipse_at_top,var(--glow-1),transparent_70%)]" />

      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← Back to home
        </Link>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Terms &amp; Conditions</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {UPDATED}</p>
        <p className="mt-6 leading-relaxed text-muted">{intro}</p>

        <nav aria-label="Contents" className="mt-8 sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:p-6">
          <p className="text-sm font-semibold">Contents</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-muted sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="transition hover:text-accent">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-6">
          {sections.map((s) => (
            <section key={s.id} id={s.id} data-reveal suppressHydrationWarning className="scroll-mt-24 border-t border-line pt-6 sm:rounded-2xl sm:border sm:bg-surface sm:p-8">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted">
                {s.body?.map((p) => <p key={p}>{linkify(p)}</p>)}
                {s.list && (
                  <ul className="list-disc space-y-2 pl-5">
                    {s.list.map((li) => <li key={li}>{linkify(li)}</li>)}
                  </ul>
                )}
                {s.after?.map((p) => <p key={p}>{linkify(p)}</p>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
