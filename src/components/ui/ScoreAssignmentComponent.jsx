import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, XCircle, Slash, Percent, Award } from 'lucide-react';

const ScoreContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  border: 1px solid var(--color-gray-light);
`;

const Title = styled.h3`
  font-size: 16px;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.div`
  background-color: var(--color-offwhite);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h4`
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--color-gray-dark);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SliderContainer = styled.div`
  margin-bottom: 16px;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const SliderName = styled.span`
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gray-dark);
`;

const SliderValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy);
  background: var(--color-skyblue);
  padding: 2px 8px;
  border-radius: 16px;
`;

const StyledSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--color-gray-light);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-teal);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-teal);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const SectionWeights = styled.div`
  margin-top: 24px;
`;

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-gray-light);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-dark);
`;

const WeightInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid var(--color-gray-light);
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: var(--color-teal);
    box-shadow: 0 0 0 3px rgba(75, 140, 158, 0.1);
  }
`;

const TotalRow = styled(SectionRow)`
  font-weight: 600;
  color: var(--color-navy);
  border-top: 2px solid var(--color-gray-light);
  margin-top: 8px;
  padding-top: 16px;
`;

const ScoreAssignmentComponent = ({ 
  sections,
  onScoreChange,
  onWeightChange
}) => {
  const [scores, setScores] = useState({
    full_compliance: 2,
    partial_compliance: 1,
    non_compliance: 0,
    not_applicable: 0
  });

  const [weights, setWeights] = useState(
    sections.reduce((acc, section) => ({
      ...acc,
      [section.id]: section.weight || 0
    }), {})
  );

  // Calculate total percentage
  const totalWeight = Object.values(weights).reduce((sum, val) => sum + Number(val), 0);

  const handleScoreChange = (type, value) => {
    const newScores = { ...scores, [type]: parseInt(value, 10) };
    setScores(newScores);
    onScoreChange(newScores);
  };

  const handleWeightChange = (sectionId, value) => {
    const numValue = Math.min(100, Math.max(0, value === '' ? 0 : Number(value)));
    const newWeights = { ...weights, [sectionId]: numValue };
    setWeights(newWeights);
    onWeightChange(newWeights);
  };

  return (
    <ScoreContainer>
      <Title>
        <Award size={18} />
        Scoring Configuration
      </Title>
      
      <GridContainer>
        <Card>
          <CardTitle>
            <Award size={16} />
            Points for Compliance Levels
          </CardTitle>
          
          <SliderContainer>
            <SliderLabel>
              <SliderName>
                <CheckCircle size={14} color="var(--color-compliance-full)" />
                Full Compliance
              </SliderName>
              <SliderValue>{scores.full_compliance} points</SliderValue>
            </SliderLabel>
            <StyledSlider
              type="range"
              min="0"
              max="10"
              value={scores.full_compliance}
              onChange={(e) => handleScoreChange('full_compliance', e.target.value)}
            />
          </SliderContainer>
          
          <SliderContainer>
            <SliderLabel>
              <SliderName>
                <AlertCircle size={14} color="var(--color-compliance-partial)" />
                Partial Compliance
              </SliderName>
              <SliderValue>{scores.partial_compliance} points</SliderValue>
            </SliderLabel>
            <StyledSlider
              type="range"
              min="0"
              max="10"
              value={scores.partial_compliance}
              onChange={(e) => handleScoreChange('partial_compliance', e.target.value)}
            />
          </SliderContainer>
          
          <SliderContainer>
            <SliderLabel>
              <SliderName>
                <XCircle size={14} color="var(--color-compliance-non)" />
                Non Compliance
              </SliderName>
              <SliderValue>{scores.non_compliance} points</SliderValue>
            </SliderLabel>
            <StyledSlider
              type="range"
              min="0"
              max="5"
              value={scores.non_compliance}
              onChange={(e) => handleScoreChange('non_compliance', e.target.value)}
            />
          </SliderContainer>
          
          <SliderContainer>
            <SliderLabel>
              <SliderName>
                <Slash size={14} color="var(--color-compliance-na)" />
                Not Applicable
              </SliderName>
              <SliderValue>{scores.not_applicable} points</SliderValue>
            </SliderLabel>
            <StyledSlider
              type="range"
              min="0"
              max="5"
              value={scores.not_applicable}
              onChange={(e) => handleScoreChange('not_applicable', e.target.value)}
            />
          </SliderContainer>
        </Card>
        
        <Card>
          <CardTitle>
            <Percent size={16} />
            Section Weights (%)
          </CardTitle>
          
          <SectionWeights>
            {sections.map((section) => (
              <SectionRow key={section.id}>
                <SectionName>{section.name}</SectionName>
                <WeightInput
                  type="number"
                  min="0"
                  max="100"
                  value={weights[section.id]}
                  onChange={(e) => handleWeightChange(section.id, e.target.value)}
                  onBlur={() => {
                    if (weights[section.id] === '') {
                      handleWeightChange(section.id, 0);
                    }
                  }}
                />
              </SectionRow>
            ))}
            
            <TotalRow>
              <SectionName>Total</SectionName>
              <span style={{ 
                color: totalWeight !== 100 ? 'var(--color-compliance-non)' : 'var(--color-compliance-full)'
              }}>
                {totalWeight}%
              </span>
            </TotalRow>
          </SectionWeights>
        </Card>
      </GridContainer>
    </ScoreContainer>
  );
};

export default ScoreAssignmentComponent; 