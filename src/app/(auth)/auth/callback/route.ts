import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const supabase = await createClient();
  let authError = null;

  // Handle PKCE code exchange (OAuth, magic link with PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  }
  // Handle email confirmation token (signup verification)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    authError = error;
  }

  if (!authError) {
    // If next is specified, use it
    if (next) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Otherwise, check if user has completed onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: tasteProfile } = await supabase
        .from("taste_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Redirect to calendar if onboarding complete, otherwise onboarding
      const redirectTo = tasteProfile ? "/calendar" : "/onboarding";
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Return to login page on error
  console.error("Auth callback error:", authError);
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
