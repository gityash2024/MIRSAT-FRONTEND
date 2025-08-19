import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  UserPlus, 
  Search, 
  Download,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Check,
  X,
  EyeIcon,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  FileText,
  Database,
  CheckCircle,
  Loader,
  Power,
  PowerOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../../store/slices/userSlice';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Skeleton from '../../components/ui/Skeleton';

import UserFilter from './components/UserFilters';
import api from '../../services/api';
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
const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
   &.export-dropdown {
    position: relative;
  } 
`;

const DropdownContent = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 100;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.show ? '0' : '-10px'});
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  color: #333;
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f5f7fb;
  }

  .icon {
    color: var(--color-navy);
    opacity: 0.7;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;
const UserTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f5f7fb;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  td {
    font-size: 14px;
    color: #666;
  }

  tbody tr:hover {
    background: #f5f7fb;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'Active' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.status === 'Active' ? '#2e7d32' : '#c62828'};
`;

const RoleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--color-navy);

  .icon {
    opacity: 0.7;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .name {
    color: var(--color-navy);
    font-weight: 500;
  }

  .contact {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #666;
    font-size: 13px;

    .item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const ActionMenu = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fb;
    color: var(--color-navy);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  padding: 8px 0;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '8px' : '0'});
  transition: all 0.2s;
  z-index: 10;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 14px;
  color: ${props => props.variant === 'danger' ? '#dc2626' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#fee2e2' : '#f5f7fb'};
  }

  .icon {
    opacity: 0.7;
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const DeleteConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const DialogMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: var(--color-navy);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const PaginationInfo = styled.div`
  color: #666;
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid #e0e0e0;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumberButton = styled.button`
  background: ${props => props.active ? 'var(--color-navy)' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? 'var(--color-navy)' : '#e0e0e0'};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--color-navy)' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  flex-direction: column;
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Toggle Switch Component
const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: inherit;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? '#10b981' : '#e5e7eb'};
  transition: .3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: ${props => props.checked ? '23px' : '3px'};
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ConfirmModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 450px;
  margin: 0 16px;
`;

const ConfirmModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfirmModalMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ConfirmModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

// UserListSkeleton component - COMMENTED OUT
/*
const UserListSkeleton = () => (
  <PageContainer>
    <Header>
      <Skeleton.Base width="220px" height="28px" margin="0 0 8px 0" />
      <Skeleton.Base width="280px" height="16px" />
    </Header>

    <ActionBar>
      <Skeleton.Base width="300px" height="42px" radius="8px" />
      <div style={{ display: 'flex', gap: '12px' }}>
        <Skeleton.Button width="100px" height="42px" />
        <Skeleton.Button width="100px" height="42px" />
        <Skeleton.Button width="120px" height="42px" />
      </div>
    </ActionBar>

    <UserTable>
      <Table>
        <thead>
          <tr>
            <th style={{ width: '50px' }}>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array(8).fill().map((_, i) => (
            <tr key={i}>
              <td>
                <Skeleton.Base width="20px" height="16px" />
              </td>
              <td>
                <Skeleton.Base width={`${120 + Math.random() * 80}px`} height="18px" />
              </td>
              <td>
                <Skeleton.Base width={`${150 + Math.random() * 100}px`} height="18px" />
              </td>
              <td>
                <Skeleton.Base width="100px" height="26px" radius="13px" />
              </td>
              <td>
                <Skeleton.Base width={`${80 + Math.random() * 60}px`} height="18px" />
              </td>
              <td>
                <Skeleton.Base width="90px" height="18px" />
              </td>
              <td>
                <Skeleton.Base width="80px" height="26px" radius="13px" />
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton.Circle size="32px" />
                  <Skeleton.Circle size="32px" />
                  <Skeleton.Circle size="32px" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <PaginationContainer>
        <PaginationInfo>
          <Skeleton.Base width="200px" height="16px" />
        </PaginationInfo>
        <PaginationButtons>
          <Skeleton.Button width="40px" height="40px" />
          <Skeleton.Button width="40px" height="40px" />
          <Skeleton.Button width="40px" height="40px" />
          <Skeleton.Button width="40px" height="40px" />
          <Skeleton.Button width="40px" height="40px" />
        </PaginationButtons>
      </PaginationContainer>
    </UserTable>
  </PageContainer>
);
*/

const UserStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Active':
        return {
          bg: '#e3fcef',
          color: '#10b981'
        };
      case 'Inactive':
        return {
          bg: '#fee2e2',
          color: '#ef4444'
        };
      default:
        return {
          bg: '#f3f4f6',
          color: '#6b7280'
        };
    }
  };

  const colors = getStatusColor();

  return (
    <StatusBadge status={status}>
      {status === 'Active' ? <CheckCircle size={14} /> : <X size={14} />}
      {status}
    </StatusBadge>
  );
};

const UserList = () => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    role: [],
    status: [],
    department: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toggleConfirm, setToggleConfirm] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { hasPermission, userRole } = usePermissions();
  
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    fetchUsersList();
  }, []);
  
  useEffect(() => {
    // Reset to first page when filters or search changes
    setCurrentPage(1);
  }, [searchTerm, filters]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);
  
  const fetchUsersList = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
    setActiveDropdown(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${deleteConfirm.id}`);
      toast.success('User deleted successfully');
      fetchUsersList();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatusClick = (user) => {
    setToggleConfirm(user);
    setActiveDropdown(null);
  };

  const handleConfirmToggleStatus = async () => {
    if (!toggleConfirm) return;
    
    try {
      setIsUpdatingStatus(true);
      await api.patch(`/users/${toggleConfirm.id}/toggle-status`);
      const newStatus = !toggleConfirm.isActive;
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsersList();
      setToggleConfirm(null);
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
  };
  
  const generatePDF = (users) => {
    const doc = new jsPDF();
    
    // Set document properties for better identification
    doc.setProperties({
      title: 'User Management Report',
      subject: 'MIRSAT System User Report',
      creator: 'MIRSAT System'
    });
    
    // Add proper header with background
    doc.setFillColor(26, 35, 126); // var(--color-navy)
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Add title with proper positioning
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255); // White color
    doc.text('User Management Report', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    // Add subtitle and date with proper spacing
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200); // Light gray for subtitle in header
    doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Add organization logo or name if available
    // doc.addImage('path-to-logo', 'PNG', 15, 10, 20, 20);

    // Space after header
    const contentStartY = 55;
    
    // Add summary section
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 126); // var(--color-navy)
    doc.text('Summary', 15, contentStartY);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Users: ${users.length}`, 15, contentStartY + 10);
    
    // Count active and inactive users
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = users.length - activeUsers;
    
    doc.text(`Active Users: ${activeUsers}`, 15, contentStartY + 20);
    doc.text(`Inactive Users: ${inactiveUsers}`, 15, contentStartY + 30);
    
    // Prepare table data with better structure
    const tableColumn = [
      "Name", 
      "Email",
      "Role",
      "Status",
      "Last Active"
    ];
    
    // Process data for better presentation
    const tableRows = users.map(user => [
      user.name || 'Not specified',
      user.email || 'Not specified',
      user.role || 'N/A',
      user.isActive ? 'Active' : 'Inactive',
      formatTimestamp(user.lastLogin) || 'Never'
    ]);
    
    // Add table with improved styling
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: contentStartY + 45,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak', // Handle text overflow with line breaks
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.5,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Name
        1: { cellWidth: 50 }, // Email
        2: { cellWidth: 30 }, // Role
        3: { cellWidth: 25 }, // Status
        4: { cellWidth: 35 }  // Last Active
      },
      alternateRowStyles: {
        fillColor: [245, 247, 251]
      },
      didDrawCell: (data) => {
        // Customize status column appearance
        if (data.section === 'body' && data.column.index === 3) {
          const status = data.cell.raw;
          if (status === 'Active') {
            doc.setFillColor(232, 245, 233); // Light green for active
            doc.setTextColor(46, 125, 50);   // Dark green text
          } else {
            doc.setFillColor(255, 235, 238); // Light red for inactive
            doc.setTextColor(198, 40, 40);   // Dark red text
          }
        }
      },
      // Reset colors after cell is drawn
      didParseCell: (data) => {
        if (data.section === 'body') {
          doc.setTextColor(60, 60, 60); // Default text color
        }
      },
      // Ensure proper word wrapping for long fields
      didDrawPage: (data) => {
        // Any page-specific footer or header elements can be added here
      }
    });
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount} | MIRSAT User Management Report`, 
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    return doc;
  };
  
  const handleExport = async (format) => {
    setPendingExport({ format, data: filteredUsers });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  const handleConfirmExport = async (fileName) => {
    if (!pendingExport) return;
    
    try {
      const { format, data } = pendingExport;
      
      switch(format) {
        case 'pdf':
          const doc = generatePDF(data);
          if (doc) {
            doc.save(`${fileName}.pdf`);
            toast.success('PDF exported successfully');
          }
          break;
          
        case 'csv':
          try {
            const response = await api.get('/users/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${fileName}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('CSV exported successfully');
          } catch (error) {
            console.error('CSV export error:', error);
            toast.error('Failed to export CSV');
          }
          break;

        default:
          toast.error('Invalid export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${pendingExport.format.toUpperCase()}`);
    } finally {
      setShowDocumentModal(false);
      setPendingExport(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm?.toLowerCase());

    const matchesRole = filters.role.length === 0 || filters.role.includes(user.role);
    const matchesStatus = filters.status.length === 0 || filters.status.includes(user.isActive ? 'Active' : 'Inactive');
    const matchesDepartment = filters.department.length === 0 || filters.department.includes(user.department);

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const showPages = 5; // Show at most 5 page numbers
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = startPage + showPages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Loader size={40} color="var(--color-navy)" />
          <p style={{ 
            marginTop: '16px', 
            color: 'var(--color-navy)', 
            fontSize: '16px' 
          }}>
            Users loading...
          </p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <PageTitle>User Management</PageTitle>
        <SubTitle>Manage user accounts and permissions</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ButtonGroup>
          <Button variant="secondary" onClick={() => setIsFilterVisible(!isFilterVisible)}>
            <Filter size={18} />
            Filters
          </Button>
          {hasPermission(PERMISSIONS.USERS.EXPORT_USERS) && (
            <ExportDropdown className="export-dropdown">
              <Button 
                variant="secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportDropdown(!showExportDropdown);
                }}
              >
                <Download size={18} />
                Export
              </Button>
              <DropdownContent show={showExportDropdown}>
                <DropdownItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport('pdf');
                  }}
                >
                  <FileText size={16} className="icon" />
                  Export as PDF
                </DropdownItem>
                {/* <DropdownItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport('csv');
                  }}
                >
                  <FileText size={16} className="icon" />
                  Export as CSV
                </DropdownItem> */}
              </DropdownContent>
            </ExportDropdown>
          )}
          {hasPermission(PERMISSIONS.USERS.CREATE_USERS) && (
            <Button variant="primary" as={Link} to="/users/create">
              <UserPlus size={18} />
              Add User
            </Button>
          )}
        </ButtonGroup>
      </ActionBar>

      {isFilterVisible && (
        <FilterSection>
          <UserFilter
            filters={filters} 
            setFilters={setFilters}
          />
        </FilterSection>
      )}

      <UserTable>
        <Table>
          <thead>
            <tr>
              <th>User Details</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <UserInfo>
                    <span className="name">{user.name}</span>
                    <div className="contact">
                      <span className="item">
                        <Mail size={14} />
                        {user.email}
                      </span>
                      <span style={{ cursor: 'pointer' }} onClick={() => handleCopyEmail(user.email)} className="item">
                        <Copy size={14} />
                        {user.phone}
                      </span>
                    </div>
                  </UserInfo>
                </td>
                <td>
                  <RoleBadge>
                    <Shield size={16} className="icon" />
                    {user.role?.toUpperCase()}
                  </RoleBadge>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserStatus status={user.isActive ? 'Active' : 'Inactive'} />
                  </div>
                </td>
                <td>{formatTimestamp(user.lastLogin)}</td>
                <td>
                  <ActionMenu>
                    {hasPermission(PERMISSIONS.USERS.VIEW_USERS) && (
                      <ActionButton as={Link} to={`/users/${user.id}`}>
                        <EyeIcon size={16} />
                      </ActionButton>
                    )}
                    
                    {hasPermission(PERMISSIONS.USERS.EDIT_USERS) && userRole !== 'manager' && (
                      <ActionButton as={Link} to={`/users/${user.id}/edit`}>
                        <Edit size={16} />
                      </ActionButton>
                    )}

                    {hasPermission(PERMISSIONS.USERS.EDIT_USERS) && userRole !== 'manager' && (
                      <select 
                        value={user.isActive ? 'active' : 'inactive'}
                        onChange={(e) => {
                          const newStatus = e.target.value === 'active';
                          if (newStatus !== user.isActive) {
                            handleToggleStatusClick(user);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: user.isActive ? '#22c55e' : '#ef4444'
                        }}
                        title="Quick status change"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    )}

                    {hasPermission(PERMISSIONS.USERS.DELETE_USERS) && userRole !== 'manager' && (
                      <ActionButton 
                        onClick={() => handleDeleteClick(user)}
                        style={{ color: '#dc2626' }}
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    )}
                   
                  </ActionMenu>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        
        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <PaginationContainer>
            <PaginationInfo>
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </PaginationInfo>
            
            <PaginationButtons>
              <PaginationButton onClick={firstPage} disabled={currentPage === 1}>
                First
              </PaginationButton>
              <PaginationButton onClick={prevPage} disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </PaginationButton>
              
              {getPageNumbers().map(number => (
                <PageNumberButton 
                  key={number}
                  active={currentPage === number}
                  onClick={() => paginate(number)}
                >
                  {number}
                </PageNumberButton>
              ))}
              
              <PaginationButton onClick={nextPage} disabled={currentPage === totalPages}>
                <ChevronRight size={16} />
              </PaginationButton>
              <PaginationButton onClick={lastPage} disabled={currentPage === totalPages}>
                Last
              </PaginationButton>
            </PaginationButtons>
          </PaginationContainer>
        )}
      </UserTable>

      {deleteConfirm && (
        <DeleteConfirmDialog>
          <DialogContent>
            <DialogTitle>Delete User</DialogTitle>
            <DialogMessage>
              Are you sure you want to delete {deleteConfirm.name}? This action cannot be undone.
            </DialogMessage>
            <DialogActions>
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmDelete}>
                Delete User
              </Button>
            </DialogActions>
          </DialogContent>
        </DeleteConfirmDialog>
      )}

      {/* Toggle Status Confirmation Modal */}
      {toggleConfirm && (
        <ConfirmModal>
          <ConfirmModalContent>
            <ConfirmModalTitle>
              {toggleConfirm.isActive ? <PowerOff size={20} color="#ef4444" /> : <Power size={20} color="#10b981" />}
              {toggleConfirm.isActive ? 'Deactivate User' : 'Activate User'}
            </ConfirmModalTitle>
            <ConfirmModalMessage>
              Are you sure you want to {toggleConfirm.isActive ? 'deactivate' : 'activate'} <strong>{toggleConfirm.name}</strong>?
              {toggleConfirm.isActive ? (
                <>
                  <br/><br/>⚠️ This will prevent the user from logging in and accessing the system.
                </>
              ) : (
                <>
                  <br/><br/>✅ This will allow the user to login and access the system again.
                </>
              )}
            </ConfirmModalMessage>
            <ConfirmModalActions>
              <Button variant="secondary" onClick={() => setToggleConfirm(null)} disabled={isUpdatingStatus}>
                Cancel
              </Button>
              <Button 
                variant={toggleConfirm.isActive ? "danger" : "primary"} 
                onClick={handleConfirmToggleStatus}
                disabled={isUpdatingStatus}
                style={{
                  background: toggleConfirm.isActive ? '#ef4444' : '#10b981',
                  color: 'white',
                  border: 'none'
                }}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {toggleConfirm.isActive ? 'Deactivating...' : 'Activating...'}
                  </>
                ) : (
                  <>
                    {toggleConfirm.isActive ? 'Deactivate User' : 'Activate User'}
                  </>
                )}
              </Button>
            </ConfirmModalActions>
          </ConfirmModalContent>
        </ConfirmModal>
      )}

      {showDocumentModal && (
        <DocumentNamingModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onExport={handleConfirmExport}
          exportFormat={pendingExport?.format || 'pdf'}
          documentType="Users-Report"
          defaultCriteria={['documentType', 'currentDate']}
        />
      )}
    </PageContainer>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    return `${hours}h ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default UserList;