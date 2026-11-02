import StockEvidence from "./StockEvidence";
import { PrivateImage } from "./ProfileFields";
import { SelectInput } from "./DesignSelect";
import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useParams, useLocation } from "react-router-dom";
import { Plus, ArrowLeft, RefreshCw, Download } from "lucide-react";
import toast from "react-hot-toast";
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
  const partLookup = useResource(
    "/warehouse/parts",
    { limit: 100 },
    browse && dialog?.type === "choosePart",
  );
  const parts = useResource(
    "/warehouse/parts",
    { page, search: query, warehouse: warehouseFilter, stockStatus },
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
    { page },
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
            onClick={() =>
              service
                .download(
                  `/warehouse/export?resource=${tab === "movements" ? "movements" : "parts"}`,
                  "mirsat-inventory.csv",
                )
                .catch((error) => toast.error(maintenanceError(error)))
            }
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
          ["Total Parts", stats?.parts, "blue"],
          ["In Stock", stats?.inStock, "green"],
          ["Reserved Stock", stats?.reservedStock, "amber"],
          ["Out of Stock", stats?.outOfStock, "red"],
          ["Low Stock", stats?.lowStock, "amber"],
        ].map(([label, value, tone]) => (
          <Stat key={label} $tone={tone}>
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
              setPage(1);
            }}
          >
            {m("Reset Filters")}
          </Button>
        </FilterBar>
      )}
      {tab === "warehouses" && (
        <Panel>
          <Actions>
            {(warehouses.data?.data || []).map((warehouse) => (
              <Button
                key={warehouse._id}
                onClick={() => setDialog({ type: "warehouse", warehouse })}
              >
                {warehouse.name} · {warehouse.code}
              </Button>
            ))}
          </Actions>
        </Panel>
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
                      <td>
                        <Button
                          as={Link}
                          to={`/spare-parts/${balance.part?._id}`}
                        >
                          {m("Manage Stock")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          ) : tab === "movements" ? (
            <MovementTable rows={movements.data?.data || []} />
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
                        {row.status === "pending" &&
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
              required: true,
            },
          ]}
          onClose={() => setDialog(null)}
          onSubmit={async (values) => {
            await service.save(
              `/warehouse/adjustments/${dialog.adjustment._id}/decision`,
              values,
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
function MovementTable({ rows }) {
  const m = useCopy();
  return (
    <TableWrap>
      <table>
        <thead>
          <tr>
            {[
              "Date",
              "Movement",
              "Part",
              "Warehouse",
              "Destination",
              "Quantity",
              "Reference",
              "By",
              "Attachments",
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
              <td>{row.destination?.name || "—"}</td>
              <td>{row.quantity}</td>
              <td>
                {row.reference || "—"}
                <small>{row.notes}</small>
              </td>
              <td>{row.actor?.name || "—"}</td>
              <td>
                <StockEvidence id={row._id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}
export function SparePartDetail() {
  const { id } = useParams();
  const m = useCopy();
  const location = useLocation();
  const { browse, user } = useMaintenanceAccess("warehouse");
  const [tab, setTab] = useState("overview");
  const [dialog, setDialog] = useState(null);
  const [page, setPage] = useState(1);
  const resource = useResource(`/warehouse/parts/${id}`, {}, browse);
  const warehouses = useResource(
    "/warehouse/warehouses",
    { limit: 100 },
    browse,
  );
  const movements = useResource(
    "/warehouse/movements",
    { part: id, page },
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
      <Back to="/spare-parts">
        <ArrowLeft size={14} />
        {m("Back to Spare Parts")}
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
                <Button as={Link} to={`/spare-parts/${id}/edit`}>
                  {m("Edit Spare Part")}
                </Button>
                <Button
                  $primary
                  as={Link}
                  to={`/spare-parts/${id}/movements/receipt`}
                >
                  <Plus />
                  {m("Receive Stock")}
                </Button>
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
                <Button onClick={() => setDialog({ type: "reorder" })}>
                  {m("Review Reorder Rule")}
                </Button>
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
            <Panel>
              <Actions>
                {[
                  "reserve",
                  "issue",
                  "return",
                  "transfer",
                  "adjustment",
                  "release",
                  "reorder",
                ].map((type) => (
                  <Button
                    key={type}
                    {...(type === "reorder"
                      ? { onClick: () => setDialog({ type }) }
                      : {
                          as: Link,
                          to: `/spare-parts/${id}/movements/${type}`,
                        })}
                  >
                    {m(operationLabels[type])}
                  </Button>
                ))}
              </Actions>
            </Panel>
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
                <ResourceState
                  resource={movements}
                  empty={!movements.data?.data?.length}
                >
                  <MovementTable rows={movements.data?.data || []} />
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
              `/warehouse/parts/${id}`,
              {
                compatibleAssets: [
                  ...new Set([...part.compatibleAssets, values.asset]),
                ],
              },
              "patch",
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
MovementTable.propTypes = { rows: PropTypes.array.isRequired };
