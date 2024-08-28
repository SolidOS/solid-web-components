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


