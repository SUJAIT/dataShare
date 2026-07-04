const os = require('os');
const { Bonjour } = require('bonjour-service');

const MDNS_NAME = 'datashare'; // final host will be datashare.local

// Adapter names that are virtual/VPN and should never be auto-picked
const IGNORE_ADAPTER_NAME = /vmware|virtualbox|hyper-v|vethernet|docker|tailscale|wsl|loopback|zerotier|radmin/i;

/**
 * Gives each candidate IP a score so we can prefer real home/office
 * LAN addresses over VPN or carrier-grade-NAT style addresses.
 */
function scoreIp(address) {
  if (address.startsWith('192.168.')) return 3;
  if (address.startsWith('10.')) return 2;
  const parts = address.split('.').map(Number);
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return 2;
  // 100.64.0.0/10 is CGNAT / Tailscale range - not a real LAN address
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return -1;
  return 0;
}

/**
 * Lists every non-internal IPv4 address found on this PC, excluding known
 * virtual/VPN adapters, sorted best-guess-first. Used both for automatic
 * selection and to let the user manually pick the right one if needed.
 */
function getAllLocalIps() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    if (IGNORE_ADAPTER_NAME.test(name)) continue;
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }

  candidates.sort((a, b) => scoreIp(b.address) - scoreIp(a.address));
  return candidates;
}

/**
 * Finds the PC's current local IPv4 address on the active network (WiFi/LAN).
 * Skips internal/loopback, VPN, and other virtual adapters automatically.
 */
function getLocalIp() {
  const candidates = getAllLocalIps();
  return candidates.length > 0 ? candidates[0].address : '127.0.0.1';
}

/**
 * Advertises this PC on the local network as datashare.local using mDNS
 * (Bonjour/Zeroconf). This is a bonus for devices that support it (some
 * iPhones do); most Android/Windows setups won't resolve it, so the app
 * does not depend on this for the main QR link.
 */
function startMdns(port) {
  const bonjour = new Bonjour();
  const service = bonjour.publish({
    name: 'DataShare PC',
    type: 'http',
    host: `${MDNS_NAME}.local`,
    port
  });
  service.start();
  return { bonjour, service, hostname: `${MDNS_NAME}.local` };
}

module.exports = { getLocalIp, getAllLocalIps, startMdns, MDNS_NAME };
