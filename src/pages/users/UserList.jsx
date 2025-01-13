import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
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
  Eye,
  Check,
  X,
  View,
  EyeIcon
} from 'lucide-react';
import UserFilter from './components/UserFilters';

export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+966 50 123 4567',
    role: 'Inspector',
    status: 'Active',
    lastActive: '2024-01-15T09:30:00',
    assignedTasks: 12,
    permissions: ['view_tasks', 'edit_tasks'],
    department: 'Field Operations',
    joinDate: '2023-06-15',
    address: 'Riyadh, Saudi Arabia',
    emergencyContact: '+966 50 987 6543',
    profileImage: null
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+966 50 234 5678',
    role: 'Management',
    status: 'Active',
    lastActive: '2024-01-15T10:15:00',
    assignedTasks: 8,
    permissions: ['view_tasks', 'edit_tasks', 'assign_tasks', 'view_reports'],
    department: 'Operations Management',
    joinDate: '2023-04-20',
    address: 'Jeddah, Saudi Arabia',
    emergencyContact: '+966 50 876 5432',
    profileImage: null
  },
  {
    id: 3,
    name: 'Mohammed Al-Said',
    email: 'm.alsaid@example.com',
    phone: '+966 50 345 6789',
    role: 'Inspector',
    status: 'Inactive',
    lastActive: '2024-01-14T15:45:00',
    assignedTasks: 0,
    permissions: ['view_tasks'],
    department: 'Field Operations',
    joinDate: '2023-08-01',
    address: 'Dammam, Saudi Arabia',
    emergencyContact: '+966 50 765 4321',
    profileImage: null
  }
];

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

const UserList = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
const [filters, setFilters] = useState({
  role: [],
  status: [],
  department: []
});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);


  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
    setActiveDropdown(null);
  };

  const handleConfirmDelete = () => {
    // Handle actual deletion here
    console.log('Deleting user:', deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const toggleUserStatus = (userId) => {
    // Handle status toggle here
    console.log('Toggling status for user:', userId);
  };

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
          <Button variant="secondary"             onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <Filter size={18} />
            Filters
          </Button>
          <Button variant="secondary">
            <Download size={18} />
            Export
          </Button>
          <Button variant="primary" as={Link} to="/users/create">
            <UserPlus size={18} />
            Add User
          </Button>
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
            {mockUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <UserInfo>
                    <span className="name">{user.name}</span>
                    <div className="contact">
                      <span className="item">
                        <Mail size={14} />
                        {user.email}
                      </span>
                      <span className="item">
                        <Phone size={14} />
                        {user.phone}
                      </span>
                    </div>
                  </UserInfo>
                </td>
                <td>
                  <RoleBadge>
                    <Shield size={16} className="icon" />
                    {user.role}
                  </RoleBadge>
                </td>
                <td>
                  <StatusBadge status={user.status}>
                    {user.status}
                  </StatusBadge>
                </td>
                <td>{formatTimestamp(user.lastActive)}</td>
                <td>{user.assignedTasks}</td>
                <td>
                  <ActionMenu>
                    <ActionButton as={Link} to={`/users/${user.id}`}>  
                    <EyeIcon/>
                    </ActionButton>
                    <ActionButton as={Link} to={`/users/${user.id}/edit`}>  
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}>
                      <MoreVertical size={16} />
                    </ActionButton>
                    
                    <DropdownMenu isOpen={activeDropdown === user.id}>
                      <MenuItem onClick={() => toggleUserStatus(user.id)}>
                        {user.status === 'Active' ? (
                          <>
                            <X size={16} className="icon" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Check size={16} className="icon" />
                            Activate
                          </>
                        )}
                      </MenuItem>
                      <MenuItem variant="danger" onClick={() => handleDeleteClick(user)}>
                        <Trash2 size={16} className="icon" />
                        Delete
                      </MenuItem>
                    </DropdownMenu>
                  </ActionMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
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