// src/pages/calendar/components/CalendarFilters.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { X, Search } from 'lucide-react';
import { setFilters } from '../../../store/slices/taskSlice';

const FiltersContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const FilterGroup = styled.div`
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 12px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  &:hover {
    color: var(--color-navy);
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-navy);

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    padding: 2px;
    cursor: pointer;
    color: #64748b;

    &:hover {
      color: #ef4444;
    }
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: var(--color-navy);
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

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const CalendarFilters = ({ onFilterChange }) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users || { users: [] });
  const { levels } = useSelector((state) => state.inspectionLevels || { levels: { results: [] } });
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
    onFilterChange();
  };

  const handleFilterChange = (category, value) => {
    const currentValues = filters[category] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    dispatch(setFilters({ [category]: updatedValues }));
    onFilterChange();
  };

  const removeFilter = (category, value) => {
    const currentValues = filters[category] || [];
    const updatedValues = currentValues.filter(item => item !== value);
    
    dispatch(setFilters({ [category]: updatedValues }));
    onFilterChange();
  };

  const getFilterLabel = (category, value) => {
    if (category === 'status') {
      return statuses.find(s => s.value === value)?.label || value;
    }
    if (category === 'priority') {
      return priorities.find(p => p.value === value)?.label || value;
    }
    if (category === 'assignedTo') {
      return users.find(u => u._id === value)?.name || value;
    }
    if (category === 'inspectionLevel') {
      return levels?.results?.find(l => l._id === value)?.name || value;
    }
    return value;
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, values]) => {
      if (key === 'search') return !!values;
      return Array.isArray(values) && values.length > 0;
    });
  };

  return (
    <FiltersContainer>
      <SearchContainer>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SearchContainer>
    
      <FiltersGrid>
        <FilterGroup>
          <h3>Status</h3>
          <CheckboxGroup>
            {statuses.map(status => (
              <Checkbox key={status.value}>
                <input
                  type="checkbox"
                  checked={(filters.status || []).includes(status.value)}
                  onChange={() => handleFilterChange('status', status.value)}
                />
                {status.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Priority</h3>
          <CheckboxGroup>
            {priorities.map(priority => (
              <Checkbox key={priority.value}>
                <input
                  type="checkbox"
                  checked={(filters.priority || []).includes(priority.value)}
                  onChange={() => handleFilterChange('priority', priority.value)}
                />
                {priority.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Assignee</h3>
          <CheckboxGroup>
            {users?.map(user => (
              <Checkbox key={user._id}>
                <input
                  type="checkbox"
                  checked={(filters.assignedTo || []).includes(user._id)}
                  onChange={() => handleFilterChange('assignedTo', user._id)}
                />
                {user.name}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Template</h3>
          <CheckboxGroup>
            {levels?.results?.map(level => (
              <Checkbox key={level._id}>
                <input
                  type="checkbox"
                  checked={(filters.inspectionLevel || []).includes(level._id)}
                  onChange={() => handleFilterChange('inspectionLevel', level._id)}
                />
                {level.name}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      </FiltersGrid>

      {hasActiveFilters() && (
        <ActiveFilters>
          {filters.search && (
            <FilterTag>
              Search: {filters.search}
              <button onClick={() => {
                setSearchTerm('');
                dispatch(setFilters({ search: '' }));
                onFilterChange();
              }}>
                <X size={12} />
              </button>
            </FilterTag>
          )}
          
          {Object.entries(filters).map(([category, values]) => {
            if (category === 'search' || !Array.isArray(values)) return null;
            
            return values.map(value => (
              <FilterTag key={`${category}-${value}`}>
                {getFilterLabel(category, value)}
                <button onClick={() => removeFilter(category, value)}>
                  <X size={12} />
                </button>
              </FilterTag>
            ));
          })}
        </ActiveFilters>
      )}
    </FiltersContainer>
  );
};

export default CalendarFilters;