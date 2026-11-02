import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { maintenanceService as service } from "../../services/maintenance.service";
import { useAuth } from "../../hooks/useAuth";
import { canBrowseMaintenance, useCopy, useResource } from "./shared";

export default function FaultNotices({ isOpen }) {
  const { user } = useAuth();
  const m = useCopy();
  const resource = useResource(
    "/fault-reports/notifications",
    { limit: 5 },
    isOpen && canBrowseMaintenance(user, "faults"),
  );
  const notices = resource.data?.data || [];
  if (!notices.length) return null;
  return (
    <section style={{ borderBottom: "1px solid #e6edf4", padding: 12 }}>
      <strong>{m("Fault notifications")}</strong>
      {notices.map((notice) => (
        <Link
          key={notice._id}
          to={`/fault-reports/${notice.fault}`}
          onClick={() => {
            if (!notice.readAt)
              service
                .save(
                  `/fault-reports/notifications/${notice._id}/read`,
                  {},
                  "patch",
                )
                .then(resource.reload)
                .catch(() => undefined);
          }}
          style={{
            display: "block",
            padding: "12px 4px",
            color: "inherit",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: notice.readAt ? 400 : 600,
          }}
        >
          {notice.title}
          <span
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.65,
              marginTop: 4,
            }}
          >
            {notice.message}
          </span>
        </Link>
      ))}
    </section>
  );
}
FaultNotices.propTypes = { isOpen: PropTypes.bool };
