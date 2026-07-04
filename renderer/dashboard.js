const qrImage = document.getElementById('qrImage');
const urlText = document.getElementById('urlText');
const ipSelect = document.getElementById('ipSelect');
const fileList = document.getElementById('fileList');
const emptyState = document.getElementById('emptyState');
const openFolderBtn = document.getElementById('openFolderBtn');

const socket = io('http://localhost:3000');

// Receive QR + URL info from the main process once the window loads
window.datashare.onInit(({ qrDataUrl, shareUrl, allIps, port }) => {
  qrImage.src = qrDataUrl;
  urlText.textContent = shareUrl;

  ipSelect.innerHTML = '';
  allIps.forEach(({ name, address }) => {
    const option = document.createElement('option');
    option.value = address;
    option.textContent = `${name} - ${address}`;
    if (shareUrl.includes(address)) option.selected = true;
    ipSelect.appendChild(option);
  });

  ipSelect.addEventListener('change', async () => {
    const result = await window.datashare.setNetworkIp(ipSelect.value);
    qrImage.src = result.qrDataUrl;
    urlText.textContent = result.shareUrl;
  });
});

openFolderBtn.addEventListener('click', () => {
  window.datashare.openStorageFolder();
});

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function buildPreview(file) {
  const wrap = document.createElement('div');
  wrap.className = 'file-preview';

  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = file.url;
    wrap.appendChild(img);
  } else if (file.type.startsWith('video/')) {
    const vid = document.createElement('video');
    vid.src = file.url;
    wrap.appendChild(vid);
  } else {
    const ext = file.name.split('.').pop().toUpperCase();
    wrap.textContent = ext;
  }
  return wrap;
}

function addFileRow(file, prepend = true) {
  emptyState.style.display = 'none';

  const row = document.createElement('div');
  row.className = 'file-row';
  row.dataset.storedName = file.storedName;

  const preview = buildPreview(file);

  const info = document.createElement('div');
  info.className = 'file-info';
  info.innerHTML = `
    <div class="file-name">${file.name}</div>
    <div class="file-meta">${formatSize(file.size)} · ${file.type}</div>
  `;

  const actions = document.createElement('div');
  actions.className = 'file-actions';
  actions.innerHTML = `
    <button class="btn-open">Open</button>
    <button class="btn-save">Save</button>
    <button class="btn-print">Print</button>
    <button class="btn-delete">Delete</button>
  `;

  actions.querySelector('.btn-open').addEventListener('click', async () => {
    const result = await window.datashare.openFile(file.storedName);
    if (!result.success) {
      alert('ফাইল ওপেন করা যায়নি: ' + (result.error || 'Unknown error'));
    }
  });

  actions.querySelector('.btn-save').addEventListener('click', async () => {
    await window.datashare.saveFile(file.storedName, file.name);
  });

  actions.querySelector('.btn-print').addEventListener('click', async () => {
    await window.datashare.printFile(file.storedName);
  });

  actions.querySelector('.btn-delete').addEventListener('click', async () => {
    const result = await window.datashare.deleteFile(file.storedName);
    if (result.success) row.remove();
    if (fileList.children.length === 1) emptyState.style.display = 'block';
  });

  row.appendChild(preview);
  row.appendChild(info);
  row.appendChild(actions);

  if (prepend) {
    fileList.insertBefore(row, fileList.firstChild);
  } else {
    fileList.appendChild(row);
  }
}

// Load any files already received before this window opened
fetch('http://localhost:3000/files')
  .then((res) => res.json())
  .then((files) => {
    files.forEach((file) => addFileRow(file, false));
  });

// New files arrive here in real time as mobile devices upload
socket.on('new-file', (file) => {
  addFileRow(file, true);
});
