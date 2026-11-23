import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StockEventDetails } from "./Warehouse";
import {
  Actions, Button, FormDialog, Muted, Panel, ResourceState,
  canBrowseMaintenance, canManageMaintenance, useCopy, useMaintenanceAccess, useResource,
} from "./shared";

export default function WorkOrderParts({ task }) {
  const m = useCopy();
  const { user, browse, manage } = useMaintenanceAccess("warehouse");
  const navigate = useNavigate();
  const location = useLocation();
  const [choose, setChoose] = useState(false);
  const [detail, setDetail] = useState(null);
  const id = task._id || task.id;
  const plan = task.maintenancePlan?._id || task.maintenancePlan;
  const occurrence = task.maintenanceOccurrence?._id || task.maintenanceOccurrence;
  const fault = task.sourceFault;
  const workOrder = Boolean(task.maintenanceWorkOrder || plan || fault?._id);
  const canIssue = workOrder && manage && canManageMaintenance(user, "tasks") &&
    !["completed", "archived"].includes(task.status) && task.isActive !== false;
  const parts = useResource("/warehouse/parts", { limit: 100 }, choose && canIssue);
  const movements = useResource("/warehouse/movements", { task: id, type: "issue", limit: 100 }, workOrder && browse);
  if (!workOrder) return null;
  return (
    <Panel>
      {plan && canBrowseMaintenance(user, "maintenance_plans") && (
        <p>{m("Source")}: <Link to={`/maintenance-plans/${plan}`}>{m("Maintenance Plan")}</Link></p>
      )}
      {fault?._id && canBrowseMaintenance(user, "faults") && (
        <p>{m("Source")}: <Link to={`/fault-reports/${fault._id}`}>{fault.number} · {fault.title}</Link></p>
      )}
      {browse && (
        <>
          <Actions style={{ justifyContent: "space-between" }}>
            <h2>{m("Spare Parts")}</h2>
            {canIssue && (plan
              ? occurrence && canBrowseMaintenance(user, "maintenance_plans") && (
                <Button $primary as={Link} to={`/maintenance-plans/${plan}/tasks/${occurrence}`}>{m("Manage Required Parts")}</Button>
              )
              : <Button $primary onClick={() => setChoose(true)}>{m("Issue Stock")}</Button>
            )}
          </Actions>
          {location.state?.stockMovement && <p role="status">
            {m("Stock issue recorded")} · {location.state.stockMovement.quantity} {location.state.stockMovement.unit}
          </p>}
          <ResourceState resource={movements}>
            {movements.data?.data?.length ? (
              <ul>{movements.data.data.map((row) => (
                <li key={row._id}>
                  <Button onClick={() => setDetail(row._id)}>
                    {row.part?.sku} · {row.part?.name} · {row.quantity} {row.part?.unit}
                  </Button>
                </li>
              ))}</ul>
            ) : <Muted>{m("No stock issued for this work order")}</Muted>}
          </ResourceState>
        </>
      )}
      {choose && canIssue && !plan && (
        <FormDialog title="Issue Stock" fields={[{
          name: "part", label: "Spare Part", required: true, searchable: true,
          options: (parts.data?.data || []).map((row) => ({ value: row._id, label: `${row.sku} · ${row.name}` })),
        }]} onClose={() => setChoose(false)} onSubmit={async ({ part }) => {
          navigate(`/spare-parts/${part}/movements/issue?${new URLSearchParams({ workOrder: id })}`);
        }} submitLabel="Continue" />
      )}
      {detail && <StockEventDetails id={detail} onClose={() => setDetail(null)} onSaved={movements.reload} />}
    </Panel>
  );
}
