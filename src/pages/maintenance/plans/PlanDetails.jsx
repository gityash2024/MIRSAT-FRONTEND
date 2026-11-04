import PropTypes from "prop-types";
import styled from "styled-components";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock3, Package, Pause, Pencil, Play } from "lucide-react";
import {
  ErrorBox,
  Modal,
  Pagination,
  ResourceState,
  useCopy,
  useResource,
} from "../shared";
import {
  maintenanceError,
  maintenanceService,
} from "../../../services/maintenance.service";
import { PauseDialog } from "./PlansIndex";
import { ProcedureTree } from "./PlanEditor";
import {
  Banner,
  Columns,
  FieldLabel,
  LabelText,
  MutedText,
  Pill,
  PlanButton,
  PlanHeader,
  PlanLink,
  PlanPage,
  PlanTable,
  Row,
  Section,
  Stack,
  Track,
  Value,
} from "./PlanUI";
import {
  root,
  assetName,
  idOf,
  usePlanDate,
  usePlanLabels,
} from "./planPresentation";

const DetailsHeading = styled(PlanHeader)`
  margin: 0;
  [data-plan-state] {
    margin-top: 16px;
  }
  [data-plan-paused-note] {
    border-radius: 8px;
    padding: 6px 14px;
    background: var(--mp-amber-tint);
    color: var(--mp-amber);
  }
`;
const DetailsBanner = styled(Banner)`
  min-height: 228px;
  align-content: center;
  h2 {
    font-size: 36px;
    text-transform: uppercase;
  }
`;
const DetailBack = styled(PlanLink)`
  min-height: 26px;
  padding: 0;
  border: 0;
  background: transparent;
`;
const ProgressSummary = styled(Columns)`
  margin-block: 10px 4px;
  > div:last-child strong {
    color: var(--mp-amber);
  }
`;
const Timeline = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    position: relative;
    padding: 0 0 30px 23px;
  }
  [dir="rtl"] & li {
    padding: 0 23px 30px 0;
  }
  li::before {
    content: "";
    position: absolute;
    inset-inline-start: 4px;
    top: 7px;
    bottom: -7px;
    width: 1px;
    background: var(--mp-border);
  }
  li:last-child::before {
    display: none;
  }
  li::after {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 5px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--mp-border);
  }
  li:first-child::after {
    background: var(--mp-accent);
  }
`;
const OrderCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--mp-border);
  border-radius: 10px;
  padding: 13px 14px;
  background: var(--mp-soft);
`;
const taskLabel = (status) =>
  ({
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    incomplete: "Incomplete",
    partially_completed: "Partially Completed",
    archived: "Archived",
  })[status] || "Unavailable";
const planPath = (id) => `${root}/${id}`;

function Heading({ plan, onPause }) {
  const m = useCopy(),
    labels = usePlanLabels();
  const [status, tone] = labels.status(plan);
  return (
    <>
      <Row>
        <DetailBack to={root}>
          <ArrowLeft size={16} />
          {m("Back to Maintenance Plans")}
        </DetailBack>
      </Row>
      <DetailsHeading $between>
        <div>
          <h1>
            {plan.code} · {plan.name}
          </h1>
          <p>
            {plan.description ||
              m("Monitor the preventive schedule and generated work orders.")}
          </p>
          <Row data-plan-state>
            <Pill $tone={tone}>{status}</Pill>
            {plan.status === "paused" && (
              <span role="status" data-plan-paused-note>
                {m("Automatic work order generation is paused.")}
              </span>
            )}
          </Row>
        </div>
        {onPause && (
          <Row>
            <PlanLink to={planPath(plan._id) + "/edit"}>
              <Pencil size={16} />
              {m("Edit Plan")}
            </PlanLink>
            <PlanButton type="button" $primary onClick={onPause}>
              {plan.status === "paused" ? (
                <Play size={16} />
              ) : (
                <Pause size={16} />
              )}
              {m(plan.status === "paused" ? "Resume Plan" : "Pause Plan")}
            </PlanButton>
          </Row>
        )}
      </DetailsHeading>
    </>
  );
}
function ServiceBanner({ plan }) {
  const m = useCopy(),
    date = usePlanDate();
  return (
    <>
      {plan.lastError && <ErrorBox role="alert">{m(plan.lastError)}</ErrorBox>}
      <DetailsBanner>
        <Columns $columns="minmax(0,3fr) minmax(0,1fr)" $align="center">
          <Stack>
            <LabelText>
              {m("Next Automatic Service")}
              {plan.status === "paused" && ` · ${m("On Hold")}`}
            </LabelText>
            <h2>
              {plan.dueAt
                ? date(plan.dueAt, plan.timezone, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : `${plan.preview.threshold ?? "—"} ${m("hours")}`}
            </h2>
            <p>
              {assetName(plan.asset)} · {plan.equipment?.name} ·{" "}
              {plan.template?.name}
            </p>
            {plan.trigger === "combined" && (
              <small>{m("Calendar or meter, whichever comes first")}</small>
            )}
          </Stack>
          <Stack>
            <LabelText>{m("Work Order Automation")}</LabelText>
            <Pill
              $tone={
                plan.automatic && plan.status === "active" ? "green" : "amber"
              }
            >
              {m(
                plan.automatic && plan.status === "active"
                  ? "Enabled"
                  : "Disabled",
              )}
            </Pill>
            {plan.trigger !== "meter" && (
              <p>
                {m("Generate Before Service (days)")}: {plan.leadDays}
              </p>
            )}
            <p>
              {m("Assigned To")}:{" "}
              {plan.assignedTo.map((row) => row.name).join(", ")}
            </p>
          </Stack>
        </Columns>
      </DetailsBanner>
    </>
  );
}
function OccurrenceTable({ rows, plan, empty }) {
  const m = useCopy(),
    date = usePlanDate();
  if (!rows.length) return <MutedText>{empty}</MutedText>;
  return (
    <PlanTable>
      <table>
        <thead>
          <tr>
            {[
              "Work Order",
              "Generated On",
              "Service Due",
              "Assigned To",
              "Status",
              "Actions",
            ].map((label) => (
              <th key={label}>{m(label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td>{row.task?.title || m("Unavailable")}</td>
              <td>{date(row.createdAt, plan.timezone)}</td>
              <td>{date(row.dueAt, plan.timezone)}</td>
              <td>
                {row.task?.assignedTo?.map((user) => user.name).join(", ") ||
                  "—"}
              </td>
              <td>
                <Pill
                  $tone={row.task?.status === "completed" ? "green" : "text"}
                >
                  {m(taskLabel(row.task?.status))}
                </Pill>
              </td>
              <td>
                <Link to={planPath(plan._id) + "/tasks/" + row._id}>
                  {m("Open Work Order")} →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PlanTable>
  );
}
function Details({ plan, reload }) {
  const m = useCopy(),
    date = usePlanDate(),
    labels = usePlanLabels();
  const [pause, setPause] = useState(false);
  const procedure = useResource(
    "/plans/options",
    { asset: idOf(plan.asset), template: idOf(plan.template) },
    Boolean(plan.asset && plan.template),
  );
  const year = new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: plan.timezone,
  });
  const currentYear = year.format(new Date());
  const occurrences = (plan.occurrences || []).filter(
    (row) => year.format(new Date(row.dueAt)) === currentYear,
  );
  const completed = occurrences.filter((row) => row.completedAt).length;
  const remaining =
    occurrences.length - completed + (plan.projectedThisYear || 0);
  const percent =
    completed + remaining
      ? Math.round((100 * completed) / (completed + remaining))
      : 0;
  return (
    <PlanPage data-plan-screen>
      <Heading plan={plan} onPause={() => setPause(true)} />
      <ServiceBanner plan={plan} />
      <Columns>
        <Section>
          <h2>{m("Plan Overview")}</h2>
          <Columns>
            {[
              [m("Asset"), assetName(plan.asset)],
              [m("Equipment"), plan.equipment?.name],
              [m("Procedure"), plan.template?.name],
              [m("Frequency"), labels.frequency(plan)],
              [
                m("First Service Date"),
                plan.calendar?.firstDate
                  ? date(plan.calendar.firstDate, "UTC")
                  : `${plan.meter.firstThreshold} ${m("hours")}`,
              ],
              [m("Time Zone"), plan.timezone],
              [m("Status"), labels.status(plan)[0]],
              [
                m("Assigned To"),
                plan.assignedTo.map((row) => row.name).join(", "),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <MutedText>{label}</MutedText>
                <p>
                  <b>{value || "—"}</b>
                </p>
              </div>
            ))}
          </Columns>
        </Section>
        <Section>
          <h2>{m("Current Year Progress")}</h2>
          <ProgressSummary>
            <Row>
              <Value>{completed}</Value>
              <MutedText>{m("Services completed")}</MutedText>
            </Row>
            <Row>
              <Value>{remaining}</Value>
              <MutedText>{m("Services remaining")}</MutedText>
            </Row>
          </ProgressSummary>
          <Track
            style={{ "--mp-progress-fill": "var(--mp-accent)" }}
            value={percent}
            max={100}
            aria-label={m("Current Year Progress")}
          />
          <MutedText>
            {percent}% {m("Completed")}
          </MutedText>
          <div>
            <LabelText>{m("Plan health")}</LabelText>
            <Row>
              <Pill $tone={labels.status(plan)[1]}>
                {plan.status === "active" && labels.status(plan)[1] === "green"
                  ? m("On Track")
                  : labels.status(plan)[0]}
              </Pill>
            </Row>
          </div>
        </Section>
      </Columns>
      <Columns $columns="minmax(0,1.55fr) minmax(0,1fr)">
        <Section>
          <h2>{m("Upcoming Schedule")}</h2>
          <Timeline>
            {plan.preview.calendar.slice(0, 3).map((value, index) => (
              <li key={value}>
                <Row $between>
                  <b>{date(value, plan.timezone)}</b>
                  <span>
                    {m(index === 0 ? "Next service" : "Following service")}
                  </span>
                  <Pill $tone={plan.status === "paused" ? "amber" : "text"}>
                    {m(
                      plan.status === "paused"
                        ? "On Hold"
                        : index === 0
                          ? "Next"
                          : "Upcoming",
                    )}
                  </Pill>
                </Row>
              </li>
            ))}
          </Timeline>
          {plan.preview.threshold !== null && (
            <Row>
              <Clock3 size={18} />
              {plan.preview.threshold} {m("hours")}
            </Row>
          )}
        </Section>
        {plan.canOpenTasks && (
          <Section>
            <Row $between>
              <h2>{m("Generated Work Orders")}</h2>
            </Row>
            {plan.latest.length ? (
              plan.latest.map((row) => (
                <OrderCard
                  key={row._id}
                  to={planPath(plan._id) + "/tasks/" + row._id}
                >
                  <Row $between>
                    <div>
                      <b>{row.task?.title || m("Unavailable")}</b>
                      <p>{date(row.dueAt, plan.timezone)}</p>
                    </div>
                    <Pill
                      $tone={
                        ["completed", "archived"].includes(row.task?.status)
                          ? "green"
                          : "text"
                      }
                    >
                      {m(taskLabel(row.task?.status))}
                    </Pill>
                  </Row>
                </OrderCard>
              ))
            ) : (
              <MutedText>{m("No work orders generated yet")}</MutedText>
            )}
            <Link to={planPath(plan._id) + "/tasks"}>
              {m("View all linked work orders")} →
            </Link>
          </Section>
        )}
      </Columns>
      <Columns>
        <Section>
          <h2>{m("Procedure Checklist")}</h2>
          <ResourceState
            resource={procedure}
            empty={
              !procedure.data?.data.procedure && m("Procedure unavailable")
            }
          >
            <ProcedureTree record={procedure.data?.data.procedure} />
          </ResourceState>
        </Section>
        <Section>
          <h2>{m("Required Parts")}</h2>
          {plan.requiredParts.length ? (
            plan.requiredParts.map((row) => (
              <Row $between key={row._id}>
                <strong>{row.part?.name || m("Unavailable")}</strong>
                <MutedText>
                  {row.quantity} {row.part?.unit}
                </MutedText>
              </Row>
            ))
          ) : (
            <MutedText>{m("No parts required")}</MutedText>
          )}
        </Section>
      </Columns>
      {pause && (
        <PauseDialog
          plan={plan}
          onClose={() => setPause(false)}
          onChanged={() => {
            setPause(false);
            reload();
          }}
        />
      )}
    </PlanPage>
  );
}
function OrderList({ plan }) {
  const m = useCopy(),
    [page, setPage] = useState(1);
  const resource = useResource(`/plans/${plan._id}/tasks`, { page });
  return (
    <PlanPage>
      <Heading plan={plan} />
      <ServiceBanner plan={plan} />
      <Section>
        <Row $between>
          <h2>{m("Generated Work Orders")}</h2>
          <Link to={planPath(plan._id)}>{m("View plan details")} →</Link>
        </Row>
        <ResourceState resource={resource}>
          {resource.data && (
            <>
              <OccurrenceTable
                rows={resource.data.data}
                plan={plan}
                empty={m("No work orders generated yet")}
              />
              <Pagination
                result={resource.data}
                page={page}
                onChange={setPage}
              />
            </>
          )}
        </ResourceState>
      </Section>
    </PlanPage>
  );
}

function StockDialog({ action, order, path, onClose, onSaved }) {
  const m = useCopy(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [warehouse, setWarehouse] = useState(action.warehouse?._id || ""),
    [quantity, setQuantity] = useState("");
  const request = useRef({ signature: "", key: "" });
  const issue = action.type === "issue",
    part = issue ? action.part : action.row.part;
  const balances = order.balances.filter((row) => idOf(row.part) === part._id);
  const available = issue
    ? action.quantity - action.issued - action.released
    : (balances.find((row) => row.warehouse._id === warehouse)?.onHand || 0) -
      (balances.find((row) => row.warehouse._id === warehouse)?.reserved || 0);
  const max =
    Math.round(
      Math.min(available, issue ? available : action.remaining) * 10000,
    ) / 10000;
  const title = m(issue ? "Issue Parts" : "Reserve Parts");
  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <PlanPage>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setBusy(true);
            setError("");
            const body = {
              type: action.type,
              quantity: +quantity,
              warehouse,
              part: part._id,
              ...(issue && { reservation: action._id }),
            };
            const signature = JSON.stringify(body);
            if (request.current.signature !== signature)
              request.current = { signature, key: crypto.randomUUID() };
            try {
              await maintenanceService.save(path + "/stock", {
                ...body,
                idempotencyKey: request.current.key,
              });
              onSaved();
            } catch (err) {
              setError(maintenanceError(err));
              setBusy(false);
            }
          }}
        >
          <Stack>
            <p>
              {part.name} · {order.task.title}
            </p>
            <FieldLabel>
              {m("Warehouse")}
              <select
                required
                disabled={issue}
                value={warehouse}
                onChange={(event) => setWarehouse(event.target.value)}
              >
                <option value="">{m("Select Warehouse")}</option>
                {issue ? (
                  <option value={warehouse}>{action.warehouse.name}</option>
                ) : (
                  balances.map((row) => (
                    <option value={row.warehouse._id} key={row.warehouse._id}>
                      {row.warehouse.name}
                    </option>
                  ))
                )}
              </select>
            </FieldLabel>
            <FieldLabel>
              {m("Quantity")}
              <input
                required
                type="number"
                min=".0001"
                max={Math.max(0, max)}
                step=".0001"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </FieldLabel>
            <MutedText>
              {m("Available")}: {available}
            </MutedText>
            {error && <ErrorBox role="alert">{m(error)}</ErrorBox>}
            <Row $between>
              <PlanButton type="button" disabled={busy} onClick={onClose}>
                {m("Cancel")}
              </PlanButton>
              <PlanButton
                type="submit"
                $primary
                disabled={busy || max <= 0 || !warehouse}
              >
                {m(
                  busy
                    ? "Saving…"
                    : issue
                      ? "Confirm Issue"
                      : "Confirm Reservation",
                )}
              </PlanButton>
            </Row>
          </Stack>
        </form>
      </PlanPage>
    </Modal>
  );
}
function WorkOrder({ plan, order, reload, path }) {
  const m = useCopy(),
    date = usePlanDate();
  const [action, setAction] = useState(null);
  const task = order.task;
  const canChangeStock =
    order.canStock &&
    task?.isActive &&
    !["completed", "archived"].includes(task.status);
  return (
    <PlanPage>
      <Row>
        <PlanLink to={planPath(plan._id) + "/tasks"}>
          <ArrowLeft size={16} />
          {m("Generated Work Orders")}
        </PlanLink>
      </Row>
      <PlanHeader $between>
        <div>
          <MutedText>
            {plan.code} · {m("Preventive Work Order")}
          </MutedText>
          <h1>{task?.title || m("Unavailable")}</h1>
          <p>
            {m("Generated from maintenance plan")} · {plan.name}
          </p>
        </div>
        {task && (
          <PlanLink $primary to={`/tasks/${task._id}`}>
            {m("Open Inspection Task")} →
          </PlanLink>
        )}
      </PlanHeader>
      <Banner>
        <Row $between>
          <div>
            <LabelText>{m("Service Due")}</LabelText>
            <h2>{date(order.dueAt, plan.timezone)}</h2>
          </div>
          <div>
            <LabelText>{m("Trigger Type")}</LabelText>
            <p>
              {m(
                order.triggeredBy === "meter"
                  ? "Meter Reading"
                  : "Calendar Schedule",
              )}
              {order.threshold != null && ` · ${order.threshold} ${m("hours")}`}
            </p>
          </div>
        </Row>
      </Banner>
      <Columns>
        <Section>
          <h2>{m("Work Order Details")}</h2>
          <Pill>{m(taskLabel(task?.status))}</Pill>
          <p>
            {m("Assigned To")}:{" "}
            {task?.assignedTo?.map((user) => user.name).join(", ") || "—"}
          </p>
          <p>
            {m("Priority")}:{" "}
            {task
              ? m({ low: "Low", medium: "Medium", high: "High" }[task.priority])
              : "—"}
          </p>
          <p>
            {m("Generated On")}: {date(order.createdAt, plan.timezone)}
          </p>
        </Section>
        <Section>
          <h2>{m("Inspection Progress")}</h2>
          <Value>{task?.overallProgress || 0}%</Value>
          <Track
            value={task?.overallProgress || 0}
            max={100}
            aria-label={m("Inspection Progress")}
          />
        </Section>
      </Columns>
      <Section>
        <h2>{m("Procedure Checklist")}</h2>
        {order.procedure ? (
          <ProcedureTree record={order.procedure} />
        ) : (
          <MutedText>{m("Procedure unavailable")}</MutedText>
        )}
      </Section>
      <Section>
        <Row>
          <Package size={20} />
          <h2>{m("Required Parts")}</h2>
        </Row>
        {order.requiredParts.length === 0 && (
          <MutedText>{m("No parts required")}</MutedText>
        )}
        {order.requiredParts.map((row) => {
          const stock = order.reservations.filter(
            (item) => idOf(item.part) === row.part?._id,
          );
          const remaining = Math.max(
            0,
            Math.round(
              (row.quantity -
                stock.reduce(
                  (sum, item) => sum + item.quantity - item.released,
                  0,
                )) *
                10000,
            ) / 10000,
          );
          return (
            <Section key={row._id}>
              <Row $between>
                <div>
                  <h3>{row.part?.name || m("Unavailable")}</h3>
                  <MutedText>
                    {row.part?.sku} · {row.quantity} {row.part?.unit}
                  </MutedText>
                </div>
                {order.canStock &&
                  (remaining > 0 ? (
                    canChangeStock &&
                    row.part && (
                      <PlanButton
                        type="button"
                        onClick={() =>
                          setAction({ type: "reserve", row, remaining })
                        }
                      >
                        {m("Reserve Parts")}
                      </PlanButton>
                    )
                  ) : (
                    <Pill $tone="green">
                      {m(
                        stock.every(
                          (item) =>
                            item.quantity === item.issued + item.released,
                        )
                          ? "Parts Issued"
                          : "Parts Reserved",
                      )}
                    </Pill>
                  ))}
              </Row>
              {stock.map((item) => (
                <Row $between key={item._id}>
                  <span>
                    {item.warehouse?.name} · {m("Reserved")}:{" "}
                    {Math.round(
                      (item.quantity - item.issued - item.released) * 10000,
                    ) / 10000}{" "}
                    · {m("Issued")}: {item.issued}
                  </span>
                  {canChangeStock &&
                    item.warehouse &&
                    item.quantity > item.issued + item.released && (
                      <PlanButton
                        type="button"
                        onClick={() => setAction({ ...item, type: "issue" })}
                      >
                        {m("Issue Parts")}
                      </PlanButton>
                    )}
                </Row>
              ))}
            </Section>
          );
        })}
      </Section>
      {action && (
        <StockDialog
          action={action}
          order={order}
          path={path}
          onClose={() => setAction(null)}
          onSaved={() => {
            setAction(null);
            reload();
          }}
        />
      )}
    </PlanPage>
  );
}
export default function PlanDetails({ mode }) {
  const { id, occurrenceId } = useParams();
  const resource = useResource("/plans/" + id);
  const path = `/plans/${id}/tasks/${occurrenceId}`;
  const order = useResource(path, {}, Boolean(occurrenceId));
  return (
    <ResourceState resource={resource}>
      {resource.data?.data &&
        (mode === "order" ? (
          <ResourceState resource={order}>
            {order.data?.data && (
              <WorkOrder
                plan={resource.data.data}
                order={order.data.data}
                path={path}
                reload={order.reload}
              />
            )}
          </ResourceState>
        ) : mode === "orders" ? (
          <OrderList plan={resource.data.data} />
        ) : (
          <Details plan={resource.data.data} reload={resource.reload} />
        ))}
    </ResourceState>
  );
}

Heading.propTypes = {
  plan: PropTypes.object.isRequired,
  onPause: PropTypes.func,
};

ServiceBanner.propTypes = {
  plan: PropTypes.object.isRequired,
};

OccurrenceTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  plan: PropTypes.object.isRequired,
  empty: PropTypes.string,
};

Details.propTypes = {
  plan: PropTypes.object.isRequired,
  reload: PropTypes.func.isRequired,
};

OrderList.propTypes = {
  plan: PropTypes.object.isRequired,
};

StockDialog.propTypes = {
  action: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

WorkOrder.propTypes = {
  plan: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired,
  reload: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
};

PlanDetails.propTypes = {
  mode: PropTypes.oneOf(["orders", "order"]),
};
