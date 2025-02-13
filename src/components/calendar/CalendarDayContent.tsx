
import { EjaculationEvent } from "@/types/calendar";

interface CalendarDayContentProps {
  date: Date;
  events: EjaculationEvent[];
}

export const CalendarDayContent = ({
  date,
  events,
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
    </>
  );
};
