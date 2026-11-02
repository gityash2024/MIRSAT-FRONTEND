import api from "./api";

const prefix = "/maintenance";
export const maintenanceService = {
  async getExisting(path, params, signal) {
    return (await api.get(path, { params, signal })).data;
  },
  async get(path, params, signal) {
    return (await api.get(`${prefix}${path}`, { params, signal })).data;
  },
  async save(path, data, method = "post") {
    return (
      await api.request({
        url: `${prefix}${path}`,
        method,
        data,
        ...(data instanceof FormData
          ? { headers: { "Content-Type": undefined } }
          : {}),
      })
    ).data;
  },
  async download(path, fallbackName, data) {
    const response = await api.request({
      url: `${prefix}${path}`,
      method: data ? "post" : "get",
      data,
      responseType: "blob",
    });
    const disposition = response.headers["content-disposition"] || "";
    const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    const plain = disposition.match(/filename="([^"]+)"/i)?.[1];
    const name = encoded ? decodeURIComponent(encoded) : plain || fallbackName;
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  async preview(path) {
    const response = await api.get(`${prefix}${path}`, {
      responseType: "blob",
    });
    return { url: URL.createObjectURL(response.data), type: response.data.type };
  },
};
export const maintenanceError = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  "Unable to complete this operation";
export const asFormData = (values) => {
  const body = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value))
      value.forEach((item) => body.append(`${key}[]`, item));
    else body.append(key, value);
  });
  return body;
};
