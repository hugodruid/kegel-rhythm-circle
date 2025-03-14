import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Gauge, Activity, Clock, MessageSquare, Save, Edit } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Evaluation = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [personalBest, setPersonalBest] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [evaluations, setEvaluations] = useState<{
    id: string;
    hold_duration_seconds: number;
    created_at: string;
    notes: string | null;
  }[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
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
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Fetch previous evaluations
  const fetchEvaluations = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching evaluations...");
      const {
        data,
        error
      } = await supabase
        .from('pelvic_evaluations')
        .select('id, hold_duration_seconds, created_at, notes')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching evaluations:", error);
        throw error;
      }
      
      console.log("Fetched evaluations:", data);
      setEvaluations(data || []);

      // Calculate statistics
      if (data && data.length > 0) {
        // Find personal best
        const best = Math.max(...data.map(evaluation => evaluation.hold_duration_seconds));
        setPersonalBest(best);

        // Calculate average
        const sum = data.reduce((acc, evaluation) => acc + evaluation.hold_duration_seconds, 0);
        const avg = Math.round(sum / data.length);
        setAverageTime(avg);
      }
    } catch (error: any) {
      console.error('Error fetching evaluations:', error);
      toast({
        title: "Error fetching evaluations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start the evaluation timer
  const handleStart = () => {
    setTime(0);
    setIsActive(true);
    setNotes("");
    setSelectedEvaluationId(null);
    setIsEditingNotes(false);
  };

  // End the evaluation and save result
  const handleRelease = async () => {
    if (!isActive) return;
    setIsActive(false);
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your evaluation results.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase
        .from('pelvic_evaluations')
        .insert({
          user_id: user.id,
          hold_duration_seconds: time,
          notes: null // Initially save without notes
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Evaluation saved!",
        description: `You held for ${formatTime(time)}. Great job!`
      });

      // Update personal best if needed
      if (time > personalBest) {
        setPersonalBest(time);

        // Show special toast for new personal best
        toast({
          title: "🎉 New Personal Best!",
          description: `You've set a new record of ${formatTime(time)}!`
        });
      }

      // Refresh evaluations list
      await fetchEvaluations();
      
      // Set the newly created evaluation as selected
      if (data && data.length > 0) {
        setSelectedEvaluationId(data[0].id);
        setIsEditingNotes(true);
      }
    } catch (error: any) {
      console.error("Error saving evaluation:", error);
      toast({
        title: "Error saving evaluation",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle notes editing for a specific evaluation
  const handleEditNotes = (evaluationId: string, currentNotes: string | null) => {
    setSelectedEvaluationId(evaluationId);
    setNotes(currentNotes || "");
    setIsEditingNotes(true);
  };

  // Save notes for the selected evaluation
  const handleSaveNotes = async () => {
    if (!selectedEvaluationId) return;
    
    try {
      setIsSavingNotes(true);
      console.log("Saving notes for evaluation:", selectedEvaluationId, "Notes:", notes);
      
      const { error } = await supabase
        .from('pelvic_evaluations')
        .update({ notes: notes.trim() || null })
        .eq('id', selectedEvaluationId);
      
      if (error) {
        console.error("Error updating notes:", error);
        throw error;
      }
      
      console.log("Notes saved successfully");
      toast({
        title: "Notes saved",
        description: "Your evaluation notes have been updated.",
      });
      
      // Refresh evaluations list to show updated notes
      await fetchEvaluations();
      setIsEditingNotes(false);
      setSelectedEvaluationId(null);
      setNotes("");
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error saving notes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Cancel editing notes
  const handleCancelEditNotes = () => {
    setIsEditingNotes(false);
    setSelectedEvaluationId(null);
    setNotes("");
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get motivational message based on performance
  const getMotivationalMessage = () => {
    if (time === 0) return "Ready to test your pelvic floor strength!";
    if (personalBest === 0) return "Great first attempt! Keep practicing.";
    if (time >= personalBest) return "Amazing! You're at your best today!";
    const percentage = time / personalBest * 100;
    if (percentage >= 90) return "Excellent! Nearly your personal best!";
    if (percentage >= 75) return "Great effort! Keep pushing!";
    if (percentage >= 50) return "Good work! You're on the right track.";
    return "Keep practicing! Every session makes you stronger.";
  };

  return <div className="min-h-screen p-4">
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
              <p className="text-gray-600 mb-6">On an Inhale, press start then squeeze your pelvic floor as strongly as possible, breath normally but keep your pelvic squeezed. Hold for as long as you can and press the "Release" button when you can no longer maintain the contraction.</p>

              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl font-bold text-primary mb-4">
                  {formatTime(time)}
                </div>
                
                <div className="w-full max-w-md mb-8">
                  <Progress value={isActive ? time % 60 / 60 * 100 : 0} className="h-3" />
                </div>

                <div className="flex gap-4">
                  <Button size="lg" onClick={handleStart} disabled={isActive} className="shadow-md">
                    Start
                  </Button>
                  <Button size="lg" onClick={handleRelease} disabled={!isActive} variant="destructive" className="shadow-md">
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
            
            {isEditingNotes && (
              <CardFooter className="pt-2 flex-col items-start">
                <div className="w-full mb-4">
                  <Label htmlFor="notes" className="mb-2 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Add notes about this evaluation
                  </Label>
                  <Textarea 
                    id="notes" 
                    placeholder="How did it feel? Was it harder or easier than usual?" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    className="resize-none" 
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {notes.length}/500 characters
                  </div>
                </div>
                <div className="flex gap-2 self-end">
                  <Button variant="outline" onClick={handleCancelEditNotes} disabled={isSavingNotes}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </CardFooter>
            )}
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
              {isLoading ? <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div> : <div className="space-y-4">
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
                </div>}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle>Recent Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div> : evaluations.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {evaluations.slice(0, 5).map(evaluation => (
                      <AccordionItem key={evaluation.id} value={evaluation.id}>
                        <AccordionTrigger className="flex justify-between py-3 hover:no-underline hover:bg-gray-50 rounded px-2">
                          <span className="text-sm text-gray-600">
                            {formatDate(evaluation.created_at)}
                          </span>
                          <span className="font-medium">
                            {formatTime(evaluation.hold_duration_seconds)}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4">
                          {evaluation.notes ? (
                            <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 mb-2">
                              {evaluation.notes}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic mb-2">No notes for this evaluation.</p>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditNotes(evaluation.id, evaluation.notes)}
                            className="w-full mt-2"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            {evaluation.notes ? 'Edit Notes' : 'Add Notes'}
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-gray-500 text-center py-2">
                    Complete your first evaluation to see your results here.
                  </p>
                )
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Evaluation;
