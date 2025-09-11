const ACCESS_TOKEN = 'sl.u.AF-x3N9OO3_bCuChWDV3quPbcVy14FN1QUKY5_iH5Lma4UXbdMl0Q49eyFkXQsMTpsV8ZmngCkuEAHtr_S2ZtSbGIrvThUYFnh-soVac81Tzl3FetgAURGk1DXeg6RRCcWT68ZD2J4j_MiukJHf-e4cDc3CodS38TYGzEPn3EjJL4l5Rnc5yohVif7unzDhzl9Mmm95NNNFt-Rt2D5QNlNtY5f4S_1Zo9JNm1KAKMxEJsnYEoSz-6ESIsIgU207nqwmRnUp0PKzxDGNDEPSR2kdSKFjJ3uv_tOS1tc9__PwE5yDYWdA96sfPmGIIP1K41DUt_Ulurv_Zbu8kyyCsCiytZCv0goqN1hbzbK2GonLHdGc3NpLgr-gwnr0dQnT5IQGZYcR0cMXzzihfIqA18wT8eM0apycVsok3h4Uz1PJzWgaqIHSCs-5CYmWaL7RYfIqea-G2JmFYpiPg5GupFTDbMYS2B1evUMoWNq272IbTO1t13t73Cgz5MaBdy0ep3x-NngsJxYE6hJ8X6pfu-W4yWGLSHyO1owHyny1OVdIXZmY5dPYV7Au94qI-eVayyfgkmUO4dZazHAPus5FUjc7DgJgb250YneVj4VSj_pVOe7rW2kVqC0s5Hupsi-UDbnAbj8pk4dX4UNlC1gX4hHpZnMY8CzcP91uSNHNWrt9v4UYVLa0cgm4S6fPDTlZxD4A7GZolinvwOQ3QWBoVc4_88xmZ2ubxCnszkPJtGjpWnGeY8Pyc__xviT7VpBqDtQkc1q3i_L4I_RB7tcu711K0Ffn_tHAnEMp5mRfuu7OOChkpSo__GLxUw-KjhWCXL6Rue37nbtmr6V-rubLrAy82KV6gTCKH5BTBNggqK1i6qRkUwRdoeHxKT9XYP0Cc2hP-ADpFqjX9z-x8jNDuQIxxtKnFwVo8757Wy86xXbSRvz7uciEGEzDji4MtNtmYe1bPk7Cw4t2VXlS5Ke4O0Gx-M3m8o6uy5XF8bpkTGknnQhOzwfsDG_9Z7RnFEfRlHNpcCiZVqKtoiFBVsyzXdk9xVVDNlILE7GMvzwAunEed_DOdXloqKMwHAGk6rI3ZB3TNsNg0YGcCWQ67y_gXdoWnzHJ4uhzYJjLMSRz5Ur2w8YJ_o3dg0II08CDiRzlId6nKrc9MipbSkYJMi1OBRXQ7aU9TYbznPgvHaz1rAZCQyHSlc7N9Yci8LSj5HF33EaZ5arpWA6D9oqXS_w6vkbtSenkGbfkPUC62XFWV5o14fJbgvamM5ikezItxU7hOP4d1WuEuC6Y-Q-jv7QaMPCt7K1hwgfBzfS7nMbLd_MPO-Z68Q6JAIm9jFS4sACnBot8W2Tq152VREDbDlXPQvLZTs3n3c1IIGGl8WRaoIO-Guw7NNf7UqPCWZxJoxkA_yHQodFMC543O9JCZrqMxWTz2NstvM11CVWisl6AJqOFWhg';

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
