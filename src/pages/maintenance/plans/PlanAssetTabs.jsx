import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { Clock3, Download, Plus } from "lucide-react";
import {
  ErrorBox,
  Modal,
  Pagination,
  ResourceState,
  useCopy,
  useMaintenanceAccess,
  useResource,
} from "../shared";
import {
  asFormData,
  maintenanceError,
  maintenanceService,
} from "../../../services/maintenance.service";
import { PlanTableView } from "./PlansIndex";
import {
  Columns,
  FieldLabel,
  MutedText,
  Pill,
  PlanButton,
  PlanLink,
  PlanPage,
  PlanTable,
  Row,
  Section,
  Stack,
  Track,
  Value,
} from "./PlanUI";
import { root, usePlanDate } from "./planPresentation";

export function AssetPlans({ assetId }) {
  const m = useCopy();
  const [page, setPage] = useState(1);
  const resource = useResource("/plans", { asset: assetId, page });
  return (
    <PlanPage>
      <Section>
        <Row $between>
          <h2>{m("Maintenance Plans")}</h2>
          <PlanLink
            $primary
            to={root + "/create?" + new URLSearchParams({ asset: assetId })}
          >
            <Plus size={16} />
            {m("Create Maintenance Plan")}
          </PlanLink>
        </Row>
        <ResourceState resource={resource}>
          {resource.data?.total ? (
            <>
              <PlanTableView compact plans={resource.data.data} />
              <Pagination
                result={resource.data}
                page={page}
                onChange={setPage}
              />
            </>
          ) : (
            <MutedText>{m("No maintenance plans found")}</MutedText>
          )}
        </ResourceState>
      </Section>
    </PlanPage>
  );
}
const localDateTime = () => {
  const now = new Date();
  return new Date(+now - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
function ReadingDialog({ equipment, latest, actor, path, onClose, onSaved }) {
  const m = useCopy(),
    date = usePlanDate();
  const [reading, setReading] = useState(""),
    [time, setTime] = useState(localDateTime),
    [notes, setNotes] = useState("");
  const [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const submission = useRef({ key: "", signature: "", file: null });
  return (
    <Modal title={m("Record New Reading")} onClose={onClose} busy={busy}>
      <PlanPage>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setError("");
            if (file?.size > 10485760) {
              setError(m("Select a PNG, JPEG or PDF file up to 10 MB"));
              return;
            }
            const enteredAt = new Date(time);
            const latestAt = latest?.recordedAt && new Date(latest.recordedAt);
            // A datetime-local control rounds to minutes. Preserve a same-minute timestamp.
            const recordedAt =
              latestAt && +enteredAt === Math.floor(+latestAt / 60000) * 60000
                ? latestAt
                : enteredAt;
            const values = {
              value: reading,
              recordedAt: recordedAt.toISOString(),
              notes,
            };
            const signature = JSON.stringify(values);
            if (
              submission.current.signature !== signature ||
              submission.current.file !== file
            )
              submission.current = {
                signature,
                file,
                key: crypto.randomUUID(),
              };
            setBusy(true);
            try {
              await maintenanceService.save(
                path,
                asFormData({
                  ...values,
                  file,
                  idempotencyKey: submission.current.key,
                }),
              );
              onSaved();
            } catch (err) {
              setError(maintenanceError(err));
              setBusy(false);
            }
          }}
        >
          <Stack>
            <h3>{equipment.name}</h3>
            <Columns>
              <FieldLabel>
                {m("Meter Type")}
                <input value={m("Operating Hours")} readOnly />
              </FieldLabel>
              <FieldLabel>
                {m("Previous Reading")}
                <input value={latest?.value ?? "—"} readOnly />
                {latest && (
                  <MutedText>
                    {date(latest.recordedAt, "Asia/Riyadh", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </MutedText>
                )}
              </FieldLabel>
            </Columns>
            <Columns>
              <FieldLabel>
                {m("New Reading")}
                <input
                  required
                  type="number"
                  step=".0001"
                  min={latest?.value ?? 0}
                  max={1e9}
                  value={reading}
                  onChange={(event) => setReading(event.target.value)}
                />
              </FieldLabel>
              <FieldLabel>
                {m("Date and Time")}
                <input
                  required
                  type="datetime-local"
                  max={localDateTime()}
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                />
              </FieldLabel>
            </Columns>
            <Columns>
              <FieldLabel>
                {m("Source")}
                <input readOnly value={m("Manual Entry")} />
              </FieldLabel>
              <FieldLabel>
                {m("Recorded By")}
                <input readOnly value={actor.name || ""} />
              </FieldLabel>
            </Columns>
            <FieldLabel>
              {m("Notes")}
              <textarea
                value={notes}
                maxLength={5000}
                onChange={(event) => setNotes(event.target.value)}
              />
            </FieldLabel>
            <FieldLabel>
              {m("Attachment (optional)")}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) => setFile(event.target.files[0] || null)}
              />
              <MutedText>{m("PNG, JPEG or PDF up to 10 MB")}</MutedText>
            </FieldLabel>
            {error && <ErrorBox role="alert">{m(error)}</ErrorBox>}
            <Row $between>
              <PlanButton type="button" disabled={busy} onClick={onClose}>
                {m("Cancel")}
              </PlanButton>
              <PlanButton type="submit" $primary disabled={busy}>
                {m(busy ? "Saving…" : "Save Reading")}
              </PlanButton>
            </Row>
          </Stack>
        </form>
      </PlanPage>
    </Modal>
  );
}
function ReadingHistory({ data, path, date }) {
  const m = useCopy(),
    [error, setError] = useState("");
  return (
    <>
      {error && <ErrorBox role="alert">{m(error)}</ErrorBox>}
      <PlanTable>
        <table>
          <thead>
            <tr>
              {[
                "Date and Time",
                "Reading",
                "Change",
                "Recorded By",
                "Source",
                "Notes",
                "Attachment",
              ].map((label) => (
                <th key={label}>{m(label)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((reading) => (
              <tr key={reading._id}>
                <td>
                  {date(reading.recordedAt, "Asia/Riyadh", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td>
                  {reading.value} {m("hours")}
                </td>
                <td>
                  {reading.previousValue == null
                    ? "—"
                    : Math.round(
                        (reading.value - reading.previousValue) * 10000,
                      ) / 10000}
                </td>
                <td>{reading.recordedBy?.name || "—"}</td>
                <td>{m("Manual Entry")}</td>
                <td>{reading.notes || "—"}</td>
                <td>
                  {reading.attachment ? (
                    <PlanButton
                      type="button"
                      onClick={async () => {
                        setError("");
                        try {
                          await maintenanceService.download(
                            `${path}/${reading._id}/attachment`,
                            reading.attachment.filename,
                          );
                        } catch (err) {
                          setError(maintenanceError(err));
                        }
                      }}
                    >
                      <Download size={15} />
                      {reading.attachment.filename}
                    </PlanButton>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PlanTable>
    </>
  );
}
export function MeterReadings({ equipment, assetId, assetLabel, canRecord }) {
  const m = useCopy(),
    date = usePlanDate();
  const { user } = useMaintenanceAccess("maintenance_plans");
  const [page, setPage] = useState(1),
    [dialog, setDialog] = useState(false);
  const path = `/asset-profiles/${assetId}/equipment/${equipment._id}/readings`;
  const resource = useResource(path, { page });
  const data = resource.data;
  const current = data?.latest?.value;
  const next = data?.plans
    .filter((plan) => plan.status === "active")
    .sort((a, b) => a.preview.threshold - b.preview.threshold)[0];
  const target = next?.preview.threshold;
  const remaining =
    target == null || current == null
      ? null
      : Math.max(0, Math.round((target - current) * 10000) / 10000);
  return (
    <PlanPage>
      <Row $between>
        <div>
          <h2>{m("Meter Readings")}</h2>
          <MutedText>
            {m("Operating Hours")} · {equipment.name}
          </MutedText>
        </div>
        {canRecord && (
          <PlanButton
            type="button"
            $primary
            onClick={() => setDialog(true)}
            disabled={!data}
          >
            <Plus size={16} />
            {m("Record New Reading")}
          </PlanButton>
        )}
      </Row>
      <ResourceState resource={resource}>
        {data && (
          <>
            <Columns $columns="repeat(4,minmax(0,1fr))">
              <Section>
                <MutedText>{m("Current Reading")}</MutedText>
                <Value>{current ?? "—"}</Value>
                <MutedText>{m("hours")}</MutedText>
              </Section>
              <Section>
                <MutedText>{m("Next Service")}</MutedText>
                <Value>{target ?? "—"}</Value>
                <MutedText>{m("hours")}</MutedText>
              </Section>
              <Section>
                <MutedText>{m("Remaining")}</MutedText>
                <Value>{remaining ?? "—"}</Value>
                <MutedText>{m("hours")}</MutedText>
              </Section>
              <Section>
                <MutedText>{m("Meter Status")}</MutedText>
                <Pill $tone={remaining === 0 ? "amber" : "green"}>
                  {m(
                    current == null
                      ? "No readings"
                      : remaining === 0
                        ? "Threshold reached"
                        : "Active",
                  )}
                </Pill>
              </Section>
            </Columns>
            <Columns>
              <Section>
                <Row>
                  <Clock3 size={18} />
                  <h2>{m("Meter Trigger Progress")}</h2>
                </Row>
                {next && (
                  <Track
                    max={target || 1}
                    value={
                      target === 0 && current != null
                        ? 1
                        : Math.min(current || 0, target)
                    }
                    aria-label={m("Meter Trigger Progress")}
                  />
                )}
                {data.plans.map((plan) => (
                  <Row $between key={plan._id}>
                    <PlanLink to={root + "/" + plan._id}>{plan.name}</PlanLink>
                    <Pill>
                      {m(plan.status === "paused" ? "Paused" : "Active")}
                    </Pill>
                  </Row>
                ))}
                {!data.plans.length && (
                  <MutedText>{m("No meter-based maintenance plans")}</MutedText>
                )}
              </Section>
              <Section>
                <h2>{m("Latest Reading")}</h2>
                {data.latest ? (
                  <>
                    <p>
                      <b>
                        {current} {m("hours")}
                      </b>{" "}
                      ·{" "}
                      {date(data.latest.recordedAt, "Asia/Riyadh", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p>
                      {m("Recorded By")}: {data.latest.recordedBy?.name || "—"}
                    </p>
                  </>
                ) : (
                  <MutedText>{m("No readings")}</MutedText>
                )}
                <p>
                  {m("Asset")}: {assetLabel}
                </p>
              </Section>
            </Columns>
            <Section>
              <h2>{m("Reading History")}</h2>
              {data.data.length ? (
                <ReadingHistory data={data.data} path={path} date={date} />
              ) : (
                <MutedText>{m("No readings")}</MutedText>
              )}
              <Pagination result={data} page={page} onChange={setPage} />
            </Section>
          </>
        )}
      </ResourceState>
      {dialog && (
        <ReadingDialog
          equipment={equipment}
          latest={data?.latest}
          actor={user}
          path={path}
          onClose={() => setDialog(false)}
          onSaved={() => {
            setDialog(false);
            setPage(1);
            resource.reload();
          }}
        />
      )}
    </PlanPage>
  );
}

AssetPlans.propTypes = {
  assetId: PropTypes.string.isRequired,
};

ReadingDialog.propTypes = {
  equipment: PropTypes.object.isRequired,
  latest: PropTypes.object,
  actor: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

ReadingHistory.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  path: PropTypes.string.isRequired,
  date: PropTypes.func.isRequired,
};

MeterReadings.propTypes = {
  equipment: PropTypes.object.isRequired,
  assetId: PropTypes.string.isRequired,
  assetLabel: PropTypes.string,
  canRecord: PropTypes.bool,
};
