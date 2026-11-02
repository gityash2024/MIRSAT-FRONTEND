import { useEffect, useState, useId } from "react";
import PropTypes from "prop-types";
import { Plus, Trash2, ImagePlus, UploadCloud } from "lucide-react";
import { maintenanceService as service } from "../../services/maintenance.service";
import {
  Panel,
  FormGrid,
  Field,
  Label,
  Button,
  Actions,
  ErrorBox,
  useCopy,
  useResource,
} from "./shared";

export function PrivateImage({ path, revision, fallback, alt, style }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let live = true,
      created;
    setUrl(null);
    if (path)
      service
        .preview(path)
        .then((media) => {
          created = media.url;
          if (live) setUrl(created);
          else URL.revokeObjectURL(created);
        })
        .catch(() => {});
    return () => {
      live = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [path, revision]);
  return url || fallback ? (
    <img
      src={url || fallback}
      alt={alt}
      style={{
        display: "block",
        width: "100%",
        height: 226,
        objectFit: "contain",
        borderRadius: 8,
        ...style,
      }}
    />
  ) : (
    <ImagePlus aria-label={alt} size={90} strokeWidth={1.2} />
  );
}
PrivateImage.propTypes = {
  path: PropTypes.string,
  revision: PropTypes.string,
  fallback: PropTypes.string,
  alt: PropTypes.string.isRequired,
  style: PropTypes.object,
};

export function ImagePicker({
  file,
  onChange,
  currentPath,
  revision,
  onRemove,
}) {
  const m = useCopy();
  const limits = useResource("/file-settings");
  const maxImageMb = limits.data?.data?.maxImageMb || 10;
  const [url, setUrl] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <>
      <Label
        style={{
          border: "1px dashed #ccd8ea",
          borderRadius: 8,
          padding: 24,
          position: "relative",
          minHeight: 174,
          justifyContent: "center",
          boxSizing: "border-box",
          alignItems: "center",
          textAlign: "center",
          background: "#f8fbff",
        }}
      >
        {url ? (
          <img
            src={url}
            alt={m("Selected image preview")}
            style={{ width: "100%", maxHeight: 200, objectFit: "contain" }}
          />
        ) : currentPath ? (
          <PrivateImage
            path={currentPath}
            revision={revision}
            alt={m("Current image")}
            style={{ height: 180 }}
          />
        ) : (
          <UploadCloud size={40} color="#000048" />
        )}
        <strong>{file?.name || m("Click to upload an image")}</strong>
        <small>
          PNG, JPG · {m("Maximum file size")}: {maxImageMb} MB
        </small>
        <input
          aria-label={m("Upload image")}
          type="file"
          accept=".jpg,.jpeg,.png"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            setError("");
            if (!selected) return;
            if (
              !/\.(png|jpe?g)$/i.test(selected.name) ||
              !["image/jpeg", "image/png"].includes(selected.type)
            ) {
              setError(m("Select a PNG or JPG image"));
              event.target.value = "";
              return;
            }
            if (selected.size > maxImageMb * 1024 * 1024) {
              setError(`${m("Maximum file size")}: ${maxImageMb} MB`);
              event.target.value = "";
              return;
            }
            onChange(selected);
          }}
        />
      </Label>
      {(file || (currentPath && onRemove)) && (
        <Button
          type="button"
          style={{ marginTop: 12 }}
          onClick={() => {
            onChange(null);
            if (!file) onRemove?.();
          }}
        >
          {m("Remove image")}
        </Button>
      )}
      {error && <ErrorBox role="alert">{error}</ErrorBox>}
    </>
  );
}
ImagePicker.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  currentPath: PropTypes.string,
  revision: PropTypes.string,
  onRemove: PropTypes.func,
};

export const cleanRecords = (records) =>
  records.map(({ name, value, dataType, unit, date, document }) => ({
    name,
    value: String(value),
    ...(dataType ? { dataType } : {}),
    ...(unit ? { unit } : {}),
    ...(date ? { date } : {}),
    ...(document ? { document: document._id || document } : {}),
  }));
export function RecordFields({ records, onChange, documents = [] }) {
  const m = useCopy();
  const list = useId();
  const update = (index, values) =>
    onChange(
      records.map((record, i) =>
        i === index ? { ...record, ...values } : record,
      ),
    );
  return (
    <>
      <datalist id={list}>
        {[
          "Registration Number",
          "Flag",
          "Year Built",
          "Length Overall",
          "Gross Tonnage",
          "Insurance Policy",
          "Class Certificate",
          "Engine Hours",
          "Warranty Expiry",
        ].map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      {records.map((record, index) => (
        <Panel key={index} style={{ padding: 16, background: "#fafcff" }}>
          <Actions
            style={{ justifyContent: "space-between", marginBottom: 16 }}
          >
            <strong>
              {m("Record")} {index + 1}
            </strong>
            <Button
              type="button"
              aria-label={`${m("Remove record")} ${index + 1}`}
              onClick={() => onChange(records.filter((_, i) => i !== index))}
            >
              <Trash2 />
            </Button>
          </Actions>
          <FormGrid>
            <Label>
              {m("Record Name")} *
              <input
                list={list}
                value={record.name}
                required
                maxLength={300}
                onChange={(event) =>
                  update(index, { name: event.target.value })
                }
              />
            </Label>
            <Field
              field={{
                name: `dataType${index}`,
                label: "Data Type",
                required: true,
                options: [
                  { value: "text", label: "Text" },
                  { value: "number", label: "Number" },
                  { value: "date", label: "Date" },
                  { value: "boolean", label: "Yes / No" },
                  { value: "file", label: "File" },
                ],
              }}
              value={record.dataType || "text"}
              onChange={(dataType) =>
                update(index, { dataType, value: "", document: undefined })
              }
            />
            <Field
              field={{
                name: `value${index}`,
                label: "Record Value",
                required: true,
                ...(record.dataType === "file"
                  ? {
                      options: documents.map((document) => ({
                        value: document._id,
                        label: document.title,
                      })),
                    }
                  : record.dataType === "boolean"
                    ? {
                        options: [
                          { value: "true", label: "Yes" },
                          { value: "false", label: "No" },
                        ],
                      }
                    : {
                        type: ["number", "date"].includes(record.dataType)
                          ? record.dataType
                          : "text",
                      }),
              }}
              value={
                record.dataType === "file"
                  ? record.document?._id || record.document || ""
                  : record.value
              }
              onChange={(value) =>
                update(
                  index,
                  record.dataType === "file"
                    ? {
                        value:
                          documents.find((document) => document._id === value)
                            ?.title || "",
                        document: value,
                      }
                    : { value: String(value) },
                )
              }
            />
            <Field
              field={{ name: `unit${index}`, label: "Unit", maxLength: 50 }}
              value={record.unit || ""}
              onChange={(unit) => update(index, { unit })}
            />
          </FormGrid>
          {record.dataType === "file" && !documents.length && (
            <p style={{ marginTop: 12 }}>
              {m("Upload a document first, then select it from this record.")}
            </p>
          )}
        </Panel>
      ))}
      <Button
        type="button"
        onClick={() =>
          onChange([...records, { name: "", value: "", dataType: "text" }])
        }
      >
        <Plus />
        {m("Add Record")}
      </Button>
    </>
  );
}
RecordFields.propTypes = {
  records: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  documents: PropTypes.array,
};

export function DocumentQueue({ files, onChange, title = "Upload documents" }) {
  const m = useCopy();
  const limits = useResource("/file-settings");
  const maxFileMb = limits.data?.data?.maxFileMb || 25;
  const [error, setError] = useState("");
  return (
    <>
      <Label
        style={{
          padding: 22,
          position: "relative",
          minHeight: 104,
          justifyContent: "center",
          boxSizing: "border-box",
          border: "1px dashed #ccd8ea",
          borderRadius: 8,
          background: "#f8fbff",
          textAlign: "center",
        }}
      >
        <strong>+ {m(title)}</strong>
        <small>PDF, Word, Excel, PowerPoint, JPG, PNG · {maxFileMb} MB</small>
        <input
          aria-label={m(title)}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
          onChange={(event) => {
            const selected = [...(event.target.files || [])];
            if (
              selected.some(
                (file) =>
                  file.size > maxFileMb * 1024 * 1024 ||
                  !/\.(pdf|docx|xlsx|pptx|jpe?g|png)$/i.test(file.name),
              )
            ) {
              setError(
                `${m("Select a supported document")}. ${m("Maximum file size")}: ${maxFileMb} MB`,
              );
              event.target.value = "";
              return;
            }
            setError("");
            onChange([
              ...files,
              ...selected.map((file) => ({ file, key: crypto.randomUUID() })),
            ]);
            event.target.value = "";
          }}
        />
      </Label>
      {files.map((entry) => (
        <Actions
          key={entry.key}
          style={{
            justifyContent: "space-between",
            padding: "10px 12px",
            border: "1px solid #ccd8ea",
            borderRadius: 6,
            marginTop: 12,
          }}
        >
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            {entry.file.name}
          </span>
          <Button
            type="button"
            aria-label={`${m("Remove")} ${entry.file.name}`}
            onClick={() =>
              onChange(files.filter((item) => item.key !== entry.key))
            }
          >
            <Trash2 size={16} />
          </Button>
        </Actions>
      ))}
      {error && <ErrorBox role="alert">{error}</ErrorBox>}
    </>
  );
}
DocumentQueue.propTypes = {
  files: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  title: PropTypes.string,
};
export function FormSteps({
  first = "Asset Information",
  second = "Documents & Records",
}) {
  const m = useCopy();
  return (
    <Panel
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        marginBottom: 32,
        padding: "18px 26px",
        flexWrap: "wrap",
      }}
    >
      {[first, second, "Review"].map((label, index) => (
        <div
          key={label}
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 14,
            minWidth: 160,
            color: index ? "var(--color-text-muted)" : "var(--color-navy)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              flexShrink: 0,
              background: index ? "#e7edf6" : "var(--color-navy)",
              color: index ? "var(--color-text-muted)" : "white",
            }}
          >
            {index + 1}
          </span>
          <strong>{m(label)}</strong>
        </div>
      ))}
    </Panel>
  );
}
FormSteps.propTypes = { first: PropTypes.string, second: PropTypes.string };
