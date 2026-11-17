import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_EMAIL = "support@dadsmith.com";
const UPDATED = "November 18, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | DadSmith",
  description:
    "How DadSmith accesses, uses, stores and protects data from your Google Ads and Meta accounts, and how to delete it.",
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
    DadSmith gives you a user-friendly dashboard to create campaigns and publish ads to Google and Meta smoothly and securely. To do that, you connect your accounts using the official Google and Meta OAuth sign-in. This policy explains exactly what data we access, why, how we protect it, and how you can delete it. In short: we use your data only to provide the service to you, and we never sell it or share it with anyone for their own purposes.
  </>
);

const sections: Section[] = [
  {
    id: "who-we-are",
    title: "1. Who we are",
    body: [
      "DadSmith (\"DadSmith\", \"we\", \"us\") is a campaign management and ad publishing dashboard for Google Ads and Meta Ads. This policy applies to our website, our dashboard and any data we receive from Google and Meta on your behalf.",
      "Contact: " + CONTACT_EMAIL,
    ],
  },
  {
    id: "data-we-access",
    title: "2. Data we access",
    body: ["When you connect an account through OAuth, we only request the permissions needed to run the features you use. Depending on what you connect, this can include:"],
    list: [
      "Basic profile details from your Google or Meta login: name, email address and account ID, used to identify you and secure your DadSmith account.",
      "Google Ads data (via the Google Ads API): the ad accounts you can access, and their campaigns, ad groups, ads, keywords, budgets, bidding settings and performance metrics.",
      "Meta data (via the Meta Marketing API): the ad accounts and business assets you can access, and their campaigns, ad sets, ads, creatives, audiences, and performance insights, plus the Pages you choose to run ads from.",
      "OAuth access and refresh tokens that let us act for you until you disconnect. Tokens are stored encrypted.",
      "Content you create in DadSmith, such as campaign drafts, ad copy, images and targeting choices.",
      "Basic technical data such as IP address, browser type and logs, used for security, fraud prevention and reliability.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How we use your data",
    body: ["We use the data above only to provide and improve the features you asked for:"],
    list: [
      "Read your ad accounts so the dashboard can show your campaigns and performance.",
      "Write to your ad accounts to create campaigns and publish, edit, pause or resume ads when you ask us to.",
      "Manage campaigns on your behalf to help them grow, within the permissions you granted.",
      "Keep your account secure, prevent abuse, fix bugs and provide support.",
      "Comply with legal obligations.",
    ],
    after: ["We do not use your Google or Meta data for advertising to you or anyone else, we do not sell it, and we do not use it to build profiles or train generalized AI or machine-learning models."],
  },
  {
    id: "google-limited-use",
    title: "4. Google user data and Limited Use",
    body: [
      "DadSmith's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy (https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.",
      "In particular: we use Google user data only to provide and improve the user-facing features described above; we do not transfer it to others except as needed to provide those features, to comply with law, or as part of a merger or acquisition with your notice; we do not use it for serving ads; and no humans read it unless you give us permission for specific data, it is necessary for security or abuse investigation, or the law requires it.",
    ],
  },
  {
    id: "meta-platform",
    title: "5. Meta platform data",
    body: [
      "Data we receive from Meta is used only to provide the ad creation, publishing and reporting features you request, in line with the Meta Platform Terms and Developer Policies. We do not sell Meta data, use it for anything unrelated to the service, or share it with data brokers or advertising networks.",
    ],
  },
  {
    id: "sharing",
    title: "6. Sharing your data",
    body: ["We do not sell, rent or trade your data, and we do not share it with anyone for their own use. The only situations where data moves beyond DadSmith are:"],
    list: [
      "To Google and Meta themselves, when you tell us to publish or change a campaign. This is the purpose of the service.",
      "To infrastructure providers (for example hosting and database services) that process data only on our behalf, under confidentiality and security obligations, and may not use it for any other purpose.",
      "If required by law, court order or to protect rights and safety, in which case we share the minimum necessary.",
    ],
  },
  {
    id: "security",
    title: "7. How we protect your data",
    list: [
      "All data is transmitted over encrypted connections (TLS).",
      "OAuth tokens and other sensitive data are encrypted at rest.",
      "Access to production systems is restricted to authorised personnel who need it, and is logged.",
      "We request the minimum permissions required and never ask for your Google or Meta password.",
    ],
    after: ["No system is perfectly secure. If a breach affecting your data occurs, we will notify affected users and the relevant platforms as required by law."],
  },
  {
    id: "retention",
    title: "8. Retention and deletion",
    list: [
      "We keep Google and Meta data only while your account is connected and for as long as needed to provide the service.",
      "When you disconnect an account, we delete its OAuth tokens immediately and delete the associated Google and Meta data within 30 days.",
      "When you delete your DadSmith account, we delete all data we hold about you within 30 days, except limited records we must keep by law.",
    ],
    after: ["You can request deletion at any time. See our Data Deletion page at /data-deletion for step-by-step instructions."],
  },
  {
    id: "revoking",
    title: "9. Revoking access",
    body: ["You can withdraw our access at any time, without contacting us:"],
    list: [
      "Google: open https://myaccount.google.com/permissions, select DadSmith and choose Remove access.",
      "Meta: open https://www.facebook.com/settings?tab=business_integrations, select DadSmith and choose Remove.",
      "Or disconnect the account inside the DadSmith dashboard.",
    ],
    after: ["Once access is revoked, we can no longer read or change your ad accounts."],
  },
  {
    id: "your-rights",
    title: "10. Your rights",
    body: ["Depending on where you live, you may have the right to access, correct, export or delete your personal data, to object to or restrict certain processing, and to withdraw consent. To exercise these rights, email " + CONTACT_EMAIL + ". We respond within 30 days."],
  },
  {
    id: "children",
    title: "11. Children",
    body: ["DadSmith is for businesses and is not directed to anyone under 18. We do not knowingly collect data from children."],
  },
  {
    id: "changes",
    title: "12. Changes to this policy",
    body: ["We may update this policy. We will post the new version here with a new date and, for material changes, notify you in the dashboard or by email."],
  },
  {
    id: "contact",
    title: "13. Contact us",
    body: ["Questions or requests about privacy or your data: " + CONTACT_EMAIL],
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

        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {UPDATED}</p>
        <p className="mt-6 leading-relaxed text-muted">{intro}</p>

        <nav aria-label="Contents" className="mt-8 rounded-2xl border border-line bg-surface p-6">
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
            <section key={s.id} id={s.id} data-reveal suppressHydrationWarning className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6 sm:p-8">
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
