if (typeof globalThis.process === "undefined") {
  globalThis.process = {
    env: {}, browser: true, version: "", versions: { node: "" },
    nextTick: (cb, ...a) => Promise.resolve().then(() => cb(...a)),
    cwd: () => "/", platform: "browser",
  };
}
var crypto$1 = crypto;
const isCryptoKey = (key) => key instanceof CryptoKey;

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
var invalidKeyInput = (actual, ...types) => {
    return message('Key must be ', actual, ...types);
};
function withAlg(alg, actual, ...types) {
    return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}

var isKeyLike = (key) => {
    if (isCryptoKey(key)) {
        return true;
    }
    return key?.[Symbol.toStringTag] === 'KeyObject';
};
const types = ['CryptoKey'];

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

var checkKeyLength = (alg, key) => {
    if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== 'number' || modulusLength < 2048) {
            throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
    }
};

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
    return crypto$1.subtle.importKey('jwk', keyData, ...rest);
};

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
    const cryptoKey = await parse({ ...jwk, alg });
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
var normalize = { normalizePublicKey, normalizePrivateKey };

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
            return parse({ ...jwk, alg });
        default:
            throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
    }
}

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
    if (!isKeyLike(key)) {
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
    if (!isKeyLike(key)) {
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
checkKeyType.bind(undefined, false);
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

const keyToJWK = async (key) => {
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: encode(key),
        };
    }
    if (!isCryptoKey(key)) {
        throw new TypeError(invalidKeyInput(key, ...types, 'Uint8Array'));
    }
    if (!key.extractable) {
        throw new TypeError('non-extractable CryptoKey cannot be exported as a JWK');
    }
    const { ext, key_ops, alg, use, ...jwk } = await crypto$1.subtle.exportKey('jwk', key);
    return jwk;
};

async function exportJWK(key) {
    return keyToJWK(key);
}

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

async function getCryptoKey(alg, key, usage) {
    if (usage === 'sign') {
        key = await normalize.normalizePrivateKey(key, alg);
    }
    if (usage === 'verify') {
        key = await normalize.normalizePublicKey(key, alg);
    }
    if (isCryptoKey(key)) {
        checkSigCryptoKey(key, alg, usage);
        return key;
    }
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError(invalidKeyInput(key, ...types));
        }
        return crypto$1.subtle.importKey('raw', key, { hash: `SHA-${alg.slice(-3)}`, name: 'HMAC' }, false, [usage]);
    }
    throw new TypeError(invalidKeyInput(key, ...types, 'Uint8Array', 'JSON Web Key'));
}

const verify = async (alg, key, signature, data) => {
    const cryptoKey = await getCryptoKey(alg, key, 'verify');
    checkKeyLength(alg, cryptoKey);
    const algorithm = subtleDsa(alg, cryptoKey.algorithm);
    try {
        return await crypto$1.subtle.verify(algorithm, cryptoKey, signature, data);
    }
    catch {
        return false;
    }
};

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
    if (!isDisjoint(parsedProt, jws.header)) {
        throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header,
    };
    const extensions = validateCrit(JWSInvalid, new Map([['b64', true]]), options?.crit, parsedProt, joseHeader);
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
    const algorithms = options && validateAlgorithms('algorithms', options.algorithms);
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
    const verified = await verify(alg, key, signature, data);
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

var epoch = (date) => Math.floor(date.getTime() / 1000);

const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs = (str) => {
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
};

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
var jwtPayload = (protectedHeader, encodedPayload, options = {}) => {
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
};

async function jwtVerify(jwt, key, options) {
    const verified = await compactVerify(jwt, key, options);
    if (verified.protectedHeader.crit?.includes('b64') && verified.protectedHeader.b64 === false) {
        throw new JWTInvalid('JWTs MUST NOT use unencoded payload');
    }
    const payload = jwtPayload(verified.protectedHeader, verified.payload, options);
    const result = { payload, protectedHeader: verified.protectedHeader };
    if (typeof key === 'function') {
        return { ...result, key: verified.key };
    }
    return result;
}

const sign = async (alg, key, data) => {
    const cryptoKey = await getCryptoKey(alg, key, 'sign');
    checkKeyLength(alg, cryptoKey);
    const signature = await crypto$1.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
    return new Uint8Array(signature);
};

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
        if (!isDisjoint(this._protectedHeader, this._unprotectedHeader)) {
            throw new JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader,
        };
        const extensions = validateCrit(JWSInvalid, new Map([['b64', true]]), options?.crit, this._protectedHeader, joseHeader);
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
        const signature = await sign(alg, key, data);
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
        this._pendingFetch || (this._pendingFetch = fetchJwks(this._url, this._timeoutDuration, this._options)
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

function getModulusLengthOption(options) {
    const modulusLength = options?.modulusLength ?? 2048;
    if (typeof modulusLength !== 'number' || modulusLength < 2048) {
        throw new JOSENotSupported('Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used');
    }
    return modulusLength;
}
async function generateKeyPair$1(alg, options) {
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
            const crv = options?.crv ?? 'Ed25519';
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
            const crv = options?.crv ?? 'P-256';
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
    return crypto$1.subtle.generateKey(algorithm, options?.extractable, keyUsages);
}

async function generateKeyPair(alg, options) {
    return generateKeyPair$1(alg, options);
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

const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native = { randomUUID };

function v4(options, buf, offset) {
    if (native.randomUUID && true && !options) {
        return native.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return unsafeStringify(rnds);
}

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
            catch (_err) {
                /* eslint-disable  @typescript-eslint/no-explicit-any */
                return param.toString();
            }
        })
            .join(", ")}`);
    }
}

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
    catch (_e) {
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
            if (await handler.canHandle(userId, options))
                await handler.handle(userId, options);
        }
    }
}

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
        sessionId: v4(),
        fetch: (...args) => fetch(...args),
    };
}
/**
 * @param sessionId
 * @param storage
 * @hidden
 */
async function clear$1(sessionId, storage) {
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
    async getAll() {
        throw new Error("Not implemented");
    }
    /**
     * This function removes all session-related information from storage.
     * @param sessionId the session identifier
     * @hidden
     */
    async clear(sessionId) {
        return clear$1(sessionId, this.storageUtility);
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
function isValidUrl$1(url) {
    try {
        // Here, the URL constructor is just called to parse the given string and
        // verify if it is a well-formed IRI.
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
    return options.clientId !== undefined && !isValidUrl$1(options.clientId);
}
function isSolidOidcClient(options, issuerConfig) {
    return (issuerConfig.scopesSupported.includes("webid") &&
        options.clientId !== undefined &&
        isValidUrl$1(options.clientId));
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
let ClientAuthentication$1 = class ClientAuthentication {
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
};
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
        catch (_err) {
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
 * Error to be triggered if a method is not implemented
 * @hidden
 */
class NotImplementedError extends Error {
    /* istanbul ignore next */
    constructor(methodName) {
        super(`[${methodName}] is not implemented`);
    }
}

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
        jti: v4(),
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
    const { privateKey, publicKey } = await generateKeyPair(PREFERRED_SIGNING_ALG[0], { extractable: true });
    const dpopKeyPair = {
        privateKey,
        publicKey: await exportJWK(publicKey),
    };
    // The alg property isn't set by exportJWK, so set it manually.
    [dpopKeyPair.publicKey.alg] = PREFERRED_SIGNING_ALG;
    return dpopKeyPair;
}

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
    const emitter = options?.eventEmitter;
    // Setup the refresh timeout outside of the authenticated fetch, so that
    // an idle app will not get logged out if it doesn't issue a fetch before
    // the first expiration date.
    if (options !== undefined && currentRefreshOptions !== undefined) {
        const proactivelyRefreshToken = async () => {
            try {
                const { accessToken: refreshedAccessToken, refreshToken, expiresIn, } = await refreshAccessToken(currentRefreshOptions, options.dpopKey, emitter);
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
                    emitter?.emit(EVENTS.ERROR, e.error, e.errorDescription);
                    /* istanbul ignore next 100% coverage would require testing that nothing
                      happens here if the emitter is undefined, which is more cumbersome
                      than what it's worth. */
                    emitter?.emit(EVENTS.SESSION_EXPIRED);
                }
                if (e instanceof InvalidResponseError &&
                    e.missingFields.includes("access_token")) {
                    // In this case, the OIDC provider returned a non-standard response, but
                    // did not specify that it was an error. We cannot refresh nonetheless.
                    /* istanbul ignore next 100% coverage would require testing that nothing
                      happens here if the emitter is undefined, which is more cumbersome
                      than what it's worth. */
                    emitter?.emit(EVENTS.SESSION_EXPIRED);
                }
            }
        };
        latestTimeout = setTimeout(proactivelyRefreshToken, 
        // If currentRefreshOptions is defined, options is necessarily defined too.
        computeRefreshDelay(options.expiresIn) * 1000);
        emitter?.emit(EVENTS.TIMEOUT_SET, latestTimeout);
    }
    else if (emitter !== undefined) {
        // If no refresh options are provided, the session expires when the access token does.
        const expirationTimeout = setTimeout(() => {
            emitter.emit(EVENTS.SESSION_EXPIRED);
        }, computeRefreshDelay(options?.expiresIn) * 1000);
        emitter.emit(EVENTS.TIMEOUT_SET, expirationTimeout);
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

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var events$1 = {exports: {}};

var hasRequiredEvents;

function requireEvents () {
	if (hasRequiredEvents) return events$1.exports;
	hasRequiredEvents = 1;

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
	events$1.exports = EventEmitter;
	events$1.exports.once = once;

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
	return events$1.exports;
}

var eventsExports = requireEvents();
var EventEmitter = /*@__PURE__*/getDefaultExportFromCjs(eventsExports);

class InvalidTokenError extends Error {
}
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
    }
    catch (err) {
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
    }
    catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
        return JSON.parse(decoded);
    }
    catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
}

// src/utils/Logger.ts
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
    level = 3 /* INFO */;
    logger = nopLogger;
  }
  Log2.reset = reset;
  function setLevel(value) {
    if (!(0 /* NONE */ <= value && value <= 4 /* DEBUG */)) {
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
    if (level >= 4 /* DEBUG */) {
      logger.debug(_Logger._format(this._name, this._method), ...args);
    }
  }
  info(...args) {
    if (level >= 3 /* INFO */) {
      logger.info(_Logger._format(this._name, this._method), ...args);
    }
  }
  warn(...args) {
    if (level >= 2 /* WARN */) {
      logger.warn(_Logger._format(this._name, this._method), ...args);
    }
  }
  error(...args) {
    if (level >= 1 /* ERROR */) {
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
    if (level >= 4 /* DEBUG */) {
      logger.debug(_Logger._format(name), ...args);
    }
  }
  static info(name, ...args) {
    if (level >= 3 /* INFO */) {
      logger.info(_Logger._format(name), ...args);
    }
  }
  static warn(name, ...args) {
    if (level >= 2 /* WARN */) {
      logger.warn(_Logger._format(name), ...args);
    }
  }
  static error(name, ...args) {
    if (level >= 1 /* ERROR */) {
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

// src/utils/CryptoUtils.ts
var UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";
var toBase64 = (val) => btoa([...new Uint8Array(val)].map((chr) => String.fromCharCode(chr)).join(""));
var _CryptoUtils = class _CryptoUtils {
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
      (c) => (+c ^ _CryptoUtils._randomWord() & 15 >> +c / 4).toString(16)
    );
    return uuid.replace(/-/g, "");
  }
  /**
   * PKCE: Generate a code verifier
   */
  static generateCodeVerifier() {
    return _CryptoUtils.generateUUIDv4() + _CryptoUtils.generateUUIDv4() + _CryptoUtils.generateUUIDv4();
  }
  /**
   * PKCE: Generate a code challenge
   */
  static async generateCodeChallenge(code_verifier) {
    if (!crypto.subtle) {
      throw new Error("Crypto.subtle is available only in secure contexts (HTTPS).");
    }
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(code_verifier);
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
    const encoder = new TextEncoder();
    const data = encoder.encode([client_id, client_secret].join(":"));
    return toBase64(data);
  }
  /**
   * Generates a hash of a string using a given algorithm
   * @param alg
   * @param message
   */
  static async hash(alg, message) {
    const msgUint8 = new TextEncoder().encode(message);
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
    const utf8encodedAndHashed = await _CryptoUtils.hash("SHA-256", JSON.stringify(jsonObject));
    return _CryptoUtils.encodeBase64Url(utf8encodedAndHashed);
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
      hashedToken = await _CryptoUtils.hash("SHA-256", accessToken);
      encodedHash = _CryptoUtils.encodeBase64Url(hashedToken);
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
      return await _CryptoUtils.customCalculateJwkThumbprint(publicJwk);
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
      "jti": _CryptoUtils.generateUUIDv4(),
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
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(client_secret),
      { name: "HMAC", hash: hashFunction },
      false,
      ["sign"]
    );
    return await JwtUtils.generateSignedJwtWithHmac(header, payload, secretKey);
  }
};
/**
 * Generates a base64url encoded string
 */
_CryptoUtils.encodeBase64Url = (input) => {
  return toBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};
var CryptoUtils = _CryptoUtils;

// src/utils/Event.ts
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

// src/utils/Timer.ts
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

// src/utils/UrlUtils.ts
var UrlUtils = class {
  static readParams(url, responseMode = "query") {
    if (!url) throw new TypeError("Invalid URL");
    const parsedUrl = new URL(url, "http://127.0.0.1");
    const params = parsedUrl[responseMode === "fragment" ? "hash" : "search"];
    return new URLSearchParams(params.slice(1));
  }
};
var URL_STATE_DELIMITER = ";";

// src/errors/ErrorResponse.ts
var ErrorResponse = class extends Error {
  constructor(args, form) {
    var _a, _b, _c;
    super(args.error_description || args.error || "");
    this.form = form;
    /** Marker to detect class: "ErrorResponse" */
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

// src/errors/ErrorTimeout.ts
var ErrorTimeout = class extends Error {
  constructor(message) {
    super(message);
    /** Marker to detect class: "ErrorTimeout" */
    this.name = "ErrorTimeout";
  }
};

// src/InMemoryWebStorage.ts
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

// src/errors/ErrorDPoPNonce.ts
var ErrorDPoPNonce = class extends Error {
  constructor(nonce, message) {
    super(message);
    /** Marker to detect class: "ErrorDPoPNonce" */
    this.name = "ErrorDPoPNonce";
    this.nonce = nonce;
  }
};

// src/JsonService.ts
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

// src/MetadataService.ts
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

// src/WebStorageStateStore.ts
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

// src/OidcClientSettings.ts
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

// src/UserInfoService.ts
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

// src/TokenClient.ts
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

// src/ResponseValidator.ts
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
    const hasIdToken = response.isOpenId && !!response.id_token;
    await this._processClaims(response, false, hasIdToken);
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

// src/State.ts
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

// src/SigninState.ts
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

// src/SigninRequest.ts
var _SigninRequest = class _SigninRequest {
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
    return new _SigninRequest({
      url: parsedUrl.href,
      state
    });
  }
};
_SigninRequest._logger = new Logger("SigninRequest");
var SigninRequest = _SigninRequest;

// src/SigninResponse.ts
var OidcScope = "openid";
var SigninResponse = class {
  constructor(params) {
    /** @see {@link User.access_token} */
    this.access_token = "";
    /** @see {@link User.token_type} */
    this.token_type = "";
    /** @see {@link User.profile} */
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

// src/SignoutRequest.ts
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

// src/SignoutResponse.ts
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

// src/ClaimsService.ts
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

// src/DPoPStore.ts
var DPoPState = class {
  constructor(keys, nonce) {
    this.keys = keys;
    this.nonce = nonce;
  }
};

// src/OidcClient.ts
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
// Camelcase identifiers are required in the OIDC specification.
/* eslint-disable camelcase*/
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
        client_name: options.clientName,
        application_type: "web",
        redirect_uris: [options.redirectUrl?.toString()],
        subject_type: "public",
        token_endpoint_auth_method: "client_secret_basic",
        id_token_signed_response_alg: signingAlg,
        grant_types: ["authorization_code", "refresh_token"],
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
// Camelcase identifiers are required in the OAuth specification.
/* eslint-disable camelcase*/
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
        grant_type: data.grantType,
        redirect_uri: data.redirectUrl,
        code: data.code,
        code_verifier: data.codeVerifier,
        client_id: client.clientId,
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
const isValidUrl = (url) => {
    try {
        // Here, the URL constructor is just called to parse the given string and
        // verify if it is a well-formed IRI.
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
// Identifiers in snake_case are mandated by the OAuth spec.
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
    else if (isValidUrl(client.clientId)) {
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
    catch (_e) {
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
    const store = new WebStorageStateStore({});
    await State.clearStaleState(store, 60 * 15);
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
 * Checks if a client's registration has expired.
 */
function isClientExpired(sessionInfo) {
    // clientExpiresAt === 0 means the client never expires (per OIDC DCR spec)
    if (sessionInfo.clientExpiresAt === undefined ||
        sessionInfo.clientExpiresAt === 0) {
        return false;
    }
    return sessionInfo.clientExpiresAt < Math.floor(Date.now() / 1000);
}
/**
 * @hidden
 */
class ClientAuthentication extends ClientAuthentication$1 {
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
    // if the expected information cannot be found or if the client has expired.
    // Note that the ID token is not stored, which means the session information
    // cannot be validated at this point.
    validateCurrentSession = async (currentSessionId) => {
        const sessionInfo = await this.sessionInfoManager.get(currentSessionId);
        if (sessionInfo === undefined ||
            sessionInfo.clientAppId === undefined ||
            sessionInfo.issuer === undefined ||
            isClientExpired(sessionInfo)) {
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
            await new Promise((resolve) => {
                setTimeout(() => resolve(), 1);
            });
        }
    }
}

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
// Camelcase identifiers are required in the OIDC specification.
/* eslint-disable camelcase*/
/**
 * @hidden
 * Authorization code flow spec: https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth
 * PKCE: https://tools.ietf.org/html/rfc7636
 */
class AuthorizationCodeWithPkceOidcHandler extends AuthorizationCodeWithPkceOidcHandlerBase {
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
            prompt: oidcLoginOptions.prompt ?? "consent",
        };
        const oidcClientLibrary = new OidcClient(oidcOptions);
        try {
            const signingRequest = await oidcClientLibrary.createSigninRequest({});
            // Make sure to await the promise before returning so that the error is caught.
            return await this.setupRedirectHandler({
                oidcLoginOptions,
                state: signingRequest.state.id,
                codeVerifier: signingRequest.state.code_verifier ?? "",
                targetUrl: signingRequest.url.toString(),
            });
        }
        catch (err) {
            console.error(err);
        }
        // The login is only completed AFTER redirect, so nothing to return here.
        return undefined;
    }
}

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
// Camelcase identifiers are required in the OIDC specification.
/* eslint-disable camelcase*/
const WELL_KNOWN_OPENID_CONFIG = ".well-known/openid-configuration";
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
async function clear(sessionId, storage) {
    await clear$1(sessionId, storage);
    await clearOidcPersistentStorage();
}
/**
 * @hidden
 */
class SessionInfoManager extends SessionInfoManagerBase {
    async get(sessionId) {
        const [isLoggedIn, webId, clientId, clientSecret, redirectUrl, refreshToken, issuer, tokenType, expiresAt,] = await Promise.all([
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
            this.storageUtility.getForUser(sessionId, "expiresAt", {
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
            clientExpiresAt: expiresAt !== undefined ? Number.parseInt(expiresAt, 10) : undefined,
        };
    }
    /**
     * This function removes all session-related information from storage.
     * @param sessionId the session identifier
     * @param storage the storage where session info is stored
     * @hidden
     */
    async clear(sessionId) {
        return clear(sessionId, this.storageUtility);
    }
}

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
        this.events = new EventEmitter();
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
                sessionId: sessionId ?? v4(),
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
let defaultSession;
/**
 * Obtain the {@link Session} used when not explicitly instantiating one yourself.
 *
 * When using the top-level exports {@link fetch}, {@link login}, {@link logout},
 * {@link handleIncomingRedirect}, {@link onLogin} and {@link onLogout}, these apply to an
 * implicitly-instantiated {@link Session}.
 * This function returns a reference to that Session in order to obtain e.g. the current user's
 * WebID.
 * @since 1.3.0
 */
function getDefaultSession() {
    if (typeof defaultSession === "undefined") {
        defaultSession = new Session();
    }
    return defaultSession;
}
/**
 * This function's signature is equal to `window.fetch`, but if the current user is authenticated
 * (see [[login]] and [[handleIncomingRedirect]]), requests made using it will include that user's
 * credentials. If not, this will behave just like the regular `window.fetch`.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch}
 * @since 1.3.0
 */
function fetch$1(...args) {
    const session = getDefaultSession();
    return session.fetch(...args);
}
/**
 * Triggers the login process. Note that this method will redirect the user away from your app.
 *
 * @param options Parameter to customize the login behaviour. In particular, two options are mandatory: `options.oidcIssuer`, the user's identity provider, and `options.redirectUrl`, the URL to which the user will be redirected after logging in their identity provider.
 * @returns This method should redirect the user away from the app: it does not return anything. The login process is completed by [[handleIncomingRedirect]].
 * @since 1.3.0
 */
function login(...args) {
    const session = getDefaultSession();
    return session.login(...args);
}
/**
 * Logs the user out of the application.
 *
 * By default this does not log the user out of their Solid identity provider.
 * In order to do so, you must set the logoutType to `idp`. For usage details
 * see {@link Session.logout}.
 *
 * @since 1.3.0
 */
function logout(...args) {
    const session = getDefaultSession();
    return session.logout(...args);
}
/**
 * Completes the login process by processing the information provided by the Solid identity provider through redirect.
 *
 * @param url The URL of the page handling the redirect, including the query parameters — these contain the information to process the login.
 * @since 1.3.0
 */
function handleIncomingRedirect(...args) {
    const session = getDefaultSession();
    return session.handleIncomingRedirect(...args);
}
/**
 * {@link SessionEventEmitter} instance to subscribe to events by the default session.
 *
 * @since 1.14.0
 */
function events() {
    return getDefaultSession().events;
}

export { ConfigurationError, EVENTS, InMemoryStorage, NotImplementedError, Session, events, fetch$1 as fetch, getDefaultSession, handleIncomingRedirect, login, logout };
