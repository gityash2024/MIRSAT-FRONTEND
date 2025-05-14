// src/pages/calendar/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './components/EventModal';
import CalendarFilters from './components/CalendarFilters';
import CalendarHeader from './components/CalendarHeader';
import { fetchTasks, createTask, updateTask, setPagination } from '../../store/slices/taskSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { toast } from 'react-hot-toast';
import Skeleton from '../../components/ui/Skeleton';

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
      color: var(--color-navy);
    }

    .fc-button-primary {
      background-color: var(--color-navy);
      border-color: var(--color-navy);

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
      color: var(--color-navy);
    }

    .fc-daygrid-day-number {
      color: #333;
      font-weight: 500;
      padding: 8px;
    }
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--color-navy);
  font-size: 16px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageButton = styled.button`
  padding: 5px 10px;
  border: 1px solid #e0e0e0;
  background: ${props => props.active ? 'var(--color-navy)' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--color-navy)' : '#f5f7fb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #666;
  font-size: 14px;
`;

const LimitSelector = styled.select`
  padding: 5px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #333;
`;

// Create a CalendarViewSkeleton component
const CalendarViewSkeleton = () => (
  <CalendarContainer>
    {/* Header skeleton */}
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <Skeleton.Base width="180px" height="28px" margin="0 0 8px 0" />
          <Skeleton.Base width="280px" height="16px" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton.Button width="100px" height="40px" />
          <Skeleton.Button width="100px" height="40px" />
          <Skeleton.Button width="120px" height="40px" />
        </div>
      </div>
    </div>

    {/* Filters area skeleton */}
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px', 
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {Array(4).fill().map((_, i) => (
          <div key={i}>
            <Skeleton.Base width="100px" height="16px" margin="0 0 8px 0" />
            <Skeleton.Base width="100%" height="40px" radius="8px" />
          </div>
        ))}
      </div>
    </div>

    {/* Calendar skeleton */}
    <CalendarWrapper>
      <div style={{ padding: '16px' }}>
        {/* Calendar toolbar skeleton */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '24px',
          padding: '8px 0'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton.Button width="80px" height="36px" />
            <Skeleton.Button width="80px" height="36px" />
            <Skeleton.Button width="80px" height="36px" />
          </div>
          <Skeleton.Base width="200px" height="36px" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton.Button width="110px" height="36px" />
            <Skeleton.Button width="110px" height="36px" />
            <Skeleton.Button width="110px" height="36px" />
          </div>
        </div>

        {/* Calendar grid skeleton */}
        <div>
          {/* Day header row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '1px', 
            marginBottom: '1px',
            background: '#f5f7fb',
            padding: '8px 0'
          }}>
            {Array(7).fill().map((_, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <Skeleton.Base width="70%" height="20px" style={{ margin: '0 auto' }} />
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          {Array(6).fill().map((_, week) => (
            <div key={week} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '1px',
              borderBottom: '1px solid #e0e0e0'
            }}>
              {Array(7).fill().map((_, day) => (
                <div key={day} style={{ 
                  height: '120px', 
                  padding: '8px',
                  borderRight: day < 6 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <Skeleton.Base width="24px" height="24px" margin="0 0 8px 0" />
                  
                  {/* Random number of events in each cell */}
                  {Array(Math.floor(Math.random() * 3)).fill().map((_, i) => (
                    <Skeleton.Base 
                      key={i} 
                      width={`${60 + Math.random() * 30}%`} 
                      height="20px" 
                      margin="0 0 4px 0"
                      radius="4px"
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </CalendarWrapper>
    
    {/* Pagination skeleton */}
    <PaginationContainer>
      <Skeleton.Base width="180px" height="16px" />
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton.Button width="70px" height="32px" />
        <Skeleton.Button width="70px" height="32px" />
        <Skeleton.Base width="100px" height="16px" />
        <Skeleton.Button width="70px" height="32px" />
        <Skeleton.Button width="70px" height="32px" />
        <Skeleton.Base width="100px" height="32px" radius="4px" />
      </div>
    </PaginationContainer>
  </CalendarContainer>
);

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [cachedEvents, setCachedEvents] = useState([]);
  
  const dispatch = useDispatch();
  const { tasks, loading, filters, pagination } = useSelector((state) => state.tasks);
  
  useEffect(() => {
    // Fetch necessary data when component mounts
    dispatch(fetchUsers());
    dispatch(fetchInspectionLevels());
    loadEvents();
  }, [dispatch, filters, pagination.page, pagination.limit]);

  // Ensure the tasks are processed into events and cached to prevent UI flicker
  useEffect(() => {
    if (tasks?.length > 0) {
      const eventsList = transformTasksToEvents(tasks);
      setCachedEvents(eventsList);
    }
  }, [tasks]);

  // Transform tasks into events for the calendar
  const transformTasksToEvents = (tasksList) => {
    if (!tasksList || !Array.isArray(tasksList)) return [];
    
    return tasksList.map(task => ({
      id: task._id || task.id,
      title: task.title,
      start: task.deadline ? new Date(task.deadline) : null,
      end: task.deadline ? new Date(new Date(task.deadline).getTime() + 2 * 60 * 60 * 1000) : null, // Add 2 hours for end time
      backgroundColor: getStatusColor(task.status),
      borderColor: getStatusColor(task.status),
      type: task.inspectionLevel?._id || '',
      assignee: task.assignedTo?.length > 0 ? task.assignedTo[0]._id : '',
      description: task.description,
      status: task.status,
      priority: task.priority,
      taskData: task // Keep the original task data
    }));
  };

  const loadEvents = () => {
    dispatch(fetchTasks({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      isCalendarView: true // Add a flag to indicate this is for calendar view
    }));
  };

  function getStatusColor(status) {
    switch (status) {
      case 'pending':
        return 'var(--color-navy)'; // Dark blue
      case 'in_progress':
        return '#1976d2'; // Medium blue
      case 'completed':
        return '#10b981'; // Green
      case 'cancelled':
        return '#ef4444'; // Red
      default:
        return 'var(--color-navy)'; // Default blue
    }
  }
  
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    dispatch(setPagination({ limit: newLimit, page: 1 }));
  };
  
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo.start);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const taskId = clickInfo.event.id;
    const task = tasks.find(t => (t._id === taskId) || (t.id === taskId));
    
    if (task) {
      setSelectedEvent({
        ...task,
        id: task._id || task.id,
        title: task.title,
        type: task.inspectionLevel?._id || '',
        assignee: task.assignedTo?.length > 0 ? task.assignedTo[0]._id : '',
        status: task.status,
        priority: task.priority,
        start: task.deadline,
        end: task.deadline ? new Date(new Date(task.deadline).getTime() + 2 * 60 * 60 * 1000).toISOString() : null,
        description: task.description || ''
      });
      setShowEventModal(true);
    }
  };

  const handleEventAdd = async (eventData) => {
    try {
      // Convert the event data to task format
      const taskData = {
        title: eventData.title,
        description: eventData.description,
        status: eventData.status || 'pending',
        priority: eventData.priority || 'medium',
        deadline: eventData.start,
        assignedTo: eventData.assignee ? [eventData.assignee] : [],
        inspectionLevel: eventData.type || null,
        // Add other task fields as needed
      };
      
      await dispatch(createTask(taskData)).unwrap();
      loadEvents(); // Reload events after adding
      toast.success('Event added successfully');
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleEventUpdate = async (eventData) => {
    try {
      // Convert the event data to task format for update
      const taskData = {
        title: eventData.title,
        description: eventData.description,
        status: eventData.status,
        priority: eventData.priority || 'medium',
        deadline: eventData.start,
        assignedTo: eventData.assignee ? [eventData.assignee] : [],
        inspectionLevel: eventData.type || null,
        // Add other task fields as needed
      };
      
      await dispatch(updateTask({ id: eventData.id, data: taskData })).unwrap();
      loadEvents(); // Reload events after updating
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      // For now, just mark the task as cancelled instead of deleting
      const taskData = {
        status: 'cancelled'
      };
      
      await dispatch(updateTask({ id: eventId, data: taskData })).unwrap();
      loadEvents(); // Reload events after "deleting"
      toast.success('Event cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel event');
    }
  };

  return (
    <CalendarContainer>
      <CalendarHeader 
        onAddEvent={() => {
          setSelectedEvent(null);
          setShowEventModal(true);
        }}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onExport={() => console.log('Export calendar')}
      />

      {showFilters && (
        <CalendarFilters 
          onFilterChange={() => loadEvents()}
        />
      )}

      <CalendarWrapper>
        {loading && !cachedEvents.length ? (
          <LoadingIndicator>Loading calendar events...</LoadingIndicator>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={cachedEvents.length > 0 ? cachedEvents : transformTasksToEvents(tasks)}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
          />
        )}
      </CalendarWrapper>
      
      <PaginationContainer>
        <PageInfo>
          Showing {tasks?.length || 0} of {tasks?.length || pagination.total || 0} events
        </PageInfo>
        
        <PageSelector>
          <PageButton 
            onClick={() => handlePageChange(1)} 
            disabled={pagination.page <= 1}
          >
            First
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(pagination.page - 1)} 
            disabled={pagination.page <= 1}
          >
            Previous
          </PageButton>
          
          <PageInfo>Page {pagination.page} of {Math.max(Math.ceil((tasks?.length || pagination.total) / pagination.limit) || 1, 1)}</PageInfo>
          
          <PageButton 
            onClick={() => handlePageChange(pagination.page + 1)} 
            disabled={pagination.page >= Math.ceil((tasks?.length || pagination.total) / pagination.limit)}
          >
            Next
          </PageButton>
          <PageButton 
            onClick={() => handlePageChange(Math.ceil((tasks?.length || pagination.total) / pagination.limit))} 
            disabled={pagination.page >= Math.ceil((tasks?.length || pagination.total) / pagination.limit)}
          >
            Last
          </PageButton>
          
          <LimitSelector value={pagination.limit} onChange={handleLimitChange}>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </LimitSelector>
        </PageSelector>
      </PaginationContainer>

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