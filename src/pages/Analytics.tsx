
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface ExerciseSession {
  id: string;
  started_at: string;
  duration_seconds: number;
  mode: 'normal' | 'fast' | 'very-fast';
}

const Analytics = () => {
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);
      fetchSessions();
    };

    checkUser();
  }, [navigate]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_sessions')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching sessions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Exercise History</h1>
      
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No exercise sessions recorded yet. Start training to see your progress!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(session.started_at).toLocaleDateString()} at{' '}
                  {new Date(session.started_at).toLocaleTimeString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                  </p>
                  <p className="text-gray-600">
                    Mode: {session.mode.replace('-', ' ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Analytics;
