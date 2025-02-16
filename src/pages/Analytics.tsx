
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { CalendarHeatmap } from "@/components/analytics/CalendarHeatmap";
import { ExerciseBarChart } from "@/components/analytics/ExerciseBarChart";
import { processSessionData } from "@/utils/analyticsUtils";
import type { SessionData } from "@/utils/analyticsUtils";

const Analytics = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
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

      const typedSessions = (data || []).map(session => ({
        id: session.id,
        started_at: session.started_at,
        duration_seconds: session.duration_seconds,
        mode: session.mode as 'normal' | 'fast' | 'very-fast'
      }));

      setSessions(typedSessions);
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

  const processedData = processSessionData(sessions);

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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseBarChart data={processedData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exercise Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap data={processedData} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
