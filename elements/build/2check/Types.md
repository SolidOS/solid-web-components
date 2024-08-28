
siocs:Service

  GeneralPodService
    A service providing Solid  Authentication and Storage for any purpose.

  SpecializedPodService
    A service providing Solid authentication and storage for a specific purpose, community, or ororganization.

  
  siocs:Forum
    sioct:MailingList
    sioct:ChatChannel
    sioct:MessageBoard

schema:Event
    meet:Meeting

schema:SoftwareApplication
  oar:TestSuite
schema:CreativeWork
  oar:LearningResource
  oar:Specification
  owl:Ontology
  oar:UseCase
schema:Person
schema:Organization



:SleepyBike       dc:subject "housing", "travel", "resource sharing" ;
:PASS             dc:subject "housing", "homelessness", "access to public resources" ; 
:WelcomeToMyPlace dc:subject "housing" "resource sharing" ;
:SolidHealth      dc:subject "health","indigenous communities" ;
:MutualAid        dc:subject "resource sharing" ;
:Mycelium         dc:subject "food", "small farms", "resource sharing",  "resource management" ;
:HUBL             dc:subject "employment","resource sharing" ;
:DigitalFlanders  dc:subject "employment", "credentials", "licensing" ;

###
# siocs:Service
###
:SleepyBike
  a  siocs:Service, schema:EntryPoint ;
  dc:subject "housing", "travel", "resource exchange" ;
  schema:name  "sleepy.bike" ;
  siocs:service_endpoint <https://sleepy.bike/> ;
  siocs:service_protocol :Solid, :Solid-OIDC ;
  siocs:service_of :OpenHospitalityNetwork ;
  schema:actionApplication :CSS, :SleepyBikePlatform;
  schema:description      """
    A decentralized hospitality exchange community for slow travellers.
  """ .

:PASS
  a  schema:SoftwareApplication ;
  dc:subject "housing", "homelessness", "access to public resources" ;
  schema:name       "Personalized Access System for Services" ;
  schema:alternateName  "PASS" ;
  schema:provider   :CodePDX ;
  doap:wiki       <https://github.com/codeforpdx/PASS/wiki> ;
  doap:repository <https://github.com/codeforpdx/PASS> ;
  schema:description """
    An open source digital wallet for providing home-insecure individuals a safe
    place to store documents within their control. PASS additionally aims to assist 
    caseworkers with processing and providing documents needed to complete the 
    housing-assistance application process.
  """ .

  schema:name  "sleepy.bike" ;
  siocs:service_endpoint <https://sleepy.bike/> ;
  siocs:service_protocol :Solid, :Solid-OIDC ;
  siocs:service_of :OpenHospitalityNetwork ;
  schema:actionApplication :CSS, :SleepyBikePlatform;
  schema:description      """
    A decentralized hospitality exchange community for slow travellers.
  """ .
