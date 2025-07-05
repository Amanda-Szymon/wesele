import { ACCESS_TOKEN } from './token.js';

console.log(ACCESS_TOKEN);
const FOLDER_PATH = "/Pamiątka";

async function loadFiles() {
  const fileListDiv = document.getElementById("file-list");
  fileListDiv.innerHTML = '<div class="text-muted">Loading...</div>';

  const listRes = await fetch(
    "https://api.dropboxapi.com/2/files/list_folder",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: FOLDER_PATH,
        recursive: false,
        limit: 50,
      }),
    }
  );

  const listData = await listRes.json();
  const files = listData.entries.filter((e) => e[".tag"] === "file");

  if (files.length === 0) {
    fileListDiv.innerHTML = '<div class="text-warning">No files found.</div>';
    return;
  }

  const thumbRes = await fetch(
    "https://content.dropboxapi.com/2/files/get_thumbnail_batch",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entries: files.map((f) => ({
          path: f.path_lower,
          format: "jpeg",
          size: "w1024h768", // 4:3 size large enough
          mode: "strict",
        })),
      }),
    }
  );

  const thumbData = await thumbRes.json();

  fileListDiv.innerHTML = "";
  thumbData.entries.forEach((entry, index) => {
    const thumbBlob = b64ToBlob(entry.thumbnail, "image/jpeg");
    const url = URL.createObjectURL(thumbBlob);

    const col = document.createElement("div");
    col.className = "col-6 col-sm-4 col-md-3 col-lg-2";

    col.innerHTML = `
          <div class="thumb-container">
            <img src="${url}" alt="Thumbnail">
            <div class="thumb-number">${index + 1}</div>
          </div>
        `;

    fileListDiv.appendChild(col);
  });
}

function b64ToBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length)
      .fill(0)
      .map((_, i) => slice.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
