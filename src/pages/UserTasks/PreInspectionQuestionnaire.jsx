import React from 'react';
import styled from 'styled-components';
import { 
  Clock, Calendar, AlertTriangle, Activity, CheckCircle, 
  XCircle, Database, MapPin, User, Briefcase, Award, Info, 
  BarChart2, Clipboard, AlertCircle, HelpCircle, CheckSquare
} from 'lucide-react';

const Container = styled.div`
  padding: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p`
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  white-space: pre-wrap;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-bottom: 24px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.5);
  padding: 10px 14px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.7);
  }
  
  svg {
    color: var(--color-navy);
    flex-shrink: 0;
  }
  
  strong {
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  
  ${props => {
    switch(props.status) {
      case 'pending':
        return `
          background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
          color: #e65100;
          border: 1px solid rgba(245, 124, 0, 0.2);
        `;
      case 'in_progress':
        return `
          background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
          color: #0069c0;
          border: 1px solid rgba(2, 136, 209, 0.2);
        `;
      case 'completed':
        return `
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
          border: 1px solid rgba(56, 142, 60, 0.2);
        `;
      case 'incomplete':
        return `
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
          border: 1px solid rgba(211, 47, 47, 0.2);
        `;
      default:
        return `
          background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
          color: #424242;
          border: 1px solid rgba(97, 97, 97, 0.2);
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
  }
  
  @media (min-width: 768px) {
    margin-left: 8px;
  }
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  
  ${props => {
    switch(props.priority) {
      case 'high':
        return 'background-color: rgba(255, 235, 238, 0.8); color: #d32f2f; border: 1px solid rgba(211, 47, 47, 0.2);';
      case 'medium':
        return 'background-color: rgba(255, 248, 225, 0.8); color: #f57c00; border: 1px solid rgba(245, 124, 0, 0.2);';
      case 'low':
        return 'background-color: rgba(232, 245, 233, 0.8); color: #2e7d32; border: 1px solid rgba(46, 125, 50, 0.2);';
      default:
        return 'background-color: rgba(245, 245, 245, 0.8); color: #616161; border: 1px solid rgba(97, 97, 97, 0.2);';
    }
  }}
`;

const AssetInfo = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.7);
`;

const AssetTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AssetDetail = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  color: #4b5563;
  
  strong {
    font-weight: 600;
    color: #1f2937;
  }
`;

const ScoringSummary = styled.div`
  background: rgba(237, 246, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(191, 220, 255, 0.5);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const ScoreItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  .score-label {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;
  }
  
  .score-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-navy);
  }
  
  .score-percent {
    font-size: 13px;
    color: ${props => props.percent >= 80 ? '#4caf50' : props.percent >= 50 ? '#ff9800' : '#f44336'};
    margin-left: 4px;
  }
`;

const ScoringCriteria = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  
  .criteria-item {
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    
    &.full {
      color: #2e7d32;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }
    
    &.partial {
      color: #e65100;
      border: 1px solid rgba(255, 152, 0, 0.2);
    }
    
    &.non {
      color: #c62828;
      border: 1px solid rgba(244, 67, 54, 0.2);
    }
    
    &.na {
      color: #616161;
      border: 1px solid rgba(97, 97, 97, 0.2);
    }
  }
`;

const AssessmentSection = styled.div`
  margin-top: 24px;
`;

const AssessmentTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 12px;
`;

const AssessmentTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  th {
    background: rgba(26, 35, 126, 0.05);
    font-weight: 600;
    color: var(--color-navy);
  }
  
  tr:hover td {
    background: rgba(26, 35, 126, 0.02);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusIcon = ({ status, size = 18 }) => {
  switch(status) {
    case 'completed':
    case 'full_compliance':
      return <CheckCircle size={size} color="#4caf50" />;
    case 'failed':
    case 'incomplete':
    case 'non_compliance':
      return <XCircle size={size} color="#f44336" />;
    case 'in_progress':
    case 'partial_compliance':
      return <Activity size={size} color="#ff9800" />;
    case 'not_applicable':
      return <AlertCircle size={size} color="#9e9e9e" />;
    default:
      return <Clock size={size} color="#616161" />;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const PreInspectionStepForm = ({ task }) => {
  if (!task) return <div>Loading task details...</div>;
  
  // Get asset information, handling both ID and populated object
  const getAssetInfo = () => {
    if (!task.asset) return null;
    
    // If asset is just an ID string
    if (typeof task.asset === 'string') {
      return { id: task.asset, displayName: 'Loading asset details...', type: 'N/A', uniqueId: '' };
    }
    
    return {
      id: task.asset._id,
      displayName: task.asset.displayName || task.asset.name || 'Unnamed Asset',
      type: task.asset.type || 'N/A',
      uniqueId: task.asset.uniqueId || '',
      serialNumber: task.asset.serialNumber || '',
      location: task.asset.location || '',
      manufacturer: task.asset.manufacturer || ''
    };
  };
  
  const asset = getAssetInfo();
  
  // Check if deadline is overdue
  const isOverdue = () => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const today = new Date();
    return deadline < today;
  };
  
  // Calculate total score
  const calculateTotalScore = () => {
    if (!task) return { total: 0, achieved: 0, percentage: 0, areas: [] };
    
    // Get scores from task metrics if available
    if (task.taskMetrics && task.taskMetrics.totalScore !== undefined) {
      return {
        total: task.taskMetrics.maximumScore || 0,
        achieved: task.taskMetrics.totalScore || 0,
        percentage: task.taskMetrics.maximumScore > 0 
          ? Math.round((task.taskMetrics.totalScore / task.taskMetrics.maximumScore) * 100) 
          : 0,
        areas: task.assessmentAreas || []
      };
    }
    
    // Otherwise calculate from questionnaire and progress
    let totalQuestionPoints = 0;
    let achievedQuestionPoints = 0;
    
    // Calculate questionnaire scores
    if (task.questions && task.questionnaireResponses) {
      const responses = task.questionnaireResponses;
      const questions = task.questions.filter(q => q.mandatory !== false);
      
      questions.forEach(question => {
        const questionId = question._id || question.id;
        const responseKey = Object.keys(responses || {}).find(key => 
          key.includes(questionId) || key.endsWith(questionId)
        );
        
        if (responseKey) {
          const response = responses[responseKey];
          const weight = question.weight || 1;
          
          totalQuestionPoints += (2 * weight); // Max score is 2 per question
          
          if (response === 'full_compliance' || response === 'yes') {
            achievedQuestionPoints += (2 * weight);
          } else if (response === 'partial_compliance') {
            achievedQuestionPoints += (1 * weight);
          } else if (response === 'na' || response === 'not_applicable') {
            totalQuestionPoints -= (2 * weight); // Don't count NA questions
          }
        }
      });
    }
    
    // Calculate progress scores
    let totalProgressPoints = 0;
    let achievedProgressPoints = 0;
    
    if (task.progress) {
      task.progress.forEach(item => {
        // Only count mandatory items
        if (item && item.status) {
          // Each item is worth 2 points
          totalProgressPoints += 2;
          
          if (item.status === 'completed' || item.status === 'full_compliance') {
            achievedProgressPoints += 2;
          } else if (item.status === 'in_progress' || item.status === 'partial_compliance') {
            achievedProgressPoints += 1;
          }
        }
      });
    }
    
    const totalPoints = totalQuestionPoints + totalProgressPoints;
    const achievedPoints = achievedQuestionPoints + achievedProgressPoints;
    const percentage = totalPoints > 0 ? Math.round((achievedPoints / totalPoints) * 100) : 0;
    
    return { 
      total: totalPoints, 
      achieved: achievedPoints, 
      percentage,
      areas: task.assessmentAreas || []
    };
  };
  
  const scores = calculateTotalScore();

  // Pre-inspection questions section
  const renderPreInspectionQuestions = () => {
    if (!task.preInspectionQuestions || task.preInspectionQuestions.length === 0) {
      return null;
    }
    
    return (
      <PreInspectionSection>
        <SectionTitle>
          <CheckSquare size={18} />
          Pre-Inspection Questionnaire
        </SectionTitle>
        
        <QuestionsList>
          {task.preInspectionQuestions.map((question, index) => (
            <QuestionItem key={index}>
              <QuestionNumber>{index + 1}</QuestionNumber>
              <QuestionText>{question.text}</QuestionText>
              
              <QuestionOptions>
                {question.options && question.options.map((option, optIndex) => (
                  <OptionButton 
                    key={optIndex}
                    selected={task.questionnaireResponses && task.questionnaireResponses[question._id] === option}
                    type="button"
                    disabled={task.status === 'completed'}
                  >
                    {option}
                  </OptionButton>
                ))}
              </QuestionOptions>
            </QuestionItem>
          ))}
        </QuestionsList>
      </PreInspectionSection>
    );
  };

  return (
    <Container>
      <Title>
        <Info size={20} />
        Task Details
      </Title>
      <Description>{task.description}</Description>
      
      <MetaGrid>
        <MetaItem>
          <Calendar size={16} />
          <span style={{ 
            color: isOverdue() ? '#d32f2f' : '#4b5563' 
          }}>
            Deadline: <strong>{formatDate(task.deadline)}</strong>
            {isOverdue() && ' (Overdue)'}
          </span>
        </MetaItem>
        
        <MetaItem>
          <AlertTriangle size={16} />
          <span>Priority: 
            <PriorityBadge priority={task.priority}>
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
            </PriorityBadge>
          </span>
        </MetaItem>
        
        <MetaItem>
          <Activity size={16} />
          <span>Status: 
            <StatusBadge status={task.status}>
              <StatusIcon status={task.status} size={14} />
              {task.status?.replace('_', ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </StatusBadge>
          </span>
        </MetaItem>
        
        {task.inspectionLevel && (
          <MetaItem>
            <CheckCircle size={16} />
            <span>Template: <strong>{task.inspectionLevel.name || 'N/A'}</strong></span>
          </MetaItem>
        )}
        
        {task.location && (
          <MetaItem>
            <MapPin size={16} />
            <span>Location: <strong>{task.location}</strong></span>
          </MetaItem>
        )}
        
        {task.assignedTo && task.assignedTo.length > 0 && (
          <MetaItem>
            <User size={16} />
            <span>Assigned To: <strong>
              {Array.isArray(task.assignedTo) 
                ? task.assignedTo.map(user => 
                    typeof user === 'object' ? user.name || 'Unknown User' : 'Unknown User'
                  ).join(', ')
                : 'Unknown User'}
            </strong></span>
          </MetaItem>
        )}
        
        {task.createdBy && (
          <MetaItem>
            <Briefcase size={16} />
            <span>Created By: <strong>{typeof task.createdBy === 'object' ? task.createdBy.name : 'N/A'}</strong></span>
          </MetaItem>
        )}
      </MetaGrid>
      
      {/* Display score summary if task is in progress or completed */}
      {(task.status === 'in_progress' || task.status === 'completed') && (
        <ScoringSummary>
          <SectionTitle>
            <Award size={18} />
            Compliance Scoring Summary
          </SectionTitle>
          
          <ScoreGrid>
            <ScoreItem percent={scores.percentage}>
              <div className="score-label">Overall Compliance</div>
              <div className="score-value">
                {scores.achieved} / {scores.total}
                <span className="score-percent">({scores.percentage}%)</span>
              </div>
            </ScoreItem>
            
            <ScoreItem>
              <div className="score-label">Completion Rate</div>
              <div className="score-value">
                {task.overallProgress || 0}%
              </div>
            </ScoreItem>
            
            <ScoreItem>
              <div className="score-label">Total Checkpoints</div>
              <div className="score-value">
                {task.progress ? task.progress.length : 0}
              </div>
            </ScoreItem>
          </ScoreGrid>
          
          <ScoringCriteria>
            <div className="criteria-item full">
              <CheckCircle size={14} /> Full Compliance: 2 points
            </div>
            <div className="criteria-item partial">
              <AlertCircle size={14} /> Partial Compliance: 1 point
            </div>
            <div className="criteria-item non">
              <XCircle size={14} /> Non-Compliance: 0 points
            </div>
            <div className="criteria-item na">
              <HelpCircle size={14} /> Not Applicable: Excluded
            </div>
          </ScoringCriteria>
          
          {/* Assessment areas section */}
          {scores.areas && scores.areas.length > 0 && (
            <AssessmentSection>
              <AssessmentTitle>
                <Clipboard size={18} />
                Assessment Areas
              </AssessmentTitle>
              <AssessmentTable>
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Score</th>
                    <th>Weight</th>
                    <th>Weighted Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.areas.map((area, index) => (
                    <tr key={index}>
                      <td>{area.name}</td>
                      <td>{area.score} / {area.maxScore}</td>
                      <td>{area.weight}%</td>
                      <td>
                        {area.maxScore > 0 
                          ? ((area.score / area.maxScore) * area.weight).toFixed(2) 
                          : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AssessmentTable>
            </AssessmentSection>
          )}
        </ScoringSummary>
      )}
      
      {asset && (
        <AssetInfo>
          <AssetTitle>
            <Database size={18} />
            Asset Information
          </AssetTitle>
          <AssetDetail><strong>Asset ID:</strong> {asset.id || 'N/A'}</AssetDetail>
          <AssetDetail><strong>Asset Name:</strong> {asset.displayName || 'N/A'}</AssetDetail>
          <AssetDetail><strong>Asset Type:</strong> {asset.type || 'N/A'}</AssetDetail>
          
          {asset.uniqueId && (
            <AssetDetail><strong>Unique ID:</strong> {asset.uniqueId}</AssetDetail>
          )}
          
          {asset.serialNumber && (
            <AssetDetail><strong>Serial Number:</strong> {asset.serialNumber}</AssetDetail>
          )}
          
          {asset.location && (
            <AssetDetail><strong>Location:</strong> {asset.location}</AssetDetail>
          )}
          
          {asset.manufacturer && (
            <AssetDetail><strong>Manufacturer:</strong> {asset.manufacturer}</AssetDetail>
          )}
        </AssetInfo>
      )}
      
      {/* Render Pre-Inspection Questions */}
      {renderPreInspectionQuestions()}
    </Container>
  );
};

// Add these new styled components for pre-inspection questions
const PreInspectionSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.7);
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const QuestionItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const QuestionNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-navy);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
`;

const QuestionText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 12px;
  margin-top: 8px;
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const OptionButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid #e2e8f0;
  background: ${props => props.selected ? 'rgba(63, 81, 181, 0.1)' : 'white'};
  color: ${props => props.selected ? 'var(--color-navy)' : '#4b5563'};
  border-color: ${props => props.selected ? 'var(--color-navy)' : '#e2e8f0'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(63, 81, 181, 0.05);
    border-color: #cbd5e1;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default PreInspectionStepForm;