import { useState } from "react";
import PropTypes from "prop-types";
import { Download, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import {
  maintenanceService as service,
  maintenanceError,
} from "../../services/maintenance.service";
import {
  Button,
  Modal,
  Actions,
  Panel,
  Muted,
  ResourceState,
  Preview,
  useResource,
  useCopy,
} from "./shared";
export default function StockEvidence({ id, kind = "movements" }) {
  const m = useCopy();
  const [open, setOpen] = useState(false),
    [preview, setPreview] = useState(null);
  const resource = useResource(
    `/warehouse/${kind}/${id}/attachments`,
    {},
    open,
  );
  return (
    <>
      <Button
        type="button"
        aria-label={`${m("Attachments")} ${id.slice(-8)}`}
        onClick={() => setOpen(true)}
      >
        <Paperclip size={16} />
        {m("Attachments")}
      </Button>
      {open && (
        <Modal title={m("Attachments")} onClose={() => setOpen(false)}>
          <ResourceState
            resource={resource}
            empty={!resource.data?.data?.length}
          >
            {(resource.data?.data || []).map((entry) => (
              <Panel key={entry._id} style={{ padding: 16 }}>
                <strong>{entry.file.filename}</strong>
                <p>
                  <Muted>{(entry.file.size / 1024).toFixed(0)} KB</Muted>
                </p>
                <Actions>
                  {["application/pdf", "image/jpeg", "image/png"].includes(
                    entry.file.contentType,
                  ) && (
                    <Button
                      onClick={() =>
                        setPreview({
                          path: `/warehouse/${kind}/${id}/attachments/${entry._id}/file?preview=true`,
                          title: entry.file.filename,
                        })
                      }
                    >
                      {m("View")}
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      service
                        .download(
                          `/warehouse/${kind}/${id}/attachments/${entry._id}/file`,
                          entry.file.filename,
                        )
                        .catch((error) => toast.error(maintenanceError(error)))
                    }
                  >
                    <Download />
                    {m("Download")}
                  </Button>
                </Actions>
              </Panel>
            ))}
          </ResourceState>
        </Modal>
      )}
      {preview && <Preview {...preview} onClose={() => setPreview(null)} />}
    </>
  );
}
StockEvidence.propTypes = {
  id: PropTypes.string.isRequired,
  kind: PropTypes.oneOf(["movements", "adjustments"]),
};
