import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft, Edit } from 'lucide-react';
import UserForm from './components/UserForm';
import { mockUsers } from './UserList';

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
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  .icon {
    opacity: 0.7;
  }
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const EditConfirmDialog = styled.div`
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
  color: #1a237e;
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

const UserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundUser = mockUsers.find(u => u.id === parseInt(userId));
    if (foundUser) {
      setUser(foundUser);
    }
  }, [userId]);

  const handleSubmit = (formData) => {
    setConfirmData(formData);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Here you would make the API call to update the user
      console.log('Updating user:', confirmData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(`/users/${userId}`);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(`/users/${userId}`)}>
        <ArrowLeft size={18} />
        Back to User
      </BackButton>

      <Header>
        <PageTitle>
          <Edit size={24} className="icon" />
          Edit User
        </PageTitle>
        <SubTitle>Update user information and permissions</SubTitle>
      </Header>

      <UserForm
        initialData={user}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/users/${userId}`)}
        submitButtonText="Save Changes"
        isSubmitting={isSubmitting}
      />

      {confirmData && (
        <EditConfirmDialog>
          <DialogContent>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogMessage>
              Are you sure you want to save these changes?
              <br /><br />
              Name: {confirmData.name}
              <br />
              Email: {confirmData.email}
              <br />
              Role: {confirmData.role}
            </DialogMessage>
            <DialogActions>
              <Button 
                variant="secondary" 
                onClick={() => setConfirmData(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </DialogContent>
        </EditConfirmDialog>
      )}
    </PageContainer>
  );
};

export default UserEdit;