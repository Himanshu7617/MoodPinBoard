
// import path from 'path';
// import { app } from 'electron/main';
// import { isDev } from './utils.js';

// export function getPreloadPath() { 
//     const preloadPath =  path.join(app.getAppPath() , isDev() ? '.' : '..', "/dist-electron/preload.cjs" );
  
//     return preloadPath;

// }

import path from "path";
import { app } from "electron";
import { isDev } from "./utils.js";

export function getPreloadPath() {
  return path.join(app.getAppPath(), "dist-electron", "preload.cjs");
}
