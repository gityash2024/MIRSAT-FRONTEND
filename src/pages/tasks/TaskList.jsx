import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Filter, Search, Download } from 'lucide-react';
import TaskFilter from './components/TaskFilter';
import TaskTable from './components/TaskTable';
import { fetchTasks, setFilters, setPagination } from '../../store/slices/taskSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';

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

const TaskList = () => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const { tasks, loading, filters } = useSelector((state) => state.tasks);
  const pagination = {
    page: 1,
    limit: 10,
    total: tasks.length
  }
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTasks();
  }, [filters, pagination.page, pagination.limit]);

  const loadTasks = () => {
    dispatch(fetchTasks({
      ...filters,
      search: searchTerm,
      page: pagination.page,
      limit: pagination.limit
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    dispatch(setPagination({ page: 1 }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleExport = () => {
    // Implement export functionality
  };

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
            onChange={handleSearchChange}
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
          
          {hasPermission(PERMISSIONS.EXPORT_TASKS) && (
            <Button variant="secondary" onClick={handleExport}>
              <Download size={18} />
              Export
            </Button>
          )}
          
          {hasPermission(PERMISSIONS.CREATE_TASKS) && (
            <Button variant="primary" as={Link} to="/tasks/create">
              <Plus size={18} />
              Create Task
            </Button>
          )}
        </ButtonGroup>
      </ActionBar>

      {isFilterVisible && (
        <FilterSection>
          <TaskFilter 
            filters={filters} 
            setFilters={handleFilterChange}
          />
        </FilterSection>
      )}

      <TaskTable 
        tasks={tasks}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </PageContainer>
  );
};

export default TaskList;