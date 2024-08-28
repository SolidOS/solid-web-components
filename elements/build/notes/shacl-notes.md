###
# pseudo Classes
###
:GovOrNonprofitOrg
  rdfs:label "Government & Nonprofits" ;
  rdfs:subClassOf schema:Organization ;
  ui:wanted "?type = schema:NGO || ?type = schema:GovernmentalOrganization".

soar:PersonalProductivityApp
soar:OrganizationalApp
soar:LeisureActivityApp
soar:CommunicationApp
soar:PodTool
soar:ApplicationBuilder
soar:GeneralPurposeApp

  


soar:SolidProjectOrganization
    a owl:Class ;
    rdfs:subClassOf schema:Organization, [
        a owl:Class ;
        owl:oneOf (
            schema:ResearchOrganization
            schema:GovernmentalOrganization
            schema:NGO
            schema:Copration
            soar:OpenSourceProject
        )
    ] .


