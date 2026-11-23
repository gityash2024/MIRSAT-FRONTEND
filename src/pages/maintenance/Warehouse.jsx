import ActionMenu from "./ActionMenu";
import StockEvidence from "./StockEvidence";
import { PrivateImage } from "./ProfileFields";
import { SelectInput } from "./DesignSelect";
import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useParams, useLocation } from "react-router-dom";
import { Plus, ArrowLeft, RefreshCw, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
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
  Stats,
  Stat,
  FilterBar,
  TableWrap,
  Badge,
  Muted,
  Definition,
  FormDialog,
  Modal,
  ErrorBox,
  ResourceState,
  Pagination,
  Back,
  Tabs,
  TextLink,
  useCopy,
  useResource,
  useMaintenanceAccess,
  canManageMaintenance,
  formatDate,
  optionsFrom,
  readable,
} from "./shared";

const partFields = [
  { name: "sku", label: "Part Number", required: true },
  { name: "name", label: "Part Name", required: true },
  { name: "category", label: "Category", required: true },
  { name: "unit", label: "Unit", required: true },
  { name: "manufacturer", label: "Manufacturer" },
  { name: "description", label: "Description", type: "textarea", wide: true },
];
const warehouseFields = [
  { name: "code", label: "Warehouse Code", required: true },
  { name: "name", label: "Warehouse Name", required: true },
  { name: "location", label: "Location", required: true },
  { name: "description", label: "Description", type: "textarea", wide: true },
];
const operationLabels = {
  receipt: "Receive Stock",
  reserve: "Reserve Stock",
  release: "Release Reservation",
  issue: "Issue Reserved Stock",
  return: "Return Unused Stock",
  transfer: "Transfer Stock",
  adjustment: "Request Stock Adjustment",
  reorder: "Create Reorder Rule",
};
function OperationDialog({
  type,
  part,
  warehouses,
  reservations = [],
  issues = [],
  onClose,
  onSaved,
}) {
  const m = useCopy();
  const key = useRef(crypto.randomUUID());
  const { user } = useMaintenanceAccess("warehouse");
  const tasks = useResource(
    "/tasks",
    { limit: 100 },
    type === "reserve" && canManageMaintenance(user, "tasks"),
    true,
  );
  const fields = [
    {
      name: "warehouse",
      label: "Warehouse",
      required: true,
      options: optionsFrom(warehouses),
    },
  ];
  if (type === "transfer")
    fields.push({
      name: "destination",
      label: "Destination Warehouse",
      required: true,
      options: optionsFrom(warehouses),
    });
  if (type === "reserve" && canManageMaintenance(user, "tasks"))
    fields.push({
      name: "task",
      label: "Work Order",
      options: optionsFrom(tasks.data?.data, "title"),
    });
  if (["issue", "release"].includes(type))
    fields.push({
      name: "reservation",
      label: "Reservation",
      required: true,
      options: reservations
        .filter((row) => row.quantity - row.issued - row.released > 0)
        .map((row) => ({
          value: row._id,
          label: `${row.reference || row._id.slice(-8)} · ${row.warehouse?.name || ""} · ${row.quantity - row.issued - row.released} ${m("remaining")}`,
        })),
    });
  if (type === "return")
    fields.push({
      name: "sourceIssue",
      label: "Original Issue",
      required: true,
      options: issues.map((row) => ({
        value: row._id,
        label: `${formatDate(row.createdAt)} · ${row.quantity} ${part.unit} · ${row.warehouse?.name || ""}`,
      })),
    });
  if (type === "reorder")
    fields.push(
      {
        name: "reorderPoint",
        label: "Reorder Point",
        type: "number",
        min: 0,
        required: true,
      },
      {
        name: "reorderQuantity",
        label: "Reorder Quantity",
        type: "number",
        min: 0.0001,
        required: true,
      },
    );
  else
    fields.push(
      {
        name: "quantity",
        label:
          type === "adjustment" ? "Adjustment Quantity (+ / −)" : "Quantity",
        type: "number",
        min: type === "adjustment" ? undefined : 0.0001,
        required: true,
      },
      {
        name: "reference",
        label: "Reference",
        when: () => type !== "adjustment",
      },
      {
        name: "notes",
        label: type === "adjustment" ? "Reason" : "Notes",
        type: "textarea",
        wide: true,
        required: true,
      },
    );
  return (
    <FormDialog
      title={operationLabels[type]}
      fields={fields}
      onClose={onClose}
      submitLabel={
        type === "adjustment"
          ? "Submit for authorization"
          : type === "reorder"
            ? "Save Rule"
            : "Confirm"
      }
      onSubmit={async (values) => {
        const input = { ...values, part: part._id };
        if (type === "reorder")
          await service.save("/warehouse/reorder-rules", input, "put");
        else if (type === "adjustment") {
          delete input.notes;
          await service.save("/warehouse/adjustments", {
            ...input,
            reason: values.notes,
            idempotencyKey: key.current,
          });
        } else
          await service.save("/warehouse/movements", {
            ...input,
            type,
            idempotencyKey: key.current,
          });
        toast.success(
          m(
            type === "adjustment"
              ? "Awaiting authorization"
              : "Operation recorded",
          ),
        );
        onSaved();
      }}
    >
      <Panel style={{ marginTop: 20, padding: 16, background: "#f5f9ff" }}>
        <strong>{part.name}</strong>
        <p style={{ margin: "6px 0" }}>
          {part.sku} · {part.unit}
        </p>
        {type === "adjustment" && (
          <Muted>
            {m(
              "Stock changes only after another permitted manager or administrator approves.",
            )}
          </Muted>
        )}
      </Panel>
    </FormDialog>
  );
}
function InventoryExport({ filters, onClose }) {
  const m = useCopy();
  const { i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [all, setAll] = useState(false);
  const [selection, setSelection] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const parts = useResource("/warehouse/parts", { ...filters, page });
  const total = parts.data?.total || 0;
  const count = all ? Math.max(total - selection.length, 0) : selection.length;
  return (
    <Modal title={m("Export Inventory")} onClose={onClose} busy={busy} wide>
      <Actions>
        <Button onClick={() => { setAll(true); setSelection([]); }}>{m("Select All")}</Button>
        <Button onClick={() => { setAll(false); setSelection([]); }}>{m("Clear Selection")}</Button>
        <Muted>{count} {m("selected")}</Muted>
      </Actions>
      <ResourceState resource={parts}>
        <TableWrap>
          <table>
            <thead><tr><th>{m("Select")}</th><th>{m("Part Number")}</th><th>{m("Part Name")}</th></tr></thead>
            <tbody>
              {(parts.data?.data || []).map((part) => (
                <tr key={part._id}>
                  <td><input type="checkbox" aria-label={`${m("Select")} ${part.name}`}
                    checked={all !== selection.includes(part._id)}
                    onChange={() => setSelection((old) => old.includes(part._id)
                      ? old.filter((id) => id !== part._id) : [...old, part._id])} /></td>
                  <td>{part.sku}</td><td>{part.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <Pagination result={parts.data} page={page} onChange={setPage} />
      </ResourceState>
      {error && <ErrorBox role="alert">{error}</ErrorBox>}
      <Actions style={{ justifyContent: "flex-end" }}>
        <Button onClick={onClose} disabled={busy}>{m("Cancel")}</Button>
        <Button $primary disabled={!count || busy} onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await service.download("/warehouse/inventory-export", "mirsat-inventory.csv", {
              filters, all, ...(all ? { excludedIds: selection } : { ids: selection }),
              language: i18n.language?.startsWith("ar") ? "ar" : "en",
            });
            onClose();
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}>{m("Export")}</Button>
      </Actions>
    </Modal>
  );
}

function ReorderRuleDialog({ part, rule, onClose, onSaved, manage }) {
  const m = useCopy();
  const [editing, setEditing] = useState(false);
  if (editing) return (
    <FormDialog
      title="Edit Reorder Rule"
      initial={{ reorderPoint: rule.reorderPoint, reorderQuantity: rule.reorderQuantity }}
      fields={[
        { name: "reorderPoint", label: "Reorder Point", type: "number", required: true, min: 0 },
        { name: "reorderQuantity", label: "Reorder Quantity", type: "number", required: true, min: 0.0001 },
      ]}
      onClose={onClose}
      onSubmit={async (values) => {
        await service.save("/warehouse/reorder-rules", { ...values, part: part._id, warehouse: rule.warehouse._id }, "put");
        onSaved();
      }}
    />
  );
  return (
    <Modal title={m("Review Reorder Rule")} onClose={onClose}>
      <Definition>
        <dt>{m("Part")}</dt><dd>{part.name} · {part.sku}</dd>
        <dt>{m("Warehouse")}</dt><dd>{rule.warehouse?.name}</dd>
        <dt>{m("Reorder Point")}</dt><dd>{rule.reorderPoint} {part.unit}</dd>
        <dt>{m("Reorder Quantity")}</dt><dd>{rule.reorderQuantity} {part.unit}</dd>
      </Definition>
      {manage && <Button $primary onClick={() => setEditing(true)}>{m("Edit Rule")}</Button>}
    </Modal>
  );
}

function WarehouseSelector({ warehouses, value, onChange, m }) {
  return (
    <SelectInput aria-label={m("Warehouse")} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{m("All Warehouses")}</option>
      {warehouses.map((row) => <option key={row._id} value={row._id}>{row.name}</option>)}
    </SelectInput>
  );
}

export default function WarehousePage() {
  const m = useCopy();
  const { browse, manage, user } = useMaintenanceAccess("warehouse");
  const [tab, setTab] = useState("inventory");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(null);
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [movementWarehouse, setMovementWarehouse] = useState("");
  const [movementPart, setMovementPart] = useState("");
  const inventoryFilters = { search: query, warehouse: warehouseFilter, stockStatus };
  const partLookup = useResource(
    "/warehouse/parts",
    { limit: 100 },
    browse && dialog?.type === "choosePart",
  );
  const parts = useResource(
    "/warehouse/parts",
    { page, ...inventoryFilters },
    browse && tab === "inventory",
  );
  const warehouses = useResource(
    "/warehouse/warehouses",
    { limit: 100 },
    browse,
  );
  const balances = useResource(
    "/warehouse/balances",
    {
      page,
      rules: tab === "reorder" ? "true" : undefined,
      warehouse: warehouseFilter,
    },
    browse && ["warehouses", "reorder"].includes(tab),
  );
  const movements = useResource(
    "/warehouse/movements",
    { page, warehouse: movementWarehouse, part: movementPart },
    browse && tab === "movements",
  );
  const adjustments = useResource(
    "/warehouse/adjustments",
    { page },
    browse && tab === "adjustments",
  );
  const summary = useResource("/warehouse/summary", {}, browse);
  const refresh = () => {
    parts.reload();
    warehouses.reload();
    balances.reload();
    movements.reload();
    adjustments.reload();
    summary.reload();
  };
  if (!browse) return <ErrorView />;
  const stats = summary.data?.data;
  const resource =
    tab === "inventory"
      ? parts
      : ["warehouses", "reorder"].includes(tab)
        ? balances
        : tab === "movements"
          ? movements
          : adjustments;
  return (
    <Page>
      <Header>
        <div>
          <h1>{m("Spare Parts & Warehouse")}</h1>
          <p>
            {m(
              "Track inventory, reservations, warehouse availability, and maintenance stock movements.",
            )}
          </p>
        </div>
        <Actions>
          <Button onClick={refresh}>
            <RefreshCw />
            {m("Refresh inventory")}
          </Button>
          <Button
            onClick={() => {
              if (tab !== "movements") return setDialog({ type: "inventoryExport" });
              const params = new URLSearchParams({ resource: "movements", ...(movementWarehouse && { warehouse: movementWarehouse }), ...(movementPart && { part: movementPart }) });
              service.download(`/warehouse/export?${params}`, "mirsat-stock-movements.csv")
                .catch((error) => toast.error(maintenanceError(error)));
            }}
          >
            <Download />
            {m("Export")}
          </Button>
          {manage && (
            <>
              <Button onClick={() => setDialog({ type: "warehouse" })}>
                <Plus />
                {m("Add Warehouse")}
              </Button>
              <Button $primary as={Link} to="/spare-parts/create">
                <Plus />
                {m("Add Spare Part")}
              </Button>
            </>
          )}
        </Actions>
      </Header>
      <Stats $count={5}>
        {[
          ["Total Parts", stats?.parts, "blue", ""],
          ["In Stock", stats?.inStock, "green", "in_stock"],
          ["Reserved Stock", stats?.reservedStock, "amber", "reserved"],
          ["Out of Stock", stats?.outOfStock, "red", "out_of_stock"],
          ["Low Stock", stats?.lowStock, "amber", "low_stock"],
        ].map(([label, value, tone, status]) => (
          <Stat key={label} $tone={tone} as="button" type="button"
            style={{ textAlign: "start", font: "inherit", border: 0, cursor: "pointer" }}
            onClick={() => { setTab("inventory"); setPage(1); setSearch(""); setQuery(""); setWarehouseFilter(""); setStockStatus(status); }}
          >
            <strong>{value ?? "—"}</strong>
            <span>{m(label)}</span>
          </Stat>
        ))}
      </Stats>
      <Tabs role="tablist">
        {[
          ["inventory", "Inventory List"],
          ["warehouses", "Warehouse View"],
          ["movements", "Movement History"],
          ["reorder", "Reorder Rules"],
          ["adjustments", "Stock Adjustments"],
        ].map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => {
              setTab(value);
              setPage(1);
            }}
          >
            {m(label)}
          </button>
        ))}
      </Tabs>
      {tab === "inventory" && (
        <FilterBar
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search);
            setPage(1);
          }}
        >
          <input
            aria-label={m("Search spare parts")}
            placeholder={m("Search spare parts…")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <SelectInput
            aria-label={m("Warehouse")}
            value={warehouseFilter}
            onChange={(event) => {
              setWarehouseFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{m("All warehouses")}</option>
            {(warehouses.data?.data || []).map((row) => (
              <option key={row._id} value={row._id}>
                {row.name}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            aria-label={m("Stock Status")}
            value={stockStatus}
            onChange={(event) => {
              setStockStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{m("Stock Status")}</option>
            {[
              ["in_stock", "In Stock"],
              ["out_of_stock", "Out of Stock"],
              ["low_stock", "Low Stock"],
              ["reserved", "Reserved"],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {m(label)}
              </option>
            ))}
          </SelectInput>
          <Button $primary type="submit">
            {m("Search")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSearch("");
              setQuery("");
              setWarehouseFilter("");
              setStockStatus("");
              setPage(1);
            }}
          >
            {m("Reset Filters")}
          </Button>
        </FilterBar>
      )}
      {tab === "warehouses" && (
        <Panel><Actions>
          <WarehouseSelector warehouses={warehouses.data?.data || []} value={warehouseFilter} m={m}
            onChange={(value) => { setWarehouseFilter(value); setPage(1); }} />
          {manage && warehouseFilter && (
            <>
              <Button onClick={() => setDialog({ type: "warehouse", warehouse: warehouses.data?.data?.find((row) => row._id === warehouseFilter) })}>{m("Edit Warehouse")}</Button>
              <Button onClick={() => setDialog({ type: "storageLocation", warehouse: warehouseFilter })}>{m("Add Storage Location")}</Button>
            </>
          )}
        </Actions></Panel>
      )}
      {tab === "movements" && (
        <FilterBar as="div">
          <WarehouseSelector warehouses={warehouses.data?.data || []} value={movementWarehouse} m={m}
            onChange={(value) => { setMovementWarehouse(value); setPage(1); }} />
          {movementPart && <Button onClick={() => { setMovementPart(""); setPage(1); }}>{m("Clear Part Filter")}</Button>}
        </FilterBar>
      )}
      {tab === "reorder" && (
        <Panel>
          <p>
            {m(
              "Reorder rules flag low stock. They do not automatically purchase parts.",
            )}
          </p>
          <Button onClick={() => setDialog({ type: "choosePart" })}>
            {m("Create Reorder Rule")}
          </Button>
        </Panel>
      )}
      <Panel>
        <h2>
          {m(
            {
              inventory: "Spare Parts Inventory",
              warehouses: "Stock by Warehouse",
              movements: "Movement History",
              reorder: "Low Stock & Reorder Rules",
              adjustments: "Stock Adjustments",
            }[tab],
          )}
        </h2>
        <ResourceState resource={resource} empty={!resource.data?.data?.length}>
          {tab === "inventory" ? (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    {[
                      "#",
                      "Part No.",
                      "Part Name",
                      "Category",
                      "On Hand",
                      "Reserved",
                      "Available",
                      "Status",
                      "Actions",
                    ].map((label) => (
                      <th key={label}>{m(label)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(parts.data?.data || []).map((part, index) => (
                    <tr key={part._id}>
                      <td>{(page - 1) * 20 + index + 1}</td>
                      <td>{part.sku}</td>
                      <td>
                        <TextLink to={`/spare-parts/${part._id}`}>
                          {part.name}
                        </TextLink>
                      </td>
                      <td>{part.category}</td>
                      <td>
                        {part.onHand} {part.unit}
                      </td>
                      <td>{part.reserved}</td>
                      <td>{part.available}</td>
                      <td>
                        <Badge
                          $status={
                            part.lowStock
                              ? "high"
                              : part.onHand
                                ? "current"
                                : "pending"
                          }
                        >
                          {m(
                            part.lowStock
                              ? "Low Stock"
                              : part.onHand
                                ? "In Stock"
                                : "Out of Stock",
                          )}
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
          ) : ["warehouses", "reorder"].includes(tab) ? (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    {[
                      "Part",
                      "Warehouse",
                      "On Hand",
                      "Reserved",
                      "Available",
                      "Reorder Point",
                      "Reorder Quantity",
                      ...(tab === "warehouses" ? ["Storage Locations", "Last Stock Movement"] : []),
                      "Actions",
                    ].map((label) => (
                      <th key={label}>{m(label)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(balances.data?.data || []).map((balance) => (
                    <tr key={balance._id}>
                      <td>
                        <TextLink to={`/spare-parts/${balance.part?._id}`}>
                          {balance.part?.name}
                        </TextLink>
                        <small>{balance.part?.sku}</small>
                      </td>
                      <td>{balance.warehouse?.name}</td>
                      <td>{balance.onHand}</td>
                      <td>{balance.reserved}</td>
                      <td>{balance.onHand - balance.reserved}</td>
                      <td>{balance.reorderPoint}</td>
                      <td>{balance.reorderQuantity}</td>
                      {tab === "warehouses" && (
                        <>
                          <td><LocationBalances balance={balance} /></td>
                          <td>{formatDate(balance.lastBalanceMovementAt, true)}</td>
                        </>
                      )}
                      <td>
                        {tab === "reorder" ? (
                          <Button onClick={() => setDialog({ type: "savedRule", rule: balance, part: balance.part })}>{m("Review Reorder Rule")}</Button>
                        ) : (
                          <Button onClick={() => {
                            setMovementPart(balance.part?._id || ""); setMovementWarehouse(balance.warehouse?._id || "");
                            setTab("movements"); setPage(1);
                          }}>{m("Movement History")}</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          ) : tab === "movements" ? (
            <MovementTable rows={movements.data?.data || []} onChanged={refresh} />
          ) : (
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    {[
                      "Part",
                      "Warehouse",
                      "Adjustment",
                      "Requested By",
                      "Reason",
                      "Status",
                      "Actions",
                    ].map((label) => (
                      <th key={label}>{m(label)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(adjustments.data?.data || []).map((row) => (
                    <tr key={row._id}>
                      <td>{row.part?.name}</td>
                      <td>{row.warehouse?.name}</td>
                      <td>
                        {row.quantity > 0 ? "+" : ""}
                        {row.quantity}
                      </td>
                      <td>{row.requestedBy?.name}</td>
                      <td>{row.reason}</td>
                      <td>
                        <Badge $status={row.status}>
                          {m(readable(row.status))}
                        </Badge>
                      </td>
                      <td>
                        <Button onClick={() => setDialog({ type: "adjustmentDetails", adjustment: row })}>{m("View Details")}</Button>
                        {manage && row.status === "pending" &&
                        String(row.requestedBy?._id) !==
                          String(user._id || user.id) ? (
                          <Button
                            onClick={() =>
                              setDialog({ type: "decision", adjustment: row })
                            }
                          >
                            {m("Review")}
                          </Button>
                        ) : (
                          row.decidedBy?.name || "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
          <Pagination result={resource.data} page={page} onChange={setPage} />
        </ResourceState>
      </Panel>
      {dialog?.type === "part" && (
        <FormDialog
          title="Add Spare Part"
          fields={partFields}
          initial={{ unit: "pcs" }}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save("/warehouse/parts", values);
            refresh();
          }}
          submitLabel="Save Spare Part"
        />
      )}
      {dialog?.type === "warehouse" && (
        <FormDialog
          title={dialog.warehouse ? "Edit Warehouse" : "Add Warehouse"}
          fields={warehouseFields}
          initial={
            dialog.warehouse
              ? Object.fromEntries(
                  warehouseFields.map((field) => [
                    field.name,
                    dialog.warehouse[field.name] || "",
                  ]),
                )
              : {}
          }
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/warehouse/warehouses${dialog.warehouse ? `/${dialog.warehouse._id}` : ""}`,
              values,
              dialog.warehouse ? "patch" : "post",
            );
            refresh();
          }}
        />
      )}
      {dialog?.type === "inventoryExport" && <InventoryExport filters={inventoryFilters} onClose={() => setDialog(null)} />}
      {dialog?.type === "storageLocation" && manage && (
        <FormDialog title="Add Storage Location" fields={[{ name: "name", label: "Storage Location", required: true, maxLength: 200 }]}
          onClose={() => setDialog(null)} onSubmit={async (values) => {
            await service.save(`/warehouse/warehouses/${dialog.warehouse}/locations`, values);
            refresh();
          }} />
      )}
      {dialog?.type === "savedRule" && <ReorderRuleDialog part={dialog.part} rule={dialog.rule} manage={manage}
        onClose={() => setDialog(null)} onSaved={refresh} />}
      {dialog?.type === "adjustmentDetails" && (
        <StockEventDetails id={dialog.adjustment._id} kind="adjustments" onClose={() => setDialog(null)} onSaved={refresh} />
      )}
      {dialog?.type === "decision" && (
        <FormDialog
          title="Authorize Stock Adjustment"
          fields={[
            {
              name: "decision",
              label: "Decision",
              options: [
                { value: "approved", label: "Approve" },
                { value: "rejected", label: "Reject" },
              ],
              required: true,
            },
            {
              name: "notes",
              label: "Decision Notes",
              type: "textarea",
              wide: true,
              when: ({ decision }) => decision !== "rejected",
            },
            {
              name: "rejectionReason",
              label: "Rejection Reason",
              type: "textarea",
              wide: true,
              required: true,
              when: ({ decision }) => decision === "rejected",
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/warehouse/adjustments/${dialog.adjustment._id}/decision`,
              { decision: values.decision, notes: values.decision === "rejected" ? values.rejectionReason : values.notes || "" },
            );
            refresh();
          }}
        >
          <p style={{ marginTop: 20 }}>
            {dialog.adjustment.part?.name} · {dialog.adjustment.quantity} ·{" "}
            {dialog.adjustment.reason}
          </p>
          <StockEvidence id={dialog.adjustment._id} kind="adjustments" />
        </FormDialog>
      )}
      {dialog?.type === "choosePart" && (
        <FormDialog
          title="Choose Spare Part"
          fields={[
            {
              name: "part",
              label: "Part",
              options: optionsFrom(partLookup.data?.data),
              required: true,
            },
            {
              name: "warehouse",
              label: "Warehouse",
              options: optionsFrom(warehouses.data?.data),
              required: true,
            },
            {
              name: "reorderPoint",
              label: "Reorder Point",
              type: "number",
              min: 0,
              required: true,
            },
            {
              name: "reorderQuantity",
              label: "Reorder Quantity",
              type: "number",
              min: 0.0001,
              required: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save("/warehouse/reorder-rules", values, "put");
            refresh();
          }}
          submitLabel="Save Rule"
        />
      )}
    </Page>
  );
}
function ErrorView() {
  const m = useCopy();
  return <Panel>{m("Access to this module has not been granted")}</Panel>;
}
function LocationBalances({ balance }) {
  const m = useCopy();
  const rows = balance.locations || [];
  const unassigned = balance.unassigned || {
    onHand: Math.round((balance.onHand - rows.reduce((total, row) => total + row.onHand, 0)) * 10000) / 10000,
    reserved: Math.round((balance.reserved - rows.reduce((total, row) => total + row.reserved, 0)) * 10000) / 10000,
  };
  return (
    <div>
      {[...rows, { location: "unassigned", name: m("Unassigned location"), ...unassigned }]
        .filter((row) => row.onHand || row.reserved)
        .map((row) => <div key={row.location}>{row.name}: {row.onHand} {m("On Hand")} · {row.reserved} {m("Reserved")}</div>)}
    </div>
  );
}

export function StockEventDetails({ id, kind = "movements", onClose, onSaved }) {
  const m = useCopy();
  const { manage } = useMaintenanceAccess("warehouse");
  const [reverse, setReverse] = useState(false);
  const [linked, setLinked] = useState(null);
  const activeId = linked || id;
  const resource = useResource(`/warehouse/${kind}/${activeId}`);
  const row = resource.data?.data;
  if (reverse) return (
    <FormDialog title="Reverse Transfer" fields={[{ name: "reason", label: "Reason", type: "textarea", required: true }]}
      onClose={() => setReverse(false)} submitLabel="Reverse Transfer" onSubmit={async (values) => {
        await service.save(`/warehouse/movements/${id}/reverse`, values);
        onSaved?.();
        onClose();
      }}>
      <p>{row.destination?.name} → {row.warehouse?.name}: {row.quantity} {row.part?.unit}</p>
      <Definition>
        {row.reversalImpact.map(({ warehouse, before, after }) => (
          <div key={warehouse}><dt>{warehouse}</dt><dd>{before} → {after} {row.part?.unit}</dd></div>
        ))}
      </Definition>
      <p>{m("The original movement will be retained and linked to the reversal.")}</p>
    </FormDialog>
  );
  return (
    <Modal title={m(kind === "adjustments" ? "Stock Adjustment Details" : "Movement Details")} onClose={onClose} wide>
      <ResourceState resource={resource}>
        {row && (
          <>
            <Definition>
              {[
                ["Part", row.part?.name], ["Warehouse", row.warehouse?.name], ["Storage Location", row.storageLocation || m("Unassigned location")],
                ["To", row.destination?.name || row.recipient], ["Destination Storage Location", row.destinationStorageLocation],
                ["Quantity", `${row.quantity} ${row.part?.unit || ""}`], ["Reference", row.reference],
                ["Reason", row.reason], ["Explanation", row.reasonExplanation], ["Notes", row.notes],
                ["Date", formatDate(row.createdAt, true)], ["By", row.actor?.name || row.requestedBy?.name],
                ["Status", row.status && m(readable(row.status))], ["Decided By", row.decidedBy?.name],
                ["Decision Date", row.decidedAt && formatDate(row.decidedAt, true)], ["Decision Notes", row.decisionNotes],
                ["Work Order", row.task?._id && <TextLink to={`/tasks/${row.task._id}`}>{row.task.title}</TextLink>],
                ["Original Movement", row.reversalOf && <Button onClick={() => setLinked(row.reversalOf)}>{m("View Details")}</Button>],
                ["Reversal", !linked && row.reversal?._id && <Button onClick={() => setLinked(row.reversal._id)}>{m("View Details")}</Button>],
              ].filter(([, value]) => value !== undefined && value !== null && value !== "").map(([label, value]) => (
                <div key={label}><dt>{m(label)}</dt><dd>{value}</dd></div>
              ))}
            </Definition>
            {row.attachmentCount > 0 ? (
              <Actions><Muted>{row.attachmentCount} {m("Attachments")}</Muted><StockEvidence id={activeId} kind={kind} /></Actions>
            ) : <Muted>{m("No attachments")}</Muted>}
            {manage && !linked && row.reversalImpact && (
              <Button onClick={() => setReverse(true)}>{m("Reverse Transfer")}</Button>
            )}
            {linked && <Button onClick={() => setLinked(null)}>{m("Back")}</Button>}
          </>
        )}
      </ResourceState>
    </Modal>
  );
}

function MovementTable({ rows, onChanged }) {
  const m = useCopy();
  const [detail, setDetail] = useState(null);
  return (
    <>
    <TableWrap>
      <table>
        <thead>
          <tr>
            {[
              "Date",
              "Movement",
              "Part",
              "Warehouse",
              "To",
              "Quantity",
              "Reference",
              "By",
              "Attachments",
              "Actions",
            ].map((label) => (
              <th key={label}>{m(label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td>{formatDate(row.createdAt)}</td>
              <td>
                <Badge $status={row.type}>{m(readable(row.type))}</Badge>
              </td>
              <td>{row.part?.name || "—"}</td>
              <td>{row.warehouse?.name || "—"}</td>
              <td>{row.type === "reserve" ? m("Not applicable") :
                row.type === "issue" ? row.recipient || "—" :
                row.destination?.name || (["receipt", "return"].includes(row.type) ? row.warehouse?.name : "—")}</td>
              <td>{row.quantity}</td>
              <td>
                {row.reference || "—"}
                <small>{row.notes}</small>
              </td>
              <td>{row.actor?.name || "—"}</td>
              <td>{row.attachmentCount || "—"}</td>
              <td>
                <Button onClick={() => setDetail(row._id)}>{m("View Details")}</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
    {detail && <StockEventDetails id={detail} onClose={() => setDetail(null)} onSaved={onChanged} />}
    </>
  );
}
export function SparePartDetail() {
  const { id } = useParams();
  const m = useCopy();
  const location = useLocation();
  const { browse, manage, user } = useMaintenanceAccess("warehouse");
  const fromAsset = location.state?.fromAsset;
  const backToAsset = fromAsset?.tab === "parts" && /^\/assets\/[^/?#]+(?:\/equipment\/[^/?#]+)?$/.test(fromAsset.path);
  const [tab, setTab] = useState("overview");
  const [dialog, setDialog] = useState(null);
  const [page, setPage] = useState(1);
  const [movementWarehouse, setMovementWarehouse] = useState("");
  const resource = useResource(`/warehouse/parts/${id}`, {}, browse);
  const warehouses = useResource(
    "/warehouse/warehouses",
    { limit: 100 },
    browse,
  );
  const movements = useResource(
    "/warehouse/movements",
    { part: id, page, warehouse: movementWarehouse },
    browse,
  );
  const issues = useResource(
    "/warehouse/movements",
    { part: id, type: "issue", limit: 100 },
    browse,
  );
  const [assets, setAssets] = useState([]);
  const data = resource.data?.data;
  const part = data?.part;
  const refresh = () => {
    resource.reload();
    movements.reload();
    issues.reload();
  };
  if (!browse) return <ErrorView />;
  return (
    <Page>
      <Back to={backToAsset ? fromAsset.path : "/spare-parts"} state={backToAsset ? { assetTab: "parts" } : undefined}>
        <ArrowLeft size={14} />
        {m(backToAsset ? "Back to Asset" : "Back to Spare Parts")}
      </Back>
      <ResourceState resource={resource}>
        {part && (
          <>
            <Header>
              <div>
                <h1>{part.name}</h1>
                <p>
                  {part.sku} · {part.category}
                </p>
              </div>
              <Actions>
                {manage && <Button as={Link} to={`/spare-parts/${id}/edit`}>{m("Edit Spare Part")}</Button>}
                {manage && <Button onClick={() => setDialog({ type: "reorder" })}>{m("Create Reorder Rule")}</Button>}
              </Actions>
            </Header>
            {location.state?.success && (
              <Panel
                role="status"
                style={{
                  background: "#e3f7ef",
                  borderColor: "#b8e1d0",
                  color: "#287a5a",
                }}
              >
                {m(location.state.success)}
                {location.state.stockMovement && (
                  <Actions>
                    <strong>{location.state.stockMovement.quantity} {location.state.stockMovement.unit} · {location.state.stockMovement.available ?? "—"} {m("available")}</strong>
                    <Button onClick={() => setDialog({ type: "movementDetails", id: location.state.stockMovement.id })}>{m("View Movement")}</Button>
                  </Actions>
                )}
              </Panel>
            )}
            {data.balances.some(
              (row) => row.onHand - row.reserved <= row.reorderPoint,
            ) && (
              <Panel
                role="status"
                style={{ background: "#fff5df", borderColor: "#ecd8ad" }}
              >
                <h3>{m("Low Stock Alert")}</h3>
                <p>
                  {m(
                    "Available stock has reached the reorder point in one or more warehouses.",
                  )}
                </p>
                <Actions>
                  {data.balances.filter((row) => row.reorderPoint > 0 && row.onHand - row.reserved <= row.reorderPoint)
                    .map((rule) => <Button key={rule._id} onClick={() => setDialog({ type: "savedRule", rule })}>
                      {m("Review Reorder Rule")} · {rule.warehouse?.name}
                    </Button>)}
                </Actions>
              </Panel>
            )}
            <Stats $count={3}>
              {[
                [
                  "On Hand",
                  data.balances.reduce((sum, row) => sum + row.onHand, 0),
                  "blue",
                ],
                [
                  "Reserved",
                  data.balances.reduce((sum, row) => sum + row.reserved, 0),
                  "amber",
                ],
                [
                  "Available",
                  data.balances.reduce(
                    (sum, row) => sum + row.onHand - row.reserved,
                    0,
                  ),
                  "green",
                ],
              ].map(([label, value, tone]) => (
                <Stat key={label} $tone={tone}>
                  <strong>
                    {value}{" "}
                    <small style={{ display: "inline" }}>{part.unit}</small>
                  </strong>
                  <span>{m(label)}</span>
                </Stat>
              ))}
            </Stats>
            {manage && (
              <Panel>
                <h2>{m("Movement Type")}</h2>
                <Actions>
                  {["receipt", "reserve", "release", "issue", "return", "transfer", "adjustment"].map((type) => (
                    <Button key={type} as={Link} to={`/spare-parts/${id}/movements/${type}`}>
                      {m(operationLabels[type])}
                    </Button>
                  ))}
                </Actions>
              </Panel>
            )}
            <Tabs role="tablist">
              {[
                ["overview", "Overview"],
                ["stock", "Stock by Warehouse"],
                ["movements", "Movement History"],
                ["workOrders", "Linked Work Orders"],
                ["assets", "Compatible Assets"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => {
                    setTab(value);
                    setPage(1);
                  }}
                >
                  {m(label)}
                </button>
              ))}
            </Tabs>
            {tab === "overview" && (
              <Panel>
                <h2>{m("Spare Part Details")}</h2>
                {part.image && (
                  <PrivateImage
                    path={`/warehouse/parts/${id}/image`}
                    revision={part.updatedAt}
                    alt={part.name}
                    style={{ maxWidth: 400, marginBottom: 24 }}
                  />
                )}
                <Definition $columns={3}>
                  {[
                    ["Part Number", part.sku],
                    ["Manufacturer Part No.", part.manufacturerPartNumber],
                    ["Status", m(readable(part.status || "active"))],
                    ["Storage Location", part.storageLocation],
                    ["Compatible Asset Type", part.compatibleAssetType],
                    ["Unit Cost", part.unitCost ?? "—"],
                    ["Category", part.category],
                    ["Manufacturer", part.manufacturer],
                    ["Unit", part.unit],
                    ["Created", formatDate(part.createdAt)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{m(label)}</dt>
                      <dd>{value ?? "—"}</dd>
                    </div>
                  ))}
                </Definition>
                <p>{part.description}</p>
                {(data.documents || []).length > 0 && (
                  <>
                    <h3>{m("Part Documents")}</h3>
                    {data.documents.map((document) => (
                      <p key={document._id}>
                        <TextLink to={`/documents?document=${document._id}`}>
                          {document.title}
                        </TextLink>
                      </p>
                    ))}
                  </>
                )}
              </Panel>
            )}
            {tab === "stock" && (
              <Panel>
                <h2>{m("Stock by Warehouse")}</h2>
                <TableWrap>
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Warehouse",
                          "On Hand",
                          "Reserved",
                          "Available",
                          "Reorder Point",
                          "Status",
                          "Storage Locations",
                          "Last Stock Movement",
                          "Actions",
                        ].map((label) => (
                          <th key={label}>{m(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.balances.map((row) => (
                        <tr key={row._id}>
                          <td>{row.warehouse?.name}</td>
                          <td>{row.onHand}</td>
                          <td>{row.reserved}</td>
                          <td>{row.onHand - row.reserved}</td>
                          <td>{row.reorderPoint}</td>
                          <td>
                            <Badge
                              $status={
                                row.reorderPoint > 0 &&
                                row.onHand - row.reserved <= row.reorderPoint
                                  ? "high"
                                  : "current"
                              }
                            >
                              {m(
                                row.reorderPoint > 0 &&
                                  row.onHand - row.reserved <= row.reorderPoint
                                  ? "Low Stock"
                                  : "In Stock",
                              )}
                            </Badge>
                          </td>
                          <td><LocationBalances balance={row} /></td>
                          <td>{formatDate(row.lastBalanceMovementAt, true)}</td>
                          <td><Button onClick={() => { setMovementWarehouse(row.warehouse?._id || ""); setPage(1); setTab("movements"); }}>{m("Movement History")}</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </Panel>
            )}
            {tab === "movements" && (
              <Panel>
                <h2>{m("Movement History")}</h2>
                <WarehouseSelector warehouses={warehouses.data?.data || []} value={movementWarehouse} m={m}
                  onChange={(value) => { setMovementWarehouse(value); setPage(1); }} />
                <ResourceState
                  resource={movements}
                  empty={!movements.data?.data?.length}
                >
                  <MovementTable rows={movements.data?.data || []} onChanged={refresh} />
                  <Pagination
                    result={movements.data}
                    page={page}
                    onChange={setPage}
                  />
                </ResourceState>
              </Panel>
            )}
            {tab === "workOrders" && (
              <Panel>
                <h2>{m("Linked Work Orders & Reservations")}</h2>
                <TableWrap>
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Reference",
                          "Warehouse",
                          "Reserved",
                          "Issued",
                          "Released",
                          "Remaining",
                        ].map((label) => (
                          <th key={label}>{m(label)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.reservations.map((row) => (
                        <tr key={row._id}>
                          <td>
                            {row.task?.title ? (
                              <TextLink to={`/tasks/${row.task._id}`}>
                                {row.task.title}
                              </TextLink>
                            ) : (
                              row.reference || row._id.slice(-8)
                            )}
                          </td>
                          <td>{row.warehouse?.name}</td>
                          <td>{row.quantity}</td>
                          <td>{row.issued}</td>
                          <td>{row.released}</td>
                          <td>{row.quantity - row.issued - row.released}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </Panel>
            )}
            {tab === "assets" && (
              <Panel>
                <h2>{m("Compatible Assets")}</h2>
                <p>
                  {part.compatibleAssets.length} {m("linked assets")}
                </p>
                {(data.compatibleAssets || []).map((asset) => (
                  <p key={asset._id}>
                    <TextLink to={`/assets/${asset._id}`}>
                      {asset.displayName}
                    </TextLink>
                    <small style={{ display: "block" }}>
                      {asset.uniqueId} · {asset.type}
                    </small>
                    {manage && canManageMaintenance(user, "assets") && part.compatibleAssets.includes(asset._id) && (
                      <ActionMenu label={`${m("Actions")} ${asset.displayName}`} items={[
                        { label: m("Unlink"), onClick: () => setDialog({ type: "unlinkAsset", asset }) },
                      ]} />
                    )}
                  </p>
                ))}
                {canManageMaintenance(user, "assets") && (
                  <Button
                    onClick={async () => {
                      try {
                        const response = await api.get("/assets/dropdown");
                        setAssets(response.data.data || []);
                        setDialog({ type: "linkAsset" });
                      } catch (error) {
                        toast.error(maintenanceError(error));
                      }
                    }}
                  >
                    {m("Link Asset")}
                  </Button>
                )}
              </Panel>
            )}
          </>
        )}
      </ResourceState>
      {dialog?.type === "edit" && (
        <FormDialog
          title="Edit Spare Part"
          fields={partFields}
          initial={Object.fromEntries(
            partFields.map((field) => [field.name, part[field.name] || ""]),
          )}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(`/warehouse/parts/${id}`, values, "patch");
            refresh();
          }}
        />
      )}
      {dialog?.type === "savedRule" && <ReorderRuleDialog part={part} rule={dialog.rule} manage={manage}
        onClose={() => setDialog(null)} onSaved={refresh} />}
      {dialog?.type === "movementDetails" && (
        <StockEventDetails id={dialog.id} onClose={() => setDialog(null)} onSaved={refresh} />
      )}
      {dialog?.type === "unlinkAsset" && manage && canManageMaintenance(user, "assets") && (
        <FormDialog
          title="Unlink asset"
          fields={[]}
          submitLabel="Unlink"
          onClose={() => setDialog(null)}
          onSubmit={async () => {
            await service.save(`/warehouse/parts/${id}/asset-links/${dialog.asset._id}`, undefined, "delete");
            refresh();
          }}
        >
          <p><strong>{dialog.asset.displayName}</strong></p>
          <p>{m("Unlink this part from the asset? The inventory record and stock quantities will be retained.")}</p>
        </FormDialog>
      )}
      {dialog?.type === "linkAsset" && (
        <FormDialog
          title="Link Asset"
          fields={[
            {
              name: "asset",
              label: "Asset",
              required: true,
              options: optionsFrom(assets, "displayName"),
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/warehouse/parts/${id}/asset-links`,
              { asset: values.asset },
            );
            refresh();
          }}
        />
      )}
      {dialog && operationLabels[dialog.type] && part && (
        <OperationDialog
          type={dialog.type}
          part={part}
          warehouses={warehouses.data?.data || []}
          reservations={data.reservations}
          issues={issues.data?.data || []}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      )}
    </Page>
  );
}

OperationDialog.propTypes = {
  type: PropTypes.string.isRequired,
  part: PropTypes.object.isRequired,
  warehouses: PropTypes.array.isRequired,
  reservations: PropTypes.array,
  issues: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
MovementTable.propTypes = { rows: PropTypes.array.isRequired, onChanged: PropTypes.func };
