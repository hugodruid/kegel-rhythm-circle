
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { UserMenu } from "@/components/auth/UserMenu";
import { BarChart3, Home, Menu, Settings } from "lucide-react";
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
    ...(user ? [
      {
        title: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
      {
        title: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ] : []),
  ];

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative flex min-h-screen w-full bg-background">
        <Sidebar className="fixed left-0 top-0 h-full z-50 border-r bg-white shadow-lg">
          <SidebarHeader className="flex justify-between items-center px-4 py-2 bg-white border-b">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
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
                    <Link to={item.path} className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:text-gray-900">
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
          <SidebarFooter className="px-4 py-2 border-t">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Kegel Trainer
            </p>
          </SidebarFooter>
        </Sidebar>

        {/* Menu trigger button in top-left corner */}
        <div className="fixed top-4 left-4 z-40">
          <SidebarTrigger className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-50">
            <Menu className="h-5 w-5 text-gray-600" />
          </SidebarTrigger>
        </div>

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
