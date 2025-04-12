import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Minus, Move, Layers, ChevronDown, ChevronRight,
  List, PlusCircle, X, HelpCircle, AlertTriangle, CheckCircle, BookOpen, Save,
  Link2, Filter, Search, Clock, RefreshCw, Clipboard, FileText, ChevronLeft
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import { inspectionService } from '../../services/inspection.service';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuestionLibrary,
  addQuestionToLibrary,
  deleteQuestionFromLibrary
} from '../../store/slices/questionLibrarySlice';
import { updateInspectionLevel } from '../../store/slices/inspectionLevelSlice';
import Skeleton from '../../components/ui/Skeleton';
import debounce from 'lodash/debounce';

const PageContainer = styled.div`
  padding: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 16px;
  
  &:hover {
    color: #333;
  }
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

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormSectionWithTabs = styled(FormSection)`
  padding: 24px 0 0 0;
  overflow: hidden;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
  padding: 0 24px;
`;

const Tab = styled.button`
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#1a237e' : 'transparent'};
  color: ${props => props.active ? '#1a237e' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #1a237e;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${props => props.active ? '#1a237e' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 10px;
  padding: 2px 8px;
  margin-left: 8px;
`;

const TabContent = styled.div`
  padding: 0 24px 24px 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
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

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const SubLevelsContainer = styled.div`
  margin-top: 16px;
`;

const SubLevelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.isDragging ? '#f1f5f9' : '#f8fafc'};
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.isDragging ? '#1a237e' : '#e0e0e0'};
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #666;
  
  &:hover {
    color: #1a237e;
  }
`;

const SubLevelInput = styled(Input)`
  flex: 1;
`;

const IconButton = styled.button`
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
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const TabNavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
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

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const NestedSubLevelsContainer = styled.div`
  margin-left: 40px;
  margin-top: 8px;
`;

const ExpandCollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #1a237e;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  color: #1a237e;
  gap: 12px;
  
  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1a237e;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a237e;
  border-radius: 50%;
  width: ${props => props.size || '30px'};
  height: ${props => props.size || '30px'};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const QuestionnaireSection = styled(FormSection)`
  margin-top: 20px;
`;

const QuestionItem = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const QuestionTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const QuestionForm = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const OptionsContainer = styled.div`
  margin-top: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: ${props => props.mt || '16px'};
  
  &:hover {
    background: #3949ab;
  }
  
  &:disabled {
    background: #9fa8da;
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  
  input {
    cursor: pointer;
  }
  
  &:hover {
    color: #1a237e;
  }
`;

const QuestionLibraryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f5ff;
  border: 1px solid #d0e1ff;
  color: #1a237e;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #d0e1ff;
  }
`;

const Modal = styled.div`
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
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin: 0;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #1a237e;
  }
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 16px;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }
`;

const QuestionLibraryList = styled.div`
  display: grid;
  gap: 12px;
`;

const QuestionLibraryItem = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f5ff;
    border-color: #d0e1ff;
  }
`;

const QuestionLibraryItemContent = styled.div`
  margin-bottom: 8px;
`;

const QuestionLibraryItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
`;

const QuestionLibraryEmpty = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #64748b;
`;

const SaveToLibraryButton = styled.button`
  background: none;
  border: none;
  color: #1a237e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  
  &:hover {
    background: #f0f5ff;
  }
`;

const AutoSaveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.status === 'saving' ? '#1a237e' : props.status === 'saved' ? '#22c55e' : '#64748b'};
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.status === 'saving' ? '#e8eaf6' : props.status === 'saved' ? '#f0fdf4' : 'transparent'};
`;

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: ${props => props.color || '#e0e0e0'};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
`;

const TreeNodeContainer = styled.div`
  margin-bottom: 8px;
`;

const TreeNode = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.selected && `
    background: #e8f5e9;
    border-color: #66bb6a;
  `}
  
  &:hover {
    background: ${props => props.selected ? '#e8f5e9' : '#f0f5ff'};
    border-color: ${props => props.selected ? '#66bb6a' : '#d0e1ff'};
  }
`;

const TreeNodeContent = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: ${props => props.isParent ? '500' : '400'};
  margin-left: ${props => `${props.level * 20}px`};
  color: #333;
`;

const TreeNodeChildren = styled.div`
  margin-left: 20px;
`;

const QuestionFilter = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${props => props.active ? '#1a237e' : '#f5f7fb'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? '#1a237e' : '#e0e0e0'};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#151b4f' : '#e8eaf6'};
  }
`;

const QuestionsSummary = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #1a237e;
    margin-bottom: 12px;
  }
  
  ul {
    padding-left: 16px;
    margin: 0;
  }
  
  li {
    font-size: 13px;
    margin-bottom: 4px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: #1a237e;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7fb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabMenu = styled.div`
  padding: 0 24px 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuestionPagination = ({ currentPage, totalPages, onPageChange }) => {
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <PaginationContainer>
      <PageInfo>
        Page {currentPage} of {totalPages}
      </PageInfo>
      <PaginationButtons>
        <PaginationButton
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          First
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </PaginationButton>
      </PaginationButtons>
    </PaginationContainer>
  );
};

const SubLevelTreeComponent = ({ 
  subLevels, 
  level = 0, 
  selectedLevelId,
  onSelectLevel,
  parentNumber = '' // Add parent number parameter for auto-numbering
}) => {
  const [expandedLevels, setExpandedLevels] = useState({});
  
  // Toggle level expanded/collapsed
  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };
  
  if (!subLevels || !Array.isArray(subLevels)) return null;
  
  return (
    <>
      {subLevels.map((node, index) => {
        // Calculate level number for this node
        const levelNumber = parentNumber 
          ? `${parentNumber}.${index + 1}` 
          : String.fromCharCode(65 + index); // A, B, C, etc. for top level
          
        const nodeId = node.id || node._id;
        const hasChildren = node.subLevels && node.subLevels.length > 0;
        const isExpanded = expandedLevels[nodeId];
        
        return (
          <div key={nodeId}>
            <TreeNodeContainer>
              <TreeNode 
                selected={selectedLevelId === nodeId}
                onClick={() => onSelectLevel(nodeId)}
              >
                {hasChildren && (
                  <div onClick={(e) => {
                    e.stopPropagation();
                    toggleLevel(nodeId);
                  }} style={{ marginRight: '8px' }}>
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </div>
                )}
                <TreeNodeContent>
                  <LevelNumberSpan>{levelNumber}</LevelNumberSpan> {/* Display level number */}
                  {node.name || 'Unnamed Level'}
                </TreeNodeContent>
              </TreeNode>
            </TreeNodeContainer>
            
            {hasChildren && isExpanded && (
              <div style={{ marginLeft: '20px' }}>
                <SubLevelTreeComponent 
                  subLevels={node.subLevels} 
                  level={level + 1}
                  selectedLevelId={selectedLevelId}
                  onSelectLevel={onSelectLevel}
                  parentNumber={levelNumber} // Pass level number to children
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const InspectionLevelForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState('basic');
  const [userHasEdited, setUserHasEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for the form and auto-save
  const formRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastSavedDataRef = useRef({});
  
  // Get question library from Redux store
  const { 
    questions: questionLibrary, 
    loading: libraryLoading 
  } = useSelector(state => state.questionLibrary);
  
  // Add this function for error handling
  const handleError = (error) => {
    console.error('Error details:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      const { status, data } = error.response;
      console.error('Error status:', status);
      console.error('Error response:', data);
      
      errorMessage = data?.message || `Server error (${status})`;
      
      if (status === 404) {
        errorMessage = `Resource not found: ${data?.message || 'The requested resource could not be found'}`;
      }
    } else if (error.request) {
      errorMessage = 'Network error: No response received from server';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'marina_operator',
    status: 'active',
    priority: 'medium',
    subLevels: [{ id: Date.now(), name: '', description: '', order: 0, subLevels: [] }]
  });
  
  const [errors, setErrors] = useState({});
  
  // Enhanced state for questions
  const [questions, setQuestions] = useState([]);
  const [questionsByLevel, setQuestionsByLevel] = useState({});
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [questionFilter, setQuestionFilter] = useState('all');
  const [questionSearch, setQuestionSearch] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
  // Question library management
  const [showQuestionLibrary, setShowQuestionLibrary] = useState(false);
  const [showLinkQuestionModal, setShowLinkQuestionModal] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [questionToLink, setQuestionToLink] = useState(null);

  // Auto save state
  const debouncedSave = useRef(
    debounce(async (data) => {
      if (!id || initialLoading || isSaving) return; // Only auto-save for existing templates
      
      try {
        setAutoSaveStatus('saving');
        await inspectionService.updateInspectionLevel(id, data);
        setAutoSaveStatus('saved');
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 3000);
        
        // Update last saved data
        lastSavedDataRef.current = JSON.parse(JSON.stringify(data));
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
      }
    }, 2000)
  ).current;

  useEffect(() => {
    if (id) {
      fetchInspectionLevel();
    }
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      debouncedSave.cancel();
    };
  }, [id]);

  // Add useEffect to load question library from API
  useEffect(() => {
    dispatch(fetchQuestionLibrary());
  }, [dispatch]);

  // Effect to trigger auto-save
  useEffect(() => {
    if (!id || initialLoading || loading || isSaving || !userHasEdited) return;
    
    const currentData = {
      ...formData,
      questions: questions
    };
    
    // Check if data has changed since last save
    const lastSaved = lastSavedDataRef.current;
    const isChanged = JSON.stringify(currentData) !== JSON.stringify(lastSaved);
    
    if (isChanged) {
      debouncedSave(currentData);
    }
  }, [formData, questions, id, initialLoading, loading, userHasEdited, isSaving]);

  // Update questions by level when questions change
  useEffect(() => {
    const newQuestionsByLevel = {};
    
    questions.forEach(question => {
      if (question.levelId) {
        if (!newQuestionsByLevel[question.levelId]) {
          newQuestionsByLevel[question.levelId] = [];
        }
        newQuestionsByLevel[question.levelId].push(question);
      }
    });
    
    setQuestionsByLevel(newQuestionsByLevel);
    
    // Update question counts for the tree view
    updateQuestionCounts();
  }, [questions]);

  const updateQuestionCounts = () => {
    // Create a map of question counts by level ID
    const countMap = {};
    
    questions.forEach(question => {
      if (question.levelId) {
        countMap[question.levelId] = (countMap[question.levelId] || 0) + 1;
      }
    });
    
    // Function to update counts recursively
    const updateLevelCounts = (levels) => {
      if (!levels) return [];
      
      return levels.map(level => {
        const levelId = level.id || level._id;
        const questionCount = countMap[levelId] || 0;
        const updatedSubLevels = updateLevelCounts(level.subLevels);
        
        // Count questions in sub-levels as well
        const totalCount = questionCount + updatedSubLevels.reduce(
          (sum, sl) => sum + (sl.questionCount || 0), 0
        );
        
        return {
          ...level,
          questionCount: totalCount,
          subLevels: updatedSubLevels
        };
      });
    };
    
    // Only update if we have sublevels to avoid unnecessary renders
    if (formData.subLevels && formData.subLevels.length > 0) {
      setFormData(prev => ({
        ...prev,
        subLevels: updateLevelCounts(prev.subLevels)
      }));
    }
  };

  const fetchInspectionLevel = async () => {
    try {
      setInitialLoading(true);
      const data = await inspectionService.getInspectionLevel(id);
      
      // Process sublevel data - ensure each has an id and subLevels array
      const processSubLevels = (subLevels) => {
        return (subLevels || []).map(sl => ({
          ...sl,
          id: sl.id || sl._id || Date.now(),
          subLevels: processSubLevels(sl.subLevels)
        }));
      };
      
      const processedData = {
        ...data,
        subLevels: processSubLevels(data.subLevels)
      };
      
      setFormData(processedData);
      
      // Process questions and associate with levels if applicable
      const processedQuestions = (data.questions || []).map(q => ({
        ...q,
        id: q.id || q._id || Date.now().toString(),
        levelId: q.levelId || null
      }));
      
      setQuestions(processedQuestions);
      
      // Update last saved data ref
      lastSavedDataRef.current = {
        ...processedData,
        questions: processedQuestions
      };
      
      // Set selected level ID to the first sublevel if exists
      if (processedData.subLevels && processedData.subLevels.length > 0) {
        setSelectedLevelId(processedData.subLevels[0].id);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      handleError(error);
      navigate('/inspection');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    // Don't trigger autosave when changing tabs
    const wasEdited = userHasEdited;
    setUserHasEdited(false);
    
    setActiveTab(newTab);
    
    // Wait a bit before re-enabling auto-save
    setTimeout(() => {
      setUserHasEdited(wasEdited);
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setUserHasEdited(true);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle change in sublevel fields
  const handleSubLevelChange = (path, field, value) => {
    setUserHasEdited(true);
    
    setFormData(prev => {
      // Handle top-level sublevels
      if (!path.includes('.')) {
        return {
          ...prev,
          subLevels: prev.subLevels.map(level => 
            level.id.toString() === path ? { ...level, [field]: value } : level
          )
        };
      }
      
      // Handle nested sublevels
      const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
      const parts = path.split('.');
      
      // Traverse to the target sublevel
      let current = newFormData.subLevels;
      let target = null;
      
      for (const part of parts) {
        // Find the sublevel with matching id in the current level
        const sublevel = current.find(sl => sl.id.toString() === part);
        if (!sublevel) return prev; // Path not found
        
        if (part === parts[parts.length - 1]) {
          // This is the target sublevel
          target = sublevel;
        } else {
          // Move to the next level
          current = sublevel.subLevels || [];
        }
      }
      
      if (target) {
        target[field] = value;
      }
      
      return newFormData;
    });
  };

  // Add a new top-level sublevel
  const addSubLevel = () => {
    setUserHasEdited(true);
    
    setFormData(prev => ({
      ...prev,
      subLevels: [
        ...prev.subLevels,
        { 
          id: Date.now(), 
          name: '', 
          description: '', 
          order: prev.subLevels.length,
          subLevels: []
        }
      ]
    }));
  };

  // Add a nested sublevel to a parent
  const addNestedSubLevel = (parentPath) => {
    setUserHasEdited(true);
    
    setFormData(prev => {
      const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
      
      if (!parentPath) {
        // Add to top level if no parent path
        newFormData.subLevels.push({
          id: Date.now(),
          name: '',
          description: '',
          order: newFormData.subLevels.length,
          subLevels: []
        });
        return newFormData;
      }
      
      const parts = parentPath.split('.');
      let current = newFormData.subLevels;
      
      // Traverse to the parent sublevel
      for (const part of parts) {
        const sublevel = current.find(sl => sl.id.toString() === part);
        if (!sublevel) return prev; // Path not found
        
        // Initialize subLevels array if it doesn't exist
        if (!sublevel.subLevels) {
          sublevel.subLevels = [];
        }
        
        if (part === parts[parts.length - 1]) {
          // This is the parent sublevel, add a new child
          sublevel.subLevels.push({
            id: Date.now(),
            name: '',
            description: '',
            order: sublevel.subLevels.length,
            subLevels: []
          });
        } else {
          // Move to the next level
          current = sublevel.subLevels;
        }
      }
      
      return newFormData;
    });
  };

  // Remove a sublevel
  const removeSubLevel = (path) => {
    if (!path) return;
    
    setUserHasEdited(true);
    
    setFormData(prev => {
      // Don't remove if it's the last remaining top-level sublevel
      if (!path.includes('.') && prev.subLevels.length <= 1) {
        return prev;
      }
      
      const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
      const parts = path.split('.');
      
      if (parts.length === 1) {
        // Remove from top level
        newFormData.subLevels = newFormData.subLevels.filter(
          sl => sl.id.toString() !== parts[0]
        );
        return newFormData;
      }
      
      // For nested levels, we need to find the parent
      const parentPath = parts.slice(0, -1);
      let current = newFormData.subLevels;
      let parent = null;
      
      // Traverse to the parent sublevel
      for (let i = 0; i < parentPath.length; i++) {
        const part = parentPath[i];
        const sublevel = current.find(sl => sl.id.toString() === part);
        if (!sublevel) return prev; // Path not found
        
        if (i === parentPath.length - 1) {
          // This is the parent sublevel
          parent = sublevel;
        } else {
          // Move to the next level
          current = sublevel.subLevels || [];
        }
      }
      
      if (parent && parent.subLevels) {
        // Remove the target sublevel from the parent's subLevels
        parent.subLevels = parent.subLevels.filter(
          sl => sl.id.toString() !== parts[parts.length - 1]
        );
      }
      
      return newFormData;
    });
    
    // Also update any questions linked to this level
    const levelId = path.includes('.') ? path.split('.').pop() : path;
    updateQuestionsAfterLevelRemoval(levelId);
  };

  // Update questions after a level is removed
  const updateQuestionsAfterLevelRemoval = (levelId) => {
    // Find any questions linked to this level and unlink them
    setQuestions(prev => prev.map(q => 
      q.levelId?.toString() === levelId.toString() 
        ? { ...q, levelId: null }
        : q
    ));
  };

  // Handle drag and drop within the same list
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    setUserHasEdited(true);
    
    // Handle reordering within the same droppable
    if (source.droppableId === destination.droppableId) {
      // Root level drag
      if (type === 'subLevels' || source.droppableId === 'subLevels') {
        setFormData(prev => {
          const newSubLevels = [...prev.subLevels];
          const [reorderedItem] = newSubLevels.splice(source.index, 1);
          newSubLevels.splice(destination.index, 0, reorderedItem);
          
          return {
            ...prev,
            subLevels: newSubLevels.map((item, index) => ({ ...item, order: index }))
          };
        });
      } 
      // Nested level drag - more complex
      else {
        // Extract the parent path from the droppableId
        const parentPath = source.droppableId.replace('nested-', '');
        
        setFormData(prev => {
          const newFormData = JSON.parse(JSON.stringify(prev)); // Deep clone
          
          // Find the parent's subLevels array
          const parts = parentPath.split('.');
          let current = newFormData.subLevels;
          let target = null;
          
          for (const part of parts) {
            const sublevel = current.find(sl => sl.id.toString() === part);
            if (!sublevel) return prev; // Path not found
            
            target = sublevel;
            current = sublevel.subLevels || [];
          }
          
          if (target && target.subLevels) {
            // Reorder the items
            const [reorderedItem] = target.subLevels.splice(source.index, 1);
            target.subLevels.splice(destination.index, 0, reorderedItem);
            
            // Update order properties
            target.subLevels = target.subLevels.map((item, index) => ({
              ...item,
              order: index
            }));
          }
          
          return newFormData;
        });
      }
    }
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;
    
    // Check basic fields
    if (!formData.name) {
      newErrors.name = 'Name is required';
      toast.error('Level name is required');
      hasErrors = true;
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
      toast.error('Description is required');
      hasErrors = true;
    }
    
    // Check all sublevel fields recursively
    const validateSubLevels = (subLevels) => {
      for (const level of subLevels) {
        if (!level.name || !level.description) {
          return false;
        }
        if (level.subLevels && level.subLevels.length > 0) {
          if (!validateSubLevels(level.subLevels)) {
            return false;
          }
        }
      }
      return true;
    };
    
    if (!validateSubLevels(formData.subLevels)) {
      newErrors.subLevels = 'All sub-levels must have names and descriptions';
      toast.error('All sub-levels must have names and descriptions');
      hasErrors = true;
    }
    
    // Check if all questions have text
    const emptyQuestions = questions.filter(q => !q.text?.trim());
    if (emptyQuestions.length > 0) {
      toast.error('All questions must have text');
      hasErrors = true;
    }
    
    // Check select/multiple choice questions for options
    const invalidOptions = questions.filter(q => 
      (q.answerType === 'select' || q.answerType === 'multiple_choice') && 
      (!Array.isArray(q.options) || q.options.length === 0 || 
       q.options.some(opt => !opt.trim()))
    );
    
    if (invalidOptions.length > 0) {
      toast.error('All select and multiple choice questions must have at least one option');
      hasErrors = true;
    }
    
    setErrors(newErrors);
    return !hasErrors;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || loading) return;

    try {
      setLoading(true);
      setIsSaving(true);
      
      // Prepare data for API (handle any transformations needed)
      const apiData = {
        ...formData,
        subLevels: formData.subLevels,
        questions: questions
      };
      
      if (id) {
        // Use Redux action instead of direct service call
        const resultAction = await dispatch(updateInspectionLevel({ id, data: apiData }));
        
        if (updateInspectionLevel.fulfilled.match(resultAction)) {
          toast.success('Inspection level updated successfully');
          navigate('/inspection');
        } else {
          // Handle rejection
          const error = resultAction.payload || resultAction.error;
          throw error;
        }
      } else {
        await inspectionService.createInspectionLevel(apiData);
        toast.success('Inspection level created successfully');
        navigate('/inspection');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      
      // More detailed error reporting
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        // Show specific error message from the API if available
        if (error.response.data && error.response.data.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error(`Server error (${error.response.status})`);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        toast.error('Network error: No response from server');
      } else {
        // Error setting up the request
        toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
      }
      
      handleError(error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  // Add new handlers for questionnaire functionality
  const addQuestion = () => {
    setUserHasEdited(true);
    
    const newQuestion = {
      id: Date.now().toString(), // Temporary ID for new questions
      text: '',
      answerType: 'yesno',
      options: [],
      required: true,
      mandatory: true, // Add mandatory field, default to true (Mandatory)
      levelId: selectedLevelId // Link to currently selected level if any
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    
    // Set currentPage to last page to show the new question
    const newQuestionIndex = questions.length;
    const newPage = Math.floor(newQuestionIndex / questionsPerPage) + 1;
    setCurrentPage(newPage);
  };
  
  const removeQuestion = (index) => {
    setUserHasEdited(true);
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    
    // Adjust current page if needed
    if (newQuestions.length > 0 && filteredQuestions.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const updateQuestion = (index, field, value) => {
    setUserHasEdited(true);
    
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    
    // If answer type is changed to something other than 'options', 
    // clear the options array unless it's a "select" or "multiple_choice" type
    if (field === 'answerType' && 
        value !== 'select' && 
        value !== 'multiple_choice' && 
        newQuestions[index].options?.length) {
      newQuestions[index].options = [];
    }
    
    // If changing to a type that needs options, initialize with empty array
    if (field === 'answerType' && 
        (value === 'select' || value === 'multiple_choice') && 
        !Array.isArray(newQuestions[index].options)) {
      newQuestions[index].options = [''];
    }
    
    setQuestions(newQuestions);
  };
  
  const linkQuestionToLevel = (questionIndex, levelId) => {
    setUserHasEdited(true);
    
    setQuestions(prev => prev.map((q, idx) => 
      idx === questionIndex ? { ...q, levelId } : q
    ));
    setShowLinkQuestionModal(false);
    setQuestionToLink(null);
  };
  
  const addOption = (questionIndex) => {
    setUserHasEdited(true);
    
    const newQuestions = [...questions];
    if (!Array.isArray(newQuestions[questionIndex].options)) {
      newQuestions[questionIndex].options = [];
    }
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    setUserHasEdited(true);
    
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };
  
  const updateOption = (questionIndex, optionIndex, value) => {
    setUserHasEdited(true);
    
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  // Save question to library
  const saveQuestionToLibrary = (question) => {
    // Only save if it has text
    if (!question.text.trim()) return;

    // Check if this question already exists in the library
    const existingQuestion = questionLibrary.find(q => q.text.trim() === question.text.trim());
    
    if (!existingQuestion) {
      dispatch(addQuestionToLibrary({
        text: question.text,
        answerType: question.answerType,
        options: question.options || [],
        required: question.required,
        mandatory: question.mandatory // Add mandatory field to saved question
      }))
        .unwrap()
        .then(() => {
          toast.success('Question saved to library');
        })
        .catch(error => {
          toast.error(`Failed to save question: ${error}`);
        });
    } else {
      toast.info('This question is already in your library');
    }
  };

  // Add question from library
  const addQuestionFromLibrary = (libraryQuestion) => {
    setUserHasEdited(true);
    
    const newQuestion = {
      id: Date.now().toString(),
      text: libraryQuestion.text,
      answerType: libraryQuestion.answerType,
      options: [...(libraryQuestion.options || [])],
      required: libraryQuestion.required,
      mandatory: libraryQuestion.mandatory !== undefined ? libraryQuestion.mandatory : true, // Add mandatory field
      levelId: selectedLevelId // Link to currently selected level if any
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    setShowQuestionLibrary(false);
    
    // Set currentPage to last page to show the new question
    const newQuestionIndex = questions.length;
    const newPage = Math.floor(newQuestionIndex / questionsPerPage) + 1;
    setCurrentPage(newPage);
  };

  // Filter questions based on search and selected level
  const getFilteredQuestions = () => {
    let filtered = [...questions];
    
    // Filter by question text search
    if (questionSearch.trim() !== '') {
      const searchTerm = questionSearch.toLowerCase();
      filtered = filtered.filter(q => 
        q.text?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by selected level if not showing all questions
    if (questionFilter === 'level' && selectedLevelId) {
      filtered = filtered.filter(q => q.levelId === selectedLevelId);
    } else if (questionFilter === 'unlinked') {
      filtered = filtered.filter(q => !q.levelId);
    }
    
    return filtered;
  };
  
  // Get the questions for the current page
  const filteredQuestions = getFilteredQuestions();
  const totalFilteredQuestions = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredQuestions / questionsPerPage));
  
  // Adjust currentPage if it's out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  // Filter questions based on search in the library
  const filteredLibraryQuestions = librarySearchQuery.trim() === '' 
    ? questionLibrary 
    : questionLibrary.filter(q => 
        q.text.toLowerCase().includes(librarySearchQuery.toLowerCase())
      );
  
  // Helper to find sub-level info
  const getLevelInfoById = (levelId) => {
    const findLevelById = (levels, id) => {
      if (!levels) return null;
      
      for (const level of levels) {
        if (level.id?.toString() === id?.toString() || level._id?.toString() === id?.toString()) {
          return level;
        }
        
        if (level.subLevels && level.subLevels.length > 0) {
          const foundInSub = findLevelById(level.subLevels, id);
          if (foundInSub) return foundInSub;
        }
      }
      
      return null;
    };
    
    return findLevelById(formData.subLevels, levelId);
  };
  
  // Get level path for display
  const getLevelPath = (levelId) => {
    const findPath = (levels, id, path = []) => {
      if (!levels) return null;
      
      for (const level of levels) {
        const currentId = level.id?.toString() || level._id?.toString();
        
        if (currentId === id?.toString()) {
          return [...path, level.name || 'Unnamed'];
        }
        
        if (level.subLevels && level.subLevels.length > 0) {
          const foundPath = findPath(
            level.subLevels, 
            id, 
            [...path, level.name || 'Unnamed']
          );
          
          if (foundPath) return foundPath;
        }
      }
      
      return null;
    };
    
    const path = findPath(formData.subLevels, levelId);
    return path ? path.join(' > ') : 'None';
  };
  
  // Get total question counts for UI
  const getTotalCounts = () => {
    const total = questions.length;
    const linked = questions.filter(q => q.levelId).length;
    const unlinked = total - linked;
    
    return { total, linked, unlinked };
  };
  
  const counts = getTotalCounts();

  if (initialLoading) {
    return (
      <PageContainer>
        <BackButton disabled={true}>
          <ArrowLeft size={18} />
          Back to Template
        </BackButton>
        
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Spinner size="24px" />
            <PageTitle>Loading Template...</PageTitle>
          </div>
        </Header>
        
        <LoadingSpinner>
          <div className="spinner"></div>
          <p>Loading inspection level data...</p>
        </LoadingSpinner>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/inspection')} disabled={loading}>
        <ArrowLeft size={18} />
        Back to Template
      </BackButton>

      <Header>
        <PageTitle>
          <Layers size={24} />
          {id ? 'Edit Template' : 'Create Template'}
          {autoSaveStatus !== 'idle' && id && (
            <AutoSaveIndicator status={autoSaveStatus}>
              {autoSaveStatus === 'saving' ? (
                <>
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving changes...
                </>
              ) : autoSaveStatus === 'saved' ? (
                <>
                  <CheckCircle size={14} />
                  Changes saved
                </>
              ) : (
                <>
                  <AlertTriangle size={14} />
                  Save failed
                </>
              )}
            </AutoSaveIndicator>
          )}
        </PageTitle>
        <SubTitle>
          {id ? 'Modify existing template details' : 'Add a new template to the system'}
        </SubTitle>
      </Header>

      <Form onSubmit={handleSubmit} ref={formRef}>
        <FormSectionWithTabs>
          <TabsContainer>
            <Tab
              active={activeTab === 'basic'}
              onClick={() => handleTabChange('basic')}
              disabled={loading}
              type="button"
            >
              Basic Information
            </Tab>
            <Tab
              active={activeTab === 'levels'}
              onClick={() => handleTabChange('levels')}
              disabled={loading}
              type="button"
            >
              Inspection Levels
            </Tab>
            <Tab
              active={activeTab === 'questions'}
              onClick={() => handleTabChange('questions')}
              disabled={loading}
              type="button"
            >
              Questions
              <TabCount active={activeTab === 'questions'}>
                {questions.length}
              </TabCount>
            </Tab>
          </TabsContainer>
          
          {activeTab === 'basic' && (
            <TabContent>
              <FormGrid>
                <FormGroup>
                  <Label>Level Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter level name"
                    disabled={loading}
                  />
                  {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <Label>Type</Label>
                  <Select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="marina_operator">Marina Operator</option>
                    <option value="yacht_chartering">Yacht Chartering</option>
                    <option value="tourism_agent">Tourism Agent</option>
                  </Select>
                </FormGroup>

                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>Description</Label>
                  <TextArea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter level description"
                    disabled={loading}
                  />
                  {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                </FormGroup>
              </FormGrid>

              <TabNavigationButtons>
                <div></div>
                <Button 
                  type="button"
                  variant="primary"
                  onClick={() => handleTabChange('levels')}
                  disabled={loading}
                >
                  Next: Inspection Levels <ChevronRight size={16} />
                </Button>
              </TabNavigationButtons>
            </TabContent>
          )}
          
          {activeTab === 'levels' && (
            <TabContent>
              <SectionTitle>
                Sub Levels
                <IconButton type="button" onClick={addSubLevel} disabled={loading}>
                  <Plus size={16} />
                </IconButton>
              </SectionTitle>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="subLevels" type="subLevels">
                  {(provided) => (
                    <SubLevelsContainer
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {formData.subLevels.map((level, index) => (
                        <Draggable
                          key={level.id.toString()}
                          draggableId={level.id.toString()}
                          index={index}
                          isDragDisabled={loading}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <SubLevelRow
                                level={level}
                                onSubLevelChange={handleSubLevelChange}
                                onRemoveSubLevel={removeSubLevel}
                                onAddNestedSubLevel={addNestedSubLevel}
                                loading={loading}
                                dragHandleProps={provided.dragHandleProps}
                                levelNumber={String.fromCharCode(65 + index)} // Explicitly set A, B, C, etc. based on index
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </SubLevelsContainer>
                  )}
                </Droppable>
              </DragDropContext>
              {errors.subLevels && <ErrorMessage>{errors.subLevels}</ErrorMessage>}

              <TabNavigationButtons>
                <Button 
                  type="button"
                  onClick={() => handleTabChange('basic')}
                  disabled={loading}
                >
                  <ChevronLeft size={16} /> Previous: Basic Info
                </Button>
                <Button 
                  type="button"
                  variant="primary"
                  onClick={() => handleTabChange('questions')}
                  disabled={loading}
                >
                  Next: Questions <ChevronRight size={16} />
                </Button>
              </TabNavigationButtons>
            </TabContent>
          )}
          
          {activeTab === 'questions' && (
            <TabContent>
              <TabMenu>
                <div>
                  <SectionTitle>
                    <List size={18} />
                    Inspection Questions
                  </SectionTitle>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <AddButton type="button" onClick={addQuestion} disabled={loading} mt="0">
                    <PlusCircle size={18} /> Add Question
                  </AddButton>
                  
                  <QuestionLibraryButton 
                    type="button" 
                    onClick={() => setShowQuestionLibrary(true)}
                    disabled={loading}
                  >
                    <BookOpen size={18} /> Question Library
                  </QuestionLibraryButton>
                </div>
              </TabMenu>
              
              <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                {/* Left side - Levels tree */}
                <div style={{ width: '30%', minWidth: '250px' }}>
                  <div style={{ 
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: '#1a237e',
                      marginBottom: '8px'
                    }}>
                      Levels Structure
                    </h4>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Click on a level to filter questions or assign questions to that level.
                    </p>
                  </div>
                  
                  <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                    <SubLevelTreeComponent
                      subLevels={formData.subLevels}
                      selectedLevelId={selectedLevelId}
                      onSelectLevel={(levelId) => {
                        setSelectedLevelId(levelId);
                        setQuestionFilter('level');
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <QuestionsSummary>
                    <h4>Questions Summary</h4>
                    <ul>
                      <li><strong>Total:</strong> {counts.total}</li>
                      <li><strong>Linked to levels:</strong> {counts.linked}</li>
                      <li><strong>Unlinked:</strong> {counts.unlinked}</li>
                    </ul>
                  </QuestionsSummary>
                </div>
                
                {/* Right side - Question management */}
                <div style={{ flex: 1 }}>
                  <QuestionFilter>
                    <FilterButton 
                      active={questionFilter === 'all'} 
                      onClick={() => {
                        setQuestionFilter('all');
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      <FileText size={14} /> All Questions
                    </FilterButton>
                    
                    <FilterButton 
                      active={questionFilter === 'level'} 
                      onClick={() => {
                        setQuestionFilter('level');
                        setCurrentPage(1);
                      }}
                      disabled={!selectedLevelId}
                      type="button"
                    >
                      <Clipboard size={14} /> Level Questions
                    </FilterButton>
                    
                    <FilterButton 
                      active={questionFilter === 'unlinked'} 
                      onClick={() => {
                        setQuestionFilter('unlinked');
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      <HelpCircle size={14} /> Unlinked
                    </FilterButton>
                    
                    <div style={{ flex: 1 }}></div>
                    
                    <SearchInput>
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={questionSearch}
                        onChange={(e) => {
                          setQuestionSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </SearchInput>
                  </QuestionFilter>
                  
                  {paginatedQuestions.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 0',
                      color: '#64748b',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <HelpCircle size={32} style={{ margin: '0 auto 12px' }} />
                      <p>No questions found matching your criteria.</p>
                      <AddButton 
                        type="button" 
                        onClick={addQuestion} 
                        style={{ margin: '16px auto 0', display: 'inline-flex' }}
                      >
                        <PlusCircle size={18} /> Add New Question
                      </AddButton>
                    </div>
                  ) : (
                    <>
                      {paginatedQuestions.map((question, index) => {
                        const globalIndex = questions.findIndex(q => q.id === question.id);
                        const levelInfo = getLevelInfoById(question.levelId);
                        const levelPath = getLevelPath(question.levelId);
                        
                        return (
                          <QuestionItem key={question.id || index}>
                            <QuestionHeader>
                              <QuestionTitle>
                                {/* Display auto-numbered checkpoint ID based on linked level */}
                                {question.levelId ? (
                                  getLevelPath(question.levelId).split(' > ').map((item, i, arr) => {
                                    // Get the full path as an array, then build numbering
                                    if (i === 0) {
                                      // First level - use letter (A, B, etc.)
                                      return i === arr.length - 1 ? item : '';
                                    } else if (i === arr.length - 1) {
                                      // Last level (the checkpoint itself) - add .1, .2, etc. for the question index
                                      const levelNumbers = getLevelNumbering(question.levelId);
                                      const questionIndex = questions
                                        .filter(q => q.levelId === question.levelId)
                                        .findIndex(q => q.id === question.id) + 1;
                                      return levelNumbers ? `${levelNumbers}.${questionIndex}` : `${item} ${questionIndex}`;
                                    }
                                    return '';
                                  }).filter(Boolean).join(' ')
                                ) : (
                                  `Question ${globalIndex + 1}`
                                )}

                                {question.levelId && (
                                  <BadgeContainer>
                                    <Badge color="#3949ab">
                                      {levelInfo?.name || 'Unknown Level'}
                                    </Badge>
                                  </BadgeContainer>
                                )}
                              </QuestionTitle>
                              <QuestionActions>
                                {/* Replace MandatoryToggle button with a dropdown */}
                                <Select
                                  value={question.mandatory === false ? 'recommended' : 'mandatory'}
                                  onChange={(e) => updateQuestion(globalIndex, 'mandatory', e.target.value === 'recommended' ? false : true)}
                                  disabled={loading}
                                  style={{ 
                                    fontSize: '12px', 
                                    padding: '4px 8px', 
                                    minWidth: '130px',
                                    background: question.mandatory === false ? '#f5f5f5' : '#e3f2fd',
                                    color: question.mandatory === false ? '#757575' : '#0277bd',
                                    border: `1px solid ${question.mandatory === false ? '#e0e0e0' : '#bbdefb'}`,
                                    borderRadius: '4px'
                                  }}
                                >
                                  <option value="mandatory">Mandatory</option>
                                  <option value="recommended">Recommended</option>
                                </Select>
                                
                                <SaveToLibraryButton 
                                  type="button" 
                                  onClick={() => saveQuestionToLibrary(question)}
                                  title="Save to Question Library"
                                  disabled={loading}
                                >
                                  <Save size={14} /> Save
                                </SaveToLibraryButton>
                                
                                <IconButton 
                                  onClick={() => {
                                    setQuestionToLink(globalIndex);
                                    setShowLinkQuestionModal(true);
                                  }} 
                                  title="Link to Level"
                                  disabled={loading}
                                  type="button"
                                >
                                  <Link2 size={18} />
                                </IconButton>
                                
                                <IconButton 
                                  onClick={() => removeQuestion(globalIndex)} 
                                  title="Remove Question"
                                  disabled={loading}
                                  type="button"
                                >
                                  <X size={18} />
                                </IconButton>
                              </QuestionActions>
                            </QuestionHeader>
                            
                            <QuestionForm>
                              <FormGroup>
                                <Label>Question Text <span style={{ color: 'red' }}>*</span></Label>
                                <Input
                                  type="text"
                                  value={question.text || ''}
                                  onChange={(e) => updateQuestion(globalIndex, 'text', e.target.value)}
                                  placeholder="Enter question text"
                                  disabled={loading}
                                  required
                                />
                              </FormGroup>
                              
                              {question.levelId && (
                                <FormGroup>
                                  <Label>Linked to Level</Label>
                                  <Input
                                    type="text"
                                    value={levelPath}
                                    readOnly
                                    style={{ background: '#f8fafc' }}
                                  />
                                </FormGroup>
                              )}
                              
                              <FormGroup>
                                <Label>Answer Type</Label>
                                <Select
                                  value={question.answerType || 'yesno'}
                                  onChange={(e) => updateQuestion(globalIndex, 'answerType', e.target.value)}
                                  disabled={loading}
                                >
                                  <option value="yesno">Yes/No</option>
                                  <option value="text">Text Input</option>
                                  <option value="number">Number Input</option>
                                  <option value="select">Single Select</option>
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="compliance">Compliance Status</option>
                                </Select>
                              </FormGroup>
                              
                              {(question.answerType === 'select' || question.answerType === 'multiple_choice') && (
                                <OptionsContainer>
                                  <Label>Options <span style={{ color: 'red' }}>*</span></Label>
                                  
                                  {Array.isArray(question.options) && question.options.map((option, optIndex) => (
                                    <OptionItem key={optIndex}>
                                      <Input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(globalIndex, optIndex, e.target.value)}
                                        placeholder={`Option ${optIndex + 1}`}
                                        disabled={loading}
                                      />
                                      <IconButton 
                                        onClick={() => removeOption(globalIndex, optIndex)} 
                                        title="Remove Option"
                                        disabled={loading || question.options.length <= 1}
                                        type="button"
                                      >
                                        <X size={16} />
                                      </IconButton>
                                    </OptionItem>
                                  ))}
                                  
                                  <Button 
                                    type="button" 
                                    onClick={() => addOption(globalIndex)}
                                    disabled={loading}
                                    style={{ marginTop: '8px' }}
                                  >
                                    <Plus size={16} /> Add Option
                                  </Button>
                                </OptionsContainer>
                              )}
                              
                              <FormGroup style={{ marginTop: '10px' }}>
                                <CheckboxLabel>
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(globalIndex, 'required', e.target.checked)}
                                    disabled={loading}
                                  />
                                  Required question
                                </CheckboxLabel>
                              </FormGroup>
                            </QuestionForm>
                          </QuestionItem>
                        );
                      })}
                      
                      {totalFilteredQuestions > questionsPerPage && (
                        <QuestionPagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <TabNavigationButtons>
                <Button 
                  type="button"
                  onClick={() => handleTabChange('levels')}
                  disabled={loading}
                >
                  <ChevronLeft size={16} /> Previous: Levels
                </Button>
              </TabNavigationButtons>
            </TabContent>
          )}
        </FormSectionWithTabs>
        
        <ButtonGroup>
          <Button 
            type="button" 
            onClick={() => navigate('/inspection')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Save Changes' : 'Create Level')}
          </Button>
        </ButtonGroup>
      </Form>

      {/* Question Library Modal */}
      {showQuestionLibrary && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Question Library</ModalTitle>
              <ModalClose onClick={() => setShowQuestionLibrary(false)}>
                <X size={24} />
              </ModalClose>
            </ModalHeader>
            
            <SearchInput>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search questions..."
                value={librarySearchQuery}
                onChange={(e) => setLibrarySearchQuery(e.target.value)}
              />
            </SearchInput>
            
            {libraryLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spinner size="24px" />
                <p>Loading question library...</p>
              </div>
            ) : filteredLibraryQuestions.length > 0 ? (
              <QuestionLibraryList>
                {filteredLibraryQuestions.map((question) => (
                  <QuestionLibraryItem
                    key={question._id}
                    onClick={() => addQuestionFromLibrary(question)}
                  >
                    <QuestionLibraryItemContent>
                      {question.text}
                    </QuestionLibraryItemContent>
                    <QuestionLibraryItemFooter>
                      <span>Type: {question.answerType}</span>
                      <span>{question.required ? 'Required' : 'Optional'}</span>
                    </QuestionLibraryItemFooter>
                  </QuestionLibraryItem>
                ))}
              </QuestionLibraryList>
            ) : (
              <QuestionLibraryEmpty>
                {librarySearchQuery.trim() !== '' 
                  ? 'No matching questions found' 
                  : 'No saved questions yet. Save questions to your library for reuse.'}
              </QuestionLibraryEmpty>
            )}
          </ModalContent>
        </Modal>
      )}
      
      {/* Link Question Modal */}
      {showLinkQuestionModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Link Question to Level</ModalTitle>
              <ModalClose onClick={() => {
                setShowLinkQuestionModal(false);
                setQuestionToLink(null);
              }}>
                <X size={24} />
              </ModalClose>
            </ModalHeader>
            
            <div style={{ 
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#1a237e',
                marginBottom: '8px'
              }}>
                Question:
              </h4>
              <p style={{ fontWeight: '500' }}>
                {questionToLink !== null && questions[questionToLink]?.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', marginRight: '8px' }}>Question Type:</label>
                <Select
                  value={questionToLink !== null && questions[questionToLink]?.mandatory === false ? 'recommended' : 'mandatory'}
                  onChange={(e) => {
                    if (questionToLink !== null) {
                      updateQuestion(questionToLink, 'mandatory', e.target.value === 'recommended' ? false : true);
                    }
                  }}
                  disabled={loading}
                  style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    width: '150px',
                    background: questionToLink !== null && questions[questionToLink]?.mandatory === false ? '#f5f5f5' : '#e3f2fd',
                    color: questionToLink !== null && questions[questionToLink]?.mandatory === false ? '#757575' : '#0277bd',
                    border: `1px solid ${questionToLink !== null && questions[questionToLink]?.mandatory === false ? '#e0e0e0' : '#bbdefb'}`,
                    borderRadius: '4px'
                  }}
                >
                  <option value="mandatory">Mandatory</option>
                  <option value="recommended">Recommended</option>
                </Select>
              </div>
            </div>
            
            <p style={{ marginTop: '16px', fontSize: '13px', fontStyle: 'italic' }}>
              Select a level below to link this question:
            </p>
            
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {/* Allow unlinking */}
              <TreeNodeContainer>
                <TreeNode 
                  selected={
                    questionToLink !== null &&
                    questions[questionToLink]?.levelId === null
                  }
                  onClick={() => linkQuestionToLevel(questionToLink, null)}
                >
                  <TreeNodeContent>
                    No Level (Unlinked)
                  </TreeNodeContent>
                </TreeNode>
              </TreeNodeContainer>
              
              <SubLevelTreeComponent
                subLevels={formData.subLevels}
                selectedLevelId={
                  questionToLink !== null ? 
                  questions[questionToLink]?.levelId : null
                }
                onSelectLevel={(levelId) => linkQuestionToLevel(questionToLink, levelId)}
                parentNumber=""
              />
            </div>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

// The main SubLevel component that handles a single level item
const SubLevelRow = ({ 
  level, 
  parentPath = "",
  onSubLevelChange, 
  onRemoveSubLevel, 
  onAddNestedSubLevel, 
  loading,
  dragHandleProps,
  levelNumber = "" // Add level number parameter for auto-numbering
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasNestedLevels = level.subLevels && level.subLevels.length > 0;
  const path = parentPath ? `${parentPath}.${level.id}` : `${level.id}`;
  
  return (
    <>
      <SubLevelItem isDragging={false}>
        <DragHandle {...dragHandleProps}>
          <Move size={16} />
        </DragHandle>
        
        {hasNestedLevels && (
          <ExpandCollapseButton 
            onClick={() => setExpanded(!expanded)} 
            type="button"
            disabled={loading}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </ExpandCollapseButton>
        )}
        
        {/* Display level number */}
        <LevelNumber>{levelNumber}</LevelNumber>
        
        <SubLevelInput
          type="text"
          value={level.name || ""}
          onChange={(e) => onSubLevelChange(path, 'name', e.target.value)}
          placeholder="Enter sub-level name"
          disabled={loading}
        />
        
        <SubLevelInput
          type="text"
          value={level.description || ""}
          onChange={(e) => onSubLevelChange(path, 'description', e.target.value)}
          placeholder="Enter sub-level description"
          disabled={loading}
        />
        
        <IconButton
          type="button"
          onClick={() => onAddNestedSubLevel(path)}
          disabled={loading}
        >
          <Plus size={16} />
        </IconButton>
        
        <IconButton
          type="button"
          onClick={() => onRemoveSubLevel(path)}
          disabled={loading}
        >
          <Minus size={16} />
        </IconButton>
      </SubLevelItem>
      
      {expanded && hasNestedLevels && (
        <NestedSubLevelsContainer>
          <NestedSubLevelsList
            subLevels={level.subLevels}
            parentPath={path}
            onSubLevelChange={onSubLevelChange}
            onRemoveSubLevel={onRemoveSubLevel}
            onAddNestedSubLevel={onAddNestedSubLevel}
            loading={loading}
            parentLevelNumber={levelNumber} // Pass the parent level number down
          />
        </NestedSubLevelsContainer>
      )}
    </>
  );
};

// Component to render a nested droppable list of sub-levels
const NestedSubLevelsList = ({ 
  subLevels, 
  parentPath, 
  onSubLevelChange, 
  onRemoveSubLevel, 
  onAddNestedSubLevel, 
  loading,
  parentLevelNumber = "" // Add parent level number parameter for auto-numbering
}) => {
  const droppableId = `nested-${parentPath || "root"}`;
  
  return (
    <Droppable droppableId={droppableId} type={droppableId}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {subLevels.map((subLevel, index) => {
            // Calculate the level number for this sub-level
            const levelNumber = parentLevelNumber 
              ? `${parentLevelNumber}.${index + 1}` 
              : String.fromCharCode(65 + index); // A, B, C, etc. for top level
            
            return (
              <Draggable
                key={`${parentPath}-${subLevel.id}`}
                draggableId={`${parentPath}-${subLevel.id}`}
                index={index}
                isDragDisabled={loading}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <SubLevelRow
                      level={subLevel}
                      parentPath={parentPath}
                      onSubLevelChange={onSubLevelChange}
                      onRemoveSubLevel={onRemoveSubLevel}
                      onAddNestedSubLevel={onAddNestedSubLevel}
                      loading={loading}
                      dragHandleProps={provided.dragHandleProps}
                      levelNumber={levelNumber} // Pass the calculated level number
                    />
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

// Add the LevelNumber styled component at the top with other styled components
const LevelNumber = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #1a237e;
  margin-right: 10px;
  min-width: 40px;
`;

// Add this helper function before the return statement in the main component
  // Helper function to get the level numbering based on the level hierarchy
  const getLevelNumbering = (levelId) => {
    if (!levelId) return null;
    
    const findLevelNumbering = (levels, id, parentNumber = '') => {
      if (!levels) return null;
      
      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        const currentId = level.id?.toString() || level._id?.toString();
        
        // Calculate current level number
        const currentNumber = parentNumber 
          ? `${parentNumber}.${i + 1}` 
          : String.fromCharCode(65 + i); // A, B, C, etc. for top level
        
        if (currentId === id?.toString()) {
          return currentNumber;
        }
        
        if (level.subLevels && level.subLevels.length > 0) {
          const foundInSub = findLevelNumbering(level.subLevels, id, currentNumber);
          if (foundInSub) return foundInSub;
        }
      }
      
      return null;
    };
    
    return findLevelNumbering(formData.subLevels, levelId);
  };

// Add these styled components near other styled components
const MandatoryToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.mandatory ? '#e3f2fd' : '#f5f5f5'};
  color: ${props => props.mandatory ? '#0277bd' : '#757575'};
  border: 1px solid ${props => props.mandatory ? '#bbdefb' : '#e0e0e0'};
  
  &:hover {
    background: ${props => props.mandatory ? '#bbdefb' : '#eeeeee'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MandatoryIndicator = styled.div`
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  background: ${props => props.mandatory ? '#e3f2fd' : '#f5f5f5'};
  color: ${props => props.mandatory ? '#0277bd' : '#757575'};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const LevelNumberSpan = styled.span`
  font-weight: 600;
  color: #1a237e;
  margin-right: 6px;
`;

export default InspectionLevelForm;