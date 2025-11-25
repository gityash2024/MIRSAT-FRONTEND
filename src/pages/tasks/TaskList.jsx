import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Search, Download, RefreshCw, Loader, ChevronDown, X, User, AlertCircle } from 'lucide-react';
import TaskTable from './components/TaskTable';
import { fetchTasks, setFilters, setPagination, fetchTasksProgressData } from '../../store/slices/taskSlice';
import { fetchAssets } from '../../store/slices/assetSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchInspectionLevels } from '../../store/slices/inspectionLevelSlice';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import { useTranslation } from 'react-i18next';

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
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
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
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 900px;
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
  gap: 12px;
  flex-wrap: wrap;

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
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

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
        asset: [],
        search: ''
      }));
    }

    // Initialize pagination if it doesn't exist
    if (!pagination) {
      dispatch(setPagination({ page: 1, limit: 10, total: 0, pages: 0 }));
    }

    // Load necessary data for filters
    dispatch(fetchAssets());
    dispatch(fetchUsers());
    dispatch(fetchInspectionLevels());
  }, [dispatch]);

  useEffect(() => {
    loadTasks();
  }, [dispatch, filters, pagination?.page, pagination?.limit]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('[data-dropdown="status"]')) {
        setShowStatusDropdown(false);
      }
      if (showPriorityDropdown && !event.target.closest('[data-dropdown="priority"]')) {
        setShowPriorityDropdown(false);
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
  }, [showStatusDropdown, showPriorityDropdown, showAssigneeDropdown, showExportDropdown]);

  const loadTasks = async () => {
    try {
      // Create query params from filters
      const queryParams = {
        ...filters,
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        sortBy: '-createdAt' // Ensure latest tasks appear first
      };

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
    setSearchTerm(e.target.value);
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ ...filters, search: e.target.value }));
    }, 500);

    return () => clearTimeout(timeoutId);
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
    const clearedFilters = Object.keys(filters).reduce((acc, key) => ({
      ...acc,
      [key]: []
    }), {});
    dispatch(setFilters(clearedFilters));
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
    return value;
  };

  const hasActiveFilters = Object.entries(filters || {}).some(([key, value]) =>
    key !== 'search' && Array.isArray(value) && value.length > 0
  );

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  const handleRefresh = () => {
    loadTasks();
    toast.success('Tasks refreshed successfully');
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
    setPendingExport({ format: 'pdf', data: tasks });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  // Export tasks to CSV
  const handleExportCSV = () => {
    setPendingExport({ format: 'csv', data: tasks });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  const handleConfirmExport = (fileName) => {
    if (!pendingExport) return;

    const { format, data } = pendingExport;

    if (format === 'pdf') {
      generatePDFExport(data, fileName);
    } else if (format === 'csv') {
      generateCSVExport(data, fileName);
    }

    setShowDocumentModal(false);
    setPendingExport(null);
  };

  const generatePDFExport = (tasksData, fileName) => {
    try {
      toast.loading('Generating PDF...');

      // Create PDF document
      const doc = new jsPDF('landscape');

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(26, 35, 126); // Navy color
      doc.text('MIRSAT - Task Report', 14, 22);

      // Add subtitle with date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy, h:mm a')}`, 14, 30);

      // Define table columns
      const columns = [
        { header: '#', dataKey: 'index' },
        { header: 'Inspection Name', dataKey: 'title' },
        { header: 'Template', dataKey: 'template' },
        { header: 'Assignee', dataKey: 'assignee' },
        { header: 'Priority', dataKey: 'priority' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Due Date', dataKey: 'dueDate' },
        { header: 'Progress', dataKey: 'progress' }
      ];

      // Prepare data for the table
      const tableData = tasksData.map((task, index) => ({
        index: (index + 1).toString(),
        title: task.title || 'Untitled',
        template: task.inspectionLevel?.name || 'N/A',
        assignee: task.assignedTo && task.assignedTo.length > 0
          ? task.assignedTo[0].name || 'Unnamed'
          : 'Unassigned',
        priority: task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'N/A',
        status: task.status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'N/A',
        dueDate: formatDate(task.deadline),
        progress: `${task.overallProgress || 0}%`
      }));

      // Generate the table
      doc.autoTable({
        columns: columns,
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [26, 35, 126],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        tableWidth: 'auto',
        margin: { left: 14, right: 14 }
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

  const generateCSVExport = (tasksData, fileName) => {
    try {
      toast.loading('Generating CSV...');

      // Define the headers
      const headers = ['Inspection Name', 'Template', 'Assignee', 'Priority', 'Status', 'Due Date', 'Progress'];

      // Prepare the data
      const csvData = tasksData.map(task => [
        task.title || 'Untitled',
        task.inspectionLevel?.name || 'N/A',
        task.assignedTo && task.assignedTo.length > 0
          ? task.assignedTo[0].name || 'Unnamed'
          : 'Unassigned',
        task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'N/A',
        task.status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'N/A',
        formatDate(task.deadline),
        `${task.overallProgress || 0}%`
      ]);

      // Add headers to the data
      csvData.unshift(headers);

      // Convert to CSV string
      const csvContent = csvData.map(row =>
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains commas or quotes
          const escaped = String(cell).replace(/"/g, '""');
          return /[,"]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(',')
      ).join('\n');

      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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
            .filter(([key]) => key !== 'search' && key !== 'inspectionLevel' && key !== 'asset')
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
          <FilterTag>
            {t('common.clearAll')}
            <button onClick={clearAllFilters}>
              <X size={12} />
            </button>
          </FilterTag>
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