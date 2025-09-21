export const filterOptions = {
    status: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'archived', label: 'Completed' },
    ],
    priority: [ 
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ],
    assignedTo: [] // This will be populated dynamically from users data
  };