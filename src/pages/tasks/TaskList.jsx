import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Filter, Search, Download, RefreshCw, Loader } from 'lucide-react';
import TaskFilter from './components/TaskFilter';
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

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;

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
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
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

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

const DropdownItem = styled.button`
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

const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  const { tasks, loading, error, filters, pagination } = useSelector((state) => state.tasks);
  
  // Debug: Log tasks and pagination whenever they change
  useEffect(() => {
    console.log('TaskList: Tasks updated:', tasks?.map(t => ({ id: t.id, progress: t.overallProgress })));
    console.log('TaskList: Pagination data:', pagination);
  }, [tasks, pagination]);
  
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);

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

  const loadTasks = async () => {
    try {
      // Create query params from filters
      const queryParams = {
        ...filters,
        page: pagination?.page || 1,
        limit: pagination?.limit || 10
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

  const handleFilterChange = (newFilters) => {
    console.log('New filters received:', newFilters);
    
    // Create a copy of the current filters
    const updatedFilters = { ...filters };
    
    // Process each filter key in newFilters
    Object.keys(newFilters).forEach(key => {
      // Only update the specific filter that changed
      updatedFilters[key] = newFilters[key];
    });
    
    console.log('Updated filters:', updatedFilters);
    
    // Dispatch the updated filters
    dispatch(setFilters(updatedFilters));
    
    // Reset pagination when filters change
    dispatch(setPagination({ page: 1 }));
  };

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
        { header: 'Task Name', dataKey: 'title' },
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
      const headers = ['Task Name', 'Template', 'Assignee', 'Priority', 'Status', 'Due Date', 'Progress'];
      
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
      <EmptyStateTitle>No tasks found</EmptyStateTitle>
      <EmptyStateDescription>
        {Object.keys(filters || {}).some(key => {
          if (key === 'search') return !!filters[key];
          return Array.isArray(filters[key]) && filters[key].length > 0;
        })
          ? 'Try changing your search criteria or filters.'
          : 'Get started by creating your first task.'}
      </EmptyStateDescription>
      {hasPermission(PERMISSIONS.TASKS.CREATE_TASKS) && (
        <ActionButton as={Link} to="/tasks/create" $variant="primary">
          <Plus size={16} />
          Create Task
        </ActionButton>
      )}
    </EmptyStateContainer>
  );

  return (
    <PageContainer>
      <Header>
        <PageTitle>Tasks</PageTitle>
        <SubTitle>Create and manage inspection tasks</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
          />
        </SearchBox>

        <ButtonGroup>
          <ActionButton onClick={handleRefresh} title="Refresh tasks">
            <RefreshCw size={16} />
          </ActionButton>

          <ActionButton 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            title="Filter tasks"
            $active={isFilterVisible}
          >
            <Filter size={16} />
            Filters
          </ActionButton>

          <ExportDropdown>
            <ActionButton 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              title="Export tasks"
            >
              <Download size={16} />
              Export
            </ActionButton>
            <DropdownMenu show={showExportDropdown}>
              <DropdownItem onClick={handleExportPDF}>
                <Download size={16} />
                Export as PDF
              </DropdownItem>
              <DropdownItem onClick={handleExportCSV}>
                <Download size={16} />
                Export as CSV
              </DropdownItem>
            </DropdownMenu>
          </ExportDropdown>
          
          {hasPermission(PERMISSIONS.TASKS.CREATE_TASKS) && (
            <ActionButton as={Link} to="/tasks/create" $variant="primary">
              <Plus size={16} />
              Create Task
            </ActionButton>
          )}
        </ButtonGroup>
      </ActionBar>

      {isFilterVisible && (
        <FilterContainer>
          <TaskFilter filters={filters || {}} setFilters={handleFilterChange} />
        </FilterContainer>
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
            Tasks loading...
          </p>
        </LoadingContainer>
      ) : error ? (
        // Show error state
        <ErrorContainer>
          <p>Error loading tasks: {error.message || 'Unknown error'}</p>
          <ActionButton onClick={handleRefresh}>
            <RefreshCw size={16} />
            Retry
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