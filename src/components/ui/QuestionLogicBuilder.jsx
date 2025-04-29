import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Plus, Trash2, Code, CheckCircle, AlertCircle, 
  XCircle, Slash, ChevronDown, ChevronUp
} from 'lucide-react';

const LogicBuilderContainer = styled.div`
  background-color: var(--color-skyblue);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid var(--color-gray-light);
`;

const LogicHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.isExpanded ? '16px' : '0'};
  cursor: pointer;
`;

const LogicTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogicButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const RuleContainer = styled.div`
  background-color: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-gray-light);
  position: relative;
`;

const RuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const RuleTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-gray-dark);
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--color-compliance-non);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--color-gray-light);
  }
`;

const RuleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-gray-light);
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--color-teal);
    box-shadow: 0 0 0 3px rgba(75, 140, 158, 0.1);
  }
`;

const ActionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--color-offwhite);
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
`;

const ActionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-navy);
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const AddRuleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background-color: white;
  border: 1px dashed var(--color-gray-light);
  border-radius: 6px;
  color: var(--color-teal);
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-offwhite);
    border-color: var(--color-teal);
  }
`;

// Component to render different condition options based on question type
const ConditionSelector = ({ questionType, value, onChange }) => {
  switch (questionType) {
    case 'compliance':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select condition</option>
          <option value="equals">Equals</option>
          <option value="not_equals">Not equals</option>
        </Select>
      );
    case 'yes_no':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select condition</option>
          <option value="equals">Equals</option>
          <option value="not_equals">Not equals</option>
        </Select>
      );
    case 'text':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select condition</option>
          <option value="contains">Contains</option>
          <option value="not_contains">Does not contain</option>
          <option value="equals">Equals exactly</option>
          <option value="not_equals">Not equals exactly</option>
          <option value="is_empty">Is empty</option>
          <option value="is_not_empty">Is not empty</option>
        </Select>
      );
    case 'number':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select condition</option>
          <option value="equals">Equals</option>
          <option value="not_equals">Not equals</option>
          <option value="greater_than">Greater than</option>
          <option value="less_than">Less than</option>
          <option value="greater_than_or_equal">Greater than or equal</option>
          <option value="less_than_or_equal">Less than or equal</option>
        </Select>
      );
    default:
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select condition</option>
          <option value="equals">Equals</option>
          <option value="not_equals">Not equals</option>
        </Select>
      );
  }
};

// Component for rendering value selector based on question type
const ValueSelector = ({ questionType, value, onChange, options = [] }) => {
  switch (questionType) {
    case 'compliance':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select value</option>
          <option value="full_compliance">Full Compliance</option>
          <option value="partial_compliance">Partial Compliance</option>
          <option value="non_compliance">Non Compliance</option>
          <option value="not_applicable">Not Applicable</option>
        </Select>
      );
    case 'yes_no':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select value</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </Select>
      );
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Enter text value"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--color-gray-light)',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={onChange}
          placeholder="Enter number"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--color-gray-light)',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        />
      );
    case 'select':
      return (
        <Select value={value} onChange={onChange}>
          <option value="">Select value</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </Select>
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Enter value"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid var(--color-gray-light)',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        />
      );
  }
};

const QuestionLogicBuilder = ({ 
  questions, 
  logic = [], 
  onChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const handleAddRule = () => {
    const newLogic = [
      ...logic, 
      { 
        question: '', 
        condition: '', 
        value: '', 
        action: 'show', 
        targets: [] 
      }
    ];
    onChange(newLogic);
  };
  
  const handleRemoveRule = (index) => {
    const newLogic = [...logic];
    newLogic.splice(index, 1);
    onChange(newLogic);
  };
  
  const handleRuleChange = (index, field, value) => {
    const newLogic = [...logic];
    
    if (field === 'question') {
      // Reset condition and value when question changes
      const selectedQuestion = questions.find(q => q.id === value);
      newLogic[index] = {
        ...newLogic[index],
        [field]: value,
        condition: '',
        value: '',
        questionType: selectedQuestion?.type || 'text'
      };
    } else {
      newLogic[index] = {
        ...newLogic[index],
        [field]: value
      };
    }
    
    onChange(newLogic);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <LogicBuilderContainer>
      <LogicHeader onClick={toggleExpand} isExpanded={isExpanded}>
        <LogicTitle>
          <Code size={16} />
          Conditional Logic
        </LogicTitle>
        <LogicButtonGroup>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </LogicButtonGroup>
      </LogicHeader>
      
      {isExpanded && (
        <>
          {logic.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '16px', 
              color: 'var(--color-gray-medium)',
              fontSize: '14px'
            }}>
              No logic rules defined yet. Add your first rule below.
            </div>
          ) : (
            logic.map((rule, index) => {
              const questionObj = questions.find(q => q.id === rule.question);
              return (
                <RuleContainer key={index}>
                  <RuleHeader>
                    <RuleTitle>Rule {index + 1}</RuleTitle>
                    <DeleteButton onClick={() => handleRemoveRule(index)}>
                      <Trash2 size={16} />
                    </DeleteButton>
                  </RuleHeader>
                  
                  <RuleGrid>
                    <Select
                      value={rule.question}
                      onChange={(e) => handleRuleChange(index, 'question', e.target.value)}
                    >
                      <option value="">Select question</option>
                      {questions.map((question) => (
                        <option key={question.id} value={question.id}>
                          {question.text.length > 40
                            ? `${question.text.substring(0, 40)}...`
                            : question.text}
                        </option>
                      ))}
                    </Select>
                    
                    <ConditionSelector
                      questionType={questionObj?.type || 'text'}
                      value={rule.condition}
                      onChange={(e) => handleRuleChange(index, 'condition', e.target.value)}
                    />
                    
                    <ValueSelector
                      questionType={questionObj?.type || 'text'}
                      value={rule.value}
                      onChange={(e) => handleRuleChange(
                        index, 
                        'value', 
                        e.target.type === 'text' || e.target.type === 'number' 
                          ? e.target.value 
                          : e.target.value
                      )}
                      options={questionObj?.options || []}
                    />
                  </RuleGrid>
                  
                  <ActionCard>
                    <ActionTitle>When condition is met:</ActionTitle>
                    <ActionGrid>
                      <Select
                        value={rule.action}
                        onChange={(e) => handleRuleChange(index, 'action', e.target.value)}
                      >
                        <option value="show">Show questions</option>
                        <option value="hide">Hide questions</option>
                        <option value="require">Make questions required</option>
                        <option value="skip">Skip to next section</option>
                      </Select>
                      
                      {(rule.action === 'show' || rule.action === 'hide' || rule.action === 'require') && (
                        <Select
                          value={rule.targets ? rule.targets[0] || '' : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleRuleChange(
                              index, 
                              'targets', 
                              value ? [value] : []
                            );
                          }}
                        >
                          <option value="">Select target question</option>
                          {questions
                            .filter(q => q.id !== rule.question)
                            .map((question) => (
                              <option key={question.id} value={question.id}>
                                {question.text.length > 40
                                  ? `${question.text.substring(0, 40)}...`
                                  : question.text}
                              </option>
                            ))
                          }
                        </Select>
                      )}
                    </ActionGrid>
                  </ActionCard>
                </RuleContainer>
              );
            })
          )}
          
          <AddRuleButton onClick={handleAddRule}>
            <Plus size={14} />
            Add Logic Rule
          </AddRuleButton>
        </>
      )}
    </LogicBuilderContainer>
  );
};

export default QuestionLogicBuilder; 