import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Globe,
  Clock,
  Calendar,
  DollarSign,
  Save,
  AlertTriangle,
  Check,
  Languages,
  Map,
  BookOpen
} from 'lucide-react';

const Container = styled.div`
  display: grid;
  gap: 24px;
`;

const Section = styled.div`
  display: grid;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    opacity: 0.7;
  }
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #64748b;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;

  .icon {
    color: #64748b;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.variant === 'primary' ? '#1a237e' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#1a237e'};
  border: 1px solid ${props => props.variant === 'primary' ? '#1a237e' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#151b4f' : '#f8fafc'};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
`;

const PreviewSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const PreviewTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 12px;
`;

const PreviewGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const PreviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  font-size: 14px;

  .label {
    color: #64748b;
  }

  .value {
    color: #1a237e;
    font-weight: 500;
  }
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 8px;
  color: #c2410c;
  font-size: 14px;
  margin-top: 24px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #16a34a;
  font-size: 14px;
  margin-top: 16px;
`;

const RTLSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #1a237e;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const LocalizationSettings = () => {
  const [settings, setSettings] = useState({
    language: {
      primary: 'en',
      fallback: 'en',
      allowUserLanguage: true,
      isRTL: false,
      enableAutoDetect: true
    },
    dateTime: {
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      firstDayOfWeek: 'monday'
    },
    regional: {
      country: 'SA',
      currency: 'SAR',
      numberFormat: 'comma',
      measurementSystem: 'metric'
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format sample values according to selected settings
  const formatPreviewDate = () => {
    const date = new Date();
    const options = {
      timeZone: settings.dateTime.timezone,
      hour12: settings.dateTime.timeFormat === '12'
    };

    switch (settings.dateTime.dateFormat) {
      case 'DD/MM/YYYY':
        return new Intl.DateTimeFormat('en-GB', options).format(date);
      case 'YYYY-MM-DD':
        return new Intl.DateTimeFormat('en-CA', options).format(date);
      default:
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  };

  const formatPreviewNumber = (number) => {
    const options = {
      style: 'currency',
      currency: settings.regional.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    return new Intl.NumberFormat(settings.language.primary, options).format(number);
  };

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>
            <Languages size={20} className="icon" />
            Language Settings
          </SectionTitle>
          <SectionDescription>
            Configure system language and translation preferences
          </SectionDescription>
        </div>

        <Card>
          <FormGrid>
            <FormGroup>
              <Label>
                <Globe size={14} className="icon" />
                Primary Language
              </Label>
              <Select
                value={settings.language.primary}
                onChange={(e) => handleChange('language', 'primary', e.target.value)}
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
                <option value="fr">Français (French)</option>
                <option value="es">Español (Spanish)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <BookOpen size={14} className="icon" />
                Fallback Language
              </Label>
              <Select
                value={settings.language.fallback}
                onChange={(e) => handleChange('language', 'fallback', e.target.value)}
              >
                <option value="en">English</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="fr">Français (French)</option>
                <option value="es">Español (Spanish)</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <RTLSwitch>
            <div>
              <Label style={{ marginBottom: '4px' }}>Right-to-Left (RTL) Mode</Label>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Enable RTL layout for languages that read from right to left
              </div>
            </div>
            <Toggle>
              <ToggleInput
                type="checkbox"
                checked={settings.language.isRTL}
                onChange={(e) => handleChange('language', 'isRTL', e.target.checked)}
              />
              <ToggleSlider />
            </Toggle>
          </RTLSwitch>
        </Card>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Clock size={20} className="icon" />
            Date & Time
          </SectionTitle>
          <SectionDescription>
            Configure date, time, and timezone settings
          </SectionDescription>
        </div>

        <Card>
          <FormGrid>
            <FormGroup>
              <Label>
                <Map size={14} className="icon" />
                Timezone
              </Label>
              <Select
                value={settings.dateTime.timezone}
                onChange={(e) => handleChange('dateTime', 'timezone', e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Riyadh">Arabia Standard Time (AST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">GMT/BST (London)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={14} className="icon" />
                Date Format
              </Label>
              <Select
                value={settings.dateTime.dateFormat}
                onChange={(e) => handleChange('dateTime', 'dateFormat', e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={14} className="icon" />
                Time Format
              </Label>
              <Select
                value={settings.dateTime.timeFormat}
                onChange={(e) => handleChange('dateTime', 'timeFormat', e.target.value)}
              >
                <option value="12">12-hour</option>
                <option value="24">24-hour</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Calendar size={14} className="icon" />
                First Day of Week
              </Label>
              <Select
                value={settings.dateTime.firstDayOfWeek}
                onChange={(e) => handleChange('dateTime', 'firstDayOfWeek', e.target.value)}
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="saturday">Saturday</option>
              </Select>
            </FormGroup>
          </FormGrid>
        </Card>
      </Section>

      <Section>
        <div>
          <SectionTitle>
            <Globe size={20} className="icon" />
            Regional Settings
          </SectionTitle>
          <SectionDescription>
            Configure region-specific formatting and preferences
          </SectionDescription>
        </div>

        <Card>
          <FormGrid>
            <FormGroup>
              <Label>
                <Map size={14} className="icon" />
                Country/Region
              </Label>
              <Select
                value={settings.regional.country}
                onChange={(e) => handleChange('regional', 'country', e.target.value)}
              >
                <option value="SA">Saudi Arabia</option>
                <option value="AE">United Arab Emirates</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <DollarSign size={14} className="icon" />
                Currency
              </Label>
              <Select
                value={settings.regional.currency}
                onChange={(e) => handleChange('regional', 'currency', e.target.value)}
              >
                <option value="SAR">Saudi Riyal (SAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={14} className="icon" />
                Number Format
              </Label>
              <Select
                value={settings.regional.numberFormat}
                onChange={(e) => handleChange('regional', 'numberFormat', e.target.value)}
              >
                <option value="comma">1,234.56</option>
                <option value="period">1.234,56</option>
                <option value="space">1 234,56</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <Globe size={14} className="icon" />
                Measurement System
              </Label>
              <Select
                value={settings.regional.measurementSystem}
                onChange={(e) => handleChange('regional', 'measurementSystem', e.target.value)}
              >
                <option value="metric">Metric (km, kg)</option>
                <option value="imperial">Imperial (mi, lb)</option>
              </Select>
            </FormGroup>
          </FormGrid>

          <PreviewSection>
            <PreviewTitle>Format Preview</PreviewTitle>
            <PreviewGrid>
              <PreviewItem>
                <span className="label">Current Date & Time</span>
                <span className="value">{formatPreviewDate()}</span>
              </PreviewItem>
              <PreviewItem>
                <span className="label">Currency & Numbers</span>
                <span className="value">{formatPreviewNumber(1234.56)}</span>
              </PreviewItem>
              <PreviewItem>
                <span className="label">Distance</span>
                <span className="value">
                  {settings.regional.measurementSystem === 'metric' ? '100 kilometers' : '62.1 miles'}
                </span>
              </PreviewItem>
              <PreviewItem>
                <span className="label">Weight</span>
                <span className="value">
                  {settings.regional.measurementSystem === 'metric' ? '500 kilograms' : '1,102 pounds'}
                </span>
              </PreviewItem>
            </PreviewGrid>
          </PreviewSection>
        </Card>
      </Section>

      {hasChanges && (
        <WarningMessage>
          <AlertTriangle size={18} />
          You have unsaved changes. Please save your changes before leaving this page.
        </WarningMessage>
      )}

      {saveSuccess && (
        <SuccessMessage>
          <Check size={18} />
          Settings saved successfully!
        </SuccessMessage>
      )}

      <ButtonGroup>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!hasChanges || isSubmitting}
        >
          <Save size={16} />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default LocalizationSettings;