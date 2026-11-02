import PropTypes from "prop-types";
import { SelectInput } from "./DesignSelect";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Plus,
  Download,
  ArrowLeft,
  MoreHorizontal,
  Settings,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";
import AssetTable from "../assets/components/AssetTable";
import AssetModal from "../assets/components/AssetModal";
import AssetTypeModal from "../assets/components/AssetTypeModal";
import AssetTasksModal from "../assets/components/AssetTasksModal";
import DocumentNamingModal from "../../components/ui/DocumentNamingModal";
import { deleteAsset, exportAssets } from "../../store/slices/assetSlice";
import { assetService } from "../../services/asset.service";
import {
  maintenanceService as service,
  maintenanceError,
  asFormData,
} from "../../services/maintenance.service";
import {
  RecordFields,
  cleanRecords,
  ImagePicker,
  PrivateImage,
  DocumentQueue,
  FormSteps,
} from "./ProfileFields";
import generatorVisual from "../../assets/maintenance/generator.svg";
import pumpVisual from "../../assets/maintenance/pump.svg";
import vesselVisual from "../../assets/maintenance/vessel.svg";
import {
  Page,
  Header,
  Panel,
  Grid,
  Stats,
  Stat,
  Badge,
  Actions,
  Button,
  FilterBar,
  FormGrid,
  Label,
  Field,
  FormDialog,
  ErrorBox,
  Muted,
  Definition,
  TextLink,
  Back,
  ResourceState,
  Pagination,
  Tabs,
  readable,
  useCopy,
  useResource,
  useMaintenanceAccess,
  canManageMaintenance,
} from "./shared";

export default function AssetRegister() {
  const m = useCopy();
  const dispatch = useDispatch();
  const { browse } = useMaintenanceAccess("assets");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    city: "",
    location: "",
    sortBy: "uniqueId",
    sortOrder: "asc",
  });
  const [draft, setDraft] = useState(filters);
  const [dialog, setDialog] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((old) => ({ ...old, search: draft.search }));
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [draft.search]);
  const allAssets = useResource("/assets/dropdown", {}, browse, true);
  const resource = useResource(
    "/assets",
    { ...filters, page, limit: 12 },
    browse,
    true,
  );
  const types = useResource("/asset-types", {}, browse, true);
  const assets = resource.data?.data || [];
  const summary = useResource(
    "/asset-profiles/register-summary",
    { ids: assets.map((asset) => asset._id || asset.id).join(",") },
    browse,
  );
  const totals = summary.data?.data;
  const refresh = () => {
    resource.reload();
    summary.reload();
  };
  if (!browse)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page data-agent-page="assets" style={{ paddingTop: 0 }}>
      <Header>
        <div>
          <h1 style={{ fontSize: 34 }}>{m("Asset Register")}</h1>
          <p>
            {m(
              "Manage asset identification, documents, records, and maintenance activity.",
            )}
          </p>
        </div>
        <Actions>
          <Button onClick={() => setDialog({ type: "types" })}>
            {m("Manage Asset Types")}
          </Button>
          <Button
            data-agent-action="assets.export.open"
            onClick={() => setDialog({ type: "export" })}
          >
            <Download />
            {m("Export")}
          </Button>
          <Button
            data-agent-action="assets.create"
            as={Link}
            to="/assets/create"
            $primary
          >
            <Plus />
            {m("Add Asset")}
          </Button>
        </Actions>
      </Header>
      <Stats>
        {[
          ["Total Assets", totals?.total, "blue"],
          ["Operational", totals?.operational, "green"],
          ["Maintenance Due", totals?.maintenanceDue, "amber"],
          ["Out of Service", totals?.outOfService, "red"],
        ].map(([label, value, color]) => (
          <Stat key={label} $tone={color}>
            <strong>{value ?? "—"}</strong>
            <span>{m(label)}</span>
          </Stat>
        ))}
      </Stats>
      <FilterBar
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <input
          data-agent-field="assets.search"
          aria-label={m("Search assets")}
          placeholder={m("Search assets…")}
          value={draft.search}
          onChange={(event) =>
            setDraft({ ...draft, search: event.target.value })
          }
        />
        <SelectInput
          data-agent-field="assets.filter.type"
          aria-label={m("Asset Type")}
          value={draft.type}
          onChange={(event) => {
            setDraft({ ...draft, type: event.target.value });
            setFilters((old) => ({ ...old, type: event.target.value }));
            setPage(1);
          }}
        >
          <option value="">{m("All Asset Types")}</option>
          {(types.data?.data || []).map((type) => (
            <option key={type._id || type.id} value={type.name}>
              {type.name}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          data-agent-field="assets.filter.city"
          aria-label={m("City")}
          value={draft.city}
          onChange={(event) => {
            setDraft({ ...draft, city: event.target.value });
            setFilters((old) => ({ ...old, city: event.target.value }));
            setPage(1);
          }}
        >
          <option value="">{m("All Cities")}</option>
          {[...new Set((allAssets.data?.data || []).map((asset) => asset.city))]
            .filter(Boolean)
            .map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
        </SelectInput>
        <SelectInput
          data-agent-field="assets.filter.sort"
          aria-label={m("Sort by Unique ID")}
          value={draft.sortOrder}
          onChange={(event) => {
            setDraft({ ...draft, sortOrder: event.target.value });
            setFilters((old) => ({
              ...old,
              sortBy: "uniqueId",
              sortOrder: event.target.value,
            }));
            setPage(1);
          }}
        >
          <option value="asc">{m("Unique ID: ascending")}</option>
          <option value="desc">{m("Unique ID: descending")}</option>
        </SelectInput>
        <input
          aria-label={m("Location")}
          placeholder={m("Location")}
          value={draft.location}
          onChange={(event) =>
            setDraft({ ...draft, location: event.target.value })
          }
        />
        <Button
          type="button"
          onClick={() => {
            setDraft({
              search: "",
              type: "",
              city: "",
              location: "",
              sortBy: "uniqueId",
              sortOrder: "asc",
            });
            setFilters({ sortBy: "uniqueId", sortOrder: "asc" });
            setPage(1);
          }}
        >
          {m("Reset Filters")}
        </Button>
        <Button $primary type="submit">
          {m("Apply Filter")}
        </Button>
      </FilterBar>
      <Actions style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{m("Fleet & Equipment")}</h2>
          <Muted>
            {m(
              "Asset profiles, documentation, equipment, and maintenance records",
            )}
          </Muted>
        </div>
        <Tabs style={{ margin: 0 }}>
          {["grid", "table"].map((value) => (
            <button
              key={value}
              role="tab"
              aria-selected={view === value}
              onClick={() => setView(value)}
            >
              {m(value === "grid" ? "Grid View" : "Table View")}
            </button>
          ))}
        </Tabs>
      </Actions>
      <ResourceState resource={resource} empty={!assets.length}>
        {view === "grid" ? (
          <Grid $columns="repeat(2,minmax(0,1fr))" style={{ gap: 40 }}>
            {assets.map((asset) => {
              const profile =
                totals?.profiles?.find(
                  (row) => row.asset === (asset._id || asset.id),
                ) || {};
              const vessel = /vessel|boat|ship/i.test(asset.type);
              const illustration = vessel
                ? vesselVisual
                : /generator/i.test(asset.type)
                  ? generatorVisual
                  : /pump/i.test(asset.type)
                    ? pumpVisual
                    : undefined;
              const Icon = /radar|radio/i.test(asset.type) ? Radio : Settings;
              return (
                <AssetCard key={asset._id || asset.id}>
                  <AssetVisual to={`/assets/${asset._id || asset.id}`}>
                    {illustration || profile.image ? (
                      <PrivateImage
                        path={
                          profile.image
                            ? `/asset-profiles/${asset._id || asset.id}/image`
                            : undefined
                        }
                        revision={profile.updatedAt}
                        fallback={illustration}
                        alt={asset.displayName}
                        style={{ height: 110 }}
                      />
                    ) : (
                      <Icon aria-hidden="true" size={94} strokeWidth={1.3} />
                    )}
                    <span>{asset.type}</span>
                  </AssetVisual>
                  <div style={{ minWidth: 0, padding: "18px 20px" }}>
                    <TextLink to={`/assets/${asset._id || asset.id}`}>
                      <h2>{asset.displayName}</h2>
                    </TextLink>
                    <Muted>{asset.uniqueId}</Muted>
                    <Definition>
                      {[
                        ["Location", asset.location],
                        ["City", asset.city],
                        ["Model", profile.model],
                        ["Serial Number", profile.serialNumber],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{m(label)}</dt>
                          <dd>{value || "—"}</dd>
                        </div>
                      ))}
                    </Definition>
                    <Actions style={{ justifyContent: "space-between" }}>
                      <Badge $status={profile.lifecycleStatus || "active"}>
                        {m(readable(profile.lifecycleStatus || "active"))}
                      </Badge>
                      <Button as={Link} to={`/assets/${asset._id || asset.id}`}>
                        {m("View Profile")}
                      </Button>
                      <Button
                        aria-label={`${m("More actions")} ${asset.displayName}`}
                        onClick={() => setDialog({ type: "actions", asset })}
                      >
                        <MoreHorizontal />
                      </Button>
                    </Actions>
                  </div>
                </AssetCard>
              );
            })}
          </Grid>
        ) : (
          <AssetTable
            assets={assets}
            loading={resource.loading}
            pagination={{
              page,
              limit: 12,
              totalPages: resource.data?.totalPages || 1,
              total: resource.data?.total || 0,
            }}
            onPageChange={setPage}
            onEdit={(asset) => setDialog({ type: "edit", asset })}
            onDelete={(assetId) =>
              setDialog({
                type: "delete",
                asset: assets.find(
                  (asset) => (asset._id || asset.id) === assetId,
                ),
              })
            }
            onViewTasks={(asset) => setDialog({ type: "tasks", asset })}
          />
        )}
        <Pagination result={resource.data} page={page} onChange={setPage} />
      </ResourceState>
      {dialog?.type === "actions" && (
        <FormDialog
          title="Asset Actions"
          fields={[]}
          onClose={() => setDialog(null)}
          onSubmit={() => setDialog(null)}
          submitLabel="Close"
        >
          <Actions>
            <Button
              type="button"
              onClick={() => setDialog({ type: "edit", asset: dialog.asset })}
            >
              {m("Edit Asset")}
            </Button>
            <Button
              type="button"
              onClick={() => setDialog({ type: "tasks", asset: dialog.asset })}
            >
              {m("View Tasks")}
            </Button>
            <Button
              type="button"
              onClick={() => setDialog({ type: "delete", asset: dialog.asset })}
            >
              {m("Delete")}
            </Button>
          </Actions>
        </FormDialog>
      )}
      {dialog?.type === "edit" && (
        <AssetModal
          isOpen
          asset={dialog.asset}
          onClose={() => setDialog(null)}
          onSuccess={refresh}
        />
      )}
      {dialog?.type === "types" && (
        <AssetTypeModal
          isOpen
          onClose={() => setDialog(null)}
          onSuccess={() => types.reload()}
        />
      )}
      {dialog?.type === "tasks" && (
        <AssetTasksModal
          isOpen
          asset={dialog.asset}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "delete" && (
        <FormDialog
          title="Delete Asset"
          fields={[]}
          onClose={() => setDialog(null)}
          submitLabel="Delete"
          onSubmit={async () => {
            await dispatch(
              deleteAsset(dialog.asset._id || dialog.asset.id),
            ).unwrap();
            refresh();
          }}
        >
          <p>
            {m("Delete this asset using the existing asset deletion flow?")}{" "}
            {dialog.asset.displayName}
          </p>
        </FormDialog>
      )}
      {dialog?.type === "export" && (
        <DocumentNamingModal
          isOpen
          onClose={() => setDialog(null)}
          onExport={async (fileName, language = "en") => {
            await dispatch(exportAssets({ fileName, language })).unwrap();
            setDialog(null);
          }}
          exportFormat="xlsx"
          documentType="Assets-Report"
          defaultCriteria={["documentType", "currentDate"]}
        />
      )}
    </Page>
  );
}

export function EditAsset() {
  const { id } = useParams();
  const { manage } = useMaintenanceAccess("assets");
  const m = useCopy();
  const resource = useResource(`/asset-profiles/${id}`, {}, manage);
  if (!manage)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <ResourceState resource={resource}>
      {resource.data?.data && (
        <CreateAsset key={id} initial={resource.data.data} />
      )}
    </ResourceState>
  );
}
export function CreateAsset({ initial } = {}) {
  const m = useCopy();
  const navigate = useNavigate();
  const { manage, user } = useMaintenanceAccess("assets");
  const canDocuments = canManageMaintenance(user, "documents");
  const [documentFiles, setDocumentFiles] = useState([]);
  const [uploaded, setUploaded] = useState([]);
  const types = useResource("/asset-types", {}, manage, true);
  const editing = Boolean(initial?.asset);
  const [removeImage, setRemoveImage] = useState(false);
  const [values, setValues] = useState({
    uniqueId: "",
    displayName: "",
    type: "",
    city: "",
    location: "",
    color: "#f5f7fb",
    manufacturer: "",
    model: "",
    serialNumber: "",
    description: "",
    lifecycleStatus: "active",
    ...Object.fromEntries(
      Object.entries(initial?.asset || {}).filter(([key]) =>
        [
          "uniqueId",
          "displayName",
          "type",
          "city",
          "location",
          "color",
        ].includes(key),
      ),
    ),
    ...Object.fromEntries(
      Object.entries(initial?.profile || {}).filter(([key]) =>
        [
          "manufacturer",
          "model",
          "serialNumber",
          "description",
          "lifecycleStatus",
        ].includes(key),
      ),
    ),
  });
  const [records, setRecords] = useState(
    cleanRecords(initial?.profile?.records || []),
  );
  const [image, setImage] = useState(null);
  const [whiteText, setWhiteText] = useState(
    initial?.asset?.textColor === "#ffffff",
  );
  const [createdId, setCreatedId] = useState(initial?.asset?._id || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (name, value) =>
    setValues((old) => ({ ...old, [name]: value }));
  if (!manage)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page data-agent-page="assets">
      <Back to="/assets">
        <ArrowLeft size={14} />
        {m("Back to Asset Register")}
      </Back>
      <Header>
        <div>
          <h1 style={{ fontSize: 34 }}>
            {m(editing ? "Edit Asset" : "Create Asset")}
          </h1>
          <p>
            {m(
              editing
                ? "Update identification, operational information, documents, and related records."
                : "Register a vessel or equipment item and store its documents and related records.",
            )}
          </p>
        </div>
      </Header>
      <ResourceState resource={types}>
        <form
          data-agent-form="assets.form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            try {
              let id = createdId;
              const core = {
                uniqueId: values.uniqueId.trim(),
                type: values.type,
                displayName: values.displayName.trim(),
                city: values.city.trim(),
                location: values.location.trim(),
                color: values.color,
                ...(whiteText ? { textColor: "#ffffff" } : {}),
              };
              if (!id) {
                const response = await assetService.createAsset(core);
                id = response.data._id || response.data.id;
                setCreatedId(id);
              } else if (editing) await assetService.updateAsset(id, core);
              await service.save(
                `/asset-profiles/${id}`,
                {
                  manufacturer: values.manufacturer,
                  model: values.model,
                  serialNumber: values.serialNumber,
                  description: values.description,
                  lifecycleStatus: values.lifecycleStatus,
                  records: cleanRecords(records),
                },
                "put",
              );
              if (image)
                await service.save(
                  `/asset-profiles/${id}/image`,
                  asFormData({ file: image }),
                );
              else if (removeImage)
                await service.save(`/asset-profiles/${id}/image`, {}, "delete");
              for (const entry of documentFiles.filter(
                (row) => !uploaded.includes(row.key),
              )) {
                await service.save(
                  "/documents",
                  asFormData({
                    file: entry.file,
                    title: entry.file.name.replace(/\.[^.]+$/, ""),
                    category: "Other Records",
                    asset: id,
                  }),
                );
                setUploaded((old) => [...old, entry.key]);
              }
              toast.success(m(editing ? "Asset updated" : "Asset created"));
              navigate(`/assets/${id}`);
            } catch (err) {
              setError(maintenanceError(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          {!editing && <FormSteps />}
          <Grid $columns="minmax(0, 1.91fr) minmax(300px, 1fr)">
            <Panel>
              <h2>{m("Basic Information")}</h2>
              <p>{m("Required identification data for the asset register.")}</p>
              <FormGrid>
                {[
                  {
                    name: "displayName",
                    label: "Asset Name",
                    required: true,
                    placeholder: "Enter asset name",
                  },
                  {
                    name: "uniqueId",
                    label: "Unique ID",
                    required: true,
                    maxLength: 64,
                    placeholder: "Enter unique asset ID",
                  },
                  {
                    name: "type",
                    label: "Asset Type",
                    required: true,
                    placeholder: "Select asset type",
                    options: (types.data?.data || []).map((type) => ({
                      value: type.name,
                      label: type.name,
                    })),
                  },
                  {
                    name: "lifecycleStatus",
                    label: "Status",
                    options: [
                      "active",
                      "maintenance",
                      "inactive",
                      "retired",
                    ].map((value) => ({ value, label: readable(value) })),
                  },
                ].map((field) => (
                  <Field
                    key={field.name}
                    field={{
                      ...field,
                      agent: `assets.form.${field.name}`,
                      disabled:
                        Boolean(createdId) &&
                        !editing &&
                        field.name !== "lifecycleStatus",
                    }}
                    value={values[field.name]}
                    onChange={(value) => change(field.name, value)}
                  />
                ))}
              </FormGrid>
              <h2 style={{ marginTop: 32 }}>{m("Identification Details")}</h2>
              <p>{m("Manufacturer and unique technical identification.")}</p>
              <FormGrid>
                {[
                  {
                    name: "serialNumber",
                    label: "Serial Number",
                    required: !editing,
                    placeholder: "Enter serial number",
                  },
                  {
                    name: "manufacturer",
                    label: "Manufacturer",
                    required: !editing,
                    placeholder: "Enter manufacturer",
                  },
                  {
                    name: "model",
                    label: "Model",
                    required: !editing,
                    placeholder: "Enter model",
                  },
                  { name: "location", label: "Location", required: true },
                  { name: "city", label: "City", required: true },
                ].map((field) => (
                  <Field
                    key={field.name}
                    field={{
                      ...field,
                      agent: `assets.form.${field.name}`,
                      disabled:
                        Boolean(createdId) &&
                        !editing &&
                        ["location", "city"].includes(field.name),
                    }}
                    value={values[field.name]}
                    onChange={(value) => change(field.name, value)}
                  />
                ))}
              </FormGrid>
              <h2 style={{ marginTop: 32 }}>{m("Additional Records")}</h2>
              <p>{m("Add information and records specific to this asset.")}</p>
              <RecordFields
                records={records}
                onChange={setRecords}
                documents={initial?.documents || []}
              />
              <div style={{ marginTop: 24 }}>
                <Field
                  field={{
                    name: "description",
                    label: "Notes",
                    type: "textarea",
                  }}
                  value={values.description}
                  onChange={(value) => change("description", value)}
                />
              </div>
              <details style={{ marginTop: 24 }}>
                <summary>{m("Asset display options")}</summary>
                <Field
                  field={{
                    name: "color",
                    label: "Color",
                    type: "color",
                    disabled: Boolean(createdId) && !editing,
                  }}
                  value={values.color}
                  onChange={(value) => change("color", value)}
                />{" "}
                <Label style={{ flexDirection: "row", marginTop: 20 }}>
                  <input
                    type="checkbox"
                    disabled={Boolean(createdId) && !editing}
                    checked={whiteText}
                    onChange={(event) => setWhiteText(event.target.checked)}
                  />
                  {m("White asset text")}
                </Label>
              </details>
            </Panel>
            <div>
              <Panel>
                <h2>{m("Asset Image")}</h2>
                <p>{m("Upload a clear image of the vessel or equipment.")}</p>
                <ImagePicker
                  file={image}
                  onChange={setImage}
                  currentPath={
                    !removeImage && initial?.profile?.image
                      ? `/asset-profiles/${createdId}/image`
                      : undefined
                  }
                  revision={initial?.profile?.updatedAt}
                  onRemove={() => setRemoveImage(true)}
                />
              </Panel>
              {canDocuments && (
                <Panel>
                  <h2>{m("Documentation Storage")}</h2>
                  <p>{m("Store documents linked to this asset.")}</p>
                  {(initial?.documents || []).map((document) => (
                    <p key={document._id}>
                      <TextLink to={`/documents?document=${document._id}`}>
                        {document.title}
                      </TextLink>
                    </p>
                  ))}
                  <DocumentQueue
                    files={documentFiles}
                    onChange={setDocumentFiles}
                    title="Upload asset documents"
                  />
                </Panel>
              )}
            </div>
          </Grid>
          {error && (
            <ErrorBox role="alert">
              {createdId && (
                <p>
                  {m(
                    "The asset is saved. Retry saving its profile or open the saved asset.",
                  )}{" "}
                  <Link to={`/assets/${createdId}`}>{m("View Profile")}</Link>
                </p>
              )}
              {error}
            </ErrorBox>
          )}
          <Actions style={{ justifyContent: "flex-end" }}>
            <Button as={Link} to="/assets">
              {m("Cancel")}
            </Button>
            <Button
              data-agent-action="assets.submit"
              type="submit"
              $primary
              disabled={busy}
            >
              {m(busy ? "Saving…" : editing ? "Save Changes" : "Save Asset")}
            </Button>
          </Actions>
        </form>
      </ResourceState>
    </Page>
  );
}

const AssetCard = styled.article`
  display: grid;
  grid-template-columns: minmax(160px, 31.6%) minmax(0, 1fr);
  border: 1px solid #e1e7ef;
  border-radius: 16px;
  min-height: 295px;
  overflow: hidden;
  background: white;
  h2 {
    font-size: 22px;
    margin: 0 0 4px;
  }
  dt {
    font-size: 12px;
  }
  dd {
    font-size: 14px;
  }
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;
const AssetVisual = styled(Link)`
  background: #000048;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  min-height: 230px;
  padding: 20px;
  position: relative;
  img {
    width: 100%;
    height: auto;
  }
  span {
    background: white;
    color: #000048;
    border-radius: 20px;
    padding: 5px 14px;
    margin-top: 16px;
    font-size: 12px;
  }
`;

CreateAsset.propTypes = { initial: PropTypes.object };
