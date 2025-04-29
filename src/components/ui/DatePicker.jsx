import React from 'react';
import styled from 'styled-components';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

const DatePickerWrapper = styled.div`
  position: relative;
  
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container {
    position: relative;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px 16px 10px 38px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s;
    
    &:focus {
      outline: none;
      border-color: var(--color-navy);
      box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
    }
  }
  
  .react-datepicker {
    font-family: inherit;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .react-datepicker__header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .react-datepicker__day--selected {
    background-color: var(--color-navy);
    color: white;
  }
  
  .react-datepicker__day:hover {
    background-color: #e0e0e0;
  }
  
  .react-datepicker__time-container {
    border-left: 1px solid #e0e0e0;
  }
  
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
    background-color: var(--color-navy);
    color: white;
  }
`;

const CalendarIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
  color: #64748b;
`;

const DatePicker = ({ 
  selected, 
  onChange, 
  showTimeSelect, 
  timeFormat, 
  timeIntervals, 
  dateFormat,
  ...props 
}) => {
  return (
    <DatePickerWrapper>
      <CalendarIcon>
        <Calendar size={18} />
      </CalendarIcon>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        {...props}
      />
    </DatePickerWrapper>
  );
};

export default DatePicker; 