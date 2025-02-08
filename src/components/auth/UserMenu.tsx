
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "@supabase/supabase-js";

export const UserMenu = () => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "Successfully signed out",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-sidebar-foreground/70">
        Signed in as: {user.email}
      </p>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </div>
  );
};
