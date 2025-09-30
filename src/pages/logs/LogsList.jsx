import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import FrontendLogger from '../../services/frontendLogger.service';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  MessageSquare,
  PenTool,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Database,
  BarChart3,
  Settings,
  X,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { API_CONFIG } from '../../config/api';
import LogDetailsModal from './LogDetailsModal';

const LogsContainer = styled.div`
  padding: 24px;
  background: var(--color-offwhite);
  min-height: 100vh;
  font-family: '_thesansarab_9750fc', '_thesansarab_Fallback_9750fc', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: var(--color-gray-medium);
  font-size: 16px;
  margin: 0;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-light);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.color || 'linear-gradient(135deg, var(--color-teal) 0%, #764ba2 100%)'};
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.bgColor || 'linear-gradient(135deg, var(--color-teal) 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  color: var(--color-gray-medium);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ControlsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-light);
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid var(--color-gray-light);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: var(--color-teal);
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.active ? 'var(--color-teal)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--color-gray-medium)'};
  border: 2px solid ${props => props.active ? 'var(--color-teal)' : 'var(--color-gray-light)'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
    border-color: ${props => props.active ? 'var(--color-navy)' : '#cbd5e1'};
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  color: var(--color-gray-medium);
  border: 2px solid var(--color-gray-light);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: var(--color-teal);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    animation: ${props => props.loading ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const FiltersPanel = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid var(--color-gray-light);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 2px solid var(--color-gray-light);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--color-teal);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ClearButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: var(--color-gray-medium);
  border: 2px solid var(--color-gray-light);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;


const TableWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 20px;
`;

const LogsTable = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-light);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 140px 100px 120px 100px 120px 100px 80px;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 2px solid var(--color-gray-light);
  font-weight: 700;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 140px 100px 120px 100px 120px 100px 80px;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  align-items: center;
  
  &:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    transform: translateX(4px);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: transparent;
    transition: all 0.2s ease;
  }
  
  &:hover::before {
    background: linear-gradient(135deg, var(--color-teal) 0%, #764ba2 100%);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-teal) 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 700;
  color: var(--color-navy);
  font-size: 13px;
  margin-bottom: 1px;
`;

const UserRole = styled.div`
  color: var(--color-gray-medium);
  font-size: 11px;
  text-transform: capitalize;
  font-weight: 500;
`;

const ActionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.2px;
  background: ${props => {
    switch(props.type) {
      case 'task_started': return 'var(--color-info)';
      case 'task_completed': return 'var(--color-success)';
      case 'task_progress_updated': return 'var(--color-warning)';
      case 'task_archived': return 'var(--color-navy)';
      case 'questionnaire_completed': return '#8b5cf6';
      case 'task_signature_added': return '#06b6d4';
      default: return 'var(--color-gray-medium)';
    }
  }};
  color: white;
  min-width: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const SeverityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.2px;
  background: ${props => {
    switch(props.level) {
      case 'critical': return 'var(--color-error)';
      case 'high': return 'var(--color-warning)';
      case 'medium': return 'var(--color-info)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-gray-medium)';
    }
  }};
  color: white;
  min-width: 70px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TaskTitle = styled.div`
  font-weight: 600;
  color: var(--color-navy);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

const TaskStatus = styled.div`
  font-size: 11px;
  color: ${props => props.color || 'var(--color-gray-medium)'};
  text-transform: capitalize;
  font-weight: 500;
`;

const TaskPriority = styled.div`
  font-size: 10px;
  color: ${props => props.color || 'var(--color-gray-medium)'};
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 2px;
`;

const DescriptionText = styled.div`
  color: var(--color-gray-medium);
  font-size: 12px;
  line-height: 1.4;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  display: flex;
  align-items: center;
  height: 100%;
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gray-medium);
  font-size: 12px;
  font-weight: 500;
`;

const SerialNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-medium);
  font-size: 11px;
  font-weight: 600;
  background: #f8fafc;
  border-radius: 4px;
  width: 32px;
  height: 20px;
  border: 1px solid #e2e8f0;
  margin: 0 auto;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px;
  border: none;
  background: #f8fafc;
  color: var(--color-gray-medium);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--color-teal);
    color: white;
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--color-gray-medium);
  
  svg {
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  div {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: #6b7280;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: white;
  border-top: 1px solid var(--color-gray-light);
  border-radius: 0 0 16px 16px;
`;

const PaginationInfo = styled.div`
  margin-right: 16px;
  color: var(--color-gray-medium);
  font-size: 14px;
  font-weight: 500;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--color-gray-light);
  background: ${props => props.active ? 'var(--color-teal)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--color-gray-medium)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
    border-color: ${props => props.active ? 'var(--color-navy)' : '#cbd5e1'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogsList = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    severity: '',
    startDate: '',
    endDate: '',
    customStartDate: '',
    customEndDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [users, setUsers] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    fetchStats();
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  const fetchLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Convert date filters to proper values and map user filter to userId
      const processedFilters = {
        ...filters,
        startDate: getDateValue(filters.startDate, filters.customStartDate),
        endDate: getDateValue(filters.endDate, filters.customEndDate),
        userId: filters.user // Map 'user' to 'userId' for backend
      };
      
      // Remove custom date fields and user field from the params
      delete processedFilters.customStartDate;
      delete processedFilters.customEndDate;
      delete processedFilters.user;

      // Filter out empty values to avoid sending empty strings to backend
      const cleanFilters = Object.entries(processedFilters).reduce((acc, [key, value]) => {
        if (value && value !== '' && value !== 'All Actions' && value !== 'All Severities' && value !== 'All Time' && value !== 'No End Date') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        ...cleanFilters
      });

      console.log('🔍 Original filters:', filters);
      console.log('🔍 Processed filters:', processedFilters);
      console.log('🔍 Clean filters (sent to API):', cleanFilters);
      console.log('🔍 API URL:', `${API_CONFIG.BASE_URL}/logs?${params}`);

      const response = await fetch(`${API_CONFIG.BASE_URL}/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.data.logs || []);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination?.totalItems || 0,
        totalPages: data.data.pagination?.totalPages || 0
      }));
      setError(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 Fetching users from:', `${API_CONFIG.BASE_URL}/logs/users`);
      const response = await fetch(`${API_CONFIG.BASE_URL}/logs/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Users fetched:', data.data);
        setUsers(data.data);
      } else {
        console.error('❌ Failed to fetch users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    }
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Log search activity
    if (searchValue.trim()) {
      FrontendLogger.logSearch(searchValue, 'logs');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Log filter application
    FrontendLogger.logFilterApplied({ [key]: value }, 'logs');
    
    // Note: useEffect will handle the API call when filters change
  };

  const clearFilters = () => {
    // Reset all filters to empty values
    setFilters({
      user: '',
      action: '',
      severity: '',
      startDate: '',
      endDate: '',
      customStartDate: '',
      customEndDate: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Log filter clearing
    FrontendLogger.logFilterApplied({ cleared: true }, 'logs');
    
    // Note: useEffect will handle the API call when filters change
  };

  // Convert date filter values to proper dates
  const getDateValue = (dateType, customDate) => {
    if (dateType === 'custom' && customDate) {
      return customDate;
    }
    
    if (dateType === 'today') {
      return 'today';
    }
    
    if (dateType === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    
    if (dateType === 'week') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return startOfWeek.toISOString().split('T')[0];
    }
    
    if (dateType === 'lastweek') {
      const startOfLastWeek = new Date();
      startOfLastWeek.setDate(startOfLastWeek.getDate() - startOfLastWeek.getDay() - 7);
      return startOfLastWeek.toISOString().split('T')[0];
    }
    
    if (dateType === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      return startOfMonth.toISOString().split('T')[0];
    }
    
    if (dateType === 'lastmonth') {
      const startOfLastMonth = new Date();
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1, 1);
      return startOfLastMonth.toISOString().split('T')[0];
    }
    
    return '';
  };


  const handleRefresh = () => {
    fetchLogs(true);
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowModal(true);
    
    // Log log view
    FrontendLogger.logActivity({
      action: 'log_viewed',
      description: `Viewed log: ${log.action}`,
      module: 'logs',
      details: { logId: log._id, action: log.action, userId: log.userId }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatAction = (action) => {
    if (!action || typeof action !== 'string') return 'Unknown Action';
    
    const actionMap = {
      'task_started': 'Task Started',
      'task_completed': 'Task Completed',
      'task_progress_updated': 'Progress Updated',
      'task_archived': 'Task Archived',
      'questionnaire_completed': 'Questionnaire Completed',
      'task_signature_added': 'Signature Added',
      'task_assigned': 'Task Assigned',
      'task_created': 'Task Created',
      'system_error': 'System Error',
      'security_violation': 'Security Violation',
      'data_corruption': 'Data Corruption',
      'failed_authentication': 'Failed Auth',
      'unauthorized_access': 'Unauthorized Access',
      'critical_task_failure': 'Critical Failure'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionType = (action) => {
    if (!action || typeof action !== 'string') return 'default';
    if (action.includes('started')) return 'task_started';
    if (action.includes('completed')) return 'task_completed';
    if (action.includes('progress')) return 'task_progress_updated';
    if (action.includes('archived')) return 'task_archived';
    if (action.includes('questionnaire')) return 'questionnaire_completed';
    if (action.includes('signature')) return 'task_signature_added';
    if (action.includes('assigned')) return 'task_assigned';
    if (action.includes('created')) return 'task_created';
    if (action.includes('system_error')) return 'system_error';
    if (action.includes('security_violation')) return 'security_violation';
    if (action.includes('data_corruption')) return 'data_corruption';
    if (action.includes('failed_authentication')) return 'failed_authentication';
    if (action.includes('unauthorized_access')) return 'unauthorized_access';
    if (action.includes('critical_task_failure')) return 'critical_task_failure';
    return 'default';
  };

  const getTaskPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'var(--color-error)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-success)';
      default: return '#6b7280';
    }
  };

  const getTaskStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'var(--color-success)';
      case 'in_progress': return 'var(--color-info)';
      case 'pending': return 'var(--color-warning)';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'No description';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    critical: 0,
    users: 0
  });

  // Fetch stats separately from logs
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/logs/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to calculating from current logs
      setStats({
        total: pagination.total || 0,
        today: logs.filter(log => {
          const logDate = new Date(log.timestamp);
          const today = new Date();
          return logDate.toDateString() === today.toDateString();
        }).length,
        critical: logs.filter(log => log.severity === 'critical').length,
        users: users.length
      });
    }
  };

  if (error) {
    return (
      <LogsContainer>
        <Header>
          <Title>Activity Logs</Title>
          <Subtitle>Monitor and track all user activities across the platform</Subtitle>
        </Header>
        <EmptyState>
          <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div>Error loading logs</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>{error}</div>
          <RefreshButton onClick={handleRefresh} style={{ marginTop: '16px' }}>
            <RefreshCw size={16} />
            Try Again
          </RefreshButton>
        </EmptyState>
      </LogsContainer>
    );
  }

  if (loading && logs.length === 0) {
    return (
      <LogsContainer>
        <LoadingSpinner>
          <RefreshCw size={24} />
          <span style={{ marginLeft: '8px' }}>Loading logs...</span>
        </LoadingSpinner>
      </LogsContainer>
    );
  }

  return (
    <LogsContainer>
      <Header>
        <Title>Activity Logs</Title>
        <Subtitle>Monitor and track all user activities across the platform</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard color="linear-gradient(135deg, var(--color-teal) 0%, #764ba2 100%)">
          <StatIcon bgColor="linear-gradient(135deg, var(--color-teal) 0%, #764ba2 100%)">
            <Activity size={24} />
          </StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Logs</StatLabel>
        </StatCard>
        
        <StatCard color="linear-gradient(135deg, #10b981 0%, #059669 100%)">
          <StatIcon bgColor="linear-gradient(135deg, #10b981 0%, #059669 100%)">
            <Calendar size={24} />
          </StatIcon>
          <StatValue>{stats.today}</StatValue>
          <StatLabel>Today's Activities</StatLabel>
        </StatCard>
        
        <StatCard color="linear-gradient(135deg, #f59e0b 0%, var(--color-warning) 100%)">
          <StatIcon bgColor="linear-gradient(135deg, #f59e0b 0%, var(--color-warning) 100%)">
            <AlertCircle size={24} />
          </StatIcon>
          <StatValue>{stats.critical}</StatValue>
          <StatLabel>Critical Events</StatLabel>
        </StatCard>
        
        <StatCard color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
          <StatIcon bgColor="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
            <Users size={24} />
          </StatIcon>
          <StatValue>{stats.users}</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>
      </StatsGrid>

      <ControlsSection>
        <ControlsRow>
          <SearchContainer>
            <SearchIcon>
              <Search size={20} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </SearchContainer>
          
          <FilterButton 
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </FilterButton>
          
          <RefreshButton onClick={handleRefresh} loading={refreshing} disabled={refreshing}>
            <RefreshCw size={16} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </ControlsRow>

        <FiltersPanel isOpen={showFilters}>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>User</FilterLabel>
              <FilterSelect
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Action</FilterLabel>
              <FilterSelect
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="task_started">Task Started</option>
                <option value="task_completed">Task Completed</option>
                <option value="task_progress_updated">Progress Updated</option>
                <option value="task_archived">Task Archived</option>
                <option value="questionnaire_started">Questionnaire Started</option>
                <option value="questionnaire_completed">Questionnaire Completed</option>
                <option value="questionnaire_response_updated">Questionnaire Response Updated</option>
                <option value="task_comment_added">Comment Added</option>
                <option value="section_comment_added">Section Comment Added</option>
                <option value="task_attachment_added">Attachment Added</option>
                <option value="task_signature_added">Signature Added</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Severity</FilterLabel>
              <FilterSelect
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Start Date</FilterLabel>
              <FilterSelect
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="lastweek">Last Week</option>
                <option value="month">This Month</option>
                <option value="lastmonth">Last Month</option>
                <option value="custom">Custom Date</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>End Date</FilterLabel>
              <FilterSelect
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              >
                <option value="">No End Date</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="lastweek">Last Week</option>
                <option value="month">This Month</option>
                <option value="lastmonth">Last Month</option>
                <option value="custom">Custom Date</option>
              </FilterSelect>
            </FilterGroup>

            {filters.startDate === 'custom' && (
              <FilterGroup>
                <FilterLabel>Custom Start Date</FilterLabel>
                <input
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--color-gray-light)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                />
              </FilterGroup>
            )}

            {filters.endDate === 'custom' && (
              <FilterGroup>
                <FilterLabel>Custom End Date</FilterLabel>
                <input
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid var(--color-gray-light)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    width: '100%',
                    backgroundColor: 'white'
                  }}
                />
              </FilterGroup>
            )}
          </FiltersGrid>
          
          <FilterActions>
            <ClearButton onClick={clearFilters}>Clear All Filters</ClearButton>
          </FilterActions>
        </FiltersPanel>
      </ControlsSection>

      <TableWrapper>
        <LogsTable>
          <TableHeader>
            <div>Sr No</div>
            <div>User</div>
            <div>Action</div>
            <div>Severity</div>
            <div>Task</div>
            <div>Description</div>
            <div>Time</div>
            <div>Actions</div>
          </TableHeader>

          <TableContent>
            {logs.length === 0 ? (
              <EmptyState>
                <Activity size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <div>No logs found</div>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  Try adjusting your search or filter criteria
                </div>
              </EmptyState>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log._id} onClick={() => handleViewLog(log)}>
                  <SerialNumber>
                    {((pagination.page - 1) * pagination.limit) + index + 1}
                  </SerialNumber>
                  <UserInfo>
                    <UserAvatar>
                      {log.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </UserAvatar>
                    <UserDetails>
                      <UserName>{log.userId?.name || 'Unknown User'}</UserName>
                      <UserRole>{log.userId?.role || 'Unknown Role'}</UserRole>
                    </UserDetails>
                  </UserInfo>
                  <ActionBadge type={getActionType(log.action)}>
                    {formatAction(log.action)}
                  </ActionBadge>
                  <SeverityBadge level={log.severity}>
                    {log.severity}
                  </SeverityBadge>
                  <TaskInfo>
                    <TaskTitle title={log.taskId?.title || 'No Task'}>
                      {log.taskId?.title || 'No Task'}
                    </TaskTitle>
                    <TaskStatus color={getTaskStatusColor(log.taskId?.status)}>
                      {log.taskId?.status || 'N/A'}
                    </TaskStatus>
                    {log.taskId?.priority && (
                      <TaskPriority color={getTaskPriorityColor(log.taskId?.priority)}>
                        {log.taskId?.priority}
                      </TaskPriority>
                    )}
                  </TaskInfo>
                  <DescriptionText title={log.description}>
                    {truncateText(log.description, 60)}
                  </DescriptionText>
                  <TimeInfo>
                    <Clock size={14} />
                    {formatDate(log.timestamp)}
                  </TimeInfo>
                  <Actions>
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleViewLog(log);
                    }}>
                      <Eye size={16} />
                    </ActionButton>
                  </Actions>
                </TableRow>
              ))
            )}
          </TableContent>
        </LogsTable>
      </TableWrapper>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationInfo>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
          </PaginationInfo>
          
          <PaginationControls>
            <PageButton
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </PageButton>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const startPage = Math.max(1, pagination.page - 2);
              const page = startPage + i;
              if (page > pagination.totalPages) return null;
              
              return (
                <PageButton
                  key={page}
                  active={page === pagination.page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                >
                  {page}
                </PageButton>
              );
            })}
            
            <PageButton
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </PageButton>
          </PaginationControls>
        </Pagination>
      )}

      <LogDetailsModal
        log={selectedLog}
        isOpen={showModal}
        onClose={closeModal}
      />
    </LogsContainer>
  );
};

export default LogsList;