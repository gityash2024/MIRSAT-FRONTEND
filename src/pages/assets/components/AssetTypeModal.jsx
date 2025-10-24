// pages/assets/components/AssetTypeModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X, Edit, Trash, Check, X as XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAssetTypes, 
  createAssetType, 
  updateAssetType, 
  deleteAssetType 
} from '../../../store/slices/assetTypeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import AlertModal from '../../../components/ui/AlertModal';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
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
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.2s;
  
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

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 24px 0;
`;

const TypesListTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const TypesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const TypeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #f8fafc;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const TypeName = styled.div`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

const TypeActions = styled.div`
  display: flex;
  gap: 8px;
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

  &:hover {
    background: ${props => props.danger ? '#fecaca' : '#c5cae9'};
  }
`;

const EditableRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const EditInput = styled.input`
  flex: 1;
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

const AssetTypeModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { assetTypes, loading } = useSelector(state => state.assetTypes || { assetTypes: [], loading: false });
  
  const [newTypeName, setNewTypeName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState('');
  
  // Modal states for custom confirmations and alerts
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Helper function to get asset type ID (handles both 'id' and '_id' fields)
  const getAssetTypeId = (assetType) => {
    return assetType._id || assetType.id;
  };

  // Helper function to show alert modal
  const showAlertModal = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAssetTypes());
      // Reset form states when modal opens
      setNewTypeName('');
      setError('');
      setEditingTypeId(null);
      setEditingTypeName('');
    }
  }, [dispatch, isOpen]);

  const validateNewType = () => {
    if (!newTypeName.trim()) {
      setError('Type name is required');
      return false;
    }
    
    // Check if type name already exists
    const existingType = assetTypes.find(type => 
      type.name.toLowerCase() === newTypeName.trim().toLowerCase()
    );
    if (existingType) {
      setError('Asset type already exists');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleInputChange = (e) => {
    setNewTypeName(e.target.value);
    if (error) setError('');
  };

  const handleAddType = async () => {
    if (!validateNewType()) return;
    
    setIsSubmitting(true);
    
    try {
      await dispatch(createAssetType({ name: newTypeName.trim() })).unwrap();
      setNewTypeName('');
      // Refresh the list
      await dispatch(fetchAssetTypes());
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating asset type:', error);
      setError('Failed to create asset type. It may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (assetType) => {
    // Cancel any existing edit first
    const assetTypeId = getAssetTypeId(assetType);
    setEditingTypeId(assetTypeId);
    setEditingTypeName(assetType.name);
  };

  const handleCancelEdit = () => {
    setEditingTypeId(null);
    setEditingTypeName('');
  };

  const handleSaveEdit = async (assetType) => {
    if (!editingTypeName.trim()) {
      return;
    }
    
    const assetTypeId = getAssetTypeId(assetType);
    
    // Check if the new name conflicts with existing types (excluding current one)
    const existingType = assetTypes.find(type => {
      const typeId = getAssetTypeId(type);
      return typeId !== assetTypeId && type.name.toLowerCase() === editingTypeName.trim().toLowerCase();
    });
    if (existingType) {
      showAlertModal('Error', 'Asset type name already exists', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(updateAssetType({ id: assetTypeId, data: { name: editingTypeName.trim() } })).unwrap();
      setEditingTypeId(null);
      setEditingTypeName('');
      // Refresh the list
      await dispatch(fetchAssetTypes());
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating asset type:', error);
      showAlertModal('Error', 'Failed to update asset type', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = async (assetType) => {
    const assetTypeId = getAssetTypeId(assetType);
    
    if (!assetTypeId) {
      console.error('No ID found for asset type deletion:', assetType);
      showAlertModal('Error', 'Cannot delete asset type - no ID found', 'error');
      return;
    }

    setTypeToDelete(assetTypeId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteType = async () => {
    if (!typeToDelete) return;
    
    try {
      await dispatch(deleteAssetType(typeToDelete)).unwrap();
      // Refresh the list
      await dispatch(fetchAssetTypes());
      if (onSuccess) onSuccess();
      setShowDeleteConfirm(false);
      setTypeToDelete(null);
    } catch (error) {
      console.error('Error deleting asset type:', error);
      showAlertModal('Error', 'Failed to delete asset type. It may be in use by existing assets.', 'error');
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
              <ModalTitle>{t('common.manageAssetTypes')}</ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <FormGroup>
                <Label htmlFor="name">{t('common.addNewAssetType')}</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    type="text"
                    id="name"
                    value={newTypeName}
                    onChange={handleInputChange}
                    placeholder={t('common.enterAssetTypeName')}
                    disabled={isSubmitting}
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleAddType} 
                    disabled={isSubmitting || !newTypeName.trim()}
                  >
                    {isSubmitting ? t('common.adding') : t('common.add')}
                  </Button>
                </div>
                {error && <ErrorText>{error}</ErrorText>}
              </FormGroup>
              
              <Divider />
              
              <TypesListTitle>{t('common.existingAssetTypes')}</TypesListTitle>
              
              <TypesList>
                {loading ? (
                  <EmptyState>{t('common.loadingAssetTypes')}</EmptyState>
                ) : assetTypes.length === 0 ? (
                  <EmptyState>{t('common.noAssetTypesFound')}</EmptyState>
                ) : (
                  assetTypes.map(assetType => {
                    const assetTypeId = getAssetTypeId(assetType);
                    return (
                      <TypeItem key={assetTypeId}>
                        {editingTypeId === assetTypeId ? (
                          <EditableRow>
                            <EditInput
                              type="text"
                              value={editingTypeName}
                              onChange={(e) => setEditingTypeName(e.target.value)}
                              autoFocus
                              disabled={isSubmitting}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEdit(assetType);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                            />
                            <IconButton 
                              onClick={() => handleSaveEdit(assetType)}
                              disabled={isSubmitting || !editingTypeName.trim()}
                              title={t('common.saveChanges')}
                            >
                              <Check size={16} />
                            </IconButton>
                            <IconButton 
                              danger 
                              onClick={handleCancelEdit}
                              disabled={isSubmitting}
                              title={t('common.cancelEditing')}
                            >
                              <XIcon size={16} />
                            </IconButton>
                          </EditableRow>
                        ) : (
                          <>
                            <TypeName>{assetType.name}</TypeName>
                            <TypeActions>
                              <IconButton 
                                onClick={() => handleEditClick(assetType)}
                                disabled={isSubmitting}
                                title={t('common.editAssetType')}
                              >
                                <Edit size={16} />
                              </IconButton>
                              <IconButton 
                                danger 
                                onClick={() => handleDeleteType(assetType)}
                                disabled={isSubmitting}
                                title={t('common.deleteAssetType')}
                              >
                                <Trash size={16} />
                              </IconButton>
                            </TypeActions>
                          </>
                        )}
                      </TypeItem>
                    );
                  })
                )}
              </TypesList>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                {t('common.close')}
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
      
      {/* Custom Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setTypeToDelete(null);
        }}
        onConfirm={confirmDeleteType}
        title={t('common.deleteAssetType')}
        message={t('common.deleteAssetTypeConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="primary"
      />

      {/* Custom Alert Modal */}
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

export default AssetTypeModal;