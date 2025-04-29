import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Upload,
  Save,
  AlertTriangle
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
  color: var(--color-navy);
  margin-bottom: 4px;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #64748b;
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

const Input = styled.input`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #334155;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const LogoUpload = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LogoPreview = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid var(--color-navy);
  color: var(--color-navy);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  input {
    display: none;
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

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.variant === 'primary' ? 'var(--color-navy)' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : 'var(--color-navy)'};
  border: 1px solid ${props => props.variant === 'primary' ? 'var(--color-navy)' : '#e2e8f0'};
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

const GeneralSettings = () => {
  const [formData, setFormData] = useState({
    companyName: 'MIRSAT Portal',
    address: '6733 Abu Bakr As Seddiq, AlTaawon Dist',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    phone: '+966 50 123 4567',
    email: 'info@mirsat-portal.com',
    website: 'https://mirsat-portal.com',
    description: 'MIRSAT portal is designed to streamline task management, assignment, and tracking for inspectors and provide comprehensive reporting and administrative functionalities.',
    logo: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Section>
        <div>
          <SectionTitle>Organization Details</SectionTitle>
          <SectionDescription>
            Update your organization information and branding
          </SectionDescription>
        </div>

        <FormGrid>
          <FormGroup>
            <Label>
              <Building2 size={16} className="icon" />
              Company Name
            </Label>
            <Input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <MapPin size={16} className="icon" />
              Address
            </Label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <MapPin size={16} className="icon" />
              City
            </Label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Globe size={16} className="icon" />
              Country
            </Label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter country"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Phone size={16} className="icon" />
              Phone Number
            </Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Mail size={16} className="icon" />
              Email Address
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Globe size={16} className="icon" />
              Website
            </Label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Enter website URL"
            />
          </FormGroup>
        </FormGrid>

        <FormGroup>
          <Label>Company Description</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter company description"
          />
        </FormGroup>
      </Section>

      <Section>
        <div>
          <SectionTitle>Company Logo</SectionTitle>
          <SectionDescription>
            Upload your company logo for branding purposes
          </SectionDescription>
        </div>

        <LogoUpload>
          <LogoPreview>
            {formData.logo ? (
              <img src={formData.logo} alt="Company logo" />
            ) : (
              <Upload size={24} color="#64748b" />
            )}
          </LogoPreview>
          <UploadButton>
            <Upload size={16} />
            Upload Logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </UploadButton>
        </LogoUpload>

        {hasChanges && (
          <WarningMessage>
            <AlertTriangle size={18} />
            You have unsaved changes. Please save your changes before leaving this page.
          </WarningMessage>
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
      </Section>
    </Container>
  );
};

export default GeneralSettings;