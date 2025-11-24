//MoodBoard_main\app\node_modules\.bin\asar.ps1

import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import { getPreloadPath } from "./pathResolver.js";
import { isDev } from "./utils.js";
import path from "path";
import http from "http";
//import dotenv from "dotenv";
import Store from "electron-store";
import fs from "fs";
import { updateElectronApp } from "update-electron-app";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

updateElectronApp();

interface PinImage {
  height: number;
  width: number;
  url: string;
}
//dotenv.config();
// const envPath = path.join(process.resourcesPath, ".env");
// dotenv.config({ path: envPath });
const store = new Store();
store.clear();
// IPC listener
ipcMain.on("electron-store-get", async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on("electron-store-set", async (event, key, val) => {
  store.set(key, val);
});

//variables

const PINTEREST_CLIENT_ID = "1534395";
//const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET || "";
const PINTEREST_REDIRECT_URI = "http://localhost:3333/oauth2callback";

//getting the window open
app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.removeMenu();
  Menu.setApplicationMenu(null);

  if (isDev()) {
    // In development, we want to UN-register the startup item to clean up any previous bad state
    app.setLoginItemSettings({
      openAtLogin: false,
      path: process.execPath, // Use the current executable path to identify the item to remove
    });
    mainWindow.loadURL("http://localhost:5213");
  } else {
    // In production, we want to register the app to run on startup
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath("exe"),
    });
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }
});

ipcMain.handle("pinterest-auth", async () => {
  console.log("Starting Pinterest Auth Process...");
  console.log("Client ID:", PINTEREST_CLIENT_ID);
  console.log("Redirect URI:", PINTEREST_REDIRECT_URI);

  const SCOPES = "boards:read,pins:read";
  const STATE = "randomstring";

  const authUrl = `https://www.pinterest.com/oauth/?client_id=${encodeURIComponent(
    PINTEREST_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    PINTEREST_REDIRECT_URI
  )}&response_type=code&scope=${encodeURIComponent(
    SCOPES
  )}&state=${encodeURIComponent(STATE)}`;

  await shell.openExternal(authUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url?.startsWith("/oauth2callback")) {
        const url = new URL(req.url, "http://localhost:3333/");
        const code = url.searchParams.get("code");

        if (code) {
          try {
            const credentials = `${PINTEREST_CLIENT_ID}:89385c22ac3b14396b7477190e83cb3c6cc2c378`;
            const encodedCredentials =
              Buffer.from(credentials).toString("base64");

            const params = new URLSearchParams();
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", PINTEREST_REDIRECT_URI);
            params.append("continuous_refresh", "true"); // optional if you want refresh

            const tokenRes = await fetch(
              "https://api.pinterest.com/v5/oauth/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Basic ${encodedCredentials}`,
                },
                body: params.toString(),
              }
            );

            const tokenData = await tokenRes.json();

            console.log("token saved successfully");

            if (!tokenRes.ok) {
              console.error("Pinterest token request failed:", tokenData);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error");
              return;
            }

            res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; margin-top: 100px;">
                <h2> Login successful!</h2>
                <p>You can close this tab and return to the app.</p>
                <script>
                  setTimeout(() => window.close(), 3000);
                </script>
              </body>
            </html>
          `);
            store.set("pinterestAccessToken", tokenData.access_token);
            resolve({ message: "success" });
            server.close();
          } catch (error) {
            console.error(
              "Error occurred while fetching Pinterest token:",
              error
            );
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
            reject(error);
          }
        }
      }
    });

    server.listen(3333);
  });
});

ipcMain.handle("fetch-pinterest-boards", async () => {
  console.log("Fetching Pinterest Boards...");
  const accessToken = store.get("pinterestAccessToken") as string;
  //console.log("Using Access Token:", accessToken);

  try {
    const response = await fetch("https://api.pinterest.com/v5/boards", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Pinterest boards");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching Pinterest boards:", error);
    throw error;
  }
});

ipcMain.handle("store-board-pins", async (event, boardId: string) => {
  console.log("Fetching Pins for Board ID:", boardId);
  const accessToken = store.get("pinterestAccessToken") as string;
  try {
    const response = await fetch(
      `https://api.pinterest.com/v5/boards/${boardId}/pins`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Pinterest board pins");
    }

    const data = await response.json();

    const allPins: PinImage[] = [];
    data.items.forEach((item: any) => {
      // console.log("Processing item images:", Object.keys(item.media.images)); // Debug log

      const images = item.media.images;
      let selectedImage = images['original'];

      if (!selectedImage) {
        // Fallback to the largest image if 'original' is not available
        const sizes = Object.keys(images).filter(key => key !== 'original');
        if (sizes.length > 0) {
          // Sort by width (descending) to get the largest
          sizes.sort((a, b) => images[b].width - images[a].width);
          selectedImage = images[sizes[2]];
        }
      }

      if (selectedImage) {
        allPins.push({
          height: selectedImage.height,
          width: selectedImage.width,
          url: selectedImage.url,
        });
      }
    });

    console.log(allPins.length);
    const userDataPath = app.getPath("appData");
    const projectDirectory = path.join(userDataPath, "MoodBoard");

    if (!fs.existsSync(projectDirectory)) {
      console.log("Creating project directory at:", projectDirectory);
      fs.mkdirSync(projectDirectory);
    }
    console.log("Saving pins to:", path.join(projectDirectory, "pins.json"));

    fs.writeFileSync(path.join(projectDirectory, "pins.json"), JSON.stringify(allPins));

    return { totalLength: allPins.length, message: "Pins saved successfully" };
  } catch (error) {
    console.error("Error fetching Pinterest board pins:", error);
    throw error;
  }
});

ipcMain.handle("get-current-image", async (event, pinIndex: number) => {
  const userDataPath = app.getPath("appData");
  const projectDirectory = path.join(userDataPath, "MoodBoard");

  const allPins = JSON.parse(
    fs.readFileSync(path.join(projectDirectory, "pins.json"), "utf-8")
  ) as PinImage[];
  return allPins[pinIndex] || null;
});

ipcMain.handle("fetch-all-pins", async () => {
  const userDataPath = app.getPath("appData");
  const projectDirectory = path.join(userDataPath, "MoodBoard");

  const allPins = JSON.parse(
    fs.readFileSync(path.join(projectDirectory, "pins.json"), "utf-8")
  ) as PinImage[];
  return allPins;
});

ipcMain.handle("save-canvas-image", async (event, dataUrl: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: "moodboard.jpeg",
    filters: [{ name: "JPEG Image", extensions: ["jpeg", "jpg"] }],
  });

  if (canceled || !filePath) {
    return { success: false, message: "Canceled" };
  }

  // Remove the data URL prefix to get just the base64 string
  const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");

  try {
    fs.writeFileSync(filePath, base64Data, "base64");
    return { success: true, path: filePath };
  } catch (e) {
    console.error("Failed to save image", e);
    throw e;
  }
});

ipcMain.handle("fetch-image-base64", async (event, url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch image base64:", error);
    throw error;
  }
});
