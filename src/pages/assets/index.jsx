// pages/assets/index.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Download,
  Filter,
  Loader
} from 'lucide-react';
import { fetchAssets, exportAssets, setPage, deleteAsset } from '../../store/slices/assetSlice';
import { fetchAssetTypes } from '../../store/slices/assetTypeSlice';
import AssetTable from './components/AssetTable';
import AssetModal from './components/AssetModal';
import AssetTypeModal from './components/AssetTypeModal';
import AssetTasksModal from './components/AssetTasksModal';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import AlertModal from '../../components/ui/AlertModal';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  color: #64748b;
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
      border-color: var(--color-navy);
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    border: none;
    
    &:hover {
      background: #151b60;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid #e0e0e0;
    
    &:hover {
      background: #f8fafc;
      border-color: var(--color-navy);
    }
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-direction: column;
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AssetList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  
  // Safe selector with fallback values to prevent crashes on refresh
  const { assets, loading, pagination, error } = useSelector(state => ({
    assets: state.assets?.assets || [],
    loading: state.assets?.loading || false,
    pagination: state.assets?.pagination || {
      total: 0,
      page: 1,
      totalPages: 1,
      limit: 10
    },
    error: state.assets?.error || null
  }));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  
  // Modal states for custom confirmations and alerts
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    // Load initial data
    loadAssets();
    loadAssetTypes();
  }, []);

  useEffect(() => {
    // Debounced search effect
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      loadAssets();
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm, pagination.page, filters]);

  const loadAssets = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };
      await dispatch(fetchAssets(params)).unwrap();
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const loadAssetTypes = async () => {
    try {
      await dispatch(fetchAssetTypes()).unwrap();
    } catch (error) {
      console.error('Error loading asset types:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to page 1 when searching
    if (pagination.page !== 1) {
      dispatch(setPage(1));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage !== pagination.page && newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(setPage(newPage));
    }
  };

  const handleExport = async () => {
    setPendingExport({ format: 'xlsx', data: assets });
    setShowDocumentModal(true);
  };

  const handleConfirmExport = async (fileName) => {
    if (!pendingExport) return;
    
    try {
      // Update the export action to use the custom filename
      await dispatch(exportAssets(fileName)).unwrap();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setShowDocumentModal(false);
      setPendingExport(null);
    }
  };

  const handleOpenModal = (asset = null) => {
    setCurrentAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAsset(null);
  };

  const handleOpenTypeModal = () => {
    setIsTypeModalOpen(true);
  };

  const handleCloseTypeModal = () => {
    setIsTypeModalOpen(false);
  };

  const showAlertModal = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.error('No ID provided for delete operation');
      showAlertModal('Error', 'Cannot delete asset - no ID provided', 'error');
      return;
    }
    
    setAssetToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;
    
    try {
      await dispatch(deleteAsset(assetToDelete)).unwrap();
      // Reload assets after successful deletion
      await loadAssets();
      setShowDeleteConfirm(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      showAlertModal('Error', 'Failed to delete asset. Please try again.', 'error');
    }
  };

  const handleViewTasks = (asset) => {
    if (!asset || (!asset._id && !asset.id)) {
      console.error('Invalid asset for viewing tasks:', asset);
      showAlertModal('Error', 'Cannot view tasks for this asset', 'error');
      return;
    }
    setSelectedAsset(asset);
    setIsTasksModalOpen(true);
  };

  const handleAssetSuccess = async () => {
    // Reload data after successful asset operations
    await loadAssets();
    await loadAssetTypes();
  };

  const handleTypeModalSuccess = async () => {
    // Reload asset types after successful operations
    await loadAssetTypes();
  };

  // Error boundary-like error handling
  if (error) {
    return (
      <PageContainer>
        <Header>
          <PageTitle>{t('common.assetManagement')}</PageTitle>
          <SubTitle>{t('common.manageAssetsEfficiently')}</SubTitle>
        </Header>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px',
          color: '#b91c1c'
        }}>
          <p><strong>{t('common.errorLoadingAssets')}:</strong> {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              background: 'var(--color-navy)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <PageTitle>{t('common.assetManagement')}</PageTitle>
        <SubTitle>{t('common.manageAssetsEfficiently')}</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder={t('common.searchAssets')} 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchBox>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={handleOpenTypeModal}
            disabled={loading}
          >
            <Plus size={18} />
            {t('common.addAssetType')}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleExport}
            disabled={loading || assets.length === 0}
          >
            <Download size={18} />
            {t('common.export')}
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => handleOpenModal()}
            disabled={loading}
          >
            <Plus size={18} />
            {t('common.addAsset')}
          </Button>
        </ButtonGroup>
      </ActionBar>

      <AssetTable 
        assets={assets}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onViewTasks={handleViewTasks}
      />
      
      {isModalOpen && (
        <AssetModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          asset={currentAsset}
          onSuccess={handleAssetSuccess}
        />
      )}
      
      {isTypeModalOpen && (
        <AssetTypeModal 
          isOpen={isTypeModalOpen} 
          onClose={handleCloseTypeModal} 
          onSuccess={handleTypeModalSuccess}
        />
      )}

      {isTasksModalOpen && selectedAsset && (
        <AssetTasksModal 
          isOpen={isTasksModalOpen} 
          onClose={() => setIsTasksModalOpen(false)} 
          asset={selectedAsset}
        />
      )}

      {showDocumentModal && pendingExport && (
        <DocumentNamingModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onExport={handleConfirmExport}
          exportFormat={pendingExport.format}
          documentType="Assets-Report"
          defaultCriteria={['documentType', 'currentDate']}
        />
      )}

      {/* Custom Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAssetToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t('common.deleteAsset')}
        message={t('common.deleteAssetConfirm')}
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
    </PageContainer>
  );
};

export default AssetList;