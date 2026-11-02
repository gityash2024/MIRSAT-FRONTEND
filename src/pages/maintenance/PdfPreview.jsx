import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Actions, Button, ErrorBox, Label, useCopy } from "./shared";

GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfPreview({ blob, title }) {
  const m = useCopy();
  const canvas = useRef(null);
  const container = useRef(null);
  const [width, setWidth] = useState(800);
  const [document, setDocument] = useState(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let live = true;
    let loading;
    setDocument(null);
    setPage(1);
    setBusy(true);
    setError("");
    // The API has already authenticated and downloaded this file. Supplying
    // its bytes avoids a second request through the blob URL/XHR transport.
    blob.arrayBuffer()
      .then((buffer) => {
        if (!live) return undefined;
        loading = getDocument({
          data: new Uint8Array(buffer),
          isEvalSupported: false,
          useSystemFonts: true,
        });
        return loading.promise;
      })
      .then((pdf) => {
        if (live && pdf) setDocument(pdf);
      })
      .catch((err) => {
        if (live) {
          setError(err.message);
          setBusy(false);
        }
      });
    return () => {
      live = false;
      loading?.destroy();
    };
  }, [blob]);
  useEffect(() => {
    if (!document) return undefined;
    let live = true;
    let rendering;
    setBusy(true);
    setError("");
    (async () => {
      const pdfPage = await document.getPage(page);
      if (!live) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const requested = zoom || Math.max(0.1, (width - 24) / base.width);
      const scale = Math.min(
        requested,
        8192 / base.width,
        8192 / base.height,
        Math.sqrt(16000000 / (base.width * base.height)),
      );
      const viewport = pdfPage.getViewport({ scale });
      const target = canvas.current;
      target.width = Math.floor(viewport.width);
      target.height = Math.floor(viewport.height);
      rendering = pdfPage.render({
        canvasContext: target.getContext("2d"),
        viewport,
      });
      await rendering.promise;
      const content = await pdfPage.getTextContent();
      if (live) setText(content.items.map((item) => item.str || "").join(" "));
    })()
      .catch((err) => {
        if (live && err.name !== "RenderingCancelledException")
          setError(err.message);
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
      rendering?.cancel();
    };
  }, [document, page, zoom, width]);
  return (
    <div>
      <Actions style={{ marginBottom: 16 }}>
        <Button
          disabled={!document || page <= 1 || busy}
          onClick={() => setPage((old) => old - 1)}
        >
          {m("Previous page")}
        </Button>
        <span aria-live="polite">
          {page} / {document?.numPages || "—"}
        </span>
        <Button
          disabled={!document || page >= document.numPages || busy}
          onClick={() => setPage((old) => old + 1)}
        >
          {m("Next page")}
        </Button>
        <Label>
          {m("Zoom")}
          <select
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            <option value={0}>{m("Fit width")}</option>
            {[0.75, 1, 1.25, 1.5, 2].map((value) => (
              <option key={value} value={value}>
                {value * 100}%
              </option>
            ))}
          </select>
        </Label>
      </Actions>
      {busy && <p role="status">{m("Loading…")}</p>}
      {error && (
        <ErrorBox role="alert">
          {m("Unable to preview this PDF. Download the file to open it.")}{" "}
          {error}
        </ErrorBox>
      )}
      <div
        ref={container}
        style={{
          maxHeight: "60vh",
          overflow: "auto",
          background: "#eef1f5",
          padding: 12,
        }}
      >
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${title} · ${page}`}
          style={{
            display: "block",
            maxWidth: "none",
            height: "auto",
            margin: "auto",
            background: "white",
          }}
        />
      </div>
      {text && (
        <details style={{ marginTop: 12 }}>
          <summary>{m("Page text")}</summary>
          <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
        </details>
      )}
    </div>
  );
}
PdfPreview.propTypes = {
  blob: PropTypes.shape({ arrayBuffer: PropTypes.func.isRequired }).isRequired,
  title: PropTypes.string.isRequired,
};
