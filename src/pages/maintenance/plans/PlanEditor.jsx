import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ErrorBox, ResourceState, useCopy, useResource } from "../shared";
import {
  maintenanceService,
  maintenanceError,
} from "../../../services/maintenance.service";
import {
  Banner,
  Columns,
  FieldLabel,
  LabelText,
  MutedText,
  PlanButton,
  PlanHeader,
  PlanLink,
  PlanPage,
  Row,
  Section,
  Stack,
} from "./PlanUI";
import {
  root,
  assetName,
  idOf,
  localDate,
  usePlanDate,
} from "./planPresentation";

const defaultValues = (asset) => ({
  name: "",
  description: "",
  asset,
  equipment: "",
  template: "",
  assignedTo: [],
  priority: "medium",
  trigger: "calendar",
  timezone: "Asia/Riyadh",
  leadDays: 0,
  dueAfterDays: 2,
  automatic: true,
  status: "active",
  calendar: { firstDate: localDate(), interval: 3, unit: "month" },
  meter: { interval: 500, firstThreshold: "" },
  requiredParts: [],
});
function editorValues(plan) {
  return {
    ...defaultValues(idOf(plan.asset)),
    name: plan.name,
    description: plan.description || "",
    equipment: idOf(plan.equipment),
    template: idOf(plan.template),
    assignedTo: plan.assignedTo.map(idOf),
    priority: plan.priority,
    trigger: plan.trigger,
    timezone: plan.timezone,
    automatic: plan.automatic,
    status: plan.status,
    leadDays: plan.leadDays,
    dueAfterDays: plan.dueAfterDays,
    ...(plan.calendar?.firstDate && { calendar: { ...plan.calendar } }),
    ...(plan.meter?.interval && {
      meter: {
        interval: plan.meter.interval,
        firstThreshold: plan.meter.firstThreshold,
      },
    }),
    requiredParts: plan.requiredParts.map((row) => ({
      part: idOf(row.part),
      quantity: row.quantity,
    })),
  };
}
function formPayload(values) {
  const { calendar, meter, ...fields } = values;
  return {
    ...fields,
    ...(fields.trigger !== "meter" && { calendar }),
    ...(fields.trigger !== "calendar" && { meter }),
  };
}
function usePreview(values, existing) {
  const [state, setState] = useState({ data: null, error: "" });
  const payload = formPayload(values);
  const config = JSON.stringify({
    trigger: payload.trigger,
    timezone: payload.timezone,
    calendar: payload.calendar,
    meter: payload.meter,
  });
  useEffect(() => {
    let active = true;
    const schedule = JSON.parse(config);
    if (
      (schedule.calendar &&
        (!schedule.calendar.firstDate || !schedule.calendar.interval)) ||
      (schedule.meter &&
        (!schedule.meter.interval || schedule.meter.firstThreshold === ""))
    ) {
      setState({ data: null, error: "" });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await maintenanceService.save(
          "/plans/preview",
          schedule,
        );
        if (!active) return;
        const sameSchedule =
          existing &&
          JSON.stringify({
            trigger: existing.trigger,
            timezone: existing.timezone,
            calendar:
              existing.trigger !== "meter" ? existing.calendar : undefined,
            meter:
              existing.trigger !== "calendar"
                ? {
                    interval: existing.meter.interval,
                    firstThreshold: existing.meter.firstThreshold,
                  }
                : undefined,
          }) === config;
        setState({
          config,
          data: sameSchedule ? existing.preview : data,
          error: "",
        });
      } catch (err) {
        if (active)
          setState({ config, data: null, error: maintenanceError(err) });
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [config, existing]);
  return state.config === config ? state : { data: null, error: "" };
}
const procedureChildren = [
  "pages",
  "sections",
  "subLevels",
  "sets",
  "questions",
];
export function ProcedureTree({ record }) {
  if (!record) return null;
  return (
    <ul>
      {procedureChildren.flatMap((key) =>
        (record[key] || []).map((row, index) => (
          <li key={key + "-" + (row._id || index)}>
            {row.name || row.text || row.title || "—"}
            {procedureChildren.some((child) => row[child]?.length) && (
              <ProcedureTree record={row} />
            )}
          </li>
        )),
      )}
    </ul>
  );
}

function Editor({ existing, assetId }) {
  const m = useCopy(),
    date = usePlanDate(),
    navigate = useNavigate();
  const [values, setValues] = useState(() =>
    existing ? editorValues(existing) : defaultValues(assetId),
  );
  const [review, setReview] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const options = useResource("/plans/options", {
    ...(values.asset && { asset: values.asset }),
    ...(values.template && { template: values.template }),
  });
  const data = options.data?.data || {};
  const preview = usePreview(values, existing);
  const change = (key, value) =>
    setValues((previous) => ({ ...previous, [key]: value }));
  const inputControl = (label, key, type = "text", extra = {}) => (
    <FieldLabel>
      {m(label)}
      <input
        type={type}
        value={values[key]}
        onChange={(event) =>
          change(
            key,
            type === "number" && event.target.value !== ""
              ? +event.target.value
              : event.target.value,
          )
        }
        {...extra}
      />
    </FieldLabel>
  );
  const choices = (label, key, items, onChange, required = true) => (
    <FieldLabel>
      {m(label)}
      <select
        required={required}
        value={values[key]}
        onChange={(event) =>
          (onChange || ((value) => change(key, value)))(event.target.value)
        }
      >
        <option value="" disabled={required}>
          {m("Select")}
        </option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
  const records = (rows, label = (row) => row.name) =>
    (rows || []).map((row) => ({ value: row._id, label: label(row) }));
  const enums = (pairs) =>
    pairs.map(([value, label]) => ({ value, label: m(label) }));
  const nested = (group, key, label, type, extra = {}) => (
    <FieldLabel>
      {m(label)}
      <input
        required
        type={type}
        value={values[group][key]}
        onChange={(event) =>
          change(group, {
            ...values[group],
            [key]:
              type === "number" && event.target.value !== ""
                ? +event.target.value
                : event.target.value,
          })
        }
        {...extra}
      />
    </FieldLabel>
  );
  const hasCalendar = values.trigger !== "meter",
    hasMeter = values.trigger !== "calendar";
  const selectedEquipment = data.equipment?.find(
    (row) => row._id === values.equipment,
  );
  const back = existing ? root + "/" + existing._id : root;
  const submit = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const { data: saved } = await maintenanceService.save(
        existing ? "/plans/" + existing._id : "/plans",
        formPayload({
          ...values,
          automatic: data.canSchedule !== false && values.automatic,
        }),
        existing ? "put" : "post",
      );
      navigate(root + "/" + saved._id);
    } catch (err) {
      setError(maintenanceError(err));
      setSaving(false);
    }
  };
  return (
    <PlanPage>
      <Row>
        <PlanLink to={back}>
          <ArrowLeft size={16} />
          {m("Maintenance Plans")}
        </PlanLink>
      </Row>
      <PlanHeader>
        <div>
          <h1>
            {m(existing ? "Edit Maintenance Plan" : "Create Maintenance Plan")}
          </h1>
          <p>
            {m(
              "Set up preventive services and automatically generate work orders from a procedure.",
            )}
          </p>
        </div>
      </PlanHeader>
      <Section>
        <Row $between data-plan-steps aria-label={m("Plan setup steps")}>
          {["Plan Details", "Schedule", "Review"].map((label, index) => (
            <strong
              key={label}
              aria-current={index === (review ? 2 : 0) ? "step" : undefined}
            >
              <span data-step-number>{index + 1}</span>
              {m(label)}
            </strong>
          ))}
        </Row>
      </Section>
      {options.error && <ErrorBox role="alert">{m(options.error)}</ErrorBox>}
      {error && <ErrorBox role="alert">{m(error)}</ErrorBox>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (review) void submit();
          else setReview(true);
        }}
      >
        <Columns $columns="minmax(0,1.8fr) minmax(0,1fr)" $align="start">
          <Stack>
            {review ? (
              <Section>
                <h2>{m("Review")}</h2>
                <h3>{values.name}</h3>
                <p>
                  {assetName(
                    data.assets?.find((item) => item._id === values.asset),
                  )}{" "}
                  · {selectedEquipment?.name}
                </p>
                <p>
                  {m("Procedure")}:{" "}
                  {
                    data.templates?.find((item) => item._id === values.template)
                      ?.name
                  }
                </p>
                <p>
                  {m("Assigned To")}:{" "}
                  {data.inspectors
                    ?.filter((item) => values.assignedTo.includes(item._id))
                    .map((item) => item.name)
                    .join(", ")}
                </p>
                <p>
                  {m("Time Zone")}: {values.timezone}
                </p>
                <ProcedureTree record={data.procedure} />
              </Section>
            ) : (
              <>
                <Section>
                  <h2>{m("Plan Details")}</h2>
                  <MutedText>
                    {m("Select the asset and preventive procedure.")}
                  </MutedText>
                  {inputControl("Plan Name", "name", "text", {
                    required: true,
                    maxLength: 200,
                  })}
                  <Columns $columns="repeat(3,minmax(0,1fr))">
                    {choices(
                      "Asset",
                      "asset",
                      records(data.assets, assetName),
                      (asset) =>
                        setValues({
                          ...values,
                          asset,
                          equipment: "",
                          template: "",
                        }),
                    )}
                    {choices("Equipment", "equipment", records(data.equipment))}
                    {choices(
                      "Preventive Procedure / SOP",
                      "template",
                      records(data.templates),
                    )}
                  </Columns>
                  <FieldLabel>
                    {m("Description")}
                    <textarea
                      value={values.description}
                      maxLength={5000}
                      onChange={(event) =>
                        change("description", event.target.value)
                      }
                    />
                  </FieldLabel>
                  {data.procedure && (
                    <details>
                      <summary>{m("Procedure Checklist")}</summary>
                      <ProcedureTree record={data.procedure} />
                    </details>
                  )}
                </Section>
                <Section>
                  <h2>{m("Automatic Schedule")}</h2>
                  <MutedText>
                    {m("Set when the plan begins and how often it repeats.")}
                  </MutedText>
                  <Columns>
                    {choices(
                      "Trigger Type",
                      "trigger",
                      enums([
                        ["calendar", "Calendar Schedule"],
                        ["meter", "Meter Reading"],
                        ["combined", "Calendar + Meter"],
                      ]),
                    )}
                    <FieldLabel>
                      {m("Time Zone")}
                      <input
                        value={values.timezone}
                        list="plan-timezones"
                        required
                        onChange={(event) =>
                          change("timezone", event.target.value)
                        }
                      />
                      <datalist id="plan-timezones">
                        {Array.from(
                          new Set([
                            "Asia/Riyadh",
                            "UTC",
                            ...(Intl.supportedValuesOf?.("timeZone") || []),
                          ]),
                        ).map((zone) => (
                          <option key={zone} value={zone} />
                        ))}
                      </datalist>
                    </FieldLabel>
                  </Columns>
                  {values.trigger === "combined" && (
                    <p>
                      {m(
                        "A work order is generated when either condition is reached first.",
                      )}
                    </p>
                  )}
                  <Columns
                    $columns={
                      values.trigger === "combined"
                        ? undefined
                        : "minmax(0,1fr)"
                    }
                  >
                    {hasCalendar && (
                      <Section as="fieldset">
                        <legend>{m("Calendar Schedule")}</legend>
                        {nested(
                          "calendar",
                          "firstDate",
                          "First Service Date",
                          "date",
                        )}
                        <Columns>
                          {nested(
                            "calendar",
                            "interval",
                            "Repeat Every",
                            "number",
                            { min: 1, max: 365, step: 1 },
                          )}
                          <FieldLabel>
                            {m("Frequency")}
                            <select
                              value={values.calendar.unit}
                              onChange={(event) =>
                                change("calendar", {
                                  ...values.calendar,
                                  unit: event.target.value,
                                })
                              }
                            >
                              {["Day", "Week", "Month", "Year"].map((unit) => (
                                <option key={unit} value={unit.toLowerCase()}>
                                  {m(unit)}
                                </option>
                              ))}
                            </select>
                          </FieldLabel>
                        </Columns>
                      </Section>
                    )}
                    {hasMeter && (
                      <Section as="fieldset">
                        <legend>{m("Operating Hours")}</legend>
                        <FieldLabel>
                          {m("Current Reading")}
                          <input
                            value={
                              selectedEquipment?.currentMeterReading ?? "—"
                            }
                            readOnly
                          />
                        </FieldLabel>
                        {nested(
                          "meter",
                          "firstThreshold",
                          "Initial Service Threshold",
                          "number",
                          { min: 0, max: 1e9, step: 0.0001 },
                        )}
                        {nested(
                          "meter",
                          "interval",
                          "Service Interval (hours)",
                          "number",
                          { min: 1, max: 1e9, step: 0.0001 },
                        )}
                      </Section>
                    )}
                  </Columns>
                  <Columns>
                    {choices(
                      "Status",
                      "status",
                      enums([
                        ["active", "Active"],
                        ["paused", "Paused"],
                      ]),
                    )}
                    <FieldLabel
                      style={{
                        display: "flex",
                        alignSelf: "end",
                        alignItems: "center",
                        minHeight: 44,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={values.automatic && data.canSchedule !== false}
                        disabled={data.canSchedule === false}
                        onChange={(event) =>
                          change("automatic", event.target.checked)
                        }
                      />{" "}
                      {m("Create work order automatically")}
                    </FieldLabel>
                  </Columns>
                  {data.canSchedule === false && (
                    <MutedText>
                      {m("Task access is required for automatic generation.")}
                    </MutedText>
                  )}
                </Section>
                {(data.parts?.length > 0 ||
                  values.requiredParts.length > 0) && (
                  <Section>
                    <Row $between>
                      <h2>{m("Required Parts")}</h2>
                      {data.parts?.length > 0 && (
                        <PlanButton
                          type="button"
                          onClick={() =>
                            change("requiredParts", [
                              ...values.requiredParts,
                              { part: "", quantity: 1 },
                            ])
                          }
                        >
                          <Plus size={14} />
                          {m("Add Part")}
                        </PlanButton>
                      )}
                    </Row>
                    {values.requiredParts.map((row, index) => (
                      <Row key={index}>
                        <FieldLabel>
                          {m("Part")}
                          <select
                            required
                            value={row.part}
                            onChange={(event) =>
                              change(
                                "requiredParts",
                                values.requiredParts.map((item, i) =>
                                  i === index
                                    ? { ...item, part: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          >
                            <option value="">{m("Select")}</option>
                            {data.parts?.map((part) => (
                              <option key={part._id} value={part._id}>
                                {part.name} · {part.sku}
                              </option>
                            ))}
                            {row.part &&
                              !data.parts?.some(
                                (part) => part._id === row.part,
                              ) && (
                                <option value={row.part}>
                                  {existing?.requiredParts.find(
                                    (item) => idOf(item.part) === row.part,
                                  )?.part?.name || row.part}
                                </option>
                              )}
                          </select>
                        </FieldLabel>
                        <FieldLabel>
                          {m("Quantity")}
                          <input
                            required
                            type="number"
                            min=".0001"
                            step=".0001"
                            value={row.quantity}
                            onChange={(event) =>
                              change(
                                "requiredParts",
                                values.requiredParts.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        quantity:
                                          event.target.value === ""
                                            ? ""
                                            : +event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                        </FieldLabel>
                        <PlanButton
                          type="button"
                          aria-label={m("Remove Part")}
                          onClick={() =>
                            change(
                              "requiredParts",
                              values.requiredParts.filter(
                                (_, i) => i !== index,
                              ),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </PlanButton>
                      </Row>
                    ))}
                  </Section>
                )}
              </>
            )}
          </Stack>
          <Stack>
            <Section>
              <h2>{m("Schedule Preview")}</h2>
              <Banner>
                <LabelText>{m("First Service")}</LabelText>
                {preview.data?.calendar[0] && (
                  <Row>
                    <CalendarDays size={20} />
                    <h2>{date(preview.data.calendar[0], values.timezone)}</h2>
                  </Row>
                )}
                {preview.data?.threshold != null && (
                  <Row>
                    <Clock3 size={20} />
                    <h3>
                      {preview.data.threshold} {m("hours")}
                    </h3>
                  </Row>
                )}
                {!preview.data && (
                  <p>{m("Complete the schedule to see a preview.")}</p>
                )}
              </Banner>
              {preview.error && <ErrorBox>{m(preview.error)}</ErrorBox>}
              {preview.data?.calendar.slice(1).map((value) => (
                <Row key={value}>
                  <CalendarDays size={16} />
                  {date(value, values.timezone)}
                </Row>
              ))}
            </Section>
            {!review && (
              <Section>
                <h2>{m("Work Order Settings")}</h2>
                {hasCalendar &&
                  inputControl(
                    "Generate Before Service (days)",
                    "leadDays",
                    "number",
                    { required: true, min: 0, max: 365, step: 1 },
                  )}
                {hasMeter &&
                  inputControl(
                    "Due After Trigger (days)",
                    "dueAfterDays",
                    "number",
                    { required: true, min: 0, max: 365, step: 1 },
                  )}
                {choices(
                  "Priority",
                  "priority",
                  enums([
                    ["low", "Low"],
                    ["medium", "Medium"],
                    ["high", "High"],
                  ]),
                )}
                <FieldLabel>
                  {m("Assigned To")}
                  <select
                    required
                    multiple
                    size={Math.max(
                      2,
                      Math.min(5, data.inspectors?.length || 0),
                    )}
                    value={values.assignedTo}
                    onChange={(event) =>
                      change(
                        "assignedTo",
                        Array.from(
                          event.target.selectedOptions,
                          (option) => option.value,
                        ),
                      )
                    }
                  >
                    {data.inspectors?.map((user) => (
                      <option value={user._id} key={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <MutedText>
                  {m(
                    "Work orders copy the selected procedure checklist at generation.",
                  )}
                </MutedText>
              </Section>
            )}
          </Stack>
        </Columns>
        <Row $between style={{ marginTop: 24 }}>
          {review ? (
            <PlanButton
              type="button"
              disabled={saving}
              onClick={() => setReview(false)}
            >
              {m("Back")}
            </PlanButton>
          ) : (
            <PlanLink to={back}>{m("Cancel")}</PlanLink>
          )}
          <PlanButton
            $primary
            type="submit"
            disabled={saving || options.loading || !preview.data}
          >
            <Check size={16} />
            {m(
              saving
                ? "Saving…"
                : !review
                  ? "Review"
                  : existing
                    ? "Save Changes"
                    : "Create Maintenance Plan",
            )}
          </PlanButton>
        </Row>
      </form>
    </PlanPage>
  );
}
export default function PlanEditor() {
  const { id } = useParams(),
    [query] = useSearchParams();
  const resource = useResource(id ? "/plans/" + id : null, {}, Boolean(id));
  return id ? (
    <ResourceState resource={resource}>
      {resource.data?.data && <Editor key={id} existing={resource.data.data} />}
    </ResourceState>
  ) : (
    <Editor assetId={query.get("asset") || ""} />
  );
}

ProcedureTree.propTypes = {
  record: PropTypes.object,
};

Editor.propTypes = {
  existing: PropTypes.object,
  assetId: PropTypes.string,
};
