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
import { fetchTasks, createTask, updateTask, deleteTask, setPagination } from '../../store/slices/taskSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { fetchAssets } from '../../store/slices/assetSlice';
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
  const { users } = useSelector((state) => state.users || { users: [] });
  const { levels } = useSelector((state) => state.inspectionLevels || { levels: { results: [] } });
  const { assets } = useSelector((state) => state.assets || { assets: [] });
  
  useEffect(() => {
    // Fetch necessary data when component mounts
    dispatch(fetchUsers());
    dispatch(fetchInspectionLevels());
    dispatch(fetchAssets());
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
      case 'archived':
        return '#6b7280'; // Gray
      case 'incomplete':
        return '#f59e0b'; // Orange
      case 'partially_completed':
        return '#8b5cf6'; // Purple
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
    
    console.log('Event clicked, task found:', task);
    console.log('Available data when clicking event:', {
      usersCount: users?.length || 0,
      levelsCount: levels?.results?.length || 0,
      assetsCount: assets?.length || 0
    });
    
    // If required data is not available, fetch it before opening the modal
    if (!users?.length || !levels?.results?.length) {
      console.log('Required data not available, fetching...');
      if (!users?.length) dispatch(fetchUsers());
      if (!levels?.results?.length) dispatch(fetchInspectionLevels());
      if (!assets?.length) dispatch(fetchAssets());
      
      // Set a timeout to try again after data should be loaded
      setTimeout(() => {
        handleEventClick(clickInfo);
      }, 1000);
      return;
    }
    
    if (task) {
      // Properly extract user ID from assignedTo
      let assignedUserId = '';
      if (task.assignedTo && task.assignedTo.length > 0) {
        const firstAssignedUser = task.assignedTo[0];
        // Handle both populated and non-populated user objects
        if (typeof firstAssignedUser === 'string') {
          assignedUserId = firstAssignedUser;
        } else if (firstAssignedUser && firstAssignedUser._id) {
          assignedUserId = firstAssignedUser._id;
        } else if (firstAssignedUser && firstAssignedUser.id) {
          assignedUserId = firstAssignedUser.id;
        }
      }
      
      // Properly extract inspection level ID
      let inspectionLevelId = '';
      if (task.inspectionLevel) {
        if (typeof task.inspectionLevel === 'string') {
          inspectionLevelId = task.inspectionLevel;
        } else if (task.inspectionLevel._id) {
          inspectionLevelId = task.inspectionLevel._id;
        } else if (task.inspectionLevel.id) {
          inspectionLevelId = task.inspectionLevel.id;
        }
      }
      
      // Properly extract asset ID
      let assetId = '';
      if (task.asset) {
        if (typeof task.asset === 'string') {
          assetId = task.asset;
        } else if (task.asset._id) {
          assetId = task.asset._id;
        } else if (task.asset.id) {
          assetId = task.asset.id;
        }
      }
      
      console.log('Extracted IDs:', {
        assignedUserId,
        inspectionLevelId,
        assetId
      });
      
      // Check if the extracted IDs exist in the available options
      console.log('Validation checks:', {
        userExists: users?.some(u => (u._id === assignedUserId || u.id === assignedUserId)),
        levelExists: levels?.results?.some(l => l._id === inspectionLevelId),
        assetExists: assets?.some(a => (a._id === assetId || a.id === assetId))
      });
      
      setSelectedEvent({
        id: task._id || task.id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignedTo: assignedUserId,
        inspectionLevel: inspectionLevelId,
        asset: assetId,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        location: task.location || ''
      });
      setShowEventModal(true);
    }
  };

  const handleEventAdd = async (eventData) => {
    try {
      console.log('Adding event with data:', eventData);
      
      // Validate and process assignedTo field
      let assignedToArray = [];
      if (eventData.assignedTo) {
        // Ensure we have a valid user ID (should be a MongoDB ObjectId format)
        const userId = eventData.assignedTo.trim();
        if (userId && userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
          assignedToArray = [userId];
        } else if (userId) {
          console.error('Invalid user ID format:', userId);
          toast.error('Invalid user selected. Please select a valid user.');
          return;
        }
      }
      
      if (assignedToArray.length === 0) {
        toast.error('Please select at least one user to assign the task to.');
        return;
      }
      
      // Convert the event data to task format that matches the working tasks module
      const taskData = {
        title: eventData.title,
        description: eventData.description,
        status: eventData.status || 'pending',
        priority: eventData.priority || 'medium',
        deadline: eventData.deadline ? new Date(eventData.deadline).toISOString() : new Date().toISOString(),
        assignedTo: assignedToArray,
        inspectionLevel: eventData.inspectionLevel || null,
        asset: eventData.asset || null,
        location: eventData.location || '',
        isActive: true
      };
      
      console.log('Converted task data:', taskData);
      console.log('AssignedTo array:', assignedToArray);
      
      await dispatch(createTask(taskData)).unwrap();
      loadEvents(); // Reload events after adding
      toast.success('Event added successfully');
    } catch (error) {
      console.error('Failed to add event:', error);
      toast.error(`Failed to add event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEventUpdate = async (eventData) => {
    try {
      console.log('Updating event with data:', eventData);
      
      // Validate and process assignedTo field (same as in handleEventAdd)
      let assignedToArray = [];
      if (eventData.assignedTo) {
        const userId = eventData.assignedTo.trim();
        if (userId && userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
          assignedToArray = [userId];
        } else if (userId) {
          console.error('Invalid user ID format for update:', userId);
          toast.error('Invalid user selected. Please select a valid user.');
          return;
        }
      }
      
      if (assignedToArray.length === 0) {
        toast.error('Please select at least one user to assign the task to.');
        return;
      }
      
      // Convert the event data to task format for update
      const taskData = {
        title: eventData.title,
        description: eventData.description,
        status: eventData.status,
        priority: eventData.priority || 'medium',
        deadline: eventData.deadline ? new Date(eventData.deadline).toISOString() : new Date().toISOString(),
        assignedTo: assignedToArray,
        inspectionLevel: eventData.inspectionLevel || null,
        asset: eventData.asset || null,
        location: eventData.location || ''
      };
      
      console.log('Converted task data for update:', taskData);
      console.log('Update AssignedTo array:', assignedToArray);
      
      await dispatch(updateTask({ id: eventData.id, data: taskData })).unwrap();
      loadEvents(); // Reload events after updating
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error(`Failed to update event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      // Actually delete the task instead of just marking it as cancelled
      await dispatch(deleteTask(eventId)).unwrap();
      loadEvents(); // Reload events after deleting
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
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