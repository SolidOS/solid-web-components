
* extending sol-base supports
   * relative URLs in HTML converted to absolute URLs
   * an importable (non-global) singleton store and authenticated fetch
* sol-base's over-ridable fetchData method supports
    * methods to fetch rdf,sparql,ui-forms,html,markdown, and text data
    * conversion of data to array format suitable for filtering and views
    * methods to limit and filter the data
* sol-base's over-ridable showData method supports
    * built-in templates for table, card, rolodex, menu, tabs, accordion
    * custom templates
    * specified targets for modal, popup, tab

To support alternate data fetching, override `fetchData` and return data as
an array.

To support alternate data display, either create a template and list it as the `view` in a component, or if you need more javascript than can fit in a template, override `showData`.

