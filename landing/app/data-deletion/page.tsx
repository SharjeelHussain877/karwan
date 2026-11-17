import type { Metadata } from "next";
import Link from "next/link";

const CONTACT_EMAIL = "support@dadsmith.com";
const UPDATED = "November 18, 2026";

export const metadata: Metadata = {
  title: "Data Deletion | DadSmith",
  description:
    "How to disconnect your Google and Meta accounts and request deletion of your data from DadSmith.",
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
    You are in control of your data. Use any of the options below to disconnect your Google and Meta accounts and have the data DadSmith holds about you deleted.
  </>
);

const sections: Section[] = [
  {
    id: "disconnect",
    title: "1. Disconnect inside DadSmith",
    list: [
      "Sign in to the DadSmith dashboard.",
      "Open Settings, then Connected accounts.",
      "Choose Disconnect next to Google Ads or Meta.",
    ],
    after: ["We delete the OAuth tokens for that account immediately and delete the related Google or Meta data within 30 days."],
  },
  {
    id: "revoke-google",
    title: "2. Remove access from Google",
    list: [
      "Open https://myaccount.google.com/permissions",
      "Select DadSmith.",
      "Choose Remove access.",
    ],
  },
  {
    id: "revoke-meta",
    title: "3. Remove access from Meta",
    list: [
      "Open https://www.facebook.com/settings?tab=business_integrations",
      "Find DadSmith and choose Remove.",
      "Confirm the removal.",
    ],
    after: ["Removing the app from Meta triggers a deletion request to us, and we delete the related data within 30 days."],
  },
  {
    id: "request",
    title: "4. Ask us to delete everything",
    body: ["To delete your DadSmith account and all data we hold about you, email " + CONTACT_EMAIL + " from your account email address with the subject \"Delete my data\". We confirm by email and complete deletion within 30 days. Limited records we are legally required to keep are retained only as long as the law requires."],
  },
  {
    id: "what-is-deleted",
    title: "5. What gets deleted",
    list: [
      "OAuth access and refresh tokens.",
      "Google Ads and Meta data we stored, such as campaign, ad and performance data.",
      "Campaign drafts and content you created in DadSmith.",
      "Your profile details and account.",
    ],
    after: ["Ads already published on Google or Meta stay in your ad accounts. Manage or remove them there. See our Privacy Policy for more detail."],
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

        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Data Deletion</h1>
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
