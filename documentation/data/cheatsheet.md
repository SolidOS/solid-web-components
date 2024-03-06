**Tags show the source data format**
| - | -
| - | -
| **sol-html** | plain HTML, components ignored
| **sol-markdown** | is converted to HTML
| **sol-text** | displays source of html, turtle, etc.
| **sol-component** | HTML that may contain components
| **sol-rdf** | any turtle or other RDF content

**Attributes define data processing**
| - | -
| - | -
| **source** | the URL of the data source
| **wanted** | a search pattern; for rdf, html, and markdown
| **trusted** | allows onclick and inline Javascript in embeded HTML and Markdown
| **sparql** |  URI of document containing a SPARQL query (for rdf)
| **template** | defines display format; see template attribute on this page
| **proxy** | if specified added to source URI e.g. proxy="https://example.com/proxy?uri="
 
**The template attribute indicates display format**
| - | -
| - | -
| default | if no template specified, embed directly
| custom | if the template specified is a URL, use it
| **table** | only usable with `rdf` format
| **links** | any format except text
| **selector** | any format except text
| **tree-reader**  |  a paging reader with a tree menu (from rdf or html)
| **links-reader** | a paging reader with flat menu (any format but text)
| **selector-reader** | a paging reader with a selector menu (rdf)


<style>

  table {border-collapse:collapse; display:inline-block !important;}
  table * {font-size:92%;}
  p {margin-bottom:0;}
  th {display:none;}
  td {border:1px solid gray; padding:0.25rem;;}
</style>