import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X, Edit, Trash, Check, X as XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../../store/slices/departmentSlice';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AlertModal from '../../../components/ui/AlertModal';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  padding: 16px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 600px;
  max-height: 85vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    border-radius: 12px 12px 0 0;
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  box-sizing: border-box;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const Button = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background: #151b60;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover:not(:disabled) {
      background: #f5f5f5;
    }
  `}
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 24px 0;
`;

const ListTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #f8fafc;
  gap: 8px;

  &:hover {
    background: #f1f5f9;
  }
`;

const ItemName = styled.div`
  font-size: 14px;
  color: #333;
  flex: 1;
  min-width: 0;
  word-break: break-word;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${props => props.danger ? '#fee2e2' : '#e8eaf6'};
  color: ${props => props.danger ? '#dc2626' : 'var(--color-navy)'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.danger ? '#fecaca' : '#c5cae9'};
  }
`;

const EditableRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
`;

const EditInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid #c5cae9;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 16px;
  color: #64748b;
  font-size: 14px;
`;

const DepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { departments, loading } = useSelector(state => state.departments || { departments: [], loading: false });
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState('');
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const getDepartmentId = (department) => department._id || department.id;

  const showAlertModal = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchDepartments());
      setNewDepartmentName('');
      setError('');
      setEditingDepartmentId(null);
      setEditingDepartmentName('');
    }
  }, [dispatch, isOpen]);

  const hasDuplicateName = (name, excludedId) => departments.some((department) => {
    const departmentId = getDepartmentId(department);
    return departmentId !== excludedId && department.name.toLowerCase() === name.trim().toLowerCase();
  });

  const validateNewDepartment = () => {
    if (!newDepartmentName.trim()) {
      setError(t('departments.nameRequired'));
      return false;
    }

    if (hasDuplicateName(newDepartmentName)) {
      setError(t('departments.alreadyExists'));
      return false;
    }

    setError('');
    return true;
  };

  const handleAddDepartment = async () => {
    if (!validateNewDepartment()) return;

    setIsSubmitting(true);
    try {
      await dispatch(createDepartment({ name: newDepartmentName.trim() })).unwrap();
      setNewDepartmentName('');
      await dispatch(fetchDepartments());
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err || t('departments.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (department) => {
    const departmentId = getDepartmentId(department);

    if (!editingDepartmentName.trim()) {
      showAlertModal(t('common.error'), t('departments.nameRequired'), 'error');
      return;
    }

    if (hasDuplicateName(editingDepartmentName, departmentId)) {
      showAlertModal(t('common.error'), t('departments.alreadyExists'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateDepartment({ id: departmentId, data: { name: editingDepartmentName.trim() } })).unwrap();
      setEditingDepartmentId(null);
      setEditingDepartmentName('');
      await dispatch(fetchDepartments());
      if (onSuccess) onSuccess();
    } catch (err) {
      showAlertModal(t('common.error'), err || t('departments.updateFailed'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      await dispatch(deleteDepartment(departmentToDelete)).unwrap();
      await dispatch(fetchDepartments());
      if (onSuccess) onSuccess();
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    } catch (err) {
      showAlertModal(t('common.error'), err || t('departments.deleteFailed'), 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>{t('departments.manageDepartments')}</ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label htmlFor="department-name">{t('departments.addNewDepartment')}</Label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Input
                    type="text"
                    id="department-name"
                    value={newDepartmentName}
                    onChange={(event) => {
                      setNewDepartmentName(event.target.value);
                      if (error) setError('');
                    }}
                    placeholder={t('departments.enterDepartmentName')}
                    disabled={isSubmitting}
                    style={{ flex: '1 1 auto', minWidth: '150px' }}
                  />
                  <Button
                    variant="primary"
                    type="button"
                    onClick={handleAddDepartment}
                    disabled={isSubmitting || !newDepartmentName.trim()}
                  >
                    {isSubmitting ? t('common.adding') : t('common.add')}
                  </Button>
                </div>
                {error && <ErrorText>{error}</ErrorText>}
              </FormGroup>

              <Divider />

              <ListTitle>{t('departments.existingDepartments')}</ListTitle>

              <List>
                {loading ? (
                  <EmptyState>{t('departments.loadingDepartments')}</EmptyState>
                ) : departments.length === 0 ? (
                  <EmptyState>{t('departments.noDepartmentsFound')}</EmptyState>
                ) : (
                  departments.map((department) => {
                    const departmentId = getDepartmentId(department);
                    return (
                      <ListItem key={departmentId}>
                        {editingDepartmentId === departmentId ? (
                          <EditableRow>
                            <EditInput
                              type="text"
                              value={editingDepartmentName}
                              onChange={(event) => setEditingDepartmentName(event.target.value)}
                              autoFocus
                              disabled={isSubmitting}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') handleSaveEdit(department);
                                if (event.key === 'Escape') {
                                  setEditingDepartmentId(null);
                                  setEditingDepartmentName('');
                                }
                              }}
                            />
                            <IconButton
                              type="button"
                              onClick={() => handleSaveEdit(department)}
                              disabled={isSubmitting || !editingDepartmentName.trim()}
                              title={t('common.saveChanges')}
                            >
                              <Check size={16} />
                            </IconButton>
                            <IconButton
                              type="button"
                              danger
                              onClick={() => {
                                setEditingDepartmentId(null);
                                setEditingDepartmentName('');
                              }}
                              disabled={isSubmitting}
                              title={t('common.cancelEditing')}
                            >
                              <XIcon size={16} />
                            </IconButton>
                          </EditableRow>
                        ) : (
                          <>
                            <ItemName>{department.name}</ItemName>
                            <ItemActions>
                              <IconButton
                                type="button"
                                onClick={() => {
                                  setEditingDepartmentId(departmentId);
                                  setEditingDepartmentName(department.name);
                                }}
                                disabled={isSubmitting}
                                title={t('departments.editDepartment')}
                              >
                                <Edit size={16} />
                              </IconButton>
                              <IconButton
                                type="button"
                                danger
                                onClick={() => {
                                  setDepartmentToDelete(departmentId);
                                  setShowDeleteConfirm(true);
                                }}
                                disabled={isSubmitting}
                                title={t('departments.deleteDepartment')}
                              >
                                <Trash size={16} />
                              </IconButton>
                            </ItemActions>
                          </>
                        )}
                      </ListItem>
                    );
                  })
                )}
              </List>
            </ModalBody>

            <ModalFooter>
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                {t('common.close')}
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDepartmentToDelete(null);
        }}
        onConfirm={confirmDeleteDepartment}
        title={t('departments.deleteDepartment')}
        message={t('departments.deleteDepartmentConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="primary"
      />

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </AnimatePresence>
  );
};

export default DepartmentModal;
