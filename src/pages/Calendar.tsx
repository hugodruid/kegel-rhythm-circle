
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfDay } from "date-fns";
import { CalendarDayContent } from "@/components/calendar/CalendarDayContent";
import { EjaculationEvent } from "@/types/calendar";
import { fetchEvents, addEvent, updateEventTime, deleteEvent } from "@/services/eventService";

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [events, setEvents] = useState<EjaculationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      fetchEventData();
    };

    checkUser();
  }, [navigate]);

  const fetchEventData = async () => {
    try {
      const data = await fetchEvents();
      setEvents(data);
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

  const handleAddEvent = async (date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const formattedDate = await addEvent(date, user.id);
      
      toast({
        title: "Event added",
        description: `Event recorded for ${formattedDate}`,
      });

      fetchEventData();
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateEventTime = async (eventId: string, newTime: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      const event = events.find(e => e.id === eventId);
      if (!event) return;

      const updatedDate = await updateEventTime(eventId, user.id, event, newTime);

      setEvents(prevEvents => {
        const updatedEvents = prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, occurred_at: updatedDate }
            : event
        );
        return [...updatedEvents];
      });

      toast({
        title: "Event updated",
        description: "Time successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      await deleteEvent(eventId, user.id);

      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(event => event.id !== eventId);
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

  const getDayEvents = (date: Date) => {
    const dayStr = startOfDay(date).toISOString().split('T')[0];
    return events.filter(e => {
      const eventDate = new Date(e.occurred_at);
      return startOfDay(eventDate).toISOString().split('T')[0] === dayStr;
    });
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
                DayContent: ({ date }) => (
                  <CalendarDayContent
                    date={date}
                    events={getDayEvents(date)}
                    onAddEvent={handleAddEvent}
                    onUpdateEventTime={handleUpdateEventTime}
                    onDeleteEvent={handleDeleteEvent}
                  />
                )
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
