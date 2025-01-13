import React from 'react';
import styled from 'styled-components';
import { X, Check } from 'lucide-react';

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
  gap: 24px;
`;

const FilterGroup = styled.div``;

const FilterTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 12px;
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
  border: 2px solid ${props => props.checked ? '#1a237e' : '#e2e8f0'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.checked ? '#1a237e' : 'white'};
  transition: all 0.2s;
`;

const CheckboxLabel = styled.span`
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
      background: #f8fafc;
    }
  `}
`;

const filterOptions = {
  regions: [
    'North Beach',
    'South Marina',
    'East Coast',
    'West Harbor',
    'Central Bay'
  ],
  inspectionTypes: [
    'Safety Inspection',
    'Equipment Check',
    'Documentation Review',
    'Training Verification',
    'Environmental Audit'
  ],
  status: [
    'Completed',
    'In Progress',
    'Pending',
    'Overdue',
    'Cancelled'
  ],
  priority: [
    'Critical',
    'High',
    'Medium',
    'Low'
  ]
};

const ReportFilters = ({ filters, onFilterChange }) => {
  const handleCheckboxChange = (category, value) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category]?.includes(value)
        ? filters[category].filter(item => item !== value)
        : [...filters[category], value]
    };
    onFilterChange(updatedFilters);
  };

  const handleRemoveFilter = (category, value) => {
    const updatedFilters = {
      ...filters,
      [category]: filters[category].filter(item => item !== value)
    };
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => ({
      ...acc,
      [key]: []
    }), {});
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <FiltersContainer>
      <FiltersGrid>
        <FilterGroup>
          <FilterTitle>Region</FilterTitle>
          <CheckboxGroup>
            {filterOptions.regions.map(region => (
              <Checkbox key={region}>
                <input
                  type="checkbox"
                  checked={filters.regions?.includes(region)}
                  onChange={() => handleCheckboxChange('regions', region)}
                />
                <CustomCheckbox checked={filters?.regions?.includes(region)}>
                  {filters?.regions?.includes(region) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxLabel>{region}</CheckboxLabel>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <FilterTitle>Inspection Type</FilterTitle>
          <CheckboxGroup>
            {filterOptions.inspectionTypes.map(type => (
              <Checkbox key={type}>
                <input
                  type="checkbox"
                  checked={filters?.inspectionTypes?.includes(type)}
                  onChange={() => handleCheckboxChange('inspectionTypes', type)}
                />
                <CustomCheckbox checked={filters.inspectionTypes?.includes(type)}>
                  {filters.inspectionTypes?.includes(type) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxLabel>{type}</CheckboxLabel>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <FilterTitle>Status</FilterTitle>
          <CheckboxGroup>
            {filterOptions.status.map(status => (
              <Checkbox key={status}>
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status)}
                  onChange={() => handleCheckboxChange('status', status)}
                />
                <CustomCheckbox checked={filters.status?.includes(status)}>
                  {filters.status?.includes(status) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxLabel>{status}</CheckboxLabel>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <FilterTitle>Priority</FilterTitle>
          <CheckboxGroup>
            {filterOptions.priority.map(priority => (
              <Checkbox key={priority}>
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(priority)}
                  onChange={() => handleCheckboxChange('priority', priority)}
                />
                <CustomCheckbox checked={filters.priority?.includes(priority)}>
                  {filters.priority?.includes(priority) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxLabel>{priority}</CheckboxLabel>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      </FiltersGrid>

      {hasActiveFilters && (
        <ActiveFilters>
          {Object.entries(filters).map(([category, values]) =>
            values.map(value => (
              <FilterTag key={`${category}-${value}`}>
                {value}
                <button onClick={() => handleRemoveFilter(category, value)}>
                  <X size={12} />
                </button>
              </FilterTag>
            ))
          )}
        </ActiveFilters>
      )}

      <FilterActions>
        {hasActiveFilters && (
          <Button onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
        <Button variant="primary">
          Apply Filters
        </Button>
      </FilterActions>
    </FiltersContainer>
  );
};

export default ReportFilters;