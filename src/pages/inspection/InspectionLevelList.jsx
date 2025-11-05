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
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { inspectionService } from '../../services/inspection.service';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    padding: 2px 5px;
    font-size: 10px;
  }
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
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-width: 160px;
    right: 0;
    left: auto;
  }

  @media (max-width: 480px) {
    min-width: 150px;
    max-width: calc(100vw - 24px);
    right: 0;
    left: auto;
  }
`;

const DropdownItem = styled.a`
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
  }

  &:hover {
    background-color: #f8fafc;
    color: var(--color-navy);
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    gap: 8px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 20px;
      height: 20px;
    }

    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 16px;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    max-width: 100%;
  }

  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;
    box-sizing: border-box;

    @media (max-width: 768px) {
      padding: 8px 14px 8px 38px;
      font-size: 13px;
    }

    @media (max-width: 480px) {
      padding: 8px 12px 8px 36px;
      font-size: 13px;
    }

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

    @media (max-width: 768px) {
      left: 10px;
      width: 18px;
      height: 18px;
    }

    @media (max-width: 480px) {
      left: 10px;
      width: 16px;
      height: 16px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 10px;
    width: 100%;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 14px;
    font-size: 13px;
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
    width: 100%;
    min-width: 0;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }

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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const LevelCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    border-radius: 8px;
  }

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding: 20px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  flex-wrap: wrap;
  gap: 12px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 8px;
  }
`;

const LevelInfo = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
  flex: 1;

  @media (max-width: 768px) {
    gap: 10px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    flex-direction: column;
  }
`;

const LevelIcon = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 8px;
  background: #e3f2fd;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }

  svg {
    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const LevelDetails = styled.div`
  flex: 1;
  text-align: left;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 100%;
  }
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 4px;
    margin-top: 0;
    padding-left: 0;
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 15px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0;
    padding-left: 0;
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 13px;
    }

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
`;

const LevelActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    width: 100%;
    justify-content: flex-start;
  }
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 6px;
  }

  @media (max-width: 480px) {
    padding: 6px;
    font-size: 12px;
  }

  &:hover {
    background: #f5f7fb;
    color: var(--color-navy);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  svg {
    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
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
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-end;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 450px;
  max-width: 90vw;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
    width: 100%;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px 12px 0 0;
    width: 100%;
    max-width: 100%;
    max-height: 85vh;
    overflow-y: auto;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    margin-bottom: 12px;
    gap: 8px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 17px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  
  &:hover {
    color: #333;
  }

  svg {
    @media (max-width: 480px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 8px;
    margin-top: 16px;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const AccordionItemContent = styled.div`
  padding: 0 20px 20px;
  background: #f9fafc;
  border-top: 1px solid #edf2f7;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 16px 16px;
  }

  @media (max-width: 480px) {
    padding: 0 12px 12px;
  }
`;

const LevelStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding: 12px 0;
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 10px;
    padding: 10px 0;
    gap: 8px;
  }
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
  flex: 1;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 12px;
    min-width: 80px;
    flex: 1 1 calc(33.333% - 8px);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    min-width: 0;
    width: 100%;
    flex: 1 1 100%;
  }

  svg {
    width: 18px;
    height: 18px;
    color: #4a5568;
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }

  div {
    text-align: center;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  strong {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
    display: block;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 15px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }

  span {
    font-size: 12px;
    color: #718096;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 11px;
    }

    @media (max-width: 480px) {
      font-size: 10px;
    }
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [pendingExport, setPendingExport] = useState(null);
  const exportDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const translateStatus = (status) => {
    const statusMap = {
      'active': t('common.active'),
      'draft': t('common.draft'),
      'inactive': t('common.inactive')
    };
    return statusMap[status] || status;
  };

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
    setPendingExport({ format, data: inspectionLevels });
    setShowDocumentModal(true);
    setShowExportDropdown(false);
  };

  const handleConfirmExport = async (fileName) => {
    if (!pendingExport) return;
    
    try {
      setLoading(true);
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const params = {
        format: pendingExport.format,
        ids: pendingExport.data.map(level => level._id),
        fileName
      };
      
      await inspectionService.exportInspectionLevels(params);
      toast.success(`Export as ${pendingExport.format.toUpperCase()} successful`);
    } catch (error) {
      console.error('Export failed', error);
      
      let errorMessage = 'Failed to export';
      if (error.response && error.response.data) {
        try {
          const errorData = error.response.data;
          errorMessage = errorData.message || `Failed to export as ${pendingExport.format.toUpperCase()}`;
        } catch (parseError) {
          errorMessage = `Failed to export as ${pendingExport.format.toUpperCase()}`;
        }
      } else {
        errorMessage = error.message || `Failed to export as ${pendingExport.format.toUpperCase()}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowDocumentModal(false);
      setPendingExport(null);
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
                <ModalTitle>{t('inspections.permanentlyDeleteTemplate')}</ModalTitle>
              <ModalCloseButton 
                onClick={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <p>{t('inspections.confirmDeleteTemplate', { name: levelToDelete.name })}</p>
            <p>{t('inspections.deleteTemplateWarning')}</p>
            <ModalActions>
              <Button 
                onClick={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={() => handleDelete(levelToDelete._id)}
                disabled={loading}
                style={{ background: '#dc2626' }}
              >
                {loading ? t('common.deleting') : t('common.delete')}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {publishModalVisible && levelToPublish && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
                <ModalTitle>{isPublishing ? t('inspections.publishTemplate') : t('inspections.unpublishTemplate')}</ModalTitle>
              <ModalCloseButton 
                onClick={() => setPublishModalVisible(false)}
                disabled={loading}
              >
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <p>{t('inspections.confirmPublishUnpublish', { action: isPublishing ? t('inspections.publish') : t('inspections.unpublish'), name: levelToPublish.name })}</p>
            <p>{t('inspections.actionRevertible')}</p>
            <ModalActions>
                  <Button 
                    onClick={() => setPublishModalVisible(false)}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={isPublishing ? handlePublish : handleUnpublish}
                    disabled={loading}
                  >
                    {loading ? (isPublishing ? t('inspections.publishing') : t('inspections.unpublishing')) : (isPublishing ? t('inspections.publish') : t('inspections.unpublish'))}
                  </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      <Header>
        <PageTitle>
          <Layers size={24} />
          {t('inspections.template')}
        </PageTitle>
        <SubTitle>{t('inspections.manageTemplates')}</SubTitle>
      </Header>

      <ActionBar>
        <SearchBox>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder={t('inspections.searchTemplates')} 
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
            {t('common.filter')}
          </Button>
         <ExportDropdown>
            <Button 
              variant="secondary"
              onClick={handleExportDropdownToggle}
              disabled={loading}
            >
              <DownloadDone size={18} />  
              {t('common.export')}
              <ChevronDownCircle size={14} />
            </Button>
            <DropdownContent ref={exportDropdownRef} show={showExportDropdown}>
              <DropdownItem onClick={() => handleExport('pdf')}>
                <FileText size={16} />
                {t('inspections.exportAsPDF')}
              </DropdownItem>
              <DropdownItem onClick={() => handleExport('docx')}>
                <FileText size={16} />
                {t('inspections.exportAsWord')}
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
            {t('inspections.addTemplate')}
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
            {t('inspections.loadingTemplates')}
          </p>
        </LoadingContainer>
      ) : inspectionLevels.length === 0 ? (
        <EmptyState>
          <h3>{t('inspections.noTemplatesFound')}</h3>
          <p>{t('inspections.noTemplatesFoundDescription')}</p>
          <Button 
            variant="primary" 
            as={Link} 
            to="/inspection/create"
          >
            <Plus size={18} />
            {t('inspections.addTemplate')}
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
                  <Accordion.Item value={level._id || level.id} style={{width: '100%'}}>
                    <AccordionTrigger>
                      <AccordionHeader $isRTL={isRTL}>
                        <div style={{display: 'flex', alignItems: 'center', width: '48px', marginRight: isRTL ? '0px' : '12px', marginLeft: isRTL ? '12px' : '0px'}}>
                          <LevelIcon>
                            <Layers size={20} />
                          </LevelIcon>
                        </div>
                        <LevelDetails>
                          <h3 style={{textAlign: isRTL ? 'right' : 'left'}}>{level.name}</h3>
                          <p style={{textAlign: isRTL ? 'right' : 'left'}}>{level.description || t('common.noDescriptionProvided')}</p>
                        </LevelDetails>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginLeft: isRTL ? '0px' : 'auto',
                          marginRight: isRTL ? 'auto' : '0px'
                        }}>
                          {level.status && (
                            <StatusBadge type={level.type || 'marina_operator'}>
                              {translateStatus(level.status) || t('common.active')}
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
                              <span>{t('common.levels')}</span>
                            </div>
                          </StatItem>
                          <StatItem>
                            <ListChecks size={18} />
                            <div>
                              <strong>{questionCount}</strong>
                              <span>{t('common.questions')}</span>
                            </div>
                          </StatItem>
                          <StatItem>
                            <Calendar size={18} />
                            <div>
                              <strong>{new Date(level.createdAt).toLocaleDateString()}</strong>
                              <span>{t('common.created')}</span>
                            </div>
                          </StatItem>
                        </LevelStats>
                        <LevelActions>
                          <Button as={Link} to={`/inspection/${level._id || level.id}`} variant="secondary">
                            <Eye size={16} />
                            {t('common.view')}
                          </Button>
                          <Button as={Link} to={`/inspection/${level._id || level.id}/edit`} variant="secondary">
                            <Edit size={16} />
                            {t('common.edit')}
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
                            {t('common.delete')}
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
                                {t('common.unpublish')}
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                {t('common.publish')}
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

      {showDocumentModal && pendingExport && (
        <DocumentNamingModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          onExport={handleConfirmExport}
          exportFormat={pendingExport.format}
          documentType="Templates-Report"
          defaultCriteria={['documentType', 'currentDate']}
        />
      )}
    </PageContainer>
  );
};

export default InspectionLevelList;