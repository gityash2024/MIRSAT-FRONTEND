import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Layers,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Activity,
  User,
  Calendar,
  Clock,
  ListChecks,
  ChevronRight,
  ChevronDown,
  Copy,
  Clipboard,
  FileText,
  PenTool
} from 'lucide-react';
import { inspectionService } from '../../services/inspection.service';
import InspectionLayout from '../../components/common/InspectionLayout';
import CollapsibleSection from '../../components/ui/CollapsibleSection';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 20px;
  }

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
`;

const SummaryCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  border-top: 3px solid ${props => props.color || 'var(--color-navy)'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 6px;
  }
`;

const SummaryLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color || 'var(--color-navy)'};
  margin-bottom: 16px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 10px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const SummaryDescription = styled.div`
  font-size: 13px;
  color: var(--color-gray-medium);
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  // grid-template-columns: 3fr 2fr;
  gap: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 16px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 12px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const LevelHierarchy = styled.div`
  margin-top: 20px;
`;

const QuestionnaireCard = styled(Card)`
  margin-top: 24px;
`;

const StatsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatCard = styled.div`
  background-color: var(--color-offwhite);
  padding: 16px;
  border-radius: 8px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: var(--color-gray-medium);
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-navy);
`;

const HierarchyNode = styled.div`
  margin-bottom: ${props => props.isLast ? '0' : '8px'};
  margin-left: ${props => props.level > 0 ? `${props.level * 20}px` : '0'};
`;

const NodeContent = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--color-offwhite);
  padding: 12px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--color-skyblue);
  }
`;

const NodeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--color-navy);
  color: white;
  border-radius: 6px;
  margin-right: 12px;
`;

const NodeInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-navy);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    font-size: 13px;
    color: var(--color-gray-medium);
    margin: 0;
  }
`;

const NodeMetadata = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;

const MetadataItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-gray-medium);
`;

const NodeActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.color || 'var(--color-offwhite)'};
  color: ${props => props.textColor || 'var(--color-navy)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.hoverColor || 'var(--color-skyblue)'};
  }
`;

const LevelNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-skyblue);
  color: var(--color-navy);
  border-radius: 4px;
    font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
`;

const ExpandCollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-gray-medium);
  margin-right: 8px;
  
  &:hover {
    color: var(--color-navy);
  }
`;

const QuestionList = styled.div`
  margin-top: 16px;
`;

const QuestionItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--color-gray-light);
  
  &:last-child {
    border-bottom: none;
  }
`;

// Accordion styled components for pages and sections
const PageAccordionContainer = styled.div`
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 14px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const PageAccordionHeader = styled.div`
  background: var(--color-navy);
  color: white;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 10px 14px;
    border-radius: 6px 6px 0 0;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 6px;
  }

  strong {
    flex: 1;
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-size: 15px;

    @media (max-width: 768px) {
      font-size: 14px;
    }

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  span {
    font-size: 13px;
    opacity: 0.7;
    white-space: nowrap;
    flex-shrink: 0;

    @media (max-width: 768px) {
      font-size: 12px;
    }

    @media (max-width: 480px) {
      font-size: 11px;
    }
  }

  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-right: 8px;

    @media (max-width: 768px) {
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }
  }
`;

const PageAccordionContent = styled.div`
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    border-radius: 0 0 6px 6px;
  }

  @media (max-width: 480px) {
    border-radius: 0 0 4px 4px;
  }
`;

const PageDescription = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  background: #f8fafc;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const SectionAccordionContainer = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const SectionAccordionHeader = styled.div`
  background: #f1f5f9;
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 10px 14px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 4px;
  }

  strong {
    flex: 1;
    min-width: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    font-size: 14px;

    @media (max-width: 768px) {
      font-size: 13px;
    }

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  span {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
    flex-shrink: 0;

    @media (max-width: 768px) {
      font-size: 11px;
    }

    @media (max-width: 480px) {
      font-size: 10px;
    }
  }

  svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-right: 8px;

    @media (max-width: 768px) {
      width: 14px;
      height: 14px;
      margin-right: 6px;
    }

    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
      margin-right: 4px;
    }
  }
`;

const SectionAccordionContent = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const SectionDescription = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  background: #f8fafc;
  font-style: italic;
  color: #64748b;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 11px;
  }
`;

const QuestionsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const QuestionListItem = styled.li`
  padding: 12px 16px 12px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 10px 14px 10px 20px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px 10px 16px;
  }
`;

const QuestionItemContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    flex-wrap: wrap;
  }
`;

const QuestionNumberBadge = styled.div`
  min-width: 24px;
  height: 24px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    min-width: 22px;
    height: 22px;
    font-size: 11px;
    border-radius: 11px;
  }

  @media (max-width: 480px) {
    min-width: 20px;
    height: 20px;
    font-size: 10px;
    border-radius: 10px;
  }
`;

const QuestionTextContent = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const QuestionTextDisplay = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 3px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 2px;
  }
`;

const QuestionDescriptionDisplay = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    margin-bottom: 4px;
  }
`;

const QuestionOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 5px;
    margin-top: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    margin-top: 4px;
  }
`;

const QuestionOptionBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  background: #e2e8f0;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 3px 7px;
    font-size: 11px;
  }

  @media (max-width: 480px) {
    padding: 3px 6px;
    font-size: 10px;
  }
`;

const EmptyStateMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #94a3b8;
  background: white;
  font-style: italic;
  font-size: 13px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 14px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 11px;
  }
`;

const QuestionText = styled.div`
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequiredTag = styled.span`
  background-color: #fff0f0;
  color: #e53e3e;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  margin-left: 8px;
`;

const QuestionDescription = styled.div`
  color: var(--color-gray-medium);
  font-size: 14px;
  margin-bottom: 8px;
`;

const OptionsList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const OptionItem = styled.div`
  background-color: var(--color-offwhite);
  color: var(--color-navy);
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
`;

const QuestionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-gray-medium);
`;

const QuestionType = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background-color: var(--color-skyblue);
  color: var(--color-navy);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  ${props => props.variant === 'primary' && `
    background-color: var(--color-navy);
    color: white;
  border: none;
  
  &:hover {
      background-color: var(--color-navy-dark);
  }
  `}
  
  ${props => props.variant === 'secondary' && `
    background-color: white;
    color: var(--color-navy);
    border: 1px solid var(--color-navy);
    
    &:hover {
      background-color: var(--color-offwhite);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background-color: #fee2e2;
    color: #dc2626;
    border: none;
    
    &:hover {
      background-color: #fecaca;
    }
  `}
`;

// Confirmation modal for delete
const Modal = styled.div`
  position: fixed;
    top: 0;
    left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
`;

const ModalMessage = styled.p`
  margin: 0 0 24px 0;
  color: var(--color-gray-medium);
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const InspectionLevelView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [activeTab, setActiveTab] = useState('pages');

  useEffect(() => {
    fetchInspectionLevel();
  }, [id]);

  const fetchInspectionLevel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const data = await inspectionService.getInspectionLevel(id);
        console.log('Retrieved template data:', data);
        
        // Process the data to ensure consistent format for display
        let processedData = {
          ...data,
          // Ensure these fields exist
          pages: data.pages || [],
          subLevels: data.subLevels || []
        };
        
        setLevel(processedData);
        setLoading(false);
      } catch (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error fetching inspection level:', err);
      setError(err.message || t('inspections.failedToFetchLevel'));
      setLoading(false);
      toast.error(`${t('inspections.failedToLoadTemplate')}: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      try {
        await inspectionService.deleteInspectionLevel(id);
        toast.success('Template deleted successfully');
        navigate('/inspection');
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(`Failed to delete template: ${error.message}`);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      
      // Create publish data with status set to active
      const publishData = {
        ...level,
        status: 'active'
      };
      
      try {
        await inspectionService.updateInspectionLevel(id, publishData);
        toast.success('Template published successfully');
        // Refresh the data
        window.location.reload();
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error publishing template:', error);
      toast.error(`Failed to publish template: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      // Implement duplicate logic
      toast.success(t('inspections.templateDuplicatedSuccessfully'));
    } catch (err) {
      console.error('Error duplicating template:', err);
      toast.error(t('inspections.failedToDuplicateTemplate'));
    }
  };

  const toggleNodeExpanded = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };
  
  // Count total items in the template (levels, questions)
  const countTotalItems = (data) => {
    let levelCount = 0;
    let questionCount = 0;
    
    if (!data) return { levelCount, questionCount };
    
    // Count from sets structure
    if (data.sets && Array.isArray(data.sets)) {
      data.sets.forEach(set => {
        // Count general questions
        if (set.generalQuestions && Array.isArray(set.generalQuestions)) {
          questionCount += set.generalQuestions.length;
        }
      
        // Count questions directly in the set
        if (set.questions && Array.isArray(set.questions)) {
          questionCount += set.questions.length;
        }
        
        // Count from subLevels recursively
        const countFromSubLevels = (subLevels) => {
          if (!subLevels || !Array.isArray(subLevels)) return;
          
          levelCount += subLevels.length;
          
          subLevels.forEach(level => {
            if (level.questions && Array.isArray(level.questions)) {
              questionCount += level.questions.length;
            }
            countFromSubLevels(level.subLevels);
          });
        };
        
        countFromSubLevels(set.subLevels);
      });
    } else {
      // Legacy structure
      if (data.questions && Array.isArray(data.questions)) {
        questionCount += data.questions.length;
      }
      
      const countFromSubLevels = (subLevels) => {
        if (!subLevels || !Array.isArray(subLevels)) return;
        
        levelCount += subLevels.length;
        
        subLevels.forEach(level => {
          if (level.questions && Array.isArray(level.questions)) {
            questionCount += level.questions.length;
          }
          countFromSubLevels(level.subLevels);
        });
      };
      
      countFromSubLevels(data.subLevels);
    }
    
    return { levelCount, questionCount };
  };
  
  // Count questions in a set
  const countSetQuestions = (set) => {
    let count = 0;
    
    if (set.questions && Array.isArray(set.questions)) {
      count += set.questions.length;
    }
    
    if (set.generalQuestions && Array.isArray(set.generalQuestions)) {
      count += set.generalQuestions.length;
    }
    
    const countFromSubLevels = (subLevels) => {
      if (!subLevels || !Array.isArray(subLevels)) return 0;
      
      let total = 0;
      subLevels.forEach(level => {
        if (level.questions && Array.isArray(level.questions)) {
          total += level.questions.length;
        }
        total += countFromSubLevels(level.subLevels);
      });
      
      return total;
    };
    
    count += countFromSubLevels(set.subLevels);
    return count;
  };

  // Render hierarchy for a set
  const renderLevelHierarchy = (subLevels, prefix = '') => {
    if (!subLevels || !Array.isArray(subLevels) || subLevels.length === 0) {
      return (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--color-gray-medium)',
          background: 'var(--color-offwhite)',
          borderRadius: '8px'
        }}>
          {t('inspections.noLevelsDefined')}
        </div>
      );
    }
    
    return subLevels.map((subLevel, index) => {
      const nodeId = subLevel._id || subLevel.id || `node-${index}`;
      const isExpanded = expandedNodes[nodeId];
          const hasChildren = subLevel.subLevels && Array.isArray(subLevel.subLevels) && subLevel.subLevels.length > 0;
      const questionsCount = (subLevel.questions?.length || 0);
      const levelNumber = prefix ? `${prefix}.${index + 1}` : String.fromCharCode(65 + index);
          
          return (
            <HierarchyNode 
          key={nodeId} 
              level={prefix.split('.').length + (prefix ? 0 : 1)}
              isLast={index === subLevels.length - 1}
            >
              <NodeContent>
                {hasChildren && (
                  <ExpandCollapseButton onClick={() => toggleNodeExpanded(nodeId)}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </ExpandCollapseButton>
                )}
                <NodeIcon>
                  <Layers size={18} />
                </NodeIcon>
                <NodeInfo>
                  <h4>
                    <LevelNumber>{levelNumber}</LevelNumber>
                    {subLevel.name || t('inspections.unnamedLevel')}
                  </h4>
                  <p>{subLevel.description || t('inspections.noDescriptionProvided')}</p>
                  <NodeMetadata>
                    {questionsCount > 0 && (
                      <MetadataItem>
                        <ListChecks size={12} />
                        {questionsCount} {questionsCount !== 1 ? t('inspections.questions') : t('inspections.question')}
                      </MetadataItem>
                    )}
                    {hasChildren && (
                      <MetadataItem>
                        <Layers size={12} />
                        {subLevel.subLevels.length} Sub-level{subLevel.subLevels.length !== 1 ? 's' : ''}
                      </MetadataItem>
                    )}
                  </NodeMetadata>
                </NodeInfo>
                <NodeActions>
              {/* <ActionButton>
                    <Eye size={16} />
                  </ActionButton>
              <ActionButton>
                    <Edit size={16} />
                  </ActionButton> */}
                </NodeActions>
              </NodeContent>
              
              {hasChildren && isExpanded && (
            <div style={{ marginTop: '8px' }}>
              {renderLevelHierarchy(subLevel.subLevels, levelNumber)}
            </div>
              )}
            </HierarchyNode>
          );
    });
  };
  
  // Render questions from a set
  const renderQuestions = (set) => {
    const allQuestions = [
      ...(set.generalQuestions || []).map(q => ({ ...q, isGeneral: true })),
      ...(set.questions || [])
    ];
    
    if (allQuestions.length === 0) {
      return (
        <div style={{ 
          padding: '16px', 
          background: 'var(--color-offwhite)', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: 'var(--color-gray-medium)'
        }}>
          <AlertTriangle size={18} style={{ marginBottom: '8px' }} />
          <p>{t('inspections.noQuestionsDefined')}</p>
        </div>
      );
    }
    
    return (
      <QuestionList>
        {allQuestions.map((question, index) => (
          <QuestionItem key={question._id || question.id || index}>
            <QuestionText>
              {index + 1}. {question.text || t('inspections.untitledQuestion')}
            </QuestionText>
            <QuestionMeta>
              <div>
                <QuestionType>
                  {question.answerType === 'yesno' ? t('inspections.yesNo') : 
                   question.answerType === 'multiple' ? t('inspections.multipleChoice') : 
                   question.answerType === 'text' ? t('inspections.textInput') : 
                   t('inspections.standard')}
                </QuestionType>
                {question.isGeneral && (
                  <span style={{ marginLeft: '8px', fontSize: '11px' }}>
                    {t('inspections.generalQuestion')}
                  </span>
                )}
              </div>
              <div>
                {question.required ? t('common.required') : t('common.optional')}
              </div>
            </QuestionMeta>
          </QuestionItem>
        ))}
      </QuestionList>
    );
  };

  // Render pages and sections in a hierarchical structure
  const renderPagesAndSections = () => {
    if (!level || !level.pages || level.pages.length === 0) {
      return (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--color-gray-medium)',
          background: 'var(--color-offwhite)',
          borderRadius: '8px'
        }}>
          {t('inspections.noPagesOrSectionsDefined')}
        </div>
      );
    }
    
    return (
      <div>
        {level.pages.map((page, pageIndex) => {
          const pageId = page._id || page.id || `page-${pageIndex}`;
          const isPageExpanded = expandedNodes[pageId];
          
          return (
            <PageAccordionContainer key={pageId}>
              <PageAccordionHeader onClick={() => toggleNodeExpanded(pageId)}>
                {isPageExpanded ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
                <strong>{t('inspections.page')} {pageIndex + 1}: {page.name}</strong>
                {page.sections && (
                  <span>
                    {page.sections.length} {page.sections.length !== 1 ? t('inspections.sections') : t('inspections.section')}
                  </span>
                )}
              </PageAccordionHeader>
              
              {isPageExpanded && (
                <PageAccordionContent>
                  {page.description && (
                    <PageDescription>
                      {page.description}
                    </PageDescription>
                  )}
                  
                  {page.sections && page.sections.length > 0 ? (
                    page.sections.map((section, sectionIndex) => {
                      const sectionId = section._id || section.id || `section-${pageIndex}-${sectionIndex}`;
                      const isSectionExpanded = expandedNodes[sectionId];
                      const questionCount = section.questions?.length || 0;
                      
                      return (
                        <SectionAccordionContainer key={sectionId}>
                          <SectionAccordionHeader onClick={() => toggleNodeExpanded(sectionId)}>
                            {isSectionExpanded ? (
                              <ChevronDown />
                            ) : (
                              <ChevronRight />
                            )}
                            <strong>{t('inspections.section')} {sectionIndex + 1}: {section.name}</strong>
                            {questionCount > 0 && (
                              <span>
                                {questionCount} {questionCount !== 1 ? t('inspections.questions') : t('inspections.question')}
                              </span>
                            )}
                          </SectionAccordionHeader>
                          
                          {isSectionExpanded && (
                            <SectionAccordionContent>
                              {section.description && (
                                <SectionDescription>
                                  {section.description}
                                </SectionDescription>
                              )}
                              
                              {section.questions && section.questions.length > 0 ? (
                                <QuestionsList>
                                  {section.questions.map((question, questionIndex) => (
                                    <QuestionListItem 
                                      key={question._id || question.id || `q-${questionIndex}`}
                                    >
                                      <QuestionItemContent>
                                        <QuestionNumberBadge>
                                          {questionIndex + 1}
                                        </QuestionNumberBadge>
                                        <QuestionTextContent>
                                          <QuestionTextDisplay>
                                            {question.text}
                                          </QuestionTextDisplay>
                                          {question.description && (
                                            <QuestionDescriptionDisplay>
                                              {question.description}
                                            </QuestionDescriptionDisplay>
                                          )}
                                          {question.options && question.options.length > 0 && (
                                            <QuestionOptionsContainer>
                                              {question.options.map((option, optionIndex) => (
                                                <QuestionOptionBadge key={optionIndex}>
                                                  {option}
                                                </QuestionOptionBadge>
                                              ))}
                                            </QuestionOptionsContainer>
                                          )}
                                        </QuestionTextContent>
                                      </QuestionItemContent>
                                    </QuestionListItem>
                                  ))}
                                </QuestionsList>
                              ) : (
                                <EmptyStateMessage>
                                  No questions in this section
                                </EmptyStateMessage>
                              )}
                            </SectionAccordionContent>
                          )}
                        </SectionAccordionContainer>
                      );
                    })
                  ) : (
                    <EmptyStateMessage>
                      No sections in this page
                    </EmptyStateMessage>
                  )}
                </PageAccordionContent>
              )}
            </PageAccordionContainer>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <InspectionLayout 
        title={t('inspections.loadingTemplate')} 
        baseUrl={`/inspection/${id}`}
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <div className="spinner" style={{
              border: '3px solid #f3f3f3',
              borderTop: '3px solid var(--color-navy)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
          <p>{t('inspections.loadingTemplateData')}</p>
        </div>
      </InspectionLayout>
    );
  }

  if (error || !level) {
    return (
      <InspectionLayout 
        title={t('common.error')} 
        baseUrl={`/inspection/${id}`}
      >
        <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 16px' }} />
          <p>{t('inspections.failedToLoadTemplateData')}</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/inspection')}
            style={{ margin: '16px auto 0', display: 'inline-flex' }}
          >
            {t('inspections.backToTemplates')}
          </Button>
        </div>
      </InspectionLayout>
    );
  }

  const { levelCount, questionCount } = countTotalItems(level);

  return (
    <InspectionLayout 
      title={level.name || t('inspections.inspectionTemplate')} 
      onBack={() => navigate('/inspection')}
      onPublish={handlePublish}
      baseUrl={`/inspection/${id}`}
      lastPublished={level.updatedAt ? new Date(level.updatedAt).toLocaleString() : null}
      showBuildTabOnly={true}
    >
      <PageContainer>
        <SummarySection>
          <SummaryCard color="var(--color-navy)">
            <SummaryLabel color="var(--color-navy)">
              <Layers size={16} />
              {t('inspections.templateType')}
            </SummaryLabel>
            <SummaryValue>
              {level.type ? level.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : t('inspections.generalTemplate')}
            </SummaryValue>
            <SummaryDescription>
              {level.status ? level.status.charAt(0).toUpperCase() + level.status.slice(1) : t('common.active')} • 
              {level.priority ? ` ${level.priority.charAt(0).toUpperCase() + level.priority.slice(1)} Priority` : ''}
            </SummaryDescription>
          </SummaryCard>
{/*           
          <SummaryCard color="var(--color-teal)">
            <SummaryLabel color="var(--color-teal)">
              <ListChecks size={16} />
              Questions
            </SummaryLabel>
            <SummaryValue>
              {questionCount} Questions
            </SummaryValue>
            <SummaryDescription>
              {level.questions && Array.isArray(level.questions) ? 
                `${level.questions.filter(q => q.required !== false).length || 0} Required • 
                 ${level.questions.filter(q => q.required === false).length || 0} Optional` : 
                 'No direct questions'
              }
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard color="var(--color-seafoam)">
            <SummaryLabel color="var(--color-seafoam)">
              <Layers size={16} />
              Levels
            </SummaryLabel>
            <SummaryValue>
              {levelCount} Levels
            </SummaryValue>
            <SummaryDescription>
              Created on {new Date(level.createdAt).toLocaleDateString()}
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard color="var(--color-coral)">
            <SummaryLabel color="var(--color-coral)">
              <Activity size={16} />
              Compliance Rate
            </SummaryLabel>
            <SummaryValue>
              {level.metrics?.complianceRate || 'N/A'}
            </SummaryValue>
            <SummaryDescription>
              {level.metrics?.completedTasks || 0} completed tasks
            </SummaryDescription>
          </SummaryCard> */}
        </SummarySection>

        <ButtonGroup>
          <Button 
            as={Link} 
            to={`/inspection/${id}/edit/build`}
            variant="primary"
          >
            <Edit size={16} />
            Edit Template
          </Button>
          
          {/* Duplicate button commented out as requested
          <Button 
            variant="secondary"
            onClick={handleDuplicate}
          >
            <Copy size={16} />
            Duplicate
          </Button>
          */}
          
          <Button 
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Delete Template
          </Button>
        </ButtonGroup>

        <ContentGrid>
          <div>
            {/* Tab Navigation */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #e2e8f0', 
              marginBottom: '20px'
            }}>
              <div
                onClick={() => setActiveTab('pages')}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'pages' ? '2px solid var(--color-navy)' : '2px solid transparent',
                  color: activeTab === 'pages' ? 'var(--color-navy)' : '#757575',
                  fontWeight: activeTab === 'pages' ? '500' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Layers size={16} />
                Pages & Sections
              </div>
              
              <div
                onClick={() => setActiveTab('sublevels')}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'sublevels' ? '2px solid var(--color-navy)' : '2px solid transparent',
                  color: activeTab === 'sublevels' ? 'var(--color-navy)' : '#757575',
                  fontWeight: activeTab === 'sublevels' ? '500' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ListChecks size={16} />
                Sublevel Structure
              </div>
            </div>
            
            <Card>
              <CardTitle>
                {activeTab === 'pages' ? (
                  <>
                    <Layers size={18} />
                    Template Pages & Sections
                  </>
                ) : (
                  <>
                    <ListChecks size={18} />
                    Templates Hierarchy
                  </>
                )}
              </CardTitle>
              
              {activeTab === 'pages' ? (
                <div>
                  {level.pages && level.pages.length > 0 ? (
                    renderPagesAndSections()
                  ) : (
                    <div style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: 'var(--color-gray-medium)',
                      background: 'var(--color-offwhite)',
                      borderRadius: '8px'
                    }}>
                      This template uses the legacy structure. Use the "Sublevel Structure" tab to view it.
                    </div>
                  )}
                </div>
              ) : (
                <LevelHierarchy>
                  {level.sets && level.sets.length > 0 ? (
                    level.sets.map((set, index) => (
                      <CollapsibleSection 
                        key={set.id || set._id || index}
                        title={`${set.name || `Set ${index + 1}`}`}
                        subtitle={`${countSetQuestions(set)} questions`}
                        defaultOpen={index === 0}
                      >
                        {renderLevelHierarchy(set.subLevels)}
                      </CollapsibleSection>
                    ))
                  ) : (
                    renderLevelHierarchy(level.subLevels)
                  )}
                </LevelHierarchy>
              )}
            </Card>
            
            <QuestionnaireCard>
              <CardTitle>
                <ListChecks size={18} />
                Questionnaire
              </CardTitle>
              
              {level.questions && level.questions.length > 0 ? (
                <QuestionList>
                  {level.questions.map((question, index) => (
                    <QuestionItem key={question._id || question.id || index}>
                      <QuestionText>
                        {index + 1}. {question.text}
                        {question.required && <RequiredTag>Required</RequiredTag>}
                      </QuestionText>
                      {question.description && (
                        <QuestionDescription>{question.description}</QuestionDescription>
                      )}
                      {question.options && question.options.length > 0 && (
                        <OptionsList>
                          {question.options.map((option, optIndex) => (
                            <OptionItem key={optIndex}>{option}</OptionItem>
                          ))}
                        </OptionsList>
                      )}
                    </QuestionItem>
                  ))}
                </QuestionList>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-gray-medium)' }}>
                  No general questions available
                </div>
              )}
            </QuestionnaireCard>
          </div>
          
          {/* <div>
            <Card>
              <CardTitle>
                <Activity size={18} />
                Performance Metrics
              </CardTitle>
              <StatsList>
                <StatCard>
                  <StatLabel>Completed Tasks</StatLabel>
                  <StatValue>{level.metrics?.completedTasks || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Active Inspectors</StatLabel>
                  <StatValue>{level.metrics?.activeInspectors || 0}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Avg. Completion Time</StatLabel>
                    <StatValue>{level.metrics?.avgCompletionTime || 'N/A'}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Compliance Rate</StatLabel>
                    <StatValue>{level.metrics?.complianceRate || 'N/A'}</StatValue>
                </StatCard>
              </StatsList>
            </Card>

            <Card style={{ marginTop: '24px' }}>
              <CardTitle>
                <Calendar size={18} />
                Inspection Schedule
              </CardTitle>
              
              <div style={{ 
                textAlign: 'center', 
                padding: '32px 0', 
                color: 'var(--color-gray-medium)'
              }}>
                <Clock size={24} style={{ marginBottom: '16px', opacity: 0.6 }} />
                <p>No upcoming inspections scheduled</p>
                <Button
                  variant="secondary"
                  style={{ margin: '16px auto 0', display: 'inline-flex' }}
                >
                  <PenTool size={16} />
                  Schedule Inspection
                </Button>
              </div>
            </Card>
          </div> */}
        </ContentGrid>
      </PageContainer>

      {showDeleteModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Delete Template</ModalTitle>
            <ModalMessage>
              Are you sure you want to delete this template? This action cannot be undone.
            </ModalMessage>
            <ModalActions>
              <Button 
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </InspectionLayout>
  );
};

export default InspectionLevelView;