
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarDayContent = ({
  date,
  events,
  onAddEvent,
  onUpdateEventTime,
  onDeleteEvent,
  isOpen,
  onOpenChange,
}: CalendarDayContentProps) => {
  const dateNumber = date.getDate();

  return (
    <>
      {events.length === 0 ? (
        <div className="text-black font-medium">
          {dateNumber}
        </div>
      ) : (
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
      )}

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{format(date, 'PPP')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                    onClick={() => onDeleteEvent(event.id)}
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
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
