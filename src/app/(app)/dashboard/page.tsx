import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back, {user?.email}
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">
          Your subscriptions will appear here after completing onboarding.
        </p>
      </div>
    </div>
  );
}
