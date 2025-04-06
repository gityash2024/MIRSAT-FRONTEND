// pages/assets/index.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Search, 
  Download,
  Filter
} from 'lucide-react';
import { fetchAssets, exportAssets, setPage, deleteAsset } from '../../store/slices/assetSlice';
import { fetchAssetTypes } from '../../store/slices/assetTypeSlice';
import AssetTable from './components/AssetTable';
import AssetModal from './components/AssetModal';
import AssetTypeModal from './components/AssetTypeModal';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';

const PageContainer = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
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
      border-color: #1a237e;
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
    background: #1a237e;
    color: white;
    border: none;
    
    &:hover {
      background: #151b60;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #e0e0e0;
    
    &:hover {
      background: #f8fafc;
      border-color: #1a237e;
    }
  `}
`;

const AssetList = () => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const { assets, loading, pagination } = useSelector(state => state.assets);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadAssets();
    dispatch(fetchAssetTypes());
  }, [pagination.page, searchTerm]);

  const loadAssets = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      ...filters
    };
    dispatch(fetchAssets(params));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleExport = () => {
    dispatch(exportAssets());
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      dispatch(deleteAsset(id)).then(() => {
        loadAssets();
      });
    }
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>Asset Management</PageTitle>
        <SubTitle>Manage your assets efficiently</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchBox>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={handleOpenTypeModal}
          >
            <Plus size={18} />
            Add Asset Type
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleExport}
          >
            <Download size={18} />
            Export
          </Button>
          
          <Button 
            variant="primary" 
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} />
            Add Asset
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
      />
      
      {isModalOpen && (
        <AssetModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          asset={currentAsset}
          onSuccess={loadAssets}
        />
      )}
      
      {isTypeModalOpen && (
        <AssetTypeModal 
          isOpen={isTypeModalOpen} 
          onClose={handleCloseTypeModal} 
          onSuccess={() => dispatch(fetchAssetTypes())}
        />
      )}
    </PageContainer>
  );
};

export default AssetList;