import { ipcRenderer } from "electron"
import { google } from "googleapis"

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  store: {
    
    get(key : string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    
    set(property: string, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    // Other method you want to add like has(), reset(), etc.
  },
  pinterestAuth : () => ipcRenderer.invoke('pinterest-auth'),
  fetchPinterestBoards: () => ipcRenderer.invoke('fetch-pinterest-boards'),
  storeBoardPins: (boardId: string) => ipcRenderer.invoke('store-board-pins', boardId),
  getCurrentImage: (pinIndex: number) => ipcRenderer.invoke('get-current-image', pinIndex)
  // we can also expose variables, not just functions
})


