import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Filter, Search, FileText, Plus, MoreHorizontal, Trash2, Edit, Copy } from 'react-feather';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config/constants';

// Styled Components
const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  color: var(--color-navy);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
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
  
  input {
    border: none;
    padding: 10px 8px;
    font-size: 14px;
    width: 100%;
    
    &:focus {
      outline: none;
    }
  }
  
  svg {
    color: #94a3b8;
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
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(250px, 2fr) 150px 150px 120px 120px 50px;
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  gap: 16px;
  
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
  
  &:hover {
    background-color: #f8fafc;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: minmax(200px, 2fr) 120px 120px 120px 50px;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;
  }
`;

const InfoCell = styled.div`
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
`;

const NameContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
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
`;

const NameContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const QuestionnaireName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
`;

const Description = styled.div`
  font-size: 13px;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const QuestionsCount = styled.div`
  font-size: 14px;
  color: #334155;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
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
`;

const ActionsCell = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    align-self: flex-end;
    position: absolute;
    top: 16px;
    right: 16px;
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
  
  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
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
  z-index: 10;
  overflow: hidden;
  border: 1px solid #e2e8f0;
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
  
  svg {
    width: 16px;
    height: 16px;
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
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
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
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--color-navy)' : '#f8fafc'};
    border-color: ${props => props.active ? 'var(--color-navy)' : '#cbd5e1'};
  }
`;

const QuestionnaireList = () => {
  const navigate = useNavigate();
  
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchQuestionnaires();
  }, [page, search]);

  const fetchQuestionnaires = async () => {
    setLoading(true);
    try {
      console.log('Fetching questionnaires...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to view questionnaires');
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/questionnaires`, {
        params: {
          page,
          limit,
          search: search || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Questionnaires response:', response.data);
      
      setQuestionnaires(response.data.results || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalResults(response.data.totalResults || 0);
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error?.message ||
                         'Failed to load questionnaires';
      toast.error(errorMessage);
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchQuestionnaires();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this questionnaire?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('You must be logged in to delete a questionnaire');
          return;
        }
        
        await axios.delete(`${API_BASE_URL}/questionnaires/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Questionnaire deleted successfully');
        fetchQuestionnaires();
      } catch (error) {
        console.error('Error deleting questionnaire:', error);
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error?.message || 
                           'Failed to delete questionnaire';
        toast.error(errorMessage);
      }
    }
    setActiveMenu(null);
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to duplicate a questionnaire');
        return;
      }
      
      await axios.post(`${API_BASE_URL}/questionnaires/${id}/duplicate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Questionnaire duplicated successfully');
      fetchQuestionnaires();
    } catch (error) {
      console.error('Error duplicating questionnaire:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error?.message || 
                         'Failed to duplicate questionnaire';
      toast.error(errorMessage);
    }
    setActiveMenu(null);
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
    navigate(`/questionnaire/${id}`);
  };

  const handleMenuToggle = (id, e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <Title>
          <FileText size={24} />
          Questionnaires
        </Title>
        <ActionButtons>
          <Button primary onClick={handleCreateQuestionnaire}>
            <Plus size={16} />
            Create Questionnaire
          </Button>
        </ActionButtons>
      </PageHeader>

      <SearchContainer>
        <SearchInput>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search questionnaires..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </SearchInput>
        <FilterButton>
          <Filter size={16} />
          Filter
        </FilterButton>
      </SearchContainer>

      <QuestionnairesTable>
        <TableHeader>
          <HeaderCell>Name</HeaderCell>
          <HeaderCell>Questions</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Created</HeaderCell>
          <HeaderCell hideOnMobile>Updated</HeaderCell>
          <HeaderCell></HeaderCell>
        </TableHeader>

        {loading ? (
          <LoadingWrapper>
            Loading questionnaires...
          </LoadingWrapper>
        ) : questionnaires.length === 0 ? (
          <NoResultsWrapper>
            <h3>No questionnaires found</h3>
            <p>Try adjusting your search or create a new questionnaire.</p>
            <Button primary onClick={handleCreateQuestionnaire}>
              <Plus size={16} />
              Create Questionnaire
            </Button>
          </NoResultsWrapper>
        ) : (
          questionnaires.map((questionnaire) => (
            <QuestionnaireRow 
              key={questionnaire._id} 
              onClick={() => handleRowClick(questionnaire._id)}
            >
              <InfoCell>
                <NameContainer>
                  <IconBackground category={questionnaire.category}>
                    <FileText size={18} />
                  </IconBackground>
                  <NameContent>
                    <QuestionnaireName>{questionnaire.title}</QuestionnaireName>
                    {questionnaire.description && (
                      <Description>{questionnaire.description}</Description>
                    )}
                  </NameContent>
                </NameContainer>
              </InfoCell>
              
              <InfoCell label="Questions">
                <QuestionsCount>
                  {questionnaire.questions?.length || 0} questions
                </QuestionsCount>
              </InfoCell>
              
              <InfoCell label="Status">
                <StatusBadge status={questionnaire.status}>
                  {questionnaire.status === 'published' ? 'Published' : 'Draft'}
                </StatusBadge>
              </InfoCell>
              
              <InfoCell label="Created">
                <DateDisplay>
                  {formatDate(questionnaire.createdAt)}
                </DateDisplay>
              </InfoCell>
              
              <InfoCell label="Updated" hideOnMobile>
                <DateDisplay>
                  {formatDate(questionnaire.updatedAt)}
                </DateDisplay>
              </InfoCell>
              
              <ActionsCell onClick={(e) => e.stopPropagation()}>
                <ActionsButton onClick={(e) => handleMenuToggle(questionnaire._id, e)}>
                  <MoreHorizontal size={16} />
                </ActionsButton>
                
                {activeMenu === questionnaire._id && (
                  <ActionsMenu>
                    <ActionItem onClick={() => navigate(`/questionnaire/edit/${questionnaire._id}`)}>
                      <Edit size={16} />
                      Edit
                    </ActionItem>
                    <ActionItem onClick={(e) => handleDuplicate(questionnaire._id, e)}>
                      <Copy size={16} />
                      Duplicate
                    </ActionItem>
                    <ActionItem danger onClick={(e) => handleDelete(questionnaire._id, e)}>
                      <Trash2 size={16} />
                      Delete
                    </ActionItem>
                  </ActionsMenu>
                )}
              </ActionsCell>
            </QuestionnaireRow>
          ))
        )}

        {!loading && questionnaires.length > 0 && (
          <Pagination>
            <PaginationInfo>
              Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, totalResults)} of {totalResults} questionnaires
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
    </PageContainer>
  );
};

export default QuestionnaireList; 