import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Search, Download, RefreshCw, Loader, ChevronDown, X, User, AlertCircle } from 'lucide-react';
import TaskTable from './components/TaskTable';
import { fetchTasks, setFilters, setPagination, fetchTasksProgressData } from '../../store/slices/taskSlice';
import { fetchAllAssetsForDropdown } from '../../store/slices/assetSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { fetchAssetTypes } from '../../store/slices/assetTypeSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import { useTranslation } from 'react-i18next';
import { taskService } from '../../services/task.service';
import {
  downloadCsv,
  exportText,
  formatExportDate,
  formatPdfText,
  formatPriorityForExport,
  formatStatusForExport,
  isArabicExport,
  loadPdfArabicFont,
  localizePdfTable,
  orderForLanguage,
  orderRowsForLanguage
} from '../../utils/exportLocalization';

const PageContainer = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: nowrap;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const FilterRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1 1 auto;
  flex-wrap: wrap;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-width: 0;
    width: 100%;
  }

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;
    box-sizing: border-box;

    @media (max-width: 480px) {
      padding: 8px 14px 8px 36px;
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

    @media (max-width: 480px) {
      left: 10px;
      width: 16px;
      height: 16px;
    }
  }
`;

const FilterDropdown = styled.div`
  position: relative;
  min-width: 160px;
  max-width: 200px;
  flex: 0 0 auto;

  @media (max-width: 768px) {
    flex: 1 1 calc(50% - 6px);
    min-width: 0;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    flex: 1 1 100%;
    max-width: 100%;
  }
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }

  &:hover {
    border-color: var(--color-navy);
  }

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 250px;
  overflow-y: auto;
  display: ${props => (props.show ? 'block' : 'none')};
  min-width: 200px;
  width: max-content;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 180px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fb;
  }

  input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }

  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: ${props => props.$selected ? '500' : 'normal'};
    color: ${props => props.$selected ? 'var(--color-navy)' : 'inherit'};
  }

  ${props => props.$selected && `
    background: #f0f4ff;
    border-left: 3px solid var(--color-navy);
    margin-bottom: 2px;
  `}
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 12px;
`;

const FilterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
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

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 10px 14px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }

  ${props => props.variant === 'primary' ? `
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
      background: #f5f7fb;
    }
  `}
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const EmptyStateText = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 24px;
`;

const RefreshButton = styled(Button)`
  padding: 12px 24px;
  font-size: 16px;
`;

// New styled components for the export dropdown
const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  min-width: 160px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: ${props => (props.show ? 'block' : 'none')};
`;

const ExportDropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-gray-dark);
  
  &:hover {
    background: var(--color-offwhite);
  }
`;

const EmptyStateIcon = styled.div`
  margin-bottom: 16px;
  color: var(--color-navy);
  opacity: 0.3;
  font-size: 48px;
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
`;

const EmptyStateDescription = styled.p`
  color: var(--color-gray-medium);
  font-size: 14px;
  margin-bottom: 24px;
`;

const ActionButton = styled(Button)`
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
      background: #f5f7fb;
    }
  `}
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 60px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TaskList = () => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const { t } = useTranslation();
  const { tasks, loading, error, filters, pagination } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users || { users: [] });
  const { allAssetsForDropdown } = useSelector((state) => state.assets || { allAssetsForDropdown: [] });
  const { levels } = useSelector((state) => state.inspectionLevels || { levels: { results: [] } });
  const { assetTypes } = useSelector((state) => state.assetTypes || { assetTypes: [] });

  // Debug: Log tasks and pagination whenever they change
  useEffect(() => {
    console.log('TaskList: Tasks updated:', tasks?.map(t => ({ id: t.id, progress: t.overallProgress })));
    console.log('TaskList: Pagination data:', pagination);
  }, [tasks, pagination]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showAssetTypeDropdown, setShowAssetTypeDropdown] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  const inspectionTemplateOptions = Array.isArray(levels?.results)
    ? levels.results
    : Array.isArray(levels)
      ? levels
      : [];

  // Filter options
  const statusOptions = [
    { value: 'pending', label: t('tasks.pending') },
    { value: 'in_progress', label: t('tasks.inProgress') },
    { value: 'archived', label: t('tasks.completed') },
  ];

  const priorityOptions = [
    { value: 'low', label: t('tasks.lowPriority') },
    { value: 'medium', label: t('tasks.mediumPriority') },
    { value: 'high', label: t('tasks.highPriority') },
  ];

  useEffect(() => {
    // Initialize filters if they don't exist
    if (!filters) {
      dispatch(setFilters({
        status: [],
        priority: [],
        assignedTo: [],
        inspectionLevel: [],
        assetType: [],
        asset: [],
        search: ''
      }));
    }

    // Initialize pagination if it doesn't exist
    if (!pagination) {
      dispatch(setPagination({ page: 1, limit: 10, total: 0, pages: 0 }));
    }

    // Load necessary data for filters
    dispatch(fetchAllAssetsForDropdown());
    dispatch(fetchAssetTypes());
    dispatch(fetchUsers());
    dispatch(fetchInspectionLevels({ limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    loadTasks();
  }, [dispatch, filters, pagination?.page, pagination?.limit]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('[data-dropdown="status"]')) {
        setShowStatusDropdown(false);
      }
      if (showPriorityDropdown && !event.target.closest('[data-dropdown="priority"]')) {
        setShowPriorityDropdown(false);
      }
      if (showTemplateDropdown && !event.target.closest('[data-dropdown="template"]')) {
        setShowTemplateDropdown(false);
      }
      if (showAssetTypeDropdown && !event.target.closest('[data-dropdown="assetType"]')) {
        setShowAssetTypeDropdown(false);
      }
      if (showAssetDropdown && !event.target.closest('[data-dropdown="asset"]')) {
        setShowAssetDropdown(false);
      }
      if (showAssigneeDropdown && !event.target.closest('[data-dropdown="assignee"]')) {
        setShowAssigneeDropdown(false);
      }
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    showStatusDropdown,
    showPriorityDropdown,
    showTemplateDropdown,
    showAssetTypeDropdown,
    showAssetDropdown,
    showAssigneeDropdown,
    showExportDropdown
  ]);

const loadTasks = async () => {
    try {
      const queryParams = {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10
      };

      // Send only non-empty filters to keep query clean and avoid malformed requests
      const arrayFilterKeys = ['status', 'priority', 'assignedTo', 'inspectionLevel', 'assetType', 'asset'];
      arrayFilterKeys.forEach((key) => {
        if (Array.isArray(filters?.[key]) && filters[key].length > 0) {
          queryParams[key] = filters[key];
        }
      });

      if (typeof filters?.search === 'string' && filters.search.trim()) {
        queryParams.search = filters.search.trim();
      }

      // First fetch tasks
      const result = await dispatch(fetchTasks(queryParams));

      // If tasks were fetched successfully, fetch progress data
      if (result.type === 'tasks/fetchTasks/fulfilled' && result.payload?.data) {
        const taskIds = result.payload.data
          .map(task => task.id)
          .filter(id => id && id !== 'undefined' && typeof id === 'string' && id.length > 0);

        if (taskIds.length > 0) {
          try {
            const progressResult = await dispatch(fetchTasksProgressData(taskIds));
          } catch (error) {
            console.warn('Failed to fetch progress data:', error);
          }
        }
      }
    } catch (error) {
      console.error('TaskList: Error in loadTasks:', error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search to avoid too many requests
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setFilters({ ...filters, search: value }));
      dispatch(setPagination({ page: 1 }));
    }, 400);
  };

  const handleFilterChange = (category, value) => {
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

    // Dispatch the updated filters
    dispatch(setFilters(updatedFilters));

    // Reset pagination when filters change
    dispatch(setPagination({ page: 1 }));
  };

  const removeFilter = (category, value) => {
    const currentFilters = Array.isArray(filters[category]) ? [...filters[category]] : [];
    const updatedFilters = {
      ...filters,
      [category]: currentFilters.filter(item => item !== value)
    };
    dispatch(setFilters(updatedFilters));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      ...filters,
      status: [],
      priority: [],
      assignedTo: [],
      inspectionLevel: [],
      assetType: [],
      asset: [],
      search: ''
    };
    setSearchTerm('');
    dispatch(setFilters(clearedFilters));
    dispatch(setPagination({ page: 1 }));
  };

  const getFilterLabel = (category, value) => {
    if (category === 'status') {
      return statusOptions.find(s => s.value === value)?.label || value;
    }
    if (category === 'priority') {
      return priorityOptions.find(p => p.value === value)?.label || value;
    }
    if (category === 'assignedTo') {
      return users.find(u => u._id === value || u.id === value)?.name || value;
    }
    if (category === 'inspectionLevel') {
      return inspectionTemplateOptions.find(level => (level._id || level.id) === value)?.name || value;
    }
    if (category === 'assetType') {
      return assetTypes.find(type => (type._id || type.id || type.name) === value || type.name === value)?.name || value;
    }
    if (category === 'asset') {
      const asset = allAssetsForDropdown.find(a => (a._id || a.id) === value);
      return asset?.displayName || asset?.uniqueId || value;
    }
    return value;
  };

  const hasActiveFilters = Object.entries(filters || {}).some(([key, value]) =>
    key !== 'search' && Array.isArray(value) && value.length > 0
  );

  const hasAppliedCriteria = hasActiveFilters || !!(filters?.search && String(filters.search).trim());
  const clearAllLabel = t('common.clearAll') === 'common.clearAll' ? 'Clear All' : t('common.clearAll');

  const buildExportQueryParams = () => {
    const queryParams = {
      page: 1,
      limit: pagination?.total || 10000
    };

    const arrayFilterKeys = ['status', 'priority', 'assignedTo', 'inspectionLevel', 'assetType', 'asset'];
    arrayFilterKeys.forEach((key) => {
      if (Array.isArray(filters?.[key]) && filters[key].length > 0) {
        queryParams[key] = filters[key];
      }
    });

    if (typeof filters?.search === 'string' && filters.search.trim()) {
      queryParams.search = filters.search.trim();
    }

    return queryParams;
  };

  const fetchAllTasksForExport = async () => {
    const response = await taskService.getTasks(buildExportQueryParams());
    const rows = Array.isArray(response?.data) ? response.data : [];

    return rows.map(task => ({
      ...task,
      id: task.id || task._id
    }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleRefresh = () => {
    loadTasks();
    toast.success(t('tasks.refreshedSuccessfully'));
  };

  // Format date for PDF export
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Export tasks to PDF
  const handleExportPDF = () => {
    setPendingExport({ format: 'pdf' });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  // Export tasks to CSV
  const handleExportCSV = () => {
    setPendingExport({ format: 'csv' });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  const handleConfirmExport = async (fileName, language = 'en') => {
    if (!pendingExport) return;

    const { format } = pendingExport;

    try {
      const data = await fetchAllTasksForExport();

      if (format === 'pdf') {
        await generatePDFExport(data, fileName, language);
      } else if (format === 'csv') {
        generateCSVExport(data, fileName, language);
      }
    } catch (error) {
      console.error('Task export failed:', error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to export tasks');
      return;
    }

    setShowDocumentModal(false);
    setPendingExport(null);
  };

  const generatePDFExport = async (tasksData, fileName, language = 'en') => {
    try {
      toast.loading('Generating PDF...');
      const L = (key) => exportText(language, key);

      // Create PDF document
      const doc = new jsPDF('landscape');
      const fontLoaded = await loadPdfArabicFont(doc);
      if (isArabicExport(language) && fontLoaded) {
        doc.setFont('NotoNaskhArabic', 'normal');
      }

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(26, 35, 126); // Navy color
      doc.text(formatPdfText(L('taskReport'), language), isArabicExport(language) ? doc.internal.pageSize.width - 14 : 14, 22, { align: isArabicExport(language) ? 'right' : 'left' });

      // Add subtitle with date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(formatPdfText(`${L('generatedOn')} ${isArabicExport(language) ? formatExportDate(new Date(), language, { includeTime: true }) : format(new Date(), 'MMM d, yyyy, h:mm a')}`, language), isArabicExport(language) ? doc.internal.pageSize.width - 14 : 14, 30, { align: isArabicExport(language) ? 'right' : 'left' });

      // Define table columns
      const columns = orderForLanguage([
        { header: '#', dataKey: 'index' },
        { header: formatPdfText(L('inspectionName'), language), dataKey: 'title' },
        { header: formatPdfText(L('template'), language), dataKey: 'template' },
        { header: formatPdfText(L('assignee'), language), dataKey: 'assignee' },
        { header: formatPdfText(L('priority'), language), dataKey: 'priority' },
        { header: formatPdfText(L('status'), language), dataKey: 'status' },
        { header: formatPdfText(L('dueDate'), language), dataKey: 'dueDate' },
        { header: formatPdfText(L('progress'), language), dataKey: 'progress' }
      ], language);

      // Prepare data for the table - process Arabic text
      const tableData = tasksData.map((task, index) => ({
        index: (index + 1).toString(),
        title: formatPdfText(task.title || L('untitled'), language),
        template: formatPdfText(task.inspectionLevel?.name || L('na'), language),
        assignee: formatPdfText(
          task.assignedTo && task.assignedTo.length > 0
            ? task.assignedTo[0].name || L('notSpecified')
            : L('unassigned'),
          language
        ),
        priority: formatPdfText(formatPriorityForExport(task.priority, language), language),
        status: formatPdfText(formatStatusForExport(task.status, language), language),
        dueDate: isArabicExport(language) ? formatExportDate(task.deadline, language) : formatDate(task.deadline),
        progress: `${task.overallProgress || 0}%`
      }));

      // Generate the table with Arabic font support
      doc.autoTable({
        columns: columns,
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
          font: 'helvetica' // Default font for all cells (English and mixed content)
        },
        headStyles: {
          fillColor: [26, 35, 126],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: isArabicExport(language) ? 'right' : 'center',
          font: 'helvetica' // Headers in English, use default font
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        tableWidth: 'auto',
        margin: { left: 14, right: 14 },
        didParseCell: function (data) {
          localizePdfTable(data, language, fontLoaded);
        }
      });

      // Save the PDF
      doc.save(`${fileName}.pdf`);

      toast.dismiss();
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF report');
    }
  };

  const generateCSVExport = (tasksData, fileName, language = 'en') => {
    try {
      toast.loading('Generating CSV...');
      const L = (key) => exportText(language, key);

      // Define the headers
      const headers = [L('inspectionName'), L('template'), L('assignee'), L('priority'), L('status'), L('dueDate'), L('progress')];

      // Prepare the data
      const csvData = tasksData.map(task => [
        task.title || L('untitled'),
        task.inspectionLevel?.name || L('na'),
        task.assignedTo && task.assignedTo.length > 0
          ? task.assignedTo[0].name || L('notSpecified')
          : L('unassigned'),
        formatPriorityForExport(task.priority, language),
        formatStatusForExport(task.status, language),
        isArabicExport(language) ? formatExportDate(task.deadline, language) : formatDate(task.deadline),
        `${task.overallProgress || 0}%`
      ]);

      // Add headers to the data
      csvData.unshift(headers);
      downloadCsv(orderRowsForLanguage(csvData, language), fileName, language);

      toast.dismiss();
      toast.success('CSV generated successfully');
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.dismiss();
      toast.error('Failed to generate CSV report');
    }
  };

  // Render empty state when there are no tasks
  const renderEmptyState = () => (
    <EmptyStateContainer>
      <EmptyStateIcon>
        <Plus size={48} />
      </EmptyStateIcon>
      <EmptyStateTitle>{t('tasks.noTasksFound')}</EmptyStateTitle>
      <EmptyStateDescription>
        {Object.keys(filters || {}).some(key => {
          if (key === 'search') return !!filters[key];
          return Array.isArray(filters[key]) && filters[key].length > 0;
        })
          ? t('tasks.tryChangingFilters')
          : t('tasks.getStartedByCreating')}
      </EmptyStateDescription>
      {hasPermission(PERMISSIONS.TASKS.CREATE_TASKS) && (
        <ActionButton as={Link} to="/tasks/create" $variant="primary">
          <Plus size={16} />
          {t('tasks.createTask')}
        </ActionButton>
      )}
    </EmptyStateContainer>
  );

  return (
    <PageContainer>
      <Header>
        <PageTitle>{t('navigation.tasks')}</PageTitle>
        <SubTitle>{t('tasks.createAndManage')}</SubTitle>
      </Header>

      <ActionBar>
        <FilterRow>
          <SearchBox>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t('tasks.searchPlaceholder')}
            />
          </SearchBox>

          <FilterDropdown data-dropdown="status">
            <DropdownButton onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
              {t('tasks.status')} {filters?.status?.length > 0 && `(${filters.status.length})`}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownContent show={showStatusDropdown}>
              {statusOptions.map(option => (
                <DropdownItem
                  key={option.value}
                  $selected={filters?.status?.includes(option.value) || false}
                >
                  <input
                    type="checkbox"
                    checked={filters?.status?.includes(option.value) || false}
                    onChange={() => handleFilterChange('status', option.value)}
                  />
                  <span>{option.label}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </FilterDropdown>

          <FilterDropdown data-dropdown="priority">
            <DropdownButton onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}>
              {t('tasks.priority')} {filters?.priority?.length > 0 && `(${filters.priority.length})`}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownContent show={showPriorityDropdown}>
              {priorityOptions.map(option => (
                <DropdownItem
                  key={option.value}
                  $selected={filters?.priority?.includes(option.value) || false}
                >
                  <input
                    type="checkbox"
                    checked={filters?.priority?.includes(option.value) || false}
                    onChange={() => handleFilterChange('priority', option.value)}
                  />
                  <span>{option.label}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </FilterDropdown>

          <FilterDropdown data-dropdown="template">
            <DropdownButton onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}>
              {t('common.template')} {filters?.inspectionLevel?.length > 0 && `(${filters.inspectionLevel.length})`}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownContent show={showTemplateDropdown}>
              {inspectionTemplateOptions?.map(level => (
                <DropdownItem
                  key={level._id || level.id}
                  $selected={filters?.inspectionLevel?.includes(level._id || level.id) || false}
                >
                  <input
                    type="checkbox"
                    checked={filters?.inspectionLevel?.includes(level._id || level.id) || false}
                    onChange={() => handleFilterChange('inspectionLevel', level._id || level.id)}
                  />
                  <span>{level.name}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </FilterDropdown>

          <FilterDropdown data-dropdown="assetType">
            <DropdownButton onClick={() => setShowAssetTypeDropdown(!showAssetTypeDropdown)}>
              {t('assets.assetType', { defaultValue: 'Asset Type' })} {filters?.assetType?.length > 0 && `(${filters.assetType.length})`}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownContent show={showAssetTypeDropdown}>
              {assetTypes?.map(type => {
                const typeValue = type.name || type.value || type._id || type.id;
                return (
                  <DropdownItem
                    key={type._id || type.id || type.name}
                    $selected={filters?.assetType?.includes(typeValue) || false}
                  >
                    <input
                      type="checkbox"
                      checked={filters?.assetType?.includes(typeValue) || false}
                      onChange={() => handleFilterChange('assetType', typeValue)}
                    />
                    <span>{type.name}</span>
                  </DropdownItem>
                );
              })}
            </DropdownContent>
          </FilterDropdown>

          <FilterDropdown data-dropdown="asset">
            <DropdownButton onClick={() => setShowAssetDropdown(!showAssetDropdown)}>
              {t('common.asset')} {filters?.asset?.length > 0 && `(${filters.asset.length})`}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownContent show={showAssetDropdown}>
              {allAssetsForDropdown?.map(asset => (
                <DropdownItem
                  key={asset._id || asset.id}
                  $selected={filters?.asset?.includes(asset._id || asset.id) || false}
                >
                  <input
                    type="checkbox"
                    checked={filters?.asset?.includes(asset._id || asset.id) || false}
                    onChange={() => handleFilterChange('asset', asset._id || asset.id)}
                  />
                  <span>{asset.displayName || asset.uniqueId}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </FilterDropdown>

          <FilterDropdown data-dropdown="assignee">
            <DropdownButton onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}>
              {t('tasks.assignedTo')} {filters?.assignedTo?.length > 0 && `(${filters.assignedTo.length})`}
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownContent show={showAssigneeDropdown}>
              {users?.map(user => (
                <DropdownItem
                  key={user._id || user.id}
                  $selected={filters?.assignedTo?.includes(user._id || user.id) || false}
                >
                  <input
                    type="checkbox"
                    checked={filters?.assignedTo?.includes(user._id || user.id) || false}
                    onChange={() => handleFilterChange('assignedTo', user._id || user.id)}
                  />
                  <User size={14} />
                  <span>{user.name}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </FilterDropdown>
        </FilterRow>

        <ButtonGroup>
          {hasAppliedCriteria && (
            <ActionButton onClick={clearAllFilters} title="Clear all filters">
              <X size={16} />
              {clearAllLabel}
            </ActionButton>
          )}

          <ActionButton onClick={handleRefresh} title="Refresh tasks">
            <RefreshCw size={16} />
          </ActionButton>

          <ExportDropdown className="export-dropdown">
            <ActionButton
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              title="Export tasks"
            >
              <Download size={16} />
              {t('common.export')}
            </ActionButton>
            <DropdownMenu show={showExportDropdown}>
              <ExportDropdownItem onClick={handleExportPDF}>
                <Download size={16} />
                {t('tasks.exportAsPDF')}
              </ExportDropdownItem>
              <ExportDropdownItem onClick={handleExportCSV}>
                <Download size={16} />
                {t('tasks.exportAsCSV')}
              </ExportDropdownItem>
            </DropdownMenu>
          </ExportDropdown>

          {hasPermission(PERMISSIONS.TASKS.CREATE_TASKS) && (
            <ActionButton as={Link} to="/tasks/create" $variant="primary">
              <Plus size={16} />
              {t('tasks.createTask')}
            </ActionButton>
          )}
        </ButtonGroup>
      </ActionBar>

      {hasActiveFilters && (
        <ActiveFilters>
          {Object.entries(filters || {})
            .filter(([key]) => key !== 'search')
            .map(([category, values]) =>
              Array.isArray(values) ? values.map(value => (
                <FilterTag key={`${category}-${value}`}>
                  {category === 'assignedTo' && <User size={12} />}
                  {category === 'priority' && <AlertCircle size={12} />}
                  {getFilterLabel(category, value)}
                  <button onClick={() => removeFilter(category, value)}>
                    <X size={12} />
                  </button>
                </FilterTag>
              )) : null
            )}
        </ActiveFilters>
      )}

      {loading ? (
        // Show spinner with loading text
        <LoadingContainer>
          <Loader size={40} color="var(--color-navy)" />
          <p style={{
            marginTop: '16px',
            color: 'var(--color-navy)',
            fontSize: '16px'
          }}>
            {t('tasks.loadingTasks')}
          </p>
        </LoadingContainer>
      ) : error ? (
        // Show error state
        <ErrorContainer>
          <p>{t('tasks.errorLoadingTasks')}: {error.message || t('errors.genericError')}</p>
          <ActionButton onClick={handleRefresh}>
            <RefreshCw size={16} />
            {t('common.retry')}
          </ActionButton>
        </ErrorContainer>
      ) : (
        // Show tasks table (even if empty, so pagination can be displayed)
        <TaskTable
          tasks={tasks || []}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {showDocumentModal && pendingExport && (
        <DocumentNamingModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onExport={handleConfirmExport}
          exportFormat={pendingExport.format}
          documentType="Tasks-Report"
          defaultCriteria={['documentType', 'currentDate']}
        />
      )}
    </PageContainer>
  );
};

export default TaskList;
