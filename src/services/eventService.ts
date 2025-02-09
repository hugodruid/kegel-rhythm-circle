
import { supabase } from "@/integrations/supabase/client";
import { EjaculationEvent } from "@/types/calendar";
import { format, isToday, set, startOfDay } from "date-fns";

export const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('ejaculation_events')
    .select('*')
    .order('occurred_at', { ascending: false });

  if (error) throw error;

  const localEvents = data?.map(event => ({
    ...event,
    occurred_at: new Date(event.occurred_at).toISOString()
  })) || [];

  return localEvents;
};

export const addEvent = async (date: Date, userId: string) => {
  const baseDate = startOfDay(date);
  
  let eventTime: Date;
  if (!isToday(date)) {
    eventTime = set(baseDate, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
  } else {
    const now = new Date();
    eventTime = set(baseDate, {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: 0,
      milliseconds: 0
    });
  }

  const { error } = await supabase
    .from('ejaculation_events')
    .insert({
      occurred_at: eventTime.toISOString(),
      user_id: userId
    });

  if (error) throw error;

  return format(date, 'PPP');
};

export const updateEventTime = async (
  eventId: string,
  userId: string,
  currentEvent: EjaculationEvent,
  newTime: string
) => {
  const currentDate = new Date(currentEvent.occurred_at);
  const [hours, minutes] = newTime.split(':');
  const updatedDate = set(currentDate, {
    hours: parseInt(hours),
    minutes: parseInt(minutes),
    seconds: 0,
    milliseconds: 0
  });

  const { error } = await supabase
    .from('ejaculation_events')
    .update({ occurred_at: updatedDate.toISOString() })
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) throw error;

  return updatedDate.toISOString();
};

export const deleteEvent = async (eventId: string, userId: string) => {
  const { error } = await supabase
    .from('ejaculation_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
};
