import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | AstraDaily",
  description: "Privacy policy for the AstraDaily mobile application.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40 backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Privacy Policy for AstraDaily
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Last updated:{" "}
          <span className="font-medium text-slate-300">March 16, 2026</span>
        </p>

        <p className="mt-4 text-sm text-slate-300">
          AstraDaily (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a
          horoscope application that provides daily astrological insights. This
          page explains how we collect, use, and protect your information when
          you use the AstraDaily mobile app.
        </p>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            1. Information We Collect
          </h2>
          <p className="text-slate-300">
            We only collect the minimum information needed to operate the
            AstraDaily app and provide horoscopes. This may include:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              <span className="font-medium">Account information</span>: email
              address or profile data from your sign-in provider (for example,
              Google or Clerk), so you can sign in securely and sync your
              profile.
            </li>
            <li>
              <span className="font-medium">Usage data</span>: your selected
              zodiac sign, app screens you open, and basic interactions used to
              keep the app working correctly and improve the experience.
            </li>
            <li>
              <span className="font-medium">Device information</span>: device
              model, operating system version, and anonymous identifiers used
              for security, diagnostics, and error reporting.
            </li>
          </ul>
          <p className="text-slate-300">
            We do not intentionally collect sensitive categories of information
            such as financial details, government IDs, or precise GPS location
            through the AstraDaily app.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>To provide daily horoscopes and related app features.</li>
            <li>To personalize content based on your zodiac sign.</li>
            <li>To maintain security, prevent abuse, and debug issues.</li>
            <li>To analyze usage and improve app performance and reliability.</li>
          </ul>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            3. Data Sharing
          </h2>
          <p className="text-slate-300">
            We do not sell your personal data and we do not share it with third
            parties for their own marketing purposes. We may share limited
            information with:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>
              Service providers that help us operate the app (for example,
              hosting, analytics, authentication, and database providers) under
              agreements that require them to protect your data.
            </li>
            <li>
              Authorities if required by law or to protect our rights or the
              rights and safety of others.
            </li>
          </ul>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            4. Data Storage and Security
          </h2>
          <p className="text-slate-300">
            Your data is stored using secure third-party services such as cloud
            hosting, databases, and authentication providers. We use reasonable
            technical and organizational measures to protect your information,
            but no method of transmission or storage is completely secure.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            5. Your Choices
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-slate-300">
            <li>You can stop using the AstraDaily app at any time.</li>
            <li>
              You may request deletion of your account-related data by
              contacting us using the email address below.
            </li>
          </ul>
          <p className="text-slate-300">
            If you uninstall the app, data already stored on our servers may
            remain in backups and logs for a limited period.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            6. Children&apos;s Privacy
          </h2>
          <p className="text-slate-300">
            AstraDaily is not directed to children under 13. If you believe we
            have collected personal information from a child, please contact us
            and we will delete it.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            7. International Data Transfers
          </h2>
          <p className="text-slate-300">
            Your information may be processed and stored on servers located in
            countries other than your own. By using the app, you consent to
            this processing.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">
            8. Changes to This Policy
          </h2>
          <p className="text-slate-300">
            We may update this Privacy Policy from time to time. When we do, we
            will update the &quot;Last updated&quot; date at the top of this
            page. Continued use of the AstraDaily app after changes means you
            accept the updated policy.
          </p>
        </section>

        <section className="mt-6 space-y-3 text-sm leading-relaxed text-slate-200">
          <h2 className="text-base font-semibold text-white">9. Contact Us</h2>
          <p className="text-slate-300">
            If you have any questions about this Privacy Policy or how we
            handle your data, you can contact us at:
          </p>
          <p className="mt-1 text-sm font-medium text-slate-100">
            dipennapit45@gmail.com
          </p>
        </section>
      </div>
    </main>
  );
}

