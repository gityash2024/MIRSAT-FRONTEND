import { readSelectedTimezone } from "../../utils/selectedTimezone";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowDown, CheckCircle } from "lucide-react";
import PropTypes from "prop-types";
import {
  maintenanceService as service,
  maintenanceError,
  asFormData,
} from "../../services/maintenance.service";
import {
  Page,
  Back,
  Header,
  Panel,
  Grid,
  FormGrid,
  Field,
  Actions,
  Button,
  ErrorBox,
  Definition,
  Badge,
  Muted,
  ResourceState,
  FileDrop,
  useCopy,
  useMaintenanceAccess,
  useResource,
  optionsFrom,
  canManageMaintenance,
} from "./shared";
const labels = {
  receipt: "Receive Stock",
  reserve: "Reserve Stock",
  release: "Release Reservation",
  issue: "Issue Reserved Stock",
  return: "Return Unused Stock",
  transfer: "Transfer Stock",
  adjustment: "Stock Adjustment",
};
const quantityLabels = {
  receipt: "Quantity Received",
  reserve: "Quantity to Reserve",
  release: "Quantity to Release",
  issue: "Quantity to Issue",
  return: "Quantity to Return",
  transfer: "Quantity to Transfer",
  adjustment: "Counted Quantity",
};
const dates = {
  receipt: "Received Date",
  reserve: "Reservation Date",
  issue: "Issue Date",
  return: "Return Date",
  transfer: "Transfer Date",
  adjustment: "Count Date",
  release: "Release Date",
};
const confirmations = {
  receipt: "Goods receipt recorded",
  reserve: "Reservation recorded",
  release: "Reservation released",
  issue: "Stock issue recorded",
  return: "Unused stock returned",
  transfer: "Stock transfer recorded",
  adjustment: "Awaiting authorization",
};
export default function StockMovement() {
  const { id, operation } = useParams();
  const { browse } = useMaintenanceAccess("warehouse");
  const m = useCopy();
  const resource = useResource(`/warehouse/parts/${id}`, {}, browse);
  if (!browse || !labels[operation])
    return (
      <ErrorBox>{m("Access to this operation has not been granted")}</ErrorBox>
    );
  return (
    <ResourceState resource={resource}>
      {resource.data?.data && (
        <MovementForm
          key={`${id}:${operation}`}
          data={resource.data.data}
          type={operation}
        />
      )}
    </ResourceState>
  );
}
function MovementForm({ data, type }) {
  const m = useCopy();
  const { user } = useMaintenanceAccess("warehouse");
  const part = data.part;
  const warehouses = useResource("/warehouse/warehouses", { limit: 100 });
  const issues = useResource(
    "/warehouse/movements",
    { part: part._id, type: "issue", limit: 100 },
    type === "return",
  );
  const tasks = useResource(
    "/tasks",
    { limit: 100 },
    type === "reserve" && canManageMaintenance(user, "tasks"),
    true,
  );
  const key = useRef(crypto.randomUUID());
  const submitted = useRef(null);
  const [saved, setSaved] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [values, setValues] = useState({
    warehouse: part.defaultWarehouse || data.balances[0]?.warehouse?._id || "",
    destination: "",
    storageLocation: part.storageLocation || "",
    destinationStorageLocation: "",
    quantity: "",
    movementDate: new Date().toLocaleDateString("en-CA", {
      timeZone: readSelectedTimezone(),
    }),
    referenceType: "",
    reference: "",
    notes: "",
    reservation: "",
    sourceIssue: "",
    task: "",
  });
  const change = (name, value) =>
    setValues((old) => ({
      ...old,
      [name]: value,
      ...(name === "warehouse"
        ? {
            reservation: "",
            sourceIssue: "",
            ...(old.destination === value ? { destination: "" } : {}),
          }
        : {}),
    }));
  const balance = data.balances.find(
    (row) => row.warehouse?._id === values.warehouse,
  ) || { onHand: 0, reserved: 0, reorderPoint: 0 };
  const amount = Number(values.quantity) || 0;
  const delta =
    type === "adjustment"
      ? amount - balance.onHand
      : ["receipt", "return"].includes(type)
        ? amount
        : ["issue", "transfer"].includes(type)
          ? -amount
          : 0;
  const futureOnHand = balance.onHand + delta;
  const futureReserved =
    balance.reserved +
    (type === "reserve"
      ? amount
      : ["release", "issue"].includes(type)
        ? -amount
        : 0);
  const available = futureOnHand - futureReserved;
  const selectedReservation = data.reservations.find(
    (row) => row._id === values.reservation,
  );
  const reservationRemaining = selectedReservation
    ? selectedReservation.quantity -
      selectedReservation.issued -
      selectedReservation.released
    : undefined;
  const invalid =
    futureOnHand < 0 ||
    futureReserved < 0 ||
    available < 0 ||
    (["issue", "release"].includes(type) &&
      reservationRemaining !== undefined &&
      amount > reservationRemaining);
  const headerBalance = saved?.result || balance;
  const destinationBalance = data.balances.find(
    (row) => row.warehouse?._id === values.destination,
  ) || { onHand: 0, reserved: 0 };
  const field = (name, label, config = {}) => (
    <Field
      key={name}
      field={{ name, label, ...config }}
      value={values[name]}
      onChange={(value) => change(name, value)}
    />
  );
  const reservationOptions = data.reservations
    .filter(
      (row) =>
        row.warehouse?._id === values.warehouse &&
        row.quantity - row.issued - row.released > 0,
    )
    .map((row) => ({
      value: row._id,
      label: `${row.reference || row._id.slice(-8)} · ${row.quantity - row.issued - row.released} ${part.unit} ${m("remaining")}`,
    }));
  return (
    <Page>
      <Back to={`/spare-parts/${part._id}`}>
        <ArrowLeft size={14} />
        {m("Back to Part")}
      </Back>
      <Header>
        <div>
          <h1>{m(labels[type])}</h1>
          <p>
            {m("Record a stock movement and update the available quantity.")}
          </p>
        </div>
      </Header>
      {saved && (
        <Panel
          role="status"
          style={{ background: "#e3f7ef", borderColor: "#a7d9c2" }}
        >
          <Actions>
            <CheckCircle color="#287a5a" />
            <h2 style={{ margin: 0 }}>{m(confirmations[type])}</h2>
          </Actions>
          <p style={{ margin: "12px 0" }}>
            {type === "adjustment"
              ? m(
                  "Stock changes only after another permitted manager or administrator approves.",
                )
              : m("This movement is available in Movement History.")}
          </p>
          <Button as={Link} to={`/spare-parts/${part._id}`}>
            {m("Back to Part")}
          </Button>
        </Panel>
      )}
      <Panel
        style={{ background: "#000048", color: "white", marginBottom: 30 }}
      >
        <Grid $columns="minmax(0, 1fr) minmax(0, 1fr)">
          <div>
            <h2>{part.name}</h2>
            <p style={{ color: "#b9c9eb", margin: 0 }}>
              {part.sku} · {part.category}
            </p>
          </div>
          <Definition $columns={3} style={{ margin: 0 }}>
            {[
              ["On Hand", headerBalance.onHand],
              ["Reserved", headerBalance.reserved],
              ["Available", headerBalance.onHand - headerBalance.reserved],
            ].map(([label, value]) => (
              <div key={label}>
                <dd style={{ fontSize: 24 }}>
                  {value} {part.unit}
                </dd>
                <dt style={{ color: "#b9c9eb", marginTop: 8 }}>{m(label)}</dt>
              </div>
            ))}
          </Definition>
        </Grid>
      </Panel>
      {!submitted.current && (
        <Panel>
          <h2>{m("Movement Type")}</h2>
          <p>{m("Choose the operation you want to record.")}</p>
          <Actions>
            {Object.entries(labels).map(([value, label]) => (
              <Button
                key={value}
                as={Link}
                to={`/spare-parts/${part._id}/movements/${value}`}
                aria-current={type === value ? "page" : undefined}
                $primary={type === value}
              >
                {m(label)}
              </Button>
            ))}
          </Actions>
        </Panel>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy || saved) return;
          setBusy(true);
          setError("");
          try {
            if (!submitted.current) {
              const input = {
                part: part._id,
                warehouse: values.warehouse,
                notes: values.notes,
                idempotencyKey: key.current,
              };
              let result;
              if (type === "adjustment") {
                delete input.notes;
                result = await service.save("/warehouse/adjustments", {
                  ...input,
                  countedQuantity: Number(values.quantity),
                  countDate: values.movementDate,
                  reference: values.reference,
                  referenceType: values.referenceType,
                  storageLocation: values.storageLocation,
                  reason: values.notes,
                });
              } else
                result = await service.save("/warehouse/movements", {
                  ...input,
                  type,
                  quantity: Number(values.quantity),
                  movementDate: values.movementDate,
                  storageLocation: values.storageLocation,
                  referenceType: values.referenceType,
                  reference: values.reference,
                  ...(type === "transfer"
                    ? {
                        destination: values.destination,
                        destinationStorageLocation:
                          values.destinationStorageLocation,
                      }
                    : {}),
                  ...(["issue", "release"].includes(type)
                    ? { reservation: values.reservation }
                    : {}),
                  ...(type === "return"
                    ? { sourceIssue: values.sourceIssue }
                    : {}),
                  ...(type === "reserve" && values.task
                    ? { task: values.task }
                    : {}),
                });
              submitted.current = result.data;
            }
            if (file)
              await service.save(
                `/warehouse/${type === "adjustment" ? "adjustments" : "movements"}/${submitted.current._id}/attachments`,
                asFormData({ file }),
              );
            setSaved(submitted.current);
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        {[warehouses, issues, tasks]
          .filter((resource) => resource.error)
          .map((resource, index) => (
            <ErrorBox role="alert" key={index}>
              {resource.error}{" "}
              <Button type="button" onClick={resource.reload}>
                {m("Retry")}
              </Button>
            </ErrorBox>
          ))}
        <Grid $columns="minmax(0,1.78fr) minmax(300px,1fr)">
          <Panel>
            <h2>{m("Movement Details")}</h2>
            <p>{m("Enter the information for this stock movement.")}</p>
            <fieldset
              disabled={busy || Boolean(submitted.current)}
              style={{ padding: 0, border: 0, minWidth: 0 }}
            >
              <FormGrid>
                {field("warehouse", "Warehouse", {
                  required: true,
                  options: optionsFrom(warehouses.data?.data),
                })}
                {field("storageLocation", "Storage Location", {
                  required: true,
                })}
                {type === "transfer" && (
                  <>
                    {field("destination", "Destination Warehouse", {
                      required: true,
                      options: optionsFrom(
                        (warehouses.data?.data || []).filter(
                          (row) => row._id !== values.warehouse,
                        ),
                      ),
                    })}
                    {field(
                      "destinationStorageLocation",
                      "Destination Storage Location",
                      { required: true },
                    )}
                  </>
                )}
                {["issue", "release"].includes(type) &&
                  field("reservation", "Reservation", {
                    required: true,
                    wide: true,
                    options: reservationOptions,
                  })}
                {type === "return" &&
                  field("sourceIssue", "Original Issue", {
                    required: true,
                    wide: true,
                    options: (issues.data?.data || [])
                      .filter((row) => row.warehouse?._id === values.warehouse)
                      .map((row) => ({
                        value: row._id,
                        label: `${row.reference || row._id.slice(-8)} · ${row.quantity} ${part.unit}`,
                      })),
                  })}
                {field("quantity", quantityLabels[type], {
                  type: "number",
                  required: true,
                  min: type === "adjustment" ? 0 : 0.0001,
                  max: ["issue", "release"].includes(type)
                    ? reservationRemaining
                    : undefined,
                })}
                {field("movementDate", dates[type], {
                  type: "date",
                  required: true,
                })}
                {
                  <>
                    {field("referenceType", "Reference Type", {
                      options: (type === "adjustment"
                        ? ["Cycle Count", "Stock Count", "Other"]
                        : [
                            "Purchase Order",
                            "Work Order",
                            "Fault Report",
                            "Other",
                          ]
                      ).map((value) => ({ value, label: m(value) })),
                    })}
                    {field("reference", "Reference Number")}
                  </>
                }
                {type === "reserve" &&
                  canManageMaintenance(user, "tasks") &&
                  field("task", "Work Order", {
                    wide: true,
                    options: optionsFrom(tasks.data?.data, "title"),
                  })}
                {field(
                  "notes",
                  type === "adjustment"
                    ? "Adjustment Reason"
                    : "Reason / Notes",
                  { type: "textarea", wide: true, required: true },
                )}
              </FormGrid>
            </fieldset>
            {!saved && (
              <>
                <h3 style={{ marginTop: 24 }}>{m("Attachment")}</h3>
                <FileDrop file={file} onChange={setFile} />
              </>
            )}
            {submitted.current && !saved && (
              <p>
                {m(
                  "The movement is saved. Retry to finish uploading its attachment.",
                )}
              </p>
            )}
          </Panel>
          <Panel>
            <h2>{m("Stock Impact")}</h2>
            <p>{m("Preview before confirming")}</p>
            <Panel style={{ background: "#f5f8fc", padding: 18 }}>
              <Muted>{m("Current stock")}</Muted>
              <h2 style={{ margin: "12px 0" }}>
                {balance.onHand} {part.unit}
              </h2>
              <Muted>
                {balance.onHand - balance.reserved} {m("available")} ·{" "}
                {balance.reserved} {m("reserved")}
              </Muted>
            </Panel>
            <ArrowDown
              color="#1760dd"
              style={{ display: "block", margin: "16px auto" }}
            />
            <Panel style={{ background: "#edf3ff", padding: 18 }}>
              <Muted>
                {m(
                  type === "adjustment"
                    ? "After authorization"
                    : "After movement",
                )}
              </Muted>
              <h2
                style={{
                  margin: "12px 0",
                  color: invalid ? "#b54438" : "#1760dd",
                }}
              >
                {futureOnHand} {part.unit}
              </h2>
              <Muted>
                {available} {m("available")} · {futureReserved} {m("reserved")}
              </Muted>
            </Panel>
            {type === "transfer" && values.destination && (
              <Panel style={{ background: "#edf3ff", padding: 18 }}>
                <Muted>{m("Destination Warehouse")}</Muted>
                <h2 style={{ margin: "12px 0" }}>
                  {destinationBalance.onHand + amount} {part.unit}
                </h2>
                <Muted>
                  {destinationBalance.onHand +
                    amount -
                    destinationBalance.reserved}{" "}
                  {m("available")} · {destinationBalance.reserved}{" "}
                  {m("reserved")}
                </Muted>
              </Panel>
            )}
            {invalid && (
              <ErrorBox>{m("Insufficient available stock")}</ErrorBox>
            )}
            <Actions style={{ justifyContent: "space-between" }}>
              <strong>{m("Stock health")}</strong>
              <Badge
                $status={available <= balance.reorderPoint ? "high" : "current"}
              >
                {m(available <= balance.reorderPoint ? "Low Stock" : "Healthy")}
              </Badge>
            </Actions>
            <p style={{ marginTop: 18 }}>
              {m("Reorder Point")}: {balance.reorderPoint} {part.unit}
            </p>
            {type === "adjustment" && (
              <p>
                {m(
                  "Stock changes only after another permitted manager or administrator approves.",
                )}
              </p>
            )}
          </Panel>
        </Grid>
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        {!saved && (
          <Panel>
            <Actions style={{ justifyContent: "space-between" }}>
              <Muted>
                {m("This movement will appear in Movement History.")}
              </Muted>
              <Actions>
                <Button as={Link} to={`/spare-parts/${part._id}`}>
                  {m("Cancel")}
                </Button>
                <Button
                  type="submit"
                  $primary
                  disabled={busy || (!submitted.current && invalid)}
                >
                  {m(
                    busy
                      ? "Saving…"
                      : submitted.current
                        ? "Retry attachment upload"
                        : type === "adjustment"
                          ? "Submit for authorization"
                          : "Confirm",
                  )}
                </Button>
              </Actions>
            </Actions>
          </Panel>
        )}
      </form>
    </Page>
  );
}
MovementForm.propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};
