import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const FilterGroup = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 13px;
      margin-bottom: 10px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
      margin-bottom: 10px;
    }
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    gap: 10px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;

    @media (max-width: 768px) {
      font-size: 15px;
      gap: 10px;
    }

    @media (max-width: 480px) {
      font-size: 15px;
      gap: 10px;
      padding: 4px 0;
    }

    input {
      width: 16px;
      height: 16px;
      cursor: pointer;
      flex-shrink: 0;

      @media (max-width: 480px) {
        width: 18px;
        height: 18px;
      }
    }
  }
`;

const UserFilter = ({ filters, setFilters }) => {
  const { t } = useTranslation();
  const filterOptions = {
    role: [
      { value: 'admin', label: t('common.admin') },
      { value: 'manager', label: t('common.manager') },
      { value: 'supervisor', label: t('common.supervisor') },
      { value: 'inspector', label: t('common.inspector') }
    ],
    status: [
      { value: 'Active', label: t('common.active') },
      { value: 'Inactive', label: t('common.inactive') }
    ],
    // department: [
    //   { value: 'field_operations', label: 'Field Operations' },
    //   { value: 'operations_management', label: 'Operations Management' },
    //   { value: 'administration', label: 'Administration' },
    //   { value: 'support', label: 'Support' }
    // ]
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
          <h3>{t(`common.${category}`)}</h3>
          <CheckboxGroup>
            {options.map(option => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  checked={filters[category].includes(option.value)}
                  onChange={() => handleFilterChange(category, option.value)}
                />
                {option.label}
              </label>
            ))}
          </CheckboxGroup>
        </FilterGroup>
      ))}
    </FilterContainer>
  );
};

export default UserFilter;