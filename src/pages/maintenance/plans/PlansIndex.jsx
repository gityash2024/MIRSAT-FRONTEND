import PropTypes from "prop-types";
import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  PauseCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import {
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
import {
  PlanPage,
  Section,
  Banner,
  Row,
  Columns,
  Stack,
  PlanHeader,
  MutedText,
  Value,
  LabelText,
  Track,
  PlanButton,
  PlanLink,
  FieldLabel,
  Pill,
  PlanTable,
  DayGrid,
  Day,
} from "./PlanUI";
import {
  root,
  assetName,
  localDate,
  usePlanDate,
  usePlanLabels,
} from "./planPresentation";

const TableActions = styled.details`
  summary {
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    cursor: pointer;
    border-radius: 8px;
    list-style: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  summary:hover,
  &[open] summary {
    background: var(--mp-soft);
  }
`;

const PauseContent = styled(PlanPage)`
  gap: 24px;
  [data-pause-effects] {
    background: var(--mp-soft);
    border-color: transparent;
  }
  [data-pause-effects] ul {
    margin: 0;
    padding-inline-start: 20px;
    line-height: 1.55;
  }
  [data-pause-effects] li + li {
    margin-block-start: 8px;
  }
  [data-pause-note] {
    padding: 16px;
    border-radius: 8px;
    background: var(--mp-day-count);
  }
`;

const PauseButton = styled(PlanButton)`
  min-inline-size: 168px;
  background: var(--mp-warning-action);
  border-color: var(--mp-warning-action);
`;

const Toolbar = styled(Section)`
  padding: 10px 16px;
  margin-top: 20px;
  min-height: 68px;
  [data-plan-search] {
    width: min(100%, 330px);
  }
  @media (max-width: 640px) {
    margin-top: 0;
  }
`;
const SummaryGrid = styled(Columns)`
  @media (min-width: 901px) {
    min-height: 280px;
  }
`;
const SummaryStack = styled(Stack)`
  grid-template-rows: 1.04fr 1fr;
`;
const StatCard = styled(Section)`
  padding: 20px;
  gap: 10px;
`;
const DayBadge = styled(Pill)`
  width: 100%;
  justify-content: center;
  background: ${(p) =>
    p.$tone === "red" ? "var(--mp-day-alert)" : "var(--mp-day-count)"};
  html[data-theme="dark"] & {
    background: var(--mp-surface);
  }
`;
const ScheduledCard = styled(Section)`
  padding: 16px 18px;
  gap: 10px;
  [data-service-schedule] {
    padding-top: 12px;
    border-top: 1px solid var(--mp-border);
  }
`;
const DAY = 86400000;
const baseFilters = { asset: "", frequency: "", status: "" };
const startOfWeek = (value) => {
  const date = new Date(localDate(value) + "T00:00:00Z");
  return new Date(+date - ((date.getUTCDay() + 6) % 7) * DAY);
};
export function PlanTableView({ plans, onPause, compact = false }) {
  const m = useCopy(),
    date = usePlanDate(),
    labels = usePlanLabels();
  return (
    <PlanTable>
      <table>
        <thead>
          <tr>
            {[
              "Plan",
              "Asset",
              "Procedure",
              "Frequency",
              "Next Service",
              "Status",
              "Actions",
            ].map((title) => (
              <th key={title}>{m(title)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const [status, tone] = labels.status(plan);
            return (
              <tr key={plan._id}>
                <td
                  style={{ borderInlineStart: `3px solid var(--mp-${tone})` }}
                >
                  <Link to={root + "/" + plan._id}>
                    <b>{plan.name}</b>
                  </Link>
                  <small>{plan.code}</small>
                </td>
                <td>
                  {assetName(plan.asset)}
                  <small>{plan.equipment?.name}</small>
                </td>
                <td>{plan.template?.name || "—"}</td>
                <td>{labels.frequency(plan)}</td>
                <td>
                  {plan.dueAt
                    ? date(plan.dueAt, plan.timezone)
                    : `${plan.preview.threshold} ${m("hours")}`}
                </td>
                <td>
                  <Pill $tone={tone}>{status}</Pill>
                </td>
                <td>
                  {compact ? (
                    <Link to={root + "/" + plan._id}>{m("Open plan")}</Link>
                  ) : (
                    <TableActions>
                      <summary aria-label={m("Actions")}>
                        <MoreHorizontal size={20} aria-hidden="true" />
                      </summary>
                      <Stack>
                        <Link to={root + "/" + plan._id}>{m("Open plan")}</Link>
                        <Link to={root + "/" + plan._id + "/edit"}>
                          {m("Edit Plan")}
                        </Link>
                        <PlanButton type="button" onClick={() => onPause(plan)}>
                          {m(
                            plan.status === "paused"
                              ? "Resume Plan"
                              : "Pause Plan",
                          )}
                        </PlanButton>
                      </Stack>
                    </TableActions>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PlanTable>
  );
}
export function PauseDialog({ plan, onClose, onChanged }) {
  const m = useCopy();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const pause = plan.status !== "paused";
  const title = m(
    pause ? "Pause this maintenance plan?" : "Resume Maintenance Plan",
  );
  const ConfirmButton = pause ? PauseButton : PlanButton;
  return (
    <Modal
      title={title}
      titleIcon={pause && <PauseCircle size={23} aria-hidden="true" />}
      width="640px"
      onClose={onClose}
      busy={busy}
    >
      <PauseContent>
        <MutedText>
          {plan.name} · {plan.code}
        </MutedText>
        {pause ? (
          <>
            <Section data-pause-effects>
              <h3>{m("While this plan is paused")}</h3>
              <ul>
                <li>{m("New automatic work orders will not be created.")}</li>
                <li>{m("Upcoming service dates remain visible.")}</li>
                <li>{m("Existing work orders keep their current status.")}</li>
              </ul>
            </Section>
            <p data-pause-note>
              {m("You can resume this plan at any time from the details page.")}
            </p>
          </>
        ) : (
          <p>
            {m("Resume automatic generation on this plan’s existing schedule.")}
          </p>
        )}
        {error && <p role="alert">{m(error)}</p>}
        <Row style={{ justifyContent: "flex-end" }}>
          <PlanButton type="button" disabled={busy} onClick={onClose}>
            {m("Cancel")}
          </PlanButton>
          <ConfirmButton
            type="button"
            $primary
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await maintenanceService.save(
                  `/plans/${plan._id}/status`,
                  { status: pause ? "paused" : "active" },
                  "patch",
                );
                onChanged();
              } catch (err) {
                setError(maintenanceError(err));
                setBusy(false);
              }
            }}
          >
            {m(busy ? "Saving…" : pause ? "Pause Plan" : "Resume Plan")}
          </ConfirmButton>
        </Row>
      </PauseContent>
    </Modal>
  );
}
function Summary({ summary }) {
  const m = useCopy(),
    date = usePlanDate();
  const plan = summary.next;
  const coverage = summary.assetTotal
    ? Math.round((100 * summary.covered) / summary.assetTotal)
    : 0;
  const days = plan?.dueAt
    ? Math.max(
        0,
        Math.ceil((+new Date(plan.dueAt) - +new Date(summary.now)) / DAY),
      )
    : null;
  return (
    <SummaryGrid $columns="minmax(0,1fr) minmax(0,1.07fr)">
      <Banner>
        <LabelText>{m("Next Maintenance")}</LabelText>
        {plan ? (
          <>
            <Row $between>
              <div>
                <h2>{plan.name}</h2>
                <p>
                  {assetName(plan.asset)} · {plan.equipment?.name}
                </p>
              </div>
              {days !== null && (
                <Stack>
                  <Value>{String(days).padStart(2, "0")}</Value>
                  <small>{m("days remaining")}</small>
                </Stack>
              )}
            </Row>
            <Columns>
              <div>
                <small>{m("Procedure")}</small>
                <p>{plan.template?.name || "—"}</p>
              </div>
              <div>
                <small>{m("Scheduled")}</small>
                <p>
                  {plan.dueAt
                    ? date(plan.dueAt, plan.timezone)
                    : `${plan.preview.threshold} ${m("hours")}`}
                </p>
              </div>
            </Columns>
            <Link to={root + "/" + plan._id}>{m("View plan details")} →</Link>
          </>
        ) : (
          <p>{m("No maintenance is scheduled")}</p>
        )}
      </Banner>
      <SummaryStack>
        <Columns $columns="repeat(3,minmax(0,1fr))" $gap="16px">
          {[
            [m("Active Plans"), summary.active, "text"],
            [m("Due This Month"), summary.dueThisMonth, "amber"],
            [m("Overdue"), summary.overdue, "red"],
          ].map(([label, value, tone]) => (
            <StatCard key={label}>
              <MutedText>
                <span style={{ color: `var(--mp-${tone})` }}>●</span> {label}
              </MutedText>
              <Value>{value}</Value>
            </StatCard>
          ))}
        </Columns>
        <Section>
          <Row $between>
            <h3>{m("Preventive maintenance coverage")}</h3>
            <strong>{coverage}%</strong>
          </Row>
          <Track
            max={100}
            value={coverage}
            aria-label={m("Preventive maintenance coverage")}
          />
          <MutedText>
            {summary.covered} / {summary.assetTotal}{" "}
            {m("registered assets have an active plan")}
          </MutedText>
        </Section>
      </SummaryStack>
    </SummaryGrid>
  );
}
function Schedule({ summary, week, selected, onSelect }) {
  const m = useCopy(),
    date = usePlanDate(),
    labels = usePlanLabels();
  const days = Array.from(
    { length: 7 },
    (_, offset) => new Date(+week + offset * DAY),
  );
  const getDay = (plan) => localDate(new Date(plan.dueAt), plan.timezone);
  const start = localDate(days[0], "UTC"),
    end = localDate(days[6], "UTC");
  const horizon =
    summary.horizon ||
    summary.rows.filter((plan) => getDay(plan) >= start && getDay(plan) <= end);
  const plans = selected
    ? horizon.filter((plan) => getDay(plan) === selected)
    : [
        ...summary.rows.filter(
          (plan) => getDay(plan) < start || getDay(plan) > end,
        ),
        ...horizon,
      ];
  const late = (plan) => +new Date(plan.dueAt) < +new Date(summary.now);
  const groups = [
    ["Needs Attention", "red", plans.filter(late)],
    [
      "This Week",
      "text",
      plans.filter(
        (plan) => !late(plan) && getDay(plan) >= start && getDay(plan) <= end,
      ),
    ],
    [
      "Upcoming",
      "green",
      plans.filter((plan) => !late(plan) && getDay(plan) > end),
    ],
  ];
  return (
    <>
      <Section>
        <div>
          <h2>{m("Maintenance Horizon")}</h2>
          <MutedText>
            {m("A weekly view of planned preventive activities.")}
          </MutedText>
        </div>
        <DayGrid>
          {days.map((day) => {
            const key = localDate(day, "UTC"),
              rows = horizon.filter((plan) => getDay(plan) === key);
            return (
              <Day
                type="button"
                key={key}
                $selected={selected === key}
                aria-pressed={selected === key}
                onClick={() => onSelect(selected === key ? "" : key)}
              >
                <LabelText>{date(day, "UTC", { weekday: "short" })}</LabelText>
                <strong>{date(day, "UTC", { day: "numeric" })}</strong>
                {rows.length > 0 && (
                  <DayBadge $tone={rows.some(late) ? "red" : "text"}>
                    {rows.length}{" "}
                    {m(
                      rows.some(late)
                        ? "overdue"
                        : rows.length === 1
                          ? "service"
                          : "services",
                    )}
                  </DayBadge>
                )}
              </Day>
            );
          })}
        </DayGrid>
      </Section>
      <div>
        <h2>{m("Plan Schedule")}</h2>
        <MutedText>
          {m("Plans grouped by their upcoming service window.")}
        </MutedText>
      </div>
      <Columns $columns="repeat(3,minmax(0,1fr))">
        {groups.map(([title, tone, rows]) => (
          <Section key={title} style={{ background: "var(--mp-soft)" }}>
            <Row $between>
              <h3>
                <span style={{ color: `var(--mp-${tone})` }}>●</span> {m(title)}
              </h3>
              <MutedText>
                {rows.length} {m("plans")}
              </MutedText>
            </Row>
            {rows.length ? (
              rows.slice(0, 1).map((plan) => (
                <ScheduledCard key={plan._id}>
                  <h3>{plan.name}</h3>
                  <MutedText>{assetName(plan.asset)}</MutedText>
                  <Columns data-service-schedule>
                    <div>
                      <LabelText>{m("Next Service")}</LabelText>
                      <p>{date(plan.dueAt, plan.timezone)}</p>
                    </div>
                    <div>
                      <LabelText>{m("Frequency")}</LabelText>
                      <p>{labels.frequency(plan)}</p>
                    </div>
                  </Columns>
                  <Row $between>
                    <span />
                    <Link to={root + "/" + plan._id}>{m("Open plan")} →</Link>
                  </Row>
                </ScheduledCard>
              ))
            ) : (
              <MutedText>{m("No scheduled services")}</MutedText>
            )}
            {rows.length > 1 && (
              <Link to={root + "?view=table"}>
                + {rows.length - 1} {m("more plans")} →
              </Link>
            )}
          </Section>
        ))}
      </Columns>
    </>
  );
}
export default function PlansIndex({ initialTable }) {
  const m = useCopy(),
    date = usePlanDate();
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const [selected, selectDay] = useState(""),
    [search, setSearch] = useState("");
  const [table, setTable] = useState(initialTable),
    [page, setPage] = useState(1);
  const [draft, setDraft] = useState(baseFilters),
    [filters, setFilters] = useState(baseFilters);
  const [dialog, setDialog] = useState(null);
  const summary = useResource("/plans/summary", {
    start: week.toISOString(),
    ...(table ? {} : { search }),
  });
  const rows = useResource(
    "/plans",
    {
      page,
      search,
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value),
      ),
    },
    table,
  );
  const options = useResource("/plans/options", {}, table);
  const changeWeek = (value) => {
    setWeek(value);
    selectDay("");
  };
  return (
    <PlanPage data-plan-screen>
      <PlanHeader $between>
        <div>
          <h1>{m("Maintenance Plans")}</h1>
          <p>
            {m(
              "Plan and monitor preventive maintenance before it becomes urgent.",
            )}
          </p>
        </div>
        <PlanLink $primary to={root + "/create"}>
          <Plus size={16} /> {m("Create Maintenance Plan")}
        </PlanLink>
      </PlanHeader>
      <ResourceState resource={summary}>
        {summary.data?.data && <Summary summary={summary.data.data} />}
      </ResourceState>
      <Toolbar
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <Row $between>
          <FieldLabel data-plan-search>
            <span className="mp-visually-hidden">
              {m("Search plans or assets")}
            </span>
            <input
              placeholder={m("Search plans or assets")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </FieldLabel>
          {table ? (
            <>
              <FieldLabel>
                {m("Asset")}
                <select
                  value={draft.asset}
                  onChange={(event) =>
                    setDraft({ ...draft, asset: event.target.value })
                  }
                >
                  <option value="">{m("All Assets")}</option>
                  {options.data?.data.assets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {assetName(asset)}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel>
                {m("Frequency")}
                <select
                  value={draft.frequency}
                  onChange={(event) =>
                    setDraft({ ...draft, frequency: event.target.value })
                  }
                >
                  <option value="">{m("All Frequencies")}</option>
                  {["Day", "Week", "Month", "Year"].map((unit) => (
                    <option key={unit} value={unit.toLowerCase()}>
                      {m(unit)}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel>
                {m("Status")}
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({ ...draft, status: event.target.value })
                  }
                >
                  <option value="">{m("All Statuses")}</option>
                  <option value="active">{m("Active")}</option>
                  <option value="paused">{m("Paused")}</option>
                </select>
              </FieldLabel>
              <Row>
                <PlanButton
                  type="button"
                  onClick={() => {
                    setDraft(baseFilters);
                    setFilters(baseFilters);
                    setSearch("");
                    setPage(1);
                  }}
                >
                  {m("Reset")}
                </PlanButton>
                <PlanButton $primary type="submit">
                  <Search size={15} />
                  {m("Apply Filters")}
                </PlanButton>
              </Row>
            </>
          ) : (
            <>
              <PlanButton
                type="button"
                onClick={() => changeWeek(startOfWeek(new Date()))}
              >
                {m("Today")}
              </PlanButton>
              <strong>
                {date(week, "UTC")} – {date(+week + 6 * DAY, "UTC")}
              </strong>
              <Row>
                <PlanButton
                  type="button"
                  aria-label={m("Previous week")}
                  onClick={() => changeWeek(new Date(+week - 7 * DAY))}
                >
                  <ChevronLeft size={16} />
                </PlanButton>
                <PlanButton
                  type="button"
                  aria-label={m("Next week")}
                  onClick={() => changeWeek(new Date(+week + 7 * DAY))}
                >
                  <ChevronRight size={16} />
                </PlanButton>
                <PlanButton
                  $primary
                  type="button"
                  onClick={() => setTable(true)}
                >
                  {m("All Plans")}
                </PlanButton>
              </Row>
            </>
          )}
        </Row>
      </Toolbar>
      {table ? (
        <Section>
          <Row $between>
            <div>
              <h2>{m("Maintenance Plan Library")}</h2>
              <MutedText>
                {m("Review maintenance plans and their upcoming services.")}
              </MutedText>
            </div>
            <PlanButton type="button" onClick={() => setTable(false)}>
              <CalendarDays size={16} />
              {m("Calendar View")}
            </PlanButton>
          </Row>
          <ResourceState
            resource={rows}
            empty={rows.data?.total === 0 && m("No maintenance plans found")}
          >
            {rows.data && (
              <>
                <PlanTableView plans={rows.data.data} onPause={setDialog} />
                <Pagination result={rows.data} page={page} onChange={setPage} />
              </>
            )}
          </ResourceState>
        </Section>
      ) : (
        summary.data?.data && (
          <Schedule
            summary={summary.data.data}
            week={week}
            selected={selected}
            onSelect={selectDay}
          />
        )
      )}
      {dialog && (
        <PauseDialog
          plan={dialog}
          onClose={() => setDialog(null)}
          onChanged={() => {
            setDialog(null);
            rows.reload();
            summary.reload();
          }}
        />
      )}
    </PlanPage>
  );
}

PlanTableView.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPause: PropTypes.func,
  compact: PropTypes.bool,
};

PauseDialog.propTypes = {
  plan: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
};

Summary.propTypes = {
  summary: PropTypes.object.isRequired,
};

Schedule.propTypes = {
  summary: PropTypes.object.isRequired,
  week: PropTypes.instanceOf(Date).isRequired,
  selected: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

PlansIndex.propTypes = {
  initialTable: PropTypes.bool,
};
