import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';

const FiltersContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 24px;
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 150px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-dark);
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-navy);
  background-color: white;
  width: 100%;
  &:focus {
    outline: none;
    border-color: var(--color-navy);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: var(--color-navy);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  white-space: nowrap;
  
  &:hover {
    background-color: var(--color-navy-dark);
  }

  &.secondary {
    background-color: transparent;
    border: 1px solid var(--color-gray-light);
    color: var(--color-gray-dark);
    
    &:hover {
      background-color: var(--color-offwhite);
      color: var(--color-navy);
    }
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const DatePickerWrapper = styled.div`
  width: 100%;
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--color-gray-light);
    border-radius: 8px;
    font-size: 14px;
    color: var(--color-navy);
  }
`;

const DashboardFilters = ({ onFilterChange }) => {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState([]);
    const [assets, setAssets] = useState([]);
    const [inspectors, setInspectors] = useState([]);

    const [filters, setFilters] = useState({
        templateId: '',
        assetId: '',
        inspectorId: '',
        startDate: null,
        endDate: null
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [templatesRes, assetsRes, usersRes] = await Promise.all([
                    api.get('/inspection?limit=1000&status=active'),
                    api.get('/assets?limit=1000'),
                    api.get('/users')
                ]);

                console.log('Templates API response:', templatesRes.data);
                console.log('Assets API response:', assetsRes.data);
                console.log('Users API response:', usersRes.data);

                // Handle templates - the API returns { results: [...], page, limit, totalPages, totalResults }
                if (templatesRes.data.results) {
                    const publishedTemplates = templatesRes.data.results.filter(t => t.status === 'active');
                    setTemplates(publishedTemplates);
                    console.log('Published templates:', publishedTemplates);
                } else if (templatesRes.data.success && templatesRes.data.data) {
                    const publishedTemplates = templatesRes.data.data.filter(t => t.status === 'active');
                    setTemplates(publishedTemplates);
                    console.log('Published templates:', publishedTemplates);
                }

                // Handle assets
                if (assetsRes.data.results) {
                    setAssets(assetsRes.data.results || []);
                    console.log('Assets from results:', assetsRes.data.results);
                } else if (assetsRes.data.success && assetsRes.data.data) {
                    setAssets(assetsRes.data.data || []);
                    console.log('Assets from data:', assetsRes.data.data);
                }

                // Handle users - ONLY inspectors (not admins)
                if (usersRes.data.success) {
                    const allUsers = usersRes.data.data || [];
                    // Filter for ONLY inspectors
                    const inspectorUsers = allUsers.filter(u => u.role === 'inspector');
                    setInspectors(inspectorUsers);
                    console.log('Inspectors only:', inspectorUsers);
                }

            } catch (error) {
                console.error("Error fetching filter options:", error);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onFilterChange(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            templateId: '',
            assetId: '',
            inspectorId: '',
            startDate: null,
            endDate: null
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <FiltersContainer>
            <FiltersRow>
                <FilterGroup>
                    <Label>{t('dashboard.template')}</Label>
                    <Select
                        value={filters.templateId}
                        onChange={(e) => handleChange('templateId', e.target.value)}
                    >
                        <option value="">{t('dashboard.allTemplates')}</option>
                        {templates.map(template => (
                            <option key={template._id || template.id} value={template._id || template.id}>{template.name}</option>
                        ))}
                    </Select>
                </FilterGroup>

                <FilterGroup>
                    <Label>{t('dashboard.asset')}</Label>
                    <Select
                        value={filters.assetId}
                        onChange={(e) => handleChange('assetId', e.target.value)}
                    >
                        <option value="">{t('dashboard.allAssets')}</option>
                        {assets.map(asset => (
                            <option key={asset._id || asset.id} value={asset._id || asset.id}>{asset.displayName}</option>
                        ))}
                    </Select>
                </FilterGroup>

                <FilterGroup>
                    <Label>{t('dashboard.inspector')}</Label>
                    <Select
                        value={filters.inspectorId}
                        onChange={(e) => handleChange('inspectorId', e.target.value)}
                    >
                        <option value="">{t('dashboard.allInspectors')}</option>
                        {inspectors.map(inspector => (
                            <option key={inspector._id || inspector.id} value={inspector._id || inspector.id}>{inspector.name}</option>
                        ))}
                    </Select>
                </FilterGroup>

                <FilterGroup>
                    <Label>{t('common.dateRange')}</Label>
                    <DatePickerWrapper>
                        <DatePicker
                            selectsRange={true}
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            onChange={(update) => {
                                const [start, end] = update;
                                setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
                            }}
                            placeholderText={t('common.selectDateRange')}
                            isClearable={true}
                        />
                    </DatePickerWrapper>
                </FilterGroup>

                <ButtonGroup>
                    <Button onClick={handleApply}>
                        <Filter size={18} />
                        {t('common.apply')}
                    </Button>
                    <Button className="secondary" onClick={handleReset}>
                        <X size={18} />
                        {t('common.reset')}
                    </Button>
                </ButtonGroup>
            </FiltersRow>
        </FiltersContainer>
    );
};

export default DashboardFilters;
