import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { X, Check } from 'lucide-react';
import { filterOptions } from '../../../constants/taskFilterOptions';
import { fetchAssets } from '../../../store/slices/assetSlice';
import { useEffect } from 'react';

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

const TaskFilter = React.memo(({ filters, setFilters }) => {
  const dispatch = useDispatch();
  const inspectionLevels = useSelector(state => state.inspectionLevels?.levels?.results) || [];
  const users = useSelector(state => state.users.users) || [];
  const assets = useSelector(state => state.assets?.assets) || [];

  // Ensure all filter properties are arrays
  useEffect(() => {
    const filterKeys = ['status', 'priority', 'assignedTo', 'inspectionLevel', 'asset'];
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
  }, []);

  // Fetch assets if not available
  useEffect(() => {
    if (assets?.length === 0) {
      dispatch(fetchAssets());
    }
  }, [dispatch, assets?.length]);

  const inspectionLevelOptions = inspectionLevels?.map(level => ({
    value: level._id,
    label: level.name
  }));

  const userOptions = users?.map(user => ({
    value: user._id,
    label: user.name
  }));

  const assetOptions = assets?.map(asset => ({
    value: asset._id,
    label: `${asset.displayName} (${asset.uniqueId})`
  }));

  const handleFilterChange = (category, value) => {
    const currentFilters = Array.isArray(filters[category]) ? filters[category] : [];
    const updatedFilters = {
      ...filters,
      [category]: currentFilters.includes(value)
        ? currentFilters.filter(item => item !== value)
        : [...currentFilters, value]
    };
    setFilters(updatedFilters);
  };

  const removeFilter = (category, value) => {
    const currentFilters = Array.isArray(filters[category]) ? filters[category] : [];
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
    const options = 
      category === 'inspectionLevel' ? inspectionLevelOptions 
      : category === 'assignedTo' ? userOptions
      : category === 'asset' ? assetOptions
      : filterOptions[category];
    return options?.find(opt => opt.value === value)?.label || value;
  };

  const hasActiveFilters = Object.values(filters).some(val => 
    Array.isArray(val) && val.length > 0
  );

  return (
    <div>
      <FilterContainer>
        {Object.entries(filterOptions)?.map(([category, options]) => (
          <FilterGroup key={category}>
            <h3>{category.replace(/([A-Z])/g, ' $1').split('_')?.map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}</h3>
            <CheckboxGroup>
              {options?.map(option => (
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

        <FilterGroup>
          <h3>Inspection Level</h3>
          <CheckboxGroup>
            {inspectionLevelOptions?.map(option => (
              <CheckboxLabel key={option.value}>
                <input
                  type="checkbox"
                  checked={filters.inspectionLevel?.includes(option.value) || false}
                  onChange={() => handleFilterChange('inspectionLevel', option.value)}
                />
                <CustomCheckbox $checked={filters.inspectionLevel?.includes(option.value)}>
                  {filters.inspectionLevel?.includes(option.value) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxText>{option.label}</CheckboxText>
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>Assigned To</h3>
          <CheckboxGroup>
            {userOptions?.map(option => (
              <CheckboxLabel key={option.value}>
                <input
                  type="checkbox"
                  checked={filters.assignedTo?.includes(option.value) || false}
                  onChange={() => handleFilterChange('assignedTo', option.value)}
                />
                <CustomCheckbox $checked={filters.assignedTo?.includes(option.value)}>
                  {filters.assignedTo?.includes(option.value) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxText>{option.label}</CheckboxText>
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FilterGroup>
        
        <FilterGroup>
          <h3>Asset</h3>
          <CheckboxGroup>
            {assetOptions?.map(option => (
              <CheckboxLabel key={option.value}>
                <input
                  type="checkbox"
                  checked={filters.asset?.includes(option.value) || false}
                  onChange={() => handleFilterChange('asset', option.value)}
                />
                <CustomCheckbox $checked={filters.asset?.includes(option.value)}>
                  {filters.asset?.includes(option.value) && (
                    <Check size={12} color="white" />
                  )}
                </CustomCheckbox>
                <CheckboxText>{option.label}</CheckboxText>
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      </FilterContainer>

      {hasActiveFilters && (
        <ActiveFilters>
          {Object.entries(filters)?.map(([category, values]) =>
            Array.isArray(values) ? values.map(value => (
              <FilterTag key={`${category}-${value}`}>
                {getFilterLabel(category, value)}
                <button onClick={() => removeFilter(category, value)}>
                  <X size={12} />
                </button>
              </FilterTag>
            )) : null
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