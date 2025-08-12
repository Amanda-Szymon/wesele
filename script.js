const ACCESS_TOKEN = 'sl.u.AF6PhtouX7ikLJeZ07C343fi7SvXNSaXAK_XhwI_oPNZgI0_WT3XVSmt9JPVHPmpqyo2viaua9xTmjhl5xH1tBflgUerofvQ-8SmZUySgyP2frchI8ZApLAj-9i0TTqu5PjCFlQP-BAzFdo_-F50hyxjlkRW4xMUVHL0DPxmVcVL4UJbUbyI7XL15GVwJFmaVgRaHcIzGikFMsdhruhW6oJfW-5HsfK9CuqNgtZEKlCT-eO1BMEj9UxZPBNrfO_Hf-SKjqKzk0izz56PT_r734lXKos-BafdXtUnxbjqCPgXgF6PzznDDuqDzvlGXxB9fNVjIPhQPYKVibiyyD4MLTNUB8O3Mc8ywC1RhKvXej4A9kyzUnWIBntLfCqNFYVFodwZLarNzuAZVEcH9uomG_Z0tTUEoRkjoQ3PEQkqNi14fv49JNG7g7f_ckhMxyH2RQ-Xb7n320Jk5snFgIH6Z_utvP44rNQ-k72q4WvI3WUkFUeG5RcoxRfvCZxEfngva__JPJeX170YHLmiJlRwNh6_ysFD1AXQNBPSnYoOuKZPxY7HrvK0x3C3miWC8pqSZ8RSNC9yC2yvB8M-Gu5Yop6NPn7C-8oWE1xqxzRmYGvuv3bYhpGjOlhCrahN_eacDvy3ojUAw2rHIvW1HbkPeIORTZavsi8gSgwqLK_S_FDoufz0xRKseBCNI5KyJcjX-DvHhBZpn8e7_P3DsSFO9Iy3s4UoNRcWizrOGe4n2zmP0YxW1E9EvsfVNKtPnUcbbe1qXfn7OTGPlCAyDWYDOMUGm5idsu891YZ0VLRRQto8dLqDpvuBOofVF7Rn381z3GWjIEnGXLYRgXLZUBMM6ss3KoW4Vo-5-AoSgxt0tMCPH-lwe26cxZLZoErWtrTwY6ZbSS7wwvEh5ArPc_1PyuZS30c3CGwZrpsaLfSvALIfU-t4CBlNBTOqosP2norBXJIJanyFL5gIkAX_KeqYqj0OxpMpVdX18xxsM3Ypq9jD2tMhs-WmCN6W8QeZfMgc27UZ1WyMpoJGgZSuZDAZbZY06wXx1I1fckPbR98B7oCedKGqQJwBahOze3uCYaVGKefSp3q0U8nU2FvZToI4XglqCp1dYVhaUWILg-5X9Vh-CStRc4S2rkxSugqrlUdwJ2bVDnlPZxons6kqJeLvHNnaEcg8XaxRT8Od31UIPbLUSEwUcAmblDL3NAOESA4oXdClWx1VJIN2gNTT2F3TSD-lCj6JSavJqJN8lzu-X2tUSzAntVFHiySe-wHwyxX_-E-OuFTEUka7HxlAE-mZCQNTonmTZ1iQ7sZ6vMoI2v8eydFaLGQLknJ5sQXwINAnQBouW0qYW4K3tOJJRYYakyNoenT5P9UGxTOlFFPlBEEPSm59jf6IvIACx1OphXr6Po39Xo9eU1TJtbVlU9TyXfaOO26tlxbJ3l7JXdN6Ate6qZnt6oi2Z3NaQALx2kKmdlQ';

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
