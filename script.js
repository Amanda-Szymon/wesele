const ACCESS_TOKEN = 'sl.u.AF4Q0p3z5Mk4FSolCr2RTfIp3_Ply2BvOv89BXdjC5az8G7SVdwHFivxtxjfRjztxdL9BOqzwDt-h2pwAMIWHJul4ZKb7zS_oFuY5NpyuwpG3sXVWCNbrDUUNy7hliN_V2OPiML4C9rQaxiH4-wrRoy71-gDR3b-apvclXJGjZ4iLulGyOrfPw7G9nUFzZR-LMohM1s6m5gGKAH0NpkQW2CLOTM4Vn5WZNkvDeHM6AvAS4B5yt_qpUJ3-3gp0yBbwAEuaqndyqWCqcC8Lu0s1CP9dpj4d0d7rej29Xpioc9SGEgQibGLuYUq-qaE5NLrGKFxLVHZmYbuivpQ-jbTHKV1046yerXL_qsGIxgAQ3FlsM6Y3xEbDoDcYY48pY5l6dw6UiCShxZN1jz73qfKPhedJQP_dtf6zGmDNKx4GJvy60cMQ9EAZx4CgVxcRmvHQv6zUIkdHN_jSjlzsONF0EVy3z1L1kFzQOd0I3hQqQ17Hr-mn2g0nIsnVdM7rTb3SoDg9SXYTbJ_QbIHcmnIfkblCKl-21ouDsPBIC-9-a_q_N2MiaUUtnemOh2EA74bU1scLcRBumakpu1OEhnwpXIIgbibLk6bCHT5tQDv6aLc-79UWsyc1SzSw24-P2urGNiWI0dJgvYaUEWHTfYZGdZ188WpUY4MLW4Cvy33jAf886C-12uP4Y9lCMfDAxmtyoOuNo8TJCDSY010TwgEeLcIvLOjjaO0FRnQ7sfnbu5kPgax0DgtDuVW-gdI_tPR6jX8ZjZ4eisTRAIpk_TSRQUPuTiz5b2OGvRbQyGSmNHCaylw0Qn6i5-upkbfSPLzI-juTt37WDQA8Au2C9JPu8mpYGBHKe-_oq-Tg6iIp-hJ543kiPQGum8lfyt2JMj9TItUMQYrCVd9d7UGw5Z86QzNVoBZyVFmfgYhh013VPgw58RLwzkwAj_Dcke9xPYK66gXznH1xMClvIvtBgEacvXipYODcmiqbhvngenttofG9MKolZixW8aiI4sfGp0aYscVZYgOodpW_tlTaTN-0MOZb4NEt4IyMkKOK0muqjTI3n8AOLspL029BMD0LvpWiIS57F_TXm89OmxxiM3IvqGxEYtSo7Z55lbJuSnaOEGZPMGbg1MwIjR4fRsX37E1788WE8tcJbnpmpk-kCC2m6q3RL1v6q8DjkNQ0VtWtvQOi92EG4ljEv6APPkjP01PChXbUueqWZwYB4_wS3ByDo2rbGbCwR0NUw8cq02gOF8_JtNa3UEVhAVXXwlEWFX3a2KYpULghphgtxDrlIKUJvBktP57ji3FO9WnQZBX30T_cdehdU_95eKBi4v8KBuRQuyqi5GV3yTR_BWVnL8hOOzw8BHN_oJMcJX6dD_9JaX1MxvBXS33PaYHGgReAhpCiF2Zxz0p4A52bL-S8ke7lmJNtyYLp4ZANjKlJq7ZU4MQpsKD64AoPDCmuryOunRPtHs';

const FOLDER_PATH = "/Pamiątka";

let cursors = [];
let allFiles = [];
const FILE_LIMIT = 50;
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
