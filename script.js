const ACCESS_TOKEN = 'sl.u.AF4SQI2hj0zzrYNhyhlFFiF0vvBVh3hyJ5HdlgPZC7OvIuivtVxajd1iR_jmeDY3LFgRBAdxinI-fxZUk94noUgCIK2ENd-WLu78YT9Zsr3K28semKcCmpjnayCILsnP_kkPIU3_QHTW9c_ubSl1hzKPyNaoJ_VJ6d_CT7RDgp6cm2ZLnzPat6o40JUcNAyxXygOurvGg5s1B4MvpGg21BET0aBGjAAh6EBi30G0alftWf-YoLeo75432MgeArXsB36ymULQhCIzXgMP-nlTEdy3IQmWMFUkU89bp5b6xHdmX9Y-pOgXRj7T-oGG2ZbCrIKMyLTSZAioPhPD8JqSKO4ZkORja1hcUp5YtX9dzhtMkkD74XalpLlSq74EyITjgZEGP4PxrEFOyYlfTcsebdzS1WFr21v8A4ayVURPmUV76ii-ER0aSOdYNQpEZNO9e_tf_9XGg0ZqoCiaBqxi7jF5jEQ8cVCkqgx-2mOa4jeV9SBOJEE8jGj_IpdJowJuU5YMB4ecafh7W6vfr8XwVKGLSofgxdArWHWq-XLGpr3sYE_g1HnJuHkipQar6gW1dAmwnBr8HlBnch9U1Q9z_ziuVjzdkhglMJ69Mkq4lUhjN2kCRrIOsh9UM-vl8LWSRy6EsbRppVA89Sqpa22Np6eBV-ywplJ4ZPL7FB0JZjMouIuFheX4GF8Q4-OrI6oZG_BC1_ZvXP2T15lfVpgF7PUE8usJIbzrn2B9CpwZJqwv16yLkEfmV6gGlvl2D8rZD1Dd_BJHPVeu0Mq5UlvZVF-rjlDFAImzOe5ODg8-bBRUrPuctzkW6SNNU7KKKnsK0BTD9_H77NOqqmjUUSHaEnjeAoXSs2GwLNGvkxFxWHxWwqEuWmeHS_7g3Yv-9wm_xqp6HAqqiLsHegLrq7MAYJSi0etvpVw2F2x-Ps4XAAmBTu2ivYC6oRwCSTSxFUpGX5bkPOHa3T7hEZ_7DnwXZseEjVnsNpoweUXRbKF8giIde1--ZSefrJrwbbNQEhOlcLbo4GuCd44Gmbp2md1vhTeVkOjF3pUeWUr7tfcSKnP7eDceWLk3ch28zYVZ0J3oSZfgC9n3fnZZHItXdoeZrucn2FE1ajYGKkZlvHCIqCHvx8NrofZFvUpixsTQUIl1eAkt1ZP5J6JVtM5Tb-e6FzdlB2xr9FwpxDW07PwsTzGqQeE0XrYsnBK7fr5jlrPB2Ia4shOoyRltl9FCgJ6-Wx9GlAjs00YvvgBOi6rWB5zW59uAIa8N2Kakct5wvn9fm5Wwju0BLLCcE426cpZkdMUfBmIhgYPL3E_2FaxFaLLOJAIBrlaSi9QYltUartCAMmSG-WaQ-AJ_-sKmLffOHAR7aAMY2-A9Xqqrij3M2CMYDOky-is25_QdDBRTSgllRUVQZt36nogTYUP4QL1HPmwrmaM-OCWANETyn9D3PvRyDkc1eKyanZb46PD93LKt4sY';

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
