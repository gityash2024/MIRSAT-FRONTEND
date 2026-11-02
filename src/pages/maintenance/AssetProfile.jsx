import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { Plus, ArrowLeft, Radio, Settings } from "lucide-react";
import toast from "react-hot-toast";
import AssetModal from "../assets/components/AssetModal";
import generatorVisual from "../../assets/maintenance/generator.svg";
import pumpVisual from "../../assets/maintenance/pump.svg";
import vesselVisual from "../../assets/maintenance/vessel.svg";
import {
  maintenanceService as service,
  maintenanceError,
} from "../../services/maintenance.service";
import {
  Page,
  Header,
  Actions,
  Button,
  Panel,
  Grid,
  TableWrap,
  Badge,
  Muted,
  Definition,
  FormGrid,
  ErrorBox,
  Modal,
  FormDialog,
  Field,
  ResourceState,
  Back,
  Tabs,
  TextLink,
  useCopy,
  useResource,
  useMaintenanceAccess,
  canBrowseMaintenance,
  canManageMaintenance,
  formatDate,
  readable,
} from "./shared";

import {
  RecordFields,
  cleanRecords,
  ImagePicker,
  PrivateImage,
} from "./ProfileFields";
function ProfileEditor({
  profile,
  onClose,
  onSaved,
  assetId,
  equipmentId,
  documents = [],
}) {
  const m = useCopy();
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [values, setValues] = useState({
    manufacturer: profile.manufacturer || "",
    model: profile.model || "",
    serialNumber: profile.serialNumber || "",
    description: profile.description || "",
    lifecycleStatus: profile.lifecycleStatus || "active",
    commissioningDate: profile.commissioningDate?.slice(0, 10) || "",
  });
  const [records, setRecords] = useState(cleanRecords(profile.records || []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      title={m(equipmentId ? "Edit Equipment" : "Edit Asset Profile")}
      onClose={onClose}
      busy={busy}
      wide
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          try {
            await service.save(
              `/asset-profiles/${assetId}${equipmentId ? `/equipment/${equipmentId}` : ""}`,
              {
                ...Object.fromEntries(
                  Object.entries(values).filter(
                    ([key]) =>
                      !equipmentId ||
                      !["commissioningDate", "lifecycleStatus"].includes(key),
                  ),
                ),
                ...(!equipmentId
                  ? { commissioningDate: values.commissioningDate || null }
                  : {}),
                records: cleanRecords(records),
              },
              equipmentId ? "patch" : "put",
            );
            if (!equipmentId && image) {
              const body = new FormData();
              body.append("file", image);
              await service.save(`/asset-profiles/${assetId}/image`, body);
            } else if (!equipmentId && removeImage)
              await service.save(
                `/asset-profiles/${assetId}/image`,
                {},
                "delete",
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
        <FormGrid>
          {[
            { name: "manufacturer", label: "Manufacturer" },
            { name: "model", label: "Model" },
            { name: "serialNumber", label: "Serial Number" },
            {
              name: "commissioningDate",
              label: "Commissioning Date",
              type: "date",
            },
            {
              name: "lifecycleStatus",
              label: "Lifecycle Status",
              options: ["active", "maintenance", "inactive", "retired"].map(
                (value) => ({ value, label: readable(value) }),
              ),
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              wide: true,
            },
          ]
            .filter(
              (field) =>
                !equipmentId ||
                !["commissioningDate", "lifecycleStatus"].includes(field.name),
            )
            .map((field) => (
              <Field
                key={field.name}
                field={field}
                value={values[field.name]}
                onChange={(value) =>
                  setValues({ ...values, [field.name]: value })
                }
              />
            ))}
        </FormGrid>
        <h3 style={{ marginTop: 28 }}>{m("Flexible Records")}</h3>
        <p>{m("Add basic information and records specific to this asset.")}</p>
        <RecordFields
          records={records}
          onChange={setRecords}
          documents={documents}
        />
        {!equipmentId && (
          <Panel style={{ marginTop: 24 }}>
            <h3>{m("Asset Image")}</h3>
            <ImagePicker
              file={image}
              onChange={setImage}
              currentPath={
                !removeImage && profile.image
                  ? `/asset-profiles/${assetId}/image`
                  : undefined
              }
              revision={profile.updatedAt}
              onRemove={() => setRemoveImage(true)}
            />
          </Panel>
        )}
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        <Actions style={{ justifyContent: "flex-end", marginTop: 24 }}>
          <Button type="button" disabled={busy} onClick={onClose}>
            {m("Cancel")}
          </Button>
          <Button $primary type="submit" disabled={busy}>
            {m(busy ? "Saving…" : equipmentId ? "Save" : "Save Asset")}
          </Button>
        </Actions>
      </form>
    </Modal>
  );
}
export default function AssetProfile() {
  const { id, equipmentId } = useParams();
  const m = useCopy();
  const { user, manage, browse } = useMaintenanceAccess("assets");
  const resource = useResource(`/asset-profiles/${id}`, {}, browse);
  const [tab, setTab] = useState("overview");
  const [dialog, setDialog] = useState(null);
  const partsLookup = useResource(
    "/warehouse/parts",
    { limit: 100 },
    dialog?.type === "linkPart",
  );
  const warehouseLookup = useResource(
    "/warehouse/warehouses",
    { limit: 100 },
    dialog?.type === "linkPart",
  );
  useEffect(() => {
    setTab("overview");
    setDialog(null);
  }, [id, equipmentId]);
  const data = resource.data?.data;
  const profile = data?.profile;
  const asset = data?.asset;
  const equipment = (data?.equipment || []).find(
    (row) => row._id === equipmentId,
  );
  const canDocuments = canBrowseMaintenance(user, "documents");
  const manageDocuments = canManageMaintenance(user, "documents");
  const canWarehouse = canManageMaintenance(user, "warehouse");
  const canTasks = canManageMaintenance(user, "tasks");
  const canFaults = canManageMaintenance(user, "faults");
  const equipmentList = (data?.equipment || []).filter(
    (row) =>
      row.type !== "tool" &&
      (equipmentId ? row.parent === equipmentId : !row.parent),
  );
  const tools = (data?.equipment || []).filter(
    (row) => row.type === "tool" && row.parent === equipmentId,
  );
  const visualType = equipment ? equipment.name : asset?.type;
  const illustration = /vessel|boat|ship/i.test(visualType || "")
    ? vesselVisual
    : /generator|engine/i.test(visualType || "")
      ? generatorVisual
      : /pump/i.test(visualType || "")
        ? pumpVisual
        : undefined;
  const documentList = (data?.documents || []).filter((row) =>
    equipmentId ? row.equipment === equipmentId : true,
  );
  const records = equipment?.records || profile?.records || [];
  const refresh = () => {
    resource.reload();
    toast.success(m("Saved successfully"));
  };
  if (!browse)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return (
    <Page>
      <Back to={equipmentId ? `/assets/${id}` : "/assets"}>
        <ArrowLeft size={14} />
        {m(equipmentId ? "Back to Asset" : "Back to Assets")}
      </Back>
      <ResourceState resource={resource}>
        {asset && (!equipmentId || equipment) && (
          <>
            <Header>
              <div>
                <h1>{equipment?.name || asset.displayName}</h1>
                <p>
                  {equipment ? m(readable(equipment.type)) : asset.uniqueId} ·{" "}
                  {asset.type} · {asset.location}
                </p>
              </div>
              {manage && (
                <Actions>
                  <Button
                    {...(equipment
                      ? { onClick: () => setDialog({ type: "editEquipment" }) }
                      : { as: Link, to: `/assets/${id}/edit` })}
                  >
                    {m(equipment ? "Edit Equipment" : "Edit Asset")}
                  </Button>
                  {!equipment && (
                    <Button
                      $primary
                      onClick={() => setDialog({ type: "profile" })}
                    >
                      {m("Edit Profile & Records")}
                    </Button>
                  )}
                </Actions>
              )}
            </Header>
            <Panel>
              <Grid $columns="430px minmax(0,1fr)">
                <div
                  style={{
                    minHeight: 226,
                    borderRadius: 12,
                    background: "#000048",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                    boxSizing: "border-box",
                    color: "white",
                  }}
                >
                  {illustration || (!equipment && profile.image) ? (
                    <PrivateImage
                      path={
                        !equipment && profile.image
                          ? `/asset-profiles/${id}/image`
                          : undefined
                      }
                      revision={profile.updatedAt}
                      fallback={illustration}
                      alt={equipment?.name || asset.displayName}
                      style={{ height: 160 }}
                    />
                  ) : /radar|radio/i.test(visualType || "") ? (
                    <Radio
                      size={110}
                      strokeWidth={1.3}
                      aria-label={equipment?.name || asset.displayName}
                    />
                  ) : (
                    <Settings
                      size={110}
                      strokeWidth={1.3}
                      aria-label={equipment?.name || asset.displayName}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {equipment?.name || asset.displayName}
                  </span>
                </div>
                <div>
                  <Actions style={{ justifyContent: "flex-end" }}>
                    <Badge>{asset.type}</Badge>
                    <Badge>{asset.location}</Badge>
                  </Actions>
                  <h2 style={{ fontSize: 26, margin: "10px 0" }}>
                    {equipment?.name || asset.displayName}
                  </h2>
                  <Muted>
                    {m("Asset ID")} · {asset.uniqueId}
                  </Muted>
                  <Definition $columns={3}>
                    {[
                      ["Model", (equipment || profile).model],
                      ["Serial Number", (equipment || profile).serialNumber],
                      ["Manufacturer", (equipment || profile).manufacturer],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{m(label)}</dt>
                        <dd>{value || "—"}</dd>
                      </div>
                    ))}
                  </Definition>
                  <p>{m("Identification data and records for this asset.")}</p>
                </div>
              </Grid>
            </Panel>
            <Tabs role="tablist">
              {[
                ["overview", "Overview"],
                ["equipment", equipment ? "Components" : "Equipment"],
                ...(canDocuments ? [["documents", "Documents"]] : []),
                ["records", "Related Records"],
                ...(equipment ? [["tools", "Tools"]] : []),
                ...(canTasks ? [["tasks", "Work Orders"]] : []),
                ...(canWarehouse ? [["parts", "Spare Parts"]] : []),
                [
                  "history",
                  equipment
                    ? "Maintenance History"
                    : "Lifecycle & Audit History",
                ],
              ].map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                >
                  {m(label)}
                </button>
              ))}
            </Tabs>
            {tab === "overview" && (
              <Grid $columns="repeat(2,minmax(0,1fr))">
                <Panel>
                  <h2>{m("Asset Overview")}</h2>
                  <p>{m("Core information and operational context.")}</p>
                  <Definition $columns={3}>
                    {[
                      ["Current Status", m(readable(profile.lifecycleStatus))],
                      ["Location", asset.location],
                      ["City", asset.city],
                      [
                        "Commissioning Date",
                        formatDate(profile.commissioningDate),
                      ],
                      [
                        "Last Updated",
                        formatDate(
                          (equipment || profile).updatedAt || asset.updatedAt,
                        ),
                      ],
                      ["Manufacturer", (equipment || profile).manufacturer],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{m(label)}</dt>
                        <dd>{value || "—"}</dd>
                      </div>
                    ))}
                  </Definition>
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {(equipment || profile).description}
                  </p>
                  <Button onClick={() => setTab("records")}>
                    {m("Additional records")} · {records.length}
                  </Button>
                </Panel>
                <Panel>
                  <h2>{m("Documentation Storage")}</h2>
                  <p>
                    {m(
                      "Central storage for manuals, certificates, and records.",
                    )}
                  </p>
                  {documentList.slice(0, 3).map((document) => (
                    <p key={document._id}>
                      <TextLink to={`/documents?document=${document._id}`}>
                        {document.title}
                      </TextLink>
                      <small style={{ display: "block", marginTop: 5 }}>
                        {m(document.category)} ·{" "}
                        {formatDate(document.updatedAt)}
                      </small>
                    </p>
                  ))}
                  {manageDocuments && (
                    <Button
                      as={Link}
                      to={`/documents/upload?asset=${id}${equipmentId ? `&equipment=${equipmentId}` : ""}`}
                    >
                      <Plus />
                      {m("Add Document")}
                    </Button>
                  )}
                </Panel>
                <Panel>
                  <Actions style={{ justifyContent: "space-between" }}>
                    <div>
                      <h2>{m("Onboard Equipment")}</h2>
                      <p>
                        {m("Maintainable equipment installed on this vessel.")}
                      </p>
                    </div>
                    <Button onClick={() => setTab("equipment")}>
                      {m("View all equipment")}
                    </Button>
                  </Actions>
                  {equipmentList.slice(0, 3).map((row) => (
                    <div
                      key={row._id}
                      style={{
                        background: "#f2f6fc",
                        borderRadius: 8,
                        padding: 16,
                        marginTop: 12,
                      }}
                    >
                      <TextLink
                        to={`/assets/${id}/equipment/${row._id}`}
                        onClick={() => setTab("overview")}
                      >
                        {row.name}
                      </TextLink>
                      <small style={{ display: "block", marginTop: 5 }}>
                        {m(readable(row.type))}
                      </small>
                    </div>
                  ))}
                  {manage && (
                    <Button
                      style={{ marginTop: 16 }}
                      onClick={() => setDialog({ type: "equipment" })}
                    >
                      <Plus />
                      {m(equipment ? "Add Component" : "Add Equipment")}
                    </Button>
                  )}
                </Panel>
                <Panel>
                  <h2>{m("Maintenance Activity")}</h2>
                  <p>{m("Related work orders and fault reports.")}</p>
                  <Definition>
                    <div>
                      <dt>{m("Linked Work Orders")}</dt>
                      <dd>{data.tasks.length}</dd>
                    </div>
                    <div>
                      <dt>{m("Fault Reports")}</dt>
                      <dd>{data.faults.length}</dd>
                    </div>
                  </Definition>
                  {canTasks && (
                    <Button onClick={() => setTab("tasks")}>
                      {m("View work orders")}
                    </Button>
                  )}
                  {data.faults.slice(0, 2).map((fault) => (
                    <p key={fault._id} style={{ marginTop: 18 }}>
                      <TextLink to={`/fault-reports/${fault._id}`}>
                        {fault.number} · {fault.title}
                      </TextLink>
                    </p>
                  ))}
                </Panel>
              </Grid>
            )}
            {tab === "equipment" && (
              <Panel>
                <Actions
                  style={{ justifyContent: "space-between", marginBottom: 20 }}
                >
                  <h2>{m(equipment ? "Components" : "Equipment")}</h2>
                  {manage && (
                    <Button
                      $primary
                      onClick={() => setDialog({ type: "equipment" })}
                    >
                      <Plus />
                      {m(equipment ? "Add Component" : "Add Equipment")}
                    </Button>
                  )}
                </Actions>
                <EquipmentTable
                  rows={equipmentList}
                  assetId={id}
                  onSelect={() => setTab("overview")}
                />
                {equipment && (
                  <Button
                    style={{ marginTop: 20 }}
                    onClick={() => setDialog({ type: "tool" })}
                  >
                    {m("Add Tool")}
                  </Button>
                )}
              </Panel>
            )}
            {tab === "tools" && (
              <Panel>
                <Actions
                  style={{ justifyContent: "space-between", marginBottom: 20 }}
                >
                  <h2>{m("Tools")}</h2>
                  {manage && (
                    <Button
                      $primary
                      onClick={() => setDialog({ type: "tool" })}
                    >
                      <Plus />
                      {m("Add Tool")}
                    </Button>
                  )}
                </Actions>
                <EquipmentTable
                  rows={tools}
                  assetId={id}
                  onSelect={() => setTab("overview")}
                />
              </Panel>
            )}
            {tab === "documents" && (
              <Panel>
                <Actions
                  style={{ justifyContent: "space-between", marginBottom: 20 }}
                >
                  <h2>{m("Documents")}</h2>
                  {manageDocuments && (
                    <Button
                      as={Link}
                      to={`/documents/upload?asset=${id}${equipmentId ? `&equipment=${equipmentId}` : ""}`}
                      $primary
                    >
                      <Plus />
                      {m("Add Document")}
                    </Button>
                  )}
                </Actions>
                <TableWrap>
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Document",
                          "Category",
                          "Version",
                          "Updated",
                          "Actions",
                        ].map((label) => (
                          <th key={label}>{m(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {documentList.map((document) => (
                        <tr key={document._id}>
                          <td>{document.title}</td>
                          <td>{m(document.category)}</td>
                          <td>{document.versions.at(-1)?.number || "—"}</td>
                          <td>{formatDate(document.updatedAt)}</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/documents?document=${document._id}`}
                            >
                              {m("View")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </Panel>
            )}
            {tab === "records" && (
              <Panel>
                <Actions
                  style={{ justifyContent: "space-between", marginBottom: 20 }}
                >
                  <h2>{m("Related Records")}</h2>
                  {manage && (
                    <Button
                      $primary
                      onClick={() => setDialog({ type: "profile" })}
                    >
                      <Plus />
                      {m("Add Record")}
                    </Button>
                  )}
                </Actions>
                <RecordTable records={records} />
              </Panel>
            )}
            {tab === "tasks" && (
              <Panel>
                <h2>{m("Work Orders")}</h2>
                <TableWrap>
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Title",
                          "Priority",
                          "Status",
                          "Due Date",
                          "Actions",
                        ].map((label) => (
                          <th key={label}>{m(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.tasks.map((task) => (
                        <tr key={task._id}>
                          <td>{task.title}</td>
                          <td>{m(readable(task.priority))}</td>
                          <td>
                            <Badge $status={task.status}>
                              {m(readable(task.status))}
                            </Badge>
                          </td>
                          <td>{formatDate(task.deadline)}</td>
                          <td>
                            <Button as={Link} to={`/tasks/${task._id}`}>
                              {m("View")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
                {canFaults && (
                  <>
                    <h3 style={{ marginTop: 28 }}>{m("Fault Reports")}</h3>
                    {data.faults.map((fault) => (
                      <p key={fault._id}>
                        <TextLink to={`/fault-reports/${fault._id}`}>
                          {fault.number} · {fault.title}
                        </TextLink>{" "}
                        <Badge $status={fault.status}>
                          {m(readable(fault.status))}
                        </Badge>
                      </p>
                    ))}
                  </>
                )}
              </Panel>
            )}
            {tab === "parts" && (
              <Panel>
                <Actions
                  style={{ justifyContent: "space-between", marginBottom: 20 }}
                >
                  <h2>{m("Spare Parts")}</h2>
                  <Button
                    $primary
                    onClick={() => setDialog({ type: "linkPart" })}
                  >
                    <Plus />
                    {m("Link Spare Part")}
                  </Button>
                </Actions>
                <TableWrap>
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Part Number",
                          "Part Name",
                          "Warehouse",
                          "On Hand",
                          "Reserved",
                          "Relationship",
                          "Actions",
                        ].map((label) => (
                          <th key={label}>{m(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.parts.map((part) => (
                        <tr key={part._id}>
                          <td>{part.sku}</td>
                          <td>
                            {part.name}
                            {part.assetLink && (
                              <small>
                                {part.assetLink.recommendedQuantity ?? "—"}{" "}
                                {part.unit} · {part.assetLink.usageNote}
                              </small>
                            )}
                          </td>
                          <td>{part.warehouseName || m("All Warehouses")}</td>
                          <td>
                            {part.onHand ?? "—"} {part.unit}
                          </td>
                          <td>{part.reserved ?? "—"}</td>
                          <td>
                            <Badge $status="current">
                              {m(part.assetLink ? "Assigned" : "Compatible")}
                            </Badge>
                          </td>
                          <td>
                            <Button as={Link} to={`/spare-parts/${part._id}`}>
                              {m("View")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </Panel>
            )}
            {tab === "history" && (
              <Panel>
                <h2>{m("Lifecycle & Audit History")}</h2>
                <Definition>
                  <div>
                    <dt>{m("Created")}</dt>
                    <dd>{formatDate(asset.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>{m("Status")}</dt>
                    <dd>{m(readable(profile.lifecycleStatus))}</dd>
                  </div>
                </Definition>
                {[...(equipment?.history || profile.history || [])]
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry._id}
                      style={{
                        display: "flex",
                        gap: 24,
                        padding: "18px 0",
                        borderBottom: "1px solid #edf2f7",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong>{entry.message}</strong>
                      <Muted>{entry.actor?.name}</Muted>
                      <Muted>{formatDate(entry.createdAt, true)}</Muted>
                    </div>
                  ))}
              </Panel>
            )}
          </>
        )}
        {equipmentId && data && !equipment && (
          <ErrorBox>{m("Equipment not found")}</ErrorBox>
        )}
      </ResourceState>
      {dialog?.type === "linkPart" && (
        <FormDialog
          title="Link Spare Part"
          fields={[
            {
              name: "part",
              label: "Spare Part",
              wide: true,
              required: true,
              options: (partsLookup.data?.data || []).map((part) => ({
                value: part._id,
                label: `${part.sku} · ${part.name}`,
              })),
            },
            {
              name: "defaultWarehouse",
              label: "Default Warehouse",
              options: (warehouseLookup.data?.data || []).map((row) => ({
                value: row._id,
                label: row.name,
              })),
            },
            {
              name: "recommendedQuantity",
              label: "Recommended Quantity",
              type: "number",
              min: 0,
            },
            {
              name: "usageNote",
              label: "Usage Note",
              type: "textarea",
              wide: true,
            },
          ]}
          onClose={() => setDialog(null)}
          submitLabel="Link Spare Part"
          onSubmit={async ({ part, ...values }) => {
            await service.save(`/warehouse/parts/${part}/asset-links`, {
              ...values,
              asset: id,
            });
            refresh();
          }}
        />
      )}
      {dialog?.type === "basic" && (
        <AssetModal
          isOpen
          asset={asset}
          onClose={() => setDialog(null)}
          onSuccess={refresh}
        />
      )}
      {dialog?.type === "profile" && (
        <ProfileEditor
          profile={equipment || profile}
          documents={data?.documents || []}
          assetId={id}
          equipmentId={equipmentId}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      )}
      {["equipment", "tool", "editEquipment"].includes(dialog?.type) && (
        <FormDialog
          title={
            dialog.type === "editEquipment"
              ? "Edit Equipment"
              : dialog.type === "tool"
                ? "Add Tool"
                : equipment
                  ? "Add Component"
                  : "Add Equipment"
          }
          fields={[
            { name: "name", label: "Name", required: true, wide: true },
            { name: "manufacturer", label: "Manufacturer" },
            { name: "model", label: "Model" },
            { name: "serialNumber", label: "Serial Number" },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              wide: true,
            },
          ]}
          initial={
            dialog.type === "editEquipment"
              ? Object.fromEntries(
                  [
                    "name",
                    "manufacturer",
                    "model",
                    "serialNumber",
                    "description",
                  ].map((key) => [key, equipment[key] || ""]),
                )
              : {}
          }
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/asset-profiles/${id}/equipment${dialog.type === "editEquipment" ? `/${equipmentId}` : ""}`,
              {
                ...values,
                ...(dialog.type === "editEquipment"
                  ? {}
                  : {
                      type:
                        dialog.type === "tool"
                          ? "tool"
                          : equipment
                            ? "component"
                            : "equipment",
                      ...(equipmentId ? { parent: equipmentId } : {}),
                    }),
              },
              dialog.type === "editEquipment" ? "patch" : "post",
            );
            refresh();
          }}
          submitLabel="Save"
        />
      )}
    </Page>
  );
}
function RecordTable({ records }) {
  const m = useCopy();
  return records.length ? (
    <TableWrap>
      <table style={{ minWidth: 340 }}>
        <thead>
          <tr>
            {["Record Name", "Data Type", "Value", "Unit", "Date"].map(
              (label) => (
                <th key={label}>{m(label)}</th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record._id || index}>
              <td>{record.name}</td>
              <td>{m(readable(record.dataType || "text"))}</td>
              <td>
                {record.document ? (
                  <TextLink
                    to={`/documents?document=${record.document._id || record.document}`}
                  >
                    {record.value}
                  </TextLink>
                ) : record.dataType === "boolean" ? (
                  m(record.value === "true" ? "Yes" : "No")
                ) : record.dataType === "date" ? (
                  formatDate(record.value)
                ) : (
                  record.value
                )}
              </td>
              <td>{record.unit || "—"}</td>
              <td>{formatDate(record.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  ) : (
    <Muted>{m("No records added")}</Muted>
  );
}
function EquipmentTable({ rows, assetId, onSelect }) {
  const m = useCopy();
  return rows.length ? (
    <TableWrap>
      <table>
        <thead>
          <tr>
            {[
              "Name",
              "Type",
              "Manufacturer",
              "Model",
              "Serial Number",
              "Actions",
            ].map((label) => (
              <th key={label}>{m(label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td>{row.name}</td>
              <td>{m(readable(row.type))}</td>
              <td>{row.manufacturer || "—"}</td>
              <td>{row.model || "—"}</td>
              <td>{row.serialNumber || "—"}</td>
              <td>
                <Button
                  as={Link}
                  to={`/assets/${assetId}/equipment/${row._id}`}
                  onClick={onSelect}
                >
                  {m("View")}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  ) : (
    <Muted>{m("No equipment added")}</Muted>
  );
}
ProfileEditor.propTypes = {
  documents: PropTypes.array,
  profile: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  assetId: PropTypes.string.isRequired,
  equipmentId: PropTypes.string,
};
RecordTable.propTypes = { records: PropTypes.array.isRequired };
EquipmentTable.propTypes = {
  rows: PropTypes.array.isRequired,
  assetId: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
};
