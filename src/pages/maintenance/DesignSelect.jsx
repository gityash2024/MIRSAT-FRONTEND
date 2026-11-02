import { useRef, Children, useId } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

const Control = styled(ListboxButton)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 54px;
  padding: 12px 16px;
  border: 1px solid #ccd8ea;
  border-radius: 6px;
  background: white;
  color: var(--color-navy);
  html[data-theme="dark"] & { border-color: #64748b; }
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  text-align: start;
  cursor: pointer;
  &:focus-visible,
  &[data-open] {
    outline: 2px solid #b6cdfb;
    border-color: #6b96ed;
  }
  &:disabled {
    background: #f5f8fc;
    color: #8390a0;
    cursor: not-allowed;
  }
  &[aria-invalid="true"] {
    border-color: #b54438;
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;
const Options = styled(ListboxOptions)`
  --anchor-gap: 6px;
  width: var(--button-width);
  max-height: min(320px, 50vh);
  overflow: auto;
  z-index: 10020;
  background: white;
  color: var(--color-navy);
  border: 1px solid #ccd8ea;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0 8px 24px #00004818;
  font-family: inherit;
  font-size: 14px;
  outline: none;
`;
const Option = styled(ListboxOption)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  &[data-focus] {
    background: #edf3fc;
  }
  &[data-selected] {
    color: #1760dd;
    background: #e6f1ff;
  }
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;
const Wrapper = styled.span`
  display: block;
  position: relative;
  min-width: 0;
  select[data-validation-control] {
    position: absolute;
    width: 1px;
    height: 1px;
    min-height: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
    inset-inline-start: 0;
    bottom: 0;
  }
`;
export default function DesignSelect({
  value = "",
  options,
  onChange,
  placeholder = "Select",
  required,
  disabled,
  name,
  label,
  agent,
}) {
  const button = useRef(null);
  const valueId = useId();
  const selected = options.find(
    (option) => String(option.value) === String(value),
  );
  return (
    <Wrapper>
      <Listbox
        value={value}
        onChange={(next) => {
          button.current?.removeAttribute("aria-invalid");
          onChange(next);
        }}
        disabled={disabled}
      >
        <Control
          ref={button}
          type="button"
          aria-label={label}
          aria-describedby={label ? valueId : undefined}
          data-agent-field={agent}
        >
          <span id={valueId}>{selected?.label || placeholder}</span>
          <ChevronDown aria-hidden="true" />
        </Control>
        <Options anchor="bottom start" portal modal={false}>
          {!required && <Option value="">{placeholder}</Option>}
          {options.map((option) => (
            <Option key={option.value} value={option.value}>
              {({ selected: active }) => (
                <>
                  {option.label}
                  {active && <Check aria-hidden="true" />}
                </>
              )}
            </Option>
          ))}
        </Options>
      </Listbox>
      <select
        data-validation-control
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInvalid={(event) => {
          event.preventDefault();
          button.current?.focus();
          button.current?.setAttribute("aria-invalid", "true");
        }}
      >
        <option value="" />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}
DesignSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  label: PropTypes.string,
  agent: PropTypes.string,
};

export function SelectInput({
  children,
  onChange,
  "aria-label": label,
  "data-agent-field": agent,
  ...props
}) {
  if (props.multiple)
    return (
      <select
        {...props}
        aria-label={label}
        data-agent-field={agent}
        onChange={onChange}
      >
        {children}
      </select>
    );
  const entries = Children.toArray(children).filter(
    (child) => child?.type === "option",
  );
  const placeholder =
    entries.find((child) => child.props.value === "")?.props.children ||
    "Select";
  return (
    <DesignSelect
      {...props}
      label={label}
      agent={agent}
      placeholder={placeholder}
      options={entries
        .filter((child) => child.props.value !== "")
        .map((child) => ({
          value: child.props.value,
          label: child.props.children,
        }))}
      onChange={(value) => onChange({ target: { value } })}
    />
  );
}
SelectInput.propTypes = {
  multiple: PropTypes.bool,
  children: PropTypes.node,
  onChange: PropTypes.func.isRequired,
  "aria-label": PropTypes.string,
  "data-agent-field": PropTypes.string,
};
