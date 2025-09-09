import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar,
  MapPin,
  Award,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { fetchUserTaskDetails, exportTaskReport } from '../../store/slices/userTasksSlice';
import { useAuth } from '../../hooks/useAuth';
import Skeleton from '../../components/ui/Skeleton';
import DocumentNamingModal from '../../components/ui/DocumentNamingModal';
import { toast } from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
`;

const TaskTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const Content = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TaskCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
`;

const CardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#dcfce7';
      case 'in_progress': return '#fef3c7';
      case 'pending': return '#e0f2fe';
      case 'archived': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#166534';
      case 'in_progress': return '#92400e';
      case 'pending': return '#0369a1';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const CardContent = styled.div`
  padding: 24px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0f2fe;
  color: #0369a1;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ProgressValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #0369a1;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const QuestionsSection = styled.div`
  margin-top: 24px;
`;

const QuestionCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: ${props => props.completed ? '#f0fdf4' : '#fefefe'};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const QuestionText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
`;

const QuestionStatus = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#dcfce7';
      case 'in_progress': return '#fef3c7';
      case 'pending': return '#e0f2fe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#166534';
      case 'in_progress': return '#92400e';
      case 'pending': return '#0369a1';
      default: return '#6b7280';
    }
  }};
`;

const QuestionDetails = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
`;

const ResponseSection = styled.div`
  background: #f8fafc;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
`;

const ResponseLabel = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ResponseValue = styled.div`
  font-size: 13px;
  color: #1e293b;
`;

const ScoreSection = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const ScoreItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
`;

const ScoreValue = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #0369a1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(3, 105, 161, 0.2);
  position: relative;

  &:hover {
    background: #0284c7;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(3, 105, 161, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;


const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TaskDetailsView = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const { currentTask, loading, error } = useSelector((state) => state.userTasks);
  const [isExporting, setIsExporting] = useState(false);
  const [showDocumentNamingModal, setShowDocumentNamingModal] = useState(false);

  useEffect(() => {
    if (taskId && taskId !== 'undefined') {
      console.log('Fetching task details for ID:', taskId);
      dispatch(fetchUserTaskDetails(taskId));
    } else {
      console.warn('Invalid task ID provided:', taskId);
    }
  }, [dispatch, taskId]);


  const handleBack = () => {
    navigate('/tasks');
  };

  const handleExportExcel = () => {
    if (!currentTask) return;
    setShowDocumentNamingModal(true);
  };

  const handleConfirmExport = async (fileName) => {
    if (!currentTask) return;
    
    try {
      setIsExporting(true);
      setShowDocumentNamingModal(false);
      toast.loading('Generating Excel report...');
      
      await dispatch(exportTaskReport({ 
        taskId: currentTask._id, 
        format: 'excel',
        fileName: fileName
      })).unwrap();
      
      toast.dismiss();
      toast.success('Excel report exported successfully');
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export Excel report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getQuestionStatus = (question, responses) => {
    if (!responses || !question._id) return 'pending';
    
    const response = responses[question._id];
    if (!response) return 'pending';
    
    // Check if there's a valid response
    if (response !== undefined && response !== null && response !== '') {
      return 'completed';
    }
    
    return 'in_progress';
  };

  const getQuestionResponse = (question, responses) => {
    if (!responses || !question._id) return null;
    return responses[question._id];
  };

  const calculateQuestionScore = (question, response) => {
    if (!response || !question.scoring?.enabled) return { achieved: 0, max: 0 };
    
    const maxScore = question.scoring?.max || 0;
    let achievedScore = 0;
    
    if (question.type === 'yesno' && response) {
      achievedScore = question.scores?.[response] || 0;
    } else if (question.type === 'compliance' && response) {
      achievedScore = question.scores?.[response] || 0;
    }
    
    return { achieved: achievedScore, max: maxScore };
  };

  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Skeleton width={200} height={40} />
        </Header>
        <Content>
          <Skeleton width="100%" height={400} />
        </Content>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tasks
          </BackButton>
          <TaskTitle>Error Loading Task</TaskTitle>
        </Header>
        <Content>
          <div style={{ textAlign: 'center', padding: '48px', color: '#ef4444' }}>
            <AlertCircle size={48} style={{ marginBottom: '16px' }} />
            <h3>Failed to load task details</h3>
            <p>{error}</p>
          </div>
        </Content>
      </PageContainer>
    );
  }

  if (!currentTask) {
    return (
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={16} />
            Back to Tasks
          </BackButton>
          <TaskTitle>Task Not Found</TaskTitle>
        </Header>
        <Content>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <FileText size={48} style={{ marginBottom: '16px', color: '#64748b' }} />
            <h3>Task not found</h3>
            <p>The requested task could not be found.</p>
          </div>
        </Content>
      </PageContainer>
    );
  }

  const responses = currentTask.questionnaireResponses || {};
  const inspectionLevel = currentTask.inspectionLevel;
  
  // Calculate total questions from inspection level (excluding pre-inspection questions)
  const totalQuestions = inspectionLevel?.subLevels?.reduce((total, page) => {
    return total + page.subLevels?.reduce((pageTotal, section) => {
      return pageTotal + (section.questions?.length || 0);
    }, 0) || 0;
  }, 0) || 0;

  // Calculate completed questions based on actual responses (excluding pre-inspection questions)
  // Filter out pre-inspection question responses
  const inspectionQuestionIds = new Set();
  if (inspectionLevel?.subLevels) {
    inspectionLevel.subLevels.forEach(page => {
      if (page.subLevels) {
        page.subLevels.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              if (question._id) {
                inspectionQuestionIds.add(question._id.toString());
              }
            });
          }
        });
      }
    });
  }
  
  const completedQuestions = Object.keys(responses).filter(responseId => 
    inspectionQuestionIds.has(responseId)
  ).length;

  // Use the actual progress from the task data or calculate it
  const progressPercentage = currentTask.overallProgress || 
    (totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0);

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={16} />
          Back to Tasks
        </BackButton>
        <TaskTitle>{currentTask.name || currentTask.title}</TaskTitle>
        <HeaderActions>
          <StatusBadge status={currentTask.status}>
            {currentTask.status === 'completed' && <CheckCircle size={12} />}
            {currentTask.status === 'in_progress' && <Clock size={12} />}
            {currentTask.status === 'pending' && <Clock size={12} />}
            {currentTask.status === 'archived' && <FileText size={12} />}
            {currentTask.status?.charAt(0).toUpperCase() + currentTask.status?.slice(1)}
          </StatusBadge>
          <ExportButton 
            onClick={handleExportExcel}
            disabled={isExporting || !currentTask}
          >
            <FileSpreadsheet size={16} />
            {isExporting ? 'Exporting...' : 'Export Excel Report'}
          </ExportButton>
        </HeaderActions>
      </Header>

      <Content>
        {/* Task Overview */}
        <TaskCard>
          <CardHeader>
            <CardTitle>
              <FileText size={20} />
              Task Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <User size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Assigned To</InfoLabel>
                  <InfoValue>
                    {currentTask.assignedTo?.map(user => user.name).join(', ') || 'Unassigned'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <Calendar size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Due Date</InfoLabel>
                  <InfoValue>
                    {currentTask.deadline ? new Date(currentTask.deadline).toLocaleDateString() : 'No due date'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <MapPin size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Location</InfoLabel>
                  <InfoValue>{currentTask.location || 'Not specified'}</InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <Award size={20} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Priority</InfoLabel>
                  <InfoValue style={{ 
                    color: currentTask.priority === 'high' ? '#dc2626' : 
                           currentTask.priority === 'medium' ? '#d97706' : '#16a34a'
                  }}>
                    {currentTask.priority?.charAt(0).toUpperCase() + currentTask.priority?.slice(1) || 'Normal'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoGrid>

            {currentTask.description && (
              <div style={{ marginTop: '16px' }}>
                <InfoLabel>Description</InfoLabel>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px', 
                  background: '#f8fafc', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#475569'
                }}>
                  {currentTask.description}
                </div>
              </div>
            )}
          </CardContent>
        </TaskCard>

        {/* Progress Section */}
        <TaskCard>
          <CardHeader>
            <CardTitle>
              <Award size={20} />
              Progress & Scoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressSection>
              <ProgressHeader>
                <ProgressTitle>Overall Progress</ProgressTitle>
                <ProgressValue>{progressPercentage}%</ProgressValue>
              </ProgressHeader>
              <ProgressBar>
                <ProgressFill progress={progressPercentage} />
              </ProgressBar>
              <div style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#64748b',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Questions Completed: {completedQuestions} / {totalQuestions}</span>
                <span>Completion Rate: {progressPercentage}%</span>
              </div>
            </ProgressSection>
          </CardContent>
        </TaskCard>

        {/* Questions Section */}
        {inspectionLevel?.subLevels && (
          <TaskCard>
            <CardHeader>
              <CardTitle>
                <MessageSquare size={20} />
                Inspection Questions & Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionsSection>
                {inspectionLevel.subLevels.map((page, pageIndex) => (
                  <div key={page._id || pageIndex} style={{ marginBottom: '32px' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '16px',
                      padding: '12px',
                      background: '#f1f5f9',
                      borderRadius: '8px'
                    }}>
                      Page {pageIndex + 1}: {page.name}
                    </h3>
                    
                    {page.subLevels?.map((section, sectionIndex) => (
                      <div key={section._id || sectionIndex} style={{ marginBottom: '24px' }}>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: '#475569',
                          marginBottom: '12px',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: '6px'
                        }}>
                          Section {sectionIndex + 1}: {section.name}
                        </h4>
                        
                        {section.questions?.map((question, questionIndex) => {
                          const status = getQuestionStatus(question, responses);
                          const response = getQuestionResponse(question, responses);
                          const score = calculateQuestionScore(question, response);
                          
                          return (
                            <QuestionCard key={question._id || questionIndex} completed={status === 'completed'}>
                              <QuestionHeader>
                                <QuestionText>
                                  Q{questionIndex + 1}. {question.text}
                                </QuestionText>
                                <QuestionStatus status={status}>
                                  {status === 'completed' && <CheckCircle size={10} />}
                                  {status === 'in_progress' && <Clock size={10} />}
                                  {status === 'pending' && <Clock size={10} />}
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </QuestionStatus>
                              </QuestionHeader>
                              
                              <QuestionDetails>
                                <div>Type: {question.type} • {question.required ? 'Required' : 'Optional'} • {question.scoring?.enabled ? 'Scored' : 'Not Scored'}</div>
                                {question.description && (
                                  <div style={{ marginTop: '4px' }}>{question.description}</div>
                                )}
                              </QuestionDetails>
                              
                              {response && (
                                <ResponseSection>
                                  <ResponseLabel>Response:</ResponseLabel>
                                  <ResponseValue>
                                    {question.type === 'yesno' && (
                                      <span style={{ 
                                        color: response === 'Yes' ? '#16a34a' : 
                                               response === 'No' ? '#dc2626' : '#64748b'
                                      }}>
                                        {response}
                                      </span>
                                    )}
                                    {question.type === 'compliance' && (
                                      <span style={{ 
                                        color: response === 'Compliant' || response === 'Full compliance' ? '#16a34a' : 
                                               response === 'Non-Compliant' || response === 'Non compliance' ? '#dc2626' : '#64748b'
                                      }}>
                                        {response}
                                      </span>
                                    )}
                                    {question.type === 'text' && response}
                                    {question.type === 'date' && response && new Date(response).toLocaleDateString()}
                                    {question.type === 'file' && response && (
                                      <div style={{ marginTop: '8px' }}>
                                        {response.startsWith('data:image/') ? (
                                          <div>
                                            <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                              📎 Image uploaded
                                            </div>
                                            <img 
                                              src={response} 
                                              alt="Uploaded file" 
                                              style={{ 
                                                maxWidth: '200px', 
                                                maxHeight: '150px', 
                                                borderRadius: '6px',
                                                border: '1px solid #e2e8f0',
                                                cursor: 'pointer'
                                              }}
                                              onClick={() => window.open(response, '_blank')}
                                            />
                                          </div>
                                        ) : response.startsWith('data:') ? (
                                          <div>
                                            <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                              📎 File uploaded
                                            </div>
                                            <button
                                              onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = response;
                                                link.download = 'uploaded-file';
                                                link.click();
                                              }}
                                              style={{
                                                padding: '8px 12px',
                                                background: '#0369a1',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                              }}
                                            >
                                              Download File
                                            </button>
                                          </div>
                                        ) : (
                                          <span style={{ color: '#0369a1' }}>📎 File uploaded: {response}</span>
                                        )}
                                      </div>
                                    )}
                                    {question.type === 'signature' && response && (
                                      <div style={{ marginTop: '8px' }}>
                                        <div style={{ marginBottom: '8px', color: '#0369a1', fontSize: '12px' }}>
                                          ✍️ Signature provided
                                        </div>
                                        {response.startsWith('data:image/') ? (
                                          <img 
                                            src={response} 
                                            alt="Signature" 
                                            style={{ 
                                              maxWidth: '200px', 
                                              maxHeight: '100px', 
                                              borderRadius: '6px',
                                              border: '1px solid #e2e8f0',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(response, '_blank')}
                                          />
                                        ) : (
                                          <span style={{ color: '#0369a1' }}>✍️ Signature provided</span>
                                        )}
                                      </div>
                                    )}
                                    {question.type === 'multiple_choice' && Array.isArray(response) && (
                                      <span>{response.join(', ')}</span>
                                    )}
                                    {question.type === 'multiple_choice' && !Array.isArray(response) && (
                                      <span>{response}</span>
                                    )}
                                  </ResponseValue>
                                  
                                  {/* Comments are handled separately in the backend */}
                                  
                                  {/* {question.scoring?.enabled && (
                                    <ScoreSection>
                                      <ScoreItem>
                                        <span>Score:</span>
                                        <ScoreValue>{score.achieved} / {score.max}</ScoreValue>
                                      </ScoreItem>
                                      <ScoreItem>
                                        <span>Percentage:</span>
                                        <ScoreValue>
                                          {score.max > 0 ? Math.round((score.achieved / score.max) * 100) : 0}%
                                        </ScoreValue>
                                      </ScoreItem>
                                    </ScoreSection>
                                  )} */}
                                </ResponseSection>
                              )}
                            </QuestionCard>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </QuestionsSection>
            </CardContent>
          </TaskCard>
        )}
      </Content>

      {/* Document Naming Modal */}
      <DocumentNamingModal
        isOpen={showDocumentNamingModal}
        onClose={() => setShowDocumentNamingModal(false)}
        onExport={handleConfirmExport}
        exportFormat="excel"
        documentType="Task Report"
        defaultCriteria={['documentType', 'currentDate']}
      />
    </PageContainer>
  );
};

export default TaskDetailsView;
