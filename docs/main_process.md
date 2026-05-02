# Module Electron Main & Preload

## 1. Processus Principal (`main.js`)

Gère le cycle de vie de l'application Electron et le pont avec l'API Express.

### Method Summary
| Modifier and Type | Method | Description |
|---|---|---|
| `void` | `createWindow()` | Crée et affiche la fenêtre principale du navigateur Electron. |

### Événements IPC (ipcMain)
- **`save-file`** : Ouvre une boîte de dialogue pour sauvegarder un fichier. Décode le base64 si PDF.
- **`get-app-path`** : Renvoie le chemin racine de l'application.

---

## 2. Script de Préchargement (`preload.js`)

Expose l'API sécurisée au Renderer.

### Object `window.electronAPI`
| Modifier and Type | Method | Description |
|---|---|---|
| `Promise<Object>` | `saveFile(fileName, content, defaultPath)` | Demande la sauvegarde d'un fichier via `ipcRenderer.invoke`. |
| `Promise<string>` | `getAppPath()` | Demande le chemin de l'application. |
