"use client";

import { useState } from "react";

type Props = {
  /** Where the sign-up came from, stored on the subscriber (e.g. "homepage", "teas-waitlist"). */
  source?: string;
  buttonLabel?: string;
  successTitle?: string;
  successText?: string;
};

export default function NewsletterForm({
  source = "homepage",
  buttonLabel = "Subscribe",
  successTitle = "You're subscribed!",
  successText = "We'll be in touch soon.",
}: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not subscribe right now. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <span className="text-2xl block mb-2">✅</span>
        <p className="text-brand-green font-semibold">{successTitle}</p>
        <p className="text-sm text-brand-muted mt-1">{successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 px-4 py-3 rounded-full border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-sage"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-brand-green text-white text-sm font-semibold rounded-full hover:bg-brand-mid transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {submitting ? "Saving…" : buttonLabel}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
    </form>
  );
}
