
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
        <div 
          className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)'
          }}
        >
          {/* Semi-transparent number with better contrast */}
          <span className="text-[#8A898C]/80 font-medium text-lg">
            {dateNumber}
          </span>
          {/* Emoji with refined positioning */}
          <div className="absolute inset-0 flex items-center justify-center translate-y-[2px]">
            <span className="text-sm">💦</span>
            {events.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-[#0FA0CE]/90 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {events.length}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};
