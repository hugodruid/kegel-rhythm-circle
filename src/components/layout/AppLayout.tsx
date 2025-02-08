
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { UserMenu } from "@/components/auth/UserMenu";
import type { User } from "@supabase/supabase-js";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative min-h-screen">
        <Sidebar side="left" className="pt-16">
          <SidebarHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Menu</h2>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            {!user ? <AuthForm /> : <UserMenu />}
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-sidebar-foreground/50 text-center">
              © 2024 Kegel Trainer
            </p>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
