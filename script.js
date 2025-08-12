const ACCESS_TOKEN = 'sl.u.AF4CinWsHjbuRcFtuApVgSfovqUTpylD9bvt98hhuJvA8IgsEjKj4CYfHKFRVzoVoeqFOkMuoYjWZdqfWMXnqpiKh-bCscC2FVhWNtntrPIpXDqUY4LiJN2mteqpqCmiiZwGs66bTecEcdr0aW0LVFKRQznFmKx9yXToaf_xPkENZ1yYOhZ8gcMRcuNzo0Y_pshyfkssLL3txmxO3h-9BUGluxV-BdGlRVOgJuLPSYc7_zX-4lH32_3DElRKitzU97WjWJ_QUtjjmhIm92D0M2dVe8vtKX49q-qk6GVnYVYcAuBY8mxsCpsIWG4rYYm3ahXFiKA9c_u223XDNDBa1EPFJ04B_NIu_oT31wJlu_8o1IQwLMFslws1-xpZuCvTDlye3n8dvfYmVVk6DvUyL356Ct0iOHRrvlwa9fCc6BoDKEyvTPzZTSwAYlBoPnqfHCBpIhsVpSE608bw0Nvb7FvTvsS9gcAhUpX27h_AJOCILJOkNs7hFKZF0bPs0UhflXR7_nm44p4_jU3wnRsLW06wrpY8PuTi-Q6YEFKaZqOUm_rkOG1Wh-iWL7FxM1Z0krfFwxSBX_JYef9FAPIf02Q9XeTt8GhkXRsBIYjAZxZAiuFDzF5VFfkhq3DmXNYPxk7wSEUpqUQ4WwfvFBC0tkrzpYXX5D7gcq9ZUep89KmgQZqLLDekpWSMDFr88r-r-tYCnaiuv7tlvcs5EUfB4IXZA6LLnFr38JjqBLa17jQTD0Wexn25lp-EvtnM_8cHuYIr45MlWmOQSYRepn3B_DqC4AkWKiaAeucZBRPKdmVMK5qm8il4HEwc96D7MV5yXsvJ7iwoFPM3WhkuaUJaCthUR2Cg926LXggxKzwvMJWD6L0aPNIi47oqB6J2cisbrRtDdAtyGErIbaw1IQoLrMu3TOhxAM0NIpsZFNLh6r6HJol-0wKldkv-RbQhDWJ61UCHaoT5z_xvcuQn7NWRTYHGYFBfQqlBnU3y4hsLpRDqwauiB7uPSIzs-N5xWbvmpANyEF-Akf-mSu479Xxu6IXA_kR2cpvdosnWLKZzy5BuYxLZ-y7dFDsgp-n6lgqhaC9l6L8EZMwsD8_9RGB0xUeQdsqwxez96IKOgksLpVfBCnD4k8FxY78T-Igv4zWjelF_GWVMSNKozVjhDtiuMTIUZtNC-OODbL5rCDMBhgPUTG_qI3i5Z_SJ4X7zhK4tRtrR0lemOL6Z5Lm8NR26SZoejQ-trurLMFNP0mXOkT2vdQR6nL0iB_bAMj2BkyUBYW4NFrD-jtwiLoKGe9UUntL4tRTAgB2GY_-xJhQX9bfHkSL1luyWQRNfxOImsZ26McvCBG8MIa_Vv7ICXzjFDyi8ggZCjRV4kvO1ASxWaJJZI5phdVP_REBMuFDkOCTd1jK22pUBR5HiqitHD2poJ557z3cS2q203kRJYOmLrYLI6O1r9rT_yeM7_MXmtzcOcOc';

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
