
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EjaculationEvent {
  id: string;
  occurred_at: string;
}

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [events, setEvents] = useState<EjaculationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      fetchEvents();
    };

    checkUser();
  }, [navigate]);

  // Fetch events from the database
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('ejaculation_events')
        .select('*')
        .order('occurred_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new event
  const addEvent = async (date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { error } = await supabase
        .from('ejaculation_events')
        .insert({
          occurred_at: date.toISOString(),
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Event added",
        description: `Event recorded for ${format(date, 'PPP')}`,
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete event
  const deleteEvent = async (date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { error } = await supabase
        .from('ejaculation_events')
        .delete()
        .eq('occurred_at', date.toISOString())
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: `Event removed for ${format(date, 'PPP')}`,
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    setSelectedDay(day);
    const dayStr = day.toISOString();
    const existingEvent = events.find(e => e.occurred_at.startsWith(dayStr.split('T')[0]));
    
    if (existingEvent) {
      deleteEvent(day);
    } else {
      addEvent(day);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const modifiers = {
    event: events.map(event => new Date(event.occurred_at)),
  };

  const modifiersStyles = {
    event: { color: 'white', backgroundColor: '#3b82f6' },
  };

  return (
    <div className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={handleDayClick}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              footer={
                <div className="mt-4 text-center text-sm text-gray-500">
                  Click on a date to toggle 💦
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
