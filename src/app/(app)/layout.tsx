import { Sidebar } from "@/components/layout/sidebar";
import { ToastProviderWrapper } from "@/components/providers/ToastProviderWrapper";

// Auth protection is handled by middleware - no need to check here
// This prevents race conditions after auth callback redirects
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProviderWrapper>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-background pt-14 md:pt-0 md:pr-16">
          {children}
        </main>
      </div>
    </ToastProviderWrapper>
  );
}
