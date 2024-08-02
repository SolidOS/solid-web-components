export var wantedProperties = {
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
};
export var wantedTypes = {
  "PodService" :{ 
    type: 'http://example.com/soar#PodService',
    label: "Pod Hosting Services",
  },
  "LearningResource"      :{
    type: "http://schema.org/LearningResource",        
    label: "Learning Resources",
  },
  "Forum"                 :{
    type: 'http://rdfs.org/sioc/ns#Forum',             
    label: "Communication Channels",
  },
  "Event"                 :{
    type: "http://schema.org/Event",                   
    label: "Events",
  },
  "SpecializedPodService" :{
    type: 'http://example.com/soar#SpecializedPodService',
    label: "Services for specific Communities",
  },
  'SolidStorageServer'    :{
    type: 'http://example.com/soar#SolidStorageServer',
    label: 'Solid Servers',
  },
  "SoftwareApplication"   :{
    type: "http://schema.org/SoftwareApplication",
    label: "Applications",
  },
  "SoftwareLibrary"       :{
    type: 'http://example.com/soar#SoftwareLibrary',
    label: "Developer Tools",
  },
  "Specification"         :{
    type: 'http://usefulinc.com/ns/doap#Specification',
    label: "Specifications",
  },
  "Ontology"              :{
    type: 'http://www.w3.org/2002/07/owl#Ontology',
    label: "Vocabularies",
  },
  "Organization"          :{
    type: "http://schema.org/Organization",    
    label: "Organizations",
    page: "./catalog-organizations.html",
    subtypes: {
      "ResearchOrganization":{
        type: "http://schema.org/ResearchOrganization",    
        label: "Universities",
      },
      "GovernmentalOrganization":{
        type: "http://schema.org/GovernmentalOrganization",    
        label: "Public Agencies",
      },
      "Company":{
        type: "http://example.com/soar#Company",    
        label: "Companies",
      },
      "BasicNeedsProject":{
        type: "http://example.com/soar#BasicNeedsProject",    
        label: "Social Issue Organizations",
      },
      "OpenSourceProject":{
        type: "http://example.com/soar#OpenSourceProject",    
        label: "Open Source Projects",
      },
    }
  },
  "Person"                :{
    type: "http://schema.org/Person",    
    label: "People",
  },
};

 






