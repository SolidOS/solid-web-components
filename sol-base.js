const host = "http://localhost:8443";
window.SolidAppContext = {
  noAuth : host,
  webId : host + "/profile/card#me",
  scroll : 200 // for eyeFocus, should be height of top banner
}
window.$SolidTestEnvironment = {
  iconBase : "/assets/icons/",
  originalIconBase : "/assets/originalIcons/",
}
