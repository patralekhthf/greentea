"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to POST /api/newsletter/subscribe
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <span className="text-2xl block mb-2">✅</span>
        <p className="text-brand-green font-semibold">You&apos;re subscribed!</p>
        <p className="text-sm text-brand-muted mt-1">We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
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
        className="px-6 py-3 bg-brand-green text-white text-sm font-semibold rounded-full hover:bg-brand-mid transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
