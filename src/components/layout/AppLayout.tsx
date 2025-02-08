
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
      <div className="relative flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="flex justify-between items-center px-4 py-2">
            <h2 className="text-lg font-semibold">Menu</h2>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent className="px-4">
            {!user ? <AuthForm /> : <UserMenu />}
          </SidebarContent>
          <SidebarFooter className="px-4 py-2">
            <p className="text-xs text-muted-foreground text-center">
              © 2024 Kegel Trainer
            </p>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
