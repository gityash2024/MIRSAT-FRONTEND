import styled from 'styled-components';

export const CustomTimeInput = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  text-align: right;
  
  &:focus {
    outline: none;
    border-color: var(--color-navy);
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
  
  &:read-only {
    background: #f8fafc;
  }
`; 