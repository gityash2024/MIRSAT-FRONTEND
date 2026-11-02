import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Documents, { UploadDocument } from "./Documents";
import FaultReports, { CreateFaultReport, FaultDetail, FaultWorkOrder } from "./FaultReports";
import WarehousePage from "./Warehouse";
import AssetProfile from "./AssetProfile";
import PartEditor from "./PartEditor";
import StockMovement from "./StockMovement";
import { Field } from "./shared";
import AssetRegister, { CreateAsset } from "./AssetRegister";
import { assetService } from "../../services/asset.service";
import {
  FormDialog,
  Preview,
  Modal,
  useCopy,
  formatDate,
  canBrowseMaintenance,
  canManageMaintenance,
} from "./shared";
import { maintenanceService as service } from "../../services/maintenance.service";
import { downloadDocumentRegister } from "../../services/documentRegister";

vi.mock("../../services/documentRegister", () => ({ downloadDocumentRegister: vi.fn() }));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      _id: "admin-id",
      name: "Local Admin",
      role: "admin",
      permissions: [],
    },
  }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => options?.defaultValue || key,
    i18n: { language: "en", getFixedT: () => (key, options) => options?.defaultValue || key },
  }),
}));
vi.mock("../../services/maintenance.service", () => ({
  maintenanceService: {
    get: vi.fn(),
    getExisting: vi.fn(),
    save: vi.fn(),
    download: vi.fn(),
    preview: vi.fn(),
  },
  maintenanceError: (error) => error.message,
  asFormData: (values) => {
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });
    return form;
  },
}));
vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => [],
}));
vi.mock("../../services/asset.service", () => ({
  assetService: { createAsset: vi.fn(), updateAsset: vi.fn() },
}));
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
Element.prototype.scrollIntoView ||= function () {};
const assetId = "123456789012345678901234";
const doc = {
  _id: "234567890123456789012345",
  title: "Engine manual",
  category: "Manuals",
  controlled: true,
  versions: [
    {
      _id: "version1",
      number: 1,
      label: "v1.0",
      file: {
        filename: "manual.pdf",
        contentType: "application/pdf",
        size: 42,
      },
    },
  ],
  asset: { displayName: "Local Vessel" },
  createdBy: { name: "Local Admin" },
};
const fixtures = {
  "/documents": { success: true, data: [doc], total: 1, totalPages: 1 },
  "/documents/summary": {
    data: {
      total: 1,
      expiring: 0,
      actionRequired: 0,
      readiness: 100,
      categories: [{ _id: "Manuals", count: 1 }],
    },
  },
  "/documents/lookups": {
    data: {
      assets: [{ _id: assetId, displayName: "Local Vessel" }],
      equipment: [],
      users: [{ _id: "admin-id", name: "Local Admin" }],
    },
  },
  "/fault-reports": {
    data: [
      {
        _id: "fault-id",
        number: "FR-001",
        title: "Oil leak",
        asset: { displayName: "Local Vessel" },
        reportedBy: { name: "Local Inspector" },
        faultType: "Mechanical",
        severity: "high",
        priority: "high",
        status: "open",
      },
    ],
    total: 1,
    totalPages: 1,
  },
  "/fault-reports/summary": {
    data: {
      statuses: [{ _id: "open", count: 1 }],
      severities: [{ _id: "high", count: 1 }],
      attention: [],
    },
  },
  "/fault-reports/lookups": {
    data: {
      assets: [
        {
          _id: assetId,
          displayName: "Local Vessel",
          location: "Engine room",
          city: "Marina",
        },
      ],
      users: [],
    },
  },
  "/warehouse/parts": {
    data: [
      {
        _id: "part-id",
        sku: "SP-001",
        name: "Oil Filter",
        category: "Engine Parts",
        unit: "pcs",
        onHand: 10,
        reserved: 2,
        available: 8,
      },
    ],
    total: 1,
    totalPages: 1,
  },
  "/warehouse/warehouses": {
    data: [{ _id: "warehouse-id", name: "Main Warehouse" }],
    total: 1,
    totalPages: 1,
  },
  "/warehouse/summary": {
    data: {
      parts: 1,
      warehouses: 1,
      inStock: 1,
      reservedStock: 1,
      lowStock: 0,
      outOfStock: 0,
    },
  },
  [`/asset-profiles/${assetId}`]: {
    data: {
      asset: {
        _id: assetId,
        displayName: "Local Vessel",
        uniqueId: "LOCAL-001",
        type: "Vessel",
        location: "Marina",
      },
      profile: { records: [], history: [], lifecycleStatus: "active" },
      equipment: [],
      documents: [],
      faults: [],
      tasks: [],
      parts: [],
    },
  },
};
const mount = (component, path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/assets/:id" element={component} />
        <Route path="/fault-reports/:id/work-order" element={component} />
        <Route path="/fault-reports/:id" element={component} />
        <Route path="*" element={component} />
      </Routes>
    </MemoryRouter>,
  );
afterEach(() => {
  cleanup();
  localStorage.removeItem("selectedTimezone");
  vi.clearAllMocks();
});
const setup = () => {
  service.get.mockImplementation(
    async (path) => fixtures[path] || { data: [] },
  );
  service.getExisting.mockImplementation(async (path) =>
    path === "/asset-types"
      ? { data: [{ _id: "type-id", name: "Vessel" }] }
      : path === "/assets"
        ? {
            data: [
              {
                _id: assetId,
                displayName: "Local Vessel",
                uniqueId: "LOCAL-001",
                type: "Vessel",
                city: "Marina",
                location: "Dock",
              },
            ],
            total: 1,
            totalPages: 1,
          }
        : { data: [] },
  );
};

describe("maintenance access boundaries", () => {
  it("requires explicit manager grants and limits field roles to documents/faults", () => {
    const manager = { role: "manager", permissions: [] };
    expect(canManageMaintenance(manager, "warehouse")).toBe(false);
    expect(
      canManageMaintenance(
        { ...manager, permissions: ["access_warehouse"] },
        "warehouse",
      ),
    ).toBe(true);
    for (const role of ["inspector", "supervisor"]) {
      expect(canBrowseMaintenance({ role }, "faults")).toBe(true);
      expect(canBrowseMaintenance({ role }, "documents")).toBe(true);
      expect(canManageMaintenance({ role }, "faults")).toBe(false);
      expect(canBrowseMaintenance({ role }, "warehouse")).toBe(false);
    }
    expect(canBrowseMaintenance({ role: "user" }, "documents")).toBe(false);
    expect(canManageMaintenance({ role: "superadmin" }, "warehouse")).toBe(
      true,
    );
  });
});
it("document export sends only explicitly selected records", async () => {
  setup();
  service.download.mockResolvedValue(undefined);
  mount(<Documents />);
  await screen.findByRole("button", { name: "Engine manual" });
  fireEvent.click(screen.getByRole("button", { name: "Export" }));
  expect(
    screen.getByRole("button", { name: "Download selected file" }),
  ).toBeDisabled();
  expect(service.download).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select Engine manual" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download selected file" }),
  );
  await waitFor(() =>
    expect(service.download).toHaveBeenCalledWith(
      "/documents/export",
      "mirsat-documents.zip",
      { ids: [doc._id] },
    ),
  );
});
it("upload cancellation does not create a document or upload a file", async () => {
  setup();
  mount(<UploadDocument />);
  await screen.findByText("1. Upload File", { selector: "h2" });
  fireEvent.click(screen.getByRole("link", { name: "Cancel" }));
  expect(service.save).not.toHaveBeenCalled();
});
it("fault creation reveals the required Other fields", async () => {
  setup();
  mount(<CreateFaultReport />);
  await screen.findByText("Fault Information");
  fireEvent.click(screen.getByRole("button", { name: "Fault Type *" }));
  fireEvent.click(
    await screen.findByRole("option", { name: "Other", exact: true }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Location *" }));
  fireEvent.click(
    await screen.findByRole("option", { name: "Other", exact: true }),
  );
  expect(screen.getByLabelText("Specify fault type *")).toBeRequired();
  expect(screen.getByLabelText("Specify location *")).toBeRequired();
});
it("fault attachment retry does not create a duplicate report", async () => {
  setup();
  let attempts = 0;
  service.save.mockImplementation(async (path) => {
    if (path === "/fault-reports") return { data: { _id: "saved-fault" } };
    if (path.endsWith("/attachments")) {
      if (++attempts === 1) throw new Error("Upload interrupted");
      return { success: true };
    }
    return { success: true };
  });
  mount(<CreateFaultReport />);
  await screen.findByText("Fault Information");
  const upload = new File(["%PDF-1.7\n%%EOF"], "evidence.pdf", {
    type: "application/pdf",
  });
  fireEvent.change(screen.getByLabelText("Upload file"), {
    target: { files: [upload] },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Submit Fault Report" }).closest("form"),
  );
  await screen.findByText("Upload interrupted");
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Retry attachment upload" })
      .closest("form"),
  );
  await waitFor(() =>
    expect(
      service.save.mock.calls.filter(([path]) => path === "/fault-reports"),
    ).toHaveLength(1),
  );
  await waitFor(() => expect(attempts).toBe(2));
});
it("fault and inventory lists render live summaries and navigation", async () => {
  setup();
  const view = mount(<FaultReports />);
  await screen.findByText("Oil leak");
  expect(screen.getByRole("link", { name: "FR-001" })).toHaveAttribute(
    "href",
    "/fault-reports/fault-id",
  );
  view.unmount();
  mount(<WarehousePage />);
  await screen.findByRole("link", { name: "Oil Filter" });
  expect(screen.getByText("Available", { selector: "th" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Oil Filter" })).toHaveAttribute(
    "href",
    "/spare-parts/part-id",
  );
});
it("legacy assets accept additive profile records without changing the core asset endpoint", async () => {
  setup();
  service.save.mockResolvedValue({ success: true });
  mount(<AssetProfile />, `/assets/${assetId}`);
  fireEvent.click(
    await screen.findByRole("button", { name: "Edit Profile & Records" }),
  );
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Add Record" }));
  fireEvent.change(within(dialog).getByLabelText("Record Name *"), {
    target: { value: "Registration" },
  });
  fireEvent.change(within(dialog).getByLabelText("Record Value *"), {
    target: { value: "LOCAL-REG-1" },
  });
  fireEvent.submit(
    within(dialog).getByRole("button", { name: "Save Asset" }).closest("form"),
  );
  await waitFor(() =>
    expect(service.save).toHaveBeenCalledWith(
      `/asset-profiles/${assetId}`,
      expect.objectContaining({
        records: [
          { name: "Registration", value: "LOCAL-REG-1", dataType: "text" },
        ],
      }),
      "put",
    ),
  );
  expect(
    service.save.mock.calls.some(([path]) => path.startsWith("/assets/")),
  ).toBe(false);
});
it("dialog errors retain user input so an operation can be retried", async () => {
  const submit = vi
    .fn()
    .mockRejectedValueOnce(new Error("Conflict, please retry"))
    .mockResolvedValueOnce(undefined);
  const close = vi.fn();
  render(
    <FormDialog
      title="Reserve Stock"
      fields={[
        { name: "quantity", label: "Quantity", type: "number", required: true },
      ]}
      onSubmit={submit}
      onClose={close}
    />,
  );
  fireEvent.change(screen.getByLabelText("Quantity *"), {
    target: { value: "3" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Save" }).closest("form"),
  );
  await screen.findByRole("alert");
  expect(screen.getByLabelText("Quantity *")).toHaveValue(3);
  expect(close).not.toHaveBeenCalled();
  fireEvent.submit(
    screen.getByRole("button", { name: "Save" }).closest("form"),
  );
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenLastCalledWith({ quantity: 3 });
});

it("the asset register keeps profile, edit, task, type-management and export entry points", async () => {
  setup();
  mount(<AssetRegister />);
  await screen.findByRole("heading", { name: "Local Vessel" });
  expect(screen.getByRole("link", { name: "View Profile" })).toHaveAttribute(
    "href",
    `/assets/${assetId}`,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "More actions Local Vessel" }),
  );
  expect(
    screen.getByRole("button", { name: "Edit Asset" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "View Tasks" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Manage Asset Types" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export" })).toHaveAttribute(
    "data-agent-action",
    "assets.export.open",
  );
});
it("retrying a failed new-asset profile save does not create a duplicate core asset", async () => {
  setup();
  assetService.createAsset.mockResolvedValue({ data: { _id: assetId } });
  service.save
    .mockRejectedValueOnce(new Error("Profile interrupted"))
    .mockResolvedValueOnce({ success: true });
  mount(<CreateAsset />);
  await screen.findByText("Additional Records");
  fireEvent.submit(
    screen.getByRole("button", { name: "Save Asset" }).closest("form"),
  );
  await screen.findByText("Profile interrupted");
  fireEvent.submit(
    screen.getByRole("button", { name: "Save Asset" }).closest("form"),
  );
  await waitFor(() => expect(service.save).toHaveBeenCalledTimes(2));
  expect(assetService.createAsset).toHaveBeenCalledTimes(1);
});

it("authenticated image previews display locally and release their object URL", async () => {
  const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  service.preview.mockResolvedValue({
    url: "blob:local-review",
    type: "image/png",
  });
  const preview = render(
    <MemoryRouter>
      <Preview
        path="/documents/example/versions/1/file?preview=true"
        title="Engine photo"
        onClose={() => {}}
      />
    </MemoryRouter>,
  );
  const image = await screen.findByRole("img", { name: "Engine photo" });
  expect(image.getAttribute("src")).toBe("blob:local-review");
  expect(service.preview).toHaveBeenCalledWith(
    "/documents/example/versions/1/file?preview=true",
  );
  preview.unmount();
  expect(revoke).toHaveBeenCalledWith("blob:local-review");
  revoke.mockRestore();
});

it("Escape closes only the topmost nested dialog", () => {
  const outerClose = vi.fn();
  const innerClose = vi.fn();
  render(
    <>
      <Modal title="Document details" onClose={outerClose}>
        <button>View file</button>
      </Modal>
      <Modal title="File preview" onClose={innerClose}>
        <button>Page controls</button>
      </Modal>
    </>,
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(innerClose).toHaveBeenCalledTimes(1);
  expect(outerClose).not.toHaveBeenCalled();
});

it("required design dropdowns validate and Escape closes the dropdown before the dialog", async () => {
  const close = vi.fn();
  render(
    <Modal title="Dropdown review" onClose={close}>
      <form>
        <Field
          field={{
            name: "category",
            label: "Category",
            required: true,
            options: ["Manuals", "Certificates"],
          }}
          value=""
          onChange={() => {}}
        />
      </form>
    </Modal>,
  );
  const button = screen.getByRole("button", { name: "Category *" });
  expect(button.closest("form").checkValidity()).toBe(false);
  expect(button).toHaveFocus();
  fireEvent.click(button);
  const list = await screen.findByRole("listbox");
  fireEvent.keyDown(list, { key: "Escape" });
  await waitFor(() =>
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
  );
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledTimes(1);
});
it("new part retry keeps the part ID and opening receipt key after an interrupted image upload", async () => {
  setup();
  let images = 0;
  service.save.mockImplementation(async (path) => {
    if (path === "/warehouse/parts") return { data: { _id: "new-part" } };
    if (path.endsWith("/image") && ++images === 1)
      throw new Error("Image interrupted");
    return { data: { _id: "receipt-id" } };
  });
  const createUrl = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:part-photo");
  const revokeUrl = vi
    .spyOn(URL, "revokeObjectURL")
    .mockImplementation(() => {});
  mount(<PartEditor />);
  await screen.findByText("Initial Stock & Storage");
  fireEvent.change(screen.getByLabelText("Initial Quantity *"), {
    target: { value: "5" },
  });
  fireEvent.change(screen.getByLabelText("Upload image"), {
    target: { files: [new File(["test"], "part.png", { type: "image/png" })] },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Add Spare Part", exact: true })
      .closest("form"),
  );
  await screen.findByText("Image interrupted");
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Add Spare Part", exact: true })
      .closest("form"),
  );
  await waitFor(() => expect(images).toBe(2));
  expect(
    service.save.mock.calls.filter(([path]) => path === "/warehouse/parts"),
  ).toHaveLength(1);
  const receipts = service.save.mock.calls.filter(
    ([path]) => path === "/warehouse/movements",
  );
  expect(receipts).toHaveLength(2);
  expect(receipts[0][1].idempotencyKey).toBe(receipts[1][1].idempotencyKey);
  expect(receipts[0][1].part).toBe("new-part");
  createUrl.mockRestore();
  revokeUrl.mockRestore();
});
it("movement attachment retry never submits the stock operation twice", async () => {
  setup();
  const warehouse = { _id: "warehouse-id", name: "Main Warehouse" };
  service.get.mockImplementation(async (path) =>
    path === "/warehouse/parts/part-id"
      ? {
          data: {
            part: {
              _id: "part-id",
              name: "Oil Filter",
              sku: "SP-1",
              unit: "pcs",
              defaultWarehouse: warehouse._id,
            },
            balances: [{ warehouse, onHand: 10, reserved: 0, reorderPoint: 2 }],
            reservations: [],
          },
        }
      : fixtures[path] || { data: [] },
  );
  let uploads = 0;
  service.save.mockImplementation(async (path) => {
    if (path === "/warehouse/movements")
      return {
        data: { _id: "saved-movement", result: { onHand: 12, reserved: 0 } },
      };
    if (path.endsWith("/attachments") && ++uploads === 1)
      throw new Error("Evidence interrupted");
    return { success: true };
  });
  render(
    <MemoryRouter initialEntries={["/spare-parts/part-id/movements/receipt"]}>
      <Routes>
        <Route
          path="/spare-parts/:id/movements/:operation"
          element={<StockMovement />}
        />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(await screen.findByLabelText("Quantity Received *"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("Upload file"), {
    target: {
      files: [new File(["pdf"], "receipt.pdf", { type: "application/pdf" })],
    },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Confirm", exact: true })
      .closest("form"),
  );
  await screen.findByText("Evidence interrupted");
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Retry attachment upload" })
      .closest("form"),
  );
  await screen.findByText("Goods receipt recorded");
  expect(
    service.save.mock.calls.filter(([path]) => path === "/warehouse/movements"),
  ).toHaveLength(1);
  expect(uploads).toBe(2);
});

it("editing a legacy asset keeps optional profile fields empty and reuses the core update contract", async () => {
  setup();
  assetService.updateAsset.mockResolvedValue({ success: true });
  service.save.mockResolvedValue({ success: true });
  mount(<CreateAsset initial={fixtures[`/asset-profiles/${assetId}`].data} />);
  await screen.findByText("Identification Details");
  expect(screen.getByLabelText("Serial Number")).not.toBeRequired();
  fireEvent.submit(
    screen
      .getByRole("button", { name: "Save Changes", exact: true })
      .closest("form"),
  );
  await waitFor(() =>
    expect(assetService.updateAsset).toHaveBeenCalledWith(
      assetId,
      expect.objectContaining({
        uniqueId: "LOCAL-001",
        displayName: "Local Vessel",
      }),
    ),
  );
  expect(assetService.createAsset).not.toHaveBeenCalled();
});
it("dialog focus remains trapped when the focused content is replaced", () => {
  const view = render(
    <Modal title="Focus review" onClose={() => {}}>
      <button>Open history</button>
    </Modal>,
  );
  screen.getByRole("button", { name: "Open history" }).focus();
  view.rerender(
    <Modal title="History" onClose={() => {}}>
      <p>History loaded</p>
    </Modal>,
  );
  fireEvent.keyDown(document, { key: "Tab" });
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
});

it("maintenance timestamps follow the header timezone while date-only values keep their calendar day", () => {
  function DateReview() {
    useCopy();
    return (
      <output>
        {formatDate("2026-10-31T17:30:00Z", true)} / {formatDate("2026-10-31")}
      </output>
    );
  }
  localStorage.setItem("selectedTimezone", "Asia/Riyadh");
  render(<DateReview />);
  expect(screen.getByRole("status").textContent).toContain("Oct 31, 2026");
  act(() => {
    localStorage.setItem("selectedTimezone", "Asia/Tokyo");
    window.dispatchEvent(new Event("mirsat:timezone-change"));
  });
  const text = screen.getByRole("status").textContent;
  expect(text).toContain("Nov 01, 2026");
  expect(text.split(" / ")[1]).toBe("Oct 31, 2026");
});

it('exports a branded register for selected documents while keeping original downloads available', async () => {
  setup();
  downloadDocumentRegister.mockResolvedValue(undefined);
  mount(<Documents />);
  await screen.findByRole('button', { name: 'Engine manual' });
  fireEvent.click(screen.getByRole('button', { name: 'Export', exact: true }));
  expect(screen.getByRole('button', { name: 'Export register · PDF' })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Engine manual' }));
  fireEvent.click(screen.getByRole('button', { name: 'Export register · PDF' }));
  await waitFor(() => expect(downloadDocumentRegister).toHaveBeenCalledWith([doc._id], {
    language: 'en', translate: expect.any(Function),
  }));
  await screen.findByRole('button', { name: 'Export register · PDF' });
  expect(screen.getByRole('button', { name: 'Download selected file' })).toBeEnabled();
  expect(service.download).not.toHaveBeenCalled();
});


it.each([
  { id: "task-id", title: "Linked task" },
  { _id: "task-id", title: "Linked task" },
  "task-id",
])("opens the existing inspection task from fault details and the conversion page: %j", async (workOrder) => {
  setup();
  service.get.mockImplementation(async (path) => path === "/fault-reports/fault-id"
    ? { data: { ...fixtures["/fault-reports"].data[0], workOrder, actions: [], history: [], attachments: [] } }
    : fixtures[path] || { data: [] });
  const view = mount(<FaultDetail />, "/fault-reports/fault-id");
  expect(await screen.findByRole("link", { name: "Open Work Order" })).toHaveAttribute("href", "/tasks/task-id");
  view.unmount();
  mount(<FaultWorkOrder />, "/fault-reports/fault-id/work-order");
  expect(await screen.findByRole("link", { name: "Open Work Order" })).toHaveAttribute("href", "/tasks/task-id");
  expect(service.save).not.toHaveBeenCalled();
});
