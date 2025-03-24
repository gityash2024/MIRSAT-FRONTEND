import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, Download, Layers, ChevronRight, Edit, Trash2, Eye, ChevronDown, ChevronDownCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as Accordion from '@radix-ui/react-accordion';
import InspectionLevelFilters from './InspectionLevelFilters';
import { FileText } from 'lucide-react';
import { DownloadDone } from '@mui/icons-material';
import LevelListSkeleton from './LevelListSkeleton';

const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
`;
const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.type === 'safety' ? '#e8f5e9' : 
    props.type === 'environmental' ? '#e3f2fd' : 
    props.type === 'operational' ? '#fff3e0' : '#f3e5f5'};
  color: ${props => props.type === 'safety' ? '#2e7d32' : 
    props.type === 'environmental' ? '#1565c0' : 
    props.type === 'operational' ? '#ed6c02' : '#9c27b0'};
`;
const DropdownContent = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
  z-index: 10;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 5px;
`;

const DropdownItem = styled.a`
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8fafc;
    color: #1a237e;
  }
`;

const flattenSubLevels = (subLevels, level = 0) => {
  let result = [];
  
  if (!subLevels || !subLevels.length) return result;
  
  subLevels.forEach(subLevel => {
    result.push({ ...subLevel, nestLevel: level });
    
    if (subLevel.subLevels && subLevel.subLevels.length > 0) {
      result = [...result, ...flattenSubLevels(subLevel.subLevels, level + 1)];
    }
  });
  
  return result;
};

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
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubTitle = styled.p`
  color: #666;
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
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;

  ${props => props.variant === 'primary' ? `
    background: #1a237e;
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: #1a237e;
    border: 1px solid #1a237e;

    &:hover {
      background: #f5f7fb;
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LevelGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const LevelCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const LevelInfo = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const LevelIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e3f2fd;
  color: #1a237e;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LevelDetails = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 4px;
    display: flex;
    align-items: flex-start; 
  }

  p {
    font-size: 14px;
    color: #666;
  }
`;

const LevelActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f7fb;
    color: #1a237e;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SubLevelsList = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const SubLevel = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubLevelIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f3e5f5;
  color: #9c27b0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 0;
  color: #666;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #1a237e;
  }

  p {
    margin-bottom: 16px;
  }
`;

const AccordionTrigger = styled(Accordion.Trigger)`
  width: 100%;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
`;

const AccordionContent = styled(Accordion.Content)`
  overflow: hidden;
`;

const ChevronIcon = styled(ChevronDown)`
  transition: transform 300ms;
  [data-state=open] & {
    transform: rotate(180deg);
  }
`;

const AccordionRoot = styled(Accordion.Root)`
  width: 100%;
`;

const ModalOverlay = styled.div`
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
  width: 450px;
  max-width: 90vw;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const InspectionLevelList = ({ 
  loading, 
  setLoading, 
  handleError, 
  inspectionService,
  data,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  fetchData
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Use local reference to data
  const inspectionLevels = data || [];
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSearch = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleFilterChange = (newFilters) => {
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const onDeleteClick = (level) => {
    setLevelToDelete(level);
    setDeleteModalVisible(true);
  };
  
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await inspectionService.deleteInspectionLevel(id);
      
      setDeleteModalVisible(false);
      setLevelToDelete(null);
      
      toast.success('Inspection level deleted successfully');
      
      // Refresh data after deletion
      if (fetchData) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting inspection level:', error);
      toast.error('Failed to delete inspection level');
      setLoading(false);
    }
  };

  const handleExportDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExport = (format) => {
    setShowExportDropdown(false);
    
    const params = {
      format,
      ids: inspectionLevels.map(level => level._id)
    };
    
    inspectionService.exportInspectionLevels(params)
      .then(() => {
        toast.success(`Export as ${format.toUpperCase()} successful`);
      })
      .catch(error => {
        console.error('Export failed', error);
        toast.error(`Failed to export as ${format.toUpperCase()}`);
      });
  };

  return (
    <PageContainer>
     {deleteModalVisible && levelToDelete && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete Inspection Level</ModalTitle>
              <ModalCloseButton 
                onClick={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <p>Are you sure you want to delete <strong>{levelToDelete.name}</strong>?</p>
            <p>This action cannot be undone.</p>
            <ModalActions>
              <Button 
                onClick={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => handleDelete(levelToDelete._id)}
                disabled={loading}
                style={{ background: '#dc2626' }}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      <Header>
        <PageTitle>
          <Layers size={24} />
          Inspection Levels
        </PageTitle>
        <SubTitle>Manage inspection levels and their hierarchies</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search inspection levels..." 
            value={searchTerm}
            onChange={handleSearch}
            disabled={loading}
          />
        </SearchBox>

        <ButtonGroup>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            <Filter size={18} />
            Filters
          </Button>
         <ExportDropdown>
            <Button 
              variant="secondary"
              onClick={handleExportDropdownToggle}
              disabled={loading}
            >
              <DownloadDone size={18} />  
              Export
              <ChevronDownCircle size={14} />
            </Button>
            <DropdownContent show={showExportDropdown}>
              <DropdownItem onClick={() => handleExport('docx')}>
                <FileText size={16} />
                Export as Word
              </DropdownItem>
              <DropdownItem onClick={() => handleExport('pdf')}>
                <FileText size={16} />
                Export as PDF
              </DropdownItem>
            </DropdownContent>
          </ExportDropdown>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
            disabled={loading}
          >
            <Plus size={18} />
            Add Inspection Level
          </Button>
        </ButtonGroup>
      </ActionBar>

      {showFilters && (
        <InspectionLevelFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
          loading={loading}
        />
      )}

      {loading ? (
        <LevelListSkeleton />
      ) : inspectionLevels.length === 0 ? (
        <EmptyState>
          <h3>No Inspection Levels Found</h3>
          <p>Create your first inspection level to get started</p>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
          >
            <Plus size={18} />
            Add Inspection Level
          </Button>
        </EmptyState>
      ) : (
        <LevelGrid>
          {inspectionLevels.map(level => (
            <LevelCard key={level._id}>
              <AccordionRoot type="single" collapsible>
                <Accordion.Item value={level._id}>
                  <AccordionTrigger>
                    <AccordionHeader>
                      <LevelInfo>
                        <LevelIcon>
                          <Layers size={20} />
                        </LevelIcon>
                        <LevelDetails>
                          <h3>{level.name}</h3>
                          <p>{level.description}</p>
                        </LevelDetails>
                      </LevelInfo>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  {level.status && (
    <StatusBadge type={level.type || 'safety'}>
      {level.status.charAt(0).toUpperCase() + level.status.slice(1) || 'Active'}
    </StatusBadge>
  )}
                      <LevelActions>
                        <ActionButton 
                          as={Link} 
                          to={`/inspection/${level._id}`}
                          disabled={loading}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye size={16} />
                        </ActionButton>
                        <ActionButton 
                          as={Link} 
                          to={`/inspection/${level._id}/edit`}
                          disabled={loading}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit size={16} />
                        </ActionButton>
                        <ActionButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick(level);
                          }}
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </ActionButton>
                        <ChevronIcon size={16} />
                      </LevelActions>
                      </div>
                    </AccordionHeader>
                  </AccordionTrigger>
                  <AccordionContent>
                    <SubLevelsList>
                      {flattenSubLevels(level.subLevels).map(subLevel => (
                        <SubLevel 
                          key={subLevel._id || subLevel.id} 
                          style={{ marginLeft: `${subLevel.nestLevel * 20}px` }}
                        >
                          <SubLevelIcon>
                            <ChevronRight size={16} />
                          </SubLevelIcon>
                          <span>{subLevel.name}</span>
                        </SubLevel>
                      ))}
                    </SubLevelsList>
                  </AccordionContent>
                </Accordion.Item>
              </AccordionRoot>
            </LevelCard>
          ))}
        </LevelGrid>
      )}
    </PageContainer>
  );
};

export default InspectionLevelList;