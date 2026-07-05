# DataShare

**Share files instantly between your phone and PC — no cables, no apps, no internet required.**

DataShare turns your PC into a local file-receiving hub. Open the app, scan
a QR code with your phone's camera, and send photos, videos, documents, or
entire folders straight to your PC in seconds — all over your home WiFi,
with no mobile app installation and no internet connection needed.

---

## What kind of app is this?

DataShare is a **Windows desktop application**. You install it once on your
PC like any normal Windows program. It runs in the background and shows a
QR code on screen — that's the whole interface on the PC side.

On the phone side, there's **nothing to install**. Your phone just opens a
regular web page (by scanning the QR code or typing a link), and uses that
page to pick and send files.

## How does the file sharing actually work?

1. You open **DataShare** on your PC. It shows a QR code and a link.
2. Your phone (any phone — Android or iPhone, no app required) scans that
   QR code using its normal camera app, which opens a web page in the
   phone's browser.
3. On that web page, you choose files (or a whole folder) and tap **Send**.
4. The files instantly appear in the **DataShare** window on your PC,
   where you can **Open**, **Save**, **Print**, or **Delete** them.

Everything happens directly between your phone and PC over your local
WiFi — no data goes to the internet or any external server, and no
account or sign-up is needed.

## Requirements

- A Windows PC (Windows 10 or 11).
- Any smartphone with a camera and a web browser.
- **Both devices must be connected to the same WiFi network.** This is
  required because the connection is local/direct — DataShare doesn't
  use the internet at all for transferring files.

## How to install (easy way)

You don't need to write any code or use a terminal. Just download and run
the installer:

1. Go to the **[Releases page](https://github.com/SUJAIT/dataShare/releases)**.
2. At the top, you'll see the **latest version** (e.g. `v1.0.x`) — always
   pick the topmost one, as it's the newest.
3. Under **Assets**, download **`DataShare-Setup-x.x.x.exe`**
   (this is the installer — recommended for most people).
   - There's also a **`DataShare-x.x.x.exe`** file, which is a *portable*
     version that runs without installing anything, if you'd prefer that.
4. Once downloaded, double-click the `.exe` file to start installation.
5. Windows may show a blue **"Windows protected your PC"** screen the
   first time, since the app isn't digitally signed with a paid
   certificate. This is expected for small/independent apps — click
   **"More info"**, then **"Run anyway"** to continue.
6. Follow the install steps (Next → Install → Finish). You may see a
   Windows permission (UAC) prompt during install — click **Yes**; this
   lets the installer automatically set up the necessary network
   permissions so file sharing works right away, with no extra manual
   setup.
7. Once installed, open **DataShare** from your Desktop or Start Menu.

That's it — no terminal, no configuration files, no manual firewall
setup needed.

## How to use it

1. Open **DataShare** on your PC. Make sure your PC is connected to WiFi.
2. A QR code will appear on the left side of the window, along with a
   link (e.g. `http://192.168.x.x:3000`).
3. On your phone, open the camera app and point it at the QR code (or
   manually type the link shown into your phone's browser if scanning
   doesn't work).
4. This opens a simple web page on your phone — no app install needed.
5. Tap **Choose files** or **Choose folder**, select what you want to
   send, then tap **Send**.
6. The files will appear instantly under **Received files** in the
   DataShare window on your PC. From there you can:
   - **Open** — opens the file immediately with its default app
   - **Save** — choose where to keep a permanent copy
   - **Print** — send it straight to your printer
   - **Delete** — remove it from the PC

## Troubleshooting

- **Phone can't reach the link / "site can't be reached":** Double-check
  both devices are on the exact same WiFi network (not one on WiFi and
  one on mobile data, and not connected to two different WiFi bands/
  networks in a mesh WiFi setup).
- **If the IP address shown looks wrong:** use the "Wrong link? Pick
  correct network" dropdown in the app to select the correct network
  adapter.
- Still stuck? Open an issue on this repository describing what you see.

## Notes on privacy

- All received files are stored directly in a private folder on your own
  PC — there is no cloud storage, no external server, and no database.
- Nothing is uploaded to the internet at any point; transfers only work
  while both devices share the same local network.