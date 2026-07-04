const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const pickFilesBtn = document.getElementById('pickFilesBtn');
const pickFolderBtn = document.getElementById('pickFolderBtn');
const selectedList = document.getElementById('selectedList');
const sendBtn = document.getElementById('sendBtn');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const statusText = document.getElementById('statusText');

let selectedFiles = [];

function renderSelected() {
  selectedList.innerHTML = '';
  selectedFiles.forEach((file) => {
    const row = document.createElement('div');
    row.className = 'selected-item';
    row.innerHTML = `<span>${file.name}</span><span>${(file.size / 1024).toFixed(1)} KB</span>`;
    selectedList.appendChild(row);
  });
  sendBtn.disabled = selectedFiles.length === 0;
}

function addFiles(fileList) {
  selectedFiles = selectedFiles.concat(Array.from(fileList));
  renderSelected();
}

dropZone.addEventListener('click', () => fileInput.click());
pickFilesBtn.addEventListener('click', () => fileInput.click());
pickFolderBtn.addEventListener('click', () => folderInput.click());

fileInput.addEventListener('change', (e) => addFiles(e.target.files));
folderInput.addEventListener('change', (e) => addFiles(e.target.files));

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.background = '#eef2ff';
});
dropZone.addEventListener('dragleave', () => {
  dropZone.style.background = '#fff';
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.background = '#fff';
  addFiles(e.dataTransfer.files);
});

sendBtn.addEventListener('click', () => {
  if (selectedFiles.length === 0) return;

  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append('files', file));

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload');

  progressWrap.hidden = false;
  sendBtn.disabled = true;
  statusText.textContent = 'Sending...';

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percent + '%';
    }
  });

  xhr.onload = () => {
    if (xhr.status === 200) {
      statusText.textContent = 'Sent successfully! You can close this page.';
      selectedFiles = [];
      renderSelected();
    } else {
      statusText.textContent = 'Something went wrong. Please try again.';
      sendBtn.disabled = false;
    }
  };

  xhr.onerror = () => {
    statusText.textContent = 'Network error. Please try again.';
    sendBtn.disabled = false;
  };

  xhr.send(formData);
});
