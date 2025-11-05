// src/pages/calendar/components/CalendarFilters.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react';
import { setFilters } from '../../../store/slices/taskSlice';

const FiltersContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 8px;
  }
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FilterGroup = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 12px;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 13px;
      margin-bottom: 10px;
    }

    @media (max-width: 480px) {
      font-size: 13px;
      margin-bottom: 8px;
    }
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 10px;
    max-height: 180px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    max-height: 160px;
  }
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 4px 0;

  @media (max-width: 768px) {
    font-size: 15px;
    gap: 10px;
    padding: 6px 0;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    gap: 10px;
    padding: 6px 0;
  }

  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-top: 12px;
    padding-top: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    margin-top: 10px;
    padding-top: 10px;
    gap: 6px;
  }
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 13px;
    gap: 8px;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 12px;
    gap: 6px;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    padding: 2px;
    cursor: pointer;
    color: #64748b;
    flex-shrink: 0;

    @media (max-width: 480px) {
      padding: 4px;
    }

    &:hover {
      color: #ef4444;
    }

    svg {
      @media (max-width: 480px) {
        width: 14px;
        height: 14px;
      }
    }
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;
    box-sizing: border-box;

    @media (max-width: 768px) {
      padding: 10px 14px 10px 38px;
      font-size: 13px;
    }

    @media (max-width: 480px) {
      padding: 10px 12px 10px 36px;
      font-size: 13px;
    }

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

    @media (max-width: 768px) {
      left: 10px;
      width: 18px;
      height: 18px;
    }

    @media (max-width: 480px) {
      left: 10px;
      width: 16px;
      height: 16px;
    }
  }
`;

const CalendarFilters = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users || { users: [] });

  const priorities = [
    { value: 'low', label: t('tasks.lowPriority') },
    { value: 'medium', label: t('tasks.mediumPriority') },
    { value: 'high', label: t('tasks.highPriority') },
    { value: 'urgent', label: t('tasks.urgentPriority') }
  ];

  const statuses = [
    { value: 'pending', label: t('tasks.pending') },
    { value: 'in_progress', label: t('tasks.inProgress') },
    { value: 'completed', label: t('tasks.completed') },
    { value: 'cancelled', label: t('tasks.cancelled') }
  ];
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
      return users.find(u => u._id === value || u.id === value)?.name || value;
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
          placeholder={t('searchEvents')}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SearchContainer>
    
      <FiltersGrid>
        <FilterGroup>
          <h3>{t('common.status')}</h3>
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
          <h3>{t('common.priority')}</h3>
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
          <h3>{t('assigneeInspector')}</h3>
          <CheckboxGroup>
            {users?.map(user => (
              <Checkbox key={user._id || user.id}>
                <input
                  type="checkbox"
                  checked={(filters.assignedTo || []).includes(user._id || user.id)}
                  onChange={() => handleFilterChange('assignedTo', user._id || user.id)}
                />
                {user.name}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </FilterGroup>

        <FilterGroup>
          <h3>{t('common.template')}</h3>
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
              {t('common.search')}: {filters.search}
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