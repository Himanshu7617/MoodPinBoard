# MoodBoard_main
Create vision boards for your mood

## Local setup

1. **Install prerequisites**
	- Node.js 18+
	- npm 9+
2. **Clone and install**
	```powershell
	git clone <repo-url>
	cd MoodBoard_main/app
	npm install
	```
3. **Run the desktop app in development**
	```powershell
	npm run dev:electron
	```
4. **Run the React UI only**
	```powershell
	npm run dev:react
	```
5. **Build production assets + Electron bundle**
	```powershell
	npm run transpile:electron
	npm run build
	npm run dist:win   # or dist:mac / dist:linux
	```

## Repository structure

```
MoodBoard_main/
├── app/
│   ├── src/
│   │   ├── electron/      # main process, preload scripts, utilities
│   │   └── ui/            # React UI (components, pages, contexts)
│   ├── dist-electron/     # transpiled electron output
│   ├── dist-react/        # Vite build artifacts
│   ├── electron-builder.json
│   └── package.json
├── website/               # marketing/landing site (Vite powered)
└── README.md
```

## Features

- Create and manage multiple mood boards.
- Drag-and-drop layout for arranging inspiration assets.
- Image display and board management pages built with React.
- Local persistence through Electron Store for offline-friendly usage.
- Cross-platform packaging via Electron Builder (Windows, macOS, Linux targets).
