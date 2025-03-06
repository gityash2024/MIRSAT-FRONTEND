import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Plus,
  Save,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

const Container = styled.div`
  display: grid;
  gap: 24px;
`;

const Section = styled.div`
  display: grid;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    opacity: 0.7;
  }
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const RoleCard = styled(Card)`
  display: grid;
  gap: 16px;
  border: 2px solid ${props => props.isDefault ? '#1a237e' : '#e2e8f0'};
  position: relative;
`;

const RoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

const RoleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RoleName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RoleDescription = styled.p`
  font-size: 13px;
  color: #64748b;
`;

const PermissionList = styled.div`
  display: grid;
  gap: 12px;
`;

const PermissionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;

  &:hover {
    background: #f1f5f9;
  }
`;

const PermissionName = styled.span`
  font-size: 14px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DefaultBadge = styled.span`
  position: absolute;
  top: -12px;
  right: 16px;
  padding: 4px 12px;
  background: #1a237e;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.size === 'small' ? '6px 12px' : '10px 20px'};
  background: ${props => {
    if (props.variant === 'primary') return '#1a237e';
    if (props.variant === 'danger') return '#dc2626';
    return 'white';
  }};
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'danger') return 'white';
    return '#1a237e';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'primary') return '#1a237e';
    if (props.variant === 'danger') return '#dc2626';
    return '#e2e8f0';
  }};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => {
      if (props.variant === 'primary') return '#151b4f';
      if (props.variant === 'danger') return '#b91c1c';
      return '#f8fafc';
    }};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;

const Modal = styled.div`
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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #1a237e;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 8px;
  color: #c2410c;
  font-size: 14px;
  margin-top: 24px;
`;

const PermissionSettings = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access and control',
      isDefault: false,
      permissions: {
        users: true,
        tasks: true,
        reports: true,
        settings: true
      }
    },
    {
      id: 2,
      name: 'Inspector',
      description: 'Access to inspection tasks and reports',
      isDefault: true,
      permissions: {
        users: false,
        tasks: true,
        reports: true,
        settings: false
      }
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Read-only access to tasks and reports',
      isDefault: false,
      permissions: {
        users: false,
        tasks: false,
        reports: true,
        settings: false
      }
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      users: false,
      tasks: false,
      reports: false,
      settings: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {
        users: false,
        tasks: false,
        reports: false,
        settings: false
      }
    });
    setShowModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions }
    });
    setShowModal(true);
  };

  const handleDeleteRole = (roleId) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
    setHasChanges(true);
  };

  const handleSubmitRole = async () => {
    setIsSubmitting(true);
    try {
      const newRole = {
        id: editingRole ? editingRole.id : roles.length + 1,
        ...formData,
      };

      if (editingRole) {
        setRoles(prev => prev.map(role => 
          role.id === editingRole.id ? newRole : role
        ));
      } else {
        setRoles(prev => [...prev, newRole]);
      }

      setShowModal(false);
      setHasChanges(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>
            <Shield size={20} className="icon" />
            Role Management
          </SectionTitle>
          <SectionDescription>
            Configure roles and their permissions
          </SectionDescription>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Button variant="primary" onClick={handleAddRole}>
            <Plus size={16} />
            Add New Role
          </Button>
        </div>

        <RoleGrid>
          {roles.map(role => (
            <RoleCard key={role.id} isDefault={role.isDefault}>
              {role.isDefault && <DefaultBadge>Default Role</DefaultBadge>}
              <RoleHeader>
                <RoleInfo>
                  <RoleName>{role.name}</RoleName>
                  <RoleDescription>{role.description}</RoleDescription>
                </RoleInfo>
                <ButtonGroup>
                  <Button size="small" onClick={() => handleEditRole(role)}>
                    <Edit size={14} />
                  </Button>
                  <Button 
                    size="small"
                    variant="danger" 
                    onClick={() => handleDeleteRole(role.id)}
                    disabled={role.isDefault}
                  >
                    <Trash2 size={14} />
                  </Button>
                </ButtonGroup>
              </RoleHeader>

              <PermissionList>
                {Object.entries(role.permissions).map(([key, value]) => (
                  <PermissionItem key={key}>
                    <PermissionName>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </PermissionName>
                    {value ? <Check size={16} color="#16a34a" /> : <X size={16} color="#dc2626" />}
                  </PermissionItem>
                ))}
              </PermissionList>
            </RoleCard>
          ))}
        </RoleGrid>
      </Section>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </ModalTitle>
            <FormGroup>
              <Label>Role Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
              />
            </FormGroup>
            <FormGroup>
              <Label>Permissions</Label>
              {Object.entries(formData.permissions).map(([key, value]) => (
                <PermissionItem key={key}>
                  <PermissionName>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </PermissionName>
                  <Toggle>
                    <ToggleInput
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [key]: e.target.checked
                        }
                      }))}
                    />
                    <ToggleSlider />
                  </Toggle>
                </PermissionItem>
              ))}
            </FormGroup>
            <ButtonGroup>
              <Button onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitRole}
                disabled={isSubmitting || !formData.name}
              >
                {isSubmitting ? 'Saving...' : 'Save Role'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {hasChanges && (
        <WarningMessage>
          <AlertTriangle size={18} />
          You have unsaved changes. Please save your changes before leaving this page.
        </WarningMessage>
      )}

      <ButtonGroup>
        <Button
          variant="primary"
        //   onClick={handleSubmit}
          disabled={!hasChanges || isSubmitting}
        >
          <Save size={16} />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default PermissionSettings;