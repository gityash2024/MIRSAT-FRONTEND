import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import LanguageToggle from "../components/ui/LanguageToggle";
import { supportedLanguage } from "../utils/supportedLanguage";

const i18n = { changeLanguage: vi.fn(), language: "en-GB" };
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n, t: (key) => key }),
}));
function LanguageState() {
  const { currentLanguage, isRTL } = useLanguage();
  return <output>{`${currentLanguage}:${isRTL}`}</output>;
}
afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});
it.each([
  ["en-GB", "en"],
  ["en_US", "en"],
  ["ar-SA", "ar"],
  ["AR_ae", "ar"],
  ["fr-FR", "en"],
  [null, "en"],
])("resolves supported language for %s", (tag, expected) => {
  expect(supportedLanguage(tag)).toBe(expected);
});
it.each([
  ["en-GB", "en:false", "English", "ltr"],
  ["ar-SA", "ar:true", "العربية", "rtl"],
])(
  "shows a label and correct direction for stored %s",
  (tag, state, label, direction) => {
    localStorage.setItem("i18nextLng", tag);
    render(
      <LanguageProvider>
        <LanguageToggle />
        <LanguageState />
      </LanguageProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe(state);
    expect(
      screen.getByRole("button", { name: "common.language", exact: true }),
    ).toHaveTextContent(label);
    expect(document.documentElement.dir).toBe(direction);
  },
);
