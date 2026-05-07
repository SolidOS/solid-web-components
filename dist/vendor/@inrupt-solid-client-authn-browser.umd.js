if (typeof globalThis.process === "undefined") {
  globalThis.process = {
    env: {}, browser: true, version: "", versions: { node: "" },
    nextTick: (cb, ...a) => Promise.resolve().then(() => cb(...a)),
    cwd: () => "/", platform: "browser",
  };
}
var solidClientAuthn = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/events/events.js
  var require_events = __commonJS({
    "node_modules/events/events.js"(exports, module) {
      "use strict";
      var R = typeof Reflect === "object" ? Reflect : null;
      var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
      };
      var ReflectOwnKeys;
      if (R && typeof R.ownKeys === "function") {
        ReflectOwnKeys = R.ownKeys;
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
        };
      } else {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target);
        };
      }
      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning);
      }
      var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
        return value !== value;
      };
      function EventEmitter2() {
        EventEmitter2.init.call(this);
      }
      module.exports = EventEmitter2;
      module.exports.once = once;
      EventEmitter2.EventEmitter = EventEmitter2;
      EventEmitter2.prototype._events = void 0;
      EventEmitter2.prototype._eventsCount = 0;
      EventEmitter2.prototype._maxListeners = void 0;
      var defaultMaxListeners = 10;
      function checkListener(listener) {
        if (typeof listener !== "function") {
          throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
        }
      }
      Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
        enumerable: true,
        get: function() {
          return defaultMaxListeners;
        },
        set: function(arg) {
          if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
          }
          defaultMaxListeners = arg;
        }
      });
      EventEmitter2.init = function() {
        if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || void 0;
      };
      EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
        }
        this._maxListeners = n;
        return this;
      };
      function _getMaxListeners(that) {
        if (that._maxListeners === void 0)
          return EventEmitter2.defaultMaxListeners;
        return that._maxListeners;
      }
      EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
      };
      EventEmitter2.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        var doError = type === "error";
        var events2 = this._events;
        if (events2 !== void 0)
          doError = doError && events2.error === void 0;
        else if (!doError)
          return false;
        if (doError) {
          var er;
          if (args.length > 0)
            er = args[0];
          if (er instanceof Error) {
            throw er;
          }
          var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
          err.context = er;
          throw err;
        }
        var handler = events2[type];
        if (handler === void 0)
          return false;
        if (typeof handler === "function") {
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
        var events2;
        var existing;
        checkListener(listener);
        events2 = target._events;
        if (events2 === void 0) {
          events2 = target._events = /* @__PURE__ */ Object.create(null);
          target._eventsCount = 0;
        } else {
          if (events2.newListener !== void 0) {
            target.emit(
              "newListener",
              type,
              listener.listener ? listener.listener : listener
            );
            events2 = target._events;
          }
          existing = events2[type];
        }
        if (existing === void 0) {
          existing = events2[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === "function") {
            existing = events2[type] = prepend ? [listener, existing] : [existing, listener];
          } else if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
          m = _getMaxListeners(target);
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            w.name = "MaxListenersExceededWarning";
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
          }
        }
        return target;
      }
      EventEmitter2.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
      };
      EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
      EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
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
        var state = { fired: false, wrapFn: void 0, target, type, listener };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }
      EventEmitter2.prototype.once = function once2(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
        var list, events2, position, i, originalListener;
        checkListener(listener);
        events2 = this._events;
        if (events2 === void 0)
          return this;
        list = events2[type];
        if (list === void 0)
          return this;
        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else {
            delete events2[type];
            if (events2.removeListener)
              this.emit("removeListener", type, list.listener || listener);
          }
        } else if (typeof list !== "function") {
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
            events2[type] = list[0];
          if (events2.removeListener !== void 0)
            this.emit("removeListener", type, originalListener || listener);
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
        var listeners, events2, i;
        events2 = this._events;
        if (events2 === void 0)
          return this;
        if (events2.removeListener === void 0) {
          if (arguments.length === 0) {
            this._events = /* @__PURE__ */ Object.create(null);
            this._eventsCount = 0;
          } else if (events2[type] !== void 0) {
            if (--this._eventsCount === 0)
              this._events = /* @__PURE__ */ Object.create(null);
            else
              delete events2[type];
          }
          return this;
        }
        if (arguments.length === 0) {
          var keys = Object.keys(events2);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
          return this;
        }
        listeners = events2[type];
        if (typeof listeners === "function") {
          this.removeListener(type, listeners);
        } else if (listeners !== void 0) {
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }
        return this;
      };
      function _listeners(target, type, unwrap) {
        var events2 = target._events;
        if (events2 === void 0)
          return [];
        var evlistener = events2[type];
        if (evlistener === void 0)
          return [];
        if (typeof evlistener === "function")
          return unwrap ? [evlistener.listener || evlistener] : [evlistener];
        return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
      }
      EventEmitter2.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };
      EventEmitter2.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };
      EventEmitter2.listenerCount = function(emitter, type) {
        if (typeof emitter.listenerCount === "function") {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };
      EventEmitter2.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events2 = this._events;
        if (events2 !== void 0) {
          var evlistener = events2[type];
          if (typeof evlistener === "function") {
            return 1;
          } else if (evlistener !== void 0) {
            return evlistener.length;
          }
        }
        return 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
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
        return new Promise(function(resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver);
            reject(err);
          }
          function resolver() {
            if (typeof emitter.removeListener === "function") {
              emitter.removeListener("error", errorListener);
            }
            resolve([].slice.call(arguments));
          }
          ;
          eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
          if (name !== "error") {
            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
          }
        });
      }
      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === "function") {
          eventTargetAgnosticAddListener(emitter, "error", handler, flags);
        }
      }
      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === "function") {
          if (flags.once) {
            emitter.once(name, listener);
          } else {
            emitter.on(name, listener);
          }
        } else if (typeof emitter.addEventListener === "function") {
          emitter.addEventListener(name, function wrapListener(arg) {
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
          });
        } else {
          throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
        }
      }
    }
  });

  // node_modules/@inrupt/solid-client-authn-browser/dist/index.mjs
  var dist_exports = {};
  __export(dist_exports, {
    ConfigurationError: () => ConfigurationError,
    EVENTS: () => EVENTS,
    InMemoryStorage: () => InMemoryStorage,
    NotImplementedError: () => NotImplementedError,
    Session: () => Session,
    events: () => events,
    fetch: () => fetch$1,
    getDefaultSession: () => getDefaultSession,
    handleIncomingRedirect: () => handleIncomingRedirect,
    login: () => login,
    logout: () => logout
  });

  // node_modules/jose/dist/browser/runtime/webcrypto.js
  var webcrypto_default = crypto;
  var isCryptoKey = (key) => key instanceof CryptoKey;

  // node_modules/jose/dist/browser/lib/buffer_utils.js
  var encoder = new TextEncoder();
  var decoder = new TextDecoder();
  var MAX_INT32 = 2 ** 32;
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

  // node_modules/jose/dist/browser/runtime/base64url.js
  var encodeBase64 = (input) => {
    let unencoded = input;
    if (typeof unencoded === "string") {
      unencoded = encoder.encode(unencoded);
    }
    const CHUNK_SIZE = 32768;
    const arr = [];
    for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
      arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(""));
  };
  var encode = (input) => {
    return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
  var decodeBase64 = (encoded) => {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };
  var decode = (input) => {
    let encoded = input;
    if (encoded instanceof Uint8Array) {
      encoded = decoder.decode(encoded);
    }
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
    try {
      return decodeBase64(encoded);
    } catch {
      throw new TypeError("The input to be decoded is not correctly encoded.");
    }
  };

  // node_modules/jose/dist/browser/util/errors.js
  var JOSEError = class extends Error {
    constructor(message2, options) {
      super(message2, options);
      this.code = "ERR_JOSE_GENERIC";
      this.name = this.constructor.name;
      Error.captureStackTrace?.(this, this.constructor);
    }
  };
  JOSEError.code = "ERR_JOSE_GENERIC";
  var JWTClaimValidationFailed = class extends JOSEError {
    constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
      super(message2, { cause: { claim, reason, payload } });
      this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      this.claim = claim;
      this.reason = reason;
      this.payload = payload;
    }
  };
  JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  var JWTExpired = class extends JOSEError {
    constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
      super(message2, { cause: { claim, reason, payload } });
      this.code = "ERR_JWT_EXPIRED";
      this.claim = claim;
      this.reason = reason;
      this.payload = payload;
    }
  };
  JWTExpired.code = "ERR_JWT_EXPIRED";
  var JOSEAlgNotAllowed = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
    }
  };
  JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  var JOSENotSupported = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JOSE_NOT_SUPPORTED";
    }
  };
  JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
  var JWEDecryptionFailed = class extends JOSEError {
    constructor(message2 = "decryption operation failed", options) {
      super(message2, options);
      this.code = "ERR_JWE_DECRYPTION_FAILED";
    }
  };
  JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
  var JWEInvalid = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JWE_INVALID";
    }
  };
  JWEInvalid.code = "ERR_JWE_INVALID";
  var JWSInvalid = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JWS_INVALID";
    }
  };
  JWSInvalid.code = "ERR_JWS_INVALID";
  var JWTInvalid = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JWT_INVALID";
    }
  };
  JWTInvalid.code = "ERR_JWT_INVALID";
  var JWKInvalid = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JWK_INVALID";
    }
  };
  JWKInvalid.code = "ERR_JWK_INVALID";
  var JWKSInvalid = class extends JOSEError {
    constructor() {
      super(...arguments);
      this.code = "ERR_JWKS_INVALID";
    }
  };
  JWKSInvalid.code = "ERR_JWKS_INVALID";
  var JWKSNoMatchingKey = class extends JOSEError {
    constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
      super(message2, options);
      this.code = "ERR_JWKS_NO_MATCHING_KEY";
    }
  };
  JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
  var JWKSMultipleMatchingKeys = class extends JOSEError {
    constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
      super(message2, options);
      this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
    }
  };
  JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  var JWKSTimeout = class extends JOSEError {
    constructor(message2 = "request timed out", options) {
      super(message2, options);
      this.code = "ERR_JWKS_TIMEOUT";
    }
  };
  JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
  var JWSSignatureVerificationFailed = class extends JOSEError {
    constructor(message2 = "signature verification failed", options) {
      super(message2, options);
      this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
    }
  };
  JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

  // node_modules/jose/dist/browser/lib/crypto_key.js
  function unusable(name, prop = "algorithm.name") {
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
      case "ES256":
        return "P-256";
      case "ES384":
        return "P-384";
      case "ES512":
        return "P-521";
      default:
        throw new Error("unreachable");
    }
  }
  function checkUsage(key, usages) {
    if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
      let msg = "CryptoKey does not support this operation, its usages must include ";
      if (usages.length > 2) {
        const last = usages.pop();
        msg += `one of ${usages.join(", ")}, or ${last}.`;
      } else if (usages.length === 2) {
        msg += `one of ${usages[0]} or ${usages[1]}.`;
      } else {
        msg += `${usages[0]}.`;
      }
      throw new TypeError(msg);
    }
  }
  function checkSigCryptoKey(key, alg, ...usages) {
    switch (alg) {
      case "HS256":
      case "HS384":
      case "HS512": {
        if (!isAlgorithm(key.algorithm, "HMAC"))
          throw unusable("HMAC");
        const expected = parseInt(alg.slice(2), 10);
        const actual = getHashLength(key.algorithm.hash);
        if (actual !== expected)
          throw unusable(`SHA-${expected}`, "algorithm.hash");
        break;
      }
      case "RS256":
      case "RS384":
      case "RS512": {
        if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
          throw unusable("RSASSA-PKCS1-v1_5");
        const expected = parseInt(alg.slice(2), 10);
        const actual = getHashLength(key.algorithm.hash);
        if (actual !== expected)
          throw unusable(`SHA-${expected}`, "algorithm.hash");
        break;
      }
      case "PS256":
      case "PS384":
      case "PS512": {
        if (!isAlgorithm(key.algorithm, "RSA-PSS"))
          throw unusable("RSA-PSS");
        const expected = parseInt(alg.slice(2), 10);
        const actual = getHashLength(key.algorithm.hash);
        if (actual !== expected)
          throw unusable(`SHA-${expected}`, "algorithm.hash");
        break;
      }
      case "EdDSA": {
        if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
          throw unusable("Ed25519 or Ed448");
        }
        break;
      }
      case "Ed25519": {
        if (!isAlgorithm(key.algorithm, "Ed25519"))
          throw unusable("Ed25519");
        break;
      }
      case "ES256":
      case "ES384":
      case "ES512": {
        if (!isAlgorithm(key.algorithm, "ECDSA"))
          throw unusable("ECDSA");
        const expected = getNamedCurve(alg);
        const actual = key.algorithm.namedCurve;
        if (actual !== expected)
          throw unusable(expected, "algorithm.namedCurve");
        break;
      }
      default:
        throw new TypeError("CryptoKey does not support this operation");
    }
    checkUsage(key, usages);
  }

  // node_modules/jose/dist/browser/lib/invalid_key_input.js
  function message(msg, actual, ...types2) {
    types2 = types2.filter(Boolean);
    if (types2.length > 2) {
      const last = types2.pop();
      msg += `one of type ${types2.join(", ")}, or ${last}.`;
    } else if (types2.length === 2) {
      msg += `one of type ${types2[0]} or ${types2[1]}.`;
    } else {
      msg += `of type ${types2[0]}.`;
    }
    if (actual == null) {
      msg += ` Received ${actual}`;
    } else if (typeof actual === "function" && actual.name) {
      msg += ` Received function ${actual.name}`;
    } else if (typeof actual === "object" && actual != null) {
      if (actual.constructor?.name) {
        msg += ` Received an instance of ${actual.constructor.name}`;
      }
    }
    return msg;
  }
  var invalid_key_input_default = (actual, ...types2) => {
    return message("Key must be ", actual, ...types2);
  };
  function withAlg(alg, actual, ...types2) {
    return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
  }

  // node_modules/jose/dist/browser/runtime/is_key_like.js
  var is_key_like_default = (key) => {
    if (isCryptoKey(key)) {
      return true;
    }
    return key?.[Symbol.toStringTag] === "KeyObject";
  };
  var types = ["CryptoKey"];

  // node_modules/jose/dist/browser/lib/is_disjoint.js
  var isDisjoint = (...headers) => {
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
  var is_disjoint_default = isDisjoint;

  // node_modules/jose/dist/browser/lib/is_object.js
  function isObjectLike(value) {
    return typeof value === "object" && value !== null;
  }
  function isObject(input) {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
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

  // node_modules/jose/dist/browser/runtime/check_key_length.js
  var check_key_length_default = (alg, key) => {
    if (alg.startsWith("RS") || alg.startsWith("PS")) {
      const { modulusLength } = key.algorithm;
      if (typeof modulusLength !== "number" || modulusLength < 2048) {
        throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
      }
    }
  };

  // node_modules/jose/dist/browser/lib/is_jwk.js
  function isJWK(key) {
    return isObject(key) && typeof key.kty === "string";
  }
  function isPrivateJWK(key) {
    return key.kty !== "oct" && typeof key.d === "string";
  }
  function isPublicJWK(key) {
    return key.kty !== "oct" && typeof key.d === "undefined";
  }
  function isSecretJWK(key) {
    return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
  }

  // node_modules/jose/dist/browser/runtime/jwk_to_key.js
  function subtleMapping(jwk) {
    let algorithm;
    let keyUsages;
    switch (jwk.kty) {
      case "RSA": {
        switch (jwk.alg) {
          case "PS256":
          case "PS384":
          case "PS512":
            algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "RS256":
          case "RS384":
          case "RS512":
            algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            algorithm = {
              name: "RSA-OAEP",
              hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
            };
            keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
            break;
          default:
            throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
        }
        break;
      }
      case "EC": {
        switch (jwk.alg) {
          case "ES256":
            algorithm = { name: "ECDSA", namedCurve: "P-256" };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "ES384":
            algorithm = { name: "ECDSA", namedCurve: "P-384" };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "ES512":
            algorithm = { name: "ECDSA", namedCurve: "P-521" };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            algorithm = { name: "ECDH", namedCurve: jwk.crv };
            keyUsages = jwk.d ? ["deriveBits"] : [];
            break;
          default:
            throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
        }
        break;
      }
      case "OKP": {
        switch (jwk.alg) {
          case "Ed25519":
            algorithm = { name: "Ed25519" };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "EdDSA":
            algorithm = { name: jwk.crv };
            keyUsages = jwk.d ? ["sign"] : ["verify"];
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            algorithm = { name: jwk.crv };
            keyUsages = jwk.d ? ["deriveBits"] : [];
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
  var parse = async (jwk) => {
    if (!jwk.alg) {
      throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
    }
    const { algorithm, keyUsages } = subtleMapping(jwk);
    const rest = [
      algorithm,
      jwk.ext ?? false,
      jwk.key_ops ?? keyUsages
    ];
    const keyData = { ...jwk };
    delete keyData.alg;
    delete keyData.use;
    return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
  };
  var jwk_to_key_default = parse;

  // node_modules/jose/dist/browser/runtime/normalize_key.js
  var exportKeyValue = (k) => decode(k);
  var privCache;
  var pubCache;
  var isKeyObject = (key) => {
    return key?.[Symbol.toStringTag] === "KeyObject";
  };
  var importAndCache = async (cache, key, jwk, alg, freeze = false) => {
    let cached = cache.get(key);
    if (cached?.[alg]) {
      return cached[alg];
    }
    const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
    if (freeze)
      Object.freeze(key);
    if (!cached) {
      cache.set(key, { [alg]: cryptoKey });
    } else {
      cached[alg] = cryptoKey;
    }
    return cryptoKey;
  };
  var normalizePublicKey = (key, alg) => {
    if (isKeyObject(key)) {
      let jwk = key.export({ format: "jwk" });
      delete jwk.d;
      delete jwk.dp;
      delete jwk.dq;
      delete jwk.p;
      delete jwk.q;
      delete jwk.qi;
      if (jwk.k) {
        return exportKeyValue(jwk.k);
      }
      pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
      return importAndCache(pubCache, key, jwk, alg);
    }
    if (isJWK(key)) {
      if (key.k)
        return decode(key.k);
      pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
      const cryptoKey = importAndCache(pubCache, key, key, alg, true);
      return cryptoKey;
    }
    return key;
  };
  var normalizePrivateKey = (key, alg) => {
    if (isKeyObject(key)) {
      let jwk = key.export({ format: "jwk" });
      if (jwk.k) {
        return exportKeyValue(jwk.k);
      }
      privCache || (privCache = /* @__PURE__ */ new WeakMap());
      return importAndCache(privCache, key, jwk, alg);
    }
    if (isJWK(key)) {
      if (key.k)
        return decode(key.k);
      privCache || (privCache = /* @__PURE__ */ new WeakMap());
      const cryptoKey = importAndCache(privCache, key, key, alg, true);
      return cryptoKey;
    }
    return key;
  };
  var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

  // node_modules/jose/dist/browser/key/import.js
  async function importJWK(jwk, alg) {
    if (!isObject(jwk)) {
      throw new TypeError("JWK must be an object");
    }
    alg || (alg = jwk.alg);
    switch (jwk.kty) {
      case "oct":
        if (typeof jwk.k !== "string" || !jwk.k) {
          throw new TypeError('missing "k" (Key Value) Parameter value');
        }
        return decode(jwk.k);
      case "RSA":
        if ("oth" in jwk && jwk.oth !== void 0) {
          throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
        }
      case "EC":
      case "OKP":
        return jwk_to_key_default({ ...jwk, alg });
      default:
        throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
    }
  }

  // node_modules/jose/dist/browser/lib/check_key_type.js
  var tag = (key) => key?.[Symbol.toStringTag];
  var jwkMatchesOp = (alg, key, usage) => {
    if (key.use !== void 0 && key.use !== "sig") {
      throw new TypeError("Invalid key for this operation, when present its use must be sig");
    }
    if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
      throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
    }
    if (key.alg !== void 0 && key.alg !== alg) {
      throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
    }
    return true;
  };
  var symmetricTypeCheck = (alg, key, usage, allowJwk) => {
    if (key instanceof Uint8Array)
      return;
    if (allowJwk && isJWK(key)) {
      if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
        return;
      throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
    }
    if (!is_key_like_default(key)) {
      throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
    }
    if (key.type !== "secret") {
      throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
    }
  };
  var asymmetricTypeCheck = (alg, key, usage, allowJwk) => {
    if (allowJwk && isJWK(key)) {
      switch (usage) {
        case "sign":
          if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
            return;
          throw new TypeError(`JSON Web Key for this operation be a private JWK`);
        case "verify":
          if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
            return;
          throw new TypeError(`JSON Web Key for this operation be a public JWK`);
      }
    }
    if (!is_key_like_default(key)) {
      throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
    }
    if (key.type === "secret") {
      throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
    }
    if (usage === "sign" && key.type === "public") {
      throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
    }
    if (usage === "decrypt" && key.type === "public") {
      throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
    }
    if (key.algorithm && usage === "verify" && key.type === "private") {
      throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
    }
    if (key.algorithm && usage === "encrypt" && key.type === "private") {
      throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
    }
  };
  function checkKeyType(allowJwk, alg, key, usage) {
    const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
    if (symmetric) {
      symmetricTypeCheck(alg, key, usage, allowJwk);
    } else {
      asymmetricTypeCheck(alg, key, usage, allowJwk);
    }
  }
  var check_key_type_default = checkKeyType.bind(void 0, false);
  var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

  // node_modules/jose/dist/browser/lib/validate_crit.js
  function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
    if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
      throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === void 0) {
      return /* @__PURE__ */ new Set();
    }
    if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
      throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== void 0) {
      recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
    } else {
      recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit) {
      if (!recognized.has(parameter)) {
        throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
      }
      if (joseHeader[parameter] === void 0) {
        throw new Err(`Extension Header Parameter "${parameter}" is missing`);
      }
      if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
        throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
      }
    }
    return new Set(protectedHeader.crit);
  }
  var validate_crit_default = validateCrit;

  // node_modules/jose/dist/browser/lib/validate_algorithms.js
  var validateAlgorithms = (option, algorithms) => {
    if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
      throw new TypeError(`"${option}" option must be an array of strings`);
    }
    if (!algorithms) {
      return void 0;
    }
    return new Set(algorithms);
  };
  var validate_algorithms_default = validateAlgorithms;

  // node_modules/jose/dist/browser/runtime/key_to_jwk.js
  var keyToJWK = async (key) => {
    if (key instanceof Uint8Array) {
      return {
        kty: "oct",
        k: encode(key)
      };
    }
    if (!isCryptoKey(key)) {
      throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array"));
    }
    if (!key.extractable) {
      throw new TypeError("non-extractable CryptoKey cannot be exported as a JWK");
    }
    const { ext, key_ops, alg, use, ...jwk } = await webcrypto_default.subtle.exportKey("jwk", key);
    return jwk;
  };
  var key_to_jwk_default = keyToJWK;

  // node_modules/jose/dist/browser/key/export.js
  async function exportJWK(key) {
    return key_to_jwk_default(key);
  }

  // node_modules/jose/dist/browser/runtime/subtle_dsa.js
  function subtleDsa(alg, algorithm) {
    const hash = `SHA-${alg.slice(-3)}`;
    switch (alg) {
      case "HS256":
      case "HS384":
      case "HS512":
        return { hash, name: "HMAC" };
      case "PS256":
      case "PS384":
      case "PS512":
        return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
      case "RS256":
      case "RS384":
      case "RS512":
        return { hash, name: "RSASSA-PKCS1-v1_5" };
      case "ES256":
      case "ES384":
      case "ES512":
        return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
      case "Ed25519":
        return { name: "Ed25519" };
      case "EdDSA":
        return { name: algorithm.name };
      default:
        throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
    }
  }

  // node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
  async function getCryptoKey(alg, key, usage) {
    if (usage === "sign") {
      key = await normalize_key_default.normalizePrivateKey(key, alg);
    }
    if (usage === "verify") {
      key = await normalize_key_default.normalizePublicKey(key, alg);
    }
    if (isCryptoKey(key)) {
      checkSigCryptoKey(key, alg, usage);
      return key;
    }
    if (key instanceof Uint8Array) {
      if (!alg.startsWith("HS")) {
        throw new TypeError(invalid_key_input_default(key, ...types));
      }
      return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
    }
    throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
  }

  // node_modules/jose/dist/browser/runtime/verify.js
  var verify = async (alg, key, signature, data) => {
    const cryptoKey = await getCryptoKey(alg, key, "verify");
    check_key_length_default(alg, cryptoKey);
    const algorithm = subtleDsa(alg, cryptoKey.algorithm);
    try {
      return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
    } catch {
      return false;
    }
  };
  var verify_default = verify;

  // node_modules/jose/dist/browser/jws/flattened/verify.js
  async function flattenedVerify(jws, key, options) {
    if (!isObject(jws)) {
      throw new JWSInvalid("Flattened JWS must be an object");
    }
    if (jws.protected === void 0 && jws.header === void 0) {
      throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== void 0 && typeof jws.protected !== "string") {
      throw new JWSInvalid("JWS Protected Header incorrect type");
    }
    if (jws.payload === void 0) {
      throw new JWSInvalid("JWS Payload missing");
    }
    if (typeof jws.signature !== "string") {
      throw new JWSInvalid("JWS Signature missing or incorrect type");
    }
    if (jws.header !== void 0 && !isObject(jws.header)) {
      throw new JWSInvalid("JWS Unprotected Header incorrect type");
    }
    let parsedProt = {};
    if (jws.protected) {
      try {
        const protectedHeader = decode(jws.protected);
        parsedProt = JSON.parse(decoder.decode(protectedHeader));
      } catch {
        throw new JWSInvalid("JWS Protected Header is invalid");
      }
    }
    if (!is_disjoint_default(parsedProt, jws.header)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...parsedProt,
      ...jws.header
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = parsedProt.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
      throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
    }
    if (b64) {
      if (typeof jws.payload !== "string") {
        throw new JWSInvalid("JWS Payload must be a string");
      }
    } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
      throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
    }
    let resolvedKey = false;
    if (typeof key === "function") {
      key = await key(parsedProt, jws);
      resolvedKey = true;
      checkKeyTypeWithJwk(alg, key, "verify");
      if (isJWK(key)) {
        key = await importJWK(key, alg);
      }
    } else {
      checkKeyTypeWithJwk(alg, key, "verify");
    }
    const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
    let signature;
    try {
      signature = decode(jws.signature);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the signature");
    }
    const verified = await verify_default(alg, key, signature, data);
    if (!verified) {
      throw new JWSSignatureVerificationFailed();
    }
    let payload;
    if (b64) {
      try {
        payload = decode(jws.payload);
      } catch {
        throw new JWSInvalid("Failed to base64url decode the payload");
      }
    } else if (typeof jws.payload === "string") {
      payload = encoder.encode(jws.payload);
    } else {
      payload = jws.payload;
    }
    const result = { payload };
    if (jws.protected !== void 0) {
      result.protectedHeader = parsedProt;
    }
    if (jws.header !== void 0) {
      result.unprotectedHeader = jws.header;
    }
    if (resolvedKey) {
      return { ...result, key };
    }
    return result;
  }

  // node_modules/jose/dist/browser/jws/compact/verify.js
  async function compactVerify(jws, key, options) {
    if (jws instanceof Uint8Array) {
      jws = decoder.decode(jws);
    }
    if (typeof jws !== "string") {
      throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
    }
    const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
    if (length !== 3) {
      throw new JWSInvalid("Invalid Compact JWS");
    }
    const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
    const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
    if (typeof key === "function") {
      return { ...result, key: verified.key };
    }
    return result;
  }

  // node_modules/jose/dist/browser/lib/epoch.js
  var epoch_default = (date) => Math.floor(date.getTime() / 1e3);

  // node_modules/jose/dist/browser/lib/secs.js
  var minute = 60;
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var year = day * 365.25;
  var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
  var secs_default = (str) => {
    const matched = REGEX.exec(str);
    if (!matched || matched[4] && matched[1]) {
      throw new TypeError("Invalid time period format");
    }
    const value = parseFloat(matched[2]);
    const unit = matched[3].toLowerCase();
    let numericDate;
    switch (unit) {
      case "sec":
      case "secs":
      case "second":
      case "seconds":
      case "s":
        numericDate = Math.round(value);
        break;
      case "minute":
      case "minutes":
      case "min":
      case "mins":
      case "m":
        numericDate = Math.round(value * minute);
        break;
      case "hour":
      case "hours":
      case "hr":
      case "hrs":
      case "h":
        numericDate = Math.round(value * hour);
        break;
      case "day":
      case "days":
      case "d":
        numericDate = Math.round(value * day);
        break;
      case "week":
      case "weeks":
      case "w":
        numericDate = Math.round(value * week);
        break;
      default:
        numericDate = Math.round(value * year);
        break;
    }
    if (matched[1] === "-" || matched[4] === "ago") {
      return -numericDate;
    }
    return numericDate;
  };

  // node_modules/jose/dist/browser/lib/jwt_claims_set.js
  var normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, "");
  var checkAudiencePresence = (audPayload, audOption) => {
    if (typeof audPayload === "string") {
      return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
      return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
  };
  var jwt_claims_set_default = (protectedHeader, encodedPayload, options = {}) => {
    let payload;
    try {
      payload = JSON.parse(decoder.decode(encodedPayload));
    } catch {
    }
    if (!isObject(payload)) {
      throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
    }
    const { typ } = options;
    if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
      throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
    }
    const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
    const presenceCheck = [...requiredClaims];
    if (maxTokenAge !== void 0)
      presenceCheck.push("iat");
    if (audience !== void 0)
      presenceCheck.push("aud");
    if (subject !== void 0)
      presenceCheck.push("sub");
    if (issuer !== void 0)
      presenceCheck.push("iss");
    for (const claim of new Set(presenceCheck.reverse())) {
      if (!(claim in payload)) {
        throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
      }
    }
    if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
      throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
    }
    if (subject && payload.sub !== subject) {
      throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
    }
    if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
      throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
    }
    let tolerance;
    switch (typeof options.clockTolerance) {
      case "string":
        tolerance = secs_default(options.clockTolerance);
        break;
      case "number":
        tolerance = options.clockTolerance;
        break;
      case "undefined":
        tolerance = 0;
        break;
      default:
        throw new TypeError("Invalid clockTolerance option type");
    }
    const { currentDate } = options;
    const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
    if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
      throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
    }
    if (payload.nbf !== void 0) {
      if (typeof payload.nbf !== "number") {
        throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
      }
      if (payload.nbf > now + tolerance) {
        throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
      }
    }
    if (payload.exp !== void 0) {
      if (typeof payload.exp !== "number") {
        throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
      }
      if (payload.exp <= now - tolerance) {
        throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
      }
    }
    if (maxTokenAge) {
      const age = now - payload.iat;
      const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
      if (age - tolerance > max) {
        throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
      }
      if (age < 0 - tolerance) {
        throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
      }
    }
    return payload;
  };

  // node_modules/jose/dist/browser/jwt/verify.js
  async function jwtVerify(jwt, key, options) {
    const verified = await compactVerify(jwt, key, options);
    if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
    const result = { payload, protectedHeader: verified.protectedHeader };
    if (typeof key === "function") {
      return { ...result, key: verified.key };
    }
    return result;
  }

  // node_modules/jose/dist/browser/runtime/sign.js
  var sign = async (alg, key, data) => {
    const cryptoKey = await getCryptoKey(alg, key, "sign");
    check_key_length_default(alg, cryptoKey);
    const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
    return new Uint8Array(signature);
  };
  var sign_default = sign;

  // node_modules/jose/dist/browser/jws/flattened/sign.js
  var FlattenedSign = class {
    constructor(payload) {
      if (!(payload instanceof Uint8Array)) {
        throw new TypeError("payload must be an instance of Uint8Array");
      }
      this._payload = payload;
    }
    setProtectedHeader(protectedHeader) {
      if (this._protectedHeader) {
        throw new TypeError("setProtectedHeader can only be called once");
      }
      this._protectedHeader = protectedHeader;
      return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
      if (this._unprotectedHeader) {
        throw new TypeError("setUnprotectedHeader can only be called once");
      }
      this._unprotectedHeader = unprotectedHeader;
      return this;
    }
    async sign(key, options) {
      if (!this._protectedHeader && !this._unprotectedHeader) {
        throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
      }
      if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
        throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
      }
      const joseHeader = {
        ...this._protectedHeader,
        ...this._unprotectedHeader
      };
      const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
      let b64 = true;
      if (extensions.has("b64")) {
        b64 = this._protectedHeader.b64;
        if (typeof b64 !== "boolean") {
          throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
      }
      const { alg } = joseHeader;
      if (typeof alg !== "string" || !alg) {
        throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
      }
      checkKeyTypeWithJwk(alg, key, "sign");
      let payload = this._payload;
      if (b64) {
        payload = encoder.encode(encode(payload));
      }
      let protectedHeader;
      if (this._protectedHeader) {
        protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
      } else {
        protectedHeader = encoder.encode("");
      }
      const data = concat(protectedHeader, encoder.encode("."), payload);
      const signature = await sign_default(alg, key, data);
      const jws = {
        signature: encode(signature),
        payload: ""
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
  };

  // node_modules/jose/dist/browser/jws/compact/sign.js
  var CompactSign = class {
    constructor(payload) {
      this._flattened = new FlattenedSign(payload);
    }
    setProtectedHeader(protectedHeader) {
      this._flattened.setProtectedHeader(protectedHeader);
      return this;
    }
    async sign(key, options) {
      const jws = await this._flattened.sign(key, options);
      if (jws.payload === void 0) {
        throw new TypeError("use the flattened module for creating JWS with b64: false");
      }
      return `${jws.protected}.${jws.payload}.${jws.signature}`;
    }
  };

  // node_modules/jose/dist/browser/jwt/produce.js
  function validateInput(label, input) {
    if (!Number.isFinite(input)) {
      throw new TypeError(`Invalid ${label} input`);
    }
    return input;
  }
  var ProduceJWT = class {
    constructor(payload = {}) {
      if (!isObject(payload)) {
        throw new TypeError("JWT Claims Set MUST be an object");
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
      if (typeof input === "number") {
        this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
      } else if (input instanceof Date) {
        this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
      } else {
        this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
      }
      return this;
    }
    setExpirationTime(input) {
      if (typeof input === "number") {
        this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
      } else if (input instanceof Date) {
        this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
      } else {
        this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
      }
      return this;
    }
    setIssuedAt(input) {
      if (typeof input === "undefined") {
        this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
      } else if (input instanceof Date) {
        this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
      } else if (typeof input === "string") {
        this._payload = {
          ...this._payload,
          iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
        };
      } else {
        this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
      }
      return this;
    }
  };

  // node_modules/jose/dist/browser/jwt/sign.js
  var SignJWT = class extends ProduceJWT {
    setProtectedHeader(protectedHeader) {
      this._protectedHeader = protectedHeader;
      return this;
    }
    async sign(key, options) {
      const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
      sig.setProtectedHeader(this._protectedHeader);
      if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
        throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
      }
      return sig.sign(key, options);
    }
  };

  // node_modules/jose/dist/browser/jwks/local.js
  function getKtyFromAlg(alg) {
    switch (typeof alg === "string" && alg.slice(0, 2)) {
      case "RS":
      case "PS":
        return "RSA";
      case "ES":
        return "EC";
      case "Ed":
        return "OKP";
      default:
        throw new JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
    }
  }
  function isJWKSLike(jwks) {
    return jwks && typeof jwks === "object" && Array.isArray(jwks.keys) && jwks.keys.every(isJWKLike);
  }
  function isJWKLike(key) {
    return isObject(key);
  }
  function clone(obj) {
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  }
  var LocalJWKSet = class {
    constructor(jwks) {
      this._cached = /* @__PURE__ */ new WeakMap();
      if (!isJWKSLike(jwks)) {
        throw new JWKSInvalid("JSON Web Key Set malformed");
      }
      this._jwks = clone(jwks);
    }
    async getKey(protectedHeader, token) {
      const { alg, kid } = { ...protectedHeader, ...token?.header };
      const kty = getKtyFromAlg(alg);
      const candidates = this._jwks.keys.filter((jwk2) => {
        let candidate = kty === jwk2.kty;
        if (candidate && typeof kid === "string") {
          candidate = kid === jwk2.kid;
        }
        if (candidate && typeof jwk2.alg === "string") {
          candidate = alg === jwk2.alg;
        }
        if (candidate && typeof jwk2.use === "string") {
          candidate = jwk2.use === "sig";
        }
        if (candidate && Array.isArray(jwk2.key_ops)) {
          candidate = jwk2.key_ops.includes("verify");
        }
        if (candidate) {
          switch (alg) {
            case "ES256":
              candidate = jwk2.crv === "P-256";
              break;
            case "ES256K":
              candidate = jwk2.crv === "secp256k1";
              break;
            case "ES384":
              candidate = jwk2.crv === "P-384";
              break;
            case "ES512":
              candidate = jwk2.crv === "P-521";
              break;
            case "Ed25519":
              candidate = jwk2.crv === "Ed25519";
              break;
            case "EdDSA":
              candidate = jwk2.crv === "Ed25519" || jwk2.crv === "Ed448";
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
          for (const jwk2 of candidates) {
            try {
              yield await importWithAlgCache(_cached, jwk2, alg);
            } catch {
            }
          }
        };
        throw error;
      }
      return importWithAlgCache(this._cached, jwk, alg);
    }
  };
  async function importWithAlgCache(cache, jwk, alg) {
    const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk);
    if (cached[alg] === void 0) {
      const key = await importJWK({ ...jwk, ext: true }, alg);
      if (key instanceof Uint8Array || key.type !== "public") {
        throw new JWKSInvalid("JSON Web Key Set members must be public keys");
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
        writable: false
      }
    });
    return localJWKSet;
  }

  // node_modules/jose/dist/browser/runtime/fetch_jwks.js
  var fetchJwks = async (url, timeout, options) => {
    let controller;
    let id;
    let timedOut = false;
    if (typeof AbortController === "function") {
      controller = new AbortController();
      id = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeout);
    }
    const response = await fetch(url.href, {
      signal: controller ? controller.signal : void 0,
      redirect: "manual",
      headers: options.headers
    }).catch((err) => {
      if (timedOut)
        throw new JWKSTimeout();
      throw err;
    });
    if (id !== void 0)
      clearTimeout(id);
    if (response.status !== 200) {
      throw new JOSEError("Expected 200 OK from the JSON Web Key Set HTTP response");
    }
    try {
      return await response.json();
    } catch {
      throw new JOSEError("Failed to parse the JSON Web Key Set HTTP response as JSON");
    }
  };
  var fetch_jwks_default = fetchJwks;

  // node_modules/jose/dist/browser/jwks/remote.js
  function isCloudflareWorkers() {
    return typeof WebSocketPair !== "undefined" || typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime !== "undefined" && EdgeRuntime === "vercel";
  }
  var USER_AGENT;
  if (typeof navigator === "undefined" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) {
    const NAME = "jose";
    const VERSION = "v5.10.0";
    USER_AGENT = `${NAME}/${VERSION}`;
  }
  var jwksCache = /* @__PURE__ */ Symbol();
  function isFreshJwksCache(input, cacheMaxAge) {
    if (typeof input !== "object" || input === null) {
      return false;
    }
    if (!("uat" in input) || typeof input.uat !== "number" || Date.now() - input.uat >= cacheMaxAge) {
      return false;
    }
    if (!("jwks" in input) || !isObject(input.jwks) || !Array.isArray(input.jwks.keys) || !Array.prototype.every.call(input.jwks.keys, isObject)) {
      return false;
    }
    return true;
  }
  var RemoteJWKSet = class {
    constructor(url, options) {
      if (!(url instanceof URL)) {
        throw new TypeError("url must be an instance of URL");
      }
      this._url = new URL(url.href);
      this._options = { agent: options?.agent, headers: options?.headers };
      this._timeoutDuration = typeof options?.timeoutDuration === "number" ? options?.timeoutDuration : 5e3;
      this._cooldownDuration = typeof options?.cooldownDuration === "number" ? options?.cooldownDuration : 3e4;
      this._cacheMaxAge = typeof options?.cacheMaxAge === "number" ? options?.cacheMaxAge : 6e5;
      if (options?.[jwksCache] !== void 0) {
        this._cache = options?.[jwksCache];
        if (isFreshJwksCache(options?.[jwksCache], this._cacheMaxAge)) {
          this._jwksTimestamp = this._cache.uat;
          this._local = createLocalJWKSet(this._cache.jwks);
        }
      }
    }
    coolingDown() {
      return typeof this._jwksTimestamp === "number" ? Date.now() < this._jwksTimestamp + this._cooldownDuration : false;
    }
    fresh() {
      return typeof this._jwksTimestamp === "number" ? Date.now() < this._jwksTimestamp + this._cacheMaxAge : false;
    }
    async getKey(protectedHeader, token) {
      if (!this._local || !this.fresh()) {
        await this.reload();
      }
      try {
        return await this._local(protectedHeader, token);
      } catch (err) {
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
        this._pendingFetch = void 0;
      }
      const headers = new Headers(this._options.headers);
      if (USER_AGENT && !headers.has("User-Agent")) {
        headers.set("User-Agent", USER_AGENT);
        this._options.headers = Object.fromEntries(headers.entries());
      }
      this._pendingFetch || (this._pendingFetch = fetch_jwks_default(this._url, this._timeoutDuration, this._options).then((json) => {
        this._local = createLocalJWKSet(json);
        if (this._cache) {
          this._cache.uat = Date.now();
          this._cache.jwks = json;
        }
        this._jwksTimestamp = Date.now();
        this._pendingFetch = void 0;
      }).catch((err) => {
        this._pendingFetch = void 0;
        throw err;
      }));
      await this._pendingFetch;
    }
  };
  function createRemoteJWKSet(url, options) {
    const set = new RemoteJWKSet(url, options);
    const remoteJWKSet = async (protectedHeader, token) => set.getKey(protectedHeader, token);
    Object.defineProperties(remoteJWKSet, {
      coolingDown: {
        get: () => set.coolingDown(),
        enumerable: true,
        configurable: false
      },
      fresh: {
        get: () => set.fresh(),
        enumerable: true,
        configurable: false
      },
      reload: {
        value: () => set.reload(),
        enumerable: true,
        configurable: false,
        writable: false
      },
      reloading: {
        get: () => !!set._pendingFetch,
        enumerable: true,
        configurable: false
      },
      jwks: {
        value: () => set._local?.jwks(),
        enumerable: true,
        configurable: false,
        writable: false
      }
    });
    return remoteJWKSet;
  }

  // node_modules/jose/dist/browser/runtime/generate.js
  function getModulusLengthOption(options) {
    const modulusLength = options?.modulusLength ?? 2048;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new JOSENotSupported("Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used");
    }
    return modulusLength;
  }
  async function generateKeyPair(alg, options) {
    let algorithm;
    let keyUsages;
    switch (alg) {
      case "PS256":
      case "PS384":
      case "PS512":
        algorithm = {
          name: "RSA-PSS",
          hash: `SHA-${alg.slice(-3)}`,
          publicExponent: new Uint8Array([1, 0, 1]),
          modulusLength: getModulusLengthOption(options)
        };
        keyUsages = ["sign", "verify"];
        break;
      case "RS256":
      case "RS384":
      case "RS512":
        algorithm = {
          name: "RSASSA-PKCS1-v1_5",
          hash: `SHA-${alg.slice(-3)}`,
          publicExponent: new Uint8Array([1, 0, 1]),
          modulusLength: getModulusLengthOption(options)
        };
        keyUsages = ["sign", "verify"];
        break;
      case "RSA-OAEP":
      case "RSA-OAEP-256":
      case "RSA-OAEP-384":
      case "RSA-OAEP-512":
        algorithm = {
          name: "RSA-OAEP",
          hash: `SHA-${parseInt(alg.slice(-3), 10) || 1}`,
          publicExponent: new Uint8Array([1, 0, 1]),
          modulusLength: getModulusLengthOption(options)
        };
        keyUsages = ["decrypt", "unwrapKey", "encrypt", "wrapKey"];
        break;
      case "ES256":
        algorithm = { name: "ECDSA", namedCurve: "P-256" };
        keyUsages = ["sign", "verify"];
        break;
      case "ES384":
        algorithm = { name: "ECDSA", namedCurve: "P-384" };
        keyUsages = ["sign", "verify"];
        break;
      case "ES512":
        algorithm = { name: "ECDSA", namedCurve: "P-521" };
        keyUsages = ["sign", "verify"];
        break;
      case "Ed25519":
        algorithm = { name: "Ed25519" };
        keyUsages = ["sign", "verify"];
        break;
      case "EdDSA": {
        keyUsages = ["sign", "verify"];
        const crv = options?.crv ?? "Ed25519";
        switch (crv) {
          case "Ed25519":
          case "Ed448":
            algorithm = { name: crv };
            break;
          default:
            throw new JOSENotSupported("Invalid or unsupported crv option provided");
        }
        break;
      }
      case "ECDH-ES":
      case "ECDH-ES+A128KW":
      case "ECDH-ES+A192KW":
      case "ECDH-ES+A256KW": {
        keyUsages = ["deriveKey", "deriveBits"];
        const crv = options?.crv ?? "P-256";
        switch (crv) {
          case "P-256":
          case "P-384":
          case "P-521": {
            algorithm = { name: "ECDH", namedCurve: crv };
            break;
          }
          case "X25519":
          case "X448":
            algorithm = { name: crv };
            break;
          default:
            throw new JOSENotSupported("Invalid or unsupported crv option provided, supported values are P-256, P-384, P-521, X25519, and X448");
        }
        break;
      }
      default:
        throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
    }
    return webcrypto_default.subtle.generateKey(algorithm, options?.extractable ?? false, keyUsages);
  }

  // node_modules/jose/dist/browser/key/generate_key_pair.js
  async function generateKeyPair2(alg, options) {
    return generateKeyPair(alg, options);
  }

  // node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      if (typeof crypto === "undefined" || !crypto.getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
      getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = { randomUUID };

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
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
  var v4_default = v4;

  // node_modules/@inrupt/solid-client-authn-core/dist/index.mjs
  var SOLID_CLIENT_AUTHN_KEY_PREFIX = "solidClientAuthn:";
  var PREFERRED_SIGNING_ALG = ["ES256", "RS256"];
  var EVENTS = {
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
    TIMEOUT_SET: "timeoutSet"
  };
  var REFRESH_BEFORE_EXPIRATION_SECONDS = 5;
  var SCOPE_OPENID = "openid";
  var SCOPE_OFFLINE = "offline_access";
  var SCOPE_WEBID = "webid";
  var DEFAULT_SCOPES = [SCOPE_OPENID, SCOPE_OFFLINE, SCOPE_WEBID];
  var AggregateHandler = class {
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
      const canHandleList = await Promise.all(this.handleables.map((handleable) => handleable.canHandle(...params)));
      for (let i = 0; i < canHandleList.length; i += 1) {
        if (canHandleList[i]) {
          return this.handleables[i];
        }
      }
      return null;
    }
    async canHandle(...params) {
      return await this.getProperHandler(params) !== null;
    }
    async handle(...params) {
      const handler = await this.getProperHandler(params);
      if (handler) {
        return handler.handle(...params);
      }
      throw new Error(`[${this.constructor.name}] cannot find a suitable handler for: ${params.map((param) => {
        try {
          return JSON.stringify(param);
        } catch (_err) {
          return param.toString();
        }
      }).join(", ")}`);
    }
  };
  async function getWebidFromTokenPayload(idToken, jwksIri, issuerIri, clientId) {
    let payload;
    let clientIdInPayload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(idToken, createRemoteJWKSet(new URL(jwksIri)), {
        issuer: issuerIri,
        audience: clientId
      });
      payload = verifiedPayload;
    } catch (e) {
      throw new Error(`Token verification failed: ${e.stack}`);
    }
    if (typeof payload.azp === "string") {
      clientIdInPayload = payload.azp;
    }
    if (typeof payload.webid === "string") {
      return {
        webId: payload.webid,
        clientId: clientIdInPayload
      };
    }
    if (typeof payload.sub !== "string") {
      throw new Error(`The token ${JSON.stringify(payload)} is invalid: it has no 'webid' claim and no 'sub' claim.`);
    }
    try {
      new URL(payload.sub);
      return {
        webId: payload.sub,
        clientId: clientIdInPayload
      };
    } catch (e) {
      throw new Error(`The token has no 'webid' claim, and its 'sub' claim of [${payload.sub}] is invalid as a URL - error [${e}].`);
    }
  }
  function normalizeScopes(scopes) {
    if (!Array.isArray(scopes)) {
      return DEFAULT_SCOPES;
    }
    return Array.from(
      // De-dupe potentia conflicts if any.
      /* @__PURE__ */ new Set([
        ...DEFAULT_SCOPES,
        ...scopes.filter(
          // Remove user-provided scopes that are not strings or include spaces.
          (scope) => typeof scope === "string" && !scope.includes(" ")
        )
      ])
    );
  }
  function isValidRedirectUrl(redirectUrl) {
    try {
      const urlObject = new URL(redirectUrl);
      const noReservedQuery = !urlObject.searchParams.has("code") && !urlObject.searchParams.has("state");
      const noHash = urlObject.hash === "";
      return noReservedQuery && noHash;
    } catch (_e) {
      return false;
    }
  }
  function removeOpenIdParams(redirectUrl) {
    const cleanedUpUrl = new URL(redirectUrl);
    cleanedUpUrl.searchParams.delete("state");
    cleanedUpUrl.searchParams.delete("code");
    cleanedUpUrl.searchParams.delete("error");
    cleanedUpUrl.searchParams.delete("error_description");
    cleanedUpUrl.searchParams.delete("iss");
    return cleanedUpUrl;
  }
  function booleanWithFallback(value, fallback) {
    if (typeof value === "boolean") {
      return Boolean(value);
    }
    return Boolean(fallback);
  }
  var AuthorizationCodeWithPkceOidcHandlerBase = class {
    storageUtility;
    redirector;
    constructor(storageUtility, redirector) {
      this.storageUtility = storageUtility;
      this.redirector = redirector;
      this.storageUtility = storageUtility;
      this.redirector = redirector;
    }
    parametersGuard = (oidcLoginOptions) => {
      return oidcLoginOptions.issuerConfiguration.grantTypesSupported !== void 0 && oidcLoginOptions.issuerConfiguration.grantTypesSupported.indexOf("authorization_code") > -1 && oidcLoginOptions.redirectUrl !== void 0;
    };
    async canHandle(oidcLoginOptions) {
      return this.parametersGuard(oidcLoginOptions);
    }
    async setupRedirectHandler({ oidcLoginOptions, state, codeVerifier, targetUrl }) {
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
          sessionId: oidcLoginOptions.sessionId
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
          keepAlive: booleanWithFallback(oidcLoginOptions.keepAlive, true).toString()
        })
      ]);
      this.redirector.redirect(targetUrl, {
        handleRedirect: oidcLoginOptions.handleRedirect
      });
      return void 0;
    }
  };
  var GeneralLogoutHandler = class {
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
  };
  var IRpLogoutHandler = class {
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
      if (options.toLogoutUrl === void 0) {
        throw new Error("Cannot perform IDP logout. Did you log in using the OIDC authentication flow?");
      }
      this.redirector.redirect(options.toLogoutUrl(options), {
        handleRedirect: options.handleRedirect
      });
    }
  };
  var IWaterfallLogoutHandler = class {
    handlers;
    constructor(sessionInfoManager, redirector) {
      this.handlers = [
        new GeneralLogoutHandler(sessionInfoManager),
        new IRpLogoutHandler(redirector)
      ];
    }
    async canHandle() {
      return true;
    }
    async handle(userId, options) {
      for (const handler of this.handlers) {
        if (await handler.canHandle(userId, options))
          await handler.handle(userId, options);
      }
    }
  };
  function getUnauthenticatedSession() {
    return {
      isLoggedIn: false,
      sessionId: v4_default(),
      fetch: (...args) => fetch(...args)
    };
  }
  async function clear(sessionId, storage) {
    await Promise.all([
      storage.deleteAllUserData(sessionId, { secure: false }),
      storage.deleteAllUserData(sessionId, { secure: true })
    ]);
  }
  var SessionInfoManagerBase = class {
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
  };
  function getEndSessionUrl({ endSessionEndpoint, idTokenHint, postLogoutRedirectUri, state }) {
    const url = new URL(endSessionEndpoint);
    if (idTokenHint !== void 0)
      url.searchParams.append("id_token_hint", idTokenHint);
    if (postLogoutRedirectUri !== void 0) {
      url.searchParams.append("post_logout_redirect_uri", postLogoutRedirectUri);
      if (state !== void 0)
        url.searchParams.append("state", state);
    }
    return url.toString();
  }
  function maybeBuildRpInitiatedLogout({ endSessionEndpoint, idTokenHint }) {
    if (endSessionEndpoint === void 0)
      return void 0;
    return function logout2({ state, postLogoutUrl }) {
      return getEndSessionUrl({
        endSessionEndpoint,
        idTokenHint,
        state,
        postLogoutRedirectUri: postLogoutUrl
      });
    };
  }
  function isSupportedTokenType(token) {
    return typeof token === "string" && ["DPoP", "Bearer"].includes(token);
  }
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  function determineSigningAlg(supported, preferred) {
    return preferred.find((signingAlg) => {
      return supported.includes(signingAlg);
    }) ?? null;
  }
  function isStaticClient(options) {
    return options.clientId !== void 0 && !isValidUrl(options.clientId);
  }
  function isSolidOidcClient(options, issuerConfig) {
    return issuerConfig.scopesSupported.includes("webid") && options.clientId !== void 0 && isValidUrl(options.clientId);
  }
  function isKnownClientType(clientType) {
    return typeof clientType === "string" && ["dynamic", "static", "solid-oidc"].includes(clientType);
  }
  async function handleRegistration(options, issuerConfig, storageUtility, clientRegistrar) {
    let clientInfo;
    if (isSolidOidcClient(options, issuerConfig)) {
      clientInfo = {
        clientId: options.clientId,
        clientName: options.clientName,
        clientType: "solid-oidc"
      };
    } else if (isStaticClient(options)) {
      clientInfo = {
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        clientName: options.clientName,
        clientType: "static"
      };
    } else {
      return clientRegistrar.getClient({
        sessionId: options.sessionId,
        clientName: options.clientName,
        redirectUrl: options.redirectUrl
      }, issuerConfig);
    }
    const infoToSave = {
      clientId: clientInfo.clientId,
      clientType: clientInfo.clientType
    };
    if (clientInfo.clientType === "static") {
      infoToSave.clientSecret = clientInfo.clientSecret;
    }
    if (clientInfo.clientName) {
      infoToSave.clientName = clientInfo.clientName;
    }
    await storageUtility.setForUser(options.sessionId, infoToSave);
    return clientInfo;
  }
  var boundFetch = (request, init) => fetch(request, init);
  var ClientAuthentication = class {
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
      await this.logoutHandler.handle(sessionId, options?.logoutType === "idp" ? {
        ...options,
        toLogoutUrl: this.boundLogout
      } : options);
      this.fetch = boundFetch;
      delete this.boundLogout;
    };
    getSessionInfo = async (sessionId) => {
      return this.sessionInfoManager.get(sessionId);
    };
    getAllSessionInfo = async () => {
      return this.sessionInfoManager.getAll();
    };
  };
  async function loadOidcContextFromStorage(sessionId, storageUtility, configFetcher) {
    try {
      const [issuerIri, codeVerifier, storedRedirectIri, dpop, keepAlive] = await Promise.all([
        storageUtility.getForUser(sessionId, "issuer", {
          errorIfNull: true
        }),
        storageUtility.getForUser(sessionId, "codeVerifier"),
        storageUtility.getForUser(sessionId, "redirectUrl"),
        storageUtility.getForUser(sessionId, "dpop", { errorIfNull: true }),
        storageUtility.getForUser(sessionId, "keepAlive")
      ]);
      await storageUtility.deleteForUser(sessionId, "codeVerifier");
      const issuerConfig = await configFetcher.fetchConfig(issuerIri);
      return {
        codeVerifier,
        redirectUrl: storedRedirectIri,
        issuerConfig,
        dpop: dpop === "true",
        // Default keepAlive to true if not found in storage.
        keepAlive: typeof keepAlive === "string" ? keepAlive === "true" : true
      };
    } catch (e) {
      throw new Error(`Failed to retrieve OIDC context from storage associated with session [${sessionId}]: ${e}`);
    }
  }
  async function saveSessionInfoToStorage(storageUtility, sessionId, webId, clientId, isLoggedIn2, refreshToken, secure, dpopKey) {
    if (refreshToken !== void 0) {
      await storageUtility.setForUser(sessionId, { refreshToken }, { secure });
    }
    if (webId !== void 0) {
      await storageUtility.setForUser(sessionId, { webId }, { secure });
    }
    if (clientId !== void 0) {
      await storageUtility.setForUser(sessionId, { clientId }, { secure });
    }
    if (isLoggedIn2 !== void 0) {
      await storageUtility.setForUser(sessionId, { isLoggedIn: isLoggedIn2 }, { secure });
    }
    if (dpopKey !== void 0) {
      await storageUtility.setForUser(sessionId, {
        publicKey: JSON.stringify(dpopKey.publicKey),
        privateKey: JSON.stringify(await exportJWK(dpopKey.privateKey))
      }, { secure });
    }
  }
  var StorageUtility = class {
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
      if (stored === void 0) {
        return {};
      }
      try {
        return JSON.parse(stored);
      } catch (_err) {
        throw new Error(`Data for user [${userId}] in [${secure ? "secure" : "unsecure"}] storage is corrupted - expected valid JSON, but got: ${stored}`);
      }
    }
    async setUserData(userId, data, secure) {
      await (secure ? this.secureStorage : this.insecureStorage).set(this.getKey(userId), JSON.stringify(data));
    }
    async get(key, options) {
      const value = await (options?.secure ? this.secureStorage : this.insecureStorage).get(key);
      if (value === void 0 && options?.errorIfNull) {
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
        value = void 0;
      }
      value = userData[key];
      if (value === void 0 && options?.errorIfNull) {
        throw new Error(`Field [${key}] for user [${userId}] is not stored`);
      }
      return value || void 0;
    }
    async setForUser(userId, values, options) {
      let userData;
      try {
        userData = await this.getUserData(userId, options?.secure);
      } catch {
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
  };
  var InMemoryStorage = class {
    map = {};
    async get(key) {
      return this.map[key] || void 0;
    }
    async set(key, value) {
      this.map[key] = value;
    }
    async delete(key) {
      delete this.map[key];
    }
  };
  var ConfigurationError = class extends Error {
    /* istanbul ignore next */
    constructor(message2) {
      super(message2);
    }
  };
  var NotImplementedError = class extends Error {
    /* istanbul ignore next */
    constructor(methodName) {
      super(`[${methodName}] is not implemented`);
    }
  };
  var InvalidResponseError = class extends Error {
    missingFields;
    /* istanbul ignore next */
    constructor(missingFields) {
      super(`Invalid response from OIDC provider: missing fields ${missingFields}`);
      this.missingFields = missingFields;
    }
  };
  var OidcProviderError = class extends Error {
    error;
    errorDescription;
    /* istanbul ignore next */
    constructor(message2, error, errorDescription) {
      super(message2);
      this.error = error;
      this.errorDescription = errorDescription;
    }
  };
  function normalizeHTU(audience) {
    const audienceUrl = new URL(audience);
    return new URL(audienceUrl.pathname, audienceUrl.origin).toString();
  }
  async function createDpopHeader(audience, method, dpopKey) {
    return new SignJWT({
      htu: normalizeHTU(audience),
      htm: method.toUpperCase(),
      jti: v4_default()
    }).setProtectedHeader({
      alg: PREFERRED_SIGNING_ALG[0],
      jwk: dpopKey.publicKey,
      typ: "dpop+jwt"
    }).setIssuedAt().sign(dpopKey.privateKey, {});
  }
  async function generateDpopKeyPair() {
    const { privateKey, publicKey } = await generateKeyPair2(PREFERRED_SIGNING_ALG[0], { extractable: true });
    const dpopKeyPair = {
      privateKey,
      publicKey: await exportJWK(publicKey)
    };
    [dpopKeyPair.publicKey.alg] = PREFERRED_SIGNING_ALG;
    return dpopKeyPair;
  }
  var DEFAULT_EXPIRATION_TIME_SECONDS = 600;
  function isExpectedAuthError(statusCode) {
    return [401, 403].includes(statusCode);
  }
  async function buildDpopFetchOptions(targetUrl, authToken, dpopKey, defaultOptions) {
    const headers = new Headers(defaultOptions?.headers);
    headers.set("Authorization", `DPoP ${authToken}`);
    headers.set("DPoP", await createDpopHeader(targetUrl, defaultOptions?.method ?? "get", dpopKey));
    return {
      ...defaultOptions,
      headers
    };
  }
  async function buildAuthenticatedHeaders(targetUrl, authToken, dpopKey, defaultOptions) {
    if (dpopKey !== void 0) {
      return buildDpopFetchOptions(targetUrl, authToken, dpopKey, defaultOptions);
    }
    const headers = new Headers(defaultOptions?.headers);
    headers.set("Authorization", `Bearer ${authToken}`);
    return {
      ...defaultOptions,
      headers
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
      expiresIn: tokenSet.expiresIn
    };
  }
  var computeRefreshDelay = (expiresIn) => {
    if (expiresIn !== void 0) {
      return expiresIn - REFRESH_BEFORE_EXPIRATION_SECONDS > 0 ? (
        // We want to refresh the token 5 seconds before they actually expire.
        expiresIn - REFRESH_BEFORE_EXPIRATION_SECONDS
      ) : expiresIn;
    }
    return DEFAULT_EXPIRATION_TIME_SECONDS;
  };
  function buildAuthenticatedFetch(accessToken, options) {
    let currentAccessToken = accessToken;
    let latestTimeout;
    const currentRefreshOptions = options?.refreshOptions;
    const emitter = options?.eventEmitter;
    if (options !== void 0 && currentRefreshOptions !== void 0) {
      const proactivelyRefreshToken = async () => {
        try {
          const { accessToken: refreshedAccessToken, refreshToken, expiresIn } = await refreshAccessToken(currentRefreshOptions, options.dpopKey, emitter);
          currentAccessToken = refreshedAccessToken;
          if (refreshToken !== void 0) {
            currentRefreshOptions.refreshToken = refreshToken;
          }
          clearTimeout(latestTimeout);
          latestTimeout = setTimeout(proactivelyRefreshToken, computeRefreshDelay(expiresIn) * 1e3);
          options.eventEmitter?.emit(EVENTS.TIMEOUT_SET, latestTimeout);
        } catch (e) {
          if (e instanceof OidcProviderError) {
            emitter?.emit(EVENTS.ERROR, e.error, e.errorDescription);
            emitter?.emit(EVENTS.SESSION_EXPIRED);
          }
          if (e instanceof InvalidResponseError && e.missingFields.includes("access_token")) {
            emitter?.emit(EVENTS.SESSION_EXPIRED);
          }
        }
      };
      latestTimeout = setTimeout(
        proactivelyRefreshToken,
        // If currentRefreshOptions is defined, options is necessarily defined too.
        computeRefreshDelay(options.expiresIn) * 1e3
      );
      emitter?.emit(EVENTS.TIMEOUT_SET, latestTimeout);
    } else if (emitter !== void 0) {
      const expirationTimeout = setTimeout(() => {
        emitter.emit(EVENTS.SESSION_EXPIRED);
      }, computeRefreshDelay(options?.expiresIn) * 1e3);
      emitter.emit(EVENTS.TIMEOUT_SET, expirationTimeout);
    }
    return async (url, requestInit) => {
      let response = await makeAuthenticatedRequest(currentAccessToken, url, requestInit, options?.dpopKey, options?.fetch);
      const failedButNotExpectedAuthError = !response.ok && !isExpectedAuthError(response.status);
      if (response.ok || failedButNotExpectedAuthError) {
        return response;
      }
      const hasBeenRedirected = response.url !== url;
      if (hasBeenRedirected && options?.dpopKey !== void 0) {
        response = await makeAuthenticatedRequest(
          currentAccessToken,
          // Replace the original target IRI (`url`) by the redirection target
          response.url,
          requestInit,
          options.dpopKey,
          options.fetch
        );
      }
      return response;
    };
  }

  // node_modules/@inrupt/solid-client-authn-browser/dist/index.mjs
  var import_events = __toESM(require_events(), 1);

  // node_modules/jwt-decode/build/esm/index.js
  var InvalidTokenError = class extends Error {
  };
  InvalidTokenError.prototype.name = "InvalidTokenError";
  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
      let code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = "0" + code;
      }
      return "%" + code;
    }));
  }
  function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("base64 string is not of the correct length");
    }
    try {
      return b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  }
  function jwtDecode(token, options) {
    if (typeof token !== "string") {
      throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
      throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
      decoded = base64UrlDecode(part);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
      return JSON.parse(decoded);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
  }

  // node_modules/oidc-client-ts/dist/esm/oidc-client-ts.js
  var nopLogger = {
    debug: () => void 0,
    info: () => void 0,
    warn: () => void 0,
    error: () => void 0
  };
  var level;
  var logger;
  var Log = /* @__PURE__ */ ((Log2) => {
    Log2[Log2["NONE"] = 0] = "NONE";
    Log2[Log2["ERROR"] = 1] = "ERROR";
    Log2[Log2["WARN"] = 2] = "WARN";
    Log2[Log2["INFO"] = 3] = "INFO";
    Log2[Log2["DEBUG"] = 4] = "DEBUG";
    return Log2;
  })(Log || {});
  ((Log2) => {
    function reset() {
      level = 3;
      logger = nopLogger;
    }
    Log2.reset = reset;
    function setLevel(value) {
      if (!(0 <= value && value <= 4)) {
        throw new Error("Invalid log level");
      }
      level = value;
    }
    Log2.setLevel = setLevel;
    function setLogger(value) {
      logger = value;
    }
    Log2.setLogger = setLogger;
  })(Log || (Log = {}));
  var Logger = class _Logger {
    constructor(_name) {
      this._name = _name;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
    debug(...args) {
      if (level >= 4) {
        logger.debug(_Logger._format(this._name, this._method), ...args);
      }
    }
    info(...args) {
      if (level >= 3) {
        logger.info(_Logger._format(this._name, this._method), ...args);
      }
    }
    warn(...args) {
      if (level >= 2) {
        logger.warn(_Logger._format(this._name, this._method), ...args);
      }
    }
    error(...args) {
      if (level >= 1) {
        logger.error(_Logger._format(this._name, this._method), ...args);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    throw(err) {
      this.error(err);
      throw err;
    }
    create(method) {
      const methodLogger = Object.create(this);
      methodLogger._method = method;
      methodLogger.debug("begin");
      return methodLogger;
    }
    static createStatic(name, staticMethod) {
      const staticLogger = new _Logger(`${name}.${staticMethod}`);
      staticLogger.debug("begin");
      return staticLogger;
    }
    static _format(name, method) {
      const prefix = `[${name}]`;
      return method ? `${prefix} ${method}:` : prefix;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
    // helpers for static class methods
    static debug(name, ...args) {
      if (level >= 4) {
        logger.debug(_Logger._format(name), ...args);
      }
    }
    static info(name, ...args) {
      if (level >= 3) {
        logger.info(_Logger._format(name), ...args);
      }
    }
    static warn(name, ...args) {
      if (level >= 2) {
        logger.warn(_Logger._format(name), ...args);
      }
    }
    static error(name, ...args) {
      if (level >= 1) {
        logger.error(_Logger._format(name), ...args);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
  };
  Log.reset();
  var JwtUtils = class {
    // IMPORTANT: doesn't validate the token
    static decode(token) {
      try {
        return jwtDecode(token);
      } catch (err) {
        Logger.error("JwtUtils.decode", err);
        throw err;
      }
    }
    static async generateSignedJwt(header, payload, privateKey) {
      const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
      const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
      const encodedToken = `${encodedHeader}.${encodedPayload}`;
      const signature = await window.crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" }
        },
        privateKey,
        new TextEncoder().encode(encodedToken)
      );
      const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
      return `${encodedToken}.${encodedSignature}`;
    }
    static async generateSignedJwtWithHmac(header, payload, secretKey) {
      const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
      const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
      const encodedToken = `${encodedHeader}.${encodedPayload}`;
      const signature = await window.crypto.subtle.sign(
        "HMAC",
        secretKey,
        new TextEncoder().encode(encodedToken)
      );
      const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
      return `${encodedToken}.${encodedSignature}`;
    }
  };
  var UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";
  var toBase64 = (val) => btoa([...new Uint8Array(val)].map((chr) => String.fromCharCode(chr)).join(""));
  var _CryptoUtils = class _CryptoUtils2 {
    static _randomWord() {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0];
    }
    /**
     * Generates RFC4122 version 4 guid
     */
    static generateUUIDv4() {
      const uuid = UUID_V4_TEMPLATE.replace(
        /[018]/g,
        (c) => (+c ^ _CryptoUtils2._randomWord() & 15 >> +c / 4).toString(16)
      );
      return uuid.replace(/-/g, "");
    }
    /**
     * PKCE: Generate a code verifier
     */
    static generateCodeVerifier() {
      return _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4();
    }
    /**
     * PKCE: Generate a code challenge
     */
    static async generateCodeChallenge(code_verifier) {
      if (!crypto.subtle) {
        throw new Error("Crypto.subtle is available only in secure contexts (HTTPS).");
      }
      try {
        const encoder2 = new TextEncoder();
        const data = encoder2.encode(code_verifier);
        const hashed = await crypto.subtle.digest("SHA-256", data);
        return toBase64(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      } catch (err) {
        Logger.error("CryptoUtils.generateCodeChallenge", err);
        throw err;
      }
    }
    /**
     * Generates a base64-encoded string for a basic auth header
     */
    static generateBasicAuth(client_id, client_secret) {
      const encoder2 = new TextEncoder();
      const data = encoder2.encode([client_id, client_secret].join(":"));
      return toBase64(data);
    }
    /**
     * Generates a hash of a string using a given algorithm
     * @param alg
     * @param message
     */
    static async hash(alg, message2) {
      const msgUint8 = new TextEncoder().encode(message2);
      const hashBuffer = await crypto.subtle.digest(alg, msgUint8);
      return new Uint8Array(hashBuffer);
    }
    /**
     * Generates a rfc7638 compliant jwk thumbprint
     * @param jwk
     */
    static async customCalculateJwkThumbprint(jwk) {
      let jsonObject;
      switch (jwk.kty) {
        case "RSA":
          jsonObject = {
            "e": jwk.e,
            "kty": jwk.kty,
            "n": jwk.n
          };
          break;
        case "EC":
          jsonObject = {
            "crv": jwk.crv,
            "kty": jwk.kty,
            "x": jwk.x,
            "y": jwk.y
          };
          break;
        case "OKP":
          jsonObject = {
            "crv": jwk.crv,
            "kty": jwk.kty,
            "x": jwk.x
          };
          break;
        case "oct":
          jsonObject = {
            "crv": jwk.k,
            "kty": jwk.kty
          };
          break;
        default:
          throw new Error("Unknown jwk type");
      }
      const utf8encodedAndHashed = await _CryptoUtils2.hash("SHA-256", JSON.stringify(jsonObject));
      return _CryptoUtils2.encodeBase64Url(utf8encodedAndHashed);
    }
    static async generateDPoPProof({
      url,
      accessToken,
      httpMethod,
      keyPair,
      nonce
    }) {
      let hashedToken;
      let encodedHash;
      const payload = {
        "jti": window.crypto.randomUUID(),
        "htm": httpMethod != null ? httpMethod : "GET",
        "htu": url,
        "iat": Math.floor(Date.now() / 1e3)
      };
      if (accessToken) {
        hashedToken = await _CryptoUtils2.hash("SHA-256", accessToken);
        encodedHash = _CryptoUtils2.encodeBase64Url(hashedToken);
        payload.ath = encodedHash;
      }
      if (nonce) {
        payload.nonce = nonce;
      }
      try {
        const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        const header = {
          "alg": "ES256",
          "typ": "dpop+jwt",
          "jwk": {
            "crv": publicJwk.crv,
            "kty": publicJwk.kty,
            "x": publicJwk.x,
            "y": publicJwk.y
          }
        };
        return await JwtUtils.generateSignedJwt(header, payload, keyPair.privateKey);
      } catch (err) {
        if (err instanceof TypeError) {
          throw new Error(`Error exporting dpop public key: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    static async generateDPoPJkt(keyPair) {
      try {
        const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        return await _CryptoUtils2.customCalculateJwkThumbprint(publicJwk);
      } catch (err) {
        if (err instanceof TypeError) {
          throw new Error(`Could not retrieve dpop keys from storage: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    static async generateDPoPKeys() {
      return await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        false,
        ["sign", "verify"]
      );
    }
    /**
     * Generates a client assertion JWT for client_secret_jwt authentication
     * @param client_id The client identifier
     * @param client_secret The client secret
     * @param audience The token endpoint URL (audience)
     * @param algorithm The HMAC algorithm to use (HS256, HS384, HS512). Defaults to HS256
     */
    static async generateClientAssertionJwt(client_id, client_secret, audience, algorithm = "HS256") {
      const now = Math.floor(Date.now() / 1e3);
      const header = {
        "alg": algorithm,
        "typ": "JWT"
      };
      const payload = {
        "iss": client_id,
        "sub": client_id,
        "aud": audience,
        "jti": _CryptoUtils2.generateUUIDv4(),
        "exp": now + 300,
        // 5 minutes
        "iat": now
      };
      const hashMap = {
        "HS256": "SHA-256",
        "HS384": "SHA-384",
        "HS512": "SHA-512"
      };
      const hashFunction = hashMap[algorithm];
      if (!hashFunction) {
        throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms are: HS256, HS384, HS512`);
      }
      const encoder2 = new TextEncoder();
      const secretKey = await crypto.subtle.importKey(
        "raw",
        encoder2.encode(client_secret),
        { name: "HMAC", hash: hashFunction },
        false,
        ["sign"]
      );
      return await JwtUtils.generateSignedJwtWithHmac(header, payload, secretKey);
    }
  };
  _CryptoUtils.encodeBase64Url = (input) => {
    return toBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
  var CryptoUtils = _CryptoUtils;
  var Event = class {
    constructor(_name) {
      this._name = _name;
      this._callbacks = [];
      this._logger = new Logger(`Event('${this._name}')`);
    }
    addHandler(cb) {
      this._callbacks.push(cb);
      return () => this.removeHandler(cb);
    }
    removeHandler(cb) {
      const idx = this._callbacks.lastIndexOf(cb);
      if (idx >= 0) {
        this._callbacks.splice(idx, 1);
      }
    }
    async raise(...ev) {
      this._logger.debug("raise:", ...ev);
      for (const cb of this._callbacks) {
        await cb(...ev);
      }
    }
  };
  var Timer = class _Timer extends Event {
    constructor() {
      super(...arguments);
      this._logger = new Logger(`Timer('${this._name}')`);
      this._timerHandle = null;
      this._expiration = 0;
      this._callback = () => {
        const diff = this._expiration - _Timer.getEpochTime();
        this._logger.debug("timer completes in", diff);
        if (this._expiration <= _Timer.getEpochTime()) {
          this.cancel();
          void super.raise();
        }
      };
    }
    // get the time
    static getEpochTime() {
      return Math.floor(Date.now() / 1e3);
    }
    init(durationInSeconds) {
      const logger2 = this._logger.create("init");
      durationInSeconds = Math.max(Math.floor(durationInSeconds), 1);
      const expiration = _Timer.getEpochTime() + durationInSeconds;
      if (this.expiration === expiration && this._timerHandle) {
        logger2.debug("skipping since already initialized for expiration at", this.expiration);
        return;
      }
      this.cancel();
      logger2.debug("using duration", durationInSeconds);
      this._expiration = expiration;
      const timerDurationInSeconds = Math.min(durationInSeconds, 5);
      this._timerHandle = setInterval(this._callback, timerDurationInSeconds * 1e3);
    }
    get expiration() {
      return this._expiration;
    }
    cancel() {
      this._logger.create("cancel");
      if (this._timerHandle) {
        clearInterval(this._timerHandle);
        this._timerHandle = null;
      }
    }
  };
  var UrlUtils = class {
    static readParams(url, responseMode = "query") {
      if (!url) throw new TypeError("Invalid URL");
      const parsedUrl = new URL(url, "http://127.0.0.1");
      const params = parsedUrl[responseMode === "fragment" ? "hash" : "search"];
      return new URLSearchParams(params.slice(1));
    }
  };
  var URL_STATE_DELIMITER = ";";
  var ErrorResponse = class extends Error {
    constructor(args, form) {
      var _a, _b, _c;
      super(args.error_description || args.error || "");
      this.form = form;
      this.name = "ErrorResponse";
      if (!args.error) {
        Logger.error("ErrorResponse", "No error passed");
        throw new Error("No error passed");
      }
      this.error = args.error;
      this.error_description = (_a = args.error_description) != null ? _a : null;
      this.error_uri = (_b = args.error_uri) != null ? _b : null;
      this.state = args.userState;
      this.session_state = (_c = args.session_state) != null ? _c : null;
      this.url_state = args.url_state;
    }
  };
  var ErrorTimeout = class extends Error {
    constructor(message2) {
      super(message2);
      this.name = "ErrorTimeout";
    }
  };
  var InMemoryWebStorage = class {
    constructor() {
      this._logger = new Logger("InMemoryWebStorage");
      this._data = {};
    }
    clear() {
      this._logger.create("clear");
      this._data = {};
    }
    getItem(key) {
      this._logger.create(`getItem('${key}')`);
      return this._data[key];
    }
    setItem(key, value) {
      this._logger.create(`setItem('${key}')`);
      this._data[key] = value;
    }
    removeItem(key) {
      this._logger.create(`removeItem('${key}')`);
      delete this._data[key];
    }
    get length() {
      return Object.getOwnPropertyNames(this._data).length;
    }
    key(index) {
      return Object.getOwnPropertyNames(this._data)[index];
    }
  };
  var ErrorDPoPNonce = class extends Error {
    constructor(nonce, message2) {
      super(message2);
      this.name = "ErrorDPoPNonce";
      this.nonce = nonce;
    }
  };
  var JsonService = class {
    constructor(additionalContentTypes = [], _jwtHandler = null, _extraHeaders = {}) {
      this._jwtHandler = _jwtHandler;
      this._extraHeaders = _extraHeaders;
      this._logger = new Logger("JsonService");
      this._contentTypes = [];
      this._contentTypes.push(...additionalContentTypes, "application/json");
      if (_jwtHandler) {
        this._contentTypes.push("application/jwt");
      }
    }
    async fetchWithTimeout(input, init = {}) {
      const { timeoutInSeconds, ...initFetch } = init;
      if (!timeoutInSeconds) {
        return await fetch(input, initFetch);
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutInSeconds * 1e3);
      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal
        });
        return response;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new ErrorTimeout("Network timed out");
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    async getJson(url, {
      token,
      credentials,
      timeoutInSeconds
    } = {}) {
      const logger2 = this._logger.create("getJson");
      const headers = {
        "Accept": this._contentTypes.join(", ")
      };
      if (token) {
        logger2.debug("token passed, setting Authorization header");
        headers["Authorization"] = "Bearer " + token;
      }
      this._appendExtraHeaders(headers);
      let response;
      try {
        logger2.debug("url:", url);
        response = await this.fetchWithTimeout(url, { method: "GET", headers, timeoutInSeconds, credentials });
      } catch (err) {
        logger2.error("Network Error");
        throw err;
      }
      logger2.debug("HTTP response received, status", response.status);
      const contentType = response.headers.get("Content-Type");
      if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
        logger2.throw(new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`));
      }
      if (response.ok && this._jwtHandler && (contentType == null ? void 0 : contentType.startsWith("application/jwt"))) {
        return await this._jwtHandler(await response.text());
      }
      let json;
      try {
        json = await response.json();
      } catch (err) {
        logger2.error("Error parsing JSON response", err);
        if (response.ok) throw err;
        throw new Error(`${response.statusText} (${response.status})`);
      }
      if (!response.ok) {
        logger2.error("Error from server:", json);
        if (json.error) {
          throw new ErrorResponse(json);
        }
        throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
      }
      return json;
    }
    async postForm(url, {
      body,
      basicAuth,
      timeoutInSeconds,
      initCredentials,
      extraHeaders
    }) {
      const logger2 = this._logger.create("postForm");
      const headers = {
        "Accept": this._contentTypes.join(", "),
        "Content-Type": "application/x-www-form-urlencoded",
        ...extraHeaders
      };
      if (basicAuth !== void 0) {
        headers["Authorization"] = "Basic " + basicAuth;
      }
      this._appendExtraHeaders(headers);
      let response;
      try {
        logger2.debug("url:", url);
        response = await this.fetchWithTimeout(url, { method: "POST", headers, body, timeoutInSeconds, credentials: initCredentials });
      } catch (err) {
        logger2.error("Network error");
        throw err;
      }
      logger2.debug("HTTP response received, status", response.status);
      const contentType = response.headers.get("Content-Type");
      if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
        throw new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`);
      }
      const responseText = await response.text();
      let json = {};
      if (responseText) {
        try {
          json = JSON.parse(responseText);
        } catch (err) {
          logger2.error("Error parsing JSON response", err);
          if (response.ok) throw err;
          throw new Error(`${response.statusText} (${response.status})`);
        }
      }
      if (!response.ok) {
        logger2.error("Error from server:", json);
        if (response.headers.has("dpop-nonce")) {
          const nonce = response.headers.get("dpop-nonce");
          throw new ErrorDPoPNonce(nonce, `${JSON.stringify(json)}`);
        }
        if (json.error) {
          throw new ErrorResponse(json, body);
        }
        throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
      }
      return json;
    }
    _appendExtraHeaders(headers) {
      const logger2 = this._logger.create("appendExtraHeaders");
      const customKeys = Object.keys(this._extraHeaders);
      const protectedHeaders = [
        "accept",
        "content-type"
      ];
      const preventOverride = [
        "authorization"
      ];
      if (customKeys.length === 0) {
        return;
      }
      customKeys.forEach((headerName) => {
        if (protectedHeaders.includes(headerName.toLocaleLowerCase())) {
          logger2.warn("Protected header could not be set", headerName, protectedHeaders);
          return;
        }
        if (preventOverride.includes(headerName.toLocaleLowerCase()) && Object.keys(headers).includes(headerName)) {
          logger2.warn("Header could not be overridden", headerName, preventOverride);
          return;
        }
        const content = typeof this._extraHeaders[headerName] === "function" ? this._extraHeaders[headerName]() : this._extraHeaders[headerName];
        if (content && content !== "") {
          headers[headerName] = content;
        }
      });
    }
  };
  var MetadataService = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("MetadataService");
      this._signingKeys = null;
      this._metadata = null;
      this._metadataUrl = this._settings.metadataUrl;
      this._jsonService = new JsonService(
        ["application/jwk-set+json"],
        null,
        this._settings.extraHeaders
      );
      if (this._settings.signingKeys) {
        this._logger.debug("using signingKeys from settings");
        this._signingKeys = this._settings.signingKeys;
      }
      if (this._settings.metadata) {
        this._logger.debug("using metadata from settings");
        this._metadata = this._settings.metadata;
      }
      if (this._settings.fetchRequestCredentials) {
        this._logger.debug("using fetchRequestCredentials from settings");
        this._fetchRequestCredentials = this._settings.fetchRequestCredentials;
      }
    }
    resetSigningKeys() {
      this._signingKeys = null;
    }
    async getMetadata() {
      const logger2 = this._logger.create("getMetadata");
      if (this._metadata) {
        logger2.debug("using cached values");
        return this._metadata;
      }
      if (!this._metadataUrl) {
        logger2.throw(new Error("No authority or metadataUrl configured on settings"));
        throw null;
      }
      logger2.debug("getting metadata from", this._metadataUrl);
      const metadata = await this._jsonService.getJson(this._metadataUrl, { credentials: this._fetchRequestCredentials, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("merging remote JSON with seed metadata");
      this._metadata = Object.assign({}, metadata, this._settings.metadataSeed);
      return this._metadata;
    }
    getIssuer() {
      return this._getMetadataProperty("issuer");
    }
    getAuthorizationEndpoint() {
      return this._getMetadataProperty("authorization_endpoint");
    }
    getUserInfoEndpoint() {
      return this._getMetadataProperty("userinfo_endpoint");
    }
    getTokenEndpoint(optional = true) {
      return this._getMetadataProperty("token_endpoint", optional);
    }
    getCheckSessionIframe() {
      return this._getMetadataProperty("check_session_iframe", true);
    }
    getEndSessionEndpoint() {
      return this._getMetadataProperty("end_session_endpoint", true);
    }
    getRevocationEndpoint(optional = true) {
      return this._getMetadataProperty("revocation_endpoint", optional);
    }
    getKeysEndpoint(optional = true) {
      return this._getMetadataProperty("jwks_uri", optional);
    }
    async _getMetadataProperty(name, optional = false) {
      const logger2 = this._logger.create(`_getMetadataProperty('${name}')`);
      const metadata = await this.getMetadata();
      logger2.debug("resolved");
      if (metadata[name] === void 0) {
        if (optional === true) {
          logger2.warn("Metadata does not contain optional property");
          return void 0;
        }
        logger2.throw(new Error("Metadata does not contain property " + name));
      }
      return metadata[name];
    }
    async getSigningKeys() {
      const logger2 = this._logger.create("getSigningKeys");
      if (this._signingKeys) {
        logger2.debug("returning signingKeys from cache");
        return this._signingKeys;
      }
      const jwks_uri = await this.getKeysEndpoint(false);
      logger2.debug("got jwks_uri", jwks_uri);
      const keySet = await this._jsonService.getJson(jwks_uri, { timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("got key set", keySet);
      if (!Array.isArray(keySet.keys)) {
        logger2.throw(new Error("Missing keys on keyset"));
        throw null;
      }
      this._signingKeys = keySet.keys;
      return this._signingKeys;
    }
  };
  var WebStorageStateStore = class {
    constructor({
      prefix = "oidc.",
      store = localStorage
    } = {}) {
      this._logger = new Logger("WebStorageStateStore");
      this._store = store;
      this._prefix = prefix;
    }
    async set(key, value) {
      this._logger.create(`set('${key}')`);
      key = this._prefix + key;
      await this._store.setItem(key, value);
    }
    async get(key) {
      this._logger.create(`get('${key}')`);
      key = this._prefix + key;
      const item = await this._store.getItem(key);
      return item;
    }
    async remove(key) {
      this._logger.create(`remove('${key}')`);
      key = this._prefix + key;
      const item = await this._store.getItem(key);
      await this._store.removeItem(key);
      return item;
    }
    async getAllKeys() {
      this._logger.create("getAllKeys");
      const len = await this._store.length;
      const keys = [];
      for (let index = 0; index < len; index++) {
        const key = await this._store.key(index);
        if (key && key.indexOf(this._prefix) === 0) {
          keys.push(key.substr(this._prefix.length));
        }
      }
      return keys;
    }
  };
  var DefaultResponseType = "code";
  var DefaultScope = "openid";
  var DefaultClientAuthentication = "client_secret_post";
  var DefaultStaleStateAgeInSeconds = 60 * 15;
  var OidcClientSettingsStore = class {
    constructor({
      // metadata related
      authority,
      metadataUrl,
      metadata,
      signingKeys,
      metadataSeed,
      // client related
      client_id,
      client_secret,
      response_type = DefaultResponseType,
      scope = DefaultScope,
      redirect_uri,
      post_logout_redirect_uri,
      client_authentication = DefaultClientAuthentication,
      token_endpoint_auth_signing_alg = "HS256",
      // optional protocol
      prompt,
      display,
      max_age,
      ui_locales,
      acr_values,
      resource,
      response_mode,
      // behavior flags
      filterProtocolClaims = true,
      loadUserInfo = false,
      requestTimeoutInSeconds,
      staleStateAgeInSeconds = DefaultStaleStateAgeInSeconds,
      mergeClaimsStrategy = { array: "replace" },
      disablePKCE = false,
      // other behavior
      stateStore,
      revokeTokenAdditionalContentTypes,
      fetchRequestCredentials,
      refreshTokenAllowedScope,
      // extra
      extraQueryParams = {},
      extraTokenParams = {},
      extraHeaders = {},
      dpop,
      omitScopeWhenRequesting = false
    }) {
      var _a;
      this.authority = authority;
      if (metadataUrl) {
        this.metadataUrl = metadataUrl;
      } else {
        this.metadataUrl = authority;
        if (authority) {
          if (!this.metadataUrl.endsWith("/")) {
            this.metadataUrl += "/";
          }
          this.metadataUrl += ".well-known/openid-configuration";
        }
      }
      this.metadata = metadata;
      this.metadataSeed = metadataSeed;
      this.signingKeys = signingKeys;
      this.client_id = client_id;
      this.client_secret = client_secret;
      this.response_type = response_type;
      this.scope = scope;
      this.redirect_uri = redirect_uri;
      this.post_logout_redirect_uri = post_logout_redirect_uri;
      this.client_authentication = client_authentication;
      this.token_endpoint_auth_signing_alg = token_endpoint_auth_signing_alg;
      this.prompt = prompt;
      this.display = display;
      this.max_age = max_age;
      this.ui_locales = ui_locales;
      this.acr_values = acr_values;
      this.resource = resource;
      this.response_mode = response_mode;
      this.filterProtocolClaims = filterProtocolClaims != null ? filterProtocolClaims : true;
      this.loadUserInfo = !!loadUserInfo;
      this.staleStateAgeInSeconds = staleStateAgeInSeconds;
      this.mergeClaimsStrategy = mergeClaimsStrategy;
      this.omitScopeWhenRequesting = omitScopeWhenRequesting;
      this.disablePKCE = !!disablePKCE;
      this.revokeTokenAdditionalContentTypes = revokeTokenAdditionalContentTypes;
      this.fetchRequestCredentials = fetchRequestCredentials ? fetchRequestCredentials : "same-origin";
      this.requestTimeoutInSeconds = requestTimeoutInSeconds;
      if (stateStore) {
        this.stateStore = stateStore;
      } else {
        const store = typeof window !== "undefined" ? window.localStorage : new InMemoryWebStorage();
        this.stateStore = new WebStorageStateStore({ store });
      }
      this.refreshTokenAllowedScope = refreshTokenAllowedScope;
      this.extraQueryParams = extraQueryParams;
      this.extraTokenParams = extraTokenParams;
      this.extraHeaders = extraHeaders;
      this.dpop = dpop;
      if (this.dpop && !((_a = this.dpop) == null ? void 0 : _a.store)) {
        throw new Error("A DPoPStore is required when dpop is enabled");
      }
    }
  };
  var UserInfoService = class {
    constructor(_settings, _metadataService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._logger = new Logger("UserInfoService");
      this._getClaimsFromJwt = async (responseText) => {
        const logger2 = this._logger.create("_getClaimsFromJwt");
        try {
          const payload = JwtUtils.decode(responseText);
          logger2.debug("JWT decoding successful");
          return payload;
        } catch (err) {
          logger2.error("Error parsing JWT response");
          throw err;
        }
      };
      this._jsonService = new JsonService(
        void 0,
        this._getClaimsFromJwt,
        this._settings.extraHeaders
      );
    }
    async getClaims(token) {
      const logger2 = this._logger.create("getClaims");
      if (!token) {
        this._logger.throw(new Error("No token passed"));
      }
      const url = await this._metadataService.getUserInfoEndpoint();
      logger2.debug("got userinfo url", url);
      const claims = await this._jsonService.getJson(url, {
        token,
        credentials: this._settings.fetchRequestCredentials,
        timeoutInSeconds: this._settings.requestTimeoutInSeconds
      });
      logger2.debug("got claims", claims);
      return claims;
    }
  };
  var TokenClient = class {
    constructor(_settings, _metadataService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._logger = new Logger("TokenClient");
      this._jsonService = new JsonService(
        this._settings.revokeTokenAdditionalContentTypes,
        null,
        this._settings.extraHeaders
      );
    }
    /**
     * Exchange code.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
     */
    async exchangeCode({
      grant_type = "authorization_code",
      redirect_uri = this._settings.redirect_uri,
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      extraHeaders,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeCode");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      if (!redirect_uri) {
        logger2.throw(new Error("A redirect_uri is required"));
      }
      if (!args.code) {
        logger2.throw(new Error("A code is required"));
      }
      const params = new URLSearchParams({ grant_type, redirect_uri });
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, {
        body: params,
        basicAuth,
        timeoutInSeconds: this._settings.requestTimeoutInSeconds,
        initCredentials: this._settings.fetchRequestCredentials,
        extraHeaders
      });
      logger2.debug("got response");
      return response;
    }
    /**
     * Exchange credentials.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.3.2
     */
    async exchangeCredentials({
      grant_type = "password",
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      scope = this._settings.scope,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeCredentials");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      const params = new URLSearchParams({ grant_type });
      if (!this._settings.omitScopeWhenRequesting) {
        params.set("scope", scope);
      }
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds: this._settings.requestTimeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials });
      logger2.debug("got response");
      return response;
    }
    /**
     * Exchange a refresh token.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-6
     */
    async exchangeRefreshToken({
      grant_type = "refresh_token",
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      timeoutInSeconds,
      extraHeaders,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeRefreshToken");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      if (!args.refresh_token) {
        logger2.throw(new Error("A refresh_token is required"));
      }
      const params = new URLSearchParams({ grant_type });
      for (const [key, value] of Object.entries(args)) {
        if (Array.isArray(value)) {
          value.forEach((param) => params.append(key, param));
        } else if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials, extraHeaders });
      logger2.debug("got response");
      return response;
    }
    /**
     * Revoke an access or refresh token.
     *
     * @see https://datatracker.ietf.org/doc/html/rfc7009#section-2.1
     */
    async revoke(args) {
      var _a;
      const logger2 = this._logger.create("revoke");
      if (!args.token) {
        logger2.throw(new Error("A token is required"));
      }
      const url = await this._metadataService.getRevocationEndpoint(false);
      logger2.debug(`got revocation endpoint, revoking ${(_a = args.token_type_hint) != null ? _a : "default token type"}`);
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      params.set("client_id", this._settings.client_id);
      if (this._settings.client_secret) {
        params.set("client_secret", this._settings.client_secret);
      }
      await this._jsonService.postForm(url, { body: params, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("got response");
    }
  };
  var ResponseValidator = class {
    constructor(_settings, _metadataService, _claimsService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._claimsService = _claimsService;
      this._logger = new Logger("ResponseValidator");
      this._userInfoService = new UserInfoService(this._settings, this._metadataService);
      this._tokenClient = new TokenClient(this._settings, this._metadataService);
    }
    async validateSigninResponse(response, state, extraHeaders) {
      const logger2 = this._logger.create("validateSigninResponse");
      this._processSigninState(response, state);
      logger2.debug("state processed");
      await this._processCode(response, state, extraHeaders);
      logger2.debug("code processed");
      if (response.isOpenId) {
        this._validateIdTokenAttributes(response, "", state.nonce);
      }
      logger2.debug("tokens validated");
      await this._processClaims(response, state == null ? void 0 : state.skipUserInfo, response.isOpenId);
      logger2.debug("claims processed");
    }
    async validateCredentialsResponse(response, skipUserInfo) {
      const logger2 = this._logger.create("validateCredentialsResponse");
      const shouldValidateSubClaim = response.isOpenId && !!response.id_token;
      if (shouldValidateSubClaim) {
        this._validateIdTokenAttributes(response);
      }
      logger2.debug("tokens validated");
      await this._processClaims(response, skipUserInfo, shouldValidateSubClaim);
      logger2.debug("claims processed");
    }
    async validateRefreshResponse(response, state) {
      var _a, _b;
      const logger2 = this._logger.create("validateRefreshResponse");
      response.userState = state.data;
      (_a = response.session_state) != null ? _a : response.session_state = state.session_state;
      (_b = response.scope) != null ? _b : response.scope = state.scope;
      if (response.isOpenId && !!response.id_token) {
        this._validateIdTokenAttributes(response, state.id_token);
        logger2.debug("ID Token validated");
      }
      if (!response.id_token) {
        response.id_token = state.id_token;
        response.profile = state.profile;
      }
      const hasIdToken2 = response.isOpenId && !!response.id_token;
      await this._processClaims(response, false, hasIdToken2);
      logger2.debug("claims processed");
    }
    validateSignoutResponse(response, state) {
      const logger2 = this._logger.create("validateSignoutResponse");
      if (state.id !== response.state) {
        logger2.throw(new Error("State does not match"));
      }
      logger2.debug("state validated");
      response.userState = state.data;
      if (response.error) {
        logger2.warn("Response was error", response.error);
        throw new ErrorResponse(response);
      }
    }
    _processSigninState(response, state) {
      var _a;
      const logger2 = this._logger.create("_processSigninState");
      if (state.id !== response.state) {
        logger2.throw(new Error("State does not match"));
      }
      if (!state.client_id) {
        logger2.throw(new Error("No client_id on state"));
      }
      if (!state.authority) {
        logger2.throw(new Error("No authority on state"));
      }
      if (this._settings.authority !== state.authority) {
        logger2.throw(new Error("authority mismatch on settings vs. signin state"));
      }
      if (this._settings.client_id && this._settings.client_id !== state.client_id) {
        logger2.throw(new Error("client_id mismatch on settings vs. signin state"));
      }
      logger2.debug("state validated");
      response.userState = state.data;
      response.url_state = state.url_state;
      (_a = response.scope) != null ? _a : response.scope = state.scope;
      if (response.error) {
        logger2.warn("Response was error", response.error);
        throw new ErrorResponse(response);
      }
      if (state.code_verifier && !response.code) {
        logger2.throw(new Error("Expected code in response"));
      }
    }
    async _processClaims(response, skipUserInfo = false, validateSub = true) {
      const logger2 = this._logger.create("_processClaims");
      response.profile = this._claimsService.filterProtocolClaims(response.profile);
      if (skipUserInfo || !this._settings.loadUserInfo || !response.access_token) {
        logger2.debug("not loading user info");
        return;
      }
      logger2.debug("loading user info");
      const claims = await this._userInfoService.getClaims(response.access_token);
      logger2.debug("user info claims received from user info endpoint");
      if (validateSub && claims.sub !== response.profile.sub) {
        logger2.throw(new Error("subject from UserInfo response does not match subject in ID Token"));
      }
      response.profile = this._claimsService.mergeClaims(response.profile, this._claimsService.filterProtocolClaims(claims));
      logger2.debug("user info claims received, updated profile:", response.profile);
    }
    async _processCode(response, state, extraHeaders) {
      const logger2 = this._logger.create("_processCode");
      if (response.code) {
        logger2.debug("Validating code");
        const tokenResponse = await this._tokenClient.exchangeCode({
          client_id: state.client_id,
          client_secret: state.client_secret,
          code: response.code,
          redirect_uri: state.redirect_uri,
          code_verifier: state.code_verifier,
          extraHeaders,
          ...state.extraTokenParams
        });
        Object.assign(response, tokenResponse);
      } else {
        logger2.debug("No code to process");
      }
    }
    _validateIdTokenAttributes(response, existingToken, nonce) {
      var _a;
      const logger2 = this._logger.create("_validateIdTokenAttributes");
      logger2.debug("decoding ID Token JWT");
      const incoming = JwtUtils.decode((_a = response.id_token) != null ? _a : "");
      if (!incoming.sub) {
        logger2.throw(new Error("ID Token is missing a subject claim"));
      }
      if (nonce && incoming.nonce !== nonce) {
        logger2.throw(new Error("nonce in id_token does not match nonce in client storage"));
      }
      if (existingToken) {
        const existing = JwtUtils.decode(existingToken);
        if (incoming.sub !== existing.sub) {
          logger2.throw(new Error("sub in id_token does not match current sub"));
        }
        if (incoming.auth_time && incoming.auth_time !== existing.auth_time) {
          logger2.throw(new Error("auth_time in id_token does not match original auth_time"));
        }
        if (incoming.azp && incoming.azp !== existing.azp) {
          logger2.throw(new Error("azp in id_token does not match original azp"));
        }
        if (!incoming.azp && existing.azp) {
          logger2.throw(new Error("azp not in id_token, but present in original id_token"));
        }
      }
      response.profile = incoming;
    }
  };
  var State = class _State {
    constructor(args) {
      this.id = args.id || CryptoUtils.generateUUIDv4();
      this.data = args.data;
      if (args.created && args.created > 0) {
        this.created = args.created;
      } else {
        this.created = Timer.getEpochTime();
      }
      this.request_type = args.request_type;
      this.url_state = args.url_state;
    }
    toStorageString() {
      new Logger("State").create("toStorageString");
      return JSON.stringify({
        id: this.id,
        data: this.data,
        created: this.created,
        request_type: this.request_type,
        url_state: this.url_state
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("State", "fromStorageString");
      return Promise.resolve(new _State(JSON.parse(storageString)));
    }
    static async clearStaleState(storage, age) {
      const logger2 = Logger.createStatic("State", "clearStaleState");
      const cutoff = Timer.getEpochTime() - age;
      const keys = await storage.getAllKeys();
      logger2.debug("got keys", keys);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = await storage.get(key);
        let remove = false;
        if (item) {
          try {
            const state = await _State.fromStorageString(item);
            logger2.debug("got item from key:", key, state.created);
            if (state.created <= cutoff) {
              remove = true;
            }
          } catch (err) {
            logger2.error("Error parsing state for key:", key, err);
            remove = true;
          }
        } else {
          logger2.debug("no item in storage for key:", key);
          remove = true;
        }
        if (remove) {
          logger2.debug("removed item for key:", key);
          void storage.remove(key);
        }
      }
    }
  };
  var SigninState = class _SigninState extends State {
    constructor(args) {
      super(args);
      this.code_verifier = args.code_verifier;
      this.code_challenge = args.code_challenge;
      this.authority = args.authority;
      this.client_id = args.client_id;
      this.redirect_uri = args.redirect_uri;
      this.scope = args.scope;
      this.client_secret = args.client_secret;
      this.extraTokenParams = args.extraTokenParams;
      this.response_mode = args.response_mode;
      this.skipUserInfo = args.skipUserInfo;
      this.nonce = args.nonce;
    }
    static async create(args) {
      const code_verifier = args.code_verifier === true ? CryptoUtils.generateCodeVerifier() : args.code_verifier || void 0;
      const code_challenge = code_verifier ? await CryptoUtils.generateCodeChallenge(code_verifier) : void 0;
      return new _SigninState({
        ...args,
        code_verifier,
        code_challenge
      });
    }
    toStorageString() {
      new Logger("SigninState").create("toStorageString");
      return JSON.stringify({
        id: this.id,
        data: this.data,
        created: this.created,
        request_type: this.request_type,
        url_state: this.url_state,
        code_verifier: this.code_verifier,
        authority: this.authority,
        client_id: this.client_id,
        redirect_uri: this.redirect_uri,
        scope: this.scope,
        client_secret: this.client_secret,
        extraTokenParams: this.extraTokenParams,
        response_mode: this.response_mode,
        skipUserInfo: this.skipUserInfo,
        nonce: this.nonce
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("SigninState", "fromStorageString");
      const data = JSON.parse(storageString);
      return _SigninState.create(data);
    }
  };
  var _SigninRequest = class _SigninRequest2 {
    constructor(args) {
      this.url = args.url;
      this.state = args.state;
    }
    static async create({
      // mandatory
      url,
      authority,
      client_id,
      redirect_uri,
      response_type,
      scope,
      // optional
      state_data,
      response_mode,
      request_type,
      client_secret,
      nonce,
      url_state,
      resource,
      skipUserInfo,
      extraQueryParams,
      extraTokenParams,
      disablePKCE,
      dpopJkt,
      omitScopeWhenRequesting,
      ...optionalParams
    }) {
      if (!url) {
        this._logger.error("create: No url passed");
        throw new Error("url");
      }
      if (!client_id) {
        this._logger.error("create: No client_id passed");
        throw new Error("client_id");
      }
      if (!redirect_uri) {
        this._logger.error("create: No redirect_uri passed");
        throw new Error("redirect_uri");
      }
      if (!response_type) {
        this._logger.error("create: No response_type passed");
        throw new Error("response_type");
      }
      if (!scope) {
        this._logger.error("create: No scope passed");
        throw new Error("scope");
      }
      if (!authority) {
        this._logger.error("create: No authority passed");
        throw new Error("authority");
      }
      const state = await SigninState.create({
        data: state_data,
        request_type,
        url_state,
        code_verifier: !disablePKCE,
        client_id,
        authority,
        redirect_uri,
        response_mode,
        client_secret,
        scope,
        extraTokenParams,
        skipUserInfo,
        nonce
      });
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.append("client_id", client_id);
      parsedUrl.searchParams.append("redirect_uri", redirect_uri);
      parsedUrl.searchParams.append("response_type", response_type);
      if (!omitScopeWhenRequesting) {
        parsedUrl.searchParams.append("scope", scope);
      }
      if (nonce) {
        parsedUrl.searchParams.append("nonce", nonce);
      }
      if (dpopJkt) {
        parsedUrl.searchParams.append("dpop_jkt", dpopJkt);
      }
      let stateParam = state.id;
      if (url_state) {
        stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
      }
      parsedUrl.searchParams.append("state", stateParam);
      if (state.code_challenge) {
        parsedUrl.searchParams.append("code_challenge", state.code_challenge);
        parsedUrl.searchParams.append("code_challenge_method", "S256");
      }
      if (resource) {
        const resources = Array.isArray(resource) ? resource : [resource];
        resources.forEach((r) => parsedUrl.searchParams.append("resource", r));
      }
      for (const [key, value] of Object.entries({ response_mode, ...optionalParams, ...extraQueryParams })) {
        if (value != null) {
          parsedUrl.searchParams.append(key, value.toString());
        }
      }
      return new _SigninRequest2({
        url: parsedUrl.href,
        state
      });
    }
  };
  _SigninRequest._logger = new Logger("SigninRequest");
  var SigninRequest = _SigninRequest;
  var OidcScope = "openid";
  var SigninResponse = class {
    constructor(params) {
      this.access_token = "";
      this.token_type = "";
      this.profile = {};
      this.state = params.get("state");
      this.session_state = params.get("session_state");
      if (this.state) {
        const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
        this.state = splitState[0];
        if (splitState.length > 1) {
          this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
        }
      }
      this.error = params.get("error");
      this.error_description = params.get("error_description");
      this.error_uri = params.get("error_uri");
      this.code = params.get("code");
    }
    get expires_in() {
      if (this.expires_at === void 0) {
        return void 0;
      }
      return this.expires_at - Timer.getEpochTime();
    }
    set expires_in(value) {
      if (typeof value === "string") value = Number(value);
      if (value !== void 0 && value >= 0) {
        this.expires_at = Math.floor(value) + Timer.getEpochTime();
      }
    }
    get isOpenId() {
      var _a;
      return ((_a = this.scope) == null ? void 0 : _a.split(" ").includes(OidcScope)) || !!this.id_token;
    }
  };
  var SignoutRequest = class {
    constructor({
      url,
      state_data,
      id_token_hint,
      post_logout_redirect_uri,
      extraQueryParams,
      request_type,
      client_id,
      url_state
    }) {
      this._logger = new Logger("SignoutRequest");
      if (!url) {
        this._logger.error("ctor: No url passed");
        throw new Error("url");
      }
      const parsedUrl = new URL(url);
      if (id_token_hint) {
        parsedUrl.searchParams.append("id_token_hint", id_token_hint);
      }
      if (client_id) {
        parsedUrl.searchParams.append("client_id", client_id);
      }
      if (post_logout_redirect_uri) {
        parsedUrl.searchParams.append("post_logout_redirect_uri", post_logout_redirect_uri);
        if (state_data || url_state) {
          this.state = new State({ data: state_data, request_type, url_state });
          let stateParam = this.state.id;
          if (url_state) {
            stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
          }
          parsedUrl.searchParams.append("state", stateParam);
        }
      }
      for (const [key, value] of Object.entries({ ...extraQueryParams })) {
        if (value != null) {
          parsedUrl.searchParams.append(key, value.toString());
        }
      }
      this.url = parsedUrl.href;
    }
  };
  var SignoutResponse = class {
    constructor(params) {
      this.state = params.get("state");
      if (this.state) {
        const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
        this.state = splitState[0];
        if (splitState.length > 1) {
          this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
        }
      }
      this.error = params.get("error");
      this.error_description = params.get("error_description");
      this.error_uri = params.get("error_uri");
    }
  };
  var DefaultProtocolClaims = [
    "nbf",
    "jti",
    "auth_time",
    "nonce",
    "acr",
    "amr",
    "azp",
    "at_hash"
    // https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
  ];
  var InternalRequiredProtocolClaims = ["sub", "iss", "aud", "exp", "iat"];
  var ClaimsService = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("ClaimsService");
    }
    filterProtocolClaims(claims) {
      const result = { ...claims };
      if (this._settings.filterProtocolClaims) {
        let protocolClaims;
        if (Array.isArray(this._settings.filterProtocolClaims)) {
          protocolClaims = this._settings.filterProtocolClaims;
        } else {
          protocolClaims = DefaultProtocolClaims;
        }
        for (const claim of protocolClaims) {
          if (!InternalRequiredProtocolClaims.includes(claim)) {
            delete result[claim];
          }
        }
      }
      return result;
    }
    mergeClaims(claims1, claims2) {
      const result = { ...claims1 };
      for (const [claim, values] of Object.entries(claims2)) {
        if (result[claim] !== values) {
          if (Array.isArray(result[claim]) || Array.isArray(values)) {
            if (this._settings.mergeClaimsStrategy.array == "replace") {
              result[claim] = values;
            } else {
              const mergedValues = Array.isArray(result[claim]) ? result[claim] : [result[claim]];
              for (const value of Array.isArray(values) ? values : [values]) {
                if (!mergedValues.includes(value)) {
                  mergedValues.push(value);
                }
              }
              result[claim] = mergedValues;
            }
          } else if (typeof result[claim] === "object" && typeof values === "object") {
            result[claim] = this.mergeClaims(result[claim], values);
          } else {
            result[claim] = values;
          }
        }
      }
      return result;
    }
  };
  var DPoPState = class {
    constructor(keys, nonce) {
      this.keys = keys;
      this.nonce = nonce;
    }
  };
  var OidcClient = class {
    constructor(settings, metadataService) {
      this._logger = new Logger("OidcClient");
      this.settings = settings instanceof OidcClientSettingsStore ? settings : new OidcClientSettingsStore(settings);
      this.metadataService = metadataService != null ? metadataService : new MetadataService(this.settings);
      this._claimsService = new ClaimsService(this.settings);
      this._validator = new ResponseValidator(this.settings, this.metadataService, this._claimsService);
      this._tokenClient = new TokenClient(this.settings, this.metadataService);
    }
    async createSigninRequest({
      state,
      request,
      request_uri,
      request_type,
      id_token_hint,
      login_hint,
      skipUserInfo,
      nonce,
      url_state,
      response_type = this.settings.response_type,
      scope = this.settings.scope,
      redirect_uri = this.settings.redirect_uri,
      prompt = this.settings.prompt,
      display = this.settings.display,
      max_age = this.settings.max_age,
      ui_locales = this.settings.ui_locales,
      acr_values = this.settings.acr_values,
      resource = this.settings.resource,
      response_mode = this.settings.response_mode,
      extraQueryParams = this.settings.extraQueryParams,
      extraTokenParams = this.settings.extraTokenParams,
      dpopJkt,
      omitScopeWhenRequesting = this.settings.omitScopeWhenRequesting
    }) {
      const logger2 = this._logger.create("createSigninRequest");
      if (response_type !== "code") {
        throw new Error("Only the Authorization Code flow (with PKCE) is supported");
      }
      const url = await this.metadataService.getAuthorizationEndpoint();
      logger2.debug("Received authorization endpoint", url);
      const signinRequest = await SigninRequest.create({
        url,
        authority: this.settings.authority,
        client_id: this.settings.client_id,
        redirect_uri,
        response_type,
        scope,
        state_data: state,
        url_state,
        prompt,
        display,
        max_age,
        ui_locales,
        id_token_hint,
        login_hint,
        acr_values,
        dpopJkt,
        resource,
        request,
        request_uri,
        extraQueryParams,
        extraTokenParams,
        request_type,
        response_mode,
        client_secret: this.settings.client_secret,
        skipUserInfo,
        nonce,
        disablePKCE: this.settings.disablePKCE,
        omitScopeWhenRequesting
      });
      await this.clearStaleState();
      const signinState = signinRequest.state;
      await this.settings.stateStore.set(signinState.id, signinState.toStorageString());
      return signinRequest;
    }
    async readSigninResponseState(url, removeState = false) {
      const logger2 = this._logger.create("readSigninResponseState");
      const response = new SigninResponse(UrlUtils.readParams(url, this.settings.response_mode));
      if (!response.state) {
        logger2.throw(new Error("No state in response"));
        throw null;
      }
      const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
      if (!storedStateString) {
        logger2.throw(new Error("No matching state found in storage"));
        throw null;
      }
      const state = await SigninState.fromStorageString(storedStateString);
      return { state, response };
    }
    async processSigninResponse(url, extraHeaders, removeState = true) {
      const logger2 = this._logger.create("processSigninResponse");
      const { state, response } = await this.readSigninResponseState(url, removeState);
      logger2.debug("received state from storage; validating response");
      if (this.settings.dpop && this.settings.dpop.store) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store);
        extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
      }
      try {
        await this._validator.validateSigninResponse(response, state, extraHeaders);
      } catch (err) {
        if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
          const dpopProof = await this.getDpopProof(this.settings.dpop.store, err.nonce);
          extraHeaders["DPoP"] = dpopProof;
          await this._validator.validateSigninResponse(response, state, extraHeaders);
        } else {
          throw err;
        }
      }
      return response;
    }
    async getDpopProof(dpopStore, nonce) {
      let keyPair;
      let dpopState;
      if (!(await dpopStore.getAllKeys()).includes(this.settings.client_id)) {
        keyPair = await CryptoUtils.generateDPoPKeys();
        dpopState = new DPoPState(keyPair, nonce);
        await dpopStore.set(this.settings.client_id, dpopState);
      } else {
        dpopState = await dpopStore.get(this.settings.client_id);
        if (dpopState.nonce !== nonce && nonce) {
          dpopState.nonce = nonce;
          await dpopStore.set(this.settings.client_id, dpopState);
        }
      }
      return await CryptoUtils.generateDPoPProof({
        url: await this.metadataService.getTokenEndpoint(false),
        httpMethod: "POST",
        keyPair: dpopState.keys,
        nonce: dpopState.nonce
      });
    }
    async processResourceOwnerPasswordCredentials({
      username,
      password,
      skipUserInfo = false,
      extraTokenParams = {}
    }) {
      const tokenResponse = await this._tokenClient.exchangeCredentials({ username, password, ...extraTokenParams });
      const signinResponse = new SigninResponse(new URLSearchParams());
      Object.assign(signinResponse, tokenResponse);
      await this._validator.validateCredentialsResponse(signinResponse, skipUserInfo);
      return signinResponse;
    }
    async useRefreshToken({
      state,
      redirect_uri,
      resource,
      timeoutInSeconds,
      extraHeaders,
      extraTokenParams
    }) {
      var _a;
      const logger2 = this._logger.create("useRefreshToken");
      let scope;
      if (this.settings.refreshTokenAllowedScope === void 0) {
        scope = state.scope;
      } else {
        const allowableScopes = this.settings.refreshTokenAllowedScope.split(" ");
        const providedScopes = ((_a = state.scope) == null ? void 0 : _a.split(" ")) || [];
        scope = providedScopes.filter((s) => allowableScopes.includes(s)).join(" ");
      }
      if (this.settings.dpop && this.settings.dpop.store) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store);
        extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
      }
      let result;
      try {
        result = await this._tokenClient.exchangeRefreshToken({
          refresh_token: state.refresh_token,
          // provide the (possible filtered) scope list
          scope,
          redirect_uri,
          resource,
          timeoutInSeconds,
          extraHeaders,
          ...extraTokenParams
        });
      } catch (err) {
        if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
          extraHeaders["DPoP"] = await this.getDpopProof(this.settings.dpop.store, err.nonce);
          result = await this._tokenClient.exchangeRefreshToken({
            refresh_token: state.refresh_token,
            // provide the (possible filtered) scope list
            scope,
            redirect_uri,
            resource,
            timeoutInSeconds,
            extraHeaders,
            ...extraTokenParams
          });
        } else {
          throw err;
        }
      }
      const response = new SigninResponse(new URLSearchParams());
      Object.assign(response, result);
      logger2.debug("validating response", response);
      await this._validator.validateRefreshResponse(response, {
        ...state,
        // override the scope in the state handed over to the validator
        // so it can set the granted scope to the requested scope in case none is included in the response
        scope
      });
      return response;
    }
    async createSignoutRequest({
      state,
      id_token_hint,
      client_id,
      request_type,
      url_state,
      post_logout_redirect_uri = this.settings.post_logout_redirect_uri,
      extraQueryParams = this.settings.extraQueryParams
    } = {}) {
      const logger2 = this._logger.create("createSignoutRequest");
      const url = await this.metadataService.getEndSessionEndpoint();
      if (!url) {
        logger2.throw(new Error("No end session endpoint"));
        throw null;
      }
      logger2.debug("Received end session endpoint", url);
      if (!client_id && post_logout_redirect_uri && !id_token_hint) {
        client_id = this.settings.client_id;
      }
      const request = new SignoutRequest({
        url,
        id_token_hint,
        client_id,
        post_logout_redirect_uri,
        state_data: state,
        extraQueryParams,
        request_type,
        url_state
      });
      await this.clearStaleState();
      const signoutState = request.state;
      if (signoutState) {
        logger2.debug("Signout request has state to persist");
        await this.settings.stateStore.set(signoutState.id, signoutState.toStorageString());
      }
      return request;
    }
    async readSignoutResponseState(url, removeState = false) {
      const logger2 = this._logger.create("readSignoutResponseState");
      const response = new SignoutResponse(UrlUtils.readParams(url, this.settings.response_mode));
      if (!response.state) {
        logger2.debug("No state in response");
        if (response.error) {
          logger2.warn("Response was error:", response.error);
          throw new ErrorResponse(response);
        }
        return { state: void 0, response };
      }
      const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
      if (!storedStateString) {
        logger2.throw(new Error("No matching state found in storage"));
        throw null;
      }
      const state = await State.fromStorageString(storedStateString);
      return { state, response };
    }
    async processSignoutResponse(url) {
      const logger2 = this._logger.create("processSignoutResponse");
      const { state, response } = await this.readSignoutResponseState(url, true);
      if (state) {
        logger2.debug("Received state from storage; validating response");
        this._validator.validateSignoutResponse(response, state);
      } else {
        logger2.debug("No state from storage; skipping response validation");
      }
      return response;
    }
    clearStaleState() {
      this._logger.create("clearStaleState");
      return State.clearStaleState(this.settings.stateStore, this.settings.staleStateAgeInSeconds);
    }
    async revokeToken(token, type) {
      this._logger.create("revokeToken");
      return await this._tokenClient.revoke({
        token,
        token_type_hint: type
      });
    }
  };

  // node_modules/@inrupt/oidc-client-ext/dist/index.es.js
  function processErrorResponse(responseBody, options) {
    if (responseBody.error === "invalid_redirect_uri") {
      throw new Error(`Dynamic client registration failed: the provided redirect uri [${options.redirectUrl?.toString()}] is invalid - ${responseBody.error_description ?? ""}`);
    }
    if (responseBody.error === "invalid_client_metadata") {
      throw new Error(`Dynamic client registration failed: the provided client metadata ${JSON.stringify(options)} is invalid - ${responseBody.error_description ?? ""}`);
    }
    throw new Error(`Dynamic client registration failed: ${responseBody.error} - ${responseBody.error_description ?? ""}`);
  }
  function hasClientId(body) {
    return typeof body.client_id === "string";
  }
  function hasRedirectUri(body) {
    return Array.isArray(body.redirect_uris) && body.redirect_uris.every((uri) => typeof uri === "string");
  }
  function validateRegistrationResponse(responseBody, options) {
    if (!hasClientId(responseBody)) {
      throw new Error(`Dynamic client registration failed: no client_id has been found on ${JSON.stringify(responseBody)}`);
    }
    if (options.redirectUrl && hasRedirectUri(responseBody) && responseBody.redirect_uris[0] !== options.redirectUrl.toString()) {
      throw new Error(`Dynamic client registration failed: the returned redirect URIs ${JSON.stringify(responseBody.redirect_uris)} don't match the provided ${JSON.stringify([
        options.redirectUrl.toString()
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
      client_name: options.clientName,
      application_type: "web",
      redirect_uris: [options.redirectUrl?.toString()],
      subject_type: "public",
      token_endpoint_auth_method: "client_secret_basic",
      id_token_signed_response_alg: signingAlg,
      grant_types: ["authorization_code", "refresh_token"]
    };
    const headers = {
      "Content-Type": "application/json"
    };
    const registerResponse = await fetch(issuerConfig.registrationEndpoint.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(config)
    });
    if (registerResponse.ok) {
      const responseBody = await registerResponse.json();
      validateRegistrationResponse(responseBody, options);
      return {
        clientId: responseBody.client_id,
        clientSecret: responseBody.client_secret,
        expiresAt: responseBody.client_secret_expires_at,
        idTokenSignedResponseAlg: responseBody.id_token_signed_response_alg,
        clientType: "dynamic"
      };
    }
    if (registerResponse.status === 400) {
      processErrorResponse(await registerResponse.json(), options);
    }
    throw new Error(`Dynamic client registration failed: the server returned ${registerResponse.status} ${registerResponse.statusText} - ${await registerResponse.text()}`);
  }
  function hasError(value) {
    return value.error !== void 0 && typeof value.error === "string";
  }
  function hasErrorDescription(value) {
    return value.error_description !== void 0 && typeof value.error_description === "string";
  }
  function hasErrorUri(value) {
    return value.error_uri !== void 0 && typeof value.error_uri === "string";
  }
  function hasAccessToken(value) {
    return value.access_token !== void 0 && typeof value.access_token === "string";
  }
  function hasIdToken(value) {
    return value.id_token !== void 0 && typeof value.id_token === "string";
  }
  function hasRefreshToken(value) {
    return value.refresh_token !== void 0 && typeof value.refresh_token === "string";
  }
  function hasTokenType(value) {
    return value.token_type !== void 0 && typeof value.token_type === "string";
  }
  function hasExpiresIn(value) {
    return value.expires_in === void 0 || typeof value.expires_in === "number";
  }
  function validatePreconditions(issuer, data) {
    if (data.grantType && (!issuer.grantTypesSupported || !issuer.grantTypesSupported.includes(data.grantType))) {
      throw new Error(`The issuer [${issuer.issuer}] does not support the [${data.grantType}] grant`);
    }
    if (!issuer.tokenEndpoint) {
      throw new Error(`This issuer [${issuer.issuer}] does not have a token endpoint`);
    }
  }
  function validateTokenEndpointResponse(tokenResponse, dpop) {
    if (hasError(tokenResponse)) {
      throw new OidcProviderError(`Token endpoint returned error [${tokenResponse.error}]${hasErrorDescription(tokenResponse) ? `: ${tokenResponse.error_description}` : ""}${hasErrorUri(tokenResponse) ? ` (see ${tokenResponse.error_uri})` : ""}`, tokenResponse.error, hasErrorDescription(tokenResponse) ? tokenResponse.error_description : void 0);
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
    if (!dpop && tokenResponse.token_type.toLowerCase() !== "bearer") {
      throw new Error(`Invalid token endpoint response: requested a [Bearer] token, but got a 'token_type' value of [${tokenResponse.token_type}].`);
    }
    return tokenResponse;
  }
  async function getTokens(issuer, client, data, dpop) {
    validatePreconditions(issuer, data);
    const headers = {
      "content-type": "application/x-www-form-urlencoded"
    };
    let dpopKey;
    if (dpop) {
      dpopKey = await generateDpopKeyPair();
      headers.DPoP = await createDpopHeader(issuer.tokenEndpoint, "POST", dpopKey);
    }
    if (client.clientSecret) {
      headers.Authorization = `Basic ${btoa(`${client.clientId}:${client.clientSecret}`)}`;
    }
    const requestBody = {
      grant_type: data.grantType,
      redirect_uri: data.redirectUrl,
      code: data.code,
      code_verifier: data.codeVerifier,
      client_id: client.clientId
    };
    const tokenRequestInit = {
      method: "POST",
      headers,
      body: new URLSearchParams(requestBody).toString()
    };
    const rawTokenResponse = await fetch(issuer.tokenEndpoint, tokenRequestInit);
    const jsonTokenResponse = await rawTokenResponse.json();
    const tokenResponse = validateTokenEndpointResponse(jsonTokenResponse, dpop);
    const { webId, clientId } = await getWebidFromTokenPayload(tokenResponse.id_token, issuer.jwksUri, issuer.issuer, client.clientId);
    return {
      accessToken: tokenResponse.access_token,
      idToken: tokenResponse.id_token,
      refreshToken: hasRefreshToken(tokenResponse) ? tokenResponse.refresh_token : void 0,
      webId,
      clientId,
      dpopKey,
      expiresIn: tokenResponse.expires_in
    };
  }
  var isValidUrl2 = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  async function refresh(refreshToken, issuer, client, dpopKey) {
    if (client.clientId === void 0) {
      throw new Error("No client ID available when trying to refresh the access token.");
    }
    const requestBody = {
      grant_type: "refresh_token",
      refresh_token: refreshToken
    };
    let dpopHeader = {};
    if (dpopKey !== void 0) {
      dpopHeader = {
        DPoP: await createDpopHeader(issuer.tokenEndpoint, "POST", dpopKey)
      };
    }
    let authHeader = {};
    if (client.clientSecret !== void 0) {
      authHeader = {
        // We assume that client_secret_basic is the client authentication method.
        // TODO: Get the authentication method from the IClient configuration object.
        Authorization: `Basic ${btoa(`${client.clientId}:${client.clientSecret}`)}`
      };
    } else if (isValidUrl2(client.clientId)) {
      requestBody.client_id = client.clientId;
    }
    const rawResponse = await fetch(issuer.tokenEndpoint, {
      method: "POST",
      body: new URLSearchParams(requestBody).toString(),
      headers: {
        ...dpopHeader,
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    let response;
    try {
      response = await rawResponse.json();
    } catch (_e) {
      throw new Error(`The token endpoint of issuer ${issuer.issuer} returned a malformed response.`);
    }
    const validatedResponse = validateTokenEndpointResponse(response, dpopKey !== void 0);
    const { webId } = await getWebidFromTokenPayload(validatedResponse.id_token, issuer.jwksUri, issuer.issuer, client.clientId);
    return {
      accessToken: validatedResponse.access_token,
      idToken: validatedResponse.id_token,
      refreshToken: typeof validatedResponse.refresh_token === "string" ? validatedResponse.refresh_token : void 0,
      webId,
      dpopKey,
      expiresIn: validatedResponse.expires_in
    };
  }
  function normalizeCallbackUrl(redirectUrl) {
    const cleanedUrl = removeOpenIdParams(redirectUrl);
    cleanedUrl.hash = "";
    if (
      // The trailing slash is present in the original redirect URL
      redirectUrl.includes(`${cleanedUrl.origin}/`)
    ) {
      return cleanedUrl.href;
    }
    return `${cleanedUrl.origin}${cleanedUrl.href.substring(
      // Adds 1 to the origin length to remove the trailing slash
      cleanedUrl.origin.length + 1
    )}`;
  }
  async function clearOidcPersistentStorage() {
    const store = new WebStorageStateStore({});
    await State.clearStaleState(store, 60 * 15);
    const myStorage = window.localStorage;
    const itemsToRemove = [];
    for (let i = 0; i <= myStorage.length; i += 1) {
      const key = myStorage.key(i);
      if (key && (key.match(/^oidc\..+$/) || key.match(/^solidClientAuthenticationUser:.+$/))) {
        itemsToRemove.push(key);
      }
    }
    itemsToRemove.forEach((key) => myStorage.removeItem(key));
  }

  // node_modules/@inrupt/solid-client-authn-browser/dist/index.mjs
  var StorageUtilityBrowser = class extends StorageUtility {
    constructor(secureStorage, insecureStorage) {
      super(secureStorage, insecureStorage);
    }
  };
  function isClientExpired(sessionInfo) {
    if (sessionInfo.clientExpiresAt === void 0 || sessionInfo.clientExpiresAt === 0) {
      return false;
    }
    return sessionInfo.clientExpiresAt < Math.floor(Date.now() / 1e3);
  }
  var ClientAuthentication2 = class extends ClientAuthentication {
    // Define these functions as properties so that they don't get accidentally re-bound.
    // Isn't Javascript fun?
    login = async (options, eventEmitter) => {
      if (options.prompt !== "none") {
        await this.sessionInfoManager.clear(options.sessionId);
      }
      const redirectUrl = options.redirectUrl ?? normalizeCallbackUrl(window.location.href);
      if (!isValidRedirectUrl(redirectUrl)) {
        throw new Error(`${redirectUrl} is not a valid redirect URL, it is either a malformed IRI, includes a hash fragment, or reserved query parameters ('code' or 'state').`);
      }
      await this.loginHandler.handle({
        ...options,
        redirectUrl,
        // If no clientName is provided, the clientId may be used instead.
        clientName: options.clientName ?? options.clientId,
        eventEmitter
      });
    };
    // Collects session information from storage, and returns them. Returns null
    // if the expected information cannot be found or if the client has expired.
    // Note that the ID token is not stored, which means the session information
    // cannot be validated at this point.
    validateCurrentSession = async (currentSessionId) => {
      const sessionInfo = await this.sessionInfoManager.get(currentSessionId);
      if (sessionInfo === void 0 || sessionInfo.clientAppId === void 0 || sessionInfo.issuer === void 0 || isClientExpired(sessionInfo)) {
        return null;
      }
      return sessionInfo;
    };
    handleIncomingRedirect = async (url, eventEmitter) => {
      try {
        const redirectInfo = await this.redirectHandler.handle(url, eventEmitter, void 0);
        this.fetch = redirectInfo.fetch.bind(window);
        this.boundLogout = redirectInfo.getLogoutUrl;
        await this.cleanUrlAfterRedirect(url);
        return {
          isLoggedIn: redirectInfo.isLoggedIn,
          webId: redirectInfo.webId,
          sessionId: redirectInfo.sessionId,
          expirationDate: redirectInfo.expirationDate,
          clientAppId: redirectInfo.clientAppId
        };
      } catch (err) {
        await this.cleanUrlAfterRedirect(url);
        eventEmitter.emit(EVENTS.ERROR, "redirect", err);
        return void 0;
      }
    };
    async cleanUrlAfterRedirect(url) {
      const cleanedUpUrl = removeOpenIdParams(url).href;
      window.history.replaceState(null, "", cleanedUpUrl);
      while (window.location.href !== cleanedUpUrl) {
        await new Promise((resolve) => {
          setTimeout(() => resolve(), 1);
        });
      }
    }
  };
  function hasIssuer(options) {
    return typeof options.oidcIssuer === "string";
  }
  function hasRedirectUrl(options) {
    return typeof options.redirectUrl === "string";
  }
  var OidcLoginHandler = class {
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
      const issuerConfig = await this.issuerConfigFetcher.fetchConfig(options.oidcIssuer);
      const clientRegistration = await handleRegistration(options, issuerConfig, this.storageUtility, this.clientRegistrar);
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
        scopes: normalizeScopes(options.customScopes)
      };
      return this.oidcHandler.handle(OidcOptions);
    }
  };
  var AuthorizationCodeWithPkceOidcHandler = class extends AuthorizationCodeWithPkceOidcHandlerBase {
    async handle(oidcLoginOptions) {
      const redirectUri = oidcLoginOptions.redirectUrl ?? "";
      const oidcOptions = {
        authority: oidcLoginOptions.issuer.toString(),
        client_id: oidcLoginOptions.client.clientId,
        client_secret: oidcLoginOptions.client.clientSecret,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: oidcLoginOptions.scopes.join(" "),
        filterProtocolClaims: true,
        // The userinfo endpoint on NSS fails, so disable this for now
        // Note that in Solid, information should be retrieved from the
        // profile referenced by the WebId.
        loadUserInfo: false,
        prompt: oidcLoginOptions.prompt ?? "consent"
      };
      const oidcClientLibrary = new OidcClient(oidcOptions);
      try {
        const signingRequest = await oidcClientLibrary.createSigninRequest({});
        return await this.setupRedirectHandler({
          oidcLoginOptions,
          state: signingRequest.state.id,
          codeVerifier: signingRequest.state.code_verifier ?? "",
          targetUrl: signingRequest.url.toString()
        });
      } catch (err) {
        console.error(err);
      }
      return void 0;
    }
  };
  var WELL_KNOWN_OPENID_CONFIG = ".well-known/openid-configuration";
  var issuerConfigKeyMap = {
    issuer: {
      toKey: "issuer",
      convertToUrl: true
    },
    authorization_endpoint: {
      toKey: "authorizationEndpoint",
      convertToUrl: true
    },
    token_endpoint: {
      toKey: "tokenEndpoint",
      convertToUrl: true
    },
    userinfo_endpoint: {
      toKey: "userinfoEndpoint",
      convertToUrl: true
    },
    jwks_uri: {
      toKey: "jwksUri",
      convertToUrl: true
    },
    registration_endpoint: {
      toKey: "registrationEndpoint",
      convertToUrl: true
    },
    end_session_endpoint: {
      toKey: "endSessionEndpoint",
      convertToUrl: true
    },
    scopes_supported: { toKey: "scopesSupported" },
    response_types_supported: { toKey: "responseTypesSupported" },
    response_modes_supported: { toKey: "responseModesSupported" },
    grant_types_supported: { toKey: "grantTypesSupported" },
    acr_values_supported: { toKey: "acrValuesSupported" },
    subject_types_supported: { toKey: "subjectTypesSupported" },
    id_token_signing_alg_values_supported: {
      toKey: "idTokenSigningAlgValuesSupported"
    },
    id_token_encryption_alg_values_supported: {
      toKey: "idTokenEncryptionAlgValuesSupported"
    },
    id_token_encryption_enc_values_supported: {
      toKey: "idTokenEncryptionEncValuesSupported"
    },
    userinfo_signing_alg_values_supported: {
      toKey: "userinfoSigningAlgValuesSupported"
    },
    userinfo_encryption_alg_values_supported: {
      toKey: "userinfoEncryptionAlgValuesSupported"
    },
    userinfo_encryption_enc_values_supported: {
      toKey: "userinfoEncryptionEncValuesSupported"
    },
    request_object_signing_alg_values_supported: {
      toKey: "requestObjectSigningAlgValuesSupported"
    },
    request_object_encryption_alg_values_supported: {
      toKey: "requestObjectEncryptionAlgValuesSupported"
    },
    request_object_encryption_enc_values_supported: {
      toKey: "requestObjectEncryptionEncValuesSupported"
    },
    token_endpoint_auth_methods_supported: {
      toKey: "tokenEndpointAuthMethodsSupported"
    },
    token_endpoint_auth_signing_alg_values_supported: {
      toKey: "tokenEndpointAuthSigningAlgValuesSupported"
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
      convertToUrl: true
    },
    op_tos_uri: {
      toKey: "opTosUri",
      convertToUrl: true
    }
  };
  function processConfig(config) {
    const parsedConfig = {};
    Object.keys(config).forEach((key) => {
      if (issuerConfigKeyMap[key]) {
        parsedConfig[issuerConfigKeyMap[key].toKey] = config[key];
      }
    });
    if (!Array.isArray(parsedConfig.scopesSupported)) {
      parsedConfig.scopesSupported = ["openid"];
    }
    return parsedConfig;
  }
  var IssuerConfigFetcher = class _IssuerConfigFetcher {
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
      const openIdConfigUrl = new URL(
        WELL_KNOWN_OPENID_CONFIG,
        // Make sure to append a slash at issuer URL, so that the .well-known URL
        // includes the full issuer path. See https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig.
        issuer.endsWith("/") ? issuer : `${issuer}/`
      ).href;
      const issuerConfigRequestBody = await fetch(openIdConfigUrl);
      try {
        issuerConfig = processConfig(await issuerConfigRequestBody.json());
      } catch (err) {
        throw new ConfigurationError(`[${issuer.toString()}] has an invalid configuration: ${err.message}`);
      }
      await this.storageUtility.set(_IssuerConfigFetcher.getLocalStorageKey(issuer), JSON.stringify(issuerConfig));
      return issuerConfig;
    }
  };
  async function clear2(sessionId, storage) {
    await clear(sessionId, storage);
    await clearOidcPersistentStorage();
  }
  var SessionInfoManager = class extends SessionInfoManagerBase {
    async get(sessionId) {
      const [isLoggedIn2, webId, clientId, clientSecret, redirectUrl, refreshToken, issuer, tokenType, expiresAt] = await Promise.all([
        this.storageUtility.getForUser(sessionId, "isLoggedIn", {
          secure: true
        }),
        this.storageUtility.getForUser(sessionId, "webId", {
          secure: true
        }),
        this.storageUtility.getForUser(sessionId, "clientId", {
          secure: false
        }),
        this.storageUtility.getForUser(sessionId, "clientSecret", {
          secure: false
        }),
        this.storageUtility.getForUser(sessionId, "redirectUrl", {
          secure: false
        }),
        this.storageUtility.getForUser(sessionId, "refreshToken", {
          secure: true
        }),
        this.storageUtility.getForUser(sessionId, "issuer", {
          secure: false
        }),
        this.storageUtility.getForUser(sessionId, "tokenType", {
          secure: false
        }),
        this.storageUtility.getForUser(sessionId, "expiresAt", {
          secure: false
        })
      ]);
      if (typeof redirectUrl === "string" && !isValidRedirectUrl(redirectUrl)) {
        await Promise.all([
          this.storageUtility.deleteAllUserData(sessionId, { secure: false }),
          this.storageUtility.deleteAllUserData(sessionId, { secure: true })
        ]);
        return void 0;
      }
      if (tokenType !== void 0 && !isSupportedTokenType(tokenType)) {
        throw new Error(`Tokens of type [${tokenType}] are not supported.`);
      }
      if (clientId === void 0 && isLoggedIn2 === void 0 && webId === void 0 && refreshToken === void 0) {
        return void 0;
      }
      return {
        sessionId,
        webId,
        isLoggedIn: isLoggedIn2 === "true",
        redirectUrl,
        refreshToken,
        issuer,
        clientAppId: clientId,
        clientAppSecret: clientSecret,
        // Default the token type to DPoP if unspecified.
        tokenType: tokenType ?? "DPoP",
        clientExpiresAt: expiresAt !== void 0 ? Number.parseInt(expiresAt, 10) : void 0
      };
    }
    /**
     * This function removes all session-related information from storage.
     * @param sessionId the session identifier
     * @param storage the storage where session info is stored
     * @hidden
     */
    async clear(sessionId) {
      return clear2(sessionId, this.storageUtility);
    }
  };
  var FallbackRedirectHandler = class {
    async canHandle(redirectUrl) {
      try {
        new URL(redirectUrl);
        return true;
      } catch (e) {
        throw new Error(`[${redirectUrl}] is not a valid URL, and cannot be used as a redirect URL: ${e}`);
      }
    }
    async handle(_redirectUrl) {
      return getUnauthenticatedSession();
    }
  };
  var AuthCodeRedirectHandler = class {
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
        return myUrl.searchParams.get("code") !== null && myUrl.searchParams.get("state") !== null;
      } catch (e) {
        throw new Error(`[${redirectUrl}] is not a valid URL, and cannot be used as a redirect URL: ${e}`);
      }
    }
    async handle(redirectUrl, eventEmitter) {
      if (!await this.canHandle(redirectUrl)) {
        throw new Error(`AuthCodeRedirectHandler cannot handle [${redirectUrl}]: it is missing one of [code, state].`);
      }
      const url = new URL(redirectUrl);
      const oauthState = url.searchParams.get("state");
      const storedSessionId = await this.storageUtility.getForUser(oauthState, "sessionId", {
        errorIfNull: true
      });
      const { issuerConfig, codeVerifier, redirectUrl: storedRedirectIri, dpop: isDpop } = await loadOidcContextFromStorage(storedSessionId, this.storageUtility, this.issuerConfigFetcher);
      const iss = url.searchParams.get("iss");
      if (typeof iss === "string" && iss !== issuerConfig.issuer) {
        throw new Error(`The value of the iss parameter (${iss}) does not match the issuer identifier of the authorization server (${issuerConfig.issuer}). See [rfc9207](https://www.rfc-editor.org/rfc/rfc9207.html#section-2.3-3.1.1)`);
      }
      if (codeVerifier === void 0) {
        throw new Error(`The code verifier for session ${storedSessionId} is missing from storage.`);
      }
      if (storedRedirectIri === void 0) {
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
        redirectUrl: storedRedirectIri
      }, isDpop);
      window.localStorage.removeItem(`oidc.${oauthState}`);
      let refreshOptions;
      if (tokens.refreshToken !== void 0) {
        refreshOptions = {
          sessionId: storedSessionId,
          refreshToken: tokens.refreshToken,
          tokenRefresher: this.tokerRefresher
        };
      }
      const authFetch = buildAuthenticatedFetch(tokens.accessToken, {
        dpopKey: tokens.dpopKey,
        refreshOptions,
        eventEmitter,
        expiresIn: tokens.expiresIn
      });
      await saveSessionInfoToStorage(this.storageUtility, storedSessionId, tokens.webId, tokens.clientId, "true", void 0, true);
      const sessionInfo = await this.sessionInfoManager.get(storedSessionId);
      if (!sessionInfo) {
        throw new Error(`Could not retrieve session: [${storedSessionId}].`);
      }
      return Object.assign(sessionInfo, {
        fetch: authFetch,
        getLogoutUrl: maybeBuildRpInitiatedLogout({
          idTokenHint: tokens.idToken,
          endSessionEndpoint: issuerConfig.endSessionEndpoint
        }),
        expirationDate: typeof tokens.expiresIn === "number" ? tokenCreatedAt + tokens.expiresIn * 1e3 : void 0
      });
    }
  };
  var AggregateRedirectHandler = class extends AggregateHandler {
    constructor(redirectHandlers) {
      super(redirectHandlers);
    }
  };
  var BrowserStorage = class {
    get storage() {
      return window.localStorage;
    }
    async get(key) {
      return this.storage.getItem(key) || void 0;
    }
    async set(key, value) {
      this.storage.setItem(key, value);
    }
    async delete(key) {
      this.storage.removeItem(key);
    }
  };
  var Redirector = class {
    redirect(redirectUrl, options) {
      if (options && options.handleRedirect) {
        options.handleRedirect(redirectUrl);
      } else if (options && options.redirectByReplacingState) {
        window.history.replaceState({}, "", redirectUrl);
      } else {
        window.location.href = redirectUrl;
      }
    }
  };
  var ClientRegistrar = class {
    storageUtility;
    constructor(storageUtility) {
      this.storageUtility = storageUtility;
      this.storageUtility = storageUtility;
    }
    async getClient(options, issuerConfig) {
      const [storedClientId, storedClientSecret, expiresAt, storedClientName, storedClientType] = await Promise.all([
        this.storageUtility.getForUser(options.sessionId, "clientId", {
          secure: false
        }),
        this.storageUtility.getForUser(options.sessionId, "clientSecret", {
          secure: false
        }),
        this.storageUtility.getForUser(options.sessionId, "expiresAt", {
          secure: false
        }),
        this.storageUtility.getForUser(options.sessionId, "clientName", {
          secure: false
        }),
        this.storageUtility.getForUser(options.sessionId, "clientType", {
          secure: false
        })
      ]);
      const expirationDate = expiresAt !== void 0 ? Number.parseInt(expiresAt, 10) : -1;
      const expired = storedClientSecret !== void 0 && expirationDate !== 0 && Math.floor(Date.now() / 1e3) > expirationDate;
      if (storedClientId && isKnownClientType(storedClientType) && !expired) {
        return storedClientSecret !== void 0 ? {
          clientId: storedClientId,
          clientSecret: storedClientSecret,
          clientName: storedClientName,
          // Note: static clients are not applicable in a browser context.
          clientType: "dynamic",
          expiresAt: expirationDate
        } : {
          clientId: storedClientId,
          clientName: storedClientName,
          // Note: static clients are not applicable in a browser context.
          clientType: storedClientType
          // The type assertion is required even though the type should match the declaration.
        };
      }
      try {
        const registeredClient = await registerClient(options, issuerConfig);
        const infoToSave = {
          clientId: registeredClient.clientId,
          clientType: "dynamic"
        };
        if (registeredClient.clientSecret !== void 0) {
          infoToSave.clientSecret = registeredClient.clientSecret;
          infoToSave.expiresAt = String(registeredClient.expiresAt);
        }
        if (registeredClient.idTokenSignedResponseAlg) {
          infoToSave.idTokenSignedResponseAlg = registeredClient.idTokenSignedResponseAlg;
        }
        await this.storageUtility.setForUser(options.sessionId, infoToSave, {
          // FIXME: figure out how to persist secure storage at reload
          // Otherwise, the client info cannot be retrieved from storage, and
          // the lib tries to re-register the client on each fetch
          secure: false
        });
        return registeredClient;
      } catch (error) {
        throw new Error(`Client registration failed.`, { cause: error });
      }
    }
  };
  var ErrorOidcHandler = class {
    async canHandle(redirectUrl) {
      try {
        return new URL(redirectUrl).searchParams.has("error");
      } catch (e) {
        throw new Error(`[${redirectUrl}] is not a valid URL, and cannot be used as a redirect URL: ${e}`);
      }
    }
    async handle(redirectUrl, eventEmitter) {
      if (eventEmitter !== void 0) {
        const url = new URL(redirectUrl);
        const errorUrl = url.searchParams.get("error");
        const errorDescriptionUrl = url.searchParams.get("error_description");
        eventEmitter.emit(EVENTS.ERROR, errorUrl, errorDescriptionUrl);
      }
      return getUnauthenticatedSession();
    }
  };
  var TokenRefresher = class {
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
      const clientInfo = await this.clientRegistrar.getClient({ sessionId }, oidcContext.issuerConfig);
      if (refreshToken === void 0) {
        throw new Error(`Session [${sessionId}] has no refresh token to allow it to refresh its access token.`);
      }
      if (oidcContext.dpop && dpopKey === void 0) {
        throw new Error(`For session [${sessionId}], the key bound to the DPoP access token must be provided to refresh said access token.`);
      }
      const tokenSet = await refresh(refreshToken, oidcContext.issuerConfig, clientInfo, dpopKey);
      if (tokenSet.refreshToken !== void 0) {
        eventEmitter?.emit(EVENTS.NEW_REFRESH_TOKEN, tokenSet.refreshToken);
      }
      return tokenSet;
    }
  };
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
    const loginHandler = new OidcLoginHandler(storageUtility, new AuthorizationCodeWithPkceOidcHandler(storageUtility, redirector), issuerConfigFetcher, clientRegistrar);
    const redirectHandler = new AggregateRedirectHandler([
      new ErrorOidcHandler(),
      new AuthCodeRedirectHandler(storageUtility, sessionInfoManager, issuerConfigFetcher, clientRegistrar, tokenRefresher),
      // This catch-all class will always be able to handle the
      // redirect IRI, so it must be registered last.
      new FallbackRedirectHandler()
    ]);
    return new ClientAuthentication2(loginHandler, redirectHandler, new IWaterfallLogoutHandler(sessionInfoManager, redirector), sessionInfoManager, issuerConfigFetcher);
  }
  var KEY_CURRENT_SESSION = `${SOLID_CLIENT_AUTHN_KEY_PREFIX}currentSession`;
  var KEY_CURRENT_URL = `${SOLID_CLIENT_AUTHN_KEY_PREFIX}currentUrl`;
  async function silentlyAuthenticate(sessionId, clientAuthn, session) {
    const storedSessionInfo = await clientAuthn.validateCurrentSession(sessionId);
    if (storedSessionInfo !== null) {
      window.localStorage.setItem(KEY_CURRENT_URL, window.location.href);
      await clientAuthn.login({
        sessionId,
        prompt: "none",
        oidcIssuer: storedSessionInfo.issuer,
        redirectUrl: storedSessionInfo.redirectUrl,
        clientId: storedSessionInfo.clientAppId,
        clientSecret: storedSessionInfo.clientAppSecret,
        tokenType: storedSessionInfo.tokenType ?? "DPoP"
      }, session.events);
      return true;
    }
    return false;
  }
  function isLoggedIn(sessionInfo) {
    return !!sessionInfo?.isLoggedIn;
  }
  var Session = class {
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
    constructor(sessionOptions = {}, sessionId = void 0) {
      this.events = new import_events.default();
      if (sessionOptions.clientAuthentication) {
        this.clientAuthentication = sessionOptions.clientAuthentication;
      } else if (sessionOptions.secureStorage && sessionOptions.insecureStorage) {
        this.clientAuthentication = getClientAuthenticationWithDependencies({
          secureStorage: sessionOptions.secureStorage,
          insecureStorage: sessionOptions.insecureStorage
        });
      } else {
        this.clientAuthentication = getClientAuthenticationWithDependencies({});
      }
      if (sessionOptions.sessionInfo) {
        this.info = {
          sessionId: sessionOptions.sessionInfo.sessionId,
          isLoggedIn: false,
          webId: sessionOptions.sessionInfo.webId,
          clientAppId: sessionOptions.sessionInfo.clientAppId
        };
      } else {
        this.info = {
          sessionId: sessionId ?? v4_default(),
          isLoggedIn: false
        };
      }
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
        tokenType: options.tokenType ?? "DPoP"
      }, this.events);
      return new Promise(() => {
      });
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
        return void 0;
      }
      const options = typeof inputOptions === "string" ? { url: inputOptions } : inputOptions;
      const url = options.url ?? window.location.href;
      this.tokenRequestInProgress = true;
      const sessionInfo = await this.clientAuthentication.handleIncomingRedirect(url, this.events);
      if (isLoggedIn(sessionInfo)) {
        this.setSessionInfo(sessionInfo);
        const currentUrl = window.localStorage.getItem(KEY_CURRENT_URL);
        if (currentUrl === null) {
          this.events.emit(EVENTS.LOGIN);
        } else {
          window.localStorage.removeItem(KEY_CURRENT_URL);
          this.events.emit(EVENTS.SESSION_RESTORED, currentUrl);
        }
      } else if (options.restorePreviousSession === true) {
        const storedSessionId = window.localStorage.getItem(KEY_CURRENT_SESSION);
        if (storedSessionId !== null) {
          const attemptedSilentAuthentication = await silentlyAuthenticate(storedSessionId, this.clientAuthentication, this);
          if (attemptedSilentAuthentication) {
            return new Promise(() => {
            });
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
        this.info.expirationDate = Date.now() + expiresIn * 1e3;
      });
    }
  };
  var defaultSession;
  function getDefaultSession() {
    if (typeof defaultSession === "undefined") {
      defaultSession = new Session();
    }
    return defaultSession;
  }
  function fetch$1(...args) {
    const session = getDefaultSession();
    return session.fetch(...args);
  }
  function login(...args) {
    const session = getDefaultSession();
    return session.login(...args);
  }
  function logout(...args) {
    const session = getDefaultSession();
    return session.logout(...args);
  }
  function handleIncomingRedirect(...args) {
    const session = getDefaultSession();
    return session.handleIncomingRedirect(...args);
  }
  function events() {
    return getDefaultSession().events;
  }
  return __toCommonJS(dist_exports);
})();
