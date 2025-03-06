// src/pages/calendar/components/CalendarFilters.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { eventTypes, eventStatuses, assignees } from '../mockData';

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
    color: #1a237e;
    margin-bottom: 12px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
    color: #1a237e;
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
  color: #1a237e;

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

const CalendarFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    types: [],
    statuses: [],
    assignees: []
  });

  const handleFilterChange = (category, value) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category].includes(value)
        ? filters[category].filter(item => item !== value)
        : [...filters[category], value]
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const removeFilter = (category, value) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category].filter(item => item !== value)
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <FiltersContainer>
      <FiltersGrid>
        <FilterGroup>
          <h3>Event Type</h3>
          <CheckboxGroup>
            {eventTypes.map(type => (
              <Checkbox key={type.value}>
                <input
                  type="checkbox"
                  checked={filters.types.includes(type.value)}
                  onChange={() => handleFilterChange('types', type.value)}
                />
                {type.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Status</h3>
          <CheckboxGroup>
            {eventStatuses.map(status => (
              <Checkbox key={status.value}>
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(status.value)}
                  onChange={() => handleFilterChange('statuses', status.value)}
                />
                {status.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Assignee</h3>
          <CheckboxGroup>
            {assignees.map(assignee => (
              <Checkbox key={assignee.value}>
                <input
                  type="checkbox"
                  checked={filters.assignees.includes(assignee.value)}
                  onChange={() => handleFilterChange('assignees', assignee.value)}
                />
                {assignee.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      </FiltersGrid>

      {Object.entries(filters).some(([_, values]) => values.length > 0) && (
        <ActiveFilters>
          {Object.entries(filters).map(([category, values]) =>
            values.map(value => (
              <FilterTag key={`${category}-${value}`}>
                {value}
                <button onClick={() => removeFilter(category, value)}>
                  <X size={12} />
                </button>
              </FilterTag>
            ))
          )}
        </ActiveFilters>
      )}
    </FiltersContainer>
  );
};

export default CalendarFilters;