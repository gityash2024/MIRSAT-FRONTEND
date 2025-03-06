// src/pages/calendar/mockData.js

export const mockEvents = [
    {
      id: '1',
      title: 'Beach Safety Inspection - Zone A',
      start: '2024-01-20T10:00:00',
      end: '2024-01-20T12:00:00',
      backgroundColor: '#1a237e',
      borderColor: '#1a237e',
      type: 'inspection',
      assignee: 'John Doe',
      description: 'Conduct comprehensive safety inspection of Zone A beach area',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Marina Equipment Verification',
      start: '2024-01-22T14:00:00',
      end: '2024-01-22T16:00:00',
      backgroundColor: '#0d47a1',
      borderColor: '#0d47a1',
      type: 'verification',
      assignee: 'Jane Smith',
      description: 'Verify all equipment at Marina dock B',
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Staff Training Session',
      start: '2024-01-25T09:00:00',
      end: '2024-01-25T11:00:00',
      backgroundColor: '#1565c0',
      borderColor: '#1565c0',
      type: 'training',
      assignee: 'Mike Johnson',
      description: 'Conduct safety training for new staff members',
      status: 'confirmed'
    },
    {
      id: '4',
      title: 'Water Quality Testing',
      start: '2024-01-28T13:00:00',
      end: '2024-01-28T15:00:00',
      backgroundColor: '#1976d2',
      borderColor: '#1976d2',
      type: 'testing',
      assignee: 'Sarah Williams',
      description: 'Perform water quality tests at designated points',
      status: 'pending'
    }
  ];
  
  export const eventTypes = [
    { value: 'inspection', label: 'Inspection' },
    { value: 'verification', label: 'Verification' },
    { value: 'training', label: 'Training' },
    { value: 'testing', label: 'Testing' },
    { value: 'maintenance', label: 'Maintenance' }
  ];
  
  export const eventStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  export const assignees = [
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'Mike Johnson', label: 'Mike Johnson' },
    { value: 'Sarah Williams', label: 'Sarah Williams' }
  ];