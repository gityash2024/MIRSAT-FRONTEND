import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar, ChevronDown } from 'lucide-react';

const DatePickerContainer = styled.div`
  position: relative;
`;

const DatePickerTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1a237e;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1a237e;
  }
`;

const DatePickerDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1000;
  min-width: 300px;
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const PresetButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: ${props => props.active ? '#1a237e' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#1a237e' : '#f8fafc'};
  }
`;

const DateInputs = styled.div`
  display: flex;
  gap: 12px;
`;

const DateInput = styled.div`
  flex: 1;

  label {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 4px;
  }

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: #1a237e;
    }
  }
`;

const presets = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 }
];

const formatDate = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const DateRangePicker = ({ from, to, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(from ? formatDate(from) : '');
  const [endDate, setEndDate] = useState(to ? formatDate(to) : '');

  const handlePresetClick = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    onSelect({ from: start, to: end });
  };

  const handleDateChange = (date, isStart) => {
    if (isStart) {
      setStartDate(date);
      onSelect({ from: new Date(date), to: endDate ? new Date(endDate) : null });
    } else {
      setEndDate(date);
      onSelect({ from: startDate ? new Date(startDate) : null, to: new Date(date) });
    }
  };

  return (
    <DatePickerContainer>
      <DatePickerTrigger onClick={() => setIsOpen(!isOpen)}>
        <Calendar size={16} />
        {startDate && endDate ? (
          `${startDate} - ${endDate}`
        ) : (
          'Select Date Range'
        )}
        <ChevronDown size={16} />
      </DatePickerTrigger>

      {isOpen && (
        <DatePickerDropdown>
          <PresetButtons>
            {presets.map(preset => (
              <PresetButton
                key={preset.label}
                onClick={() => handlePresetClick(preset.days)}
              >
                Last {preset.label}
              </PresetButton>
            ))}
          </PresetButtons>

          <DateInputs>
            <DateInput>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, true)}
              />
            </DateInput>
            <DateInput>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(e.target.value, false)}
                min={startDate}
              />
            </DateInput>
          </DateInputs>
        </DatePickerDropdown>
      )}
    </DatePickerContainer>
  );
};

export default DateRangePicker;