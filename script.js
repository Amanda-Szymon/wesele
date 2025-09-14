const ACCESS_TOKEN = 'sl.u.AF9AvkVuSOJc00XUBXqz0sowjygpBzeNfW3PIFP9vpZO-hlCIzZSC98eKL3fc-nvT9XtYdUhPCma3XRYrq90KjW6-NiEqlKIPOaqPJQ8JyrQufMYDC5RLe4kS0Ngg07K0FTuaSkdYhkTNyW0PBE-ZTBwgNo2W48XktfbkqYIgXpfQJomJtv0ZGbBLIzOX5UoqZI4SsVt4LyMGgwnLR3yUBY-e_53rr0xTC6woTJI7OdCgLQHgH8odt4HxEXhkm6jacSemenOdkczOTG1hCC99Q1mLR0m9trIrEBr0R1z5pyhVIikL4pvDPlrAK4E2kjH3oX-JWTUN1iLRUdgy508hp_arBCfanH8T16tSFN4n3KZIXnFpdprDm1tJe18gDFA8PApNfasXJnQ_cnpi5gexygPCOkqb4paa2t22ZialhS7Jxy3PjlFAqw-bV2Fl2LOM5vOccao5JZ5OXU25oGile_Dt66-w3jsf2T14ZBWFiE-7xXRUFXjWc2NQvMbp3ZFn5wNvNEfv6rWYZdwFH6sE77wjH3yjJlp7pew5ZdZOAyvmvw2ONVEU6eqRiicM33FEcoAElMWvNXliQYYDzfU_pfeBR_8iylz1b8NNFagfbr-hHQZ2Z8laT-uRT_1iIIQKOCDpDy5wJ2bVHuzLTLNw-XUFXabkpcU6dPMgJUumxJqKNNhbkwkcUfok23qZ3RPa6g99FpMMbB9vq8cBquXVGPhQ-1ukVzJaByh-1_WhCsBMPO3Hbu6ZCWQ33sYhGbD9pgY-EsIcP0CwYgN5jTPl3GXh02Mtle4t5YX1K5oH3lxXG41umIIZOeUgjmI3Kd4YnZWrTnCL3jHhA5ktQzQSTBzebINXp5zP3ILt5FCcAjfg2YzdlRC0gcBO6R11qPG0YSJqxSsuVGLF9MOHk7T7nzgrEY3tJWFh50FXa8IkmcvK_Kjhs1EhRt7BtbR4X7mihyWPIew-6lKhckWkDFPub2kuWiRWkTTj-nQrIt0LD2zthi-bj2u10ved_OhRqtVvt5oAQQViMjuDkIlGFCP9bWE8YPRO-0fJmXVx4uP-LlHkOS5BjmhqR5A7G5tNV9kId8WVT_LY83bNnVNCTEaepKWqMAIIYU5n0Cvfj-nZhGLWY99j5pdynKMkL1Lu-ZWdgMVkoHSdRBrH0KFdQCqeRz4-0TBXU0t1vAOK0CZOGloMYKx_WacymKT3OEo8Au2yV25WYoNPdYr5c74xFseX2lqdWF66R0EER2xV0gVaHRj1dmKpQ4WdH94MzLIEpuOg8J0hAvjk4i9o1b3Jo78GGEUfwMpd7AffeuclA847blE1De6x2tzBYMNiseEr8pGyqUWPfbfVCVNIwcYNAk0TU480siB30GF8eVkBEmyCxZzwNAH_7PdrTkC25jD9U0lveLXkCpDT-LXzPZxib1FJXXyanMcTRytA7a5hRvjcgd4eQ';

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
