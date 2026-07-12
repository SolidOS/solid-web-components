// Light-DOM styles for <sol-settings-nav>. Injected into the element's
// document once per page (see ensureDocStyle in core/adopt.js). Chip colors
// ride the shared design tokens, so a host app themes them with its own
// --accent / --surface / --border values.

export const CSS = `
sol-settings-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md, 8px);
  margin-bottom: calc(var(--space-lg, 12px) + 1rem);
}
sol-settings-nav .sol-settings-nav-chip {
  font-size: 1rem;
  line-height: 1;
  padding: var(--space-sm, 6px) var(--space-lg, 12px);
  border: 1px solid var(--border, #9e9e9e);
  border-radius: 999px;
  background: var(--surface, #fff);
  color: inherit;
  cursor: pointer;
}
sol-settings-nav .sol-settings-nav-chip:hover {
  border-color: var(--accent, #3498db);
}
sol-settings-nav .sol-settings-nav-chip[aria-selected="true"] {
  background: var(--accent, #3498db);
  border-color: var(--accent, #3498db);
  color: #fff;
}
/* Touch: the shared phone-chip contract — 44px targets, 16px text floor. */
@media (hover: none) and (pointer: coarse) {
  sol-settings-nav .sol-settings-nav-chip {
    min-height: 44px;
    padding: 0 var(--space-xl, 16px);
    font-size: max(16px, 1em);
  }
}
`;
