# DataShare

A PC-based local file sharing app. Open the app on your PC, scan the QR
code from any mobile device (no app install needed on mobile), and send
files or whole folders instantly over your local WiFi network.

## Project structure

```
datashare-app/
  main.js              Electron main process (starts server, QR, IPC actions)
  preload.js            Safely exposes IPC methods to the dashboard UI
  server/index.js        Express + Socket.io + Multer (receives uploads)
  utils/network.js       Local IP detection + mDNS (datashare.local)
  utils/qr.js             QR code generation + caching
  renderer/               PC dashboard UI (QR display, file list, actions)
  public/                 Mobile upload page (served to phone's browser)
  storage/                Where received files are actually saved
```

## Windows installer বানানো (এক ক্লিকে install হবে এমন app)

এই প্রজেক্টে আগে থেকেই `electron-builder` সেট করা আছে। দুইভাবে installer বানাতে পারবেন:

### Option A: নিজের PC তে সরাসরি build (সবচেয়ে সহজ, শুরুতে এটাই করুন)

```
npm install
npm run build:installer
```

Build শেষ হলে `dist/` ফোল্ডারে `DataShare Setup x.x.x.exe` পাবেন। এই .exe ফাইলটাই যে কাউকে দিলে, ডাবল ক্লিক করে ওরা install করে নিতে পারবে — নরমাল যেকোনো Windows app এর মতো।

`npm run build:portable` দিলে .exe লাগবে না install করার জন্য, সরাসরি চালানো যাবে (portable version)।

### Option B: GitHub থেকে অটোমেটিক build + Release (সবচেয়ে প্রফেশনাল উপায়)

এতে আপনার নিজের PC তে কিছু build করতে হবে না — GitHub এর সার্ভারই বানিয়ে Release পেজে আপলোড করে দেবে।

**একবারের সেটআপ:**
1. এই প্রজেক্টটা একটা GitHub repo তে push করুন (public বা private, দুটোই চলবে)।
2. `package.json` এর `build.publish` অংশে `YOUR_GITHUB_USERNAME` আর `YOUR_REPO_NAME` এর জায়গায় নিজের GitHub username আর repo এর নাম বসান।
3. (ঐচ্ছিক) `build/icon.ico` নামে একটা icon ফাইল রাখুন — নাহলে ডিফল্ট Electron icon ব্যবহার হবে। বিস্তারিত `build/ICON_NEEDED.txt` তে আছে।

**প্রতিবার নতুন version release করতে:**
```
git add .
git commit -m "release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

Tag push করার সাথে সাথে `.github/workflows/build.yml` অটোমেটিক চালু হয়ে যাবে, Windows installer বানিয়ে সরাসরি আপনার GitHub repo এর **Releases** পেজে আপলোড করে দেবে। ইউজাররা তখন শুধু:

`your-repo/releases` পেজে গিয়ে `DataShare Setup.exe` ডাউনলোড করে ডাবল ক্লিক করে install করে ফেলবে।

Progress দেখতে চাইলে GitHub repo এর **Actions** ট্যাবে যান — build চলার লাইভ log সেখানে দেখা যাবে।

> Version আপডেট করতে চাইলে পরের বার `v1.0.1`, `v1.0.2` — এভাবে tag বাড়িয়ে একই স্টেপ রিপিট করবেন।

## First-time setup (on your PC)

1. Install [Node.js](https://nodejs.org) (LTS version) if not already installed.
2. Open a terminal inside this folder and run:
   ```
   npm install
   ```
3. Start the app:
   ```
   npm start
   ```

The Electron window will open showing a QR code. Make sure your PC and
mobile phone are on the **same WiFi network**, then scan the QR from your
phone's camera — it will open the upload page in the browser, no app
needed.

## How the "QR generated only once" behavior works

- The QR encodes `http://datashare.local:3000`, a fixed local hostname
  (via mDNS/Bonjour), not a raw IP address. So even if your PC's IP
  changes later, the same QR code keeps working.
- The generated QR image is cached (`utils/qr.js` + `electron-store`), so
  it is not regenerated every time you open the app — only the first time,
  or if the target URL ever changes.

## Building a distributable .exe (production)

Once you're happy with testing:

```
npm run build:installer   # creates a Setup.exe installer
npm run build:portable    # creates a single portable .exe, no install needed
```

Both are generated using `electron-builder`, based on the `build` config
already set up in `package.json`. After this, the end user just
double-clicks the .exe like any normal Windows app — no terminal/cmd
required.

## Notes

- All received files are stored directly in the `storage/` folder on the
  PC's own disk — no database, no cloud.
- Each received file row has three actions: **Save** (choose where to keep
  a copy), **Print** (opens print dialog), and **Delete** (removes it from
  storage).
- If `datashare.local` doesn't resolve on some phones (rare, mostly older
  Android devices), the dashboard also shows the fallback IP-based URL
  you can type manually.
