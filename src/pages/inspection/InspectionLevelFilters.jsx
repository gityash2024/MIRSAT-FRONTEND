// src/pages/inspection/components/InspectionLevelFilters.jsx
import React from 'react';
import styled from 'styled-components';
import { X, Check } from 'lucide-react';

// Updated styled components to use $ prefix for props
const FilterContainer = styled.div`
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
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  input {
    display: none;
  }
`;

const CustomCheckbox = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.$checked ? '#1a237e' : '#e2e8f0'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$checked ? '#1a237e' : 'white'};
  transition: all 0.2s;
`;

const CheckboxText = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  color: #1a237e;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: none;
    background: none;
    cursor: pointer;
    color: #64748b;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: #e2e8f0;
      color: #dc2626;
    }
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
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
      background: #f8fafc;
    }
  `}
`;

const filterOptions = {
  type: [
    { value: 'safety', label: 'Safety' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'operational', label: 'Operational' },
    { value: 'quality', label: 'Quality' }
  ],
  status: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ],
  priority: [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ],
  completionStatus: [
    { value: 'completed', label: 'Completed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'overdue', label: 'Overdue' }
  ]
};

const InspectionLevelFilters = ({ filters = {}, onFilterChange, onClose }) => {
  const handleFilterChange = (category, value) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category]?.includes(value)
        ? filters[category].filter(item => item !== value)
        : [...(filters[category] || []), value]
    };
    onFilterChange(updatedFilters);
  };

  const removeFilter = (category, value) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category]?.filter(item => item !== value) || []
    };
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filterOptions).reduce((acc, key) => ({
      ...acc,
      [key]: []
    }), {});
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters || {}).some(arr => arr?.length > 0);

  return (
    <div>
      <FilterContainer>
        {Object.entries(filterOptions).map(([category, options]) => (
          <FilterGroup key={category}>
            <h3>{category.replace(/([A-Z])/g, ' $1').split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}</h3>
            <CheckboxGroup>
              {options.map(option => (
                <CheckboxLabel key={option.value}>
                  <input
                    type="checkbox"
                    checked={filters[category]?.includes(option.value) || false}
                    onChange={() => handleFilterChange(category, option.value)}
                  />
                  <CustomCheckbox $checked={filters[category]?.includes(option.value)}>
                    {filters[category]?.includes(option.value) && (
                      <Check size={12} color="white" />
                    )}
                  </CustomCheckbox>
                  <CheckboxText>{option.label}</CheckboxText>
                </CheckboxLabel>
              ))}
            </CheckboxGroup>
          </FilterGroup>
        ))}
      </FilterContainer>

      {hasActiveFilters && (
        <ActiveFilters>
          {Object.entries(filters).map(([category, values]) =>
            values?.map(value => {
              const option = filterOptions[category]?.find(opt => opt.value === value);
              return option && (
                <FilterTag key={`${category}-${value}`}>
                  {option.label}
                  <button onClick={() => removeFilter(category, value)}>
                    <X size={12} />
                  </button>
                </FilterTag>
              );
            })
          )}
        </ActiveFilters>
      )}

      <FilterActions>
        {hasActiveFilters && (
          <Button onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
        <Button $variant="primary" onClick={onClose}>
          Apply Filters
        </Button>
      </FilterActions>
    </div>
  );
};

export default InspectionLevelFilters;