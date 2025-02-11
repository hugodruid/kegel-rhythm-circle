
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { EjaculationEvent } from "@/types/calendar";

interface CalendarDayContentProps {
  date: Date;
  events: EjaculationEvent[];
  onAddEvent: (date: Date) => void;
  onUpdateEventTime: (eventId: string, newTime: string) => void;
  onDeleteEvent: (eventId: string) => void;
  openPopoverId: string | null;
  onPopoverChange: (id: string | null) => void;
}

export const CalendarDayContent = ({
  date,
  events,
  onAddEvent,
  onUpdateEventTime,
  onDeleteEvent,
  openPopoverId,
  onPopoverChange,
}: CalendarDayContentProps) => {
  const dateNumber = date.getDate();
  const dateId = date.toISOString();

  return (
    <Popover 
      open={openPopoverId === dateId}
      onOpenChange={(open) => onPopoverChange(open ? dateId : null)}
    >
      <PopoverTrigger asChild>
        <div className="w-full h-full p-2 rounded-none hover:bg-accent/50 cursor-pointer">
          {events.length === 0 ? (
            <div className="text-black font-medium">
              {dateNumber}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="relative bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white/90">{dateNumber}</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  💦
                  {events.length > 1 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {events.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="font-medium">{format(date, 'PPP')}</div>
          {events.length === 0 ? (
            <Button
              onClick={() => onAddEvent(date)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between bg-secondary p-2 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Input
                        type="time"
                        defaultValue={format(new Date(event.occurred_at), 'HH:mm')}
                        className="w-24"
                        onChange={(e) => onUpdateEventTime(event.id, e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent(event.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => onAddEvent(date)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Event
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
