// pages/assets/components/AssetModal.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createAsset, updateAsset } from '../../../store/slices/assetSlice';
import { fetchAssetTypes } from '../../../store/slices/assetTypeSlice';
import { motion, AnimatePresence } from 'framer-motion';
import FrontendLogger from '../../../services/frontendLogger.service';

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

const AssetModal = ({ isOpen, onClose, asset, onSuccess }) => {
  const { t } = useTranslation();
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

  // Helper function to get asset type ID (handles both 'id' and '_id' fields)
  const getAssetTypeId = (assetType) => {
    return assetType._id || assetType.id;
  };

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAssetTypes());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (asset) {
      setFormData({
        uniqueId: asset.uniqueId || '',
        type: asset.type || '',
        displayName: asset.displayName || '',
        city: asset.city || '',
        location: asset.location || '',
      });
      setErrors({});
    } else {
      setFormData({
        uniqueId: '',
        type: '',
        displayName: '',
        city: '',
        location: '',
      });
      setErrors({});
    }
  }, [asset, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.uniqueId) {
      newErrors.uniqueId = t('assets.uniqueIdRequired');
    } else if (isNaN(formData.uniqueId) || Number(formData.uniqueId) <= 0) {
      newErrors.uniqueId = t('assets.uniqueIdMustBePositive');
    }
    
    if (!formData.type) {
      newErrors.type = t('assets.typeRequired');
    }
    
    if (!formData.displayName?.trim()) {
      newErrors.displayName = t('assets.displayNameRequired');
    }
    
    if (!formData.city?.trim()) {
      newErrors.city = t('assets.cityRequired');
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = t('assets.locationRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'uniqueId' ? value : value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare clean form data
      const cleanFormData = {
        uniqueId: Number(formData.uniqueId),
        type: formData.type.trim(),
        displayName: formData.displayName.trim(),
        city: formData.city.trim(),
        location: formData.location.trim(),
      };

      if (asset) {
        // Check if asset._id exists, if not, use asset.id as fallback
        const assetId = asset._id || asset.id;
        if (!assetId) {
          console.error('No valid asset ID found:', asset);
          throw new Error(t('assets.assetIdMissing'));
        }
        
        // Update existing asset
        const result = await dispatch(updateAsset({ 
          id: assetId, 
          data: cleanFormData 
        })).unwrap();
        
        // Log asset update
        await FrontendLogger.logAssetUpdate(assetId, asset.displayName, cleanFormData);
      } else {
        // Create new asset
        const result = await dispatch(createAsset(cleanFormData)).unwrap();
        
        // Log asset creation
        await FrontendLogger.logAssetCreate({
          _id: result._id || result.id,
          name: cleanFormData.displayName,
          type: cleanFormData.type
        });
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('duplicate') || 
          error.message && error.message.includes('already exists')) {
        setErrors({ uniqueId: t('assets.assetIdAlreadyExists') });
      } else if (error.message && error.message.includes('validation')) {
        setErrors({ general: t('assets.checkRequiredFields') });
      } else {
        setErrors({ general: t('assets.failedToSaveAsset') });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        uniqueId: '',
        type: '',
        displayName: '',
        city: '',
        location: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>{asset ? t('common.editAsset') : t('common.addNewAsset')}</ModalTitle>
              <CloseButton onClick={handleClose} disabled={isSubmitting}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              {errors.general && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {errors.general}
                </div>
              )}

              <FormGroup>
                <Label htmlFor="uniqueId">{t('common.uniqueId')} *</Label>
                <Input
                  type="number"
                  id="uniqueId"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleChange}
                  placeholder={t('common.enterUniqueId')}
                  disabled={isSubmitting}
                  min="1"
                />
                {errors.uniqueId && <ErrorText>{errors.uniqueId}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="type">{t('common.type')} *</Label>
                <Select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">{t('common.selectAssetType')}</option>
                  {assetTypes.map(type => {
                    const typeId = getAssetTypeId(type);
                    return (
                      <option key={typeId} value={type.name}>
                        {type.name}
                      </option>
                    );
                  })}
                </Select>
                {errors.type && <ErrorText>{errors.type}</ErrorText>}
                {assetTypes.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    No asset types available. Create one first.
                  </div>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="displayName">{t('common.displayName')} *</Label>
                <Input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder={t('common.enterDisplayName')}
                  disabled={isSubmitting}
                />
                {errors.displayName && <ErrorText>{errors.displayName}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="city">{t('common.city')} *</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t('common.enterCity')}
                  disabled={isSubmitting}
                />
                {errors.city && <ErrorText>{errors.city}</ErrorText>}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="location">{t('common.location')} *</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  onChange={handleChange}
                  value={formData.location}
                  placeholder={t('common.enterLocation')}
                  disabled={isSubmitting}
                />
                {errors.location && <ErrorText>{errors.location}</ErrorText>}
              </FormGroup>
            </ModalBody>
            
            <ModalFooter>
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                  {t('common.cancel')}
                </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={isSubmitting || assetTypes.length === 0}
              >
                {isSubmitting ? t('common.saving') : asset ? t('common.updateAsset') : t('common.createAsset')}
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AssetModal;