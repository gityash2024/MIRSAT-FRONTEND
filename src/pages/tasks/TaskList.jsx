import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Search, 
  Download,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import TaskFilter from './components/TaskFilter';
import TaskTable from './components/TaskTable';
import TaskStatus from './components/TaskStatus';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;

  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;

    &:hover {
      background: #f5f7fb;
    }
  `}
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const statsData = [
  { label: 'Total Tasks', value: 125, icon: Calendar, color: '#1976d2' },
  { label: 'In Progress', value: 42, icon: Clock, color: '#ed6c02' },
  { label: 'Pending Review', value: 18, icon: AlertCircle, color: '#9c27b0' },
  { label: 'Completed', value: 65, icon: CheckCircle, color: '#2e7d32' }
];

const mockTasks = [
  {
    id: 1,
    title: 'Beach Safety Inspection - Zone A',
    description: 'Conduct comprehensive safety inspection of Zone A beach area, including lifeguard equipment, warning signs, and emergency response facilities.',
    assignee: 'John Doe',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-01-20',
    created: '2024-01-15',
    type: 'Safety Inspection',
    comments: [
      {
        id: 1,
        author: 'Jane Smith',
        content: 'Initial equipment check completed. Some life jackets need replacement.',
        timestamp: '2024-01-16 09:30'
      },
      {
        id: 2,
        author: 'John Doe',
        content: 'Ordered new life jackets, should arrive by tomorrow.',
        timestamp: '2024-01-16 10:15'
      }
    ]
  },
  {
    id: 2,
    title: 'Marina Equipment Verification - Dock B',
    description: 'Verify all equipment at Dock B including mooring lines, cleats, and power pedestals.',
    assignee: 'Jane Smith',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2024-01-22',
    created: '2024-01-14',
    type: 'Equipment Check',
    comments: []
  },
  {
    id: 3,
    title: 'Safety Training Documentation Review',
    description: 'Review and update all safety training documentation for compliance with new regulations.',
    assignee: 'Mike Johnson',
    priority: 'High',
    status: 'Under Review',
    dueDate: '2024-01-18',
    created: '2024-01-12',
    type: 'Documentation Review',
    comments: []
  },
  {
    id: 4,
    title: 'Emergency Response Training - Staff Group A',
    description: 'Conduct emergency response training session for Staff Group A.',
    assignee: 'Sarah Williams',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2024-01-15',
    created: '2024-01-10',
    type: 'Training',
    comments: []
  },
  {
    id: 5,
    title: 'Beach Cleanliness Inspection - Zone B',
    description: 'Inspect Zone B beach area for cleanliness and environmental compliance.',
    assignee: 'John Doe',
    priority: 'Low',
    status: 'In Progress',
    dueDate: '2024-01-21',
    created: '2024-01-16',
    type: 'Safety Inspection',
    comments: []
  },
  {
    id: 6,
    title: 'Lifeguard Equipment Maintenance',
    description: 'Perform routine maintenance on all lifeguard equipment at main tower.',
    assignee: 'Mike Johnson',
    priority: 'High',
    status: 'Pending',
    dueDate: '2024-01-23',
    created: '2024-01-16',
    type: 'Equipment Check',
    comments: []
  },
  {
    id: 7,
    title: 'Water Quality Testing - North Beach',
    description: 'Conduct water quality tests at North Beach sampling points.',
    assignee: 'Jane Smith',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2024-01-19',
    created: '2024-01-15',
    type: 'Safety Inspection',
    comments: []
  },
  {
    id: 8,
    title: 'Marina Security Protocol Update',
    description: 'Review and update marina security protocols based on recent assessment.',
    assignee: 'Sarah Williams',
    priority: 'High',
    status: 'Under Review',
    dueDate: '2024-01-25',
    created: '2024-01-17',
    type: 'Documentation Review',
    comments: []
  
  }
];

const TaskList = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    type: [],
    assignee: []
  });

  return (
    <PageContainer>
      <Header>
        <PageTitle>Task Management</PageTitle>
        <SubTitle>Manage and monitor all inspection tasks</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <Filter size={18} />
            Filters
          </Button>
          <Button variant="secondary">
            <Download size={18} />
            Export
          </Button>
          <Button variant="primary" as={Link} to="/tasks/create">
            <Plus size={18} />
            Create Task
          </Button>
        </ButtonGroup>
      </ActionBar>

      {isFilterVisible && (
        <FilterSection>
          <TaskFilter 
            filters={filters} 
            setFilters={setFilters}
          />
        </FilterSection>
      )}

      <TaskTable 
        tasks={mockTasks}
        filters={filters}
        searchTerm={searchTerm}
      />
    </PageContainer>
  );
};

export default TaskList;