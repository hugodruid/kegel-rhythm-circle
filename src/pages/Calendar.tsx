import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfDay, format } from "date-fns";
import { CalendarDayContent } from "@/components/calendar/CalendarDayContent";
import { EjaculationEvent } from "@/types/calendar";
import { fetchEvents, addEvent, updateEventTime, deleteEvent } from "@/services/eventService";

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [events, setEvents] = useState<EjaculationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view and manage your data.",
          variant: "destructive"
        });
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
      if (error.code === 'PGRST301') {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this data.",
          variant: "destructive"
        });
        navigate('/');
      } else {
        toast({
          title: "Error fetching events",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (date: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add events.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      const formattedDate = await addEvent(date, user.id);
      toast({
        title: "Event added",
        description: `Event recorded for ${formattedDate}`
      });
      fetchEventData();
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateEventTime = async (eventId: string, newTime: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to update events.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      const updatedDate = await updateEventTime(eventId, user.id, event, newTime);
      setEvents(prevEvents => {
        const updatedEvents = prevEvents.map(event => event.id === eventId ? {
          ...event,
          occurred_at: updatedDate
        } : event);
        return [...updatedEvents];
      });
      toast({
        title: "Event updated",
        description: "Time successfully updated"
      });
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to delete events.",
          variant: "destructive"
        });
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
        description: "Event successfully removed"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDayEvents = (date: Date) => {
    const dayStr = startOfDay(date).toISOString().split('T')[0];
    return events.filter(e => {
      const eventDate = new Date(e.occurred_at);
      return startOfDay(eventDate).toISOString().split('T')[0] === dayStr;
    });
  };

  const handleDayClick = async (date: Date) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add events.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    const dayEvents = getDayEvents(date);
    if (dayEvents.length === 0) {
      await handleAddEvent(date);
    } else {
      setSelectedDate(date);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>;
  }

  const selectedDateEvents = selectedDate ? getDayEvents(selectedDate) : [];

  return <div className="min-h-screen p-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <DayPicker 
              mode="single" 
              selected={selectedDay} 
              onSelect={setSelectedDay} 
              onDayClick={handleDayClick}
              components={{
                DayContent: ({ date }) => (
                  <CalendarDayContent date={date} events={getDayEvents(date)} />
                )
              }}
              footer={
                <div className="mt-4 text-center text-sm text-gray-500">
                  Click on a date to add event 💦 Track your ejaculations.
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDate} onOpenChange={open => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedDate ? format(selectedDate, 'PPP') : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between bg-secondary p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Input
                      type="time"
                      defaultValue={format(new Date(event.occurred_at), 'HH:mm')}
                      className="w-24"
                      onChange={e => handleUpdateEventTime(event.id, e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={() => selectedDate && handleAddEvent(selectedDate)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};

export default Calendar;
