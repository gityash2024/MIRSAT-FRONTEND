import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowLeft, Edit, User, Mail, Phone, MapPin, Calendar,
  Shield, AlertTriangle, Clock, ClipboardList, CheckCircle2
} from 'lucide-react';
import { PERMISSIONS } from '../../utils/permissions';
import { usePermissions } from '../../hooks/usePermissions';

const PageContainer = styled.div`
  padding: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  &:hover {
    color: #333;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

const UserHeader = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: #e3f2fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a237e;
  font-size: 32px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
`;

const UserRole = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.status === 'Active' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.status === 'Active' ? '#2e7d32' : '#c62828'};
`;

const EditButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #1a237e;
  color: #1a237e;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
  &:hover {
    background: #f5f7fb;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  .icon {
    opacity: 0.7;
  }
`;

const DetailsList = styled.div`
  display: grid;
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
  font-size: 14px;
  .icon {
    color: #1a237e;
    opacity: 0.7;
  }
`;

const PermissionList = styled.div`
  display: grid;
  gap: 12px;
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  .icon {
    color: #2e7d32;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  .label {
    font-size: 13px;
    color: #666;
  }
  .value {
    font-size: 24px;
    font-weight: 600;
    color: #1a237e;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
`;

const ErrorState = styled.div`
  padding: 24px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  margin-bottom: 24px;
`;

const UserView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userService.getUser(userId);
      setUser(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState>Loading user details...</LoadingState>;
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState>{error}</ErrorState>
        <BackButton onClick={() => navigate('/users')}>
          <ArrowLeft size={18} />
          Back to Users
        </BackButton>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <ErrorState>User not found</ErrorState>
        <BackButton onClick={() => navigate('/users')}>
          <ArrowLeft size={18} />
          Back to Users
        </BackButton>
      </PageContainer>
    );
  }

  const stats = [
    {
      label: 'Assigned Tasks',
      value: user.assignedTasks || 0
    },
    {
      label: 'Days Active',
      value: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    }
  ];

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/users')}>
        <ArrowLeft size={18} />
        Back to Users
      </BackButton>

      <Header>
        <UserHeader>
          <Avatar>{user.name.charAt(0)}</Avatar>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserRole>
              <Shield size={16} />
              {user.role}
            </UserRole>
            <StatusBadge status={user.isActive ? 'Active' : 'Inactive'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </StatusBadge>
          </UserInfo>
        </UserHeader>

        {hasPermission(PERMISSIONS.USERS.EDIT) && (
          <EditButton to={`/users/${user.id}/edit`}>
            <Edit size={16} />
            Edit User
          </EditButton>
        )}
      </Header>

      <ContentGrid>
        <div>
          <StatGrid>
            {stats.map((stat, index) => (
              <StatCard key={index}>
                <div className="label">{stat.label}</div>
                <div className="value">{stat.value}</div>
              </StatCard>
            ))}
          </StatGrid>

          <Card>
            <CardTitle>
              <User size={18} className="icon" />
              Personal Information
            </CardTitle>
            <DetailsList>
              <DetailItem>
                <Mail size={16} className="icon" />
                {user.email}
              </DetailItem>
              <DetailItem>
                <Phone size={16} className="icon" />
                {user.phone || 'Not provided'}
              </DetailItem>
              <DetailItem>
                <MapPin size={16} className="icon" />
                {user.address || 'Not provided'}
              </DetailItem>
              <DetailItem>
                <AlertTriangle size={16} className="icon" />
                Emergency Contact: {user.emergencyContact || 'Not provided'}
              </DetailItem>
            </DetailsList>
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle>
              <Shield size={18} className="icon" />
              Role & Permissions
            </CardTitle>
            <DetailsList>
              <DetailItem>
                <Calendar size={16} className="icon" />
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </DetailItem>
              <DetailItem>
                <Clock size={16} className="icon" />
                Last Active: {formatTimestamp(user.lastLogin)}
              </DetailItem>
              <DetailItem>
                <ClipboardList size={16} className="icon" />
                Department: {user.department || 'Not assigned'}
              </DetailItem>
            </DetailsList>

            <CardTitle style={{ marginTop: '24px' }}>
              Permissions
            </CardTitle>
            <PermissionList>
              {user.permissions?.map((permission, index) => (
                <PermissionItem key={index}>
                  <CheckCircle2 size={16} className="icon" />
                  {permission.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </PermissionItem>
              ))}
            </PermissionList>
          </Card>
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  
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

export default UserView;