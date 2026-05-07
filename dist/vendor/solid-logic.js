if (typeof globalThis.process === "undefined") {
  globalThis.process = {
    env: {}, browser: true, version: "", versions: { node: "" },
    nextTick: (cb, ...a) => Promise.resolve().then(() => cb(...a)),
    cwd: () => "/", platform: "browser",
  };
}
import * as __WEBPACK_EXTERNAL_MODULE_rdflib__ from 'rdflib';

/******/ var __webpack_modules__ = ({

/***/ 516
(module) {

!function t(e,r){module.exports=r();}(this,(function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:false,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=true,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:true,get:n});},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:true});},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:true,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function e(){return t.default}:function e(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=22)}([function(t,e,r){Object.defineProperty(e,"__esModule",{value:true});var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();var i={debug:function t(){},info:function t(){},warn:function t(){},error:function t(){}},o=void 0,s=void 0;(e.Log=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.reset=function t(){s=3,o=i;},t.debug=function t(){if(s>=4){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];o.debug.apply(o,Array.from(r));}},t.info=function t(){if(s>=3){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];o.info.apply(o,Array.from(r));}},t.warn=function t(){if(s>=2){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];o.warn.apply(o,Array.from(r));}},t.error=function t(){if(s>=1){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];o.error.apply(o,Array.from(r));}},n(t,null,[{key:"NONE",get:function t(){return 0}},{key:"ERROR",get:function t(){return 1}},{key:"WARN",get:function t(){return 2}},{key:"INFO",get:function t(){return 3}},{key:"DEBUG",get:function t(){return 4}},{key:"level",get:function t(){return s},set:function t(e){if(!(0<=e&&e<=4))throw new Error("Invalid log level");s=e;}},{key:"logger",get:function t(){return o},set:function t(e){if(!e.debug&&e.info&&(e.debug=e.info),!(e.debug&&e.info&&e.warn&&e.error))throw new Error("Invalid logger");o=e;}}]),t}()).reset();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true});var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();var i={setInterval:function(t){function e(e,r){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}((function(t,e){return setInterval(t,e)})),clearInterval:function(t){function e(e){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}((function(t){return clearInterval(t)}))},o=false,s=null;e.Global=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t._testing=function t(){o=true;},t.setXMLHttpRequest=function t(e){s=e;},n(t,null,[{key:"location",get:function t(){if(!o)return location}},{key:"localStorage",get:function t(){if(!o&&"undefined"!=typeof window)return localStorage}},{key:"sessionStorage",get:function t(){if(!o&&"undefined"!=typeof window)return sessionStorage}},{key:"XMLHttpRequest",get:function t(){if(!o&&"undefined"!=typeof window)return s||XMLHttpRequest}},{key:"timer",get:function t(){if(!o)return i}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.MetadataService=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(7);function s(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var a=".well-known/openid-configuration";e.MetadataService=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:o.JsonService;if(s(this,t),!e)throw i.Log.error("MetadataService: No settings passed to MetadataService"),new Error("settings");this._settings=e,this._jsonService=new r(["application/jwk-set+json"]);}return t.prototype.resetSigningKeys=function t(){this._settings=this._settings||{},this._settings.signingKeys=void 0;},t.prototype.getMetadata=function t(){var e=this;return this._settings.metadata?(i.Log.debug("MetadataService.getMetadata: Returning metadata from settings"),Promise.resolve(this._settings.metadata)):this.metadataUrl?(i.Log.debug("MetadataService.getMetadata: getting metadata from",this.metadataUrl),this._jsonService.getJson(this.metadataUrl).then((function(t){i.Log.debug("MetadataService.getMetadata: json received");var r=e._settings.metadataSeed||{};return e._settings.metadata=Object.assign({},r,t),e._settings.metadata}))):(i.Log.error("MetadataService.getMetadata: No authority or metadataUrl configured on settings"),Promise.reject(new Error("No authority or metadataUrl configured on settings")))},t.prototype.getIssuer=function t(){return this._getMetadataProperty("issuer")},t.prototype.getAuthorizationEndpoint=function t(){return this._getMetadataProperty("authorization_endpoint")},t.prototype.getUserInfoEndpoint=function t(){return this._getMetadataProperty("userinfo_endpoint")},t.prototype.getTokenEndpoint=function t(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];return this._getMetadataProperty("token_endpoint",e)},t.prototype.getCheckSessionIframe=function t(){return this._getMetadataProperty("check_session_iframe",true)},t.prototype.getEndSessionEndpoint=function t(){return this._getMetadataProperty("end_session_endpoint",true)},t.prototype.getRevocationEndpoint=function t(){return this._getMetadataProperty("revocation_endpoint",true)},t.prototype.getKeysEndpoint=function t(){return this._getMetadataProperty("jwks_uri",true)},t.prototype._getMetadataProperty=function t(e){var r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return i.Log.debug("MetadataService.getMetadataProperty for: "+e),this.getMetadata().then((function(t){if(i.Log.debug("MetadataService.getMetadataProperty: metadata recieved"),void 0===t[e]){if(true===r)return void i.Log.warn("MetadataService.getMetadataProperty: Metadata does not contain optional property "+e);throw i.Log.error("MetadataService.getMetadataProperty: Metadata does not contain property "+e),new Error("Metadata does not contain property "+e)}return t[e]}))},t.prototype.getSigningKeys=function t(){var e=this;return this._settings.signingKeys?(i.Log.debug("MetadataService.getSigningKeys: Returning signingKeys from settings"),Promise.resolve(this._settings.signingKeys)):this._getMetadataProperty("jwks_uri").then((function(t){return i.Log.debug("MetadataService.getSigningKeys: jwks_uri received",t),e._jsonService.getJson(t).then((function(t){if(i.Log.debug("MetadataService.getSigningKeys: key set received",t),!t.keys)throw i.Log.error("MetadataService.getSigningKeys: Missing keys on keyset"),new Error("Missing keys on keyset");return e._settings.signingKeys=t.keys,e._settings.signingKeys}))}))},n(t,[{key:"metadataUrl",get:function t(){return this._metadataUrl||(this._settings.metadataUrl?this._metadataUrl=this._settings.metadataUrl:(this._metadataUrl=this._settings.authority,this._metadataUrl&&this._metadataUrl.indexOf(a)<0&&("/"!==this._metadataUrl[this._metadataUrl.length-1]&&(this._metadataUrl+="/"),this._metadataUrl+=a))),this._metadataUrl}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.UrlUtility=void 0;var n=r(0),i=r(1);e.UrlUtility=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.addQueryParam=function t(e,r,n){return e.indexOf("?")<0&&(e+="?"),"?"!==e[e.length-1]&&(e+="&"),e+=encodeURIComponent(r),e+="=",e+=encodeURIComponent(n)},t.parseUrlFragment=function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"#",o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:i.Global;"string"!=typeof e&&(e=o.location.href);var s=e.lastIndexOf(r);s>=0&&(e=e.substr(s+1)),"?"===r&&(s=e.indexOf("#"))>=0&&(e=e.substr(0,s));for(var a,u={},c=/([^&=]+)=([^&]*)/g,h=0;a=c.exec(e);)if(u[decodeURIComponent(a[1])]=decodeURIComponent(a[2].replace(/\+/g," ")),h++>50)return n.Log.error("UrlUtility.parseUrlFragment: response exceeded expected number of parameters",e),{error:"Response exceeded expected number of parameters"};for(var l in u)return u;return {}},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.JoseUtil=void 0;var n=r(26),i=function o(t){return t&&t.__esModule?t:{default:t}}(r(33));e.JoseUtil=(0, i.default)({jws:n.jws,KeyUtil:n.KeyUtil,X509:n.X509,crypto:n.crypto,hextob64u:n.hextob64u,b64tohex:n.b64tohex,AllowedSigningAlgs:n.AllowedSigningAlgs});},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.OidcClientSettings=void 0;var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),o=r(0),s=r(23),a=r(6),u=r(24),c=r(2);function h(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var l=".well-known/openid-configuration",f="id_token",g="openid",d="client_secret_post";e.OidcClientSettings=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.authority,i=e.metadataUrl,o=e.metadata,l=e.signingKeys,p=e.metadataSeed,v=e.client_id,y=e.client_secret,m=e.response_type,_=void 0===m?f:m,S=e.scope,b=void 0===S?g:S,w=e.redirect_uri,F=e.post_logout_redirect_uri,E=e.client_authentication,x=void 0===E?d:E,A=e.prompt,k=e.display,P=e.max_age,C=e.ui_locales,T=e.acr_values,R=e.resource,I=e.response_mode,D=e.filterProtocolClaims,L=void 0===D||D,N=e.loadUserInfo,U=void 0===N||N,B=e.staleStateAge,O=void 0===B?900:B,j=e.clockSkew,M=void 0===j?300:j,H=e.clockService,V=void 0===H?new s.ClockService:H,K=e.userInfoJwtIssuer,q=void 0===K?"OP":K,J=e.mergeClaims,W=void 0!==J&&J,z=e.stateStore,Y=void 0===z?new a.WebStorageStateStore:z,G=e.ResponseValidatorCtor,X=void 0===G?u.ResponseValidator:G,$=e.MetadataServiceCtor,Q=void 0===$?c.MetadataService:$,Z=e.extraQueryParams,tt=void 0===Z?{}:Z,et=e.extraTokenParams,rt=void 0===et?{}:et;h(this,t),this._authority=r,this._metadataUrl=i,this._metadata=o,this._metadataSeed=p,this._signingKeys=l,this._client_id=v,this._client_secret=y,this._response_type=_,this._scope=b,this._redirect_uri=w,this._post_logout_redirect_uri=F,this._client_authentication=x,this._prompt=A,this._display=k,this._max_age=P,this._ui_locales=C,this._acr_values=T,this._resource=R,this._response_mode=I,this._filterProtocolClaims=!!L,this._loadUserInfo=!!U,this._staleStateAge=O,this._clockSkew=M,this._clockService=V,this._userInfoJwtIssuer=q,this._mergeClaims=!!W,this._stateStore=Y,this._validator=new X(this),this._metadataService=new Q(this),this._extraQueryParams="object"===(void 0===tt?"undefined":n(tt))?tt:{},this._extraTokenParams="object"===(void 0===rt?"undefined":n(rt))?rt:{};}return t.prototype.getEpochTime=function t(){return this._clockService.getEpochTime()},i(t,[{key:"client_id",get:function t(){return this._client_id},set:function t(e){if(this._client_id)throw o.Log.error("OidcClientSettings.set_client_id: client_id has already been assigned."),new Error("client_id has already been assigned.");this._client_id=e;}},{key:"client_secret",get:function t(){return this._client_secret}},{key:"response_type",get:function t(){return this._response_type}},{key:"scope",get:function t(){return this._scope}},{key:"redirect_uri",get:function t(){return this._redirect_uri}},{key:"post_logout_redirect_uri",get:function t(){return this._post_logout_redirect_uri}},{key:"client_authentication",get:function t(){return this._client_authentication}},{key:"prompt",get:function t(){return this._prompt}},{key:"display",get:function t(){return this._display}},{key:"max_age",get:function t(){return this._max_age}},{key:"ui_locales",get:function t(){return this._ui_locales}},{key:"acr_values",get:function t(){return this._acr_values}},{key:"resource",get:function t(){return this._resource}},{key:"response_mode",get:function t(){return this._response_mode}},{key:"authority",get:function t(){return this._authority},set:function t(e){if(this._authority)throw o.Log.error("OidcClientSettings.set_authority: authority has already been assigned."),new Error("authority has already been assigned.");this._authority=e;}},{key:"metadataUrl",get:function t(){return this._metadataUrl||(this._metadataUrl=this.authority,this._metadataUrl&&this._metadataUrl.indexOf(l)<0&&("/"!==this._metadataUrl[this._metadataUrl.length-1]&&(this._metadataUrl+="/"),this._metadataUrl+=l)),this._metadataUrl}},{key:"metadata",get:function t(){return this._metadata},set:function t(e){this._metadata=e;}},{key:"metadataSeed",get:function t(){return this._metadataSeed},set:function t(e){this._metadataSeed=e;}},{key:"signingKeys",get:function t(){return this._signingKeys},set:function t(e){this._signingKeys=e;}},{key:"filterProtocolClaims",get:function t(){return this._filterProtocolClaims}},{key:"loadUserInfo",get:function t(){return this._loadUserInfo}},{key:"staleStateAge",get:function t(){return this._staleStateAge}},{key:"clockSkew",get:function t(){return this._clockSkew}},{key:"userInfoJwtIssuer",get:function t(){return this._userInfoJwtIssuer}},{key:"mergeClaims",get:function t(){return this._mergeClaims}},{key:"stateStore",get:function t(){return this._stateStore}},{key:"validator",get:function t(){return this._validator}},{key:"metadataService",get:function t(){return this._metadataService}},{key:"extraQueryParams",get:function t(){return this._extraQueryParams},set:function t(e){"object"===(void 0===e?"undefined":n(e))?this._extraQueryParams=e:this._extraQueryParams={};}},{key:"extraTokenParams",get:function t(){return this._extraTokenParams},set:function t(e){"object"===(void 0===e?"undefined":n(e))?this._extraTokenParams=e:this._extraTokenParams={};}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.WebStorageStateStore=void 0;var n=r(0),i=r(1);function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.WebStorageStateStore=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.prefix,n=void 0===r?"oidc.":r,s=e.store,a=void 0===s?i.Global.localStorage:s;o(this,t),this._store=a,this._prefix=n;}return t.prototype.set=function t(e,r){return n.Log.debug("WebStorageStateStore.set",e),e=this._prefix+e,this._store.setItem(e,r),Promise.resolve()},t.prototype.get=function t(e){n.Log.debug("WebStorageStateStore.get",e),e=this._prefix+e;var r=this._store.getItem(e);return Promise.resolve(r)},t.prototype.remove=function t(e){n.Log.debug("WebStorageStateStore.remove",e),e=this._prefix+e;var r=this._store.getItem(e);return this._store.removeItem(e),Promise.resolve(r)},t.prototype.getAllKeys=function t(){n.Log.debug("WebStorageStateStore.getAllKeys");for(var e=[],r=0;r<this._store.length;r++){var i=this._store.key(r);0===i.indexOf(this._prefix)&&e.push(i.substr(this._prefix.length));}return Promise.resolve(e)},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.JsonService=void 0;var n=r(0),i=r(1);function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.JsonService=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:i.Global.XMLHttpRequest,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;o(this,t),e&&Array.isArray(e)?this._contentTypes=e.slice():this._contentTypes=[],this._contentTypes.push("application/json"),n&&this._contentTypes.push("application/jwt"),this._XMLHttpRequest=r,this._jwtHandler=n;}return t.prototype.getJson=function t(e,r){var i=this;if(!e)throw n.Log.error("JsonService.getJson: No url passed"),new Error("url");return n.Log.debug("JsonService.getJson, url: ",e),new Promise((function(t,o){var s=new i._XMLHttpRequest;s.open("GET",e);var a=i._contentTypes,u=i._jwtHandler;s.onload=function(){if(n.Log.debug("JsonService.getJson: HTTP response received, status",s.status),200===s.status){var r=s.getResponseHeader("Content-Type");if(r){var i=a.find((function(t){if(r.startsWith(t))return  true}));if("application/jwt"==i)return void u(s).then(t,o);if(i)try{return void t(JSON.parse(s.responseText))}catch(t){return n.Log.error("JsonService.getJson: Error parsing JSON response",t.message),void o(t)}}o(Error("Invalid response Content-Type: "+r+", from URL: "+e));}else o(Error(s.statusText+" ("+s.status+")"));},s.onerror=function(){n.Log.error("JsonService.getJson: network error"),o(Error("Network Error"));},r&&(n.Log.debug("JsonService.getJson: token passed, setting Authorization header"),s.setRequestHeader("Authorization","Bearer "+r)),s.send();}))},t.prototype.postForm=function t(e,r,i){var o=this;if(!e)throw n.Log.error("JsonService.postForm: No url passed"),new Error("url");return n.Log.debug("JsonService.postForm, url: ",e),new Promise((function(t,s){var a=new o._XMLHttpRequest;a.open("POST",e);var u=o._contentTypes;a.onload=function(){if(n.Log.debug("JsonService.postForm: HTTP response received, status",a.status),200!==a.status){if(400===a.status)if(i=a.getResponseHeader("Content-Type"))if(u.find((function(t){if(i.startsWith(t))return  true})))try{var r=JSON.parse(a.responseText);if(r&&r.error)return n.Log.error("JsonService.postForm: Error from server: ",r.error),void s(new Error(r.error))}catch(t){return n.Log.error("JsonService.postForm: Error parsing JSON response",t.message),void s(t)}s(Error(a.statusText+" ("+a.status+")"));}else {var i;if((i=a.getResponseHeader("Content-Type"))&&u.find((function(t){if(i.startsWith(t))return  true})))try{return void t(JSON.parse(a.responseText))}catch(t){return n.Log.error("JsonService.postForm: Error parsing JSON response",t.message),void s(t)}s(Error("Invalid response Content-Type: "+i+", from URL: "+e));}},a.onerror=function(){n.Log.error("JsonService.postForm: network error"),s(Error("Network Error"));};var c="";for(var h in r){var l=r[h];l&&(c.length>0&&(c+="&"),c+=encodeURIComponent(h),c+="=",c+=encodeURIComponent(l));}a.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),void 0!==i&&a.setRequestHeader("Authorization","Basic "+btoa(i)),a.send(c);}))},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SigninRequest=void 0;var n=r(0),i=r(3),o=r(13);e.SigninRequest=function(){function t(e){var r=e.url,s=e.client_id,a=e.redirect_uri,u=e.response_type,c=e.scope,h=e.authority,l=e.data,f=e.prompt,g=e.display,d=e.max_age,p=e.ui_locales,v=e.id_token_hint,y=e.login_hint,m=e.acr_values,_=e.resource,S=e.response_mode,b=e.request,w=e.request_uri,F=e.extraQueryParams,E=e.request_type,x=e.client_secret,A=e.extraTokenParams,k=e.skipUserInfo;if(function P(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),!r)throw n.Log.error("SigninRequest.ctor: No url passed"),new Error("url");if(!s)throw n.Log.error("SigninRequest.ctor: No client_id passed"),new Error("client_id");if(!a)throw n.Log.error("SigninRequest.ctor: No redirect_uri passed"),new Error("redirect_uri");if(!u)throw n.Log.error("SigninRequest.ctor: No response_type passed"),new Error("response_type");if(!c)throw n.Log.error("SigninRequest.ctor: No scope passed"),new Error("scope");if(!h)throw n.Log.error("SigninRequest.ctor: No authority passed"),new Error("authority");var C=t.isOidc(u),T=t.isCode(u);S||(S=t.isCode(u)?"query":null),this.state=new o.SigninState({nonce:C,data:l,client_id:s,authority:h,redirect_uri:a,code_verifier:T,request_type:E,response_mode:S,client_secret:x,scope:c,extraTokenParams:A,skipUserInfo:k}),r=i.UrlUtility.addQueryParam(r,"client_id",s),r=i.UrlUtility.addQueryParam(r,"redirect_uri",a),r=i.UrlUtility.addQueryParam(r,"response_type",u),r=i.UrlUtility.addQueryParam(r,"scope",c),r=i.UrlUtility.addQueryParam(r,"state",this.state.id),C&&(r=i.UrlUtility.addQueryParam(r,"nonce",this.state.nonce)),T&&(r=i.UrlUtility.addQueryParam(r,"code_challenge",this.state.code_challenge),r=i.UrlUtility.addQueryParam(r,"code_challenge_method","S256"));var R={prompt:f,display:g,max_age:d,ui_locales:p,id_token_hint:v,login_hint:y,acr_values:m,resource:_,request:b,request_uri:w,response_mode:S};for(var I in R)R[I]&&(r=i.UrlUtility.addQueryParam(r,I,R[I]));for(var D in F)r=i.UrlUtility.addQueryParam(r,D,F[D]);this.url=r;}return t.isOidc=function t(e){return !!e.split(/\s+/g).filter((function(t){return "id_token"===t}))[0]},t.isOAuth=function t(e){return !!e.split(/\s+/g).filter((function(t){return "token"===t}))[0]},t.isCode=function t(e){return !!e.split(/\s+/g).filter((function(t){return "code"===t}))[0]},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.State=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=function s(t){return t&&t.__esModule?t:{default:t}}(r(14));function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.State=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.id,n=e.data,i=e.created,s=e.request_type;a(this,t),this._id=r||(0, o.default)(),this._data=n,this._created="number"==typeof i&&i>0?i:parseInt(Date.now()/1e3),this._request_type=s;}return t.prototype.toStorageString=function t(){return i.Log.debug("State.toStorageString"),JSON.stringify({id:this.id,data:this.data,created:this.created,request_type:this.request_type})},t.fromStorageString=function e(r){return i.Log.debug("State.fromStorageString"),new t(JSON.parse(r))},t.clearStaleState=function e(r,n){var o=Date.now()/1e3-n;return r.getAllKeys().then((function(e){i.Log.debug("State.clearStaleState: got keys",e);for(var n=[],s=function s(a){var c=e[a];u=r.get(c).then((function(e){var n=false;if(e)try{var s=t.fromStorageString(e);i.Log.debug("State.clearStaleState: got item from key: ",c,s.created),s.created<=o&&(n=!0);}catch(t){i.Log.error("State.clearStaleState: Error parsing state for key",c,t.message),n=true;}else i.Log.debug("State.clearStaleState: no item in storage for key: ",c),n=true;if(n)return i.Log.debug("State.clearStaleState: removed item for key: ",c),r.remove(c)})),n.push(u);},a=0;a<e.length;a++){var u;s(a);}return i.Log.debug("State.clearStaleState: waiting on promise count:",n.length),Promise.all(n)}))},n(t,[{key:"id",get:function t(){return this._id}},{key:"data",get:function t(){return this._data}},{key:"created",get:function t(){return this._created}},{key:"request_type",get:function t(){return this._request_type}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.OidcClient=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(5),s=r(12),a=r(8),u=r(34),c=r(35),h=r(36),l=r(13),f=r(9);function g(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.OidcClient=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};g(this,t),e instanceof o.OidcClientSettings?this._settings=e:this._settings=new o.OidcClientSettings(e);}return t.prototype.createSigninRequest=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=r.response_type,o=r.scope,s=r.redirect_uri,u=r.data,c=r.state,h=r.prompt,l=r.display,f=r.max_age,g=r.ui_locales,d=r.id_token_hint,p=r.login_hint,v=r.acr_values,y=r.resource,m=r.request,_=r.request_uri,S=r.response_mode,b=r.extraQueryParams,w=r.extraTokenParams,F=r.request_type,E=r.skipUserInfo,x=arguments[1];i.Log.debug("OidcClient.createSigninRequest");var A=this._settings.client_id;n=n||this._settings.response_type,o=o||this._settings.scope,s=s||this._settings.redirect_uri,h=h||this._settings.prompt,l=l||this._settings.display,f=f||this._settings.max_age,g=g||this._settings.ui_locales,v=v||this._settings.acr_values,y=y||this._settings.resource,S=S||this._settings.response_mode,b=b||this._settings.extraQueryParams,w=w||this._settings.extraTokenParams;var k=this._settings.authority;return a.SigninRequest.isCode(n)&&"code"!==n?Promise.reject(new Error("OpenID Connect hybrid flow is not supported")):this._metadataService.getAuthorizationEndpoint().then((function(t){i.Log.debug("OidcClient.createSigninRequest: Received authorization endpoint",t);var r=new a.SigninRequest({url:t,client_id:A,redirect_uri:s,response_type:n,scope:o,data:u||c,authority:k,prompt:h,display:l,max_age:f,ui_locales:g,id_token_hint:d,login_hint:p,acr_values:v,resource:y,request:m,request_uri:_,extraQueryParams:b,extraTokenParams:w,request_type:F,response_mode:S,client_secret:e._settings.client_secret,skipUserInfo:E}),P=r.state;return (x=x||e._stateStore).set(P.id,P.toStorageString()).then((function(){return r}))}))},t.prototype.readSigninResponseState=function t(e,r){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];i.Log.debug("OidcClient.readSigninResponseState");var o="query"===this._settings.response_mode||!this._settings.response_mode&&a.SigninRequest.isCode(this._settings.response_type),s=o?"?":"#",c=new u.SigninResponse(e,s);if(!c.state)return i.Log.error("OidcClient.readSigninResponseState: No state in response"),Promise.reject(new Error("No state in response"));r=r||this._stateStore;var h=n?r.remove.bind(r):r.get.bind(r);return h(c.state).then((function(t){if(!t)throw i.Log.error("OidcClient.readSigninResponseState: No matching state found in storage"),new Error("No matching state found in storage");return {state:l.SigninState.fromStorageString(t),response:c}}))},t.prototype.processSigninResponse=function t(e,r){var n=this;return i.Log.debug("OidcClient.processSigninResponse"),this.readSigninResponseState(e,r,true).then((function(t){var e=t.state,r=t.response;return i.Log.debug("OidcClient.processSigninResponse: Received state from storage; validating response"),n._validator.validateSigninResponse(e,r)}))},t.prototype.createSignoutRequest=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=r.id_token_hint,o=r.data,s=r.state,a=r.post_logout_redirect_uri,u=r.extraQueryParams,h=r.request_type,l=arguments[1];return i.Log.debug("OidcClient.createSignoutRequest"),a=a||this._settings.post_logout_redirect_uri,u=u||this._settings.extraQueryParams,this._metadataService.getEndSessionEndpoint().then((function(t){if(!t)throw i.Log.error("OidcClient.createSignoutRequest: No end session endpoint url returned"),new Error("no end session endpoint");i.Log.debug("OidcClient.createSignoutRequest: Received end session endpoint",t);var r=new c.SignoutRequest({url:t,id_token_hint:n,post_logout_redirect_uri:a,data:o||s,extraQueryParams:u,request_type:h}),f=r.state;return f&&(i.Log.debug("OidcClient.createSignoutRequest: Signout request has state to persist"),(l=l||e._stateStore).set(f.id,f.toStorageString())),r}))},t.prototype.readSignoutResponseState=function t(e,r){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];i.Log.debug("OidcClient.readSignoutResponseState");var o=new h.SignoutResponse(e);if(!o.state)return i.Log.debug("OidcClient.readSignoutResponseState: No state in response"),o.error?(i.Log.warn("OidcClient.readSignoutResponseState: Response was error: ",o.error),Promise.reject(new s.ErrorResponse(o))):Promise.resolve({state:void 0,response:o});var a=o.state;r=r||this._stateStore;var u=n?r.remove.bind(r):r.get.bind(r);return u(a).then((function(t){if(!t)throw i.Log.error("OidcClient.readSignoutResponseState: No matching state found in storage"),new Error("No matching state found in storage");return {state:f.State.fromStorageString(t),response:o}}))},t.prototype.processSignoutResponse=function t(e,r){var n=this;return i.Log.debug("OidcClient.processSignoutResponse"),this.readSignoutResponseState(e,r,true).then((function(t){var e=t.state,r=t.response;return e?(i.Log.debug("OidcClient.processSignoutResponse: Received state from storage; validating response"),n._validator.validateSignoutResponse(e,r)):(i.Log.debug("OidcClient.processSignoutResponse: No state from storage; skipping validating response"),r)}))},t.prototype.clearStaleState=function t(e){return i.Log.debug("OidcClient.clearStaleState"),e=e||this._stateStore,f.State.clearStaleState(e,this.settings.staleStateAge)},n(t,[{key:"_stateStore",get:function t(){return this.settings.stateStore}},{key:"_validator",get:function t(){return this.settings.validator}},{key:"_metadataService",get:function t(){return this.settings.metadataService}},{key:"settings",get:function t(){return this._settings}},{key:"metadataService",get:function t(){return this._metadataService}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.TokenClient=void 0;var n=r(7),i=r(2),o=r(0);function s(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.TokenClient=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n.JsonService,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:i.MetadataService;if(s(this,t),!e)throw o.Log.error("TokenClient.ctor: No settings passed"),new Error("settings");this._settings=e,this._jsonService=new r,this._metadataService=new a(this._settings);}return t.prototype.exchangeCode=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(r=Object.assign({},r)).grant_type=r.grant_type||"authorization_code",r.client_id=r.client_id||this._settings.client_id,r.client_secret=r.client_secret||this._settings.client_secret,r.redirect_uri=r.redirect_uri||this._settings.redirect_uri;var n=void 0,i=r._client_authentication||this._settings._client_authentication;return delete r._client_authentication,r.code?r.redirect_uri?r.code_verifier?r.client_id?r.client_secret||"client_secret_basic"!=i?("client_secret_basic"==i&&(n=r.client_id+":"+r.client_secret,delete r.client_id,delete r.client_secret),this._metadataService.getTokenEndpoint(false).then((function(t){return o.Log.debug("TokenClient.exchangeCode: Received token endpoint"),e._jsonService.postForm(t,r,n).then((function(t){return o.Log.debug("TokenClient.exchangeCode: response received"),t}))}))):(o.Log.error("TokenClient.exchangeCode: No client_secret passed"),Promise.reject(new Error("A client_secret is required"))):(o.Log.error("TokenClient.exchangeCode: No client_id passed"),Promise.reject(new Error("A client_id is required"))):(o.Log.error("TokenClient.exchangeCode: No code_verifier passed"),Promise.reject(new Error("A code_verifier is required"))):(o.Log.error("TokenClient.exchangeCode: No redirect_uri passed"),Promise.reject(new Error("A redirect_uri is required"))):(o.Log.error("TokenClient.exchangeCode: No code passed"),Promise.reject(new Error("A code is required")))},t.prototype.exchangeRefreshToken=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(r=Object.assign({},r)).grant_type=r.grant_type||"refresh_token",r.client_id=r.client_id||this._settings.client_id,r.client_secret=r.client_secret||this._settings.client_secret;var n=void 0,i=r._client_authentication||this._settings._client_authentication;return delete r._client_authentication,r.refresh_token?r.client_id?("client_secret_basic"==i&&(n=r.client_id+":"+r.client_secret,delete r.client_id,delete r.client_secret),this._metadataService.getTokenEndpoint(false).then((function(t){return o.Log.debug("TokenClient.exchangeRefreshToken: Received token endpoint"),e._jsonService.postForm(t,r,n).then((function(t){return o.Log.debug("TokenClient.exchangeRefreshToken: response received"),t}))}))):(o.Log.error("TokenClient.exchangeRefreshToken: No client_id passed"),Promise.reject(new Error("A client_id is required"))):(o.Log.error("TokenClient.exchangeRefreshToken: No refresh_token passed"),Promise.reject(new Error("A refresh_token is required")))},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.ErrorResponse=void 0;var n=r(0);function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}e.ErrorResponse=function(t){function e(){var r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},s=r.error,a=r.error_description,u=r.error_uri,c=r.state,h=r.session_state;if(i(this,e),!s)throw n.Log.error("No error passed to ErrorResponse"),new Error("error");var l=o(this,t.call(this,a||s));return l.name="ErrorResponse",l.error=s,l.error_description=a,l.error_uri=u,l.state=c,l.session_state=h,l}return function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,t),e}(Error);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SigninState=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(9),s=r(4),a=function u(t){return t&&t.__esModule?t:{default:t}}(r(14));function c(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function h(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}e.SigninState=function(t){function e(){var r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=r.nonce,i=r.authority,o=r.client_id,u=r.redirect_uri,l=r.code_verifier,f=r.response_mode,g=r.client_secret,d=r.scope,p=r.extraTokenParams,v=r.skipUserInfo;c(this,e);var y=h(this,t.call(this,arguments[0]));if(true===n?y._nonce=(0, a.default)():n&&(y._nonce=n),true===l?y._code_verifier=(0, a.default)()+(0, a.default)()+(0, a.default)():l&&(y._code_verifier=l),y.code_verifier){var m=s.JoseUtil.hashString(y.code_verifier,"SHA256");y._code_challenge=s.JoseUtil.hexToBase64Url(m);}return y._redirect_uri=u,y._authority=i,y._client_id=o,y._response_mode=f,y._client_secret=g,y._scope=d,y._extraTokenParams=p,y._skipUserInfo=v,y}return function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,t),e.prototype.toStorageString=function t(){return i.Log.debug("SigninState.toStorageString"),JSON.stringify({id:this.id,data:this.data,created:this.created,request_type:this.request_type,nonce:this.nonce,code_verifier:this.code_verifier,redirect_uri:this.redirect_uri,authority:this.authority,client_id:this.client_id,response_mode:this.response_mode,client_secret:this.client_secret,scope:this.scope,extraTokenParams:this.extraTokenParams,skipUserInfo:this.skipUserInfo})},e.fromStorageString=function t(r){return i.Log.debug("SigninState.fromStorageString"),new e(JSON.parse(r))},n(e,[{key:"nonce",get:function t(){return this._nonce}},{key:"authority",get:function t(){return this._authority}},{key:"client_id",get:function t(){return this._client_id}},{key:"redirect_uri",get:function t(){return this._redirect_uri}},{key:"code_verifier",get:function t(){return this._code_verifier}},{key:"code_challenge",get:function t(){return this._code_challenge}},{key:"response_mode",get:function t(){return this._response_mode}},{key:"client_secret",get:function t(){return this._client_secret}},{key:"scope",get:function t(){return this._scope}},{key:"extraTokenParams",get:function t(){return this._extraTokenParams}},{key:"skipUserInfo",get:function t(){return this._skipUserInfo}}]),e}(o.State);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.default=function n(){return ("undefined"!=i&&null!==i&&void 0!==i.getRandomValues?o:s)().replace(/-/g,"")};var i="undefined"!=typeof window?window.crypto||window.msCrypto:null;function o(){return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(function(t){return (t^i.getRandomValues(new Uint8Array(1))[0]&15>>t/4).toString(16)}))}function s(){return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(function(t){return (t^16*Math.random()>>t/4).toString(16)}))}t.exports=e.default;},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.User=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0);e.User=function(){function t(e){var r=e.id_token,n=e.session_state,i=e.access_token,o=e.refresh_token,s=e.token_type,a=e.scope,u=e.profile,c=e.expires_at,h=e.state;!function l(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.id_token=r,this.session_state=n,this.access_token=i,this.refresh_token=o,this.token_type=s,this.scope=a,this.profile=u,this.expires_at=c,this.state=h;}return t.prototype.toStorageString=function t(){return i.Log.debug("User.toStorageString"),JSON.stringify({id_token:this.id_token,session_state:this.session_state,access_token:this.access_token,refresh_token:this.refresh_token,token_type:this.token_type,scope:this.scope,profile:this.profile,expires_at:this.expires_at})},t.fromStorageString=function e(r){return i.Log.debug("User.fromStorageString"),new t(JSON.parse(r))},n(t,[{key:"expires_in",get:function t(){if(this.expires_at){var e=parseInt(Date.now()/1e3);return this.expires_at-e}},set:function t(e){var r=parseInt(e);if("number"==typeof r&&r>0){var n=parseInt(Date.now()/1e3);this.expires_at=n+r;}}},{key:"expired",get:function t(){var e=this.expires_in;if(void 0!==e)return e<=0}},{key:"scopes",get:function t(){return (this.scope||"").split(" ")}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.AccessTokenEvents=void 0;var n=r(0),i=r(46);function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.AccessTokenEvents=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.accessTokenExpiringNotificationTime,n=void 0===r?60:r,s=e.accessTokenExpiringTimer,a=void 0===s?new i.Timer("Access token expiring"):s,u=e.accessTokenExpiredTimer,c=void 0===u?new i.Timer("Access token expired"):u;o(this,t),this._accessTokenExpiringNotificationTime=n,this._accessTokenExpiring=a,this._accessTokenExpired=c;}return t.prototype.load=function t(e){if(e.access_token&&void 0!==e.expires_in){var r=e.expires_in;if(n.Log.debug("AccessTokenEvents.load: access token present, remaining duration:",r),r>0){var i=r-this._accessTokenExpiringNotificationTime;i<=0&&(i=1),n.Log.debug("AccessTokenEvents.load: registering expiring timer in:",i),this._accessTokenExpiring.init(i);}else n.Log.debug("AccessTokenEvents.load: canceling existing expiring timer becase we're past expiration."),this._accessTokenExpiring.cancel();var o=r+1;n.Log.debug("AccessTokenEvents.load: registering expired timer in:",o),this._accessTokenExpired.init(o);}else this._accessTokenExpiring.cancel(),this._accessTokenExpired.cancel();},t.prototype.unload=function t(){n.Log.debug("AccessTokenEvents.unload: canceling existing access token timers"),this._accessTokenExpiring.cancel(),this._accessTokenExpired.cancel();},t.prototype.addAccessTokenExpiring=function t(e){this._accessTokenExpiring.addHandler(e);},t.prototype.removeAccessTokenExpiring=function t(e){this._accessTokenExpiring.removeHandler(e);},t.prototype.addAccessTokenExpired=function t(e){this._accessTokenExpired.addHandler(e);},t.prototype.removeAccessTokenExpired=function t(e){this._accessTokenExpired.removeHandler(e);},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.Event=void 0;var n=r(0);e.Event=function(){function t(e){!function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._name=e,this._callbacks=[];}return t.prototype.addHandler=function t(e){this._callbacks.push(e);},t.prototype.removeHandler=function t(e){var r=this._callbacks.findIndex((function(t){return t===e}));r>=0&&this._callbacks.splice(r,1);},t.prototype.raise=function t(){n.Log.debug("Event: Raising event: "+this._name);for(var e=0;e<this._callbacks.length;e++){var r;(r=this._callbacks)[e].apply(r,arguments);}},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SessionMonitor=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(19),s=r(1);function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.SessionMonitor=function(){function t(e){var r=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:o.CheckSessionIFrame,u=arguments.length>2&&void 0!==arguments[2]?arguments[2]:s.Global.timer;if(a(this,t),!e)throw i.Log.error("SessionMonitor.ctor: No user manager passed to SessionMonitor"),new Error("userManager");this._userManager=e,this._CheckSessionIFrameCtor=n,this._timer=u,this._userManager.events.addUserLoaded(this._start.bind(this)),this._userManager.events.addUserUnloaded(this._stop.bind(this)),Promise.resolve(this._userManager.getUser().then((function(t){t?r._start(t):r._settings.monitorAnonymousSession&&r._userManager.querySessionStatus().then((function(t){var e={session_state:t.session_state};t.sub&&t.sid&&(e.profile={sub:t.sub,sid:t.sid}),r._start(e);})).catch((function(t){i.Log.error("SessionMonitor ctor: error from querySessionStatus:",t.message);}));})).catch((function(t){i.Log.error("SessionMonitor ctor: error from getUser:",t.message);})));}return t.prototype._start=function t(e){var r=this,n=e.session_state;n&&(e.profile?(this._sub=e.profile.sub,this._sid=e.profile.sid,i.Log.debug("SessionMonitor._start: session_state:",n,", sub:",this._sub)):(this._sub=void 0,this._sid=void 0,i.Log.debug("SessionMonitor._start: session_state:",n,", anonymous user")),this._checkSessionIFrame?this._checkSessionIFrame.start(n):this._metadataService.getCheckSessionIframe().then((function(t){if(t){i.Log.debug("SessionMonitor._start: Initializing check session iframe");var e=r._client_id,o=r._checkSessionInterval,s=r._stopCheckSessionOnError;r._checkSessionIFrame=new r._CheckSessionIFrameCtor(r._callback.bind(r),e,t,o,s),r._checkSessionIFrame.load().then((function(){r._checkSessionIFrame.start(n);}));}else i.Log.warn("SessionMonitor._start: No check session iframe found in the metadata");})).catch((function(t){i.Log.error("SessionMonitor._start: Error from getCheckSessionIframe:",t.message);})));},t.prototype._stop=function t(){var e=this;if(this._sub=void 0,this._sid=void 0,this._checkSessionIFrame&&(i.Log.debug("SessionMonitor._stop"),this._checkSessionIFrame.stop()),this._settings.monitorAnonymousSession)var r=this._timer.setInterval((function(){e._timer.clearInterval(r),e._userManager.querySessionStatus().then((function(t){var r={session_state:t.session_state};t.sub&&t.sid&&(r.profile={sub:t.sub,sid:t.sid}),e._start(r);})).catch((function(t){i.Log.error("SessionMonitor: error from querySessionStatus:",t.message);}));}),1e3);},t.prototype._callback=function t(){var e=this;this._userManager.querySessionStatus().then((function(t){var r=true;t?t.sub===e._sub?(r=false,e._checkSessionIFrame.start(t.session_state),t.sid===e._sid?i.Log.debug("SessionMonitor._callback: Same sub still logged in at OP, restarting check session iframe; session_state:",t.session_state):(i.Log.debug("SessionMonitor._callback: Same sub still logged in at OP, session state has changed, restarting check session iframe; session_state:",t.session_state),e._userManager.events._raiseUserSessionChanged())):i.Log.debug("SessionMonitor._callback: Different subject signed into OP:",t.sub):i.Log.debug("SessionMonitor._callback: Subject no longer signed into OP"),r&&(e._sub?(i.Log.debug("SessionMonitor._callback: SessionMonitor._callback; raising signed out event"),e._userManager.events._raiseUserSignedOut()):(i.Log.debug("SessionMonitor._callback: SessionMonitor._callback; raising signed in event"),e._userManager.events._raiseUserSignedIn()));})).catch((function(t){e._sub&&(i.Log.debug("SessionMonitor._callback: Error calling queryCurrentSigninSession; raising signed out event",t.message),e._userManager.events._raiseUserSignedOut());}));},n(t,[{key:"_settings",get:function t(){return this._userManager.settings}},{key:"_metadataService",get:function t(){return this._userManager.metadataService}},{key:"_client_id",get:function t(){return this._settings.client_id}},{key:"_checkSessionInterval",get:function t(){return this._settings.checkSessionInterval}},{key:"_stopCheckSessionOnError",get:function t(){return this._settings.stopCheckSessionOnError}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.CheckSessionIFrame=void 0;var n=r(0);function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.CheckSessionIFrame=function(){function t(e,r,n,o){var s=!(arguments.length>4&&void 0!==arguments[4])||arguments[4];i(this,t),this._callback=e,this._client_id=r,this._url=n,this._interval=o||2e3,this._stopOnError=s;var a=n.indexOf("/",n.indexOf("//")+2);this._frame_origin=n.substr(0,a),this._frame=window.document.createElement("iframe"),this._frame.style.visibility="hidden",this._frame.style.position="absolute",this._frame.style.display="none",this._frame.width=0,this._frame.height=0,this._frame.src=n;}return t.prototype.load=function t(){var e=this;return new Promise((function(t){e._frame.onload=function(){t();},window.document.body.appendChild(e._frame),e._boundMessageEvent=e._message.bind(e),window.addEventListener("message",e._boundMessageEvent,false);}))},t.prototype._message=function t(e){e.origin===this._frame_origin&&e.source===this._frame.contentWindow&&("error"===e.data?(n.Log.error("CheckSessionIFrame: error message from check session op iframe"),this._stopOnError&&this.stop()):"changed"===e.data?(n.Log.debug("CheckSessionIFrame: changed message from check session op iframe"),this.stop(),this._callback()):n.Log.debug("CheckSessionIFrame: "+e.data+" message from check session op iframe"));},t.prototype.start=function t(e){var r=this;if(this._session_state!==e){n.Log.debug("CheckSessionIFrame.start"),this.stop(),this._session_state=e;var i=function t(){r._frame.contentWindow.postMessage(r._client_id+" "+r._session_state,r._frame_origin);};i(),this._timer=window.setInterval(i,this._interval);}},t.prototype.stop=function t(){this._session_state=null,this._timer&&(n.Log.debug("CheckSessionIFrame.stop"),window.clearInterval(this._timer),this._timer=null);},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.TokenRevocationClient=void 0;var n=r(0),i=r(2),o=r(1);function s(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var a="access_token",u="refresh_token";e.TokenRevocationClient=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:o.Global.XMLHttpRequest,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:i.MetadataService;if(s(this,t),!e)throw n.Log.error("TokenRevocationClient.ctor: No settings provided"),new Error("No settings provided.");this._settings=e,this._XMLHttpRequestCtor=r,this._metadataService=new a(this._settings);}return t.prototype.revoke=function t(e,r){var i=this,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"access_token";if(!e)throw n.Log.error("TokenRevocationClient.revoke: No token provided"),new Error("No token provided.");if(o!==a&&o!=u)throw n.Log.error("TokenRevocationClient.revoke: Invalid token type"),new Error("Invalid token type.");return this._metadataService.getRevocationEndpoint().then((function(t){if(t){n.Log.debug("TokenRevocationClient.revoke: Revoking "+o);var s=i._settings.client_id,a=i._settings.client_secret;return i._revoke(t,s,a,e,o)}if(r)throw n.Log.error("TokenRevocationClient.revoke: Revocation not supported"),new Error("Revocation not supported")}))},t.prototype._revoke=function t(e,r,i,o,s){var a=this;return new Promise((function(t,u){var c=new a._XMLHttpRequestCtor;c.open("POST",e),c.onload=function(){n.Log.debug("TokenRevocationClient.revoke: HTTP response received, status",c.status),200===c.status?t():u(Error(c.statusText+" ("+c.status+")"));},c.onerror=function(){n.Log.debug("TokenRevocationClient.revoke: Network Error."),u("Network Error");};var h="client_id="+encodeURIComponent(r);i&&(h+="&client_secret="+encodeURIComponent(i)),h+="&token_type_hint="+encodeURIComponent(s),h+="&token="+encodeURIComponent(o),c.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),c.send(h);}))},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.CordovaPopupWindow=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0);e.CordovaPopupWindow=function(){function t(e){var r=this;!function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._promise=new Promise((function(t,e){r._resolve=t,r._reject=e;})),this.features=e.popupWindowFeatures||"location=no,toolbar=no,zoom=no",this.target=e.popupWindowTarget||"_blank",this.redirect_uri=e.startUrl,i.Log.debug("CordovaPopupWindow.ctor: redirect_uri: "+this.redirect_uri);}return t.prototype._isInAppBrowserInstalled=function t(e){return ["cordova-plugin-inappbrowser","cordova-plugin-inappbrowser.inappbrowser","org.apache.cordova.inappbrowser"].some((function(t){return e.hasOwnProperty(t)}))},t.prototype.navigate=function t(e){if(e&&e.url){if(!window.cordova)return this._error("cordova is undefined");var r=window.cordova.require("cordova/plugin_list").metadata;if(false===this._isInAppBrowserInstalled(r))return this._error("InAppBrowser plugin not found");this._popup=cordova.InAppBrowser.open(e.url,this.target,this.features),this._popup?(i.Log.debug("CordovaPopupWindow.navigate: popup successfully created"),this._exitCallbackEvent=this._exitCallback.bind(this),this._loadStartCallbackEvent=this._loadStartCallback.bind(this),this._popup.addEventListener("exit",this._exitCallbackEvent,false),this._popup.addEventListener("loadstart",this._loadStartCallbackEvent,false)):this._error("Error opening popup window");}else this._error("No url provided");return this.promise},t.prototype._loadStartCallback=function t(e){0===e.url.indexOf(this.redirect_uri)&&this._success({url:e.url});},t.prototype._exitCallback=function t(e){this._error(e);},t.prototype._success=function t(e){this._cleanup(),i.Log.debug("CordovaPopupWindow: Successful response from cordova popup window"),this._resolve(e);},t.prototype._error=function t(e){this._cleanup(),i.Log.error(e),this._reject(new Error(e));},t.prototype.close=function t(){this._cleanup();},t.prototype._cleanup=function t(){this._popup&&(i.Log.debug("CordovaPopupWindow: cleaning up popup"),this._popup.removeEventListener("exit",this._exitCallbackEvent,false),this._popup.removeEventListener("loadstart",this._loadStartCallbackEvent,false),this._popup.close()),this._popup=null;},n(t,[{key:"promise",get:function t(){return this._promise}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true});var n=r(0),i=r(10),o=r(5),s=r(6),a=r(37),u=r(38),c=r(16),h=r(2),l=r(48),f=r(49),g=r(19),d=r(20),p=r(18),v=r(1),y=r(15),m=r(50);e.default={Version:m.Version,Log:n.Log,OidcClient:i.OidcClient,OidcClientSettings:o.OidcClientSettings,WebStorageStateStore:s.WebStorageStateStore,InMemoryWebStorage:a.InMemoryWebStorage,UserManager:u.UserManager,AccessTokenEvents:c.AccessTokenEvents,MetadataService:h.MetadataService,CordovaPopupNavigator:l.CordovaPopupNavigator,CordovaIFrameNavigator:f.CordovaIFrameNavigator,CheckSessionIFrame:g.CheckSessionIFrame,TokenRevocationClient:d.TokenRevocationClient,SessionMonitor:p.SessionMonitor,Global:v.Global,User:y.User},t.exports=e.default;},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true});e.ClockService=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.prototype.getEpochTime=function t(){return Promise.resolve(Date.now()/1e3|0)},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.ResponseValidator=void 0;var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=r(0),o=r(2),s=r(25),a=r(11),u=r(12),c=r(4);function h(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var l=["nonce","at_hash","iat","nbf","exp","aud","iss","c_hash"];e.ResponseValidator=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:o.MetadataService,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:s.UserInfoService,u=arguments.length>3&&void 0!==arguments[3]?arguments[3]:c.JoseUtil,l=arguments.length>4&&void 0!==arguments[4]?arguments[4]:a.TokenClient;if(h(this,t),!e)throw i.Log.error("ResponseValidator.ctor: No settings passed to ResponseValidator"),new Error("settings");this._settings=e,this._metadataService=new r(this._settings),this._userInfoService=new n(this._settings),this._joseUtil=u,this._tokenClient=new l(this._settings);}return t.prototype.validateSigninResponse=function t(e,r){var n=this;return i.Log.debug("ResponseValidator.validateSigninResponse"),this._processSigninParams(e,r).then((function(t){return i.Log.debug("ResponseValidator.validateSigninResponse: state processed"),n._validateTokens(e,t).then((function(t){return i.Log.debug("ResponseValidator.validateSigninResponse: tokens validated"),n._processClaims(e,t).then((function(t){return i.Log.debug("ResponseValidator.validateSigninResponse: claims processed"),t}))}))}))},t.prototype.validateSignoutResponse=function t(e,r){return e.id!==r.state?(i.Log.error("ResponseValidator.validateSignoutResponse: State does not match"),Promise.reject(new Error("State does not match"))):(i.Log.debug("ResponseValidator.validateSignoutResponse: state validated"),r.state=e.data,r.error?(i.Log.warn("ResponseValidator.validateSignoutResponse: Response was error",r.error),Promise.reject(new u.ErrorResponse(r))):Promise.resolve(r))},t.prototype._processSigninParams=function t(e,r){if(e.id!==r.state)return i.Log.error("ResponseValidator._processSigninParams: State does not match"),Promise.reject(new Error("State does not match"));if(!e.client_id)return i.Log.error("ResponseValidator._processSigninParams: No client_id on state"),Promise.reject(new Error("No client_id on state"));if(!e.authority)return i.Log.error("ResponseValidator._processSigninParams: No authority on state"),Promise.reject(new Error("No authority on state"));if(this._settings.authority){if(this._settings.authority&&this._settings.authority!==e.authority)return i.Log.error("ResponseValidator._processSigninParams: authority mismatch on settings vs. signin state"),Promise.reject(new Error("authority mismatch on settings vs. signin state"))}else this._settings.authority=e.authority;if(this._settings.client_id){if(this._settings.client_id&&this._settings.client_id!==e.client_id)return i.Log.error("ResponseValidator._processSigninParams: client_id mismatch on settings vs. signin state"),Promise.reject(new Error("client_id mismatch on settings vs. signin state"))}else this._settings.client_id=e.client_id;return i.Log.debug("ResponseValidator._processSigninParams: state validated"),r.state=e.data,r.error?(i.Log.warn("ResponseValidator._processSigninParams: Response was error",r.error),Promise.reject(new u.ErrorResponse(r))):e.nonce&&!r.id_token?(i.Log.error("ResponseValidator._processSigninParams: Expecting id_token in response"),Promise.reject(new Error("No id_token in response"))):!e.nonce&&r.id_token?(i.Log.error("ResponseValidator._processSigninParams: Not expecting id_token in response"),Promise.reject(new Error("Unexpected id_token in response"))):e.code_verifier&&!r.code?(i.Log.error("ResponseValidator._processSigninParams: Expecting code in response"),Promise.reject(new Error("No code in response"))):!e.code_verifier&&r.code?(i.Log.error("ResponseValidator._processSigninParams: Not expecting code in response"),Promise.reject(new Error("Unexpected code in response"))):(r.scope||(r.scope=e.scope),Promise.resolve(r))},t.prototype._processClaims=function t(e,r){var n=this;if(r.isOpenIdConnect){if(i.Log.debug("ResponseValidator._processClaims: response is OIDC, processing claims"),r.profile=this._filterProtocolClaims(r.profile),true!==e.skipUserInfo&&this._settings.loadUserInfo&&r.access_token)return i.Log.debug("ResponseValidator._processClaims: loading user info"),this._userInfoService.getClaims(r.access_token).then((function(t){return i.Log.debug("ResponseValidator._processClaims: user info claims received from user info endpoint"),t.sub!==r.profile.sub?(i.Log.error("ResponseValidator._processClaims: sub from user info endpoint does not match sub in id_token"),Promise.reject(new Error("sub from user info endpoint does not match sub in id_token"))):(r.profile=n._mergeClaims(r.profile,t),i.Log.debug("ResponseValidator._processClaims: user info claims received, updated profile:",r.profile),r)}));i.Log.debug("ResponseValidator._processClaims: not loading user info");}else i.Log.debug("ResponseValidator._processClaims: response is not OIDC, not processing claims");return Promise.resolve(r)},t.prototype._mergeClaims=function t(e,r){var i=Object.assign({},e);for(var o in r){var s=r[o];Array.isArray(s)||(s=[s]);for(var a=0;a<s.length;a++){var u=s[a];i[o]?Array.isArray(i[o])?i[o].indexOf(u)<0&&i[o].push(u):i[o]!==u&&("object"===(void 0===u?"undefined":n(u))&&this._settings.mergeClaims?i[o]=this._mergeClaims(i[o],u):i[o]=[i[o],u]):i[o]=u;}}return i},t.prototype._filterProtocolClaims=function t(e){i.Log.debug("ResponseValidator._filterProtocolClaims, incoming claims:",e);var r=Object.assign({},e);return this._settings._filterProtocolClaims?(l.forEach((function(t){delete r[t];})),i.Log.debug("ResponseValidator._filterProtocolClaims: protocol claims filtered",r)):i.Log.debug("ResponseValidator._filterProtocolClaims: protocol claims not filtered"),r},t.prototype._validateTokens=function t(e,r){return r.code?(i.Log.debug("ResponseValidator._validateTokens: Validating code"),this._processCode(e,r)):r.id_token?r.access_token?(i.Log.debug("ResponseValidator._validateTokens: Validating id_token and access_token"),this._validateIdTokenAndAccessToken(e,r)):(i.Log.debug("ResponseValidator._validateTokens: Validating id_token"),this._validateIdToken(e,r)):(i.Log.debug("ResponseValidator._validateTokens: No code to process or id_token to validate"),Promise.resolve(r))},t.prototype._processCode=function t(e,r){var o=this,s={client_id:e.client_id,client_secret:e.client_secret,code:r.code,redirect_uri:e.redirect_uri,code_verifier:e.code_verifier};return e.extraTokenParams&&"object"===n(e.extraTokenParams)&&Object.assign(s,e.extraTokenParams),this._tokenClient.exchangeCode(s).then((function(t){for(var n in t)r[n]=t[n];return r.id_token?(i.Log.debug("ResponseValidator._processCode: token response successful, processing id_token"),o._validateIdTokenAttributes(e,r)):(i.Log.debug("ResponseValidator._processCode: token response successful, returning response"),r)}))},t.prototype._validateIdTokenAttributes=function t(e,r){var n=this;return this._metadataService.getIssuer().then((function(t){var o=e.client_id,s=n._settings.clockSkew;return i.Log.debug("ResponseValidator._validateIdTokenAttributes: Validaing JWT attributes; using clock skew (in seconds) of: ",s),n._settings.getEpochTime().then((function(a){return n._joseUtil.validateJwtAttributes(r.id_token,t,o,s,a).then((function(t){return e.nonce&&e.nonce!==t.nonce?(i.Log.error("ResponseValidator._validateIdTokenAttributes: Invalid nonce in id_token"),Promise.reject(new Error("Invalid nonce in id_token"))):t.sub?(r.profile=t,r):(i.Log.error("ResponseValidator._validateIdTokenAttributes: No sub present in id_token"),Promise.reject(new Error("No sub present in id_token")))}))}))}))},t.prototype._validateIdTokenAndAccessToken=function t(e,r){var n=this;return this._validateIdToken(e,r).then((function(t){return n._validateAccessToken(t)}))},t.prototype._getSigningKeyForJwt=function t(e){var r=this;return this._metadataService.getSigningKeys().then((function(t){var n=e.header.kid;if(!t)return i.Log.error("ResponseValidator._validateIdToken: No signing keys from metadata"),Promise.reject(new Error("No signing keys from metadata"));i.Log.debug("ResponseValidator._validateIdToken: Received signing keys");var o=void 0;if(n)o=t.filter((function(t){return t.kid===n}))[0];else {if((t=r._filterByAlg(t,e.header.alg)).length>1)return i.Log.error("ResponseValidator._validateIdToken: No kid found in id_token and more than one key found in metadata"),Promise.reject(new Error("No kid found in id_token and more than one key found in metadata"));o=t[0];}return Promise.resolve(o)}))},t.prototype._getSigningKeyForJwtWithSingleRetry=function t(e){var r=this;return this._getSigningKeyForJwt(e).then((function(t){return t?Promise.resolve(t):(r._metadataService.resetSigningKeys(),r._getSigningKeyForJwt(e))}))},t.prototype._validateIdToken=function t(e,r){var n=this;if(!e.nonce)return i.Log.error("ResponseValidator._validateIdToken: No nonce on state"),Promise.reject(new Error("No nonce on state"));var o=this._joseUtil.parseJwt(r.id_token);return o&&o.header&&o.payload?e.nonce!==o.payload.nonce?(i.Log.error("ResponseValidator._validateIdToken: Invalid nonce in id_token"),Promise.reject(new Error("Invalid nonce in id_token"))):this._metadataService.getIssuer().then((function(t){return i.Log.debug("ResponseValidator._validateIdToken: Received issuer"),n._getSigningKeyForJwtWithSingleRetry(o).then((function(s){if(!s)return i.Log.error("ResponseValidator._validateIdToken: No key matching kid or alg found in signing keys"),Promise.reject(new Error("No key matching kid or alg found in signing keys"));var a=e.client_id,u=n._settings.clockSkew;return i.Log.debug("ResponseValidator._validateIdToken: Validaing JWT; using clock skew (in seconds) of: ",u),n._joseUtil.validateJwt(r.id_token,s,t,a,u).then((function(){return i.Log.debug("ResponseValidator._validateIdToken: JWT validation successful"),o.payload.sub?(r.profile=o.payload,r):(i.Log.error("ResponseValidator._validateIdToken: No sub present in id_token"),Promise.reject(new Error("No sub present in id_token")))}))}))})):(i.Log.error("ResponseValidator._validateIdToken: Failed to parse id_token",o),Promise.reject(new Error("Failed to parse id_token")))},t.prototype._filterByAlg=function t(e,r){var n=null;if(r.startsWith("RS"))n="RSA";else if(r.startsWith("PS"))n="PS";else {if(!r.startsWith("ES"))return i.Log.debug("ResponseValidator._filterByAlg: alg not supported: ",r),[];n="EC";}return i.Log.debug("ResponseValidator._filterByAlg: Looking for keys that match kty: ",n),e=e.filter((function(t){return t.kty===n})),i.Log.debug("ResponseValidator._filterByAlg: Number of keys that match kty: ",n,e.length),e},t.prototype._validateAccessToken=function t(e){if(!e.profile)return i.Log.error("ResponseValidator._validateAccessToken: No profile loaded from id_token"),Promise.reject(new Error("No profile loaded from id_token"));if(!e.profile.at_hash)return i.Log.error("ResponseValidator._validateAccessToken: No at_hash in id_token"),Promise.reject(new Error("No at_hash in id_token"));if(!e.id_token)return i.Log.error("ResponseValidator._validateAccessToken: No id_token"),Promise.reject(new Error("No id_token"));var r=this._joseUtil.parseJwt(e.id_token);if(!r||!r.header)return i.Log.error("ResponseValidator._validateAccessToken: Failed to parse id_token",r),Promise.reject(new Error("Failed to parse id_token"));var n=r.header.alg;if(!n||5!==n.length)return i.Log.error("ResponseValidator._validateAccessToken: Unsupported alg:",n),Promise.reject(new Error("Unsupported alg: "+n));var o=n.substr(2,3);if(!o)return i.Log.error("ResponseValidator._validateAccessToken: Unsupported alg:",n,o),Promise.reject(new Error("Unsupported alg: "+n));if(256!==(o=parseInt(o))&&384!==o&&512!==o)return i.Log.error("ResponseValidator._validateAccessToken: Unsupported alg:",n,o),Promise.reject(new Error("Unsupported alg: "+n));var s="sha"+o,a=this._joseUtil.hashString(e.access_token,s);if(!a)return i.Log.error("ResponseValidator._validateAccessToken: access_token hash failed:",s),Promise.reject(new Error("Failed to validate at_hash"));var u=a.substr(0,a.length/2),c=this._joseUtil.hexToBase64Url(u);return c!==e.profile.at_hash?(i.Log.error("ResponseValidator._validateAccessToken: Failed to validate at_hash",c,e.profile.at_hash),Promise.reject(new Error("Failed to validate at_hash"))):(i.Log.debug("ResponseValidator._validateAccessToken: success"),Promise.resolve(e))},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.UserInfoService=void 0;var n=r(7),i=r(2),o=r(0),s=r(4);function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.UserInfoService=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n.JsonService,u=arguments.length>2&&void 0!==arguments[2]?arguments[2]:i.MetadataService,c=arguments.length>3&&void 0!==arguments[3]?arguments[3]:s.JoseUtil;if(a(this,t),!e)throw o.Log.error("UserInfoService.ctor: No settings passed"),new Error("settings");this._settings=e,this._jsonService=new r(void 0,void 0,this._getClaimsFromJwt.bind(this)),this._metadataService=new u(this._settings),this._joseUtil=c;}return t.prototype.getClaims=function t(e){var r=this;return e?this._metadataService.getUserInfoEndpoint().then((function(t){return o.Log.debug("UserInfoService.getClaims: received userinfo url",t),r._jsonService.getJson(t,e).then((function(t){return o.Log.debug("UserInfoService.getClaims: claims received",t),t}))})):(o.Log.error("UserInfoService.getClaims: No token passed"),Promise.reject(new Error("A token is required")))},t.prototype._getClaimsFromJwt=function t(e){var r=this;try{var n=this._joseUtil.parseJwt(e.responseText);if(!n||!n.header||!n.payload)return o.Log.error("UserInfoService._getClaimsFromJwt: Failed to parse JWT",n),Promise.reject(new Error("Failed to parse id_token"));var i=n.header.kid,s=void 0;switch(this._settings.userInfoJwtIssuer){case "OP":s=this._metadataService.getIssuer();break;case "ANY":s=Promise.resolve(n.payload.iss);break;default:s=Promise.resolve(this._settings.userInfoJwtIssuer);}return s.then((function(t){return o.Log.debug("UserInfoService._getClaimsFromJwt: Received issuer:"+t),r._metadataService.getSigningKeys().then((function(s){if(!s)return o.Log.error("UserInfoService._getClaimsFromJwt: No signing keys from metadata"),Promise.reject(new Error("No signing keys from metadata"));o.Log.debug("UserInfoService._getClaimsFromJwt: Received signing keys");var a=void 0;if(i)a=s.filter((function(t){return t.kid===i}))[0];else {if((s=r._filterByAlg(s,n.header.alg)).length>1)return o.Log.error("UserInfoService._getClaimsFromJwt: No kid found in id_token and more than one key found in metadata"),Promise.reject(new Error("No kid found in id_token and more than one key found in metadata"));a=s[0];}if(!a)return o.Log.error("UserInfoService._getClaimsFromJwt: No key matching kid or alg found in signing keys"),Promise.reject(new Error("No key matching kid or alg found in signing keys"));var u=r._settings.client_id,c=r._settings.clockSkew;return o.Log.debug("UserInfoService._getClaimsFromJwt: Validaing JWT; using clock skew (in seconds) of: ",c),r._joseUtil.validateJwt(e.responseText,a,t,u,c,void 0,!0).then((function(){return o.Log.debug("UserInfoService._getClaimsFromJwt: JWT validation successful"),n.payload}))}))}))}catch(t){return o.Log.error("UserInfoService._getClaimsFromJwt: Error parsing JWT response",t.message),void reject(t)}},t.prototype._filterByAlg=function t(e,r){var n=null;if(r.startsWith("RS"))n="RSA";else if(r.startsWith("PS"))n="PS";else {if(!r.startsWith("ES"))return o.Log.debug("UserInfoService._filterByAlg: alg not supported: ",r),[];n="EC";}return o.Log.debug("UserInfoService._filterByAlg: Looking for keys that match kty: ",n),e=e.filter((function(t){return t.kty===n})),o.Log.debug("UserInfoService._filterByAlg: Number of keys that match kty: ",n,e.length),e},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.AllowedSigningAlgs=e.b64tohex=e.hextob64u=e.crypto=e.X509=e.KeyUtil=e.jws=void 0;var n=r(27);e.jws=n.jws,e.KeyUtil=n.KEYUTIL,e.X509=n.X509,e.crypto=n.crypto,e.hextob64u=n.hextob64u,e.b64tohex=n.b64tohex,e.AllowedSigningAlgs=["RS256","RS384","RS512","PS256","PS384","PS512","ES256","ES384","ES512"];},function(t,e,r){(function(t){Object.defineProperty(e,"__esModule",{value:true});var r,n,i,o,s,a,u,c,h,l,f,g="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},d={},p={},v=v||(r=Math,i=(n={}).lib={},o=i.Base=function(){function t(){}return {extend:function e(r){t.prototype=this;var n=new t;return r&&n.mixIn(r),n.hasOwnProperty("init")||(n.init=function(){n.$super.init.apply(this,arguments);}),n.init.prototype=n,n.$super=this,n},create:function t(){var e=this.extend();return e.init.apply(e,arguments),e},init:function t(){},mixIn:function t(e){for(var r in e)e.hasOwnProperty(r)&&(this[r]=e[r]);e.hasOwnProperty("toString")&&(this.toString=e.toString);},clone:function t(){return this.init.prototype.extend(this)}}}(),s=i.WordArray=o.extend({init:function t(e,r){e=this.words=e||[],this.sigBytes=null!=r?r:4*e.length;},toString:function t(e){return (e||u).stringify(this)},concat:function t(e){var r=this.words,n=e.words,i=this.sigBytes,o=e.sigBytes;if(this.clamp(),i%4)for(var s=0;s<o;s++){var a=n[s>>>2]>>>24-s%4*8&255;r[i+s>>>2]|=a<<24-(i+s)%4*8;}else for(s=0;s<o;s+=4)r[i+s>>>2]=n[s>>>2];return this.sigBytes+=o,this},clamp:function t(){var e=this.words,n=this.sigBytes;e[n>>>2]&=4294967295<<32-n%4*8,e.length=r.ceil(n/4);},clone:function t(){var e=o.clone.call(this);return e.words=this.words.slice(0),e},random:function t(e){for(var n=[],i=0;i<e;i+=4)n.push(4294967296*r.random()|0);return new s.init(n,e)}}),a=n.enc={},u=a.Hex={stringify:function t(e){for(var r=e.words,n=e.sigBytes,i=[],o=0;o<n;o++){var s=r[o>>>2]>>>24-o%4*8&255;i.push((s>>>4).toString(16)),i.push((15&s).toString(16));}return i.join("")},parse:function t(e){for(var r=e.length,n=[],i=0;i<r;i+=2)n[i>>>3]|=parseInt(e.substr(i,2),16)<<24-i%8*4;return new s.init(n,r/2)}},c=a.Latin1={stringify:function t(e){for(var r=e.words,n=e.sigBytes,i=[],o=0;o<n;o++){var s=r[o>>>2]>>>24-o%4*8&255;i.push(String.fromCharCode(s));}return i.join("")},parse:function t(e){for(var r=e.length,n=[],i=0;i<r;i++)n[i>>>2]|=(255&e.charCodeAt(i))<<24-i%4*8;return new s.init(n,r)}},h=a.Utf8={stringify:function t(e){try{return decodeURIComponent(escape(c.stringify(e)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function t(e){return c.parse(unescape(encodeURIComponent(e)))}},l=i.BufferedBlockAlgorithm=o.extend({reset:function t(){this._data=new s.init,this._nDataBytes=0;},_append:function t(e){"string"==typeof e&&(e=h.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes;},_process:function t(e){var n=this._data,i=n.words,o=n.sigBytes,a=this.blockSize,u=o/(4*a),c=(u=e?r.ceil(u):r.max((0|u)-this._minBufferSize,0))*a,h=r.min(4*c,o);if(c){for(var l=0;l<c;l+=a)this._doProcessBlock(i,l);var f=i.splice(0,c);n.sigBytes-=h;}return new s.init(f,h)},clone:function t(){var e=o.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0}),i.Hasher=l.extend({cfg:o.extend(),init:function t(e){this.cfg=this.cfg.extend(e),this.reset();},reset:function t(){l.reset.call(this),this._doReset();},update:function t(e){return this._append(e),this._process(),this},finalize:function t(e){return e&&this._append(e),this._doFinalize()},blockSize:16,_createHelper:function t(e){return function(t,r){return new e.init(r).finalize(t)}},_createHmacHelper:function t(e){return function(t,r){return new f.HMAC.init(e,r).finalize(t)}}}),f=n.algo={},n);!function(t){var e,r=(e=v).lib,n=r.Base,i=r.WordArray;(e=e.x64={}).Word=n.extend({init:function t(e,r){this.high=e,this.low=r;}}),e.WordArray=n.extend({init:function t(e,r){e=this.words=e||[],this.sigBytes=null!=r?r:8*e.length;},toX32:function t(){for(var e=this.words,r=e.length,n=[],o=0;o<r;o++){var s=e[o];n.push(s.high),n.push(s.low);}return i.create(n,this.sigBytes)},clone:function t(){for(var e=n.clone.call(this),r=e.words=this.words.slice(0),i=r.length,o=0;o<i;o++)r[o]=r[o].clone();return e}});}(),function(){var t=v,e=t.lib.WordArray;t.enc.Base64={stringify:function t(e){var r=e.words,n=e.sigBytes,i=this._map;e.clamp(),e=[];for(var o=0;o<n;o+=3)for(var s=(r[o>>>2]>>>24-o%4*8&255)<<16|(r[o+1>>>2]>>>24-(o+1)%4*8&255)<<8|r[o+2>>>2]>>>24-(o+2)%4*8&255,a=0;4>a&&o+.75*a<n;a++)e.push(i.charAt(s>>>6*(3-a)&63));if(r=i.charAt(64))for(;e.length%4;)e.push(r);return e.join("")},parse:function t(r){var n=r.length,i=this._map;(o=i.charAt(64))&&(-1!=(o=r.indexOf(o))&&(n=o));for(var o=[],s=0,a=0;a<n;a++)if(a%4){var u=i.indexOf(r.charAt(a-1))<<a%4*2,c=i.indexOf(r.charAt(a))>>>6-a%4*2;o[s>>>2]|=(u|c)<<24-s%4*8,s++;}return e.create(o,s)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="};}(),function(t){for(var e=v,r=(i=e.lib).WordArray,n=i.Hasher,i=e.algo,o=[],s=[],a=function t(e){return 4294967296*(e-(0|e))|0},u=2,c=0;64>c;){var h;t:{h=u;for(var l=t.sqrt(h),f=2;f<=l;f++)if(!(h%f)){h=false;break t}h=true;}h&&(8>c&&(o[c]=a(t.pow(u,.5))),s[c]=a(t.pow(u,1/3)),c++),u++;}var g=[];i=i.SHA256=n.extend({_doReset:function t(){this._hash=new r.init(o.slice(0));},_doProcessBlock:function t(e,r){for(var n=this._hash.words,i=n[0],o=n[1],a=n[2],u=n[3],c=n[4],h=n[5],l=n[6],f=n[7],d=0;64>d;d++){if(16>d)g[d]=0|e[r+d];else {var p=g[d-15],v=g[d-2];g[d]=((p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3)+g[d-7]+((v<<15|v>>>17)^(v<<13|v>>>19)^v>>>10)+g[d-16];}p=f+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&h^~c&l)+s[d]+g[d],v=((i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22))+(i&o^i&a^o&a),f=l,l=h,h=c,c=u+p|0,u=a,a=o,o=i,i=p+v|0;}n[0]=n[0]+i|0,n[1]=n[1]+o|0,n[2]=n[2]+a|0,n[3]=n[3]+u|0,n[4]=n[4]+c|0,n[5]=n[5]+h|0,n[6]=n[6]+l|0,n[7]=n[7]+f|0;},_doFinalize:function e(){var r=this._data,n=r.words,i=8*this._nDataBytes,o=8*r.sigBytes;return n[o>>>5]|=128<<24-o%32,n[14+(o+64>>>9<<4)]=t.floor(i/4294967296),n[15+(o+64>>>9<<4)]=i,r.sigBytes=4*n.length,this._process(),this._hash},clone:function t(){var e=n.clone.call(this);return e._hash=this._hash.clone(),e}});e.SHA256=n._createHelper(i),e.HmacSHA256=n._createHmacHelper(i);}(Math),function(){function t(){return n.create.apply(n,arguments)}for(var e=v,r=e.lib.Hasher,n=(o=e.x64).Word,i=o.WordArray,o=e.algo,s=[t(1116352408,3609767458),t(1899447441,602891725),t(3049323471,3964484399),t(3921009573,2173295548),t(961987163,4081628472),t(1508970993,3053834265),t(2453635748,2937671579),t(2870763221,3664609560),t(3624381080,2734883394),t(310598401,1164996542),t(607225278,1323610764),t(1426881987,3590304994),t(1925078388,4068182383),t(2162078206,991336113),t(2614888103,633803317),t(3248222580,3479774868),t(3835390401,2666613458),t(4022224774,944711139),t(264347078,2341262773),t(604807628,2007800933),t(770255983,1495990901),t(1249150122,1856431235),t(1555081692,3175218132),t(1996064986,2198950837),t(2554220882,3999719339),t(2821834349,766784016),t(2952996808,2566594879),t(3210313671,3203337956),t(3336571891,1034457026),t(3584528711,2466948901),t(113926993,3758326383),t(338241895,168717936),t(666307205,1188179964),t(773529912,1546045734),t(1294757372,1522805485),t(1396182291,2643833823),t(1695183700,2343527390),t(1986661051,1014477480),t(2177026350,1206759142),t(2456956037,344077627),t(2730485921,1290863460),t(2820302411,3158454273),t(3259730800,3505952657),t(3345764771,106217008),t(3516065817,3606008344),t(3600352804,1432725776),t(4094571909,1467031594),t(275423344,851169720),t(430227734,3100823752),t(506948616,1363258195),t(659060556,3750685593),t(883997877,3785050280),t(958139571,3318307427),t(1322822218,3812723403),t(1537002063,2003034995),t(1747873779,3602036899),t(1955562222,1575990012),t(2024104815,1125592928),t(2227730452,2716904306),t(2361852424,442776044),t(2428436474,593698344),t(2756734187,3733110249),t(3204031479,2999351573),t(3329325298,3815920427),t(3391569614,3928383900),t(3515267271,566280711),t(3940187606,3454069534),t(4118630271,4000239992),t(116418474,1914138554),t(174292421,2731055270),t(289380356,3203993006),t(460393269,320620315),t(685471733,587496836),t(852142971,1086792851),t(1017036298,365543100),t(1126000580,2618297676),t(1288033470,3409855158),t(1501505948,4234509866),t(1607167915,987167468),t(1816402316,1246189591)],a=[],u=0;80>u;u++)a[u]=t();o=o.SHA512=r.extend({_doReset:function t(){this._hash=new i.init([new n.init(1779033703,4089235720),new n.init(3144134277,2227873595),new n.init(1013904242,4271175723),new n.init(2773480762,1595750129),new n.init(1359893119,2917565137),new n.init(2600822924,725511199),new n.init(528734635,4215389547),new n.init(1541459225,327033209)]);},_doProcessBlock:function t(e,r){for(var n=(f=this._hash.words)[0],i=f[1],o=f[2],u=f[3],c=f[4],h=f[5],l=f[6],f=f[7],g=n.high,d=n.low,p=i.high,v=i.low,y=o.high,m=o.low,_=u.high,S=u.low,b=c.high,w=c.low,F=h.high,E=h.low,x=l.high,A=l.low,k=f.high,P=f.low,C=g,T=d,R=p,I=v,D=y,L=m,N=_,U=S,B=b,O=w,j=F,M=E,H=x,V=A,K=k,q=P,J=0;80>J;J++){var W=a[J];if(16>J)var z=W.high=0|e[r+2*J],Y=W.low=0|e[r+2*J+1];else {z=((Y=(z=a[J-15]).high)>>>1|(G=z.low)<<31)^(Y>>>8|G<<24)^Y>>>7;var G=(G>>>1|Y<<31)^(G>>>8|Y<<24)^(G>>>7|Y<<25),X=((Y=(X=a[J-2]).high)>>>19|($=X.low)<<13)^(Y<<3|$>>>29)^Y>>>6,$=($>>>19|Y<<13)^($<<3|Y>>>29)^($>>>6|Y<<26),Q=(Y=a[J-7]).high,Z=(tt=a[J-16]).high,tt=tt.low;z=(z=(z=z+Q+((Y=G+Y.low)>>>0<G>>>0?1:0))+X+((Y=Y+$)>>>0<$>>>0?1:0))+Z+((Y=Y+tt)>>>0<tt>>>0?1:0);W.high=z,W.low=Y;}Q=B&j^~B&H,tt=O&M^~O&V,W=C&R^C&D^R&D;var et=T&I^T&L^I&L,rt=(G=(C>>>28|T<<4)^(C<<30|T>>>2)^(C<<25|T>>>7),X=(T>>>28|C<<4)^(T<<30|C>>>2)^(T<<25|C>>>7),($=s[J]).high),nt=$.low;Z=K+((B>>>14|O<<18)^(B>>>18|O<<14)^(B<<23|O>>>9))+(($=q+((O>>>14|B<<18)^(O>>>18|B<<14)^(O<<23|B>>>9)))>>>0<q>>>0?1:0),K=H,q=V,H=j,V=M,j=B,M=O,B=N+(Z=(Z=(Z=Z+Q+(($=$+tt)>>>0<tt>>>0?1:0))+rt+(($=$+nt)>>>0<nt>>>0?1:0))+z+(($=$+Y)>>>0<Y>>>0?1:0))+((O=U+$|0)>>>0<U>>>0?1:0)|0,N=D,U=L,D=R,L=I,R=C,I=T,C=Z+(W=G+W+((Y=X+et)>>>0<X>>>0?1:0))+((T=$+Y|0)>>>0<$>>>0?1:0)|0;}d=n.low=d+T,n.high=g+C+(d>>>0<T>>>0?1:0),v=i.low=v+I,i.high=p+R+(v>>>0<I>>>0?1:0),m=o.low=m+L,o.high=y+D+(m>>>0<L>>>0?1:0),S=u.low=S+U,u.high=_+N+(S>>>0<U>>>0?1:0),w=c.low=w+O,c.high=b+B+(w>>>0<O>>>0?1:0),E=h.low=E+M,h.high=F+j+(E>>>0<M>>>0?1:0),A=l.low=A+V,l.high=x+H+(A>>>0<V>>>0?1:0),P=f.low=P+q,f.high=k+K+(P>>>0<q>>>0?1:0);},_doFinalize:function t(){var e=this._data,r=e.words,n=8*this._nDataBytes,i=8*e.sigBytes;return r[i>>>5]|=128<<24-i%32,r[30+(i+128>>>10<<5)]=Math.floor(n/4294967296),r[31+(i+128>>>10<<5)]=n,e.sigBytes=4*r.length,this._process(),this._hash.toX32()},clone:function t(){var e=r.clone.call(this);return e._hash=this._hash.clone(),e},blockSize:32}),e.SHA512=r._createHelper(o),e.HmacSHA512=r._createHmacHelper(o);}(),function(){var t=v,e=(i=t.x64).Word,r=i.WordArray,n=(i=t.algo).SHA512,i=i.SHA384=n.extend({_doReset:function t(){this._hash=new r.init([new e.init(3418070365,3238371032),new e.init(1654270250,914150663),new e.init(2438529370,812702999),new e.init(355462360,4144912697),new e.init(1731405415,4290775857),new e.init(2394180231,1750603025),new e.init(3675008525,1694076839),new e.init(1203062813,3204075428)]);},_doFinalize:function t(){var e=n._doFinalize.call(this);return e.sigBytes-=16,e}});t.SHA384=n._createHelper(i),t.HmacSHA384=n._createHmacHelper(i);}();
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
var y,m="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";function _(t){var e,r,n="";for(e=0;e+3<=t.length;e+=3)r=parseInt(t.substring(e,e+3),16),n+=m.charAt(r>>6)+m.charAt(63&r);for(e+1==t.length?(r=parseInt(t.substring(e,e+1),16),n+=m.charAt(r<<2)):e+2==t.length&&(r=parseInt(t.substring(e,e+2),16),n+=m.charAt(r>>2)+m.charAt((3&r)<<4)),"=";(3&n.length)>0;)n+="=";return n}function S(t){var e,r,n,i="",o=0;for(e=0;e<t.length&&"="!=t.charAt(e);++e)(n=m.indexOf(t.charAt(e)))<0||(0==o?(i+=T(n>>2),r=3&n,o=1):1==o?(i+=T(r<<2|n>>4),r=15&n,o=2):2==o?(i+=T(r),i+=T(n>>2),r=3&n,o=3):(i+=T(r<<2|n>>4),i+=T(15&n),o=0));return 1==o&&(i+=T(r<<2)),i}function b(t){var e,r=S(t),n=new Array;for(e=0;2*e<r.length;++e)n[e]=parseInt(r.substring(2*e,2*e+2),16);return n}function w(t,e,r){null!=t&&("number"==typeof t?this.fromNumber(t,e,r):null==e&&"string"!=typeof t?this.fromString(t,256):this.fromString(t,e));}function F(){return new w(null)}"Microsoft Internet Explorer"==d.appName?(w.prototype.am=function E(t,e,r,n,i,o){for(var s=32767&e,a=e>>15;--o>=0;){var u=32767&this[t],c=this[t++]>>15,h=a*u+c*s;i=((u=s*u+((32767&h)<<15)+r[n]+(1073741823&i))>>>30)+(h>>>15)+a*c+(i>>>30),r[n++]=1073741823&u;}return i},y=30):"Netscape"!=d.appName?(w.prototype.am=function x(t,e,r,n,i,o){for(;--o>=0;){var s=e*this[t++]+r[n]+i;i=Math.floor(s/67108864),r[n++]=67108863&s;}return i},y=26):(w.prototype.am=function A(t,e,r,n,i,o){for(var s=16383&e,a=e>>14;--o>=0;){var u=16383&this[t],c=this[t++]>>14,h=a*u+c*s;i=((u=s*u+((16383&h)<<14)+r[n]+i)>>28)+(h>>14)+a*c,r[n++]=268435455&u;}return i},y=28),w.prototype.DB=y,w.prototype.DM=(1<<y)-1,w.prototype.DV=1<<y;w.prototype.FV=Math.pow(2,52),w.prototype.F1=52-y,w.prototype.F2=2*y-52;var k,P,C=new Array;for(k="0".charCodeAt(0),P=0;P<=9;++P)C[k++]=P;for(k="a".charCodeAt(0),P=10;P<36;++P)C[k++]=P;for(k="A".charCodeAt(0),P=10;P<36;++P)C[k++]=P;function T(t){return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(t)}function R(t,e){var r=C[t.charCodeAt(e)];return null==r?-1:r}function I(t){var e=F();return e.fromInt(t),e}function D(t){var e,r=1;return 0!=(e=t>>>16)&&(t=e,r+=16),0!=(e=t>>8)&&(t=e,r+=8),0!=(e=t>>4)&&(t=e,r+=4),0!=(e=t>>2)&&(t=e,r+=2),0!=(e=t>>1)&&(t=e,r+=1),r}function L(t){this.m=t;}function N(t){this.m=t,this.mp=t.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<t.DB-15)-1,this.mt2=2*t.t;}function U(t,e){return t&e}function B(t,e){return t|e}function O(t,e){return t^e}function j(t,e){return t&~e}function M(t){if(0==t)return  -1;var e=0;return 0==(65535&t)&&(t>>=16,e+=16),0==(255&t)&&(t>>=8,e+=8),0==(15&t)&&(t>>=4,e+=4),0==(3&t)&&(t>>=2,e+=2),0==(1&t)&&++e,e}function H(t){for(var e=0;0!=t;)t&=t-1,++e;return e}function V(){}function K(t){return t}function q(t){this.r2=F(),this.q3=F(),w.ONE.dlShiftTo(2*t.t,this.r2),this.mu=this.r2.divide(t),this.m=t;}L.prototype.convert=function J(t){return t.s<0||t.compareTo(this.m)>=0?t.mod(this.m):t},L.prototype.revert=function W(t){return t},L.prototype.reduce=function z(t){t.divRemTo(this.m,null,t);},L.prototype.mulTo=function Y(t,e,r){t.multiplyTo(e,r),this.reduce(r);},L.prototype.sqrTo=function G(t,e){t.squareTo(e),this.reduce(e);},N.prototype.convert=function X(t){var e=F();return t.abs().dlShiftTo(this.m.t,e),e.divRemTo(this.m,null,e),t.s<0&&e.compareTo(w.ZERO)>0&&this.m.subTo(e,e),e},N.prototype.revert=function $(t){var e=F();return t.copyTo(e),this.reduce(e),e},N.prototype.reduce=function Q(t){for(;t.t<=this.mt2;)t[t.t++]=0;for(var e=0;e<this.m.t;++e){var r=32767&t[e],n=r*this.mpl+((r*this.mph+(t[e]>>15)*this.mpl&this.um)<<15)&t.DM;for(t[r=e+this.m.t]+=this.m.am(0,n,t,e,0,this.m.t);t[r]>=t.DV;)t[r]-=t.DV,t[++r]++;}t.clamp(),t.drShiftTo(this.m.t,t),t.compareTo(this.m)>=0&&t.subTo(this.m,t);},N.prototype.mulTo=function Z(t,e,r){t.multiplyTo(e,r),this.reduce(r);},N.prototype.sqrTo=function tt(t,e){t.squareTo(e),this.reduce(e);},w.prototype.copyTo=function et(t){for(var e=this.t-1;e>=0;--e)t[e]=this[e];t.t=this.t,t.s=this.s;},w.prototype.fromInt=function rt(t){this.t=1,this.s=t<0?-1:0,t>0?this[0]=t:t<-1?this[0]=t+this.DV:this.t=0;},w.prototype.fromString=function nt(t,e){var r;if(16==e)r=4;else if(8==e)r=3;else if(256==e)r=8;else if(2==e)r=1;else if(32==e)r=5;else {if(4!=e)return void this.fromRadix(t,e);r=2;}this.t=0,this.s=0;for(var n=t.length,i=false,o=0;--n>=0;){var s=8==r?255&t[n]:R(t,n);s<0?"-"==t.charAt(n)&&(i=true):(i=false,0==o?this[this.t++]=s:o+r>this.DB?(this[this.t-1]|=(s&(1<<this.DB-o)-1)<<o,this[this.t++]=s>>this.DB-o):this[this.t-1]|=s<<o,(o+=r)>=this.DB&&(o-=this.DB));}8==r&&0!=(128&t[0])&&(this.s=-1,o>0&&(this[this.t-1]|=(1<<this.DB-o)-1<<o)),this.clamp(),i&&w.ZERO.subTo(this,this);},w.prototype.clamp=function it(){for(var t=this.s&this.DM;this.t>0&&this[this.t-1]==t;)--this.t;},w.prototype.dlShiftTo=function ot(t,e){var r;for(r=this.t-1;r>=0;--r)e[r+t]=this[r];for(r=t-1;r>=0;--r)e[r]=0;e.t=this.t+t,e.s=this.s;},w.prototype.drShiftTo=function st(t,e){for(var r=t;r<this.t;++r)e[r-t]=this[r];e.t=Math.max(this.t-t,0),e.s=this.s;},w.prototype.lShiftTo=function at(t,e){var r,n=t%this.DB,i=this.DB-n,o=(1<<i)-1,s=Math.floor(t/this.DB),a=this.s<<n&this.DM;for(r=this.t-1;r>=0;--r)e[r+s+1]=this[r]>>i|a,a=(this[r]&o)<<n;for(r=s-1;r>=0;--r)e[r]=0;e[s]=a,e.t=this.t+s+1,e.s=this.s,e.clamp();},w.prototype.rShiftTo=function ut(t,e){e.s=this.s;var r=Math.floor(t/this.DB);if(r>=this.t)e.t=0;else {var n=t%this.DB,i=this.DB-n,o=(1<<n)-1;e[0]=this[r]>>n;for(var s=r+1;s<this.t;++s)e[s-r-1]|=(this[s]&o)<<i,e[s-r]=this[s]>>n;n>0&&(e[this.t-r-1]|=(this.s&o)<<i),e.t=this.t-r,e.clamp();}},w.prototype.subTo=function ct(t,e){for(var r=0,n=0,i=Math.min(t.t,this.t);r<i;)n+=this[r]-t[r],e[r++]=n&this.DM,n>>=this.DB;if(t.t<this.t){for(n-=t.s;r<this.t;)n+=this[r],e[r++]=n&this.DM,n>>=this.DB;n+=this.s;}else {for(n+=this.s;r<t.t;)n-=t[r],e[r++]=n&this.DM,n>>=this.DB;n-=t.s;}e.s=n<0?-1:0,n<-1?e[r++]=this.DV+n:n>0&&(e[r++]=n),e.t=r,e.clamp();},w.prototype.multiplyTo=function ht(t,e){var r=this.abs(),n=t.abs(),i=r.t;for(e.t=i+n.t;--i>=0;)e[i]=0;for(i=0;i<n.t;++i)e[i+r.t]=r.am(0,n[i],e,i,0,r.t);e.s=0,e.clamp(),this.s!=t.s&&w.ZERO.subTo(e,e);},w.prototype.squareTo=function lt(t){for(var e=this.abs(),r=t.t=2*e.t;--r>=0;)t[r]=0;for(r=0;r<e.t-1;++r){var n=e.am(r,e[r],t,2*r,0,1);(t[r+e.t]+=e.am(r+1,2*e[r],t,2*r+1,n,e.t-r-1))>=e.DV&&(t[r+e.t]-=e.DV,t[r+e.t+1]=1);}t.t>0&&(t[t.t-1]+=e.am(r,e[r],t,2*r,0,1)),t.s=0,t.clamp();},w.prototype.divRemTo=function ft(t,e,r){var n=t.abs();if(!(n.t<=0)){var i=this.abs();if(i.t<n.t)return null!=e&&e.fromInt(0),void(null!=r&&this.copyTo(r));null==r&&(r=F());var o=F(),s=this.s,a=t.s,u=this.DB-D(n[n.t-1]);u>0?(n.lShiftTo(u,o),i.lShiftTo(u,r)):(n.copyTo(o),i.copyTo(r));var c=o.t,h=o[c-1];if(0!=h){var l=h*(1<<this.F1)+(c>1?o[c-2]>>this.F2:0),f=this.FV/l,g=(1<<this.F1)/l,d=1<<this.F2,p=r.t,v=p-c,y=null==e?F():e;for(o.dlShiftTo(v,y),r.compareTo(y)>=0&&(r[r.t++]=1,r.subTo(y,r)),w.ONE.dlShiftTo(c,y),y.subTo(o,o);o.t<c;)o[o.t++]=0;for(;--v>=0;){var m=r[--p]==h?this.DM:Math.floor(r[p]*f+(r[p-1]+d)*g);if((r[p]+=o.am(0,m,r,v,0,c))<m)for(o.dlShiftTo(v,y),r.subTo(y,r);r[p]<--m;)r.subTo(y,r);}null!=e&&(r.drShiftTo(c,e),s!=a&&w.ZERO.subTo(e,e)),r.t=c,r.clamp(),u>0&&r.rShiftTo(u,r),s<0&&w.ZERO.subTo(r,r);}}},w.prototype.invDigit=function gt(){if(this.t<1)return 0;var t=this[0];if(0==(1&t))return 0;var e=3&t;return (e=(e=(e=(e=e*(2-(15&t)*e)&15)*(2-(255&t)*e)&255)*(2-((65535&t)*e&65535))&65535)*(2-t*e%this.DV)%this.DV)>0?this.DV-e:-e},w.prototype.isEven=function dt(){return 0==(this.t>0?1&this[0]:this.s)},w.prototype.exp=function pt(t,e){if(t>4294967295||t<1)return w.ONE;var r=F(),n=F(),i=e.convert(this),o=D(t)-1;for(i.copyTo(r);--o>=0;)if(e.sqrTo(r,n),(t&1<<o)>0)e.mulTo(n,i,r);else {var s=r;r=n,n=s;}return e.revert(r)},w.prototype.toString=function vt(t){if(this.s<0)return "-"+this.negate().toString(t);var e;if(16==t)e=4;else if(8==t)e=3;else if(2==t)e=1;else if(32==t)e=5;else {if(4!=t)return this.toRadix(t);e=2;}var r,n=(1<<e)-1,i=false,o="",s=this.t,a=this.DB-s*this.DB%e;if(s-- >0)for(a<this.DB&&(r=this[s]>>a)>0&&(i=true,o=T(r));s>=0;)a<e?(r=(this[s]&(1<<a)-1)<<e-a,r|=this[--s]>>(a+=this.DB-e)):(r=this[s]>>(a-=e)&n,a<=0&&(a+=this.DB,--s)),r>0&&(i=true),i&&(o+=T(r));return i?o:"0"},w.prototype.negate=function yt(){var t=F();return w.ZERO.subTo(this,t),t},w.prototype.abs=function mt(){return this.s<0?this.negate():this},w.prototype.compareTo=function _t(t){var e=this.s-t.s;if(0!=e)return e;var r=this.t;if(0!=(e=r-t.t))return this.s<0?-e:e;for(;--r>=0;)if(0!=(e=this[r]-t[r]))return e;return 0},w.prototype.bitLength=function St(){return this.t<=0?0:this.DB*(this.t-1)+D(this[this.t-1]^this.s&this.DM)},w.prototype.mod=function bt(t){var e=F();return this.abs().divRemTo(t,null,e),this.s<0&&e.compareTo(w.ZERO)>0&&t.subTo(e,e),e},w.prototype.modPowInt=function wt(t,e){var r;return r=t<256||e.isEven()?new L(e):new N(e),this.exp(t,r)},w.ZERO=I(0),w.ONE=I(1),V.prototype.convert=K,V.prototype.revert=K,V.prototype.mulTo=function Ft(t,e,r){t.multiplyTo(e,r);},V.prototype.sqrTo=function Et(t,e){t.squareTo(e);},q.prototype.convert=function xt(t){if(t.s<0||t.t>2*this.m.t)return t.mod(this.m);if(t.compareTo(this.m)<0)return t;var e=F();return t.copyTo(e),this.reduce(e),e},q.prototype.revert=function At(t){return t},q.prototype.reduce=function kt(t){for(t.drShiftTo(this.m.t-1,this.r2),t.t>this.m.t+1&&(t.t=this.m.t+1,t.clamp()),this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3),this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);t.compareTo(this.r2)<0;)t.dAddOffset(1,this.m.t+1);for(t.subTo(this.r2,t);t.compareTo(this.m)>=0;)t.subTo(this.m,t);},q.prototype.mulTo=function Pt(t,e,r){t.multiplyTo(e,r),this.reduce(r);},q.prototype.sqrTo=function Ct(t,e){t.squareTo(e),this.reduce(e);};var Tt=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],Rt=(1<<26)/Tt[Tt.length-1];
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function It(){this.i=0,this.j=0,this.S=new Array;}w.prototype.chunkSize=function Dt(t){return Math.floor(Math.LN2*this.DB/Math.log(t))},w.prototype.toRadix=function Lt(t){if(null==t&&(t=10),0==this.signum()||t<2||t>36)return "0";var e=this.chunkSize(t),r=Math.pow(t,e),n=I(r),i=F(),o=F(),s="";for(this.divRemTo(n,i,o);i.signum()>0;)s=(r+o.intValue()).toString(t).substr(1)+s,i.divRemTo(n,i,o);return o.intValue().toString(t)+s},w.prototype.fromRadix=function Nt(t,e){this.fromInt(0),null==e&&(e=10);for(var r=this.chunkSize(e),n=Math.pow(e,r),i=false,o=0,s=0,a=0;a<t.length;++a){var u=R(t,a);u<0?"-"==t.charAt(a)&&0==this.signum()&&(i=true):(s=e*s+u,++o>=r&&(this.dMultiply(n),this.dAddOffset(s,0),o=0,s=0));}o>0&&(this.dMultiply(Math.pow(e,o)),this.dAddOffset(s,0)),i&&w.ZERO.subTo(this,this);},w.prototype.fromNumber=function Ut(t,e,r){if("number"==typeof e)if(t<2)this.fromInt(1);else for(this.fromNumber(t,r),this.testBit(t-1)||this.bitwiseTo(w.ONE.shiftLeft(t-1),B,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(e);)this.dAddOffset(2,0),this.bitLength()>t&&this.subTo(w.ONE.shiftLeft(t-1),this);else {var n=new Array,i=7&t;n.length=1+(t>>3),e.nextBytes(n),i>0?n[0]&=(1<<i)-1:n[0]=0,this.fromString(n,256);}},w.prototype.bitwiseTo=function Bt(t,e,r){var n,i,o=Math.min(t.t,this.t);for(n=0;n<o;++n)r[n]=e(this[n],t[n]);if(t.t<this.t){for(i=t.s&this.DM,n=o;n<this.t;++n)r[n]=e(this[n],i);r.t=this.t;}else {for(i=this.s&this.DM,n=o;n<t.t;++n)r[n]=e(i,t[n]);r.t=t.t;}r.s=e(this.s,t.s),r.clamp();},w.prototype.changeBit=function Ot(t,e){var r=w.ONE.shiftLeft(t);return this.bitwiseTo(r,e,r),r},w.prototype.addTo=function jt(t,e){for(var r=0,n=0,i=Math.min(t.t,this.t);r<i;)n+=this[r]+t[r],e[r++]=n&this.DM,n>>=this.DB;if(t.t<this.t){for(n+=t.s;r<this.t;)n+=this[r],e[r++]=n&this.DM,n>>=this.DB;n+=this.s;}else {for(n+=this.s;r<t.t;)n+=t[r],e[r++]=n&this.DM,n>>=this.DB;n+=t.s;}e.s=n<0?-1:0,n>0?e[r++]=n:n<-1&&(e[r++]=this.DV+n),e.t=r,e.clamp();},w.prototype.dMultiply=function Mt(t){this[this.t]=this.am(0,t-1,this,0,0,this.t),++this.t,this.clamp();},w.prototype.dAddOffset=function Ht(t,e){if(0!=t){for(;this.t<=e;)this[this.t++]=0;for(this[e]+=t;this[e]>=this.DV;)this[e]-=this.DV,++e>=this.t&&(this[this.t++]=0),++this[e];}},w.prototype.multiplyLowerTo=function Vt(t,e,r){var n,i=Math.min(this.t+t.t,e);for(r.s=0,r.t=i;i>0;)r[--i]=0;for(n=r.t-this.t;i<n;++i)r[i+this.t]=this.am(0,t[i],r,i,0,this.t);for(n=Math.min(t.t,e);i<n;++i)this.am(0,t[i],r,i,0,e-i);r.clamp();},w.prototype.multiplyUpperTo=function Kt(t,e,r){--e;var n=r.t=this.t+t.t-e;for(r.s=0;--n>=0;)r[n]=0;for(n=Math.max(e-this.t,0);n<t.t;++n)r[this.t+n-e]=this.am(e-n,t[n],r,0,0,this.t+n-e);r.clamp(),r.drShiftTo(1,r);},w.prototype.modInt=function qt(t){if(t<=0)return 0;var e=this.DV%t,r=this.s<0?t-1:0;if(this.t>0)if(0==e)r=this[0]%t;else for(var n=this.t-1;n>=0;--n)r=(e*r+this[n])%t;return r},w.prototype.millerRabin=function Jt(t){var e=this.subtract(w.ONE),r=e.getLowestSetBit();if(r<=0)return  false;var n=e.shiftRight(r);(t=t+1>>1)>Tt.length&&(t=Tt.length);for(var i=F(),o=0;o<t;++o){i.fromInt(Tt[Math.floor(Math.random()*Tt.length)]);var s=i.modPow(n,this);if(0!=s.compareTo(w.ONE)&&0!=s.compareTo(e)){for(var a=1;a++<r&&0!=s.compareTo(e);)if(0==(s=s.modPowInt(2,this)).compareTo(w.ONE))return  false;if(0!=s.compareTo(e))return  false}}return  true},w.prototype.clone=
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function Wt(){var t=F();return this.copyTo(t),t},w.prototype.intValue=function zt(){if(this.s<0){if(1==this.t)return this[0]-this.DV;if(0==this.t)return  -1}else {if(1==this.t)return this[0];if(0==this.t)return 0}return (this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]},w.prototype.byteValue=function Yt(){return 0==this.t?this.s:this[0]<<24>>24},w.prototype.shortValue=function Gt(){return 0==this.t?this.s:this[0]<<16>>16},w.prototype.signum=function Xt(){return this.s<0?-1:this.t<=0||1==this.t&&this[0]<=0?0:1},w.prototype.toByteArray=function $t(){var t=this.t,e=new Array;e[0]=this.s;var r,n=this.DB-t*this.DB%8,i=0;if(t-- >0)for(n<this.DB&&(r=this[t]>>n)!=(this.s&this.DM)>>n&&(e[i++]=r|this.s<<this.DB-n);t>=0;)n<8?(r=(this[t]&(1<<n)-1)<<8-n,r|=this[--t]>>(n+=this.DB-8)):(r=this[t]>>(n-=8)&255,n<=0&&(n+=this.DB,--t)),0!=(128&r)&&(r|=-256),0==i&&(128&this.s)!=(128&r)&&++i,(i>0||r!=this.s)&&(e[i++]=r);return e},w.prototype.equals=function Qt(t){return 0==this.compareTo(t)},w.prototype.min=function Zt(t){return this.compareTo(t)<0?this:t},w.prototype.max=function te(t){return this.compareTo(t)>0?this:t},w.prototype.and=function ee(t){var e=F();return this.bitwiseTo(t,U,e),e},w.prototype.or=function re(t){var e=F();return this.bitwiseTo(t,B,e),e},w.prototype.xor=function ne(t){var e=F();return this.bitwiseTo(t,O,e),e},w.prototype.andNot=function ie(t){var e=F();return this.bitwiseTo(t,j,e),e},w.prototype.not=function oe(){for(var t=F(),e=0;e<this.t;++e)t[e]=this.DM&~this[e];return t.t=this.t,t.s=~this.s,t},w.prototype.shiftLeft=function se(t){var e=F();return t<0?this.rShiftTo(-t,e):this.lShiftTo(t,e),e},w.prototype.shiftRight=function ae(t){var e=F();return t<0?this.lShiftTo(-t,e):this.rShiftTo(t,e),e},w.prototype.getLowestSetBit=function ue(){for(var t=0;t<this.t;++t)if(0!=this[t])return t*this.DB+M(this[t]);return this.s<0?this.t*this.DB:-1},w.prototype.bitCount=function ce(){for(var t=0,e=this.s&this.DM,r=0;r<this.t;++r)t+=H(this[r]^e);return t},w.prototype.testBit=function he(t){var e=Math.floor(t/this.DB);return e>=this.t?0!=this.s:0!=(this[e]&1<<t%this.DB)},w.prototype.setBit=function le(t){return this.changeBit(t,B)},w.prototype.clearBit=function fe(t){return this.changeBit(t,j)},w.prototype.flipBit=function ge(t){return this.changeBit(t,O)},w.prototype.add=function de(t){var e=F();return this.addTo(t,e),e},w.prototype.subtract=function pe(t){var e=F();return this.subTo(t,e),e},w.prototype.multiply=function ve(t){var e=F();return this.multiplyTo(t,e),e},w.prototype.divide=function ye(t){var e=F();return this.divRemTo(t,e,null),e},w.prototype.remainder=function me(t){var e=F();return this.divRemTo(t,null,e),e},w.prototype.divideAndRemainder=function _e(t){var e=F(),r=F();return this.divRemTo(t,e,r),new Array(e,r)},w.prototype.modPow=function Se(t,e){var r,n,i=t.bitLength(),o=I(1);if(i<=0)return o;r=i<18?1:i<48?3:i<144?4:i<768?5:6,n=i<8?new L(e):e.isEven()?new q(e):new N(e);var s=new Array,a=3,u=r-1,c=(1<<r)-1;if(s[1]=n.convert(this),r>1){var h=F();for(n.sqrTo(s[1],h);a<=c;)s[a]=F(),n.mulTo(h,s[a-2],s[a]),a+=2;}var l,f,g=t.t-1,d=true,p=F();for(i=D(t[g])-1;g>=0;){for(i>=u?l=t[g]>>i-u&c:(l=(t[g]&(1<<i+1)-1)<<u-i,g>0&&(l|=t[g-1]>>this.DB+i-u)),a=r;0==(1&l);)l>>=1,--a;if((i-=a)<0&&(i+=this.DB,--g),d)s[l].copyTo(o),d=false;else {for(;a>1;)n.sqrTo(o,p),n.sqrTo(p,o),a-=2;a>0?n.sqrTo(o,p):(f=o,o=p,p=f),n.mulTo(p,s[l],o);}for(;g>=0&&0==(t[g]&1<<i);)n.sqrTo(o,p),f=o,o=p,p=f,--i<0&&(i=this.DB-1,--g);}return n.revert(o)},w.prototype.modInverse=function be(t){var e=t.isEven();if(this.isEven()&&e||0==t.signum())return w.ZERO;for(var r=t.clone(),n=this.clone(),i=I(1),o=I(0),s=I(0),a=I(1);0!=r.signum();){for(;r.isEven();)r.rShiftTo(1,r),e?(i.isEven()&&o.isEven()||(i.addTo(this,i),o.subTo(t,o)),i.rShiftTo(1,i)):o.isEven()||o.subTo(t,o),o.rShiftTo(1,o);for(;n.isEven();)n.rShiftTo(1,n),e?(s.isEven()&&a.isEven()||(s.addTo(this,s),a.subTo(t,a)),s.rShiftTo(1,s)):a.isEven()||a.subTo(t,a),a.rShiftTo(1,a);r.compareTo(n)>=0?(r.subTo(n,r),e&&i.subTo(s,i),o.subTo(a,o)):(n.subTo(r,n),e&&s.subTo(i,s),a.subTo(o,a));}return 0!=n.compareTo(w.ONE)?w.ZERO:a.compareTo(t)>=0?a.subtract(t):a.signum()<0?(a.addTo(t,a),a.signum()<0?a.add(t):a):a},w.prototype.pow=function we(t){return this.exp(t,new V)},w.prototype.gcd=function Fe(t){var e=this.s<0?this.negate():this.clone(),r=t.s<0?t.negate():t.clone();if(e.compareTo(r)<0){var n=e;e=r,r=n;}var i=e.getLowestSetBit(),o=r.getLowestSetBit();if(o<0)return e;for(i<o&&(o=i),o>0&&(e.rShiftTo(o,e),r.rShiftTo(o,r));e.signum()>0;)(i=e.getLowestSetBit())>0&&e.rShiftTo(i,e),(i=r.getLowestSetBit())>0&&r.rShiftTo(i,r),e.compareTo(r)>=0?(e.subTo(r,e),e.rShiftTo(1,e)):(r.subTo(e,r),r.rShiftTo(1,r));return o>0&&r.lShiftTo(o,r),r},w.prototype.isProbablePrime=function Ee(t){var e,r=this.abs();if(1==r.t&&r[0]<=Tt[Tt.length-1]){for(e=0;e<Tt.length;++e)if(r[0]==Tt[e])return  true;return  false}if(r.isEven())return  false;for(e=1;e<Tt.length;){for(var n=Tt[e],i=e+1;i<Tt.length&&n<Rt;)n*=Tt[i++];for(n=r.modInt(n);e<i;)if(n%Tt[e++]==0)return  false}return r.millerRabin(t)},w.prototype.square=function xe(){var t=F();return this.squareTo(t),t},It.prototype.init=function Ae(t){var e,r,n;for(e=0;e<256;++e)this.S[e]=e;for(r=0,e=0;e<256;++e)r=r+this.S[e]+t[e%t.length]&255,n=this.S[e],this.S[e]=this.S[r],this.S[r]=n;this.i=0,this.j=0;},It.prototype.next=function ke(){var t;return this.i=this.i+1&255,this.j=this.j+this.S[this.i]&255,t=this.S[this.i],this.S[this.i]=this.S[this.j],this.S[this.j]=t,this.S[t+this.S[this.i]&255]};var Pe,Ce,Te;
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */function Re(){!function t(e){Ce[Te++]^=255&e,Ce[Te++]^=e>>8&255,Ce[Te++]^=e>>16&255,Ce[Te++]^=e>>24&255,Te>=256&&(Te-=256);}((new Date).getTime());}if(null==Ce){var Ie;if(Ce=new Array,Te=0,void 0!==p&&(void 0!==p.crypto||void 0!==p.msCrypto)){var De=p.crypto||p.msCrypto;if(De.getRandomValues){var Le=new Uint8Array(32);for(De.getRandomValues(Le),Ie=0;Ie<32;++Ie)Ce[Te++]=Le[Ie];}else if("Netscape"==d.appName&&d.appVersion<"5"){var Ne=p.crypto.random(32);for(Ie=0;Ie<Ne.length;++Ie)Ce[Te++]=255&Ne.charCodeAt(Ie);}}for(;Te<256;)Ie=Math.floor(65536*Math.random()),Ce[Te++]=Ie>>>8,Ce[Te++]=255&Ie;Te=0,Re();}function Ue(){if(null==Pe){for(Re(),(Pe=function t(){return new It}()).init(Ce),Te=0;Te<Ce.length;++Te)Ce[Te]=0;Te=0;}return Pe.next()}function Be(){}
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function Oe(t,e){return new w(t,e)}function je(t,e,r){for(var n="",i=0;n.length<e;)n+=r(String.fromCharCode.apply(String,t.concat([(4278190080&i)>>24,(16711680&i)>>16,(65280&i)>>8,255&i]))),i+=1;return n}function Me(){this.n=null,this.e=0,this.d=null,this.p=null,this.q=null,this.dmp1=null,this.dmq1=null,this.coeff=null;}
/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
 */
function He(t,e){this.x=e,this.q=t;}function Ve(t,e,r,n){this.curve=t,this.x=e,this.y=r,this.z=null==n?w.ONE:n,this.zinv=null;}function Ke(t,e,r){this.q=t,this.a=this.fromBigInteger(e),this.b=this.fromBigInteger(r),this.infinity=new Ve(this,null,null);}Be.prototype.nextBytes=function qe(t){var e;for(e=0;e<t.length;++e)t[e]=Ue();},Me.prototype.doPublic=function Je(t){return t.modPowInt(this.e,this.n)},Me.prototype.setPublic=function We(t,e){if(this.isPublic=true,this.isPrivate=false,"string"!=typeof t)this.n=t,this.e=e;else {if(!(null!=t&&null!=e&&t.length>0&&e.length>0))throw "Invalid RSA public key";this.n=Oe(t,16),this.e=parseInt(e,16);}},Me.prototype.encrypt=function ze(t){var e=function r(t,e){if(e<t.length+11)throw "Message too long for RSA";for(var r=new Array,n=t.length-1;n>=0&&e>0;){var i=t.charCodeAt(n--);i<128?r[--e]=i:i>127&&i<2048?(r[--e]=63&i|128,r[--e]=i>>6|192):(r[--e]=63&i|128,r[--e]=i>>6&63|128,r[--e]=i>>12|224);}r[--e]=0;for(var o=new Be,s=new Array;e>2;){for(s[0]=0;0==s[0];)o.nextBytes(s);r[--e]=s[0];}return r[--e]=2,r[--e]=0,new w(r)}(t,this.n.bitLength()+7>>3);if(null==e)return null;var n=this.doPublic(e);if(null==n)return null;var i=n.toString(16);return 0==(1&i.length)?i:"0"+i},Me.prototype.encryptOAEP=function Ye(t,e,r){var n=function i(t,e,r,n){var i=Sr.crypto.MessageDigest,o=Sr.crypto.Util,s=null;if(r||(r="sha1"),"string"==typeof r&&(s=i.getCanonicalAlgName(r),n=i.getHashLength(s),r=function t(e){return Lr(o.hashHex(Nr(e),s))}),t.length+2*n+2>e)throw "Message too long for RSA";var a,u="";for(a=0;a<e-t.length-2*n-2;a+=1)u+="\0";var c=r("")+u+""+t,h=new Array(n);(new Be).nextBytes(h);var l=je(h,c.length,r),f=[];for(a=0;a<c.length;a+=1)f[a]=c.charCodeAt(a)^l.charCodeAt(a);var g=je(f,h.length,r),d=[0];for(a=0;a<h.length;a+=1)d[a+1]=h[a]^g.charCodeAt(a);return new w(d.concat(f))}(t,this.n.bitLength()+7>>3,e,r);if(null==n)return null;var o=this.doPublic(n);if(null==o)return null;var s=o.toString(16);return 0==(1&s.length)?s:"0"+s},Me.prototype.type="RSA",He.prototype.equals=function Ge(t){return t==this||this.q.equals(t.q)&&this.x.equals(t.x)},He.prototype.toBigInteger=function Xe(){return this.x},He.prototype.negate=function $e(){return new He(this.q,this.x.negate().mod(this.q))},He.prototype.add=function Qe(t){return new He(this.q,this.x.add(t.toBigInteger()).mod(this.q))},He.prototype.subtract=function Ze(t){return new He(this.q,this.x.subtract(t.toBigInteger()).mod(this.q))},He.prototype.multiply=function tr(t){return new He(this.q,this.x.multiply(t.toBigInteger()).mod(this.q))},He.prototype.square=function er(){return new He(this.q,this.x.square().mod(this.q))},He.prototype.divide=function rr(t){return new He(this.q,this.x.multiply(t.toBigInteger().modInverse(this.q)).mod(this.q))},Ve.prototype.getX=function nr(){return null==this.zinv&&(this.zinv=this.z.modInverse(this.curve.q)),this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q))},Ve.prototype.getY=function ir(){return null==this.zinv&&(this.zinv=this.z.modInverse(this.curve.q)),this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q))},Ve.prototype.equals=function or(t){return t==this||(this.isInfinity()?t.isInfinity():t.isInfinity()?this.isInfinity():!!t.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(t.z)).mod(this.curve.q).equals(w.ZERO)&&t.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(t.z)).mod(this.curve.q).equals(w.ZERO))},Ve.prototype.isInfinity=function sr(){return null==this.x&&null==this.y||this.z.equals(w.ZERO)&&!this.y.toBigInteger().equals(w.ZERO)},Ve.prototype.negate=function ar(){return new Ve(this.curve,this.x,this.y.negate(),this.z)},Ve.prototype.add=function ur(t){if(this.isInfinity())return t;if(t.isInfinity())return this;var e=t.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(t.z)).mod(this.curve.q),r=t.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(t.z)).mod(this.curve.q);if(w.ZERO.equals(r))return w.ZERO.equals(e)?this.twice():this.curve.getInfinity();var n=new w("3"),i=this.x.toBigInteger(),o=this.y.toBigInteger(),s=(t.x.toBigInteger(),t.y.toBigInteger(),r.square()),a=s.multiply(r),u=i.multiply(s),c=e.square().multiply(this.z),h=c.subtract(u.shiftLeft(1)).multiply(t.z).subtract(a).multiply(r).mod(this.curve.q),l=u.multiply(n).multiply(e).subtract(o.multiply(a)).subtract(c.multiply(e)).multiply(t.z).add(e.multiply(a)).mod(this.curve.q),f=a.multiply(this.z).multiply(t.z).mod(this.curve.q);return new Ve(this.curve,this.curve.fromBigInteger(h),this.curve.fromBigInteger(l),f)},Ve.prototype.twice=function cr(){if(this.isInfinity())return this;if(0==this.y.toBigInteger().signum())return this.curve.getInfinity();var t=new w("3"),e=this.x.toBigInteger(),r=this.y.toBigInteger(),n=r.multiply(this.z),i=n.multiply(r).mod(this.curve.q),o=this.curve.a.toBigInteger(),s=e.square().multiply(t);w.ZERO.equals(o)||(s=s.add(this.z.square().multiply(o)));var a=(s=s.mod(this.curve.q)).square().subtract(e.shiftLeft(3).multiply(i)).shiftLeft(1).multiply(n).mod(this.curve.q),u=s.multiply(t).multiply(e).subtract(i.shiftLeft(1)).shiftLeft(2).multiply(i).subtract(s.square().multiply(s)).mod(this.curve.q),c=n.square().multiply(n).shiftLeft(3).mod(this.curve.q);return new Ve(this.curve,this.curve.fromBigInteger(a),this.curve.fromBigInteger(u),c)},Ve.prototype.multiply=function hr(t){if(this.isInfinity())return this;if(0==t.signum())return this.curve.getInfinity();var e,r=t,n=r.multiply(new w("3")),i=this.negate(),o=this,s=this.curve.q.subtract(t),a=s.multiply(new w("3")),u=new Ve(this.curve,this.x,this.y),c=u.negate();for(e=n.bitLength()-2;e>0;--e){o=o.twice();var h=n.testBit(e);h!=r.testBit(e)&&(o=o.add(h?this:i));}for(e=a.bitLength()-2;e>0;--e){u=u.twice();var l=a.testBit(e);l!=s.testBit(e)&&(u=u.add(l?u:c));}return o},Ve.prototype.multiplyTwo=function lr(t,e,r){var n;n=t.bitLength()>r.bitLength()?t.bitLength()-1:r.bitLength()-1;for(var i=this.curve.getInfinity(),o=this.add(e);n>=0;)i=i.twice(),t.testBit(n)?i=r.testBit(n)?i.add(o):i.add(this):r.testBit(n)&&(i=i.add(e)),--n;return i},Ke.prototype.getQ=function fr(){return this.q},Ke.prototype.getA=function gr(){return this.a},Ke.prototype.getB=function dr(){return this.b},Ke.prototype.equals=function pr(t){return t==this||this.q.equals(t.q)&&this.a.equals(t.a)&&this.b.equals(t.b)},Ke.prototype.getInfinity=function vr(){return this.infinity},Ke.prototype.fromBigInteger=function yr(t){return new He(this.q,t)},Ke.prototype.decodePointHex=function mr(t){switch(parseInt(t.substr(0,2),16)){case 0:return this.infinity;case 2:case 3:return null;case 4:case 6:case 7:var e=(t.length-2)/2,r=t.substr(2,e),n=t.substr(e+2,e);return new Ve(this,this.fromBigInteger(new w(r,16)),this.fromBigInteger(new w(n,16)));default:return null}},
/*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
 */
He.prototype.getByteLength=function(){return Math.floor((this.toBigInteger().bitLength()+7)/8)},Ve.prototype.getEncoded=function(t){var e=function t(e,r){var n=e.toByteArrayUnsigned();if(r<n.length)n=n.slice(n.length-r);else for(;r>n.length;)n.unshift(0);return n},r=this.getX().toBigInteger(),n=this.getY().toBigInteger(),i=e(r,32);return t?n.isEven()?i.unshift(2):i.unshift(3):(i.unshift(4),i=i.concat(e(n,32))),i},Ve.decodeFrom=function(t,e){e[0];var r=e.length-1,n=e.slice(1,1+r/2),i=e.slice(1+r/2,1+r);n.unshift(0),i.unshift(0);var o=new w(n),s=new w(i);return new Ve(t,t.fromBigInteger(o),t.fromBigInteger(s))},Ve.decodeFromHex=function(t,e){e.substr(0,2);var r=e.length-2,n=e.substr(2,r/2),i=e.substr(2+r/2,r/2),o=new w(n,16),s=new w(i,16);return new Ve(t,t.fromBigInteger(o),t.fromBigInteger(s))},Ve.prototype.add2D=function(t){if(this.isInfinity())return t;if(t.isInfinity())return this;if(this.x.equals(t.x))return this.y.equals(t.y)?this.twice():this.curve.getInfinity();var e=t.x.subtract(this.x),r=t.y.subtract(this.y).divide(e),n=r.square().subtract(this.x).subtract(t.x),i=r.multiply(this.x.subtract(n)).subtract(this.y);return new Ve(this.curve,n,i)},Ve.prototype.twice2D=function(){if(this.isInfinity())return this;if(0==this.y.toBigInteger().signum())return this.curve.getInfinity();var t=this.curve.fromBigInteger(w.valueOf(2)),e=this.curve.fromBigInteger(w.valueOf(3)),r=this.x.square().multiply(e).add(this.curve.a).divide(this.y.multiply(t)),n=r.square().subtract(this.x.multiply(t)),i=r.multiply(this.x.subtract(n)).subtract(this.y);return new Ve(this.curve,n,i)},Ve.prototype.multiply2D=function(t){if(this.isInfinity())return this;if(0==t.signum())return this.curve.getInfinity();var e,r=t,n=r.multiply(new w("3")),i=this.negate(),o=this;for(e=n.bitLength()-2;e>0;--e){o=o.twice();var s=n.testBit(e);s!=r.testBit(e)&&(o=o.add2D(s?this:i));}return o},Ve.prototype.isOnCurve=function(){var t=this.getX().toBigInteger(),e=this.getY().toBigInteger(),r=this.curve.getA().toBigInteger(),n=this.curve.getB().toBigInteger(),i=this.curve.getQ(),o=e.multiply(e).mod(i),s=t.multiply(t).multiply(t).add(r.multiply(t)).add(n).mod(i);return o.equals(s)},Ve.prototype.toString=function(){return "("+this.getX().toBigInteger().toString()+","+this.getY().toBigInteger().toString()+")"},Ve.prototype.validate=function(){var t=this.curve.getQ();if(this.isInfinity())throw new Error("Point is at infinity.");var e=this.getX().toBigInteger(),r=this.getY().toBigInteger();if(e.compareTo(w.ONE)<0||e.compareTo(t.subtract(w.ONE))>0)throw new Error("x coordinate out of bounds");if(r.compareTo(w.ONE)<0||r.compareTo(t.subtract(w.ONE))>0)throw new Error("y coordinate out of bounds");if(!this.isOnCurve())throw new Error("Point is not on the curve.");if(this.multiply(t).isInfinity())throw new Error("Point is not a scalar multiple of G.");return  true};
/*! Mike Samuel (c) 2009 | code.google.com/p/json-sans-eval
 */
var _r=function(){var t=new RegExp('(?:false|true|null|[\\{\\}\\[\\]]|(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)|(?:"(?:[^\\0-\\x08\\x0a-\\x1f"\\\\]|\\\\(?:["/\\\\bfnrt]|u[0-9A-Fa-f]{4}))*"))',"g"),e=new RegExp("\\\\(?:([^u])|u(.{4}))","g"),r={'"':'"',"/":"/","\\":"\\",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"};function n(t,e,n){return e?r[e]:String.fromCharCode(parseInt(n,16))}var i=new String(""),o=Object.hasOwnProperty;return function(r,s){var a,u,c=r.match(t),h=c[0],l=false;"{"===h?a={}:"["===h?a=[]:(a=[],l=true);for(var f=[a],d=1-l,p=c.length;d<p;++d){var v;switch((h=c[d]).charCodeAt(0)){default:(v=f[0])[u||v.length]=+h,u=void 0;break;case 34:if(-1!==(h=h.substring(1,h.length-1)).indexOf("\\")&&(h=h.replace(e,n)),v=f[0],!u){if(!(v instanceof Array)){u=h||i;break}u=v.length;}v[u]=h,u=void 0;break;case 91:v=f[0],f.unshift(v[u||v.length]=[]),u=void 0;break;case 93:f.shift();break;case 102:(v=f[0])[u||v.length]=false,u=void 0;break;case 110:(v=f[0])[u||v.length]=null,u=void 0;break;case 116:(v=f[0])[u||v.length]=true,u=void 0;break;case 123:v=f[0],f.unshift(v[u||v.length]={}),u=void 0;break;case 125:f.shift();}}if(l){if(1!==f.length)throw new Error;a=a[0];}else if(f.length)throw new Error;if(s){a=function t(e,r){var n=e[r];if(n&&"object"===(void 0===n?"undefined":g(n))){var i=null;for(var a in n)if(o.call(n,a)&&n!==e){var u=t(n,a);void 0!==u?n[a]=u:(i||(i=[]),i.push(a));}if(i)for(var c=i.length;--c>=0;)delete n[i[c]];}return s.call(e,r,n)}({"":a},"");}return a}}();void 0!==Sr&&Sr||(e.KJUR=Sr={}),void 0!==Sr.asn1&&Sr.asn1||(Sr.asn1={}),Sr.asn1.ASN1Util=new function(){this.integerToByteHex=function(t){var e=t.toString(16);return e.length%2==1&&(e="0"+e),e},this.bigIntToMinTwosComplementsHex=function(t){var e=t.toString(16);if("-"!=e.substr(0,1))e.length%2==1?e="0"+e:e.match(/^[0-7]/)||(e="00"+e);else {var r=e.substr(1).length;r%2==1?r+=1:e.match(/^[0-7]/)||(r+=2);for(var n="",i=0;i<r;i++)n+="f";e=new w(n,16).xor(t).add(w.ONE).toString(16).replace(/^-/,"");}return e},this.getPEMStringFromHex=function(t,e){return jr(t,e)},this.newObject=function(t){var e=Sr.asn1,r=e.ASN1Object,n=e.DERBoolean,i=e.DERInteger,o=e.DERBitString,s=e.DEROctetString,a=e.DERNull,u=e.DERObjectIdentifier,c=e.DEREnumerated,h=e.DERUTF8String,l=e.DERNumericString,f=e.DERPrintableString,g=e.DERTeletexString,d=e.DERIA5String,p=e.DERUTCTime,v=e.DERGeneralizedTime,y=e.DERVisibleString,m=e.DERBMPString,_=e.DERSequence,S=e.DERSet,b=e.DERTaggedObject,w=e.ASN1Util.newObject;if(t instanceof e.ASN1Object)return t;var F=Object.keys(t);if(1!=F.length)throw new Error("key of param shall be only one.");var E=F[0];if(-1==":asn1:bool:int:bitstr:octstr:null:oid:enum:utf8str:numstr:prnstr:telstr:ia5str:utctime:gentime:visstr:bmpstr:seq:set:tag:".indexOf(":"+E+":"))throw new Error("undefined key: "+E);if("bool"==E)return new n(t[E]);if("int"==E)return new i(t[E]);if("bitstr"==E)return new o(t[E]);if("octstr"==E)return new s(t[E]);if("null"==E)return new a(t[E]);if("oid"==E)return new u(t[E]);if("enum"==E)return new c(t[E]);if("utf8str"==E)return new h(t[E]);if("numstr"==E)return new l(t[E]);if("prnstr"==E)return new f(t[E]);if("telstr"==E)return new g(t[E]);if("ia5str"==E)return new d(t[E]);if("utctime"==E)return new p(t[E]);if("gentime"==E)return new v(t[E]);if("visstr"==E)return new y(t[E]);if("bmpstr"==E)return new m(t[E]);if("asn1"==E)return new r(t[E]);if("seq"==E){for(var x=t[E],A=[],k=0;k<x.length;k++){var P=w(x[k]);A.push(P);}return new _({array:A})}if("set"==E){for(x=t[E],A=[],k=0;k<x.length;k++){P=w(x[k]);A.push(P);}return new S({array:A})}if("tag"==E){var C=t[E];if("[object Array]"===Object.prototype.toString.call(C)&&3==C.length){var T=w(C[2]);return new b({tag:C[0],explicit:C[1],obj:T})}return new b(C)}},this.jsonToASN1HEX=function(t){return this.newObject(t).getEncodedHex()};},Sr.asn1.ASN1Util.oidHexToInt=function(t){for(var e="",r=parseInt(t.substr(0,2),16),n=(e=Math.floor(r/40)+"."+r%40,""),i=2;i<t.length;i+=2){var o=("00000000"+parseInt(t.substr(i,2),16).toString(2)).slice(-8);if(n+=o.substr(1,7),"0"==o.substr(0,1))e=e+"."+new w(n,2).toString(10),n="";}return e},Sr.asn1.ASN1Util.oidIntToHex=function(t){var e=function t(e){var r=e.toString(16);return 1==r.length&&(r="0"+r),r},r=function t(r){var n="",i=new w(r,10).toString(2),o=7-i.length%7;7==o&&(o=0);for(var s="",a=0;a<o;a++)s+="0";i=s+i;for(a=0;a<i.length-1;a+=7){var u=i.substr(a,7);a!=i.length-7&&(u="1"+u),n+=e(parseInt(u,2));}return n};if(!t.match(/^[0-9.]+$/))throw "malformed oid string: "+t;var n="",i=t.split("."),o=40*parseInt(i[0])+parseInt(i[1]);n+=e(o),i.splice(0,2);for(var s=0;s<i.length;s++)n+=r(i[s]);return n},Sr.asn1.ASN1Object=function(t){this.params=null,this.getLengthHexFromValue=function(){if(void 0===this.hV||null==this.hV)throw new Error("this.hV is null or undefined");if(this.hV.length%2==1)throw new Error("value hex must be even length: n="+"".length+",v="+this.hV);var t=this.hV.length/2,e=t.toString(16);if(e.length%2==1&&(e="0"+e),t<128)return e;var r=e.length/2;if(r>15)throw "ASN.1 length too long to represent by 8x: n = "+t.toString(16);return (128+r).toString(16)+e},this.getEncodedHex=function(){return (null==this.hTLV||this.isModified)&&(this.hV=this.getFreshValueHex(),this.hL=this.getLengthHexFromValue(),this.hTLV=this.hT+this.hL+this.hV,this.isModified=false),this.hTLV},this.getValueHex=function(){return this.getEncodedHex(),this.hV},this.getFreshValueHex=function(){return ""},this.setByParam=function(t){this.params=t;},null!=t&&null!=t.tlv&&(this.hTLV=t.tlv,this.isModified=false);},Sr.asn1.DERAbstractString=function(t){Sr.asn1.DERAbstractString.superclass.constructor.call(this);this.getString=function(){return this.s},this.setString=function(t){this.hTLV=null,this.isModified=true,this.s=t,this.hV=Ir(this.s).toLowerCase();},this.setStringHex=function(t){this.hTLV=null,this.isModified=true,this.s=null,this.hV=t;},this.getFreshValueHex=function(){return this.hV},void 0!==t&&("string"==typeof t?this.setString(t):void 0!==t.str?this.setString(t.str):void 0!==t.hex&&this.setStringHex(t.hex));},Zr(Sr.asn1.DERAbstractString,Sr.asn1.ASN1Object),Sr.asn1.DERAbstractTime=function(t){Sr.asn1.DERAbstractTime.superclass.constructor.call(this);this.localDateToUTC=function(t){var e=t.getTime()+6e4*t.getTimezoneOffset();return new Date(e)},this.formatDate=function(t,e,r){var n=this.zeroPadding,i=this.localDateToUTC(t),o=String(i.getFullYear());"utc"==e&&(o=o.substr(2,2));var s=o+n(String(i.getMonth()+1),2)+n(String(i.getDate()),2)+n(String(i.getHours()),2)+n(String(i.getMinutes()),2)+n(String(i.getSeconds()),2);if(true===r){var a=i.getMilliseconds();if(0!=a){var u=n(String(a),3);s=s+"."+(u=u.replace(/[0]+$/,""));}}return s+"Z"},this.zeroPadding=function(t,e){return t.length>=e?t:new Array(e-t.length+1).join("0")+t},this.getString=function(){return this.s},this.setString=function(t){this.hTLV=null,this.isModified=true,this.s=t,this.hV=kr(t);},this.setByDateValue=function(t,e,r,n,i,o){var s=new Date(Date.UTC(t,e-1,r,n,i,o,0));this.setByDate(s);},this.getFreshValueHex=function(){return this.hV};},Zr(Sr.asn1.DERAbstractTime,Sr.asn1.ASN1Object),Sr.asn1.DERAbstractStructured=function(t){Sr.asn1.DERAbstractString.superclass.constructor.call(this);this.setByASN1ObjectArray=function(t){this.hTLV=null,this.isModified=true,this.asn1Array=t;},this.appendASN1Object=function(t){this.hTLV=null,this.isModified=true,this.asn1Array.push(t);},this.asn1Array=new Array,void 0!==t&&void 0!==t.array&&(this.asn1Array=t.array);},Zr(Sr.asn1.DERAbstractStructured,Sr.asn1.ASN1Object),Sr.asn1.DERBoolean=function(t){Sr.asn1.DERBoolean.superclass.constructor.call(this),this.hT="01",this.hTLV=0==t?"010100":"0101ff";},Zr(Sr.asn1.DERBoolean,Sr.asn1.ASN1Object),Sr.asn1.DERInteger=function(t){Sr.asn1.DERInteger.superclass.constructor.call(this),this.hT="02",this.setByBigInteger=function(t){this.hTLV=null,this.isModified=true,this.hV=Sr.asn1.ASN1Util.bigIntToMinTwosComplementsHex(t);},this.setByInteger=function(t){var e=new w(String(t),10);this.setByBigInteger(e);},this.setValueHex=function(t){this.hV=t;},this.getFreshValueHex=function(){return this.hV},void 0!==t&&(void 0!==t.bigint?this.setByBigInteger(t.bigint):void 0!==t.int?this.setByInteger(t.int):"number"==typeof t?this.setByInteger(t):void 0!==t.hex&&this.setValueHex(t.hex));},Zr(Sr.asn1.DERInteger,Sr.asn1.ASN1Object),Sr.asn1.DERBitString=function(t){if(void 0!==t&&void 0!==t.obj){var e=Sr.asn1.ASN1Util.newObject(t.obj);t.hex="00"+e.getEncodedHex();}Sr.asn1.DERBitString.superclass.constructor.call(this),this.hT="03",this.setHexValueIncludingUnusedBits=function(t){this.hTLV=null,this.isModified=true,this.hV=t;},this.setUnusedBitsAndHexValue=function(t,e){if(t<0||7<t)throw "unused bits shall be from 0 to 7: u = "+t;var r="0"+t;this.hTLV=null,this.isModified=true,this.hV=r+e;},this.setByBinaryString=function(t){var e=8-(t=t.replace(/0+$/,"")).length%8;8==e&&(e=0);for(var r=0;r<=e;r++)t+="0";var n="";for(r=0;r<t.length-1;r+=8){var i=t.substr(r,8),o=parseInt(i,2).toString(16);1==o.length&&(o="0"+o),n+=o;}this.hTLV=null,this.isModified=true,this.hV="0"+e+n;},this.setByBooleanArray=function(t){for(var e="",r=0;r<t.length;r++)1==t[r]?e+="1":e+="0";this.setByBinaryString(e);},this.newFalseArray=function(t){for(var e=new Array(t),r=0;r<t;r++)e[r]=false;return e},this.getFreshValueHex=function(){return this.hV},void 0!==t&&("string"==typeof t&&t.toLowerCase().match(/^[0-9a-f]+$/)?this.setHexValueIncludingUnusedBits(t):void 0!==t.hex?this.setHexValueIncludingUnusedBits(t.hex):void 0!==t.bin?this.setByBinaryString(t.bin):void 0!==t.array&&this.setByBooleanArray(t.array));},Zr(Sr.asn1.DERBitString,Sr.asn1.ASN1Object),Sr.asn1.DEROctetString=function(t){if(void 0!==t&&void 0!==t.obj){var e=Sr.asn1.ASN1Util.newObject(t.obj);t.hex=e.getEncodedHex();}Sr.asn1.DEROctetString.superclass.constructor.call(this,t),this.hT="04";},Zr(Sr.asn1.DEROctetString,Sr.asn1.DERAbstractString),Sr.asn1.DERNull=function(){Sr.asn1.DERNull.superclass.constructor.call(this),this.hT="05",this.hTLV="0500";},Zr(Sr.asn1.DERNull,Sr.asn1.ASN1Object),Sr.asn1.DERObjectIdentifier=function(t){Sr.asn1.DERObjectIdentifier.superclass.constructor.call(this),this.hT="06",this.setValueHex=function(t){this.hTLV=null,this.isModified=true,this.s=null,this.hV=t;},this.setValueOidString=function(t){var e=function r(t){var e=function t(e){var r=e.toString(16);return 1==r.length&&(r="0"+r),r},r=function t(r){var n="",i=parseInt(r,10).toString(2),o=7-i.length%7;7==o&&(o=0);for(var s="",a=0;a<o;a++)s+="0";i=s+i;for(a=0;a<i.length-1;a+=7){var u=i.substr(a,7);a!=i.length-7&&(u="1"+u),n+=e(parseInt(u,2));}return n};try{if(!t.match(/^[0-9.]+$/))return null;var n="",i=t.split("."),o=40*parseInt(i[0],10)+parseInt(i[1],10);n+=e(o),i.splice(0,2);for(var s=0;s<i.length;s++)n+=r(i[s]);return n}catch(t){return null}}(t);if(null==e)throw new Error("malformed oid string: "+t);this.hTLV=null,this.isModified=true,this.s=null,this.hV=e;},this.setValueName=function(t){var e=Sr.asn1.x509.OID.name2oid(t);if(""===e)throw new Error("DERObjectIdentifier oidName undefined: "+t);this.setValueOidString(e);},this.setValueNameOrOid=function(t){t.match(/^[0-2].[0-9.]+$/)?this.setValueOidString(t):this.setValueName(t);},this.getFreshValueHex=function(){return this.hV},this.setByParam=function(t){"string"==typeof t?this.setValueNameOrOid(t):void 0!==t.oid?this.setValueNameOrOid(t.oid):void 0!==t.name?this.setValueNameOrOid(t.name):void 0!==t.hex&&this.setValueHex(t.hex);},void 0!==t&&this.setByParam(t);},Zr(Sr.asn1.DERObjectIdentifier,Sr.asn1.ASN1Object),Sr.asn1.DEREnumerated=function(t){Sr.asn1.DEREnumerated.superclass.constructor.call(this),this.hT="0a",this.setByBigInteger=function(t){this.hTLV=null,this.isModified=true,this.hV=Sr.asn1.ASN1Util.bigIntToMinTwosComplementsHex(t);},this.setByInteger=function(t){var e=new w(String(t),10);this.setByBigInteger(e);},this.setValueHex=function(t){this.hV=t;},this.getFreshValueHex=function(){return this.hV},void 0!==t&&(void 0!==t.int?this.setByInteger(t.int):"number"==typeof t?this.setByInteger(t):void 0!==t.hex&&this.setValueHex(t.hex));},Zr(Sr.asn1.DEREnumerated,Sr.asn1.ASN1Object),Sr.asn1.DERUTF8String=function(t){Sr.asn1.DERUTF8String.superclass.constructor.call(this,t),this.hT="0c";},Zr(Sr.asn1.DERUTF8String,Sr.asn1.DERAbstractString),Sr.asn1.DERNumericString=function(t){Sr.asn1.DERNumericString.superclass.constructor.call(this,t),this.hT="12";},Zr(Sr.asn1.DERNumericString,Sr.asn1.DERAbstractString),Sr.asn1.DERPrintableString=function(t){Sr.asn1.DERPrintableString.superclass.constructor.call(this,t),this.hT="13";},Zr(Sr.asn1.DERPrintableString,Sr.asn1.DERAbstractString),Sr.asn1.DERTeletexString=function(t){Sr.asn1.DERTeletexString.superclass.constructor.call(this,t),this.hT="14";},Zr(Sr.asn1.DERTeletexString,Sr.asn1.DERAbstractString),Sr.asn1.DERIA5String=function(t){Sr.asn1.DERIA5String.superclass.constructor.call(this,t),this.hT="16";},Zr(Sr.asn1.DERIA5String,Sr.asn1.DERAbstractString),Sr.asn1.DERVisibleString=function(t){Sr.asn1.DERIA5String.superclass.constructor.call(this,t),this.hT="1a";},Zr(Sr.asn1.DERVisibleString,Sr.asn1.DERAbstractString),Sr.asn1.DERBMPString=function(t){Sr.asn1.DERBMPString.superclass.constructor.call(this,t),this.hT="1e";},Zr(Sr.asn1.DERBMPString,Sr.asn1.DERAbstractString),Sr.asn1.DERUTCTime=function(t){Sr.asn1.DERUTCTime.superclass.constructor.call(this,t),this.hT="17",this.setByDate=function(t){this.hTLV=null,this.isModified=true,this.date=t,this.s=this.formatDate(this.date,"utc"),this.hV=kr(this.s);},this.getFreshValueHex=function(){return void 0===this.date&&void 0===this.s&&(this.date=new Date,this.s=this.formatDate(this.date,"utc"),this.hV=kr(this.s)),this.hV},void 0!==t&&(void 0!==t.str?this.setString(t.str):"string"==typeof t&&t.match(/^[0-9]{12}Z$/)?this.setString(t):void 0!==t.hex?this.setStringHex(t.hex):void 0!==t.date&&this.setByDate(t.date));},Zr(Sr.asn1.DERUTCTime,Sr.asn1.DERAbstractTime),Sr.asn1.DERGeneralizedTime=function(t){Sr.asn1.DERGeneralizedTime.superclass.constructor.call(this,t),this.hT="18",this.withMillis=false,this.setByDate=function(t){this.hTLV=null,this.isModified=true,this.date=t,this.s=this.formatDate(this.date,"gen",this.withMillis),this.hV=kr(this.s);},this.getFreshValueHex=function(){return void 0===this.date&&void 0===this.s&&(this.date=new Date,this.s=this.formatDate(this.date,"gen",this.withMillis),this.hV=kr(this.s)),this.hV},void 0!==t&&(void 0!==t.str?this.setString(t.str):"string"==typeof t&&t.match(/^[0-9]{14}Z$/)?this.setString(t):void 0!==t.hex?this.setStringHex(t.hex):void 0!==t.date&&this.setByDate(t.date),true===t.millis&&(this.withMillis=true));},Zr(Sr.asn1.DERGeneralizedTime,Sr.asn1.DERAbstractTime),Sr.asn1.DERSequence=function(t){Sr.asn1.DERSequence.superclass.constructor.call(this,t),this.hT="30",this.getFreshValueHex=function(){for(var t="",e=0;e<this.asn1Array.length;e++){t+=this.asn1Array[e].getEncodedHex();}return this.hV=t,this.hV};},Zr(Sr.asn1.DERSequence,Sr.asn1.DERAbstractStructured),Sr.asn1.DERSet=function(t){Sr.asn1.DERSet.superclass.constructor.call(this,t),this.hT="31",this.sortFlag=true,this.getFreshValueHex=function(){for(var t=new Array,e=0;e<this.asn1Array.length;e++){var r=this.asn1Array[e];t.push(r.getEncodedHex());}return 1==this.sortFlag&&t.sort(),this.hV=t.join(""),this.hV},void 0!==t&&void 0!==t.sortflag&&0==t.sortflag&&(this.sortFlag=false);},Zr(Sr.asn1.DERSet,Sr.asn1.DERAbstractStructured),Sr.asn1.DERTaggedObject=function(t){Sr.asn1.DERTaggedObject.superclass.constructor.call(this);var e=Sr.asn1;this.hT="a0",this.hV="",this.isExplicit=true,this.asn1Object=null,this.setASN1Object=function(t,e,r){this.hT=e,this.isExplicit=t,this.asn1Object=r,this.isExplicit?(this.hV=this.asn1Object.getEncodedHex(),this.hTLV=null,this.isModified=true):(this.hV=null,this.hTLV=r.getEncodedHex(),this.hTLV=this.hTLV.replace(/^../,e),this.isModified=false);},this.getFreshValueHex=function(){return this.hV},this.setByParam=function(t){null!=t.tag&&(this.hT=t.tag),null!=t.explicit&&(this.isExplicit=t.explicit),null!=t.tage&&(this.hT=t.tage,this.isExplicit=true),null!=t.tagi&&(this.hT=t.tagi,this.isExplicit=false),null!=t.obj&&(t.obj instanceof e.ASN1Object?(this.asn1Object=t.obj,this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)):"object"==g(t.obj)&&(this.asn1Object=e.ASN1Util.newObject(t.obj),this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)));},null!=t&&this.setByParam(t);},Zr(Sr.asn1.DERTaggedObject,Sr.asn1.ASN1Object);var Sr,br,wr,Fr=new function(){};function Er(t){for(var e=new Array,r=0;r<t.length;r++)e[r]=t.charCodeAt(r);return e}function xr(t){for(var e="",r=0;r<t.length;r++)e+=String.fromCharCode(t[r]);return e}function Ar(t){for(var e="",r=0;r<t.length;r++){var n=t[r].toString(16);1==n.length&&(n="0"+n),e+=n;}return e}function kr(t){return Ar(Er(t))}function Pr(t){return t=(t=(t=t.replace(/\=/g,"")).replace(/\+/g,"-")).replace(/\//g,"_")}function Cr(t){return t.length%4==2?t+="==":t.length%4==3&&(t+="="),t=(t=t.replace(/-/g,"+")).replace(/_/g,"/")}function Tr(t){return t.length%2==1&&(t="0"+t),Pr(_(t))}function Rr(t){return S(Cr(t))}function Ir(t){return Kr(Gr(t))}function Dr(t){return decodeURIComponent(qr(t))}function Lr(t){for(var e="",r=0;r<t.length-1;r+=2)e+=String.fromCharCode(parseInt(t.substr(r,2),16));return e}function Nr(t){for(var e="",r=0;r<t.length;r++)e+=("0"+t.charCodeAt(r).toString(16)).slice(-2);return e}function Ur(t){return _(t)}function Br(t){var e=Ur(t).replace(/(.{64})/g,"$1\r\n");return e=e.replace(/\r\n$/,"")}function Or(t){return S(t.replace(/[^0-9A-Za-z\/+=]*/g,""))}function jr(t,e){return "-----BEGIN "+e+"-----\r\n"+Br(t)+"\r\n-----END "+e+"-----\r\n"}function Mr(t,e){if(-1==t.indexOf("-----BEGIN "))throw "can't find PEM header: "+e;return Or(t=void 0!==e?(t=t.replace(new RegExp("^[^]*-----BEGIN "+e+"-----"),"")).replace(new RegExp("-----END "+e+"-----[^]*$"),""):(t=t.replace(/^[^]*-----BEGIN [^-]+-----/,"")).replace(/-----END [^-]+-----[^]*$/,""))}function Hr(t){var e,r,n,i,o,s,a,u,c,h,l;if(l=t.match(/^(\d{2}|\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(|\.\d+)Z$/))return u=l[1],e=parseInt(u),2===u.length&&(50<=e&&e<100?e=1900+e:0<=e&&e<50&&(e=2e3+e)),r=parseInt(l[2])-1,n=parseInt(l[3]),i=parseInt(l[4]),o=parseInt(l[5]),s=parseInt(l[6]),a=0,""!==(c=l[7])&&(h=(c.substr(1)+"00").substr(0,3),a=parseInt(h)),Date.UTC(e,r,n,i,o,s,a);throw "unsupported zulu format: "+t}function Vr(t){return ~~(Hr(t)/1e3)}function Kr(t){return t.replace(/%/g,"")}function qr(t){return t.replace(/(..)/g,"%$1")}function Jr(t){var e="malformed IPv6 address";if(!t.match(/^[0-9A-Fa-f:]+$/))throw e;var r=(t=t.toLowerCase()).split(":").length-1;if(r<2)throw e;var n=":".repeat(7-r+2),i=(t=t.replace("::",n)).split(":");if(8!=i.length)throw e;for(var o=0;o<8;o++)i[o]=("0000"+i[o]).slice(-4);return i.join("")}function Wr(t){if(!t.match(/^[0-9A-Fa-f]{32}$/))throw "malformed IPv6 address octet";for(var e=(t=t.toLowerCase()).match(/.{1,4}/g),r=0;r<8;r++)e[r]=e[r].replace(/^0+/,""),""==e[r]&&(e[r]="0");var n=(t=":"+e.join(":")+":").match(/:(0:){2,}/g);if(null===n)return t.slice(1,-1);var i="";for(r=0;r<n.length;r++)n[r].length>i.length&&(i=n[r]);return (t=t.replace(i,"::")).slice(1,-1)}function zr(t){var e="malformed hex value";if(!t.match(/^([0-9A-Fa-f][0-9A-Fa-f]){1,}$/))throw e;if(8!=t.length)return 32==t.length?Wr(t):t;try{return parseInt(t.substr(0,2),16)+"."+parseInt(t.substr(2,2),16)+"."+parseInt(t.substr(4,2),16)+"."+parseInt(t.substr(6,2),16)}catch(t){throw e}}function Yr(t){return t.match(/.{4}/g).map((function e(t){var e=parseInt(t.substr(0,2),16),r=parseInt(t.substr(2),16);if(0==e&r<128)return String.fromCharCode(r);if(e<8){var n=128|63&r;return Dr((192|(7&e)<<3|(192&r)>>6).toString(16)+n.toString(16))}n=128|(15&e)<<2|(192&r)>>6;var i=128|63&r;return Dr((224|(240&e)>>4).toString(16)+n.toString(16)+i.toString(16))})).join("")}function Gr(t){for(var e=encodeURIComponent(t),r="",n=0;n<e.length;n++)"%"==e[n]?(r+=e.substr(n,3),n+=2):r=r+"%"+kr(e[n]);return r}function Xr(t){return !(t.length%2!=0||!t.match(/^[0-9a-f]+$/)&&!t.match(/^[0-9A-F]+$/))}function $r(t){return t.length%2==1?"0"+t:t.substr(0,1)>"7"?"00"+t:t}Fr.getLblen=function(t,e){if("8"!=t.substr(e+2,1))return 1;var r=parseInt(t.substr(e+3,1));return 0==r?-1:0<r&&r<10?r+1:-2},Fr.getL=function(t,e){var r=Fr.getLblen(t,e);return r<1?"":t.substr(e+2,2*r)},Fr.getVblen=function(t,e){var r;return ""==(r=Fr.getL(t,e))?-1:("8"===r.substr(0,1)?new w(r.substr(2),16):new w(r,16)).intValue()},Fr.getVidx=function(t,e){var r=Fr.getLblen(t,e);return r<0?r:e+2*(r+1)},Fr.getV=function(t,e){var r=Fr.getVidx(t,e),n=Fr.getVblen(t,e);return t.substr(r,2*n)},Fr.getTLV=function(t,e){return t.substr(e,2)+Fr.getL(t,e)+Fr.getV(t,e)},Fr.getTLVblen=function(t,e){return 2+2*Fr.getLblen(t,e)+2*Fr.getVblen(t,e)},Fr.getNextSiblingIdx=function(t,e){return Fr.getVidx(t,e)+2*Fr.getVblen(t,e)},Fr.getChildIdx=function(t,e){var r,n,i,o=Fr,s=[];r=o.getVidx(t,e),n=2*o.getVblen(t,e),"03"==t.substr(e,2)&&(r+=2,n-=2),i=0;for(var a=r;i<=n;){var u=o.getTLVblen(t,a);if((i+=u)<=n&&s.push(a),a+=u,i>=n)break}return s},Fr.getNthChildIdx=function(t,e,r){return Fr.getChildIdx(t,e)[r]},Fr.getIdxbyList=function(t,e,r,n){var i,o,s=Fr;return 0==r.length?void 0!==n&&t.substr(e,2)!==n?-1:e:(i=r.shift())>=(o=s.getChildIdx(t,e)).length?-1:s.getIdxbyList(t,o[i],r,n)},Fr.getIdxbyListEx=function(t,e,r,n){var i,o,s=Fr;if(0==r.length)return void 0!==n&&t.substr(e,2)!==n?-1:e;i=r.shift(),o=s.getChildIdx(t,e);for(var a=0,u=0;u<o.length;u++){var c=t.substr(o[u],2);if("number"==typeof i&&!s.isContextTag(c)&&a==i||"string"==typeof i&&s.isContextTag(c,i))return s.getIdxbyListEx(t,o[u],r,n);s.isContextTag(c)||a++;}return  -1},Fr.getTLVbyList=function(t,e,r,n){var i=Fr,o=i.getIdxbyList(t,e,r,n);return  -1==o||o>=t.length?null:i.getTLV(t,o)},Fr.getTLVbyListEx=function(t,e,r,n){var i=Fr,o=i.getIdxbyListEx(t,e,r,n);return  -1==o?null:i.getTLV(t,o)},Fr.getVbyList=function(t,e,r,n,i){var o,s,a=Fr;return  -1==(o=a.getIdxbyList(t,e,r,n))||o>=t.length?null:(s=a.getV(t,o),true===i&&(s=s.substr(2)),s)},Fr.getVbyListEx=function(t,e,r,n,i){var o,s,a=Fr;return  -1==(o=a.getIdxbyListEx(t,e,r,n))?null:(s=a.getV(t,o),"03"==t.substr(o,2)&&false!==i&&(s=s.substr(2)),s)},Fr.getInt=function(t,e,r){null==r&&(r=-1);try{var n=t.substr(e,2);if("02"!=n&&"03"!=n)return r;var i=Fr.getV(t,e);return "02"==n?parseInt(i,16):function o(t){try{var e=t.substr(0,2);if("00"==e)return parseInt(t.substr(2),16);var r=parseInt(e,16),n=t.substr(2),i=parseInt(n,16).toString(2);return "0"==i&&(i="00000000"),i=i.slice(0,0-r),parseInt(i,2)}catch(t){return -1}}(i)}catch(t){return r}},Fr.getOID=function(t,e,r){null==r&&(r=null);try{return "06"!=t.substr(e,2)?r:function n(t){if(!Xr(t))return null;try{var e=[],r=t.substr(0,2),n=parseInt(r,16);e[0]=new String(Math.floor(n/40)),e[1]=new String(n%40);for(var i=t.substr(2),o=[],s=0;s<i.length/2;s++)o.push(parseInt(i.substr(2*s,2),16));var a=[],u="";for(s=0;s<o.length;s++)128&o[s]?u+=Qr((127&o[s]).toString(2),7):(u+=Qr((127&o[s]).toString(2),7),a.push(new String(parseInt(u,2))),u="");var c=e.join(".");return a.length>0&&(c=c+"."+a.join(".")),c}catch(t){return null}}(Fr.getV(t,e))}catch(t){return r}},Fr.getOIDName=function(t,e,r){null==r&&(r=null);try{var n=Fr.getOID(t,e,r);if(n==r)return r;var i=Sr.asn1.x509.OID.oid2name(n);return ""==i?n:i}catch(t){return r}},Fr.getString=function(t,e,r){null==r&&(r=null);try{return Lr(Fr.getV(t,e))}catch(t){return r}},Fr.hextooidstr=function(t){var e=function t(e,r){return e.length>=r?e:new Array(r-e.length+1).join("0")+e},r=[],n=t.substr(0,2),i=parseInt(n,16);r[0]=new String(Math.floor(i/40)),r[1]=new String(i%40);for(var o=t.substr(2),s=[],a=0;a<o.length/2;a++)s.push(parseInt(o.substr(2*a,2),16));var u=[],c="";for(a=0;a<s.length;a++)128&s[a]?c+=e((127&s[a]).toString(2),7):(c+=e((127&s[a]).toString(2),7),u.push(new String(parseInt(c,2))),c="");var h=r.join(".");return u.length>0&&(h=h+"."+u.join(".")),h},Fr.dump=function(t,e,r,n){var i=Fr,o=i.getV,s=i.dump,a=i.getChildIdx,u=t;t instanceof Sr.asn1.ASN1Object&&(u=t.getEncodedHex());var c=function t(e,r){return e.length<=2*r?e:e.substr(0,r)+"..(total "+e.length/2+"bytes).."+e.substr(e.length-r,r)};void 0===e&&(e={ommit_long_octet:32}),void 0===r&&(r=0),void 0===n&&(n="");var h,l=e.ommit_long_octet;if("01"==(h=u.substr(r,2)))return "00"==(f=o(u,r))?n+"BOOLEAN FALSE\n":n+"BOOLEAN TRUE\n";if("02"==h)return n+"INTEGER "+c(f=o(u,r),l)+"\n";if("03"==h){var f=o(u,r);if(i.isASN1HEX(f.substr(2))){var g=n+"BITSTRING, encapsulates\n";return g+=s(f.substr(2),e,0,n+"  ")}return n+"BITSTRING "+c(f,l)+"\n"}if("04"==h){f=o(u,r);if(i.isASN1HEX(f)){g=n+"OCTETSTRING, encapsulates\n";return g+=s(f,e,0,n+"  ")}return n+"OCTETSTRING "+c(f,l)+"\n"}if("05"==h)return n+"NULL\n";if("06"==h){var d=o(u,r),p=Sr.asn1.ASN1Util.oidHexToInt(d),v=Sr.asn1.x509.OID.oid2name(p),y=p.replace(/\./g," ");return ""!=v?n+"ObjectIdentifier "+v+" ("+y+")\n":n+"ObjectIdentifier ("+y+")\n"}if("0a"==h)return n+"ENUMERATED "+parseInt(o(u,r))+"\n";if("0c"==h)return n+"UTF8String '"+Dr(o(u,r))+"'\n";if("13"==h)return n+"PrintableString '"+Dr(o(u,r))+"'\n";if("14"==h)return n+"TeletexString '"+Dr(o(u,r))+"'\n";if("16"==h)return n+"IA5String '"+Dr(o(u,r))+"'\n";if("17"==h)return n+"UTCTime "+Dr(o(u,r))+"\n";if("18"==h)return n+"GeneralizedTime "+Dr(o(u,r))+"\n";if("1a"==h)return n+"VisualString '"+Dr(o(u,r))+"'\n";if("1e"==h)return n+"BMPString '"+Yr(o(u,r))+"'\n";if("30"==h){if("3000"==u.substr(r,4))return n+"SEQUENCE {}\n";g=n+"SEQUENCE\n";var m=e;if((2==(b=a(u,r)).length||3==b.length)&&"06"==u.substr(b[0],2)&&"04"==u.substr(b[b.length-1],2)){v=i.oidname(o(u,b[0]));var _=JSON.parse(JSON.stringify(e));_.x509ExtName=v,m=_;}for(var S=0;S<b.length;S++)g+=s(u,m,b[S],n+"  ");return g}if("31"==h){g=n+"SET\n";var b=a(u,r);for(S=0;S<b.length;S++)g+=s(u,e,b[S],n+"  ");return g}if(0!=(128&(h=parseInt(h,16)))){var w=31&h;if(0!=(32&h)){for(g=n+"["+w+"]\n",b=a(u,r),S=0;S<b.length;S++)g+=s(u,e,b[S],n+"  ");return g}f=o(u,r);if(Fr.isASN1HEX(f)){var g=n+"["+w+"]\n";return g+=s(f,e,0,n+"  ")}return ("68747470"==f.substr(0,8)||"subjectAltName"===e.x509ExtName&&2==w)&&(f=Dr(f)),g=n+"["+w+"] "+f+"\n"}return n+"UNKNOWN("+h+") "+o(u,r)+"\n"},Fr.isContextTag=function(t,e){var r,n;t=t.toLowerCase();try{r=parseInt(t,16);}catch(t){return  -1}if(void 0===e)return 128==(192&r);try{return null!=e.match(/^\[[0-9]+\]$/)&&(!((n=parseInt(e.substr(1,e.length-1),10))>31)&&(128==(192&r)&&(31&r)==n))}catch(t){return  false}},Fr.isASN1HEX=function(t){var e=Fr;if(t.length%2==1)return  false;var r=e.getVblen(t,0),n=t.substr(0,2),i=e.getL(t,0);return t.length-n.length-i.length==2*r},Fr.checkStrictDER=function(t,e,r,n,i){var o=Fr;if(void 0===r){if("string"!=typeof t)throw new Error("not hex string");if(t=t.toLowerCase(),!Sr.lang.String.isHex(t))throw new Error("not hex string");r=t.length,i=(n=t.length/2)<128?1:Math.ceil(n.toString(16))+1;}if(o.getL(t,e).length>2*i)throw new Error("L of TLV too long: idx="+e);var s=o.getVblen(t,e);if(s>n)throw new Error("value of L too long than hex: idx="+e);var a=o.getTLV(t,e),u=a.length-2-o.getL(t,e).length;if(u!==2*s)throw new Error("V string length and L's value not the same:"+u+"/"+2*s);if(0===e&&t.length!=a.length)throw new Error("total length and TLV length unmatch:"+t.length+"!="+a.length);var c=t.substr(e,2);if("02"===c){var h=o.getVidx(t,e);if("00"==t.substr(h,2)&&t.charCodeAt(h+2)<56)throw new Error("not least zeros for DER INTEGER")}if(32&parseInt(c,16)){for(var l=o.getVblen(t,e),f=0,g=o.getChildIdx(t,e),d=0;d<g.length;d++){f+=o.getTLV(t,g[d]).length,o.checkStrictDER(t,g[d],r,n,i);}if(2*l!=f)throw new Error("sum of children's TLV length and L unmatch: "+2*l+"!="+f)}},Fr.oidname=function(t){var e=Sr.asn1;Sr.lang.String.isHex(t)&&(t=e.ASN1Util.oidHexToInt(t));var r=e.x509.OID.oid2name(t);return ""===r&&(r=t),r},void 0!==Sr&&Sr||(e.KJUR=Sr={}),void 0!==Sr.lang&&Sr.lang||(Sr.lang={}),Sr.lang.String=function(){},"function"==typeof t?(e.utf8tob64u=br=function e(r){return Pr(t.from(r,"utf8").toString("base64"))},e.b64utoutf8=wr=function e(r){return t.from(Cr(r),"base64").toString("utf8")}):(e.utf8tob64u=br=function t(e){return Tr(Kr(Gr(e)))},e.b64utoutf8=wr=function t(e){return decodeURIComponent(qr(Rr(e)))}),Sr.lang.String.isInteger=function(t){return !!t.match(/^[0-9]+$/)||!!t.match(/^-[0-9]+$/)},Sr.lang.String.isHex=function(t){return Xr(t)},Sr.lang.String.isBase64=function(t){return !(!(t=t.replace(/\s+/g,"")).match(/^[0-9A-Za-z+\/]+={0,3}$/)||t.length%4!=0)},Sr.lang.String.isBase64URL=function(t){return !t.match(/[+/=]/)&&(t=Cr(t),Sr.lang.String.isBase64(t))},Sr.lang.String.isIntegerArray=function(t){return !!(t=t.replace(/\s+/g,"")).match(/^\[[0-9,]+\]$/)},Sr.lang.String.isPrintable=function(t){return null!==t.match(/^[0-9A-Za-z '()+,-./:=?]*$/)},Sr.lang.String.isIA5=function(t){return null!==t.match(/^[\x20-\x21\x23-\x7f]*$/)},Sr.lang.String.isMail=function(t){return null!==t.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/)};var Qr=function t(e,r,n){return null==n&&(n="0"),e.length>=r?e:new Array(r-e.length+1).join(n)+e};function Zr(t,e){var r=function t(){};r.prototype=e.prototype,t.prototype=new r,t.prototype.constructor=t,t.superclass=e.prototype,e.prototype.constructor==Object.prototype.constructor&&(e.prototype.constructor=e);} void 0!==Sr&&Sr||(e.KJUR=Sr={}),void 0!==Sr.crypto&&Sr.crypto||(Sr.crypto={}),Sr.crypto.Util=new function(){this.DIGESTINFOHEAD={sha1:"3021300906052b0e03021a05000414",sha224:"302d300d06096086480165030402040500041c",sha256:"3031300d060960864801650304020105000420",sha384:"3041300d060960864801650304020205000430",sha512:"3051300d060960864801650304020305000440",md2:"3020300c06082a864886f70d020205000410",md5:"3020300c06082a864886f70d020505000410",ripemd160:"3021300906052b2403020105000414"},this.DEFAULTPROVIDER={md5:"cryptojs",sha1:"cryptojs",sha224:"cryptojs",sha256:"cryptojs",sha384:"cryptojs",sha512:"cryptojs",ripemd160:"cryptojs",hmacmd5:"cryptojs",hmacsha1:"cryptojs",hmacsha224:"cryptojs",hmacsha256:"cryptojs",hmacsha384:"cryptojs",hmacsha512:"cryptojs",hmacripemd160:"cryptojs",MD5withRSA:"cryptojs/jsrsa",SHA1withRSA:"cryptojs/jsrsa",SHA224withRSA:"cryptojs/jsrsa",SHA256withRSA:"cryptojs/jsrsa",SHA384withRSA:"cryptojs/jsrsa",SHA512withRSA:"cryptojs/jsrsa",RIPEMD160withRSA:"cryptojs/jsrsa",MD5withECDSA:"cryptojs/jsrsa",SHA1withECDSA:"cryptojs/jsrsa",SHA224withECDSA:"cryptojs/jsrsa",SHA256withECDSA:"cryptojs/jsrsa",SHA384withECDSA:"cryptojs/jsrsa",SHA512withECDSA:"cryptojs/jsrsa",RIPEMD160withECDSA:"cryptojs/jsrsa",SHA1withDSA:"cryptojs/jsrsa",SHA224withDSA:"cryptojs/jsrsa",SHA256withDSA:"cryptojs/jsrsa",MD5withRSAandMGF1:"cryptojs/jsrsa",SHAwithRSAandMGF1:"cryptojs/jsrsa",SHA1withRSAandMGF1:"cryptojs/jsrsa",SHA224withRSAandMGF1:"cryptojs/jsrsa",SHA256withRSAandMGF1:"cryptojs/jsrsa",SHA384withRSAandMGF1:"cryptojs/jsrsa",SHA512withRSAandMGF1:"cryptojs/jsrsa",RIPEMD160withRSAandMGF1:"cryptojs/jsrsa"},this.CRYPTOJSMESSAGEDIGESTNAME={md5:v.algo.MD5,sha1:v.algo.SHA1,sha224:v.algo.SHA224,sha256:v.algo.SHA256,sha384:v.algo.SHA384,sha512:v.algo.SHA512,ripemd160:v.algo.RIPEMD160},this.getDigestInfoHex=function(t,e){if(void 0===this.DIGESTINFOHEAD[e])throw "alg not supported in Util.DIGESTINFOHEAD: "+e;return this.DIGESTINFOHEAD[e]+t},this.getPaddedDigestInfoHex=function(t,e,r){var n=this.getDigestInfoHex(t,e),i=r/4;if(n.length+22>i)throw "key is too short for SigAlg: keylen="+r+","+e;for(var o="0001",s="00"+n,a="",u=i-o.length-s.length,c=0;c<u;c+=2)a+="ff";return o+a+s},this.hashString=function(t,e){return new Sr.crypto.MessageDigest({alg:e}).digestString(t)},this.hashHex=function(t,e){return new Sr.crypto.MessageDigest({alg:e}).digestHex(t)},this.sha1=function(t){return this.hashString(t,"sha1")},this.sha256=function(t){return this.hashString(t,"sha256")},this.sha256Hex=function(t){return this.hashHex(t,"sha256")},this.sha512=function(t){return this.hashString(t,"sha512")},this.sha512Hex=function(t){return this.hashHex(t,"sha512")},this.isKey=function(t){return t instanceof Me||t instanceof Sr.crypto.DSA||t instanceof Sr.crypto.ECDSA};},Sr.crypto.Util.md5=function(t){return new Sr.crypto.MessageDigest({alg:"md5",prov:"cryptojs"}).digestString(t)},Sr.crypto.Util.ripemd160=function(t){return new Sr.crypto.MessageDigest({alg:"ripemd160",prov:"cryptojs"}).digestString(t)},Sr.crypto.Util.SECURERANDOMGEN=new Be,Sr.crypto.Util.getRandomHexOfNbytes=function(t){var e=new Array(t);return Sr.crypto.Util.SECURERANDOMGEN.nextBytes(e),Ar(e)},Sr.crypto.Util.getRandomBigIntegerOfNbytes=function(t){return new w(Sr.crypto.Util.getRandomHexOfNbytes(t),16)},Sr.crypto.Util.getRandomHexOfNbits=function(t){var e=t%8,r=new Array((t-e)/8+1);return Sr.crypto.Util.SECURERANDOMGEN.nextBytes(r),r[0]=(255<<e&255^255)&r[0],Ar(r)},Sr.crypto.Util.getRandomBigIntegerOfNbits=function(t){return new w(Sr.crypto.Util.getRandomHexOfNbits(t),16)},Sr.crypto.Util.getRandomBigIntegerZeroToMax=function(t){for(var e=t.bitLength();;){var r=Sr.crypto.Util.getRandomBigIntegerOfNbits(e);if(-1!=t.compareTo(r))return r}},Sr.crypto.Util.getRandomBigIntegerMinToMax=function(t,e){var r=t.compareTo(e);if(1==r)throw "biMin is greater than biMax";if(0==r)return t;var n=e.subtract(t);return Sr.crypto.Util.getRandomBigIntegerZeroToMax(n).add(t)},Sr.crypto.MessageDigest=function(t){this.setAlgAndProvider=function(t,e){if(null!==(t=Sr.crypto.MessageDigest.getCanonicalAlgName(t))&&void 0===e&&(e=Sr.crypto.Util.DEFAULTPROVIDER[t]),-1!=":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(t)&&"cryptojs"==e){try{this.md=Sr.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[t].create();}catch(e){throw "setAlgAndProvider hash alg set fail alg="+t+"/"+e}this.updateString=function(t){this.md.update(t);},this.updateHex=function(t){var e=v.enc.Hex.parse(t);this.md.update(e);},this.digest=function(){return this.md.finalize().toString(v.enc.Hex)},this.digestString=function(t){return this.updateString(t),this.digest()},this.digestHex=function(t){return this.updateHex(t),this.digest()};}if(-1!=":sha256:".indexOf(t)&&"sjcl"==e){try{this.md=new sjcl.hash.sha256;}catch(e){throw "setAlgAndProvider hash alg set fail alg="+t+"/"+e}this.updateString=function(t){this.md.update(t);},this.updateHex=function(t){var e=sjcl.codec.hex.toBits(t);this.md.update(e);},this.digest=function(){var t=this.md.finalize();return sjcl.codec.hex.fromBits(t)},this.digestString=function(t){return this.updateString(t),this.digest()},this.digestHex=function(t){return this.updateHex(t),this.digest()};}},this.updateString=function(t){throw "updateString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName},this.updateHex=function(t){throw "updateHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName},this.digest=function(){throw "digest() not supported for this alg/prov: "+this.algName+"/"+this.provName},this.digestString=function(t){throw "digestString(str) not supported for this alg/prov: "+this.algName+"/"+this.provName},this.digestHex=function(t){throw "digestHex(hex) not supported for this alg/prov: "+this.algName+"/"+this.provName},void 0!==t&&void 0!==t.alg&&(this.algName=t.alg,void 0===t.prov&&(this.provName=Sr.crypto.Util.DEFAULTPROVIDER[this.algName]),this.setAlgAndProvider(this.algName,this.provName));},Sr.crypto.MessageDigest.getCanonicalAlgName=function(t){return "string"==typeof t&&(t=(t=t.toLowerCase()).replace(/-/,"")),t},Sr.crypto.MessageDigest.getHashLength=function(t){var e=Sr.crypto.MessageDigest,r=e.getCanonicalAlgName(t);if(void 0===e.HASHLENGTH[r])throw "not supported algorithm: "+t;return e.HASHLENGTH[r]},Sr.crypto.MessageDigest.HASHLENGTH={md5:16,sha1:20,sha224:28,sha256:32,sha384:48,sha512:64,ripemd160:20},Sr.crypto.Mac=function(t){this.setAlgAndProvider=function(t,e){if(null==(t=t.toLowerCase())&&(t="hmacsha1"),"hmac"!=(t=t.toLowerCase()).substr(0,4))throw "setAlgAndProvider unsupported HMAC alg: "+t;void 0===e&&(e=Sr.crypto.Util.DEFAULTPROVIDER[t]),this.algProv=t+"/"+e;var r=t.substr(4);if(-1!=":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(r)&&"cryptojs"==e){try{var n=Sr.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[r];this.mac=v.algo.HMAC.create(n,this.pass);}catch(t){throw "setAlgAndProvider hash alg set fail hashAlg="+r+"/"+t}this.updateString=function(t){this.mac.update(t);},this.updateHex=function(t){var e=v.enc.Hex.parse(t);this.mac.update(e);},this.doFinal=function(){return this.mac.finalize().toString(v.enc.Hex)},this.doFinalString=function(t){return this.updateString(t),this.doFinal()},this.doFinalHex=function(t){return this.updateHex(t),this.doFinal()};}},this.updateString=function(t){throw "updateString(str) not supported for this alg/prov: "+this.algProv},this.updateHex=function(t){throw "updateHex(hex) not supported for this alg/prov: "+this.algProv},this.doFinal=function(){throw "digest() not supported for this alg/prov: "+this.algProv},this.doFinalString=function(t){throw "digestString(str) not supported for this alg/prov: "+this.algProv},this.doFinalHex=function(t){throw "digestHex(hex) not supported for this alg/prov: "+this.algProv},this.setPassword=function(t){if("string"==typeof t){var e=t;return t.length%2!=1&&t.match(/^[0-9A-Fa-f]+$/)||(e=Nr(t)),void(this.pass=v.enc.Hex.parse(e))}if("object"!=(void 0===t?"undefined":g(t)))throw "KJUR.crypto.Mac unsupported password type: "+t;e=null;if(void 0!==t.hex){if(t.hex.length%2!=0||!t.hex.match(/^[0-9A-Fa-f]+$/))throw "Mac: wrong hex password: "+t.hex;e=t.hex;}if(void 0!==t.utf8&&(e=Ir(t.utf8)),void 0!==t.rstr&&(e=Nr(t.rstr)),void 0!==t.b64&&(e=S(t.b64)),void 0!==t.b64u&&(e=Rr(t.b64u)),null==e)throw "KJUR.crypto.Mac unsupported password type: "+t;this.pass=v.enc.Hex.parse(e);},void 0!==t&&(void 0!==t.pass&&this.setPassword(t.pass),void 0!==t.alg&&(this.algName=t.alg,void 0===t.prov&&(this.provName=Sr.crypto.Util.DEFAULTPROVIDER[this.algName]),this.setAlgAndProvider(this.algName,this.provName)));},Sr.crypto.Signature=function(t){var e=null;if(this._setAlgNames=function(){var t=this.algName.match(/^(.+)with(.+)$/);t&&(this.mdAlgName=t[1].toLowerCase(),this.pubkeyAlgName=t[2].toLowerCase(),"rsaandmgf1"==this.pubkeyAlgName&&"sha"==this.mdAlgName&&(this.mdAlgName="sha1"));},this._zeroPaddingOfSignature=function(t,e){for(var r="",n=e/4-t.length,i=0;i<n;i++)r+="0";return r+t},this.setAlgAndProvider=function(t,e){if(this._setAlgNames(),"cryptojs/jsrsa"!=e)throw new Error("provider not supported: "+e);if(-1!=":md5:sha1:sha224:sha256:sha384:sha512:ripemd160:".indexOf(this.mdAlgName)){try{this.md=new Sr.crypto.MessageDigest({alg:this.mdAlgName});}catch(t){throw new Error("setAlgAndProvider hash alg set fail alg="+this.mdAlgName+"/"+t)}this.init=function(t,e){var r=null;try{r=void 0===e?tn.getKey(t):tn.getKey(t,e);}catch(t){throw "init failed:"+t}if(true===r.isPrivate)this.prvKey=r,this.state="SIGN";else {if(true!==r.isPublic)throw "init failed.:"+r;this.pubKey=r,this.state="VERIFY";}},this.updateString=function(t){this.md.updateString(t);},this.updateHex=function(t){this.md.updateHex(t);},this.sign=function(){if(this.sHashHex=this.md.digest(),void 0===this.prvKey&&void 0!==this.ecprvhex&&void 0!==this.eccurvename&&void 0!==Sr.crypto.ECDSA&&(this.prvKey=new Sr.crypto.ECDSA({curve:this.eccurvename,prv:this.ecprvhex})),this.prvKey instanceof Me&&"rsaandmgf1"===this.pubkeyAlgName)this.hSign=this.prvKey.signWithMessageHashPSS(this.sHashHex,this.mdAlgName,this.pssSaltLen);else if(this.prvKey instanceof Me&&"rsa"===this.pubkeyAlgName)this.hSign=this.prvKey.signWithMessageHash(this.sHashHex,this.mdAlgName);else if(this.prvKey instanceof Sr.crypto.ECDSA)this.hSign=this.prvKey.signWithMessageHash(this.sHashHex);else {if(!(this.prvKey instanceof Sr.crypto.DSA))throw "Signature: unsupported private key alg: "+this.pubkeyAlgName;this.hSign=this.prvKey.signWithMessageHash(this.sHashHex);}return this.hSign},this.signString=function(t){return this.updateString(t),this.sign()},this.signHex=function(t){return this.updateHex(t),this.sign()},this.verify=function(t){if(this.sHashHex=this.md.digest(),void 0===this.pubKey&&void 0!==this.ecpubhex&&void 0!==this.eccurvename&&void 0!==Sr.crypto.ECDSA&&(this.pubKey=new Sr.crypto.ECDSA({curve:this.eccurvename,pub:this.ecpubhex})),this.pubKey instanceof Me&&"rsaandmgf1"===this.pubkeyAlgName)return this.pubKey.verifyWithMessageHashPSS(this.sHashHex,t,this.mdAlgName,this.pssSaltLen);if(this.pubKey instanceof Me&&"rsa"===this.pubkeyAlgName)return this.pubKey.verifyWithMessageHash(this.sHashHex,t);if(void 0!==Sr.crypto.ECDSA&&this.pubKey instanceof Sr.crypto.ECDSA)return this.pubKey.verifyWithMessageHash(this.sHashHex,t);if(void 0!==Sr.crypto.DSA&&this.pubKey instanceof Sr.crypto.DSA)return this.pubKey.verifyWithMessageHash(this.sHashHex,t);throw "Signature: unsupported public key alg: "+this.pubkeyAlgName};}},this.init=function(t,e){throw "init(key, pass) not supported for this alg:prov="+this.algProvName},this.updateString=function(t){throw "updateString(str) not supported for this alg:prov="+this.algProvName},this.updateHex=function(t){throw "updateHex(hex) not supported for this alg:prov="+this.algProvName},this.sign=function(){throw "sign() not supported for this alg:prov="+this.algProvName},this.signString=function(t){throw "digestString(str) not supported for this alg:prov="+this.algProvName},this.signHex=function(t){throw "digestHex(hex) not supported for this alg:prov="+this.algProvName},this.verify=function(t){throw "verify(hSigVal) not supported for this alg:prov="+this.algProvName},this.initParams=t,void 0!==t&&(void 0!==t.alg&&(this.algName=t.alg,void 0===t.prov?this.provName=Sr.crypto.Util.DEFAULTPROVIDER[this.algName]:this.provName=t.prov,this.algProvName=this.algName+":"+this.provName,this.setAlgAndProvider(this.algName,this.provName),this._setAlgNames()),void 0!==t.psssaltlen&&(this.pssSaltLen=t.psssaltlen),void 0!==t.prvkeypem)){if(void 0!==t.prvkeypas)throw "both prvkeypem and prvkeypas parameters not supported";try{e=tn.getKey(t.prvkeypem);this.init(e);}catch(t){throw "fatal error to load pem private key: "+t}}},Sr.crypto.Cipher=function(t){},Sr.crypto.Cipher.encrypt=function(t,e,r){if(e instanceof Me&&e.isPublic){var n=Sr.crypto.Cipher.getAlgByKeyAndName(e,r);if("RSA"===n)return e.encrypt(t);if("RSAOAEP"===n)return e.encryptOAEP(t,"sha1");var i=n.match(/^RSAOAEP(\d+)$/);if(null!==i)return e.encryptOAEP(t,"sha"+i[1]);throw "Cipher.encrypt: unsupported algorithm for RSAKey: "+r}throw "Cipher.encrypt: unsupported key or algorithm"},Sr.crypto.Cipher.decrypt=function(t,e,r){if(e instanceof Me&&e.isPrivate){var n=Sr.crypto.Cipher.getAlgByKeyAndName(e,r);if("RSA"===n)return e.decrypt(t);if("RSAOAEP"===n)return e.decryptOAEP(t,"sha1");var i=n.match(/^RSAOAEP(\d+)$/);if(null!==i)return e.decryptOAEP(t,"sha"+i[1]);throw "Cipher.decrypt: unsupported algorithm for RSAKey: "+r}throw "Cipher.decrypt: unsupported key or algorithm"},Sr.crypto.Cipher.getAlgByKeyAndName=function(t,e){if(t instanceof Me){if(-1!=":RSA:RSAOAEP:RSAOAEP224:RSAOAEP256:RSAOAEP384:RSAOAEP512:".indexOf(e))return e;if(null==e)return "RSA";throw "getAlgByKeyAndName: not supported algorithm name for RSAKey: "+e}throw "getAlgByKeyAndName: not supported algorithm name: "+e},Sr.crypto.OID=new function(){this.oidhex2name={"2a864886f70d010101":"rsaEncryption","2a8648ce3d0201":"ecPublicKey","2a8648ce380401":"dsa","2a8648ce3d030107":"secp256r1","2b8104001f":"secp192k1","2b81040021":"secp224r1","2b8104000a":"secp256k1","2b81040023":"secp521r1","2b81040022":"secp384r1","2a8648ce380403":"SHA1withDSA","608648016503040301":"SHA224withDSA","608648016503040302":"SHA256withDSA"};},void 0!==Sr&&Sr||(e.KJUR=Sr={}),void 0!==Sr.crypto&&Sr.crypto||(Sr.crypto={}),Sr.crypto.ECDSA=function(t){var e=Error,r=w,n=Ve,i=Sr.crypto.ECDSA,o=Sr.crypto.ECParameterDB,s=i.getName,a=Fr,u=a.getVbyListEx,c=a.isASN1HEX,h=new Be;this.type="EC",this.isPrivate=false,this.isPublic=false,this.getBigRandom=function(t){return new r(t.bitLength(),h).mod(t.subtract(r.ONE)).add(r.ONE)},this.setNamedCurve=function(t){this.ecparams=o.getByName(t),this.prvKeyHex=null,this.pubKeyHex=null,this.curveName=t;},this.setPrivateKeyHex=function(t){this.isPrivate=true,this.prvKeyHex=t;},this.setPublicKeyHex=function(t){this.isPublic=true,this.pubKeyHex=t;},this.getPublicKeyXYHex=function(){var t=this.pubKeyHex;if("04"!==t.substr(0,2))throw "this method supports uncompressed format(04) only";var e=this.ecparams.keylen/4;if(t.length!==2+2*e)throw "malformed public key hex length";var r={};return r.x=t.substr(2,e),r.y=t.substr(2+e),r},this.getShortNISTPCurveName=function(){var t=this.curveName;return "secp256r1"===t||"NIST P-256"===t||"P-256"===t||"prime256v1"===t?"P-256":"secp384r1"===t||"NIST P-384"===t||"P-384"===t?"P-384":null},this.generateKeyPairHex=function(){var t=this.ecparams.n,e=this.getBigRandom(t),r=this.ecparams.G.multiply(e),n=r.getX().toBigInteger(),i=r.getY().toBigInteger(),o=this.ecparams.keylen/4,s=("0000000000"+e.toString(16)).slice(-o),a="04"+("0000000000"+n.toString(16)).slice(-o)+("0000000000"+i.toString(16)).slice(-o);return this.setPrivateKeyHex(s),this.setPublicKeyHex(a),{ecprvhex:s,ecpubhex:a}},this.signWithMessageHash=function(t){return this.signHex(t,this.prvKeyHex)},this.signHex=function(t,e){var n=new r(e,16),o=this.ecparams.n,s=new r(t.substring(0,this.ecparams.keylen/4),16);do{var a=this.getBigRandom(o),u=this.ecparams.G.multiply(a).getX().toBigInteger().mod(o);}while(u.compareTo(r.ZERO)<=0);var c=a.modInverse(o).multiply(s.add(n.multiply(u))).mod(o);return i.biRSSigToASN1Sig(u,c)},this.sign=function(t,e){var n=e,i=this.ecparams.n,o=r.fromByteArrayUnsigned(t);do{var s=this.getBigRandom(i),a=this.ecparams.G.multiply(s).getX().toBigInteger().mod(i);}while(a.compareTo(w.ZERO)<=0);var u=s.modInverse(i).multiply(o.add(n.multiply(a))).mod(i);return this.serializeSig(a,u)},this.verifyWithMessageHash=function(t,e){return this.verifyHex(t,e,this.pubKeyHex)},this.verifyHex=function(t,e,o){try{var s,a,u=i.parseSigHex(e);s=u.r,a=u.s;var c=n.decodeFromHex(this.ecparams.curve,o),h=new r(t.substring(0,this.ecparams.keylen/4),16);return this.verifyRaw(h,s,a,c)}catch(t){return  false}},this.verify=function(t,e,i){var o,s,a;if(Bitcoin.Util.isArray(e)){var u=this.parseSig(e);o=u.r,s=u.s;}else {if("object"!==(void 0===e?"undefined":g(e))||!e.r||!e.s)throw "Invalid value for signature";o=e.r,s=e.s;}if(i instanceof Ve)a=i;else {if(!Bitcoin.Util.isArray(i))throw "Invalid format for pubkey value, must be byte array or ECPointFp";a=n.decodeFrom(this.ecparams.curve,i);}var c=r.fromByteArrayUnsigned(t);return this.verifyRaw(c,o,s,a)},this.verifyRaw=function(t,e,n,i){var o=this.ecparams.n,s=this.ecparams.G;if(e.compareTo(r.ONE)<0||e.compareTo(o)>=0)return  false;if(n.compareTo(r.ONE)<0||n.compareTo(o)>=0)return  false;var a=n.modInverse(o),u=t.multiply(a).mod(o),c=e.multiply(a).mod(o);return s.multiply(u).add(i.multiply(c)).getX().toBigInteger().mod(o).equals(e)},this.serializeSig=function(t,e){var r=t.toByteArraySigned(),n=e.toByteArraySigned(),i=[];return i.push(2),i.push(r.length),(i=i.concat(r)).push(2),i.push(n.length),(i=i.concat(n)).unshift(i.length),i.unshift(48),i},this.parseSig=function(t){var e;if(48!=t[0])throw new Error("Signature not a valid DERSequence");if(2!=t[e=2])throw new Error("First element in signature must be a DERInteger");var n=t.slice(e+2,e+2+t[e+1]);if(2!=t[e+=2+t[e+1]])throw new Error("Second element in signature must be a DERInteger");var i=t.slice(e+2,e+2+t[e+1]);return e+=2+t[e+1],{r:r.fromByteArrayUnsigned(n),s:r.fromByteArrayUnsigned(i)}},this.parseSigCompact=function(t){if(65!==t.length)throw "Signature has the wrong length";var e=t[0]-27;if(e<0||e>7)throw "Invalid signature type";var n=this.ecparams.n;return {r:r.fromByteArrayUnsigned(t.slice(1,33)).mod(n),s:r.fromByteArrayUnsigned(t.slice(33,65)).mod(n),i:e}},this.readPKCS5PrvKeyHex=function(t){if(false===c(t))throw new Error("not ASN.1 hex string");var e,r,n;try{e=u(t,0,["[0]",0],"06"),r=u(t,0,[1],"04");try{n=u(t,0,["[1]",0],"03");}catch(t){}}catch(t){throw new Error("malformed PKCS#1/5 plain ECC private key")}if(this.curveName=s(e),void 0===this.curveName)throw "unsupported curve name";this.setNamedCurve(this.curveName),this.setPublicKeyHex(n),this.setPrivateKeyHex(r),this.isPublic=false;},this.readPKCS8PrvKeyHex=function(t){if(false===c(t))throw new e("not ASN.1 hex string");var r,n,i;try{u(t,0,[1,0],"06"),r=u(t,0,[1,1],"06"),n=u(t,0,[2,0,1],"04");try{i=u(t,0,[2,0,"[1]",0],"03");}catch(t){}}catch(t){throw new e("malformed PKCS#8 plain ECC private key")}if(this.curveName=s(r),void 0===this.curveName)throw new e("unsupported curve name");this.setNamedCurve(this.curveName),this.setPublicKeyHex(i),this.setPrivateKeyHex(n),this.isPublic=false;},this.readPKCS8PubKeyHex=function(t){if(false===c(t))throw new e("not ASN.1 hex string");var r,n;try{u(t,0,[0,0],"06"),r=u(t,0,[0,1],"06"),n=u(t,0,[1],"03");}catch(t){throw new e("malformed PKCS#8 ECC public key")}if(this.curveName=s(r),null===this.curveName)throw new e("unsupported curve name");this.setNamedCurve(this.curveName),this.setPublicKeyHex(n);},this.readCertPubKeyHex=function(t,r){if(false===c(t))throw new e("not ASN.1 hex string");var n,i;try{n=u(t,0,[0,5,0,1],"06"),i=u(t,0,[0,5,1],"03");}catch(t){throw new e("malformed X.509 certificate ECC public key")}if(this.curveName=s(n),null===this.curveName)throw new e("unsupported curve name");this.setNamedCurve(this.curveName),this.setPublicKeyHex(i);},void 0!==t&&void 0!==t.curve&&(this.curveName=t.curve),void 0===this.curveName&&(this.curveName="secp256r1"),this.setNamedCurve(this.curveName),void 0!==t&&(void 0!==t.prv&&this.setPrivateKeyHex(t.prv),void 0!==t.pub&&this.setPublicKeyHex(t.pub));},Sr.crypto.ECDSA.parseSigHex=function(t){var e=Sr.crypto.ECDSA.parseSigHexInHexRS(t);return {r:new w(e.r,16),s:new w(e.s,16)}},Sr.crypto.ECDSA.parseSigHexInHexRS=function(t){var e=Fr,r=e.getChildIdx,n=e.getV;if(e.checkStrictDER(t,0),"30"!=t.substr(0,2))throw new Error("signature is not a ASN.1 sequence");var i=r(t,0);if(2!=i.length)throw new Error("signature shall have two elements");var o=i[0],s=i[1];if("02"!=t.substr(o,2))throw new Error("1st item not ASN.1 integer");if("02"!=t.substr(s,2))throw new Error("2nd item not ASN.1 integer");return {r:n(t,o),s:n(t,s)}},Sr.crypto.ECDSA.asn1SigToConcatSig=function(t){var e=Sr.crypto.ECDSA.parseSigHexInHexRS(t),r=e.r,n=e.s;if("00"==r.substr(0,2)&&r.length%32==2&&(r=r.substr(2)),"00"==n.substr(0,2)&&n.length%32==2&&(n=n.substr(2)),r.length%32==30&&(r="00"+r),n.length%32==30&&(n="00"+n),r.length%32!=0)throw "unknown ECDSA sig r length error";if(n.length%32!=0)throw "unknown ECDSA sig s length error";return r+n},Sr.crypto.ECDSA.concatSigToASN1Sig=function(t){if(t.length/2*8%128!=0)throw "unknown ECDSA concatinated r-s sig  length error";var e=t.substr(0,t.length/2),r=t.substr(t.length/2);return Sr.crypto.ECDSA.hexRSSigToASN1Sig(e,r)},Sr.crypto.ECDSA.hexRSSigToASN1Sig=function(t,e){var r=new w(t,16),n=new w(e,16);return Sr.crypto.ECDSA.biRSSigToASN1Sig(r,n)},Sr.crypto.ECDSA.biRSSigToASN1Sig=function(t,e){var r=Sr.asn1,n=new r.DERInteger({bigint:t}),i=new r.DERInteger({bigint:e});return new r.DERSequence({array:[n,i]}).getEncodedHex()},Sr.crypto.ECDSA.getName=function(t){return "2b8104001f"===t?"secp192k1":"2a8648ce3d030107"===t?"secp256r1":"2b8104000a"===t?"secp256k1":"2b81040021"===t?"secp224r1":"2b81040022"===t?"secp384r1":-1!=="|secp256r1|NIST P-256|P-256|prime256v1|".indexOf(t)?"secp256r1":-1!=="|secp256k1|".indexOf(t)?"secp256k1":-1!=="|secp224r1|NIST P-224|P-224|".indexOf(t)?"secp224r1":-1!=="|secp384r1|NIST P-384|P-384|".indexOf(t)?"secp384r1":null},void 0!==Sr&&Sr||(e.KJUR=Sr={}),void 0!==Sr.crypto&&Sr.crypto||(Sr.crypto={}),Sr.crypto.ECParameterDB=new function(){var t={},e={};function r(t){return new w(t,16)}this.getByName=function(r){var n=r;if(void 0!==e[n]&&(n=e[r]),void 0!==t[n])return t[n];throw "unregistered EC curve name: "+n},this.regist=function(n,i,o,s,a,u,c,h,l,f,g,d){t[n]={};var p=r(o),v=r(s),y=r(a),m=r(u),_=r(c),S=new Ke(p,v,y),b=S.decodePointHex("04"+h+l);t[n].name=n,t[n].keylen=i,t[n].curve=S,t[n].G=b,t[n].n=m,t[n].h=_,t[n].oid=g,t[n].info=d;for(var w=0;w<f.length;w++)e[f[w]]=n;};},Sr.crypto.ECParameterDB.regist("secp128r1",128,"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC","E87579C11079F43DD824993C2CEE5ED3","FFFFFFFE0000000075A30D1B9038A115","1","161FF7528B899B2D0C28607CA52C5B86","CF5AC8395BAFEB13C02DA292DDED7A83",[],"","secp128r1 : SECG curve over a 128 bit prime field"),Sr.crypto.ECParameterDB.regist("secp160k1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73","0","7","0100000000000000000001B8FA16DFAB9ACA16B6B3","1","3B4C382CE37AA192A4019E763036F4F5DD4D7EBB","938CF935318FDCED6BC28286531733C3F03C4FEE",[],"","secp160k1 : SECG curve over a 160 bit prime field"),Sr.crypto.ECParameterDB.regist("secp160r1",160,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC","1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45","0100000000000000000001F4C8F927AED3CA752257","1","4A96B5688EF573284664698968C38BB913CBFC82","23A628553168947D59DCC912042351377AC5FB32",[],"","secp160r1 : SECG curve over a 160 bit prime field"),Sr.crypto.ECParameterDB.regist("secp192k1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37","0","3","FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D","1","DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D","9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D",[]),Sr.crypto.ECParameterDB.regist("secp192r1",192,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC","64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1","FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831","1","188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012","07192B95FFC8DA78631011ED6B24CDD573F977A11E794811",[]),Sr.crypto.ECParameterDB.regist("secp224r1",224,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE","B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4","FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D","1","B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21","BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34",[]),Sr.crypto.ECParameterDB.regist("secp256k1",256,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F","0","7","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141","1","79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798","483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8",[]),Sr.crypto.ECParameterDB.regist("secp256r1",256,"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF","FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC","5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B","FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551","1","6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296","4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5",["NIST P-256","P-256","prime256v1"]),Sr.crypto.ECParameterDB.regist("secp384r1",384,"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC","B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973","1","AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7","3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f",["NIST P-384","P-384"]),Sr.crypto.ECParameterDB.regist("secp521r1",521,"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC","051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00","1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409","1","C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66","011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650",["NIST P-521","P-521"]);var tn=function(){var t=function t(r,n,i){return e(v.AES,r,n,i)},e=function t(e,r,n,i){var o=v.enc.Hex.parse(r),s=v.enc.Hex.parse(n),a=v.enc.Hex.parse(i),u={};u.key=s,u.iv=a,u.ciphertext=o;var c=e.decrypt(u,s,{iv:a});return v.enc.Hex.stringify(c)},r=function t(e,r,i){return n(v.AES,e,r,i)},n=function t(e,r,n,i){var o=v.enc.Hex.parse(r),s=v.enc.Hex.parse(n),a=v.enc.Hex.parse(i),u=e.encrypt(o,s,{iv:a}),c=v.enc.Hex.parse(u.toString());return v.enc.Base64.stringify(c)},i={"AES-256-CBC":{proc:t,eproc:r,keylen:32,ivlen:16},"AES-192-CBC":{proc:t,eproc:r,keylen:24,ivlen:16},"AES-128-CBC":{proc:t,eproc:r,keylen:16,ivlen:16},"DES-EDE3-CBC":{proc:function t(r,n,i){return e(v.TripleDES,r,n,i)},eproc:function t(e,r,i){return n(v.TripleDES,e,r,i)},keylen:24,ivlen:8},"DES-CBC":{proc:function t(r,n,i){return e(v.DES,r,n,i)},eproc:function t(e,r,i){return n(v.DES,e,r,i)},keylen:8,ivlen:8}},o=function t(e){var r={},n=e.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)","m"));n&&(r.cipher=n[1],r.ivsalt=n[2]);var i=e.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"));i&&(r.type=i[1]);var o=-1,s=0;-1!=e.indexOf("\r\n\r\n")&&(o=e.indexOf("\r\n\r\n"),s=2),-1!=e.indexOf("\n\n")&&(o=e.indexOf("\n\n"),s=1);var a=e.indexOf("-----END");if(-1!=o&&-1!=a){var u=e.substring(o+2*s,a-s);u=u.replace(/\s+/g,""),r.data=u;}return r},s=function t(e,r,n){for(var o=n.substring(0,16),s=v.enc.Hex.parse(o),a=v.enc.Utf8.parse(r),u=i[e].keylen+i[e].ivlen,c="",h=null;;){var l=v.algo.MD5.create();if(null!=h&&l.update(h),l.update(a),l.update(s),h=l.finalize(),(c+=v.enc.Hex.stringify(h)).length>=2*u)break}var f={};return f.keyhex=c.substr(0,2*i[e].keylen),f.ivhex=c.substr(2*i[e].keylen,2*i[e].ivlen),f},a=function t(e,r,n,o){var s=v.enc.Base64.parse(e),a=v.enc.Hex.stringify(s);return (0, i[r].proc)(a,n,o)};return {version:"1.0.0",parsePKCS5PEM:function t(e){return o(e)},getKeyAndUnusedIvByPasscodeAndIvsalt:function t(e,r,n){return s(e,r,n)},decryptKeyB64:function t(e,r,n,i){return a(e,r,n,i)},getDecryptedKeyHex:function t(e,r){var n=o(e),i=(n.cipher),u=n.ivsalt,c=n.data,h=s(i,r,u).keyhex;return a(c,i,h,u)},getEncryptedPKCS5PEMFromPrvKeyHex:function t(e,r,n,o,a){var u="";if(void 0!==o&&null!=o||(o="AES-256-CBC"),void 0===i[o])throw new Error("KEYUTIL unsupported algorithm: "+o);void 0!==a&&null!=a||(a=function t(e){var r=v.lib.WordArray.random(e);return v.enc.Hex.stringify(r)}(i[o].ivlen).toUpperCase());var c=function t(e,r,n,o){return (0, i[r].eproc)(e,n,o)}(r,o,s(o,n,a).keyhex,a);u="-----BEGIN "+e+" PRIVATE KEY-----\r\n";return u+="Proc-Type: 4,ENCRYPTED\r\n",u+="DEK-Info: "+o+","+a+"\r\n",u+="\r\n",u+=c.replace(/(.{64})/g,"$1\r\n"),u+="\r\n-----END "+e+" PRIVATE KEY-----\r\n"},parseHexOfEncryptedPKCS8:function t(e){var r=Fr,n=r.getChildIdx,i=r.getV,o={},s=n(e,0);if(2!=s.length)throw new Error("malformed format: SEQUENCE(0).items != 2: "+s.length);o.ciphertext=i(e,s[1]);var a=n(e,s[0]);if(2!=a.length)throw new Error("malformed format: SEQUENCE(0.0).items != 2: "+a.length);if("2a864886f70d01050d"!=i(e,a[0]))throw new Error("this only supports pkcs5PBES2");var u=n(e,a[1]);if(2!=a.length)throw new Error("malformed format: SEQUENCE(0.0.1).items != 2: "+u.length);var c=n(e,u[1]);if(2!=c.length)throw new Error("malformed format: SEQUENCE(0.0.1.1).items != 2: "+c.length);if("2a864886f70d0307"!=i(e,c[0]))throw "this only supports TripleDES";o.encryptionSchemeAlg="TripleDES",o.encryptionSchemeIV=i(e,c[1]);var h=n(e,u[0]);if(2!=h.length)throw new Error("malformed format: SEQUENCE(0.0.1.0).items != 2: "+h.length);if("2a864886f70d01050c"!=i(e,h[0]))throw new Error("this only supports pkcs5PBKDF2");var l=n(e,h[1]);if(l.length<2)throw new Error("malformed format: SEQUENCE(0.0.1.0.1).items < 2: "+l.length);o.pbkdf2Salt=i(e,l[0]);var f=i(e,l[1]);try{o.pbkdf2Iter=parseInt(f,16);}catch(t){throw new Error("malformed format pbkdf2Iter: "+f)}return o},getPBKDF2KeyHexFromParam:function t(e,r){var n=v.enc.Hex.parse(e.pbkdf2Salt),i=e.pbkdf2Iter,o=v.PBKDF2(r,n,{keySize:6,iterations:i});return v.enc.Hex.stringify(o)},_getPlainPKCS8HexFromEncryptedPKCS8PEM:function t(e,r){var n=Mr(e,"ENCRYPTED PRIVATE KEY"),i=this.parseHexOfEncryptedPKCS8(n),o=tn.getPBKDF2KeyHexFromParam(i,r),s={};s.ciphertext=v.enc.Hex.parse(i.ciphertext);var a=v.enc.Hex.parse(o),u=v.enc.Hex.parse(i.encryptionSchemeIV),c=v.TripleDES.decrypt(s,a,{iv:u});return v.enc.Hex.stringify(c)},getKeyFromEncryptedPKCS8PEM:function t(e,r){var n=this._getPlainPKCS8HexFromEncryptedPKCS8PEM(e,r);return this.getKeyFromPlainPrivatePKCS8Hex(n)},parsePlainPrivatePKCS8Hex:function t(e){var r=Fr,n=r.getChildIdx,i=r.getV,o={algparam:null};if("30"!=e.substr(0,2))throw new Error("malformed plain PKCS8 private key(code:001)");var s=n(e,0);if(s.length<3)throw new Error("malformed plain PKCS8 private key(code:002)");if("30"!=e.substr(s[1],2))throw new Error("malformed PKCS8 private key(code:003)");var a=n(e,s[1]);if(2!=a.length)throw new Error("malformed PKCS8 private key(code:004)");if("06"!=e.substr(a[0],2))throw new Error("malformed PKCS8 private key(code:005)");if(o.algoid=i(e,a[0]),"06"==e.substr(a[1],2)&&(o.algparam=i(e,a[1])),"04"!=e.substr(s[2],2))throw new Error("malformed PKCS8 private key(code:006)");return o.keyidx=r.getVidx(e,s[2]),o},getKeyFromPlainPrivatePKCS8PEM:function t(e){var r=Mr(e,"PRIVATE KEY");return this.getKeyFromPlainPrivatePKCS8Hex(r)},getKeyFromPlainPrivatePKCS8Hex:function t(e){var r,n=this.parsePlainPrivatePKCS8Hex(e);if("2a864886f70d010101"==n.algoid)r=new Me;else if("2a8648ce380401"==n.algoid)r=new Sr.crypto.DSA;else {if("2a8648ce3d0201"!=n.algoid)throw new Error("unsupported private key algorithm");r=new Sr.crypto.ECDSA;}return r.readPKCS8PrvKeyHex(e),r},_getKeyFromPublicPKCS8Hex:function t(e){var r,n=Fr.getVbyList(e,0,[0,0],"06");if("2a864886f70d010101"===n)r=new Me;else if("2a8648ce380401"===n)r=new Sr.crypto.DSA;else {if("2a8648ce3d0201"!==n)throw new Error("unsupported PKCS#8 public key hex");r=new Sr.crypto.ECDSA;}return r.readPKCS8PubKeyHex(e),r},parsePublicRawRSAKeyHex:function t(e){var r=Fr,n=r.getChildIdx,i=r.getV,o={};if("30"!=e.substr(0,2))throw new Error("malformed RSA key(code:001)");var s=n(e,0);if(2!=s.length)throw new Error("malformed RSA key(code:002)");if("02"!=e.substr(s[0],2))throw new Error("malformed RSA key(code:003)");if(o.n=i(e,s[0]),"02"!=e.substr(s[1],2))throw new Error("malformed RSA key(code:004)");return o.e=i(e,s[1]),o},parsePublicPKCS8Hex:function t(e){var r=Fr,n=r.getChildIdx,i=r.getV,o={algparam:null},s=n(e,0);if(2!=s.length)throw new Error("outer DERSequence shall have 2 elements: "+s.length);var a=s[0];if("30"!=e.substr(a,2))throw new Error("malformed PKCS8 public key(code:001)");var u=n(e,a);if(2!=u.length)throw new Error("malformed PKCS8 public key(code:002)");if("06"!=e.substr(u[0],2))throw new Error("malformed PKCS8 public key(code:003)");if(o.algoid=i(e,u[0]),"06"==e.substr(u[1],2)?o.algparam=i(e,u[1]):"30"==e.substr(u[1],2)&&(o.algparam={},o.algparam.p=r.getVbyList(e,u[1],[0],"02"),o.algparam.q=r.getVbyList(e,u[1],[1],"02"),o.algparam.g=r.getVbyList(e,u[1],[2],"02")),"03"!=e.substr(s[1],2))throw new Error("malformed PKCS8 public key(code:004)");return o.key=i(e,s[1]).substr(2),o}}}();tn.getKey=function(t,e,r){var n=(v=Fr).getChildIdx,i=(v.getV,v.getVbyList),o=Sr.crypto,s=o.ECDSA,a=o.DSA,u=Me,c=Mr,h=tn;if(void 0!==u&&t instanceof u)return t;if(void 0!==s&&t instanceof s)return t;if(void 0!==a&&t instanceof a)return t;if(void 0!==t.curve&&void 0!==t.xy&&void 0===t.d)return new s({pub:t.xy,curve:t.curve});if(void 0!==t.curve&&void 0!==t.d)return new s({prv:t.d,curve:t.curve});if(void 0===t.kty&&void 0!==t.n&&void 0!==t.e&&void 0===t.d)return (P=new u).setPublic(t.n,t.e),P;if(void 0===t.kty&&void 0!==t.n&&void 0!==t.e&&void 0!==t.d&&void 0!==t.p&&void 0!==t.q&&void 0!==t.dp&&void 0!==t.dq&&void 0!==t.co&&void 0===t.qi)return (P=new u).setPrivateEx(t.n,t.e,t.d,t.p,t.q,t.dp,t.dq,t.co),P;if(void 0===t.kty&&void 0!==t.n&&void 0!==t.e&&void 0!==t.d&&void 0===t.p)return (P=new u).setPrivate(t.n,t.e,t.d),P;if(void 0!==t.p&&void 0!==t.q&&void 0!==t.g&&void 0!==t.y&&void 0===t.x)return (P=new a).setPublic(t.p,t.q,t.g,t.y),P;if(void 0!==t.p&&void 0!==t.q&&void 0!==t.g&&void 0!==t.y&&void 0!==t.x)return (P=new a).setPrivate(t.p,t.q,t.g,t.y,t.x),P;if("RSA"===t.kty&&void 0!==t.n&&void 0!==t.e&&void 0===t.d)return (P=new u).setPublic(Rr(t.n),Rr(t.e)),P;if("RSA"===t.kty&&void 0!==t.n&&void 0!==t.e&&void 0!==t.d&&void 0!==t.p&&void 0!==t.q&&void 0!==t.dp&&void 0!==t.dq&&void 0!==t.qi)return (P=new u).setPrivateEx(Rr(t.n),Rr(t.e),Rr(t.d),Rr(t.p),Rr(t.q),Rr(t.dp),Rr(t.dq),Rr(t.qi)),P;if("RSA"===t.kty&&void 0!==t.n&&void 0!==t.e&&void 0!==t.d)return (P=new u).setPrivate(Rr(t.n),Rr(t.e),Rr(t.d)),P;if("EC"===t.kty&&void 0!==t.crv&&void 0!==t.x&&void 0!==t.y&&void 0===t.d){var l=(k=new s({curve:t.crv})).ecparams.keylen/4,f="04"+("0000000000"+Rr(t.x)).slice(-l)+("0000000000"+Rr(t.y)).slice(-l);return k.setPublicKeyHex(f),k}if("EC"===t.kty&&void 0!==t.crv&&void 0!==t.x&&void 0!==t.y&&void 0!==t.d){l=(k=new s({curve:t.crv})).ecparams.keylen/4,f="04"+("0000000000"+Rr(t.x)).slice(-l)+("0000000000"+Rr(t.y)).slice(-l);var g=("0000000000"+Rr(t.d)).slice(-l);return k.setPublicKeyHex(f),k.setPrivateKeyHex(g),k}if("pkcs5prv"===r){var d,p=t,v=Fr;if(9===(d=n(p,0)).length)(P=new u).readPKCS5PrvKeyHex(p);else if(6===d.length)(P=new a).readPKCS5PrvKeyHex(p);else {if(!(d.length>2&&"04"===p.substr(d[1],2)))throw new Error("unsupported PKCS#1/5 hexadecimal key");(P=new s).readPKCS5PrvKeyHex(p);}return P}if("pkcs8prv"===r)return P=h.getKeyFromPlainPrivatePKCS8Hex(t);if("pkcs8pub"===r)return h._getKeyFromPublicPKCS8Hex(t);if("x509pub"===r)return on.getPublicKeyFromCertHex(t);if(-1!=t.indexOf("-END CERTIFICATE-",0)||-1!=t.indexOf("-END X509 CERTIFICATE-",0)||-1!=t.indexOf("-END TRUSTED CERTIFICATE-",0))return on.getPublicKeyFromCertPEM(t);if(-1!=t.indexOf("-END PUBLIC KEY-")){var y=Mr(t,"PUBLIC KEY");return h._getKeyFromPublicPKCS8Hex(y)}if(-1!=t.indexOf("-END RSA PRIVATE KEY-")&&-1==t.indexOf("4,ENCRYPTED")){var m=c(t,"RSA PRIVATE KEY");return h.getKey(m,null,"pkcs5prv")}if(-1!=t.indexOf("-END DSA PRIVATE KEY-")&&-1==t.indexOf("4,ENCRYPTED")){var _=i(R=c(t,"DSA PRIVATE KEY"),0,[1],"02"),S=i(R,0,[2],"02"),b=i(R,0,[3],"02"),F=i(R,0,[4],"02"),E=i(R,0,[5],"02");return (P=new a).setPrivate(new w(_,16),new w(S,16),new w(b,16),new w(F,16),new w(E,16)),P}if(-1!=t.indexOf("-END EC PRIVATE KEY-")&&-1==t.indexOf("4,ENCRYPTED")){m=c(t,"EC PRIVATE KEY");return h.getKey(m,null,"pkcs5prv")}if(-1!=t.indexOf("-END PRIVATE KEY-"))return h.getKeyFromPlainPrivatePKCS8PEM(t);if(-1!=t.indexOf("-END RSA PRIVATE KEY-")&&-1!=t.indexOf("4,ENCRYPTED")){var x=h.getDecryptedKeyHex(t,e),A=new Me;return A.readPKCS5PrvKeyHex(x),A}if(-1!=t.indexOf("-END EC PRIVATE KEY-")&&-1!=t.indexOf("4,ENCRYPTED")){var k,P=i(R=h.getDecryptedKeyHex(t,e),0,[1],"04"),C=i(R,0,[2,0],"06"),T=i(R,0,[3,0],"03").substr(2);if(void 0===Sr.crypto.OID.oidhex2name[C])throw new Error("undefined OID(hex) in KJUR.crypto.OID: "+C);return (k=new s({curve:Sr.crypto.OID.oidhex2name[C]})).setPublicKeyHex(T),k.setPrivateKeyHex(P),k.isPublic=false,k}if(-1!=t.indexOf("-END DSA PRIVATE KEY-")&&-1!=t.indexOf("4,ENCRYPTED")){var R;_=i(R=h.getDecryptedKeyHex(t,e),0,[1],"02"),S=i(R,0,[2],"02"),b=i(R,0,[3],"02"),F=i(R,0,[4],"02"),E=i(R,0,[5],"02");return (P=new a).setPrivate(new w(_,16),new w(S,16),new w(b,16),new w(F,16),new w(E,16)),P}if(-1!=t.indexOf("-END ENCRYPTED PRIVATE KEY-"))return h.getKeyFromEncryptedPKCS8PEM(t,e);throw new Error("not supported argument")},tn.generateKeypair=function(t,e){if("RSA"==t){var r=e;(s=new Me).generate(r,"10001"),s.isPrivate=true,s.isPublic=true;var n=new Me,i=s.n.toString(16),o=s.e.toString(16);return n.setPublic(i,o),n.isPrivate=false,n.isPublic=true,(a={}).prvKeyObj=s,a.pubKeyObj=n,a}if("EC"==t){var s,a,u=e,c=new Sr.crypto.ECDSA({curve:u}).generateKeyPairHex();return (s=new Sr.crypto.ECDSA({curve:u})).setPublicKeyHex(c.ecpubhex),s.setPrivateKeyHex(c.ecprvhex),s.isPrivate=true,s.isPublic=false,(n=new Sr.crypto.ECDSA({curve:u})).setPublicKeyHex(c.ecpubhex),n.isPrivate=false,n.isPublic=true,(a={}).prvKeyObj=s,a.pubKeyObj=n,a}throw new Error("unknown algorithm: "+t)},tn.getPEM=function(t,e,r,n,i,o){var s=Sr,a=s.asn1,u=a.DERObjectIdentifier,c=a.DERInteger,h=a.ASN1Util.newObject,l=a.x509.SubjectPublicKeyInfo,f=s.crypto,g=f.DSA,d=f.ECDSA,p=Me;function y(t){return h({seq:[{int:0},{int:{bigint:t.n}},{int:t.e},{int:{bigint:t.d}},{int:{bigint:t.p}},{int:{bigint:t.q}},{int:{bigint:t.dmp1}},{int:{bigint:t.dmq1}},{int:{bigint:t.coeff}}]})}function m(t){return h({seq:[{int:1},{octstr:{hex:t.prvKeyHex}},{tag:["a0",true,{oid:{name:t.curveName}}]},{tag:["a1",true,{bitstr:{hex:"00"+t.pubKeyHex}}]}]})}function _(t){return h({seq:[{int:0},{int:{bigint:t.p}},{int:{bigint:t.q}},{int:{bigint:t.g}},{int:{bigint:t.y}},{int:{bigint:t.x}}]})}if((void 0!==p&&t instanceof p||void 0!==g&&t instanceof g||void 0!==d&&t instanceof d)&&1==t.isPublic&&(void 0===e||"PKCS8PUB"==e))return jr(F=new l(t).getEncodedHex(),"PUBLIC KEY");if("PKCS1PRV"==e&&void 0!==p&&t instanceof p&&(void 0===r||null==r)&&1==t.isPrivate)return jr(F=y(t).getEncodedHex(),"RSA PRIVATE KEY");if("PKCS1PRV"==e&&void 0!==d&&t instanceof d&&(void 0===r||null==r)&&1==t.isPrivate){var S=new u({name:t.curveName}).getEncodedHex(),b=m(t).getEncodedHex(),w="";return w+=jr(S,"EC PARAMETERS"),w+=jr(b,"EC PRIVATE KEY")}if("PKCS1PRV"==e&&void 0!==g&&t instanceof g&&(void 0===r||null==r)&&1==t.isPrivate)return jr(F=_(t).getEncodedHex(),"DSA PRIVATE KEY");if("PKCS5PRV"==e&&void 0!==p&&t instanceof p&&void 0!==r&&null!=r&&1==t.isPrivate){var F=y(t).getEncodedHex();return void 0===n&&(n="DES-EDE3-CBC"),this.getEncryptedPKCS5PEMFromPrvKeyHex("RSA",F,r,n,o)}if("PKCS5PRV"==e&&void 0!==d&&t instanceof d&&void 0!==r&&null!=r&&1==t.isPrivate){F=m(t).getEncodedHex();return void 0===n&&(n="DES-EDE3-CBC"),this.getEncryptedPKCS5PEMFromPrvKeyHex("EC",F,r,n,o)}if("PKCS5PRV"==e&&void 0!==g&&t instanceof g&&void 0!==r&&null!=r&&1==t.isPrivate){F=_(t).getEncodedHex();return void 0===n&&(n="DES-EDE3-CBC"),this.getEncryptedPKCS5PEMFromPrvKeyHex("DSA",F,r,n,o)}var E=function t(e,r){var n=x(e,r);return new h({seq:[{seq:[{oid:{name:"pkcs5PBES2"}},{seq:[{seq:[{oid:{name:"pkcs5PBKDF2"}},{seq:[{octstr:{hex:n.pbkdf2Salt}},{int:n.pbkdf2Iter}]}]},{seq:[{oid:{name:"des-EDE3-CBC"}},{octstr:{hex:n.encryptionSchemeIV}}]}]}]},{octstr:{hex:n.ciphertext}}]}).getEncodedHex()},x=function t(e,r){var n=v.lib.WordArray.random(8),i=v.lib.WordArray.random(8),o=v.PBKDF2(r,n,{keySize:6,iterations:100}),s=v.enc.Hex.parse(e),a=v.TripleDES.encrypt(s,o,{iv:i})+"",u={};return u.ciphertext=a,u.pbkdf2Salt=v.enc.Hex.stringify(n),u.pbkdf2Iter=100,u.encryptionSchemeAlg="DES-EDE3-CBC",u.encryptionSchemeIV=v.enc.Hex.stringify(i),u};if("PKCS8PRV"==e&&null!=p&&t instanceof p&&1==t.isPrivate){var A=y(t).getEncodedHex();F=h({seq:[{int:0},{seq:[{oid:{name:"rsaEncryption"}},{null:true}]},{octstr:{hex:A}}]}).getEncodedHex();return void 0===r||null==r?jr(F,"PRIVATE KEY"):jr(b=E(F,r),"ENCRYPTED PRIVATE KEY")}if("PKCS8PRV"==e&&void 0!==d&&t instanceof d&&1==t.isPrivate){A=new h({seq:[{int:1},{octstr:{hex:t.prvKeyHex}},{tag:["a1",true,{bitstr:{hex:"00"+t.pubKeyHex}}]}]}).getEncodedHex(),F=h({seq:[{int:0},{seq:[{oid:{name:"ecPublicKey"}},{oid:{name:t.curveName}}]},{octstr:{hex:A}}]}).getEncodedHex();return void 0===r||null==r?jr(F,"PRIVATE KEY"):jr(b=E(F,r),"ENCRYPTED PRIVATE KEY")}if("PKCS8PRV"==e&&void 0!==g&&t instanceof g&&1==t.isPrivate){A=new c({bigint:t.x}).getEncodedHex(),F=h({seq:[{int:0},{seq:[{oid:{name:"dsa"}},{seq:[{int:{bigint:t.p}},{int:{bigint:t.q}},{int:{bigint:t.g}}]}]},{octstr:{hex:A}}]}).getEncodedHex();return void 0===r||null==r?jr(F,"PRIVATE KEY"):jr(b=E(F,r),"ENCRYPTED PRIVATE KEY")}throw new Error("unsupported object nor format")},tn.getKeyFromCSRPEM=function(t){var e=Mr(t,"CERTIFICATE REQUEST");return tn.getKeyFromCSRHex(e)},tn.getKeyFromCSRHex=function(t){var e=tn.parseCSRHex(t);return tn.getKey(e.p8pubkeyhex,null,"pkcs8pub")},tn.parseCSRHex=function(t){var e=Fr,r=e.getChildIdx,n=e.getTLV,i={},o=t;if("30"!=o.substr(0,2))throw new Error("malformed CSR(code:001)");var s=r(o,0);if(s.length<1)throw new Error("malformed CSR(code:002)");if("30"!=o.substr(s[0],2))throw new Error("malformed CSR(code:003)");var a=r(o,s[0]);if(a.length<3)throw new Error("malformed CSR(code:004)");return i.p8pubkeyhex=n(o,a[2]),i},tn.getKeyID=function(t){var e=tn,r=Fr;"string"==typeof t&&-1!=t.indexOf("BEGIN ")&&(t=e.getKey(t));var n=Mr(e.getPEM(t)),i=r.getIdxbyList(n,0,[1]),o=r.getV(n,i).substring(2);return Sr.crypto.Util.hashHex(o,"sha1")},tn.getJWKFromKey=function(t){var e={};if(t instanceof Me&&t.isPrivate)return e.kty="RSA",e.n=Tr(t.n.toString(16)),e.e=Tr(t.e.toString(16)),e.d=Tr(t.d.toString(16)),e.p=Tr(t.p.toString(16)),e.q=Tr(t.q.toString(16)),e.dp=Tr(t.dmp1.toString(16)),e.dq=Tr(t.dmq1.toString(16)),e.qi=Tr(t.coeff.toString(16)),e;if(t instanceof Me&&t.isPublic)return e.kty="RSA",e.n=Tr(t.n.toString(16)),e.e=Tr(t.e.toString(16)),e;if(t instanceof Sr.crypto.ECDSA&&t.isPrivate){if("P-256"!==(n=t.getShortNISTPCurveName())&&"P-384"!==n)throw new Error("unsupported curve name for JWT: "+n);var r=t.getPublicKeyXYHex();return e.kty="EC",e.crv=n,e.x=Tr(r.x),e.y=Tr(r.y),e.d=Tr(t.prvKeyHex),e}if(t instanceof Sr.crypto.ECDSA&&t.isPublic){var n;if("P-256"!==(n=t.getShortNISTPCurveName())&&"P-384"!==n)throw new Error("unsupported curve name for JWT: "+n);r=t.getPublicKeyXYHex();return e.kty="EC",e.crv=n,e.x=Tr(r.x),e.y=Tr(r.y),e}throw new Error("not supported key object")},Me.getPosArrayOfChildrenFromHex=function(t){return Fr.getChildIdx(t,0)},Me.getHexValueArrayOfChildrenFromHex=function(t){var e,r=Fr.getV,n=r(t,(e=Me.getPosArrayOfChildrenFromHex(t))[0]),i=r(t,e[1]),o=r(t,e[2]),s=r(t,e[3]),a=r(t,e[4]),u=r(t,e[5]),c=r(t,e[6]),h=r(t,e[7]),l=r(t,e[8]);return (e=new Array).push(n,i,o,s,a,u,c,h,l),e},Me.prototype.readPrivateKeyFromPEMString=function(t){var e=Mr(t),r=Me.getHexValueArrayOfChildrenFromHex(e);this.setPrivateEx(r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8]);},Me.prototype.readPKCS5PrvKeyHex=function(t){var e=Me.getHexValueArrayOfChildrenFromHex(t);this.setPrivateEx(e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8]);},Me.prototype.readPKCS8PrvKeyHex=function(t){var e,r,n,i,o,s,a,u,c=Fr,h=c.getVbyListEx;if(false===c.isASN1HEX(t))throw new Error("not ASN.1 hex string");try{e=h(t,0,[2,0,1],"02"),r=h(t,0,[2,0,2],"02"),n=h(t,0,[2,0,3],"02"),i=h(t,0,[2,0,4],"02"),o=h(t,0,[2,0,5],"02"),s=h(t,0,[2,0,6],"02"),a=h(t,0,[2,0,7],"02"),u=h(t,0,[2,0,8],"02");}catch(t){throw new Error("malformed PKCS#8 plain RSA private key")}this.setPrivateEx(e,r,n,i,o,s,a,u);},Me.prototype.readPKCS5PubKeyHex=function(t){var e=Fr,r=e.getV;if(false===e.isASN1HEX(t))throw new Error("keyHex is not ASN.1 hex string");var n=e.getChildIdx(t,0);if(2!==n.length||"02"!==t.substr(n[0],2)||"02"!==t.substr(n[1],2))throw new Error("wrong hex for PKCS#5 public key");var i=r(t,n[0]),o=r(t,n[1]);this.setPublic(i,o);},Me.prototype.readPKCS8PubKeyHex=function(t){var e=Fr;if(false===e.isASN1HEX(t))throw new Error("not ASN.1 hex string");if("06092a864886f70d010101"!==e.getTLVbyListEx(t,0,[0,0]))throw new Error("not PKCS8 RSA public key");var r=e.getTLVbyListEx(t,0,[1,0]);this.readPKCS5PubKeyHex(r);},Me.prototype.readCertPubKeyHex=function(t,e){var r,n;(r=new on).readCertHex(t),n=r.getPublicKeyHex(),this.readPKCS8PubKeyHex(n);};function en(t,e){for(var r="",n=e/4-t.length,i=0;i<n;i++)r+="0";return r+t}function rn(t,e,r){for(var n="",i=0;n.length<e;)n+=Lr(r(Nr(t+String.fromCharCode.apply(String,[(4278190080&i)>>24,(16711680&i)>>16,(65280&i)>>8,255&i])))),i+=1;return n}function nn(t){for(var e in Sr.crypto.Util.DIGESTINFOHEAD){var r=Sr.crypto.Util.DIGESTINFOHEAD[e],n=r.length;if(t.substring(0,n)==r)return [e,t.substring(n)]}return []}function on(t){var e,r=Fr,n=r.getChildIdx,i=r.getV,o=r.getTLV,s=r.getVbyList,a=r.getVbyListEx,u=r.getTLVbyList,c=r.getTLVbyListEx,h=r.getIdxbyList,l=r.getIdxbyListEx,f=r.getVidx,g=r.getInt,d=r.oidname,p=r.hextooidstr,v=Mr;try{e=Sr.asn1.x509.AlgorithmIdentifier.PSSNAME2ASN1TLV;}catch(t){}this.HEX2STAG={"0c":"utf8",13:"prn",16:"ia5","1a":"vis","1e":"bmp"},this.hex=null,this.version=0,this.foffset=0,this.aExtInfo=null,this.getVersion=function(){if(null===this.hex||0!==this.version)return this.version;var t=u(this.hex,0,[0,0]);if("a0"==t.substr(0,2)){var e=u(t,0,[0]),r=g(e,0);if(r<0||2<r)throw new Error("malformed version field");return this.version=r+1,this.version}return this.version=1,this.foffset=-1,1},this.getSerialNumberHex=function(){return a(this.hex,0,[0,0],"02")},this.getSignatureAlgorithmField=function(){var t=c(this.hex,0,[0,1]);return this.getAlgorithmIdentifierName(t)},this.getAlgorithmIdentifierName=function(t){for(var r in e)if(t===e[r])return r;return d(a(t,0,[0],"06"))},this.getIssuer=function(){return this.getX500Name(this.getIssuerHex())},this.getIssuerHex=function(){return u(this.hex,0,[0,3+this.foffset],"30")},this.getIssuerString=function(){return this.getIssuer().str},this.getSubject=function(){return this.getX500Name(this.getSubjectHex())},this.getSubjectHex=function(){return u(this.hex,0,[0,5+this.foffset],"30")},this.getSubjectString=function(){return this.getSubject().str},this.getNotBefore=function(){var t=s(this.hex,0,[0,4+this.foffset,0]);return t=t.replace(/(..)/g,"%$1"),t=decodeURIComponent(t)},this.getNotAfter=function(){var t=s(this.hex,0,[0,4+this.foffset,1]);return t=t.replace(/(..)/g,"%$1"),t=decodeURIComponent(t)},this.getPublicKeyHex=function(){return r.getTLVbyList(this.hex,0,[0,6+this.foffset],"30")},this.getPublicKeyIdx=function(){return h(this.hex,0,[0,6+this.foffset],"30")},this.getPublicKeyContentIdx=function(){var t=this.getPublicKeyIdx();return h(this.hex,t,[1,0],"30")},this.getPublicKey=function(){return tn.getKey(this.getPublicKeyHex(),null,"pkcs8pub")},this.getSignatureAlgorithmName=function(){var t=u(this.hex,0,[1],"30");return this.getAlgorithmIdentifierName(t)},this.getSignatureValueHex=function(){return s(this.hex,0,[2],"03",true)},this.verifySignature=function(t){var e=this.getSignatureAlgorithmField(),r=this.getSignatureValueHex(),n=u(this.hex,0,[0],"30"),i=new Sr.crypto.Signature({alg:e});return i.init(t),i.updateHex(n),i.verify(r)},this.parseExt=function(t){var e,o,a;if(void 0===t){if(a=this.hex,3!==this.version)return  -1;e=h(a,0,[0,7,0],"30"),o=n(a,e);}else {a=Mr(t);var u=h(a,0,[0,3,0,0],"06");if("2a864886f70d01090e"!=i(a,u))return void(this.aExtInfo=new Array);e=h(a,0,[0,3,0,1,0],"30"),o=n(a,e),this.hex=a;}this.aExtInfo=new Array;for(var c=0;c<o.length;c++){var l={critical:false},g=0;3===n(a,o[c]).length&&(l.critical=true,g=1),l.oid=r.hextooidstr(s(a,o[c],[0],"06"));var d=h(a,o[c],[1+g]);l.vidx=f(a,d),this.aExtInfo.push(l);}},this.getExtInfo=function(t){var e=this.aExtInfo,r=t;if(t.match(/^[0-9.]+$/)||(r=Sr.asn1.x509.OID.name2oid(t)),""!==r)for(var n=0;n<e.length;n++)if(e[n].oid===r)return e[n]},this.getExtBasicConstraints=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("basicConstraints");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var n={extname:"basicConstraints"};if(e&&(n.critical=true),"3000"===t)return n;if("30030101ff"===t)return n.cA=true,n;if("30060101ff02"===t.substr(0,12)){var s=i(t,10),a=parseInt(s,16);return n.cA=true,n.pathLen=a,n}throw new Error("hExtV parse error: "+t)},this.getExtKeyUsage=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("keyUsage");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var n={extname:"keyUsage"};return e&&(n.critical=true),n.names=this.getExtKeyUsageString(t).split(","),n},this.getExtKeyUsageBin=function(t){if(void 0===t){var e=this.getExtInfo("keyUsage");if(void 0===e)return "";t=o(this.hex,e.vidx);}if(8!=t.length&&10!=t.length)throw new Error("malformed key usage value: "+t);var r="000000000000000"+parseInt(t.substr(6),16).toString(2);return 8==t.length&&(r=r.slice(-8)),10==t.length&&(r=r.slice(-16)),""==(r=r.replace(/0+$/,""))&&(r="0"),r},this.getExtKeyUsageString=function(t){for(var e=this.getExtKeyUsageBin(t),r=new Array,n=0;n<e.length;n++)"1"==e.substr(n,1)&&r.push(on.KEYUSAGE_NAME[n]);return r.join(",")},this.getExtSubjectKeyIdentifier=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("subjectKeyIdentifier");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var n={extname:"subjectKeyIdentifier"};e&&(n.critical=true);var s=i(t,0);return n.kid={hex:s},n},this.getExtAuthorityKeyIdentifier=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("authorityKeyIdentifier");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var s={extname:"authorityKeyIdentifier"};e&&(s.critical=true);for(var a=n(t,0),u=0;u<a.length;u++){var c=t.substr(a[u],2);if("80"===c&&(s.kid={hex:i(t,a[u])}),"a1"===c){var h=o(t,a[u]),l=this.getGeneralNames(h);s.issuer=l[0].dn;}"82"===c&&(s.sn={hex:i(t,a[u])});}return s},this.getExtExtKeyUsage=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("extKeyUsage");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var s={extname:"extKeyUsage",array:[]};e&&(s.critical=true);for(var a=n(t,0),u=0;u<a.length;u++)s.array.push(d(i(t,a[u])));return s},this.getExtExtKeyUsageName=function(){var t=this.getExtInfo("extKeyUsage");if(void 0===t)return t;var e=new Array,r=o(this.hex,t.vidx);if(""===r)return e;for(var s=n(r,0),a=0;a<s.length;a++)e.push(d(i(r,s[a])));return e},this.getExtSubjectAltName=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("subjectAltName");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var n={extname:"subjectAltName",array:[]};return e&&(n.critical=true),n.array=this.getGeneralNames(t),n},this.getExtIssuerAltName=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("issuerAltName");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var n={extname:"issuerAltName",array:[]};return e&&(n.critical=true),n.array=this.getGeneralNames(t),n},this.getGeneralNames=function(t){for(var e=n(t,0),r=[],i=0;i<e.length;i++){var s=this.getGeneralName(o(t,e[i]));void 0!==s&&r.push(s);}return r},this.getGeneralName=function(t){var e=t.substr(0,2),r=i(t,0),n=Lr(r);return "81"==e?{rfc822:n}:"82"==e?{dns:n}:"86"==e?{uri:n}:"87"==e?{ip:zr(r)}:"a4"==e?{dn:this.getX500Name(r)}:void 0},this.getExtSubjectAltName2=function(){var t,e,r,s=this.getExtInfo("subjectAltName");if(void 0===s)return s;for(var a=new Array,u=o(this.hex,s.vidx),c=n(u,0),h=0;h<c.length;h++)r=u.substr(c[h],2),t=i(u,c[h]),"81"===r&&(e=Dr(t),a.push(["MAIL",e])),"82"===r&&(e=Dr(t),a.push(["DNS",e])),"84"===r&&(e=on.hex2dn(t,0),a.push(["DN",e])),"86"===r&&(e=Dr(t),a.push(["URI",e])),"87"===r&&(e=zr(t),a.push(["IP",e]));return a},this.getExtCRLDistributionPoints=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("cRLDistributionPoints");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var i={extname:"cRLDistributionPoints",array:[]};e&&(i.critical=true);for(var s=n(t,0),a=0;a<s.length;a++){var u=o(t,s[a]);i.array.push(this.getDistributionPoint(u));}return i},this.getDistributionPoint=function(t){for(var e={},r=n(t,0),i=0;i<r.length;i++){var s=t.substr(r[i],2),a=o(t,r[i]);"a0"==s&&(e.dpname=this.getDistributionPointName(a));}return e},this.getDistributionPointName=function(t){for(var e={},r=n(t,0),i=0;i<r.length;i++){var s=t.substr(r[i],2),a=o(t,r[i]);"a0"==s&&(e.full=this.getGeneralNames(a));}return e},this.getExtCRLDistributionPointsURI=function(){var t=this.getExtInfo("cRLDistributionPoints");if(void 0===t)return t;for(var e=new Array,r=n(this.hex,t.vidx),i=0;i<r.length;i++)try{var o=Dr(s(this.hex,r[i],[0,0,0],"86"));e.push(o);}catch(t){}return e},this.getExtAIAInfo=function(){var t=this.getExtInfo("authorityInfoAccess");if(void 0===t)return t;for(var e={ocsp:[],caissuer:[]},r=n(this.hex,t.vidx),i=0;i<r.length;i++){var o=s(this.hex,r[i],[0],"06"),a=s(this.hex,r[i],[1],"86");"2b06010505073001"===o&&e.ocsp.push(Dr(a)),"2b06010505073002"===o&&e.caissuer.push(Dr(a));}return e},this.getExtAuthorityInfoAccess=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("authorityInfoAccess");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var i={extname:"authorityInfoAccess",array:[]};e&&(i.critical=true);for(var u=n(t,0),c=0;c<u.length;c++){var h=a(t,u[c],[0],"06"),l=Dr(s(t,u[c],[1],"86"));if("2b06010505073001"==h)i.array.push({ocsp:l});else {if("2b06010505073002"!=h)throw new Error("unknown method: "+h);i.array.push({caissuer:l});}}return i},this.getExtCertificatePolicies=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("certificatePolicies");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var i={extname:"certificatePolicies",array:[]};e&&(i.critical=true);for(var s=n(t,0),a=0;a<s.length;a++){var u=o(t,s[a]),c=this.getPolicyInformation(u);i.array.push(c);}return i},this.getPolicyInformation=function(t){var e={},r=s(t,0,[0],"06");e.policyoid=d(r);var i=l(t,0,[1],"30");if(-1!=i){e.array=[];for(var a=n(t,i),u=0;u<a.length;u++){var c=o(t,a[u]),h=this.getPolicyQualifierInfo(c);e.array.push(h);}}return e},this.getPolicyQualifierInfo=function(t){var e={},r=s(t,0,[0],"06");if("2b06010505070201"===r){var n=a(t,0,[1],"16");e.cps=Lr(n);}else if("2b06010505070202"===r){var i=u(t,0,[1],"30");e.unotice=this.getUserNotice(i);}return e},this.getUserNotice=function(t){for(var e={},r=n(t,0),i=0;i<r.length;i++){var s=o(t,r[i]);"30"!=s.substr(0,2)&&(e.exptext=this.getDisplayText(s));}return e},this.getDisplayText=function(t){var e={};return e.type={"0c":"utf8",16:"ia5","1a":"vis","1e":"bmp"}[t.substr(0,2)],e.str=Lr(i(t,0)),e},this.getExtCRLNumber=function(t,e){var r={extname:"cRLNumber"};if(e&&(r.critical=true),"02"==t.substr(0,2))return r.num={hex:i(t,0)},r;throw new Error("hExtV parse error: "+t)},this.getExtCRLReason=function(t,e){var r={extname:"cRLReason"};if(e&&(r.critical=true),"0a"==t.substr(0,2))return r.code=parseInt(i(t,0),16),r;throw new Error("hExtV parse error: "+t)},this.getExtOcspNonce=function(t,e){var r={extname:"ocspNonce"};e&&(r.critical=true);var n=i(t,0);return r.hex=n,r},this.getExtOcspNoCheck=function(t,e){var r={extname:"ocspNoCheck"};return e&&(r.critical=true),r},this.getExtAdobeTimeStamp=function(t,e){if(void 0===t&&void 0===e){var r=this.getExtInfo("adobeTimeStamp");if(void 0===r)return;t=o(this.hex,r.vidx),e=r.critical;}var i={extname:"adobeTimeStamp"};e&&(i.critical=true);var s=n(t,0);if(s.length>1){var a=o(t,s[1]),u=this.getGeneralName(a);null!=u.uri&&(i.uri=u.uri);}if(s.length>2){var c=o(t,s[2]);"0101ff"==c&&(i.reqauth=true),"010100"==c&&(i.reqauth=false);}return i},this.getX500NameRule=function(t){for(var e=null,r=[],n=0;n<t.length;n++)for(var i=t[n],o=0;o<i.length;o++)r.push(i[o]);for(n=0;n<r.length;n++){var s=r[n],a=s.ds,u=s.value,c=s.type;if("prn"!=a&&"utf8"!=a&&"ia5"!=a)return "mixed";if("ia5"==a){if("CN"!=c)return "mixed";if(Sr.lang.String.isMail(u))continue;return "mixed"}if("C"==c){if("prn"==a)continue;return "mixed"}if(null==e)e=a;else if(e!==a)return "mixed"}return null==e?"prn":e},this.getX500Name=function(t){var e=this.getX500NameArray(t);return {array:e,str:this.dnarraytostr(e)}},this.getX500NameArray=function(t){for(var e=[],r=n(t,0),i=0;i<r.length;i++)e.push(this.getRDN(o(t,r[i])));return e},this.getRDN=function(t){for(var e=[],r=n(t,0),i=0;i<r.length;i++)e.push(this.getAttrTypeAndValue(o(t,r[i])));return e},this.getAttrTypeAndValue=function(t){var e={type:null,value:null,ds:null},r=n(t,0),i=s(t,r[0],[],"06"),o=s(t,r[1],[]),a=Sr.asn1.ASN1Util.oidHexToInt(i);return e.type=Sr.asn1.x509.OID.oid2atype(a),e.ds=this.HEX2STAG[t.substr(r[1],2)],"bmp"!=e.ds?e.value=Dr(o):e.value=Yr(o),e},this.readCertPEM=function(t){this.readCertHex(v(t));},this.readCertHex=function(t){this.hex=t,this.getVersion();try{h(this.hex,0,[0,7],"a3"),this.parseExt();}catch(t){}},this.getParam=function(){var t={};return t.version=this.getVersion(),t.serial={hex:this.getSerialNumberHex()},t.sigalg=this.getSignatureAlgorithmField(),t.issuer=this.getIssuer(),t.notbefore=this.getNotBefore(),t.notafter=this.getNotAfter(),t.subject=this.getSubject(),t.sbjpubkey=jr(this.getPublicKeyHex(),"PUBLIC KEY"),this.aExtInfo.length>0&&(t.ext=this.getExtParamArray()),t.sighex=this.getSignatureValueHex(),t},this.getExtParamArray=function(t){null==t&&(-1!=l(this.hex,0,[0,"[3]"])&&(t=c(this.hex,0,[0,"[3]",0],"30")));for(var e=[],r=n(t,0),i=0;i<r.length;i++){var s=o(t,r[i]),a=this.getExtParam(s);null!=a&&e.push(a);}return e},this.getExtParam=function(t){var e=n(t,0).length;if(2!=e&&3!=e)throw new Error("wrong number elements in Extension: "+e+" "+t);var r=p(s(t,0,[0],"06")),i=false;3==e&&"0101ff"==u(t,0,[1])&&(i=true);var o=u(t,0,[e-1,0]),a=void 0;if("2.5.29.14"==r?a=this.getExtSubjectKeyIdentifier(o,i):"2.5.29.15"==r?a=this.getExtKeyUsage(o,i):"2.5.29.17"==r?a=this.getExtSubjectAltName(o,i):"2.5.29.18"==r?a=this.getExtIssuerAltName(o,i):"2.5.29.19"==r?a=this.getExtBasicConstraints(o,i):"2.5.29.31"==r?a=this.getExtCRLDistributionPoints(o,i):"2.5.29.32"==r?a=this.getExtCertificatePolicies(o,i):"2.5.29.35"==r?a=this.getExtAuthorityKeyIdentifier(o,i):"2.5.29.37"==r?a=this.getExtExtKeyUsage(o,i):"1.3.6.1.5.5.7.1.1"==r?a=this.getExtAuthorityInfoAccess(o,i):"2.5.29.20"==r?a=this.getExtCRLNumber(o,i):"2.5.29.21"==r?a=this.getExtCRLReason(o,i):"1.3.6.1.5.5.7.48.1.2"==r?a=this.getExtOcspNonce(o,i):"1.3.6.1.5.5.7.48.1.5"==r?a=this.getExtOcspNoCheck(o,i):"1.2.840.113583.1.1.9.1"==r&&(a=this.getExtAdobeTimeStamp(o,i)),null!=a)return a;var c={extname:r,extn:o};return i&&(c.critical=true),c},this.findExt=function(t,e){for(var r=0;r<t.length;r++)if(t[r].extname==e)return t[r];return null},this.updateExtCDPFullURI=function(t,e){var r=this.findExt(t,"cRLDistributionPoints");if(null!=r&&null!=r.array)for(var n=r.array,i=0;i<n.length;i++)if(null!=n[i].dpname&&null!=n[i].dpname.full)for(var o=n[i].dpname.full,s=0;s<o.length;s++){var a=o[i];null!=a.uri&&(a.uri=e);}},this.updateExtAIAOCSP=function(t,e){var r=this.findExt(t,"authorityInfoAccess");if(null!=r&&null!=r.array)for(var n=r.array,i=0;i<n.length;i++)null!=n[i].ocsp&&(n[i].ocsp=e);},this.updateExtAIACAIssuer=function(t,e){var r=this.findExt(t,"authorityInfoAccess");if(null!=r&&null!=r.array)for(var n=r.array,i=0;i<n.length;i++)null!=n[i].caissuer&&(n[i].caissuer=e);},this.dnarraytostr=function(t){return "/"+t.map((function(t){return function e(t){return t.map((function(t){return function e(t){return t.type+"="+t.value}(t).replace(/\+/,"\\+")})).join("+")}(t).replace(/\//,"\\/")})).join("/")},this.getInfo=function(){var t,e,r,n=function t(e){return JSON.stringify(e.array).replace(/[\[\]\{\}\"]/g,"")},i=function t(e){for(var r="",n=e.array,i=0;i<n.length;i++){var o=n[i];if(r+="    policy oid: "+o.policyoid+"\n",void 0!==o.array)for(var s=0;s<o.array.length;s++){var a=o.array[s];void 0!==a.cps&&(r+="    cps: "+a.cps+"\n");}}return r},o=function t(e){for(var r="",n=e.array,i=0;i<n.length;i++){var o=n[i];try{void 0!==o.dpname.full[0].uri&&(r+="    "+o.dpname.full[0].uri+"\n");}catch(t){}try{void 0!==o.dname.full[0].dn.hex&&(r+="    "+on.hex2dn(o.dpname.full[0].dn.hex)+"\n");}catch(t){}}return r},s=function t(e){for(var r="",n=e.array,i=0;i<n.length;i++){var o=n[i];void 0!==o.caissuer&&(r+="    caissuer: "+o.caissuer+"\n"),void 0!==o.ocsp&&(r+="    ocsp: "+o.ocsp+"\n");}return r};if(t="Basic Fields\n",t+="  serial number: "+this.getSerialNumberHex()+"\n",t+="  signature algorithm: "+this.getSignatureAlgorithmField()+"\n",t+="  issuer: "+this.getIssuerString()+"\n",t+="  notBefore: "+this.getNotBefore()+"\n",t+="  notAfter: "+this.getNotAfter()+"\n",t+="  subject: "+this.getSubjectString()+"\n",t+="  subject public key info: \n",t+="    key algorithm: "+(e=this.getPublicKey()).type+"\n","RSA"===e.type&&(t+="    n="+$r(e.n.toString(16)).substr(0,16)+"...\n",t+="    e="+$r(e.e.toString(16))+"\n"),null!=(r=this.aExtInfo)){t+="X509v3 Extensions:\n";for(var a=0;a<r.length;a++){var u=r[a],c=Sr.asn1.x509.OID.oid2name(u.oid);""===c&&(c=u.oid);var h="";if(true===u.critical&&(h="CRITICAL"),t+="  "+c+" "+h+":\n","basicConstraints"===c){var l=this.getExtBasicConstraints();void 0===l.cA?t+="    {}\n":(t+="    cA=true",void 0!==l.pathLen&&(t+=", pathLen="+l.pathLen),t+="\n");}else if("keyUsage"===c)t+="    "+this.getExtKeyUsageString()+"\n";else if("subjectKeyIdentifier"===c)t+="    "+this.getExtSubjectKeyIdentifier().kid.hex+"\n";else if("authorityKeyIdentifier"===c){var f=this.getExtAuthorityKeyIdentifier();void 0!==f.kid&&(t+="    kid="+f.kid.hex+"\n");}else {if("extKeyUsage"===c)t+="    "+this.getExtExtKeyUsage().array.join(", ")+"\n";else if("subjectAltName"===c)t+="    "+n(this.getExtSubjectAltName())+"\n";else if("cRLDistributionPoints"===c)t+=o(this.getExtCRLDistributionPoints());else if("authorityInfoAccess"===c)t+=s(this.getExtAuthorityInfoAccess());else "certificatePolicies"===c&&(t+=i(this.getExtCertificatePolicies()));}}}return t+="signature algorithm: "+this.getSignatureAlgorithmName()+"\n",t+="signature: "+this.getSignatureValueHex().substr(0,16)+"...\n"},"string"==typeof t&&(-1!=t.indexOf("-----BEGIN")?this.readCertPEM(t):Sr.lang.String.isHex(t)&&this.readCertHex(t));}Me.prototype.sign=function(t,e){var r=function t(r){return Sr.crypto.Util.hashString(r,e)}(t);return this.signWithMessageHash(r,e)},Me.prototype.signWithMessageHash=function(t,e){var r=Oe(Sr.crypto.Util.getPaddedDigestInfoHex(t,e,this.n.bitLength()),16);return en(this.doPrivate(r).toString(16),this.n.bitLength())},Me.prototype.signPSS=function(t,e,r){var n=function t(r){return Sr.crypto.Util.hashHex(r,e)}(Nr(t));return void 0===r&&(r=-1),this.signWithMessageHashPSS(n,e,r)},Me.prototype.signWithMessageHashPSS=function(t,e,r){var n,i=Lr(t),o=i.length,s=this.n.bitLength()-1,a=Math.ceil(s/8),u=function t(r){return Sr.crypto.Util.hashHex(r,e)};if(-1===r||void 0===r)r=o;else if(-2===r)r=a-o-2;else if(r<-2)throw new Error("invalid salt length");if(a<o+r+2)throw new Error("data too long");var c="";r>0&&(c=new Array(r),(new Be).nextBytes(c),c=String.fromCharCode.apply(String,c));var h=Lr(u(Nr("\0\0\0\0\0\0\0\0"+i+c))),l=[];for(n=0;n<a-r-o-2;n+=1)l[n]=0;var f=String.fromCharCode.apply(String,l)+""+c,g=rn(h,f.length,u),d=[];for(n=0;n<f.length;n+=1)d[n]=f.charCodeAt(n)^g.charCodeAt(n);var p=65280>>8*a-s&255;for(d[0]&=~p,n=0;n<o;n++)d.push(h.charCodeAt(n));return d.push(188),en(this.doPrivate(new w(d)).toString(16),this.n.bitLength())},Me.prototype.verify=function(t,e){if(null==(e=e.toLowerCase()).match(/^[0-9a-f]+$/))return  false;var r=Oe(e,16),n=this.n.bitLength();if(r.bitLength()>n)return  false;var i=this.doPublic(r).toString(16);if(i.length+3!=n/4)return  false;var o=nn(i.replace(/^1f+00/,""));if(0==o.length)return  false;var s=o[0];return o[1]==function t(e){return Sr.crypto.Util.hashString(e,s)}(t)},Me.prototype.verifyWithMessageHash=function(t,e){if(e.length!=Math.ceil(this.n.bitLength()/4))return  false;var r=Oe(e,16);if(r.bitLength()>this.n.bitLength())return 0;var n=nn(this.doPublic(r).toString(16).replace(/^1f+00/,""));if(0==n.length)return  false;n[0];return n[1]==t},Me.prototype.verifyPSS=function(t,e,r,n){var i=function t(e){return Sr.crypto.Util.hashHex(e,r)}(Nr(t));return void 0===n&&(n=-1),this.verifyWithMessageHashPSS(i,e,r,n)},Me.prototype.verifyWithMessageHashPSS=function(t,e,r,n){if(e.length!=Math.ceil(this.n.bitLength()/4))return  false;var i,o=new w(e,16),s=function t(e){return Sr.crypto.Util.hashHex(e,r)},a=Lr(t),u=a.length,c=this.n.bitLength()-1,h=Math.ceil(c/8);if(-1===n||void 0===n)n=u;else if(-2===n)n=h-u-2;else if(n<-2)throw new Error("invalid salt length");if(h<u+n+2)throw new Error("data too long");var l=this.doPublic(o).toByteArray();for(i=0;i<l.length;i+=1)l[i]&=255;for(;l.length<h;)l.unshift(0);if(188!==l[h-1])throw new Error("encoded message does not end in 0xbc");var f=(l=String.fromCharCode.apply(String,l)).substr(0,h-u-1),g=l.substr(f.length,u),d=65280>>8*h-c&255;if(0!=(f.charCodeAt(0)&d))throw new Error("bits beyond keysize not zero");var p=rn(g,f.length,s),v=[];for(i=0;i<f.length;i+=1)v[i]=f.charCodeAt(i)^p.charCodeAt(i);v[0]&=~d;var y=h-u-n-2;for(i=0;i<y;i+=1)if(0!==v[i])throw new Error("leftmost octets not zero");if(1!==v[y])throw new Error("0x01 marker not found");return g===Lr(s(Nr("\0\0\0\0\0\0\0\0"+a+String.fromCharCode.apply(String,v.slice(-n)))))},Me.SALT_LEN_HLEN=-1,Me.SALT_LEN_MAX=-2,Me.SALT_LEN_RECOVER=-2,on.hex2dn=function(t,e){ void 0===e&&(e=0);var r=new on;Fr.getTLV(t,e);return r.getX500Name(t).str},on.hex2rdn=function(t,e){if(void 0===e&&(e=0),"31"!==t.substr(e,2))throw new Error("malformed RDN");for(var r=new Array,n=Fr.getChildIdx(t,e),i=0;i<n.length;i++)r.push(on.hex2attrTypeValue(t,n[i]));return (r=r.map((function(t){return t.replace("+","\\+")}))).join("+")},on.hex2attrTypeValue=function(t,e){var r=Fr,n=r.getV;if(void 0===e&&(e=0),"30"!==t.substr(e,2))throw new Error("malformed attribute type and value");var i=r.getChildIdx(t,e);2!==i.length||t.substr(i[0],2);var o=n(t,i[0]),s=Sr.asn1.ASN1Util.oidHexToInt(o);return Sr.asn1.x509.OID.oid2atype(s)+"="+Lr(n(t,i[1]))},on.getPublicKeyFromCertHex=function(t){var e=new on;return e.readCertHex(t),e.getPublicKey()},on.getPublicKeyFromCertPEM=function(t){var e=new on;return e.readCertPEM(t),e.getPublicKey()},on.getPublicKeyInfoPropOfCertPEM=function(t){var e,r,n=Fr.getVbyList,i={};return i.algparam=null,(e=new on).readCertPEM(t),r=e.getPublicKeyHex(),i.keyhex=n(r,0,[1],"03").substr(2),i.algoid=n(r,0,[0,0],"06"),"2a8648ce3d0201"===i.algoid&&(i.algparam=n(r,0,[0,1],"06")),i},on.KEYUSAGE_NAME=["digitalSignature","nonRepudiation","keyEncipherment","dataEncipherment","keyAgreement","keyCertSign","cRLSign","encipherOnly","decipherOnly"],void 0!==Sr&&Sr||(e.KJUR=Sr={}),void 0!==Sr.jws&&Sr.jws||(Sr.jws={}),Sr.jws.JWS=function(){var t=Sr.jws.JWS.isSafeJSONString;this.parseJWS=function(e,r){if(void 0===this.parsedJWS||!r&&void 0===this.parsedJWS.sigvalH){var n=e.match(/^([^.]+)\.([^.]+)\.([^.]+)$/);if(null==n)throw "JWS signature is not a form of 'Head.Payload.SigValue'.";var i=n[1],o=n[2],s=n[3],a=i+"."+o;if(this.parsedJWS={},this.parsedJWS.headB64U=i,this.parsedJWS.payloadB64U=o,this.parsedJWS.sigvalB64U=s,this.parsedJWS.si=a,!r){var u=Rr(s),c=Oe(u,16);this.parsedJWS.sigvalH=u,this.parsedJWS.sigvalBI=c;}var h=wr(i),l=wr(o);if(this.parsedJWS.headS=h,this.parsedJWS.payloadS=l,!t(h,this.parsedJWS,"headP"))throw "malformed JSON string for JWS Head: "+h}};},Sr.jws.JWS.sign=function(t,e,r,n,i){var o,s,a,u=Sr,c=u.jws.JWS,h=c.readSafeJSONString,l=c.isSafeJSONString,f=u.crypto,d=(f.ECDSA,f.Mac),p=f.Signature,v=JSON;if("string"!=typeof e&&"object"!=(void 0===e?"undefined":g(e)))throw "spHeader must be JSON string or object: "+e;if("object"==(void 0===e?"undefined":g(e))&&(s=e,o=v.stringify(s)),"string"==typeof e){if(!l(o=e))throw "JWS Head is not safe JSON string: "+o;s=h(o);}if(a=r,"object"==(void 0===r?"undefined":g(r))&&(a=v.stringify(r)),""!=t&&null!=t||void 0===s.alg||(t=s.alg),""!=t&&null!=t&&void 0===s.alg&&(s.alg=t,o=v.stringify(s)),t!==s.alg)throw "alg and sHeader.alg doesn't match: "+t+"!="+s.alg;var y=null;if(void 0===c.jwsalg2sigalg[t])throw "unsupported alg name: "+t;y=c.jwsalg2sigalg[t];var m=br(o)+"."+br(a),_="";if("Hmac"==y.substr(0,4)){if(void 0===n)throw "mac key shall be specified for HS* alg";var S=new d({alg:y,prov:"cryptojs",pass:n});S.updateString(m),_=S.doFinal();}else if(-1!=y.indexOf("withECDSA")){(w=new p({alg:y})).init(n,i),w.updateString(m);var b=w.sign();_=Sr.crypto.ECDSA.asn1SigToConcatSig(b);}else {var w;if("none"!=y)(w=new p({alg:y})).init(n,i),w.updateString(m),_=w.sign();}return m+"."+Tr(_)},Sr.jws.JWS.verify=function(t,e,r){var n,i=Sr,o=i.jws.JWS,s=o.readSafeJSONString,a=i.crypto,u=a.ECDSA,c=a.Mac,h=a.Signature;void 0!==g(Me)&&(n=Me);var l=t.split(".");if(3!==l.length)return  false;var f=l[0]+"."+l[1],d=Rr(l[2]),p=s(wr(l[0])),v=null,y=null;if(void 0===p.alg)throw "algorithm not specified in header";if((y=(v=p.alg).substr(0,2),null!=r&&"[object Array]"===Object.prototype.toString.call(r)&&r.length>0)&&-1==(":"+r.join(":")+":").indexOf(":"+v+":"))throw "algorithm '"+v+"' not accepted in the list";if("none"!=v&&null===e)throw "key shall be specified to verify.";if("string"==typeof e&&-1!=e.indexOf("-----BEGIN ")&&(e=tn.getKey(e)),!("RS"!=y&&"PS"!=y||e instanceof n))throw "key shall be a RSAKey obj for RS* and PS* algs";if("ES"==y&&!(e instanceof u))throw "key shall be a ECDSA obj for ES* algs";var m=null;if(void 0===o.jwsalg2sigalg[p.alg])throw "unsupported alg name: "+v;if("none"==(m=o.jwsalg2sigalg[v]))throw "not supported";if("Hmac"==m.substr(0,4)){if(void 0===e)throw "hexadecimal key shall be specified for HMAC";var _=new c({alg:m,pass:e});return _.updateString(f),d==_.doFinal()}if(-1!=m.indexOf("withECDSA")){var S,b=null;try{b=u.concatSigToASN1Sig(d);}catch(t){return  false}return (S=new h({alg:m})).init(e),S.updateString(f),S.verify(b)}return (S=new h({alg:m})).init(e),S.updateString(f),S.verify(d)},Sr.jws.JWS.parse=function(t){var e,r,n,i=t.split("."),o={};if(2!=i.length&&3!=i.length)throw "malformed sJWS: wrong number of '.' splitted elements";return e=i[0],r=i[1],3==i.length&&(n=i[2]),o.headerObj=Sr.jws.JWS.readSafeJSONString(wr(e)),o.payloadObj=Sr.jws.JWS.readSafeJSONString(wr(r)),o.headerPP=JSON.stringify(o.headerObj,null,"  "),null==o.payloadObj?o.payloadPP=wr(r):o.payloadPP=JSON.stringify(o.payloadObj,null,"  "),void 0!==n&&(o.sigHex=Rr(n)),o},Sr.jws.JWS.verifyJWT=function(t,e,r){var n=Sr.jws,i=n.JWS,o=i.readSafeJSONString,s=i.inArray,a=i.includedArray,u=t.split("."),c=u[0],h=u[1],l=(Rr(u[2]),o(wr(c))),f=o(wr(h));if(void 0===l.alg)return  false;if(void 0===r.alg)throw "acceptField.alg shall be specified";if(!s(l.alg,r.alg))return  false;if(void 0!==f.iss&&"object"===g(r.iss)&&!s(f.iss,r.iss))return  false;if(void 0!==f.sub&&"object"===g(r.sub)&&!s(f.sub,r.sub))return  false;if(void 0!==f.aud&&"object"===g(r.aud))if("string"==typeof f.aud){if(!s(f.aud,r.aud))return  false}else if("object"==g(f.aud)&&!a(f.aud,r.aud))return  false;var d=n.IntDate.getNow();return void 0!==r.verifyAt&&"number"==typeof r.verifyAt&&(d=r.verifyAt),void 0!==r.gracePeriod&&"number"==typeof r.gracePeriod||(r.gracePeriod=0),!(void 0!==f.exp&&"number"==typeof f.exp&&f.exp+r.gracePeriod<d)&&(!(void 0!==f.nbf&&"number"==typeof f.nbf&&d<f.nbf-r.gracePeriod)&&(!(void 0!==f.iat&&"number"==typeof f.iat&&d<f.iat-r.gracePeriod)&&((void 0===f.jti||void 0===r.jti||f.jti===r.jti)&&!!i.verify(t,e,r.alg))))},Sr.jws.JWS.includedArray=function(t,e){var r=Sr.jws.JWS.inArray;if(null===t)return  false;if("object"!==(void 0===t?"undefined":g(t)))return  false;if("number"!=typeof t.length)return  false;for(var n=0;n<t.length;n++)if(!r(t[n],e))return  false;return  true},Sr.jws.JWS.inArray=function(t,e){if(null===e)return  false;if("object"!==(void 0===e?"undefined":g(e)))return  false;if("number"!=typeof e.length)return  false;for(var r=0;r<e.length;r++)if(e[r]==t)return  true;return  false},Sr.jws.JWS.jwsalg2sigalg={HS256:"HmacSHA256",HS384:"HmacSHA384",HS512:"HmacSHA512",RS256:"SHA256withRSA",RS384:"SHA384withRSA",RS512:"SHA512withRSA",ES256:"SHA256withECDSA",ES384:"SHA384withECDSA",PS256:"SHA256withRSAandMGF1",PS384:"SHA384withRSAandMGF1",PS512:"SHA512withRSAandMGF1",none:"none"},Sr.jws.JWS.isSafeJSONString=function(t,e,r){var n=null;try{return "object"!=(void 0===(n=_r(t))?"undefined":g(n))||n.constructor===Array?0:(e&&(e[r]=n),1)}catch(t){return 0}},Sr.jws.JWS.readSafeJSONString=function(t){var e=null;try{return "object"!=(void 0===(e=_r(t))?"undefined":g(e))||e.constructor===Array?null:e}catch(t){return null}},Sr.jws.JWS.getEncodedSignatureValueFromJWS=function(t){var e=t.match(/^[^.]+\.[^.]+\.([^.]+)$/);if(null==e)throw "JWS signature is not a form of 'Head.Payload.SigValue'.";return e[1]},Sr.jws.JWS.getJWKthumbprint=function(t){if("RSA"!==t.kty&&"EC"!==t.kty&&"oct"!==t.kty)throw "unsupported algorithm for JWK Thumprint";var e="{";if("RSA"===t.kty){if("string"!=typeof t.n||"string"!=typeof t.e)throw "wrong n and e value for RSA key";e+='"e":"'+t.e+'",',e+='"kty":"'+t.kty+'",',e+='"n":"'+t.n+'"}';}else if("EC"===t.kty){if("string"!=typeof t.crv||"string"!=typeof t.x||"string"!=typeof t.y)throw "wrong crv, x and y value for EC key";e+='"crv":"'+t.crv+'",',e+='"kty":"'+t.kty+'",',e+='"x":"'+t.x+'",',e+='"y":"'+t.y+'"}';}else if("oct"===t.kty){if("string"!=typeof t.k)throw "wrong k value for oct(symmetric) key";e+='"kty":"'+t.kty+'",',e+='"k":"'+t.k+'"}';}var r=Nr(e);return Tr(Sr.crypto.Util.hashHex(r,"sha256"))},Sr.jws.IntDate={},Sr.jws.IntDate.get=function(t){var e=Sr.jws.IntDate,r=e.getNow,n=e.getZulu;if("now"==t)return r();if("now + 1hour"==t)return r()+3600;if("now + 1day"==t)return r()+86400;if("now + 1month"==t)return r()+2592e3;if("now + 1year"==t)return r()+31536e3;if(t.match(/Z$/))return n(t);if(t.match(/^[0-9]+$/))return parseInt(t);throw "unsupported format: "+t},Sr.jws.IntDate.getZulu=function(t){return Vr(t)},Sr.jws.IntDate.getNow=function(){return ~~(new Date/1e3)},Sr.jws.IntDate.intDate2UTCString=function(t){return new Date(1e3*t).toUTCString()},Sr.jws.IntDate.intDate2Zulu=function(t){var e=new Date(1e3*t);return ("0000"+e.getUTCFullYear()).slice(-4)+("00"+(e.getUTCMonth()+1)).slice(-2)+("00"+e.getUTCDate()).slice(-2)+("00"+e.getUTCHours()).slice(-2)+("00"+e.getUTCMinutes()).slice(-2)+("00"+e.getUTCSeconds()).slice(-2)+"Z"},e.SecureRandom=Be,e.rng_seed_time=Re,e.BigInteger=w,e.RSAKey=Me;var sn=Sr.crypto.EDSA;e.EDSA=sn;var an=Sr.crypto.DSA;e.DSA=an;var un=Sr.crypto.Signature;e.Signature=un;var cn=Sr.crypto.MessageDigest;e.MessageDigest=cn;var hn=Sr.crypto.Mac;e.Mac=hn;var ln=Sr.crypto.Cipher;e.Cipher=ln,e.KEYUTIL=tn,e.ASN1HEX=Fr,e.X509=on,e.CryptoJS=v,e.b64tohex=S,e.b64toBA=b,e.stoBA=Er,e.BAtos=xr,e.BAtohex=Ar,e.stohex=kr,e.stob64=function fn(t){return _(kr(t))},e.stob64u=function gn(t){return Pr(_(kr(t)))},e.b64utos=function dn(t){return xr(b(Cr(t)))},e.b64tob64u=Pr,e.b64utob64=Cr,e.hex2b64=_,e.hextob64u=Tr,e.b64utohex=Rr,e.utf8tob64u=br,e.b64utoutf8=wr,e.utf8tob64=function pn(t){return _(Kr(Gr(t)))},e.b64toutf8=function vn(t){return decodeURIComponent(qr(S(t)))},e.utf8tohex=Ir,e.hextoutf8=Dr,e.hextorstr=Lr,e.rstrtohex=Nr,e.hextob64=Ur,e.hextob64nl=Br,e.b64nltohex=Or,e.hextopem=jr,e.pemtohex=Mr,e.hextoArrayBuffer=function yn(t){if(t.length%2!=0)throw "input is not even length";if(null==t.match(/^[0-9A-Fa-f]+$/))throw "input is not hexadecimal";for(var e=new ArrayBuffer(t.length/2),r=new DataView(e),n=0;n<t.length/2;n++)r.setUint8(n,parseInt(t.substr(2*n,2),16));return e},e.ArrayBuffertohex=function mn(t){for(var e="",r=new DataView(t),n=0;n<t.byteLength;n++)e+=("00"+r.getUint8(n).toString(16)).slice(-2);return e},e.zulutomsec=Hr,e.zulutosec=Vr,e.zulutodate=function _n(t){return new Date(Hr(t))},e.datetozulu=function Sn(t,e,r){var n,i=t.getUTCFullYear();if(e){if(i<1950||2049<i)throw "not proper year for UTCTime: "+i;n=(""+i).slice(-2);}else n=("000"+i).slice(-4);if(n+=("0"+(t.getUTCMonth()+1)).slice(-2),n+=("0"+t.getUTCDate()).slice(-2),n+=("0"+t.getUTCHours()).slice(-2),n+=("0"+t.getUTCMinutes()).slice(-2),n+=("0"+t.getUTCSeconds()).slice(-2),r){var o=t.getUTCMilliseconds();0!==o&&(n+="."+(o=(o=("00"+o).slice(-3)).replace(/0+$/g,"")));}return n+="Z"},e.uricmptohex=Kr,e.hextouricmp=qr,e.ipv6tohex=Jr,e.hextoipv6=Wr,e.hextoip=zr,e.iptohex=function bn(t){var e="malformed IP address";if(!(t=t.toLowerCase(t)).match(/^[0-9.]+$/)){if(t.match(/^[0-9a-f:]+$/)&&-1!==t.indexOf(":"))return Jr(t);throw e}var r=t.split(".");if(4!==r.length)throw e;var n="";try{for(var i=0;i<4;i++){n+=("0"+parseInt(r[i]).toString(16)).slice(-2);}return n}catch(t){throw e}},e.encodeURIComponentAll=Gr,e.newline_toUnix=function wn(t){return t=t.replace(/\r\n/gm,"\n")},e.newline_toDos=function Fn(t){return t=(t=t.replace(/\r\n/gm,"\n")).replace(/\n/gm,"\r\n")},e.hextoposhex=$r,e.intarystrtohex=function En(t){t=(t=(t=t.replace(/^\s*\[\s*/,"")).replace(/\s*\]\s*$/,"")).replace(/\s*/g,"");try{return t.split(/,/).map((function(t,e,r){var n=parseInt(t);if(n<0||255<n)throw "integer not in range 0-255";return ("00"+n.toString(16)).slice(-2)})).join("")}catch(t){throw "malformed integer array string: "+t}},e.strdiffidx=function t(e,r){var n=e.length;e.length>r.length&&(n=r.length);for(var i=0;i<n;i++)if(e.charCodeAt(i)!=r.charCodeAt(i))return i;return e.length!=r.length?n:-1},e.KJUR=Sr;var xn=Sr.crypto;e.crypto=xn;var An=Sr.asn1;e.asn1=An;var kn=Sr.jws;e.jws=kn;var Pn=Sr.lang;e.lang=Pn;}).call(this,r(28).Buffer);},function(t,e,r){(function(t){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
var n=r(30),i=r(31),o=r(32);function s(){return u.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function a(t,e){if(s()<e)throw new RangeError("Invalid typed array length");return u.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e)).__proto__=u.prototype:(null===t&&(t=new u(e)),t.length=e),t}function u(t,e,r){if(!(u.TYPED_ARRAY_SUPPORT||this instanceof u))return new u(t,e,r);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return l(this,t)}return c(this,t,e,r)}function c(t,e,r,n){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return "undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?function i(t,e,r,n){if(e.byteLength,r<0||e.byteLength<r)throw new RangeError("'offset' is out of bounds");if(e.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");e=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n);u.TYPED_ARRAY_SUPPORT?(t=e).__proto__=u.prototype:t=f(t,e);return t}(t,e,r,n):"string"==typeof e?function s(t,e,r){"string"==typeof r&&""!==r||(r="utf8");if(!u.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|d(e,r),i=(t=a(t,n)).write(e,r);i!==n&&(t=t.slice(0,i));return t}(t,e,r):function c(t,e){if(u.isBuffer(e)){var r=0|g(e.length);return 0===(t=a(t,r)).length||e.copy(t,0,0,r),t}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return "number"!=typeof e.length||function n(t){return t!=t}(e.length)?a(t,0):f(t,e);if("Buffer"===e.type&&o(e.data))return f(t,e.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,e)}function h(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function l(t,e){if(h(e),t=a(t,e<0?0:0|g(e)),!u.TYPED_ARRAY_SUPPORT)for(var r=0;r<e;++r)t[r]=0;return t}function f(t,e){var r=e.length<0?0:0|g(e.length);t=a(t,r);for(var n=0;n<r;n+=1)t[n]=255&e[n];return t}function g(t){if(t>=s())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+s().toString(16)+" bytes");return 0|t}function d(t,e){if(u.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=false;;)switch(e){case "ascii":case "latin1":case "binary":return r;case "utf8":case "utf-8":case void 0:return K(t).length;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return 2*r;case "hex":return r>>>1;case "base64":return q(t).length;default:if(n)return K(t).length;e=(""+e).toLowerCase(),n=true;}}function p(t,e,r){var n=false;if((void 0===e||e<0)&&(e=0),e>this.length)return "";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return "";if((r>>>=0)<=(e>>>=0))return "";for(t||(t="utf8");;)switch(t){case "hex":return I(this,e,r);case "utf8":case "utf-8":return A(this,e,r);case "ascii":return T(this,e,r);case "latin1":case "binary":return R(this,e,r);case "base64":return x(this,e,r);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return D(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=true;}}function v(t,e,r){var n=t[e];t[e]=t[r],t[r]=n;}function y(t,e,r,n,i){if(0===t.length)return  -1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(i)return  -1;r=t.length-1;}else if(r<0){if(!i)return  -1;r=0;}if("string"==typeof e&&(e=u.from(e,n)),u.isBuffer(e))return 0===e.length?-1:m(t,e,r,n,i);if("number"==typeof e)return e&=255,u.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):m(t,[e],r,n,i);throw new TypeError("val must be string, number or Buffer")}function m(t,e,r,n,i){var o,s=1,a=t.length,u=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return  -1;s=2,a/=2,u/=2,r/=2;}function c(t,e){return 1===s?t[e]:t.readUInt16BE(e*s)}if(i){var h=-1;for(o=r;o<a;o++)if(c(t,o)===c(e,-1===h?0:o-h)){if(-1===h&&(h=o),o-h+1===u)return h*s}else  -1!==h&&(o-=o-h),h=-1;}else for(r+u>a&&(r=a-u),o=r;o>=0;o--){for(var l=true,f=0;f<u;f++)if(c(t,o+f)!==c(e,f)){l=false;break}if(l)return o}return  -1}function _(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var s=0;s<n;++s){var a=parseInt(e.substr(2*s,2),16);if(isNaN(a))return s;t[r+s]=a;}return s}function S(t,e,r,n){return J(K(e,t.length-r),t,r,n)}function b(t,e,r,n){return J(function i(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function w(t,e,r,n){return b(t,e,r,n)}function F(t,e,r,n){return J(q(e),t,r,n)}function E(t,e,r,n){return J(function i(t,e){for(var r,n,i,o=[],s=0;s<t.length&&!((e-=2)<0);++s)n=(r=t.charCodeAt(s))>>8,i=r%256,o.push(i),o.push(n);return o}(e,t.length-r),t,r,n)}function x(t,e,r){return 0===e&&r===t.length?n.fromByteArray(t):n.fromByteArray(t.slice(e,r))}function A(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o,s,a,u,c=t[i],h=null,l=c>239?4:c>223?3:c>191?2:1;if(i+l<=r)switch(l){case 1:c<128&&(h=c);break;case 2:128==(192&(o=t[i+1]))&&(u=(31&c)<<6|63&o)>127&&(h=u);break;case 3:o=t[i+1],s=t[i+2],128==(192&o)&&128==(192&s)&&(u=(15&c)<<12|(63&o)<<6|63&s)>2047&&(u<55296||u>57343)&&(h=u);break;case 4:o=t[i+1],s=t[i+2],a=t[i+3],128==(192&o)&&128==(192&s)&&128==(192&a)&&(u=(15&c)<<18|(63&o)<<12|(63&s)<<6|63&a)>65535&&u<1114112&&(h=u);}null===h?(h=65533,l=1):h>65535&&(h-=65536,n.push(h>>>10&1023|55296),h=56320|1023&h),n.push(h),i+=l;}return function f(t){var e=t.length;if(e<=C)return String.fromCharCode.apply(String,t);var r="",n=0;for(;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=C));return r}(n)}e.Buffer=u,e.SlowBuffer=function k(t){+t!=t&&(t=0);return u.alloc(+t)},e.INSPECT_MAX_BYTES=50,u.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function P(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return  false}}(),e.kMaxLength=s(),u.poolSize=8192,u._augment=function(t){return t.__proto__=u.prototype,t},u.from=function(t,e,r){return c(null,t,e,r)},u.TYPED_ARRAY_SUPPORT&&(u.prototype.__proto__=Uint8Array.prototype,u.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&u[Symbol.species]===u&&Object.defineProperty(u,Symbol.species,{value:null,configurable:true})),u.alloc=function(t,e,r){return function n(t,e,r,i){return h(e),e<=0?a(t,e):void 0!==r?"string"==typeof i?a(t,e).fill(r,i):a(t,e).fill(r):a(t,e)}(null,t,e,r)},u.allocUnsafe=function(t){return l(null,t)},u.allocUnsafeSlow=function(t){return l(null,t)},u.isBuffer=function t(e){return !(null==e||!e._isBuffer)},u.compare=function t(e,r){if(!u.isBuffer(e)||!u.isBuffer(r))throw new TypeError("Arguments must be Buffers");if(e===r)return 0;for(var n=e.length,i=r.length,o=0,s=Math.min(n,i);o<s;++o)if(e[o]!==r[o]){n=e[o],i=r[o];break}return n<i?-1:i<n?1:0},u.isEncoding=function t(e){switch(String(e).toLowerCase()){case "hex":case "utf8":case "utf-8":case "ascii":case "latin1":case "binary":case "base64":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return  true;default:return  false}},u.concat=function t(e,r){if(!o(e))throw new TypeError('"list" argument must be an Array of Buffers');if(0===e.length)return u.alloc(0);var n;if(void 0===r)for(r=0,n=0;n<e.length;++n)r+=e[n].length;var i=u.allocUnsafe(r),s=0;for(n=0;n<e.length;++n){var a=e[n];if(!u.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(i,s),s+=a.length;}return i},u.byteLength=d,u.prototype._isBuffer=true,u.prototype.swap16=function t(){var e=this.length;if(e%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var r=0;r<e;r+=2)v(this,r,r+1);return this},u.prototype.swap32=function t(){var e=this.length;if(e%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var r=0;r<e;r+=4)v(this,r,r+3),v(this,r+1,r+2);return this},u.prototype.swap64=function t(){var e=this.length;if(e%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var r=0;r<e;r+=8)v(this,r,r+7),v(this,r+1,r+6),v(this,r+2,r+5),v(this,r+3,r+4);return this},u.prototype.toString=function t(){var e=0|this.length;return 0===e?"":0===arguments.length?A(this,0,e):p.apply(this,arguments)},u.prototype.equals=function t(e){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");return this===e||0===u.compare(this,e)},u.prototype.inspect=function t(){var r="",n=e.INSPECT_MAX_BYTES;return this.length>0&&(r=this.toString("hex",0,n).match(/.{2}/g).join(" "),this.length>n&&(r+=" ... ")),"<Buffer "+r+">"},u.prototype.compare=function t(e,r,n,i,o){if(!u.isBuffer(e))throw new TypeError("Argument must be a Buffer");if(void 0===r&&(r=0),void 0===n&&(n=e?e.length:0),void 0===i&&(i=0),void 0===o&&(o=this.length),r<0||n>e.length||i<0||o>this.length)throw new RangeError("out of range index");if(i>=o&&r>=n)return 0;if(i>=o)return  -1;if(r>=n)return 1;if(this===e)return 0;for(var s=(o>>>=0)-(i>>>=0),a=(n>>>=0)-(r>>>=0),c=Math.min(s,a),h=this.slice(i,o),l=e.slice(r,n),f=0;f<c;++f)if(h[f]!==l[f]){s=h[f],a=l[f];break}return s<a?-1:a<s?1:0},u.prototype.includes=function t(e,r,n){return  -1!==this.indexOf(e,r,n)},u.prototype.indexOf=function t(e,r,n){return y(this,e,r,n,true)},u.prototype.lastIndexOf=function t(e,r,n){return y(this,e,r,n,false)},u.prototype.write=function t(e,r,n,i){if(void 0===r)i="utf8",n=this.length,r=0;else if(void 0===n&&"string"==typeof r)i=r,n=this.length,r=0;else {if(!isFinite(r))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r|=0,isFinite(n)?(n|=0,void 0===i&&(i="utf8")):(i=n,n=void 0);}var o=this.length-r;if((void 0===n||n>o)&&(n=o),e.length>0&&(n<0||r<0)||r>this.length)throw new RangeError("Attempt to write outside buffer bounds");i||(i="utf8");for(var s=false;;)switch(i){case "hex":return _(this,e,r,n);case "utf8":case "utf-8":return S(this,e,r,n);case "ascii":return b(this,e,r,n);case "latin1":case "binary":return w(this,e,r,n);case "base64":return F(this,e,r,n);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":return E(this,e,r,n);default:if(s)throw new TypeError("Unknown encoding: "+i);i=(""+i).toLowerCase(),s=true;}},u.prototype.toJSON=function t(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var C=4096;function T(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function R(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function I(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=V(t[o]);return i}function D(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function L(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function N(t,e,r,n,i,o){if(!u.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>i||e<o)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function U(t,e,r,n){e<0&&(e=65535+e+1);for(var i=0,o=Math.min(t.length-r,2);i<o;++i)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i);}function B(t,e,r,n){e<0&&(e=4294967295+e+1);for(var i=0,o=Math.min(t.length-r,4);i<o;++i)t[r+i]=e>>>8*(n?i:3-i)&255;}function O(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function j(t,e,r,n,o){return o||O(t,0,r,4),i.write(t,e,r,n,23,4),r+4}function M(t,e,r,n,o){return o||O(t,0,r,8),i.write(t,e,r,n,52,8),r+8}u.prototype.slice=function t(e,r){var n,i=this.length;if((e=~~e)<0?(e+=i)<0&&(e=0):e>i&&(e=i),(r=void 0===r?i:~~r)<0?(r+=i)<0&&(r=0):r>i&&(r=i),r<e&&(r=e),u.TYPED_ARRAY_SUPPORT)(n=this.subarray(e,r)).__proto__=u.prototype;else {var o=r-e;n=new u(o,void 0);for(var s=0;s<o;++s)n[s]=this[s+e];}return n},u.prototype.readUIntLE=function t(e,r,n){e|=0,r|=0,n||L(e,r,this.length);for(var i=this[e],o=1,s=0;++s<r&&(o*=256);)i+=this[e+s]*o;return i},u.prototype.readUIntBE=function t(e,r,n){e|=0,r|=0,n||L(e,r,this.length);for(var i=this[e+--r],o=1;r>0&&(o*=256);)i+=this[e+--r]*o;return i},u.prototype.readUInt8=function t(e,r){return r||L(e,1,this.length),this[e]},u.prototype.readUInt16LE=function t(e,r){return r||L(e,2,this.length),this[e]|this[e+1]<<8},u.prototype.readUInt16BE=function t(e,r){return r||L(e,2,this.length),this[e]<<8|this[e+1]},u.prototype.readUInt32LE=function t(e,r){return r||L(e,4,this.length),(this[e]|this[e+1]<<8|this[e+2]<<16)+16777216*this[e+3]},u.prototype.readUInt32BE=function t(e,r){return r||L(e,4,this.length),16777216*this[e]+(this[e+1]<<16|this[e+2]<<8|this[e+3])},u.prototype.readIntLE=function t(e,r,n){e|=0,r|=0,n||L(e,r,this.length);for(var i=this[e],o=1,s=0;++s<r&&(o*=256);)i+=this[e+s]*o;return i>=(o*=128)&&(i-=Math.pow(2,8*r)),i},u.prototype.readIntBE=function t(e,r,n){e|=0,r|=0,n||L(e,r,this.length);for(var i=r,o=1,s=this[e+--i];i>0&&(o*=256);)s+=this[e+--i]*o;return s>=(o*=128)&&(s-=Math.pow(2,8*r)),s},u.prototype.readInt8=function t(e,r){return r||L(e,1,this.length),128&this[e]?-1*(255-this[e]+1):this[e]},u.prototype.readInt16LE=function t(e,r){r||L(e,2,this.length);var n=this[e]|this[e+1]<<8;return 32768&n?4294901760|n:n},u.prototype.readInt16BE=function t(e,r){r||L(e,2,this.length);var n=this[e+1]|this[e]<<8;return 32768&n?4294901760|n:n},u.prototype.readInt32LE=function t(e,r){return r||L(e,4,this.length),this[e]|this[e+1]<<8|this[e+2]<<16|this[e+3]<<24},u.prototype.readInt32BE=function t(e,r){return r||L(e,4,this.length),this[e]<<24|this[e+1]<<16|this[e+2]<<8|this[e+3]},u.prototype.readFloatLE=function t(e,r){return r||L(e,4,this.length),i.read(this,e,true,23,4)},u.prototype.readFloatBE=function t(e,r){return r||L(e,4,this.length),i.read(this,e,false,23,4)},u.prototype.readDoubleLE=function t(e,r){return r||L(e,8,this.length),i.read(this,e,true,52,8)},u.prototype.readDoubleBE=function t(e,r){return r||L(e,8,this.length),i.read(this,e,false,52,8)},u.prototype.writeUIntLE=function t(e,r,n,i){(e=+e,r|=0,n|=0,i)||N(this,e,r,n,Math.pow(2,8*n)-1,0);var o=1,s=0;for(this[r]=255&e;++s<n&&(o*=256);)this[r+s]=e/o&255;return r+n},u.prototype.writeUIntBE=function t(e,r,n,i){(e=+e,r|=0,n|=0,i)||N(this,e,r,n,Math.pow(2,8*n)-1,0);var o=n-1,s=1;for(this[r+o]=255&e;--o>=0&&(s*=256);)this[r+o]=e/s&255;return r+n},u.prototype.writeUInt8=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,1,255,0),u.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),this[r]=255&e,r+1},u.prototype.writeUInt16LE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[r]=255&e,this[r+1]=e>>>8):U(this,e,r,true),r+2},u.prototype.writeUInt16BE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[r]=e>>>8,this[r+1]=255&e):U(this,e,r,false),r+2},u.prototype.writeUInt32LE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[r+3]=e>>>24,this[r+2]=e>>>16,this[r+1]=e>>>8,this[r]=255&e):B(this,e,r,true),r+4},u.prototype.writeUInt32BE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[r]=e>>>24,this[r+1]=e>>>16,this[r+2]=e>>>8,this[r+3]=255&e):B(this,e,r,false),r+4},u.prototype.writeIntLE=function t(e,r,n,i){if(e=+e,r|=0,!i){var o=Math.pow(2,8*n-1);N(this,e,r,n,o-1,-o);}var s=0,a=1,u=0;for(this[r]=255&e;++s<n&&(a*=256);)e<0&&0===u&&0!==this[r+s-1]&&(u=1),this[r+s]=(e/a>>0)-u&255;return r+n},u.prototype.writeIntBE=function t(e,r,n,i){if(e=+e,r|=0,!i){var o=Math.pow(2,8*n-1);N(this,e,r,n,o-1,-o);}var s=n-1,a=1,u=0;for(this[r+s]=255&e;--s>=0&&(a*=256);)e<0&&0===u&&0!==this[r+s+1]&&(u=1),this[r+s]=(e/a>>0)-u&255;return r+n},u.prototype.writeInt8=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,1,127,-128),u.TYPED_ARRAY_SUPPORT||(e=Math.floor(e)),e<0&&(e=255+e+1),this[r]=255&e,r+1},u.prototype.writeInt16LE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[r]=255&e,this[r+1]=e>>>8):U(this,e,r,true),r+2},u.prototype.writeInt16BE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[r]=e>>>8,this[r+1]=255&e):U(this,e,r,false),r+2},u.prototype.writeInt32LE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,4,2147483647,-2147483648),u.TYPED_ARRAY_SUPPORT?(this[r]=255&e,this[r+1]=e>>>8,this[r+2]=e>>>16,this[r+3]=e>>>24):B(this,e,r,true),r+4},u.prototype.writeInt32BE=function t(e,r,n){return e=+e,r|=0,n||N(this,e,r,4,2147483647,-2147483648),e<0&&(e=4294967295+e+1),u.TYPED_ARRAY_SUPPORT?(this[r]=e>>>24,this[r+1]=e>>>16,this[r+2]=e>>>8,this[r+3]=255&e):B(this,e,r,false),r+4},u.prototype.writeFloatLE=function t(e,r,n){return j(this,e,r,true,n)},u.prototype.writeFloatBE=function t(e,r,n){return j(this,e,r,false,n)},u.prototype.writeDoubleLE=function t(e,r,n){return M(this,e,r,true,n)},u.prototype.writeDoubleBE=function t(e,r,n){return M(this,e,r,false,n)},u.prototype.copy=function t(e,r,n,i){if(n||(n=0),i||0===i||(i=this.length),r>=e.length&&(r=e.length),r||(r=0),i>0&&i<n&&(i=n),i===n)return 0;if(0===e.length||0===this.length)return 0;if(r<0)throw new RangeError("targetStart out of bounds");if(n<0||n>=this.length)throw new RangeError("sourceStart out of bounds");if(i<0)throw new RangeError("sourceEnd out of bounds");i>this.length&&(i=this.length),e.length-r<i-n&&(i=e.length-r+n);var o,s=i-n;if(this===e&&n<r&&r<i)for(o=s-1;o>=0;--o)e[o+r]=this[o+n];else if(s<1e3||!u.TYPED_ARRAY_SUPPORT)for(o=0;o<s;++o)e[o+r]=this[o+n];else Uint8Array.prototype.set.call(e,this.subarray(n,n+s),r);return s},u.prototype.fill=function t(e,r,n,i){if("string"==typeof e){if("string"==typeof r?(i=r,r=0,n=this.length):"string"==typeof n&&(i=n,n=this.length),1===e.length){var o=e.charCodeAt(0);o<256&&(e=o);}if(void 0!==i&&"string"!=typeof i)throw new TypeError("encoding must be a string");if("string"==typeof i&&!u.isEncoding(i))throw new TypeError("Unknown encoding: "+i)}else "number"==typeof e&&(e&=255);if(r<0||this.length<r||this.length<n)throw new RangeError("Out of range index");if(n<=r)return this;var s;if(r>>>=0,n=void 0===n?this.length:n>>>0,e||(e=0),"number"==typeof e)for(s=r;s<n;++s)this[s]=e;else {var a=u.isBuffer(e)?e:K(new u(e,i).toString()),c=a.length;for(s=0;s<n-r;++s)this[s+r]=a[s%c];}return this};var H=/[^+\/0-9A-Za-z-_]/g;function V(t){return t<16?"0"+t.toString(16):t.toString(16)}function K(t,e){var r;e=e||1/0;for(var n=t.length,i=null,o=[],s=0;s<n;++s){if((r=t.charCodeAt(s))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(s+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320);}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r);}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128);}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128);}else {if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128);}}return o}function q(t){return n.toByteArray(function e(t){if((t=function e(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(H,"")).length<2)return "";for(;t.length%4!=0;)t+="=";return t}(t))}function J(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}}).call(this,r(29));},function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")();}catch(t){"object"==typeof window&&(r=window);}t.exports=r;},function(t,e,r){e.byteLength=function n(t){var e=f(t),r=e[0],n=e[1];return 3*(r+n)/4-n},e.toByteArray=function i(t){var e,r,n=f(t),i=n[0],o=n[1],s=new u(function c(t,e,r){return 3*(e+r)/4-r}(0,i,o)),h=0,l=o>0?i-4:i;for(r=0;r<l;r+=4)e=a[t.charCodeAt(r)]<<18|a[t.charCodeAt(r+1)]<<12|a[t.charCodeAt(r+2)]<<6|a[t.charCodeAt(r+3)],s[h++]=e>>16&255,s[h++]=e>>8&255,s[h++]=255&e;2===o&&(e=a[t.charCodeAt(r)]<<2|a[t.charCodeAt(r+1)]>>4,s[h++]=255&e);1===o&&(e=a[t.charCodeAt(r)]<<10|a[t.charCodeAt(r+1)]<<4|a[t.charCodeAt(r+2)]>>2,s[h++]=e>>8&255,s[h++]=255&e);return s},e.fromByteArray=function o(t){for(var e,r=t.length,n=r%3,i=[],o=16383,a=0,u=r-n;a<u;a+=o)i.push(g(t,a,a+o>u?u:a+o));1===n?(e=t[r-1],i.push(s[e>>2]+s[e<<4&63]+"==")):2===n&&(e=(t[r-2]<<8)+t[r-1],i.push(s[e>>10]+s[e>>4&63]+s[e<<2&63]+"="));return i.join("")};for(var s=[],a=[],u="undefined"!=typeof Uint8Array?Uint8Array:Array,c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",h=0,l=c.length;h<l;++h)s[h]=c[h],a[c.charCodeAt(h)]=h;function f(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return  -1===r&&(r=e),[r,r===e?0:4-r%4]}function g(t,e,r){for(var n,i,o=[],a=e;a<r;a+=3)n=(t[a]<<16&16711680)+(t[a+1]<<8&65280)+(255&t[a+2]),o.push(s[(i=n)>>18&63]+s[i>>12&63]+s[i>>6&63]+s[63&i]);return o.join("")}a["-".charCodeAt(0)]=62,a["_".charCodeAt(0)]=63;},function(t,e){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
e.read=function(t,e,r,n,i){var o,s,a=8*i-n-1,u=(1<<a)-1,c=u>>1,h=-7,l=r?i-1:0,f=r?-1:1,g=t[e+l];for(l+=f,o=g&(1<<-h)-1,g>>=-h,h+=a;h>0;o=256*o+t[e+l],l+=f,h-=8);for(s=o&(1<<-h)-1,o>>=-h,h+=n;h>0;s=256*s+t[e+l],l+=f,h-=8);if(0===o)o=1-c;else {if(o===u)return s?NaN:1/0*(g?-1:1);s+=Math.pow(2,n),o-=c;}return (g?-1:1)*s*Math.pow(2,o-n)},e.write=function(t,e,r,n,i,o){var s,a,u,c=8*o-i-1,h=(1<<c)-1,l=h>>1,f=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,g=n?0:o-1,d=n?1:-1,p=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(a=isNaN(e)?1:0,s=h):(s=Math.floor(Math.log(e)/Math.LN2),e*(u=Math.pow(2,-s))<1&&(s--,u*=2),(e+=s+l>=1?f/u:f*Math.pow(2,1-l))*u>=2&&(s++,u/=2),s+l>=h?(a=0,s=h):s+l>=1?(a=(e*u-1)*Math.pow(2,i),s+=l):(a=e*Math.pow(2,l-1)*Math.pow(2,i),s=0));i>=8;t[r+g]=255&a,g+=d,a/=256,i-=8);for(s=s<<i|a,c+=i;c>0;t[r+g]=255&s,g+=d,s/=256,c-=8);t[r+g-d]|=128*p;};},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return "[object Array]"==r.call(t)};},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.default=function n(t){var e=t.jws,r=t.KeyUtil,n=t.X509,o=t.crypto,s=t.hextob64u,a=t.b64tohex,u=t.AllowedSigningAlgs;return function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.parseJwt=function t(r){i.Log.debug("JoseUtil.parseJwt");try{var n=e.JWS.parse(r);return {header:n.headerObj,payload:n.payloadObj}}catch(t){i.Log.error(t);}},t.validateJwt=function e(o,s,u,c,h,l,f){i.Log.debug("JoseUtil.validateJwt");try{if("RSA"===s.kty)if(s.e&&s.n)s=r.getKey(s);else {if(!s.x5c||!s.x5c.length)return i.Log.error("JoseUtil.validateJwt: RSA key missing key material",s),Promise.reject(new Error("RSA key missing key material"));var g=a(s.x5c[0]);s=n.getPublicKeyFromCertHex(g);}else {if("EC"!==s.kty)return i.Log.error("JoseUtil.validateJwt: Unsupported key type",s&&s.kty),Promise.reject(new Error(s.kty));if(!(s.crv&&s.x&&s.y))return i.Log.error("JoseUtil.validateJwt: EC key missing key material",s),Promise.reject(new Error("EC key missing key material"));s=r.getKey(s);}return t._validateJwt(o,s,u,c,h,l,f)}catch(t){return i.Log.error(t&&t.message||t),Promise.reject("JWT validation failed")}},t.validateJwtAttributes=function e(r,n,o,s,a,u){s||(s=0),a||(a=parseInt(Date.now()/1e3));var c=t.parseJwt(r).payload;if(!c.iss)return i.Log.error("JoseUtil._validateJwt: issuer was not provided"),Promise.reject(new Error("issuer was not provided"));if(c.iss!==n)return i.Log.error("JoseUtil._validateJwt: Invalid issuer in token",c.iss),Promise.reject(new Error("Invalid issuer in token: "+c.iss));if(!c.aud)return i.Log.error("JoseUtil._validateJwt: aud was not provided"),Promise.reject(new Error("aud was not provided"));if(!(c.aud===o||Array.isArray(c.aud)&&c.aud.indexOf(o)>=0))return i.Log.error("JoseUtil._validateJwt: Invalid audience in token",c.aud),Promise.reject(new Error("Invalid audience in token: "+c.aud));if(c.azp&&c.azp!==o)return i.Log.error("JoseUtil._validateJwt: Invalid azp in token",c.azp),Promise.reject(new Error("Invalid azp in token: "+c.azp));if(!u){var h=a+s,l=a-s;if(!c.iat)return i.Log.error("JoseUtil._validateJwt: iat was not provided"),Promise.reject(new Error("iat was not provided"));if(h<c.iat)return i.Log.error("JoseUtil._validateJwt: iat is in the future",c.iat),Promise.reject(new Error("iat is in the future: "+c.iat));if(c.nbf&&h<c.nbf)return i.Log.error("JoseUtil._validateJwt: nbf is in the future",c.nbf),Promise.reject(new Error("nbf is in the future: "+c.nbf));if(!c.exp)return i.Log.error("JoseUtil._validateJwt: exp was not provided"),Promise.reject(new Error("exp was not provided"));if(c.exp<l)return i.Log.error("JoseUtil._validateJwt: exp is in the past",c.exp),Promise.reject(new Error("exp is in the past:"+c.exp))}return Promise.resolve(c)},t._validateJwt=function r(n,o,s,a,c,h,l){return t.validateJwtAttributes(n,s,a,c,h,l).then((function(t){try{return e.JWS.verify(n,o,u)?t:(i.Log.error("JoseUtil._validateJwt: signature validation failed"),Promise.reject(new Error("signature validation failed")))}catch(t){return i.Log.error(t&&t.message||t),Promise.reject(new Error("signature validation failed"))}}))},t.hashString=function t(e,r){try{return o.Util.hashString(e,r)}catch(t){i.Log.error(t);}},t.hexToBase64Url=function t(e){try{return s(e)}catch(t){i.Log.error(t);}},t}()};var i=r(0);t.exports=e.default;},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SigninResponse=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(3);function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.SigninResponse=function(){function t(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"#";o(this,t);var n=i.UrlUtility.parseUrlFragment(e,r);this.error=n.error,this.error_description=n.error_description,this.error_uri=n.error_uri,this.code=n.code,this.state=n.state,this.id_token=n.id_token,this.session_state=n.session_state,this.access_token=n.access_token,this.token_type=n.token_type,this.scope=n.scope,this.profile=void 0,this.expires_in=n.expires_in;}return n(t,[{key:"expires_in",get:function t(){if(this.expires_at){var e=parseInt(Date.now()/1e3);return this.expires_at-e}},set:function t(e){var r=parseInt(e);if("number"==typeof r&&r>0){var n=parseInt(Date.now()/1e3);this.expires_at=n+r;}}},{key:"expired",get:function t(){var e=this.expires_in;if(void 0!==e)return e<=0}},{key:"scopes",get:function t(){return (this.scope||"").split(" ")}},{key:"isOpenIdConnect",get:function t(){return this.scopes.indexOf("openid")>=0||!!this.id_token}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SignoutRequest=void 0;var n=r(0),i=r(3),o=r(9);e.SignoutRequest=function t(e){var r=e.url,s=e.id_token_hint,a=e.post_logout_redirect_uri,u=e.data,c=e.extraQueryParams,h=e.request_type;if(function l(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),!r)throw n.Log.error("SignoutRequest.ctor: No url passed"),new Error("url");for(var f in s&&(r=i.UrlUtility.addQueryParam(r,"id_token_hint",s)),a&&(r=i.UrlUtility.addQueryParam(r,"post_logout_redirect_uri",a),u&&(this.state=new o.State({data:u,request_type:h}),r=i.UrlUtility.addQueryParam(r,"state",this.state.id))),c)r=i.UrlUtility.addQueryParam(r,f,c[f]);this.url=r;};},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SignoutResponse=void 0;var n=r(3);e.SignoutResponse=function t(e){!function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var i=n.UrlUtility.parseUrlFragment(e,"?");this.error=i.error,this.error_description=i.error_description,this.error_uri=i.error_uri,this.state=i.state;};},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.InMemoryWebStorage=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0);e.InMemoryWebStorage=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t),this._data={};}return t.prototype.getItem=function t(e){return i.Log.debug("InMemoryWebStorage.getItem",e),this._data[e]},t.prototype.setItem=function t(e,r){i.Log.debug("InMemoryWebStorage.setItem",e),this._data[e]=r;},t.prototype.removeItem=function t(e){i.Log.debug("InMemoryWebStorage.removeItem",e),delete this._data[e];},t.prototype.key=function t(e){return Object.getOwnPropertyNames(this._data)[e]},n(t,[{key:"length",get:function t(){return Object.getOwnPropertyNames(this._data).length}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.UserManager=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(10),s=r(39),a=r(15),u=r(45),c=r(47),h=r(18),l=r(8),f=r(20),g=r(11),d=r(4);function p(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function v(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}e.UserManager=function(t){function e(){var r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:c.SilentRenewService,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:h.SessionMonitor,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:f.TokenRevocationClient,l=arguments.length>4&&void 0!==arguments[4]?arguments[4]:g.TokenClient,y=arguments.length>5&&void 0!==arguments[5]?arguments[5]:d.JoseUtil;p(this,e),r instanceof s.UserManagerSettings||(r=new s.UserManagerSettings(r));var m=v(this,t.call(this,r));return m._events=new u.UserManagerEvents(r),m._silentRenewService=new n(m),m.settings.automaticSilentRenew&&(i.Log.debug("UserManager.ctor: automaticSilentRenew is configured, setting up silent renew"),m.startSilentRenew()),m.settings.monitorSession&&(i.Log.debug("UserManager.ctor: monitorSession is configured, setting up session monitor"),m._sessionMonitor=new o(m)),m._tokenRevocationClient=new a(m._settings),m._tokenClient=new l(m._settings),m._joseUtil=y,m}return function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,t),e.prototype.getUser=function t(){var e=this;return this._loadUser().then((function(t){return t?(i.Log.info("UserManager.getUser: user loaded"),e._events.load(t,false),t):(i.Log.info("UserManager.getUser: user not found in storage"),null)}))},e.prototype.removeUser=function t(){var e=this;return this.storeUser(null).then((function(){i.Log.info("UserManager.removeUser: user removed from storage"),e._events.unload();}))},e.prototype.signinRedirect=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(e=Object.assign({},e)).request_type="si:r";var r={useReplaceToNavigate:e.useReplaceToNavigate};return this._signinStart(e,this._redirectNavigator,r).then((function(){i.Log.info("UserManager.signinRedirect: successful");}))},e.prototype.signinRedirectCallback=function t(e){return this._signinEnd(e||this._redirectNavigator.url).then((function(t){return t.profile&&t.profile.sub?i.Log.info("UserManager.signinRedirectCallback: successful, signed in sub: ",t.profile.sub):i.Log.info("UserManager.signinRedirectCallback: no sub"),t}))},e.prototype.signinPopup=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(e=Object.assign({},e)).request_type="si:p";var r=e.redirect_uri||this.settings.popup_redirect_uri||this.settings.redirect_uri;return r?(e.redirect_uri=r,e.display="popup",this._signin(e,this._popupNavigator,{startUrl:r,popupWindowFeatures:e.popupWindowFeatures||this.settings.popupWindowFeatures,popupWindowTarget:e.popupWindowTarget||this.settings.popupWindowTarget}).then((function(t){return t&&(t.profile&&t.profile.sub?i.Log.info("UserManager.signinPopup: signinPopup successful, signed in sub: ",t.profile.sub):i.Log.info("UserManager.signinPopup: no sub")),t}))):(i.Log.error("UserManager.signinPopup: No popup_redirect_uri or redirect_uri configured"),Promise.reject(new Error("No popup_redirect_uri or redirect_uri configured")))},e.prototype.signinPopupCallback=function t(e){return this._signinCallback(e,this._popupNavigator).then((function(t){return t&&(t.profile&&t.profile.sub?i.Log.info("UserManager.signinPopupCallback: successful, signed in sub: ",t.profile.sub):i.Log.info("UserManager.signinPopupCallback: no sub")),t})).catch((function(t){i.Log.error(t.message);}))},e.prototype.signinSilent=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return r=Object.assign({},r),this._loadUser().then((function(t){return t&&t.refresh_token?(r.refresh_token=t.refresh_token,e._useRefreshToken(r)):(r.request_type="si:s",r.id_token_hint=r.id_token_hint||e.settings.includeIdTokenInSilentRenew&&t&&t.id_token,t&&e._settings.validateSubOnSilentRenew&&(i.Log.debug("UserManager.signinSilent, subject prior to silent renew: ",t.profile.sub),r.current_sub=t.profile.sub),e._signinSilentIframe(r))}))},e.prototype._useRefreshToken=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this._tokenClient.exchangeRefreshToken(r).then((function(t){return t?t.access_token?e._loadUser().then((function(r){if(r){var n=Promise.resolve();return t.id_token&&(n=e._validateIdTokenFromTokenRefreshToken(r.profile,t.id_token)),n.then((function(){return i.Log.debug("UserManager._useRefreshToken: refresh token response success"),r.id_token=t.id_token||r.id_token,r.access_token=t.access_token,r.refresh_token=t.refresh_token||r.refresh_token,r.expires_in=t.expires_in,e.storeUser(r).then((function(){return e._events.load(r),r}))}))}return null})):(i.Log.error("UserManager._useRefreshToken: No access token returned from token endpoint"),Promise.reject("No access token returned from token endpoint")):(i.Log.error("UserManager._useRefreshToken: No response returned from token endpoint"),Promise.reject("No response returned from token endpoint"))}))},e.prototype._validateIdTokenFromTokenRefreshToken=function t(e,r){var n=this;return this._metadataService.getIssuer().then((function(t){return n.settings.getEpochTime().then((function(o){return n._joseUtil.validateJwtAttributes(r,t,n._settings.client_id,n._settings.clockSkew,o).then((function(t){return t?t.sub!==e.sub?(i.Log.error("UserManager._validateIdTokenFromTokenRefreshToken: sub in id_token does not match current sub"),Promise.reject(new Error("sub in id_token does not match current sub"))):t.auth_time&&t.auth_time!==e.auth_time?(i.Log.error("UserManager._validateIdTokenFromTokenRefreshToken: auth_time in id_token does not match original auth_time"),Promise.reject(new Error("auth_time in id_token does not match original auth_time"))):t.azp&&t.azp!==e.azp?(i.Log.error("UserManager._validateIdTokenFromTokenRefreshToken: azp in id_token does not match original azp"),Promise.reject(new Error("azp in id_token does not match original azp"))):!t.azp&&e.azp?(i.Log.error("UserManager._validateIdTokenFromTokenRefreshToken: azp not in id_token, but present in original id_token"),Promise.reject(new Error("azp not in id_token, but present in original id_token"))):void 0:(i.Log.error("UserManager._validateIdTokenFromTokenRefreshToken: Failed to validate id_token"),Promise.reject(new Error("Failed to validate id_token")))}))}))}))},e.prototype._signinSilentIframe=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=e.redirect_uri||this.settings.silent_redirect_uri||this.settings.redirect_uri;return r?(e.redirect_uri=r,e.prompt=e.prompt||"none",this._signin(e,this._iframeNavigator,{startUrl:r,silentRequestTimeout:e.silentRequestTimeout||this.settings.silentRequestTimeout}).then((function(t){return t&&(t.profile&&t.profile.sub?i.Log.info("UserManager.signinSilent: successful, signed in sub: ",t.profile.sub):i.Log.info("UserManager.signinSilent: no sub")),t}))):(i.Log.error("UserManager.signinSilent: No silent_redirect_uri configured"),Promise.reject(new Error("No silent_redirect_uri configured")))},e.prototype.signinSilentCallback=function t(e){return this._signinCallback(e,this._iframeNavigator).then((function(t){return t&&(t.profile&&t.profile.sub?i.Log.info("UserManager.signinSilentCallback: successful, signed in sub: ",t.profile.sub):i.Log.info("UserManager.signinSilentCallback: no sub")),t}))},e.prototype.signinCallback=function t(e){var r=this;return this.readSigninResponseState(e).then((function(t){var n=t.state;t.response;return "si:r"===n.request_type?r.signinRedirectCallback(e):"si:p"===n.request_type?r.signinPopupCallback(e):"si:s"===n.request_type?r.signinSilentCallback(e):Promise.reject(new Error("invalid response_type in state"))}))},e.prototype.signoutCallback=function t(e,r){var n=this;return this.readSignoutResponseState(e).then((function(t){var i=t.state,o=t.response;return i?"so:r"===i.request_type?n.signoutRedirectCallback(e):"so:p"===i.request_type?n.signoutPopupCallback(e,r):Promise.reject(new Error("invalid response_type in state")):o}))},e.prototype.querySessionStatus=function t(){var e=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(r=Object.assign({},r)).request_type="si:s";var n=r.redirect_uri||this.settings.silent_redirect_uri||this.settings.redirect_uri;return n?(r.redirect_uri=n,r.prompt="none",r.response_type=r.response_type||this.settings.query_status_response_type,r.scope=r.scope||"openid",r.skipUserInfo=true,this._signinStart(r,this._iframeNavigator,{startUrl:n,silentRequestTimeout:r.silentRequestTimeout||this.settings.silentRequestTimeout}).then((function(t){return e.processSigninResponse(t.url).then((function(t){if(i.Log.debug("UserManager.querySessionStatus: got signin response"),t.session_state&&t.profile.sub)return i.Log.info("UserManager.querySessionStatus: querySessionStatus success for sub: ",t.profile.sub),{session_state:t.session_state,sub:t.profile.sub,sid:t.profile.sid};i.Log.info("querySessionStatus successful, user not authenticated");})).catch((function(t){if(t.session_state&&e.settings.monitorAnonymousSession&&("login_required"==t.message||"consent_required"==t.message||"interaction_required"==t.message||"account_selection_required"==t.message))return i.Log.info("UserManager.querySessionStatus: querySessionStatus success for anonymous user"),{session_state:t.session_state};throw t}))}))):(i.Log.error("UserManager.querySessionStatus: No silent_redirect_uri configured"),Promise.reject(new Error("No silent_redirect_uri configured")))},e.prototype._signin=function t(e,r){var n=this,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this._signinStart(e,r,i).then((function(t){return n._signinEnd(t.url,e)}))},e.prototype._signinStart=function t(e,r){var n=this,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return r.prepare(o).then((function(t){return i.Log.debug("UserManager._signinStart: got navigator window handle"),n.createSigninRequest(e).then((function(e){return i.Log.debug("UserManager._signinStart: got signin request"),o.url=e.url,o.id=e.state.id,t.navigate(o)})).catch((function(e){throw t.close&&(i.Log.debug("UserManager._signinStart: Error after preparing navigator, closing navigator window"),t.close()),e}))}))},e.prototype._signinEnd=function t(e){var r=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return this.processSigninResponse(e).then((function(t){i.Log.debug("UserManager._signinEnd: got signin response");var e=new a.User(t);if(n.current_sub){if(n.current_sub!==e.profile.sub)return i.Log.debug("UserManager._signinEnd: current user does not match user returned from signin. sub from signin: ",e.profile.sub),Promise.reject(new Error("login_required"));i.Log.debug("UserManager._signinEnd: current user matches user returned from signin");}return r.storeUser(e).then((function(){return i.Log.debug("UserManager._signinEnd: user stored"),r._events.load(e),e}))}))},e.prototype._signinCallback=function t(e,r){i.Log.debug("UserManager._signinCallback");var n="query"===this._settings.response_mode||!this._settings.response_mode&&l.SigninRequest.isCode(this._settings.response_type)?"?":"#";return r.callback(e,void 0,n)},e.prototype.signoutRedirect=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(e=Object.assign({},e)).request_type="so:r";var r=e.post_logout_redirect_uri||this.settings.post_logout_redirect_uri;r&&(e.post_logout_redirect_uri=r);var n={useReplaceToNavigate:e.useReplaceToNavigate};return this._signoutStart(e,this._redirectNavigator,n).then((function(){i.Log.info("UserManager.signoutRedirect: successful");}))},e.prototype.signoutRedirectCallback=function t(e){return this._signoutEnd(e||this._redirectNavigator.url).then((function(t){return i.Log.info("UserManager.signoutRedirectCallback: successful"),t}))},e.prototype.signoutPopup=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(e=Object.assign({},e)).request_type="so:p";var r=e.post_logout_redirect_uri||this.settings.popup_post_logout_redirect_uri||this.settings.post_logout_redirect_uri;return e.post_logout_redirect_uri=r,e.display="popup",e.post_logout_redirect_uri&&(e.state=e.state||{}),this._signout(e,this._popupNavigator,{startUrl:r,popupWindowFeatures:e.popupWindowFeatures||this.settings.popupWindowFeatures,popupWindowTarget:e.popupWindowTarget||this.settings.popupWindowTarget}).then((function(){i.Log.info("UserManager.signoutPopup: successful");}))},e.prototype.signoutPopupCallback=function t(e,r){ void 0===r&&"boolean"==typeof e&&(r=e,e=null);return this._popupNavigator.callback(e,r,"?").then((function(){i.Log.info("UserManager.signoutPopupCallback: successful");}))},e.prototype._signout=function t(e,r){var n=this,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this._signoutStart(e,r,i).then((function(t){return n._signoutEnd(t.url)}))},e.prototype._signoutStart=function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=this,n=arguments[1],o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return n.prepare(o).then((function(t){return i.Log.debug("UserManager._signoutStart: got navigator window handle"),r._loadUser().then((function(n){return i.Log.debug("UserManager._signoutStart: loaded current user from storage"),(r._settings.revokeAccessTokenOnSignout?r._revokeInternal(n):Promise.resolve()).then((function(){var s=e.id_token_hint||n&&n.id_token;return s&&(i.Log.debug("UserManager._signoutStart: Setting id_token into signout request"),e.id_token_hint=s),r.removeUser().then((function(){return i.Log.debug("UserManager._signoutStart: user removed, creating signout request"),r.createSignoutRequest(e).then((function(e){return i.Log.debug("UserManager._signoutStart: got signout request"),o.url=e.url,e.state&&(o.id=e.state.id),t.navigate(o)}))}))}))})).catch((function(e){throw t.close&&(i.Log.debug("UserManager._signoutStart: Error after preparing navigator, closing navigator window"),t.close()),e}))}))},e.prototype._signoutEnd=function t(e){return this.processSignoutResponse(e).then((function(t){return i.Log.debug("UserManager._signoutEnd: got signout response"),t}))},e.prototype.revokeAccessToken=function t(){var e=this;return this._loadUser().then((function(t){return e._revokeInternal(t,true).then((function(r){if(r)return i.Log.debug("UserManager.revokeAccessToken: removing token properties from user and re-storing"),t.access_token=null,t.refresh_token=null,t.expires_at=null,t.token_type=null,e.storeUser(t).then((function(){i.Log.debug("UserManager.revokeAccessToken: user stored"),e._events.load(t);}))}))})).then((function(){i.Log.info("UserManager.revokeAccessToken: access token revoked successfully");}))},e.prototype._revokeInternal=function t(e,r){var n=this;if(e){var o=e.access_token,s=e.refresh_token;return this._revokeAccessTokenInternal(o,r).then((function(t){return n._revokeRefreshTokenInternal(s,r).then((function(e){return t||e||i.Log.debug("UserManager.revokeAccessToken: no need to revoke due to no token(s), or JWT format"),t||e}))}))}return Promise.resolve(false)},e.prototype._revokeAccessTokenInternal=function t(e,r){return !e||e.indexOf(".")>=0?Promise.resolve(false):this._tokenRevocationClient.revoke(e,r).then((function(){return  true}))},e.prototype._revokeRefreshTokenInternal=function t(e,r){return e?this._tokenRevocationClient.revoke(e,r,"refresh_token").then((function(){return  true})):Promise.resolve(false)},e.prototype.startSilentRenew=function t(){this._silentRenewService.start();},e.prototype.stopSilentRenew=function t(){this._silentRenewService.stop();},e.prototype._loadUser=function t(){return this._userStore.get(this._userStoreKey).then((function(t){return t?(i.Log.debug("UserManager._loadUser: user storageString loaded"),a.User.fromStorageString(t)):(i.Log.debug("UserManager._loadUser: no user storageString"),null)}))},e.prototype.storeUser=function t(e){if(e){i.Log.debug("UserManager.storeUser: storing user");var r=e.toStorageString();return this._userStore.set(this._userStoreKey,r)}return i.Log.debug("storeUser.storeUser: removing user"),this._userStore.remove(this._userStoreKey)},n(e,[{key:"_redirectNavigator",get:function t(){return this.settings.redirectNavigator}},{key:"_popupNavigator",get:function t(){return this.settings.popupNavigator}},{key:"_iframeNavigator",get:function t(){return this.settings.iframeNavigator}},{key:"_userStore",get:function t(){return this.settings.userStore}},{key:"events",get:function t(){return this._events}},{key:"_userStoreKey",get:function t(){return "user:"+this.settings.authority+":"+this.settings.client_id}}]),e}(o.OidcClient);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.UserManagerSettings=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=(r(0),r(5)),o=r(40),s=r(41),a=r(43),u=r(6),c=r(1),h=r(8);function l(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function f(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}e.UserManagerSettings=function(t){function e(){var r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=r.popup_redirect_uri,i=r.popup_post_logout_redirect_uri,g=r.popupWindowFeatures,d=r.popupWindowTarget,p=r.silent_redirect_uri,v=r.silentRequestTimeout,y=r.automaticSilentRenew,m=void 0!==y&&y,_=r.validateSubOnSilentRenew,S=void 0!==_&&_,b=r.includeIdTokenInSilentRenew,w=void 0===b||b,F=r.monitorSession,E=void 0===F||F,x=r.monitorAnonymousSession,A=void 0!==x&&x,k=r.checkSessionInterval,P=void 0===k?2e3:k,C=r.stopCheckSessionOnError,T=void 0===C||C,R=r.query_status_response_type,I=r.revokeAccessTokenOnSignout,D=void 0!==I&&I,L=r.accessTokenExpiringNotificationTime,N=void 0===L?60:L,U=r.redirectNavigator,B=void 0===U?new o.RedirectNavigator:U,O=r.popupNavigator,j=void 0===O?new s.PopupNavigator:O,M=r.iframeNavigator,H=void 0===M?new a.IFrameNavigator:M,V=r.userStore,K=void 0===V?new u.WebStorageStateStore({store:c.Global.sessionStorage}):V;l(this,e);var q=f(this,t.call(this,arguments[0]));return q._popup_redirect_uri=n,q._popup_post_logout_redirect_uri=i,q._popupWindowFeatures=g,q._popupWindowTarget=d,q._silent_redirect_uri=p,q._silentRequestTimeout=v,q._automaticSilentRenew=m,q._validateSubOnSilentRenew=S,q._includeIdTokenInSilentRenew=w,q._accessTokenExpiringNotificationTime=N,q._monitorSession=E,q._monitorAnonymousSession=A,q._checkSessionInterval=P,q._stopCheckSessionOnError=T,R?q._query_status_response_type=R:arguments[0]&&arguments[0].response_type?q._query_status_response_type=h.SigninRequest.isOidc(arguments[0].response_type)?"id_token":"code":q._query_status_response_type="id_token",q._revokeAccessTokenOnSignout=D,q._redirectNavigator=B,q._popupNavigator=j,q._iframeNavigator=H,q._userStore=K,q}return function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,t),n(e,[{key:"popup_redirect_uri",get:function t(){return this._popup_redirect_uri}},{key:"popup_post_logout_redirect_uri",get:function t(){return this._popup_post_logout_redirect_uri}},{key:"popupWindowFeatures",get:function t(){return this._popupWindowFeatures}},{key:"popupWindowTarget",get:function t(){return this._popupWindowTarget}},{key:"silent_redirect_uri",get:function t(){return this._silent_redirect_uri}},{key:"silentRequestTimeout",get:function t(){return this._silentRequestTimeout}},{key:"automaticSilentRenew",get:function t(){return this._automaticSilentRenew}},{key:"validateSubOnSilentRenew",get:function t(){return this._validateSubOnSilentRenew}},{key:"includeIdTokenInSilentRenew",get:function t(){return this._includeIdTokenInSilentRenew}},{key:"accessTokenExpiringNotificationTime",get:function t(){return this._accessTokenExpiringNotificationTime}},{key:"monitorSession",get:function t(){return this._monitorSession}},{key:"monitorAnonymousSession",get:function t(){return this._monitorAnonymousSession}},{key:"checkSessionInterval",get:function t(){return this._checkSessionInterval}},{key:"stopCheckSessionOnError",get:function t(){return this._stopCheckSessionOnError}},{key:"query_status_response_type",get:function t(){return this._query_status_response_type}},{key:"revokeAccessTokenOnSignout",get:function t(){return this._revokeAccessTokenOnSignout}},{key:"redirectNavigator",get:function t(){return this._redirectNavigator}},{key:"popupNavigator",get:function t(){return this._popupNavigator}},{key:"iframeNavigator",get:function t(){return this._iframeNavigator}},{key:"userStore",get:function t(){return this._userStore}}]),e}(i.OidcClientSettings);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.RedirectNavigator=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0);e.RedirectNavigator=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.prototype.prepare=function t(){return Promise.resolve(this)},t.prototype.navigate=function t(e){return e&&e.url?(e.useReplaceToNavigate?window.location.replace(e.url):window.location=e.url,Promise.resolve()):(i.Log.error("RedirectNavigator.navigate: No url provided"),Promise.reject(new Error("No url provided")))},n(t,[{key:"url",get:function t(){return window.location.href}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.PopupNavigator=void 0;var n=r(0),i=r(42);e.PopupNavigator=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.prototype.prepare=function t(e){var r=new i.PopupWindow(e);return Promise.resolve(r)},t.prototype.callback=function t(e,r,o){n.Log.debug("PopupNavigator.callback");try{return i.PopupWindow.notifyOpener(e,r,o),Promise.resolve()}catch(t){return Promise.reject(t)}},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.PopupWindow=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(3);e.PopupWindow=function(){function t(e){var r=this;!function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._promise=new Promise((function(t,e){r._resolve=t,r._reject=e;}));var o=e.popupWindowTarget||"_blank",s=e.popupWindowFeatures||"location=no,toolbar=no,width=500,height=500,left=100,top=100;";this._popup=window.open("",o,s),this._popup&&(i.Log.debug("PopupWindow.ctor: popup successfully created"),this._checkForPopupClosedTimer=window.setInterval(this._checkForPopupClosed.bind(this),500));}return t.prototype.navigate=function t(e){return this._popup?e&&e.url?(i.Log.debug("PopupWindow.navigate: Setting URL in popup"),this._id=e.id,this._id&&(window["popupCallback_"+e.id]=this._callback.bind(this)),this._popup.focus(),this._popup.window.location=e.url):(this._error("PopupWindow.navigate: no url provided"),this._error("No url provided")):this._error("PopupWindow.navigate: Error opening popup window"),this.promise},t.prototype._success=function t(e){i.Log.debug("PopupWindow.callback: Successful response from popup window"),this._cleanup(),this._resolve(e);},t.prototype._error=function t(e){i.Log.error("PopupWindow.error: ",e),this._cleanup(),this._reject(new Error(e));},t.prototype.close=function t(){this._cleanup(false);},t.prototype._cleanup=function t(e){i.Log.debug("PopupWindow.cleanup"),window.clearInterval(this._checkForPopupClosedTimer),this._checkForPopupClosedTimer=null,delete window["popupCallback_"+this._id],this._popup&&!e&&this._popup.close(),this._popup=null;},t.prototype._checkForPopupClosed=function t(){this._popup&&!this._popup.closed||this._error("Popup window closed");},t.prototype._callback=function t(e,r){this._cleanup(r),e?(i.Log.debug("PopupWindow.callback success"),this._success({url:e})):(i.Log.debug("PopupWindow.callback: Invalid response from popup"),this._error("Invalid response from popup"));},t.notifyOpener=function t(e,r,n){if(window.opener){if(e=e||window.location.href){var s=o.UrlUtility.parseUrlFragment(e,n);if(s.state){var a="popupCallback_"+s.state,u=window.opener[a];u?(i.Log.debug("PopupWindow.notifyOpener: passing url message to opener"),u(e,r)):i.Log.warn("PopupWindow.notifyOpener: no matching callback found on opener");}else i.Log.warn("PopupWindow.notifyOpener: no state found in response url");}}else i.Log.warn("PopupWindow.notifyOpener: no window.opener. Can't complete notification.");},n(t,[{key:"promise",get:function t(){return this._promise}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.IFrameNavigator=void 0;var n=r(0),i=r(44);e.IFrameNavigator=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.prototype.prepare=function t(e){var r=new i.IFrameWindow(e);return Promise.resolve(r)},t.prototype.callback=function t(e){n.Log.debug("IFrameNavigator.callback");try{return i.IFrameWindow.notifyParent(e),Promise.resolve()}catch(t){return Promise.reject(t)}},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.IFrameWindow=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0);e.IFrameWindow=function(){function t(e){var r=this;!function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._promise=new Promise((function(t,e){r._resolve=t,r._reject=e;})),this._boundMessageEvent=this._message.bind(this),window.addEventListener("message",this._boundMessageEvent,false),this._frame=window.document.createElement("iframe"),this._frame.style.visibility="hidden",this._frame.style.position="absolute",this._frame.width=0,this._frame.height=0,window.document.body.appendChild(this._frame);}return t.prototype.navigate=function t(e){if(e&&e.url){var r=e.silentRequestTimeout||1e4;i.Log.debug("IFrameWindow.navigate: Using timeout of:",r),this._timer=window.setTimeout(this._timeout.bind(this),r),this._frame.src=e.url;}else this._error("No url provided");return this.promise},t.prototype._success=function t(e){this._cleanup(),i.Log.debug("IFrameWindow: Successful response from frame window"),this._resolve(e);},t.prototype._error=function t(e){this._cleanup(),i.Log.error(e),this._reject(new Error(e));},t.prototype.close=function t(){this._cleanup();},t.prototype._cleanup=function t(){this._frame&&(i.Log.debug("IFrameWindow: cleanup"),window.removeEventListener("message",this._boundMessageEvent,false),window.clearTimeout(this._timer),window.document.body.removeChild(this._frame),this._timer=null,this._frame=null,this._boundMessageEvent=null);},t.prototype._timeout=function t(){i.Log.debug("IFrameWindow.timeout"),this._error("Frame window timed out");},t.prototype._message=function t(e){if(i.Log.debug("IFrameWindow.message"),this._timer&&e.origin===this._origin&&e.source===this._frame.contentWindow&&"string"==typeof e.data&&(e.data.startsWith("http://")||e.data.startsWith("https://"))){var r=e.data;r?this._success({url:r}):this._error("Invalid response from frame");}},t.notifyParent=function t(e){i.Log.debug("IFrameWindow.notifyParent"),(e=e||window.location.href)&&(i.Log.debug("IFrameWindow.notifyParent: posting url message to parent"),window.parent.postMessage(e,location.protocol+"//"+location.host));},n(t,[{key:"promise",get:function t(){return this._promise}},{key:"_origin",get:function t(){return location.protocol+"//"+location.host}}]),t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.UserManagerEvents=void 0;var n=r(0),i=r(16),o=r(17);e.UserManagerEvents=function(t){function e(r){!function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e);var i=function s(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}(this,t.call(this,r));return i._userLoaded=new o.Event("User loaded"),i._userUnloaded=new o.Event("User unloaded"),i._silentRenewError=new o.Event("Silent renew error"),i._userSignedIn=new o.Event("User signed in"),i._userSignedOut=new o.Event("User signed out"),i._userSessionChanged=new o.Event("User session changed"),i}return function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,t),e.prototype.load=function e(r){var i=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];n.Log.debug("UserManagerEvents.load"),t.prototype.load.call(this,r),i&&this._userLoaded.raise(r);},e.prototype.unload=function e(){n.Log.debug("UserManagerEvents.unload"),t.prototype.unload.call(this),this._userUnloaded.raise();},e.prototype.addUserLoaded=function t(e){this._userLoaded.addHandler(e);},e.prototype.removeUserLoaded=function t(e){this._userLoaded.removeHandler(e);},e.prototype.addUserUnloaded=function t(e){this._userUnloaded.addHandler(e);},e.prototype.removeUserUnloaded=function t(e){this._userUnloaded.removeHandler(e);},e.prototype.addSilentRenewError=function t(e){this._silentRenewError.addHandler(e);},e.prototype.removeSilentRenewError=function t(e){this._silentRenewError.removeHandler(e);},e.prototype._raiseSilentRenewError=function t(e){n.Log.debug("UserManagerEvents._raiseSilentRenewError",e.message),this._silentRenewError.raise(e);},e.prototype.addUserSignedIn=function t(e){this._userSignedIn.addHandler(e);},e.prototype.removeUserSignedIn=function t(e){this._userSignedIn.removeHandler(e);},e.prototype._raiseUserSignedIn=function t(){n.Log.debug("UserManagerEvents._raiseUserSignedIn"),this._userSignedIn.raise();},e.prototype.addUserSignedOut=function t(e){this._userSignedOut.addHandler(e);},e.prototype.removeUserSignedOut=function t(e){this._userSignedOut.removeHandler(e);},e.prototype._raiseUserSignedOut=function t(){n.Log.debug("UserManagerEvents._raiseUserSignedOut"),this._userSignedOut.raise();},e.prototype.addUserSessionChanged=function t(e){this._userSessionChanged.addHandler(e);},e.prototype.removeUserSessionChanged=function t(e){this._userSessionChanged.removeHandler(e);},e.prototype._raiseUserSessionChanged=function t(){n.Log.debug("UserManagerEvents._raiseUserSessionChanged"),this._userSessionChanged.raise();},e}(i.AccessTokenEvents);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.Timer=void 0;var n=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||false,n.configurable=true,"value"in n&&(n.writable=true),Object.defineProperty(t,n.key,n);}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}(),i=r(0),o=r(1),s=r(17);function a(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function u(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}e.Timer=function(t){function e(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:o.Global.timer,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0;a(this,e);var s=u(this,t.call(this,r));return s._timer=n,s._nowFunc=i||function(){return Date.now()/1e3},s}return function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}(e,t),e.prototype.init=function t(e){e<=0&&(e=1),e=parseInt(e);var r=this.now+e;if(this.expiration===r&&this._timerHandle)i.Log.debug("Timer.init timer "+this._name+" skipping initialization since already initialized for expiration:",this.expiration);else {this.cancel(),i.Log.debug("Timer.init timer "+this._name+" for duration:",e),this._expiration=r;var n=5;e<n&&(n=e),this._timerHandle=this._timer.setInterval(this._callback.bind(this),1e3*n);}},e.prototype.cancel=function t(){this._timerHandle&&(i.Log.debug("Timer.cancel: ",this._name),this._timer.clearInterval(this._timerHandle),this._timerHandle=null);},e.prototype._callback=function e(){var r=this._expiration-this.now;i.Log.debug("Timer.callback; "+this._name+" timer expires in:",r),this._expiration<=this.now&&(this.cancel(),t.prototype.raise.call(this));},n(e,[{key:"now",get:function t(){return parseInt(this._nowFunc())}},{key:"expiration",get:function t(){return this._expiration}}]),e}(s.Event);},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.SilentRenewService=void 0;var n=r(0);e.SilentRenewService=function(){function t(e){!function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._userManager=e;}return t.prototype.start=function t(){this._callback||(this._callback=this._tokenExpiring.bind(this),this._userManager.events.addAccessTokenExpiring(this._callback),this._userManager.getUser().then((function(t){})).catch((function(t){n.Log.error("SilentRenewService.start: Error from getUser:",t.message);})));},t.prototype.stop=function t(){this._callback&&(this._userManager.events.removeAccessTokenExpiring(this._callback),delete this._callback);},t.prototype._tokenExpiring=function t(){var e=this;this._userManager.signinSilent().then((function(t){n.Log.debug("SilentRenewService._tokenExpiring: Silent token renewal successful");}),(function(t){n.Log.error("SilentRenewService._tokenExpiring: Error from signinSilent:",t.message),e._userManager.events._raiseSilentRenewError(t);}));},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.CordovaPopupNavigator=void 0;var n=r(21);e.CordovaPopupNavigator=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.prototype.prepare=function t(e){var r=new n.CordovaPopupWindow(e);return Promise.resolve(r)},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true}),e.CordovaIFrameNavigator=void 0;var n=r(21);e.CordovaIFrameNavigator=function(){function t(){!function e(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,t);}return t.prototype.prepare=function t(e){e.popupWindowFeatures="hidden=yes";var r=new n.CordovaPopupWindow(e);return Promise.resolve(r)},t}();},function(t,e,r){Object.defineProperty(e,"__esModule",{value:true});e.Version="1.11.6";}])}));

/***/ },

/***/ 7
(module) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ },

/***/ 386
(module) {

/**
 * Provides a way to access commonly used namespaces
 *
 * Usage:
 *
 *   ```
 *   const $rdf = require('rdflib'); //or any other RDF/JS-compatible library
 *   const ns = require('solid-namespace')($rdf);
 *   const store = $rdf.graph();
 *
 *   let me = ...;
 *   let name = store.any(me, ns.vcard(‘fn’)) || store.any(me, ns.foaf(‘name’));
 *   ```
 * @module vocab
 */
const aliases = {
  acl: 'http://www.w3.org/ns/auth/acl#',
  arg: 'http://www.w3.org/ns/pim/arg#',
  as: 'https://www.w3.org/ns/activitystreams#',
  bookmark: 'http://www.w3.org/2002/01/bookmark#',
  cal: 'http://www.w3.org/2002/12/cal/ical#',
  cco: 'http://www.ontologyrepository.com/CommonCoreOntologies/',
  cert: 'http://www.w3.org/ns/auth/cert#',
  contact: 'http://www.w3.org/2000/10/swap/pim/contact#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dct: 'http://purl.org/dc/terms/',
  doap: 'http://usefulinc.com/ns/doap#',
  foaf: 'http://xmlns.com/foaf/0.1/',
  geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
  gpx: 'http://www.w3.org/ns/pim/gpx#',
  gr: 'http://purl.org/goodrelations/v1#',
  http: 'http://www.w3.org/2007/ont/http#',
  httph: 'http://www.w3.org/2007/ont/httph#',
  icalTZ: 'http://www.w3.org/2002/12/cal/icaltzd#', // Beware: not cal:
  ldp: 'http://www.w3.org/ns/ldp#',
  link: 'http://www.w3.org/2007/ont/link#',
  log: 'http://www.w3.org/2000/10/swap/log#',
  meeting: 'http://www.w3.org/ns/pim/meeting#',
  mo: 'http://purl.org/ontology/mo/',
  org: 'http://www.w3.org/ns/org#',
  owl: 'http://www.w3.org/2002/07/owl#',
  pad: 'http://www.w3.org/ns/pim/pad#',
  patch: 'http://www.w3.org/ns/pim/patch#',
  prov: 'http://www.w3.org/ns/prov#',
  pto: 'http://www.productontology.org/id/',
  qu: 'http://www.w3.org/2000/10/swap/pim/qif#',
  trip: 'http://www.w3.org/ns/pim/trip#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rss: 'http://purl.org/rss/1.0/',
  sched: 'http://www.w3.org/ns/pim/schedule#',
  schema: 'http://schema.org/', // @@ beware confusion with documents no 303
  sioc: 'http://rdfs.org/sioc/ns#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  solid: 'http://www.w3.org/ns/solid/terms#',
  space: 'http://www.w3.org/ns/pim/space#',
  stat: 'http://www.w3.org/ns/posix/stat#',
  tab: 'http://www.w3.org/2007/ont/link#',
  tabont: 'http://www.w3.org/2007/ont/link#',
  ui: 'http://www.w3.org/ns/ui#',
  vann: 'http://purl.org/vocab/vann/',
  vcard: 'http://www.w3.org/2006/vcard/ns#',
  wf: 'http://www.w3.org/2005/01/wf/flow#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
};

/**
 * @param [rdflib] {RDF} Optional RDF Library (such as rdflib.js or rdf-ext) to inject
 */
function vocab (rdf = { namedNode: u => u }) {
  const namespaces = {};
  for (const alias in aliases) {
    const expansion = aliases[alias];
    namespaces[alias] = function (localName = '') {
      return rdf.namedNode(expansion + localName)
    };
  }
  return namespaces
}
module.exports = vocab;


/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports$1, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports$1, key)) {
/******/ 				Object.defineProperty(exports$1, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/global */
/******/ (() => {
/******/ 	__webpack_require__.g = (function() {
/******/ 		if (typeof globalThis === 'object') return globalThis;
/******/ 		try {
/******/ 			return this || new Function('return this')();
/******/ 		} catch (e) {
/******/ 			if (typeof window === 'object') return window;
/******/ 		}
/******/ 	})();
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ })();
function log(...args) {
    console.log(...args);
}
function warn(...args) {
    console.warn(...args);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
function concat(...buffers) {
    const size = buffers.reduce((acc, { length }) => acc + length, 0);
    const buf = new Uint8Array(size);
    let i = 0;
    for (const buffer of buffers) {
        buf.set(buffer, i);
        i += buffer.length;
    }
    return buf;
}

const encodeBase64 = (input) => {
    let unencoded = input;
    if (typeof unencoded === 'string') {
        unencoded = encoder.encode(unencoded);
    }
    const CHUNK_SIZE = 0x8000;
    const arr = [];
    for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
        arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(''));
};
const encode = (input) => {
    return encodeBase64(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
const decodeBase64 = (encoded) => {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};
const decode = (input) => {
    let encoded = input;
    if (encoded instanceof Uint8Array) {
        encoded = decoder.decode(encoded);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    try {
        return decodeBase64(encoded);
    }
    catch {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
};
class JOSEError extends Error {
    constructor(message, options) {
        super(message, options);
        this.code = 'ERR_JOSE_GENERIC';
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
JOSEError.code = 'ERR_JOSE_GENERIC';
class JWTClaimValidationFailed extends JOSEError {
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified') {
        super(message, { cause: { claim, reason, payload } });
        this.code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
JWTClaimValidationFailed.code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
class JWTExpired extends JOSEError {
    constructor(message, payload, claim = 'unspecified', reason = 'unspecified') {
        super(message, { cause: { claim, reason, payload } });
        this.code = 'ERR_JWT_EXPIRED';
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
    }
}
JWTExpired.code = 'ERR_JWT_EXPIRED';
class JOSEAlgNotAllowed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    }
}
JOSEAlgNotAllowed.code = 'ERR_JOSE_ALG_NOT_ALLOWED';
class JOSENotSupported extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JOSE_NOT_SUPPORTED';
    }
}
JOSENotSupported.code = 'ERR_JOSE_NOT_SUPPORTED';
class JWEDecryptionFailed extends JOSEError {
    constructor(message = 'decryption operation failed', options) {
        super(message, options);
        this.code = 'ERR_JWE_DECRYPTION_FAILED';
    }
}
JWEDecryptionFailed.code = 'ERR_JWE_DECRYPTION_FAILED';
class JWEInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWE_INVALID';
    }
}
JWEInvalid.code = 'ERR_JWE_INVALID';
class JWSInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWS_INVALID';
    }
}
JWSInvalid.code = 'ERR_JWS_INVALID';
class JWTInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWT_INVALID';
    }
}
JWTInvalid.code = 'ERR_JWT_INVALID';
class JWKInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWK_INVALID';
    }
}
JWKInvalid.code = 'ERR_JWK_INVALID';
class JWKSInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_INVALID';
    }
}
JWKSInvalid.code = 'ERR_JWKS_INVALID';
class JWKSNoMatchingKey extends JOSEError {
    constructor(message = 'no applicable key found in the JSON Web Key Set', options) {
        super(message, options);
        this.code = 'ERR_JWKS_NO_MATCHING_KEY';
    }
}
JWKSNoMatchingKey.code = 'ERR_JWKS_NO_MATCHING_KEY';
class JWKSMultipleMatchingKeys extends JOSEError {
    constructor(message = 'multiple matching keys found in the JSON Web Key Set', options) {
        super(message, options);
        this.code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    }
}
JWKSMultipleMatchingKeys.code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
class JWKSTimeout extends JOSEError {
    constructor(message = 'request timed out', options) {
        super(message, options);
        this.code = 'ERR_JWKS_TIMEOUT';
    }
}
JWKSTimeout.code = 'ERR_JWKS_TIMEOUT';
class JWSSignatureVerificationFailed extends JOSEError {
    constructor(message = 'signature verification failed', options) {
        super(message, options);
        this.code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    }
}
JWSSignatureVerificationFailed.code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';

function subtleDsa(alg, algorithm) {
    const hash = `SHA-${alg.slice(-3)}`;
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512':
            return { hash, name: 'HMAC' };
        case 'PS256':
        case 'PS384':
        case 'PS512':
            return { hash, name: 'RSA-PSS', saltLength: alg.slice(-3) >> 3 };
        case 'RS256':
        case 'RS384':
        case 'RS512':
            return { hash, name: 'RSASSA-PKCS1-v1_5' };
        case 'ES256':
        case 'ES384':
        case 'ES512':
            return { hash, name: 'ECDSA', namedCurve: algorithm.namedCurve };
        case 'Ed25519':
            return { name: 'Ed25519' };
        case 'EdDSA':
            return { name: algorithm.name };
        default:
            throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
}
/* harmony default export */ const webcrypto = (crypto);
const isCryptoKey = (key) => key instanceof CryptoKey;
/* harmony default export */ const check_key_length = ((alg, key) => {
    if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== 'number' || modulusLength < 2048) {
            throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
    }
});
function unusable(name, prop = 'algorithm.name') {
    return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
    return algorithm.name === name;
}
function getHashLength(hash) {
    return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
    switch (alg) {
        case 'ES256':
            return 'P-256';
        case 'ES384':
            return 'P-384';
        case 'ES512':
            return 'P-521';
        default:
            throw new Error('unreachable');
    }
}
function checkUsage(key, usages) {
    if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
        let msg = 'CryptoKey does not support this operation, its usages must include ';
        if (usages.length > 2) {
            const last = usages.pop();
            msg += `one of ${usages.join(', ')}, or ${last}.`;
        }
        else if (usages.length === 2) {
            msg += `one of ${usages[0]} or ${usages[1]}.`;
        }
        else {
            msg += `${usages[0]}.`;
        }
        throw new TypeError(msg);
    }
}
function checkSigCryptoKey(key, alg, ...usages) {
    switch (alg) {
        case 'HS256':
        case 'HS384':
        case 'HS512': {
            if (!isAlgorithm(key.algorithm, 'HMAC'))
                throw unusable('HMAC');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'RS256':
        case 'RS384':
        case 'RS512': {
            if (!isAlgorithm(key.algorithm, 'RSASSA-PKCS1-v1_5'))
                throw unusable('RSASSA-PKCS1-v1_5');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'PS256':
        case 'PS384':
        case 'PS512': {
            if (!isAlgorithm(key.algorithm, 'RSA-PSS'))
                throw unusable('RSA-PSS');
            const expected = parseInt(alg.slice(2), 10);
            const actual = getHashLength(key.algorithm.hash);
            if (actual !== expected)
                throw unusable(`SHA-${expected}`, 'algorithm.hash');
            break;
        }
        case 'EdDSA': {
            if (key.algorithm.name !== 'Ed25519' && key.algorithm.name !== 'Ed448') {
                throw unusable('Ed25519 or Ed448');
            }
            break;
        }
        case 'Ed25519': {
            if (!isAlgorithm(key.algorithm, 'Ed25519'))
                throw unusable('Ed25519');
            break;
        }
        case 'ES256':
        case 'ES384':
        case 'ES512': {
            if (!isAlgorithm(key.algorithm, 'ECDSA'))
                throw unusable('ECDSA');
            const expected = getNamedCurve(alg);
            const actual = key.algorithm.namedCurve;
            if (actual !== expected)
                throw unusable(expected, 'algorithm.namedCurve');
            break;
        }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usages);
}
function message(msg, actual, ...types) {
    types = types.filter(Boolean);
    if (types.length > 2) {
        const last = types.pop();
        msg += `one of type ${types.join(', ')}, or ${last}.`;
    }
    else if (types.length === 2) {
        msg += `one of type ${types[0]} or ${types[1]}.`;
    }
    else {
        msg += `of type ${types[0]}.`;
    }
    if (actual == null) {
        msg += ` Received ${actual}`;
    }
    else if (typeof actual === 'function' && actual.name) {
        msg += ` Received function ${actual.name}`;
    }
    else if (typeof actual === 'object' && actual != null) {
        if (actual.constructor?.name) {
            msg += ` Received an instance of ${actual.constructor.name}`;
        }
    }
    return msg;
}
/* harmony default export */ const invalid_key_input = ((actual, ...types) => {
    return message('Key must be ', actual, ...types);
});
function withAlg(alg, actual, ...types) {
    return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}

/* harmony default export */ const is_key_like = ((key) => {
    if (isCryptoKey(key)) {
        return true;
    }
    return key?.[Symbol.toStringTag] === 'KeyObject';
});
const types = ['CryptoKey'];
function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
function isObject(input) {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(input) === null) {
        return true;
    }
    let proto = input;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(input) === proto;
}

function isJWK(key) {
    return isObject(key) && typeof key.kty === 'string';
}
function isPrivateJWK(key) {
    return key.kty !== 'oct' && typeof key.d === 'string';
}
function isPublicJWK(key) {
    return key.kty !== 'oct' && typeof key.d === 'undefined';
}
function isSecretJWK(key) {
    return isJWK(key) && key.kty === 'oct' && typeof key.k === 'string';
}


function subtleMapping(jwk) {
    let algorithm;
    let keyUsages;
    switch (jwk.kty) {
        case 'RSA': {
            switch (jwk.alg) {
                case 'PS256':
                case 'PS384':
                case 'PS512':
                    algorithm = { name: 'RSA-PSS', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'RS256':
                case 'RS384':
                case 'RS512':
                    algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${jwk.alg.slice(-3)}` };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'RSA-OAEP':
                case 'RSA-OAEP-256':
                case 'RSA-OAEP-384':
                case 'RSA-OAEP-512':
                    algorithm = {
                        name: 'RSA-OAEP',
                        hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`,
                    };
                    keyUsages = jwk.d ? ['decrypt', 'unwrapKey'] : ['encrypt', 'wrapKey'];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'EC': {
            switch (jwk.alg) {
                case 'ES256':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ES384':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-384' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ES512':
                    algorithm = { name: 'ECDSA', namedCurve: 'P-521' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ECDH-ES':
                case 'ECDH-ES+A128KW':
                case 'ECDH-ES+A192KW':
                case 'ECDH-ES+A256KW':
                    algorithm = { name: 'ECDH', namedCurve: jwk.crv };
                    keyUsages = jwk.d ? ['deriveBits'] : [];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        case 'OKP': {
            switch (jwk.alg) {
                case 'Ed25519':
                    algorithm = { name: 'Ed25519' };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'EdDSA':
                    algorithm = { name: jwk.crv };
                    keyUsages = jwk.d ? ['sign'] : ['verify'];
                    break;
                case 'ECDH-ES':
                case 'ECDH-ES+A128KW':
                case 'ECDH-ES+A192KW':
                case 'ECDH-ES+A256KW':
                    algorithm = { name: jwk.crv };
                    keyUsages = jwk.d ? ['deriveBits'] : [];
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
            }
            break;
        }
        default:
            throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
    }
    return { algorithm, keyUsages };
}
const parse = async (jwk) => {
    if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
    }
    const { algorithm, keyUsages } = subtleMapping(jwk);
    const rest = [
        algorithm,
        jwk.ext ?? false,
        jwk.key_ops ?? keyUsages,
    ];
    const keyData = { ...jwk };
    delete keyData.alg;
    delete keyData.use;
    return webcrypto.subtle.importKey('jwk', keyData, ...rest);
};
/* harmony default export */ const jwk_to_key = (parse);



const exportKeyValue = (k) => decode(k);
let privCache;
let pubCache;
const isKeyObject = (key) => {
    return key?.[Symbol.toStringTag] === 'KeyObject';
};
const importAndCache = async (cache, key, jwk, alg, freeze = false) => {
    let cached = cache.get(key);
    if (cached?.[alg]) {
        return cached[alg];
    }
    const cryptoKey = await jwk_to_key({ ...jwk, alg });
    if (freeze)
        Object.freeze(key);
    if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
    }
    else {
        cached[alg] = cryptoKey;
    }
    return cryptoKey;
};
const normalizePublicKey = (key, alg) => {
    if (isKeyObject(key)) {
        let jwk = key.export({ format: 'jwk' });
        delete jwk.d;
        delete jwk.dp;
        delete jwk.dq;
        delete jwk.p;
        delete jwk.q;
        delete jwk.qi;
        if (jwk.k) {
            return exportKeyValue(jwk.k);
        }
        pubCache || (pubCache = new WeakMap());
        return importAndCache(pubCache, key, jwk, alg);
    }
    if (isJWK(key)) {
        if (key.k)
            return decode(key.k);
        pubCache || (pubCache = new WeakMap());
        const cryptoKey = importAndCache(pubCache, key, key, alg, true);
        return cryptoKey;
    }
    return key;
};
const normalizePrivateKey = (key, alg) => {
    if (isKeyObject(key)) {
        let jwk = key.export({ format: 'jwk' });
        if (jwk.k) {
            return exportKeyValue(jwk.k);
        }
        privCache || (privCache = new WeakMap());
        return importAndCache(privCache, key, jwk, alg);
    }
    if (isJWK(key)) {
        if (key.k)
            return decode(key.k);
        privCache || (privCache = new WeakMap());
        const cryptoKey = importAndCache(privCache, key, key, alg, true);
        return cryptoKey;
    }
    return key;
};
/* harmony default export */ const normalize_key = ({ normalizePublicKey, normalizePrivateKey });





async function getCryptoKey(alg, key, usage) {
    if (usage === 'sign') {
        key = await normalize_key.normalizePrivateKey(key, alg);
    }
    if (usage === 'verify') {
        key = await normalize_key.normalizePublicKey(key, alg);
    }
    if (isCryptoKey(key)) {
        checkSigCryptoKey(key, alg, usage);
        return key;
    }
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError(invalid_key_input(key, ...types));
        }
        return webcrypto.subtle.importKey('raw', key, { hash: `SHA-${alg.slice(-3)}`, name: 'HMAC' }, false, [usage]);
    }
    throw new TypeError(invalid_key_input(key, ...types, 'Uint8Array', 'JSON Web Key'));
}




const verify = async (alg, key, signature, data) => {
    const cryptoKey = await getCryptoKey(alg, key, 'verify');
    check_key_length(alg, cryptoKey);
    const algorithm = subtleDsa(alg, cryptoKey.algorithm);
    try {
        return await webcrypto.subtle.verify(algorithm, cryptoKey, signature, data);
    }
    catch {
        return false;
    }
};
/* harmony default export */ const runtime_verify = (verify);
const isDisjoint = (...headers) => {
    const sources = headers.filter(Boolean);
    if (sources.length === 0 || sources.length === 1) {
        return true;
    }
    let acc;
    for (const header of sources) {
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
            acc = new Set(parameters);
            continue;
        }
        for (const parameter of parameters) {
            if (acc.has(parameter)) {
                return false;
            }
            acc.add(parameter);
        }
    }
    return true;
};
/* harmony default export */ const is_disjoint = (isDisjoint);



const tag = (key) => key?.[Symbol.toStringTag];
const jwkMatchesOp = (alg, key, usage) => {
    if (key.use !== undefined && key.use !== 'sig') {
        throw new TypeError('Invalid key for this operation, when present its use must be sig');
    }
    if (key.key_ops !== undefined && key.key_ops.includes?.(usage) !== true) {
        throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
    }
    if (key.alg !== undefined && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
    }
    return true;
};
const symmetricTypeCheck = (alg, key, usage, allowJwk) => {
    if (key instanceof Uint8Array)
        return;
    if (allowJwk && isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
            return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
    }
    if (!is_key_like(key)) {
        throw new TypeError(withAlg(alg, key, ...types, 'Uint8Array', allowJwk ? 'JSON Web Key' : null));
    }
    if (key.type !== 'secret') {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
    }
};
const asymmetricTypeCheck = (alg, key, usage, allowJwk) => {
    if (allowJwk && isJWK(key)) {
        switch (usage) {
            case 'sign':
                if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
                    return;
                throw new TypeError(`JSON Web Key for this operation be a private JWK`);
            case 'verify':
                if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
                    return;
                throw new TypeError(`JSON Web Key for this operation be a public JWK`);
        }
    }
    if (!is_key_like(key)) {
        throw new TypeError(withAlg(alg, key, ...types, allowJwk ? 'JSON Web Key' : null));
    }
    if (key.type === 'secret') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
    }
    if (usage === 'sign' && key.type === 'public') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
    }
    if (usage === 'decrypt' && key.type === 'public') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
    }
    if (key.algorithm && usage === 'verify' && key.type === 'private') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
    }
    if (key.algorithm && usage === 'encrypt' && key.type === 'private') {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
    }
};
function checkKeyType(allowJwk, alg, key, usage) {
    const symmetric = alg.startsWith('HS') ||
        alg === 'dir' ||
        alg.startsWith('PBES2') ||
        /^A\d{3}(?:GCM)?KW$/.test(alg);
    if (symmetric) {
        symmetricTypeCheck(alg, key, usage, allowJwk);
    }
    else {
        asymmetricTypeCheck(alg, key, usage, allowJwk);
    }
}
/* harmony default export */ (checkKeyType.bind(undefined, false));
const checkKeyTypeWithJwk = checkKeyType.bind(undefined, true);

function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
    if (joseHeader.crit !== undefined && protectedHeader?.crit === undefined) {
        throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === undefined) {
        return new Set();
    }
    if (!Array.isArray(protectedHeader.crit) ||
        protectedHeader.crit.length === 0 ||
        protectedHeader.crit.some((input) => typeof input !== 'string' || input.length === 0)) {
        throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== undefined) {
        recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
    }
    else {
        recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit) {
        if (!recognized.has(parameter)) {
            throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
        }
        if (joseHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" is missing`);
        }
        if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
            throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
        }
    }
    return new Set(protectedHeader.crit);
}
/* harmony default export */ const validate_crit = (validateCrit);
const validateAlgorithms = (option, algorithms) => {
    if (algorithms !== undefined &&
        (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== 'string'))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
    }
    if (!algorithms) {
        return undefined;
    }
    return new Set(algorithms);
};
/* harmony default export */ const validate_algorithms = (validateAlgorithms);
async function importJWK(jwk, alg) {
    if (!isObject(jwk)) {
        throw new TypeError('JWK must be an object');
    }
    alg || (alg = jwk.alg);
    switch (jwk.kty) {
        case 'oct':
            if (typeof jwk.k !== 'string' || !jwk.k) {
                throw new TypeError('missing "k" (Key Value) Parameter value');
            }
            return decode(jwk.k);
        case 'RSA':
            if ('oth' in jwk && jwk.oth !== undefined) {
                throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            }
        case 'EC':
        case 'OKP':
            return jwk_to_key({ ...jwk, alg });
        default:
            throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
    }
}











async function flattenedVerify(jws, key, options) {
    if (!isObject(jws)) {
        throw new JWSInvalid('Flattened JWS must be an object');
    }
    if (jws.protected === undefined && jws.header === undefined) {
        throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== undefined && typeof jws.protected !== 'string') {
        throw new JWSInvalid('JWS Protected Header incorrect type');
    }
    if (jws.payload === undefined) {
        throw new JWSInvalid('JWS Payload missing');
    }
    if (typeof jws.signature !== 'string') {
        throw new JWSInvalid('JWS Signature missing or incorrect type');
    }
    if (jws.header !== undefined && !isObject(jws.header)) {
        throw new JWSInvalid('JWS Unprotected Header incorrect type');
    }
    let parsedProt = {};
    if (jws.protected) {
        try {
            const protectedHeader = decode(jws.protected);
            parsedProt = JSON.parse(decoder.decode(protectedHeader));
        }
        catch {
            throw new JWSInvalid('JWS Protected Header is invalid');
        }
    }
    if (!is_disjoint(parsedProt, jws.header)) {
        throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header,
    };
    const extensions = validate_crit(JWSInvalid, new Map([['b64', true]]), options?.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has('b64')) {
        b64 = parsedProt.b64;
        if (typeof b64 !== 'boolean') {
            throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
    }
    const { alg } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && validate_algorithms('algorithms', options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
        throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
    }
    if (b64) {
        if (typeof jws.payload !== 'string') {
            throw new JWSInvalid('JWS Payload must be a string');
        }
    }
    else if (typeof jws.payload !== 'string' && !(jws.payload instanceof Uint8Array)) {
        throw new JWSInvalid('JWS Payload must be a string or an Uint8Array instance');
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jws);
        resolvedKey = true;
        checkKeyTypeWithJwk(alg, key, 'verify');
        if (isJWK(key)) {
            key = await importJWK(key, alg);
        }
    }
    else {
        checkKeyTypeWithJwk(alg, key, 'verify');
    }
    const data = concat(encoder.encode(jws.protected ?? ''), encoder.encode('.'), typeof jws.payload === 'string' ? encoder.encode(jws.payload) : jws.payload);
    let signature;
    try {
        signature = decode(jws.signature);
    }
    catch {
        throw new JWSInvalid('Failed to base64url decode the signature');
    }
    const verified = await runtime_verify(alg, key, signature, data);
    if (!verified) {
        throw new JWSSignatureVerificationFailed();
    }
    let payload;
    if (b64) {
        try {
            payload = decode(jws.payload);
        }
        catch {
            throw new JWSInvalid('Failed to base64url decode the payload');
        }
    }
    else if (typeof jws.payload === 'string') {
        payload = encoder.encode(jws.payload);
    }
    else {
        payload = jws.payload;
    }
    const result = { payload };
    if (jws.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jws.header !== undefined) {
        result.unprotectedHeader = jws.header;
    }
    if (resolvedKey) {
        return { ...result, key };
    }
    return result;
}



async function compactVerify(jws, key, options) {
    if (jws instanceof Uint8Array) {
        jws = decoder.decode(jws);
    }
    if (typeof jws !== 'string') {
        throw new JWSInvalid('Compact JWS must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split('.');
    if (length !== 3) {
        throw new JWSInvalid('Invalid Compact JWS');
    }
    const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
    const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}
/* harmony default export */ const epoch = ((date) => Math.floor(date.getTime() / 1000));
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
/* harmony default export */ const secs = ((str) => {
    const matched = REGEX.exec(str);
    if (!matched || (matched[4] && matched[1])) {
        throw new TypeError('Invalid time period format');
    }
    const value = parseFloat(matched[2]);
    const unit = matched[3].toLowerCase();
    let numericDate;
    switch (unit) {
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
        case 's':
            numericDate = Math.round(value);
            break;
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
            numericDate = Math.round(value * minute);
            break;
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
            numericDate = Math.round(value * hour);
            break;
        case 'day':
        case 'days':
        case 'd':
            numericDate = Math.round(value * day);
            break;
        case 'week':
        case 'weeks':
        case 'w':
            numericDate = Math.round(value * week);
            break;
        default:
            numericDate = Math.round(value * year);
            break;
    }
    if (matched[1] === '-' || matched[4] === 'ago') {
        return -numericDate;
    }
    return numericDate;
});





const normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, '');
const checkAudiencePresence = (audPayload, audOption) => {
    if (typeof audPayload === 'string') {
        return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
};
/* harmony default export */ const jwt_claims_set = ((protectedHeader, encodedPayload, options = {}) => {
    let payload;
    try {
        payload = JSON.parse(decoder.decode(encodedPayload));
    }
    catch {
    }
    if (!isObject(payload)) {
        throw new JWTInvalid('JWT Claims Set must be a top-level JSON object');
    }
    const { typ } = options;
    if (typ &&
        (typeof protectedHeader.typ !== 'string' ||
            normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, 'typ', 'check_failed');
    }
    const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
    const presenceCheck = [...requiredClaims];
    if (maxTokenAge !== undefined)
        presenceCheck.push('iat');
    if (audience !== undefined)
        presenceCheck.push('aud');
    if (subject !== undefined)
        presenceCheck.push('sub');
    if (issuer !== undefined)
        presenceCheck.push('iss');
    for (const claim of new Set(presenceCheck.reverse())) {
        if (!(claim in payload)) {
            throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, 'missing');
        }
    }
    if (issuer &&
        !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
        throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, 'iss', 'check_failed');
    }
    if (subject && payload.sub !== subject) {
        throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, 'sub', 'check_failed');
    }
    if (audience &&
        !checkAudiencePresence(payload.aud, typeof audience === 'string' ? [audience] : audience)) {
        throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, 'aud', 'check_failed');
    }
    let tolerance;
    switch (typeof options.clockTolerance) {
        case 'string':
            tolerance = secs(options.clockTolerance);
            break;
        case 'number':
            tolerance = options.clockTolerance;
            break;
        case 'undefined':
            tolerance = 0;
            break;
        default:
            throw new TypeError('Invalid clockTolerance option type');
    }
    const { currentDate } = options;
    const now = epoch(currentDate || new Date());
    if ((payload.iat !== undefined || maxTokenAge) && typeof payload.iat !== 'number') {
        throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, 'iat', 'invalid');
    }
    if (payload.nbf !== undefined) {
        if (typeof payload.nbf !== 'number') {
            throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, 'nbf', 'invalid');
        }
        if (payload.nbf > now + tolerance) {
            throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, 'nbf', 'check_failed');
        }
    }
    if (payload.exp !== undefined) {
        if (typeof payload.exp !== 'number') {
            throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, 'exp', 'invalid');
        }
        if (payload.exp <= now - tolerance) {
            throw new JWTExpired('"exp" claim timestamp check failed', payload, 'exp', 'check_failed');
        }
    }
    if (maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === 'number' ? maxTokenAge : secs(maxTokenAge);
        if (age - tolerance > max) {
            throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, 'iat', 'check_failed');
        }
        if (age < 0 - tolerance) {
            throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, 'iat', 'check_failed');
        }
    }
    return payload;
});



async function jwtVerify(jwt, key, options) {
    const verified = await compactVerify(jwt, key, options);
    if (verified.protectedHeader.crit?.includes('b64') && verified.protectedHeader.b64 === false) {
        throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
    }
    const payload = jwt_claims_set(verified.protectedHeader, verified.payload, options);
    const result = { payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}

const fetchJwks = async (url, timeout, options) => {
    let controller;
    let id;
    let timedOut = false;
    if (typeof AbortController === 'function') {
        controller = new AbortController();
        id = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, timeout);
    }
    const response = await fetch(url.href, {
        signal: controller ? controller.signal : undefined,
        redirect: 'manual',
        headers: options.headers,
    }).catch((err) => {
        if (timedOut)
            throw new JWKSTimeout();
        throw err;
    });
    if (id !== undefined)
        clearTimeout(id);
    if (response.status !== 200) {
        throw new JOSEError('Expected 200 OK from the JSON Web Key Set HTTP response');
    }
    try {
        return await response.json();
    }
    catch {
        throw new JOSEError('Failed to parse the JSON Web Key Set HTTP response as JSON');
    }
};
/* harmony default export */ const fetch_jwks = (fetchJwks);



function getKtyFromAlg(alg) {
    switch (typeof alg === 'string' && alg.slice(0, 2)) {
        case 'RS':
        case 'PS':
            return 'RSA';
        case 'ES':
            return 'EC';
        case 'Ed':
            return 'OKP';
        default:
            throw new JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
    }
}
function isJWKSLike(jwks) {
    return (jwks &&
        typeof jwks === 'object' &&
        Array.isArray(jwks.keys) &&
        jwks.keys.every(isJWKLike));
}
function isJWKLike(key) {
    return isObject(key);
}
function clone(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}
class LocalJWKSet {
    constructor(jwks) {
        this._cached = new WeakMap();
        if (!isJWKSLike(jwks)) {
            throw new JWKSInvalid('JSON Web Key Set malformed');
        }
        this._jwks = clone(jwks);
    }
    async getKey(protectedHeader, token) {
        const { alg, kid } = { ...protectedHeader, ...token?.header };
        const kty = getKtyFromAlg(alg);
        const candidates = this._jwks.keys.filter((jwk) => {
            let candidate = kty === jwk.kty;
            if (candidate && typeof kid === 'string') {
                candidate = kid === jwk.kid;
            }
            if (candidate && typeof jwk.alg === 'string') {
                candidate = alg === jwk.alg;
            }
            if (candidate && typeof jwk.use === 'string') {
                candidate = jwk.use === 'sig';
            }
            if (candidate && Array.isArray(jwk.key_ops)) {
                candidate = jwk.key_ops.includes('verify');
            }
            if (candidate) {
                switch (alg) {
                    case 'ES256':
                        candidate = jwk.crv === 'P-256';
                        break;
                    case 'ES256K':
                        candidate = jwk.crv === 'secp256k1';
                        break;
                    case 'ES384':
                        candidate = jwk.crv === 'P-384';
                        break;
                    case 'ES512':
                        candidate = jwk.crv === 'P-521';
                        break;
                    case 'Ed25519':
                        candidate = jwk.crv === 'Ed25519';
                        break;
                    case 'EdDSA':
                        candidate = jwk.crv === 'Ed25519' || jwk.crv === 'Ed448';
                        break;
                }
            }
            return candidate;
        });
        const { 0: jwk, length } = candidates;
        if (length === 0) {
            throw new JWKSNoMatchingKey();
        }
        if (length !== 1) {
            const error = new JWKSMultipleMatchingKeys();
            const { _cached } = this;
            error[Symbol.asyncIterator] = async function* () {
                for (const jwk of candidates) {
                    try {
                        yield await importWithAlgCache(_cached, jwk, alg);
                    }
                    catch { }
                }
            };
            throw error;
        }
        return importWithAlgCache(this._cached, jwk, alg);
    }
}
async function importWithAlgCache(cache, jwk, alg) {
    const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk);
    if (cached[alg] === undefined) {
        const key = await importJWK({ ...jwk, ext: true }, alg);
        if (key instanceof Uint8Array || key.type !== 'public') {
            throw new JWKSInvalid('JSON Web Key Set members must be public keys');
        }
        cached[alg] = key;
    }
    return cached[alg];
}
function createLocalJWKSet(jwks) {
    const set = new LocalJWKSet(jwks);
    const localJWKSet = async (protectedHeader, token) => set.getKey(protectedHeader, token);
    Object.defineProperties(localJWKSet, {
        jwks: {
            value: () => clone(set._jwks),
            enumerable: true,
            configurable: false,
            writable: false,
        },
    });
    return localJWKSet;
}




function isCloudflareWorkers() {
    return (typeof WebSocketPair !== 'undefined' ||
        (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers') ||
        (typeof EdgeRuntime !== 'undefined' && EdgeRuntime === 'vercel'));
}
let USER_AGENT;
if (typeof navigator === 'undefined' || !navigator.userAgent?.startsWith?.('Mozilla/5.0 ')) {
    const NAME = 'jose';
    const VERSION = 'v5.10.0';
    USER_AGENT = `${NAME}/${VERSION}`;
}
const jwksCache = Symbol();
function isFreshJwksCache(input, cacheMaxAge) {
    if (typeof input !== 'object' || input === null) {
        return false;
    }
    if (!('uat' in input) || typeof input.uat !== 'number' || Date.now() - input.uat >= cacheMaxAge) {
        return false;
    }
    if (!('jwks' in input) ||
        !isObject(input.jwks) ||
        !Array.isArray(input.jwks.keys) ||
        !Array.prototype.every.call(input.jwks.keys, isObject)) {
        return false;
    }
    return true;
}
class RemoteJWKSet {
    constructor(url, options) {
        if (!(url instanceof URL)) {
            throw new TypeError('url must be an instance of URL');
        }
        this._url = new URL(url.href);
        this._options = { agent: options?.agent, headers: options?.headers };
        this._timeoutDuration =
            typeof options?.timeoutDuration === 'number' ? options?.timeoutDuration : 5000;
        this._cooldownDuration =
            typeof options?.cooldownDuration === 'number' ? options?.cooldownDuration : 30000;
        this._cacheMaxAge = typeof options?.cacheMaxAge === 'number' ? options?.cacheMaxAge : 600000;
        if (options?.[jwksCache] !== undefined) {
            this._cache = options?.[jwksCache];
            if (isFreshJwksCache(options?.[jwksCache], this._cacheMaxAge)) {
                this._jwksTimestamp = this._cache.uat;
                this._local = createLocalJWKSet(this._cache.jwks);
            }
        }
    }
    coolingDown() {
        return typeof this._jwksTimestamp === 'number'
            ? Date.now() < this._jwksTimestamp + this._cooldownDuration
            : false;
    }
    fresh() {
        return typeof this._jwksTimestamp === 'number'
            ? Date.now() < this._jwksTimestamp + this._cacheMaxAge
            : false;
    }
    async getKey(protectedHeader, token) {
        if (!this._local || !this.fresh()) {
            await this.reload();
        }
        try {
            return await this._local(protectedHeader, token);
        }
        catch (err) {
            if (err instanceof JWKSNoMatchingKey) {
                if (this.coolingDown() === false) {
                    await this.reload();
                    return this._local(protectedHeader, token);
                }
            }
            throw err;
        }
    }
    async reload() {
        if (this._pendingFetch && isCloudflareWorkers()) {
            this._pendingFetch = undefined;
        }
        const headers = new Headers(this._options.headers);
        if (USER_AGENT && !headers.has('User-Agent')) {
            headers.set('User-Agent', USER_AGENT);
            this._options.headers = Object.fromEntries(headers.entries());
        }
        this._pendingFetch || (this._pendingFetch = fetch_jwks(this._url, this._timeoutDuration, this._options)
            .then((json) => {
            this._local = createLocalJWKSet(json);
            if (this._cache) {
                this._cache.uat = Date.now();
                this._cache.jwks = json;
            }
            this._jwksTimestamp = Date.now();
            this._pendingFetch = undefined;
        })
            .catch((err) => {
            this._pendingFetch = undefined;
            throw err;
        }));
        await this._pendingFetch;
    }
}
function createRemoteJWKSet(url, options) {
    const set = new RemoteJWKSet(url, options);
    const remoteJWKSet = async (protectedHeader, token) => set.getKey(protectedHeader, token);
    Object.defineProperties(remoteJWKSet, {
        coolingDown: {
            get: () => set.coolingDown(),
            enumerable: true,
            configurable: false,
        },
        fresh: {
            get: () => set.fresh(),
            enumerable: true,
            configurable: false,
        },
        reload: {
            value: () => set.reload(),
            enumerable: true,
            configurable: false,
            writable: false,
        },
        reloading: {
            get: () => !!set._pendingFetch,
            enumerable: true,
            configurable: false,
        },
        jwks: {
            value: () => set._local?.jwks(),
            enumerable: true,
            configurable: false,
            writable: false,
        },
    });
    return remoteJWKSet;
}




const keyToJWK = async (key) => {
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: encode(key),
        };
    }
    if (!isCryptoKey(key)) {
        throw new TypeError(invalid_key_input(key, ...types, 'Uint8Array'));
    }
    if (!key.extractable) {
        throw new TypeError('non-extractable CryptoKey cannot be exported as a JWK');
    }
    const { ext, key_ops, alg, use, ...jwk } = await webcrypto.subtle.exportKey('jwk', key);
    return jwk;
};
/* harmony default export */ const key_to_jwk = (keyToJWK);
async function exportJWK(key) {
    return key_to_jwk(key);
}




const sign = async (alg, key, data) => {
    const cryptoKey = await getCryptoKey(alg, key, 'sign');
    check_key_length(alg, cryptoKey);
    const signature = await webcrypto.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
    return new Uint8Array(signature);
};
/* harmony default export */ const runtime_sign = (sign);







class FlattenedSign {
    constructor(payload) {
        if (!(payload instanceof Uint8Array)) {
            throw new TypeError('payload must be an instance of Uint8Array');
        }
        this._payload = payload;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
    }
    async sign(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader) {
            throw new JWSInvalid('either setProtectedHeader or setUnprotectedHeader must be called before #sign()');
        }
        if (!is_disjoint(this._protectedHeader, this._unprotectedHeader)) {
            throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader,
        };
        const extensions = validate_crit(JWSInvalid, new Map([['b64', true]]), options?.crit, this._protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has('b64')) {
            b64 = this._protectedHeader.b64;
            if (typeof b64 !== 'boolean') {
                throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
            }
        }
        const { alg } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        checkKeyTypeWithJwk(alg, key, 'sign');
        let payload = this._payload;
        if (b64) {
            payload = encoder.encode(encode(payload));
        }
        let protectedHeader;
        if (this._protectedHeader) {
            protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
        }
        else {
            protectedHeader = encoder.encode('');
        }
        const data = concat(protectedHeader, encoder.encode('.'), payload);
        const signature = await runtime_sign(alg, key, data);
        const jws = {
            signature: encode(signature),
            payload: '',
        };
        if (b64) {
            jws.payload = decoder.decode(payload);
        }
        if (this._unprotectedHeader) {
            jws.header = this._unprotectedHeader;
        }
        if (this._protectedHeader) {
            jws.protected = decoder.decode(protectedHeader);
        }
        return jws;
    }
}

class CompactSign {
    constructor(payload) {
        this._flattened = new FlattenedSign(payload);
    }
    setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    async sign(key, options) {
        const jws = await this._flattened.sign(key, options);
        if (jws.payload === undefined) {
            throw new TypeError('use the flattened module for creating JWS with b64: false');
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
    }
}



function validateInput(label, input) {
    if (!Number.isFinite(input)) {
        throw new TypeError(`Invalid ${label} input`);
    }
    return input;
}
class ProduceJWT {
    constructor(payload = {}) {
        if (!isObject(payload)) {
            throw new TypeError('JWT Claims Set MUST be an object');
        }
        this._payload = payload;
    }
    setIssuer(issuer) {
        this._payload = { ...this._payload, iss: issuer };
        return this;
    }
    setSubject(subject) {
        this._payload = { ...this._payload, sub: subject };
        return this;
    }
    setAudience(audience) {
        this._payload = { ...this._payload, aud: audience };
        return this;
    }
    setJti(jwtId) {
        this._payload = { ...this._payload, jti: jwtId };
        return this;
    }
    setNotBefore(input) {
        if (typeof input === 'number') {
            this._payload = { ...this._payload, nbf: validateInput('setNotBefore', input) };
        }
        else if (input instanceof Date) {
            this._payload = { ...this._payload, nbf: validateInput('setNotBefore', epoch(input)) };
        }
        else {
            this._payload = { ...this._payload, nbf: epoch(new Date()) + secs(input) };
        }
        return this;
    }
    setExpirationTime(input) {
        if (typeof input === 'number') {
            this._payload = { ...this._payload, exp: validateInput('setExpirationTime', input) };
        }
        else if (input instanceof Date) {
            this._payload = { ...this._payload, exp: validateInput('setExpirationTime', epoch(input)) };
        }
        else {
            this._payload = { ...this._payload, exp: epoch(new Date()) + secs(input) };
        }
        return this;
    }
    setIssuedAt(input) {
        if (typeof input === 'undefined') {
            this._payload = { ...this._payload, iat: epoch(new Date()) };
        }
        else if (input instanceof Date) {
            this._payload = { ...this._payload, iat: validateInput('setIssuedAt', epoch(input)) };
        }
        else if (typeof input === 'string') {
            this._payload = {
                ...this._payload,
                iat: validateInput('setIssuedAt', epoch(new Date()) + secs(input)),
            };
        }
        else {
            this._payload = { ...this._payload, iat: validateInput('setIssuedAt', input) };
        }
        return this;
    }
}




class SignJWT extends ProduceJWT {
    setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
    }
    async sign(key, options) {
        const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (Array.isArray(this._protectedHeader?.crit) &&
            this._protectedHeader.crit.includes('b64') &&
            this._protectedHeader.b64 === false) {
            throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
        }
        return sig.sign(key, options);
    }
}
function getModulusLengthOption(options) {
    const modulusLength = options?.modulusLength ?? 2048;
    if (typeof modulusLength !== 'number' || modulusLength < 2048) {
        throw new JOSENotSupported('Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used');
    }
    return modulusLength;
}
async function generateKeyPair(alg, options) {
    let algorithm;
    let keyUsages;
    switch (alg) {
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = {
                name: 'RSA-PSS',
                hash: `SHA-${alg.slice(-3)}`,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                modulusLength: getModulusLengthOption(options),
            };
            keyUsages = ['sign', 'verify'];
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = {
                name: 'RSASSA-PKCS1-v1_5',
                hash: `SHA-${alg.slice(-3)}`,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                modulusLength: getModulusLengthOption(options),
            };
            keyUsages = ['sign', 'verify'];
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            algorithm = {
                name: 'RSA-OAEP',
                hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                modulusLength: getModulusLengthOption(options),
            };
            keyUsages = ['decrypt', 'unwrapKey', 'encrypt', 'wrapKey'];
            break;
        case 'ES256':
            algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'ES384':
            algorithm = { name: 'ECDSA', namedCurve: 'P-384' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'ES512':
            algorithm = { name: 'ECDSA', namedCurve: 'P-521' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'Ed25519':
            algorithm = { name: 'Ed25519' };
            keyUsages = ['sign', 'verify'];
            break;
        case 'EdDSA': {
            keyUsages = ['sign', 'verify'];
            const crv = 'Ed25519';
            switch (crv) {
                case 'Ed25519':
                case 'Ed448':
                    algorithm = { name: crv };
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported crv option provided');
            }
            break;
        }
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW': {
            keyUsages = ['deriveKey', 'deriveBits'];
            const crv = 'P-256';
            switch (crv) {
                case 'P-256':
                case 'P-384':
                case 'P-521': {
                    algorithm = { name: 'ECDH', namedCurve: crv };
                    break;
                }
                case 'X25519':
                case 'X448':
                    algorithm = { name: crv };
                    break;
                default:
                    throw new JOSENotSupported('Invalid or unsupported crv option provided, supported values are P-256, P-384, P-521, X25519, and X448');
            }
            break;
        }
        default:
            throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
    }
    return webcrypto.subtle.generateKey(algorithm, false, keyUsages);
}

async function generate_key_pair_generateKeyPair(alg, options) {
    return generateKeyPair(alg, options);
}
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const esm_browser_native = ({ randomUUID });
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
    if (!getRandomValues) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
}

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}



function v4(options, buf, offset) {
    if (esm_browser_native.randomUUID && !buf && !options) {
        return esm_browser_native.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return unsafeStringify(rnds);
}
/* harmony default export */ const esm_browser_v4 = (v4);



//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * Intended to be used by dependent packages as a common prefix for keys into
 * storage mechanisms (so as to group all keys related to Solid Client Authn
 * within those storage mechanisms, e.g., window.localStorage).
 */
const SOLID_CLIENT_AUTHN_KEY_PREFIX = "solidClientAuthn:";
/**
 * Ordered list of signature algorithms, from most preferred to least preferred.
 */
const PREFERRED_SIGNING_ALG = ["ES256", "RS256"];
const EVENTS = {
    // Note that an `error` events MUST be listened to: https://nodejs.org/dist/latest-v16.x/docs/api/events.html#error-events.
    ERROR: "error",
    LOGIN: "login",
    LOGOUT: "logout",
    NEW_REFRESH_TOKEN: "newRefreshToken",
    NEW_TOKENS: "newTokens",
    AUTHORIZATION_REQUEST: "authorizationRequest",
    SESSION_EXPIRED: "sessionExpired",
    SESSION_EXTENDED: "sessionExtended",
    SESSION_RESTORED: "sessionRestore",
    TIMEOUT_SET: "timeoutSet",
};
/**
 * We want to refresh a token 5 seconds before it expires.
 */
const REFRESH_BEFORE_EXPIRATION_SECONDS = 5;
// The openid scope requests an OIDC ID token token to be returned.
const SCOPE_OPENID = "openid";
// The offline_access scope requests a refresh token to be returned.
const SCOPE_OFFLINE = "offline_access";
// The webid scope is required as per https://solid.github.io/solid-oidc/#webid-scope
const SCOPE_WEBID = "webid";
const DEFAULT_SCOPES = [SCOPE_OPENID, SCOPE_OFFLINE, SCOPE_WEBID];

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class AggregateHandler {
    handleables;
    constructor(handleables) {
        this.handleables = handleables;
        this.handleables = handleables;
    }
    /**
     * Helper function that will asynchronously determine the proper handler to use. If multiple
     * handlers can handle, it will choose the first one in the list
     * @param params Paramerters to feed to the handler
     */
    async getProperHandler(params) {
        // TODO : This function doesn't currently operate as described. Tests need to be written
        // return new Promise<IHandleable<P, R> | null>((resolve, reject) => {
        //  const resolvedValues: Array<boolean | null> = Array(this.handleables.length).map(() => null)
        //   let numberResolved = 0
        //   this.handleables.forEach(async (handleable: IHandleable<P, R>, index: number) => {
        //     resolvedValues[index] = await handleable.canHandle(...params)
        //     numberResolved++
        //     let curResolvedValueIndex = 0
        //     while (
        //       resolvedValues[curResolvedValueIndex] !== null ||
        //       resolvedValues[curResolvedValueIndex] !== undefined
        //     ) {
        //       if (resolvedValues[curResolvedValueIndex]) {
        //         resolve(this.handleables[curResolvedValueIndex])
        //       }
        //       curResolvedValueIndex++
        //     }
        //   })
        // })
        const canHandleList = await Promise.all(this.handleables.map((handleable) => handleable.canHandle(...params)));
        for (let i = 0; i < canHandleList.length; i += 1) {
            if (canHandleList[i]) {
                return this.handleables[i];
            }
        }
        return null;
    }
    async canHandle(...params) {
        return (await this.getProperHandler(params)) !== null;
    }
    async handle(...params) {
        const handler = await this.getProperHandler(params);
        if (handler) {
            return handler.handle(...params);
        }
        throw new Error(`[${this.constructor.name}] cannot find a suitable handler for: ${params
            .map((param) => {
            try {
                return JSON.stringify(param);
            }
            catch (err) {
                /* eslint-disable  @typescript-eslint/no-explicit-any */
                return param.toString();
            }
        })
            .join(", ")}`);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * Extract a WebID and the clientID from an ID token payload based on https://github.com/solid/webid-oidc-spec.
 * Note that this does not yet implement the user endpoint lookup, and only checks
 * for `webid`, `azp` or IRI-like `sub` claims.
 *
 * @param idToken the payload of the ID token from which the WebID can be extracted.
 * @returns an object with entries webId and clientId extracted from the ID token.
 * @internal
 */
async function getWebidFromTokenPayload(idToken, jwksIri, issuerIri, clientId) {
    let payload;
    let clientIdInPayload;
    try {
        const { payload: verifiedPayload } = await jwtVerify(idToken, createRemoteJWKSet(new URL(jwksIri)), {
            issuer: issuerIri,
            audience: clientId,
        });
        payload = verifiedPayload;
    }
    catch (e) {
        throw new Error(`Token verification failed: ${e.stack}`);
    }
    if (typeof payload.azp === "string") {
        clientIdInPayload = payload.azp;
    }
    if (typeof payload.webid === "string") {
        return {
            webId: payload.webid,
            clientId: clientIdInPayload,
        };
    }
    if (typeof payload.sub !== "string") {
        throw new Error(`The token ${JSON.stringify(payload)} is invalid: it has no 'webid' claim and no 'sub' claim.`);
    }
    try {
        // This parses the 'sub' claim to check if it is a well-formed IRI.
        // However, the normalized value isn't returned to make sure the WebID is returned
        // as specified by the Identity Provider.
        // eslint-disable-next-line no-new
        new URL(payload.sub);
        return {
            webId: payload.sub,
            clientId: clientIdInPayload,
        };
    }
    catch (e) {
        throw new Error(`The token has no 'webid' claim, and its 'sub' claim of [${payload.sub}] is invalid as a URL - error [${e}].`);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
function normalizeScopes(scopes) {
    if (!Array.isArray(scopes)) {
        return DEFAULT_SCOPES;
    }
    return Array.from(
    // De-dupe potentia conflicts if any.
    new Set([
        ...DEFAULT_SCOPES,
        ...scopes.filter(
        // Remove user-provided scopes that are not strings or include spaces.
        (scope) => typeof scope === "string" && !scope.includes(" ")),
    ]));
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
function isValidRedirectUrl(redirectUrl) {
    // If the redirect URL is not a valid URL, an error will be thrown.
    try {
        const urlObject = new URL(redirectUrl);
        const noReservedQuery = !urlObject.searchParams.has("code") &&
            !urlObject.searchParams.has("state");
        // As per https://tools.ietf.org/html/rfc6749#section-3.1.2, the redirect URL
        // must not include a hash fragment.
        const noHash = urlObject.hash === "";
        return noReservedQuery && noHash;
    }
    catch (e) {
        return false;
    }
}
function removeOpenIdParams(redirectUrl) {
    const cleanedUpUrl = new URL(redirectUrl);
    // For auth code flow
    cleanedUpUrl.searchParams.delete("state");
    cleanedUpUrl.searchParams.delete("code");
    // For login error
    cleanedUpUrl.searchParams.delete("error");
    cleanedUpUrl.searchParams.delete("error_description");
    // For RFC9207
    cleanedUpUrl.searchParams.delete("iss");
    return cleanedUpUrl;
}

/**
 * @hidden
 * @packageDocumentation
 */
function booleanWithFallback(value, fallback) {
    if (typeof value === "boolean") {
        return Boolean(value);
    }
    return Boolean(fallback);
}
/**
 * @hidden
 * Authorization code flow spec: https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
 * PKCE: https://tools.ietf.org/html/rfc7636
 */
class AuthorizationCodeWithPkceOidcHandlerBase {
    storageUtility;
    redirector;
    constructor(storageUtility, redirector) {
        this.storageUtility = storageUtility;
        this.redirector = redirector;
        this.storageUtility = storageUtility;
        this.redirector = redirector;
    }
    parametersGuard = (oidcLoginOptions) => {
        return (oidcLoginOptions.issuerConfiguration.grantTypesSupported !== undefined &&
            oidcLoginOptions.issuerConfiguration.grantTypesSupported.indexOf("authorization_code") > -1 &&
            oidcLoginOptions.redirectUrl !== undefined);
    };
    async canHandle(oidcLoginOptions) {
        return this.parametersGuard(oidcLoginOptions);
    }
    async setupRedirectHandler({ oidcLoginOptions, state, codeVerifier, targetUrl, }) {
        if (!this.parametersGuard(oidcLoginOptions)) {
            throw new Error("The authorization code grant requires a redirectUrl.");
        }
        await Promise.all([
            // We use the OAuth 'state' value (which should be crypto-random) as
            // the key in our storage to store our actual SessionID. We do this
            // 'cos we'll need to lookup our session information again when the
            // browser is redirected back to us (i.e. the OAuth client
            // application) from the Authorization Server.
            // We don't want to use our session ID as the OAuth 'state' value, as
            // that session ID can be any developer-specified value, and therefore
            // may not be appropriate (since the OAuth 'state' value should really
            // be an unguessable crypto-random value).
            this.storageUtility.setForUser(state, {
                sessionId: oidcLoginOptions.sessionId,
            }),
            // Store our login-process state using the session ID as the key.
            // Strictly speaking, this indirection from our OAuth state value to
            // our session ID is unnecessary, but it provides a slightly cleaner
            // separation of concerns.
            this.storageUtility.setForUser(oidcLoginOptions.sessionId, {
                codeVerifier,
                issuer: oidcLoginOptions.issuer.toString(),
                // The redirect URL is read after redirect, so it must be stored now.
                redirectUrl: oidcLoginOptions.redirectUrl,
                dpop: Boolean(oidcLoginOptions.dpop).toString(),
                keepAlive: booleanWithFallback(oidcLoginOptions.keepAlive, true).toString(),
            }),
        ]);
        this.redirector.redirect(targetUrl, {
            handleRedirect: oidcLoginOptions.handleRedirect,
        });
        return undefined;
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class GeneralLogoutHandler {
    sessionInfoManager;
    constructor(sessionInfoManager) {
        this.sessionInfoManager = sessionInfoManager;
        this.sessionInfoManager = sessionInfoManager;
    }
    async canHandle() {
        return true;
    }
    async handle(userId) {
        await this.sessionInfoManager.clear(userId);
    }
}

class IRpLogoutHandler {
    redirector;
    constructor(redirector) {
        this.redirector = redirector;
        this.redirector = redirector;
    }
    async canHandle(userId, options) {
        return options?.logoutType === "idp";
    }
    async handle(userId, options) {
        if (options?.logoutType !== "idp") {
            throw new Error("Attempting to call idp logout handler to perform app logout");
        }
        if (options.toLogoutUrl === undefined) {
            throw new Error("Cannot perform IDP logout. Did you log in using the OIDC authentication flow?");
        }
        this.redirector.redirect(options.toLogoutUrl(options), {
            handleRedirect: options.handleRedirect,
        });
    }
}

class IWaterfallLogoutHandler {
    handlers;
    constructor(sessionInfoManager, redirector) {
        this.handlers = [
            new GeneralLogoutHandler(sessionInfoManager),
            new IRpLogoutHandler(redirector),
        ];
    }
    async canHandle() {
        return true;
    }
    async handle(userId, options) {
        for (const handler of this.handlers) {
            /* eslint-disable no-await-in-loop */
            if (await handler.canHandle(userId, options))
                await handler.handle(userId, options);
            /* eslint-enable no-await-in-loop */
        }
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * @packageDocumentation
 */
function getUnauthenticatedSession() {
    return {
        isLoggedIn: false,
        sessionId: esm_browser_v4(),
        fetch: (...args) => fetch(...args),
    };
}
/**
 * @param sessionId
 * @param storage
 * @hidden
 */
async function clear(sessionId, storage) {
    await Promise.all([
        storage.deleteAllUserData(sessionId, { secure: false }),
        storage.deleteAllUserData(sessionId, { secure: true }),
    ]);
}
/**
 * @hidden
 */
class SessionInfoManagerBase {
    storageUtility;
    constructor(storageUtility) {
        this.storageUtility = storageUtility;
        this.storageUtility = storageUtility;
    }
    update(_sessionId, _options) {
        throw new Error("Not Implemented");
    }
    set(_sessionId, _sessionInfo) {
        throw new Error("Not Implemented");
    }
    get(_) {
        throw new Error("Not implemented");
    }
    // eslint-disable-next-line class-methods-use-this
    async getAll() {
        throw new Error("Not implemented");
    }
    /**
     * This function removes all session-related information from storage.
     * @param sessionId the session identifier
     * @hidden
     */
    async clear(sessionId) {
        return clear(sessionId, this.storageUtility);
    }
    /**
     * Registers a new session, so that its ID can be retrieved.
     */
    async register(_sessionId) {
        throw new Error("Not implemented");
    }
    /**
     * Returns all the registered session IDs. Differs from getAll, which also
     * returns additional session information.
     */
    async getRegisteredSessionIdAll() {
        throw new Error("Not implemented");
    }
    /**
     * Deletes all information about all sessions, including their registrations.
     */
    async clearAll() {
        throw new Error("Not implemented");
    }
    /**
     * Sets authorization request state in storage for a given session ID.
     */
    async setOidcContext(_sessionId, _authorizationRequestState) {
        throw new Error("Not implemented");
    }
}

/**
 * This function is designed to isomorphically capture the behavior in oidc-client-js and node-oidc-provider
 * - https://github.com/IdentityModel/oidc-client-js/blob/edec8f59897bdeedcb0b4167586d49626203c2c1/src/OidcClient.js#L138
 * - https://github.com/panva/node-openid-client/blob/35758419489ff751a71f5b66f5020087a63e1e88/lib/client.js#L284
 *
 * @param options IEndSessionOptions
 * @returns The URL to redirect to in order to perform RP Initiated Logout
 * @hidden
 */
function getEndSessionUrl({ endSessionEndpoint, idTokenHint, postLogoutRedirectUri, state, }) {
    const url = new URL(endSessionEndpoint);
    if (idTokenHint !== undefined)
        url.searchParams.append("id_token_hint", idTokenHint);
    if (postLogoutRedirectUri !== undefined) {
        url.searchParams.append("post_logout_redirect_uri", postLogoutRedirectUri);
        if (state !== undefined)
            url.searchParams.append("state", state);
    }
    return url.toString();
}
/**
 * @param options.endSessionEndpoint The end_session_endpoint advertised by the server
 * @param options.idTokenHint The idToken supplied by the server after logging in
 * Redirects the window to the location required to perform RP initiated logout
 *
 * @hidden
 */
function maybeBuildRpInitiatedLogout({ endSessionEndpoint, idTokenHint, }) {
    if (endSessionEndpoint === undefined)
        return undefined;
    return function logout({ state, postLogoutUrl }) {
        return getEndSessionUrl({
            endSessionEndpoint,
            idTokenHint,
            state,
            postLogoutRedirectUri: postLogoutUrl,
        });
    };
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
function isSupportedTokenType(token) {
    return typeof token === "string" && ["DPoP", "Bearer"].includes(token);
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
function isValidUrl(url) {
    try {
        // Here, the URL constructor is just called to parse the given string and
        // verify if it is a well-formed IRI.
        // eslint-disable-next-line no-new
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function determineSigningAlg(supported, preferred) {
    return (preferred.find((signingAlg) => {
        return supported.includes(signingAlg);
    }) ?? null);
}
function isStaticClient(options) {
    return options.clientId !== undefined && !isValidUrl(options.clientId);
}
function isSolidOidcClient(options, issuerConfig) {
    return (issuerConfig.scopesSupported.includes("webid") &&
        options.clientId !== undefined &&
        isValidUrl(options.clientId));
}
function isKnownClientType(clientType) {
    return (typeof clientType === "string" &&
        ["dynamic", "static", "solid-oidc"].includes(clientType));
}
async function handleRegistration(options, issuerConfig, storageUtility, clientRegistrar) {
    let clientInfo;
    if (isSolidOidcClient(options, issuerConfig)) {
        clientInfo = {
            clientId: options.clientId,
            clientName: options.clientName,
            clientType: "solid-oidc",
        };
    }
    else if (isStaticClient(options)) {
        clientInfo = {
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            clientName: options.clientName,
            clientType: "static",
        };
    }
    else {
        // Case of a dynamically registered client.
        return clientRegistrar.getClient({
            sessionId: options.sessionId,
            clientName: options.clientName,
            redirectUrl: options.redirectUrl,
        }, issuerConfig);
    }
    // If a client_id was provided, and the Identity Provider is Solid-OIDC compliant,
    // or it is not compliant but the client_id isn't an IRI (we assume it has already
    // been registered with the IdP), then the client registration information needs
    // to be stored so that it can be retrieved later after redirect.
    const infoToSave = {
        clientId: clientInfo.clientId,
        clientType: clientInfo.clientType,
    };
    if (clientInfo.clientType === "static") {
        infoToSave.clientSecret = clientInfo.clientSecret;
    }
    if (clientInfo.clientName) {
        infoToSave.clientName = clientInfo.clientName;
    }
    // Note that due to the underlying implementation, doing a `Promise.all`
    // on multiple `storageUtility.setForUser` results in the last one
    // overriding the previous calls.
    await storageUtility.setForUser(options.sessionId, infoToSave);
    return clientInfo;
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const boundFetch = (request, init) => fetch(request, init);
/**
 * @hidden
 */
class dist_ClientAuthentication {
    loginHandler;
    redirectHandler;
    logoutHandler;
    sessionInfoManager;
    issuerConfigFetcher;
    boundLogout;
    constructor(loginHandler, redirectHandler, logoutHandler, sessionInfoManager, issuerConfigFetcher) {
        this.loginHandler = loginHandler;
        this.redirectHandler = redirectHandler;
        this.logoutHandler = logoutHandler;
        this.sessionInfoManager = sessionInfoManager;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.loginHandler = loginHandler;
        this.redirectHandler = redirectHandler;
        this.logoutHandler = logoutHandler;
        this.sessionInfoManager = sessionInfoManager;
        this.issuerConfigFetcher = issuerConfigFetcher;
    }
    // By default, our fetch() resolves to the environment fetch() function.
    fetch = boundFetch;
    logout = async (sessionId, options) => {
        // When doing IDP logout this will redirect away from the current page, so we should not expect
        // code after this condition to be run if it is true.
        // We also need to make sure that any other cleanup that we want to do for
        // our session takes place before this condition is run
        await this.logoutHandler.handle(sessionId, options?.logoutType === "idp"
            ? {
                ...options,
                toLogoutUrl: this.boundLogout,
            }
            : options);
        // Restore our fetch() function back to the environment fetch(), effectively
        // leaving us with un-authenticated fetches from now on.
        this.fetch = boundFetch;
        // Delete the bound logout function, so that it can't be called after this.
        delete this.boundLogout;
    };
    getSessionInfo = async (sessionId) => {
        // TODO complete
        return this.sessionInfoManager.get(sessionId);
    };
    getAllSessionInfo = async () => {
        return this.sessionInfoManager.getAll();
    };
}
/**
 * Based on the provided state, this looks up contextual information stored
 * before redirecting the user to the OIDC issuer.
 * @param sessionId The state (~ correlation ID) of the OIDC request
 * @param storageUtility
 * @param configFetcher
 * @returns Information stored about the client issuing the request
 */
async function loadOidcContextFromStorage(sessionId, storageUtility, configFetcher) {
    try {
        const [issuerIri, codeVerifier, storedRedirectIri, dpop, keepAlive] = await Promise.all([
            storageUtility.getForUser(sessionId, "issuer", {
                errorIfNull: true,
            }),
            storageUtility.getForUser(sessionId, "codeVerifier"),
            storageUtility.getForUser(sessionId, "redirectUrl"),
            storageUtility.getForUser(sessionId, "dpop", { errorIfNull: true }),
            storageUtility.getForUser(sessionId, "keepAlive"),
        ]);
        // Clear the code verifier, which is one-time use.
        await storageUtility.deleteForUser(sessionId, "codeVerifier");
        // Unlike openid-client, this looks up the configuration from storage
        const issuerConfig = await configFetcher.fetchConfig(issuerIri);
        return {
            codeVerifier,
            redirectUrl: storedRedirectIri,
            issuerConfig,
            dpop: dpop === "true",
            // Default keepAlive to true if not found in storage.
            keepAlive: typeof keepAlive === "string" ? keepAlive === "true" : true,
        };
    }
    catch (e) {
        throw new Error(`Failed to retrieve OIDC context from storage associated with session [${sessionId}]: ${e}`);
    }
}
/**
 * Stores information about the session in the provided storage. Note that not
 * all storage are equally secure, and it is strongly advised not to store either
 * the refresh token or the DPoP key in the browser's local storage.
 *
 * @param storageUtility
 * @param sessionId
 * @param webId
 * @param clientId
 * @param isLoggedIn
 * @param refreshToken
 * @param secure
 * @param dpopKey
 */
async function saveSessionInfoToStorage(storageUtility, sessionId, webId, clientId, isLoggedIn, refreshToken, secure, dpopKey) {
    if (webId !== undefined) {
        await storageUtility.setForUser(sessionId, { webId }, { secure });
    }
    if (clientId !== undefined) {
        await storageUtility.setForUser(sessionId, { clientId }, { secure });
    }
    {
        await storageUtility.setForUser(sessionId, { isLoggedIn }, { secure });
    }
}
// TOTEST: this does not handle all possible bad inputs for example what if it's not proper JSON
/**
 * @hidden
 */
class StorageUtility {
    secureStorage;
    insecureStorage;
    constructor(secureStorage, insecureStorage) {
        this.secureStorage = secureStorage;
        this.insecureStorage = insecureStorage;
        this.secureStorage = secureStorage;
        this.insecureStorage = insecureStorage;
    }
    getKey(userId) {
        return `solidClientAuthenticationUser:${userId}`;
    }
    async getUserData(userId, secure) {
        const stored = await (secure ? this.secureStorage : this.insecureStorage).get(this.getKey(userId));
        if (stored === undefined) {
            return {};
        }
        try {
            return JSON.parse(stored);
        }
        catch (err) {
            throw new Error(`Data for user [${userId}] in [${secure ? "secure" : "unsecure"}] storage is corrupted - expected valid JSON, but got: ${stored}`);
        }
    }
    async setUserData(userId, data, secure) {
        await (secure ? this.secureStorage : this.insecureStorage).set(this.getKey(userId), JSON.stringify(data));
    }
    async get(key, options) {
        const value = await (options?.secure ? this.secureStorage : this.insecureStorage).get(key);
        if (value === undefined && options?.errorIfNull) {
            throw new Error(`[${key}] is not stored`);
        }
        return value;
    }
    async set(key, value, options) {
        return (options?.secure ? this.secureStorage : this.insecureStorage).set(key, value);
    }
    async delete(key, options) {
        return (options?.secure ? this.secureStorage : this.insecureStorage).delete(key);
    }
    async getForUser(userId, key, options) {
        const userData = await this.getUserData(userId, options?.secure);
        let value;
        if (!userData || !userData[key]) {
            value = undefined;
        }
        value = userData[key];
        if (value === undefined && options?.errorIfNull) {
            throw new Error(`Field [${key}] for user [${userId}] is not stored`);
        }
        return value || undefined;
    }
    async setForUser(userId, values, options) {
        let userData;
        try {
            userData = await this.getUserData(userId, options?.secure);
        }
        catch {
            // if reading the user data throws, the data is corrupted, and we want to write over it
            userData = {};
        }
        await this.setUserData(userId, { ...userData, ...values }, options?.secure);
    }
    async deleteForUser(userId, key, options) {
        const userData = await this.getUserData(userId, options?.secure);
        delete userData[key];
        await this.setUserData(userId, userData, options?.secure);
    }
    async deleteAllUserData(userId, options) {
        await (options?.secure ? this.secureStorage : this.insecureStorage).delete(this.getKey(userId));
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class InMemoryStorage {
    map = {};
    async get(key) {
        return this.map[key] || undefined;
    }
    async set(key, value) {
        this.map[key] = value;
    }
    async delete(key) {
        delete this.map[key];
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Error to be triggered when a poor configuration is received
 */
// NOTE: There's a bug with istanbul and typescript that prevents full branch coverages
// https://github.com/gotwarlost/istanbul/issues/690
// The workaround is to put istanbul ignore on the constructor
/**
 * @hidden
 */
class ConfigurationError extends Error {
    /* istanbul ignore next */
    constructor(message) {
        super(message);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Error to be triggered when receiving a response missing mandatory elements
 */
// NOTE: There's a bug with istanbul and typescript that prevents full branch coverages
// https://github.com/gotwarlost/istanbul/issues/690
// The workaround is to put istanbul ignore on the constructor
/**
 * @hidden
 */
class InvalidResponseError extends Error {
    missingFields;
    /* istanbul ignore next */
    constructor(missingFields) {
        super(`Invalid response from OIDC provider: missing fields ${missingFields}`);
        this.missingFields = missingFields;
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * @packageDocumentation
 */
/**
 * Error to be triggered when receiving a response missing mandatory elements
 */
// NOTE: There's a bug with istanbul and typescript that prevents full branch coverages
// https://github.com/gotwarlost/istanbul/issues/690
// The workaround is to put istanbul ignore on the constructor
/**
 * @hidden
 */
class OidcProviderError extends Error {
    error;
    errorDescription;
    /* istanbul ignore next */
    constructor(message, error, errorDescription) {
        super(message);
        this.error = error;
        this.errorDescription = errorDescription;
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * Normalizes a URL in order to generate the DPoP token based on a consistent scheme.
 *
 * @param audience The URL to normalize.
 * @returns The normalized URL as a string.
 * @hidden
 */
function normalizeHTU(audience) {
    const audienceUrl = new URL(audience);
    return new URL(audienceUrl.pathname, audienceUrl.origin).toString();
}
/**
 * Creates a DPoP header according to https://tools.ietf.org/html/draft-fett-oauth-dpop-04,
 * based on the target URL and method, using the provided key.
 *
 * @param audience Target URL.
 * @param method HTTP method allowed.
 * @param dpopKey Key used to sign the token.
 * @returns A JWT that can be used as a DPoP Authorization header.
 */
async function createDpopHeader(audience, method, dpopKey) {
    return new SignJWT({
        htu: normalizeHTU(audience),
        htm: method.toUpperCase(),
        jti: esm_browser_v4(),
    })
        .setProtectedHeader({
        alg: PREFERRED_SIGNING_ALG[0],
        jwk: dpopKey.publicKey,
        typ: "dpop+jwt",
    })
        .setIssuedAt()
        .sign(dpopKey.privateKey, {});
}
async function generateDpopKeyPair() {
    const { privateKey, publicKey } = await generate_key_pair_generateKeyPair(PREFERRED_SIGNING_ALG[0]);
    const dpopKeyPair = {
        privateKey,
        publicKey: await exportJWK(publicKey),
    };
    // The alg property isn't set by exportJWK, so set it manually.
    [dpopKeyPair.publicKey.alg] = PREFERRED_SIGNING_ALG;
    return dpopKeyPair;
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * If expires_in isn't specified for the access token, we assume its lifetime is
 * 10 minutes.
 */
const DEFAULT_EXPIRATION_TIME_SECONDS = 600;
function isExpectedAuthError(statusCode) {
    // As per https://tools.ietf.org/html/rfc7235#section-3.1 and https://tools.ietf.org/html/rfc7235#section-3.1,
    // a response failing because the provided credentials aren't accepted by the
    // server can get a 401 or a 403 response.
    return [401, 403].includes(statusCode);
}
async function buildDpopFetchOptions(targetUrl, authToken, dpopKey, defaultOptions) {
    const headers = new Headers(defaultOptions?.headers);
    // Any pre-existing Authorization header should be overriden.
    headers.set("Authorization", `DPoP ${authToken}`);
    headers.set("DPoP", await createDpopHeader(targetUrl, defaultOptions?.method ?? "get", dpopKey));
    return {
        ...defaultOptions,
        headers,
    };
}
async function buildAuthenticatedHeaders(targetUrl, authToken, dpopKey, defaultOptions) {
    if (dpopKey !== undefined) {
        return buildDpopFetchOptions(targetUrl, authToken, dpopKey, defaultOptions);
    }
    const headers = new Headers(defaultOptions?.headers);
    // Any pre-existing Authorization header should be overriden.
    headers.set("Authorization", `Bearer ${authToken}`);
    return {
        ...defaultOptions,
        headers,
    };
}
async function makeAuthenticatedRequest(accessToken, url, defaultRequestInit, dpopKey, unauthFetch = fetch) {
    return unauthFetch(url, await buildAuthenticatedHeaders(url.toString(), accessToken, dpopKey, defaultRequestInit));
}
async function refreshAccessToken(refreshOptions, dpopKey, eventEmitter) {
    const tokenSet = await refreshOptions.tokenRefresher.refresh(refreshOptions.sessionId, refreshOptions.refreshToken, dpopKey);
    eventEmitter?.emit(EVENTS.SESSION_EXTENDED, tokenSet.expiresIn ?? DEFAULT_EXPIRATION_TIME_SECONDS);
    return {
        accessToken: tokenSet.accessToken,
        refreshToken: tokenSet.refreshToken,
        expiresIn: tokenSet.expiresIn,
    };
}
/**
 *
 * @param expiresIn Delay until the access token expires.
 * @returns a delay until the access token should be refreshed.
 */
const computeRefreshDelay = (expiresIn) => {
    if (expiresIn !== undefined) {
        return expiresIn - REFRESH_BEFORE_EXPIRATION_SECONDS > 0
            ? // We want to refresh the token 5 seconds before they actually expire.
                expiresIn - REFRESH_BEFORE_EXPIRATION_SECONDS
            : expiresIn;
    }
    return DEFAULT_EXPIRATION_TIME_SECONDS;
};
/**
 * @param accessToken an access token, either a Bearer token or a DPoP one.
 * @param options The option object may contain two objects: the DPoP key token
 * is bound to if applicable, and options to customize token renewal behavior.
 * @param {typeof fetch} [options.fetch=fetch] A custom fetch function (defaults to the global fetch).
 *
 * @returns A fetch function that adds an appropriate Authorization header with
 * the provided token, and adds a DPoP header if applicable.
 */
function buildAuthenticatedFetch(accessToken, options) {
    let currentAccessToken = accessToken;
    let latestTimeout;
    const currentRefreshOptions = options?.refreshOptions;
    // Setup the refresh timeout outside of the authenticated fetch, so that
    // an idle app will not get logged out if it doesn't issue a fetch before
    // the first expiration date.
    if (currentRefreshOptions !== undefined) {
        const proactivelyRefreshToken = async () => {
            try {
                const { accessToken: refreshedAccessToken, refreshToken, expiresIn, } = await refreshAccessToken(currentRefreshOptions, 
                // If currentRefreshOptions is defined, options is necessarily defined too.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                options.dpopKey, 
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                options.eventEmitter);
                // Update the tokens in the closure if appropriate.
                currentAccessToken = refreshedAccessToken;
                if (refreshToken !== undefined) {
                    currentRefreshOptions.refreshToken = refreshToken;
                }
                // Each time the access token is refreshed, we must plan for the next
                // refresh iteration.
                clearTimeout(latestTimeout);
                latestTimeout = setTimeout(proactivelyRefreshToken, computeRefreshDelay(expiresIn) * 1000);
                // If currentRefreshOptions is defined, options is necessarily defined too.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                options.eventEmitter?.emit(EVENTS.TIMEOUT_SET, latestTimeout);
            }
            catch (e) {
                // It is possible that an underlying library throws an error on refresh flow failure.
                // If we used a log framework, the error could be logged at the `debug` level,
                // but otherwise the failure of the refresh flow should not blow up in the user's
                // face, so we just swallow the error.
                if (e instanceof OidcProviderError) {
                    // The OIDC provider refused to refresh the access token and returned an error instead.
                    /* istanbul ignore next 100% coverage would require testing that nothing
                        happens here if the emitter is undefined, which is more cumbersome
                        than what it's worth. */
                    options?.eventEmitter?.emit(EVENTS.ERROR, e.error, e.errorDescription);
                    /* istanbul ignore next 100% coverage would require testing that nothing
                      happens here if the emitter is undefined, which is more cumbersome
                      than what it's worth. */
                    options?.eventEmitter?.emit(EVENTS.SESSION_EXPIRED);
                }
                if (e instanceof InvalidResponseError &&
                    e.missingFields.includes("access_token")) {
                    // In this case, the OIDC provider returned a non-standard response, but
                    // did not specify that it was an error. We cannot refresh nonetheless.
                    /* istanbul ignore next 100% coverage would require testing that nothing
                      happens here if the emitter is undefined, which is more cumbersome
                      than what it's worth. */
                    options?.eventEmitter?.emit(EVENTS.SESSION_EXPIRED);
                }
            }
        };
        latestTimeout = setTimeout(proactivelyRefreshToken, 
        // If currentRefreshOptions is defined, options is necessarily defined too.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        computeRefreshDelay(options.expiresIn) * 1000);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options.eventEmitter?.emit(EVENTS.TIMEOUT_SET, latestTimeout);
    }
    else if (options !== undefined && options.eventEmitter !== undefined) {
        // If no refresh options are provided, the session expires when the access token does.
        const expirationTimeout = setTimeout(() => {
            // The event emitter is always defined in our code, and it would be tedious
            // to test for conditions when it is not.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            options.eventEmitter.emit(EVENTS.SESSION_EXPIRED);
        }, computeRefreshDelay(options.expiresIn) * 1000);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        options.eventEmitter.emit(EVENTS.TIMEOUT_SET, expirationTimeout);
    }
    return async (url, requestInit) => {
        let response = await makeAuthenticatedRequest(currentAccessToken, url, requestInit, options?.dpopKey, options?.fetch);
        const failedButNotExpectedAuthError = !response.ok && !isExpectedAuthError(response.status);
        if (response.ok || failedButNotExpectedAuthError) {
            // If there hasn't been a redirection, or if there has been a non-auth related
            // issue, it should be handled at the application level
            return response;
        }
        const hasBeenRedirected = response.url !== url;
        if (hasBeenRedirected && options?.dpopKey !== undefined) {
            // If the request failed for auth reasons, and has been redirected, we should
            // replay it generating a DPoP header for the rediration target IRI. This
            // doesn't apply to Bearer tokens, as the Bearer tokens aren't specific
            // to a given resource and method, while the DPoP header (associated to a
            // DPoP token) is.
            response = await makeAuthenticatedRequest(currentAccessToken, 
            // Replace the original target IRI (`url`) by the redirection target
            response.url, requestInit, options.dpopKey, options.fetch);
        }
        return response;
    };
}




// EXTERNAL MODULE: ./node_modules/events/events.js
var events = __webpack_require__(7);
// EXTERNAL MODULE: ./node_modules/@inrupt/oidc-client/lib/oidc-client.min.js
var oidc_client_min = __webpack_require__(516);




//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
function processErrorResponse(
// The type is any here because the object is parsed from a JSON response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
responseBody, options) {
    // The following errors are defined by the spec, and allow providing some context.
    // See https://tools.ietf.org/html/rfc7591#section-3.2.2 for more information
    if (responseBody.error === "invalid_redirect_uri") {
        throw new Error(`Dynamic client registration failed: the provided redirect uri [${options.redirectUrl?.toString()}] is invalid - ${responseBody.error_description ?? ""}`);
    }
    if (responseBody.error === "invalid_client_metadata") {
        throw new Error(`Dynamic client registration failed: the provided client metadata ${JSON.stringify(options)} is invalid - ${responseBody.error_description ?? ""}`);
    }
    // We currently don't support software statements, so no related error should happen.
    // If an error outside of the spec happens, no additional context can be provided
    throw new Error(`Dynamic client registration failed: ${responseBody.error} - ${responseBody.error_description ?? ""}`);
}
function hasClientId(body) {
    return typeof body.client_id === "string";
}
function hasRedirectUri(body) {
    return (Array.isArray(body.redirect_uris) &&
        body.redirect_uris.every((uri) => typeof uri === "string"));
}
function validateRegistrationResponse(responseBody, options) {
    if (!hasClientId(responseBody)) {
        throw new Error(`Dynamic client registration failed: no client_id has been found on ${JSON.stringify(responseBody)}`);
    }
    if (options.redirectUrl &&
        hasRedirectUri(responseBody) &&
        responseBody.redirect_uris[0] !== options.redirectUrl.toString()) {
        throw new Error(`Dynamic client registration failed: the returned redirect URIs ${JSON.stringify(responseBody.redirect_uris)} don't match the provided ${JSON.stringify([
            options.redirectUrl.toString(),
        ])}`);
    }
    return true;
}
async function registerClient(options, issuerConfig) {
    if (!issuerConfig.registrationEndpoint) {
        throw new Error("Dynamic Registration could not be completed because the issuer has no registration endpoint.");
    }
    if (!Array.isArray(issuerConfig.idTokenSigningAlgValuesSupported)) {
        throw new Error("The OIDC issuer discovery profile is missing the 'id_token_signing_alg_values_supported' value, which is mandatory.");
    }
    const signingAlg = determineSigningAlg(issuerConfig.idTokenSigningAlgValuesSupported, PREFERRED_SIGNING_ALG);
    const config = {
        /* eslint-disable camelcase */
        client_name: options.clientName,
        application_type: "web",
        redirect_uris: [options.redirectUrl?.toString()],
        subject_type: "public",
        token_endpoint_auth_method: "client_secret_basic",
        id_token_signed_response_alg: signingAlg,
        grant_types: ["authorization_code", "refresh_token"],
        /* eslint-enable camelcase */
    };
    const headers = {
        "Content-Type": "application/json",
    };
    const registerResponse = await fetch(issuerConfig.registrationEndpoint.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify(config),
    });
    if (registerResponse.ok) {
        const responseBody = await registerResponse.json();
        validateRegistrationResponse(responseBody, options);
        return {
            clientId: responseBody.client_id,
            clientSecret: responseBody.client_secret,
            expiresAt: responseBody.client_secret_expires_at,
            idTokenSignedResponseAlg: responseBody.id_token_signed_response_alg,
            clientType: "dynamic",
        };
    }
    if (registerResponse.status === 400) {
        processErrorResponse(await registerResponse.json(), options);
    }
    throw new Error(`Dynamic client registration failed: the server returned ${registerResponse.status} ${registerResponse.statusText} - ${await registerResponse.text()}`);
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Identifiers in camelcase are mandated by the OAuth spec.
/* eslint-disable camelcase */
function hasError(value) {
    return value.error !== undefined && typeof value.error === "string";
}
function hasErrorDescription(value) {
    return (value.error_description !== undefined &&
        typeof value.error_description === "string");
}
function hasErrorUri(value) {
    return value.error_uri !== undefined && typeof value.error_uri === "string";
}
function hasAccessToken(value) {
    return (value.access_token !== undefined && typeof value.access_token === "string");
}
function hasIdToken(value) {
    return value.id_token !== undefined && typeof value.id_token === "string";
}
function hasRefreshToken(value) {
    return (value.refresh_token !== undefined && typeof value.refresh_token === "string");
}
function hasTokenType(value) {
    return value.token_type !== undefined && typeof value.token_type === "string";
}
function hasExpiresIn(value) {
    return value.expires_in === undefined || typeof value.expires_in === "number";
}
function validatePreconditions(issuer, data) {
    if (data.grantType &&
        (!issuer.grantTypesSupported ||
            !issuer.grantTypesSupported.includes(data.grantType))) {
        throw new Error(`The issuer [${issuer.issuer}] does not support the [${data.grantType}] grant`);
    }
    if (!issuer.tokenEndpoint) {
        throw new Error(`This issuer [${issuer.issuer}] does not have a token endpoint`);
    }
}
function validateTokenEndpointResponse(tokenResponse, dpop) {
    if (hasError(tokenResponse)) {
        throw new OidcProviderError(`Token endpoint returned error [${tokenResponse.error}]${hasErrorDescription(tokenResponse)
            ? `: ${tokenResponse.error_description}`
            : ""}${hasErrorUri(tokenResponse) ? ` (see ${tokenResponse.error_uri})` : ""}`, tokenResponse.error, hasErrorDescription(tokenResponse)
            ? tokenResponse.error_description
            : undefined);
    }
    if (!hasAccessToken(tokenResponse)) {
        throw new InvalidResponseError(["access_token"]);
    }
    if (!hasIdToken(tokenResponse)) {
        throw new InvalidResponseError(["id_token"]);
    }
    if (!hasTokenType(tokenResponse)) {
        throw new InvalidResponseError(["token_type"]);
    }
    if (!hasExpiresIn(tokenResponse)) {
        throw new InvalidResponseError(["expires_in"]);
    }
    // TODO: Due to a bug in both the ESS ID broker AND NSS (what were the odds), a DPoP token is returned
    // with a token_type 'Bearer'. To work around this, this test is currently disabled.
    // https://github.com/solid/oidc-op/issues/26
    // Fixed, but unreleased for the ESS (current version: inrupt-oidc-server-0.5.2)
    // if (dpop && tokenResponse.token_type.toLowerCase() !== "dpop") {
    //   throw new Error(
    //     `Invalid token endpoint response: requested a [DPoP] token, but got a 'token_type' value of [${tokenResponse.token_type}].`
    //   );
    // }
    if (!dpop && tokenResponse.token_type.toLowerCase() !== "bearer") {
        throw new Error(`Invalid token endpoint response: requested a [Bearer] token, but got a 'token_type' value of [${tokenResponse.token_type}].`);
    }
    return tokenResponse;
}
async function getTokens(issuer, client, data, dpop) {
    validatePreconditions(issuer, data);
    const headers = {
        "content-type": "application/x-www-form-urlencoded",
    };
    let dpopKey;
    if (dpop) {
        dpopKey = await generateDpopKeyPair();
        headers.DPoP = await createDpopHeader(issuer.tokenEndpoint, "POST", dpopKey);
    }
    // Note: this defaults to client_secret_basic. client_secret_post
    // is currently not supported. See https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication
    // for details.
    if (client.clientSecret) {
        headers.Authorization = `Basic ${btoa(`${client.clientId}:${client.clientSecret}`)}`;
    }
    const requestBody = {
        /* eslint-disable camelcase */
        grant_type: data.grantType,
        redirect_uri: data.redirectUrl,
        code: data.code,
        code_verifier: data.codeVerifier,
        client_id: client.clientId,
        /* eslint-enable camelcase */
    };
    const tokenRequestInit = {
        method: "POST",
        headers,
        body: new URLSearchParams(requestBody).toString(),
    };
    const rawTokenResponse = await fetch(issuer.tokenEndpoint, tokenRequestInit);
    const jsonTokenResponse = (await rawTokenResponse.json());
    const tokenResponse = validateTokenEndpointResponse(jsonTokenResponse, dpop);
    const { webId, clientId } = await getWebidFromTokenPayload(tokenResponse.id_token, issuer.jwksUri, issuer.issuer, client.clientId);
    return {
        accessToken: tokenResponse.access_token,
        idToken: tokenResponse.id_token,
        refreshToken: hasRefreshToken(tokenResponse)
            ? tokenResponse.refresh_token
            : undefined,
        webId,
        clientId,
        dpopKey,
        expiresIn: tokenResponse.expires_in,
    };
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const index_es_isValidUrl = (url) => {
    try {
        // Here, the URL constructor is just called to parse the given string and
        // verify if it is a well-formed IRI.
        // eslint-disable-next-line no-new
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
// Identifiers in snake_case are mandated by the OAuth spec.
/* eslint-disable camelcase */
async function refresh(refreshToken, issuer, client, dpopKey) {
    if (client.clientId === undefined) {
        throw new Error("No client ID available when trying to refresh the access token.");
    }
    const requestBody = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    };
    let dpopHeader = {};
    if (dpopKey !== undefined) {
        dpopHeader = {
            DPoP: await createDpopHeader(issuer.tokenEndpoint, "POST", dpopKey),
        };
    }
    let authHeader = {};
    if (client.clientSecret !== undefined) {
        authHeader = {
            // We assume that client_secret_basic is the client authentication method.
            // TODO: Get the authentication method from the IClient configuration object.
            Authorization: `Basic ${btoa(`${client.clientId}:${client.clientSecret}`)}`,
        };
    }
    else if (index_es_isValidUrl(client.clientId)) {
        // If the client ID is an URL, and there is no client secret, the client
        // has a Solid-OIDC Client Identifier, and it should be present in the
        // request body.
        requestBody.client_id = client.clientId;
    }
    const rawResponse = await fetch(issuer.tokenEndpoint, {
        method: "POST",
        body: new URLSearchParams(requestBody).toString(),
        headers: {
            ...dpopHeader,
            ...authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    let response;
    try {
        response = await rawResponse.json();
    }
    catch (e) {
        // The response is left out of the error on purpose not to leak any sensitive information.
        throw new Error(`The token endpoint of issuer ${issuer.issuer} returned a malformed response.`);
    }
    const validatedResponse = validateTokenEndpointResponse(response, dpopKey !== undefined);
    const { webId } = await getWebidFromTokenPayload(validatedResponse.id_token, issuer.jwksUri, issuer.issuer, client.clientId);
    return {
        accessToken: validatedResponse.access_token,
        idToken: validatedResponse.id_token,
        refreshToken: typeof validatedResponse.refresh_token === "string"
            ? validatedResponse.refresh_token
            : undefined,
        webId,
        dpopKey,
        expiresIn: validatedResponse.expires_in,
    };
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * Removes OIDC-specific query parameters from a given URL (state, code...), and
 * sanitizes the URL (e.g. removes the hash fragment).
 * @param redirectUrl The URL to clean up.
 * @returns A copy of the URL, without OIDC-specific query params.
 */
function normalizeCallbackUrl(redirectUrl) {
    const cleanedUrl = removeOpenIdParams(redirectUrl);
    // As per https://tools.ietf.org/html/rfc6749#section-3.1.2, the redirect URL
    // must not include a hash fragment.
    cleanedUrl.hash = "";
    // Do not normalize the trailing slash, and respect the original redirect URL.
    if (
    // The trailing slash is present in the original redirect URL
    redirectUrl.includes(`${cleanedUrl.origin}/`)) {
        return cleanedUrl.href;
    }
    // Calling cleanedUrl.href appends a trailing slash to the origin, which may
    // create a redirect URL mismatch if it wasn't originally present.
    return `${cleanedUrl.origin}${cleanedUrl.href.substring(
    // Adds 1 to the origin length to remove the trailing slash
    cleanedUrl.origin.length + 1)}`;
}
/**
 * Clears any OIDC-related data lingering in the local storage.
 */
async function clearOidcPersistentStorage() {
    const client = new oidc_client_min.OidcClient({
        // TODO: We should look at the various interfaces being used for storage,
        //  i.e. between oidc-client-js (WebStorageStoreState), localStorage
        //  (which has an interface Storage), and our own proprietary interface
        //  IStorage - i.e. we should really just be using the browser Web Storage
        //  API, e.g. "stateStore: window.localStorage,".
        // We are instantiating a new instance here, so the only value we need to
        // explicitly provide is the response mode (default otherwise will look
        // for a hash '#' fragment!).
        // eslint-disable-next-line camelcase
        response_mode: "query",
    });
    await client.clearStaleState(new oidc_client_min.WebStorageStateStore({}));
    const myStorage = window.localStorage;
    const itemsToRemove = [];
    for (let i = 0; i <= myStorage.length; i += 1) {
        const key = myStorage.key(i);
        if (key &&
            (key.match(/^oidc\..+$/) ||
                key.match(/^solidClientAuthenticationUser:.+$/))) {
            itemsToRemove.push(key);
        }
    }
    itemsToRemove.forEach((key) => myStorage.removeItem(key));
}






//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * This class in a no-value-added extension of StorageUtility from the core module.
 * The reason it has to be declared is for TSyringe to find the decorators in the
 * same modules as where the dependency container is declared (in this case,
 * the browser module, with the dependancy container in dependencies.ts).
 * @hidden
 */
class StorageUtilityBrowser extends StorageUtility {
    constructor(secureStorage, insecureStorage) {
        super(secureStorage, insecureStorage);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class ClientAuthentication extends dist_ClientAuthentication {
    // Define these functions as properties so that they don't get accidentally re-bound.
    // Isn't Javascript fun?
    login = async (options, eventEmitter) => {
        // In order to get a clean start, make sure that the session is logged out
        // on login, except when doing a silent login so that Dynamic Client information
        // is preserved.
        if (options.prompt !== "none") {
            await this.sessionInfoManager.clear(options.sessionId);
        }
        // In the case of the user hitting the 'back' button in their browser, they
        // could return to a previous redirect URL that contains OIDC params that
        // are now longer valid. To be safe, strip relevant params now.
        // If the user is providing a redirect IRI, it should not be modified, so
        // normalization only applies if we default to the current location (which is
        // a bad practice and should be discouraged).
        const redirectUrl = options.redirectUrl ?? normalizeCallbackUrl(window.location.href);
        if (!isValidRedirectUrl(redirectUrl)) {
            throw new Error(`${redirectUrl} is not a valid redirect URL, it is either a malformed IRI, includes a hash fragment, or reserved query parameters ('code' or 'state').`);
        }
        await this.loginHandler.handle({
            ...options,
            redirectUrl,
            // If no clientName is provided, the clientId may be used instead.
            clientName: options.clientName ?? options.clientId,
            eventEmitter,
        });
    };
    // Collects session information from storage, and returns them. Returns null
    // if the expected information cannot be found.
    // Note that the ID token is not stored, which means the session information
    // cannot be validated at this point.
    validateCurrentSession = async (currentSessionId) => {
        const sessionInfo = await this.sessionInfoManager.get(currentSessionId);
        if (sessionInfo === undefined ||
            sessionInfo.clientAppId === undefined ||
            sessionInfo.issuer === undefined) {
            return null;
        }
        return sessionInfo;
    };
    handleIncomingRedirect = async (url, eventEmitter) => {
        try {
            const redirectInfo = await this.redirectHandler.handle(url, eventEmitter, undefined);
            // The `FallbackRedirectHandler` directly returns the global `fetch` for
            // his value, so we should ensure it's bound to `window` rather than to
            // ClientAuthentication, to avoid the following error:
            // > 'fetch' called on an object that does not implement interface Window.
            this.fetch = redirectInfo.fetch.bind(window);
            this.boundLogout = redirectInfo.getLogoutUrl;
            // Strip the oauth params:
            await this.cleanUrlAfterRedirect(url);
            return {
                isLoggedIn: redirectInfo.isLoggedIn,
                webId: redirectInfo.webId,
                sessionId: redirectInfo.sessionId,
                expirationDate: redirectInfo.expirationDate,
                clientAppId: redirectInfo.clientAppId,
            };
        }
        catch (err) {
            // Strip the oauth params:
            await this.cleanUrlAfterRedirect(url);
            // FIXME: EVENTS.ERROR should be errorCode, errorDescription
            //
            // I'm not sure if "redirect" is a good error code, and in theory `err`
            // maybe an Error object and not a string; Maybe we want to just hardcode
            // a description instead?
            eventEmitter.emit(EVENTS.ERROR, "redirect", err);
            return undefined;
        }
    };
    async cleanUrlAfterRedirect(url) {
        const cleanedUpUrl = removeOpenIdParams(url).href;
        // Remove OAuth-specific query params (since the login flow finishes with
        // the browser being redirected back with OAuth2 query params (e.g. for
        // 'code' and 'state'), and so if the user simply refreshes this page our
        // authentication library will be called again with what are now invalid
        // query parameters!).
        window.history.replaceState(null, "", cleanedUpUrl);
        while (window.location.href !== cleanedUpUrl) {
            // Poll the current URL every ms. Active polling is required because
            // window.history.replaceState is asynchronous, but the associated
            // 'popstate' event which should be listened to is only sent on active
            // navigation, which we will not have here.
            // See https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event#when_popstate_is_sent
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => {
                setTimeout(() => resolve(), 1);
            });
        }
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
function hasIssuer(options) {
    return typeof options.oidcIssuer === "string";
}
function hasRedirectUrl(options) {
    return typeof options.redirectUrl === "string";
}
/**
 * @hidden
 */
class OidcLoginHandler {
    storageUtility;
    oidcHandler;
    issuerConfigFetcher;
    clientRegistrar;
    constructor(storageUtility, oidcHandler, issuerConfigFetcher, clientRegistrar) {
        this.storageUtility = storageUtility;
        this.oidcHandler = oidcHandler;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.clientRegistrar = clientRegistrar;
        this.storageUtility = storageUtility;
        this.oidcHandler = oidcHandler;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.clientRegistrar = clientRegistrar;
    }
    async canHandle(options) {
        return hasIssuer(options) && hasRedirectUrl(options);
    }
    async handle(options) {
        if (!hasIssuer(options)) {
            throw new ConfigurationError(`OidcLoginHandler requires an OIDC issuer: missing property 'oidcIssuer' in ${JSON.stringify(options)}`);
        }
        if (!hasRedirectUrl(options)) {
            throw new ConfigurationError(`OidcLoginHandler requires a redirect URL: missing property 'redirectUrl' in ${JSON.stringify(options)}`);
        }
        // Fetch issuer config.
        const issuerConfig = await this.issuerConfigFetcher.fetchConfig(options.oidcIssuer);
        const clientRegistration = await handleRegistration(options, issuerConfig, this.storageUtility, this.clientRegistrar);
        // Construct OIDC Options
        const OidcOptions = {
            // Note that here, the issuer is not the one from the received options, but
            // from the issuer's config. This enforces the canonical URL is used and stored,
            // which is also the one present in the ID token, so storing a technically
            // valid, but different issuer URL (e.g. using a trailing slash or not) now
            // could prevent from validating the ID token later.
            issuer: issuerConfig.issuer,
            // TODO: differentiate if DPoP should be true
            dpop: options.tokenType.toLowerCase() === "dpop",
            ...options,
            issuerConfiguration: issuerConfig,
            client: clientRegistration,
            scopes: normalizeScopes(options.customScopes),
        };
        // Call proper OIDC Handler
        return this.oidcHandler.handle(OidcOptions);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * Authorization code flow spec: https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
 * PKCE: https://tools.ietf.org/html/rfc7636
 */
class AuthorizationCodeWithPkceOidcHandler extends AuthorizationCodeWithPkceOidcHandlerBase {
    async handle(oidcLoginOptions) {
        /* eslint-disable camelcase */
        const oidcOptions = {
            authority: oidcLoginOptions.issuer.toString(),
            client_id: oidcLoginOptions.client.clientId,
            client_secret: oidcLoginOptions.client.clientSecret,
            redirect_uri: oidcLoginOptions.redirectUrl,
            response_type: "code",
            scope: oidcLoginOptions.scopes.join(" "),
            filterProtocolClaims: true,
            // The userinfo endpoint on NSS fails, so disable this for now
            // Note that in Solid, information should be retrieved from the
            // profile referenced by the WebId.
            loadUserInfo: false,
            code_verifier: true,
            prompt: oidcLoginOptions.prompt ?? "consent",
        };
        /* eslint-enable camelcase */
        const oidcClientLibrary = new oidc_client_min.OidcClient(oidcOptions);
        try {
            const signingRequest = await oidcClientLibrary.createSigninRequest();
            // Make sure to await the promise before returning so that the error is caught.
            return await this.setupRedirectHandler({
                oidcLoginOptions,
                // eslint-disable-next-line no-underscore-dangle
                state: signingRequest.state._id,
                // eslint-disable-next-line no-underscore-dangle
                codeVerifier: signingRequest.state._code_verifier,
                targetUrl: signingRequest.url.toString(),
            });
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
        // The login is only completed AFTER redirect, so nothing to return here.
        return undefined;
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const WELL_KNOWN_OPENID_CONFIG = ".well-known/openid-configuration";
/* eslint-disable camelcase */
const issuerConfigKeyMap = {
    issuer: {
        toKey: "issuer",
        convertToUrl: true,
    },
    authorization_endpoint: {
        toKey: "authorizationEndpoint",
        convertToUrl: true,
    },
    token_endpoint: {
        toKey: "tokenEndpoint",
        convertToUrl: true,
    },
    userinfo_endpoint: {
        toKey: "userinfoEndpoint",
        convertToUrl: true,
    },
    jwks_uri: {
        toKey: "jwksUri",
        convertToUrl: true,
    },
    registration_endpoint: {
        toKey: "registrationEndpoint",
        convertToUrl: true,
    },
    end_session_endpoint: {
        toKey: "endSessionEndpoint",
        convertToUrl: true,
    },
    scopes_supported: { toKey: "scopesSupported" },
    response_types_supported: { toKey: "responseTypesSupported" },
    response_modes_supported: { toKey: "responseModesSupported" },
    grant_types_supported: { toKey: "grantTypesSupported" },
    acr_values_supported: { toKey: "acrValuesSupported" },
    subject_types_supported: { toKey: "subjectTypesSupported" },
    id_token_signing_alg_values_supported: {
        toKey: "idTokenSigningAlgValuesSupported",
    },
    id_token_encryption_alg_values_supported: {
        toKey: "idTokenEncryptionAlgValuesSupported",
    },
    id_token_encryption_enc_values_supported: {
        toKey: "idTokenEncryptionEncValuesSupported",
    },
    userinfo_signing_alg_values_supported: {
        toKey: "userinfoSigningAlgValuesSupported",
    },
    userinfo_encryption_alg_values_supported: {
        toKey: "userinfoEncryptionAlgValuesSupported",
    },
    userinfo_encryption_enc_values_supported: {
        toKey: "userinfoEncryptionEncValuesSupported",
    },
    request_object_signing_alg_values_supported: {
        toKey: "requestObjectSigningAlgValuesSupported",
    },
    request_object_encryption_alg_values_supported: {
        toKey: "requestObjectEncryptionAlgValuesSupported",
    },
    request_object_encryption_enc_values_supported: {
        toKey: "requestObjectEncryptionEncValuesSupported",
    },
    token_endpoint_auth_methods_supported: {
        toKey: "tokenEndpointAuthMethodsSupported",
    },
    token_endpoint_auth_signing_alg_values_supported: {
        toKey: "tokenEndpointAuthSigningAlgValuesSupported",
    },
    display_values_supported: { toKey: "displayValuesSupported" },
    claim_types_supported: { toKey: "claimTypesSupported" },
    claims_supported: { toKey: "claimsSupported" },
    service_documentation: { toKey: "serviceDocumentation" },
    claims_locales_supported: { toKey: "claimsLocalesSupported" },
    ui_locales_supported: { toKey: "uiLocalesSupported" },
    claims_parameter_supported: { toKey: "claimsParameterSupported" },
    request_parameter_supported: { toKey: "requestParameterSupported" },
    request_uri_parameter_supported: { toKey: "requestUriParameterSupported" },
    require_request_uri_registration: { toKey: "requireRequestUriRegistration" },
    op_policy_uri: {
        toKey: "opPolicyUri",
        convertToUrl: true,
    },
    op_tos_uri: {
        toKey: "opTosUri",
        convertToUrl: true,
    },
};
/* eslint-enable camelcase */
function processConfig(config) {
    const parsedConfig = {};
    Object.keys(config).forEach((key) => {
        if (issuerConfigKeyMap[key]) {
            // TODO: PMcB55: Validate URL if "issuerConfigKeyMap[key].convertToUrl"
            //  if (issuerConfigKeyMap[key].convertToUrl) {
            //   validateUrl(config[key]);
            //  }
            parsedConfig[issuerConfigKeyMap[key].toKey] = config[key];
        }
    });
    if (!Array.isArray(parsedConfig.scopesSupported)) {
        parsedConfig.scopesSupported = ["openid"];
    }
    return parsedConfig;
}
/**
 * @hidden
 */
class IssuerConfigFetcher {
    storageUtility;
    constructor(storageUtility) {
        this.storageUtility = storageUtility;
        this.storageUtility = storageUtility;
    }
    // This method needs no state (so can be static), and can be exposed to allow
    // callers to know where this implementation puts state it needs.
    static getLocalStorageKey(issuer) {
        return `issuerConfig:${issuer}`;
    }
    async fetchConfig(issuer) {
        let issuerConfig;
        const openIdConfigUrl = new URL(WELL_KNOWN_OPENID_CONFIG, 
        // Make sure to append a slash at issuer URL, so that the .well-known URL
        // includes the full issuer path. See https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig.
        issuer.endsWith("/") ? issuer : `${issuer}/`).href;
        const issuerConfigRequestBody = await fetch(openIdConfigUrl);
        // Check the validity of the fetched config
        try {
            issuerConfig = processConfig(await issuerConfigRequestBody.json());
        }
        catch (err) {
            throw new ConfigurationError(`[${issuer.toString()}] has an invalid configuration: ${err.message}`);
        }
        // Update store with fetched config
        await this.storageUtility.set(IssuerConfigFetcher.getLocalStorageKey(issuer), JSON.stringify(issuerConfig));
        return issuerConfig;
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @param sessionId
 * @param storage
 * @hidden
 */
async function dist_clear(sessionId, storage) {
    await clear(sessionId, storage);
    await clearOidcPersistentStorage();
}
/**
 * @hidden
 */
class SessionInfoManager extends SessionInfoManagerBase {
    async get(sessionId) {
        const [isLoggedIn, webId, clientId, clientSecret, redirectUrl, refreshToken, issuer, tokenType,] = await Promise.all([
            this.storageUtility.getForUser(sessionId, "isLoggedIn", {
                secure: true,
            }),
            this.storageUtility.getForUser(sessionId, "webId", {
                secure: true,
            }),
            this.storageUtility.getForUser(sessionId, "clientId", {
                secure: false,
            }),
            this.storageUtility.getForUser(sessionId, "clientSecret", {
                secure: false,
            }),
            this.storageUtility.getForUser(sessionId, "redirectUrl", {
                secure: false,
            }),
            this.storageUtility.getForUser(sessionId, "refreshToken", {
                secure: true,
            }),
            this.storageUtility.getForUser(sessionId, "issuer", {
                secure: false,
            }),
            this.storageUtility.getForUser(sessionId, "tokenType", {
                secure: false,
            }),
        ]);
        if (typeof redirectUrl === "string" && !isValidRedirectUrl(redirectUrl)) {
            // This resolves the issue for people experiencing https://github.com/inrupt/solid-client-authn-js/issues/2891.
            // An invalid redirect URL is present in the storage, and the session should
            // be cleared to get a fresh start. This will require the user to log back in.
            await Promise.all([
                this.storageUtility.deleteAllUserData(sessionId, { secure: false }),
                this.storageUtility.deleteAllUserData(sessionId, { secure: true }),
            ]);
            return undefined;
        }
        if (tokenType !== undefined && !isSupportedTokenType(tokenType)) {
            throw new Error(`Tokens of type [${tokenType}] are not supported.`);
        }
        if (clientId === undefined &&
            isLoggedIn === undefined &&
            webId === undefined &&
            refreshToken === undefined) {
            return undefined;
        }
        return {
            sessionId,
            webId,
            isLoggedIn: isLoggedIn === "true",
            redirectUrl,
            refreshToken,
            issuer,
            clientAppId: clientId,
            clientAppSecret: clientSecret,
            // Default the token type to DPoP if unspecified.
            tokenType: tokenType ?? "DPoP",
        };
    }
    /**
     * This function removes all session-related information from storage.
     * @param sessionId the session identifier
     * @param storage the storage where session info is stored
     * @hidden
     */
    async clear(sessionId) {
        return dist_clear(sessionId, this.storageUtility);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * This class handles redirect IRIs without any query params, and returns an unauthenticated
 * session. It serves as a fallback so that consuming libraries don't have to test
 * for the query params themselves, and can always try to use them as a redirect IRI.
 * @hidden
 */
class FallbackRedirectHandler {
    async canHandle(redirectUrl) {
        try {
            // The next URL object is built for validating it.
            // eslint-disable-next-line no-new
            new URL(redirectUrl);
            return true;
        }
        catch (e) {
            throw new Error(`[${redirectUrl}] is not a valid URL, and cannot be used as a redirect URL: ${e}`);
        }
    }
    async handle(
    // The argument is ignored, but must be present to implement the interface
    _redirectUrl) {
        return getUnauthenticatedSession();
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class AuthCodeRedirectHandler {
    storageUtility;
    sessionInfoManager;
    issuerConfigFetcher;
    clientRegistrar;
    tokerRefresher;
    constructor(storageUtility, sessionInfoManager, issuerConfigFetcher, clientRegistrar, tokerRefresher) {
        this.storageUtility = storageUtility;
        this.sessionInfoManager = sessionInfoManager;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.clientRegistrar = clientRegistrar;
        this.tokerRefresher = tokerRefresher;
        this.storageUtility = storageUtility;
        this.sessionInfoManager = sessionInfoManager;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.clientRegistrar = clientRegistrar;
        this.tokerRefresher = tokerRefresher;
    }
    async canHandle(redirectUrl) {
        try {
            const myUrl = new URL(redirectUrl);
            return (myUrl.searchParams.get("code") !== null &&
                myUrl.searchParams.get("state") !== null);
        }
        catch (e) {
            throw new Error(`[${redirectUrl}] is not a valid URL, and cannot be used as a redirect URL: ${e}`);
        }
    }
    async handle(redirectUrl, eventEmitter) {
        if (!(await this.canHandle(redirectUrl))) {
            throw new Error(`AuthCodeRedirectHandler cannot handle [${redirectUrl}]: it is missing one of [code, state].`);
        }
        const url = new URL(redirectUrl);
        const oauthState = url.searchParams.get("state");
        const storedSessionId = (await this.storageUtility.getForUser(oauthState, "sessionId", {
            errorIfNull: true,
        }));
        const { issuerConfig, codeVerifier, redirectUrl: storedRedirectIri, dpop: isDpop, } = await loadOidcContextFromStorage(storedSessionId, this.storageUtility, this.issuerConfigFetcher);
        const iss = url.searchParams.get("iss");
        if (typeof iss === "string" && iss !== issuerConfig.issuer) {
            throw new Error(`The value of the iss parameter (${iss}) does not match the issuer identifier of the authorization server (${issuerConfig.issuer}). See [rfc9207](https://www.rfc-editor.org/rfc/rfc9207.html#section-2.3-3.1.1)`);
        }
        if (codeVerifier === undefined) {
            throw new Error(`The code verifier for session ${storedSessionId} is missing from storage.`);
        }
        if (storedRedirectIri === undefined) {
            throw new Error(`The redirect URL for session ${storedSessionId} is missing from storage.`);
        }
        const client = await this.clientRegistrar.getClient({ sessionId: storedSessionId }, issuerConfig);
        const tokenCreatedAt = Date.now();
        const tokens = await getTokens(issuerConfig, client, {
            grantType: "authorization_code",
            // We rely on our 'canHandle' function checking that the OAuth 'code'
            // parameter is present in our query string.
            code: url.searchParams.get("code"),
            codeVerifier,
            redirectUrl: storedRedirectIri,
        }, isDpop);
        // Delete oidc-client-specific session information from storage. oidc-client
        // is no longer used for the token exchange, so it doesn't perform this automatically.
        window.localStorage.removeItem(`oidc.${oauthState}`);
        let refreshOptions;
        if (tokens.refreshToken !== undefined) {
            refreshOptions = {
                sessionId: storedSessionId,
                refreshToken: tokens.refreshToken,
                tokenRefresher: this.tokerRefresher,
            };
        }
        const authFetch = buildAuthenticatedFetch(tokens.accessToken, {
            dpopKey: tokens.dpopKey,
            refreshOptions,
            eventEmitter,
            expiresIn: tokens.expiresIn,
        });
        await saveSessionInfoToStorage(this.storageUtility, storedSessionId, tokens.webId, tokens.clientId, "true", undefined, true);
        const sessionInfo = await this.sessionInfoManager.get(storedSessionId);
        if (!sessionInfo) {
            throw new Error(`Could not retrieve session: [${storedSessionId}].`);
        }
        return Object.assign(sessionInfo, {
            fetch: authFetch,
            getLogoutUrl: maybeBuildRpInitiatedLogout({
                idTokenHint: tokens.idToken,
                endSessionEndpoint: issuerConfig.endSessionEndpoint,
            }),
            expirationDate: typeof tokens.expiresIn === "number"
                ? tokenCreatedAt + tokens.expiresIn * 1000
                : undefined,
        });
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class AggregateRedirectHandler extends AggregateHandler {
    constructor(redirectHandlers) {
        super(redirectHandlers);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class BrowserStorage {
    get storage() {
        return window.localStorage;
    }
    async get(key) {
        return this.storage.getItem(key) || undefined;
    }
    async set(key, value) {
        this.storage.setItem(key, value);
    }
    async delete(key) {
        this.storage.removeItem(key);
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class Redirector {
    redirect(redirectUrl, options) {
        if (options && options.handleRedirect) {
            options.handleRedirect(redirectUrl);
        }
        else if (options && options.redirectByReplacingState) {
            window.history.replaceState({}, "", redirectUrl);
        }
        else {
            window.location.href = redirectUrl;
        }
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 */
class ClientRegistrar {
    storageUtility;
    constructor(storageUtility) {
        this.storageUtility = storageUtility;
        this.storageUtility = storageUtility;
    }
    async getClient(options, issuerConfig) {
        // If client secret and/or client id are stored in storage, use those.
        const [storedClientId, storedClientSecret, expiresAt, storedClientName, storedClientType,] = await Promise.all([
            this.storageUtility.getForUser(options.sessionId, "clientId", {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, "clientSecret", {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, "expiresAt", {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, "clientName", {
                secure: false,
            }),
            this.storageUtility.getForUser(options.sessionId, "clientType", {
                secure: false,
            }),
        ]);
        // -1 is used as a default to identify legacy cases when a value should
        // have been stored, but wasn't. It will be treated as an expired client.
        const expirationDate = expiresAt !== undefined ? Number.parseInt(expiresAt, 10) : -1;
        // Expiration is only applicable to confidential clients.
        // If the client registration never expires, then the expirationDate is 0.
        // Note that Date.now() is in milliseconds, and expirationDate in seconds.
        const expired = storedClientSecret !== undefined &&
            expirationDate !== 0 &&
            Math.floor(Date.now() / 1000) > expirationDate;
        if (storedClientId && isKnownClientType(storedClientType) && !expired) {
            return storedClientSecret !== undefined
                ? {
                    clientId: storedClientId,
                    clientSecret: storedClientSecret,
                    clientName: storedClientName,
                    // Note: static clients are not applicable in a browser context.
                    clientType: "dynamic",
                    expiresAt: expirationDate,
                }
                : {
                    clientId: storedClientId,
                    clientName: storedClientName,
                    // Note: static clients are not applicable in a browser context.
                    clientType: storedClientType,
                    // The type assertion is required even though the type should match the declaration.
                };
        }
        try {
            const registeredClient = await registerClient(options, issuerConfig);
            // Save info
            const infoToSave = {
                clientId: registeredClient.clientId,
                clientType: "dynamic",
            };
            if (registeredClient.clientSecret !== undefined) {
                infoToSave.clientSecret = registeredClient.clientSecret;
                infoToSave.expiresAt = String(registeredClient.expiresAt);
            }
            if (registeredClient.idTokenSignedResponseAlg) {
                infoToSave.idTokenSignedResponseAlg =
                    registeredClient.idTokenSignedResponseAlg;
            }
            await this.storageUtility.setForUser(options.sessionId, infoToSave, {
                // FIXME: figure out how to persist secure storage at reload
                // Otherwise, the client info cannot be retrieved from storage, and
                // the lib tries to re-register the client on each fetch
                secure: false,
            });
            return registeredClient;
        }
        catch (error) {
            throw new Error(`Client registration failed.`, { cause: error });
        }
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * This class handles redirect IRIs without any query params, and returns an unauthenticated
 * session. It serves as a fallback so that consuming libraries don't have to test
 * for the query params themselves, and can always try to use them as a redirect IRI.
 * @hidden
 */
class ErrorOidcHandler {
    async canHandle(redirectUrl) {
        try {
            // eslint-disable-next-line no-new
            return new URL(redirectUrl).searchParams.has("error");
        }
        catch (e) {
            throw new Error(`[${redirectUrl}] is not a valid URL, and cannot be used as a redirect URL: ${e}`);
        }
    }
    async handle(redirectUrl, eventEmitter) {
        if (eventEmitter !== undefined) {
            const url = new URL(redirectUrl);
            const errorUrl = url.searchParams.get("error");
            const errorDescriptionUrl = url.searchParams.get("error_description");
            eventEmitter.emit(EVENTS.ERROR, errorUrl, errorDescriptionUrl);
        }
        return getUnauthenticatedSession();
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// Some identifiers are not in camelcase on purpose, as they are named using the
// official names from the OIDC/OAuth2 specifications.
/* eslint-disable camelcase */
/**
 * @hidden
 */
class TokenRefresher {
    storageUtility;
    issuerConfigFetcher;
    clientRegistrar;
    constructor(storageUtility, issuerConfigFetcher, clientRegistrar) {
        this.storageUtility = storageUtility;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.clientRegistrar = clientRegistrar;
        this.storageUtility = storageUtility;
        this.issuerConfigFetcher = issuerConfigFetcher;
        this.clientRegistrar = clientRegistrar;
    }
    async refresh(sessionId, refreshToken, dpopKey, eventEmitter) {
        const oidcContext = await loadOidcContextFromStorage(sessionId, this.storageUtility, this.issuerConfigFetcher);
        // This should also retrieve the client from storage
        const clientInfo = await this.clientRegistrar.getClient({ sessionId }, oidcContext.issuerConfig);
        if (refreshToken === undefined) {
            // TODO: in a next PR, look up storage for a refresh token
            throw new Error(`Session [${sessionId}] has no refresh token to allow it to refresh its access token.`);
        }
        if (oidcContext.dpop && dpopKey === undefined) {
            throw new Error(`For session [${sessionId}], the key bound to the DPoP access token must be provided to refresh said access token.`);
        }
        const tokenSet = await refresh(refreshToken, oidcContext.issuerConfig, clientInfo, dpopKey);
        if (tokenSet.refreshToken !== undefined) {
            eventEmitter?.emit(EVENTS.NEW_REFRESH_TOKEN, tokenSet.refreshToken);
        }
        return tokenSet;
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @param dependencies
 * @hidden
 */
function getClientAuthenticationWithDependencies(dependencies) {
    const inMemoryStorage = new InMemoryStorage();
    const secureStorage = dependencies.secureStorage || inMemoryStorage;
    const insecureStorage = dependencies.insecureStorage || new BrowserStorage();
    const storageUtility = new StorageUtilityBrowser(secureStorage, insecureStorage);
    const issuerConfigFetcher = new IssuerConfigFetcher(storageUtility);
    const clientRegistrar = new ClientRegistrar(storageUtility);
    const sessionInfoManager = new SessionInfoManager(storageUtility);
    const tokenRefresher = new TokenRefresher(storageUtility, issuerConfigFetcher, clientRegistrar);
    const redirector = new Redirector();
    // make new handler for redirect and login
    const loginHandler = new OidcLoginHandler(storageUtility, new AuthorizationCodeWithPkceOidcHandler(storageUtility, redirector), issuerConfigFetcher, clientRegistrar);
    const redirectHandler = new AggregateRedirectHandler([
        new ErrorOidcHandler(),
        new AuthCodeRedirectHandler(storageUtility, sessionInfoManager, issuerConfigFetcher, clientRegistrar, tokenRefresher),
        // This catch-all class will always be able to handle the
        // redirect IRI, so it must be registered last.
        new FallbackRedirectHandler(),
    ]);
    return new ClientAuthentication(loginHandler, redirectHandler, new IWaterfallLogoutHandler(sessionInfoManager, redirector), sessionInfoManager, issuerConfigFetcher);
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const KEY_CURRENT_SESSION = `${SOLID_CLIENT_AUTHN_KEY_PREFIX}currentSession`;
const KEY_CURRENT_URL = `${SOLID_CLIENT_AUTHN_KEY_PREFIX}currentUrl`;

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
async function silentlyAuthenticate(sessionId, clientAuthn, session) {
    const storedSessionInfo = await clientAuthn.validateCurrentSession(sessionId);
    if (storedSessionInfo !== null) {
        // It can be really useful to save the user's current browser location,
        // so that we can restore it after completing the silent authentication
        // on incoming redirect. This way, the user is eventually redirected back
        // to the page they were on and not to the app's redirect page.
        window.localStorage.setItem(KEY_CURRENT_URL, window.location.href);
        await clientAuthn.login({
            sessionId,
            prompt: "none",
            oidcIssuer: storedSessionInfo.issuer,
            redirectUrl: storedSessionInfo.redirectUrl,
            clientId: storedSessionInfo.clientAppId,
            clientSecret: storedSessionInfo.clientAppSecret,
            tokenType: storedSessionInfo.tokenType ?? "DPoP",
        }, session.events);
        return true;
    }
    return false;
}
function isLoggedIn(sessionInfo) {
    return !!sessionInfo?.isLoggedIn;
}
/**
 * A {@link Session} object represents a user's session on an application. The session holds state, as it stores information enabling access to private resources after login for instance.
 */
class Session {
    /**
     * Information regarding the current session.
     */
    info;
    /**
     * Session attribute exposing the EventEmitter interface, to listen on session
     * events such as login, logout, etc.
     * @since 1.15.0
     */
    events;
    clientAuthentication;
    tokenRequestInProgress = false;
    /**
     * Session object constructor. Typically called as follows:
     *
     * ```typescript
     * const session = new Session();
     * ```
     *
     * See also [getDefaultSession](https://docs.inrupt.com/developer-tools/api/javascript/solid-client-authn-browser/functions.html#getdefaultsession).
     *
     * @param sessionOptions The options enabling the correct instantiation of
     * the session. Either both storages or clientAuthentication are required. For
     * more information, see {@link ISessionOptions}.
     * @param sessionId A string uniquely identifying the session.
     *
     */
    constructor(sessionOptions = {}, sessionId = undefined) {
        this.events = new events();
        if (sessionOptions.clientAuthentication) {
            this.clientAuthentication = sessionOptions.clientAuthentication;
        }
        else if (sessionOptions.secureStorage && sessionOptions.insecureStorage) {
            this.clientAuthentication = getClientAuthenticationWithDependencies({
                secureStorage: sessionOptions.secureStorage,
                insecureStorage: sessionOptions.insecureStorage,
            });
        }
        else {
            this.clientAuthentication = getClientAuthenticationWithDependencies({});
        }
        if (sessionOptions.sessionInfo) {
            this.info = {
                sessionId: sessionOptions.sessionInfo.sessionId,
                isLoggedIn: false,
                webId: sessionOptions.sessionInfo.webId,
                clientAppId: sessionOptions.sessionInfo.clientAppId,
            };
        }
        else {
            this.info = {
                sessionId: sessionId ?? esm_browser_v4(),
                isLoggedIn: false,
            };
        }
        // When a session is logged in, we want to track its ID in local storage to
        // enable silent refresh. The current session ID specifically stored in 'localStorage'
        // (as opposed to using our storage abstraction layer) because it is only
        // used in a browser-specific mechanism.
        this.events.on(EVENTS.LOGIN, () => window.localStorage.setItem(KEY_CURRENT_SESSION, this.info.sessionId));
        this.events.on(EVENTS.SESSION_EXPIRED, () => this.internalLogout(false));
        this.events.on(EVENTS.ERROR, () => this.internalLogout(false));
    }
    /**
     * Triggers the login process. Note that this method will redirect the user away from your app.
     *
     * @param options Parameter to customize the login behaviour. In particular, two options are mandatory: `options.oidcIssuer`, the user's identity provider, and `options.redirectUrl`, the URL to which the user will be redirected after logging in their identity provider.
     * @returns This method should redirect the user away from the app: it does not return anything. The login process is completed by {@linkcode handleIncomingRedirect}.
     */
    // Define these functions as properties so that they don't get accidentally re-bound.
    // Isn't Javascript fun?
    login = async (options) => {
        await this.clientAuthentication.login({
            sessionId: this.info.sessionId,
            ...options,
            // Defaults the token type to DPoP
            tokenType: options.tokenType ?? "DPoP",
        }, this.events);
        // `login` redirects the user away from the app,
        // so unless it throws an error, there is no code that should run afterwards
        // (since there is no "after" in the lifetime of the script).
        // Hence, this Promise never resolves:
        return new Promise(() => { });
    };
    /**
     * Fetches data using available login information. If the user is not logged in, this will behave as a regular `fetch`. The signature of this method is identical to the [canonical `fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
     *
     * @param url The URL from which data should be fetched.
     * @param init Optional parameters customizing the request, by specifying an HTTP method, headers, a body, etc. Follows the [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/).
     */
    fetch = (url, init) => this.clientAuthentication.fetch(url, init);
    /**
     * An internal logout function, to control whether or not the logout signal
     * should be sent, i.e. if the logout was user-initiated or is the result of
     * an external event.
     *
     * @hidden
     */
    internalLogout = async (emitSignal, options) => {
        // Clearing this value means that silent refresh will no longer be attempted.
        // In particular, in the case of a silent authentication error it prevents
        // from getting stuck in an authentication retries loop.
        window.localStorage.removeItem(KEY_CURRENT_SESSION);
        await this.clientAuthentication.logout(this.info.sessionId, options);
        this.info.isLoggedIn = false;
        if (emitSignal) {
            this.events.emit(EVENTS.LOGOUT);
        }
    };
    /**
     * Logs the user out of the application.
     *
     * There are 2 types of logout supported by this library,
     * `app` logout and `idp` logout.
     *
     * App logout will log the user out within the application
     * by clearing any session data from the browser. It does
     * not log the user out of their Solid identity provider,
     * and should not redirect the user away.
     * App logout can be performed as follows:
     * ```typescript
     * await session.logout({ logoutType: 'app' });
     * ```
     *
     * IDP logout will log the user out of their Solid identity provider,
     * and will redirect the user away from the application to do so. In order
     * for users to be redirected back to `postLogoutUrl` you MUST include the
     * `postLogoutUrl` value in the `post_logout_redirect_uris` field in the
     * [Client ID Document](https://docs.inrupt.com/ess/latest/security/authentication/#client-identifier-client-id).
     * IDP logout can be performed as follows:
     * ```typescript
     * await session.logout({
     *  logoutType: 'idp',
     *  // An optional URL to redirect to after logout has completed;
     *  // this MUST match a logout URL listed in the Client ID Document
     *  // of the application that is logged in.
     *  // If the application is logged in with a Client ID that is not
     *  // a URI dereferencing to a Client ID Document then users will
     *  // not be redirected back to the `postLogoutUrl` after logout.
     *  postLogoutUrl: 'https://example.com/logout',
     *  // An optional value to be included in the query parameters
     *  // when the IDP provider redirects the user to the postLogoutRedirectUrl.
     *  state: "my-state"
     * });
     * ```
     */
    logout = async (options) => this.internalLogout(true, options);
    /**
     * Completes the login process by processing the information provided by the
     * Solid identity provider through redirect.
     *
     * @param options See {@link IHandleIncomingRedirectOptions}.
     */
    handleIncomingRedirect = async (inputOptions = {}) => {
        if (this.info.isLoggedIn) {
            return this.info;
        }
        if (this.tokenRequestInProgress) {
            return undefined;
        }
        const options = typeof inputOptions === "string" ? { url: inputOptions } : inputOptions;
        const url = options.url ?? window.location.href;
        this.tokenRequestInProgress = true;
        const sessionInfo = await this.clientAuthentication.handleIncomingRedirect(url, this.events);
        if (isLoggedIn(sessionInfo)) {
            this.setSessionInfo(sessionInfo);
            const currentUrl = window.localStorage.getItem(KEY_CURRENT_URL);
            if (currentUrl === null) {
                // The login event can only be triggered **after** the user has been
                // redirected from the IdP with access and ID tokens.
                this.events.emit(EVENTS.LOGIN);
            }
            else {
                // If an URL is stored in local storage, we are being logged in after a
                // silent authentication, so remove our currently stored URL location
                // to clean up our state now that we are completing the re-login process.
                window.localStorage.removeItem(KEY_CURRENT_URL);
                this.events.emit(EVENTS.SESSION_RESTORED, currentUrl);
            }
        }
        else if (options.restorePreviousSession === true) {
            // Silent authentication happens after a refresh, which means there are no
            // OAuth params in the current location IRI. It can only succeed if a session
            // was previously logged in, in which case its ID will be present with a known
            // identifier in local storage.
            // Check if we have a locally stored session ID...
            const storedSessionId = window.localStorage.getItem(KEY_CURRENT_SESSION);
            // ...if not, then there is no ID token, and so silent authentication cannot happen, but
            // if we do have a stored session ID, attempt to re-authenticate now silently.
            if (storedSessionId !== null) {
                const attemptedSilentAuthentication = await silentlyAuthenticate(storedSessionId, this.clientAuthentication, this);
                // At this point, we know that the main window will imminently be redirected.
                // However, this redirect is asynchronous and there is no way to halt execution
                // until it happens precisely. That's why the current Promise simply does not
                // resolve.
                if (attemptedSilentAuthentication) {
                    return new Promise(() => { });
                }
            }
        }
        this.tokenRequestInProgress = false;
        return sessionInfo;
    };
    setSessionInfo(sessionInfo) {
        this.info.isLoggedIn = sessionInfo.isLoggedIn;
        this.info.webId = sessionInfo.webId;
        this.info.sessionId = sessionInfo.sessionId;
        this.info.clientAppId = sessionInfo.clientAppId;
        this.info.expirationDate = sessionInfo.expirationDate;
        this.events.on(EVENTS.SESSION_EXTENDED, (expiresIn) => {
            this.info.expirationDate = Date.now() + expiresIn * 1000;
        });
    }
}

const authSession = new Session();
const external_rdflib_namespaceObject = __WEBPACK_EXTERNAL_MODULE_rdflib__;
// EXTERNAL MODULE: ./node_modules/solid-namespace/index.js
var solid_namespace = __webpack_require__(386);
var solid_namespace_default = /*#__PURE__*/__webpack_require__.n(solid_namespace);
// Namespaces we commonly use and have common prefixes for around Solid
 // Delegate to this which takes RDFlib as param.

const ns_ns = solid_namespace_default()(external_rdflib_namespaceObject);


const ACL_LINK = (0, external_rdflib_namespaceObject.sym)('http://www.iana.org/assignments/link-relations/acl');
function createAclLogic(store) {
    const ns = ns_ns;
    async function findAclDocUrl(url) {
        await store.fetcher.load(url);
        const docNode = store.any(url, ACL_LINK);
        if (!docNode) {
            throw new Error(`No ACL link discovered for ${url}`);
        }
        return docNode.value;
    }
    /**
     * Simple Access Control
     *
     * This function sets up a simple default ACL for a resource, with
     * RWC for the owner, and a specified access (default none) for the public.
     * In all cases owner has read write control.
     * Parameter lists modes allowed to public
     *
     * @param options
     * @param options.public eg ['Read', 'Write']
     *
     * @returns Resolves with aclDoc uri on successful write
     */
    function setACLUserPublic(docURI, me, options) {
        const aclDoc = store.any(store.sym(docURI), ACL_LINK);
        return Promise.resolve()
            .then(() => {
            if (aclDoc) {
                return aclDoc;
            }
            return fetchACLRel(docURI).catch(err => {
                throw new Error(`Error fetching rel=ACL header for ${docURI}: ${err}`);
            });
        })
            .then(aclDoc => {
            const aclText = genACLText(docURI, me, aclDoc.uri, options);
            if (!store.fetcher) {
                throw new Error('Cannot PUT this, store has no fetcher');
            }
            return store.fetcher
                .webOperation('PUT', aclDoc.uri, {
                data: aclText,
                contentType: 'text/turtle'
            })
                .then(result => {
                if (!result.ok) {
                    throw new Error('Error writing ACL text: ' + result.error);
                }
                return aclDoc;
            });
        });
    }
    /**
     * @param docURI
     * @returns
     */
    function fetchACLRel(docURI) {
        const fetcher = store.fetcher;
        if (!fetcher) {
            throw new Error('Cannot fetch ACL rel, store has no fetcher');
        }
        return fetcher.load(docURI).then(result => {
            if (!result.ok) {
                throw new Error('fetchACLRel: While loading:' + result.error);
            }
            const aclDoc = store.any(store.sym(docURI), ACL_LINK);
            if (!aclDoc) {
                throw new Error('fetchACLRel: No Link rel=ACL header for ' + docURI);
            }
            return aclDoc;
        });
    }
    /**
     * @param docURI
     * @param me
     * @param aclURI
     * @param options
     *
     * @returns Serialized ACL
     */
    function genACLText(docURI, me, aclURI, options = {}) {
        const optPublic = options.public || [];
        const g = (0, external_rdflib_namespaceObject.graph)();
        const auth = (0, external_rdflib_namespaceObject.Namespace)('http://www.w3.org/ns/auth/acl#');
        let a = g.sym(`${aclURI}#a1`);
        const acl = g.sym(aclURI);
        const doc = g.sym(docURI);
        g.add(a, ns.rdf('type'), auth('Authorization'), acl);
        g.add(a, auth('accessTo'), doc, acl);
        if (options.defaultForNew) {
            g.add(a, auth('default'), doc, acl);
        }
        g.add(a, auth('agent'), me, acl);
        g.add(a, auth('mode'), auth('Read'), acl);
        g.add(a, auth('mode'), auth('Write'), acl);
        g.add(a, auth('mode'), auth('Control'), acl);
        if (optPublic.length) {
            a = g.sym(`${aclURI}#a2`);
            g.add(a, ns.rdf('type'), auth('Authorization'), acl);
            g.add(a, auth('accessTo'), doc, acl);
            g.add(a, auth('agentClass'), ns.foaf('Agent'), acl);
            for (let p = 0; p < optPublic.length; p++) {
                g.add(a, auth('mode'), auth(optPublic[p]), acl); // Like 'Read' etc
            }
        }
        return (0, external_rdflib_namespaceObject.serialize)(acl, g, aclURI);
    }
    return {
        findAclDocUrl,
        setACLUserPublic,
        genACLText
    };
}


/**
 * find a user or app's context as set in window.SolidAppContext
 * this is a const, not a function, because we have problems to jest mock it otherwise
 * see: https://github.com/facebook/jest/issues/936#issuecomment-545080082 for more
 * @return {any} - an appContext object
 */
const appContext = () => {
    let { SolidAppContext } = window;
    SolidAppContext || (SolidAppContext = {});
    SolidAppContext.viewingNoAuthPage = false;
    if (SolidAppContext.noAuth && window.document) {
        const currentPage = window.document.location.href;
        if (currentPage.startsWith(SolidAppContext.noAuth)) {
            SolidAppContext.viewingNoAuthPage = true;
            const params = new URLSearchParams(window.document.location.search);
            if (params) {
                let viewedPage = SolidAppContext.viewedPage = params.get('uri') || null;
                if (viewedPage) {
                    viewedPage = decodeURI(viewedPage);
                    if (!viewedPage.startsWith(SolidAppContext.noAuth)) {
                        const ary = viewedPage.split(/\//);
                        SolidAppContext.idp = ary[0] + '//' + ary[2];
                        SolidAppContext.viewingNoAuthPage = false;
                    }
                }
            }
        }
    }
    return SolidAppContext;
};
/**
 * Returns `sym($SolidTestEnvironment.username)` if
 * `$SolidTestEnvironment.username` is defined as a global
 * or
 * returns testID defined in the HTML page
 * @returns {NamedNode|null}
 */
function offlineTestID() {
    const { $SolidTestEnvironment } = window;
    if (typeof $SolidTestEnvironment !== 'undefined' &&
        $SolidTestEnvironment.username) {
        // Test setup
        log('Assuming the user is ' + $SolidTestEnvironment.username);
        return (0, external_rdflib_namespaceObject.sym)($SolidTestEnvironment.username);
    }
    // hack that makes SolidOS work in offline mode by adding the webId directly in html
    // example usage: https://github.com/solidos/mashlib/blob/29b8b53c46bf02e0e219f0bacd51b0e9951001dd/test/contact/local.html#L37
    if (typeof document !== 'undefined' &&
        document.location &&
        ('' + document.location).slice(0, 16) === 'http://localhost') {
        const div = document.getElementById('appTarget');
        if (!div)
            return null;
        const id = div.getAttribute('testID');
        if (!id)
            return null;
        log('Assuming user is ' + id);
        return (0, external_rdflib_namespaceObject.sym)(id);
    }
    return null;
}




class SolidAuthnLogic {
    constructor(solidAuthSession) {
        this.session = solidAuthSession;
    }
    // we created authSession getter because we want to access it as authn.authSession externally
    get authSession() { return this.session; }
    currentUser() {
        const app = appContext();
        if (app.viewingNoAuthPage) {
            return (0, external_rdflib_namespaceObject.sym)(app.webId);
        }
        if (this && this.session && this.session.info && this.session.info.webId && this.session.info.isLoggedIn) {
            return (0, external_rdflib_namespaceObject.sym)(this.session.info.webId);
        }
        return offlineTestID(); // null unless testing
    }
    /**
     * Retrieves currently logged in webId from either
     * defaultTestUser or SolidAuth
     * Also activates a session after login
     * @param [setUserCallback] Optional callback
     * @returns Resolves with webId uri, if no callback provided
     */
    async checkUser(setUserCallback) {
        // Save hash for "restorePreviousSession"
        const preLoginRedirectHash = new URL(window.location.href).hash;
        if (preLoginRedirectHash) {
            window.localStorage.setItem('preLoginRedirectHash', preLoginRedirectHash);
        }
        this.session.events.on(EVENTS.SESSION_RESTORED, (url) => {
            log(`Session restored to ${url}`);
            if (document.location.toString() !== url)
                history.replaceState(null, '', url);
        });
        /**
         * Handle a successful authentication redirect
         */
        const redirectUrl = new URL(window.location.href);
        redirectUrl.hash = '';
        await this.session
            .handleIncomingRedirect({
            restorePreviousSession: true,
            url: redirectUrl.href
        });
        // Check to see if a hash was stored in local storage
        const postLoginRedirectHash = window.localStorage.getItem('preLoginRedirectHash');
        if (postLoginRedirectHash) {
            const curUrl = new URL(window.location.href);
            if (curUrl.hash !== postLoginRedirectHash) {
                if (history.pushState) {
                    // debug.log('Setting window.location.has using pushState')
                    history.pushState(null, document.title, postLoginRedirectHash);
                }
                else {
                    // debug.warn('Setting window.location.has using location.hash')
                    location.hash = postLoginRedirectHash;
                }
                curUrl.hash = postLoginRedirectHash;
            }
            // See https://stackoverflow.com/questions/3870057/how-can-i-update-window-location-hash-without-jumping-the-document
            // window.location.href = curUrl.toString()// @@ See https://developer.mozilla.org/en-US/docs/Web/API/Window/location
            window.localStorage.setItem('preLoginRedirectHash', '');
        }
        // Check to see if already logged in / have the WebID
        let me = offlineTestID();
        if (me) {
            return Promise.resolve(setUserCallback ? setUserCallback(me) : me);
        }
        const webId = this.webIdFromSession(this.session.info);
        if (webId) {
            me = this.saveUser(webId);
        }
        if (me) {
            log(`(Logged in as ${me} by authentication)`);
        }
        return Promise.resolve(setUserCallback ? setUserCallback(me) : me);
    }
    /**
     * Saves `webId` in `context.me`
     * @param webId
     * @param context
     *
     * @returns Returns the WebID, after setting it
     */
    saveUser(webId, context) {
        let webIdUri;
        if (webId) {
            webIdUri = (typeof webId === 'string') ? webId : webId.uri;
            const me = (0, external_rdflib_namespaceObject.namedNode)(webIdUri);
            if (context) {
                context.me = me;
            }
            return me;
        }
        return null;
    }
    /**
     * @returns {Promise<string|null>} Resolves with WebID URI or null
     */
    webIdFromSession(session) {
        const webId = (session === null || session === void 0 ? void 0 : session.webId) && session.isLoggedIn ? session.webId : null;
        return webId;
    }
}

function newThing(doc) {
    return (0, external_rdflib_namespaceObject.sym)(doc.uri + '#' + 'id' + ('' + Date.now()));
}
function getArchiveUrl(baseUrl, date) {
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + (date.getUTCDate())).slice(-2);
    const parts = baseUrl.split('/');
    const filename = parts[parts.length - 1];
    return new URL(`./archive/${year}/${month}/${day}/${filename}`, baseUrl).toString();
}
function differentOrigin(doc) {
    if (!doc) {
        return true;
    }
    return (`${window.location.origin}/` !== new URL(doc.value).origin);
}
function suggestPreferencesFile(me) {
    const stripped = me.uri.replace('/profile/', '/').replace('/public/', '/');
    // const stripped = me.uri.replace(\/[p|P]rofile/\g, '/').replace(\/[p|P]ublic/\g, '/')
    const folderURI = stripped.split('/').slice(0, -1).join('/') + '/Settings/';
    const fileURI = folderURI + 'Preferences.ttl';
    return (0, external_rdflib_namespaceObject.sym)(fileURI);
}
function determineChatContainer(invitee, podRoot) {
    // Create chat
    // See https://gitter.im/solid/chat-app?at=5f3c800f855be416a23ae74a
    const chatContainerStr = new URL(`IndividualChats/${new URL(invitee.value).host}/`, podRoot.value).toString();
    return new external_rdflib_namespaceObject.NamedNode(chatContainerStr);
}



const CHAT_LOCATION_IN_CONTAINER = 'index.ttl#this';
function createChatLogic(store, profileLogic) {
    const ns = ns_ns;
    async function setAcl(chatContainer, me, invitee) {
        // Some servers don't present a Link http response header
        // if the container doesn't exist yet, so refetch the container
        // now that it has been created:
        await store.fetcher.load(chatContainer);
        // FIXME: check the Why value on this quad:
        const chatAclDoc = store.any(chatContainer, new external_rdflib_namespaceObject.NamedNode('http://www.iana.org/assignments/link-relations/acl'));
        if (!chatAclDoc) {
            throw new Error('Chat ACL doc not found!');
        }
        const aclBody = `
            @prefix acl: <http://www.w3.org/ns/auth/acl#>.
            <#owner>
            a acl:Authorization;
            acl:agent <${me.value}>;
            acl:accessTo <.>;
            acl:default <.>;
            acl:mode
                acl:Read, acl:Write, acl:Control.
            <#invitee>
            a acl:Authorization;
            acl:agent <${invitee.value}>;
            acl:accessTo <.>;
            acl:default <.>;
            acl:mode
                acl:Read, acl:Append.
            `;
        await store.fetcher.webOperation('PUT', chatAclDoc.value, {
            data: aclBody,
            contentType: 'text/turtle',
        });
    }
    async function addToPrivateTypeIndex(chatThing, me) {
        // Add to private type index
        const privateTypeIndex = store.any(me, ns.solid('privateTypeIndex'));
        if (!privateTypeIndex) {
            throw new Error('Private type index not found!');
        }
        await store.fetcher.load(privateTypeIndex);
        const reg = newThing(privateTypeIndex);
        const ins = [
            (0, external_rdflib_namespaceObject.st)(reg, ns.rdf('type'), ns.solid('TypeRegistration'), privateTypeIndex.doc()),
            (0, external_rdflib_namespaceObject.st)(reg, ns.solid('forClass'), ns.meeting('LongChat'), privateTypeIndex.doc()),
            (0, external_rdflib_namespaceObject.st)(reg, ns.solid('instance'), chatThing, privateTypeIndex.doc()),
        ];
        await new Promise((resolve, reject) => {
            store.updater.update([], ins, function (_uri, ok, errm) {
                if (!ok) {
                    reject(new Error(errm));
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    async function findChat(invitee) {
        const me = await profileLogic.loadMe();
        const podRoot = await profileLogic.getPodRoot(me);
        const chatContainer = determineChatContainer(invitee, podRoot);
        let exists = true;
        try {
            await store.fetcher.load(new external_rdflib_namespaceObject.NamedNode(chatContainer.value + 'index.ttl#this'));
        }
        catch (e) {
            exists = false;
        }
        return { me, chatContainer, exists };
    }
    async function createChatThing(chatContainer, me) {
        const created = await mintNew({
            me,
            newBase: chatContainer.value,
        });
        return created.newInstance;
    }
    function mintNew(newPaneOptions) {
        const kb = store;
        const updater = kb.updater;
        if (newPaneOptions.me && !newPaneOptions.me.uri) {
            throw new Error('chat mintNew:  Invalid userid ' + newPaneOptions.me);
        }
        const newInstance = (newPaneOptions.newInstance =
            newPaneOptions.newInstance ||
                kb.sym(newPaneOptions.newBase + CHAT_LOCATION_IN_CONTAINER));
        const newChatDoc = newInstance.doc();
        kb.add(newInstance, ns.rdf('type'), ns.meeting('LongChat'), newChatDoc);
        kb.add(newInstance, ns.dc('title'), 'Chat channel', newChatDoc);
        kb.add(newInstance, ns.dc('created'), (0, external_rdflib_namespaceObject.term)(new Date(Date.now())), newChatDoc);
        if (newPaneOptions.me) {
            kb.add(newInstance, ns.dc('author'), newPaneOptions.me, newChatDoc);
        }
        return new Promise(function (resolve, reject) {
            updater === null || updater === void 0 ? void 0 : updater.put(newChatDoc, kb.statementsMatching(undefined, undefined, undefined, newChatDoc), 'text/turtle', function (uri2, ok, message) {
                if (ok) {
                    resolve({
                        ...newPaneOptions,
                        newInstance,
                    });
                }
                else {
                    reject(new Error('FAILED to save new chat channel at: ' + uri2 + ' : ' + message));
                }
            });
        });
    }
    /**
     * Find (and optionally create) an individual chat between the current user and the given invitee
     * @param invitee - The person to chat with
     * @param createIfMissing - Whether the chat should be created, if missing
     * @returns null if missing, or a node referring to an already existing chat, or the newly created chat
     */
    async function getChat(invitee, createIfMissing = true) {
        const { me, chatContainer, exists } = await findChat(invitee);
        if (exists) {
            return new external_rdflib_namespaceObject.NamedNode(chatContainer.value + CHAT_LOCATION_IN_CONTAINER);
        }
        if (createIfMissing) {
            const chatThing = await createChatThing(chatContainer, me);
            await sendInvite(invitee, chatThing);
            await setAcl(chatContainer, me, invitee);
            await addToPrivateTypeIndex(chatThing, me);
            return chatThing;
        }
        return null;
    }
    async function sendInvite(invitee, chatThing) {
        var _a;
        await store.fetcher.load(invitee.doc());
        const inviteeInbox = store.any(invitee, ns.ldp('inbox'), undefined, invitee.doc());
        if (!inviteeInbox) {
            throw new Error(`Invitee inbox not found! ${invitee.value}`);
        }
        const inviteBody = `
        <> a <http://www.w3.org/ns/pim/meeting#LongChatInvite> ;
        ${ns.rdf('seeAlso')} <${chatThing.value}> .
        `;
        const inviteResponse = await ((_a = store.fetcher) === null || _a === void 0 ? void 0 : _a.webOperation('POST', inviteeInbox.value, {
            data: inviteBody,
            contentType: 'text/turtle',
        }));
        const locationStr = inviteResponse === null || inviteResponse === void 0 ? void 0 : inviteResponse.headers.get('location');
        if (!locationStr) {
            throw new Error(`Invite sending returned a ${inviteResponse === null || inviteResponse === void 0 ? void 0 : inviteResponse.status}`);
        }
    }
    return {
        setAcl, addToPrivateTypeIndex, findChat, createChatThing, getChat, sendInvite, mintNew
    };
}

function createInboxLogic(store, profileLogic, utilityLogic, containerLogic, aclLogic) {
    async function createInboxFor(peerWebId, nick) {
        const myWebId = await profileLogic.loadMe();
        const podRoot = await profileLogic.getPodRoot(myWebId);
        const ourInbox = `${podRoot.value}p2p-inboxes/${encodeURIComponent(nick)}/`;
        await containerLogic.createContainer(ourInbox);
        // const aclDocUrl = await aclLogic.findAclDocUrl(ourInbox);
        await utilityLogic.setSinglePeerAccess({
            ownerWebId: myWebId.value,
            peerWebId,
            accessToModes: 'acl:Append',
            target: ourInbox
        });
        return ourInbox;
    }
    async function getNewMessages(user) {
        if (!user) {
            user = await profileLogic.loadMe();
        }
        const inbox = await profileLogic.getMainInbox(user);
        const urls = await containerLogic.getContainerMembers(inbox);
        return urls.filter(url => !containerLogic.isContainer(url));
    }
    async function markAsRead(url, date) {
        const downloaded = await store.fetcher._fetch(url);
        if (downloaded.status !== 200) {
            throw new Error(`Not OK! ${url}`);
        }
        const archiveUrl = getArchiveUrl(url, date);
        const options = {
            method: 'PUT',
            body: await downloaded.text(),
            headers: [
                ['Content-Type', downloaded.headers.get('Content-Type') || 'application/octet-stream']
            ]
        };
        const uploaded = await store.fetcher._fetch(archiveUrl, options);
        if (uploaded.status.toString()[0] === '2') {
            await store.fetcher._fetch(url, {
                method: 'DELETE'
            });
        }
    }
    return {
        createInboxFor,
        getNewMessages,
        markAsRead
    };
}
class CustomError extends Error {
    constructor(message) {
        super(message);
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = new.target.name; // stack traces display correctly now
    }
}
class UnauthorizedError extends CustomError {
}
class CrossOriginForbiddenError extends CustomError {
}
class SameOriginForbiddenError extends CustomError {
}
class NotFoundError extends CustomError {
}
class NotEditableError extends CustomError {
}
class WebOperationError extends CustomError {
}
class FetchError extends CustomError {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}




function createProfileLogic(store, authn, utilityLogic) {
    const ns = ns_ns;
    /**
     * loads the preference without throwing errors - if it can create it it does so.
     * remark: it still throws error if it cannot load profile.
     * @param user
     * @returns undefined if preferenceFile cannot be returned or NamedNode if it can find it or create it
     */
    async function silencedLoadPreferences(user) {
        try {
            return await loadPreferences(user);
        }
        catch (err) {
            return undefined;
        }
    }
    /**
     * loads the preference without returning different errors if it cannot create or load it.
     * remark: it also throws error if it cannot load profile.
     * @param user
     * @returns undefined if preferenceFile cannot be an Error or NamedNode if it can find it or create it
     */
    async function loadPreferences(user) {
        await loadProfile(user);
        const possiblePreferencesFile = suggestPreferencesFile(user);
        let preferencesFile;
        try {
            preferencesFile = await utilityLogic.followOrCreateLink(user, ns.space('preferencesFile'), possiblePreferencesFile, user.doc());
        }
        catch (err) {
            const message = `User ${user} has no pointer in profile to preferences file.`;
            warn(message);
            // we are listing the possible errors
            if (err instanceof NotEditableError) {
                throw err;
            }
            if (err instanceof WebOperationError) {
                throw err;
            }
            if (err instanceof UnauthorizedError) {
                throw err;
            }
            if (err instanceof CrossOriginForbiddenError) {
                throw err;
            }
            if (err instanceof SameOriginForbiddenError) {
                throw err;
            }
            if (err instanceof FetchError) {
                throw err;
            }
            throw err;
        }
        try {
            await store.fetcher.load(preferencesFile);
        }
        catch (err) { // Maybe a permission problem or origin problem
            const msg = `Unable to load preference of user ${user}: ${err}`;
            warn(msg);
            if (err.response.status === 401) {
                throw new UnauthorizedError();
            }
            if (err.response.status === 403) {
                if (differentOrigin(preferencesFile)) {
                    throw new CrossOriginForbiddenError();
                }
                throw new SameOriginForbiddenError();
            }
            /*if (err.response.status === 404) {
                throw new NotFoundError();
            }*/
            throw new Error(msg);
        }
        return preferencesFile;
    }
    async function loadProfile(user) {
        if (!user) {
            throw new Error('loadProfile: no user given.');
        }
        try {
            await store.fetcher.load(user.doc());
        }
        catch (err) {
            throw new Error(`Unable to load profile of user ${user}: ${err}`);
        }
        return user.doc();
    }
    async function loadMe() {
        const me = authn.currentUser();
        if (me === null) {
            throw new Error('Current user not found! Not logged in?');
        }
        await store.fetcher.load(me.doc());
        return me;
    }
    function getPodRoot(user) {
        const podRoot = findStorage(user);
        if (!podRoot) {
            throw new Error('User pod root not found!');
        }
        return podRoot;
    }
    async function getMainInbox(user) {
        await store.fetcher.load(user);
        const mainInbox = store.any(user, ns.ldp('inbox'), undefined, user.doc());
        if (!mainInbox) {
            throw new Error('User main inbox not found!');
        }
        return mainInbox;
    }
    function findStorage(me) {
        return store.any(me, ns.space('storage'), undefined, me.doc());
    }
    return {
        loadMe,
        getPodRoot,
        getMainInbox,
        findStorage,
        loadPreferences,
        loadProfile,
        silencedLoadPreferences
    };
}




function createTypeIndexLogic(store, authn, profileLogic, utilityLogic) {
    const ns = ns_ns;
    function isAbsoluteHttpUri(uri) {
        return !!uri && (uri.startsWith('https://') || uri.startsWith('http://'));
    }
    function getRegistrations(instance, theClass) {
        return store
            .each(undefined, ns.solid('instance'), instance)
            .filter((r) => {
            return store.holds(r, ns.solid('forClass'), theClass);
        });
    }
    async function loadTypeIndexesFor(user) {
        if (!user)
            throw new Error('loadTypeIndexesFor: No user given');
        const profile = await profileLogic.loadProfile(user);
        let suggestion = null;
        try {
            suggestion = suggestPublicTypeIndex(user);
        }
        catch (err) {
            const message = `User ${user} has no usable profile document directory for publicTypeIndex.`;
            warn(message);
        }
        let publicTypeIndex;
        try {
            publicTypeIndex =
                store.any(user, ns.solid('publicTypeIndex'), undefined, profile) ||
                    (suggestion
                        ? await utilityLogic.followOrCreateLink(user, ns.solid('publicTypeIndex'), suggestion, profile)
                        : null);
        }
        catch (err) {
            const message = `User ${user} has no pointer in profile to publicTypeIndex file: ${err}`;
            warn(message);
        }
        const publicScopes = publicTypeIndex ? [{ label: 'public', index: publicTypeIndex, agent: user }] : [];
        let preferencesFile;
        try {
            preferencesFile = await profileLogic.silencedLoadPreferences(user);
        }
        catch (err) {
            preferencesFile = null;
        }
        let privateScopes;
        if (preferencesFile) { // watch out - can be in either as spec was not clear.  Legacy is profile.
            // If there is a legacy one linked from the profile, use that.
            // Otherwiae use or make one linked from Preferences
            let suggestedPrivateTypeIndex = null;
            try {
                suggestedPrivateTypeIndex = suggestPrivateTypeIndex(preferencesFile);
            }
            catch (err) {
                const message = `User ${user} has no usable preferences document directory for privateTypeIndex.`;
                warn(message);
            }
            let privateTypeIndex;
            try {
                privateTypeIndex = store.any(user, ns.solid('privateTypeIndex'), undefined, profile) ||
                    (suggestedPrivateTypeIndex
                        ? await utilityLogic.followOrCreateLink(user, ns.solid('privateTypeIndex'), suggestedPrivateTypeIndex, preferencesFile)
                        : null);
            }
            catch (err) {
                const message = `User ${user} has no pointer in preference file to privateTypeIndex file: ${err}`;
                warn(message);
            }
            privateScopes = privateTypeIndex ? [{ label: 'private', index: privateTypeIndex, agent: user }] : [];
        }
        else {
            privateScopes = [];
        }
        const scopes = publicScopes.concat(privateScopes);
        if (scopes.length === 0)
            return scopes;
        const files = scopes.map(scope => scope.index);
        try {
            await store.fetcher.load(files);
        }
        catch (err) {
            warn('Problems loading type index: ', err);
        }
        return scopes;
    }
    async function loadCommunityTypeIndexes(user) {
        let preferencesFile;
        try {
            preferencesFile = await profileLogic.silencedLoadPreferences(user);
        }
        catch (err) {
            const message = `User ${user} has no pointer in profile to preferences file.`;
            warn(message);
        }
        if (preferencesFile) { // For now, pick up communities as simple links from the preferences file.
            const communities = store.each(user, ns.solid('community'), undefined, preferencesFile).concat(store.each(user, ns.solid('community'), undefined, user.doc()));
            let result = [];
            for (const org of communities) {
                if (org.termType !== 'NamedNode' || !isAbsoluteHttpUri(org.uri)) {
                    warn(`Skipping malformed community node for ${user}: ${org}`);
                    continue;
                }
                try {
                    result = result.concat(await loadTypeIndexesFor(org));
                }
                catch (err) {
                    warn(`Skipping community type indexes for ${org.uri}: ${err}`);
                }
            }
            return result;
        }
        return []; // No communities
    }
    async function loadAllTypeIndexes(user) {
        return (await loadTypeIndexesFor(user)).concat(await loadCommunityTypeIndexes(user));
    }
    async function getScopedAppInstances(klass, user) {
        const scopes = await loadAllTypeIndexes(user);
        let scopedApps = [];
        for (const scope of scopes) {
            const scopedApps0 = await getScopedAppsFromIndex(scope, klass);
            scopedApps = scopedApps.concat(scopedApps0);
        }
        return scopedApps;
    }
    // This is the function signature which used to be in solid-ui/logic
    // Recommended to use getScopedAppInstances instead as it provides more information.
    //
    async function getAppInstances(klass) {
        const user = authn.currentUser();
        if (!user)
            throw new Error('getAppInstances: Must be logged in to find apps.');
        const scopedAppInstances = await getScopedAppInstances(klass, user);
        return scopedAppInstances.map(scoped => scoped.instance);
    }
    function docDirUri(node) {
        const doc = node.doc();
        const dir = doc.dir();
        if ((dir === null || dir === void 0 ? void 0 : dir.uri) && isAbsoluteHttpUri(dir.uri))
            return dir.uri;
        const docUri = doc.uri;
        if (!docUri || !isAbsoluteHttpUri(docUri)) {
            log(`docDirUri: missing or non-http(s) doc uri for ${node === null || node === void 0 ? void 0 : node.uri}`);
            return null;
        }
        const withoutFragment = docUri.split('#')[0];
        const lastSlash = withoutFragment.lastIndexOf('/');
        if (lastSlash === -1) {
            log(`docDirUri: no slash in doc uri ${docUri}`);
            return null;
        }
        return withoutFragment.slice(0, lastSlash + 1);
    }
    function suggestPublicTypeIndex(me) {
        const dirUri = docDirUri(me);
        if (!dirUri)
            throw new Error(`suggestPublicTypeIndex: Cannot derive directory for ${me.uri}`);
        return (0, external_rdflib_namespaceObject.sym)(dirUri + 'publicTypeIndex.ttl');
    }
    // Note this one is based off the pref file not the profile
    function suggestPrivateTypeIndex(preferencesFile) {
        const dirUri = docDirUri(preferencesFile);
        if (!dirUri)
            throw new Error(`suggestPrivateTypeIndex: Cannot derive directory for ${preferencesFile.uri}`);
        return (0, external_rdflib_namespaceObject.sym)(dirUri + 'privateTypeIndex.ttl');
    }
    /*
    * Register a new app in a type index
    * used in chat in bookmark.js (solid-ui)
    * Returns the registration object if successful else null
    */
    async function registerInTypeIndex(instance, index, theClass) {
        const registration = newThing(index);
        const ins = [
            // See https://github.com/solid/solid/blob/main/proposals/data-discovery.md
            (0, external_rdflib_namespaceObject.st)(registration, ns.rdf('type'), ns.solid('TypeRegistration'), index),
            (0, external_rdflib_namespaceObject.st)(registration, ns.solid('forClass'), theClass, index),
            (0, external_rdflib_namespaceObject.st)(registration, ns.solid('instance'), instance, index)
        ];
        try {
            await store.updater.update([], ins);
        }
        catch (err) {
            const msg = `Unable to register ${instance} in index ${index}: ${err}`;
            console.warn(msg);
            return null;
        }
        return registration;
    }
    async function deleteTypeIndexRegistration(item) {
        const reg = store.the(null, ns.solid('instance'), item.instance, item.scope.index);
        if (!reg)
            throw new Error(`deleteTypeIndexRegistration: No registration found for ${item.instance}`);
        const statements = store.statementsMatching(reg, null, null, item.scope.index);
        await store.updater.update(statements, []);
    }
    async function getScopedAppsFromIndex(scope, theClass) {
        const index = scope.index;
        const results = [];
        const registrations = store.statementsMatching(null, ns.solid('instance'), null, index)
            .concat(store.statementsMatching(null, ns.solid('instanceContainer'), null, index))
            .map(st => st.subject);
        for (const reg of registrations) {
            const klass = store.any(reg, ns.solid('forClass'), null, index);
            if (!theClass || klass.sameTerm(theClass)) {
                const instances = store.each(reg, ns.solid('instance'), null, index);
                for (const instance of instances) {
                    results.push({ instance, type: klass, scope });
                }
                const containers = store.each(reg, ns.solid('instanceContainer'), null, index);
                for (const instance of containers) {
                    await store.fetcher.load(instance);
                    results.push({ instance: (0, external_rdflib_namespaceObject.sym)(instance.value), type: klass, scope });
                }
            }
        }
        return results;
    }
    return {
        registerInTypeIndex,
        getRegistrations,
        loadTypeIndexesFor,
        loadCommunityTypeIndexes,
        loadAllTypeIndexes,
        getScopedAppInstances,
        getAppInstances,
        suggestPublicTypeIndex,
        suggestPrivateTypeIndex,
        deleteTypeIndexRegistration,
        getScopedAppsFromIndex
    };
}

/**
 * Container-related class
 */
function createContainerLogic(store) {
    function getContainerElements(containerNode) {
        return store
            .statementsMatching(containerNode, (0, external_rdflib_namespaceObject.sym)('http://www.w3.org/ns/ldp#contains'), undefined)
            .map((st) => st.object);
    }
    function isContainer(url) {
        const nodeToString = url.value;
        return nodeToString.charAt(nodeToString.length - 1) === '/';
    }
    async function createContainer(url) {
        const stringToNode = (0, external_rdflib_namespaceObject.sym)(url);
        if (!isContainer(stringToNode)) {
            throw new Error(`Not a container URL ${url}`);
        }
        // Copied from https://github.com/solidos/solid-crud-tests/blob/v3.1.0/test/surface/create-container.test.ts#L56-L64
        const result = await store.fetcher._fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'text/turtle',
                'If-None-Match': '*',
                Link: '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"', // See https://github.com/solidos/node-solid-server/issues/1465
            },
            body: ' ', // work around https://github.com/michielbdejong/community-server/issues/4#issuecomment-776222863
        });
        if (result.status.toString()[0] !== '2') {
            throw new Error(`Not OK: got ${result.status} response while creating container at ${url}`);
        }
    }
    async function getContainerMembers(containerUrl) {
        await store.fetcher.load(containerUrl);
        return getContainerElements(containerUrl);
    }
    return {
        isContainer,
        createContainer,
        getContainerElements,
        getContainerMembers
    };
}




function createUtilityLogic(store, aclLogic, containerLogic) {
    async function recursiveDelete(containerNode) {
        try {
            if (containerLogic.isContainer(containerNode)) {
                const aclDocUrl = await aclLogic.findAclDocUrl(containerNode);
                await store.fetcher._fetch(aclDocUrl, { method: 'DELETE' });
                const containerMembers = await containerLogic.getContainerMembers(containerNode);
                await Promise.all(containerMembers.map((url) => recursiveDelete(url)));
            }
            const nodeToStringHere = containerNode.value;
            return store.fetcher._fetch(nodeToStringHere, { method: 'DELETE' });
        }
        catch (e) {
            log(`Please manually remove ${containerNode.value} from your system.`, e);
        }
    }
    /**
     * Create a resource if it really does not exist
     * Be absolutely sure something does not exist before creating a new empty file
     * as otherwise existing could  be deleted.
     * @param doc {NamedNode} - The resource
     */
    async function loadOrCreateIfNotExists(doc) {
        let response;
        try {
            response = await store.fetcher.load(doc);
        }
        catch (err) {
            if (err.response.status === 404) {
                try {
                    await store.fetcher.webOperation('PUT', doc, { data: '', contentType: 'text/turtle' });
                }
                catch (err) {
                    const msg = 'createIfNotExists: PUT FAILED: ' + doc + ': ' + err;
                    throw new WebOperationError(msg);
                }
                await store.fetcher.load(doc);
            }
            else {
                if (err.response.status === 401) {
                    throw new UnauthorizedError();
                }
                if (err.response.status === 403) {
                    if (differentOrigin(doc)) {
                        throw new CrossOriginForbiddenError();
                    }
                    throw new SameOriginForbiddenError();
                }
                const msg = 'createIfNotExists doc load error NOT 404:  ' + doc + ': ' + err;
                throw new FetchError(err.status, err.message + msg);
            }
        }
        return response;
    }
    /* Follow link from this doc to another thing, or else make a new link
    **
    ** @returns existing object, or creates it if non existent
    */
    async function followOrCreateLink(subject, predicate, object, doc) {
        await store.fetcher.load(doc);
        const result = store.any(subject, predicate, null, doc);
        if (result)
            return result;
        if (!store.updater.editable(doc)) {
            const msg = `followOrCreateLink: cannot edit ${doc.value}`;
            warn(msg);
            throw new NotEditableError(msg);
        }
        try {
            await store.updater.update([], [(0,external_rdflib_namespaceObject.st)(subject, predicate, object, doc)]);
        }
        catch (err) {
            const msg = `followOrCreateLink: Error making link in ${doc} to ${object}: ${err}`;
            warn(msg);
            throw new WebOperationError(err);
        }
        try {
            await loadOrCreateIfNotExists(object);
            // store.fetcher.webOperation('PUT', object, { data: '', contentType: 'text/turtle'})
        }
        catch (err) {
            warn(`followOrCreateLink: Error loading or saving new linked document: ${object}: ${err}`);
            throw err;
        }
        return object;
    }
    // Copied from https://github.com/solidos/web-access-control-tests/blob/v3.0.0/test/surface/delete.test.ts#L5
    async function setSinglePeerAccess(options) {
        let str = [
            '@prefix acl: <http://www.w3.org/ns/auth/acl#>.',
            '',
            `<#alice> a acl:Authorization;\n  acl:agent <${options.ownerWebId}>;`,
            `  acl:accessTo <${options.target}>;`,
            `  acl:default <${options.target}>;`,
            '  acl:mode acl:Read, acl:Write, acl:Control.',
            ''
        ].join('\n');
        if (options.accessToModes) {
            str += [
                '<#bobAccessTo> a acl:Authorization;',
                `  acl:agent <${options.peerWebId}>;`,
                `  acl:accessTo <${options.target}>;`,
                `  acl:mode ${options.accessToModes}.`,
                ''
            ].join('\n');
        }
        if (options.defaultModes) {
            str += [
                '<#bobDefault> a acl:Authorization;',
                `  acl:agent <${options.peerWebId}>;`,
                `  acl:default <${options.target}>;`,
                `  acl:mode ${options.defaultModes}.`,
                ''
            ].join('\n');
        }
        const aclDocUrl = await aclLogic.findAclDocUrl((0, external_rdflib_namespaceObject.sym)(options.target));
        return store.fetcher._fetch(aclDocUrl, {
            method: 'PUT',
            body: str,
            headers: [
                ['Content-Type', 'text/turtle']
            ]
        });
    }
    async function createEmptyRdfDoc(doc, comment) {
        await store.fetcher.webOperation('PUT', doc.uri, {
            data: `# ${new Date()} ${comment}
  `,
            contentType: 'text/turtle',
        });
    }
    return {
        recursiveDelete,
        setSinglePeerAccess,
        createEmptyRdfDoc,
        followOrCreateLink,
        loadOrCreateIfNotExists
    };
}










/*
** It is important to distinquish `fetch`, a function provided by the browser
** and `Fetcher`, a helper object for the rdflib Store which turns it
** into a `ConnectedStore` or a `LiveStore`.  A Fetcher object is
** available at store.fetcher, and `fetch` function at `store.fetcher._fetch`,
*/
function createSolidLogic(specialFetch, session) {
    log('SolidLogic: Unique instance created.  There should only be one of these.');
    const store = external_rdflib_namespaceObject.graph();
    external_rdflib_namespaceObject.fetcher(store, { fetch: specialFetch.fetch }); // Attach a web I/O module, store.fetcher
    store.updater = new external_rdflib_namespaceObject.UpdateManager(store); // Add real-time live updates store.updater
    store.features = []; // disable automatic node merging on store load
    const authn = new SolidAuthnLogic(session);
    const acl = createAclLogic(store);
    const containerLogic = createContainerLogic(store);
    const utilityLogic = createUtilityLogic(store, acl, containerLogic);
    const profile = createProfileLogic(store, authn, utilityLogic);
    const chat = createChatLogic(store, profile);
    const inbox = createInboxLogic(store, profile, utilityLogic, containerLogic);
    const typeIndex = createTypeIndexLogic(store, authn, profile, utilityLogic);
    log('SolidAuthnLogic initialized');
    function load(doc) {
        return store.fetcher.load(doc);
    }
    // @@@@ use the one in rdflib.js when it is available and delete this
    function updatePromise(del, ins = []) {
        return new Promise((resolve, reject) => {
            store.updater.update(del, ins, function (_uri, ok, errorBody) {
                if (!ok) {
                    reject(new Error(errorBody));
                }
                else {
                    resolve();
                }
            }); // callback
        }); // promise
    }
    function clearStore() {
        store.statements.slice().forEach(store.remove.bind(store));
    }
    return {
        store,
        authn,
        acl,
        inbox,
        chat,
        profile,
        typeIndex,
        load,
        updatePromise,
        clearStore
    };
}



const _fetch = async (url, requestInit) => {
    const omitCreds = requestInit && requestInit.credentials && requestInit.credentials == 'omit';
    if (authSession.info.webId && !omitCreds) { // see https://github.com/solidos/solidos/issues/114
        // In fact fetch should respect credentials omit itself
        return authSession.fetch(url, requestInit);
    }
    else {
        return window.fetch(url, requestInit);
    }
};
// Global singleton pattern to ensure unique store across library versions
const SINGLETON_SYMBOL = Symbol.for('solid-logic-singleton');
const globalTarget = (typeof window !== 'undefined' ? window : __webpack_require__.g);
function getOrCreateSingleton() {
    if (!globalTarget[SINGLETON_SYMBOL]) {
        log('SolidLogic: Creating new global singleton instance.');
        globalTarget[SINGLETON_SYMBOL] = createSolidLogic({ fetch: _fetch }, authSession);
        log('Unique quadstore initialized.');
    }
    else {
        log('SolidLogic: Using existing global singleton instance.');
    }
    return globalTarget[SINGLETON_SYMBOL];
}
//this const makes solidLogicSingleton global accessible in mashlib
const solidLogicSingleton = getOrCreateSingleton();
const DEFAULT_ISSUERS = [
    {
        name: 'Solid Community',
        uri: 'https://solidcommunity.net'
    },
    {
        name: 'Solid Web',
        uri: 'https://solidweb.org'
    },
    {
        name: 'Solid Web ME',
        uri: 'https://solidweb.me'
    },
    {
        name: 'Inrupt.com',
        uri: 'https://login.inrupt.com'
    }
];
/**
 * @returns - A list of suggested OIDC issuers
 */
function getSuggestedIssuers() {
    // Suggest a default list of OIDC issuers
    const issuers = [...DEFAULT_ISSUERS];
    // Suggest the current host if not already included
    const { host, origin } = new URL(location.href);
    const hosts = issuers.map(({ uri }) => new URL(uri).host);
    if (!hosts.includes(host) && !hosts.some(existing => isSubdomainOf(host, existing))) {
        issuers.unshift({ name: host, uri: origin });
    }
    return issuers;
}
function isSubdomainOf(subdomain, domain) {
    const dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === '.' && subdomain.endsWith(domain);
}
// Make these variables directly accessible as it is what you need most of the time
// This also makes these variable globaly accesible in mashlib

const authn = solidLogicSingleton.authn;
const src_authSession = solidLogicSingleton.authn.authSession;
const store = solidLogicSingleton.store;

export { ACL_LINK, CrossOriginForbiddenError, FetchError, NotEditableError, NotFoundError, SameOriginForbiddenError, UnauthorizedError, WebOperationError, appContext, src_authSession as authSession, authn, createTypeIndexLogic, getSuggestedIssuers, offlineTestID, solidLogicSingleton, store };
