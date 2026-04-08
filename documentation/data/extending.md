You can write view-plugins for Solid web-components.  When you create a view-plugin, and import it into an HTML page with a type=module script tag after including sol-core.js, it becomes available to users as a template.  So a page containing `<sol-rdf source="foo.ttl" template="my_template"></sol-rdf>` would load the data from foo.ttl, filter it with any wanted or sparql tags, and feed the results to your view-plugin's my_template function.  In this function you can munge it any way you want including adding other data, and create a view with or without interactivity.

To create a basic view-plugin, for example a weather view

* clone the Solid Web Components repo
* create a file in the src/libs folder called view-weather.js
* write a function there called `weather` which
    * gets param `element` from which you can get any attributes unique to your view
    * gets param `data` which is either text, or HTML, or an array generated from RDF
    * handles the data and creates a view of it to present to the user
* if your view has interactive bits, for each event you want to respond to
    * create a function with the first part of the name your viewname e.g. weatherClick which
        * gets param `element` - the element that generated the event
        * gets param `flag` - any additional data you want in the event handler
        * responds to the event however you want
    * in the `weather` function add an event listener
        * with this onclick : `solrun(event,'weatherClick',flag)`
        * the second parameter *must* be the name of the function that handles the event
        * the optional flag can be anything you handle in your weatherClick function
* at the top of view-weather.js, import the registerView function and register your view by defining the actions and templates like this :
```
import {registerView} from '../sol-core.js';
registerView({actions:{weatherClick},templates:{weather}});
```
You can also import and of the sol/lib/* libraries to call functions to access and filter data. Examples of view-plugins can be found in sol.libs/view-*.js, the simplest being view-example.js.

