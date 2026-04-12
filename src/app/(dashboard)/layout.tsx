import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let role = null;
  
  const adminSupabase = createAdminClient();
  
  if (adminSupabase) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role || user.user_metadata?.role;
  } else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    role = profile?.role || user.user_metadata?.role;
  }

  const userData = {
    email: user.email ?? "",
    role: role ?? "reseller",
  };

  return (
    <SidebarProvider>
      <AppSidebar user={userData} />
      <div className="flex flex-col w-full h-screen overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-muted/10">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}