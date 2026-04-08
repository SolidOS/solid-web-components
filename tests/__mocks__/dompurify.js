// Pass-through mock — tests don't need real sanitization.
module.exports = { default: { sanitize: (html) => html }, sanitize: (html) => html };
