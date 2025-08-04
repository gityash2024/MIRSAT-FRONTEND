import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, Download, Layers, ChevronRight, Edit, Trash2, Eye, ChevronDown, ChevronDownCircle, X, Upload, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as Accordion from '@radix-ui/react-accordion';
import InspectionLevelFilters from './InspectionLevelFilters';
import { FileText } from 'lucide-react';
import { DownloadDone } from '@mui/icons-material';
// import LevelListSkeleton from './LevelListSkeleton'; // COMMENTED OUT
import { ListChecks, Calendar } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchAssetTypes } from '../../store/slices/assetTypeSlice';

const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
`;
const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.type === 'marina_operator' ? '#e8f5e9' : 
    props.type === 'yacht_chartering' ? '#e3f2fd' : 
    props.type === 'tourism_agent' ? '#fff3e0' : '#f3e5f5'};
  color: ${props => props.type === 'marina_operator' ? '#2e7d32' : 
    props.type === 'yacht_chartering' ? '#1565c0' : 
    props.type === 'tourism_agent' ? '#ed6c02' : '#9c27b0'};
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
    color: var(--color-navy);
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
  color: var(--color-navy);
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
    background: var(--color-navy);
    color: white;
    border: none;

    &:hover {
      background: #151b4f;
    }
  ` : `
    background: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);

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
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
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
  color: var(--color-navy);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LevelDetails = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
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
  flex-wrap: wrap;
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
    color: var(--color-navy);
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
    color: var(--color-navy);
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
  animation: slideDown 300ms ease-out;
  
  @keyframes slideDown {
    from {
      height: 0;
      opacity: 0.5;
    }
    to {
      height: var(--radix-accordion-content-height);
      opacity: 1;
    }
  }
`;

const ChevronIcon = styled(ChevronDown)`
  transition: transform 300ms ease;
  
  [data-state=open] & {
    transform: rotate(180deg);
  }
`;

const AccordionRoot = styled(Accordion.Root)`
  width: 100%;
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
  color: var(--color-navy);
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

const AccordionItemContent = styled.div`
  padding: 0 20px 20px;
  background: #f9fafc;
  border-top: 1px solid #edf2f7;
`;

const LevelStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 100px;

  svg {
    width: 18px;
    height: 18px;
    color: #4a5568;
  }

  div {
    text-align: center;
  }

  strong {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
    display: block;
  }

  span {
    font-size: 12px;
    color: #718096;
  }
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
  const [inspectionLevels, setInspectionLevels] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState(null);
  const [levelToPublish, setLevelToPublish] = useState(null);
  const exportDropdownRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch asset types for the filter dropdown
    dispatch(fetchAssetTypes());
    
    // Preprocess data to ensure consistent format
    if (data && Array.isArray(data)) {
      const processedData = data.map(item => {
        if (!item) return null;
        
        // Ensure the item has a sets property if missing
        const itemWithSets = { ...item };
        
        if (!itemWithSets.sets || !Array.isArray(itemWithSets.sets) || itemWithSets.sets.length === 0) {
          itemWithSets.sets = [{
            id: item._id || Date.now(),
            name: item.name ? `${item.name} Set` : 'Main Set',
            description: item.description || 'Main inspection set',
            subLevels: item.subLevels || [],
            questions: item.questions || [],
            generalQuestions: []
          }];
        }
        
        return itemWithSets;
      }).filter(Boolean); // Remove any null items
      
      setInspectionLevels(processedData);
    } else {
      setInspectionLevels([]);
    }
  }, [data, dispatch]);

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
      
      toast.success('Template deleted successfully');
      
      // Refresh data after deletion
      if (fetchData) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(`Failed to delete template: ${error.message}`);
      setLoading(false);
    }
  };

  const handleExportDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExportDropdown(!showExportDropdown);
  };

  const handleExport = async (format) => {
    setShowExportDropdown(false);
    
    try {
      setLoading(true);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const params = {
        format,
        ids: inspectionLevels.map(level => level._id)
      };
      
      await inspectionService.exportInspectionLevels(params);
      toast.success(`Export as ${format.toUpperCase()} successful`);
      setLoading(false);
    } catch (error) {
      console.error('Export failed', error);
      
      let errorMessage = 'Failed to export';
      if (error.response && error.response.data) {
        try {
          const errorData = error.response.data;
          errorMessage = errorData.message || `Failed to export as ${format.toUpperCase()}`;
        } catch (parseError) {
          errorMessage = `Failed to export as ${format.toUpperCase()}`;
        }
      } else {
        errorMessage = error.message || `Failed to export as ${format.toUpperCase()}`;
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Helper function to count subLevels recursively
  const countSubLevels = (subLevels) => {
    if (!subLevels || !Array.isArray(subLevels) || subLevels.length === 0) {
      return 0;
    }
    
    let count = subLevels.length;
    
    // Count nested subLevels
    for (const subLevel of subLevels) {
      if (subLevel.subLevels && Array.isArray(subLevel.subLevels)) {
        count += countSubLevels(subLevel.subLevels);
      }
    }
    
    return count;
  };

  // Helper function to count items
  const countItems = (level) => {
    // Initialize counts
    let subLevelCount = 0;
    let questionCount = 0;
    
    // Count direct sublevels and questions (legacy structure)
    if (level.subLevels && Array.isArray(level.subLevels)) {
      subLevelCount += countSubLevels(level.subLevels);
    }
    
    if (level.questions && Array.isArray(level.questions)) {
      questionCount += level.questions.length;
    }
    
    // Count from sets structure
    if (level.sets && Array.isArray(level.sets)) {
      level.sets.forEach(set => {
        if (set.subLevels && Array.isArray(set.subLevels)) {
          subLevelCount += countSubLevels(set.subLevels);
        }
        if (set.questions && Array.isArray(set.questions)) {
          questionCount += set.questions.length;
        }
        if (set.generalQuestions && Array.isArray(set.generalQuestions)) {
          questionCount += set.generalQuestions.length;
        }
      });
    }
    
    return { subLevelCount, questionCount };
  };

  // Add click outside handler for export dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add a function to handle publish click
  const onPublishClick = (level) => {
    setLevelToPublish(level);
    setPublishModalVisible(true);
  };

  // Add a function to handle publishing the template
  const handlePublish = async () => {
    if (!levelToPublish) return;
    
    try {
      setLoading(true);
      
      // Create publish data with status set to active
      const publishData = {
        ...levelToPublish,
        status: 'active'
      };
      
      await inspectionService.updateInspectionLevel(levelToPublish._id || levelToPublish.id, publishData);
      
      // Close the modal and refresh the data
      setPublishModalVisible(false);
      setLevelToPublish(null);
      toast.success('Template published successfully');
      
      // Refresh the data
      if (fetchData) {
        fetchData();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error publishing template:', error);
      toast.error(`Failed to publish template: ${error.message}`);
      setLoading(false);
    }
  };

  // Add an unpublish handler function after the handlePublish function
  const handleUnpublish = async () => {
    if (!levelToPublish) return;
    
    try {
      setLoading(true);
      
      // Create unpublish data with status set to draft
      const unpublishData = {
        ...levelToPublish,
        status: 'draft'
      };
      
      await inspectionService.updateInspectionLevel(levelToPublish._id || levelToPublish.id, unpublishData);
      
      // Close the modal and refresh the data
      setPublishModalVisible(false);
      setLevelToPublish(null);
      toast.success('Template unpublished successfully');
      
      // Refresh the data
      if (fetchData) {
        fetchData();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error unpublishing template:', error);
      toast.error(`Failed to unpublish template: ${error.message}`);
      setLoading(false);
    }
  };

  // Update the publish modal title and message conditionally
  const isPublishing = levelToPublish && levelToPublish.status !== 'active';

  return (
    <PageContainer>
     {deleteModalVisible && levelToDelete && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete Template</ModalTitle>
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

      {publishModalVisible && levelToPublish && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{isPublishing ? 'Publish Template' : 'Unpublish Template'}</ModalTitle>
              <ModalCloseButton 
                onClick={() => setPublishModalVisible(false)}
                disabled={loading}
              >
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <p>Are you sure you want to {isPublishing ? 'publish' : 'unpublish'} <strong>{levelToPublish.name}</strong>?</p>
            <p>This action can be reverted later.</p>
            <ModalActions>
              <Button 
                onClick={() => setPublishModalVisible(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={isPublishing ? handlePublish : handleUnpublish}
                disabled={loading}
              >
                {loading ? (isPublishing ? 'Publishing...' : 'Unpublishing...') : (isPublishing ? 'Publish' : 'Unpublish')}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      <Header>
        <PageTitle>
          <Layers size={24} />
          Template
        </PageTitle>
        <SubTitle>Manage Templates and their hierarchies</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search Templates..." 
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
            <DropdownContent ref={exportDropdownRef} show={showExportDropdown}>
              {/* <DropdownItem onClick={() => handleExport('docx')}>
                <FileText size={16} />
                Export as Word
              </DropdownItem> */}
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
            Add Template
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
        <LoadingContainer>
          <Loader size={40} color="var(--color-navy)" />
          <p style={{ 
            marginTop: '16px', 
            color: 'var(--color-navy)', 
            fontSize: '16px' 
          }}>
            Templates loading...
          </p>
        </LoadingContainer>
      ) : inspectionLevels.length === 0 ? (
        <EmptyState>
          <h3>No Template Found</h3>
          <p>Create your first template to get started</p>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
          >
            <Plus size={18} />
            Add Template
          </Button>
        </EmptyState>
      ) : (
        <LevelGrid>
          {inspectionLevels.map(level => {
            // Count items in the level
            const { subLevelCount, questionCount } = countItems(level);
            
            return (
              <LevelCard key={level._id || level.id}>
                <AccordionRoot type="single" collapsible>
                  <Accordion.Item value={level._id || level.id}>
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
                            <StatusBadge type={level.type || 'marina_operator'}>
                              {level.status.charAt(0).toUpperCase() + level.status.slice(1) || 'Active'}
                            </StatusBadge>
                          )}
                          <ChevronDown size={20} className="accordion-chevron" />
                        </div>
                      </AccordionHeader>
                    </AccordionTrigger>
                    <AccordionContent>
                      <AccordionItemContent>
                        <LevelStats>
                          <StatItem>
                            <Layers size={18} />
                            <div>
                              <strong>{subLevelCount}</strong>
                              <span>Levels</span>
                            </div>
                          </StatItem>
                          <StatItem>
                            <ListChecks size={18} />
                            <div>
                              <strong>{questionCount}</strong>
                              <span>Questions</span>
                            </div>
                          </StatItem>
                          <StatItem>
                            <Calendar size={18} />
                            <div>
                              <strong>{new Date(level.createdAt).toLocaleDateString()}</strong>
                              <span>Created</span>
                            </div>
                          </StatItem>
                        </LevelStats>
                        <LevelActions>
                          <Button as={Link} to={`/inspection/${level._id || level.id}`} variant="secondary">
                            <Eye size={16} />
                            View
                          </Button>
                          <Button as={Link} to={`/inspection/${level._id || level.id}/edit`} variant="secondary">
                            <Edit size={16} />
                            Edit
                          </Button>
                          <Button 
                            variant="danger"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteClick(level);
                            }}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                          <Button 
                            variant="secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onPublishClick(level);
                            }}
                          >
                            {level.status === 'active' ? (
                              <>
                                <Download size={16} />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Publish
                              </>
                            )}
                          </Button>
                        </LevelActions>
                      </AccordionItemContent>
                    </AccordionContent>
                  </Accordion.Item>
                </AccordionRoot>
              </LevelCard>
            );
          })}
        </LevelGrid>
      )}
    </PageContainer>
  );
};

export default InspectionLevelList;