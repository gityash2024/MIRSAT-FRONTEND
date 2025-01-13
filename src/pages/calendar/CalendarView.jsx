// src/pages/calendar/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './components/EventModal';
import CalendarFilters from './components/CalendarFilters';
import CalendarHeader from './components/CalendarHeader';
import { mockEvents } from './mockData';

const CalendarContainer = styled.div`
  padding: 24px;
  background: #f5f7fb;
  min-height: calc(100vh - 64px);
`;

const CalendarWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 24px;

  .fc {
    max-width: 100%;
    background: white;
    border-radius: 8px;
    
    .fc-toolbar-title {
      font-size: 1.2em;
      color: #1a237e;
    }

    .fc-button-primary {
      background-color: #1a237e;
      border-color: #1a237e;

      &:hover {
        background-color: #151b4f;
        border-color: #151b4f;
      }

      &:disabled {
        background-color: #e0e0e0;
        border-color: #e0e0e0;
      }
    }

    .fc-event {
      border-radius: 4px;
      border: none;
      padding: 2px 4px;
      font-size: 12px;
      cursor: pointer;

      &:hover {
        opacity: 0.9;
      }
    }

    .fc-day-today {
      background: #f8fafc !important;
    }

    .fc-day-header {
      font-weight: 600;
      color: #1a237e;
    }

    .fc-daygrid-day-number {
      color: #333;
      font-weight: 500;
      padding: 8px;
    }
  }
`;

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState(mockEvents);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo.start);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(events.find(event => event.id === clickInfo.event.id));
    setShowEventModal(true);
  };

  const handleEventAdd = (newEvent) => {
    setEvents([...events, { ...newEvent, id: String(events.length + 1) }]);
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const handleEventDelete = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  return (
    <CalendarContainer>
      <CalendarHeader 
        onAddEvent={() => {
          setSelectedEvent(null);
          setShowEventModal(true);
        }}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <CalendarFilters 
          onFilterChange={(filters) => {
            // Handle filter changes
            console.log('Filters:', filters);
          }}
        />
      )}

      <CalendarWrapper>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
        />
      </CalendarWrapper>

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          event={selectedEvent}
          selectedDate={selectedDate}
          onAdd={handleEventAdd}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
        />
      )}
    </CalendarContainer>
  );
};

const renderEventContent = (eventInfo) => {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
};

export default CalendarView;