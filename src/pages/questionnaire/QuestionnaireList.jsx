import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Filter, Search, FileText, Plus, MoreHorizontal, Trash2, Edit, Copy, Loader } from 'react-feather';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestionLibrary, addQuestionToLibrary, deleteQuestionFromLibrary } from '../../store/slices/questionLibrarySlice';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import AlertModal from '../../components/ui/AlertModal';
import { useLanguage } from '../../context/LanguageContext';

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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

const PageHeader = styled.div`
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
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: var(--color-navy);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;

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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  box-sizing: border-box;
  font-size: 14px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
  
  ${props => props.primary && `
    background-color: var(--color-navy);
    color: white;
    border: none;
    
    &:hover {
      background-color: #3949ab;
    }
  `}
  
  ${props => props.secondary && `
    background-color: white;
    color: var(--color-navy);
    border: 1px solid #e2e8f0;
    
    &:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 12px;
  flex: 1;
  max-width: 400px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
  
  input {
    border: none;
    padding: 10px 8px;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 480px) {
      padding: 8px 6px;
      font-size: 13px;
    }
    
    &:focus {
      outline: none;
    }
  }
  
  svg {
    color: #94a3b8;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }
`;

const LoadingWrapper = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-size: 16px;
`;

const NoResultsWrapper = styled.div`
  padding: 40px;
  text-align: center;
  color: #64748b;
  
  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #334155;
  }
  
  p {
    margin-bottom: 20px;
  }
`;

const QuestionnairesTable = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: visible;
  position: relative;
  margin-bottom: 20px;
  padding-bottom: 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    border-radius: 6px;
    margin-bottom: 16px;
    padding-bottom: 16px;
  }

  @media (max-width: 480px) {
    border-radius: 6px;
    margin-bottom: 12px;
    padding-bottom: 12px;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(250px, 2fr) 150px 150px 120px 120px 50px;
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  gap: 16px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  
  @media (max-width: 1024px) {
    grid-template-columns: minmax(200px, 2fr) 120px 120px 120px 50px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderCell = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const QuestionnaireRow = styled.div`
  display: grid;
  grid-template-columns: minmax(250px, 2fr) 150px 150px 120px 120px 50px;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  gap: 16px;
  transition: background-color 0.2s;
  cursor: pointer;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  &:hover {
    background-color: #f8fafc;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: minmax(200px, 2fr) 120px 120px 120px 50px;
    gap: 12px;
    padding: 14px 16px;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 8px;
  }
`;

const InfoCell = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.hideOnMobile ? 'none' : 'block'};
    
    &:before {
      content: "${props => props.label}";
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      display: block;
      margin-bottom: 4px;
    }
  }

  @media (max-width: 480px) {
    &:before {
      font-size: 12px;
      margin-bottom: 3px;
    }
  }
`;

const NameContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const IconBackground = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${props => 
    props.category === 'safety' ? '#FEE2E2' : 
    props.category === 'health' ? '#DCFCE7' : 
    props.category === 'environment' ? '#DBEAFE' :
    props.category === 'quality' ? '#FEF3C7' : '#F1F5F9'
  };
  color: ${props => 
    props.category === 'safety' ? '#B91C1C' : 
    props.category === 'health' ? '#166534' : 
    props.category === 'environment' ? '#0369A1' :
    props.category === 'quality' ? '#B45309' : '#64748B'
  };

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
  }

  svg {
    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const NameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const QuestionnaireName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Description = styled.div`
  font-size: 13px;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const QuestionsCount = styled.div`
  font-size: 14px;
  color: #334155;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 3px 6px;
  }
  
  ${props => props.status === 'draft' && `
    background-color: #FEF3C7;
    color: #B45309;
    border: 1px solid #FDE68A;
  `}
  
  ${props => props.status === 'published' && `
    background-color: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  `}
`;

const DateDisplay = styled.div`
  font-size: 14px;
  color: #334155;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ActionsCell = styled.div`
  position: relative;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    align-self: flex-end;
    position: absolute;
    top: 16px;
    right: 16px;
  }

  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
  }
`;

const ActionsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
  }
  
  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  svg {
    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const ActionsMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 180px;
  z-index: 1000;
  overflow: visible;
  border: 1px solid #e2e8f0;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    right: auto;
    left: 0;
    transform: translateX(-50%);
    width: 160px;
  }

  @media (max-width: 480px) {
    width: 150px;
    transform: translateX(-80%);
  }
  
  /* For last row, position above the button */
  &[data-position="above"] {
    top: auto;
    bottom: calc(100% + 4px);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  }
  
  /* Ensure menu is always visible and properly positioned */
  &[data-position="below"] {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  /* Add animation for smooth appearance */
  animation: fadeIn 0.15s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &[data-position="above"] {
    animation: fadeInUp 0.15s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 8px;
  }
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
  
  &:hover {
    background-color: #f8fafc;
  }
  
  ${props => props.danger && `
    color: #dc2626;
    
    &:hover {
      background-color: #fee2e2;
    }
  `}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 8px;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #64748b;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: ${props => props.active ? 'var(--color-navy)' : 'white'};
  color: ${props => props.active ? 'white' : '#334155'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  box-sizing: border-box;
  min-width: 36px;
  font-size: 14px;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    min-width: 32px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    min-width: 30px;
    font-size: 12px;
  }
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
    border-color: ${props => props.active ? 'var(--color-navy)' : '#cbd5e1'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  flex-direction: column;
  
  svg {
    animation: spin 1.5s linear infinite;
    filter: drop-shadow(0 0 8px rgba(26, 35, 126, 0.2));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    margin-top: 16px;
    color: var(--color-navy);
    font-size: 16px;
  }
`;

const QuestionnaireList = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get question library data from Redux
  const { questions: libraryQuestions, loading: libraryLoading, error: libraryError } = 
    useSelector(state => state.questionLibrary);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState('below');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states for custom confirmations and alerts
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Fetch question library on component mount
  useEffect(() => {
    fetchLibraryQuestions();
  }, []);
  
  // Filter questions when library changes or search/page changes
  useEffect(() => {
    filterQuestions();
  }, [libraryQuestions, search, page]);
  
  const fetchLibraryQuestions = async () => {
    try {
      setLoading(true);
      await dispatch(fetchQuestionLibrary()).unwrap();
    } catch (error) {
      console.error('Error fetching question library:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };
  
  const filterQuestions = () => {
    if (!libraryQuestions) return;
    
    // Filter questions based on search term
    let filtered = [...libraryQuestions];
    
    if (search) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Set total results and pages
    const total = filtered.length;
    setTotalResults(total);
    setTotalPages(Math.ceil(total / limit) || 1);
    
    // Paginate the results
    const start = (page - 1) * limit;
    const end = start + limit;
    setFilteredQuestions(filtered.slice(start, end));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      filterQuestions();
    }
  };
  
  const handleDuplicateQuestion = async (question, e) => {
    e.stopPropagation();
    
    try {
      setLoading(true);
      
      // Create a duplicate with slightly modified text
      const duplicatedQuestion = {
        text: `${question.text} (Copy)`,
        answerType: question.answerType || 'yesno',
        options: [...(question.options || [])],
        required: question.required === undefined ? true : question.required
      };
      
      await dispatch(addQuestionToLibrary(duplicatedQuestion)).unwrap();
      toast.success('Question duplicated successfully');
      
      // Manually refresh the library
      await dispatch(fetchQuestionLibrary()).unwrap();
      
      // Close menu after action
      setActiveMenu(null);
    } catch (error) {
      console.error('Error duplicating question:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to duplicate question');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to show alert modal
  const showAlertModal = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  const handleDeleteQuestion = async (questionId, e) => {
    e.stopPropagation();
    
    setQuestionToDelete(questionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    try {
      setLoading(true);
      
      await dispatch(deleteQuestionFromLibrary(questionToDelete)).unwrap();
      toast.success(t('common.questionDeletedSuccessfully'));
      
      // Manually refresh the library
      await dispatch(fetchQuestionLibrary()).unwrap();
      
      // Close menu after action
      setActiveMenu(null);
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      showAlertModal('Error', typeof error === 'string' ? error : 'Failed to delete question', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestionnaire = () => {
    navigate('/questionnaire/create');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleRowClick = (id) => {
    // Instead of navigating to a questionnaire view, directly view the question
    navigate(`/inspection/templates?view=${id}`);
  };
  
  const handleMenuToggle = (id, e) => {
    e.stopPropagation();
    
    if (activeMenu === id) {
      setActiveMenu(null);
      return;
    }
    
    // Calculate if menu should appear above or below
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const menuHeight = 120; // Approximate height of the menu
    
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // If there's not enough space below but enough above, position above
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      setMenuPosition('above');
    } else {
      setMenuPosition('below');
    }
    
    setActiveMenu(id);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    const handleResize = () => {
      // Close menu on resize to prevent positioning issues
      setActiveMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <Title>
          <FileText size={24} />
          {t('common.questionLibrary')}
        </Title>
        <ActionButtons>
          <Button primary onClick={handleCreateQuestionnaire}>
            <Plus size={16} />
            {t('common.createQuestion')}
          </Button>
        </ActionButtons>
      </PageHeader>

      <SearchContainer>
        <SearchInput>
          <Search size={18} />
          <input 
            type="text" 
            placeholder={t('common.searchQuestions')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </SearchInput>
        {/* <FilterButton>
          <Filter size={16} />
          Filter
        </FilterButton> */}
      </SearchContainer>

      <QuestionnairesTable>
        <TableHeader $isRTL={isRTL}>
          <HeaderCell>{t('common.questionText')}</HeaderCell>
          <HeaderCell>{t('common.type')}</HeaderCell>
          <HeaderCell>{t('common.required')}</HeaderCell>
          <HeaderCell>{t('common.created')}</HeaderCell>
          <HeaderCell hideOnMobile>{t('common.updated')}</HeaderCell>
          <HeaderCell></HeaderCell>
        </TableHeader>

        {loading || libraryLoading ? (
          <LoadingContainer>
            <Loader size={40} color="var(--color-navy)" />
            <p>{t('questionnaire.loadingQuestions')}</p>
          </LoadingContainer>
        ) : filteredQuestions.length === 0 ? (
          <NoResultsWrapper>
            <h3>{t('questionnaire.noQuestionsFound')}</h3>
            <p>{t('questionnaire.tryAdjustingSearch')}</p>
            <Button primary onClick={handleCreateQuestionnaire}>
              <Plus size={16} />
              {t('common.createQuestion')}
            </Button>
          </NoResultsWrapper>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionnaireRow 
              key={question.id || question._id} 
              // onClick={() => handleRowClick(question.id || question._id)}
            >
              <InfoCell>
                <NameContainer>
                  <IconBackground>
                    <FileText size={18} />
                  </IconBackground>
                  <NameContent>
                    <QuestionnaireName>{question.text}</QuestionnaireName>
                  </NameContent>
                </NameContainer>
              </InfoCell>
              
              <InfoCell label="Type">
                <QuestionsCount>
                  {question.answerType || 'text'}
                </QuestionsCount>
              </InfoCell>
              
              <InfoCell label={t('common.required')}>
                <StatusBadge status={question.required ? 'published' : 'draft'}>
                  {question.required ? t('common.required') : t('common.optional')}
                </StatusBadge>
              </InfoCell>
              
              <InfoCell label={t('common.created')}>
                <DateDisplay>
                  {formatDate(question.createdAt)}
                </DateDisplay>
              </InfoCell>
              
              <InfoCell label={t('common.updated')} hideOnMobile>
                <DateDisplay>
                  {formatDate(question.updatedAt)}
                </DateDisplay>
              </InfoCell>
              
              <ActionsCell onClick={(e) => e.stopPropagation()}>
                <ActionsButton onClick={(e) => handleMenuToggle(question.id || question._id, e)}>
                  <MoreHorizontal size={16} />
                </ActionsButton>
                
                {activeMenu === (question.id || question._id) && (
                  <ActionsMenu 
                    data-position={menuPosition}
                  >
                    <ActionItem onClick={(e) => {
                      e.stopPropagation(); 
                      navigate(`/questionnaire/edit/${question.id || question._id}`);
                    }}>
                      <Edit size={16} />
                      {t('common.editQuestion')}
                    </ActionItem>
                    
                    <ActionItem onClick={(e) => handleDuplicateQuestion(question, e)}>
                      <Copy size={16} />
                      {t('common.duplicateQuestion')}
                    </ActionItem>
                    
                    <ActionItem danger onClick={(e) => handleDeleteQuestion(question.id || question._id, e)}>
                      <Trash2 size={16} />
                      {t('common.deleteQuestion')}
                    </ActionItem>
                  </ActionsMenu>
                )}
              </ActionsCell>
            </QuestionnaireRow>
          ))
        )}

        {!loading && filteredQuestions.length > 0 && (
          <Pagination>
            <PaginationInfo>
              {t('common.showing')} {((page - 1) * limit) + 1}-{Math.min(page * limit, totalResults)} {t('common.of')} {totalResults} {t('common.questions')}
            </PaginationInfo>
            
            <PaginationButtons>
              <PageButton 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
              >
                &lt;
              </PageButton>
              
              {[...Array(totalPages).keys()].map((pageNum) => (
                <PageButton 
                  key={pageNum + 1}
                  active={page === pageNum + 1}
                  onClick={() => setPage(pageNum + 1)}
                >
                  {pageNum + 1}
                </PageButton>
              )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
              
              <PageButton 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
              >
                &gt;
              </PageButton>
            </PaginationButtons>
          </Pagination>
        )}
      </QuestionnairesTable>

      {/* Custom Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setQuestionToDelete(null);
        }}
        onConfirm={confirmDeleteQuestion}
        title={t('common.deleteQuestion')}
        message={t('common.areYouSureYouWantToDeleteThisQuestion')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="primary"
        loading={loading}
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

export default QuestionnaireList; 