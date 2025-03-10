import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { FileText } from 'lucide-react';

import UserFilter from './components/UserFilters';
import api from '../../services/api';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
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
      border-color: #1a237e;
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
    color: #1a237e;
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
  color: #1a237e;

  .icon {
    opacity: 0.7;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .name {
    color: #1a237e;
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
    color: #1a237e;
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
  color: #1a237e;
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
  background: ${props => props.active ? '#1a237e' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#1a237e' : '#e0e0e0'};
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#1a237e' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
  const { hasPermission, userRole } = usePermissions();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  useEffect(() => {
    fetchUsers();
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
  
  const fetchUsers = async () => {
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
      await api.delete(`/users/${deleteConfirm._id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}`, {
        isActive: !currentStatus
      });
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };
  
  const generatePDF = (users) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(26, 35, 126); // #1a237e
    doc.text('User Management Report', 15, 15);
    
    // Add subtitle and date
    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102); // #666666
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25);
  
    // Prepare table data
    const tableColumn = [
      "User Details", 
      "Role",
      "Status",
      "Last Active",
      "Assigned Tasks"
    ];
  
    const tableRows = users.map(user => [
      `${user.name}\n${user.email}\n${user.phone}`,
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      formatTimestamp(user.lastLogin),
      user.assignedTasks || 0
    ]);
  
    // Add table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 }
      },
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 251]
      },
      didDrawCell: (data) => {
        // Add special formatting for status column
        if (data.section === 'body' && data.column.index === 2) {
          const status = data.cell.raw;
          doc.setFillColor(status === 'Active' ? '#e8f5e9' : '#ffebee');
          doc.setTextColor(status === 'Active' ? '#2e7d32' : '#c62828');
        }
      }
    });
  
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`, 
        doc.internal.pageSize.width - 20, 
        doc.internal.pageSize.height - 10
      );
    }
  
    return doc;
  };
  
  const handleExport = async (format) => {
    try {
      setShowExportDropdown(false);
      
      switch(format) {
        case 'pdf':
          const doc = generatePDF(filteredUsers);
          if (doc) {
            doc.save('user-management-report.pdf');
            toast.success('PDF exported successfully');
          }
          break;
          
        case 'csv':
          try {
            const response = await api.get('/users/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
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
      toast.error(`Failed to export as ${format.toUpperCase()}`);
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
    return <LoadingSpinner>Loading...</LoadingSpinner>;
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
              <th>Assigned Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id}>
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
                  <StatusBadge status={user.isActive ? 'Active' : 'Inactive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </td>
                <td>{formatTimestamp(user.lastLogin)}</td>
                <td>{user.assignedTasks || 0}</td>
                <td>
                  <ActionMenu>
                    {hasPermission(PERMISSIONS.USERS.VIEW_USERS) && (
                      <ActionButton as={Link} to={`/users/${user._id}`}>
                        <EyeIcon size={16} />
                      </ActionButton>
                    )}
                    
                    {hasPermission(PERMISSIONS.USERS.EDIT_USERS) && (
                      <ActionButton as={Link} to={`/users/${user._id}/edit`}>
                        <Edit size={16} />
                      </ActionButton>
                    )}
                    
                    {(hasPermission(PERMISSIONS.USERS.DELETE_USERS) || 
                      hasPermission(PERMISSIONS.USERS.MANAGE_PERMISSIONS)) && (
                      <ActionButton onClick={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}>
                        <MoreVertical size={16} />
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