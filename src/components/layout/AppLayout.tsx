import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { UserMenu } from "@/components/auth/UserMenu";
import { BarChart3, CalendarDays, FileText, Home, Menu, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarProvider, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
interface AppLayoutProps {
  children: React.ReactNode;
}
export const AppLayout = ({
  children
}: AppLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const isMobile = useIsMobile();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const menuItems = [{
    title: "Home",
    path: "/",
    icon: Home
  }, ...(user ? [{
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3
  }, {
    title: "Calendar",
    path: "/calendar",
    icon: CalendarDays
  }, {
    title: "Settings",
    path: "/settings",
    icon: Settings
  }] : [])];
  return <SidebarProvider defaultOpen={false}>
      <div className="relative flex min-h-screen w-full bg-background">
        <Sidebar className="fixed left-0 top-0 h-full z-50 border-r shadow-lg">
          <SidebarHeader className="flex justify-between items-center px-4 py-3 bg-primary/5 border-b">
            <h2 className="text-lg font-semibold text-primary">Menu</h2>
            <SidebarTrigger className="text-primary hover:text-primary/80" />
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-3 bg-white/95 backdrop-blur-sm">
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path} className="w-full transition-colors">
                    <Link to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        ${location.pathname === item.path ? 'bg-primary text-white hover:bg-primary/90' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <item.icon className={`h-4 w-4 ${location.pathname === item.path ? 'text-white' : 'text-gray-500'}`} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
            
            <div className="mt-6 space-y-4">
              {!user ? <AuthForm /> : <UserMenu />}
            </div>
          </SidebarContent>
          
          <SidebarFooter className="px-4 py-3 bg-white/95 backdrop-blur-sm border-t">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xs text-gray-600">© 2025 Pelvic Floor Trainer</p>
              <div className="flex items-center gap-3">
                <Link to="/privacy-policy" className="text-xs text-gray-600 hover:text-primary flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Privacy
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/terms-of-service" className="text-xs text-gray-600 hover:text-primary flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Terms
                </Link>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Menu trigger button in top-left corner */}
        <div className="fixed top-4 left-4 z-40">
          <SidebarTrigger className={`p-2.5 rounded-lg ${isMobile ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-600 shadow-md hover:bg-gray-50'}`}>
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </div>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>;
};