import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { createClient, createAdminClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dropshipping Milionário",
  description: "Transforme seu CNPJ/CPF em uma loja virtual lucrativa sem precisar de estoque.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = null;
  
  if (user) {
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
  }

  const userData = user
    ? {
        email: user.email ?? "",
        role: role ?? "reseller",
      }
    : null;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSidebar user={userData} />
          <div className="flex flex-col w-full h-screen overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-auto bg-muted/10">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
