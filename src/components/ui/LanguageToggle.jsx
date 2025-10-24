import React, { useState } from 'react';
import styled from 'styled-components';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageToggleContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const LanguageButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  color: #374151;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .icon {
    opacity: 0.7;
  }

  .chevron {
    opacity: 0.5;
    transition: transform 0.3s;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  padding: 8px 0;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$isOpen ? '0' : '-10px'});
  transition: all 0.3s;
  z-index: 100;
`;

const LanguageOption = styled.button`
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
  color: #374151;
  font-size: 14px;
  text-align: left;

  &:hover {
    background: #f3f4f6;
  }

  &.active {
    background: #e5f3ff;
    color: #1d4ed8;
    font-weight: 500;
  }

  .flag {
    width: 20px;
    height: 15px;
    border-radius: 2px;
    background: ${props => props.$flagColor || '#e5e7eb'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: white;
  }
`;

const LanguageToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <LanguageToggleContainer>
      <LanguageButton 
        onClick={() => setIsOpen(!isOpen)}
        $isOpen={isOpen}
      >
        <Globe size={16} className="icon" />
        <span>{currentLang?.nativeName || currentLang?.name}</span>
        <ChevronDown size={14} className="chevron" />
      </LanguageButton>

      <LanguageDropdown $isOpen={isOpen}>
        {languages.map((language) => (
          <LanguageOption
            key={language.code}
            className={currentLanguage === language.code ? 'active' : ''}
            onClick={() => handleLanguageChange(language.code)}
            $flagColor={language.code === 'en' ? '#1d4ed8' : '#059669'}
          >
            <div className="flag">
              {language.code === 'en' ? 'EN' : 'ع'}
            </div>
            <span>{language.nativeName}</span>
          </LanguageOption>
        ))}
      </LanguageDropdown>
    </LanguageToggleContainer>
  );
};

export default LanguageToggle;
