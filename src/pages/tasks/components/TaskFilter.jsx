import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { X, Check, Filter, AlertCircle } from 'lucide-react';
import { filterOptions } from '../../../constants/taskFilterOptions';

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const FilterGroup = styled.div`
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  background: ${props => props.$checked ? 'var(--color-skyblue-light)' : 'white'};
  border: 1px solid ${props => props.$checked ? 'var(--color-skyblue)' : '#e2e8f0'};

  &:hover {
    background: var(--color-skyblue-light);
    border-color: var(--color-skyblue);
  }

  input {
    display: none;
  }
`;

const CustomCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.$checked ? 'var(--color-navy)' : '#e2e8f0'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$checked ? 'var(--color-navy)' : 'white'};
  transition: all 0.2s;
`;

const CheckboxText = styled.span`
  font-size: 14px;
  color: var(--color-gray-dark);
  font-weight: ${props => props.$checked ? '500' : 'normal'};
`;

const StatusOption = styled(CheckboxLabel)`
  border-left: 4px solid 
    ${props => {
      if (props.value === 'pending') return 'var(--color-warning)';
      if (props.value === 'in_progress') return 'var(--color-info)';
      if (props.value === 'completed') return 'var(--color-success)';
      if (props.value === 'incomplete') return 'var(--color-error)';
      if (props.value === 'partially_completed') return 'var(--color-warning-dark)';
      return '#e2e8f0';
    }};
`;

const PriorityOption = styled(CheckboxLabel)`
  border-left: 4px solid 
    ${props => {
      if (props.value === 'low') return 'var(--color-success)';
      if (props.value === 'medium') return 'var(--color-warning)';
      if (props.value === 'high') return 'var(--color-error)';
      return '#e2e8f0';
    }};
`;

const PriorityIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: ${props => {
    if (props.priority === 'low') return 'var(--color-success-light)';
    if (props.priority === 'medium') return 'var(--color-warning-light)';
    if (props.priority === 'high') return 'var(--color-error-light)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.priority === 'low') return 'var(--color-success)';
    if (props.priority === 'medium') return 'var(--color-warning)';
    if (props.priority === 'high') return 'var(--color-error)';
    return 'currentColor';
  }};
`;

const StatusIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background-color: ${props => {
    if (props.status === 'pending') return 'var(--color-warning)';
    if (props.status === 'in_progress') return 'var(--color-info)';
    if (props.status === 'completed') return 'var(--color-success)';
    if (props.status === 'incomplete') return 'var(--color-error)';
    if (props.status === 'partially_completed') return 'var(--color-warning-dark)';
    return '#e2e8f0';
  }};
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
  padding: 6px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-navy);
  font-weight: 500;

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
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

    &:hover {
      background: #f8fafc;
    }
  `}
`;

const FilterHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterDescription = styled.p`
  color: var(--color-gray-medium);
  font-size: 14px;
  margin-bottom: 20px;
`;

const TaskFilter = React.memo(({ filters, setFilters }) => {
  // Ensure all filter properties are arrays
  React.useEffect(() => {
    const filterKeys = ['status', 'priority'];
    const updatedFilters = { ...filters };
    let needsUpdate = false;

    filterKeys.forEach(key => {
      if (!Array.isArray(updatedFilters[key])) {
        updatedFilters[key] = [];
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setFilters(updatedFilters);
    }
  }, [filters, setFilters]);

  const handleFilterChange = (category, value) => {
    // Make sure we're working with an array
    const currentFilters = Array.isArray(filters[category]) ? [...filters[category]] : [];
    
    // Check if value already exists in the array
    const valueIndex = currentFilters.indexOf(value);
    
    // Toggle the value
    if (valueIndex >= 0) {
      // Remove if exists
      currentFilters.splice(valueIndex, 1);
    } else {
      // Add if doesn't exist
      currentFilters.push(value);
    }
    
    // Create a new filters object with ALL previous filters plus the updated category
    const updatedFilters = {
      ...filters,
      [category]: currentFilters
    };
    
    console.log(`Filter ${category} updated:`, currentFilters);
    
    // Call setFilters with the complete updated filters object
    setFilters(updatedFilters);
  };

  const removeFilter = (category, value) => {
    const currentFilters = Array.isArray(filters[category]) ? [...filters[category]] : [];
    const updatedFilters = {
      ...filters,
      [category]: currentFilters.filter(item => item !== value)
    };
    setFilters(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => ({
      ...acc,
      [key]: []
    }), {});
    setFilters(clearedFilters);
  };

  const getFilterLabel = (category, value) => {
    const options = filterOptions[category];
    return options?.find(opt => opt.value === value)?.label || value;
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'search' && Array.isArray(value) && value.length > 0
  );

  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'incomplete': 'Incomplete',
      'partially_completed': 'Partially Completed'
    };
    return statusLabels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const priorityLabels = {
      'low': 'Low Priority',
      'medium': 'Medium Priority',
      'high': 'High Priority'
    };
    return priorityLabels[priority] || priority;
  };

  return (
    <div>
      <FilterHeader>
        <FilterTitle>
          <Filter size={18} /> Refine Task Results
        </FilterTitle>
      </FilterHeader>
      
      <FilterDescription>
        Select options below to filter tasks by status and priority.
      </FilterDescription>

      <FilterContainer>
        <FilterGroup>
          <h3>Status</h3>
          <CheckboxGroup>
            {filterOptions.status?.map(option => (
              <StatusOption 
                key={option.value}
                $checked={filters.status?.includes(option.value)}
                value={option.value}
              >
                <input
                  type="checkbox"
                  checked={filters.status?.includes(option.value)}
                  onChange={() => handleFilterChange('status', option.value)}
                />
                <CustomCheckbox $checked={filters.status?.includes(option.value)}>
                  {filters.status?.includes(option.value) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <StatusIcon status={option.value} />
                <CheckboxText $checked={filters.status?.includes(option.value)}>
                  {getStatusLabel(option.value)}
                </CheckboxText>
              </StatusOption>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Priority</h3>
          <CheckboxGroup>
            {filterOptions.priority?.map(option => (
              <PriorityOption 
                key={option.value}
                $checked={filters.priority?.includes(option.value)}
                value={option.value}
              >
                <input
                  type="checkbox"
                  checked={filters.priority?.includes(option.value)}
                  onChange={() => handleFilterChange('priority', option.value)}
                />
                <CustomCheckbox $checked={filters.priority?.includes(option.value)}>
                  {filters.priority?.includes(option.value) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <PriorityIcon priority={option.value}>
                  {option.value === 'high' && <AlertCircle size={12} />}
                </PriorityIcon>
                <CheckboxText $checked={filters.priority?.includes(option.value)}>
                  {getPriorityLabel(option.value)}
                </CheckboxText>
              </PriorityOption>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      </FilterContainer>

      {hasActiveFilters && (
        <ActiveFilters>
          {Object.entries(filters)
            .filter(([key]) => key !== 'search' && key !== 'assignedTo' && key !== 'inspectionLevel' && key !== 'asset')
            .map(([category, values]) =>
              Array.isArray(values) ? values.map(value => {
                let label = '';
                if (category === 'status') {
                  label = getStatusLabel(value);
                } else if (category === 'priority') {
                  label = getPriorityLabel(value);
                } else {
                  label = getFilterLabel(category, value);
                }
                
                return (
                  <FilterTag key={`${category}-${value}`}>
                    {category === 'status' && <StatusIcon status={value} />}
                    {category === 'priority' && <PriorityIcon priority={value} />}
                    {label}
                    <button onClick={() => removeFilter(category, value)}>
                      <X size={12} />
                    </button>
                  </FilterTag>
                );
              }) : null
          )}
        </ActiveFilters>
      )}

      <FilterActions>
        {hasActiveFilters && (
          <Button onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
        <Button $variant="primary">
          Apply Filters
        </Button>
      </FilterActions>
    </div>
  );
});

export default TaskFilter;