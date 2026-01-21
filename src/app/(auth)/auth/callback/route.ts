import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
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
  }

  // Return to login page on error
  return NextResponse.redirect(`${origin}/login`);
}
