import { useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  maintenanceService as service,
  asFormData,
  maintenanceError,
} from "../../services/maintenance.service";
import {
  Page,
  Back,
  Header,
  Panel,
  Grid,
  FormGrid,
  Field,
  Actions,
  Button,
  ErrorBox,
  ResourceState,
  Definition,
  FormDialog,
  Label,
  Muted,
  useCopy,
  useMaintenanceAccess,
  canManageMaintenance,
  useResource,
  optionsFrom,
} from "./shared";
import { ImagePicker, DocumentQueue, FormSteps } from "./ProfileFields";
export default function PartEditor() {
  const { id } = useParams();
  const m = useCopy();
  const { user, manage } = useMaintenanceAccess("warehouse");
  const resource = useResource(
    id ? `/warehouse/parts/${id}` : null,
    {},
    manage && Boolean(id),
  );
  if (!manage)
    return (
      <ErrorBox>{m("Access to this module has not been granted")}</ErrorBox>
    );
  return id ? (
    <ResourceState resource={resource}>
      {resource.data?.data && (
        <Editor
          key={id}
          data={resource.data.data}
          canDocuments={canManageMaintenance(user, "documents")}
        />
      )}
    </ResourceState>
  ) : (
    <Editor canDocuments={canManageMaintenance(user, "documents")} />
  );
}
function Editor({ data, canDocuments }) {
  const m = useCopy();
  const navigate = useNavigate();
  const part = data?.part;
  const [values, setValues] = useState({
    name: "",
    sku: "",
    category: "",
    status: "active",
    manufacturer: "",
    manufacturerPartNumber: "",
    unit: "",
    compatibleAssetType: "",
    compatibleEquipmentModels: [],
    openingLocation: "unassigned",
    defaultWarehouse: "",
    storageLocation: "",
    initialQuantity: "",
    unitCost: "",
    description: "",
    ...Object.fromEntries(
      Object.entries(part || {}).filter(([key]) =>
        [
          "name",
          "sku",
          "category",
          "status",
          "manufacturer",
          "manufacturerPartNumber",
          "unit",
          "compatibleAssetType",
          "compatibleEquipmentModels",
          "defaultWarehouse",
          "storageLocation",
          "unitCost",
          "description",
        ].includes(key),
      ),
    ),
  });
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [files, setFiles] = useState([]);
  const uploaded = useRef(new Set());
  const receiptKey = useRef(crypto.randomUUID());
  const [savedId, setSavedId] = useState(part?._id);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const warehouses = useResource("/warehouse/warehouses", { limit: 100 });
  const types = useResource("/asset-types", {}, true, true);
  const catalog = useResource("/warehouse/catalog");
  const catalogData = catalog.data?.data || {};
  const [addEntry, setAddEntry] = useState(null);
  const [modelSearch, setModelSearch] = useState("");
  const [entriesSaved, setEntriesSaved] = useState([]);
  const locations = useResource(
    `/warehouse/warehouses/${values.defaultWarehouse}/locations`, {},
    Boolean(!part && values.defaultWarehouse),
  );
  const precision = /^(piece|pcs?)$/i.test(values.unit.trim()) ? 0
    : [...entriesSaved, ...(catalogData.unit || [])].find((entry) =>
      entry.type === "unit" && entry.name === values.unit)?.precision ?? part?.unitPrecision ?? 4;
  const editing = Boolean(part);
  const stock = (data?.balances || []).reduce(
    (sum, row) => sum + row.onHand,
    0,
  );
  const change = (name, value) =>
    setValues((old) => ({
      ...old, [name]: value,
      ...(name === "defaultWarehouse" && { openingLocation: "unassigned" }),
    }));
  const field = (name, label, config = {}) => (
    <Field
      key={name}
      field={{ name, label, ...config }}
      value={values[name] ?? ""}
      onChange={(value) => change(name, value)}
    />
  );
  const managed = (name, label, type, config = {}) => {
    const configEntries = [...(catalogData[type] || []), ...entriesSaved.filter((entry) => entry.type === type)];
    const valuesByName = new Map(configEntries.map((entry) => [
      entry.name, entry.abbreviation ? `${entry.name} (${entry.abbreviation})` : entry.name,
    ]));
    if (values[name] && !valuesByName.has(values[name])) valuesByName.set(values[name], values[name]);
    return (
      <div>
        {field(name, label, {
          required: true, searchable: true,
          options: [...valuesByName].map(([value, entryLabel]) => ({ value, label: entryLabel })),
          ...config,
        })}
        {!config.disabled && <Button type="button" onClick={() => setAddEntry({ name, label, type })}>{m("Add Entry")}</Button>}
      </div>
    );
  };
  const models = [...new Set([...(catalogData.equipmentModels || []), ...values.compatibleEquipmentModels])];
  return (
    <Page>
      <Back to={part ? `/spare-parts/${part._id}` : "/spare-parts"}>
        <ArrowLeft size={14} />
        {m("Back to Spare Parts & Warehouse")}
      </Back>
      <Header>
        <div>
          <h1>{m(editing ? "Edit Spare Part" : "Add Spare Part")}</h1>
          <p>
            {m(
              editing
                ? "Update the spare part record and storage information."
                : "Create a spare part record and assign its initial warehouse stock.",
            )}
          </p>
        </div>
      </Header>
      {editing && (
        <FormSteps first="Part Information" second="Stock & Documents" />
      )}
      {warehouses.error && (
        <ErrorBox role="alert">
          {warehouses.error}{" "}
          <Button type="button" onClick={warehouses.reload}>
            {m("Retry")}
          </Button>
        </ErrorBox>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            const { initialQuantity, openingLocation, ...metadata } = values;
            const opening = Number(initialQuantity);
            if (!editing && (!Number.isFinite(opening) || opening < 0 ||
              Number(opening.toFixed(precision)) !== opening))
              throw new Error(m(precision === 0 ? "Piece quantities must be positive whole numbers" : "Enter a positive quantity within the allowed precision"));
            const payload = {
              ...metadata,
              defaultWarehouse: metadata.defaultWarehouse || null,
              unitCost:
                metadata.unitCost === "" ? 0 : Number(metadata.unitCost),
            };
            if (!payload.sku) delete payload.sku;
            let nextId = savedId;
            if (!nextId) {
              const response = await service.save("/warehouse/parts", payload);
              nextId = response.data._id;
              setSavedId(nextId);
            } else
              await service.save(
                `/warehouse/parts/${nextId}`,
                payload,
                "patch",
              );
            if (!editing && Number(initialQuantity) > 0)
              await service.save("/warehouse/movements", {
                type: "receipt",
                part: nextId,
                warehouse: values.defaultWarehouse,
                quantity: Number(initialQuantity),
                ...(openingLocation !== "unassigned" && { location: openingLocation }),
                reference: "Opening stock",
                notes: "Initial stock recorded when adding the spare part",
                idempotencyKey: receiptKey.current,
              });
            if (image)
              await service.save(
                `/warehouse/parts/${nextId}/image`,
                asFormData({ file: image }),
              );
            else if (editing && removeImage)
              await service.save(
                `/warehouse/parts/${nextId}/image`,
                {},
                "delete",
              );
            for (const entry of files)
              if (!uploaded.current.has(entry.key)) {
                await service.save(
                  "/documents",
                  asFormData({
                    file: entry.file,
                    title: entry.file.name.replace(/\.[^.]+$/, ""),
                    category: "Manuals",
                    part: nextId,
                  }),
                );
                uploaded.current.add(entry.key);
              }
            navigate(`/spare-parts/${nextId}`, {
              state: {
                success: editing
                  ? "Spare part updated successfully"
                  : "Spare part added successfully",
              },
            });
          } catch (err) {
            setError(maintenanceError(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <Grid $columns="minmax(0,1.91fr) minmax(300px,1fr)">
          <Panel>
            <h2>{m("Basic Information")}</h2>
            <p>{m("Required identification data for the spare part.")}</p>
            <FormGrid>
              {field("name", "Part Name", {
                required: true,
                disabled: Boolean(savedId) && !editing,
              })}
              {field("sku", "Part Number", {
                placeholder: "Generated automatically",
                disabled: Boolean(savedId) || !editing,
              })}
              {managed("category", "Part Category", "category", { disabled: Boolean(savedId) && !editing })}
              {field("status", "Status", {
                options: ["active", "inactive"].map((value) => ({
                  value,
                  label: m(value === "active" ? "Active" : "Inactive"),
                })),
                disabled: Boolean(savedId) && !editing,
              })}
            </FormGrid>
            <h2 style={{ marginTop: 32 }}>{m("Part Details")}</h2>
            <p>{m("Manufacturer and purchasing reference information.")}</p>
            <FormGrid>
              {field("manufacturerPartNumber", "Manufacturer Part No.")}
              {managed("manufacturer", "Manufacturer", "manufacturer")}
              {managed("unit", "Unit of Measure", "unit", { disabled: Boolean(savedId) && !editing })}
              {field("compatibleAssetType", "Compatible Asset Type", {
                options: (types.data?.data || []).map((type) => ({
                  value: type.name,
                  label: type.name,
                })),
              })}
            </FormGrid>
            <fieldset style={{ margin: "16px 0", border: "1px solid #ccd8ea", borderRadius: 8 }}>
              <legend>{m("Compatible Equipment Models")}</legend>
              <input type="search" aria-label={m("Search equipment models")} value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)} />
              <div style={{ maxHeight: 150, overflow: "auto" }}>
                {models.filter((model) => model.toLocaleLowerCase().includes(modelSearch.trim().toLocaleLowerCase()))
                  .map((model) => (
                    <Label key={model}>
                      <input type="checkbox" checked={values.compatibleEquipmentModels.includes(model)} onChange={(event) =>
                        change("compatibleEquipmentModels", event.target.checked
                          ? [...values.compatibleEquipmentModels, model]
                          : values.compatibleEquipmentModels.filter((value) => value !== model))} />
                      {model}
                    </Label>
                  ))}
                {models.length === 0 && <Muted>{m("No equipment models found")}</Muted>}
              </div>
            </fieldset>
            <h2 style={{ marginTop: 32 }}>
              {m(editing ? "Stock & Storage" : "Initial Stock & Storage")}
            </h2>
            <p>
              {m(
                editing
                  ? "Current stock is read-only. Use stock movements to change balances."
                  : "Select where the part is stored and enter the opening stock quantity.",
              )}
            </p>
            <FormGrid>
              {field("defaultWarehouse", "Warehouse", {
                required: !editing,
                options: optionsFrom(warehouses.data?.data),
                disabled: Boolean(savedId) && !editing,
              })}
              {editing ? field("storageLocation", "Storage Location", { readOnly: true }) : field("openingLocation", "Storage Location", {
                searchable: true, required: true, disabled: !values.defaultWarehouse || Boolean(savedId),
                options: [{ value: "unassigned", label: m("Unassigned location") }, ...optionsFrom(locations.data?.data)],
              })}
              {editing ? (
                <Definition>
                  <div>
                    <dt>{m("Current Stock")}</dt>
                    <dd>
                      {stock} {part.unit}
                    </dd>
                  </div>
                </Definition>
              ) : (
                field("initialQuantity", "Initial Quantity", {
                  type: "number",
                  min: 0,
                  required: true,
                  disabled: Boolean(savedId),
                  step: precision === 0 ? 1 : Math.pow(10, -precision),
                })
              )}
              {field("unitCost", "Unit Cost", { type: "number", min: 0 })}
            </FormGrid>
            <div style={{ marginTop: 28 }}>
              {field("description", "Notes", { type: "textarea", wide: true })}
            </div>
          </Panel>
          <div>
            <Panel>
              <h2>{m("Part Image")}</h2>
              <p>{m("Upload a clear image of the spare part.")}</p>
              <ImagePicker
                file={image}
                onChange={setImage}
                currentPath={
                  !removeImage && part?.image
                    ? `/warehouse/parts/${part._id}/image`
                    : undefined
                }
                revision={part?.updatedAt}
                onRemove={() => setRemoveImage(true)}
              />
            </Panel>
            {canDocuments && (
              <Panel>
                <h2>{m("Part Documents")}</h2>
                <p>
                  {m(
                    "Store manuals and technical documents linked to this part.",
                  )}
                </p>
                <DocumentQueue
                  files={files}
                  onChange={setFiles}
                  title="Upload part documents"
                />
              </Panel>
            )}
            {error && (
              <ErrorBox role="alert">
                {savedId && !editing && (
                  <p>
                    {m(
                      "The part is saved. Retry to finish its stock, image, or document uploads.",
                    )}
                  </p>
                )}
                {error}
              </ErrorBox>
            )}
            <Actions style={{ justifyContent: "flex-end", marginTop: 28 }}>
              <Button
                as={Link}
                to={part ? `/spare-parts/${part._id}` : "/spare-parts"}
              >
                {m("Cancel")}
              </Button>
              <Button type="submit" $primary disabled={busy}>
                {m(
                  busy
                    ? "Saving…"
                    : editing
                      ? "Save Changes"
                      : "Add Spare Part",
                )}
              </Button>
            </Actions>
          </div>
        </Grid>
      </form>
      {addEntry && (
        <FormDialog
          title="Add Catalog Entry"
          fields={[
            { name: "name", label: addEntry.label, required: true, maxLength: addEntry.type === "unit" ? 30 : 200 },
            ...(addEntry.type === "unit" ? [
              { name: "abbreviation", label: "Abbreviation", required: true, maxLength: 30 },
              { name: "precision", label: "Decimal Places", required: true, type: "number", min: 0, max: 4, step: 1 },
            ] : []),
          ]}
          onClose={() => setAddEntry(null)}
          onSubmit={async (input) => {
            const result = await service.save("/warehouse/catalog", { ...input, type: addEntry.type });
            setEntriesSaved((old) => [...old, result.data]);
            change(addEntry.name, result.data.name);
            catalog.reload();
          }}
        />
      )}
    </Page>
  );
}
import PropTypes from "prop-types";
Editor.propTypes = { data: PropTypes.object, canDocuments: PropTypes.bool };
