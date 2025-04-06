// pages/assets/components/AssetModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createAsset, updateAsset } from '../../../store/slices/assetSlice';
import { fetchAssetTypes } from '../../../store/slices/assetTypeSlice';
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
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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
  color: #1a237e;
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
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #1a237e;
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
    background: #1a237e;
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

const AssetModal = ({ isOpen, onClose, asset, onSuccess }) => {
  const dispatch = useDispatch();
  const { assetTypes } = useSelector(state => state.assetTypes || { assetTypes: [] });
  
  const [formData, setFormData] = useState({
    uniqueId: '',
    type: '',
    displayName: '',
    city: '',
    location: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssetTypes());
  }, [dispatch]);

  useEffect(() => {
    if (asset) {
      setFormData({
        uniqueId: asset.uniqueId,
        type: asset.type,
        displayName: asset.displayName,
        city: asset.city || '',
        location: asset.location || '',
      });
    } else {
      setFormData({
        uniqueId: '',
        type: '',
        displayName: '',
        city: '',
        location: '',
      });
    }
  }, [asset]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.uniqueId) {
      newErrors.uniqueId = 'Unique ID is required';
    } else if (isNaN(formData.uniqueId)) {
      newErrors.uniqueId = 'Unique ID must be a number';
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'uniqueId' ? parseInt(value) || '' : value,
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (asset) {
        // Update existing asset
        await dispatch(updateAsset({ 
          id: asset._id, 
          data: formData 
        })).unwrap();
      } else {
        // Create new asset
        await dispatch(createAsset(formData)).unwrap();
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setIsSubmitting(false);
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
              <ModalTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <FormGroup>
                <Label htmlFor="uniqueId">Unique ID</Label>
                <Input
                  type="number"
                  id="uniqueId"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleChange}
                  placeholder="Enter unique ID"
                />
                {errors.uniqueId && <ErrorText>{errors.uniqueId}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select asset type</option>
                  {assetTypes.map(type => (
                    <option key={type._id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </Select>
                {errors.type && <ErrorText>{errors.type}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Enter display name"
                />
                {errors.displayName && <ErrorText>{errors.displayName}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
                {errors.city && <ErrorText>{errors.city}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  onChange={handleChange}
                  value={formData.location}
                  placeholder="Enter location"
                />
                {errors.location && <ErrorText>{errors.location}</ErrorText>}
              </FormGroup>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : asset ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AssetModal;