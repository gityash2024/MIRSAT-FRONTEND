// pages/assets/components/AssetTypeModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Edit, Trash, Check, X as XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAssetTypes, 
  createAssetType, 
  updateAssetType, 
  deleteAssetType 
} from '../../../store/slices/assetTypeSlice';
import { motion, AnimatePresence } from 'framer-motion';

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
  const dispatch = useDispatch();
  const { assetTypes, loading } = useSelector(state => state.assetTypes || { assetTypes: [], loading: false });
  
  const [newTypeName, setNewTypeName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAssetTypes());
    }
  }, [dispatch, isOpen]);

  const validateNewType = () => {
    if (!newTypeName.trim()) {
      setError('Type name is required');
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
      await dispatch(createAssetType({ name: newTypeName })).unwrap();
      setNewTypeName('');
      dispatch(fetchAssetTypes());
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating asset type:', error);
      setError('Failed to create asset type. It may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (assetType) => {
    setEditingTypeId(assetType._id);
    setEditingTypeName(assetType.name);
  };

  const handleCancelEdit = () => {
    setEditingTypeId(null);
    setEditingTypeName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editingTypeName.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await dispatch(updateAssetType({ id, data: { name: editingTypeName } })).unwrap();
      setEditingTypeId(null);
      setEditingTypeName('');
      dispatch(fetchAssetTypes());
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating asset type:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteType = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset type?')) {
      try {
        await dispatch(deleteAssetType(id)).unwrap();
        dispatch(fetchAssetTypes());
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Error deleting asset type:', error);
      }
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
              <ModalTitle>Manage Asset Types</ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <FormGroup>
                <Label htmlFor="name">Add New Asset Type</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    type="text"
                    id="name"
                    value={newTypeName}
                    onChange={handleInputChange}
                    placeholder="Enter asset type name"
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleAddType} 
                    disabled={isSubmitting || !newTypeName.trim()}
                  >
                    Add
                  </Button>
                </div>
                {error && <ErrorText>{error}</ErrorText>}
              </FormGroup>
              
              <Divider />
              
              <TypesListTitle>Existing Asset Types</TypesListTitle>
              
              <TypesList>
                {loading ? (
                  <EmptyState>Loading asset types...</EmptyState>
                ) : assetTypes.length === 0 ? (
                  <EmptyState>No asset types found. Add one above.</EmptyState>
                ) : (
                  assetTypes.map(assetType => (
                    <TypeItem key={assetType._id}>
                      {editingTypeId === assetType._id ? (
                        <EditableRow>
                          <EditInput
                            type="text"
                            value={editingTypeName}
                            onChange={(e) => setEditingTypeName(e.target.value)}
                            autoFocus
                          />
                          <IconButton 
                            onClick={() => handleSaveEdit(assetType._id)}
                            disabled={isSubmitting || !editingTypeName.trim()}
                          >
                            <Check size={16} />
                          </IconButton>
                          <IconButton danger onClick={handleCancelEdit}>
                            <XIcon size={16} />
                          </IconButton>
                        </EditableRow>
                      ) : (
                        <>
                          <TypeName>{assetType.name}</TypeName>
                          <TypeActions>
                            <IconButton onClick={() => handleEditClick(assetType)}>
                              <Edit size={16} />
                            </IconButton>
                            <IconButton danger onClick={() => handleDeleteType(assetType._id)}>
                              <Trash size={16} />
                            </IconButton>
                          </TypeActions>
                        </>
                      )}
                    </TypeItem>
                  ))
                )}
              </TypesList>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AssetTypeModal;