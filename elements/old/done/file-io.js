import { URL,fileURLToPath } from 'url';
import * as pathObj from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import {cwd} from 'process';

export const path = pathObj;
export const readFileAsync = promisify(fs.readFile);
export const readDirAsync = promisify(fs.readdir);
export const writeFileAsync = promisify(fs.writeFile);
export const curDir = ()=>{return cwd();};

export function getScriptPath(){
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
}

