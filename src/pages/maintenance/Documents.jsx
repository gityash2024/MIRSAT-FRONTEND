import ActionMenu from "./ActionMenu";
import PropTypes from "prop-types";
import { SelectInput } from "./DesignSelect";
import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { Plus, Download, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { supportedLanguage } from "../../utils/supportedLanguage";
import { documentStatus } from "../../utils/documentStatus";
import {
  maintenanceService as service,
  maintenanceError,
  asFormData,
} from "../../services/maintenance.service";
import {
  Page,
  Header,
  Actions,
  Button,
  Panel,
  Grid,
  Stats,
  Stat,
  FilterBar,
  TableWrap,
  Badge,
  Muted,
  Definition,
  FormGrid,
  Label,
  ErrorBox,
  Modal,
  FormDialog,
  Field,
  FileDrop,
  ResourceState,
  Pagination,
  Preview,
  Back,
  useCopy,
  useResource,
  useMaintenanceAccess,
  formatDate,
  formatFileSize,
  optionsFrom,
} from "./shared";

const DOCUMENT_CATEGORIES = [
  "Certificates",
  "Manuals",
  "Policies & SOPs",
  "Inspection Records",
  "Other Records",
];
const downloadVersion = (document, version) =>
  service.download(
    `/documents/${document._id}/versions/${version.number}/file`,
    version.file.filename,
  );
export default function Documents() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [success, setSuccess] = useState(location.state?.success || "");
  const m = useCopy();
  const { i18n } = useTranslation();
  const { manage, browse } = useMaintenanceAccess("documents");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState({
    search: "",
    category: "",
    status: "",
    linkedType: "",
    review: "",
  });
  const [filters, setFilters] = useState({});
  const records = useResource("/documents", { ...filters, page }, browse);
  const summary = useResource("/documents/summary", {}, browse);
  const [selected, setSelected] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [detail, setDetail] = useState(
    searchParams.get("document") || location.state?.document,
  );
  const [history, setHistory] = useState(false);
  const [versionUpload, setVersionUpload] = useState(null);
  const [preview, setPreview] = useState(null);
  const [archive, setArchive] = useState(null);
  const details = useResource(
    detail ? `/documents/${detail}` : null,
    {},
    Boolean(detail),
  );
  const refresh = () => {
    records.reload();
    summary.reload();
    details.reload();
  };
  const rows = records.data?.data || [];
  const counts = summary.data?.data;
  if (!browse)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page>
      <Header style={{ marginBottom: 52 }}>
        <div>
          <h1>{m("Documents & Record Storage")}</h1>
          <p>
            {m(
              "Centralized storage for controlled documents, certificates, manuals, and maintenance records.",
            )}
          </p>
        </div>
        <Actions>
          {manage && (
            <Button as={Link} to="/documents/upload" $primary>
              <Plus />
              {m("Upload Document")}
            </Button>
          )}
        </Actions>
      </Header>
      {success && (
        <Panel
          role="status"
          style={{
            background: "#e3f7ef",
            borderColor: "#b8e1d0",
            color: "#287a5a",
          }}
        >
          <Actions style={{ justifyContent: "space-between" }}>
            <strong>{m(success)}</strong>
            <Button
              aria-label={m("Dismiss confirmation")}
              onClick={() => setSuccess("")}
            >
              ×
            </Button>
          </Actions>
        </Panel>
      )}
      <Stats>
        {[
          [
            "Total Documents",
            counts?.total,
            "blue",
            "Across all assets and records",
          ],
          [
            "Expiring Soon",
            counts?.expiring,
            "amber",
            "Within the next 60 days",
          ],
          [
            "Action Required",
            counts?.actionRequired,
            "red",
            "Expired or missing review",
          ],
          [
            "ISO Readiness",
            counts?.readiness == null ? "—" : `${counts.readiness}%`,
            "green",
            "Controlled and reviewed records",
          ],
        ].map(([label, value, tone, description]) => (
          <Stat key={label} $tone={tone}>
            <strong>{value ?? "—"}</strong>
            <span>{m(label)}</span>
            <small>{m(description)}</small>
          </Stat>
        ))}
      </Stats>
      <Panel>
        <h3>{m("Browse by category")}</h3>
        <Actions>
          {DOCUMENT_CATEGORIES.map((category) => (
            <Button
              style={{
                flex: 1,
                justifyContent: "space-between",
                border: 0,
                background: {
                  Certificates: "#e8f1ff",
                  Manuals: "#f1eaff",
                  "Policies & SOPs": "#e5f6ee",
                  "Inspection Records": "#fff5df",
                  "Other Records": "#eff2f8",
                }[category],
                color: {
                  Certificates: "#1260df",
                  Manuals: "#6741bd",
                  "Policies & SOPs": "#176c4d",
                  "Inspection Records": "#8c6216",
                  "Other Records": "#526579",
                }[category],
              }}
              key={category}
              onClick={() => {
                setDraft((old) => ({ ...old, category }));
                setFilters((old) => ({ ...old, category }));
                setPage(1);
              }}
            >
              {m(category)}{" "}
              <Muted>
                {counts?.categories?.find((row) => row._id === category)
                  ?.count || 0}
              </Muted>
            </Button>
          ))}
        </Actions>
      </Panel>
      <FilterBar
        style={{ minHeight: 104, boxSizing: "border-box" }}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <input
          style={{ flex: "1 1 250px" }}
          aria-label={m("Search documents")}
          placeholder={m("Search by title, ID, asset, or owner")}
          value={draft.search}
          onChange={(event) =>
            setDraft({ ...draft, search: event.target.value })
          }
        />
        <SelectInput
          aria-label={m("Category")}
          value={draft.category}
          onChange={(event) =>
            setDraft({ ...draft, category: event.target.value })
          }
        >
          <option value="">{m("All categories")}</option>
          {DOCUMENT_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {m(value)}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          aria-label={m("Linked To")}
          value={draft.linkedType}
          onChange={(event) =>
            setDraft({ ...draft, linkedType: event.target.value })
          }
        >
          <option value="">{m("Linked To")}</option>
          {[
            ["asset", "Asset"],
            ["equipment", "Equipment"],
            ["task", "Work Order"],
            ["fleet", "Fleet-wide"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {m(label)}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          aria-label={m("Status")}
          value={draft.status}
          onChange={(event) =>
            setDraft({ ...draft, status: event.target.value })
          }
        >
          <option value="">{m("All statuses")}</option>
          {["overdue", "expiring", "controlled"].map((value) => (
            <option key={value} value={value}>
              {m(value)}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          aria-label={m("Review Date")}
          value={draft.review}
          onChange={(event) =>
            setDraft({ ...draft, review: event.target.value })
          }
        >
          <option value="">{m("Review Date")}</option>
          <option value="soon">{m("Within 30 days")}</option>
          <option value="overdue">{m("Overdue")}</option>
        </SelectInput>
        <Button
          type="button"
          onClick={() => {
            setDraft({
              search: "",
              category: "",
              status: "",
              linkedType: "",
              review: "",
            });
            setFilters({});
            setPage(1);
          }}
        >
          {m("Reset Filters")}
        </Button>
        <Button $primary type="submit">
          {m("Apply Filter")}
        </Button>
        <Button type="button" onClick={() => setExporting(!exporting)}>
          <Download />
          {m("Export")}
        </Button>
      </FilterBar>
      {exporting && (
        <Panel>
          <h3>{m("Choose documents to export")}</h3>
          <p>
            {m(
              "Export a branded PDF register, or download the selected original files.",
            )}
          </p>
          <Actions>
            <span>
              {selected.length} {m("selected")}
            </span>
            <Button
              $primary
              disabled={!selected.length || busy || reportBusy}
              onClick={async () => {
                setBusy(true);
                try {
                  await service.download(
                    "/documents/export",
                    "mirsat-documents.zip",
                    { ids: selected },
                  );
                  setExporting(false);
                  setSelected([]);
                } catch (error) {
                  toast.error(maintenanceError(error));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Download />
              {m(
                busy
                  ? "Downloading…"
                  : selected.length > 1
                    ? "Download selected · ZIP"
                    : "Download selected file",
              )}
            </Button>
            <Button
              disabled={!selected.length || busy || reportBusy}
              onClick={async () => {
                setReportBusy(true);
                const language = supportedLanguage(i18n.resolvedLanguage || i18n.language);
                const fixedT = i18n.getFixedT(language, "maintenance");
                try {
                  const { downloadDocumentRegister } = await import("../../services/documentRegister");
                  await downloadDocumentRegister(selected, {
                    language,
                    translate: (text) => fixedT(text, { defaultValue: text, keySeparator: false }),
                  });
                } catch (error) {
                  toast.error(maintenanceError(error));
                } finally {
                  setReportBusy(false);
                }
              }}
            >
              <Download />
              {m(reportBusy ? "Preparing report…" : "Export register · PDF")}
            </Button>
            <Button
              disabled={reportBusy}
              onClick={() => {
                setExporting(false);
                setSelected([]);
              }}
            >
              {m("Cancel")}
            </Button>
          </Actions>
        </Panel>
      )}
      <Panel>
        <h2>{m("Document Library")}</h2>
        <p>
          {m("Controlled documents and records from all vessels and equipment")}
        </p>
        <ResourceState resource={records} empty={!rows.length}>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      aria-label={m("Select all on this page")}
                      type="checkbox"
                      checked={
                        rows.length > 0 &&
                        rows.every((row) => selected.includes(row._id))
                      }
                      onChange={(event) =>
                        setSelected((old) =>
                          event.target.checked
                            ? [
                                ...new Set([
                                  ...old,
                                  ...rows.map((row) => row._id),
                                ]),
                              ]
                            : old.filter(
                                (id) => !rows.some((row) => row._id === id),
                              ),
                        )
                      }
                    />
                  </th>
                  {[
                    "Document",
                    "Category",
                    "Linked To",
                    "Version",
                    "Owner",
                    "Review / Expiry",
                    "Status",
                    "Actions",
                  ].map((label) => (
                    <th key={label}>{m(label)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((document) => {
                  const version = document.versions.at(-1);
                  return (
                    <tr key={document._id}>
                      <td>
                        <input
                          aria-label={`${m("Select")} ${document.title}`}
                          type="checkbox"
                          checked={selected.includes(document._id)}
                          onChange={(event) =>
                            setSelected((old) =>
                              event.target.checked
                                ? [...old, document._id]
                                : old.filter((id) => id !== document._id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setHistory(false);
                            setDetail(document._id);
                          }}
                          style={{
                            border: 0,
                            background: "none",
                            color: "inherit",
                            padding: 0,
                            textAlign: "start",
                            font: "inherit",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {document.title}
                        </button>
                        <small>
                          {document.code ||
                            document._id.slice(-8).toUpperCase()}{" "}
                          ·{" "}
                          {version?.file.filename
                            .split(".")
                            .at(-1)
                            ?.toUpperCase()}
                        </small>
                      </td>
                      <td>{m(document.category)}</td>
                      <td>{document.asset?.displayName || m("Fleet-wide")}</td>
                      <td>{version?.label || `v${version?.number}.0`}</td>
                      <td>
                        {document.owner?.name ||
                          document.createdBy?.name ||
                          "—"}
                      </td>
                      <td>
                        {formatDate(document.expiryDate || document.reviewDate)}
                      </td>
                      <td>
                        <Badge $status={documentStatus(document)}>
                          {m(
                            documentStatus(document).replace(/^./, (letter) =>
                              letter.toUpperCase(),
                            ),
                          )}
                        </Badge>
                      </td>
                      <td>
                        <ActionMenu
                          label={`${m("Actions")} ${document.title}`}
                          items={[
                            {
                              label: m("View details"),
                              onClick: () => {
                                setHistory(false);
                                setDetail(document._id);
                              },
                            },
                            {
                              label: m("Version history"),
                              onClick: () => {
                                setHistory(true);
                                setDetail(document._id);
                              },
                            },
                            {
                              label: m("Download current version"),
                              onClick: () =>
                                downloadVersion(document, version).catch(
                                  (error) =>
                                    toast.error(maintenanceError(error)),
                                ),
                            },
                            manage && {
                              label: m("Upload new version"),
                              onClick: () => setVersionUpload(document),
                            },
                            manage && {
                              label: m("Archive"),
                              onClick: () => setArchive(document),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
          <Pagination result={records.data} page={page} onChange={setPage} />
        </ResourceState>
      </Panel>
      {detail && (
        <Modal
          title={
            history
              ? m("Version history")
              : details.data?.data
                ? `${details.data.data.code || ""} · ${details.data.data.title}`
                : m("Document Details")
          }
          onClose={() => setDetail(null)}
          width={history ? "940px" : "820px"}
          padding="36px"
          titleSize={24}
          topAligned
        >
          <ResourceState resource={details}>
            {details.data?.data && (
              <DocumentDetailContent
                document={details.data.data}
                history={history}
                manage={manage}
                onHistory={() => setHistory(true)}
                onClose={() => setDetail(null)}
                onVersion={() => {
                  setVersionUpload(details.data.data);
                  setDetail(null);
                }}
                onPreview={setPreview}
              />
            )}
          </ResourceState>
        </Modal>
      )}
      {versionUpload && (
        <VersionUpload
          document={versionUpload}
          onClose={() => setVersionUpload(null)}
          onSaved={() => {
            refresh();
            setSuccess("Document version updated successfully");
          }}
        />
      )}
      {archive && (
        <FormDialog
          title="Archive document"
          fields={[]}
          onClose={() => setArchive(null)}
          onSubmit={async () => {
            await service.save(
              `/documents/${archive._id}`,
              undefined,
              "delete",
            );
            setSelected((old) => old.filter((id) => id !== archive._id));
            refresh();
          }}
          submitLabel="Archive"
        >
          <p>
            {m(
              "This document and its versions will be retained and removed from the active library.",
            )}
          </p>
        </FormDialog>
      )}
      {preview && <Preview {...preview} onClose={() => setPreview(null)} />}
    </Page>
  );
}

export function UploadDocument({ assetId, equipmentId, onClose, onSaved } = {}) {
  const m = useCopy();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const embedded = Boolean(assetId);
  const { manage } = useMaintenanceAccess("documents");
  const lookups = useResource("/documents/lookups", {}, manage);
  const [values, setValues] = useState({
    title: "",
    category: "",
    description: "",
    asset: assetId || search.get("asset") || "",
    equipment: embedded ? equipmentId || "" : search.get("equipment") || "",
    documentType: "",
    versionLabel: "v1.0",
    language: "English",
    owner: "",
    accessLevel: "all",
    authorizedUsers: [],
    controlled: true,
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (name, value) =>
    setValues((old) => ({ ...old, [name]: value }));
  const fields = lookups.data?.data || {};
  if (!manage)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  const form = (
    <ResourceState resource={lookups}>
      <Panel>
        <Actions style={{ justifyContent: "space-between" }}>
          {["1. Upload File", "2. Document Details", "3. Link & Control"].map(
            (label) => (
              <strong key={label}>{m(label)}</strong>
            ),
          )}
        </Actions>
      </Panel>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            if (!file) throw new Error(m("Select a file to upload"));
            if (file.size > (fields.maxFileMb || 25) * 1024 * 1024)
              throw new Error(
                `${m("Maximum file size")}: ${fields.maxFileMb || 25} MB`,
              );
            const saved = await service.save(
              "/documents",
              asFormData({ ...values, file }),
            );
            if (embedded) {
              onSaved(saved.data);
              return;
            }
            navigate("/documents", {
              state: {
                success: "Document uploaded successfully",
                document: saved.data._id,
              },
            });
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Grid>
          <Panel>
            <h2>{m("1. Upload File")}</h2>
            <p>
              {m("Choose the primary file to store in the document library")}
            </p>
            <FileDrop
              file={file}
              onChange={setFile}
              maxFileMb={fields.maxFileMb || 25}
              required
            />
            <h2 style={{ marginTop: 32 }}>{m("2. Document Details")}</h2>
            <p>
              {m(
                "Add information that helps users identify and retrieve the file.",
              )}
            </p>
            <FormGrid>
              {[
                { name: "title", label: "Document Title", required: true },
                {
                  name: "documentType",
                  label: "Document Type",
                  options: [
                    "PDF",
                    "Manual",
                    "Certificate",
                    "Report",
                    "Policy",
                    "Other",
                  ],
                  required: true,
                },
                {
                  name: "category",
                  label: "Category",
                  options: DOCUMENT_CATEGORIES,
                  required: true,
                },
                {
                  name: "versionLabel",
                  label: "Version",
                  required: true,
                  maxLength: 30,
                },
                {
                  name: "language",
                  label: "Language",
                  options: ["English", "Arabic", "Other"],
                  required: true,
                },
                {
                  name: "owner",
                  label: "Document Owner",
                  options: optionsFrom(fields.users),
                  required: true,
                },
                {
                  name: "description",
                  label: "Description",
                  type: "textarea",
                  wide: true,
                },
              ].map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  onChange={(value) => change(field.name, value)}
                />
              ))}
            </FormGrid>
            <h2 style={{ marginTop: 32 }}>{m("3. Link & Control")}</h2>
            <p>
              {m(
                "Define where the document belongs and how it is controlled.",
              )}
            </p>
            <FormGrid>
              {!embedded && (<>
              <Field
                field={{
                  name: "asset",
                  label: "Select Asset",
                  options: optionsFrom(fields.assets, "displayName"),
                }}
                value={values.asset}
                onChange={(value) => {
                  change("asset", value);
                  change("equipment", "");
                }}
              />
              <Field
                field={{
                  name: "equipment",
                  label: "Select Equipment",
                  options: optionsFrom(
                    (fields.equipment || []).filter(
                      (row) => !values.asset || row.asset === values.asset,
                    ),
                  ),
                }}
                value={values.equipment}
                onChange={(value) => change("equipment", value)}
              />
              </>)}
              {Boolean(fields.tasks?.length) && (
                <Field
                  field={{
                    name: "task",
                    label: "Work Order",
                    options: optionsFrom(fields.tasks, "title"),
                  }}
                  value={values.task || ""}
                  onChange={(value) => change("task", value)}
                />
              )}
            </FormGrid>
          </Panel>
          <div>
            <Panel>
              <h2>{m("Document Control")}</h2>
              <p>{m("Review the control settings for this record.")}</p>
              <FormGrid style={{ gridTemplateColumns: "1fr" }}>
                {[
                  {
                    name: "effectiveDate",
                    label: "Effective Date",
                    type: "date",
                  },
                  { name: "reviewDate", label: "Review Date", type: "date" },
                  { name: "expiryDate", label: "Expiry Date", type: "date" },
                  {
                    name: "accessLevel",
                    label: "Access Level",
                    options: [
                      { value: "all", label: "All Authorized Users" },
                      { value: "restricted", label: "Restricted Access" },
                    ],
                  },
                ].map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    value={values[field.name] || ""}
                    onChange={(value) => change(field.name, value)}
                  />
                ))}
              </FormGrid>
              {values.accessLevel === "restricted" && (
                <Label style={{ marginTop: 20 }}>
                  {m("Authorized Users")}
                  <SelectInput
                    multiple
                    value={values.authorizedUsers}
                    onChange={(event) =>
                      change(
                        "authorizedUsers",
                        [...event.target.selectedOptions].map(
                          (option) => option.value,
                        ),
                      )
                    }
                  >
                    {(fields.users || []).map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </SelectInput>
                </Label>
              )}
              <Label
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={values.controlled}
                  onChange={(event) =>
                    change("controlled", event.target.checked)
                  }
                />
                {m("ISO record control")}
              </Label>
              {error && <ErrorBox role="alert">{error}</ErrorBox>}
              <Actions style={{ marginTop: 24 }}>
                <Button $primary type="submit" disabled={busy}>
                  {m(busy ? "Uploading…" : "Upload & Save")}
                </Button>
                {embedded ? (
                  <Button type="button" onClick={onClose} disabled={busy}>{m("Cancel")}</Button>
                ) : (
                  <Button as={Link} to="/documents">{m("Cancel")}</Button>
                )}
              </Actions>
            </Panel>
            <Panel>
              <h3>{m("Where should I link it?")}</h3>
              <Definition $columns={1}>
                {[
                  ["Asset", "A vessel-level certificate or policy"],
                  ["Equipment", "A manual or record for installed equipment"],
                  ["Fleet-wide", "A policy or SOP used across all assets"],
                ].map(([label, description]) => (
                  <div key={label}>
                    <dt>{m(label)}</dt>
                    <dd>{m(description)}</dd>
                  </div>
                ))}
              </Definition>
            </Panel>
          </div>
        </Grid>
      </form>
    </ResourceState>
  );
  if (embedded) {
    return <Modal title={m("Add Document")} onClose={onClose} busy={busy} wide>{form}</Modal>;
  }
  return (
    <Page>
      <Back to="/documents">
        <ArrowLeft size={14} />
        {m("Documents & Record Storage")} / {m("Upload")}
      </Back>
      <Header>
        <div>
          <h1>{m("Upload Document")}</h1>
          <p>
            {m(
              "Add a controlled document or record and link it to the correct asset or equipment.",
            )}
          </p>
        </div>
      </Header>
      {form}
    </Page>
  );
}

function DocumentDetailContent({
  document,
  history,
  manage,
  onHistory,
  onClose,
  onVersion,
  onPreview,
}) {
  const m = useCopy();
  const current = document.versions.at(-1);
  const download = (version) =>
    downloadVersion(document, version).catch((error) =>
      toast.error(maintenanceError(error)),
    );
  const view = (version) =>
    ["application/pdf", "image/jpeg", "image/png"].includes(
      version.file.contentType,
    ) && (
      <Button
        onClick={() =>
          onPreview({
            path: `/documents/${document._id}/versions/${version.number}/file?preview=true`,
            title: version.file.filename,
          })
        }
      >
        {m("View")}
      </Button>
    );
  if (history)
    return (
      <>
        <h3>
          {document.code} · {document.title}
        </h3>
        {[...document.versions].reverse().map((version) => (
          <section key={version._id} style={{ margin: "24px 0" }}>
            <strong>
              {version.label || `v${version.number}.0`} ·{" "}
              {m(
                version.number === current?.number
                  ? "Current version"
                  : "Previous version",
              )}
            </strong>
            <p style={{ margin: "4px 0" }}>
              {formatDate(version.createdAt)} · {version.createdBy?.name || "—"}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{version.notes || "—"}</p>
            <Actions>
              <Button $primary onClick={() => download(version)}>
                <Download />
                {m("Download")} {version.label || `v${version.number}.0`}
              </Button>
              {view(version)}
            </Actions>
          </section>
        ))}
        <p>{m("Earlier versions remain available for reference.")}</p>
        <Actions>
          <Button onClick={onClose}>{m("Back to Documents")}</Button>
          {manage && (
            <Button $primary onClick={onVersion}>
              {m("Upload new version")}
            </Button>
          )}
        </Actions>
      </>
    );
  return (
    <>
      <p>
        {m("Controlled document linked to")}{" "}
        {document.asset?.displayName || document.part?.name || m("Fleet-wide")}.
      </p>
      <FormGrid style={{ margin: "32px 0" }}>
        {[
          ["Document Type", document.documentType || document.category],
          [
            "Linked To",
            document.equipment?.name ||
              document.asset?.displayName ||
              document.part?.name ||
              m("Fleet-wide"),
          ],
          ["Version", current?.label || `v${current?.number}.0`],
          ["Owner", document.owner?.name || document.createdBy?.name],
          ["Review Date", formatDate(document.reviewDate)],
          [
            "Access",
            m(
              document.accessLevel === "restricted"
                ? "Restricted Access"
                : "All Authorized Users",
            ),
          ],
        ].map(([label, value]) => (
          <Label key={label}>
            {m(label)}
            <input
              readOnly
              value={value || "—"}
              style={{ background: "#f8fbff" }}
            />
          </Label>
        ))}
      </FormGrid>
      {document.description && (
        <p style={{ whiteSpace: "pre-wrap" }}>{document.description}</p>
      )}
      {current && (
        <>
          <Label>
            {m("File")}
            <Panel style={{ margin: 0, padding: 16 }}>
              <strong>{current.file.filename}</strong>
              <small style={{ display: "block", marginTop: 6 }}>
                {current.file.filename.split(".").at(-1).toUpperCase()} ·{" "}
                {formatFileSize(current.file.size)}
              </small>
            </Panel>
          </Label>
          <Actions style={{ marginTop: 48, justifyContent: "space-between" }}>
            <Button $primary onClick={onHistory}>
              {m("Version history")}
            </Button>
            <Button onClick={onClose}>{m("Back to Documents")}</Button>
            {view(current)}
            <Button $primary onClick={() => download(current)}>
              <Download />
              {m("Download")}
            </Button>
          </Actions>
        </>
      )}
    </>
  );
}
DocumentDetailContent.propTypes = {
  document: PropTypes.object.isRequired,
  history: PropTypes.bool,
  manage: PropTypes.bool,
  onHistory: PropTypes.func,
  onClose: PropTypes.func,
  onVersion: PropTypes.func,
  onPreview: PropTypes.func,
};
function VersionUpload({ document, onClose, onSaved }) {
  const m = useCopy();
  const [file, setFile] = useState(null),
    [notes, setNotes] = useState("");
  const [versionLabel, setVersionLabel] = useState(
    `v${document.versions.length + 1}.0`,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      title={m("Upload new version")}
      onClose={onClose}
      busy={busy}
      width="940px"
      padding="32px"
      titleSize={30}
      topAligned
    >
      <h3>
        {document.code} · {document.title} · {m("Current version")}{" "}
        {document.versions.at(-1)?.label}
      </h3>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            if (!file) throw new Error(m("Select a file to upload"));
            await service.save(
              `/documents/${document._id}/versions`,
              asFormData({ file, notes, versionLabel }),
            );
            onSaved();
            onClose();
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <FileDrop file={file} onChange={setFile} required />
        <FormGrid style={{ gridTemplateColumns: "1fr" }}>
          <Field
            field={{
              name: "versionLabel",
              label: "New version",
              required: true,
              maxLength: 30,
            }}
            value={versionLabel}
            onChange={setVersionLabel}
          />
          <Field
            field={{ name: "notes", label: "Change summary", type: "textarea" }}
            value={notes}
            onChange={setNotes}
          />
        </FormGrid>
        <p style={{ marginTop: 24 }}>
          {m("The previous version is retained in Version history.")}
        </p>
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        <Actions>
          <Button $primary type="submit" disabled={busy}>
            {m(busy ? "Uploading…" : "Upload & Save")}
          </Button>
          <Button type="button" disabled={busy} onClick={onClose}>
            {m("Cancel")}
          </Button>
        </Actions>
      </form>
    </Modal>
  );
}
VersionUpload.propTypes = {
  document: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
