import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Clock, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const CurrentTimeDisplay = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-navy);
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  background: rgba(26, 35, 126, 0.05);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(26, 35, 126, 0.1);
  min-width: 80px;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 4px 8px;
    min-width: 70px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 4px 6px;
    min-width: 60px;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
  min-width: 120px;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 90px;
    gap: 4px;
  }

  @media (max-width: 480px) {
    padding: 4px 6px;
    font-size: 11px;
    min-width: 70px;
    gap: 3px;
  }
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
    }
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  display: ${props => props.isOpen ? 'block' : 'none'};

  @media (max-width: 768px) {
    right: 0;
    min-width: 180px;
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #374151;
  font-size: 14px;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &.active {
    background: #eff6ff;
    color: var(--color-navy);
    font-weight: 500;
  }
`;

const ChevronIcon = styled(ChevronDown)`
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownTimeDisplay = styled.div`
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
  
  .time {
    font-weight: 600;
    color: var(--color-navy);
    font-size: 14px;
  }
  
  .label {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
`;

const TIMEZONES = [
  {
    id: 'ksa',
    name: 'KSA',
    timezone: 'Asia/Riyadh',
    label: 'KSA (Riyadh)'
  },
  {
    id: 'us',
    name: 'US',
    timezone: 'America/New_York',
    label: 'US (New York)'
  },
  {
    id: 'india',
    name: 'India',
    timezone: 'Asia/Kolkata',
    label: 'India (Kolkata)'
  }
];

const TimezoneDropdown = ({ isOpen: controlledIsOpen, onOpen, onClose }) => {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(
    localStorage.getItem('selectedTimezone') || 'Asia/Riyadh'
  );
  const [currentTime, setCurrentTime] = useState('');
  const dropdownRef = useRef(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeInZone = new Intl.DateTimeFormat('en-US', {
        timeZone: selectedTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(now);
      setCurrentTime(timeInZone);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  // Close dropdown when clicking outside for uncontrolled mode
  useEffect(() => {
    if (!isControlled) {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setInternalIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isControlled]);

  const toggleDropdown = () => {
    if (isControlled) {
      if (isOpen) {
        onClose?.();
      } else {
        onOpen?.();
      }
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleTimezoneSelect = (timezone) => {
    setSelectedTimezone(timezone.timezone);
    localStorage.setItem('selectedTimezone', timezone.timezone);
    if (isControlled) {
      onClose?.();
    } else {
      setInternalIsOpen(false);
    }
    toast.success(`Timezone changed to ${timezone.label}`);
  };

  const getSelectedTimezoneLabel = () => {
    const selected = TIMEZONES.find(tz => tz.timezone === selectedTimezone);
    return selected ? selected.name : 'KSA';
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <CurrentTimeDisplay>{currentTime}</CurrentTimeDisplay>
      
      <DropdownButton onClick={toggleDropdown}>
        <Clock size={16} />
        <span>{getSelectedTimezoneLabel()}</span>
        <ChevronIcon size={14} isOpen={isOpen} />
      </DropdownButton>
      
      <DropdownContent isOpen={isOpen}>
        <DropdownTimeDisplay>
          <div className="time">{currentTime}</div>
          <div className="label">{t('common.currentTime')}</div>
        </DropdownTimeDisplay>
        
        {TIMEZONES.map((timezone) => (
          <DropdownItem
            key={timezone.id}
            onClick={() => handleTimezoneSelect(timezone)}
            className={selectedTimezone === timezone.timezone ? 'active' : ''}
          >
            {timezone.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownContainer>
  );
};

export default TimezoneDropdown; 