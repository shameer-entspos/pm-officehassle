'use client';
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Task {
  id: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  description: string;
  priority: string;
  assign_to?: { id: string; first_name: string; last_name: string } | null;
  project_added_employees?: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
}

interface TasksCalendarProps {
  events: Task[];
  onSelectEvent: (event: Task) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
}

const TasksCalendar: React.FC<TasksCalendarProps> = ({
  events,
  onSelectEvent,
  onSelectSlot,
}) => {
  // Transform tasks into events compatible with react-big-calendar
  const calendarEvents = events.map((event) => ({
    ...event,
    start: moment.utc(event.start_date).local().toDate(),
    end: event.end_date
      ? moment.utc(event.end_date).local().toDate()
      : moment.utc(event.start_date).local().add(1, 'hour').toDate(), // Default to 1 hour if no end date
    title: event.title,
  }));

  return (
    <div className="w-full">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        date={new Date()}
        view="month"
        views={['month', 'week', 'day']}
        onSelectSlot={onSelectSlot}
        onSelectEvent={(event: any) => onSelectEvent(event)}
        style={{ height: 700 }}
      />
    </div>
  );
};

export default TasksCalendar;
