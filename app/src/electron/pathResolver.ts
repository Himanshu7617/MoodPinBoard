
import path from 'path';
import { app } from 'electron/main';
import { isDev } from './utils.js';

export function getPreloadPath() { 
    const preloadPath =  path.join(app.getAppPath() , isDev() ? '.' : '..', "/dist-electron/preload.cjs" );
  
    return preloadPath;
}