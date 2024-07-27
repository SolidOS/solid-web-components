export const typeMap = {
  'http://example.org/soar#PodService'  : 
  'http://example.org/soar#CommGeneralPodService'
  'http://rdfs.org/sioc/ns#Forum'                 : 'forum',
  'http://rdfs.org/sioc/types#MailingList'        : 'mailingList',
  'http://rdfs.org/sioc/types#ChatChannel'        : 'chat',
  'http://rdfs.org/sioc/services#MessageBoard'    : 'messageBoard',
  "http://schema.org/Event"                       : 'event',
}
export const predicateMap = {
  "https://github.com/solid/organizations/vocabulary/oar.ttl#name" : "name",
  'http://purl.org/dc/terms/title'              : "name",
  'http://www.w3.org/2000/01/rdf-schema#label'  : "name",
  'http://xmlns.com/foaf/0.1/fname'              : "name",
  'http://www.w3.org/2006/vcard/ns#fn'           : "name",
  'http://schema.org/name'                       : "name",
  'http://usefulinc.com/ns/doap#name'            : "name",
  'http://www.w3.org/2004/02/skos/core#label'    : "name",
  'http://www.w3.org/ns/ui#label'                : "name",
  "https://github.com/solid/organizations/vocabulary/oar.ttl#description" : "description",
  'http://schema.org/description'                : "description",
  'http://usefulinc.com/ns/doap#description'     : "description",
  'http://www.w3.org/2000/01/rdf-schema#comment' : "description",
  "https://github.com/solid/organizations/vocabulary/oar.ttl#type" : "type",
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : "type",
  'http://schema.org/additionalType'                : "type",
  "https://github.com/solid/organizations/vocabulary/oar.ttl#image" : "image",
  'http://schema.org/image'                         : "image",
  'http://schema.org/screenshot'                    : "image",
  'http://schema.org/logo'                          : "image",
  "https://github.com/solid/organizations/tree/main/vocabularies/oar.ttl#videoCallPage" : "videoCall",
  'http://schema.org/service-endpoint'              : "serviceEndpoint",
  'http://rdfs.org/sioc/services#service_endpoint'  : "serviceEndpoint",
  'http://usefulinc.com/ns/doap#service_endpoint'   : "serviceEndpoint",
  'http://usefulinc.com/ns/doap#repository'         : "repository",
  'http://usefulinc.com/ns/doap#homepage'           : "homepage",
  'http://schema.org/webpage'                       : "homepage",
  'http://schema.org/alternateName'                 : "alternateName",
  'http://schema.org/url'                           : "webpage",
  'http://xmlns.com/foaf/0.1/homepage'              : "homepage",
  "http://www.w3.org/ns/dcat#landingPage"           : "landingPage"
};
