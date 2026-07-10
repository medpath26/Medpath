"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (value === "/dashboard") {
    return "/";
  }

  return value;
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Confirming your MedPath account...");

  useEffect(() => {
    async function finishAuth() {
      if (!supabase) {
        setMessage("Supabase is not configured. Please check your environment variables.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error_description") || params.get("error");
      const next = safeNextPath(params.get("next"));

      if (error) {
        setMessage(error);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setMessage(exchangeError.message);
          return;
        }
      } else {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          setMessage("Your confirmation link is missing an authentication code. Please request a new link.");
          return;
        }
      }

      window.location.replace(next);
    }

    finishAuth();
  }, []);

  return (
    <main className="app auth-callback-page">
      <section className="auth-modal">
        <p className="eyebrow">MedPath</p>
        <h1>Account Confirmation</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
