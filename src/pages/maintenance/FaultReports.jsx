import { SelectInput } from "./DesignSelect";
import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Download,
  ArrowLeft,
  RefreshCw,
  Paperclip,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import TaskForm from "../tasks/components/TaskForm";
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
  FilterBar,
  TableWrap,
  Badge,
  Muted,
  Definition,
  FormGrid,
  Label,
  ErrorBox,
  FormDialog,
  Field,
  FileDrop,
  ResourceState,
  Pagination,
  Preview,
  Back,
  Tabs,
  TextLink,
  useCopy,
  useResource,
  useMaintenanceAccess,
  canManageMaintenance,
  formatDate,
  formatFileSize,
  optionsFrom,
  readable,
} from "./shared";

const priorities = ["low", "medium", "high", "critical"];
const faultTypes = ["Mechanical", "Electrical", "Structural", "Other"];
const states = [
  "open",
  "under_assessment",
  "in_progress",
  "resolved",
  "closed",
];
const QueueRow = styled.div`
  display: grid;
  grid-template-columns:
    80px minmax(130px, 1.5fr) minmax(80px, 1fr) minmax(75px, 1fr)
    88px 86px 68px 20px;
  gap: 12px;
  align-items: center;
  padding: 20px 16px;
  border: 1px solid #dce7f7;
  border-inline-start: 5px solid
    ${(p) =>
      ({
        critical: "#e72d2d",
        high: "#ff9200",
        medium: "#f4c636",
        low: "#29ae78",
      })[p.$severity]};
  border-radius: 10px;
  background: white;
  margin-bottom: 14px;
  min-width: 760px;
  small {
    display: block;
    color: var(--color-text-muted);
    font-size: 9px;
    font-weight: 600;
    margin-bottom: 9px;
    text-transform: uppercase;
  }
  strong {
    font-size: 13px;
  }
`;
export default function FaultReports() {
  const m = useCopy();
  const { browse } = useMaintenanceAccess("faults");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("triage");
  const [showAll, setShowAll] = useState(false);
  const initial = {
    search: "",
    status: "",
    severity: "",
    faultType: "",
    assetType: "",
    asset: "",
    reportedBy: "",
  };
  const [draft, setDraft] = useState(initial);
  const [filters, setFilters] = useState({});
  const records = useResource("/fault-reports", { ...filters, page }, browse);
  const summary = useResource("/fault-reports/summary", {}, browse);
  const lookups = useResource("/fault-reports/lookups", {}, browse);
  const rows = records.data?.data || [];
  const stats = summary.data?.data;
  const total = stats?.statuses?.reduce((sum, row) => sum + row.count, 0) || 0;
  const count = (status) =>
    stats?.statuses?.find((row) => row._id === status)?.count || 0;
  const critical =
    stats?.severities?.find((row) => row._id === "critical")?.count || 0;
  if (!browse)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page>
      <Header style={{ marginBottom: 44 }}>
        <div>
          <h1>{m("Fault Reports")}</h1>
          <p style={{ fontSize: 20, color: "var(--color-navy)" }}>
            {m(
              "Report, monitor, and track faults throughout the maintenance process",
            )}
          </p>
        </div>
        <Actions>
          <Button
            onClick={() => {
              records.reload();
              summary.reload();
            }}
          >
            <RefreshCw />
            {m("Refresh fault reports")}
          </Button>
          <Button
            onClick={() =>
              service
                .download(
                  `/fault-reports/export?${new URLSearchParams(filters)}`,
                  "mirsat-fault-reports.csv",
                )
                .catch((error) => toast.error(maintenanceError(error)))
            }
          >
            <Download />
            {m("Export")}
          </Button>
          <Button as={Link} to="/fault-reports/create" $primary>
            <Plus />
            {m("Create Fault Report")}
          </Button>
        </Actions>
      </Header>
      <Grid $columns="minmax(0,.9fr) minmax(0,1fr)">
        <Panel
          style={{
            background: "var(--color-navy)",
            color: "white",
            padding: 28,
            minHeight: 246,
            boxSizing: "border-box",
          }}
        >
          <small style={{ color: "#c4d5f6", fontWeight: 600 }}>
            {m("FAULT OVERVIEW")}
          </small>
          <Actions style={{ marginTop: 14, gap: 32 }}>
            <strong style={{ fontSize: 48, lineHeight: 1.1 }}>
              {stats ? total : "—"}
            </strong>
            <Muted style={{ color: "#b5c3e4" }}>{m("Reports recorded")}</Muted>
          </Actions>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,minmax(0,1fr))",
              gap: 14,
              marginTop: 32,
            }}
          >
            {[
              ["Open", count("open")],
              ["In Progress", count("in_progress") + count("under_assessment")],
              ["Resolved", count("resolved")],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "#ffffff18",
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <strong style={{ fontSize: 22, display: "block" }}>
                  {value}
                </strong>
                <small style={{ color: "#ffffff" }}>{m(label)}</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel style={{ padding: 28, minHeight: 246, boxSizing: "border-box" }}>
          <Actions style={{ justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 24 }}>{m("Severity Distribution")}</h2>
            <Badge $status="critical">
              {critical} {m("critical faults")}
            </Badge>
          </Actions>
          {[...priorities].reverse().map((severity) => {
            const amount =
              stats?.severities?.find((row) => row._id === severity)?.count ||
              0;
            return (
              <div
                key={severity}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 30px",
                  gap: 12,
                  alignItems: "center",
                  marginTop: 19,
                  fontWeight: 600,
                }}
              >
                <span>{m(readable(severity))}</span>
                <div
                  style={{ height: 12, background: "#edf1f7", borderRadius: 8 }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${total ? (amount / total) * 100 : 0}%`,
                      background: {
                        critical: "#e72d2d",
                        high: "#ff9200",
                        medium: "#f4c636",
                        low: "#29ae78",
                      }[severity],
                      borderRadius: 8,
                    }}
                  />
                </div>
                <span>{amount}</span>
              </div>
            );
          })}
        </Panel>
      </Grid>
      <FilterBar
        style={{ minHeight: 104, marginBottom: 28 }}
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <input
          style={{ flex: "1 1 180px" }}
          aria-label={m("Search faults")}
          placeholder={m("Search fault reports…")}
          value={draft.search}
          onChange={(event) =>
            setDraft({ ...draft, search: event.target.value })
          }
        />
        {[
          [
            "status",
            "Status",
            states.map((value) => ({ value, label: readable(value) })),
          ],
          [
            "severity",
            "Severity",
            priorities.map((value) => ({ value, label: readable(value) })),
          ],
          [
            "faultType",
            "Fault Type",
            faultTypes.map((value) => ({ value, label: value })),
          ],
          [
            "assetType",
            "Asset Type",
            [
              ...new Set(
                (lookups.data?.data?.assets || []).map((asset) => asset.type),
              ),
            ]
              .filter(Boolean)
              .map((value) => ({ value, label: value })),
          ],
          [
            "asset",
            "Asset",
            optionsFrom(lookups.data?.data?.assets, "displayName"),
          ],
          ...(lookups.data?.data?.users?.length
            ? [
                [
                  "reportedBy",
                  "Reported By",
                  optionsFrom(lookups.data.data.users),
                ],
              ]
            : []),
        ].map(([key, label, options]) => (
          <SelectInput
            key={key}
            aria-label={m(label)}
            value={draft[key]}
            onChange={(event) =>
              setDraft({ ...draft, [key]: event.target.value })
            }
          >
            <option value="">{m(label)}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {m(option.label)}
              </option>
            ))}
          </SelectInput>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            type="button"
            onClick={() => {
              setDraft(initial);
              setFilters({});
              setPage(1);
            }}
          >
            {m("Reset Filters")}
          </Button>
          <Button $primary type="submit">
            {m("Apply Filter")}
          </Button>
        </div>
      </FilterBar>
      <Panel>
        <Actions style={{ justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 28 }}>{m("Fault Triage Workspace")}</h2>
            <p style={{ margin: 0 }}>
              {m("Prioritise, review and follow up reported faults")}
            </p>
          </div>
          <Tabs style={{ margin: 0 }}>
            {["triage", "board"].map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={view === value}
                onClick={() => setView(value)}
              >
                {m(value === "triage" ? "Triage View" : "Board View")}
              </button>
            ))}
          </Tabs>
        </Actions>
        <ResourceState resource={records} empty={!rows.length}>
          <Grid $columns="minmax(0,2.15fr) minmax(280px,1fr)">
            <Panel
              style={{ background: "#f8fbff", padding: 22, marginBottom: 0 }}
            >
              <Actions
                style={{ justifyContent: "space-between", marginBottom: 18 }}
              >
                <h2 style={{ fontSize: 24 }}>{m("Fault Queue")}</h2>
                <Muted>
                  {records.data?.total || 0} {m("reports")}
                </Muted>
              </Actions>
              {view === "triage" ? (
                <div style={{ overflowX: "auto" }}>
                  {(showAll ? rows : rows.slice(0, 5)).map((fault) => (
                    <QueueRow key={fault._id} $severity={fault.severity}>
                      <div>
                        <small>{m("Report ID")}</small>
                        <TextLink to={`/fault-reports/${fault._id}`}>
                          {fault.number}
                        </TextLink>
                      </div>
                      <div>
                        <small>{m("Fault Name")}</small>
                        <strong>{fault.title}</strong>
                      </div>
                      <div>
                        <small>{m("Asset")}</small>
                        <strong>{fault.asset?.displayName || "—"}</strong>
                      </div>
                      <div>
                        <small>{m("Asset Type")}</small>
                        <strong>{fault.asset?.type || "—"}</strong>
                      </div>
                      <div>
                        <small>{m("Severity")}</small>
                        <Badge $status={fault.severity}>
                          {m(readable(fault.severity))}
                        </Badge>
                      </div>
                      <div>
                        <small>{m("Status")}</small>
                        <strong>{m(readable(fault.status))}</strong>
                      </div>
                      <div>
                        <small>{m("Reported")}</small>
                        <strong style={{ fontSize: 11 }}>
                          {formatDate(fault.createdAt)}
                        </strong>
                      </div>
                      <TextLink
                        aria-label={`${m("View")} ${fault.number}`}
                        to={`/fault-reports/${fault._id}`}
                      >
                        <ChevronRight size={18} />
                      </TextLink>
                    </QueueRow>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
                  {states.map((status) => (
                    <section key={status} style={{ minWidth: 220, flex: 1 }}>
                      <h3>{m(readable(status))}</h3>
                      {rows
                        .filter((row) => row.status === status)
                        .map((fault) => (
                          <Panel key={fault._id} style={{ padding: 16 }}>
                            <TextLink to={`/fault-reports/${fault._id}`}>
                              {fault.title}
                            </TextLink>
                            <p style={{ marginTop: 10, fontSize: 12 }}>
                              {fault.asset?.displayName}
                            </p>
                            <Badge $status={fault.severity}>
                              {m(readable(fault.severity))}
                            </Badge>
                          </Panel>
                        ))}
                    </section>
                  ))}
                </div>
              )}
              {!showAll && (
                <Button
                  style={{
                    width: "100%",
                    background: "#eef3ff",
                    border: 0,
                    marginTop: 10,
                  }}
                  onClick={() => setShowAll(true)}
                >
                  {m("View all fault reports")} · {records.data?.total || 0}
                </Button>
              )}
              {showAll && (
                <Pagination
                  result={records.data}
                  page={page}
                  onChange={setPage}
                />
              )}
            </Panel>
            <Panel style={{ marginBottom: 0 }}>
              <h2 style={{ fontSize: 24 }}>{m("Needs Attention")}</h2>
              {stats?.attention?.length ? (
                stats.attention.map((fault) => (
                  <Panel
                    key={fault._id}
                    style={{
                      padding: 18,
                      background: "#fff6f3",
                      marginTop: 16,
                    }}
                  >
                    <TextLink to={`/fault-reports/${fault._id}`}>
                      {fault.title}
                    </TextLink>
                    <p style={{ fontSize: 12, margin: "8px 0" }}>
                      {fault.number} · {formatDate(fault.createdAt)}
                    </p>
                    <Badge $status={fault.severity}>
                      {m(readable(fault.severity))}
                    </Badge>
                    <Button
                      as={Link}
                      to={`/fault-reports/${fault._id}`}
                      style={{ marginTop: 12 }}
                    >
                      {m("Assign now")}
                    </Button>
                  </Panel>
                ))
              ) : (
                <Muted>{m("No faults require attention")}</Muted>
              )}
              <h3 style={{ marginTop: 28 }}>{m("Response SLA")}</h3>
              {stats?.assessmentWindow ? (
                <>
                  <div
                    style={{
                      height: 12,
                      background: "#edf1f7",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 8,
                        width: `${stats.assessmentWindow.used}%`,
                        background: "#f69200",
                      }}
                    />
                  </div>
                  <p style={{ marginTop: 10, fontSize: 12 }}>
                    {stats.assessmentWindow.used}%{" "}
                    {m("of assessment response time used")}
                  </p>
                </>
              ) : (
                <p>{m("No assessment deadline set")}</p>
              )}
              <h3 style={{ marginTop: 28 }}>{m("Latest Updates")}</h3>
              {(stats?.latestUpdates || []).map((entry) => (
                <div key={entry._id} style={{ padding: "12px 0" }}>
                  <TextLink to={`/fault-reports/${entry.faultId}`}>
                    {entry.message}
                  </TextLink>
                  <small
                    style={{ display: "block", color: "var(--color-text-muted)", marginTop: 6 }}
                  >
                    {formatDate(entry.createdAt)}
                  </small>
                </div>
              ))}
              <Button
                style={{ width: "100%", marginTop: 20 }}
                onClick={() => {
                  setFilters({ priority: critical ? "critical" : "high" });
                  setPage(1);
                }}
              >
                {m("Open priority queue")} →
              </Button>
            </Panel>
          </Grid>
        </ResourceState>
      </Panel>
    </Page>
  );
}
export function CreateFaultReport() {
  const m = useCopy();
  const navigate = useNavigate();
  const { user, browse } = useMaintenanceAccess("faults");
  const lookups = useResource("/fault-reports/lookups", {}, browse);
  const [values, setValues] = useState({
    title: "",
    asset: "",
    faultType: "",
    faultTypeOther: "",
    location: "",
    locationOther: "",
    description: "",
    severity: "",
    priority: "",
  });
  const [file, setFile] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const assets = lookups.data?.data?.assets || [];
  const locations = ["Engine Room", "Bridge", "Deck"];
  const change = (key, value) => setValues((old) => ({ ...old, [key]: value }));
  if (!browse)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page>
      <Back to="/fault-reports">
        <ArrowLeft size={14} />
        {m("Back to Fault Reports")}
      </Back>
      <Header>
        <div>
          <h1>{m("Create Fault Report")}</h1>
          <p>
            {m(
              "Report a fault and start tracking it through the maintenance process.",
            )}
          </p>
        </div>
      </Header>
      <ResourceState resource={lookups}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            try {
              let id = savedId;
              if (!id) {
                const response = await service.save("/fault-reports", values);
                id = response.data._id;
                setSavedId(id);
              }
              if (file)
                await service.save(
                  `/fault-reports/${id}/attachments`,
                  asFormData({ file }),
                );
              toast.success(m("Fault reported"));
              navigate(`/fault-reports/${id}`);
            } catch (err) {
              setError(maintenanceError(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <FaultFormGrid>
            <Panel>
              <h2>{m("Fault Information")}</h2>
              <FormGrid>
                {[
                  {
                    name: "title",
                    label: "Fault Title",
                    required: true,
                    wide: true,
                    placeholder: "Enter a short fault title",
                  },
                  {
                    name: "asset",
                    label: "Asset",
                    required: true,
                    options: optionsFrom(assets, "displayName"),
                    placeholder: "Select the affected asset",
                  },
                  {
                    name: "faultType",
                    label: "Fault Type",
                    required: true,
                    options: faultTypes,
                    placeholder: "Select fault type",
                  },
                  ...(values.faultType === "Other"
                    ? [
                        {
                          name: "faultTypeOther",
                          label: "Specify fault type",
                          required: true,
                        },
                      ]
                    : []),
                  {
                    name: "severity",
                    label: "Severity",
                    placeholder: "Select severity",
                    required: true,
                    options: priorities.map((value) => ({
                      value,
                      label: readable(value),
                    })),
                  },
                  {
                    name: "location",
                    label: "Location",
                    placeholder: "Select location",
                    required: true,
                    options: [...locations, "Other"],
                  },
                  ...(values.location === "Other"
                    ? [
                        {
                          name: "locationOther",
                          label: "Specify location",
                          required: true,
                        },
                      ]
                    : []),
                  {
                    name: "description",
                    label: "Fault Description",
                    placeholder: "Describe the fault and its observed symptoms",
                    required: true,
                    type: "textarea",
                    wide: true,
                  },
                  {
                    name: "priority",
                    label: "Priority",
                    placeholder: "Select priority",
                    required: true,
                    options: priorities.map((value) => ({
                      value,
                      label: readable(value),
                    })),
                  },
                ].map((field) => (
                  <Field
                    key={field.name}
                    field={{ ...field, disabled: Boolean(savedId) }}
                    value={values[field.name]}
                    onChange={(value) => change(field.name, value)}
                  />
                ))}
              </FormGrid>
            </Panel>
            <Panel>
              <h2>{m("Reporting Details")}</h2>
              <FormGrid style={{ gridTemplateColumns: "1fr" }}>
                <Label>
                  {m("Reported By")}
                  <input disabled value={user.name} />
                </Label>
                <Label>
                  {m("Reported Date")}
                  <input disabled value={formatDate(new Date())} />
                </Label>
                <Label>
                  {m("Initial Status")}
                  <input disabled value={m("Open")} />
                </Label>
              </FormGrid>
              <h3 style={{ marginTop: 24 }}>{m("Photos & Attachments")}</h3>
              <FileDrop
                file={file}
                onChange={setFile}
                maxFileMb={lookups.data?.data?.maxFileMb || 25}
              />
            </Panel>
          </FaultFormGrid>
          {error && (
            <ErrorBox role="alert">
              {savedId && (
                <p>
                  {m(
                    "The report is saved. Retry the attachment upload or open the saved report.",
                  )}{" "}
                  <Link to={`/fault-reports/${savedId}`}>
                    {m("View report")}
                  </Link>
                </p>
              )}
              {error}
            </ErrorBox>
          )}
          <Actions style={{ justifyContent: "flex-end" }}>
            <Button
              as={Link}
              to="/fault-reports"
              style={{ minWidth: 160, minHeight: 54 }}
            >
              {m("Cancel")}
            </Button>
            <Button
              $primary
              type="submit"
              disabled={busy}
              style={{ minWidth: 210, minHeight: 54 }}
            >
              {m(
                busy
                  ? "Saving…"
                  : savedId
                    ? "Retry attachment upload"
                    : "Submit Fault Report",
              )}
            </Button>
          </Actions>
        </form>
      </ResourceState>
    </Page>
  );
}
export function FaultDetail() {
  const { id } = useParams();
  const m = useCopy();
  const { manage, user, browse } = useMaintenanceAccess("faults");
  const resource = useResource(`/fault-reports/${id}`, {}, browse);
  const lookups = useResource("/fault-reports/lookups", {}, manage);
  const fault = resource.data?.data;
  const [dialog, setDialog] = useState(null);
  const [preview, setPreview] = useState(null);
  const assignees = optionsFrom(lookups.data?.data?.users);
  const notifySuccess = () => {
    resource.reload();
    toast.success(m("Saved successfully"));
  };
  if (!browse)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page>
      <Back to="/fault-reports">
        <ArrowLeft size={14} />
        {m("Back to Fault Reports")}
      </Back>
      <ResourceState resource={resource}>
        {fault && (
          <>
            <Header>
              <div>
                <h1>
                  {fault.number} · {fault.title}
                </h1>
                <p>
                  {m("Fault reported for")} {fault.asset?.displayName}
                </p>
                <Badge
                  style={{ marginTop: 24, padding: "12px 18px" }}
                  $status={fault.status}
                >
                  {m(readable(fault.status))}
                </Badge>
              </div>
              {manage && (
                <Actions style={{ gap: 15 }}>
                  <Button
                    style={{ minHeight: 58, minWidth: 205 }}
                    disabled={["resolved", "closed"].includes(fault.status)}
                    onClick={() => setDialog({ type: "assessment" })}
                  >
                    {m("Assign Fault")}
                  </Button>
                  {fault.workOrder ? (
                    <Button as={Link} to={`/tasks/${fault.workOrder._id}`}>
                      {m("Open Work Order")}
                    </Button>
                  ) : (
                    canManageMaintenance(user, "tasks") && (
                      <Button
                        style={{ minHeight: 58, minWidth: 205 }}
                        as={Link}
                        to={`/fault-reports/${id}/work-order`}
                      >
                        {m("Convert to Work Order")}
                      </Button>
                    )
                  )}
                  <Button
                    $primary
                    style={{ minHeight: 58, minWidth: 205 }}
                    onClick={() => setDialog({ type: "status" })}
                  >
                    {m("Update Status")}
                  </Button>
                </Actions>
              )}
            </Header>
            <Grid
              $columns="minmax(0,1.81fr) minmax(300px,1fr)"
              style={{ rowGap: 10 }}
            >
              <Panel style={{ minHeight: 350, boxSizing: "border-box" }}>
                <h2>{m("Fault Overview")}</h2>
                <Definition $columns={4}>
                  {[
                    ["Fault ID", fault.number],
                    ["Asset", fault.asset?.displayName],
                    [
                      "Fault Type",
                      fault.faultType === "Other"
                        ? fault.faultTypeOther
                        : fault.faultType,
                    ],
                    ["Severity", m(readable(fault.severity))],
                    ["Reported By", fault.reportedBy?.name],
                    ["Reported Date", formatDate(fault.reportedAt)],
                    [
                      "Location",
                      fault.location === "Other"
                        ? fault.locationOther
                        : fault.location,
                    ],
                    ["Priority", m(readable(fault.priority))],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{m(label)}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
                </Definition>
                <Muted>{m("Fault Description")}</Muted>
                <p
                  style={{
                    color: "inherit",
                    marginTop: 8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {fault.description}
                </p>
                {fault.diagnosis && (
                  <>
                    <h3>{m("Diagnosis")}</h3>
                    <p>{fault.diagnosis}</p>
                    <h3>{m("Resolution")}</h3>
                    <p>{fault.resolution}</p>
                  </>
                )}
              </Panel>
              <Panel style={{ minHeight: 350, boxSizing: "border-box" }}>
                <h2>{m("Current Status")}</h2>
                <h2 style={{ margin: "20px 0 10px", fontSize: 28 }}>
                  {m(readable(fault.status))}
                </h2>
                <p>
                  {m(
                    fault.status === "open"
                      ? "The fault has been reported and is waiting for assessment."
                      : fault.status === "under_assessment"
                        ? "The fault is being assessed by the assigned person."
                        : fault.status === "closed"
                          ? "This fault has been closed."
                          : "Track the assessment and resolution of this fault.",
                  )}
                </p>
                {fault.assessment?.assignedTo && (
                  <p>
                    {m("Assessment")}: {fault.assessment.assignedTo.name} ·{" "}
                    {formatDate(fault.assessment.dueDate)}
                  </p>
                )}
                <Definition $columns={1}>
                  <div>
                    <dt>{m("Linked Work Order")}</dt>
                    <dd>{fault.workOrder?.title || m("Not created yet")}</dd>
                  </div>
                </Definition>
                {manage && (
                  <Button
                    $primary
                    onClick={() => setDialog({ type: "status", closure: true })}
                  >
                    {m("Diagnosis & Closure")}
                  </Button>
                )}
              </Panel>
              <Panel style={{ minHeight: 470, boxSizing: "border-box" }}>
                <Actions style={{ justifyContent: "space-between" }}>
                  <div>
                    <h2>{m("Actions")}</h2>
                    <p>
                      {m(
                        "Follow-up actions to investigate and resolve this fault.",
                      )}
                    </p>
                  </div>
                  {manage && (
                    <Button
                      $primary
                      disabled={["resolved", "closed"].includes(fault.status)}
                      onClick={() => setDialog({ type: "action" })}
                    >
                      <Plus />
                      {m("Create Action")}
                    </Button>
                  )}
                </Actions>
                <TableWrap>
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Action",
                          "Assigned To",
                          "Priority",
                          "Due Date",
                          "Status",
                        ].map((label) => (
                          <th key={label}>{m(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fault.actions.map((action) => (
                        <tr key={action._id}>
                          <td>
                            {action.title}
                            <small>{action.description}</small>
                          </td>
                          <td>{action.assignedTo?.name || "—"}</td>
                          <td>
                            <Badge $status={action.priority}>
                              {m(readable(action.priority))}
                            </Badge>
                          </td>
                          <td>{formatDate(action.dueDate)}</td>
                          <td>
                            <button
                              style={{
                                border: 0,
                                background: "none",
                                cursor: "pointer",
                              }}
                              disabled={
                                (!manage &&
                                  String(action.assignedTo?._id) !==
                                    String(user._id || user.id)) ||
                                ["resolved", "closed"].includes(fault.status)
                              }
                              onClick={() =>
                                setDialog({ type: "actionStatus", action })
                              }
                            >
                              <Badge $status={action.status}>
                                {m(readable(action.status))}
                              </Badge>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
                {!fault.actions.length && <Muted>{m("No actions yet")}</Muted>}
              </Panel>
              <Panel style={{ minHeight: 470, boxSizing: "border-box" }}>
                <h2>{m("Photos & Attachments")}</h2>
                {fault.attachments.map((file) => (
                  <div
                    key={file._id}
                    style={{
                      padding: "16px 0",
                      borderBottom: "1px solid #edf1f5",
                    }}
                  >
                    <Actions style={{ justifyContent: "space-between" }}>
                      <span>
                        <Paperclip size={13} /> {file.filename}
                        <small style={{ display: "block", color: "var(--color-text-muted)" }}>
                          {formatFileSize(file.size)}
                        </small>
                      </span>
                      <Actions>
                        {[
                          "application/pdf",
                          "image/jpeg",
                          "image/png",
                        ].includes(file.contentType) && (
                          <Button
                            onClick={() =>
                              setPreview({
                                path: `/fault-reports/${id}/attachments/${file._id}/file?preview=true`,
                                title: file.filename,
                              })
                            }
                          >
                            {m("View")}
                          </Button>
                        )}
                        <Button
                          aria-label={`${m("Download")} ${file.filename}`}
                          onClick={() =>
                            service
                              .download(
                                `/fault-reports/${id}/attachments/${file._id}/file`,
                                file.filename,
                              )
                              .catch((error) =>
                                toast.error(maintenanceError(error)),
                              )
                          }
                        >
                          <Download />
                        </Button>
                      </Actions>
                    </Actions>
                  </div>
                ))}
                <Button
                  style={{ width: "100%", marginTop: 20 }}
                  disabled={fault.status === "closed"}
                  onClick={() => setDialog({ type: "attachment" })}
                >
                  <Plus />
                  {m("Add Attachment")}
                </Button>
              </Panel>
            </Grid>
            <Panel
              style={{ minHeight: 360, boxSizing: "border-box", marginTop: 5 }}
            >
              <h2>{m("Activity History")}</h2>
              <p>
                {m(
                  "A chronological record of updates and actions on this fault report.",
                )}
              </p>
              {[...fault.history].reverse().map((entry) => (
                <div
                  key={entry._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "16px 0",
                    borderBottom: "1px solid #f0f4f8",
                    flexWrap: "wrap",
                  }}
                >
                  <span>• {entry.message}</span>
                  <Muted>{entry.actor?.name}</Muted>
                  <Muted>{formatDate(entry.createdAt, true)}</Muted>
                </div>
              ))}
            </Panel>
          </>
        )}
      </ResourceState>
      {dialog?.type === "assessment" && (
        <FormDialog
          title="Assign Fault Assessment"
          subtitle="Assign a qualified team member to review the fault before corrective work begins."
          initial={{ priority: fault.priority }}
          fields={[
            {
              name: "assignedTo",
              label: "Assigned To",
              wide: true,
              options: assignees,
              required: true,
            },
            {
              name: "dueDate",
              label: "Assessment Due Date",
              type: "date",
              required: true,
            },
            {
              name: "priority",
              label: "Priority",
              required: true,
              options: priorities.map((value) => ({
                value,
                label: readable(value),
              })),
            },
            {
              name: "notes",
              label: "Assignment Note",
              type: "textarea",
              wide: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(`/fault-reports/${id}/assessment`, values);
            notifySuccess();
          }}
          submitLabel="Assign Assessment"
        />
      )}
      {dialog?.type === "action" && (
        <FormDialog
          title="Create Corrective Action"
          subtitle="Create a follow-up action to assess or resolve this fault."
          initial={{ priority: fault.priority }}
          fields={[
            {
              name: "title",
              label: "Action Title",
              required: true,
              wide: true,
            },
            {
              name: "assignedTo",
              label: "Assigned To",
              options: assignees,
              required: true,
            },
            {
              name: "dueDate",
              label: "Due Date",
              type: "date",
              required: true,
            },
            {
              name: "description",
              label: "Action Details",
              type: "textarea",
              wide: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(`/fault-reports/${id}/actions`, values);
            notifySuccess();
          }}
          submitLabel="Create Action"
        />
      )}
      {dialog?.type === "status" && (
        <FormDialog
          title={dialog.closure ? "Diagnosis & Closure" : "Update Fault Status"}
          initial={{
            status: dialog.closure ? "resolved" : fault.status,
            diagnosis: fault.diagnosis || "",
            resolution: fault.resolution || "",
          }}
          fields={[
            {
              name: "status",
              label: "New Status",
              options: states.map((value) => ({
                value,
                label: readable(value),
              })),
              required: true,
              wide: true,
            },
            {
              name: "notes",
              label: "Status Note",
              type: "textarea",
              required: true,
              wide: true,
            },
            {
              name: "diagnosis",
              label: "Diagnosis",
              when: (values) =>
                dialog.closure ||
                ["resolved", "closed"].includes(values.status),
              type: "textarea",
              wide: true,
            },
            {
              name: "resolution",
              label: "Resolution",
              when: (values) =>
                dialog.closure ||
                ["resolved", "closed"].includes(values.status),
              type: "textarea",
              wide: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(`/fault-reports/${id}/status`, values);
            notifySuccess();
          }}
          submitLabel="Update Status"
        >
          <Label style={{ marginTop: 24 }}>
            {m("Related Work Order")}
            <input
              value={fault.workOrder?.title || m("Not created yet")}
              readOnly
            />
          </Label>
        </FormDialog>
      )}
      {dialog?.type === "actionStatus" && (
        <FormDialog
          title="Update Action"
          initial={{ status: dialog.action.status }}
          fields={[
            {
              name: "status",
              label: "Status",
              options: ["pending", "in_progress", "completed"].map((value) => ({
                value,
                label: readable(value),
              })),
              required: true,
            },
            {
              name: "notes",
              label: "Notes",
              type: "textarea",
              required: true,
              wide: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/fault-reports/${id}/actions/${dialog.action._id}`,
              values,
              "patch",
            );
            notifySuccess();
          }}
        />
      )}
      {dialog?.type === "attachment" && (
        <FormDialog
          title="Add Attachment"
          fields={[
            {
              name: "file",
              label: "Upload file",
              type: "file",
              required: true,
              wide: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/fault-reports/${id}/attachments`,
              asFormData(values),
            );
            notifySuccess();
          }}
          submitLabel="Upload"
        />
      )}
      {preview && <Preview {...preview} onClose={() => setPreview(null)} />}
    </Page>
  );
}
export function FaultWorkOrder() {
  const { id } = useParams();
  const m = useCopy();
  const navigate = useNavigate();
  const { manage, user } = useMaintenanceAccess("faults");
  const allowed = manage && canManageMaintenance(user, "tasks");
  const resource = useResource(`/fault-reports/${id}`, {}, allowed);
  const fault = resource.data?.data;
  if (!allowed)
    return (
      <ErrorBox>
        {m("Fault management and task creation access are required")}
      </ErrorBox>
    );
  return (
    <Page>
      <Back to={`/fault-reports/${id}`}>
        <ArrowLeft size={14} />
        {m("Back to Fault Report")}
      </Back>
      <Header>
        <div>
          <h1>{m("Convert to Work Order")}</h1>
          <p>
            {m(
              "Complete the existing inspection task requirements before creating the linked work order.",
            )}
          </p>
        </div>
      </Header>
      <ResourceState resource={resource}>
        {fault &&
          (fault.workOrder ? (
            <Panel>
              <TextLink to={`/tasks/${fault.workOrder._id}`}>
                {m("Open Work Order")}
              </TextLink>
            </Panel>
          ) : (
            <Panel>
              <TaskForm
                sourceFaultId={id}
                initialData={{
                  title: fault.title,
                  description: `${fault.number}\n${fault.description}`,
                  priority:
                    fault.priority === "critical" ? "high" : fault.priority,
                  location:
                    fault.location === "Other"
                      ? fault.locationOther
                      : fault.location,
                  asset: fault.asset?._id,
                }}
                onCancel={() => navigate(`/fault-reports/${id}`)}
              />
            </Panel>
          ))}
      </ResourceState>
    </Page>
  );
}

const FaultFormGrid = styled(Grid)`
  grid-template-columns: minmax(0, 1.8125fr) minmax(0, 1fr);
  align-items: stretch;
  margin-bottom: 40px;
  > section {
    padding: 24px 28px 18px;
    margin-bottom: 0;
  }
  && h2 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 24px;
  }
  label {
    font-size: 14px;
  }
  input:not([type="file"]),
  select,
  button[aria-haspopup="listbox"] {
    min-height: 58px;
  }
  textarea {
    min-height: 120px;
  }
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 650px) {
    > section {
      padding: 20px 16px;
    }
  }
`;
