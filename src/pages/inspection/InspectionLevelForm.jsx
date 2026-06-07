import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import {
  Plus,
  Trash2,
  AlertCircle,
  Save,
  ArrowLeft,
  Folder,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Check,
  X,
  Edit,
  User,
  Eye,
  Search,
  Copy,
  CheckCircle,
  Clock,
  List,
  Grid,
  HelpCircle,
  ListChecks,
  Database,
  BookOpen,
  PlusCircle,
  Move,
  Layers,
  Link2,
  FileText,
  Filter,
  RefreshCw,
  Clipboard,
  Trash,
  ChevronUp,
  Settings,
  Minus,
  Loader,
  Info,
  Calendar,
  Upload,
  Smartphone,
  ArrowUpRight,
  History,
  Award,
  ToggleLeft,
  Download
} from 'lucide-react';
// Native HTML5 Drag and Drop will be used instead of react-beautiful-dnd for better stability
import { toast } from 'react-hot-toast';
import { inspectionService } from '../../services/inspection.service';
import {
  fetchQuestionLibrary,
  addQuestionToLibrary,
  deleteQuestionFromLibrary
} from '../../store/slices/questionLibrarySlice';
import { updateInspectionLevel } from '../../store/slices/inspectionLevelSlice';
import Skeleton from '../../components/ui/Skeleton';
import InspectionLayout from '../../components/common/InspectionLayout';
import ComplianceResponseSelector from '../../components/ui/ComplianceResponseSelector';
import ScoreAssignmentComponent from '../../components/ui/ScoreAssignmentComponent';
import QuestionLogicBuilder from '../../components/ui/QuestionLogicBuilder';
import debounce from 'lodash/debounce';
import { v4 as uuidv4 } from 'uuid';
import { fetchAssetTypes } from '../../store/slices/assetTypeSlice';
import api from '../../services/api';
import ReportPreviewComponent from '../../components/reports/ReportPreviewComponent';
import Alert from '@mui/material/Alert';
import * as XLSX from 'xlsx';

const TEMPLATE_IMPORT_EXCEL_SHEET_NAME = 'Template Import';
const TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME = 'Basic Info';
const TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME = 'Pages and Questions';
const TEMPLATE_IMPORT_EXCEL_INSTRUCTIONS_SHEET_NAME = 'Instructions';
const TEMPLATE_IMPORT_EXCEL_FILE_NAME = 'template-import-sample.xlsx';

const TEMPLATE_IMPORT_EXCEL_BASIC_INFO_COLUMNS = ['Field', 'Value', 'Help'];

const TEMPLATE_IMPORT_EXCEL_BASIC_INFO_FIELDS = [
  ['Template Name', 'Marina Safety Operations Sample', 'Required. The name shown in Create Template.'],
  ['Template Description', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'Optional. Long description for the template.'],
  ['Template Type', 'marina_operator', 'Optional. Match an existing Type when possible.'],
  ['Template Status', 'draft', 'Optional. Allowed values: active, inactive, draft, archived.']
];

const TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS = [
  'Page Name',
  'Page Description',
  'Page Order',
  'Section Name',
  'Section Description',
  'Section Order',
  'Question Text',
  'Question Description',
  'Answer Type',
  'Required',
  'Requirement Type',
  'Include N/A',
  'Weight',
  'Options',
  'Score Yes',
  'Score No',
  'Score N/A',
  'Score Full Compliance',
  'Score Partial Compliance',
  'Score Non-Compliant',
  'Score Not Applicable',
  'Option Scores',
  'Scoring Enabled',
  'Scoring Max'
];

const REQUIRED_TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS = [
  'Page Name',
  'Section Name',
  'Question Text'
];

const TEMPLATE_IMPORT_EXCEL_COLUMNS = [
  'Template Name',
  'Template Description',
  'Template Type',
  'Template Status',
  'Page Name',
  'Page Description',
  'Page Order',
  'Section Name',
  'Section Description',
  'Section Order',
  'Question Text',
  'Question Description',
  'Answer Type',
  'Type',
  'Required',
  'Mandatory',
  'Requirement Type',
  'Include N/A',
  'Weight',
  'Options',
  'Scores',
  'Scoring Enabled',
  'Scoring Max'
];

const REQUIRED_TEMPLATE_IMPORT_EXCEL_COLUMNS = [
  'Template Name',
  'Page Name',
  'Section Name',
  'Question Text'
];

const TEMPLATE_IMPORT_STATUS_VALUES = ['active', 'inactive', 'draft', 'archived'];
const TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES = ['mandatory', 'recommended'];
const TEMPLATE_IMPORT_ANSWER_TYPE_VALUES = [
  'text',
  'textarea',
  'number',
  'date',
  'yesno',
  'yes_no',
  'select',
  'multiple_choice',
  'multiple',
  'checkbox',
  'compliance',
  'signature',
  'media',
  'file'
];

const TEMPLATE_IMPORT_ANSWER_TYPE_ALIASES = {
  'yes/no': 'yesno',
  'yes no': 'yesno',
  'yes-no': 'yesno',
  'multiple choice': 'multiple_choice',
  'multiple-choice': 'multiple_choice',
  'text area': 'textarea',
  'file upload': 'file',
  'media upload': 'media'
};

const TEMPLATE_IMPORT_BOOLEAN_TRUE_VALUES = new Set(['true', 'yes', 'y', '1']);
const TEMPLATE_IMPORT_BOOLEAN_FALSE_VALUES = new Set(['false', 'no', 'n', '0']);

const TEMPLATE_SIZE_LIMITS = {
  pages: 1000,
  sections: 1000,
  questions: 10000
};
const QUESTION_PAGE_SIZE = 50;
const LOCAL_STORAGE_KEY = 'inspection_template_draft';
const LOCAL_STORAGE_DRAFT_MAX_CHARACTERS = 4000000;
const LOCAL_STORAGE_DRAFT_SIZE_LIMITS = {
  pages: 250,
  sections: 500,
  questions: 2500
};

const getTemplateSizeStats = (template) => {
  const pages = Array.isArray(template?.pages) ? template.pages : [];
  let sections = 0;
  let questions = 0;

  pages.forEach((page) => {
    const pageSections = Array.isArray(page?.sections) ? page.sections : [];
    sections += pageSections.length;

    pageSections.forEach((section) => {
      questions += Array.isArray(section?.questions) ? section.questions.length : 0;
    });
  });

  return {
    pages: pages.length,
    sections,
    questions
  };
};

const getTemplateLimitViolations = (stats, limits = TEMPLATE_SIZE_LIMITS) => (
  Object.entries(limits)
    .filter(([key, limit]) => (stats?.[key] || 0) > limit)
);

const TEMPLATE_IMPORT_SCORE_COLUMNS = {
  'Score Yes': 'Yes',
  'Score No': 'No',
  'Score N/A': 'N/A',
  'Score Full Compliance': 'Full compliance',
  'Score Partial Compliance': 'Partial compliance',
  'Score Non-Compliant': 'Non-compliant',
  'Score Not Applicable': 'Not applicable'
};

const TEMPLATE_IMPORT_DEFAULT_OPTIONS = {
  yesno: ['Yes', 'No', 'N/A'],
  yes_no: ['Yes', 'No', 'N/A'],
  compliance: ['Full compliance', 'Partial compliance', 'Non-compliant', 'Not applicable']
};

const normalizeTemplateImportExcelHeader = (value) => (
  String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
);

const toTemplateImportExcelCellString = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
};

const TEMPLATE_IMPORT_EXCEL_SAMPLE_ROWS = [
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Safety Readiness', 'Emergency readiness and safety equipment checks.', 0, 'Emergency Equipment', 'Confirm critical safety equipment is available and usable.', 0, 'Are fire extinguishers visible, accessible, and within service date?', 'Check docks, service areas, and customer access points.', 'yes_no', 'yes_no', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Yes|No|N/A', 'Yes=2|No=0|N/A=0', 'TRUE', 2],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Safety Readiness', 'Emergency readiness and safety equipment checks.', 0, 'Emergency Equipment', 'Confirm critical safety equipment is available and usable.', 0, 'Life rings and rescue hooks are positioned at required intervals.', 'Verify placement and condition along active waterfront edges.', 'compliance', 'compliance', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Compliant|Non-Compliant|N/A', 'Compliant=3|Non-Compliant=0|N/A=0', 'TRUE', 3],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Safety Readiness', 'Emergency readiness and safety equipment checks.', 0, 'Emergency Equipment', 'Confirm critical safety equipment is available and usable.', 0, 'Record any missing or damaged safety equipment.', 'Include location and corrective action required.', 'textarea', 'textarea', 'FALSE', 'FALSE', 'recommended', 'FALSE', 1, '', '', 'FALSE', 0],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Safety Readiness', 'Emergency readiness and safety equipment checks.', 0, 'Incident Response', 'Review response readiness for incidents and emergencies.', 1, 'Emergency contact list is posted and current.', 'Confirm phone numbers and responsible contacts.', 'yes_no', 'yes_no', 'TRUE', 'TRUE', 'mandatory', 'FALSE', 1, 'Yes|No', 'Yes=2|No=0', 'TRUE', 2],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Safety Readiness', 'Emergency readiness and safety equipment checks.', 0, 'Incident Response', 'Review response readiness for incidents and emergencies.', 1, 'Date of last emergency drill.', 'Use the latest documented drill date.', 'date', 'date', 'FALSE', 'FALSE', 'recommended', 'FALSE', 1, '', '', 'FALSE', 0],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Dock And Utilities', 'Physical dock condition, power, water, and lighting.', 1, 'Dock Condition', 'Inspect walking surfaces, access points, and dock fixtures.', 0, 'Dock surface is free from trip hazards, loose boards, and exposed fasteners.', 'Check high-traffic areas first.', 'yes_no', 'yes_no', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Yes|No|N/A', 'Yes=2|No=0|N/A=0', 'TRUE', 2],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Dock And Utilities', 'Physical dock condition, power, water, and lighting.', 1, 'Dock Condition', 'Inspect walking surfaces, access points, and dock fixtures.', 0, 'Rate the overall dock condition.', 'Use the rating that best reflects the inspected area.', 'select', 'select', 'TRUE', 'TRUE', 'mandatory', 'FALSE', 1, 'Excellent|Good|Needs Repair|Unsafe', 'Excellent=4|Good=3|Needs Repair=1|Unsafe=0', 'TRUE', 4],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Dock And Utilities', 'Physical dock condition, power, water, and lighting.', 1, 'Power Water Lighting', 'Verify utility availability and visible condition.', 1, 'Shore power pedestals are secured and free from visible damage.', 'Do not open panels unless authorized.', 'compliance', 'compliance', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Compliant|Non-Compliant|N/A', 'Compliant=3|Non-Compliant=0|N/A=0', 'TRUE', 3],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Dock And Utilities', 'Physical dock condition, power, water, and lighting.', 1, 'Power Water Lighting', 'Verify utility availability and visible condition.', 1, 'Lighting is operational in public walkways and dock approaches.', 'Inspect during low-light conditions where possible.', 'yes_no', 'yes_no', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Yes|No|N/A', 'Yes=2|No=0|N/A=0', 'TRUE', 2],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Dock And Utilities', 'Physical dock condition, power, water, and lighting.', 1, 'Power Water Lighting', 'Verify utility availability and visible condition.', 1, 'Upload notes for utility repairs needed.', 'List pedestal, berth, or dock identifiers.', 'textarea', 'textarea', 'FALSE', 'FALSE', 'recommended', 'FALSE', 1, '', '', 'FALSE', 0],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Environmental Compliance', 'Pollution prevention, waste handling, and spill controls.', 2, 'Waste And Spill Controls', 'Check environmental controls for daily operations.', 0, 'Spill kits are stocked and accessible.', 'Check absorbents, gloves, bags, and disposal guidance.', 'yes_no', 'yes_no', 'TRUE', 'TRUE', 'mandatory', 'FALSE', 1, 'Yes|No', 'Yes=2|No=0', 'TRUE', 2],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Environmental Compliance', 'Pollution prevention, waste handling, and spill controls.', 2, 'Waste And Spill Controls', 'Check environmental controls for daily operations.', 0, 'Waste bins are labeled and not overflowing.', 'Include recycling, general waste, and hazardous waste areas.', 'compliance', 'compliance', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Compliant|Non-Compliant|N/A', 'Compliant=3|Non-Compliant=0|N/A=0', 'TRUE', 3],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Environmental Compliance', 'Pollution prevention, waste handling, and spill controls.', 2, 'Waste And Spill Controls', 'Check environmental controls for daily operations.', 0, 'Environmental issue severity.', 'Select the highest severity observed during inspection.', 'select', 'select', 'TRUE', 'TRUE', 'mandatory', 'FALSE', 1, 'None|Low|Medium|High', 'None=3|Low=2|Medium=1|High=0', 'TRUE', 3],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Guest Service', 'Customer-facing amenities and service quality.', 3, 'Public Areas', 'Inspect cleanliness and usability of public-facing spaces.', 0, 'Reception, restrooms, and walkways are clean and presentable.', 'Inspect during regular operating hours.', 'yes_no', 'yes_no', 'TRUE', 'TRUE', 'mandatory', 'TRUE', 1, 'Yes|No|N/A', 'Yes=2|No=0|N/A=0', 'TRUE', 2],
  ['Marina Safety Operations Sample', 'Sample large inspection template for marina safety, operations, compliance, and guest service checks.', 'marina_operator', 'draft', 'Guest Service', 'Customer-facing amenities and service quality.', 3, 'Public Areas', 'Inspect cleanliness and usability of public-facing spaces.', 0, 'Guest signage is clear and visible.', 'Include safety, directional, and service signage.', 'compliance', 'compliance', 'FALSE', 'FALSE', 'recommended', 'TRUE', 1, 'Compliant|Non-Compliant|N/A', 'Compliant=3|Non-Compliant=0|N/A=0', 'TRUE', 3]
];

// Modal component for confirmations
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>{title}</h3>
        <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              color: '#4b5563',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add a new DiscardConfirmationModal component
const DiscardConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{t('inspections.discardTemplate')}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>
        <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
          {t('inspections.discardTemplateMessage')}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => {
              onClose();
              if (onCancel) onCancel();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              color: '#4b5563',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('inspections.discard')}
          </button>
        </div>
      </div>
    </div>
  );
};

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 4px;
  }
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto;
  align-items: start;
  margin-bottom: 24px;
  gap: 16px 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    gap: 8px;
  }
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    word-wrap: break-word;
    overflow-wrap: break-word;
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
      font-size: 20px;
    }

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: 480px) {
    width: 100%;
    gap: 8px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;

  @media (max-width: 1280px) {
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const HeaderActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const HeaderImportGroup = styled(HeaderActionGroup)`
  background: #f8fbff;
  border-color: #dbe7f3;
`;

const HeaderUtilityGroup = styled(HeaderActionGroup)`
  background: #fbfcfe;
`;

const HeaderSaveGroup = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 999px;
  color: #42546b;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 13px 8px 10px;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  
  @media (max-width: 768px) {
    font-size: 13px;
    min-height: 36px;
    padding: 7px 12px 7px 9px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    min-height: 34px;
    padding: 7px 11px 7px 8px;
  }
  
  &:hover {
    background: #f8fbff;
    border-color: #b7c8dc;
    color: var(--color-navy);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    transform: translateX(-1px);
  }

  &:active {
    transform: translateX(-1px) translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(37, 99, 235, 0.18);
    outline-offset: 2px;
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.25;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e2e8f0;
    color: #334155;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HeaderActionButton = styled(Button)`
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 6px;
  background-color: transparent;
  color: #53657d;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1;

  &:hover {
    background-color: #eef4fb;
    color: #173a5e;
  }

  @media (max-width: 480px) {
    flex: 1 1 calc(50% - 6px);
    padding: 8px 10px;
  }
`;

const FormSection = styled.section`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 4px;
  }
  
  h3 {
    margin-top: 0;
    color: #334155;
    font-size: 18px;
    font-weight: 600;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 17px;
    }

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  > * {
    flex: 1;
    min-width: 250px;
    box-sizing: border-box;

    @media (max-width: 768px) {
      min-width: 200px;
    }

    @media (max-width: 480px) {
      min-width: 0;
      width: 100%;
      flex: 1 1 100%;
    }
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
  }
  
  &:focus {
    border-color: #94a3b8;
    outline: none;
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
    min-height: 80px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
    min-height: 70px;
  }
  
  &:focus {
    border-color: #94a3b8;
    outline: none;
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 13px;
  }
  
  &:focus {
    border-color: #94a3b8;
    outline: none;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #388E3C;
  }

  &:disabled {
    background-color: #A5D6A7;
    cursor: not-allowed;
  }
`;

const PublishButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #90CAF9;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => props.status === 'published' ? '#E8F5E9' : '#FFF3E0'};
  color: ${props => props.status === 'published' ? '#388E3C' : '#F57C00'};
`;

const SaveMessage = styled.div`
  padding: 8px 16px;
  background-color: #E8F5E9;
  color: #388E3C;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddTabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #2196F3;
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const SectionCard = styled.div`
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  padding: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    font-size: 16px;
  }
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: #757575;
  
  p {
    margin: 16px 0;
  }
`;

const PageWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubTitle = styled.p`
  color: #666;
  font-size: 14px;
`;

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormSectionWithTabs = styled(FormSection)`
  padding: 24px 0 0 0;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 0 0 0;
  }

  @media (max-width: 480px) {
    padding: 16px 0 0 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 10px;
    gap: 6px;
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E0E0E0;
  margin-bottom: 16px;
  overflow-x: auto;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    margin-bottom: 12px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  @media (max-width: 480px) {
    margin-bottom: 10px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 4px;

    @media (max-width: 480px) {
      height: 3px;
    }
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

const Tab = styled.div`
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: ${props => props.$active ? 'var(--color-navy)' : '#64748b'};
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  background: ${props => {
    if (props.$isDragging) return '#e2e8f0';
    if (props.$active) return 'rgba(59, 73, 223, 0.15)';
    return 'transparent';
  }};
  backdrop-filter: ${props => props.$active ? 'blur(12px)' : 'none'};
  box-shadow: ${props => props.$active
    ? '0 8px 24px rgba(59, 73, 223, 0.2)'
    : 'none'};
  border-radius: 8px 8px 0 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  box-sizing: border-box;
  margin-right: 6px;

  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: 13px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px 14px;
    font-size: 12px;
    gap: 6px;
  }
  
  &:hover {
    color: var(--color-navy);
    background: rgba(59, 73, 223, 0.05);
    backdrop-filter: blur(4px);
    
    .delete-icon {
      opacity: 1;
    }
  }
  
  .delete-icon {
    opacity: 0;
    transition: opacity 0.2s;
    color: #ef4444;
    font-size: 14px;
    cursor: pointer;
    margin-left: 4px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      font-size: 13px;
    }

    @media (max-width: 480px) {
      font-size: 12px;
      margin-left: 2px;
    }
    
    &:hover {
      color: #b91c1c;
    }
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${props => props.$active ? 'var(--color-navy)' : '#e2e8f0'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 11px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
    font-size: 10px;
    border-radius: 9px;
  }
`;

const TabContent = styled.div`
  padding: 0 24px 24px 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 20px 20px 20px;
  }

  @media (max-width: 480px) {
    padding: 0 12px 12px 12px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SubLevelsContainer = styled.div`
  margin-top: 16px;
`;

const SubLevelItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.isDragging ? '#f1f5f9' : '#f8fafc'};
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.isDragging ? 'var(--color-navy)' : '#e0e0e0'};
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #666;
  
  &:hover {
    color: var(--color-navy);
  }
`;

const SubLevelInput = styled(Input)`
  flex: 1;
`;

const IconButton = styled.button`
  padding: 8px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: fit-content;

  @media (max-width: 768px) {
    padding: 6px;
  }

  @media (max-width: 480px) {
    padding: 4px;
  }

  &:hover {
    background: #f5f7fb;
    color: var(--color-navy);
  }
  
  svg {
    flex-shrink: 0;
    
    @media (max-width: 768px) {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 8px;
    margin-top: 16px;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const TabNavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 8px;
    margin-top: 16px;

    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const DiscardButton = styled(Button)`
  background: #fee2e2;
  color: #b91c1b;
    border: none;
    &:hover {
    background: #fecaca;
  }
`;

const ErrorMessage = styled.span`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
`;

const NestedSubLevelsContainer = styled.div`
  margin-left: 40px;
  margin-top: 8px;
`;

const ExpandCollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: var(--color-navy);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 0;
  color: var(--color-navy);
  gap: 12px;
  
  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--color-navy);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--color-navy);
  border-radius: 50%;
  width: ${props => props.size || '30px'};
  height: ${props => props.size || '30px'};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const QuestionnaireSection = styled(FormSection)`
  margin-top: 20px;
`;

const QuestionItem = styled.div`
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
`;

const QuestionTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const QuestionForm = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const OptionsContainer = styled.div`
  margin-top: 12px;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: ${props => props.mt || '16px'};
  
  &:hover {
    background: #3949ab;
  }
  
  &:disabled {
    background: #9fa8da;
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  
  input {
    cursor: pointer;
  }
  
  &:hover {
    color: var(--color-navy);
  }
`;

const QuestionLibraryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f5ff;
  border: 1px solid #d0e1ff;
  color: var(--color-navy);
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #d0e1ff;
  }
`;

// Custom Library Modal Components
const LibraryModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LibraryModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const LibraryModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const LibraryModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LibraryModalClose = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
    color: var(--color-navy);
  }
`;

const LibraryModalBody = styled.div`
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
`;

const LibrarySearchContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const LibrarySearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  color: var(--color-navy);
  background: #f8fafc;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    background: white;
    box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const LibrarySearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const LibraryQuestionsList = styled.div`
  display: grid;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const LibraryQuestionItem = styled.div`
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: var(--color-navy);
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.15);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LibraryQuestionText = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: var(--color-navy);
  margin-bottom: 8px;
  line-height: 1.4;
`;

const LibraryQuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
`;

const LibraryQuestionType = styled.span`
  background: #f1f5f9;
  color: var(--color-navy);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 12px;
`;

const LibraryQuestionOptions = styled.span`
  color: #64748b;
  font-size: 12px;
`;

const LibraryEmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

const LibraryEmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const LibraryEmptyText = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const LibraryEmptySubtext = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

const LibraryModalFooter = styled.div`
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const LibraryModalButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.variant === 'primary' ? `
    background: var(--color-navy);
    color: white;
    
    &:hover {
      background: #151b4f;
      transform: translateY(-1px);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  `}
`;

// Keep the old modal components for other modals
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  
  @media (max-width: 480px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 0;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    width: 95%;
    max-width: 95%;
    border-radius: 8px;
    max-height: 90vh;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px 12px 0 0;
  
  @media (max-width: 768px) {
    padding: 20px 20px 14px 20px;
    border-radius: 8px 8px 0 0;
  }

  @media (max-width: 480px) {
    padding: 16px 16px 12px 16px;
    border-radius: 0;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-navy);
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    font-size: 17px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 24px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
  
  @media (max-width: 768px) {
    font-size: 20px;
    padding: 4px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    padding: 4px;
  }
  
  &:hover {
    color: var(--color-navy);
    background: #f1f5f9;
  }
  
  svg {
    flex-shrink: 0;
  }
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 16px;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }
`;

const QuestionLibraryList = styled.div`
  display: grid;
  gap: 12px;
`;

const QuestionLibraryItem = styled.div`
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f5ff;
    border-color: #d0e1ff;
  }
`;

const QuestionLibraryItemContent = styled.div`
  margin-bottom: 8px;
`;

const QuestionLibraryItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;
`;

const QuestionLibraryEmpty = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #64748b;
`;

const SaveToLibraryButton = styled.button`
  background: none;
  border: none;
  color: var(--color-navy);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  
  &:hover {
    background: #f0f5ff;
  }
`;

const AutoSaveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.status === 'saving' ? 'var(--color-navy)' : props.status === 'saved' ? '#22c55e' : '#64748b'};
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.status === 'saving' ? '#e8eaf6' : props.status === 'saved' ? '#f0fdf4' : 'transparent'};
`;

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: ${props => props.color || '#e0e0e0'};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
`;

const TreeNodeContainer = styled.div`
  margin-bottom: 8px;
`;

const TreeNode = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.selected && `
    background: #e8f5e9;
    border-color: #66bb6a;
  `}
  
  &:hover {
    background: ${props => props.selected ? '#e8f5e9' : '#f0f5ff'};
    border-color: ${props => props.selected ? '#66bb6a' : '#d0e1ff'};
  }
`;

const TreeNodeContent = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: ${props => props.isParent ? '500' : '400'};
  margin-left: ${props => `${props.level * 20}px`};
  color: #333;
`;

const TreeNodeChildren = styled.div`
  margin-left: 20px;
`;

const QuestionFilter = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${props => props.active ? 'var(--color-navy)' : '#f5f7fb'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? 'var(--color-navy)' : '#e0e0e0'};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#151b4f' : '#e8eaf6'};
  }
`;

const QuestionsSummary = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-navy);
    margin-bottom: 12px;
  }
  
  ul {
    padding-left: 16px;
    margin: 0;
  }
  
  li {
    font-size: 13px;
    margin-bottom: 4px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: var(--color-navy);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f7fb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabMenu = styled.div`
  padding: 0 24px 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuestionPagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation();

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <PaginationContainer>
      <PageInfo>
        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
      </PageInfo>
      <PaginationButtons>
        <PaginationButton
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          {t('common.first')}
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t('common.previous')}
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {t('common.next')}
        </PaginationButton>
        <PaginationButton
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          {t('common.last')}
        </PaginationButton>
      </PaginationButtons>
    </PaginationContainer>
  );
};

// First add the new styled components for the three-column layout

const QuestionTable = styled.div`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    margin-bottom: 16px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
    border-radius: 4px;
  }

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 4px;

    @media (max-width: 480px) {
      height: 3px;
    }
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

const QuestionTableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 200px 100px;
  background: #f1f5f9;
  padding: 12px 16px;
  font-weight: 500;
  color: #334155;
  font-size: 14px;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 35px 1fr 140px 90px;
    padding: 10px 12px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 30px 1fr 100px 100px;
    padding: 8px 6px;
    font-size: 12px;
    gap: 4px;
  }

  > div {
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
`;

const QuestionTableRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 200px 100px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  border: ${props => props.$isDragging ? '1px dashed #64748b' : 'none'};

  @media (max-width: 768px) {
    grid-template-columns: 35px 1fr 140px 90px;
    padding: 10px 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 30px 1fr 100px 100px;
    padding: 8px 6px;
    gap: 4px;
    align-items: flex-start;
  }
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }

  &.drag-over {
    background: #e0f2fe;
    border-top: 2px solid #0284c7;
  }

  > div {
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;
    overflow: hidden;

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }
  
  /* Question text column - allow truncation */
  > div:nth-child(2) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
`;

const DragHandleIcon = styled.div`
  cursor: grab;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  
  &:hover {
    background: #e2e8f0;
    color: #64748b;
  }
`;

const QuestionActionsMenu = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
  
  @media (max-width: 768px) {
    gap: 6px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const QuestionNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #334155;
`;

// Now update the QuestionItemComponent implementation

const QuestionItemComponent = ({
  question,
  questionIndex,
  loading,
  updateQuestion,
  removeQuestion,
  allLevels = [],
  onMoveQuestion,
  sectionIndex,
  isDragging,
  onQuestionDragStart,
  onQuestionDragOver,
  onQuestionDrop,
  onQuestionDragEnd
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [questionFilter, setQuestionFilter] = useState('all');
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);
  const [showScoreEditor, setShowScoreEditor] = useState(false);
  const [totalScore, setTotalScore] = useState(1);
  const [newOption, setNewOption] = useState('');

  // Get dispatch and library items from Redux
  const dispatch = useDispatch();
  const { questions: libraryItems, loading: libraryLoading } = useSelector(state => state.questionLibrary);

  // Calculate total score based on question type and weights
  useEffect(() => {
    let maxScore = 0;
    const scoreValues = Object.values(question.scores || {});

    if (question.answerType === 'yesno' || question.answerType === 'yes_no') {
      const yesKey = t('common.yes');
      const noKey = t('common.no');
      const naKey = t('common.na');
      const yesScore = parseInt(question.scores?.[yesKey] || question.scores?.Yes) || 0;
      const noScore = parseInt(question.scores?.[noKey] || question.scores?.No) || 0;
      const naScore = question.includeNA !== false ? (parseInt(question.scores?.[naKey] || question.scores?.['N/A']) || 0) : 0;
      maxScore = Math.max(yesScore, noScore, naScore);
    } else if (question.answerType === 'compliance') {
      const scores = question.scores || {};
      const complianceScores = [
        scores['Full compliance'] || 0,
        scores['Partial compliance'] || 0,
        scores['Non-compliant'] || 0,
        scores['Not applicable'] || 0
      ];
      maxScore = Math.max(...complianceScores);
    } else if (['multiple', 'multiple_choice', 'select', 'checkbox'].includes(question.answerType)) {
      const optionScores = scoreValues.map(s => Number(s) || 0);
      maxScore = optionScores.length > 0 ? Math.max(...optionScores) : 0;
    } else if (question.scoring?.enabled && scoreValues.length === 0) {
      maxScore = Number(question.scoring?.max) || 0;
    }

    setTotalScore(maxScore);

    // Automatically update the question's scoring.max value
    const newScoring = {
      ...(question.scoring || {}),
      max: maxScore
    };
    updateQuestion({
      ...question,
      scoring: newScoring
    });
  }, [question.scores, question.answerType, question.includeNA, question.scoring?.enabled, question.scoring?.max]);

  // Load library with proper debugging
  const loadLibrary = async () => {
    console.log("QuestionItem: Loading question library...");
    try {
      const result = await dispatch(fetchQuestionLibrary()).unwrap();
      console.log("QuestionItem: Library loaded successfully");
      console.log("QuestionItem: Found", result?.results?.length || 0, "questions");

      if (result?.results?.length === 0) {
        console.log("QuestionItem: Empty library result - might be an API issue");
      }
    } catch (error) {
      console.error("QuestionItem: Error loading library:", error);
    }
  };

  // Load library when modal opens
  useEffect(() => {
    if (showLibraryModal) {
      loadLibrary();
    }
  }, [showLibraryModal]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let updatedQuestion = {
      ...question,
      type: newType,         // Set the type property
      answerType: newType,   // Also set answerType for backward compatibility
      requirementType: question.requirementType || 'mandatory'  // Preserve requirementType
    };

    // Add default options based on type - always reset when changing types
    if (newType === 'multiple_choice') {
      updatedQuestion.options = [t('common.option1'), t('common.option2'), t('common.option3')];
      updatedQuestion.scores = {
        [t('common.option1')]: 0,
        [t('common.option2')]: 0,
        [t('common.option3')]: 0
      };
    } else if (newType === 'compliance') {
      updatedQuestion.options = [
        t('common.fullCompliance'),
        t('common.partialCompliance'),
        t('common.nonCompliant'),
        t('common.notApplicable')
      ];

      // Add default scores for compliance options
      updatedQuestion.scoring = {
        enabled: true,
        max: 2
      };

      updatedQuestion.scores = {
        [t('common.fullCompliance')]: 2,
        [t('common.partialCompliance')]: 1,
        [t('common.nonCompliant')]: 0,
        [t('common.notApplicable')]: 0
      };
    } else if (newType === 'select') {
      updatedQuestion.options = [t('common.option1'), t('common.option2'), t('common.option3')];
      updatedQuestion.scores = {
        [t('common.option1')]: 0,
        [t('common.option2')]: 0,
        [t('common.option3')]: 0
      };
    } else if (newType === 'yesno' || newType === 'yes_no') {
      // Add default scores for Yes/No - N/A is optional (controlled by includeNA property)
      const includeNA = question.includeNA !== undefined ? question.includeNA : true; // Default to true for backward compatibility
      updatedQuestion.options = includeNA
        ? [t('common.yes'), t('common.no'), t('common.na')]
        : [t('common.yes'), t('common.no')];
      updatedQuestion.scoring = {
        enabled: true,
        max: 2 // Change default max score to 2
      };
      updatedQuestion.scores = {
        [t('common.yes')]: 2, // Default Yes score is 2
        [t('common.no')]: 0
      };
      if (includeNA) {
        updatedQuestion.scores[t('common.na')] = 0; // N/A should have 0 score
      }
    } else if (newType === 'checkbox') {
      updatedQuestion.options = [t('common.option1'), t('common.option2'), t('common.option3')];
      // Checkbox doesn't have scoring (no scores)
      updatedQuestion.scores = {};
    } else {
      // Reset options if changing to a type that doesn't need them (text, number, date, signature, media, file)
      updatedQuestion.options = [];
      updatedQuestion.scores = {};
      // Keep scoring if it exists, otherwise initialize it
      if (!updatedQuestion.scoring) {
        updatedQuestion.scoring = {
          enabled: false,
          max: 2 // Change default max score to 2
        };
      }
    }

    // Clear question text if it contains type-specific text that doesn't match the new type
    if (updatedQuestion.text) {
      const currentText = updatedQuestion.text.toLowerCase();
      const newTypeLower = newType.toLowerCase();

      // If current text contains old type references, clear it
      if ((currentText.includes('yes/no') || currentText.includes('yes or no')) && newTypeLower !== 'yesno') {
        updatedQuestion.text = '';
      } else if (currentText.includes('compliance') && newTypeLower !== 'compliance') {
        updatedQuestion.text = '';
      } else if (currentText.includes('multiple choice') && !['multiple', 'multiple_choice', 'checkbox', 'radio', 'dropdown'].includes(newTypeLower)) {
        updatedQuestion.text = '';
      } else if (currentText.includes('date') && newTypeLower !== 'date') {
        updatedQuestion.text = '';
      }
    }

    updateQuestion(updatedQuestion);
  };

  const addOption = () => {
    if (newOption.trim()) {
      const options = [...(question.options || []), newOption.trim()];
      updateQuestion({ ...question, options });
      setNewOption('');
    } else {
      // If no newOption, add empty option like before
      const options = [...(question.options || []), ''];
      updateQuestion({ ...question, options });
    }
  };

  const updateOption = (index, value) => {
    const options = [...(question.options || [])];
    options[index] = value;
    updateQuestion({ ...question, options });
  };

  const removeOption = (index) => {
    const options = (question.options || []).filter((_, i) => i !== index);

    // Also remove score for this option
    const scores = { ...(question.scores || {}) };
    if (options[index] && scores[options[index]]) {
      delete scores[options[index]];
    }

    updateQuestion({ ...question, options, scores });
  };

  // Update option score
  const updateOptionScore = (option, score) => {
    const scores = { ...(question.scores || {}) };
    scores[option] = parseInt(score) || 0;
    updateQuestion({ ...question, scores });
  };

  const normalizeScoreValue = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getDefaultLibraryOptions = (answerType, includeNA = true) => {
    if (answerType === 'yesno' || answerType === 'yes_no') {
      return includeNA === false
        ? [t('common.yes'), t('common.no')]
        : [t('common.yes'), t('common.no'), t('common.na')];
    }

    if (answerType === 'compliance') {
      return [
        t('common.fullCompliance'),
        t('common.partialCompliance'),
        t('common.nonCompliant'),
        t('common.notApplicable')
      ];
    }

    return [];
  };

  const getDefaultScoreForOption = (answerType, option) => {
    const normalizedOption = String(option || '').toLowerCase();

    if (answerType === 'yesno' || answerType === 'yes_no') {
      return normalizedOption === String(t('common.yes')).toLowerCase() || normalizedOption === 'yes' ? 2 : 0;
    }

    if (answerType === 'compliance') {
      if (normalizedOption.includes('full') || normalizedOption === String(t('common.fullCompliance')).toLowerCase()) {
        return 2;
      }
      if (normalizedOption.includes('partial') || normalizedOption === String(t('common.partialCompliance')).toLowerCase()) {
        return 1;
      }
      return 0;
    }

    return 0;
  };

  const normalizeLibraryScoring = (libraryQuestion, answerType) => {
    const includeNA = libraryQuestion.includeNA !== undefined
      ? libraryQuestion.includeNA
      : question.includeNA !== undefined
        ? question.includeNA
        : true;
    const fallbackOptions = getDefaultLibraryOptions(answerType, includeNA);
    const options = (libraryQuestion.options && libraryQuestion.options.length > 0)
      ? libraryQuestion.options
      : fallbackOptions;
    const rawScores = libraryQuestion.scores && typeof libraryQuestion.scores === 'object'
      ? libraryQuestion.scores
      : {};
    const hasStoredScores = Object.keys(rawScores).length > 0;
    const scores = {};

    options.forEach((option) => {
      if (hasStoredScores && rawScores[option] !== undefined) {
        scores[option] = normalizeScoreValue(rawScores[option]);
      } else {
        scores[option] = hasStoredScores ? 0 : getDefaultScoreForOption(answerType, option);
      }
    });

    Object.entries(rawScores).forEach(([key, value]) => {
      if (scores[key] === undefined) {
        scores[key] = normalizeScoreValue(value);
      }
    });

    const scoreValues = Object.values(scores);
    const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues.map(normalizeScoreValue)) : 0;

    return {
      includeNA,
      options,
      scores,
      scoring: {
        ...(libraryQuestion.scoring || {}),
        enabled: Boolean(libraryQuestion.scoring?.enabled || maxScore > 0),
        max: maxScore
      }
    };
  };

  // New function to save question to library
  const saveToLibrary = async () => {
    if (!question.text) {
      toast.error('Please add question text before saving to library');
      return;
    }

    try {
      // Prepare question for library
      const libraryQuestion = {
        text: question.text,
        answerType: question.answerType || 'yesno',
        options: question.options || [],
        scores: question.scores || {},
        scoring: question.scoring || {
          enabled: Boolean(question.scores && Object.keys(question.scores).length > 0),
          max: totalScore || 0
        },
        includeNA: question.includeNA,
        required: !!question.required,
        requirementType: question.requirementType || 'mandatory'
      };

      // Use the addQuestionToLibrary action from the Redux store
      await dispatch(addQuestionToLibrary(libraryQuestion));
      toast.success('Question saved to library');

      // Refresh the library to show the new question
      loadLibrary();
    } catch (error) {
      console.error('Error saving to library:', error);
      toast.error('Failed to save question to library');
    }
  };

  // Function to handle selecting a question from the library
  const handleSelectFromLibrary = (libraryQuestion) => {
    // Map field names from database to component fields
    const answerType = libraryQuestion.answerType || 'yesno';
    const normalizedScoring = normalizeLibraryScoring(libraryQuestion, answerType);
    const updatedQuestion = {
      ...question,
      text: libraryQuestion.text || '',
      // Set both type and answerType to ensure dropdown shows correct value
      type: answerType,
      answerType: answerType,
      options: normalizedScoring.options,
      scores: normalizedScoring.scores,
      scoring: normalizedScoring.scoring,
      includeNA: normalizedScoring.includeNA,
      required: !!libraryQuestion.required,
      requirementType: libraryQuestion.requirementType || 'mandatory'
    };

    console.log("Selected library question:", libraryQuestion);
    console.log("Updated question:", updatedQuestion);

    updateQuestion(updatedQuestion);
    setShowLibraryModal(false);
  };

  // Get answer type label for display
  const getAnswerTypeLabel = (type) => {
    switch (type) {
      case 'yesno': return t('common.yesNo');
      case 'text': return t('common.text');
      case 'number': return t('common.number');
      case 'date': return t('common.date');
      case 'select': return t('common.select');
      case 'multiple_choice': return t('common.multipleChoice');
      case 'multiple': return t('common.multipleChoice'); // Backward compatibility
      case 'checkbox': return t('common.checkbox');
      case 'compliance': return t('common.compliance');
      case 'location': return t('common.location');
      case 'signature': return t('common.signature');
      case 'file': return t('common.fileUpload');
      case 'media': return t('common.mediaUpload');
      case 'slider': return t('common.slider');
      default: return t('common.text');
    }
  };

  // This is the minimized view of the question in the three-column layout
  return (
    <>
      <QuestionTableRow 
        draggable="true"
        $isDragging={isDragging}
        onClick={() => setExpanded(!expanded)}
        onDragStart={(e) => onQuestionDragStart && onQuestionDragStart(e, questionIndex)}
        onDragOver={(e) => onQuestionDragOver && onQuestionDragOver(e, questionIndex)}
        onDrop={(e) => onQuestionDrop && onQuestionDrop(e, sectionIndex, questionIndex)}
        onDragEnd={(e) => onQuestionDragEnd && onQuestionDragEnd(e)}
      >
          <DragHandleIcon
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Move size={18} />
          </DragHandleIcon>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <QuestionNumber style={{
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#64748b',
                transition: 'transform 0.2s ease',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                width: '20px',
                height: '20px'
              }}>
                <ChevronDown size={16} />
              </span>
              <span style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {questionIndex + 1}. {question.text || t('common.untitledQuestion')}
                {question.required !== false && <span style={{ color: 'red', marginLeft: '4px', flexShrink: 0 }}>*</span>}
              </span>
            </QuestionNumber>
            {question.description && (
              <div style={{
                fontSize: '13px',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
                maxWidth: '100%'
              }}>
                {question.description}
              </div>
            )}
          </div>

          <div style={{
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#334155',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
              className="answer-type-badge"
            >
              {question.answerType === 'yesno' && <ToggleLeft size={14} style={{ flexShrink: 0 }} />}
              {question.answerType === 'text' && <FileText size={14} style={{ flexShrink: 0 }} />}
              {(question.answerType === 'multiple' || question.answerType === 'multiple_choice') && <List size={14} style={{ flexShrink: 0 }} />}
              {question.answerType === 'compliance' && <CheckCircle size={14} style={{ flexShrink: 0 }} />}
              {question.answerType === 'date' && <Calendar size={14} style={{ flexShrink: 0 }} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getAnswerTypeLabel(question.answerType)}
              </span>
            </div>
          </div>

          <QuestionActionsMenu onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onMoveQuestion && onMoveQuestion(questionIndex, question);
              }}
              title="Move to another section"
            >
              <ArrowUpRight size={18} />
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              title="Delete Question"
              style={{
                color: '#ef4444',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                flexShrink: 0,
                minWidth: 'fit-content'
              }}
              className="delete-button"
            >
              <Trash2 size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }} className="delete-text">{t('common.delete')}</span>
            </IconButton>
          </QuestionActionsMenu>
        </QuestionTableRow>

      {/* Expanded view when a question is clicked */}
      {expanded && (
        <div style={{
          padding: '20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          width: '100%',
          maxWidth: '100%',
          overflow: 'visible',
          boxSizing: 'border-box'
        }}
          className="question-expanded-container"
        >
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            flexWrap: 'wrap'
          }}
            className="question-expanded-content"
          >
            <div style={{
              flex: '1',
              minWidth: '0',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
              className="question-expanded-main"
            >
              <FormGroup>
                <Label>{t('common.questionText')}</Label>
                <Input
                  type="text"
                  value={question.text || ''}
                  onChange={(e) => updateQuestion({ ...question, text: e.target.value })}
                  placeholder={t('common.enterQuestionText')}
                />
              </FormGroup>

              <FormGroup style={{ marginTop: '16px' }}>
                <Label>{t('common.description')}</Label>
                <TextArea
                  value={question.description || ''}
                  onChange={(e) => updateQuestion({ ...question, description: e.target.value })}
                  placeholder={t('common.enterQuestionDescriptionOrInstructions')}
                  rows={2}
                />
              </FormGroup>

              <FormGroup style={{ marginTop: '16px' }}>
                <Label>{t('common.answerType')}</Label>
                <Select
                  name="type"
                  value={question.type || question.answerType || 'text'}
                  onChange={handleTypeChange}
                  disabled={loading}
                >
                  <option value="text">{t('common.text')}</option>
                  <option value="number">{t('common.number')}</option>
                  <option value="date">{t('common.date')}</option>
                  <option value="yesno">{t('common.yesNo')}</option>
                  <option value="select">{t('common.select')}</option>
                  <option value="multiple_choice">{t('common.multipleChoice')}</option>
                  <option value="checkbox">{t('common.checkbox')}</option>
                  <option value="compliance">{t('common.compliance')}</option>
                  <option value="signature">{t('common.signature')}</option>
                  <option value="media">{t('common.mediaUpload')}</option>
                  <option value="file">{t('common.fileUpload')}</option>
                </Select>
              </FormGroup>


              {/* Add weight input field after answer type */}
              <FormGroup style={{ marginTop: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <Label>{t('common.questionWeight')}</Label>
                <Input
                  type="text"
                  value={question.weight ?? 1}
                  onChange={(e) => {
                    const value = e.target.value;
                    const weight = value === '' ? '' : parseInt(value);
                    // Allow zero or positive values
                    updateQuestion({
                      ...question,
                      weight: value === '' ? '' : (isNaN(weight) ? 0 : Math.max(0, weight))
                    });
                  }}
                  placeholder="Question weight"
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  {t('common.setToZeroForNonScoredQuestions')}
                </div>
              </FormGroup>

              {/* Options editor for multiple choice, select, checkbox or compliance questions */}
              {['multiple_choice', 'compliance', 'select', 'yesno', 'multiple', 'checkbox'].includes(question.answerType) && (
                <FormGroup style={{ marginTop: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <Label>{t('tasks.options')}</Label>
                    {question.answerType !== 'compliance' && question.answerType !== 'yesno' && (
                      <button
                        type="button"
                        onClick={addOption}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: '#334155',
                          fontWeight: '500'
                        }}
                      >
                        <Plus size={14} /> {t('tasks.addOption')}
                      </button>
                    )}
                  </div>

                  {question.answerType !== 'compliance' && question.answerType !== 'yesno' && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <Input
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder={t('tasks.enterOption')}
                        style={{ flex: 1 }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newOption.trim()) {
                              addOption();
                              setNewOption('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newOption.trim()) {
                            addOption();
                            setNewOption('');
                          }
                        }}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--color-navy)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}

                  {/* Options table with scores - matching TaskForm */}
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '14px',
                            borderBottom: '1px solid #e2e8f0'
                          }}>{t('tasks.option')}</th>
                          {question.answerType !== 'checkbox' && (
                            <th style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontSize: '14px',
                              borderBottom: '1px solid #e2e8f0'
                            }}>{t('tasks.score')}</th>
                          )}
                          {question.answerType !== 'compliance' && question.answerType !== 'yesno' && (
                            <th style={{
                              padding: '12px 16px',
                              textAlign: 'center',
                              fontSize: '14px',
                              width: '60px',
                              borderBottom: '1px solid #e2e8f0'
                            }}></th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {(question.options || []).map((option, i) => (
                          <tr key={i} style={{
                            borderBottom: i < (question.options || []).length - 1 ? '1px solid #e2e8f0' : 'none'
                          }}>
                            <td style={{ padding: '12px 16px' }}>
                              {question.answerType === 'compliance' || question.answerType === 'yesno' ? (
                                option
                              ) : (
                                <Input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(i, e.target.value)}
                                  placeholder={`${t('tasks.option')} ${i + 1}`}
                                  style={{ width: '100%', border: 'none', padding: '0', background: 'transparent' }}
                                />
                              )}
                            </td>
                            {question.answerType !== 'checkbox' && (
                              <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                                <Input
                                  type="number"
                                  value={question.scores?.[option] || 0}
                                  onChange={(e) => {
                                    const newScores = { ...(question.scores || {}) };
                                    const value = e.target.value;
                                    newScores[option] = value === '' ? '' : parseInt(value) || 0;

                                    // Calculate new max score
                                    const optionScores = Object.values(newScores).map(s => parseInt(s) || 0);
                                    const maxScore = optionScores.length > 0 ? Math.max(...optionScores) : 0;

                                    updateQuestion({
                                      ...question,
                                      scores: newScores,
                                      scoring: {
                                        ...(question.scoring || {}),
                                        max: maxScore
                                      }
                                    });
                                  }}
                                  style={{
                                    width: '60px',
                                    textAlign: 'center',
                                    padding: '6px 8px'
                                  }}
                                />
                              </td>
                            )}
                            {question.answerType !== 'compliance' && question.answerType !== 'yesno' && (
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeOption(i)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </FormGroup>
              )}

              {/* N/A Toggle for Yes/No questions */}
              {question.answerType === 'yesno' && (
                <FormGroup style={{ marginTop: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="checkbox"
                      id={`includeNA-${questionIndex}`}
                      checked={question.includeNA !== false}
                      onChange={(e) => {
                        const includeNA = e.target.checked;
                        const newOptions = includeNA
                          ? [t('common.yes'), t('common.no'), t('common.na')]
                          : [t('common.yes'), t('common.no')];
                        const newScores = { ...(question.scores || {}) };
                        if (includeNA) {
                          newScores[t('common.na')] = 0;
                        } else {
                          delete newScores[t('common.na')];
                        }
                        updateQuestion({
                          ...question,
                          includeNA,
                          options: newOptions,
                          scores: newScores
                        });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <Label htmlFor={`includeNA-${questionIndex}`} style={{ margin: 0, cursor: 'pointer' }}>
                      {t('tasks.includeNAOption')}
                    </Label>
                  </div>
                </FormGroup>
              )}

              {/* Score editor for Yes/No questions */}
              {question.answerType === 'yesno' && (
                <FormGroup style={{ marginTop: '16px' }}>
                  <Label>{t('common.scoring')}</Label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: question.includeNA !== false ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                    gap: '12px',
                    marginTop: '8px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                    className="scoring-grid"
                  >
                    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                      <Label style={{ fontSize: '13px' }}>{t('common.yesScore')}</Label>
                      <Input
                        type="text"
                        value={question.scores?.[t('common.yes')] ?? question.scores?.Yes ?? 2}
                        onChange={(e) => {
                          const newScores = { ...(question.scores || {}) };
                          const value = e.target.value;
                          const yesKey = t('common.yes');
                          newScores[yesKey] = value === '' ? '' : parseInt(value) || 0;
                          // Also update 'Yes' for backward compatibility
                          newScores.Yes = value === '' ? '' : parseInt(value) || 0;

                          // Calculate new max score
                          const yesScore = parseInt(newScores[yesKey] || newScores.Yes) || 0;
                          const noKey = t('common.no');
                          const noScore = parseInt(newScores[noKey] || newScores.No) || 0;
                          const naKey = t('common.na');
                          const naScore = question.includeNA !== false ? (parseInt(newScores[naKey] || newScores['N/A']) || 0) : 0;
                          const maxScore = Math.max(yesScore, noScore, naScore);

                          updateQuestion({
                            ...question,
                            scores: newScores,
                            scoring: {
                              ...(question.scoring || {}),
                              max: maxScore
                            }
                          });
                        }}
                        placeholder="Enter score"
                      />
                    </div>
                    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                      <Label style={{ fontSize: '13px' }}>{t('common.noScore')}</Label>
                      <Input
                        type="text"
                        value={question.scores?.[t('common.no')] ?? question.scores?.No ?? 0}
                        onChange={(e) => {
                          const newScores = { ...(question.scores || {}) };
                          const value = e.target.value;
                          const noKey = t('common.no');
                          newScores[noKey] = value === '' ? '' : parseInt(value) || 0;
                          // Also update 'No' for backward compatibility
                          newScores.No = value === '' ? '' : parseInt(value) || 0;

                          // Calculate new max score
                          const yesKey = t('common.yes');
                          const yesScore = parseInt(newScores[yesKey] || newScores.Yes) || 0;
                          const noScore = parseInt(newScores[noKey] || newScores.No) || 0;
                          const naKey = t('common.na');
                          const naScore = question.includeNA !== false ? (parseInt(newScores[naKey] || newScores['N/A']) || 0) : 0;
                          const maxScore = Math.max(yesScore, noScore, naScore);

                          updateQuestion({
                            ...question,
                            scores: newScores,
                            scoring: {
                              ...(question.scoring || {}),
                              max: maxScore
                            }
                          });
                        }}
                        placeholder="Enter score"
                      />
                    </div>
                    {question.includeNA !== false && (
                      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <Label style={{ fontSize: '13px' }}>{t('common.naScore')}</Label>
                        <Input
                          type="text"
                          value={question.scores?.[t('common.na')] ?? question.scores?.['N/A'] ?? 0}
                          onChange={(e) => {
                            const newScores = { ...(question.scores || {}) };
                            const value = e.target.value;
                            const naKey = t('common.na');
                            newScores[naKey] = value === '' ? '' : parseInt(value) || 0;

                            // Calculate new max score
                            const yesKey = t('common.yes');
                            const noKey = t('common.no');
                            const yesScore = parseInt(newScores[yesKey] || newScores.Yes) || 0;
                            const noScore = parseInt(newScores[noKey] || newScores.No) || 0;
                            const naScore = parseInt(newScores[naKey]) || 0;
                            const maxScore = Math.max(yesScore, noScore, naScore);

                            updateQuestion({
                              ...question,
                              scores: newScores,
                              scoring: {
                                ...(question.scoring || {}),
                                max: maxScore
                              }
                            });
                          }}
                          placeholder="Enter score"
                        />
                      </div>
                    )}
                  </div>
                </FormGroup>
              )}
            </div>

            <div style={{
              width: '320px',
              minWidth: '320px',
              maxWidth: '320px',
              flexShrink: 0
            }}
              className="question-expanded-sidebar"
            >
              <div style={{
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                marginBottom: '16px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>{t('common.questionSettings')}</div>

                <FormGroup style={{ marginBottom: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <Label>{t('common.requirementType')}</Label>
                  <Select
                    name="requirementType"
                    value={question.requirementType || 'mandatory'}
                    onChange={(e) => updateQuestion({ ...question, requirementType: e.target.value })}
                    disabled={loading}
                  >
                    <option value="mandatory">{t('common.mandatory')}</option>
                    <option value="recommended">{t('common.recommended')}</option>
                  </Select>
                </FormGroup>

                <FormGroup style={{ marginBottom: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <Label>{t('common.required')}</Label>
                  <div style={{ marginTop: '10px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <input
                      type="checkbox"
                      id={`required-settings-${questionIndex}`}
                      name="required"
                      checked={question.required !== false}
                      onChange={(e) => updateQuestion({ ...question, required: e.target.checked })}
                      style={{ marginRight: '8px', flexShrink: 0 }}
                      disabled={loading}
                    />
                    <label htmlFor={`required-settings-${questionIndex}`} style={{
                      fontSize: '14px',
                      color: '#334155',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      flex: 1,
                      minWidth: 0
                    }}>
                      {t('common.thisQuestionIsRequired')}
                    </label>
                  </div>

                </FormGroup>

                {/* <FormGroup style={{ marginBottom: '12px' }}>
                  <Label>{t('common.questionWeight')}</Label>
                  <Input
                    type="number"
                    value={question.weight || 1}
                    onChange={(e) => updateQuestion({ ...question, weight: Math.max(1, parseInt(e.target.value) || 1) })}
                    min="1"
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Multiplies the base score value
              </div>
                </FormGroup> */}

                <FormGroup style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <Label>{t('common.maxPossibleScore')}</Label>
                  <Input
                    type="text"
                    value={totalScore}
                    disabled={true}
                    style={{
                      backgroundColor: '#f8fafc',
                      color: '#64748b',
                      cursor: 'not-allowed',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Auto-calculated"
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '4px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {t('common.automaticallyCalculatedFromScoring')}
                  </div>
                </FormGroup>

                {/* Enhanced Scoring Settings */}
                {question.scoring?.enabled && (
                  <div style={{ marginTop: '16px' }}>
                    {/* <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                      marginBottom: '12px',
                      color: 'var(--color-navy)',
                      fontWeight: '500'
                    }}>
                      <Award size={16} />
                      <span>Detailed Scoring</span>
                    </div> */}


                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                flexDirection: 'column',
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '16px'
              }}>
                <Button
                  type="button"
                  onClick={saveToLibrary}
                  style={{
                    width: '100%',
                    minWidth: '140px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: 'var(--color-navy)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  <Save size={16} />
                  {t('common.saveToLibrary')}
                </Button>

                <Button
                  type="button"
                  onClick={() => setShowLibraryModal(true)}
                  style={{
                    width: '100%',
                    minWidth: '140px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: 'var(--color-navy)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                >
                  <Folder size={16} />
                  {t('common.selectFromLibrary')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal for deleting the question */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          removeQuestion(questionIndex);
          setShowDeleteModal(false);
        }}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Custom Question Library Modal */}
      {showLibraryModal && (
        <LibraryModalOverlay onClick={() => setShowLibraryModal(false)}>
          <LibraryModalContent onClick={e => e.stopPropagation()}>
            <LibraryModalHeader>
              <LibraryModalTitle>
                <Database size={24} />
                Question Library
              </LibraryModalTitle>
              <LibraryModalClose onClick={() => setShowLibraryModal(false)}>
                <X size={20} />
              </LibraryModalClose>
            </LibraryModalHeader>

            <LibraryModalBody>
              <LibrarySearchContainer>
                <LibrarySearchIcon>
                  <Search size={20} />
                </LibrarySearchIcon>
                <LibrarySearchInput
                  type="text"
                  placeholder="Search questions..."
                  value={librarySearchQuery}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                />
              </LibrarySearchContainer>

              {libraryLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader size={32} style={{ marginBottom: '16px', color: 'var(--color-navy)' }} />
                  <div style={{ color: '#64748b', fontSize: '16px' }}>Loading questions...</div>
                </div>
              ) : (
                <LibraryQuestionsList>
                  {libraryItems.length === 0 ? (
                    <LibraryEmptyState>
                      <LibraryEmptyIcon>📚</LibraryEmptyIcon>
                      <LibraryEmptyText>No questions in library</LibraryEmptyText>
                      <LibraryEmptySubtext>Save questions to build your library</LibraryEmptySubtext>
                    </LibraryEmptyState>
                  ) : (
                    libraryItems
                      .filter(q => {
                        if (librarySearchQuery) {
                          return q.text.toLowerCase().includes(librarySearchQuery.toLowerCase());
                        }
                        return true;
                      })
                      .map((libraryQuestion, index) => (
                        <LibraryQuestionItem
                          key={libraryQuestion._id || index}
                          onClick={() => handleSelectFromLibrary(libraryQuestion)}
                        >
                          <LibraryQuestionText>
                            {libraryQuestion.text}
                          </LibraryQuestionText>
                          <LibraryQuestionMeta>
                            <LibraryQuestionType>
                              {getAnswerTypeLabel(libraryQuestion.answerType)}
                            </LibraryQuestionType>
                            {libraryQuestion.options && libraryQuestion.options.length > 0 && (
                              <LibraryQuestionOptions>
                                {libraryQuestion.options.length} options
                              </LibraryQuestionOptions>
                            )}
                          </LibraryQuestionMeta>
                        </LibraryQuestionItem>
                      ))
                  )}
                </LibraryQuestionsList>
              )}
            </LibraryModalBody>

            <LibraryModalFooter>
              <LibraryModalButton onClick={() => setShowLibraryModal(false)}>
                Cancel
              </LibraryModalButton>
            </LibraryModalFooter>
          </LibraryModalContent>
        </LibraryModalOverlay>
      )}
    </>
  );
};

const SubLevelTreeComponent = ({
  subLevels,
  level = 0,
  selectedLevelId,
  onSelectLevel,
  parentNumber = '', // Add parent number parameter for auto-numbering
  searchQuery = ''
}) => {
  const [expandedLevels, setExpandedLevels] = useState({});

  // Toggle level expanded/collapsed
  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  useEffect(() => {
    // Auto-expand all when searching
    if (searchQuery) {
      const expandAll = {};
      const addExpandedIds = (levels) => {
        if (!levels || !Array.isArray(levels)) return;

        levels.forEach(node => {
          const nodeId = node.id || node._id;
          if (nodeId) expandAll[nodeId] = true;
          if (node.subLevels && node.subLevels.length > 0) {
            addExpandedIds(node.subLevels);
          }
        });
      };

      addExpandedIds(subLevels);
      setExpandedLevels(expandAll);
    }
  }, [searchQuery, subLevels]);

  if (!subLevels || !Array.isArray(subLevels)) return null;

  // Filter levels recursively based on search query
  const filterLevels = (levels, query) => {
    if (!query) return levels;

    return levels.filter(node => {
      // Check if current node matches search
      const nameMatch = node.name?.toLowerCase().includes(query.toLowerCase());

      // Check if any children match search
      const hasMatchingChildren =
        node.subLevels &&
        node.subLevels.length > 0 &&
        filterLevels(node.subLevels, query).length > 0;

      return nameMatch || hasMatchingChildren;
    }).map(node => {
      if (node.subLevels && node.subLevels.length > 0) {
        return {
          ...node,
          subLevels: filterLevels(node.subLevels, query)
        };
      }
      return node;
    });
  };

  const filteredLevels = filterLevels(subLevels, searchQuery);

  return (
    <>
      {filteredLevels.map((subLevel, index) => {
        if (!subLevel) return null;

        const levelId = subLevel.id || subLevel._id;
        const hasChildren = subLevel.subLevels && Array.isArray(subLevel.subLevels) && subLevel.subLevels.length > 0;
        const isExpanded = levelId ? expandedLevels[levelId] : false;

        return (
          <div key={levelId || `sublevel-${index}`}>
            <TreeNodeContainer>
              <TreeNode
                selected={selectedLevelId === levelId}
                onClick={() => levelId && onSelectLevel(levelId)}
              >
                {hasChildren && (
                  <div onClick={(e) => {
                    e.stopPropagation();
                    levelId && toggleLevel(levelId);
                  }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                )}
                <TreeNodeContent level={level} isParent={hasChildren}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '24px',
                    height: '24px',
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginRight: '8px'
                  }}>
                    {/* Replace existing numbering with A-style format */}
                    {level === 0
                      ? String.fromCharCode(65 + index) // A, B, C, etc. for top level
                      : parentNumber
                        ? `${parentNumber}${index + 1}`
                        : `${index + 1}`
                    }
                  </span>
                  {subLevel.name || 'Unnamed Level'}
                </TreeNodeContent>
                <BadgeContainer>
                  <Badge color="#3949ab">{subLevel.questionCount || 0}</Badge>
                </BadgeContainer>
              </TreeNode>

              {hasChildren && isExpanded && (
                <div style={{ marginLeft: '20px' }}>
                  <SubLevelTreeComponent
                    subLevels={subLevel.subLevels}
                    level={level + 1}
                    selectedLevelId={selectedLevelId}
                    onSelectLevel={onSelectLevel}
                    parentNumber={level === 0
                      ? `${String.fromCharCode(65 + index)}.`
                      : `${parentNumber}${index + 1}.`
                    }
                    searchQuery={searchQuery}
                  />
                </div>
              )}
            </TreeNodeContainer>
          </div>
        );
      })}
    </>
  );
};

// Component to display activity history
const ActivityHistoryCard = ({ formData, activities = [], isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Calculate section and question counts more accurately
  const countQuestions = () => {
    if (!formData || !formData.pages) return 0;

    let count = 0;
    formData.pages.forEach(page => {
      if (page.sections) {
        page.sections.forEach(section => {
          if (section.questions) {
            count += section.questions.length;
          }
        });
      }
    });
    return count;
  };

  // Calculate sections count
  const countSections = () => {
    if (!formData || !formData.pages) return 0;

    let count = 0;
    formData.pages.forEach(page => {
      if (page.sections) {
        count += page.sections.length;
      }
    });
    return count;
  };

  // Get the last updated time
  const getLastUpdated = () => {
    if (!activities || activities.length === 0) return 'Not available';
    return activities[0].timestamp;
  };

  const isMobile = window.innerWidth <= 480;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '0' : '20px 16px 16px 16px',
      boxSizing: 'border-box'
    }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: isMobile ? '12px 12px 0 0' : '8px',
        width: '550px',
        maxWidth: '100%',
        maxHeight: isMobile ? '85vh' : '85vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isMobile ? '16px' : '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        boxSizing: 'border-box'
      }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--color-navy)',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            flex: 1,
            minWidth: 0
          }}>{t('common.templateActivity')}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#64748b',
              flexShrink: 0,
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px'
            }}
          >
            &times;
          </button>
        </div>

        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '16px', color: 'var(--color-navy)' }}>
            {t('common.currentTemplateInformation')}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>{t('common.name')}:</strong>
              <span style={{ color: '#334155', fontWeight: '500' }}>{formData.name || t('common.untitled')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>{t('common.type')}:</strong>
              <span style={{ color: '#334155', fontWeight: '500' }}>{formData.type || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>{t('common.status')}:</strong>
              <InspectionStatusBadge status={formData.status} style={{ padding: '2px 8px', fontSize: '12px' }}>
                {formData.status === 'draft' ? t('common.draft') : t('common.published')}
              </InspectionStatusBadge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>{t('common.pages')}:</strong>
              <span style={{
                background: '#ebf5ff',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#3b82f6',
                fontWeight: '600',
                fontSize: '12px'
              }}>{formData.pages?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>{t('common.sections')}:</strong>
              <span style={{
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#2563eb',
                fontWeight: '600',
                fontSize: '12px'
              }}>{countSections()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>{t('common.questions')}:</strong>
              <span style={{
                background: '#eef2ff',
                padding: '2px 8px',
                borderRadius: '4px',
                color: '#4338ca',
                fontWeight: '600',
                fontSize: '12px'
              }}>{countQuestions()}</span>
            </div>
            {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <strong>Last Updated:</strong>
              <span style={{ color: '#334155', fontWeight: '500' }}>{getLastUpdated()}</span>
            </div> */}
            <div style={{ borderTop: '1px dashed #e2e8f0', padding: '8px 0 0', marginTop: '4px' }}>
              <strong>{t('common.description')}:</strong>
              <div style={{
                padding: '8px',
                marginTop: '4px',
                background: 'white',
                borderRadius: '4px',
                color: '#334155',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                lineHeight: '1.4'
              }}>{formData.description || t('common.noDescriptionProvided')}</div>
            </div>
          </div>
        </div>

        {/* <h3 style={{ 
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: '#334155'
        }}>
          Activity Log
        </h3>
        
        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((activity, index) => (
              <div 
                key={index}
                style={{
                  padding: '12px',
                  borderLeft: '3px solid #cbd5e1',
                  background: index % 2 === 0 ? '#f8fafc' : 'white',
                  borderRadius: '4px'
                }}
              >
                <div style={{ 
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '22px',
                    backgroundColor: 'var(--color-navy)',
                    color: 'white',
                    borderRadius: '11px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {activities.length - index}
                  </span>
                  {activity.title}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '16px',
            textAlign: 'center', 
            color: '#64748b',
            fontSize: '14px',
            background: '#f1f5f9',
            borderRadius: '6px'
          }}>
            No activity recorded yet.
          </div>
        )} */}
      </div>
    </div>
  );
};

// Custom loading skeleton component
const SkeletonLoader = () => {
  return (
    <LoadingSpinner>
      <div className="spinner"></div>
      <p>Loading template data...</p>
    </LoadingSpinner>
  );
};

// Add MoveQuestionModal component for moving questions between sections
const MoveQuestionModal = ({
  isOpen,
  onClose,
  question,
  questionIndex,
  allPages,
  currentPageIndex,
  currentSectionIndex,
  onMoveQuestion
}) => {
  const { t } = useTranslation();
  const [targetPageIndex, setTargetPageIndex] = useState(currentPageIndex);
  const [targetSectionId, setTargetSectionId] = useState(null);

  // Get sections for the selected page
  const selectedPage = allPages[targetPageIndex] || {};
  const sections = selectedPage.sections || [];

  // Reset section selection when page changes
  useEffect(() => {
    if (isOpen) {
      setTargetPageIndex(currentPageIndex);
      setTargetSectionId(null);
    }
  }, [isOpen, currentPageIndex]);

  if (!isOpen) return null;

  return (
    <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        className="move-question-modal"
      >
        <ModalHeader>
          <ModalTitle>Move Question</ModalTitle>
          <ModalClose onClick={onClose}>
            <X size={20} />
          </ModalClose>
        </ModalHeader>

        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          minHeight: '200px'
        }}
          className="move-question-modal-body"
        >
          <FormGroup style={{ marginBottom: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <Label>Question to Move</Label>
            <div style={{
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#ffffff',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {question?.text || t('common.untitledQuestion')}
            </div>
          </FormGroup>

          <FormGroup style={{ marginBottom: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <Label>Select Target Page</Label>
            <Select
              value={targetPageIndex}
              onChange={(e) => {
                const newPageIndex = parseInt(e.target.value);
                setTargetPageIndex(newPageIndex);
                setTargetSectionId(null); // Reset selected section when changing page
              }}
            >
              {allPages.map((page, idx) => (
                <option key={page.id || idx} value={idx}>
                  {page.name || `Page ${idx + 1}`}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup style={{ marginBottom: '24px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <Label>Select Target Section</Label>
            {sections.length > 0 ? (
              <Select
                value={targetSectionId !== null && targetSectionId !== undefined ? targetSectionId : ''}
                onChange={(e) => setTargetSectionId(e.target.value === '' ? null : e.target.value)}
              >
                <option value="">-- Select a section --</option>
                {sections.map((section, sectionIdx) => (
                  <option key={section.id || sectionIdx} value={sectionIdx}>
                    {section.name || `Section ${sectionIdx + 1}`}
                  </option>
                ))}
              </Select>
            ) : (
              <div style={{
                padding: '12px',
                color: '#64748b',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                No sections available in this page. Please create a section first.
              </div>
            )}
          </FormGroup>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
            className="move-question-modal-actions"
          >
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                if (targetSectionId === null || targetSectionId === undefined || targetSectionId === '') {
                  toast.error('Please select a target section');
                  return;
                }

                // Parse the section index (stored as string in select value)
                const targetSectionIndex = parseInt(targetSectionId);

                if (isNaN(targetSectionIndex) || targetSectionIndex < 0 || targetSectionIndex >= sections.length) {
                  toast.error('Selected section not found');
                  return;
                }

                // Check if moving to the same location
                if (targetPageIndex === currentPageIndex && targetSectionIndex === currentSectionIndex) {
                  toast.info('Question is already in the selected location');
                  onClose();
                  return;
                }

                onMoveQuestion(targetPageIndex, targetSectionIndex);
                onClose();
              }}
              disabled={targetSectionId === null || targetSectionId === undefined || targetSectionId === ''}
            >
              Move Question
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

// Replace the MobilePreviewPanel component
const MobilePreviewPanel = ({
  formData,
  currentSet,
  allQuestions,
  scoreSummary,
  activeSetIndex,
  isOpen = true,
  onClose
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const currentPageRef = useRef(null);

  // Use effect to reset scroll position when page changes
  useEffect(() => {
    if (currentPageRef.current) {
      currentPageRef.current.scrollTop = 0;
    }
    // Reset expanded sections when changing page
    setExpandedSections({});
    setExpandedQuestions({});
  }, [currentPage]);

  const nextPage = () => {
    if (currentPage < (formData.pages.length - 1)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentPageData = () => {
    return formData.pages[currentPage] || { name: '', sections: [] };
  };

  // Toggle section accordion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Toggle question accordion
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Calculate total score for a section
  const calculateSectionScore = (section) => {
    if (!section.questions || section.questions.length === 0) return 0;

    let totalScore = 0;
    section.questions.forEach(question => {
      const questionWeight = question.weight || 0;
      let maxScore = 0;

      if (question.answerType === 'yesno') {
        const yesKey = t('common.yes');
        maxScore = parseInt(question.scores?.[yesKey] || question.scores?.Yes) || 2;
      } else if (question.scores) {
        // Find highest possible score
        const scoreValues = Object.values(question.scores).map(score => Number(score) || 0);
        maxScore = Math.max(...scoreValues);
      }

      totalScore += questionWeight * maxScore;
    });

    return totalScore;
  };

  // Add renderQuestionInput function to handle different question types
  const renderQuestionInput = (question) => {
    switch (question.answerType || question.type) {
      case 'yesno':
        return (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '1 1 calc(33.333% - 8px)', minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>Yes</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '1 1 calc(33.333% - 8px)', minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>No</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '1 1 calc(33.333% - 8px)', minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>N/A</span>
            </label>
          </div>
        );
      case 'text':
        return (
          <input
            type="text"
            placeholder="Enter answer"
            disabled
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        );
      case 'compliance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>Full Compliance</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>Partial Compliance</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>Non-Compliance</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              <input type="radio" name={`question-${question.id || question._id}`} disabled style={{ flexShrink: 0 }} />
              <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>Not Applicable</span>
            </label>
          </div>
        );
      case 'select':
      case 'multiple_choice':
      case 'multiple': // Backward compatibility
      case 'dropdown': // Backward compatibility
        return (
          <select
            disabled
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Select an option</option>
            {(question.options || []).map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {(question.options || ['Option 1', 'Option 2']).map((option, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                <input type="checkbox" disabled style={{ flexShrink: 0 }} />
                <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            disabled
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        );
      case 'signature':
        return (
          <div style={{
            width: '100%',
            maxWidth: '100%',
            padding: '16px',
            border: '2px dashed #e2e8f0',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#64748b',
            boxSizing: 'border-box'
          }}>
            {t('common.signature')}
          </div>
        );
      case 'media':
        return (
          <div style={{
            width: '100%',
            maxWidth: '100%',
            padding: '16px',
            border: '2px dashed #e2e8f0',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#64748b',
            boxSizing: 'border-box'
          }}>
            📷 {t('common.mediaUpload')}
          </div>
        );
      case 'file':
        return (
          <div style={{
            width: '100%',
            maxWidth: '100%',
            padding: '16px',
            border: '2px dashed #e2e8f0',
            borderRadius: '4px',
            textAlign: 'center',
            color: '#64748b',
            boxSizing: 'border-box'
          }}>
            📎 {t('common.fileUpload')}
          </div>
        );
      default:
        return (
          <input
            type="text"
            placeholder="Enter answer"
            disabled
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        );
    }
  };

  // Calculate max score for question
  const calculateQuestionScore = (question) => {
    const weight = question.weight || 0;
    let maxScore = 0;

    if (question.answerType === 'yesno') {
      const yesKey = t('common.yes');
      maxScore = parseInt(question.scores?.[yesKey] || question.scores?.Yes) || 2;
    } else if (question.scores) {
      // Find highest possible score
      const scoreValues = Object.values(question.scores).map(score => Number(score) || 0);
      maxScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
    }

    return weight * maxScore;
  };

  const currentPageData = getCurrentPageData();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '375px',
      maxWidth: '100vw',
      backgroundColor: '#f1f5f9',
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      borderLeft: '1px solid #e2e8f0',
      overflowX: 'hidden',
      overflowY: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Mobile emulator header */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '12px',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
        </div>
        <div style={{ color: 'white', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>{t('common.mobilePreview')}</div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            flexShrink: 0,
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* App header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{ fontWeight: '600', fontSize: '18px', wordWrap: 'break-word', overflowWrap: 'break-word', minWidth: 0, flex: 1 }}>MIRSAT</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <User size={16} />
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }}></div>
        </div>
      </div>

      {/* Template header */}
      <div style={{
        padding: '16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {formData.name || t('common.untitledTemplate')}
        </h2>
        <div style={{ fontSize: '13px', color: '#64748b', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {formData.description || t('common.noDescriptionProvided')}
        </div>
      </div>

      {/* Page navigation */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          style={{
            background: 'none',
            border: 'none',
            color: currentPage === 0 ? '#cbd5e1' : '#1e40af',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div style={{ fontWeight: '500', wordWrap: 'break-word', overflowWrap: 'break-word', textAlign: 'center', flex: 1, minWidth: 0, padding: '0 8px' }}>
          {formData.pages.length > 0 ? `${t('common.page')} ${currentPage + 1} ${t('common.of')} ${formData.pages.length}` : t('common.noPages')}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage >= formData.pages.length - 1}
          style={{
            background: 'none',
            border: 'none',
            color: currentPage >= formData.pages.length - 1 ? '#cbd5e1' : '#1e40af',
            cursor: currentPage >= formData.pages.length - 1 ? 'not-allowed' : 'pointer',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Page content */}
      <div
        ref={currentPageRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px',
          height: 'calc(100vh - 180px)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            {currentPageData.name || `${t('common.page')} ${currentPage + 1}`}
          </h3>
          {currentPageData.description && (
            <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              {currentPageData.description}
            </p>
          )}
        </div>

        {/* Sections as accordions */}
        {currentPageData.sections && currentPageData.sections.map((section, sectionIndex) => {
          const sectionId = `section-${currentPage}-${sectionIndex}`;
          const sectionScore = calculateSectionScore(section);
          const isExpanded = expandedSections[sectionId] || false;

          return (
            <div key={sectionId} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Section header */}
              <div
                onClick={() => toggleSection(sectionId)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: isExpanded ? '#f8fafc' : 'white',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', flex: 1, minWidth: 0 }}>
                      {section.name || `${t('common.section')} ${sectionIndex + 1}`}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '12px',
                      fontWeight: 'normal',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {section.questions?.length || 0} Q
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  {/* Section score */}
                  <div style={{
                    fontWeight: '600',
                    color: '#1e40af',
                    backgroundColor: '#eff6ff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  }}>
                    {sectionScore} {t('common.pts')}
                  </div>

                  {/* Accordion toggle */}
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Section content (only visible when expanded) */}
              {isExpanded && (
                <div style={{ padding: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  {section.description && (
                    <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                      {section.description}
                    </p>
                  )}

                  {/* Questions as sub-accordions */}
                  {section.questions && section.questions.map((question, questionIndex) => {
                    const questionId = `question-${currentPage}-${sectionIndex}-${questionIndex}`;
                    const isQuestionExpanded = expandedQuestions[questionId] || false;
                    const questionScore = calculateQuestionScore(question);

                    return (
                      <div key={questionId} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        marginBottom: questionIndex < section.questions.length - 1 ? '12px' : '0',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}>
                        {/* Question header */}
                        <div
                          onClick={() => toggleQuestion(questionId)}
                          style={{
                            padding: '12px',
                            backgroundColor: isQuestionExpanded ? '#f8fafc' : 'white',
                            borderBottom: isQuestionExpanded ? '1px solid #e2e8f0' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            fontWeight: '500',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flex: 1,
                            minWidth: 0
                          }}>
                            <span style={{
                              minWidth: '24px',
                              height: '24px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '600',
                              flexShrink: 0
                            }}>
                              {questionIndex + 1}
                            </span>
                            <span style={{ flex: 1, minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                              {question.text || t('common.untitledQuestion')}
                              {question.required !== false && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <div style={{
                              fontWeight: '500',
                              color: '#0e7490',
                              backgroundColor: '#ecfeff',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              whiteSpace: 'nowrap'
                            }}>
                              {questionScore} {t('common.pts')}
                            </div>
                            {isQuestionExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>

                        {/* Question content */}
                        {isQuestionExpanded && (
                          <div style={{ padding: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                            {question.description && (
                              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                                {question.description}
                              </div>
                            )}

                            {/* Answer input */}
                            <div style={{ marginBottom: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                              {renderQuestionInput(question)}
                            </div>

                            {/* Scoring details */}
                            <div style={{
                              backgroundColor: '#f8fafc',
                              padding: '10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              width: '100%',
                              maxWidth: '100%',
                              boxSizing: 'border-box'
                            }}>
                              <div style={{ fontWeight: '600', marginBottom: '4px', color: '#334155' }}>
                                {t('common.scoring')}
                              </div>

                              {question.answerType === 'yesno' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  <div style={{
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {t('common.yes')}: {question.scores?.[t('common.yes')] || question.scores?.Yes || 0} {t('common.pts')}
                                  </div>
                                  <div style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {t('common.no')}: {question.scores?.[t('common.no')] || question.scores?.No || 0} {t('common.pts')}
                                  </div>
                                  {question.includeNA !== false && (
                                    <div style={{
                                      backgroundColor: '#f1f5f9',
                                      color: '#475569',
                                      padding: '4px 8px',
                                      borderRadius: '4px'
                                    }}>
                                      {t('common.na')}: {question.scores?.[t('common.na')] || question.scores?.['N/A'] || 0} {t('common.pts')}
                                    </div>
                                  )}
                                </div>
                              )}

                              {question.answerType === 'compliance' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  <div style={{
                                    backgroundColor: '#dcfce7',
                                    color: '#166534',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {t('common.fullCompliance')}: {question.scores?.['Full compliance'] || 0} {t('common.pts')}
                                  </div>
                                  <div style={{
                                    backgroundColor: '#fef9c3',
                                    color: '#854d0e',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {t('common.partialCompliance')}: {question.scores?.['Partial compliance'] || 0} {t('common.pts')}
                                  </div>
                                  <div style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {t('common.nonCompliant')}: {question.scores?.['Non-compliant'] || 0} {t('common.pts')}
                                  </div>
                                </div>
                              )}

                              {question.weight && question.weight > 1 && (
                                <div style={{
                                  marginTop: '8px',
                                  borderTop: '1px dashed #e2e8f0',
                                  paddingTop: '8px',
                                  fontSize: '12px',
                                  color: '#475569'
                                }}>
                                  {t('common.weightMultiplier')}: {question.weight}x
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {currentPageData.sections && currentPageData.sections.length === 0 && (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#94a3b8',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ marginBottom: '8px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
              <FileText size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
              <div style={{ wordWrap: 'break-word', overflowWrap: 'break-word', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>No sections found on this page</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ... existing code ...

// Add styled components needed for the InspectionLevelForm component just before it
const InspectionFormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 10px;
    flex-direction: column;
  }
  
  > * {
    flex: 1;
    min-width: 250px;
    box-sizing: border-box;

    @media (max-width: 768px) {
      min-width: 200px;
    }

    @media (max-width: 480px) {
      min-width: 0;
      width: 100%;
      flex: 1 1 100%;
    }
  }
`;

const InspectionFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const InspectionFormSection = styled.section`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 4px;
  }
  
  h3 {
    margin-top: 0;
    color: #334155;
    font-size: 18px;
    font-weight: 600;
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 17px;
    }

    @media (max-width: 480px) {
      font-size: 16px;
    }
  }
`;

const InspectionSaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 18px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(76, 175, 80, 0.25);

  &:hover {
    background-color: #388E3C;
  }

  &:disabled {
    background-color: #A5D6A7;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const InspectionPublishButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #90CAF9;
    cursor: not-allowed;
  }
`;

const InspectionStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 16px;
  background-color: ${props => props.status === 'draft' ? '#FEF3C7' : '#DCFCE7'};
  color: ${props => props.status === 'draft' ? '#B45309' : '#166534'};
  border: 1px solid ${props => props.status === 'draft' ? '#FCD34D' : '#86EFAC'};
  width: 150px;
  white-space: nowrap;
`;

const InspectionSaveMessage = styled.div`
  padding: 8px 16px;
  background-color: #E8F5E9;
  color: #388E3C;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InspectionAddTabButton = styled(AddTabButton)`
  padding: 12px 16px;
  color: var(--color-navy);
  &:hover {
    background-color: rgba(59, 73, 223, 0.1);
  }
`;

const InspectionSectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const InspectionSectionCard = styled.div`
  background-color: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
`;

const InspectionSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h4 {
    margin: 0;
    font-size: 16px;
  }
`;

const InspectionQuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const InspectionEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: #757575;
  
  p {
    margin: 16px 0;
  }
`;

// Add these styled component definitions after other styled components and before the component functions

const PagesQuestionsContent = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const SectionsWrapper = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    margin-top: 16px;
  }

  @media (max-width: 480px) {
    margin-top: 12px;
  }
  
  h4 {
    margin-bottom: 16px;
    font-size: 16px;
    color: var(--color-navy);
    word-wrap: break-word;
    overflow-wrap: break-word;

    @media (max-width: 768px) {
      font-size: 15px;
      margin-bottom: 12px;
    }

    @media (max-width: 480px) {
      font-size: 14px;
      margin-bottom: 10px;
    }
  }
`;

const SectionBox = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  background: ${props => props.active ? '#f8fafc' : 'white'};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.active ? 'var(--color-navy)' : '#c0c0c0'};
  }
`;

const TabSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background: ${props => props.active ? '#f1f5f9' : 'white'};
  border-bottom: ${props => props.active ? '1px solid #e0e0e0' : 'none'};
`;

const TabSectionTitle = styled.h5`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-navy);
`;

const SectionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SectionContent = styled.div`
  padding: 16px;
`;

const QuestionsContainer = styled.div`
  margin-top: 16px;
  
  h5 {
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--color-navy);
    font-weight: 500;
  }
`;

const QuestionBox = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const TabQuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e0e0e0;
`;

const TabQuestionTitle = styled.h6`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
`;

const TabQuestionActions = styled.div`
  display: flex;
  gap: 8px;
`;

const QuestionContent = styled.div`
  padding: 12px;
`;

const TabEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 30px 20px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
    border-radius: 4px;
  }
  
  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 28px;
      height: 28px;
    }

    @media (max-width: 480px) {
      width: 24px;
      height: 24px;
    }
  }

  p {
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    min-width: 0;

    @media (max-width: 768px) {
      font-size: 13px;
    }

    @media (max-width: 480px) {
      font-size: 12px;
    }
  }

  button {
    @media (max-width: 480px) {
      width: 100%;
      max-width: 100%;
      justify-content: center;
    }
  }
`;

// Add these after other styled components and before the QuestionItemComponent definition
const QuestionScoringContainer = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const QuestionScoreTitle = styled.h6`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Add these section tab styled components
const SectionTabsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    margin-bottom: 10px;
  }

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 4px;

    @media (max-width: 480px) {
      height: 3px;
    }
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

const SectionTab = styled.div`
  padding: 8px 18px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.$active ? 'var(--color-navy)' : '#64748b'};
  font-weight: ${props => props.$active ? '700' : '500'};
  background: ${props => {
    if (props.$isDragging) return '#e2e8f0';
    if (props.$active) return 'rgba(59, 73, 223, 0.15)';
    return 'transparent';
  }};
  backdrop-filter: ${props => props.$active ? 'blur(10px)' : 'none'};
  box-shadow: ${props => props.$active
    ? '0 4px 12px rgba(59, 73, 223, 0.25)'
    : 'none'};
  border-radius: 6px 6px 0 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  border: ${props => props.$isDragging ? '1px dashed #64748b' : 'none'};
  margin-right: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    padding: 6px 14px;
    font-size: 13px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
    gap: 6px;
  }
  
  &:hover {
    color: var(--color-navy);
    background: rgba(59, 73, 223, 0.08);
    
    .delete-icon {
      opacity: 1;
    }
  }
  
  .delete-icon {
    opacity: 0;
    transition: opacity 0.2s;
    color: #ef4444;
    font-size: 14px;
    cursor: pointer;
    margin-left: 4px;
    flex-shrink: 0;

    @media (max-width: 768px) {
      font-size: 13px;
    }

    @media (max-width: 480px) {
      font-size: 12px;
      margin-left: 2px;
    }
    
    &:hover {
      color: #b91c1c;
    }
  }
`;

const SectionAddButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-navy);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Styled component for the priority badge
const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => {
    switch (props.priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#94A3B8';
    }
  }};
`;

// Styled component for the requirement type badge
const RequirementBadge = styled.span`
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${props => props.type === 'mandatory' ? '#FEE2E2' : '#DBEAFE'};
  color: ${props => props.type === 'mandatory' ? '#B91C1C' : '#1E40AF'};
  border: 1px solid ${props => props.type === 'mandatory' ? '#FECACA' : '#BFDBFE'};
  margin-left: 4px;
`;

const InspectionLevelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { assetTypes } = useSelector(state => state.assetTypes || { assetTypes: [] });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: 'draft',
    pages: []
  });
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const [isMoveQuestionModalOpen, setIsMoveQuestionModalOpen] = useState(false);

  // New confirmation modals for page and section deletion
  const [showPageDeleteModal, setShowPageDeleteModal] = useState(false);
  const [showSectionDeleteModal, setShowSectionDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [activities, setActivities] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic-info');
  const [activeSectionTab, setActiveSectionTab] = useState(0); // For section tabs
  const [questionPage, setQuestionPage] = useState(1);
  const [saveError, setSaveError] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const templateStats = useMemo(() => getTemplateSizeStats(formData), [formData.pages]);

  const getTemplateLimitError = useCallback((stats = templateStats) => {
    if (getTemplateLimitViolations(stats).length === 0) return '';

    return t('inspections.templateLimitExceeded', {
      maxPages: TEMPLATE_SIZE_LIMITS.pages,
      maxSections: TEMPLATE_SIZE_LIMITS.sections,
      maxQuestions: TEMPLATE_SIZE_LIMITS.questions,
      pages: stats.pages || 0,
      sections: stats.sections || 0,
      questions: stats.questions || 0
    });
  }, [t, templateStats]);

  const saveTemplateDraft = useCallback((data) => {
    try {
      const draftStats = getTemplateSizeStats(data);
      if (getTemplateLimitViolations(draftStats, LOCAL_STORAGE_DRAFT_SIZE_LIMITS).length > 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return false;
      }

      const serializedDraft = JSON.stringify(data);

      if (serializedDraft.length > LOCAL_STORAGE_DRAFT_MAX_CHARACTERS) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return false;
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, serializedDraft);
      return true;
    } catch (error) {
      console.error('Error saving template draft:', error);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (cleanupError) {
        console.error('Error clearing template draft:', cleanupError);
      }
      return false;
    }
  }, []);

  const autoSaveToLocalStorage = useMemo(() => (
    debounce((data) => {
      saveTemplateDraft(data);
    }, 2000)
  ), [saveTemplateDraft]);

  // Refs
  const hasShownRestoreToast = useRef(false);
  const importInputRef = useRef(null);
  const excelImportInputRef = useRef(null);
  const activePage = formData.pages?.[activePageIndex] || null;
  const activeSection = activePage?.sections?.[activeSectionTab] || null;
  const activeSectionQuestions = activeSection?.questions || [];
  const totalQuestionPages = Math.max(1, Math.ceil(activeSectionQuestions.length / QUESTION_PAGE_SIZE));
  const clampedQuestionPage = Math.min(questionPage, totalQuestionPages);
  const questionPageStartIndex = (clampedQuestionPage - 1) * QUESTION_PAGE_SIZE;
  const visibleActiveSectionQuestions = activeSectionQuestions.slice(
    questionPageStartIndex,
    questionPageStartIndex + QUESTION_PAGE_SIZE
  );

  useEffect(() => {
    setQuestionPage(1);
  }, [activePageIndex, activeSectionTab]);

  useEffect(() => {
    const sectionCount = formData.pages?.[activePageIndex]?.sections?.length || 0;
    if (sectionCount === 0 && activeSectionTab !== 0) {
      setActiveSectionTab(0);
      return;
    }

    if (sectionCount > 0 && activeSectionTab > sectionCount - 1) {
      setActiveSectionTab(sectionCount - 1);
    }
  }, [activePageIndex, activeSectionTab, formData.pages]);

  useEffect(() => {
    setQuestionPage(prevPage => Math.min(Math.max(prevPage, 1), totalQuestionPages));
  }, [totalQuestionPages]);

  useEffect(() => () => {
    autoSaveToLocalStorage.cancel();
  }, [autoSaveToLocalStorage]);

  useEffect(() => {
    // Fetch asset types for the dropdown
    dispatch(fetchAssetTypes());

    if (id) {
      loadTemplate();
    } else {
      // Check for saved data in localStorage first - always restore if exists
      try {
        const savedTemplate = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedTemplate) {
          const parsedTemplate = JSON.parse(savedTemplate);
          // Ensure parsed template has required structure
          if (parsedTemplate && (parsedTemplate.name !== undefined || parsedTemplate.pages)) {
            if (getTemplateLimitViolations(getTemplateSizeStats(parsedTemplate)).length > 0) {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } else {
              setFormData(parsedTemplate);
              // Show toast only once per page load
              if (!hasShownRestoreToast.current) {
                hasShownRestoreToast.current = true;
                toast.success(t('inspections.welcomeBackRestored'), {
                  duration: 3000,
                  style: { background: '#10B981', color: 'white' }
                });
              }
              return; // Exit early after restoring
            }
          }
        }
        // Initialize with one empty page only if no saved data exists or invalid data
        setFormData(prevData => {
          const pages = prevData.pages && prevData.pages.length > 0 ? prevData.pages : [{
            name: 'Page 1',
            description: '',
            sections: [{
              id: uuidv4(),
              name: 'Section 1',
              description: '',
              order: 0,
              questions: []
            }]
          }];

          // Ensure all sections have IDs
          pages.forEach(page => {
            if (page.sections) {
              page.sections.forEach((section, idx) => {
                if (!section.id && !section._id) {
                  section.id = section.name ? `section-${section.name.replace(/\s+/g, '-').toLowerCase()}-${idx}` : uuidv4();
                }
              });
            }
          });

          return {
            name: prevData.name || '',
            description: prevData.description || '',
            type: prevData.type || '',
            status: prevData.status || 'draft',
            pages: pages
          };
        });
      } catch (error) {
        console.error('Error loading from local storage:', error);
        // Initialize with one empty page on error
        setFormData(prevData => ({
          name: prevData.name || '',
          description: prevData.description || '',
          type: prevData.type || '',
          status: prevData.status || 'draft',
          pages: [{
            name: 'Page 1',
            description: '',
            sections: [{
              id: uuidv4(),
              name: 'Section 1',
              description: '',
              order: 0,
              questions: []
            }]
          }]
        }));
      }
    }
  }, [id, dispatch, t]);

  const loadTemplate = async () => {
    try {
      setLoading(true);

      // Use the centralized API service
      const response = await api.get(`/inspection/${id}`);

      const templateData = response.data;
      console.log('Loaded template data:', templateData);

      // Transform the data into the format expected by the form
      let formattedData = {
        name: templateData.name,
        description: templateData.description,
        type: templateData.type,
        status: templateData.status || 'draft',
        pages: []
      };

      // If we have the new pages format
      if (templateData.pages && templateData.pages.length > 0) {
        formattedData.pages = templateData.pages.map((page, pageIndex) => {
          // Sort sections by order to ensure correct display order
          const sortedSections = page.sections
            ? [...page.sections].sort((a, b) => {
              const orderA = a.order !== undefined ? a.order : 0;
              const orderB = b.order !== undefined ? b.order : 0;
              return orderA - orderB;
            }).map((section, sectionIndex) => ({
              ...section,
              // Ensure every section has a stable ID
              id: section._id || section.id || uuidv4(),
              order: section.order !== undefined ? section.order : sectionIndex,
              questions: section.questions ? section.questions.map(q => ({
                ...q,
                id: q._id || q.id,
                required: q.required !== undefined ? q.required : true // Ensure required field is preserved
              })) : []
            }))
            : [];

          if (sortedSections.length === 0) {
            sortedSections.push({
              id: uuidv4(),
              name: 'Section 1',
              description: '',
              order: 0,
              questions: []
            });
          }

          return {
            ...page,
            id: page._id || page.id,
            order: page.order !== undefined ? page.order : pageIndex,
            sections: sortedSections
          };
        });
      }
      // If we have the old subLevels format
      else if (templateData.subLevels && templateData.subLevels.length > 0) {
        // Convert subLevels to pages and sections
        formattedData.pages = templateData.subLevels.map((page, pageIndex) => {
          // Sort sections by order to ensure correct display order
          const sortedSections = page.subLevels
            ? [...page.subLevels].sort((a, b) => {
              const orderA = a.order !== undefined ? a.order : 0;
              const orderB = b.order !== undefined ? b.order : 0;
              return orderA - orderB;
            }).map((section, sectionIndex) => {
              return {
                // Ensure every section has a stable ID
                id: section._id || section.id || uuidv4(),
                name: section.name,
                description: section.description || 'No description provided',
                order: section.order !== undefined ? section.order : sectionIndex,
                questions: section.questions ? section.questions.map(q => ({
                  ...q,
                  id: q._id || q.id,
                  required: q.required !== undefined ? q.required : true // Ensure required field is preserved
                })) : []
              };
            })
            : [];

          if (sortedSections.length === 0) {
            sortedSections.push({
              id: uuidv4(),
              name: 'Section 1',
              description: '',
              order: 0,
              questions: []
            });
          }

          return {
            id: page._id || page.id,
            name: page.name,
            description: page.description || 'No description provided',
            order: page.order || pageIndex,
            sections: sortedSections
          };
        });
      }
      // If we don't have either structure, create an empty pages structure
      else {
        formattedData.pages = [];
      }

      console.log('Formatted data for form:', formattedData);

      // Ensure all sections have stable IDs - create new objects to avoid mutation
      formattedData.pages = formattedData.pages.map(page => ({
        ...page,
        sections: page.sections ? page.sections.map((section, idx) => ({
          ...section,
          id: section.id || section._id || `sect-${idx}-${uuidv4().substring(0, 8)}` // Ensure stable ID
        })) : []
      }));

      setFormData(formattedData);
      setActivities(templateData.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading template:', error);
      setSaveError(`Error loading template: ${error.response?.data?.error?.message || error.message}`);
      setLoading(false);
    }
  };

  const isPlainImportObject = (value) => (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );

  const toTrimmedString = (value) => (
    typeof value === 'string' ? value.trim() : ''
  );

  const normalizeNumber = (value, fallback) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  };

  const normalizeImportedScoring = (scoring) => {
    if (!isPlainImportObject(scoring)) return undefined;

    const normalized = {
      enabled: Boolean(scoring.enabled),
      max: normalizeNumber(scoring.max, 0)
    };

    if (isPlainImportObject(scoring.weights)) {
      normalized.weights = scoring.weights;
    }

    return normalized;
  };

  const normalizeImportedTemplate = (template) => {
    if (!isPlainImportObject(template)) {
      throw new Error(t('inspections.importErrorObjectRequired'));
    }

    const templateName = toTrimmedString(template.name);
    if (!templateName) {
      throw new Error(t('inspections.importErrorTemplateNameRequired'));
    }

    if (!Array.isArray(template.pages) || template.pages.length === 0) {
      throw new Error(t('inspections.importErrorPagesRequired'));
    }

    const stats = {
      pages: 0,
      sections: 0,
      questions: 0
    };

    const pages = template.pages.map((page, pageIndex) => {
      if (!isPlainImportObject(page)) {
        throw new Error(t('inspections.importErrorInvalidPage', { index: pageIndex + 1 }));
      }

      const pageName = toTrimmedString(page.name);
      if (!pageName) {
        throw new Error(t('inspections.importErrorPageNameRequired', { index: pageIndex + 1 }));
      }

      if (!Array.isArray(page.sections) || page.sections.length === 0) {
        throw new Error(t('inspections.importErrorSectionsRequired', { page: pageName }));
      }

      stats.pages += 1;

      return {
        name: pageName,
        description: toTrimmedString(page.description),
        order: normalizeNumber(page.order, pageIndex),
        sections: page.sections.map((section, sectionIndex) => {
          if (!isPlainImportObject(section)) {
            throw new Error(t('inspections.importErrorInvalidSection', {
              page: pageName,
              index: sectionIndex + 1
            }));
          }

          const sectionName = toTrimmedString(section.name);
          if (!sectionName) {
            throw new Error(t('inspections.importErrorSectionNameRequired', {
              page: pageName,
              index: sectionIndex + 1
            }));
          }

          if (section.questions !== undefined && !Array.isArray(section.questions)) {
            throw new Error(t('inspections.importErrorQuestionsArray', {
              page: pageName,
              section: sectionName
            }));
          }

          const questions = section.questions || [];
          stats.sections += 1;

          return {
            id: uuidv4(),
            name: sectionName,
            description: toTrimmedString(section.description),
            order: normalizeNumber(section.order, sectionIndex),
            questions: questions.map((question, questionIndex) => {
              if (!isPlainImportObject(question)) {
                throw new Error(t('inspections.importErrorInvalidQuestion', {
                  page: pageName,
                  section: sectionName,
                  index: questionIndex + 1
                }));
              }

              const questionText = toTrimmedString(question.text);
              if (!questionText) {
                throw new Error(t('inspections.importErrorQuestionTextRequired', {
                  page: pageName,
                  section: sectionName,
                  index: questionIndex + 1
                }));
              }

              const { _id, id, scoring: rawScoring, scores: rawScores, ...questionData } = question;
              const scoring = normalizeImportedScoring(rawScoring);
              stats.questions += 1;

              return {
                ...questionData,
                id: uuidv4(),
                text: questionText,
                description: toTrimmedString(question.description),
                answerType: toTrimmedString(question.answerType) || toTrimmedString(question.type) || 'text',
                required: question.required !== undefined ? Boolean(question.required) : true,
                options: Array.isArray(question.options) ? question.options.map(option => String(option).trim()).filter(Boolean) : [],
                scores: isPlainImportObject(rawScores) ? rawScores : {},
                ...(scoring ? { scoring } : {})
              };
            })
          };
        })
      };
    });

    return {
      template: {
        name: templateName,
        description: toTrimmedString(template.description),
        type: toTrimmedString(template.type),
        status: ['active', 'inactive', 'draft', 'archived'].includes(template.status) ? template.status : 'draft',
        pages
      },
      stats
    };
  };

  const applyImportedTemplate = (template) => {
    const { template: normalizedTemplate, stats } = normalizeImportedTemplate(template);
    const limitError = getTemplateLimitError(stats);

    if (limitError) {
      throw new Error(limitError);
    }

    setFormData(normalizedTemplate);
    setActivePageIndex(0);
    setActiveSectionTab(0);
    setQuestionPage(1);
    setActiveTab('basic-info');
    setSaveError('');
    saveTemplateDraft(normalizedTemplate);
    toast.success(t('inspections.templateImportedSuccessfully', stats));
  };

  const handleImportButtonClick = () => {
    if (importInputRef.current) {
      importInputRef.current.value = '';
      importInputRef.current.click();
    }
  };

  const handleExcelImportButtonClick = () => {
    if (excelImportInputRef.current) {
      excelImportInputRef.current.value = '';
      excelImportInputRef.current.click();
    }
  };

  const getExcelCellValue = (row, headerMap, columnName) => {
    const columnIndex = headerMap.get(normalizeTemplateImportExcelHeader(columnName));
    if (columnIndex === undefined) return '';
    return toTemplateImportExcelCellString(row[columnIndex]);
  };

  const buildExcelRowError = (rowNumber, columnName, key, params = {}) => (
    t(key, { row: rowNumber, column: columnName, ...params })
  );

  const throwExcelValidationErrors = (errors) => {
    const visibleErrors = errors.slice(0, 5).join(' ');
    const remainingCount = errors.length - 5;
    const remaining = remainingCount > 0
      ? t('inspections.importErrorExcelMoreErrors', { count: remainingCount })
      : '';

    throw new Error(t('inspections.importErrorExcelValidationSummary', {
      count: errors.length,
      errors: visibleErrors,
      remaining
    }));
  };

  const parseExcelBoolean = (value, rowNumber, columnName, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase();
    if (TEMPLATE_IMPORT_BOOLEAN_TRUE_VALUES.has(normalizedValue)) return true;
    if (TEMPLATE_IMPORT_BOOLEAN_FALSE_VALUES.has(normalizedValue)) return false;

    errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelInvalidBoolean', { value }));
    return undefined;
  };

  const parseExcelNumber = (value, rowNumber, columnName, errors) => {
    if (!value) return undefined;

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelInvalidNumber', { value }));
      return undefined;
    }

    return numberValue;
  };

  const parseExcelStatus = (value, rowNumber, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase();
    if (TEMPLATE_IMPORT_STATUS_VALUES.includes(normalizedValue)) return normalizedValue;

    errors.push(buildExcelRowError(rowNumber, 'Template Status', 'inspections.importErrorExcelInvalidStatus', {
      value,
      allowed: TEMPLATE_IMPORT_STATUS_VALUES.join(', ')
    }));
    return undefined;
  };

  const parseExcelRequirementType = (value, rowNumber, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase();
    if (TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES.includes(normalizedValue)) return normalizedValue;

    errors.push(buildExcelRowError(rowNumber, 'Requirement Type', 'inspections.importErrorExcelInvalidRequirementType', {
      value,
      allowed: TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES.join(', ')
    }));
    return undefined;
  };

  const parseExcelAnswerType = (value, rowNumber, errors) => {
    if (!value) return undefined;

    const normalizedValue = value.toLowerCase().replace(/\s+/g, ' ').trim();
    const answerType = TEMPLATE_IMPORT_ANSWER_TYPE_ALIASES[normalizedValue] || normalizedValue;
    if (TEMPLATE_IMPORT_ANSWER_TYPE_VALUES.includes(answerType)) return answerType;

    errors.push(buildExcelRowError(rowNumber, 'Answer Type', 'inspections.importErrorExcelInvalidAnswerType', {
      value,
      allowed: TEMPLATE_IMPORT_ANSWER_TYPE_VALUES.join(', ')
    }));
    return undefined;
  };

  const parseExcelPipeList = (value) => {
    if (!value) return [];
    return value.split('|').map(item => item.trim()).filter(Boolean);
  };

  const resolveExcelOptionName = (option, options) => {
    if (!options.length) return option;

    return options.find(existingOption => (
      existingOption.toLowerCase() === option.toLowerCase()
    )) || '';
  };

  const getDefaultExcelOptions = (answerType, includeNA) => {
    const defaultOptions = TEMPLATE_IMPORT_DEFAULT_OPTIONS[answerType] || [];
    if ((answerType === 'yesno' || answerType === 'yes_no') && includeNA === false) {
      return ['Yes', 'No'];
    }

    return [...defaultOptions];
  };

  const getRelevantExcelScoreColumns = (answerType) => {
    if (answerType === 'yesno' || answerType === 'yes_no') {
      return ['Score Yes', 'Score No', 'Score N/A'];
    }

    if (answerType === 'compliance') {
      return [
        'Score Full Compliance',
        'Score Partial Compliance',
        'Score Non-Compliant',
        'Score Not Applicable'
      ];
    }

    return [];
  };

  const parseExcelScores = (value, rowNumber, options, errors, columnName = 'Scores') => {
    if (!value) return {};

    const scores = {};

    value.split('|').map(item => item.trim()).filter(Boolean).forEach((scoreEntry) => {
      const separatorIndex = scoreEntry.indexOf('=');
      const option = separatorIndex > -1 ? scoreEntry.slice(0, separatorIndex).trim() : '';
      const scoreValue = separatorIndex > -1 ? scoreEntry.slice(separatorIndex + 1).trim() : '';
      const numericScore = Number(scoreValue);

      if (!option || !scoreValue || !Number.isFinite(numericScore)) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelMalformedScores', {
          value: scoreEntry
        }));
        return;
      }

      if (!options.length) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoresRequireOptions', {
          value: option
        }));
        return;
      }

      const resolvedOption = resolveExcelOptionName(option, options);
      if (!resolvedOption) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoreOptionMismatch', {
          value: option
        }));
        return;
      }

      scores[resolvedOption] = numericScore;
    });

    return scores;
  };

  const parseExcelScoreColumns = (row, headerMap, rowNumber, options, answerType, errors) => {
    const scores = {};
    const relevantColumns = getRelevantExcelScoreColumns(answerType);

    Object.entries(TEMPLATE_IMPORT_SCORE_COLUMNS).forEach(([columnName, optionName]) => {
      if (!relevantColumns.includes(columnName)) return;

      const scoreValue = getExcelCellValue(row, headerMap, columnName);
      if (!scoreValue) return;

      const numericScore = parseExcelNumber(scoreValue, rowNumber, columnName, errors);
      if (numericScore === undefined) return;

      if (!options.length) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoresRequireOptions', {
          value: optionName
        }));
        return;
      }

      const resolvedOption = resolveExcelOptionName(optionName, options);
      if (!resolvedOption) {
        errors.push(buildExcelRowError(rowNumber, columnName, 'inspections.importErrorExcelScoreOptionMismatch', {
          value: optionName
        }));
        return;
      }

      scores[resolvedOption] = numericScore;
    });

    return scores;
  };

  const getExcelRows = (worksheet) => (
    XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false
    })
  );

  const getExcelHeaderInfo = (rows, requiredColumns) => {
    const headerRowIndex = rows.findIndex(row => row.some(cell => toTemplateImportExcelCellString(cell)));
    if (headerRowIndex === -1) {
      throw new Error(t('inspections.importErrorEmptyFile'));
    }

    const headerMap = new Map();
    rows[headerRowIndex].forEach((header, index) => {
      const normalizedHeader = normalizeTemplateImportExcelHeader(header);
      if (normalizedHeader && !headerMap.has(normalizedHeader)) {
        headerMap.set(normalizedHeader, index);
      }
    });

    const missingHeaders = requiredColumns.filter(
      column => !headerMap.has(normalizeTemplateImportExcelHeader(column))
    );

    if (missingHeaders.length > 0) {
      throw new Error(t('inspections.importErrorExcelMissingHeaders', {
        headers: missingHeaders.join(', ')
      }));
    }

    return { headerRowIndex, headerMap };
  };

  const convertSingleSheetExcelWorkbookToTemplate = (workbook) => {
    if (!workbook?.SheetNames?.length) {
      throw new Error(t('inspections.importErrorExcelNoSheets'));
    }

    const sheetName = workbook.SheetNames.includes(TEMPLATE_IMPORT_EXCEL_SHEET_NAME)
      ? TEMPLATE_IMPORT_EXCEL_SHEET_NAME
      : workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false
    });

    const headerRowIndex = rows.findIndex(row => row.some(cell => toTemplateImportExcelCellString(cell)));
    if (headerRowIndex === -1) {
      throw new Error(t('inspections.importErrorEmptyFile'));
    }

    const headerMap = new Map();
    rows[headerRowIndex].forEach((header, index) => {
      const normalizedHeader = normalizeTemplateImportExcelHeader(header);
      if (normalizedHeader && !headerMap.has(normalizedHeader)) {
        headerMap.set(normalizedHeader, index);
      }
    });

    const missingHeaders = REQUIRED_TEMPLATE_IMPORT_EXCEL_COLUMNS.filter(
      column => !headerMap.has(normalizeTemplateImportExcelHeader(column))
    );

    if (missingHeaders.length > 0) {
      throw new Error(t('inspections.importErrorExcelMissingHeaders', {
        headers: missingHeaders.join(', ')
      }));
    }

    const dataRows = rows
      .slice(headerRowIndex + 1)
      .map((row, index) => ({
        row,
        rowNumber: headerRowIndex + index + 2
      }))
      .filter(({ row }) => row.some(cell => toTemplateImportExcelCellString(cell)));

    if (dataRows.length === 0) {
      throw new Error(t('inspections.importErrorExcelNoRows'));
    }

    const errors = [];
    const template = {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      pages: []
    };
    const pageMap = new Map();

    dataRows.forEach(({ row, rowNumber }) => {
      const missingRequiredValues = REQUIRED_TEMPLATE_IMPORT_EXCEL_COLUMNS.filter(
        column => !getExcelCellValue(row, headerMap, column)
      );

      missingRequiredValues.forEach((column) => {
        errors.push(buildExcelRowError(rowNumber, column, 'inspections.importErrorExcelMissingCell'));
      });

      if (missingRequiredValues.length > 0) return;

      const templateName = getExcelCellValue(row, headerMap, 'Template Name');
      if (!template.name) {
        template.name = templateName;
      } else if (template.name !== templateName) {
        errors.push(buildExcelRowError(rowNumber, 'Template Name', 'inspections.importErrorExcelTemplateNameMismatch', {
          expected: template.name,
          value: templateName
        }));
      }

      const templateDescription = getExcelCellValue(row, headerMap, 'Template Description');
      const templateType = getExcelCellValue(row, headerMap, 'Template Type');
      const templateStatus = parseExcelStatus(getExcelCellValue(row, headerMap, 'Template Status'), rowNumber, errors);
      const pageName = getExcelCellValue(row, headerMap, 'Page Name');
      const pageDescription = getExcelCellValue(row, headerMap, 'Page Description');
      const pageOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Page Order'), rowNumber, 'Page Order', errors);
      const sectionName = getExcelCellValue(row, headerMap, 'Section Name');
      const sectionDescription = getExcelCellValue(row, headerMap, 'Section Description');
      const sectionOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Section Order'), rowNumber, 'Section Order', errors);
      const answerType = parseExcelAnswerType(
        getExcelCellValue(row, headerMap, 'Answer Type') || getExcelCellValue(row, headerMap, 'Type'),
        rowNumber,
        errors
      ) || 'text';
      const required = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Required'), rowNumber, 'Required', errors);
      const mandatory = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Mandatory'), rowNumber, 'Mandatory', errors);
      const includeNA = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Include N/A'), rowNumber, 'Include N/A', errors);
      const requirementType = parseExcelRequirementType(getExcelCellValue(row, headerMap, 'Requirement Type'), rowNumber, errors);
      const weight = parseExcelNumber(getExcelCellValue(row, headerMap, 'Weight'), rowNumber, 'Weight', errors);
      const options = parseExcelPipeList(getExcelCellValue(row, headerMap, 'Options'));
      const scores = parseExcelScores(getExcelCellValue(row, headerMap, 'Scores'), rowNumber, options, errors);
      const scoringEnabled = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Scoring Enabled'), rowNumber, 'Scoring Enabled', errors);
      const scoringMax = parseExcelNumber(getExcelCellValue(row, headerMap, 'Scoring Max'), rowNumber, 'Scoring Max', errors);

      if (!template.description && templateDescription) template.description = templateDescription;
      if (!template.type && templateType) template.type = templateType;
      if (templateStatus && template.status === 'draft') template.status = templateStatus;

      if (!pageMap.has(pageName)) {
        const page = {
          name: pageName,
          description: pageDescription,
          ...(pageOrder !== undefined ? { order: pageOrder } : {}),
          sections: []
        };
        pageMap.set(pageName, {
          page,
          sectionMap: new Map()
        });
        template.pages.push(page);
      }

      const pageEntry = pageMap.get(pageName);
      if (!pageEntry.sectionMap.has(sectionName)) {
        const section = {
          name: sectionName,
          description: sectionDescription,
          ...(sectionOrder !== undefined ? { order: sectionOrder } : {}),
          questions: []
        };
        pageEntry.sectionMap.set(sectionName, section);
        pageEntry.page.sections.push(section);
      }

      const scoreValues = Object.values(scores);
      const inferredScoringMax = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
      const question = {
        text: getExcelCellValue(row, headerMap, 'Question Text'),
        description: getExcelCellValue(row, headerMap, 'Question Description'),
        answerType,
        type: answerType,
        required: required !== undefined ? required : true,
        options,
        scores
      };

      if (mandatory !== undefined) question.mandatory = mandatory;
      if (requirementType) question.requirementType = requirementType;
      if (includeNA !== undefined) question.includeNA = includeNA;
      if (weight !== undefined) question.weight = weight;
      if (scoringEnabled !== undefined || scoringMax !== undefined || scoreValues.length > 0) {
        question.scoring = {
          enabled: scoringEnabled !== undefined ? scoringEnabled : scoreValues.length > 0,
          max: scoringMax !== undefined ? scoringMax : inferredScoringMax
        };
      }

      pageEntry.sectionMap.get(sectionName).questions.push(question);
    });

    if (errors.length > 0) {
      throwExcelValidationErrors(errors);
    }

    return template;
  };

  const convertTabbedExcelWorkbookToTemplate = (workbook) => {
    const basicInfoSheet = workbook.Sheets[TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME];
    const pagesQuestionsSheet = workbook.Sheets[TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME];

    if (!basicInfoSheet) {
      throw new Error(t('inspections.importErrorExcelMissingSheet', {
        sheet: TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME
      }));
    }

    if (!pagesQuestionsSheet) {
      throw new Error(t('inspections.importErrorExcelMissingSheet', {
        sheet: TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME
      }));
    }

    const errors = [];
    const template = {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      pages: []
    };

    const basicInfoRows = getExcelRows(basicInfoSheet);
    const basicInfoHeaderInfo = getExcelHeaderInfo(basicInfoRows, ['Field', 'Value']);
    const basicInfoDataRows = basicInfoRows
      .slice(basicInfoHeaderInfo.headerRowIndex + 1)
      .map((row, index) => ({
        row,
        rowNumber: basicInfoHeaderInfo.headerRowIndex + index + 2
      }))
      .filter(({ row }) => row.some(cell => toTemplateImportExcelCellString(cell)));

    basicInfoDataRows.forEach(({ row, rowNumber }) => {
      const field = getExcelCellValue(row, basicInfoHeaderInfo.headerMap, 'Field');
      const value = getExcelCellValue(row, basicInfoHeaderInfo.headerMap, 'Value');
      if (!field) return;

      switch (normalizeTemplateImportExcelHeader(field)) {
        case 'template name':
          template.name = value;
          break;
        case 'template description':
          template.description = value;
          break;
        case 'template type':
          template.type = value;
          break;
        case 'template status': {
          const status = parseExcelStatus(value, rowNumber, errors);
          if (status) template.status = status;
          break;
        }
        default:
          break;
      }
    });

    if (!template.name) {
      errors.push(t('inspections.importErrorExcelBasicInfoRequired'));
    }

    const pagesQuestionsRows = getExcelRows(pagesQuestionsSheet);
    const pagesQuestionsHeaderInfo = getExcelHeaderInfo(
      pagesQuestionsRows,
      REQUIRED_TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS
    );
    const dataRows = pagesQuestionsRows
      .slice(pagesQuestionsHeaderInfo.headerRowIndex + 1)
      .map((row, index) => ({
        row,
        rowNumber: pagesQuestionsHeaderInfo.headerRowIndex + index + 2
      }))
      .filter(({ row }) => row.some(cell => toTemplateImportExcelCellString(cell)));

    if (dataRows.length === 0) {
      throw new Error(t('inspections.importErrorExcelNoRows'));
    }

    const pageMap = new Map();

    dataRows.forEach(({ row, rowNumber }) => {
      const headerMap = pagesQuestionsHeaderInfo.headerMap;
      const missingRequiredValues = REQUIRED_TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS.filter(
        column => !getExcelCellValue(row, headerMap, column)
      );

      missingRequiredValues.forEach((column) => {
        errors.push(buildExcelRowError(rowNumber, column, 'inspections.importErrorExcelMissingCell'));
      });

      if (missingRequiredValues.length > 0) return;

      const pageName = getExcelCellValue(row, headerMap, 'Page Name');
      const pageDescription = getExcelCellValue(row, headerMap, 'Page Description');
      const pageOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Page Order'), rowNumber, 'Page Order', errors);
      const sectionName = getExcelCellValue(row, headerMap, 'Section Name');
      const sectionDescription = getExcelCellValue(row, headerMap, 'Section Description');
      const sectionOrder = parseExcelNumber(getExcelCellValue(row, headerMap, 'Section Order'), rowNumber, 'Section Order', errors);
      const answerType = parseExcelAnswerType(getExcelCellValue(row, headerMap, 'Answer Type'), rowNumber, errors) || 'text';
      const required = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Required'), rowNumber, 'Required', errors);
      const mandatory = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Mandatory'), rowNumber, 'Mandatory', errors);
      const includeNA = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Include N/A'), rowNumber, 'Include N/A', errors);
      const requirementType = parseExcelRequirementType(getExcelCellValue(row, headerMap, 'Requirement Type'), rowNumber, errors);
      const weight = parseExcelNumber(getExcelCellValue(row, headerMap, 'Weight'), rowNumber, 'Weight', errors);
      const explicitOptions = parseExcelPipeList(getExcelCellValue(row, headerMap, 'Options'));
      const options = explicitOptions.length > 0
        ? explicitOptions
        : getDefaultExcelOptions(answerType, includeNA);
      const scoreColumnScores = parseExcelScoreColumns(row, headerMap, rowNumber, options, answerType, errors);
      const optionScores = parseExcelScores(
        getExcelCellValue(row, headerMap, 'Option Scores') || getExcelCellValue(row, headerMap, 'Scores'),
        rowNumber,
        options,
        errors,
        getExcelCellValue(row, headerMap, 'Option Scores') ? 'Option Scores' : 'Scores'
      );
      const scores = {
        ...scoreColumnScores,
        ...optionScores
      };
      const scoringEnabled = parseExcelBoolean(getExcelCellValue(row, headerMap, 'Scoring Enabled'), rowNumber, 'Scoring Enabled', errors);
      const scoringMax = parseExcelNumber(getExcelCellValue(row, headerMap, 'Scoring Max'), rowNumber, 'Scoring Max', errors);

      if (!pageMap.has(pageName)) {
        const page = {
          name: pageName,
          description: pageDescription,
          ...(pageOrder !== undefined ? { order: pageOrder } : {}),
          sections: []
        };
        pageMap.set(pageName, {
          page,
          sectionMap: new Map()
        });
        template.pages.push(page);
      }

      const pageEntry = pageMap.get(pageName);
      if (!pageEntry.sectionMap.has(sectionName)) {
        const section = {
          name: sectionName,
          description: sectionDescription,
          ...(sectionOrder !== undefined ? { order: sectionOrder } : {}),
          questions: []
        };
        pageEntry.sectionMap.set(sectionName, section);
        pageEntry.page.sections.push(section);
      }

      const scoreValues = Object.values(scores);
      const inferredScoringMax = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
      const question = {
        text: getExcelCellValue(row, headerMap, 'Question Text'),
        description: getExcelCellValue(row, headerMap, 'Question Description'),
        answerType,
        type: answerType,
        required: required !== undefined ? required : true,
        options,
        scores
      };

      if (mandatory !== undefined) question.mandatory = mandatory;
      if (requirementType) question.requirementType = requirementType;
      if (includeNA !== undefined) question.includeNA = includeNA;
      if (weight !== undefined) question.weight = weight;
      if (scoringEnabled !== undefined || scoringMax !== undefined || scoreValues.length > 0) {
        question.scoring = {
          enabled: scoringEnabled !== undefined ? scoringEnabled : scoreValues.length > 0,
          max: scoringMax !== undefined ? scoringMax : inferredScoringMax
        };
      }

      pageEntry.sectionMap.get(sectionName).questions.push(question);
    });

    if (errors.length > 0) {
      throwExcelValidationErrors(errors);
    }

    return template;
  };

  const convertExcelWorkbookToTemplate = (workbook) => {
    if (!workbook?.SheetNames?.length) {
      throw new Error(t('inspections.importErrorExcelNoSheets'));
    }

    const usesTabbedTemplate = workbook.Sheets[TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME]
      || workbook.Sheets[TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME];

    if (usesTabbedTemplate) {
      return convertTabbedExcelWorkbookToTemplate(workbook);
    }

    return convertSingleSheetExcelWorkbookToTemplate(workbook);
  };

  const handleTemplateImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error(t('inspections.importErrorJsonOnly'));
      event.target.value = '';
      return;
    }

    if (file.size === 0) {
      toast.error(t('inspections.importErrorEmptyFile'));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileContent = typeof reader.result === 'string' ? reader.result.trim() : '';
        if (!fileContent) {
          throw new Error(t('inspections.importErrorEmptyFile'));
        }

        let parsedTemplate;
        try {
          parsedTemplate = JSON.parse(fileContent);
        } catch (parseError) {
          throw new Error(t('inspections.importErrorMalformedJson'));
        }

        applyImportedTemplate(parsedTemplate);
      } catch (error) {
        console.error('Template import failed:', error);
        toast.error(error.message || t('inspections.invalidTemplateFile'));
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      toast.error(t('inspections.importErrorReadFailed'));
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleTemplateExcelImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const lowerCaseFileName = file.name.toLowerCase();
    if (!lowerCaseFileName.endsWith('.xlsx') && !lowerCaseFileName.endsWith('.xls')) {
      toast.error(t('inspections.importErrorExcelOnly'));
      event.target.value = '';
      return;
    }

    if (file.size === 0) {
      toast.error(t('inspections.importErrorEmptyFile'));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: 'array' });
        const parsedTemplate = convertExcelWorkbookToTemplate(workbook);
        applyImportedTemplate(parsedTemplate);
      } catch (error) {
        console.error('Template Excel import failed:', error);
        toast.error(error.message || t('inspections.invalidExcelTemplateFile'));
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      toast.error(t('inspections.importErrorExcelReadFailed'));
      event.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadSampleTemplate = () => {
    const link = document.createElement('a');
    link.href = '/samples/template-import-sample.json';
    link.download = 'template-import-sample.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();

    const basicInfoWorksheet = XLSX.utils.aoa_to_sheet([
      TEMPLATE_IMPORT_EXCEL_BASIC_INFO_COLUMNS,
      ...TEMPLATE_IMPORT_EXCEL_BASIC_INFO_FIELDS
    ]);
    basicInfoWorksheet['!cols'] = [{ wch: 28 }, { wch: 70 }, { wch: 72 }];

    const sampleRowsByColumn = TEMPLATE_IMPORT_EXCEL_SAMPLE_ROWS.map(row => (
      TEMPLATE_IMPORT_EXCEL_COLUMNS.reduce((rowData, columnName, index) => ({
        ...rowData,
        [columnName]: row[index]
      }), {})
    ));

    const getSampleScoreMap = (scoresText) => (
      String(scoresText || '').split('|').reduce((scores, scoreEntry) => {
        const separatorIndex = scoreEntry.indexOf('=');
        if (separatorIndex === -1) return scores;

        const optionName = scoreEntry.slice(0, separatorIndex).trim();
        const scoreValue = scoreEntry.slice(separatorIndex + 1).trim();
        if (!optionName || !scoreValue) return scores;

        return {
          ...scores,
          [optionName.toLowerCase()]: scoreValue
        };
      }, {})
    );

    const pagesQuestionsRows = sampleRowsByColumn.map((sampleRow) => {
      const answerType = sampleRow['Answer Type'];
      const includeNA = sampleRow['Include N/A'];
      const rawScores = getSampleScoreMap(sampleRow.Scores);
      const scoringMax = sampleRow['Scoring Max'];
      const isCompliance = answerType === 'compliance';
      const options = isCompliance
        ? TEMPLATE_IMPORT_DEFAULT_OPTIONS.compliance.join('|')
        : sampleRow.Options;
      const optionScores = answerType === 'select'
        ? sampleRow.Scores
        : '';

      return [
        sampleRow['Page Name'],
        sampleRow['Page Description'],
        sampleRow['Page Order'],
        sampleRow['Section Name'],
        sampleRow['Section Description'],
        sampleRow['Section Order'],
        sampleRow['Question Text'],
        sampleRow['Question Description'],
        answerType,
        sampleRow.Required,
        sampleRow['Requirement Type'],
        includeNA,
        sampleRow.Weight,
        options,
        rawScores.yes || '',
        rawScores.no || '',
        (answerType === 'yes_no' || answerType === 'yesno') ? rawScores['n/a'] || '' : '',
        isCompliance ? scoringMax : '',
        isCompliance ? 1 : '',
        isCompliance ? 0 : '',
        isCompliance ? 0 : '',
        optionScores,
        sampleRow['Scoring Enabled'],
        scoringMax
      ];
    });

    const pagesQuestionsWorksheet = XLSX.utils.aoa_to_sheet([
      TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS,
      ...pagesQuestionsRows
    ]);
    pagesQuestionsWorksheet['!cols'] = TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS.map(column => ({
      wch: Math.min(Math.max(column.length + 4, 16), 44)
    }));
    pagesQuestionsWorksheet['!autofilter'] = {
      ref: `A1:${XLSX.utils.encode_col(TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_COLUMNS.length - 1)}${pagesQuestionsRows.length + 1}`
    };

    const instructionsWorksheet = XLSX.utils.aoa_to_sheet([
      ['Instruction', 'Details'],
      ['Basic Info tab', 'Fill Template Name first. Template Description, Type, and Status are optional.'],
      ['Pages and Questions tab', 'Use one row per question. Required columns are Page Name, Section Name, and Question Text.'],
      ['Answer Type values', TEMPLATE_IMPORT_ANSWER_TYPE_VALUES.join(', ')],
      ['Recommended answer types', 'Use yes_no for Yes/No, compliance for compliance scoring, select for dropdowns, textarea for long text.'],
      ['Options', 'Separate options with |, for example: Yes|No|N/A. For yes_no and compliance, options can be left blank to use defaults.'],
      ['Easy scoring fields', 'For yes_no, fill Score Yes, Score No, and Score N/A. For compliance, fill Score Full Compliance, Score Partial Compliance, Score Non-Compliant, and Score Not Applicable.'],
      ['Option Scores', 'For select or custom options, use Option=Score pairs separated with |, for example: Excellent=4|Good=3|Needs Repair=1|Unsafe=0. Option names should match Options.'],
      ['Boolean values', 'Use TRUE/FALSE, YES/NO, Y/N, or 1/0.'],
      ['Template Status values', TEMPLATE_IMPORT_STATUS_VALUES.join(', ')],
      ['Requirement Type values', TEMPLATE_IMPORT_REQUIREMENT_TYPE_VALUES.join(', ')]
    ]);
    instructionsWorksheet['!cols'] = [{ wch: 28 }, { wch: 120 }];

    XLSX.utils.book_append_sheet(workbook, basicInfoWorksheet, TEMPLATE_IMPORT_EXCEL_BASIC_INFO_SHEET_NAME);
    XLSX.utils.book_append_sheet(workbook, pagesQuestionsWorksheet, TEMPLATE_IMPORT_EXCEL_PAGES_QUESTIONS_SHEET_NAME);
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, TEMPLATE_IMPORT_EXCEL_INSTRUCTIONS_SHEET_NAME);
    XLSX.writeFile(workbook, TEMPLATE_IMPORT_EXCEL_FILE_NAME);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaveError('');
      setSaveMessage('Saving template...');

      const limitError = getTemplateLimitError(templateStats);
      if (limitError) {
        setLoading(false);
        setSaveMessage('');
        setSaveError(limitError);
        toast.error(limitError);
        return null;
      }

      // Add a small delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 100));

      // Prepare questions array
      const allQuestions = [];

      // Basic template data
      const templateData = {
        name: formData.name,
        description: formData.description || 'No description provided',
        type: formData.type,
        status: formData.status || 'draft',
        pages: [],
        questions: []
      };

      // Transform the data structure for the API
      if (formData.pages && formData.pages.length > 0) {
        formData.pages.forEach((page, pageIndex) => {
          const pageData = {
            name: page.name,
            description: page.description || 'No description provided',
            order: pageIndex,
            sections: []
          };

          if (page.sections && page.sections.length > 0) {
            // Sort sections by order before processing to ensure correct order
            const sortedSections = [...page.sections].sort((a, b) => {
              const orderA = a.order !== undefined ? a.order : 0;
              const orderB = b.order !== undefined ? b.order : 0;
              return orderA - orderB;
            });

            sortedSections.forEach((section, sectionIndex) => {
              // Process section questions
              const processedQuestions = section.questions
                ? section.questions.map(q => ({
                  ...q,
                  description: q.description || '',
                  required: q.required !== undefined ? q.required : true // Ensure required field is preserved
                }))
                : [];

              const sectionData = {
                name: section.name,
                description: section.description || 'No description provided',
                order: section.order !== undefined ? section.order : sectionIndex,
                questions: processedQuestions
              };

              pageData.sections.push(sectionData);

              // Add questions to the main questions array as well
              if (processedQuestions.length > 0) {
                allQuestions.push(...processedQuestions);
              }
            });
          }

          templateData.pages.push(pageData);
        });
      }

      // Set the questions array
      templateData.questions = allQuestions;

      let response;

      if (id) {
        response = await api.put(`/inspection/${id}`, templateData, {
          timeout: 60000, // Increase timeout for large templates
        });
      } else {
        response = await api.post('/inspection', templateData, {
          timeout: 60000, // Increase timeout for large templates
        });

        // Clear local storage after successful save
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        // Redirect to the templates listing page after successful creation
        navigate('/inspection');
        setSaveMessage('Template created successfully');
        toast.success('Template created successfully');
        return response.data;
      }

      setSaveMessage('Template saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
      navigate('/inspection');
      setLoading(false);
      toast.success('Template updated successfully');
      return response.data;
    } catch (error) {
      console.error('Save error:', error);
      setLoading(false);
      setSaveError(error.response?.data?.error?.message || error.message || 'Error saving template');
      setSaveMessage('');
      return null;
    }
  };

  const handlePublish = async () => {
    // If the template is already published, set modal to unpublish mode
    const isPublished = formData.status === 'active';
    setIsConfirmModalOpen(true);
  };

  // Add a conditional title for the confirm modal
  const getPublishModalText = () => {
    return formData.status === 'active'
      ? { title: 'Unpublish Template', message: 'Are you sure you want to unpublish this template?' }
      : { title: 'Publish Template', message: 'Are you sure you want to publish this template?' };
  };

  const confirmPublish = async () => {
    try {
      setLoading(true);
      // Determine if we're publishing or unpublishing
      const isPublishing = formData.status !== 'active';
      setSaveMessage(isPublishing ? 'Saving and publishing template...' : 'Unpublishing template...');

      // Add a small delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 100));

      // First save the template
      const savedData = await handleSave();

      if (savedData) {
        // Update the status based on the current status
        const newStatus = isPublishing ? 'active' : 'draft';
        const updateData = {
          ...savedData,
          status: newStatus
        };

        // Use the centralized API service
        await api.put(`/inspection/${savedData._id || savedData.id}`, updateData, {
          timeout: 30000, // 30s timeout for operation
        });

        setFormData({
          ...formData,
          status: newStatus
        });

        setSaveMessage(isPublishing ? 'Template published successfully' : 'Template unpublished successfully');

        // Redirect to template listing after publishing
        if (isPublishing) {
          setTimeout(() => {
            navigate('/inspection');
          }, 1500);
        }
      }

      setIsConfirmModalOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating template status:', error);
      setSaveError(error.response?.data?.error?.message || error.message || 'Failed to update template status');
      setSaveMessage('');
      setLoading(false);
    }
  };

  // Helper functions for confirmation modals
  const handlePageDeleteClick = (pageIndex, pageName) => {
    setDeleteTarget({ type: 'page', index: pageIndex, name: pageName });
    setShowPageDeleteModal(true);
  };

  const handleSectionDeleteClick = (pageIndex, sectionIndex, sectionName) => {
    setDeleteTarget({ type: 'section', pageIndex, sectionIndex, name: sectionName });
    setShowSectionDeleteModal(true);
  };

  const confirmPageDelete = () => {
    if (deleteTarget && deleteTarget.type === 'page') {
      removePage(deleteTarget.index);
    }
    setShowPageDeleteModal(false);
    setDeleteTarget(null);
  };

  const confirmSectionDelete = () => {
    if (deleteTarget && deleteTarget.type === 'section') {
      removeSection(deleteTarget.pageIndex, deleteTarget.sectionIndex);
    }
    setShowSectionDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleBack = () => {
    setIsDiscardModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addPage = () => {
    const newPages = [...formData.pages];
    newPages.push({
      name: `Page ${newPages.length + 1}`,
      description: '',
      sections: [{
        id: uuidv4(),
        name: 'Section 1',
        description: '',
        order: 0,
        questions: []
      }]
    });

    setFormData({
      ...formData,
      pages: newPages
    });

    setActivePageIndex(newPages.length - 1);
    setActiveSectionTab(0);
    setQuestionPage(1);
  };

  const updatePage = (index, data) => {
    const newPages = [...formData.pages];
    newPages[index] = {
      ...newPages[index],
      ...data
    };

    setFormData({
      ...formData,
      pages: newPages
    });
  };

  const addSection = () => {
    setFormData(prevFormData => {
      const newPages = prevFormData.pages.map((page, idx) => {
        if (idx !== activePageIndex) return page;

        // Create new sections array with the new section
        const newSections = [...(page.sections || [])];
        const sectionId = uuidv4();

        newSections.push({
          id: sectionId,
          name: `Section ${newSections.length + 1}`,
          description: '',
          order: newSections.length,
          subLevels: [],
          questions: []
        });

        return {
          ...page,
          sections: newSections
        };
      });

      // Update active section index after state update
      const newActivePage = newPages[activePageIndex];
      if (newActivePage && newActivePage.sections) {
        setActiveSectionIndex(newActivePage.sections.length - 1);
      }

      return {
        ...prevFormData,
        pages: newPages
      };
    });
  };

  const updateSection = (sectionIndex, data) => {
    const newPages = [...formData.pages];
    const activePage = newPages[activePageIndex];

    activePage.sections[sectionIndex] = {
      ...activePage.sections[sectionIndex],
      ...data
    };

    setFormData({
      ...formData,
      pages: newPages
    });
  };

  // Manual Drag and Drop Handlers for Sections
  const [draggingSectionIndex, setDraggingSectionIndex] = useState(null);
  // Manual Drag and Drop Handlers for Pages
  const [draggingPageIndex, setDraggingPageIndex] = useState(null);
  // Manual Drag and Drop Handlers for Questions
  const [draggingQuestionIndex, setDraggingQuestionIndex] = useState(null);

  const handlePageManualDragStart = (e, index) => {
    setDraggingPageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.style.opacity = '0.4';
  };

  const handlePageManualDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggingPageIndex !== null && draggingPageIndex !== index) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handlePageManualDrop = (e, destinationIndex) => {
    e.preventDefault();
    const sourceIndex = draggingPageIndex;
    e.currentTarget.classList.remove('drag-over');

    if (sourceIndex === null || sourceIndex === destinationIndex) {
      return;
    }

    setFormData(prevFormData => {
      const newPages = [...prevFormData.pages];
      const [reorderedPage] = newPages.splice(sourceIndex, 1);
      newPages.splice(destinationIndex, 0, reorderedPage);

      // Update activePageIndex to stay with the reordered page
      setActivePageIndex(destinationIndex);
      setUnsavedChanges(true);

      return {
        ...prevFormData,
        pages: newPages
      };
    });
  };

  const handlePageManualDragEnd = (e) => {
    setDraggingPageIndex(null);
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const handleManualDragStart = (e, index) => {
    setDraggingSectionIndex(index);
    // Required for some browsers
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);

    // Create a visual indicator on the source element
    e.currentTarget.style.opacity = '0.4';
  };

  const handleManualDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Optional: Add visual indicator for drop target
    if (draggingSectionIndex !== null && draggingSectionIndex !== index) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleManualDrop = (e, destinationIndex) => {
    e.preventDefault();
    const sourceIndex = draggingSectionIndex;

    // Clear visual indicators
    e.currentTarget.classList.remove('drag-over');

    if (sourceIndex === null || sourceIndex === destinationIndex) {
      return;
    }

    setFormData(prevFormData => {
      const newPages = prevFormData.pages.map((page, idx) => {
        if (idx !== activePageIndex) return page;

        const newSections = [...page.sections];
        const [reorderedSection] = newSections.splice(sourceIndex, 1);
        newSections.splice(destinationIndex, 0, reorderedSection);

        // Update order property
        newSections.forEach((section, index) => {
          section.order = index;
        });

        return {
          ...page,
          sections: newSections
        };
      });

      setUnsavedChanges(true);
      return {
        ...prevFormData,
        pages: newPages
      };
    });

    // Update active section tab to the new position
    setActiveSectionTab(destinationIndex);
  };

  const handleManualDragEnd = (e) => {
    setDraggingSectionIndex(null);
    e.currentTarget.style.opacity = '1';

    // Ensure all drag-over classes are removed if drop was cancelled
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  // Question Drag and Drop Handlers
  const handleQuestionDragStart = (e, questionIndex) => {
    setDraggingQuestionIndex(questionIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', questionIndex);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleQuestionDragOver = (e, questionIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggingQuestionIndex !== null && draggingQuestionIndex !== questionIndex) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleQuestionDrop = (e, sectionIndex, destinationQuestionIndex) => {
    e.preventDefault();
    const sourceQuestionIndex = draggingQuestionIndex;
    e.currentTarget.classList.remove('drag-over');

    if (sourceQuestionIndex === null || sourceQuestionIndex === destinationQuestionIndex) {
      return;
    }

    setFormData(prevFormData => {
      const newPages = prevFormData.pages.map((page, idx) => {
        if (idx !== activePageIndex) return page;

        const newSections = page.sections.map((section, secIdx) => {
          if (secIdx !== sectionIndex) return section;

          const newQuestions = [...section.questions];
          const [reorderedQuestion] = newQuestions.splice(sourceQuestionIndex, 1);
          newQuestions.splice(destinationQuestionIndex, 0, reorderedQuestion);

          return {
            ...section,
            questions: newQuestions
          };
        });

        return {
          ...page,
          sections: newSections
        };
      });

      setUnsavedChanges(true);
      return {
        ...prevFormData,
        pages: newPages
      };
    });
  };

  const handleQuestionDragEnd = (e) => {
    setDraggingQuestionIndex(null);
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const addQuestion = (sectionIndex) => {
    const newQuestion = {
      id: uuidv4(),
      text: '',
      description: '',
      answerType: 'yesno',
      type: 'yesno',
      required: true,
      mandatory: true,
      requirementType: 'mandatory',
      includeNA: true, // Default to true for new Yes/No questions
      options: [t('common.yes'), t('common.no'), t('common.na')],
      scoring: {
        enabled: true,
        max: 2
      },
      scores: {
        [t('common.yes')]: 2,
        [t('common.no')]: 0,
        [t('common.na')]: 0
      }
    };

    const updatedPages = [...formData.pages];
    updatedPages[activePageIndex].sections[sectionIndex].questions.push(newQuestion);
    const nextQuestionCount = updatedPages[activePageIndex].sections[sectionIndex].questions.length;

    setFormData({
      ...formData,
      pages: updatedPages
    });

    if (sectionIndex === activeSectionTab) {
      setQuestionPage(Math.ceil(nextQuestionCount / QUESTION_PAGE_SIZE));
    }
    setUnsavedChanges(true);
  };

  const updateQuestion = (sectionIndex, questionIndex, data) => {
    const newPages = [...formData.pages];
    const activePage = newPages[activePageIndex];
    const section = activePage.sections[sectionIndex];

    section.questions[questionIndex] = {
      ...section.questions[questionIndex],
      ...data
    };

    setFormData({
      ...formData,
      pages: newPages
    });
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const newPages = [...formData.pages];
    const activePage = newPages[activePageIndex];
    const section = activePage.sections[sectionIndex];

    section.questions.splice(questionIndex, 1);

    setFormData({
      ...formData,
      pages: newPages
    });
  };

  const openMoveQuestionModal = (sectionIndex, questionIndex) => {
    const question = formData.pages[activePageIndex].sections[sectionIndex].questions[questionIndex];
    setSelectedQuestion(question);
    setSelectedQuestionIndex(questionIndex);
    setActiveSectionIndex(sectionIndex);
    setIsMoveQuestionModalOpen(true);
  };

  const handleMoveQuestion = (targetPageIndex, targetSectionIndex) => {
    // Check if moving to the same location
    if (targetPageIndex === activePageIndex && targetSectionIndex === activeSectionIndex) {
      setIsMoveQuestionModalOpen(false);
      return;
    }

    const newPages = [...formData.pages];
    const sourcePage = newPages[activePageIndex];
    const sourceSection = sourcePage.sections[activeSectionIndex];
    const targetPage = newPages[targetPageIndex];
    const targetSection = targetPage.sections[targetSectionIndex];

    // Remove from source
    const [movedQuestion] = sourceSection.questions.splice(selectedQuestionIndex, 1);

    // Add to target
    targetSection.questions.push(movedQuestion);

    setFormData({
      ...formData,
      pages: newPages
    });

    setIsMoveQuestionModalOpen(false);
    
    // Show success message
    toast.success('Question moved successfully');
  };

  // Function to handle guide toggle
  const toggleGuide = () => {
    setIsGuideOpen(!isGuideOpen);
  };

  // Transform template data to report format
  const transformTemplateToReportData = () => {
    // Extract sections from pages and their sections
    const sections = [];
    let totalScore = 0;
    let maxScore = 0;

    // Basic validation but ensure we show what we have even if incomplete
    if (!formData) {
      return getEmptyReportTemplate();
    }

    // Process all pages and sections even if some fields are incomplete
    if (formData.pages && formData.pages.length > 0) {
      formData.pages.forEach((page, pageIndex) => {
        if (page.sections && page.sections.length > 0) {
          page.sections.forEach((section, sectionIndex) => {
            const sectionData = {
              id: `section_${pageIndex}_${sectionIndex}`,
              name: section.name || `${t('common.template')} ${sectionIndex + 1} (${t('common.page')} ${pageIndex + 1})`,
              description: section.description || '',
              score: 0,
              maxScore: 0,
              status: 'not_applicable',
              items: []
            };

            // Process questions
            if (section.questions && section.questions.length > 0) {
              section.questions.forEach(question => {
                const questionScore = question.scoring?.enabled ? (question.scoring.max || 1) : 0;
                maxScore += questionScore;

                sectionData.items.push({
                  title: question.text || t('common.unnamedQuestion'),
                  status: 'not_applicable'
                });

                sectionData.maxScore += questionScore;
              });
            }

            // Calculate section status
            sectionData.status = sectionData.maxScore > 0 ? 'partial_compliance' : 'not_applicable';

            sections.push(sectionData);
          });
        }
      });
    }

    return {
      title: formData.name || t('common.draftInspectionTemplate'),
      score: 0, // No real score in template preview
      maxScore: maxScore,
      completedAt: new Date().toLocaleString(),
      sections,
      flaggedItems: [],
      metadata: {
        documentNumber: id ? `Template ID: ${id}` : t('common.newTemplate'),
        inspectionLocation: t('common.notSpecified'),
        inspectionDate: new Date().toLocaleDateString(),
        inspectorName: t('common.notAssigned'),
        operatorName: t('common.previewMode')
      }
    };
  };

  // Helper function for empty template
  const getEmptyReportTemplate = () => {
    return {
      title: 'Inspection Template',
      score: 0,
      maxScore: 0,
      completedAt: new Date().toLocaleString(),
      sections: [],
      flaggedItems: [],
      metadata: {
        documentNumber: 'Template ID: Draft',
        inspectionLocation: 'Not specified',
        inspectionDate: new Date().toLocaleDateString(),
        inspectorName: 'Not assigned',
        operatorName: 'Draft Template'
      }
    };
  };

  const reportPreviewData = useMemo(() => (
    activeTab === 'report' ? transformTemplateToReportData() : null
  ), [activeTab, formData, id, t]);

  // Auto-save template changes to local storage
  useEffect(() => {
    if (!id && formData.pages && formData.pages.length > 0) {
      autoSaveToLocalStorage(formData);
    }
  }, [formData, id, autoSaveToLocalStorage]);

  const removePage = (index) => {
    if (formData.pages.length <= 1) {
      toast.error('Templates must have at least one page');
      return;
    }

    const updatedPages = [...formData.pages];
    updatedPages.splice(index, 1);

    // If the current activePageIndex is beyond the new array length, set it to the last valid index
    const newActivePageIndex = activePageIndex >= updatedPages.length ? updatedPages.length - 1 : activePageIndex;

    setFormData(prev => ({
      ...prev,
      pages: updatedPages
    }));
    setActivePageIndex(newActivePageIndex);
    setActiveSectionTab(0);
    setQuestionPage(1);
    setUnsavedChanges(true);
  };

  const removeSection = (pageIndex, sectionIndex) => {
    const updatedPages = [...formData.pages];
    updatedPages[pageIndex].sections.splice(sectionIndex, 1);

    setFormData(prev => ({
      ...prev,
      pages: updatedPages
    }));
    setActiveSectionTab(prevTab => {
      if (pageIndex !== activePageIndex) return prevTab;
      const remainingSections = updatedPages[pageIndex]?.sections?.length || 0;
      if (remainingSections === 0) return 0;
      return Math.min(prevTab, remainingSections - 1);
    });
    setQuestionPage(1);
    setUnsavedChanges(true);
  };

  // Add remove button in page header
  // ... existing code ...

  const renderPages = () => {
    const pageList = formData.pages.map((page, pageIndex) => (
      <div
        key={page.id || pageIndex}
        style={{
          padding: '20px',
          backgroundColor: activePageIndex === pageIndex ? '#f8fafc' : 'white',
          borderBottom: '1px solid #e2e8f0',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div
            onClick={() => {
              setActivePageIndex(pageIndex);
              setActiveSectionTab(0);
            }}
            style={{ flex: '1' }}
          >
            <div style={{
              fontSize: '16px',
              fontWeight: activePageIndex === pageIndex ? '600' : '500',
              color: activePageIndex === pageIndex ? 'var(--color-navy)' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{pageIndex + 1}.</span>
              <span>{page.name || `Unnamed Page ${pageIndex + 1}`}</span>
              {page.sections && page.sections.length > 0 && (
                <span style={{
                  marginLeft: '8px',
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: 'normal'
                }}>
                  ({page.sections.length} section{page.sections.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>

            {page.description && (
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                {page.description}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setActivePageIndex(pageIndex);
                setActiveSectionTab(0);
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#64748b'
              }}
              title="Edit Page"
            >
              <Edit size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePageDeleteClick(pageIndex, page.name || `Page ${pageIndex + 1}`);
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ef4444'
              }}
              title="Delete Page"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    ));

    // Add the "Add Page" button to the end of the page list
    return (
      <>
        {pageList}
        <div style={{
          padding: '20px',
          textAlign: 'center'
        }}>
          <Button
            onClick={addPage}
            style={{
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              margin: '0 auto'
            }}
          >
            <Plus size={16} />
            Add Page
          </Button>
        </div>
      </>
    );
  };

  // ... existing code ...

  // Note: SectionHeader styled component is already defined at the top of the file (line 686)
  // Do not redefine it here to avoid styled-components warnings

  // In the template where sections are rendered, add the remove section button
  const renderSections = (pageIndex) => {
    const page = formData.pages[pageIndex];
    if (!page || !page.sections) return null;

    const sectionList = page.sections.map((section, sectionIndex) => (
      <div
        key={section.id || sectionIndex}
        style={{
          backgroundColor: 'white',
          marginBottom: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '500',
            color: 'var(--color-navy)'
          }}>
            {section.name || `Section ${sectionIndex + 1}`}

            {section.questions && section.questions.length > 0 && (
              <span style={{
                marginLeft: '8px',
                fontSize: '13px',
                color: '#64748b',
                fontWeight: 'normal'
              }}>
                ({section.questions.length} question{section.questions.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => addQuestion(sectionIndex)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#3b82f6'
              }}
              title="Add Question"
            >
              <Plus size={18} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSectionDeleteClick(pageIndex, sectionIndex, section.name || `Section ${sectionIndex + 1}`);
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ef4444'
              }}
              title="Delete Section"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          {section.description && (
            <div style={{
              marginBottom: '16px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              {section.description}
            </div>
          )}

          {section.questions && section.questions.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                Questions
              </div>

              {section.questions.map((question, questionIndex) => (
                <QuestionItemComponent
                  key={question.id || questionIndex}
                  question={question}
                  questionIndex={questionIndex}
                  loading={loading}
                  updateQuestion={(updatedQuestion) => updateQuestion(sectionIndex, questionIndex, updatedQuestion)}
                  removeQuestion={() => removeQuestion(sectionIndex, questionIndex)}
                  onMoveQuestion={() => openMoveQuestionModal(sectionIndex, questionIndex)}
                  sectionIndex={sectionIndex}
                  isDragging={draggingQuestionIndex === questionIndex}
                  onQuestionDragStart={handleQuestionDragStart}
                  onQuestionDragOver={handleQuestionDragOver}
                  onQuestionDrop={handleQuestionDrop}
                  onQuestionDragEnd={handleQuestionDragEnd}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#94a3b8',
              backgroundColor: '#f8fafc',
              borderRadius: '6px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <HelpCircle size={24} style={{ marginBottom: '8px' }} />
                <div>No questions in this section</div>
              </div>
              <Button
                onClick={() => addQuestion(sectionIndex)}
                variant="primary"
                style={{ margin: '0 auto' }}
              >
                <Plus size={16} />
                {t('common.addQuestion')}
              </Button>
            </div>
          )}
        </div>
      </div>
    ));

    // Add the "Add Section" button at the end
    return (
      <>
        {sectionList}
        <div style={{
          padding: '20px',
          textAlign: 'center'
        }}>
          <Button
            onClick={addSection}
            style={{
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              margin: '0 auto'
            }}
          >
            <Plus size={16} />
            Add Section
          </Button>
        </div>
      </>
    );
  };

  // ... existing code ...

  // Update the tabs to include delete buttons
  const renderPageTabs = () => {
    return (
      <div style={{
        display: 'flex',
        overflow: 'auto',
        borderBottom: '1px solid #e2e8f0',
        padding: '4px',
        gap: '4px'
      }}>
        {formData.pages.map((page, index) => (
          <Tab
            key={page.id || page._id || index}
            $active={index === activePageIndex}
            $isDragging={draggingPageIndex === index}
            onClick={() => {
              setActivePageIndex(index);
              setActiveSectionTab(0);
            }}
            draggable="true"
            onDragStart={(e) => handlePageManualDragStart(e, index)}
            onDragOver={(e) => handlePageManualDragOver(e, index)}
            onDrop={(e) => handlePageManualDrop(e, index)}
            onDragEnd={handlePageManualDragEnd}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'grab',
                marginRight: '8px'
              }}
              title="Drag to reorder page"
            >
              <Move size={14} color="#64748b" />
            </div>
            {page.name || `Page ${index + 1}`}
            <div
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePageDeleteClick(index, page.name || `Page ${index + 1}`);
              }}
              title="Delete Page"
            >
              <X size={14} />
            </div>
          </Tab>
        ))}
        <button
          onClick={addPage}
          style={{
            padding: '12px 16px',
            background: 'rgba(59, 73, 223, 0.05)',
            border: 'none',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-navy)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginLeft: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 73, 223, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 73, 223, 0.05)'}
        >
          <Plus size={16} />
        </button>
      </div>
    );
  };

  // Update renderSectionTabs to include delete buttons and manual drag-and-drop
  const renderSectionTabs = (pageIndex) => {
    // Normalize pageIndex to ensure it's always valid
    const validPageIndex = Math.max(0, Math.min(pageIndex || 0, (formData.pages?.length || 1) - 1));

    const page = formData.pages?.[validPageIndex];
    const sections = page?.sections || [];

    return (
      <div style={{
        display: 'flex',
        overflow: 'auto',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '16px',
        minHeight: '45px'
      }}>
        <div
          style={{
            display: 'flex',
            overflow: 'auto',
            width: '100%'
          }}
        >
          {sections.map((section, index) => {
            return (
              <SectionTab
                key={section.id || section._id || index}
                $active={index === activeSectionTab}
                $isDragging={draggingSectionIndex === index}
                onClick={() => setActiveSectionTab(index)}
                draggable="true"
                onDragStart={(e) => handleManualDragStart(e, index)}
                onDragOver={(e) => handleManualDragOver(e, index)}
                onDrop={(e) => handleManualDrop(e, index)}
                onDragEnd={handleManualDragEnd}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                    marginRight: '8px',
                    padding: '4px'
                  }}
                  title="Drag to reorder"
                >
                  <Move size={14} color="#64748b" />
                </div>
                {section.name || `Template ${index + 1}`}
                <div
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionDeleteClick(activePageIndex, index, section.name || `Section ${index + 1}`);
                  }}
                  title="Delete Section"
                >
                  <X size={14} />
                </div>
                <TabCount $active={index === activeSectionTab}>
                  {section.questions?.length || 0}
                </TabCount>
              </SectionTab>
            );
          })}
        </div>
        <button
          onClick={addSection}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-navy)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    );
  };



  return (
    <PageContainer>
      {loading && <SkeletonLoader />}

      {saveMessage && (
        <Alert severity="success" sx={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999 }}>
          {saveMessage}
        </Alert>
      )}

      {saveError && (
        <Alert severity="error" sx={{ position: 'fixed', top: '16px', right: '16px', zIndex: 9999 }}>
          {saveError}
        </Alert>
      )}

      <Header>
        <HeaderTitleGroup>
          <BackButton onClick={handleBack}>
            <ChevronLeft size={20} />
            {t('common.back')}
          </BackButton>
          <h1>{id ? t('common.editTemplate') : t('common.createTemplate')}</h1>
        </HeaderTitleGroup>
        <HeaderActions>
          {!id && (
            <HeaderImportGroup>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleTemplateImport}
                style={{ display: 'none' }}
              />
              <input
                ref={excelImportInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleTemplateExcelImport}
                style={{ display: 'none' }}
              />
              <HeaderActionButton onClick={handleImportButtonClick} disabled={loading}>
                <Upload size={16} />
                {t('inspections.importTemplate')}
              </HeaderActionButton>
              <HeaderActionButton onClick={handleDownloadSampleTemplate} disabled={loading} data-agent-action="inspection_templates.download.sample_json">
                <Download size={16} />
                {t('inspections.sampleTemplate')}
              </HeaderActionButton>
              <HeaderActionButton onClick={handleExcelImportButtonClick} disabled={loading}>
                <Upload size={16} />
                {t('inspections.importExcelTemplate')}
              </HeaderActionButton>
              <HeaderActionButton onClick={handleDownloadSampleExcelTemplate} disabled={loading} data-agent-action="inspection_templates.download.sample_excel">
                <Download size={16} />
                {t('inspections.sampleExcelTemplate')}
              </HeaderActionButton>
            </HeaderImportGroup>
          )}
          <HeaderUtilityGroup>
            <HeaderActionButton onClick={() => setIsActivityHistoryOpen(true)}>
              <History size={16} />
              {t('common.activity')}
            </HeaderActionButton>
            <HeaderActionButton onClick={() => setIsMobilePreviewOpen(true)}>
              <Smartphone size={16} />
              {t('common.preview')}
            </HeaderActionButton>
            <HeaderActionButton onClick={toggleGuide}>
              <HelpCircle size={16} />
              {t('common.guide')}
            </HeaderActionButton>
          </HeaderUtilityGroup>
          <HeaderSaveGroup>
            <InspectionSaveButton onClick={handleSave} disabled={loading}>
              <Save size={16} />
              {id ? t('common.updateTemplate') : t('common.save')}
            </InspectionSaveButton>
          </HeaderSaveGroup>
        </HeaderActions>
      </Header>

      {/* Main tabs navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        width: '100%',
        padding: '4px',
        gap: '8px'
      }}>
        <div
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease',
            backgroundColor: activeTab === 'basic-info' ? 'rgba(59, 73, 223, 0.15)' : 'transparent',
            backdropFilter: activeTab === 'basic-info' ? 'blur(10px)' : 'none',
            boxShadow: activeTab === 'basic-info' ? '0 4px 12px rgba(59, 73, 223, 0.2)' : 'none',
            color: activeTab === 'basic-info' ? 'var(--color-navy)' : '#64748b',
            fontWeight: activeTab === 'basic-info' ? '700' : '500',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setActiveTab('basic-info')}
        >
          {t('common.basicInformation')}
        </div>
        <div
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease',
            backgroundColor: activeTab === 'pages-questions' ? 'rgba(59, 73, 223, 0.15)' : 'transparent',
            backdropFilter: activeTab === 'pages-questions' ? 'blur(10px)' : 'none',
            boxShadow: activeTab === 'pages-questions' ? '0 4px 12px rgba(59, 73, 223, 0.2)' : 'none',
            color: activeTab === 'pages-questions' ? 'var(--color-navy)' : '#64748b',
            fontWeight: activeTab === 'pages-questions' ? '700' : '500',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setActiveTab('pages-questions')}
        >
          {t('common.pagesAndQuestions')}
        </div>
        <div
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.3s ease',
            backgroundColor: activeTab === 'report' ? 'rgba(59, 73, 223, 0.15)' : 'transparent',
            backdropFilter: activeTab === 'report' ? 'blur(10px)' : 'none',
            boxShadow: activeTab === 'report' ? '0 4px 12px rgba(59, 73, 223, 0.2)' : 'none',
            color: activeTab === 'report' ? 'var(--color-navy)' : '#64748b',
            fontWeight: activeTab === 'report' ? '700' : '500',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setActiveTab('report')}
        >
          {t('common.report')}
        </div>
      </div>

      {isGuideOpen && (
        <div className="guide-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: window.innerWidth <= 480 ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: window.innerWidth <= 480 ? '0' : '20px 16px 16px 16px',
          boxSizing: 'border-box'
        }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleGuide();
            }
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: window.innerWidth <= 480 ? '12px 12px 0 0' : '8px',
            width: '700px',
            maxWidth: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: window.innerWidth <= 480 ? '16px' : '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--color-navy)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                flex: 1,
                minWidth: 0
              }}>
                <HelpCircle size={20} style={{ flexShrink: 0 }} />
                <span>{t('common.templateCreationGuide')}</span>
              </h2>
              <button
                onClick={toggleGuide}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#64748b',
                  flexShrink: 0,
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginTop: 0, color: '#64748b' }}>{t('common.followTheseStepsToCreate')}</p>

              <div style={{
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: 'var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    background: 'var(--color-navy)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>1</div>
                  {t('common.basicInformation')}
                </h3>
                <p style={{ margin: '0 0 8px 32px', color: '#475569' }}>
                  {t('common.startByFillingOut')}
                </p>
                <ul style={{ paddingLeft: '48px', margin: '0', color: '#64748b' }}>
                  <li>{t('common.templateNameIsRequired')}</li>
                  <li>{t('common.chooseAnAppropriateType')}</li>
                  <li>{t('common.addAClearDescription')}</li>
                </ul>
              </div>

              <div style={{
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: 'var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    background: 'var(--color-navy)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>2</div>
                  {t('common.pagesAndQuestions')}
                </h3>
                <p style={{ margin: '0 0 8px 32px', color: '#475569' }}>
                  {t('common.createTheStructureOfYourTemplate')}
                </p>
                <ul style={{ paddingLeft: '48px', margin: '0', color: '#64748b' }}>
                  <li>{t('common.addPagesToOrganize')}</li>
                  <li>{t('common.addTemplateLevelsToEachPage')}</li>
                  <li>{t('common.createQuestionsWithAppropriateTypes')}</li>
                  <li>{t('common.configureScoringForQuestions')}</li>
                </ul>
              </div>

              <div style={{
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: 'var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    background: 'var(--color-navy)',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>3</div>
                  {t('common.reportPreviewAndPublishing')}
                </h3>
                <p style={{ margin: '0 0 8px 32px', color: '#475569' }}>
                  {t('common.previewYourTemplateAndPublish')}
                </p>
                <ul style={{ paddingLeft: '48px', margin: '0', color: '#64748b' }}>
                  <li>{t('common.useTheReportTabToPreview')}</li>
                  <li>{t('common.saveYourTemplateFrequently')}</li>
                  <li>{t('common.clickPublishWhenReady')}</li>
                </ul>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px'
            }}>
              <Button
                onClick={toggleGuide}
                style={{
                  backgroundColor: 'var(--color-navy)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {t('common.gotIt')}!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information Tab */}
      {activeTab === 'basic-info' && (
        <InspectionFormSection>
          <h3 style={{ marginBottom: "20px" }}>{t('common.basicInformation')}</h3>
          <InspectionFormRow>
            <InspectionFormGroup>
              <Label>{t('common.templateName')}*</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('common.enterTemplateName')}
                required
              />
            </InspectionFormGroup>
            <InspectionFormGroup>
              <Label>{t('common.type')}</Label>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">{t('common.selectType')}</option>
                {assetTypes.map(type => (
                  <option key={type._id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </InspectionFormGroup>
          </InspectionFormRow>
          <InspectionFormRow>
            <InspectionFormGroup>
              <Label>{t('common.description')}</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('common.enterDescription')}
                rows={3}
              />
            </InspectionFormGroup>
          </InspectionFormRow>
          <InspectionFormRow>
            {/* <InspectionFormGroup>
              <Label>Priority</Label>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{ 
                  borderLeft: `4px solid ${
                    formData.priority === 'high' ? '#EF4444' : 
                    formData.priority === 'medium' ? '#F59E0B' : 
                    formData.priority === 'low' ? '#10B981' : '#94A3B8'
                  }`
                }}
              >
                <option value="">Select priority</option>
                <option value="low" style={{color: '#10B981'}}>
                  Low
                </option>
                <option value="medium" style={{color: '#F59E0B'}}>
                  Medium
                </option>
                <option value="high" style={{color: '#B91C1C'}}>
                  High
                </option>
              </Select>
            </InspectionFormGroup>
            <InspectionFormGroup>
              <Label>Requirement Type</Label>
              <Select
                name="requirementType"
                value={formData.requirementType || ""}
                onChange={handleChange}
                style={{ 
                  borderLeft: `4px solid ${
                    formData.requirementType === 'mandatory' ? '#B91C1C' : 
                    formData.requirementType === 'recommended' ? '#1E40AF' : '#94A3B8'
                  }`
                }}
              >
                <option value="">Select type</option>
                <option value="mandatory" style={{color: '#B91C1C'}}>
                  Mandatory
                </option>
                <option value="recommended" style={{color: '#1E40AF'}}>
                  Recommended
                </option>
              </Select>
            </InspectionFormGroup> */}
            <InspectionFormGroup>
              <Label>{t('common.status')}</Label>
              <InspectionStatusBadge status={formData.status}>
                {formData.status === 'draft' ? t('common.draft') : t('common.published')}
              </InspectionStatusBadge>
            </InspectionFormGroup>
          </InspectionFormRow>

          {/* Navigation Buttons for Basic Information Tab */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              onClick={() => setActiveTab('pages-questions')}
              style={{
                background: 'var(--color-navy)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#151b60'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#151b60';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--color-navy)';
              }}
            >
              {t('common.next')}
              <ChevronRight size={16} />
            </Button>
          </div>
        </InspectionFormSection>
      )}

      {/* Pages and Questions Tab */}
      {activeTab === 'pages-questions' && (
        <InspectionFormSection>
          <h3 style={{ marginBottom: "20px" }}>{t('common.pagesAndQuestions')}</h3>

          {formData.pages.length > 0 && (
            <>
              {renderPageTabs()}

              <div style={{ padding: '24px' }}>
                <InspectionFormRow>
                  <InspectionFormGroup>
                    <Label>{t('common.pageName')}</Label>
                    <Input
                      value={formData.pages[activePageIndex].name}
                      onChange={(e) => updatePage(activePageIndex, { name: e.target.value })}
                      placeholder={t('common.enterPageName')}
                    />
                  </InspectionFormGroup>
                  <InspectionFormGroup>
                    <Label>{t('common.pageDescription')}</Label>
                    <TextArea
                      value={formData.pages[activePageIndex].description}
                      onChange={(e) => updatePage(activePageIndex, { description: e.target.value })}
                      placeholder={t('common.enterPageDescription')}
                      rows={2}
                    />
                  </InspectionFormGroup>
                </InspectionFormRow>

                <SectionsWrapper>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4>{t('common.templateLevels')}</h4>
                    <Button onClick={addSection}>
                      <Plus size={16} style={{ marginRight: '4px' }} />
                      {t('common.addTemplateLevel')}
                    </Button>
                  </div>

                  {/* Render section tabs with native drag-and-drop support */}
                  {formData.pages && formData.pages.length > 0 && activePageIndex >= 0 && activePageIndex < formData.pages.length
                    ? renderSectionTabs(activePageIndex)
                    : renderSectionTabs(0) // Fallback to page 0 if activePageIndex is invalid
                  }

                  {formData.pages[activePageIndex].sections && formData.pages[activePageIndex].sections.length > 0 ? (
                    <>
                      {formData.pages[activePageIndex].sections[activeSectionTab] && (
                        <div>
                          <InspectionFormRow>
                            <InspectionFormGroup>
                              <Label>{t('common.templateLevelName')}</Label>
                              <Input
                                value={formData.pages[activePageIndex].sections[activeSectionTab].name || ''}
                                onChange={(e) => updateSection(activeSectionTab, { name: e.target.value })}
                                placeholder={t('common.enterTemplateLevelName')}
                              />
                            </InspectionFormGroup>
                            <InspectionFormGroup>
                              <Label>{t('common.templateLevelDescription')}</Label>
                              <TextArea
                                value={formData.pages[activePageIndex].sections[activeSectionTab].description || ''}
                                onChange={(e) => updateSection(activeSectionTab, { description: e.target.value })}
                                placeholder={t('common.enterTemplateLevelDescription')}
                                rows={2}
                              />
                            </InspectionFormGroup>
                          </InspectionFormRow>

                          <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h5>Questions</h5>
                              <Button onClick={() => addQuestion(activeSectionTab)}>
                                <Plus size={16} style={{ marginRight: '4px' }} />
                                {t('common.addQuestion')}
                              </Button>
                            </div>

                            {activeSectionQuestions.length > 0 ? (
                              <>
                                <QuestionTable>
                                  <QuestionTableHeader>
                                    <div style={{ width: '40px' }}>#</div>
                                    <div>Question</div>
                                    <div>Type</div>
                                    <div>Actions</div>
                                  </QuestionTableHeader>

                                  {visibleActiveSectionQuestions.map((question, visibleQuestionIndex) => {
                                    const questionIndex = questionPageStartIndex + visibleQuestionIndex;

                                    return (
                                      <QuestionItemComponent
                                        key={question.id || question._id || questionIndex}
                                        question={question}
                                        questionIndex={questionIndex}
                                        loading={loading}
                                        updateQuestion={(updatedQuestion) => updateQuestion(activeSectionTab, questionIndex, updatedQuestion)}
                                        removeQuestion={() => removeQuestion(activeSectionTab, questionIndex)}
                                        onMoveQuestion={() => openMoveQuestionModal(activeSectionTab, questionIndex)}
                                        sectionIndex={activeSectionTab}
                                        isDragging={draggingQuestionIndex === questionIndex}
                                        onQuestionDragStart={handleQuestionDragStart}
                                        onQuestionDragOver={handleQuestionDragOver}
                                        onQuestionDrop={handleQuestionDrop}
                                        onQuestionDragEnd={handleQuestionDragEnd}
                                      />
                                    );
                                  })}
                                </QuestionTable>

                                {totalQuestionPages > 1 && (
                                  <QuestionPagination
                                    currentPage={clampedQuestionPage}
                                    totalPages={totalQuestionPages}
                                    onPageChange={setQuestionPage}
                                  />
                                )}
                              </>
                            ) : (
                              <TabEmptyState>
                                <FileText size={32} />
                                <p>No questions added yet</p>
                                <Button onClick={() => addQuestion(activeSectionTab)}>
                                  <Plus size={16} style={{ marginRight: '4px' }} />
                                  {t('common.addQuestion')}
                                </Button>
                              </TabEmptyState>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <TabEmptyState>
                      <Layers size={32} />
                      <p>No template levels added yet</p>
                      <Button onClick={addSection}>
                        <Plus size={16} style={{ marginRight: '4px' }} />
                        Add Template
                      </Button>
                    </TabEmptyState>
                  )}
                </SectionsWrapper>
              </div>
            </>
          )}

          {formData.pages.length === 0 && (
            <TabEmptyState>
              <FileText size={32} />
              <p>No pages added yet</p>
              <Button onClick={addPage}>
                <Plus size={16} style={{ marginRight: '4px' }} />
                Add Page
              </Button>
            </TabEmptyState>
          )}

          {/* Navigation Buttons for Pages and Questions Tab */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              onClick={() => setActiveTab('basic-info')}
              style={{
                background: 'white',
                color: 'var(--color-navy)',
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </Button>

            <Button
              onClick={() => setActiveTab('report')}
              style={{
                background: 'var(--color-navy)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#151b60';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--color-navy)';
              }}
            >
              {t('common.next')}
              <ChevronRight size={16} />
            </Button>
          </div>
        </InspectionFormSection>
      )}

      {/* Report Preview Tab */}
      {activeTab === 'report' && (
        <InspectionFormSection>
          <h3 style={{ marginBottom: "20px" }}>{t('common.reportPreview')}</h3>

          {!formData.pages || formData.pages.length === 0 ? (
            <TabEmptyState>
              <FileText size={32} />
              <p>{t('common.pleaseAddAtLeastOnePage')}</p>
              <Button onClick={() => setActiveTab('pages-questions')}>
                {t('common.goToPagesAndQuestions')}
              </Button>
            </TabEmptyState>
          ) : (
            <div style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <ReportPreviewComponent reportData={reportPreviewData || getEmptyReportTemplate()} />
            </div>
          )}

          {/* Navigation Buttons for Report Tab */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              onClick={() => setActiveTab('pages-questions')}
              style={{
                background: 'white',
                color: 'var(--color-navy)',
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <ChevronLeft size={16} />
              {t('common.back')}
            </Button>
          </div>
        </InspectionFormSection>
      )}

      {/* Modals */}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmPublish}
          title={getPublishModalText().title}
          message={getPublishModalText().message}
          confirmText={formData.status === 'active' ? 'Unpublish' : 'Publish'}
        />
      )}

      {isDiscardModalOpen && (
        <DiscardConfirmationModal
          isOpen={isDiscardModalOpen}
          onClose={() => setIsDiscardModalOpen(false)}
          onCancel={() => {
            // Navigate to /inspection on cancel (keep data in localStorage)
            navigate('/inspection');
          }}
          onConfirm={() => {
            // Clear localStorage and navigate on discard
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            hasShownRestoreToast.current = false;
            navigate('/inspection');
          }}
        />
      )}

      {isMobilePreviewOpen && (
        <MobilePreviewPanel
          isOpen={isMobilePreviewOpen}
          onClose={() => setIsMobilePreviewOpen(false)}
          formData={formData}
          activeSetIndex={activePageIndex}
        />
      )}

      {isActivityHistoryOpen && (
        <ActivityHistoryCard
          formData={formData}
          activities={activities}
          isOpen={isActivityHistoryOpen}
          onClose={() => setIsActivityHistoryOpen(false)}
        />
      )}

      {isMoveQuestionModalOpen && selectedQuestion && (
        <MoveQuestionModal
          isOpen={isMoveQuestionModalOpen}
          onClose={() => setIsMoveQuestionModalOpen(false)}
          question={selectedQuestion}
          questionIndex={selectedQuestionIndex}
          allPages={formData.pages}
          currentPageIndex={activePageIndex}
          currentSectionIndex={activeSectionIndex}
          onMoveQuestion={handleMoveQuestion}
        />
      )}

      {/* Page deletion confirmation modal */}
      {showPageDeleteModal && (
        <ConfirmationModal
          isOpen={showPageDeleteModal}
          onClose={() => setShowPageDeleteModal(false)}
          onConfirm={confirmPageDelete}
          title="Delete Page"
          message={`Are you sure you want to delete this page: "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Section deletion confirmation modal */}
      {showSectionDeleteModal && (
        <ConfirmationModal
          isOpen={showSectionDeleteModal}
          onClose={() => setShowSectionDeleteModal(false)}
          onConfirm={confirmSectionDelete}
          title="Delete Section"
          message={`Are you sure you want to delete this section: "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </PageContainer>
  );
};

export default InspectionLevelForm;
