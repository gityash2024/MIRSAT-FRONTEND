import {
  useState,
  useEffect,
  useRef,
  useId,
  lazy,
  Suspense,
  useSyncExternalStore,
} from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import {
  maintenanceService as service,
  maintenanceError,
} from "../../services/maintenance.service";

import {
  readSelectedTimezone,
  subscribeSelectedTimezone,
} from "../../utils/selectedTimezone";
import DesignSelect from "./DesignSelect";
import { maintenanceTone, statusTone } from "../../theme/maintenancePalette";

const PdfPreview = lazy(() => import("./PdfPreview"));

export const useCopy = () => {
  useSyncExternalStore(subscribeSelectedTimezone, readSelectedTimezone);
  const { t } = useTranslation("maintenance");
  return (text) => t(text, { defaultValue: text, keySeparator: false });
};
export const canManageMaintenance = (user, module) =>
  ["admin", "superadmin"].includes(user?.role) ||
  (user?.role === "manager" && user.permissions?.includes(`access_${module}`));
export const canBrowseMaintenance = (user, module) =>
  canManageMaintenance(user, module) ||
  (["documents", "faults"].includes(module) &&
    ["inspector", "supervisor"].includes(user?.role));
export const useMaintenanceAccess = (module) => {
  const { user } = useAuth();
  return {
    user,
    manage: canManageMaintenance(user, module),
    browse: canBrowseMaintenance(user, module),
  };
};
export const useResource = (
  path,
  params = {},
  enabled = true,
  existing = false,
) => {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const serialized = JSON.stringify(params);
  useEffect(() => {
    if (!enabled || !path) {
      setState({ data: null, loading: false, error: "" });
      return undefined;
    }
    const controller = new AbortController();
    let live = true;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    (existing ? service.getExisting : service.get)(
      path,
      JSON.parse(serialized),
      controller.signal,
    )
      .then((data) => {
        if (live) setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (live && error.code !== "ERR_CANCELED")
          setState({
            data: null,
            loading: false,
            error: maintenanceError(error),
          });
      });
    return () => {
      live = false;
      controller.abort();
    };
  }, [path, serialized, revision, enabled, existing]);
  return { ...state, reload: () => setRevision((value) => value + 1) };
};
export const Page = styled.div`
  color: var(--color-navy);
  html[data-theme="dark"] & { color: #fafafa; }
  width: 100%;
  min-width: 0;
  padding: 10px 8px 24px;
  font-size: 14px;
  @media (max-width: 700px) {
    padding: 4px 0 16px;
  }
`;
export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  h1 {
    font-size: 30px;
    line-height: 1.35;
    margin: 0 0 6px;
    font-weight: 700;
  }
  p {
    color: var(--color-text-muted);
    font-size: 16px;
    margin: 0;
    line-height: 1.6;
  }
  @media (max-width: 700px) {
    margin-bottom: 20px;
    h1 {
      font-size: 23px;
    }
  }
`;
export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;
export const Button = styled.button`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(p) => (p.$primary ? "var(--color-navy)" : "#dfe7ef")};
  background: ${(p) => (p.$primary ? "var(--color-navy)" : "white")};
  color: ${(p) => (p.$primary ? "white" : "var(--color-navy)")};
  html[data-theme="dark"] & {
    border-color: ${(p) => (p.$primary ? "#9db4f5" : "#64748b")};
  }
  padding: 10px 16px;
  min-height: 44px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: 2px solid #467ee5;
    outline-offset: 3px;
  }
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;
export const TextLink = styled(Link)`
  color: var(--color-navy);
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`;
export const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-navy);
  text-decoration: none;
  font-size: 12px;
  margin-bottom: 18px;
`;
export const Panel = styled.section`
  border: 1px solid #e6edf4;
  border-radius: 12px;
  background: white;
  padding: 24px;
  margin-bottom: 20px;
  min-width: 0;
  h2 {
    font-size: 22px;
    line-height: 1.4;
    margin: 0 0 8px;
  }
  h3 {
    font-size: 15px;
    margin: 0 0 12px;
  }
  p {
    color: var(--color-text-muted);
    margin: 0 0 18px;
    line-height: 1.6;
  }
  &[role="status"] {
    max-width: none !important;
    padding: 24px !important;
    box-shadow: none !important;
  }
  @media (max-width: 700px) {
    padding: 16px;
  }
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${(p) =>
    p.$columns || "minmax(0,2fr) minmax(260px,1fr)"};
  gap: 20px;
  align-items: start;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;
export const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$count || 4}, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 430px) {
    gap: 10px;
  }
`;
export const Stat = styled.div`
  background: ${(p) => maintenanceTone(p.$tone).background};
  color: ${(p) => maintenanceTone(p.$tone).text};
  html[data-theme="dark"] & {
    background: ${(p) => maintenanceTone(p.$tone, "dark").background};
    color: ${(p) => maintenanceTone(p.$tone, "dark").text};
  }
  border-radius: 12px;
  padding: 20px;
  min-height: 116px;
  box-sizing: border-box;
  strong {
    display: block;
    font-size: 26px;
    line-height: 1.25;
    margin-bottom: 4px;
  }
  span {
    display: block;
    font-size: 13px;
    font-weight: 600;
  }
  small {
    display: block;
    font-size: 12px;
    opacity: 1;
    margin-top: 6px;
  }
`;
export const FilterBar = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid #e6edf4;
  background: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  input,
  select {
    min-width: 100px;
    max-width: 100%;
    border: 1px solid #dfe7ef;
    padding: 10px 12px;
    border-radius: 6px;
    font: inherit;
    font-size: 13px;
    background: transparent;
    color: inherit;
  }
  input {
    flex: 1;
    min-width: 180px;
  }
  button {
    flex-shrink: 0;
  }
  > span {
    min-width: 110px;
    flex: 1 1 130px;
  }
  > span button {
    min-height: 44px;
  }
`;
export const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 650px;
    text-align: start;
    font-size: 14px;
  }
  th {
    background: #f5f8fc;
    color: var(--color-text-muted);
    font-weight: 500;
    padding: 13px 12px;
    font-size: 12px;
    text-align: start;
  }
  td {
    padding: 24px 14px;
    border-bottom: 1px solid #f1f4f8;
    vertical-align: middle;
  }
  tbody tr:nth-child(even) {
    background: #fafcff;
  }
  td small {
    display: block;
    color: var(--color-text-muted);
    font-size: 11px;
    margin-top: 4px;
  }
  input[type="checkbox"] {
    accent-color: var(--color-navy);
    width: 16px;
    height: 16px;
  }
  input:focus-visible {
    outline: 2px solid #467ee5;
  }
`;
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: ${(p) => maintenanceTone(statusTone(p.$status)).background};
  color: ${(p) => maintenanceTone(statusTone(p.$status)).text};
  html[data-theme="dark"] & {
    background: ${(p) => maintenanceTone(statusTone(p.$status), "dark").background};
    color: ${(p) => maintenanceTone(statusTone(p.$status), "dark").text};
  }
  white-space: nowrap;
`;
export const Muted = styled.span`
  color: var(--color-text-muted);
  font-size: 13px;
`;
export const Definition = styled.dl`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns || 2}, minmax(0, 1fr));
  gap: 22px;
  margin: 22px 0;
  dt {
    color: var(--color-text-muted);
    font-size: 12px;
    margin-bottom: 6px;
  }
  dd {
    margin: 0;
    font-size: 14px;
    overflow-wrap: anywhere;
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;
export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
  grid-column: ${(p) => (p.$wide ? "1/-1" : "auto")};
  input,
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
    font: inherit;
    font-size: 14px;
    font-weight: 400;
    color: inherit;
    background: white;
    border: 1px solid #ccd8ea;
    border-radius: 6px;
    padding: 14px 16px;
    min-height: 54px;
  }
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  input:focus,
  select:focus,
  textarea:focus {
    outline: 2px solid #b6cdfb;
    border-color: #6b96ed;
  }
  input:disabled,
  select:disabled {
    background: #f5f8fc;
    color: var(--color-text-muted);
  }
  input[type="checkbox"] {
    width: 16px;
    min-height: 16px;
    accent-color: var(--color-navy);
  }
`;
export const ErrorBox = styled.div`
  background: #fff0ee;
  color: #a33328;
  border: 1px solid #f4c8c2;
  border-radius: 8px;
  padding: 14px;
  margin: 12px 0;
  font-size: 14px;
`;
export const Tabs = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  border-bottom: 1px solid #e3eaf2;
  margin-bottom: 24px;
  button {
    background: none;
    border: 0;
    border-bottom: 3px solid transparent;
    color: var(--color-text-muted);
    padding: 14px 2px;
    cursor: pointer;
    font: inherit;
  }
  button[aria-selected="true"] {
    color: var(--color-navy);
    font-weight: 600;
    border-bottom-color: var(--color-navy);
  }
`;
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: #00000066;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: ${(p) => (p.$topAligned ? "flex-start" : "center")};
  padding: 20px;
  padding-block-start: ${(p) => (p.$topAligned ? "clamp(20px, calc((100dvh - 900px) / 2), 300px)" : "20px")};
  box-sizing: border-box;
  backdrop-filter: blur(1px);
`;
const DialogBox = styled.div`
  background: white;
  color: var(--color-navy);
  html[data-theme="dark"] & { color: #fafafa; }
  width: 100%;
  max-width: ${(p) => p.$width || (p.$wide ? "1100px" : "640px")};
  max-height: ${(p) => (p.$topAligned ? "calc(100dvh - clamp(20px, calc((100dvh - 900px) / 2), 300px) - 20px)" : "90vh")};
  overflow: auto;
  border-radius: 12px;
  box-shadow: 0 20px 70px #0003;
  padding: ${(p) => p.$padding || "28px"};
  box-sizing: border-box;
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
  }
  header h2 {
    margin: 0;
    font-size: ${(p) => p.$titleSize || 22}px;
  }
  header h2[data-with-icon] {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  [data-dialog-title-icon] {
    display: grid;
    flex: 0 0 44px;
    height: 44px;
    place-items: center;
    border-radius: 50%;
    color: #995909;
    background: #fff1d6;
  }
  @media (max-width: 650px) {
    padding: 18px;
  }
`;
export function Modal({
  title,
  titleIcon,
  children,
  onClose,
  wide = false,
  width,
  topAligned = false,
  padding,
  titleSize,
  busy = false,
}) {
  const m = useCopy();
  const dialog = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("input,select,textarea,button")?.focus();
    const keydown = (event) => {
      const dialogs = document.querySelectorAll(
        '[role="dialog"][aria-modal="true"]',
      );
      if (
        event.defaultPrevented ||
        dialogs[dialogs.length - 1] !== dialog.current
      )
        return;
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key === "Tab") {
        const nodes = [
          ...dialog.current.querySelectorAll(
            'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
          ),
        ];
        if (!nodes.length) {
          event.preventDefault();
          return;
        }
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (!dialog.current.contains(document.activeElement)) {
          (event.shiftKey ? last : first).focus();
          event.preventDefault();
        } else if (event.shiftKey && document.activeElement === first) {
          last.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", keydown);
      previousFocus?.focus();
    };
  }, []);
  return (
    <Overlay
      $topAligned={topAligned}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <DialogBox
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        $wide={wide}
        $width={width}
        $padding={padding}
        $titleSize={titleSize}
        $topAligned={topAligned}
      >
        <header>
          <h2 id={titleId} data-with-icon={titleIcon ? true : undefined}>
            {titleIcon && <span data-dialog-title-icon>{titleIcon}</span>}
            {title}
          </h2>
          <Button
            aria-label={m("Close")}
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            <X />
          </Button>
        </header>
        {children}
      </DialogBox>
    </Overlay>
  );
}
const DialogFields = styled(FormGrid)`
  gap: 28px;
  label {
    color: #66758f;
  }
  input:not([type="file"]),
  button[aria-haspopup="listbox"] {
    min-height: 60px;
    color: var(--color-navy);
  }
  textarea {
    min-height: 92px;
    color: var(--color-navy);
  }
`;
export function FormDialog({
  title,
  fields,
  initial = {},
  onSubmit,
  onClose,
  submitLabel = "Save",
  width = "760px",
  subtitle,
  children,
}) {
  const m = useCopy();
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (name, value) =>
    setValues((old) => ({ ...old, [name]: value }));
  return (
    <Modal
      title={m(title)}
      onClose={onClose}
      busy={busy}
      width={width}
      topAligned
      padding="36px"
      titleSize={28}
    >
      {subtitle && (
        <p style={{ margin: "-8px 0 36px", color: "#66758f", fontSize: 16 }}>
          {m(subtitle)}
        </p>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await onSubmit(values);
            onClose();
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <DialogFields>
          {fields
            .filter((field) => !field.when || field.when(values))
            .map((field) => (
              <Field
                key={field.name}
                field={field}
                value={values[field.name] ?? ""}
                onChange={(value) => change(field.name, value)}
              />
            ))}
        </DialogFields>
        {children}
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        <Actions style={{ justifyContent: "flex-end", marginTop: 24 }}>
          <Button
            style={{ minWidth: 150, minHeight: 52 }}
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            {m("Cancel")}
          </Button>
          <Button
            style={{ minWidth: 162, minHeight: 52 }}
            $primary
            disabled={busy}
            type="submit"
          >
            {m(busy ? "Saving…" : submitLabel)}
          </Button>
        </Actions>
      </form>
    </Modal>
  );
}
export function Field({ field, value, onChange, error }) {
  const m = useCopy();
  const errorId = useId();
  const props = {
    name: field.name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    "data-agent-field": field.agent,
    required: field.required,
    disabled: field.disabled,
    value,
    onChange: (event) =>
      onChange(
        field.type === "number"
          ? event.target.value === ""
            ? ""
            : Number(event.target.value)
          : event.target.value,
      ),
    maxLength: field.maxLength || 5000,
  };
  return (
    <Label $wide={field.wide}>
      {m(field.label)}
      {field.required ? " *" : ""}
      {field.options ? (
        <DesignSelect
          value={value}
          name={field.name}
          label={`${m(field.label)}${field.required ? " *" : ""}`}
          agent={field.agent}
          disabled={field.disabled}
          required={field.required}
          placeholder={m(field.placeholder || "Select")}
          options={field.options.map((option) => ({
            value: option.value ?? option,
            label: m(option.label ?? option),
          }))}
          onChange={onChange}
        />
      ) : field.type === "textarea" ? (
        <textarea {...props} placeholder={m(field.placeholder || "")} />
      ) : field.type === "file" ? (
        <input
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
          required={field.required}
          onChange={(event) => onChange(event.target.files[0])}
        />
      ) : (
        <input
          {...props}
          type={field.type || "text"}
          step={field.type === "number" ? "0.0001" : undefined}
          min={field.min}
          max={field.max}
          placeholder={m(field.placeholder || "")}
        />
      )}
      {error && <ErrorBox as="span" id={errorId} role="alert">{error}</ErrorBox>}
    </Label>
  );
}
const DropZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  border: 1px dashed #c6d2e0;
  border-radius: 10px;
  background: #f8fbff;
  padding: 36px 20px;
  cursor: pointer;
  position: relative;
  margin: 20px 0;
  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    width: 100%;
    cursor: pointer;
  }
  svg {
    width: 28px;
    height: 28px;
    color: #547cae;
  }
  small {
    color: var(--color-text-muted);
  }
  strong {
    font-size: 15px;
  }
  &:focus-within {
    outline: 2px solid #6b96ed;
    outline-offset: 3px;
  }
`;
export function FileDrop({ file, onChange, required = false, maxFileMb }) {
  const m = useCopy();
  const limits = useResource("/file-settings", {}, maxFileMb === undefined);
  const limit = maxFileMb ?? limits.data?.data?.maxFileMb ?? 25;
  return (
    <DropZone>
      <UploadCloud />
      <strong>{file?.name || m("Drag and drop a file here")}</strong>
      <span>{m("or click to browse from your device")}</span>
      <small>
        PDF, DOCX, XLSX, PPTX, JPG, PNG · {m("Maximum file size")}: {limit} MB
      </small>
      <input
        aria-label={m("Upload file")}
        type="file"
        required={required}
        accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
        onChange={(event) => onChange(event.target.files[0])}
      />
    </DropZone>
  );
}
export function ResourceState({ resource, empty, children }) {
  const m = useCopy();
  if (resource.loading) return <Panel role="status">{m("Loading…")}</Panel>;
  if (resource.error)
    return (
      <ErrorBox role="alert">
        {resource.error}{" "}
        <Button onClick={resource.reload}>
          <RefreshCw />
          {m("Retry")}
        </Button>
      </ErrorBox>
    );
  if (empty) return <Panel>{m("No records found")}</Panel>;
  return children;
}
export function Pagination({ result, page, onChange }) {
  const m = useCopy();
  return (
    <Actions style={{ justifyContent: "space-between", marginTop: 24 }}>
      <Muted>
        {m("Total records")}: {result?.total || 0}
      </Muted>
      <Actions>
        <Button
          aria-label={m("Previous page")}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span>
          {page} / {Math.max(1, result?.totalPages || 1)}
        </span>
        <Button
          aria-label={m("Next page")}
          disabled={!result?.totalPages || page >= result.totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </Actions>
    </Actions>
  );
}
export function Preview({ path, title, onClose }) {
  const m = useCopy();
  const [media, setMedia] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    let created;
    setMedia(null);
    setError("");
    service
      .preview(path)
      .then((value) => {
        created = value.url;
        if (live) setMedia(value);
        else URL.revokeObjectURL(value.url);
      })
      .catch((e) => {
        if (live) setError(maintenanceError(e));
      });
    return () => {
      live = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [path]);
  return (
    <Modal title={title} onClose={onClose} wide>
      {error ? (
        <ErrorBox role="alert">{error}</ErrorBox>
      ) : media ? (
        media.type === "application/pdf" ? (
          <Suspense fallback={<p>{m("Loading…")}</p>}>
            <PdfPreview blob={media.blob} title={title} />
          </Suspense>
        ) : (
          <img
            src={media.url}
            alt={title}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "65vh",
              margin: "auto",
              objectFit: "contain",
            }}
          />
        )
      ) : (
        <p>{m("Loading…")}</p>
      )}
    </Modal>
  );
}
export const formatFileSize = (bytes) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
export const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = document.documentElement.lang || "en";
  const dateOnly = /^\d{4}-\d{2}-\d{2}(?:T00:00:00(?:\.000)?Z)?$/.test(
    String(value),
  );
  return date.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : readSelectedTimezone(),
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};
export const optionsFrom = (records = [], label = "name") =>
  records.map((record) => ({
    value: record._id || record.id,
    label: record[label] || record.displayName || record.uniqueId,
  }));
export const readable = (text) =>
  String(text || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

Modal.propTypes = {
  titleIcon: PropTypes.node,
  width: PropTypes.string,
  topAligned: PropTypes.bool,
  padding: PropTypes.string,
  titleSize: PropTypes.number,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  wide: PropTypes.bool,
  busy: PropTypes.bool,
};
FormDialog.propTypes = {
  width: PropTypes.string,
  subtitle: PropTypes.string,
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  initial: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  children: PropTypes.node,
};
Field.propTypes = {
  error: PropTypes.string,
  field: PropTypes.object.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};
FileDrop.propTypes = {
  maxFileMb: PropTypes.number,
  file: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};
ResourceState.propTypes = {
  resource: PropTypes.object.isRequired,
  empty: PropTypes.bool,
  children: PropTypes.node,
};
Pagination.propTypes = {
  result: PropTypes.object,
  page: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
Preview.propTypes = {
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
