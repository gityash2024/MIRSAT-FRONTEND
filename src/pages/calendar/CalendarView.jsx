// src/pages/calendar/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const CalendarWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 24px;
  width: 100%;
    max-width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 16px;
    margin-top: 16px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-top: 12px;
    border-radius: 8px;
  }

  .fc {
    min-width: 600px;
    background: white;
    border-radius: 8px;

    @media (max-width: 768px) {
      min-width: 700px;
    }

    @media (max-width: 480px) {
      min-width: 600px;
    }
    
    .fc-toolbar-title {
      font-size: 1.2em;
      color: var(--color-navy);
      word-wrap: break-word;
      overflow-wrap: break-word;

      @media (max-width: 768px) {
        font-size: 1em;
      }

      @media (max-width: 480px) {
        font-size: 0.9em;
      }
    }

    .fc-button-primary {
      background-color: var(--color-navy);
      border-color: var(--color-navy);
      font-size: 14px;
      padding: 6px 12px;
      white-space: nowrap;

      @media (max-width: 768px) {
        font-size: 12px;
        padding: 5px 10px;
      }

      @media (max-width: 480px) {
        font-size: 11px;
        padding: 4px 8px;
      }

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
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      overflow: visible;
      min-height: 18px;
      line-height: 1.3;

      @media (max-width: 768px) {
        font-size: 11px;
        padding: 2px 4px;
        min-height: 16px;
      }

      @media (max-width: 480px) {
        font-size: 10px;
        padding: 2px 4px;
        min-height: 16px;
      }

      &:hover {
        opacity: 0.9;
      }

      .fc-event-title {
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        overflow: visible;
      }

      .fc-event-time {
        white-space: nowrap;
        flex-shrink: 0;
      }
    }

    .fc-day-today {
      background: #f8fafc !important;
    }

    .fc-day-header {
      font-weight: 600;
      color: var(--color-navy);
      font-size: 14px;
      padding: 8px 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;

      @media (max-width: 768px) {
        font-size: 12px;
        padding: 6px 3px;
      }

      @media (max-width: 480px) {
        font-size: 11px;
        padding: 4px 2px;
      }
    }

    .fc-daygrid-day-number {
      color: #333;
      font-weight: 500;
      padding: 8px;
      font-size: 14px;
      white-space: nowrap;

      @media (max-width: 768px) {
        padding: 6px;
        font-size: 12px;
      }

      @media (max-width: 480px) {
        padding: 4px;
        font-size: 11px;
      }
    }

    .fc-toolbar {
      flex-wrap: wrap;
      gap: 8px;

      @media (max-width: 480px) {
        flex-direction: column;
        align-items: stretch;
      }

      .fc-toolbar-chunk {
        @media (max-width: 480px) {
          width: 100%;
          display: flex;
          justify-content: center;
        }
      }
    }

    /* Week and Day view specific styles */
    .fc-timeGridWeek-view,
    .fc-timeGridDay-view {
      .fc-timegrid-slot {
        min-height: 40px;

        @media (max-width: 768px) {
          min-height: 35px;
        }

        @media (max-width: 480px) {
          min-height: 30px;
        }
      }

      .fc-timegrid-event {
        font-size: 12px;
        padding: 4px 6px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        overflow: visible;
        min-height: 20px;
        line-height: 1.3;

        @media (max-width: 768px) {
          font-size: 11px;
          padding: 3px 5px;
          min-height: 18px;
        }

        @media (max-width: 480px) {
          font-size: 10px;
          padding: 2px 4px;
          min-height: 16px;
        }

        .fc-event-title {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          overflow: visible;
        }

        .fc-event-time {
          white-space: nowrap;
          flex-shrink: 0;
        }
      }

      .fc-col-header-cell {
        min-width: 80px;

        @media (max-width: 768px) {
          min-width: 70px;
        }

        @media (max-width: 480px) {
          min-width: 60px;
        }
      }
    }

    /* Month view specific styles */
    .fc-dayGridMonth-view {
      .fc-daygrid-day {
        min-height: 80px;

        @media (max-width: 768px) {
          min-height: 70px;
        }

        @media (max-width: 480px) {
          min-height: 60px;
        }
      }

      .fc-daygrid-day-frame {
        min-height: 80px;

        @media (max-width: 768px) {
          min-height: 70px;
        }

        @media (max-width: 480px) {
          min-height: 60px;
        }
      }

      .fc-daygrid-event {
        margin: 1px 2px;
        padding: 2px 4px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        overflow: visible;
        min-height: 16px;
        line-height: 1.3;

        @media (max-width: 768px) {
          margin: 1px;
          padding: 2px 3px;
          min-height: 14px;
        }

        @media (max-width: 480px) {
          margin: 1px;
          padding: 1px 2px;
          min-height: 14px;
        }

        .fc-event-title {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          overflow: visible;
        }
      }
    }

    /* Scrollbar styling for better UX */
    &::-webkit-scrollbar {
      height: 8px;

      @media (max-width: 480px) {
        height: 6px;
      }
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;

      &:hover {
        background: #94a3b8;
      }
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

  @media (max-width: 768px) {
    height: 150px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    height: 120px;
    font-size: 13px;
  }
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    margin-top: 16px;
    padding: 12px;
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: 480px) {
    margin-top: 12px;
    padding: 10px;
  }
`;

const PageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
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
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 12px;
    min-width: 60px;
  }

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
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 13px;
    text-align: center;
    width: 100%;
    margin-bottom: 8px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const LimitSelector = styled.select`
  padding: 5px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 5px 8px;
    font-size: 12px;
    width: 100%;
    max-width: 100%;
  }
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
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
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
    // Fetch all templates for dropdown (use high limit to get all)
    dispatch(fetchInspectionLevels({ limit: 10000, status: 'active' }));
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
      console.log('Adding event with data from TaskForm:', eventData);

      // TaskForm already provides properly formatted data
      // Just need to convert deadline to ISO string if it's a Date object
      const taskData = {
        ...eventData,
        deadline: eventData.deadline instanceof Date
          ? eventData.deadline.toISOString()
          : eventData.deadline
      };

      console.log('Converted task data:', taskData);

      await dispatch(createTask(taskData)).unwrap();
      loadEvents(); // Reload events after adding
      toast.success(t('eventAddedSuccessfully'));
    } catch (error) {
      console.error('Failed to add event:', error);
      toast.error(`Failed to add event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEventUpdate = async (eventData) => {
    try {
      console.log('Updating event with data from TaskForm:', eventData);

      // TaskForm already provides properly formatted data
      // Just need to convert deadline to ISO string if it's a Date object
      const taskData = {
        ...eventData,
        deadline: eventData.deadline instanceof Date
          ? eventData.deadline.toISOString()
          : eventData.deadline
      };

      // Remove the id from taskData as it should be in the update call parameter
      const { id, ...dataToUpdate } = taskData;

      console.log('Converted task data for update:', dataToUpdate);

      await dispatch(updateTask({ id: eventData.id, data: dataToUpdate })).unwrap();
      loadEvents(); // Reload events after updating
      toast.success(t('eventUpdatedSuccessfully'));
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
      toast.success(t('eventDeletedSuccessfully'));
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Calendar configuration with translations
  const calendarConfig = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: t('today'),
      month: t('month'),
      week: t('week'),
      day: t('day')
    },
    dayHeaderFormat: { weekday: 'short' },
    dayHeaderContent: (arg) => {
      const dayNames = {
        'Sun': t('sunday'),
        'Mon': t('monday'),
        'Tue': t('tuesday'),
        'Wed': t('wednesday'),
        'Thu': t('thursday'),
        'Fri': t('friday'),
        'Sat': t('saturday')
      };
      return dayNames[arg.text] || arg.text;
    },
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    select: handleDateSelect,
    eventClick: handleEventClick,
    eventContent: renderEventContent,
    height: "auto",
    direction: isRTL ? 'rtl' : 'ltr'
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
          <LoadingIndicator>{t('loadingEvents')}</LoadingIndicator>
        ) : (
          <FullCalendar
            {...calendarConfig}
            events={cachedEvents.length > 0 ? cachedEvents : transformTasksToEvents(tasks)}
          />
        )}
      </CalendarWrapper>

      <PaginationContainer>
        <PageInfo>
          {t('showing')} {tasks?.length || 0} {t('of')} {tasks?.length || pagination.total || 0} {t('events')}
        </PageInfo>

        <PageSelector>
          <PageButton
            onClick={() => handlePageChange(1)}
            disabled={pagination.page <= 1}
          >
            {t('first')}
          </PageButton>
          <PageButton
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            {t('previous')}
          </PageButton>

          <PageInfo>{t('page')} {pagination.page} {t('of')} {Math.max(Math.ceil((tasks?.length || pagination.total) / pagination.limit) || 1, 1)}</PageInfo>

          <PageButton
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil((tasks?.length || pagination.total) / pagination.limit)}
          >
            {t('next')}
          </PageButton>
          <PageButton
            onClick={() => handlePageChange(Math.ceil((tasks?.length || pagination.total) / pagination.limit))}
            disabled={pagination.page >= Math.ceil((tasks?.length || pagination.total) / pagination.limit)}
          >
            {t('last')}
          </PageButton>

          <LimitSelector value={pagination.limit} onChange={handleLimitChange}>
            <option value={10}>10 {t('perPage')}</option>
            <option value={25}>25 {t('perPage')}</option>
            <option value={50}>50 {t('perPage')}</option>
            <option value={100}>100 {t('perPage')}</option>
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      whiteSpace: 'normal',
      overflow: 'visible',
      width: '100%',
      minWidth: 0
    }}>
      {eventInfo.timeText && (
        <span style={{
          fontWeight: 'bold',
          fontSize: '0.85em',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          {eventInfo.timeText}
        </span>
      )}
      <span style={{
        fontStyle: 'italic',
        fontSize: '0.9em',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'normal',
        overflow: 'visible',
        lineHeight: '1.3'
      }}>
        {eventInfo.event.title}
      </span>
    </div>
  );
};

export default CalendarView;