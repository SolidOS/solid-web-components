@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix schema: <http://schema.org/> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix ex: <http://example.com/ns#> .

ex:ResourceShape
    a sh:NodeShape ;
    sh:closed true ;
    sh:ignoredProperties ( rdf:type ) ;

    # LabelShape
    sh:property [
        sh:path ex:labelShape ;
        sh:node [
            sh:or (
                [ sh:path schema:name ] ;
                [ sh:path dct:title ] ;
                [ sh:path rdfs:label ]
            )
        ]
    ] ;

    # DescriptionShape
    sh:property [
        sh:path ex:descriptionShape ;
        sh:node [
            sh:or (
                [ sh:path dct:description ] ;
                [ sh:path schema:description ]
            ) ;
            sh:property [


:SolidProjectResourceShape
  * schema:LearningResource
  * sioc:Forum    
  * schema:Event
  * schema:Service
  * schema:SoftwareApplication
  * doap:Specification
  * owl:Ontology
  * schema:Person
  * schema:Organization
  * schema:Offer

* soar:CommunityResource
  * schema:LearningResource
    * soar:GeneralPublicResource ;
    * soar:DeveloperResource ;
      * dcat:Dataset
    * soar:SpecificationSupplement
  * sioc:Forum    
    * sioct:ChatChannel
    * sioct:MessageBoard
    * sioct:MailingList
  * schema:Event
    * meet:Meeting
  * schema:Service
    * soar:PodService           
    * soar:SpecializedPodService
  * schema:SoftwareApplication
    * soar:PodServer                 
    * soar:PodFrontEnd               
    * soar:PodManagementTool         
    * soar:SoftwareLibrary           
      * soar:SolidFetchClient        
      * soar:SolidSpecificTypeLibrary
  * doap:Specification
  * owl:Ontology
  * schema:Person
  * schema:Organization
    * schema:ResearchOrganization
    * schema:GovernmentalOrganization
    * schema:NGO
    * schema:Corporation
    * roh:FundingProgram
    * soar:OpenSourceProject
  * schema:Offer
    * schema:JobPosting
    * soar:SkillsOffered

------------------
<!-- 
* soar:CommunityResource              # an event, product, service, creative work, person, or organization that adds to a community
  * schema:LearningResource           # differentiated by schema:audience
  * sioc:Forum    
    * sioct:ChatChannel
    * sioct:MessageBoard
    * sioct:MailingList
  * schema:Event
    * meet:Meeting
  * schema:Service
    * soar:PodService                 # service providing public access to Solid storage and identity services
    * soar:SpecializedPodService      # service providing access to pod services for a targeted community or purpose
  * schema:SoftwareApplication
    * soar:PodServer                  # software that provides Solid Storage and may also provide WebIDs
    * soar:PodFrontEnd                # an app like SolidOS or Penney providing a generalized UI for a pod
    * soar:PodManagementTool          # an app that provides a UI for management of specific kinds of pod resources
    * soar:SoftwareLibrary            # code meant to be used by other libraries or applications
      * soar:SolidFetchClient         # a software library that provides Solid login & authenticated fetch methods
      * soar:SolidSpecificTypeLibrary # a software library that provides access to a specific class of data e.g. schema:Movie
  * doap:Specification
  * owl:Ontology
  * schema:Person
  * schema:Organization
    * schema:ResearchOrganization
    * schema:GovernmentalOrganization
    * schema:NGO
    * schema:Corporation
    * roh:FundingProgram
 

//all types
  "name":                     'http://schema.org/name'  , 
  "alternateName":            'http://schema.org/alternateName'                 ,
  "type":                     'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  "description":              'http://schema.org/description'                  ,
  "keywords":                 'http://schema.org/keywords'                      ,
  "homepage":                 'http://usefulinc.com/ns/doap#homepage'           ,
  "repository":               'http://usefulinc.com/ns/doap#repository'         ,
  "wiki":                     'http://usefulinc.com/ns/doap#wiki'               ,
  "webid":                    'http://www.w3.org/ns/solid/terms#webid',        
//several types
  "provider":                 'http://schema.org/provider'                      ,
  "logo":                     'http://schema.org/logo'                          ,
  "license":                  'http://schema.org/license'                       ,
  "audience":                 'http://schema.org/audience'                      ,
  "implements":               'http://usefulinc.com/ns/doap#implements'         ,
  "programming_language":     'http://usefulinc.com/ns/doap#programming_language',
  "platform":     'http://usefulinc.com/ns/doap#platform',
//only SoftwareApplication
  "screenshot":               'http://schema.org/screenshot'                    ,
//only Service
  "actionApplication":        'http://schema.org/actionApplication'             ,
  "service_endpoint":         'http://usefulinc.com/ns/doap#service-endpoint'   , // note: change "-" to "_"
//only Ontology
  "preferredNamespacePrefix": 'http://purl.org/vocab/vann/preferredNamespacePrefix',
  "preferredNamespaceURI":    'http://purl.org/vocab/vann/preferredNamespaceURI',
//only Event
  "videoCallPage":            'https://www.w3.org/ns/pim/meeting#videoCallPage',
//only Person
  "forumid":                  'http://localhost:8444/home/s/solidify/build/all.ttl#forumid',



 'http://example.com/soar#PodService',
 "http://schema.org/LearningResource",        
 'http://rdfs.org/sioc/ns#Forum',             
     "http://rdfs.org/sioc/types#ChatChannel",
     "http://rdfs.org/sioc/types#MessageBoard",
     "http://rdfs.org/sioc/types#MailingList",
 "http://schema.org/Event",                   
     "https://www.w3.org/ns/pim/meeting#Meeting",
 'http://example.com/soar#SpecializedPodService',
 'http://example.com/soar#PodServer',
 "http://schema.org/SoftwareApplication",
 'http://example.com/soar#SoftwareLibrary',
 'http://usefulinc.com/ns/doap#Specification',
 'http://www.w3.org/2002/07/owl#Ontology',
 "http://schema.org/Organization",    
     "http://schema.org/ResearchOrganization",    
     "http://schema.org/GovernmentalOrganization",    
     "http://example.com/soar#Company",    
     "http://example.com/soar#BasicNeedsProject",    
     "http://example.com/soar#OpenSourceProject",    
 "http://schema.org/Person",    

