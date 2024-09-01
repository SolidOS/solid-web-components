import {getUI} from './browser-utils.js';
import {getSingletonStore} from './rdf-utils.js';
getSingletonStore( await getUI() );
