import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProviderWrapper } from "@/components/providers/ToastProviderWrapper";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has any subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const hasSubscriptions = subscriptions && subscriptions.length > 0;

  // Get current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isOnboardingPage = pathname.startsWith("/onboarding");

  // Redirect logic for onboarding
  if (!hasSubscriptions && !isOnboardingPage) {
    redirect("/onboarding");
  }

  if (hasSubscriptions && isOnboardingPage) {
    redirect("/dashboard");
  }

  return (
    <ToastProviderWrapper>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-background pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </ToastProviderWrapper>
  );
}
