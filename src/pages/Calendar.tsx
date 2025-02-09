
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2, Plus } from "lucide-react";

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
  const deleteEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const { error } = await supabase
        .from('ejaculation_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately after successful deletion
      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(event => event.id !== eventId);
        // Force a re-render by creating a new array
        return [...updatedEvents];
      });

      toast({
        title: "Event deleted",
        description: "Event successfully removed",
      });
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
    const dayStr = day.toISOString().split('T')[0];
    const existingEvents = events.filter(e => e.occurred_at.startsWith(dayStr));
    
    if (existingEvents.length === 0) {
      addEvent(day);
    }
  };

  const getDayContent = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    const dayEvents = events.filter(e => e.occurred_at.startsWith(dayStr));
    const dateNumber = day.getDate();
    
    if (dayEvents.length === 0) {
      return (
        <div className="text-black font-medium">
          {dateNumber}
        </div>
      );
    }

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="w-full h-full flex items-center justify-center relative cursor-pointer">
            <div className="absolute w-full h-full flex items-center justify-center">
              <span className="text-black/30">{dateNumber}</span>
            </div>
            <div className="relative bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-white/90">{dateNumber}</span>
              <div className="absolute inset-0 flex items-center justify-center">
                💦
                {dayEvents.length > 1 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {dayEvents.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-4">
            <div className="font-medium">{format(day, 'PPP')}</div>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between bg-secondary p-2 rounded">
                  <span>{format(new Date(event.occurred_at), 'p')}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={() => addEvent(day)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Event
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
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
              components={{
                DayContent: ({ date }) => getDayContent(date)
              }}
              footer={
                <div className="mt-4 text-center text-sm text-gray-500">
                  Click on a date to add event 💦
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
