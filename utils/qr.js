const QRCode = require('qrcode');
const Store = require('electron-store');

const store = new Store({ name: 'datashare-config' });

/**
 * Returns a QR code (as a data URL) for the given URL.
 * If a QR for the same URL was already generated before, the cached
 * version is reused instead of generating a new one every time the
 * app opens.
 */
async function getOrCreateQr(url) {
  const cachedUrl = store.get('lastUrl');
  const cachedQr = store.get('lastQrDataUrl');

  if (cachedUrl === url && cachedQr) {
    return cachedQr;
  }

  const dataUrl = await QRCode.toDataURL(url, {
    width: 320,
    margin: 1
  });

  store.set('lastUrl', url);
  store.set('lastQrDataUrl', dataUrl);

  return dataUrl;
}

module.exports = { getOrCreateQr };
