const ACCESS_TOKEN = 'sl.u.AF950t49xVMSX2eyAZfGFGAQZT3dllsbHX2YjCsgHKBYQ4zTW_oqidS9u3sP6TgZ2LBiwuOKH0LpXF3iiBHzHodX-zd-8_JiHdZKfTDaWkdelMbHohF4uKXvP61AnG_0IESuwqIbyaiUjVRIhp_9SDLbwqxivxfecNTQccGHmc00jfWCYQ9eoTvCfW13TboDyClOTUjXD5WT83k2VJVOMhOfQE0qjPVoAsuEQE71eYu4_m7qRdDS1eIavCRLY-OvSu-kCnptSO7l8vxwyXgMJ2Yxc-KkA-K3UQ6SHAT9s47xMfJJEywVZXa3tW_liDVlCIjGjybQ17_pynq8uaU6Qvy7rcahCKCscT7xagm27K1j1aExS5CvlCLHGPTXr1wVY75AF3wQfZjn-h0l9-nDXJ_3jTOBcdDl58oTG9Ee3tAIo4srmszVPi5Kv2M2vzNrdfbXMQAZA8IdorZMaYw1KhwepHWA4agCstdgbo1hvNj_EudDd5uCc7qlyekWacGOX843koEaaNpYvskVm6d2XNgUKxowuZFyc_Q6ViTCp5CD_3KHQyfafODmA16Kdn4zHZEkMdZq2dArVqEcGY8_bM1G53Rx3chAPmiOtTU5TkFR240H-VsAhb-vSlNzcymj_YDIYKgFAWNYuvjvUpxF7olJUrxtZuquWLIyXSmpc1VQ3hJiqFWQHb_VQ0gJ0whM2vW3jOs_qTc1GeA_kgGDdMm9lHjf0lKrLMGu7t0XKf5_eh1KUSi7ddIBxQAo678h5CmL3ondW0T2Rui61ENTgDHcOfwhQL09Y5FYvnBCBCfjUETd5W1vGo5lIpmtzmy6Jgu82k8z4OuTlWiN5Nw0cmcKTQuff3IW-ufbcr65ecRPrin9iJ2NsHJZyo69pL2p-O7d1coWDbCr4ni8h_-DAtuYvVsEtiTrrNHQJHax_y4xi-tGekeQvIMa8tue9pqueYiLi71dO9rHD3j9ngFhdtMSms1kWyjAP5moMYlcCJos3K3F4neH8JyAW7822_8Rsb_fHlhSf7bmIvVYiRSjx4wH46oiUcg1U4_WUbt1p2i3klfgz0WI6OHwFFNcFZ3zHzwfyVrlpVkCAadeImJCHK4wPwELoBuJVpbozQQvQESZD8gmqZXlYe5_Hvo2C1obnMGna-8MOmrqmPrGjh0eijewa9ea1a698_yeiXu8njnL6bD7ZQ0fa9LyYSsq_YhM7dwC4ZheiwTNIuFOdleRI0tFejdUr257q_oSQ-cFrTZpL383q6E8_XGvexZH5FYuxPRnOgFAk-sr4__m4DRpiAuOJxGUyZ4JsrJGmkgWhEsaO9fIskF9cvb9Glm-j0MHdp4fFC8XOhbgzyvepEV7NOu8vWbcLm3qHYfC0JLm3VJhlkcJwvOBg1aApoz3Cscnz9655pCih7IgJfVAJVSveXaUixJZBFOKlENjC1Vco6VJkw';

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
