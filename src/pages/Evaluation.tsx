
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Gauge, Activity, Clock } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Evaluation = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [personalBest, setPersonalBest] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [evaluations, setEvaluations] = useState<{id: string, hold_duration_seconds: number, created_at: string}[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        navigate('/');
        return;
      }
      
      fetchEvaluations();
    };

    checkUser();
  }, [navigate]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive]);

  // Fetch previous evaluations
  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pelvic_evaluations')
        .select('id, hold_duration_seconds, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvaluations(data || []);
      
      // Calculate statistics
      if (data && data.length > 0) {
        // Find personal best
        const best = Math.max(...data.map(eval => eval.hold_duration_seconds));
        setPersonalBest(best);
        
        // Calculate average
        const sum = data.reduce((acc, eval) => acc + eval.hold_duration_seconds, 0);
        const avg = Math.round(sum / data.length);
        setAverageTime(avg);
      }
    } catch (error: any) {
      console.error('Error fetching evaluations:', error);
      toast({
        title: "Error fetching evaluations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start the evaluation timer
  const handleStart = () => {
    setTime(0);
    setIsActive(true);
  };

  // End the evaluation and save result
  const handleRelease = async () => {
    if (!isActive) return;
    
    setIsActive(false);
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your evaluation results.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('pelvic_evaluations')
        .insert({
          user_id: user.id,
          hold_duration_seconds: time,
          notes: notes.trim() || null
        });
        
      if (error) throw error;
      
      toast({
        title: "Evaluation saved!",
        description: `You held for ${formatTime(time)}. Great job!`,
      });
      
      // Update personal best if needed
      if (time > personalBest) {
        setPersonalBest(time);
        
        // Show special toast for new personal best
        toast({
          title: "🎉 New Personal Best!",
          description: `You've set a new record of ${formatTime(time)}!`,
        });
      }
      
      // Refresh evaluations list
      fetchEvaluations();
      
      // Clear notes
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Error saving evaluation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get motivational message based on performance
  const getMotivationalMessage = () => {
    if (time === 0) return "Ready to test your pelvic floor strength!";
    
    if (personalBest === 0) return "Great first attempt! Keep practicing.";
    
    if (time >= personalBest) return "Amazing! You're at your best today!";
    
    const percentage = (time / personalBest) * 100;
    
    if (percentage >= 90) return "Excellent! Nearly your personal best!";
    if (percentage >= 75) return "Great effort! Keep pushing!";
    if (percentage >= 50) return "Good work! You're on the right track.";
    
    return "Keep practicing! Every session makes you stronger.";
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Pelvic Floor Evaluation</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> 
                Pelvic Floor Strength Test
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-gray-600 mb-6">
                Inhale deeply, then squeeze your pelvic floor as strongly as possible.
                Hold for as long as you can and press the "Release" button when you can no longer maintain the contraction.
              </p>

              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl font-bold text-primary mb-4">
                  {formatTime(time)}
                </div>
                
                <div className="w-full max-w-md mb-8">
                  <Progress value={isActive ? ((time % 60) / 60) * 100 : 0} className="h-3" />
                </div>

                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    onClick={handleStart} 
                    disabled={isActive}
                    className="shadow-md"
                  >
                    Start
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={handleRelease} 
                    disabled={!isActive}
                    variant="destructive"
                    className="shadow-md"
                  >
                    Release
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-primary font-medium">
                  {getMotivationalMessage()}
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="w-full">
                <Label htmlFor="notes" className="mb-2 block">Add notes about this evaluation (optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="How did it feel? Was it harder or easier than usual?" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isActive}
                  className="resize-none"
                />
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-lg mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" /> 
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Personal Best
                    </span>
                    <span className="text-lg font-semibold text-primary">
                      {personalBest > 0 ? formatTime(personalBest) : "No data yet"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Hold Time</span>
                    <span className="text-lg font-semibold text-primary">
                      {averageTime > 0 ? formatTime(averageTime) : "No data yet"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tests Completed</span>
                    <span className="text-lg font-semibold text-primary">
                      {evaluations.length}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle>Recent Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : evaluations.length > 0 ? (
                <div className="space-y-2">
                  {evaluations.slice(0, 5).map((eval) => (
                    <div key={eval.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm text-gray-600">
                        {new Date(eval.created_at).toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        {formatTime(eval.hold_duration_seconds)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-2">
                  Complete your first evaluation to see your results here.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
