const ACCESS_TOKEN = 'sl.u.AF4FL7a2r1KIbwX4bCe31SvJXHkhIO5ZlDoGqS9S6FZz0u_508mkn4-B1SO4fEOE9fkMiFpYH5jONqFHIpQWqGSotPy7rWKIDzWxqITR6Rfwzd772CZiOmmXJhVZM54DTXpUrqB-d_P_ihePZYVd8s_b7RUSFzaaPAOAPVE9B4pLhbFMyfCMB3tHXBK5VqUKMJZIzVwSzLruZ7uypKsaPnZ8lrt6VPCIiXjzYI-o_4mhA4rcRUFiEgnn04bj9bcKTSPmrq6o0q4Zt4c1aadVWv9sP9MpBBgfaaPU_ynKfdRjhrfR5-xZMIcmFXZkxyygO6XyPCq7vUoNvR8O7LGsGvA7zAwGXw4N6P3g3cqXfMF4xKwm2eG1gX_ThFFDg-grG-lJzpu-Vsavh-mKQF_Mqqgb6ZgDBwufxVToJauPl1pnf7K2qOU6Jwq-O-A_K1iJbLIelYS05VYKf0ofr6Q3MGQ1WSwIZWUQuz0w1wNcpVTdbRP5YgeeObp-zlDyql500qjJ6R4nxG2Q3srqvLg285OP-lybgToUtNdFzGZqRF60HWzUFDMmczAIhwL6_I2OrxD1bx6Qibc_ejwOWrzZteYav3n9BBH-kRlN8A3HkGXmhqvw4f4twaB1scL5EVcuQEig6vMn1Qr42ZQ1teac2BvZUeb9EiTLB-f6RkpceXWycZYghpeX4sbzNf96xGYXiA71DteVlV34i3kMXR4Icaw2hOHvlqQyDbwQm5gDYybcUV2tSPIBUoOnS3sWLw-8Cyc0YmHyCQzjPvss4JpoOrmdjUL__GA_vSgYfp4OKey3KVwzavRqskw90krzxrbMBpQwMblrrj6BGeCNh_KS84WQleaoOc9qSrVy-1bI1sYNGmI1wE4WzuK3Dzhzk_H40QanKSnY39sxePO0qRBJm69fQph50JIBAjiB_iwu44EbraueYXb3yecrEgjTua7va5rNEQGe3vwA7fc8K41QEoVYbxMjClYeDwMvaJM3HoSJph8ztBJtFb6Dw3tGxSCJyPdR7GnRzQ5ZbJbnQDVKrtehg7VOaFXUaB51g6iwbSruOQ7czPfReBCFouHM_LEbKfjGqjZxXlYznKiA8CKrTZq7H-zZhWe2KEmhEtlrZiLQta41yaJF7EVNhhiqXP--6nhRIrUDPYDK2Ef28kiv72vNa1L939Ti311F2grZqK2dm4ZJP2GP-wBT3W0t1YUGimRgg-4TPWJNQ5gBVtBB35BOn2YXK-mK47QvsRdnf_o957rGFJuBuw1gI4qjVb9jLrNqhKjuJznojJSlzkxMjqKyka4rXixqrBhv_MtkNWWglUgVGq9KEQ2gnryzVWoOaESzgshsx8qoq79roqOLwV7rnqXGHDfbJlLWgxx6lH-A_I1oPA_vTTQqBMGBbPofbGPaJeeUCI1GEz5Kc0FB5QXmXS18OndqfWDQz1BKSoWv1f7n1lUXnhMMjx3QLF0rpYI';

const FOLDER_PATH = "/Pamiątka";

let cursors = [];
let allFiles = [];
const FILE_LIMIT = 25;
loadFiles();
async function loadFiles(page = 1) {
  const fileListDiv = document.getElementById("file-list");
  fileListDiv.innerHTML = '<div class="text-muted">Wczytywanie...</div>';

  let files = [];
  let cursor;

  if (page === 1) {
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
          limit: FILE_LIMIT,
        }),
      }
    );

    const listData = await listRes.json();

    if (listData.error) {
      fileListDiv.innerHTML =
        '<div class="text-danger">Błąd: ' +
        JSON.stringify(listData.error) +
        "</div>";
      return;
    }

    files = listData.entries.filter((e) => {
      if (e[".tag"] !== "file") return false;

      const name = e.name.toLowerCase();
      const isImage = name.match(/\.(jpg|jpeg|png|gif)$/);
      const isVideo = name.match(/\.(mp4|webm|ogg)$/);

      return isImage || isVideo;
    });

    if (listData.has_more) cursors[1] = listData.cursor;
  } else {
    cursor = cursors[page - 1];
    if (!cursor) {
      fileListDiv.innerHTML =
        '<div class="text-warning">Brak kolejnej strony.</div>';
      return;
    }

    const continueRes = await fetch(
      "https://api.dropboxapi.com/2/files/list_folder/continue",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursor }),
      }
    );

    const listData = await continueRes.json();

    if (listData.error) {
      fileListDiv.innerHTML =
        '<div class="text-danger">Błąd: ' +
        JSON.stringify(listData.error) +
        "</div>";
      return;
    }

    files = listData.entries.filter((e) => {
      if (e[".tag"] !== "file") return false;

      const name = e.name.toLowerCase();
      const isImage = name.match(/\.(jpg|jpeg|png|gif)$/);
      const isVideo = name.match(/\.(mp4|webm|ogg)$/);

      return isImage || isVideo;
    });

    if (listData.has_more) cursors[page] = listData.cursor;
  }
  allFiles = files;

  if (files.length === 0) {
    fileListDiv.innerHTML =
      '<div class="text">Nie znaleziono zdjęć.</div>';
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
          size: "w1024h768",
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
    col.className = "col-6 col-sm-4";

    col.innerHTML = `
      <div class="thumb-container">
        <img src="${url}" alt="Thumbnail" onclick="openPreview(${
      (page - 1) * FILE_LIMIT + index
    })">
      </div>
    `;
    fileListDiv.appendChild(col);
  });

  const paginationControls = document.getElementById("pagination-controls");
  if (paginationControls) {
    paginationControls.innerHTML = `
  ${
    page > 1
      ? `<button  type="button" class="btn p-0 m-0 text-decoration-none navigation-button" onclick="loadFiles(${
          page - 1
        })">←</button>`
      : ""
  }
  ${
    cursors[page]
      ? `<button type="button" class="btn p-0 m-0 text-decoration-none navigation-button" onclick="loadFiles(${
          page + 1
        })">→</button>`
      : ""
  }
`;
  }
}

function b64ToBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}

let currentPreviewIndex = 0;

function openPreview(index) {
  currentPreviewIndex = index;
  showPreview(currentPreviewIndex);
  document.getElementById("preview-modal").classList.remove("d-none");
}

function closePreview() {
  document.getElementById("preview-modal").classList.add("d-none");
  document.getElementById("preview-content").innerHTML = "";
}

async function showPreview(index) {
  const file = allFiles[index];
  if (!file) return;

  const previewContent = document.getElementById("preview-content");
  previewContent.innerHTML = '<div class="text-light">Wczytywanie...</div>';

  const fileRes = await fetch(
    "https://content.dropboxapi.com/2/files/download",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + ACCESS_TOKEN,
        "Dropbox-API-Arg": toASCIIHeader({ path: file.path_lower }),
      },
    }
  );

  const blob = await fileRes.blob();
  const url = URL.createObjectURL(blob);

  const isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/i);
  const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);

  if (isImage) {
    previewContent.innerHTML = `<img src="${url}" alt="${file.name}">`;
  } else if (isVideo) {
    previewContent.innerHTML = `<video src="${url}" controls autoplay></video>`;
  } else {
    previewContent.innerHTML = `<div class="text-danger">Nieobsługiwany typ pliku.</div>`;
  }
}

function toASCIIHeader(obj) {
  return JSON.stringify(obj).replace(/[\u007f-\uffff]/g, function (c) {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

let touchStartX = 0;
let touchEndX = 0;
const previewModal = document.getElementById("preview-modal");

previewModal.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

previewModal.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  if (Math.abs(deltaX) < 50) return;

  if (deltaX < 0 && currentPreviewIndex < allFiles.length - 1) {
    currentPreviewIndex++;
    showPreview(currentPreviewIndex);
  } else if (deltaX > 0 && currentPreviewIndex > 0) {
    currentPreviewIndex--;
    showPreview(currentPreviewIndex);
  }
}
