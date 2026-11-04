import PropTypes from "prop-types";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useCopy, useMaintenanceAccess } from "../shared";

export function PlanGate({ children }) {
  const { browse } = useMaintenanceAccess("maintenance_plans");
  const m = useCopy();
  return browse ? (
    children
  ) : (
    <p role="alert">{m("Access to this module has not been granted")}</p>
  );
}
export const PlanPage = styled.div`
  --mp-text: #000048;
  --mp-muted: #617084;
  --mp-surface: #fff;
  --mp-border: #e2e8f0;
  --mp-soft: #f6f8fc;
  --mp-accent: #000048;
  --mp-green: #42866c;
  --mp-red: #a63b34;
  --mp-amber: #8c6216;
  --mp-day-alert: #fff0ec;
  --mp-day-count: #e6effa;
  html[data-theme="dark"] & {
    --mp-text: #f1f5ff;
    --mp-muted: #acbbcd;
    --mp-surface: #182230;
    --mp-border: #384960;
    --mp-soft: #121b29;
    --mp-accent: #2b4c9b;
    --mp-green: #91d6b2;
    --mp-red: #fca5a5;
    --mp-amber: #fcd34d;
    --mp-day-alert: var(--mp-surface);
    --mp-day-count: var(--mp-surface);
  }
  color: var(--mp-text);
  font-size: 14px;
  h1,
  h2,
  h3 {
    font-weight: 700;
  }
  a:not([class]) {
    color: inherit;
    font-weight: 600;
  }
  .mp-visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  min-width: 0;
  display: grid;
  gap: 22px;
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1 {
    font-size: 32px;
    line-height: 1.22;
  }
  h2 {
    font-size: 22px;
    line-height: 1.3;
  }
  h3 {
    font-size: 16px;
  }
  p {
    line-height: 1.55;
  }
  [data-plan-steps] strong {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  [data-step-number] {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--mp-soft);
  }
  [aria-current="step"] [data-step-number] {
    background: var(--mp-accent);
    color: white;
  }
  p + p {
    margin-top: 6px;
  }
  @media (max-width: 640px) {
    gap: 16px;
    h1 {
      font-size: 24px;
    }
    h2 {
      font-size: 19px;
    }
  }
`;
export const Section = styled.section`
  border: 1px solid var(--mp-border);
  border-radius: 14px;
  background: var(--mp-surface);
  padding: 22px;
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 16px;
  @media (max-width: 640px) {
    padding: 14px;
  }
`;
export const Banner = styled(Section)`
  background: var(--mp-accent);
  border-color: var(--mp-accent);
  color: #fff;
  padding: 26px 28px;
  h2 {
    font-size: 28px;
  }
  small {
    color: #cfdaff;
  }
  a {
    color: white;
  }
`;
export const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
  justify-content: ${(p) => (p.$between ? "space-between" : "flex-start")};
`;
export const PlanHeader = styled(Row)`
  align-items: flex-start;
  margin: 6px 0 24px;
  p {
    margin-top: 8px;
    color: var(--mp-muted);
  }
`;
export const Columns = styled.div`
  display: grid;
  grid-template-columns: ${(p) => p.$columns || "repeat(2,minmax(0,1fr))"};
  gap: ${(p) => p.$gap || "22px"};
  align-items: ${(p) => p.$align || "stretch"};
  min-width: 0;
  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
export const Stack = styled.div`
  display: grid;
  gap: 16px;
  align-content: start;
  min-width: 0;
`;
export const MutedText = styled.span`
  color: var(--mp-muted);
`;
export const LabelText = styled.small`
  text-transform: uppercase;
  letter-spacing: 0.035em;
  font-weight: 600;
`;
export const Value = styled.strong`
  font-size: 30px;
  line-height: 1.1;
`;
export const Track = styled.progress`
  display: block;
  width: 100%;
  height: 16px;
  border: 0;
  border-radius: 12px;
  appearance: none;
  background: var(--mp-border);
  &::-webkit-progress-bar {
    background: var(--mp-border);
    border-radius: 12px;
  }
  &::-webkit-progress-value {
    background: var(--mp-green);
    border-radius: 12px;
  }
  &::-moz-progress-bar {
    background: var(--mp-green);
    border-radius: 12px;
  }
`;
export const PlanButton = styled.button`
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid
    ${(p) => (p.$primary ? "var(--mp-accent)" : "var(--mp-border)")};
  background: ${(p) => (p.$primary ? "var(--mp-accent)" : "var(--mp-surface)")};
  color: ${(p) => (p.$primary ? "#fff" : "var(--mp-text)")};
  text-decoration: none;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  padding: 0 16px;
  cursor: pointer;
  &:hover {
    filter: brightness(0.96);
  }
  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;
export const PlanLink = styled(PlanButton).attrs({ as: Link })``;
export const FieldLabel = styled.label`
  display: grid;
  align-content: start;
  gap: 8px;
  font-weight: 600;
  min-width: 0;
  input:not([type="checkbox"]),
  select,
  textarea {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--mp-surface);
    border: 1px solid var(--mp-border);
    color: var(--mp-text);
    font: inherit;
    font-weight: 400;
  }
  textarea {
    min-height: 90px;
    resize: vertical;
  }
  input:disabled,
  select:disabled {
    opacity: 0.62;
  }
`;
export const Pill = styled.span`
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--mp-border);
  background: var(--mp-soft);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mp-${(p) => p.$tone || "text"});
`;
export const PlanTable = styled.div`
  overflow-x: auto;
  table {
    border-collapse: collapse;
    text-align: start;
    width: 100%;
    min-width: 680px;
  }
  th,
  td {
    padding: 15px 13px;
    text-align: start;
    border-bottom: 1px solid var(--mp-border);
  }
  th {
    color: var(--mp-muted);
    background: var(--mp-soft);
    font-size: 12px;
  }
  tr:last-child td {
    border-bottom: none;
  }
  a {
    color: inherit;
  }
  small {
    display: block;
    color: var(--mp-muted);
    margin-top: 4px;
  }
`;
export const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(100px, 1fr));
  gap: 22px;
  overflow-x: auto;
  padding-bottom: 2px;
`;
export const Day = styled(PlanButton)`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  min-height: 130px;
  padding: 14px;
  gap: 8px;
  background: var(--mp-soft);
  border-color: ${(p) => (p.$selected ? "var(--mp-text)" : "var(--mp-border)")};
  strong {
    font-size: 24px;
  }
`;

PlanGate.propTypes = {
  children: PropTypes.node,
};
