import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit } from 'lucide-react';
import UserForm from './components/UserForm';
import { toast } from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import api from '../../services/api';
import Skeleton from '../../components/ui/Skeleton';

const PageContainer = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
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
  color: var(--color-navy);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 8px;
  }

  .icon {
    opacity: 0.7;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 20px;
      height: 20px;
    }
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
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
  }
`;

const DialogTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 17px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 6px;
  }
`;

const DialogMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
    width: 100%;

    button {
      width: 100%;
      justify-content: center;
    }
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
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
    width: 100%;
    justify-content: center;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }

  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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

const UserEditSkeleton = () => (
  <PageContainer>
    <Skeleton.Base width="120px" height="18px" margin="0 0 24px 0" />
    
    <Header>
      <Skeleton.Base width="180px" height="28px" margin="0 0 8px 0" />
      <Skeleton.Base width="280px" height="16px" margin="0 0 32px 0" />
    </Header>
    
    <div style={{ display: 'grid', gap: '24px' }}>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <Skeleton.Form.Field>
            <Skeleton.Form.Label width="80px" />
            <Skeleton.Form.Input height="42px" />
          </Skeleton.Form.Field>
          
          <Skeleton.Form.Field>
            <Skeleton.Form.Label width="80px" />
            <Skeleton.Form.Input height="42px" />
          </Skeleton.Form.Field>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <Skeleton.Form.Field>
            <Skeleton.Form.Label width="100px" />
            <Skeleton.Form.Input height="42px" />
          </Skeleton.Form.Field>
          
          <Skeleton.Form.Field>
            <Skeleton.Form.Label width="120px" />
            <Skeleton.Form.Input height="42px" />
          </Skeleton.Form.Field>
        </div>
      </div>
      
      <div>
        <Skeleton.Base width="200px" height="20px" margin="0 0 20px 0" />
        
        {Array(3).fill().map((_, i) => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <Skeleton.Base width={`${180 + Math.random() * 120}px`} height="18px" margin="0 0 12px 0" />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {Array(4).fill().map((_, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Skeleton.Base width="20px" height="20px" radius="4px" />
                  <Skeleton.Base width={`${100 + Math.random() * 80}px`} height="16px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <Skeleton.Button width="100px" />
        <Skeleton.Button width="120px" />
      </div>
    </div>
  </PageContainer>
);

const UserEdit = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.EDIT_USER)) {
      navigate('/users');
      return;
    }

    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch user details');
      navigate('/users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (formData) => {
    setConfirmData(formData);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.put(`/users/${userId}`, confirmData);
      toast.success('User updated successfully');
      navigate(`/users`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <UserEditSkeleton />;
  }

  if (!user) {
    return <div>{t('users.userNotFound')}</div>;
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(`/users`)}>
        <ArrowLeft size={18} />
        Back to User
      </BackButton>

      <Header>
        <PageTitle>
          <Edit size={24} className="icon" />
          Edit User
        </PageTitle>
        <SubTitle>{t('users.updateUserInformation')}</SubTitle>
      </Header>

      <UserForm
        initialData={user}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/users`)}
        submitButtonText="Save Changes"
        isSubmitting={isSubmitting}
      />

      {confirmData && (
        <EditConfirmDialog>
          <DialogContent>
            <DialogTitle>{t('users.confirmChanges')}</DialogTitle>
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