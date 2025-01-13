import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const FilterGroup = styled.div`
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #666;

    input {
      width: 16px;
      height: 16px;
    }
  }
`;

const TaskFilter = ({ filters, setFilters }) => {
  const filterOptions = {
    status: ['Pending', 'In Progress', 'Completed', 'Under Review'],
    priority: ['Low', 'Medium', 'High', 'Urgent'],
    type: ['Safety Inspection', 'Equipment Check', 'Documentation Review', 'Training'],
    assignee: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams']
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  return (
    <FilterContainer>
      {Object.entries(filterOptions).map(([category, options]) => (
        <FilterGroup key={category}>
          <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
          <CheckboxGroup>
            {options.map(option => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={filters[category].includes(option)}
                  onChange={() => handleFilterChange(category, option)}
                />
                {option}
              </label>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      ))}
    </FilterContainer>
  );
};

export default TaskFilter;