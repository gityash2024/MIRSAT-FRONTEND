import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  Save, 
  ArrowLeft, 
  Folder, 
  ChevronRight, 
  ChevronDown,
  ChevronLeft,
  Check,
  X,
  Edit,
  User,
  Eye,
  Search,
  Copy,
  CheckCircle,
  Clock,
  List,
  Grid,
  HelpCircle,
  ListChecks,
  Database,
  BookOpen,
  PlusCircle,
  Move,
  Layers,
  Link2,
  FileText,
  Filter,
  RefreshCw,
  Clipboard,
  Trash,
  ChevronUp,
  Settings,
  AlertTriangle,
  Minus,
  Loader,
  Info
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import { inspectionService } from '../../services/inspection.service';
import {
  fetchQuestionLibrary,
  addQuestionToLibrary,
  deleteQuestionFromLibrary
} from '../../store/slices/questionLibrarySlice';
import { updateInspectionLevel } from '../../store/slices/inspectionLevelSlice';
import Skeleton from '../../components/ui/Skeleton';
import debounce from 'lodash/debounce';
import { v4 as uuidv4 } from 'uuid';
import { fetchAssetTypes } from '../../store/slices/assetTypeSlice';

// Modal component for confirmations
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel" 
}) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>{title}</h3>
        <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              color: '#4b5563',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1e293b;
  }
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
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#1a237e' : 'transparent'};
  color: ${props => props.$active ? '#1a237e' : '#64748b'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.$active ? '#1a237e' : '#334155'};
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${props => props.$active ? '#1a237e' : '#e2e8f0'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
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

const QuestionItemComponent = ({ 
  question, 
  questionIndex, 
  loading, 
  updateQuestion, 
  removeQuestion,
  allLevels = []
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [questionFilter, setQuestionFilter] = useState('all');
  
  // Get dispatch and library items from Redux
  const dispatch = useDispatch();
  const { questions: libraryItems, loading: libraryLoading } = useSelector(state => state.questionLibrary);
  
  // Load library with proper debugging
  const loadLibrary = async () => {
    console.log("QuestionItem: Loading question library...");
    try {
      const result = await dispatch(fetchQuestionLibrary()).unwrap();
      console.log("QuestionItem: Library loaded successfully");
      console.log("QuestionItem: Found", result?.results?.length || 0, "questions");
      
      if (result?.results?.length === 0) {
        console.log("QuestionItem: Empty library result - might be an API issue");
      }
    } catch (error) {
      console.error("QuestionItem: Error loading library:", error);
    }
  };
  
  // Load library when modal opens
  useEffect(() => {
    if (showLibraryModal) {
      loadLibrary();
    }
  }, [showLibraryModal]);
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let updatedQuestion = { 
      ...question, 
      answerType: newType
    };
    
    // If switching to multiple choice, add default compliance options
    if (newType === 'multiple' && (!question.options || question.options.length === 0)) {
      updatedQuestion.options = [
        'Fully compliance',
        'Partially compliance',
        'Not applicable'
      ];
    } else if (newType !== 'multiple') {
      // Reset options if changing to a type that doesn't need them
      updatedQuestion.options = [];
    }
    
    updateQuestion(updatedQuestion);
  };
  
  const addOption = () => {
    const options = [...(question.options || []), ''];
    updateQuestion({ ...question, options });
  };
  
  const updateOption = (index, value) => {
    const options = [...(question.options || [])];
    options[index] = value;
    updateQuestion({ ...question, options });
  };
  
  const removeOption = (index) => {
    const options = (question.options || []).filter((_, i) => i !== index);
    updateQuestion({ ...question, options });
  };
  
  // New function to save question to library
  const saveToLibrary = async () => {
    if (!question.text) {
      toast.error('Please add question text before saving to library');
      return;
    }
    
    try {
      // Prepare question for library
      const libraryQuestion = {
        text: question.text,
        answerType: question.answerType || 'yesno',
        options: question.options || [],
        required: !!question.required
      };
      
      // Use the addQuestionToLibrary action from the Redux store
      await dispatch(addQuestionToLibrary(libraryQuestion));
      toast.success('Question saved to library');
      
      // Refresh the library to show the new question
      loadLibrary();
    } catch (error) {
      console.error('Error saving to library:', error);
      toast.error('Failed to save question to library');
    }
  };

  // Function to handle selecting a question from the library
  const handleSelectFromLibrary = (libraryQuestion) => {
    // Map field names from database to component fields
    const updatedQuestion = {
      ...question,
      text: libraryQuestion.text || '',
      // Map different answer types to the component's expected format
      answerType: libraryQuestion.answerType === 'compliance' ? 'multiple' : 
                 (libraryQuestion.answerType || 'yesno'),
      options: libraryQuestion.options || [],
      required: !!libraryQuestion.required
    };
    
    console.log("Selected library question:", libraryQuestion);
    console.log("Updated question:", updatedQuestion);
    
    updateQuestion(updatedQuestion);
    setShowLibraryModal(false);
  };
  
  return (
    <>
      <div style={{ 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px',
        background: '#ffffff',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: expanded ? '1px solid #e2e8f0' : 'none',
          background: '#f8fafc'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            flex: 1
          }} onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <div style={{ fontWeight: 500, fontSize: '14px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '24px',
                height: '24px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                marginRight: '8px'
              }}>
                Q{questionIndex + 1}
              </span>
              {question.text || `Question ${questionIndex + 1}`}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={question.answerType || 'yesno'}
              onChange={handleTypeChange}
              onClick={e => e.stopPropagation()}
              disabled={loading}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '14px'
              }}
            >
              <option value="yesno">Yes/No</option>
              <option value="text">Text</option>
              <option value="multiple">Multiple Choice</option>
            </select>
            
            <button
              type="button"
              className="icon-button"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#64748b'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {expanded && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Question Text
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={question.text || ''}
                  onChange={(e) => updateQuestion({ ...question, text: e.target.value })}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px'
                  }}
                  placeholder="Enter question text..."
                />
                <div style={{ 
                  position: 'absolute', 
                  right: '8px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLibraryModal(true);
                    }}
                    style={{
                      border: 'none',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Database size={12} /> From Library
                  </button>
                  <button
                    type="button"
                    onClick={saveToLibrary}
                    style={{
                      border: 'none',
                      background: '#f0fdf4',
                      color: '#166534',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen size={12} /> Save to Library
                  </button>
                </div>
              </div>
            </div>
            
            {/* Show options for multiple choice type */}
            {question.answerType === 'multiple' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <label style={{ 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155'
                  }}>
                    Answer Options
                  </label>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={addOption}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} /> Add Option
                  </button>
                </div>
                
                {(question.options || []).map((option, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px'
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => removeOption(index)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#64748b'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                {(question.options || []).length === 0 && (
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    color: '#64748b',
                    fontSize: '13px'
                  }}>
                    No options added yet. Click "Add Option" to add answer choices.
                  </div>
                )}
              </div>
            )}
            
            {/* Add the Mandatory/Recommended dropdown */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '16px',
              alignItems: 'center' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id={`required-${questionIndex}`}
                  checked={question.required || false}
                  onChange={(e) => updateQuestion({ ...question, required: e.target.checked })}
                  disabled={loading}
                  style={{ cursor: 'pointer' }}
                />
                <label 
                  htmlFor={`required-${questionIndex}`}
                  style={{ 
                    fontSize: '14px',
                    cursor: 'pointer' 
                  }}
                >
                  Required
                </label>
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative'
              }}>
                <label 
                  style={{ 
                    fontSize: '14px',
                  }}
                >
                  Importance:
                </label>
                <div style={{
                  position: 'relative',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <select
                    value={question.mandatory === false ? 'recommended' : 'mandatory'}
                    onChange={(e) => updateQuestion({ 
                      ...question, 
                      mandatory: e.target.value === 'mandatory' ? true : false 
                    })}
                    disabled={loading}
                    style={{
                      padding: '6px 30px 6px 10px',
                      fontSize: '14px',
                      border: 'none',
                      outline: 'none',
                      background: question.mandatory === false ? '#fff1f2' : '#dcfce7',
                      color: question.mandatory === false ? '#be123c' : '#166534',
                      appearance: 'none',
                      width: '130px'
                    }}
                  >
                    <option value="mandatory">Mandatory</option>
                    <option value="recommended">Recommended</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Link to Level section removed as requested */}
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={removeQuestion}
        title="Remove Question"
        message="Are you sure you want to remove this question? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
      />
      
      {/* Question Library Modal */}
      {showLibraryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '700px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Question Library</h2>
              <button
                onClick={() => setShowLibraryModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                &times;
              </button>
            </div>
            
            {/* Search and filters */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={librarySearchQuery || ''}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent form submission on Enter key
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                  Filter by:
                </div>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: questionFilter === 'all' ? '#1a237e' : '#f8fafc',
                    color: questionFilter === 'all' ? 'white' : '#64748b',
                    border: '1px solid ' + (questionFilter === 'all' ? '#1a237e' : '#e0e0e0'),
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setQuestionFilter('all');
                  }}
                >
                  All
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: questionFilter === 'yesno' ? '#1a237e' : '#f8fafc',
                    color: questionFilter === 'yesno' ? 'white' : '#64748b',
                    border: '1px solid ' + (questionFilter === 'yesno' ? '#1a237e' : '#e0e0e0'),
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setQuestionFilter('yesno');
                  }}
                >
                  Yes/No
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: questionFilter === 'text' ? '#1a237e' : '#f8fafc',
                    color: questionFilter === 'text' ? 'white' : '#64748b',
                    border: '1px solid ' + (questionFilter === 'text' ? '#1a237e' : '#e0e0e0'),
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setQuestionFilter('text');
                  }}
                >
                  Text
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    background: questionFilter === 'multiple' ? '#1a237e' : '#f8fafc',
                    color: questionFilter === 'multiple' ? 'white' : '#64748b',
                    border: '1px solid ' + (questionFilter === 'multiple' ? '#1a237e' : '#e0e0e0'),
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    setQuestionFilter('multiple');
                  }}
                >
                  Multiple Choice
                </button>
              </div>
            </div>
            
            {/* Question list */}
            {libraryLoading ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <Loader size={30} />
                <p style={{ color: '#64748b', marginTop: '8px' }}>Loading question library...</p>
              </div>
            ) : (libraryItems && libraryItems.length > 0) ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {(() => {
                  // Create a filtered version of the items first for debugging
                  const filteredItems = libraryItems.filter(q => {
                    // Log the item to check its structure
                    if (libraryItems.length > 0 && libraryItems.indexOf(q) === 0) {
                      console.log("Library item structure:", q);
                    }
                    
                    // Apply search filter to text field
                    if (librarySearchQuery && q.text && 
                        !q.text.toLowerCase().includes(librarySearchQuery.toLowerCase())) {
                      return false;
                    }
                    
                    // Apply type filter - handle different answerType formats
                    if (questionFilter !== 'all') {
                      // Handle different possible formats for answerType
                      const qType = q.answerType || '';
                      
                      // Map database values to UI filter values
                      if (questionFilter === 'yesno' && 
                          (qType === 'yesno' || qType === 'yes/no' || qType === 'yes-no')) {
                        return true;
                      }
                      
                      if (questionFilter === 'text' && 
                          (qType === 'text' || qType === 'textarea')) {
                        return true;
                      }
                      
                      if (questionFilter === 'multiple' && 
                          (qType === 'multiple' || qType === 'compliance' || qType === 'choice')) {
                        return true;
                      }
                      
                      return false;
                    }
                    
                    return true;
                  });
                  
                  // Log filtered results for debugging
                  console.log(`Found ${filteredItems.length} out of ${libraryItems.length} items matching filter: ${questionFilter}`);
                  
                  if (filteredItems.length === 0) {
                    return (
                      <div style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        background: '#f8fafc',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>No questions found</div>
                        <p style={{ margin: '0 0 16px 0' }}>
                          {librarySearchQuery || questionFilter !== 'all' ? 
                            'Try adjusting your search criteria or filters' : 
                            'Add questions to your library for reuse across templates'}
                        </p>
                      </div>
                    );
                  }
                  
                  return filteredItems.map((item, index) => (
                    <div 
                      key={item.id || item._id || index}
                      style={{
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectFromLibrary(item)}
                    >
                      <div style={{ fontSize: '15px', marginBottom: '8px' }}>{item.text}</div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '13px',
                        color: '#64748b'
                      }}>
                        <div>
                          Type: {item.answerType === 'yesno' || item.answerType === 'yes/no' ? 'Yes/No' : 
                                item.answerType === 'text' ? 'Text' : 
                                item.answerType === 'compliance' ? 'Compliance' :
                                'Multiple Choice'}
                        </div>
                        <div>
                          {item.required ? 'Required' : 'Optional'}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>No questions found</div>
                <p style={{ margin: '0 0 16px 0' }}>
                  {librarySearchQuery || questionFilter !== 'all' ? 
                    'Try adjusting your search criteria or filters' : 
                    'Add questions to your library for reuse across templates'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SubLevelTreeComponent = ({ 
  subLevels, 
  level = 0, 
  selectedLevelId,
  onSelectLevel,
  parentNumber = '', // Add parent number parameter for auto-numbering
  searchQuery = ''
}) => {
  const [expandedLevels, setExpandedLevels] = useState({});
  
  // Toggle level expanded/collapsed
  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };
  
  useEffect(() => {
    // Auto-expand all when searching
    if (searchQuery) {
      const expandAll = {};
      const addExpandedIds = (levels) => {
        if (!levels || !Array.isArray(levels)) return;
        
        levels.forEach(node => {
          const nodeId = node.id || node._id;
          if (nodeId) expandAll[nodeId] = true;
          if (node.subLevels && node.subLevels.length > 0) {
            addExpandedIds(node.subLevels);
          }
        });
      };
      
      addExpandedIds(subLevels);
      setExpandedLevels(expandAll);
    }
  }, [searchQuery, subLevels]);
  
  if (!subLevels || !Array.isArray(subLevels)) return null;
  
  // Filter levels recursively based on search query
  const filterLevels = (levels, query) => {
    if (!query) return levels;
    
    return levels.filter(node => {
      // Check if current node matches search
      const nameMatch = node.name?.toLowerCase().includes(query.toLowerCase());
      
      // Check if any children match search
      const hasMatchingChildren = 
        node.subLevels && 
        node.subLevels.length > 0 && 
        filterLevels(node.subLevels, query).length > 0;
      
      return nameMatch || hasMatchingChildren;
    }).map(node => {
      if (node.subLevels && node.subLevels.length > 0) {
        return {
          ...node,
          subLevels: filterLevels(node.subLevels, query)
        };
      }
      return node;
    });
  };
  
  const filteredLevels = filterLevels(subLevels, searchQuery);
  
  return (
    <>
      {filteredLevels.map((subLevel, index) => {
        if (!subLevel) return null;
        
        const levelId = subLevel.id || subLevel._id;
        const hasChildren = subLevel.subLevels && Array.isArray(subLevel.subLevels) && subLevel.subLevels.length > 0;
        const isExpanded = levelId ? expandedLevels[levelId] : false;
        
        return (
          <div key={levelId || `sublevel-${index}`}>
            <TreeNodeContainer>
              <TreeNode 
                selected={selectedLevelId === levelId}
                onClick={() => levelId && onSelectLevel(levelId)}
              >
                {hasChildren && (
                  <div onClick={(e) => {
                    e.stopPropagation();
                    levelId && toggleLevel(levelId);
                  }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                )}
                <TreeNodeContent level={level} isParent={hasChildren}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '24px',
                    height: '24px',
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginRight: '8px'
                  }}>
                    {/* Replace existing numbering with A-style format */}
                    {level === 0 
                      ? String.fromCharCode(65 + index) // A, B, C, etc. for top level
                      : parentNumber 
                        ? `${parentNumber}${index + 1}` 
                        : `${index + 1}`
                    }
                  </span>
                  {subLevel.name || 'Unnamed Level'}
                </TreeNodeContent>
                <BadgeContainer>
                  <Badge color="#3949ab">{subLevel.questionCount || 0}</Badge>
                </BadgeContainer>
              </TreeNode>
              
              {hasChildren && isExpanded && (
                <div style={{ marginLeft: '20px' }}>
                  <SubLevelTreeComponent 
                    subLevels={subLevel.subLevels} 
                    level={level + 1}
                    selectedLevelId={selectedLevelId}
                    onSelectLevel={onSelectLevel}
                    parentNumber={level === 0 
                      ? `${String.fromCharCode(65 + index)}.` 
                      : `${parentNumber}${index + 1}.`
                    } 
                    searchQuery={searchQuery}
                  />
                </div>
              )}
            </TreeNodeContainer>
          </div>
        );
      })}
    </>
  );
};

// Component to display activity history
const ActivityHistoryCard = ({ formData, activities = [], isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Template Activity</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            &times;
          </button>
        </div>
        
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>Current Template</div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <div style={{ marginBottom: '8px' }}><strong>Name:</strong> {formData.name || 'Untitled'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Type:</strong> {formData.type || '-'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Sets:</strong> {formData.sets?.length || 0}</div>
            <div><strong>Description:</strong> {formData.description || 'No description'}</div>
          </div>
        </div>
        
        <h3 style={{ 
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: '#334155'
        }}>
          Activity Log
        </h3>
        
        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((activity, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px',
                  borderLeft: '3px solid #cbd5e1',
                  background: index % 2 === 0 ? '#f8fafc' : 'white',
                  borderRadius: '4px'
                }}
              >
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '22px',
                    backgroundColor: '#1a237e',
                    color: 'white',
                    borderRadius: '11px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {activities.length - index}
                  </span>
                  {activity.title}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '16px',
            textAlign: 'center', 
            color: '#64748b',
            fontSize: '14px',
            background: '#f1f5f9',
            borderRadius: '6px'
          }}>
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

// Custom loading skeleton component
const SkeletonLoader = () => {
  return (
    <LoadingSpinner>
      <div className="spinner"></div>
      <p>Loading template data...</p>
    </LoadingSpinner>
  );
};

const InspectionLevelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const saveTimerRef = useRef(null);
  
  // Get asset types from Redux store
  const { assetTypes } = useSelector(state => state.assetTypes || { assetTypes: [] });
  
  // State persistence functions
  const getStorageKey = () => id ? `inspection_form_${id}` : 'inspection_form_new';
  
  const saveFormToStorage = (formData) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify({
        ...formData,
        _lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving form state to localStorage:', error);
    }
  };
  
  const loadFormFromStorage = () => {
    try {
      const savedData = localStorage.getItem(getStorageKey());
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading form state from localStorage:', error);
    }
    return null;
  };
  
  const clearFormStorage = () => {
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error('Error clearing form state from localStorage:', error);
    }
  };
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'marina_operator',
    priority: 'medium',
    status: 'active',
    sets: []  // Store inspection sets here instead of direct subLevels
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showLinkQuestionModal, setShowLinkQuestionModal] = useState(false);
  const [questionToLink, setQuestionToLink] = useState(null);
  const [showQuestionLibrary, setShowQuestionLibrary] = useState(false);
  const [userHasEdited, setUserHasEdited] = useState(false);
  const [hasRecoveredData, setHasRecoveredData] = useState(false);
  
  // Active set management
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  
  // Calculate current set for use in the component
  const currentSet = formData.sets[activeSetIndex] || {
    name: '',
    description: '',
    subLevels: [],
    questions: [],
    generalQuestions: []
  };

  // Activity history
  const [activities, setActivities] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // Questions state
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5);
  const [questionFilter, setQuestionFilter] = useState('all');
  const [questionSearchTerm, setQuestionSearchTerm] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [questionsByLevel, setQuestionsByLevel] = useState({});
  
  // Question library state
  const { questions: libraryItems, loading: libraryLoading } = useSelector(state => state.questionLibrary);
  
  // Track last saved data to detect changes
  const lastSavedDataRef = useRef(null);

  // Add a new activity to the activity history, but only for significant events
  const addActivity = (title) => {
    // Filter out trivial updates
    if (title.includes('added') || 
        title.includes('removed') || 
        title.includes('created') || 
        title.includes('template updated')) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setActivities(prev => [{ title, timestamp }, ...prev.slice(0, 19)]);  // Keep last 20 activities
    }
  };

  const handleError = (error) => {
    if (error.response?.data?.errors) {
      // Process backend validation errors
      const backendErrors = error.response.data.errors;
      const formattedErrors = {};
      
      // Format errors for display
      Object.keys(backendErrors).forEach(field => {
        if (field.startsWith('sets.')) {
          // Handle set-specific errors
          const parts = field.split('.');
          if (parts.length === 3) {
            // Format: sets.0.name
            const setIndex = parseInt(parts[1]);
            const fieldName = parts[2];
            formattedErrors[`set_${setIndex}_${fieldName}`] = backendErrors[field];
          }
        } else {
          // Handle top-level form errors
          formattedErrors[field] = backendErrors[field];
        }
      });
      
      setErrors(formattedErrors);
    } else {
      // Show a generic error for non-validation errors
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };
  
  // Save form data to localStorage when it changes
  useEffect(() => {
    if (!initialLoading && userHasEdited) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        saveFormToStorage(formData);
      }, 1000); // Debounce saves to localStorage for better performance
    }
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [formData, initialLoading, userHasEdited]);
  
  // Effect to load data and set up listeners
  useEffect(() => {
    // Fetch asset types
    dispatch(fetchAssetTypes());
    
    if (id) {
      fetchInspectionLevel();
    } else {
      // For new template, check for persisted data first
      const persistedForm = loadFormFromStorage();
      
      if (persistedForm) {
        // Remove metadata fields
        const { _lastSaved, ...cleanForm } = persistedForm;
        setFormData(cleanForm);
        
        // Show notification
        toast.success('Recovered your draft template');
        addActivity('Loaded draft from local storage');
        setHasRecoveredData(true);
      } else {
        // Initialize with one empty set
        setFormData(prev => ({
          ...prev,
          sets: [{
            id: Date.now(),
            name: '',
            description: '',
            subLevels: [],
            questions: [],
            generalQuestions: []
          }]
        }));
      }
      setInitialLoading(false);
    }
    
    // Load question library
    loadQuestionLibrary();
    
    // Add beforeunload event listener to warn about unsaved changes
    const handleBeforeUnload = (e) => {
      if (userHasEdited) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // Clean up
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [id, dispatch]);
  
  // Function to load library with proper debugging
  const loadQuestionLibrary = async () => {
    console.log("Loading question library...");
    try {
      const result = await dispatch(fetchQuestionLibrary()).unwrap();
      console.log("Question library loaded:", result);
      console.log("Question count:", result?.results?.length || 0);
    } catch (error) {
      console.error("Error loading question library:", error);
      toast.error("Failed to load question library");
    }
  };

  // Update question counts when needed
  useEffect(() => {
    updateQuestionCounts();
  }, [questions, formData.sets]);

  const updateQuestionCounts = () => {
    const newCounts = {};
    
    // No need to update on every keystroke - this is just for UI display
    // We'll calculate when needed but not trigger API calls
    
    setQuestionsByLevel(newCounts);
  };

  const fetchInspectionLevel = async () => {
    try {
      setInitialLoading(true);
      
      // Check for persisted state first
      const persistedForm = loadFormFromStorage();
      
      // Load data from API
      const data = await inspectionService.getInspectionLevel(id);
      console.log("Backend data:", data);
      
      // If we have persisted data, compare timestamps
      if (persistedForm && persistedForm._lastSaved) {
        const serverTimestamp = new Date(data.updatedAt || data.createdAt).getTime();
        const localTimestamp = new Date(persistedForm._lastSaved).getTime();
        
        // Use persisted form if it's newer than server data
        if (localTimestamp > serverTimestamp) {
          // Remove metadata fields
          const { _lastSaved, ...cleanForm } = persistedForm;
          setFormData(cleanForm);
          
          toast.success('Recovered unsaved changes');
          addActivity('Loaded unsaved changes from local storage');
          setHasRecoveredData(true);
          setInitialLoading(false);
          return;
        }
      }
      
      // Initialize processed data with top-level fields
      let processedData = {
        name: data.name || '',
        description: data.description || '',
        type: data.type || 'marina_operator',
        priority: data.priority || 'medium',
        status: data.status || 'active'
      };
      
      // Handle sets properly - use existing sets if available
      if (data.sets && Array.isArray(data.sets) && data.sets.length > 0) {
        // Ensure each set has proper ID and arrays
        processedData.sets = data.sets.map(set => ({
          ...set,
          id: set.id || set._id || Date.now(),
          name: set.name || 'Unnamed Set',
          description: set.description || '',
          subLevels: set.subLevels || [],
          questions: set.questions || [],
          generalQuestions: set.generalQuestions || []
        }));
      } else {
        // Create a new set structure from top-level data
        processedData.sets = [{
          id: Date.now(),
          name: data.name ? `${data.name} Set` : 'Main Set',
          description: data.description || 'Main inspection set',
          subLevels: data.subLevels || [],
          questions: data.questions || [],
          generalQuestions: []
        }];
      }
      
      setFormData(processedData);
      setInitialLoading(false);
    } catch (error) {
      console.error('Error fetching inspection level:', error);
      handleError(error);
      setInitialLoading(false);
    }
  };
  
  // Add a new inspection set - significant event, track it
  const addInspectionSet = () => {
    setUserHasEdited(true);
    
    const newSet = {
      id: Date.now(),
      name: '',
      description: '',
      subLevels: [],
      questions: [],
      generalQuestions: []
    };
    
    setFormData(prev => ({
      ...prev,
      sets: [...prev.sets, newSet]
    }));
    
    // Set the active set to the newly added one
    setActiveSetIndex(formData.sets.length);
    
    // Track this activity
    addActivity('New inspection set added');
  };
  
  // Remove an inspection set - significant event, track it
  const removeInspectionSet = (index) => {
    if (formData.sets.length <= 1) {
      toast.error('At least one inspection set is required');
      return;
    }
    
    setUserHasEdited(true);
    
    setFormData(prev => {
      const newSets = prev.sets.filter((_, i) => i !== index);
      
      // If we're removing the active set, select a new one
      if (activeSetIndex >= newSets.length) {
        setActiveSetIndex(Math.max(0, newSets.length - 1));
      } else if (activeSetIndex === index) {
        setActiveSetIndex(Math.max(0, index - 1));
      }
      
      return {
        ...prev,
        sets: newSets
      };
    });
    
    // Track this activity
    addActivity(`Inspection set ${formData.sets[index]?.name || `#${index + 1}`} removed`);
  };

  // Update a field in a set - filter trivial updates from activity tracking
  const updateSet = (index, field, value) => {
    setUserHasEdited(true);
    
    setFormData(prev => {
      const newFormData = { ...prev };
      if (!newFormData.sets[index]) {
        newFormData.sets[index] = {};
      }
      
      // Track only significant activities, not every keystroke
      if (field === 'name' && 
          value && 
          value.trim() !== '' && 
          value !== newFormData.sets[index]?.name) {
        addActivity(`Set ${index + 1} name updated`);
      } else if (field === 'subLevels' && 
                JSON.stringify(value) !== JSON.stringify(newFormData.sets[index]?.subLevels)) {
        if (!newFormData.sets[index].subLevels || 
            value.length > (newFormData.sets[index].subLevels?.length || 0)) {
          addActivity(`Level added to Set ${index + 1}`);
        } else if (value.length < (newFormData.sets[index].subLevels?.length || 0)) {
          addActivity(`Level removed from Set ${index + 1}`);
        }
      } else if (field === 'generalQuestions' && 
                JSON.stringify(value) !== JSON.stringify(newFormData.sets[index]?.generalQuestions)) {
        if (!newFormData.sets[index].generalQuestions || 
            value.length > (newFormData.sets[index].generalQuestions?.length || 0)) {
          addActivity(`Question added to Set ${index + 1}`);
        } else if (value.length < (newFormData.sets[index].generalQuestions?.length || 0)) {
          addActivity(`Question removed from Set ${index + 1}`);
        }
      }
      
      newFormData.sets[index][field] = value;
      return newFormData;
    });
  };

  // Tab change - no need to trigger API calls or activity logs
  const handleTabChange = (newTab) => {
    // Only change tabs via navigation buttons
    setActiveTab(newTab);
  };

  // New function for navigation buttons only
  const handleNavigationButtonClick = (newTab) => {
    setActiveTab(newTab);
  };

  // Basic form field change - no need to trigger API calls for every keystroke
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setUserHasEdited(true);
  };

  // Form validation - only used when explicitly submitting the form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validate top-level fields
    if (!formData.name?.trim()) {
      newErrors.name = 'Template name is required';
      isValid = false;
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Template description is required';
      isValid = false;
    }
    
    // Validate each set
    formData.sets.forEach((set, index) => {
      if (!set.name || !set.name.trim()) {
        newErrors[`set_${index}_name`] = 'Set name is required';
        isValid = false;
      }
      
      // Check for at least one level or question in the set
      if ((!set.subLevels || set.subLevels.length === 0) && 
          (!set.generalQuestions || set.generalQuestions.length === 0)) {
        newErrors[`set_${index}_content`] = 'Set must have at least one level or question';
        isValid = false;
      }
    });
    
    // Check if there are no sets
    if (formData.sets.length === 0) {
      newErrors.sets = 'At least one inspection set is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return { isValid, newErrors };
  };
  
  // Form submission - the ONLY place where API calls should happen
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, newErrors } = validateForm();
    if (!isValid) {
      // Use the validation results immediately instead of waiting for state
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField) {
        // Switch to the tab with errors first
        if (firstErrorField === 'name' || firstErrorField === 'description') {
          handleNavigationButtonClick('basic');
          
          // After switching tab, focus the field
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) element.focus();
          }, 100);
        } else if (firstErrorField.startsWith('set_') || firstErrorField === 'sets') {
          handleNavigationButtonClick('sets');
          
          // After switching tab, focus the field
          setTimeout(() => {
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) element.focus();
          }, 100);
        }
        
        // Show specific error message in toast
        toast.error(`Validation error: ${newErrors[firstErrorField]}`);
      } else {
        toast.error('Please fix the validation errors');
      }
      return;
    }
    
    setLoading(true);
    
    try {
      // Process subLevels recursively to ensure they have order field
      // and handle ID fields properly for MongoDB
      const processSubLevels = (subLevels, startOrder = 0) => {
        if (!Array.isArray(subLevels)) return [];
        
        return subLevels.map((subLevel, index) => {
          // Create a new object to avoid mutation
          const processedSubLevel = {
            ...subLevel,
            // Always include order field (required by backend)
            order: subLevel.order || (startOrder + index)
          };
          
          // Handle MongoDB ID correctly - if it's a MongoDB ObjectId format, keep it
          // Otherwise, remove it so MongoDB can generate a proper one
          if (processedSubLevel._id) {
            // If _id is not a valid MongoDB ObjectId format (24-char hex string), remove it
            if (typeof processedSubLevel._id === 'number' || 
                !processedSubLevel._id.match(/^[0-9a-fA-F]{24}$/)) {
              delete processedSubLevel._id;
            }
          }
          
          // If id exists but not a valid MongoDB format, remove it
          if (processedSubLevel.id) {
            delete processedSubLevel.id;
          }
          
          // Process nested subLevels recursively
          if (processedSubLevel.subLevels && Array.isArray(processedSubLevel.subLevels)) {
            processedSubLevel.subLevels = processSubLevels(processedSubLevel.subLevels);
          }
          
          // Process questions to ensure proper format
          if (processedSubLevel.questions && Array.isArray(processedSubLevel.questions)) {
            processedSubLevel.questions = processedSubLevel.questions.map(q => {
              const processedQ = { ...q };
              // Remove client-side IDs that aren't valid ObjectIds
              if (processedQ.id) delete processedQ.id;
              if (processedQ._id && (typeof processedQ._id === 'number' || 
                  !processedQ._id.match(/^[0-9a-fA-F]{24}$/))) {
                delete processedQ._id;
              }
              
              // Ensure mandatory field is properly set
              // If not explicitly set to false, default to true (mandatory)
              if (processedQ.mandatory !== false) {
                processedQ.mandatory = true;
              }
              
              return processedQ;
            });
          }
          
          return processedSubLevel;
        });
      };
      
      // Process questions to ensure proper format
      const processQuestions = (questions) => {
        if (!Array.isArray(questions)) return [];
        
        return questions.map(q => {
          const processedQ = { ...q };
          // Remove client-side IDs that aren't valid ObjectIds
          if (processedQ.id) delete processedQ.id;
          if (processedQ._id && (typeof processedQ._id === 'number' || 
              !processedQ._id.match(/^[0-9a-fA-F]{24}$/))) {
            delete processedQ._id;
          }
          
          // Ensure mandatory field is properly set
          // If not explicitly set to false, default to true (mandatory)
          if (processedQ.mandatory !== false) {
            processedQ.mandatory = true;
          }
          
          return processedQ;
        });
      };
      
      // Process all sets to ensure proper data structure
      const processedSets = formData.sets.map((set, index) => {
        const processedSet = { ...set };
        
        // Remove numeric or invalid _id values
        if (processedSet._id && (typeof processedSet._id === 'number' || 
            !processedSet._id.match(/^[0-9a-fA-F]{24}$/))) {
          delete processedSet._id;
        }
        
        // Remove client-side id
        if (processedSet.id) delete processedSet.id;
        
        // Process subLevels
        processedSet.subLevels = processSubLevels(set.subLevels);
        
        // Process questions
        processedSet.questions = processQuestions(set.questions);
        processedSet.generalQuestions = processQuestions(set.generalQuestions);
        
        return processedSet;
      });
      
      // Prepare the complete payload
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        // Use processed sets
        sets: processedSets,
        // For backward compatibility, include subLevels and questions from first set
        subLevels: processedSets[0]?.subLevels || [],
        questions: [...(processedSets[0]?.questions || []), ...(processedSets[0]?.generalQuestions || [])]
      };
      
      console.log("Submitting to backend:", payload);
      
      let response;
      
      if (id) {
        // Update existing template
        response = await inspectionService.updateInspectionLevel(id, payload);
        addActivity('Template updated successfully');
      } else {
        // Create new template
        response = await inspectionService.createInspectionLevel(payload);
        addActivity('Template created successfully');
      }
      
      // Clear persisted form data after successful submission
      clearFormStorage();
      
      toast.success(id ? 'Template updated successfully' : 'Template created successfully');
      navigate('/inspection');
    } catch (error) {
      console.error('Error saving template:', error);
      handleError(error);
      setLoading(false);
    }
  };

  // Use existing methods for the rest of the component

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/inspection')}>
        <ChevronLeft size={16} /> Back to Inspection Templates
      </BackButton>
      
      <Header>
        <h1>{id ? 'Edit Inspection Template' : 'Create Inspection Template'}</h1>
        <button
          onClick={() => setShowActivityModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <Clock size={16} /> View Activity Log
        </button>
      </Header>
      
      {hasRecoveredData && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: '6px',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} />
            <span>Working with recovered data. Your changes are automatically saved.</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to discard the recovered data and start fresh?')) {
                clearFormStorage();
                window.location.reload();
              }
            }}
            style={{
              backgroundColor: '#166534',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Discard Recovery
          </button>
        </div>
      )}
      
      {initialLoading ? (
        <SkeletonLoader />
      ) : (
        <Form ref={formRef} onSubmit={handleSubmit}>
          <FormSectionWithTabs>
            <TabsContainer>
              <Tab 
                key="basic" 
                $active={activeTab === 'basic'}
                style={{ 
                  cursor: 'default',
                  opacity: activeTab === 'basic' ? 1 : 0.6,
                  pointerEvents: 'none' // Completely disable interactions
                }}
              >
                Basic Info
              </Tab>
              <Tab 
                key="sets" 
                $active={activeTab === 'sets'}
                style={{ 
                  cursor: 'default',
                  opacity: activeTab === 'sets' ? 1 : 0.6,
                  pointerEvents: 'none' // Completely disable interactions
                }}
              >
                Inspection Sets
                <TabCount $active={activeTab === 'sets'}>
                  {formData.sets.length}
                </TabCount>
              </Tab>
              
              <div style={{
                marginLeft: 'auto',
                fontSize: '12px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Info size={14} />
                Use navigation buttons below to switch between sections
              </div>
            </TabsContainer>
            
            {activeTab === 'basic' && (
              <TabContent>
                <FormGrid>
                  <FormGroup>
                    <Label>Template Name</Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter template name"
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
                      <option value="">Select type</option>
                      {assetTypes && assetTypes.length > 0 ? (
                        assetTypes.map(type => (
                          <option key={type._id} value={type.name.toLowerCase().replace(/\s+/g, '_')}>
                            {type.name}
                          </option>
                        ))
                      ) : (
                        // Fallback to original options if no asset types are available
                        <>
                          <option value="marina_operator">Marina Operator</option>
                          <option value="yacht_chartering">Yacht Chartering</option>
                          <option value="tourism_agent">Tourism Agent</option>
                        </>
                      )}
                    </Select>
                    {errors.type && <ErrorMessage>{errors.type}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup style={{ gridColumn: '1 / -1' }}>
                    <Label>Description</Label>
                    <TextArea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter template description"
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
                    onClick={() => handleNavigationButtonClick('sets')}
                    disabled={loading}
                  >
                    Next: Inspection Sets <ChevronRight size={16} />
                  </Button>
                </TabNavigationButtons>
              </TabContent>
            )}
            
            {activeTab === 'sets' && (
              <TabContent>
                {/* Display set-related errors at the top of the tab */}
                {errors.sets && (
                  <div style={{ 
                    padding: '10px 16px', 
                    marginBottom: '16px', 
                    background: '#fee2e2', 
                    color: '#b91c1c', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    {errors.sets}
                  </div>
                )}
                
                {/* Sets selector tabs - Add this if you have multiple sets */}
                {formData.sets.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '20px', 
                    overflowX: 'auto',
                    padding: '0 0 10px 0'
                  }}>
                    {formData.sets.map((set, index) => (
                      <button
                        key={set.id || index}
                        onClick={() => setActiveSetIndex(index)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          background: activeSetIndex === index ? '#1a237e' : '#f8fafc',
                          color: activeSetIndex === index ? 'white' : '#64748b',
                          border: '1px solid ' + (activeSetIndex === index ? '#1a237e' : '#e2e8f0'),
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {set.name || `Set ${index + 1}`}
                        {errors[`set_${index}_name`] || errors[`set_${index}_content`] ? (
                          <span style={{ 
                            display: 'inline-block',
                            marginLeft: '6px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#ef4444'
                          }}></span>
                        ) : null}
                      </button>
                    ))}
                    <button
                      onClick={addInspectionSet}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Plus size={14} /> Add Set
                    </button>
                  </div>
                )}
                
                <div style={{ marginBottom: '20px' }}>
                  {/* Set name and description */}
                  <div style={{ 
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <FormGroup style={{ marginBottom: '16px' }}>
                      <Label>Set Name</Label>
                      <Input
                        type="text"
                        name={`set_${activeSetIndex}_name`}
                        value={formData.sets[activeSetIndex]?.name || ''}
                        onChange={(e) => updateSet(activeSetIndex, 'name', e.target.value)}
                        placeholder="Enter set name"
                        disabled={loading}
                      />
                      {errors[`set_${activeSetIndex}_name`] && <ErrorMessage>{errors[`set_${activeSetIndex}_name`]}</ErrorMessage>}
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Set Description</Label>
                      <TextArea
                        name={`set_${activeSetIndex}_description`}
                        value={formData.sets[activeSetIndex]?.description || ''}
                        onChange={(e) => updateSet(activeSetIndex, 'description', e.target.value)}
                        placeholder="Enter set description"
                        disabled={loading}
                        style={{ minHeight: '80px' }}
                      />
                    </FormGroup>
                  </div>
                  
                  {/* Display set content error if exists */}
                  {errors[`set_${activeSetIndex}_content`] && (
                    <div style={{ 
                      padding: '10px 16px', 
                      marginBottom: '16px', 
                      background: '#fee2e2', 
                      color: '#b91c1c', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      {errors[`set_${activeSetIndex}_content`]}
                    </div>
                  )}
                  
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '28px',
                      height: '28px',
                      backgroundColor: '#1a237e',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      S{activeSetIndex + 1}
                    </span>
                    Level Structure
                  </h3>
                  
                  {formData.sets[activeSetIndex]?.subLevels && formData.sets[activeSetIndex].subLevels.length > 0 ? (
                    <div style={{ 
                      padding: '16px', 
                      background: '#f8fafc', 
                      borderRadius: '8px', 
                      marginBottom: '16px' 
                    }}>
                      <SubLevelTreeComponent
                        subLevels={formData.sets[activeSetIndex].subLevels}
                        selectedLevelId={selectedLevelId}
                        onSelectLevel={(levelId) => {
                          setSelectedLevelId(levelId);
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      color: '#64748b' 
                    }}>
                      No levels added yet. Add your first level to get started.
                    </div>
                  )}
                  
                  <Button 
                    type="button"
                    onClick={() => {
                      // Add a new top-level
                      const newLevel = {
                        id: Date.now(),
                        name: `New Level ${(formData.sets[activeSetIndex]?.subLevels?.length || 0) + 1}`,
                        description: 'New level description',
                        // Add order field here - required by backend
                        order: formData.sets[activeSetIndex]?.subLevels?.length || 0,
                        subLevels: [],
                        questions: []
                      };
                      
                      const updatedSubLevels = [
                        ...(formData.sets[activeSetIndex]?.subLevels || []),
                        newLevel
                      ];
                      
                      updateSet(activeSetIndex, 'subLevels', updatedSubLevels);
                      
                      // Select the new level
                      setSelectedLevelId(newLevel.id);
                    }}
                    style={{ marginBottom: '24px' }}
                  >
                    <Plus size={16} /> Add New Level
                  </Button>
                </div>
                
                {selectedLevelId && (
                  <div style={{ 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      marginTop: 0,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '28px',
                          height: '28px',
                          backgroundColor: '#0891b2',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          L
                        </span>
                        Selected Level Details
                      </span>
                      <Button
                        type="button"
                        onClick={() => {
                          // Find the level and its parent
                          let levelToRemove = null;
                          let parentLevel = null;
                          
                          // Helper function to find level and parent
                          const findLevel = (levels, parent = null) => {
                            for (const level of levels) {
                              if (level.id === selectedLevelId) {
                                levelToRemove = level;
                                parentLevel = parent;
                                return true;
                              }
                              
                              if (level.subLevels && level.subLevels.length > 0) {
                                if (findLevel(level.subLevels, level)) {
                                  return true;
                                }
                              }
                            }
                            return false;
                          };
                          
                          findLevel(formData.sets[activeSetIndex].subLevels);
                          
                          if (levelToRemove) {
                            if (parentLevel) {
                              // Remove from parent's subLevels
                              parentLevel.subLevels = parentLevel.subLevels.filter(
                                l => l.id !== selectedLevelId
                              );
                              
                              // Update the set with the modified structure
                              updateSet(
                                activeSetIndex, 
                                'subLevels', 
                                [...formData.sets[activeSetIndex].subLevels]
                              );
                            } else {
                              // Top level - remove directly from the set
                              updateSet(
                                activeSetIndex,
                                'subLevels',
                                formData.sets[activeSetIndex].subLevels.filter(
                                  l => l.id !== selectedLevelId
                                )
                              );
                            }
                            
                            // Clear selected level
                            setSelectedLevelId(null);
                          }
                        }}
                        style={{
                          padding: '6px 10px',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none'
                        }}
                      >
                        <Trash2 size={16} /> Remove Level
                      </Button>
                    </h3>
                    
                    {/* Find the selected level */}
                    {(() => {
                      // Helper function to find a level by ID
                      const findLevelById = (levels, id) => {
                        for (const level of levels) {
                          if (level.id === id) {
                            return level;
                          }
                          
                          if (level.subLevels && level.subLevels.length > 0) {
                            const found = findLevelById(level.subLevels, id);
                            if (found) return found;
                          }
                        }
                        return null;
                      };
                      
                      const selectedLevel = findLevelById(
                        formData.sets[activeSetIndex]?.subLevels || [],
                        selectedLevelId
                      );
                      
                      if (!selectedLevel) {
                        return (
                          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                            Selected level not found. Please select another level.
                          </div>
                        );
                      }
                      
                      // Helper function to update level properties
                      const updateSelectedLevel = (field, value) => {
                        // Deep clone the levels array
                        const updateLevels = (levels) => {
                          return levels.map(level => {
                            if (level.id === selectedLevelId) {
                              return { ...level, [field]: value };
                            }
                            
                            if (level.subLevels && level.subLevels.length > 0) {
                              return {
                                ...level,
                                subLevels: updateLevels(level.subLevels)
                              };
                            }
                            
                            return level;
                          });
                        };
                        
                        updateSet(
                          activeSetIndex,
                          'subLevels',
                          updateLevels(formData.sets[activeSetIndex].subLevels)
                        );
                      };
                      
                      return (
                        <>
                          <FormGroup style={{ marginBottom: '16px' }}>
                            <Label>Level Name</Label>
                            <Input
                              type="text"
                              value={selectedLevel.name || ''}
                              onChange={(e) => updateSelectedLevel('name', e.target.value)}
                              placeholder="Enter level name"
                              disabled={loading}
                            />
                          </FormGroup>
                          
                          <FormGroup style={{ marginBottom: '24px' }}>
                            <Label>Level Description</Label>
                            <TextArea
                              value={selectedLevel.description || ''}
                              onChange={(e) => updateSelectedLevel('description', e.target.value)}
                              placeholder="Enter level description"
                              disabled={loading}
                              style={{ minHeight: '80px' }}
                            />
                          </FormGroup>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            marginBottom: '24px',
                            flexWrap: 'wrap'
                          }}>
                            <Button
                              type="button"
                              onClick={() => {
                                // Add a sublevel to this level
                                const newSubLevel = {
                                  id: Date.now(),
                                  name: `New Sub-level`,
                                  description: 'New sub-level description',
                                  // Add required order field
                                  order: findLevelById(formData.sets[activeSetIndex].subLevels, selectedLevelId)?.subLevels?.length || 0,
                                  subLevels: [],
                                  questions: []
                                };
                                
                                // Add to the selected level's subLevels
                                const updateLevels = (levels) => {
                                  return levels.map(level => {
                                    if (level.id === selectedLevelId) {
                                      return {
                                        ...level,
                                        subLevels: [...(level.subLevels || []), newSubLevel]
                                      };
                                    }
                                    
                                    if (level.subLevels && level.subLevels.length > 0) {
                                      return {
                                        ...level,
                                        subLevels: updateLevels(level.subLevels)
                                      };
                                    }
                                    
                                    return level;
                                  });
                                };
                                
                                updateSet(
                                  activeSetIndex,
                                  'subLevels',
                                  updateLevels(formData.sets[activeSetIndex].subLevels)
                                );
                              }}
                              disabled={loading}
                            >
                              <Plus size={16} /> Add Sub-Level
                            </Button>
                            
                            <Button
                              type="button"
                              onClick={() => {
                                // Add a question to this level
                                const newQuestion = {
                                  id: Date.now(),
                                  text: '',
                                  answerType: 'multiple',
                                  required: true,
                                  options: [
                                    'Fully compliance',
                                    'Partially compliance',
                                    'Not applicable'
                                  ]
                                };
                                
                                // Add to the selected level's questions
                                const updateLevels = (levels) => {
                                  return levels.map(level => {
                                    if (level.id === selectedLevelId) {
                                      return {
                                        ...level,
                                        questions: [...(level.questions || []), newQuestion]
                                      };
                                    }
                                    
                                    if (level.subLevels && level.subLevels.length > 0) {
                                      return {
                                        ...level,
                                        subLevels: updateLevels(level.subLevels)
                                      };
                                    }
                                    
                                    return level;
                                  });
                                };
                                
                                updateSet(
                                  activeSetIndex,
                                  'subLevels',
                                  updateLevels(formData.sets[activeSetIndex].subLevels)
                                );
                              }}
                              disabled={loading}
                            >
                              <Plus size={16} /> Add Question
                            </Button>
                            
                            {/* Removed standalone library button */}
                          </div>
                          
                          {/* Level questions section */}
                          {selectedLevel.questions && selectedLevel.questions.length > 0 ? (
                            <div style={{ marginBottom: '24px' }}>
                              <h4 style={{ 
                                fontSize: '15px', 
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minWidth: '24px',
                                  height: '24px',
                                  backgroundColor: '#f0f9ff',
                                  color: '#0284c7',
                                  border: '1px solid #bae6fd',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  LQ
                                </span>
                                <ListChecks size={16} /> Level Questions
                              </h4>
                              
                              {selectedLevel.questions.map((question, index) => (
                                <QuestionItemComponent
                                  key={question.id || index}
                                  question={question}
                                  questionIndex={index}
                                  loading={loading}
                                  updateQuestion={(updatedQuestion) => {
                                    // Update the question in the selected level
                                    const updateLevels = (levels) => {
                                      return levels.map(level => {
                                        if (level.id === selectedLevelId) {
                                          const updatedQuestions = [...level.questions];
                                          updatedQuestions[index] = updatedQuestion;
                                          
                                          return {
                                            ...level,
                                            questions: updatedQuestions
                                          };
                                        }
                                        
                                        if (level.subLevels && level.subLevels.length > 0) {
                                          return {
                                            ...level,
                                            subLevels: updateLevels(level.subLevels)
                                          };
                                        }
                                        
                                        return level;
                                      });
                                    };
                                    
                                    updateSet(
                                      activeSetIndex,
                                      'subLevels',
                                      updateLevels(formData.sets[activeSetIndex].subLevels)
                                    );
                                  }}
                                  removeQuestion={() => {
                                    // Remove the question from the selected level
                                    const updateLevels = (levels) => {
                                      return levels.map(level => {
                                        if (level.id === selectedLevelId) {
                                          return {
                                            ...level,
                                            questions: level.questions.filter((_, i) => i !== index)
                                          };
                                        }
                                        
                                        if (level.subLevels && level.subLevels.length > 0) {
                                          return {
                                            ...level,
                                            subLevels: updateLevels(level.subLevels)
                                          };
                                        }
                                        
                                        return level;
                                      });
                                    };
                                    
                                    updateSet(
                                      activeSetIndex,
                                      'subLevels',
                                      updateLevels(formData.sets[activeSetIndex].subLevels)
                                    );
                                  }}
                                  allLevels={formData.sets.flatMap(set => set.subLevels || [])}
                                />
                              ))}
                            </div>
                          ) : (
                            <div style={{ 
                              padding: '16px', 
                              background: '#f8fafc', 
                              borderRadius: '8px', 
                              marginBottom: '24px',
                              textAlign: 'center',
                              color: '#64748b'
                            }}>
                              No questions added to this level yet.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
                
                {/* General Questions Section */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '28px',
                      height: '28px',
                      backgroundColor: '#047857',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      G
                    </span>
                    General Template Questions
                  </h3>
                  
                  {formData.sets[activeSetIndex]?.generalQuestions && 
                  formData.sets[activeSetIndex].generalQuestions.length > 0 ? (
                    <div style={{ marginBottom: '16px' }}>
                      {formData.sets[activeSetIndex].generalQuestions.map((question, index) => (
                        <QuestionItemComponent
                          key={question.id || index}
                          question={question}
                          questionIndex={index}
                          loading={loading}
                          updateQuestion={(updatedQuestion) => {
                            const updatedQuestions = [...formData.sets[activeSetIndex].generalQuestions];
                            updatedQuestions[index] = updatedQuestion;
                            updateSet(activeSetIndex, 'generalQuestions', updatedQuestions);
                          }}
                          removeQuestion={() => {
                            updateSet(
                              activeSetIndex,
                              'generalQuestions',
                              formData.sets[activeSetIndex].generalQuestions.filter((_, i) => i !== index)
                            );
                          }}
                          allLevels={formData.sets.flatMap(set => set.subLevels || [])}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '16px', 
                      background: '#f8fafc', 
                      borderRadius: '8px', 
                      marginBottom: '16px',
                      textAlign: 'center',
                      color: '#64748b'
                    }}>
                      No general questions added to this template yet.
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      type="button"
                      onClick={() => {
                        // Add a general question
                        const newQuestion = {
                          id: Date.now(),
                          text: '',
                          answerType: 'multiple',
                          required: true,
                          options: [
                            'Fully compliance',
                            'Partially compliance',
                            'Not applicable'
                          ]
                        };
                        
                        updateSet(activeSetIndex, 'generalQuestions', [
                          ...(formData.sets[activeSetIndex].generalQuestions || []),
                          newQuestion
                        ]);
                      }}
                      disabled={loading}
                    >
                      <Plus size={16} /> Add General Question
                    </Button>
                    
                    {/* Remove standalone library button */}
                  </div>
                </div>
                
                <TabNavigationButtons>
                  <Button
                    type="button"
                    onClick={() => handleNavigationButtonClick('basic')}
                    disabled={loading}
                  >
                    <ChevronLeft size={16} /> Back to Basic Info
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    Save Template
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
              {loading ? 'Saving...' : (id ? 'Save Changes' : 'Create Template')}
            </Button>
          </ButtonGroup>
        </Form>
      )}
      
      {/* Activity History Modal */}
      <ActivityHistoryCard 
        formData={formData} 
        activities={activities}
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
      />
      
      {/* Existing modals */}
    </PageContainer>
  );
};

export default InspectionLevelForm;