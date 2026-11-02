import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { MoreHorizontal } from "lucide-react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Button } from "./shared";
const Items = styled(MenuItems)`
  --anchor-gap: 6px;
  background: white;
  color: var(--color-navy);
  border: 1px solid #ccd8ea;
  border-radius: 8px;
  padding: 6px;
  min-width: 220px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 8px 24px #00004818;
  z-index: 10020;
  outline: none;
  button {
    display: block;
    width: 100%;
    text-align: start;
    background: none;
    border: 0;
    font: inherit;
    color: inherit;
    padding: 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  button[data-focus] {
    background: #edf3fc;
  }
`;
export default function ActionMenu({ label, items }) {
  return (
    <Menu>
      <MenuButton as={Button} aria-label={label}>
        <MoreHorizontal />
      </MenuButton>
      <Items anchor="bottom end" portal modal={false}>
        {items.filter(Boolean).map((item) => (
          <MenuItem key={item.label}>
            <button type="button" onClick={item.onClick}>
              {item.label}
            </button>
          </MenuItem>
        ))}
      </Items>
    </Menu>
  );
}
ActionMenu.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
};
