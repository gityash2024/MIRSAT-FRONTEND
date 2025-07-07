// pages/assets/components/AssetTable.jsx
import React from 'react';
import styled from 'styled-components';
import { Eye, Edit, Trash, MoreVertical, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader } from 'lucide-react';
// import Skeleton from '../../../components/ui/Skeleton'; // COMMENTED OUT

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    position: relative;
  }

  th {
    background: #f5f7fb;
    font-weight: 600;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: #e8eaf6;
    }
  }

  td {
    font-size: 14px;
    color: #666;
  }

  tbody tr:hover {
    background: #f5f7fb;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderText = styled.span`
  flex: 1;
`;

const SortIcon = styled.div`
  display: flex;
  align-items: center;
`;

const RowNumber = styled.td`
  width: 50px;
  text-align: center;
  color: #999;
  font-size: 12px;
`;

const ActionsCell = styled.td`
  width: 100px;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.danger ? '#fee2e2' : '#f5f7fb'};
  color: ${props => props.danger ? '#dc2626' : 'var(--color-navy)'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? '#fecaca' : '#e8eaf6'};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const PaginationText = styled.div`
  font-size: 14px;
  color: #666;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${props => props.active ? 'var(--color-navy)' : '#f5f7fb'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'var(--color-navy)' : '#e8eaf6'};
  }
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
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

const LoadingRow = styled.div`
  margin-bottom: 8px;
`;

const AssetTable = ({ 
  assets, 
  loading, 
  pagination, 
  onPageChange, 
  onEdit, 
  onDelete,
  onViewTasks
}) => {
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    }
    
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>#</th>
            <th>
              <HeaderContent>
                <HeaderText>Unique ID</HeaderText>
              </HeaderContent>
            </th>
            <th>
              <HeaderContent>
                <HeaderText>Type</HeaderText>
              </HeaderContent>
            </th>
            <th>
              <HeaderContent>
                <HeaderText>Display Name</HeaderText>
              </HeaderContent>
            </th>
            <th>
              <HeaderContent>
                <HeaderText>City</HeaderText>
              </HeaderContent>
            </th>
            <th>
              <HeaderContent>
                <HeaderText>Location</HeaderText>
              </HeaderContent>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7}>
                <LoadingContainer>
                  <Loader size={40} color="var(--color-navy)" />
                  <p style={{ 
                    marginTop: '16px', 
                    color: 'var(--color-navy)', 
                    fontSize: '16px' 
                  }}>
                    Assets loading...
                  </p>
                </LoadingContainer>
              </td>
            </tr>
          ) : assets.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <EmptyState>No assets found. Create a new asset to get started.</EmptyState>
              </td>
            </tr>
          ) : (
            assets.map((asset, index) => (
              <tr key={asset._id}>
                <RowNumber>{(pagination.page - 1) * pagination.limit + index + 1}</RowNumber>
                <td>{asset.uniqueId||'--'}</td>
                <td>{asset.type||'--'}</td>
                <td>{asset.displayName||'--'}</td>
                <td>{asset.city||'--'}</td>
                <td>{asset.location||'--'}</td>
                <ActionsCell>
                  <ActionButtonGroup>
                    <ActionButton onClick={() => onViewTasks(asset)}>
                      <Eye size={16} />
                    </ActionButton>
                    <ActionButton onClick={() => onEdit(asset)}>
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton danger onClick={() => {
                      // Use fallback for asset ID
                      const assetId = asset._id || asset.id;
                      
                      if (!assetId) {
                        console.error('No valid asset ID found for delete:', asset);
                        alert('Error: Cannot delete asset - no valid ID found');
                        return;
                      }
                      
                      onDelete(assetId);
                    }}>
                      <Trash size={16} />
                    </ActionButton>
                  </ActionButtonGroup>
                </ActionsCell>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      
      {!loading && assets.length > 0 && (
        <PaginationContainer>
          <PaginationText>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} assets
          </PaginationText>
          <PaginationControls>
            <PaginationButton
              disabled={pagination.page === 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronLeft size={16} />
              <ChevronLeft size={16} style={{ marginLeft: '-8px' }} />
            </PaginationButton>
            <PaginationButton
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </PaginationButton>
            
            {getPageNumbers().map(pageNum => (
              <PaginationButton
                key={pageNum}
                active={pageNum === pagination.page}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </PaginationButton>
            ))}
            
            <PaginationButton
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </PaginationButton>
            <PaginationButton
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.totalPages)}
            >
              <ChevronRight size={16} />
              <ChevronRight size={16} style={{ marginLeft: '-8px' }} />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </TableContainer>
  );
};

export default AssetTable;