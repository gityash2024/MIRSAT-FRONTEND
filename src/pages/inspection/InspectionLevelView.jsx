import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
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
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  border-top: 3px solid ${props => props.color || 'var(--color-navy)'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SummaryLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color || 'var(--color-navy)'};
  margin-bottom: 16px;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 4px;
`;

const SummaryDescription = styled.div`
  font-size: 13px;
  color: var(--color-gray-medium);
`;

const ContentGrid = styled.div`
  display: grid;
  // grid-template-columns: 3fr 2fr;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
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
      setError(err.message || 'Failed to fetch inspection level');
      setLoading(false);
      toast.error(`Failed to load template data: ${err.message}`);
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
      toast.success('Template duplicated successfully');
    } catch (err) {
      console.error('Error duplicating template:', err);
      toast.error('Failed to duplicate template');
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
          No levels defined for this template
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
                    {subLevel.name || 'Unnamed Level'}
                  </h4>
                  <p>{subLevel.description || 'No description provided'}</p>
                  <NodeMetadata>
                    {questionsCount > 0 && (
                      <MetadataItem>
                        <ListChecks size={12} />
                        {questionsCount} Question{questionsCount !== 1 ? 's' : ''}
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
          <p>No inspection questions defined for this template</p>
        </div>
      );
    }
    
    return (
      <QuestionList>
        {allQuestions.map((question, index) => (
          <QuestionItem key={question._id || question.id || index}>
            <QuestionText>
              {index + 1}. {question.text || 'Untitled Question'}
            </QuestionText>
            <QuestionMeta>
              <div>
                <QuestionType>
                  {question.answerType === 'yesno' ? 'Yes/No' : 
                   question.answerType === 'multiple' ? 'Multiple Choice' : 
                   question.answerType === 'text' ? 'Text Input' : 
                   'Standard'}
                </QuestionType>
                {question.isGeneral && (
                  <span style={{ marginLeft: '8px', fontSize: '11px' }}>
                    General Question
                  </span>
                )}
              </div>
              <div>
                {question.required ? 'Required' : 'Optional'}
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
          No pages or sections defined for this template
        </div>
      );
    }
    
    return (
      <div>
        {level.pages.map((page, pageIndex) => {
          const pageId = page._id || page.id || `page-${pageIndex}`;
          const isPageExpanded = expandedNodes[pageId];
          
          return (
            <div key={pageId} style={{ marginBottom: '16px' }}>
              <div 
                style={{
                  background: 'var(--color-navy)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => toggleNodeExpanded(pageId)}
              >
                {isPageExpanded ? (
                  <ChevronDown size={18} style={{ marginRight: '8px' }} />
                ) : (
                  <ChevronRight size={18} style={{ marginRight: '8px' }} />
                )}
                <strong style={{ flex: 1 }}>Page {pageIndex + 1}: {page.name}</strong>
                {page.sections && (
                  <span style={{ fontSize: '13px', opacity: 0.7 }}>
                    {page.sections.length} section{page.sections.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {isPageExpanded && (
                <div style={{ 
                  border: '1px solid #e2e8f0', 
                  borderTop: 'none', 
                  borderRadius: '0 0 8px 8px',
                  overflow: 'hidden'
                }}>
                  {page.description && (
                    <div style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '14px',
                      background: '#f8fafc'
                    }}>
                      {page.description}
                    </div>
                  )}
                  
                  {page.sections && page.sections.length > 0 ? (
                    page.sections.map((section, sectionIndex) => {
                      const sectionId = section._id || section.id || `section-${pageIndex}-${sectionIndex}`;
                      const isSectionExpanded = expandedNodes[sectionId];
                      const questionCount = section.questions?.length || 0;
                      
                      return (
                        <div key={sectionId}>
                          <div 
                            style={{
                              background: '#f1f5f9',
                              padding: '10px 16px',
                              borderBottom: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => toggleNodeExpanded(sectionId)}
                          >
                            {isSectionExpanded ? (
                              <ChevronDown size={16} style={{ marginRight: '8px' }} />
                            ) : (
                              <ChevronRight size={16} style={{ marginRight: '8px' }} />
                            )}
                            <strong style={{ flex: 1 }}>Section {sectionIndex + 1}: {section.name}</strong>
                            {questionCount > 0 && (
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {questionCount} question{questionCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          {isSectionExpanded && (
                            <div>
                              {section.description && (
                                <div style={{ 
                                  padding: '10px 16px', 
                                  borderBottom: '1px solid #e2e8f0',
                                  fontSize: '13px',
                                  background: '#f8fafc',
                                  fontStyle: 'italic',
                                  color: '#64748b'
                                }}>
                                  {section.description}
                                </div>
                              )}
                              
                              {section.questions && section.questions.length > 0 ? (
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                  {section.questions.map((question, questionIndex) => (
                                    <li 
                                      key={question._id || question.id || `q-${questionIndex}`}
                                      style={{
                                        padding: '12px 16px 12px 24px',
                                        borderBottom: questionIndex < section.questions.length - 1 ? '1px solid #e2e8f0' : 'none',
                                        background: 'white'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <div style={{ 
                                          minWidth: '24px', 
                                          height: '24px', 
                                          background: '#f1f5f9', 
                                          color: '#64748b',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '12px',
                                          fontSize: '12px',
                                          fontWeight: '500',
                                          marginTop: '2px'
                                        }}>
                                          {questionIndex + 1}
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                            {question.text}
                                          </div>
                                          {question.description && (
                                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                                              {question.description}
                                            </div>
                                          )}
                                          {question.options && question.options.length > 0 && (
                                            <div style={{ 
                                              display: 'flex', 
                                              flexWrap: 'wrap', 
                                              gap: '6px',
                                              marginTop: '8px'
                                            }}>
                                              {question.options.map((option, optionIndex) => (
                                                <div 
                                                  key={optionIndex}
                                                  style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    background: '#e2e8f0',
                                                    fontSize: '12px',
                                                    color: '#475569'
                                                  }}
                                                >
                                                  {option}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div style={{ 
                                  padding: '12px 16px',
                                  background: 'white',
                                  color: '#94a3b8',
                                  textAlign: 'center',
                                  fontStyle: 'italic',
                                  fontSize: '13px'
                                }}>
                                  No questions in this section
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ 
                      padding: '16px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      background: 'white',
                      fontStyle: 'italic',
                      fontSize: '13px'
                    }}>
                      No sections in this page
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <InspectionLayout 
        title="Loading Template..." 
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
          <p>Loading template data...</p>
        </div>
      </InspectionLayout>
    );
  }

  if (error || !level) {
    return (
      <InspectionLayout 
        title="Error" 
        baseUrl={`/inspection/${id}`}
      >
        <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 16px' }} />
          <p>Failed to load template data. Please try again later.</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/inspection')}
            style={{ margin: '16px auto 0', display: 'inline-flex' }}
          >
            Back to Templates
          </Button>
        </div>
      </InspectionLayout>
    );
  }

  const { levelCount, questionCount } = countTotalItems(level);

  return (
    <InspectionLayout 
      title={level.name || 'Inspection Template'} 
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
              Template Type
            </SummaryLabel>
            <SummaryValue>
              {level.type ? level.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General Template'}
            </SummaryValue>
            <SummaryDescription>
              {level.status ? level.status.charAt(0).toUpperCase() + level.status.slice(1) : 'Active'} • 
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