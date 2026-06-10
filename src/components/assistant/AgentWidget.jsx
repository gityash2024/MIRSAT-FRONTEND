import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Activity,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  Copy,
  Loader,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  MousePointer2,
  Paperclip,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
  History,
  Plus,
  Pin,
  Trash2,
  Download,
  RefreshCw,
  Square,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Sun,
  Moon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// Allow the custom record:// protocol on links so the agent can emit clickable record chips.
const markdownSanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href || []), 'record'],
  },
};
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import agentService from '../../services/agent.service';
import { captureAgentFormSession, runAgentActions } from './actionBridge';
import ArtifactCard from './ArtifactCard';

const copy = {
  en: {
    title: 'MIRSAT Assistant', subtitle: 'Text and voice support', welcome: 'How can I help with your portal work?',
    placeholder: 'Ask about tasks, assets, users, or forms...', approve: 'Approve',
    reject: 'Reject', thinking: 'Thinking...', unavailable: 'The assistant could not complete that request.',
    textUnavailable: 'Text assistant is not configured.', stagedDraft: 'Staged form draft', missingFields: 'Missing required fields',
    voice: 'Voice', sendTranscript: 'Send transcript', clearTranscript: 'Clear', startBrowserVoice: 'Start voice',
    stopVoice: 'Stop voice', liveTranscript: 'Live transcript preview', copyMessage: 'Copy message',
    memory: 'Agent memory', memoryPlaceholder: 'Add default instructions for this agent, like preferred tone, common departments, naming rules, or demo behavior...',
    expandInput: 'Expand composer', collapseInput: 'Collapse composer',
  },
  ar: {
    title: 'مساعد مرساة', subtitle: 'دعم النص والصوت', welcome: 'كيف يمكنني مساعدتك في عمل البوابة؟',
    placeholder: 'اسأل عن المهام أو الأصول أو المستخدمين أو النماذج...',
    approve: 'موافقة', reject: 'رفض', thinking: 'جارٍ التفكير...', unavailable: 'تعذر على المساعد إكمال هذا الطلب.',
    textUnavailable: 'المساعد النصي غير مهيأ.', stagedDraft: 'مسودة النموذج المحفوظة', missingFields: 'الحقول المطلوبة الناقصة',
    voice: 'الصوت', sendTranscript: 'إرسال النص', clearTranscript: 'مسح', startBrowserVoice: 'بدء الصوت',
    stopVoice: 'إيقاف الصوت', liveTranscript: 'معاينة النص المباشر', copyMessage: 'نسخ الرسالة',
    memory: 'ذاكرة المساعد', memoryPlaceholder: 'أضف تعليمات افتراضية للمساعد...',
    expandInput: 'توسيع مربع الكتابة', collapseInput: 'تصغير مربع الكتابة',
  },
};

const VOICE_BAR_COUNT = 38;
const idleVoiceLevels = () => Array.from({ length: VOICE_BAR_COUNT }, (_, index) => {
  const center = Math.abs(index - (VOICE_BAR_COUNT - 1) / 2) / (VOICE_BAR_COUNT / 2);
  return 0.14 + (1 - center) * 0.08;
});

const Launcher = styled.button`
  position: fixed;
  z-index: 1300;
  ${props => props.$rtl ? 'left: 0' : 'right: 0'};
  top: auto;
  bottom: 96px;
  width: 24px;
  height: 260px;
  border: 0;
  border-radius: ${props => props.$rtl ? '0 16px 16px 0' : '16px 0 0 16px'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(180deg, rgba(26, 58, 95, .98), rgba(44, 151, 153, .96));
  box-shadow: 0 18px 38px rgba(26, 58, 95, 0.24);
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 180ms ease, filter 180ms ease;
  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 4px;
    right: 4px;
    height: 54px;
    border-radius: 999px;
    background-image: radial-gradient(circle, rgba(255,255,255,.72) 1px, transparent 1.7px);
    background-size: 7px 7px;
    background-position: center;
    opacity: .74;
  }
  &::before { top: 12px; }
  &::after { bottom: 12px; }
  &:hover {
    box-shadow: 0 20px 42px rgba(26, 58, 95, 0.32);
    filter: brightness(1.04);
  }
  svg { filter: drop-shadow(0 5px 10px rgba(0,0,0,.25)); }
  @media (max-width: 600px) {
    top: auto;
    bottom: 92px;
    width: 22px;
    height: 210px;
    &::before,
    &::after {
      left: 4px;
      right: 4px;
      height: 38px;
    }
    &::before { top: 10px; }
    &::after { bottom: 10px; }
    &:hover { filter: brightness(1.04); }
  }
`;

const LauncherContent = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  writing-mode: vertical-rl;
  transform: translate(-50%, -50%) rotate(180deg);
  color: rgba(255, 255, 255, .96);
`;

const LauncherText = styled.span`
  font-size: 7px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: .03em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const Panel = styled.section`
  position: fixed;
  z-index: 1301;
  ${props => props.$rtl ? 'left: 22px' : 'right: 22px'};
  bottom: 20px;
  width: min(540px, calc(100vw - 32px));
  height: min(760px, calc(100vh - 40px));
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  background: rgba(255, 255, 255, .96);
  border: 1px solid rgba(214, 229, 237, .95);
  border-radius: 16px;
  box-shadow: 0 24px 78px rgba(25, 46, 65, 0.28);
  backdrop-filter: blur(16px);
  direction: ${props => props.$rtl ? 'rtl' : 'ltr'};
  transform-origin: ${props => props.$rtl ? 'left center' : 'right center'};
  animation: shutterIn 420ms cubic-bezier(.16, 1, .3, 1) both;
  @keyframes shutterIn {
    0% {
      opacity: 0;
      transform: translateX(${props => props.$rtl ? '-52px' : '52px'}) scaleX(.88) scaleY(.985);
      filter: blur(10px);
      clip-path: inset(0 ${props => props.$rtl ? '100% 0 0' : '0 0 0 100%'} round 16px);
    }
    58% {
      opacity: 1;
      transform: translateX(${props => props.$rtl ? '5px' : '-5px'}) scaleX(1.012);
      filter: blur(0);
      clip-path: inset(0 0 0 0 round 16px);
    }
    100% {
      opacity: 1;
      transform: translateX(0) scaleX(1);
      filter: blur(0);
      clip-path: inset(0 0 0 0 round 16px);
    }
  }
  @media (max-width: 600px) {
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: min(86vh, 760px);
    border-radius: 16px 16px 0 0;
  }
  /* Assistant-scoped dark mode (never touches app-wide :root / MUI theme). */
  &[data-agent-theme='dark'] {
    background: rgba(17, 24, 36, .97);
    border-color: #2b3a4f;
    color-scheme: dark;
  }
`;

const Header = styled.header`
  min-height: 64px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  background: linear-gradient(135deg, var(--color-navy), #255d78 58%, var(--color-teal));
`;
const HeaderText = styled.div`flex: 1; min-width: 0; strong, span { display: block; } strong { font-size: 15px; } span { font-size: 12px; opacity: .84; margin-top: 2px; }`;
const HeaderButton = styled.button`width: 36px; height: 36px; border: 1px solid rgba(255,255,255,.18); border-radius: 9px; display: grid; place-items: center; background: rgba(255,255,255,.12); color: #fff; cursor: pointer; &:hover { background: rgba(255,255,255,.2); }`;
const Messages = styled.div`
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(180deg, #f7f9fa, #eef4f6);
  [data-agent-theme='dark'] & { background: linear-gradient(180deg, #141d2c, #101826); }
`;
const SuggestedPrompts = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 8px 0 4px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const PromptChip = styled.button`
  text-align: start;
  padding: 10px 12px;
  border: 1px solid var(--color-gray-light);
  border-radius: 10px;
  background: #fff;
  color: var(--color-navy);
  font-size: 12px;
  line-height: 1.35;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
  &:hover { border-color: var(--color-teal); background: #f4fbfb; }
  [data-agent-theme='dark'] & { background: #1c2738; border-color: #2b3a4f; color: #cfe3ea; &:hover { background: #21314a; } }
`;
const MessageGroup = styled.div`
  position: relative;
  width: fit-content;
  max-width: 90%;
  margin: ${props => props.$user ? '0 0 12px auto' : '0 auto 12px 0'};
  &:hover .message-tools { opacity: 1; transform: translateY(0); pointer-events: auto; }
`;
const Bubble = styled.div`
  width: fit-content;
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: ${props => props.$user ? '#fff' : 'var(--color-gray-dark)'};
  background: ${props => props.$user ? 'linear-gradient(135deg, var(--color-teal), #397f96)' : '#fff'};
  border: ${props => props.$user ? 'none' : '1px solid var(--color-gray-light)'};
  box-shadow: ${props => props.$user ? '0 8px 18px rgba(44,151,153,.22)' : '0 8px 18px rgba(25,46,65,.06)'};
  [data-agent-theme='dark'] & {
    color: ${props => props.$user ? '#fff' : '#dbe4ee'};
    background: ${props => props.$user ? 'linear-gradient(135deg, var(--color-teal), #2b5e72)' : '#1c2738'};
    border-color: ${props => props.$user ? 'transparent' : '#2b3a4f'};
  }
`;
const MessageText = styled.div`
  strong { font-weight: 800; color: inherit; }
  p { margin: 0 0 7px; }
  p:last-child { margin-bottom: 0; }
  ul, ol { margin: 0; padding-inline-start: 18px; }
  li { margin: 3px 0; }
  h1, h2, h3, h4 { margin: 6px 0 4px; font-size: 14px; font-weight: 800; color: inherit; }
  a { color: var(--color-teal); text-decoration: underline; }
  code { background: rgba(25,46,65,.08); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  pre { margin: 6px 0; padding: 8px; border-radius: 7px; background: rgba(25,46,65,.08); overflow-x: auto; }
  pre code { background: transparent; padding: 0; }
  blockquote { margin: 6px 0; padding-inline-start: 10px; border-inline-start: 3px solid var(--color-seafoam, #bfe3e3); color: #475467; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
  th, td { border: 1px solid rgba(25,46,65,.16); padding: 5px 8px; text-align: start; }
  th { background: rgba(44,151,153,.12); font-weight: 700; }
`;
const MessageTools = styled.div`
  position: absolute;
  ${props => props.$user ? 'right: 4px;' : 'left: 4px;'}
  bottom: -24px;
  display: flex;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-3px);
  transition: opacity 120ms ease, transform 120ms ease;
  button {
    width: 24px;
    height: 24px;
    border: 1px solid rgba(214,229,237,.95);
    border-radius: 7px;
    display: grid;
    place-items: center;
    color: var(--color-navy);
    background: rgba(255,255,255,.92);
    cursor: pointer;
  }
`;
const Pending = styled.div`margin: 8px 0 12px; padding: 11px; border: 1px solid #dfbe7f; border-radius: 7px; background: #fffaf0; font-size: 12px; color: var(--color-gray-dark);`;
const PendingMeta = styled.div`
  margin-top: 8px;
  display: grid;
  gap: 5px;
  color: #475467;
  code { display: inline-block; max-width: 100%; padding: 2px 5px; border-radius: 4px; background: rgba(223,190,127,.18); white-space: normal; word-break: break-word; }
  .blast { color: #b54708; font-weight: 600; }
`;
const DiffTable = styled.div`
  display: grid;
  gap: 3px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255,255,255,.6);
  .diff-row { display: flex; align-items: baseline; gap: 6px; font-size: 11px; }
  .field { min-width: 80px; font-weight: 700; color: var(--color-navy); }
  .from { color: #b42318; text-decoration: line-through; word-break: break-word; }
  .arrow { color: #667085; }
  .to { color: #067647; font-weight: 600; word-break: break-word; }
`;
const ActionList = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin: -4px 0 10px;`;
const ActionChip = styled.button`min-height: 29px; padding: 0 9px; border: 1px solid var(--color-teal); border-radius: 14px; background: #fff; color: var(--color-navy); font-size: 11px; cursor: pointer;`;
const DraftPreview = styled.div`
  margin: -4px 0 10px;
  padding: 10px;
  border: 1px solid var(--color-seafoam);
  border-radius: 7px;
  background: #f4fbfb;
  font-size: 11px;
  color: var(--color-gray-dark);
  strong { display: block; margin-bottom: 6px; }
  ul { margin: 5px 0 0; padding-inline-start: 18px; }
`;
const Row = styled.div`display: flex; gap: 7px; margin-top: 9px;`;
const SmallButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 32px; padding: 0 10px;
  border: 1px solid ${props => props.$reject ? '#dc2434' : 'var(--color-teal)'};
  border-radius: 6px; background: ${props => props.$reject ? '#fff' : 'var(--color-teal)'};
  color: ${props => props.$reject ? '#b42318' : '#fff'}; font-size: 12px; cursor: pointer;
`;
const ActivityStrip = styled.div`
  min-height: 36px;
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-top: 1px solid rgba(214,229,237,.9);
  background: rgba(244,251,251,.9);
  color: var(--color-navy);
  font-size: 12px;
  svg { color: var(--color-teal); }
  [data-agent-theme='dark'] & { background: #16202f; border-top-color: #2b3a4f; color: #cfe3ea; }
`;
const ComposerShell = styled.div`
  border-top: 1px solid var(--color-gray-light);
  background: rgba(255,255,255,.98);
  [data-agent-theme='dark'] & { background: #16202f; border-top-color: #2b3a4f; }
`;
const MemoryPanel = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid rgba(214,229,237,.9);
  background: #f7fbfb;
  label { display: block; margin-bottom: 6px; color: var(--color-navy); font-size: 12px; font-weight: 700; }
  textarea {
    width: 100%;
    min-height: 86px;
    border: 1px solid rgba(44,151,153,.35);
    border-radius: 10px;
    padding: 9px;
    resize: vertical;
    font: inherit;
    font-size: 12px;
    outline-color: var(--color-teal);
  }
`;
const Composer = styled.form`display: grid; grid-template-columns: 38px 1fr 38px; gap: 8px; padding: 12px; align-items: end;`;
const InputWrap = styled.div`position: relative;`;
const Input = styled.textarea`
  min-height: ${props => props.$expanded ? '156px' : '54px'};
  max-height: ${props => props.$expanded ? '280px' : '190px'};
  width: 100%;
  overflow-y: auto;
  resize: vertical;
  padding: 11px 38px 11px 11px;
  border: 1px solid ${props => props.$voice ? 'var(--color-teal)' : 'var(--color-gray-light)'};
  border-radius: 12px;
  background: ${props => props.$voice ? '#f4fbfb' : '#fff'};
  font: inherit;
  font-size: 13px;
  line-height: 1.45;
  outline-color: var(--color-teal);
  color: var(--color-gray-dark);
  [data-agent-theme='dark'] & { background: ${props => props.$voice ? '#152b30' : '#0f1722'}; color: #dbe4ee; border-color: #2b3a4f; &::placeholder { color: #6b7a8f; } }
`;
const InputUtility = styled.button`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 7px;
  display: grid;
  place-items: center;
  color: var(--color-navy);
  background: #edf5f7;
  cursor: pointer;
`;
const IconButton = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid ${props => props.$active ? 'var(--color-teal)' : 'var(--color-gray-light)'};
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: ${props => props.$active ? '#fff' : 'var(--color-navy)'};
  background: ${props => props.$active ? 'linear-gradient(135deg, var(--color-teal), #397f96)' : '#fff'};
  cursor: pointer;
  &:disabled { opacity: .5; cursor: not-allowed; }
`;
const SendButton = styled(IconButton)`background: var(--color-navy); color: #fff; border-color: var(--color-navy);`;
const VoiceWave = styled.div`
  display: ${props => props.$active ? 'flex' : 'none'};
  align-items: center;
  gap: 2px;
  min-height: 42px;
  padding: 8px 16px 4px 58px;
  span {
    width: 3px;
    height: 34px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(26,58,95,.74), var(--color-teal));
    transform: scaleY(var(--voice-level, .16));
    transform-origin: center;
    opacity: ${props => props.$listening ? '.95' : '.5'};
    transition: transform 70ms linear, opacity 180ms ease;
  }
  @media (max-width: 600px) {
    min-height: 54px;
    padding-inline-start: 16px;
    span { width: 4px; height: 44px; }
  }
`;
const ComposerMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px 10px 58px;
  color: #667085;
  font-size: 11px;
  button { border: 0; background: transparent; color: var(--color-teal); cursor: pointer; padding: 0; }
`;
const ComposerExtras = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px 0;
`;
const ExtraButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 9px;
  border: 1px solid ${props => (props.$active ? 'var(--color-teal)' : 'var(--color-gray-light)')};
  border-radius: 14px;
  background: ${props => (props.$active ? 'var(--color-teal)' : '#fff')};
  color: ${props => (props.$active ? '#fff' : 'var(--color-navy)')};
  font-size: 11px;
  cursor: pointer;
  &:disabled { opacity: .6; cursor: not-allowed; }
`;
const AttachChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 8px;
  border-radius: 13px;
  background: #eef4f6;
  color: var(--color-navy);
  font-size: 11px;
  max-width: 160px;
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  button { border: 0; background: transparent; color: #b42318; cursor: pointer; padding: 0; display: grid; place-items: center; }
`;
const ImageThumb = styled.span`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-gray-light);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  button {
    position: absolute;
    top: 2px;
    ${props => (props.$rtl ? 'left: 2px' : 'right: 2px')};
    width: 18px;
    height: 18px;
    border: 0;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(15,23,42,.72);
    color: #fff;
    cursor: pointer;
    padding: 0;
  }
`;
const StepFeed = styled.div`
  margin: 0 0 10px;
  padding: 8px 10px;
  border: 1px solid #d6e5ed;
  border-radius: 7px;
  background: #fff;
  font-size: 11px;
  color: #475467;
`;
const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  svg { flex-shrink: 0; color: ${props => props.$failed ? '#b42318' : 'var(--color-teal)'}; }
`;
const AgentCursor = styled.div`
  position: fixed;
  z-index: 1299;
  left: ${props => props.$x || 0}px;
  top: ${props => props.$y || 0}px;
  display: ${props => props.$visible ? 'flex' : 'none'};
  align-items: center;
  gap: 6px;
  pointer-events: none;
  transform: translate(-4px, -4px);
  transition: left 180ms ease, top 180ms ease, opacity 160ms ease;
  color: var(--color-navy);
  filter: drop-shadow(0 8px 14px rgba(26, 58, 95, .24));
  span {
    max-width: 190px;
    padding: 5px 7px;
    border-radius: 6px;
    background: var(--color-navy);
    color: #fff;
    font-size: 11px;
    white-space: nowrap;
  }
`;

const RecordChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border: 1px solid var(--color-teal);
  border-radius: 10px;
  background: #f4fbfb;
  color: var(--color-navy);
  font-size: 12px;
  cursor: pointer;
  vertical-align: baseline;
  &:hover { background: #e3f4f4; }
  [data-agent-theme='dark'] & { background: #1c2738; color: #cfe3ea; }
`;
const ComposerPopover = styled.div`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 8;
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid var(--color-gray-light);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(25,46,65,.16);
  button {
    display: flex; align-items: baseline; gap: 8px; padding: 8px 10px; border: 0; background: transparent; cursor: pointer; text-align: start; font-size: 12px;
    strong { color: var(--color-navy); }
    span { color: #667085; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    &:hover { background: #eef4f6; }
  }
`;
const ShortcutsOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 9;
  display: grid;
  place-items: center;
  background: rgba(15,23,42,.45);
  > div {
    width: min(360px, 88%);
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 24px 60px rgba(15,23,42,.3);
    h4 { margin: 0 0 10px; color: var(--color-navy); font-size: 14px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 12px; color: #475467; }
    kbd { padding: 1px 6px; border: 1px solid var(--color-gray-light); border-bottom-width: 2px; border-radius: 5px; background: #f8fafc; font-size: 11px; }
    button { margin-top: 10px; width: 100%; padding: 8px; border: 1px solid var(--color-teal); border-radius: 8px; background: var(--color-teal); color: #fff; font-size: 12px; cursor: pointer; }
  }
`;

const HistoryDrawer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  ${props => (props.$rtl ? 'right: 0' : 'left: 0')};
  width: 270px;
  max-width: 80%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-${props => (props.$rtl ? 'left' : 'right')}: 1px solid var(--color-gray-light);
  box-shadow: 0 12px 40px rgba(25,46,65,.18);
  [data-agent-theme='dark'] & { background: #16202f; color: #cfe3ea; }
  animation: drawerIn 180ms ease both;
  @keyframes drawerIn { from { transform: translateX(${props => (props.$rtl ? '100%' : '-100%')}); opacity: .4; } to { transform: translateX(0); opacity: 1; } }
`;
const HistoryHead = styled.div`
  display: flex; align-items: center; gap: 8px; padding: 12px; border-bottom: 1px solid var(--color-gray-light);
  strong { flex: 1; font-size: 13px; color: var(--color-navy); }
  button { border: 0; background: transparent; color: var(--color-navy); cursor: pointer; display: grid; place-items: center; }
`;
const HistorySearch = styled.input`
  margin: 8px 12px; padding: 7px 10px; border: 1px solid var(--color-gray-light); border-radius: 8px; font: inherit; font-size: 12px;
`;
const HistoryList = styled.div`flex: 1; overflow-y: auto; padding: 4px 8px 12px;`;
const HistoryItem = styled.div`
  display: flex; align-items: center; gap: 6px; padding: 8px 9px; border-radius: 8px; cursor: pointer; font-size: 12px; color: var(--color-gray-dark);
  &:hover { background: #eef4f6; }
  .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .acts { display: flex; gap: 2px; opacity: 0; }
  &:hover .acts { opacity: 1; }
  .acts button { border: 0; background: transparent; color: #667085; cursor: pointer; display: grid; place-items: center; }
  svg.pinned { color: var(--color-teal); }
`;

const AgentWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentLanguage, isRTL } = useLanguage();
  const t = copy[currentLanguage] || copy.en;
  const [capabilities, setCapabilities] = useState(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: t.welcome, welcome: true }]);
  const [conversationId, setConversationId] = useState();
  const [pendingAction, setPendingAction] = useState();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState();
  const [activityVisible, setActivityVisible] = useState(false);
  const [agentCursor, setAgentCursor] = useState({ visible: false, x: 0, y: 0, label: '' });
  const [speechSupported, setSpeechSupported] = useState(false);
  const [browserListening, setBrowserListening] = useState(false);
  const [speechPreview, setSpeechPreview] = useState('');
  const [voiceLevels, setVoiceLevels] = useState(() => idleVoiceLevels());
  const [lastAgentIntent, setLastAgentIntent] = useState();
  const [showMemory, setShowMemory] = useState(false);
  const [userMemory, setUserMemory] = useState(() => localStorage.getItem('mirsat.agent.userMemory') || '');
  const [inputExpanded, setInputExpanded] = useState(false);
  const [copiedMessageKey, setCopiedMessageKey] = useState();
  const [speakReplies, setSpeakReplies] = useState(() => localStorage.getItem('mirsat.agent.tts') === '1');
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speakRepliesRef = useRef(speakReplies);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [deepMode, setDeepMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [lastUserText, setLastUserText] = useState('');
  const [feedbackByKey, setFeedbackByKey] = useState({});
  const [undoable, setUndoable] = useState();
  const [followUps, setFollowUps] = useState([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [mention, setMention] = useState(null); // { trigger: '@'|'#', query, items }
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('mirsat.agent.dark') === '1');
  const undoTimerRef = useRef();
  const mentionTimerRef = useRef();
  const abortRef = useRef();
  const fileInputRef = useRef();
  const endRef = useRef();
  const inputRef = useRef();
  const recognitionRef = useRef();
  const finalSpeechRef = useRef('');
  const copyResetRef = useRef();
  const audioContextRef = useRef();
  const audioStreamRef = useRef();
  const voiceFrameRef = useRef();

  const role = String(user?.role || '').toLowerCase();
  const isAdminRoute = !location.pathname.startsWith('/user-dashboard') && !location.pathname.startsWith('/user-tasks');
  const canRender = ['admin', 'superadmin'].includes(role) && isAdminRoute;

  const stopVoiceMeter = useCallback(() => {
    if (voiceFrameRef.current) window.cancelAnimationFrame(voiceFrameRef.current);
    voiceFrameRef.current = undefined;
    audioStreamRef.current?.getTracks?.().forEach(track => track.stop());
    audioStreamRef.current = undefined;
    const closePromise = audioContextRef.current?.close?.();
    closePromise?.catch?.(() => {});
    audioContextRef.current = undefined;
    setVoiceLevels(idleVoiceLevels());
  }, []);

  const startVoiceMeter = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    stopVoiceMeter();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.68;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioContext;
      audioStreamRef.current = stream;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bucketSize = Math.max(1, Math.floor(data.length / VOICE_BAR_COUNT));
        const nextLevels = Array.from({ length: VOICE_BAR_COUNT }, (_, index) => {
          const start = index * bucketSize;
          const end = Math.min(data.length, start + bucketSize);
          let total = 0;
          for (let item = start; item < end; item += 1) total += data[item];
          const average = total / Math.max(1, end - start);
          const center = Math.abs(index - (VOICE_BAR_COUNT - 1) / 2) / (VOICE_BAR_COUNT / 2);
          const shaped = Math.pow(Math.min(1, average / 145), 0.72);
          return Math.min(1, 0.13 + shaped * 0.86 + (1 - center) * 0.08);
        });
        setVoiceLevels(nextLevels);
        voiceFrameRef.current = window.requestAnimationFrame(tick);
      };
      tick();
      return true;
    } catch (_error) {
      stopVoiceMeter();
      return false;
    }
  }, [stopVoiceMeter]);

  useEffect(() => {
    if (!canRender) {
      setCapabilities(null);
      return;
    }
    agentService.capabilities().then(setCapabilities).catch(() => setCapabilities(null));
  }, [canRender]);
  useEffect(() => {
    setSpeechSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop?.();
      stopVoiceMeter();
      window.clearTimeout(copyResetRef.current);
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
    };
  }, [stopVoiceMeter]);
  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === 'function') endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAction, loading]);
  useEffect(() => setMessages(current => current.length === 1 ? [{ role: 'assistant', content: t.welcome, welcome: true }] : current), [t.welcome]);
  useEffect(() => {
    localStorage.setItem('mirsat.agent.userMemory', userMemory);
  }, [userMemory]);
  useEffect(() => {
    speakRepliesRef.current = speakReplies;
    localStorage.setItem('mirsat.agent.tts', speakReplies ? '1' : '0');
    if (!speakReplies && typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
  }, [speakReplies]);
  useEffect(() => {
    localStorage.setItem('mirsat.agent.dark', darkMode ? '1' : '0');
  }, [darkMode]);
  // Global shortcuts: Cmd/Ctrl+K opens the assistant (no other global handler exists in the app);
  // "?" shows the shortcut cheat-sheet when not typing in a field.
  useEffect(() => {
    if (!canRender) return undefined;
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && String(event.key).toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        window.setTimeout(() => inputRef.current?.focus?.(), 120);
      } else if (event.key === '?' && !/^(input|textarea|select)$/i.test(event.target?.tagName || '') && !event.target?.isContentEditable) {
        setShowShortcuts(current => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canRender]);
  useEffect(() => {
    const element = inputRef.current;
    if (!element || inputExpanded) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 190)}px`;
  }, [input, speechPreview, inputExpanded, browserListening]);

  const appendStep = useCallback((step) => {
    setActiveStep(step);
    setActivityVisible(true);
    if (step.status === 'completed' || step.status === 'failed') {
      window.setTimeout(() => setActivityVisible(false), 1100);
    }
  }, []);

  const applyActions = useCallback(async (actions = []) => {
    if (!actions.length) return;
    await runAgentActions(actions, navigate, {
      onStep: appendStep,
      onCursor: setAgentCursor,
      onUnsupported: action => appendStep({
        id: `unsupported-${Date.now()}`,
        label: `${action?.label || action?.type || 'Unsupported action'} stays in the assistant`,
        status: 'completed',
      }),
    });
  }, [appendStep, navigate]);

  const appendError = useCallback((message) => {
    setMessages(current => [...current, { role: 'assistant', content: message || t.unavailable }]);
  }, [t.unavailable]);

  const speakReply = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const clean = String(text || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[*_#>|~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 600);
    if (!clean) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (_error) {
      /* speech synthesis is best-effort */
    }
  }, [currentLanguage]);

  const sendText = useCallback(async (text, options = {}) => {
    if (!text || loading || !capabilities?.textEnabled) return;
    setInput('');
    const turnAttachments = attachments;
    setAttachments([]);
    if (!options.skipUserEcho) setMessages(current => [...current, { role: 'user', content: text }]);
    setFollowUps([]);
    setLoading(true);
    const currentPageKey = location.pathname.split('/').filter(Boolean)[0] || 'home';
    const formSession = captureAgentFormSession();
    const context = { ...formSession, lastAgentIntent, userMemory, attachments: turnAttachments };
    setLastUserText(text);
    // Deep mode (opt-in): server detects the keyword and runs a planner/critique loop.
    const outgoing = (deepMode && capabilities?.deepModeEnabled) ? `(thorough) ${text}` : text;
    const finalize = (result, replaceLast) => {
      setConversationId(result.conversationId);
      setLastAgentIntent(result.lastAgentIntent || result.formReview?.intent || currentPageKey);
      const assistantMessage = { role: 'assistant', content: result.assistantMessage, actions: result.actions || [], steps: result.steps || [], missingFields: result.missingFields || [], artifact: result.artifact };
      setMessages(current => (replaceLast ? [...current.slice(0, -1), assistantMessage] : [...current, assistantMessage]));
      setPendingAction(result.pendingAction);
      setFollowUps(Array.isArray(result.followUps) ? result.followUps.slice(0, 4) : []);
      applyActions(result.actions);
      if (speakRepliesRef.current || options.spoken) speakReply(result.assistantMessage);
    };
    try {
      if (capabilities?.streamingEnabled) {
        try {
          abortRef.current = new AbortController();
          setMessages(current => [...current, { role: 'assistant', content: '', streaming: true }]);
          let accumulated = '';
          const result = await agentService.chatStream(outgoing, conversationId, location.pathname, currentPageKey, context, {
            signal: abortRef.current.signal,
            onToken: (delta) => {
              accumulated += delta;
              setMessages(current => {
                const copy = current.slice();
                const last = copy[copy.length - 1];
                if (last && last.role === 'assistant') copy[copy.length - 1] = { ...last, content: accumulated };
                return copy;
              });
            },
          });
          finalize(result, true);
          return;
        } catch (streamError) {
          // User stopped generation: keep whatever streamed, don't fall back.
          if (streamError?.name === 'AbortError' || abortRef.current?.signal?.aborted) {
            setMessages(current => {
              const last = current[current.length - 1];
              if (last && last.role === 'assistant') return [...current.slice(0, -1), { ...last, streaming: false, content: last.content || '⏹ Stopped.' }];
              return current;
            });
            return;
          }
          // Otherwise drop the empty streaming placeholder and fall back to the non-streaming endpoint.
          setMessages(current => {
            const last = current[current.length - 1];
            return last && last.role === 'assistant' && last.streaming ? current.slice(0, -1) : current;
          });
        }
      }
      const result = await agentService.chat(outgoing, conversationId, location.pathname, currentPageKey, context);
      finalize(result, false);
    } catch (error) {
      appendError(error.response?.data?.error?.message);
    } finally {
      setLoading(false);
    }
  }, [appendError, applyActions, attachments, capabilities?.deepModeEnabled, capabilities?.streamingEnabled, capabilities?.textEnabled, conversationId, deepMode, lastAgentIntent, loading, location.pathname, speakReply, userMemory]);

  const send = async event => {
    event?.preventDefault();
    const text = (speechPreview || input).trim();
    const spoken = Boolean(speechPreview);
    if (speechPreview) {
      stopBrowserVoice();
      setSpeechPreview('');
      finalSpeechRef.current = '';
    }
    await sendText(text, { spoken });
  };

  const regenerate = () => {
    if (!lastUserText || loading) return;
    setMessages(current => {
      const copy = current.slice();
      while (copy.length && copy[copy.length - 1].role === 'assistant' && !copy[copy.length - 1].welcome) copy.pop();
      return copy;
    });
    sendText(lastUserText, { skipUserEcho: true });
  };


  const resolve = async approve => {
    setLoading(true);
    try {
      const result = await agentService.approve(pendingAction.id, approve);
      setPendingAction(undefined);
      setMessages(current => [...current, { role: 'assistant', content: result.assistantMessage, actions: result.actions || [], steps: result.steps || [], artifact: result.artifact }]);
      applyActions(result.actions);
      if (speakRepliesRef.current) speakReply(result.assistantMessage);
      // Bounded undo: offer "Undo" for the configured window after an undoable approval.
      if (approve && result.undoable && result.undoActionId) {
        window.clearTimeout(undoTimerRef.current);
        setUndoable({ id: result.undoActionId });
        undoTimerRef.current = window.setTimeout(() => setUndoable(undefined), Math.min(result.undoWindowMs || 300000, 300000));
      }
    } catch (error) {
      appendError(error.response?.data?.error?.message);
    } finally {
      setLoading(false);
    }
  };

  const undoLastAction = async () => {
    if (!undoable?.id) return;
    setLoading(true);
    try {
      const result = await agentService.undoAction(undoable.id);
      setUndoable(undefined);
      window.clearTimeout(undoTimerRef.current);
      setMessages(current => [...current, { role: 'assistant', content: result.assistantMessage || 'Action undone.', actions: result.actions || [] }]);
      applyActions(result.actions);
    } catch (error) {
      appendError(error.response?.data?.error?.message || 'Could not undo that action.');
    } finally {
      setLoading(false);
    }
  };

  const startBrowserVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      appendError('Browser speech recognition is not available in this browser.');
      return;
    }
    recognitionRef.current?.stop?.();
    finalSpeechRef.current = speechPreview ? `${speechPreview} ` : '';
    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || '';
        if (event.results[index].isFinal) finalSpeechRef.current += `${transcript.trim()} `;
        else interim += transcript;
      }
      setSpeechPreview(`${finalSpeechRef.current}${interim}`.trim());
    };
    recognition.onerror = event => {
      setBrowserListening(false);
      stopVoiceMeter();
      appendError(event.error === 'not-allowed' ? 'Microphone permission was blocked.' : 'Voice recognition stopped.');
    };
    recognition.onend = () => {
      setBrowserListening(false);
      stopVoiceMeter();
    };
    recognitionRef.current = recognition;
    setBrowserListening(true);
    startVoiceMeter();
    recognition.start();
  }, [appendError, currentLanguage, speechPreview, startVoiceMeter, stopVoiceMeter, t.voice]);

  const stopBrowserVoice = () => {
    recognitionRef.current?.stop?.();
    setBrowserListening(false);
    stopVoiceMeter();
  };

  const sendTranscript = async () => {
    const text = speechPreview.trim();
    if (!text) return;
    stopBrowserVoice();
    setSpeechPreview('');
    finalSpeechRef.current = '';
    await sendText(text, { spoken: true });
  };

  const clearTranscript = () => {
    stopBrowserVoice();
    setSpeechPreview('');
    finalSpeechRef.current = '';
  };

  const uploadFile = useCallback(async (file) => {
    if (!file || !capabilities?.visionEnabled) return;
    setUploadingAttachment(true);
    try {
      const res = await agentService.uploadAttachment(file);
      setAttachments(current => [...current, { url: res.url, mimeType: res.mimeType || file.type, name: res.name || file.name || 'image' }]);
    } catch (_error) {
      appendError('Could not upload that file.');
    } finally {
      setUploadingAttachment(false);
    }
  }, [appendError, capabilities?.visionEnabled]);

  const onPickAttachment = async (event) => {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = '';
    await uploadFile(file);
  };

  const onComposerPaste = (event) => {
    if (!capabilities?.visionEnabled) return;
    const item = Array.from(event.clipboardData?.items || []).find(i => i.type?.startsWith('image/'));
    const file = item?.getAsFile?.();
    if (file) { event.preventDefault(); uploadFile(file); }
  };

  const onComposerDrop = (event) => {
    if (!capabilities?.visionEnabled) return;
    const file = Array.from(event.dataTransfer?.files || []).find(f => f.type?.startsWith('image/'));
    if (file) { event.preventDefault(); uploadFile(file); }
  };

  // ---- v4: conversation history + message controls ----
  const refreshConversations = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await agentService.listConversations();
      setConversations(result?.conversations || []);
    } catch (_error) {
      setConversations([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const startNewChat = () => {
    setConversationId(undefined);
    setMessages([{ role: 'assistant', content: t.welcome, welcome: true }]);
    setPendingAction(undefined);
    setLastUserText('');
    setShowHistory(false);
  };

  const openConversation = async (id) => {
    try {
      const convo = await agentService.getConversation(id);
      const restored = (convo.messages || []).map(m => ({ role: m.role, content: m.content, serverIndex: m.index, feedback: m.feedback }));
      setMessages(restored.length ? restored : [{ role: 'assistant', content: t.welcome, welcome: true }]);
      setConversationId(id);
      setPendingAction(undefined);
      setShowHistory(false);
    } catch (_error) {
      appendError('Could not open that conversation.');
    }
  };

  const renameConversation = async (id, currentTitle) => {
    const next = window.prompt('Rename conversation', currentTitle || '');
    if (next === null) return;
    try { await agentService.renameConversation(id, next.trim() || currentTitle); refreshConversations(); } catch (_e) { /* ignore */ }
  };

  const togglePin = async (id, pinned) => {
    try { await agentService.pinConversation(id, !pinned); refreshConversations(); } catch (_e) { /* ignore */ }
  };

  const removeConversation = async (id) => {
    try {
      await agentService.deleteConversation(id);
      if (id === conversationId) startNewChat();
      refreshConversations();
    } catch (_e) { /* ignore */ }
  };

  const exportConversation = async (id) => {
    try {
      const result = await agentService.exportConversation(id || conversationId);
      const blob = new Blob([result.markdown || ''], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = result.filename || 'conversation.md';
      document.body.appendChild(link); link.click(); link.remove();
      URL.revokeObjectURL(url);
    } catch (_error) {
      appendError('Could not export this conversation.');
    }
  };

  const stopGeneration = () => {
    try { abortRef.current?.abort(); } catch (_e) { /* ignore */ }
    setLoading(false);
  };

  const giveFeedback = async (message, sentiment) => {
    if (!conversationId) return;
    const key = message.serverIndex ?? `live-${message.content?.slice(0, 24)}`;
    setFeedbackByKey(current => ({ ...current, [key]: sentiment }));
    try {
      await agentService.sendMessageFeedback(conversationId, message.serverIndex, { sentiment });
    } catch (_error) {
      // non-fatal
    }
  };

  // ---- v4: slash commands + @user / #template autocomplete ----
  const slashCommands = [
    { cmd: '/help', hint: 'Show keyboard shortcuts & tips', run: () => setShowShortcuts(true) },
    { cmd: '/history', hint: 'Open conversation history', run: () => { setShowHistory(true); refreshConversations(); } },
    { cmd: '/new', hint: 'Start a new chat', run: startNewChat },
    { cmd: '/memory', hint: 'Edit agent memory / default instructions', run: () => setShowMemory(true) },
    { cmd: '/export', hint: 'Export this conversation as Markdown', run: () => conversationId && exportConversation(conversationId) },
    { cmd: '/theme', hint: 'Toggle assistant dark mode', run: () => setDarkMode(current => !current) },
    { cmd: '/deep', hint: 'Toggle deep analysis mode', run: () => setDeepMode(current => !current) },
  ];
  const visibleSlashCommands = slashOpen ? slashCommands.filter(c => c.cmd.startsWith(input.trim().toLowerCase())) : [];

  const runSlashCommand = (command) => {
    setSlashOpen(false);
    setInput('');
    command.run();
  };

  const handleComposerChange = (next) => {
    setInput(next);
    setSlashOpen(next.startsWith('/') && next.length <= 20 && !next.includes(' '));
    // @user / #template autocomplete: look up the token being typed.
    const match = next.match(/(^|\s)([@#])([\w؀-ۿ .-]{1,40})$/);
    if (match) {
      const trigger = match[2];
      const query = match[3].trim();
      window.clearTimeout(mentionTimerRef.current);
      mentionTimerRef.current = window.setTimeout(async () => {
        try {
          const result = await agentService.lookup(trigger === '@' ? 'users' : 'inspection_templates', query);
          setMention({ trigger, query: match[3], items: (result.items || []).slice(0, 6) });
        } catch (_error) {
          setMention(null);
        }
      }, 220);
    } else {
      setMention(null);
    }
  };

  const applyMention = (item) => {
    // Replace the trailing @token / #token with the resolved display name (backend resolves names → ids).
    setInput(current => current.replace(/(^|\s)([@#])([\w؀-ۿ .-]{1,40})$/, `$1${item.label} `));
    setMention(null);
    inputRef.current?.focus?.();
  };

  const closePanel = () => {
    stopBrowserVoice();
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
    setOpen(false);
  };

  const copyMessage = async (content, key) => {
    try {
      await navigator.clipboard?.writeText(content || '');
    } catch (_error) {
      const fallback = document.createElement('textarea');
      fallback.value = content || '';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
    setCopiedMessageKey(key);
    window.clearTimeout(copyResetRef.current);
    copyResetRef.current = window.setTimeout(() => setCopiedMessageKey(undefined), 1400);
  };

  // record://recordType/id links (emitted by the agent for real records) render as clickable chips.
  const recordPaths = { tasks: '/tasks', users: '/users', assets: '/assets', inspection_templates: '/inspection', questionnaires: '/questionnaire/edit' };
  const MarkdownLink = ({ href, children }) => {
    const match = /^record:\/\/([a-z_]+)\/([a-fA-F0-9]{24})$/.exec(href || '');
    if (match && recordPaths[match[1]]) {
      return (
        <RecordChip type="button" title="Open record" onClick={() => { navigate(`${recordPaths[match[1]]}/${match[2]}`); }}>
          🔗 {children}
        </RecordChip>
      );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  };

  const renderMessageContent = (content) => (
    <MessageText>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema]]}
        components={{ a: MarkdownLink }}
      >
        {String(content || '')}
      </ReactMarkdown>
    </MessageText>
  );

  const formatDiffValue = (value) => {
    if (value === undefined || value === null || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 60);
    return String(value).slice(0, 60);
  };

  const renderPendingPreview = () => {
    const preview = pendingAction?.preview;
    if (!preview) return null;
    const fields = preview.fields || [];
    // Field-level diff: current → proposed, from the preview's before/after snapshots.
    const diffRows = fields
      .filter(field => preview.before || preview.after)
      .map(field => ({ field, from: formatDiffValue(preview.before?.[field]), to: formatDiffValue(preview.after?.[field]) }))
      .filter(row => row.from !== row.to)
      .slice(0, 8);
    return (
      <PendingMeta>
        <div>{preview.module} / {preview.action}</div>
        {preview.target && <div>Target: <code>{typeof preview.target === 'string' ? preview.target : preview.target?.title || preview.target?.name || preview.target?.email || preview.target?.id || 'record'}</code></div>}
        {diffRows.length > 0 && (
          <DiffTable aria-label="Proposed changes">
            {diffRows.map(row => (
              <div className="diff-row" key={row.field}>
                <span className="field">{row.field}</span>
                <span className="from">{row.from}</span>
                <span className="arrow">→</span>
                <span className="to">{row.to}</span>
              </div>
            ))}
          </DiffTable>
        )}
        {diffRows.length === 0 && fields.length > 0 && <div>Fields: {fields.join(', ')}</div>}
        {preview.blastRadius && <div className="blast">⚠ {preview.blastRadius}</div>}
      </PendingMeta>
    );
  };

  const renderActions = (actions = []) => actions.map((action, index) => {
    if (action.type === 'update_form_draft_state') {
      const preview = action.payload || {};
      const missing = preview.validation?.missingFields || [];
      const errors = [...(preview.validation?.errors || []), ...(preview.validation?.clarifications || [])];
      return (
        <DraftPreview key={`${action.type}-${index}`}>
          <strong>{t.stagedDraft}: {Object.keys(preview.values || {}).length} values</strong>
          {missing.length > 0 && <div>{t.missingFields}: {missing.slice(0, 5).join(', ')}</div>}
          {errors.length > 0 && <ul>{errors.slice(0, 5).map(error => <li key={error}>{error}</li>)}</ul>}
        </DraftPreview>
      );
    }
    return (
      <ActionList key={`${action.type}-${index}`}>
        <ActionChip type="button" onClick={() => applyActions([action])}>{action.label || action.type.replaceAll('_', ' ')}</ActionChip>
      </ActionList>
    );
  });

  const renderSteps = (steps = []) => {
    const visibleSteps = steps.slice(-7);
    if (!visibleSteps.length) return null;
    return (
      <StepFeed aria-label="Agent activity">
        {visibleSteps.map((step, index) => (
          <StepItem key={step.id || `${step.label}-${index}`} $failed={step.status === 'failed'}>
            {step.status === 'running' ? <Loader size={12} className="spin" /> : <Check size={12} />}
            <span>{step.label}</span>
          </StepItem>
        ))}
      </StepFeed>
    );
  };

  if (!canRender || !capabilities?.enabled) return null;
  if (!open) return (
    <Launcher $rtl={isRTL} title={t.title} onClick={() => setOpen(true)}>
      <LauncherContent $rtl={isRTL}>
        <Sparkles size={13} />
        <LauncherText>MIRSAT Assistant</LauncherText>
      </LauncherContent>
    </Launcher>
  );

  const voiceMode = Boolean(browserListening || speechPreview);
  const composerValue = voiceMode ? speechPreview : input;
  const composerPlaceholder = voiceMode ? t.liveTranscript : (capabilities.textEnabled ? t.placeholder : t.textUnavailable);
  const currentActivity = activeStep?.label || (loading ? t.thinking : '');
  const suggestedPrompts = [
    { label: '📋 Show overdue inspections', text: 'Show me all overdue inspections' },
    { label: '📊 Portal overview report', text: 'Give me a portal overview report' },
    { label: '🔢 How many assets & users?', text: 'How many assets and users do we have?' },
    { label: '🧭 Explain this screen', text: 'Explain what this screen does and what I can do here.' },
  ];

  return (
    <>
    <AgentCursor $visible={agentCursor.visible} $x={agentCursor.x} $y={agentCursor.y}>
      <MousePointer2 size={22} />
      {agentCursor.label && <span>{agentCursor.label}</span>}
    </AgentCursor>
    <Panel $rtl={isRTL} aria-label={t.title} data-agent-theme={darkMode ? 'dark' : 'light'}>
      <Header>
        <Bot size={22} />
        <HeaderText><strong>{t.title}</strong><span>{t.subtitle}</span></HeaderText>
        <HeaderButton type="button" title={darkMode ? 'Light mode' : 'Dark mode'} aria-pressed={darkMode} aria-label="Toggle assistant dark mode" onClick={() => setDarkMode(current => !current)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</HeaderButton>
        <HeaderButton type="button" title="New chat" aria-label="New chat" onClick={startNewChat}><Plus size={18} /></HeaderButton>
        <HeaderButton type="button" title="History" aria-label="Conversation history" aria-pressed={showHistory} onClick={() => { const next = !showHistory; setShowHistory(next); if (next) refreshConversations(); }}><History size={18} /></HeaderButton>
        {ttsSupported && (
          <HeaderButton type="button" title={speakReplies ? 'Mute spoken replies' : 'Speak replies aloud'} aria-pressed={speakReplies} onClick={() => setSpeakReplies(current => !current)}>
            {speakReplies ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </HeaderButton>
        )}
        <HeaderButton type="button" title={t.memory} onClick={() => setShowMemory(current => !current)}><BrainCircuit size={18} /></HeaderButton>
        <HeaderButton type="button" title="Close" onClick={closePanel}><ChevronDown size={20} /></HeaderButton>
      </Header>
      {showHistory && (
        <HistoryDrawer $rtl={isRTL} role="dialog" aria-label="Conversation history">
          <HistoryHead>
            <strong>Conversations</strong>
            <button type="button" title="New chat" aria-label="New chat" onClick={startNewChat}><Plus size={16} /></button>
            <button type="button" title="Close" aria-label="Close history" onClick={() => setShowHistory(false)}><X size={16} /></button>
          </HistoryHead>
          <HistorySearch placeholder="Search conversations…" value={historySearch} onChange={e => setHistorySearch(e.target.value)} aria-label="Search conversations" />
          <HistoryList>
            {historyLoading && <div style={{ padding: '8px 10px', fontSize: 12, color: '#667085' }}>Loading…</div>}
            {!historyLoading && conversations.length === 0 && <div style={{ padding: '8px 10px', fontSize: 12, color: '#667085' }}>No conversations yet.</div>}
            {conversations
              .filter(c => !historySearch || (c.title || '').toLowerCase().includes(historySearch.toLowerCase()))
              .map(c => (
                <HistoryItem key={c.id} onClick={() => openConversation(c.id)} title={c.title}>
                  {c.pinned && <Pin size={12} className="pinned" />}
                  <span className="title">{c.title}</span>
                  <span className="acts">
                    <button type="button" title={c.pinned ? 'Unpin' : 'Pin'} onClick={e => { e.stopPropagation(); togglePin(c.id, c.pinned); }}><Pin size={13} /></button>
                    <button type="button" title="Rename" onClick={e => { e.stopPropagation(); renameConversation(c.id, c.title); }}><Pencil size={13} /></button>
                    <button type="button" title="Export" onClick={e => { e.stopPropagation(); exportConversation(c.id); }}><Download size={13} /></button>
                    <button type="button" title="Delete" onClick={e => { e.stopPropagation(); removeConversation(c.id); }}><Trash2 size={13} /></button>
                  </span>
                </HistoryItem>
              ))}
          </HistoryList>
        </HistoryDrawer>
      )}
      <Messages>
        {messages.map((message, index) => {
          const messageKey = `msg-${index}`;
          const copied = copiedMessageKey === messageKey;
          return (
          <React.Fragment key={messageKey}>
            <MessageGroup $user={message.role === 'user'}>
              <Bubble $user={message.role === 'user'}>{message.role === 'user' ? message.content : renderMessageContent(message.content)}</Bubble>
              <MessageTools className="message-tools" $user={message.role === 'user'}>
                <button type="button" title={copied ? 'Copied' : t.copyMessage} aria-label={t.copyMessage} onClick={() => copyMessage(message.content, messageKey)}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                {message.role === 'assistant' && !message.welcome && (
                  <>
                    <button type="button" title="Regenerate" aria-label="Regenerate response" onClick={regenerate}><RefreshCw size={13} /></button>
                    <button type="button" title="Good response" aria-label="Good response" onClick={() => giveFeedback(message, 'up')}><ThumbsUp size={13} /></button>
                    <button type="button" title="Needs work" aria-label="Bad response" onClick={() => giveFeedback(message, 'down')}><ThumbsDown size={13} /></button>
                  </>
                )}
              </MessageTools>
            </MessageGroup>
            {message.artifact && <ArtifactCard artifact={message.artifact} rtl={isRTL} />}
            {renderActions(message.actions)}
          </React.Fragment>
        );})}
        {messages.length === 1 && !loading && (
          <SuggestedPrompts>
            {suggestedPrompts.map(prompt => (
              <PromptChip key={prompt.label} type="button" onClick={() => sendText(prompt.text)}>{prompt.label}</PromptChip>
            ))}
          </SuggestedPrompts>
        )}
        {followUps.length > 0 && !loading && !pendingAction && (
          <SuggestedPrompts aria-label="Suggested follow-ups">
            {followUps.map(text => (
              <PromptChip key={text} type="button" onClick={() => sendText(text)}>↪ {text}</PromptChip>
            ))}
          </SuggestedPrompts>
        )}
        {pendingAction && (
          <Pending>
            <strong>{pendingAction.summary}</strong>
            {renderPendingPreview()}
            <Row>
              <SmallButton type="button" disabled={loading} onClick={() => resolve(true)}><Check size={14} />{t.approve}</SmallButton>
              <SmallButton type="button" disabled={loading} $reject onClick={() => resolve(false)}><X size={14} />{t.reject}</SmallButton>
            </Row>
          </Pending>
        )}
        <div ref={endRef} />
      </Messages>
      <ActivityStrip $visible={activityVisible || loading || Boolean(undoable)}>
        {activeStep?.status === 'running' || loading ? <Loader size={14} className="spin" /> : <Check size={14} />}
        <span>{currentActivity}</span>
        {loading && (
          <button type="button" onClick={stopGeneration} title="Stop generating" aria-label="Stop generating" style={{ marginInlineStart: 'auto', border: 0, background: 'transparent', color: 'var(--color-navy)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Square size={12} /> Stop
          </button>
        )}
        {!loading && undoable && (
          <button type="button" onClick={undoLastAction} title="Undo last action" aria-label="Undo last action" style={{ marginInlineStart: 'auto', border: '1px solid var(--color-teal)', borderRadius: 8, background: '#fff', color: 'var(--color-navy)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px' }}>
            <RefreshCw size={12} /> Undo last action
          </button>
        )}
      </ActivityStrip>
      {showShortcuts && (
        <ShortcutsOverlay role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onMouseDown={event => { if (event.target === event.currentTarget) setShowShortcuts(false); }}>
          <div>
            <h4>Keyboard shortcuts & tips</h4>
            <div className="row"><span>Open assistant</span><span><kbd>Ctrl</kbd>+<kbd>K</kbd></span></div>
            <div className="row"><span>Send message</span><span><kbd>Enter</kbd></span></div>
            <div className="row"><span>New line</span><span><kbd>Shift</kbd>+<kbd>Enter</kbd></span></div>
            <div className="row"><span>Commands</span><span>Type <kbd>/</kbd> in the box</span></div>
            <div className="row"><span>Mention a user / template</span><span><kbd>@</kbd> / <kbd>#</kbd></span></div>
            <div className="row"><span>This cheat sheet</span><span><kbd>?</kbd></span></div>
            <button type="button" onClick={() => setShowShortcuts(false)}>Close</button>
          </div>
        </ShortcutsOverlay>
      )}
      <ComposerShell>
        {showMemory && (
          <MemoryPanel>
            <label htmlFor="agent-memory">{t.memory}</label>
            <textarea id="agent-memory" value={userMemory} placeholder={t.memoryPlaceholder} onChange={event => setUserMemory(event.target.value.slice(0, 2000))} />
          </MemoryPanel>
        )}
        {(capabilities.visionEnabled || capabilities.deepModeEnabled || attachments.length > 0) && (
          <ComposerExtras>
            {capabilities.visionEnabled && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickAttachment} />
                <ExtraButton type="button" disabled={uploadingAttachment} onClick={() => fileInputRef.current?.click()} title="Attach an image">
                  {uploadingAttachment ? <Loader size={13} className="spin" /> : <Paperclip size={13} />} Attach
                </ExtraButton>
              </>
            )}
            {capabilities.deepModeEnabled && (
              <ExtraButton type="button" $active={deepMode} onClick={() => setDeepMode(value => !value)} title="Deep analysis mode">
                <Zap size={13} /> Deep
              </ExtraButton>
            )}
            {attachments.map((attachment, index) => (
              String(attachment.mimeType || '').startsWith('image/') ? (
                <ImageThumb key={`${attachment.url}-${index}`} title={attachment.name || 'image'}>
                  <img src={attachment.url} alt={attachment.name || 'attachment'} />
                  <button type="button" aria-label={`Remove ${attachment.name || 'image'}`} title="Remove" onClick={() => setAttachments(current => current.filter((_, idx) => idx !== index))}><X size={12} /></button>
                </ImageThumb>
              ) : (
                <AttachChip key={`${attachment.url}-${index}`}>
                  <span>{attachment.name || 'file'}</span>
                  <button type="button" aria-label={`Remove ${attachment.name || 'file'}`} title="Remove" onClick={() => setAttachments(current => current.filter((_, idx) => idx !== index))}><X size={11} /></button>
                </AttachChip>
              )
            ))}
          </ComposerExtras>
        )}
        <VoiceWave $active={browserListening} $listening={browserListening} data-testid="agent-live-voice-wave" aria-hidden="true">
          {voiceLevels.map((level, index) => (
            <span
              key={`voice-bar-${index}`}
              style={{ '--voice-level': `${Math.max(0.08, Math.min(1, level))}` }}
            />
          ))}
        </VoiceWave>
        <Composer onSubmit={send}>
          <IconButton
            type="button"
            title={browserListening ? t.stopVoice : t.startBrowserVoice}
            $active={voiceMode}
            disabled={!capabilities.browserVoiceFallbackEnabled || !speechSupported}
            onClick={browserListening ? stopBrowserVoice : startBrowserVoice}
          >
            {browserListening ? <MicOff size={17} /> : voiceMode ? <Activity size={17} /> : <Mic size={17} />}
          </IconButton>
          <InputWrap onDragOver={event => { if (capabilities.visionEnabled) event.preventDefault(); }} onDrop={onComposerDrop}>
            <Input
              ref={inputRef}
              $voice={voiceMode}
              $expanded={inputExpanded}
              aria-label={voiceMode ? t.liveTranscript : t.placeholder}
              disabled={!capabilities.textEnabled}
              value={composerValue}
              onPaste={onComposerPaste}
              onChange={event => {
                const next = event.target.value;
                if (voiceMode) {
                  setSpeechPreview(next);
                  finalSpeechRef.current = next ? `${next} ` : '';
                } else {
                  handleComposerChange(next);
                }
              }}
              placeholder={composerPlaceholder}
              onKeyDown={event => {
                if (event.key === 'Escape' && (slashOpen || mention)) { setSlashOpen(false); setMention(null); return; }
                if (event.key === 'Enter' && !event.shiftKey) {
                  if (slashOpen && visibleSlashCommands.length) { event.preventDefault(); runSlashCommand(visibleSlashCommands[0]); return; }
                  if (mention && mention.items.length) { event.preventDefault(); applyMention(mention.items[0]); return; }
                  send(event);
                }
              }}
            />
            {slashOpen && visibleSlashCommands.length > 0 && (
              <ComposerPopover role="listbox" aria-label="Commands">
                {visibleSlashCommands.map(command => (
                  <button key={command.cmd} type="button" onClick={() => runSlashCommand(command)}>
                    <strong>{command.cmd}</strong><span>{command.hint}</span>
                  </button>
                ))}
              </ComposerPopover>
            )}
            {mention && mention.items.length > 0 && (
              <ComposerPopover role="listbox" aria-label="Suggestions">
                {mention.items.map(item => (
                  <button key={item.id} type="button" onClick={() => applyMention(item)}>
                    <strong>{item.label}</strong><span>{item.sub}</span>
                  </button>
                ))}
              </ComposerPopover>
            )}
            <InputUtility type="button" title={inputExpanded ? t.collapseInput : t.expandInput} onClick={() => setInputExpanded(current => !current)}>
              {inputExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </InputUtility>
          </InputWrap>
          <SendButton disabled={!capabilities.textEnabled || !composerValue.trim() || loading} title="Send"><Send size={16} /></SendButton>
        </Composer>
        {voiceMode && (
          <ComposerMeta>
            <span>{browserListening ? t.liveTranscript : t.voice}</span>
            <button type="button" onClick={clearTranscript}>{t.clearTranscript}</button>
          </ComposerMeta>
        )}
      </ComposerShell>
    </Panel>
    </>
  );
};

export default AgentWidget;
