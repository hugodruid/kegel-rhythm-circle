
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UsernameForm } from "@/components/settings/UsernameForm";
import { EmailForm } from "@/components/settings/EmailForm";
import { PasswordForm } from "@/components/settings/PasswordForm";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Load initial user data
  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        
        // Fetch profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;

        // If no profile exists, create one
        if (!profile) {
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, username: user.email?.split('@')[0] || 'user' }]);
          
          if (createError) throw createError;
          
          setUsername(user.email?.split('@')[0] || 'user');
        } else {
          setUsername(profile.username || "");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Load user data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  // If authentication status is still being checked, show nothing
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated, redirect to root
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      
      <div className="space-y-6">
        <UsernameForm initialUsername={username} />
        <EmailForm initialEmail={email} />
        <PasswordForm />
      </div>
    </div>
  );
}
