import { readSelectedTimezone } from "../../utils/selectedTimezone";
import { useRef, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  Modal,
  formatDate,
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
const roundStock = (value) => Math.round(value * 10000) / 10000;
const remaining = (row) => row.remaining ?? roundStock(row.quantity - row.issued - row.released);
const reservationNumber = (row) => row.number || `RES-${row._id.slice(-8).toUpperCase()}`;
const realLocation = (id) => id && id !== "unassigned" ? id : undefined;

export default function StockMovement() {
  const { id, operation } = useParams();
  const { browse, manage } = useMaintenanceAccess("warehouse");
  const m = useCopy();
  const resource = useResource(`/warehouse/parts/${id}`, {}, browse);
  if (!browse || !manage || !labels[operation])
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
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const taskId = canManageMaintenance(user, "tasks") ? params.get("workOrder") : null;
  const directIssue = Boolean(taskId && type === "issue");
  const part = data.part;
  const precision = /^(piece|pcs?)$/i.test(part.unit?.trim() || "") ? 0 : part.unitPrecision ?? 4;
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
    location: "unassigned",
    destinationLocation: "",
    reason: "",
    reasonExplanation: "",
    recipient: "",
    quantity: "",
    movementDate: new Date().toLocaleDateString("en-CA", {
      timeZone: readSelectedTimezone(),
    }),
    referenceType: "",
    reference: "",
    notes: "",
    reservation: "",
    sourceIssue: "",
    task: taskId || "",
  });
  const [fullRelease, setFullRelease] = useState(false);
  const [viewReservation, setViewReservation] = useState(false);
  const sourceLocations = useResource(
    `/warehouse/warehouses/${values.warehouse}/locations`, {}, Boolean(values.warehouse),
  );
  const destinationLocations = useResource(
    `/warehouse/warehouses/${values.destination}/locations`, {}, Boolean(type === "transfer" && values.destination),
  );
  const change = (name, value) => {
    if (["quantity", "warehouse", "reservation"].includes(name)) setFullRelease(false);
    const reservation = name === "reservation" && data.reservations.find((row) => row._id === value);
    setValues((old) => ({
      ...old,
      [name]: value,
      ...(name === "warehouse" && {
        reservation: "",
        ...(type !== "return" && { sourceIssue: "" }),
        location: "unassigned",
        ...(old.destination === value && { destination: "", destinationLocation: "" }),
      }),
      ...(name === "destination" && { destinationLocation: "" }),
      ...(name === "reservation" && {
        quantity: type === "issue" && reservation
          ? String(remaining(reservation)) : "",
      }),
    }));
  };
  const balance = data.balances.find(
    (row) => row.warehouse?._id === values.warehouse,
  ) || { onHand: 0, reserved: 0, reorderPoint: 0 };
  const reservationRequired = ["issue", "release"].includes(type) && !directIssue;
  const selectedReservation = data.reservations.find((row) => row._id === values.reservation);
  const reservationRemaining = selectedReservation ? remaining(selectedReservation) : undefined;
  const sourceId = reservationRequired ? selectedReservation?.location?._id : realLocation(values.location);
  const locationBalance = sourceId
    ? balance.locations?.find((row) => String(row.location) === String(sourceId)) || { onHand: 0, reserved: 0 }
    : balance.unassigned || { onHand: balance.onHand, reserved: balance.reserved };
  const amount = fullRelease ? reservationRemaining || 0 : Number(values.quantity) || 0;
  const delta =
    type === "adjustment"
      ? amount - locationBalance.onHand
      : ["receipt", "return"].includes(type)
        ? amount
        : ["issue", "transfer"].includes(type)
          ? -amount
          : 0;
  const reservedDelta = type === "reserve" ? amount : reservationRequired ? -amount : 0;
  const futureOnHand = roundStock(balance.onHand + delta);
  const futureReserved = roundStock(balance.reserved + reservedDelta);
  const available = roundStock(futureOnHand - futureReserved);
  const exceedsReservation = reservationRemaining !== undefined && amount > reservationRemaining;
  const invalidStock = futureOnHand < 0 || futureReserved < 0 || available < 0 ||
    roundStock(locationBalance.onHand + delta - locationBalance.reserved - reservedDelta) < 0;
  const invalid = exceedsReservation || invalidStock;
  const sourceLabel = warehouses.data?.data?.find((row) => row._id === values.warehouse)?.name;
  const destinationLabel = warehouses.data?.data?.find((row) => row._id === values.destination)?.name;
  const partPath = `/spare-parts/${part._id}`;
  const returnPath = taskId ? `/tasks/${taskId}` : partPath;
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
        remaining(row) > 0,
    )
    .map((row) => ({
      value: row._id,
      label: `${reservationNumber(row)} · ${formatDate(row.createdAt)} · ${row.task?.title || row.reason || row.reference || "—"}`,
    }));
  const submitActions = (
        <Actions>
          <Button as={Link} to={returnPath}>{m("Cancel")}</Button>
          <Button type="submit" $primary disabled={busy || (!submitted.current && invalid)}>
            {m(busy ? "Saving…" : submitted.current ? "Retry attachment upload" :
              type === "adjustment" ? "Submit for authorization" : type === "issue" ? "Issue Stock" : "Confirm")}
          </Button>
        </Actions>
  );
  return (
    <Page>
      <Back to={returnPath}>
        <ArrowLeft size={14} />
        {m(taskId ? "Back to Work Order" : "Back to Part")}
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
              const digits = String(values.quantity).trim();
              const pattern = precision === 0 ? /^\d+$/ : new RegExp(`^\\d+(?:\\.\\d{1,${precision}})?$`);
              if (!fullRelease && (!pattern.test(digits) || (type !== "adjustment" && amount <= 0)))
                throw new Error(m(precision === 0 ? "Piece quantities must be positive whole numbers" : "Enter a positive quantity within the allowed precision"));
              if (invalid) throw new Error(m(exceedsReservation ? "Quantity exceeds the remaining reservation" : "Insufficient available stock"));
              let result;
              if (type === "adjustment") {
                result = await service.save("/warehouse/adjustments", {
                  ...input,
                  countedQuantity: Number(values.quantity),
                  countDate: values.movementDate,
                  reference: values.reference,
                  referenceType: values.referenceType,
                  location: realLocation(values.location),
                  reason: values.reason,
                });
              } else if (directIssue) {
                result = await service.save(`/warehouse/work-orders/${taskId}/issue`, {
                  ...input, location: realLocation(values.location), quantity: amount,
                  recipient: values.recipient, movementDate: values.movementDate,
                });
              } else
                result = await service.save("/warehouse/movements", {
                  ...input,
                  type,
                  ...(fullRelease ? { fullRelease: true } : { quantity: amount }),
                  movementDate: values.movementDate,
                  ...(reservationRequired ? {} : { location: realLocation(values.location) }),
                  reason: values.reason || undefined,
                  reasonExplanation: values.reasonExplanation || undefined,
                  recipient: values.recipient || undefined,
                  referenceType: values.referenceType,
                  reference: values.reference,
                  ...(type === "transfer"
                    ? {
                        destination: values.destination,
                        destinationLocation: realLocation(values.destinationLocation),
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
            if (type === "reserve" || directIssue) {
              const movement = submitted.current;
              navigate(returnPath, { state: { success: confirmations[type], stockMovement: {
                id: movement._id, quantity: movement.quantity, unit: part.unit, available: movement.result?.available,
              } } });
              return;
            }
            setSaved(submitted.current);
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        {[warehouses, issues, tasks, sourceLocations, destinationLocations]
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
                {reservationRequired ? (
                  <Field field={{ name: "reservationLocation", label: "Storage Location", readOnly: true }}
                    value={selectedReservation?.location?.name || selectedReservation?.storageLocation || m("Unassigned location")} />
                ) : field("location", "Storage Location", {
                  required: true, searchable: true, disabled: !values.warehouse,
                  options: [
                    { value: "unassigned", label: `${m("Unassigned location")} · ${roundStock((balance.unassigned?.onHand ?? balance.onHand) - (balance.unassigned?.reserved ?? balance.reserved))} ${part.unit}` },
                    ...(sourceLocations.data?.data || []).map(({ _id, name }) => {
                      const row = balance.locations?.find((entry) => String(entry.location) === _id);
                      return { value: _id, label: `${name} · ${roundStock((row?.onHand || 0) - (row?.reserved || 0))} ${part.unit}` };
                    }),
                  ],
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
                      "destinationLocation",
                      "Destination Storage Location",
                      { required: true, searchable: true, disabled: !values.destination,
                        options: [{ value: "unassigned", label: m("Unassigned location") }, ...optionsFrom(destinationLocations.data?.data)] },
                    )}
                  </>
                )}
                {reservationRequired && field("reservation", "Reservation", {
                  required: true, wide: true, searchable: true, options: reservationOptions,
                })}
                {reservationRequired && selectedReservation && (
                  <Actions>
                    <Button type="button" onClick={() => setViewReservation(true)}>{reservationNumber(selectedReservation)}</Button>
                    <Muted>{m(type === "issue" ? "Remaining to issue" : "Remaining to release")}: {reservationRemaining} {part.unit}</Muted>
                    {type === "release" && <Button type="button" onClick={() => {
                      setFullRelease(true);
                      setValues((old) => ({ ...old, quantity: String(reservationRemaining) }));
                    }}>{m("Release full remaining quantity")}</Button>}
                  </Actions>
                )}
                {type === "return" &&
                  field("sourceIssue", "Original Issue", {
                    required: true,
                    wide: true,
                    options: (issues.data?.data || [])
                      .map((row) => ({
                        value: row._id,
                        label: `${row.reference || row._id.slice(-8)} · ${row.quantity} ${part.unit}`,
                      })),
                  })}
                {field("quantity", quantityLabels[type], {
                  suffix: part.unit,
                  inputMode: precision === 0 ? "numeric" : "decimal",
                  required: true,
                })}
                {type === "issue" && field("recipient", "Recipient", { required: true, maxLength: 200 })}
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
                {type === "release" && field("reason", "Reason", {
                  required: true, wide: true,
                  options: ["No longer needed", "Work order cancelled", "Reserved by mistake", "Other"],
                })}
                {type === "release" && values.reason === "Other" && field("reasonExplanation", "Explain the release reason", { required: true, type: "textarea", wide: true })}
                {["reserve", "adjustment"].includes(type) && field("reason", type === "adjustment" ? "Adjustment Reason" : "Reason", {
                  type: "textarea", wide: true, required: type === "adjustment" || !values.task,
                })}
                {field("notes", "Notes", { type: "textarea", wide: true })}
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
              <Muted>{sourceLabel || m("Warehouse")} · {m("Current stock")}</Muted>
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
                <Muted>{destinationLabel || m("Destination Warehouse")}</Muted>
                <p>{m("Current stock")}: {destinationBalance.onHand} {part.unit}</p>
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
              <ErrorBox>{m(exceedsReservation ? "Quantity exceeds the remaining reservation" : "Insufficient available stock")}</ErrorBox>
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
            {!saved && type === "issue" && submitActions}
          </Panel>
        </Grid>
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        {!saved && type !== "issue" && <Panel>{submitActions}</Panel>}
      </form>
      {viewReservation && selectedReservation && (
        <Modal title={reservationNumber(selectedReservation)} onClose={() => setViewReservation(false)}>
          <Definition>
            <dt>{m("Date")}</dt><dd>{formatDate(selectedReservation.createdAt, true)}</dd>
            <dt>{m("Warehouse")}</dt><dd>{selectedReservation.warehouse?.name}</dd>
            <dt>{m("Storage Location")}</dt><dd>{selectedReservation.location?.name || selectedReservation.storageLocation || m("Unassigned location")}</dd>
            <dt>{m("Reason")}</dt><dd>{selectedReservation.reason || selectedReservation.reference || "—"}</dd>
            <dt>{m("Work Order")}</dt>
            <dd>{selectedReservation.task?._id ? <Link to={`/tasks/${selectedReservation.task._id}`}>{selectedReservation.task.title}</Link> : "—"}</dd>
            <dt>{m("Remaining")}</dt><dd>{reservationRemaining} {part.unit}</dd>
          </Definition>
        </Modal>
      )}
    </Page>
  );
}
MovementForm.propTypes = {
  data: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};
