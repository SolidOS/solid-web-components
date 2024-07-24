# defaults
  * source ./ui/ui-data.ttl

# header

  * sol-menu
    * [Home]("./ui/home.html") {linkType="html"}
    * [Workspaces]()           {linkType="container"} {wanted="tag container || tag workspace"}
    * [Tools]()                {linkType="solidos"}   {wanted="tag solidos tool"}
  * sol-time
  * sol-login

# sidebar-right

  * sol-tabset
    * [solid links]() {view="links"}   {wanted="tag solid video link || tag solid link")
    * [to check]()    {view="links"}   {wanted="tag to check"}      
    * [my stuff]()    {view="links"}   {wanted="tag personal"}      
  * sol-searchbar     {viewIn="popup"} {wanted="tag Search Engine"} 
  * sol-rss           {viewIn="popup"} {wanted="tag RssFeed"}       


* [Oregon Public Broadcasting](https://api.opb.arcpublishing.com/feeds/rss/?website=opb)
    {a Bookmark}
    {tag RssFeed}
    {hasTopic General News}
    This is some descriptive text

-----------------------------------------------------------------------------


a URI ending in a slash might be

 * a container on a pod
 * a folder on a web-server
 * some format returned by that url

Each 


* Handlers
  * solidos
  * rss
  * markdown
  * form
  * 





markdown -> html -+ 
                  |
                  +-> [filter] -> display
                  |
            rdf  -+

 data format  filter type
markdown/html  none/css-selector
     rdf       unfiltered / filtered-by-simple-query / filtered






## Soon

### Widgets
    * help - components documentation
    * ontology browser
    * specs browser
    * open culture explorer
    * components playground
    * more locations
    * quickNotes - load/view, trim filename
### Components
    * tabs
    * tree/skos
    * draggable
### Code
    * support handlers for linkTypes
    * standardize linkTypes
    * remove dependencies on registerView
    * get params on load, if uri supplied, open container-view there

* FOR LATER
  * rdf-site-gen
  * nav buttons on container
  * filter container by mime-type
  * aria
  * musicPlayer
  * slideshow
  * alternate menu inputs (auto,from components,from markdown,from rdf)
  * rdf-simple (js version of components)
  * group sources with sol-settings
  * embed RDFa as RDF
  * reader from markdown/plain HTML
  * demo


Display Locations
 * modal
 * popup window
 * new winodw/tab
 * iframe
 * other element
Display Types
 * image
 * video
 * audio
 * plain text
 * other binary

## Tags

### Embeds
* **sol-include** embed components and content from HTML, markdown, and any text-based source
* **sol-page** - create pages from built-in or customizable themes


### Apps
* **sol-data-manager** - forms-based CRUD operations on RDF data
* **sol-data-explorer** - explore data locations with SolidOS and othe data browsers
* **sol-text-manager** - CRUD operations on Non-RDF text-based data
* **sol-solidOS-tools** - Address Book, Contacts, Chat, Profile Editor, etc.
* **sol-developer-tools** - explore specs, ontologies, sparql & shacl playgrounds, etc.

### Widgets
* **sol-login** - embed a Solid login/logout button
* **sol-time** - display local & UTC time
* **sol-searchbar** - search using a customizable list of search engines
* **sol-rss** - customizable RSS/Atom feed reader

## Attributes

### template
* **table** - embed RDF data in a table
* **custom** - embed RDF data in a template you create
* **form** - embed a solid-ui form
* **menu**
* **tabs**
* **tree**
* **accordion**
* **links**
* **selector**
* **modal**


<!--
* ontology browser
* specs browser
* open culture explorer
* playgrounds
    * components
    * shacl
    * sparql
    * turtle
    * json-ld

## SolidOS Tools <sol-solidos source="${webId}" tool="ProfileEditor" ...
* Profile Editor
* Preferences Editor
* Address Book
* Task Manager
* Chat




| sol-include      | embed components and content from HTML, markdown, and any text-based source
| sol-page         | create pages from built-in or customizable themes
| sol-table        | embed RDF data in a table
| sol-custom       | embed RDF data in a template you create
| sol-form         | embed a solid-ui form

| sol-login        | embed a Solid login/logout button
| sol-container    | UI for exploring containers with SolidOS and othe data browsers
| sol-data-manager | UI for CRUD operations on RDF documents
| sol-text-manager | UI for CRUD operations on text documents

| sol-time         | display local & UTC time
| sol-searchbar    | search using a customizable list of search engines
| sol-rss          | customizable RSS/Atom feed reader

menu
tabs
tree
accordion
links
selector
modal

modal
  source
  containerHeight
  containerWidth
  template="modal"sourceType
  buttonLabel



<h1>Solid Web Components</h1>
//
    original format of data : type = html | markdown | text | rdf
           display template : template = anchorList | selector | table | URL of custom template
filters for html & markdown : wanted = [any CSS selector]
     simple filters for RDF : wanted = predicate object (e.g. "hasTopic ScienceNews")


./dynamic/site-template.html - the sitewide html, things that go on every page
./pages/*.html - the page-specific html for each page in the site
./templates/*.html - html templates to display results of queries in pages
./embeds/*.html - html snippets to include in pages
./data/*.ttl - turtle files containing RDF data

All content can be located on local websites or pods or on the local file system.
When located in the file  system, they should 
mySite/
  dynamic/
    site-template.html
    data/*.ttl
    embeds/*.html
    templates/*.html
  static/

<head>
  <title>${PAGE_TITLE}</title>
</head>
<body id="${PAGE_FILENAME}">
  <sol-embed source="./embeds/banner.html"></sol-embed>
  <sol-embed source="./pages/${PAGE_PATH}"></sol-embed>
  <sol-embed source="./embeds/banner.html"></sol-embed>
</body></html>


<sol-component>./data/sample-component.html</sol-component>

<sol-rdf>./data/sample-rdf.ttl</sol-rdf>
<sol-rdf>./data/sample-rdf.ttl#1</sol-rdf>

# to-do

### attributes
* queryParams
* sparql

### Profile types
* typeRegistrations
* addressBooks
* taskLists
* friends
* communities

### interactive templates
* selector
* form (both?)
* reader (both?)
* menu (both?)
* tabs (both?)
* accordion (both)
* tree
* demo (cli)

### viewIn
* modal
* window

### interactive widgets
* searchbar
* rss

### future attributes for simple-query
* limit? 
* order?
* fields?