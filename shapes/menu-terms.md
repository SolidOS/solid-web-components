<#MyMenu> a **ui:Menu**; ui:label "main-menu" ;
  ui:parts ( <#MyPlainLink> <#MySubmenu> <#MyComponentLink> ) ;
  ui:style "text-align:right;" ;
  **ui:linkTarget** "#myDisplayArea" .
  
<#MyPlainLink> a **ui:Link**; ui:label "Home" ;
  **ui:href** <./data/home.html> ;
  **ui:icon** <https://fontawesome.com/icons/house?s=solid> .

<#MySubMenu> a ui:Menu; ui:label "Settings" ;
  ui:parts ( <#Light> <#Dark> );

<#MyComponentLink> a ui:Link;  ui:label "sample data table" ;
  ui:href <./data/sample-data.ttl> ;
  **ui:component** "sol-table" .

<#Light> a ui:Link; ui:label "Light" ;
  ui:contents "you chose the 'Light' side)" .

<#Dark> a ui:Link; ui:label "Dark" ;
  ui:contents "you chose the 'Dark' side)" .
