//MoodBoard_main\app\node_modules\.bin\asar.ps1

import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import { getPreloadPath } from "./pathResolver.js";
import { isDev } from "./utils.js";
import path from "path";
import http from "http";
import dotenv from "dotenv";
import Store from "electron-store";
import fs from "fs";

interface PinImage {
      height: number;
      width: number;
      url: string;
    }



dotenv.config();
const store = new Store();

// IPC listener
ipcMain.on("electron-store-get", async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on("electron-store-set", async (event, key, val) => {
  store.set(key, val);
});

//variables

const PINTEREST_CLIENT_ID = process.env.PINTEREST_CLIENT_ID || "";
const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET || "";
const PINTEREST_REDIRECT_URI = "http://localhost:3333/oauth2callback";

//getting the window open
app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    autoHideMenuBar: true,
  });

  mainWindow.removeMenu();
  Menu.setApplicationMenu(null);

   app.setLoginItemSettings({
    openAtLogin: true, // launches the app on startup
    path: app.getPath('exe'), // path to your built app's executable
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5213");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }
});

// google auth ipc handler

// ipcMain.handle("google-auth", async () => {
//   console.log("Starting Google Auth Process...");

//   const oauth2Client = new google.auth.OAuth2(
//     CLIENT_ID,
//     CLIENT_SECRET,
//     REDIRECT_URI
//   );

//   const scopes = [
//     "https://www.googleapis.com/auth/userinfo.email",
//     "https://www.googleapis.com/auth/userinfo.profile",
//   ];

//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: scopes,
//   });

//   await open(authUrl);

//   return new Promise((resolve) => {
//     const server = http.createServer(async (req, res) => {
//       if (req.url?.startsWith("/oauth2callback")) {
//         const urlParams = new URL(req.url, "http://localhost:3000");
//         const code = urlParams.searchParams.get("code");

//         if (code) {
//           console.log("Authorization code received, now getting tokens...");
//           const { tokens } = await oauth2Client.getToken(code);
//           oauth2Client.setCredentials(tokens);

//           fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
//           console.log("token saved successfully");

//           const oauth2 = google.oauth2({
//             auth: oauth2Client,
//             version: "v2",
//           });

//           const userInfo = await oauth2.userinfo.get();

//           console.log("User Info:", userInfo.data);

//           res.writeHead(200, { "Content-Type": "text/html" });
//           res.end(`
//             <html>
//               <body style="font-family: sans-serif; text-align: center; margin-top: 100px;">
//                 <h2> Login successful!</h2>
//                 <p>You can close this tab and return to the app.</p>
//                 <script>
//                   setTimeout(() => window.close(), 3000);
//                 </script>
//               </body>
//             </html>
//           `);
//           server.close();
//           console.log("Server closed after successful authentication.");
//           resolve(userInfo.data);
//         }

//         server.on("error", (error) => {
//           console.error("Error occurred:", error);
//           res.writeHead(500, { "Content-Type": "text/plain" });
//           res.end("Internal Server Error");
//         });
//       }
//     });

//     server.listen(3000);
//   });
// });

ipcMain.handle("pinterest-auth", async () => {
  console.log("Starting Pinterest Auth Process...");
  console.log(PINTEREST_CLIENT_ID);
  console.log(PINTEREST_CLIENT_SECRET);

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
            const credentials = `${PINTEREST_CLIENT_ID}:${PINTEREST_CLIENT_SECRET}`;
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
    data.items.forEach( (item : any ) => {
      // if(item.media_type === "image" && item.media && item.media.images) {
      //   allPins.push({
      //     height: item.media.images[0].height,
      //     width: item.media.images[0].width,
      //     url: item.media.images[0].url
      //   });
      // }

      Object.entries(item.media.images).forEach( ([key, image] ) => {
        const imageObj = image as string | any;
        allPins.push({
          height: imageObj.height,
          width: imageObj.width,
          url: imageObj.url
        });
      });
    });
  

    console.log(allPins.length)
    fs.writeFileSync("./pins.json", JSON.stringify(allPins));

    return {totalLength: allPins.length, message : "Pins saved successfully"};
  } catch (error) {
    console.error("Error fetching Pinterest board pins:", error);
    throw error;
  }
});



ipcMain.handle("get-current-image", async (event, pinIndex: number) => {
  const allPins = JSON.parse(fs.readFileSync("./pins.json", "utf-8")) as PinImage[];
  return allPins[pinIndex] || null;
});
