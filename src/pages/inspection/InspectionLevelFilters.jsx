import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Check, Tag, ToggleLeft, Flag, Filter, ArrowRight, RefreshCw } from 'lucide-react';

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 28px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  
  h2 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const FilterBody = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
`;

const FilterGroup = styled.div`
  border-radius: 8px;
  background: #fafbff;
  padding: 16px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-navy);
    margin-top: 0;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      background: #e8eaf6;
      padding: 4px;
      border-radius: 6px;
      color: var(--color-navy);
    }
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
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background: #f1f5f9;
  }

  input {
    display: none;
  }
`;

const CustomCheckbox = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.$checked ? 'var(--color-navy)' : '#d4d4d8'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$checked ? 'var(--color-navy)' : 'white'};
  transition: all 0.2s;
  flex-shrink: 0;
  
  ${props => props.$checked && `
    box-shadow: 0 1px 3px rgba(26, 35, 126, 0.3);
  `}
`;

const CheckboxText = styled.span`
  font-size: 14px;
  color: ${props => props.$checked ? 'var(--color-navy)' : '#64748b'};
  font-weight: ${props => props.$checked ? '500' : '400'};
  transition: all 0.2s;
`;

const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
  width: 100%;
`;

const ActiveFiltersSection = styled.div`
  margin-top: 20px;
`;

const ActiveFiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  button {
    background: none;
    border: none;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: all 0.2s;
    
    &:hover {
      background: #f1f5f9;
      color: #dc2626;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #e8eaf6;
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-navy);
  border: 1px solid #c5cae9;
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border: none;
    background: white;
    cursor: pointer;
    color: #64748b;
    border-radius: 50%;
    transition: all 0.2s;
    width: 16px;
    height: 16px;
    margin-left: 2px;

    &:hover {
      background: #dc2626;
      color: white;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
      box-shadow: 0 4px 6px rgba(26, 35, 126, 0.2);
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid #c5cae9;

    &:hover {
      background: #f8fafc;
      border-color: var(--color-navy);
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background: ${props => 
    props.category === 'type' ? '#e8f5e9' : 
    props.category === 'status' ? '#e3f2fd' : 
    '#fff3e0'};
  color: ${props => 
    props.category === 'type' ? '#2e7d32' : 
    props.category === 'status' ? '#1565c0' : 
    '#ed6c02'};
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  margin-right: 6px;
`;

const filterOptions = {
  type: [
    { value: 'marina_operator', label: 'Marina Operator' },
    { value: 'yacht_chartering', label: 'Yacht Chartering' },
    { value: 'tourism_agent', label: 'Tourism Agent' }
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
  ]
};

const filterIcons = {
  type: <Tag size={16} />,
  status: <ToggleLeft size={16} />,
  priority: <Flag size={16} />
};

const categoryLabels = {
  type: 'Type',
  status: 'Status',
  priority: 'Priority'
};

const InspectionLevelFilters = ({ filters, onFilterChange, onClose, loading }) => {
  // Use local state to track changes before applying
  const [localFilters, setLocalFilters] = useState({ ...filters });
  // Use ref to track if this is the first render
  const initialRenderRef = useRef(true);
  // Ref for the apply changes timeout
  const applyTimeoutRef = useRef(null);

  // Initialize local filters when props change, but only on first render
  useEffect(() => {
    if (initialRenderRef.current) {
      setLocalFilters({ ...filters });
      initialRenderRef.current = false;
    }
    
    // Cleanup function
    return () => {
      if (applyTimeoutRef.current) {
        clearTimeout(applyTimeoutRef.current);
      }
    };
  }, [filters]);

  const handleCheckboxChange = (filterType, value) => {
    setLocalFilters(prev => {
      const updatedFilters = { ...prev };
      
      if (updatedFilters[filterType].includes(value)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(item => item !== value);
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], value];
      }
      
      return updatedFilters;
    });
  };

  const handleApply = () => {
    // Clear any existing timeout
    if (applyTimeoutRef.current) {
      clearTimeout(applyTimeoutRef.current);
    }
    
    // Apply the changes with a slight delay to prevent rapid successive calls
    applyTimeoutRef.current = setTimeout(() => {
      onFilterChange(localFilters);
      onClose();
    }, 100);
  };

  const handleClear = () => {
    const emptyFilters = {
      type: [],
      status: [],
      priority: []
    };
    setLocalFilters(emptyFilters);
    
    // Clear any existing timeout
    if (applyTimeoutRef.current) {
      clearTimeout(applyTimeoutRef.current);
    }
    
    // Apply the cleared filters with a slight delay
    applyTimeoutRef.current = setTimeout(() => {
      onFilterChange(emptyFilters);
    }, 100);
  };

  const hasActiveFilters = Object.values(localFilters || {}).some(arr => arr?.length > 0);
  const activeFilterCount = Object.values(localFilters || {}).flat().length;

  return (
    <FilterContainer>
      <FilterHeader>
        <h2>
          <Filter size={18} />
          Filter Template
        </h2>
        {activeFilterCount > 0 && (
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} applied
          </span>
        )}
      </FilterHeader>
      
      <FilterBody>
        {Object.entries(filterOptions).map(([category, options]) => (
          <FilterGroup key={category}>
            <h3>
              {filterIcons[category]}
              {categoryLabels[category]}
            </h3>
            <CheckboxGroup>
              {options.map(option => {
                const isChecked = localFilters[category]?.includes(option.value) || false;
                return (
                  <CheckboxLabel key={option.value}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(category, option.value)}
                      disabled={loading}
                    />
                    <CustomCheckbox $checked={isChecked}>
                      {isChecked && (
                        <Check size={12} color="white" />
                      )}
                    </CustomCheckbox>
                    <CheckboxText $checked={isChecked}>{option.label}</CheckboxText>
                  </CheckboxLabel>
                );
              })}
            </CheckboxGroup>
          </FilterGroup>
        ))}
      </FilterBody>

      {hasActiveFilters && (
        <ActiveFiltersSection>
          <Divider />
          <ActiveFiltersHeader>
            <h4>
              <ArrowRight size={14} />
              Active Filters
            </h4>
            <button 
              onClick={handleClear}
              disabled={loading}
            >
              <RefreshCw size={12} />
              Clear All
            </button>
          </ActiveFiltersHeader>
          <ActiveFilters>
            {Object.entries(localFilters).map(([category, values]) =>
              values?.map(value => {
                const option = filterOptions[category]?.find(opt => opt.value === value);
                return option && (
                  <FilterTag key={`${category}-${value}`}>
                    <CategoryBadge category={category}>
                      {category}
                    </CategoryBadge>
                    {option.label}
                    <button 
                      onClick={() => handleCheckboxChange(category, value)}
                      disabled={loading}
                    >
                      <X size={10} />
                    </button>
                  </FilterTag>
                );
              })
            )}
          </ActiveFilters>
        </ActiveFiltersSection>
      )}

      <FilterActions>
        <Button 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          $variant="primary" 
          onClick={handleApply}
          disabled={loading}
        >
          Apply Filters
        </Button>
      </FilterActions>
    </FilterContainer>
  );
};

export default InspectionLevelFilters;