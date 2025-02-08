
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { UserMenu } from "@/components/auth/UserMenu";
import { Home, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const menuItems = [
    {
      title: "Home",
      path: "/",
      icon: Home,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative flex min-h-screen w-full bg-background">
        <Sidebar className="border-r bg-sidebar">
          <SidebarHeader className="flex justify-between items-center px-4 py-2 bg-sidebar-accent">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Menu</h2>
            <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground" />
          </SidebarHeader>
          <SidebarContent className="px-4 py-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="w-full"
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="mt-4">
              {!user ? <AuthForm /> : <UserMenu />}
            </div>
          </SidebarContent>
          <SidebarFooter className="px-4 py-2 border-t border-sidebar-border">
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
