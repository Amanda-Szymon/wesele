const ACCESS_TOKEN = 'sl.u.AF7D7PR3VozmsBCxyiOzOpsTjXMx6AbNQLTLXB8j7CGEvVKabZEIaGZc3oXnGAv2H8jopOdYJHFDYGgnaQWv7JZJIcZ6_C5nOwSu0jDVF5cKzi492GVYDz03uX_hhmQMlfcRrsLpfTuKm6kVLDeBOPxic9VIJdH70sVzmuWWrFuu8WRmJlk8qBKmJE0RTqPW0GOJGm7cVRyI9YLnhK0hf6vdyPz8Doi8veY1EDmAcZjlJQwit2jhPCkDNsU0KDYMQtfWGFcOMfol_yswvsujbmejt8NdR8zmT5Lbrn-bznuQi0TV1Pu_iN_9IH8gttW04Z2sKiVeiWs9I9_d4d0pkyxghr0Ft0YwGiWPXejJN50xffwhs4V82qzKNYNxE4ovtKawlX_2uKGYZfXCswPWmisiV7iqU_zj6cTG8oXS_mnEsc39y-JWAMsXMNyrkez9mT4JFLZe8Th8Jgvy9aESeIPVKgJcArNEkPZGC7lDzs-BJbyAFNFVIL8En78wLWCcbsSqI5X1Vljea8hMjL6Ain2cNNqqAag20vPnlJfF3sP5j2KXCgr7HVU4fSnRBuQRSxE3vDvRZ2r0bttLgiD7zyqMvvEZi_NkJBGqo2EMp_ZHvmSHuM8PgjbGpwgUd7hUFyI-hPiDuIf77YHtCiOWRdU-Zxj3ohJ4YSm0TbQ8lQlhO25QLtbnnIlBS0v57dY5AC8Z87pPy2GIMzOVrMVuzfz2Spl9SGQ0VIf9O5rrbDdAhPAT8cbPEjXppH5tYai8xh6dh1b3V_ukowqPAJ5BR4VI6SqXJ_ZfbA6uJuY7ilOrQh1w__xRYYPwvzyy4-TcYAIRccYNIQtCqvpNXmS4gQeS893lsXaLmFhklDD04NLx6TJNg7hmzAFguEwPD1lpJMAxn3Q6EQzz-wRgQ9FUs2Ey3zPaYWLszFF4mBXf2WxOfh1Hq3GRd91iA3wDrVOhw-a-vNgp9_Uf1T17_MvEvmv6wBdrK9uN0HVQcV-13uiZQ40Q2b2Vxek_3eMhqmzmnn-fvC7VVicxLbfQUGgtmSwc8CPrkAjQjKwmlSPTrrhyjCgli48oHTMdgpNiORnpm3ME5CY8Vt9pe4TEifVlINzdE1-YqF1QDxuOprAagqn0WpiXFAayjD3Ge3pR_w96fEUjabylsIz4SfFVsihjrqunq9pauWc7FnpTas4LR9G0aKPyBIYAgF-SPBw21DLjpTmY9eP6MiZRLEH-lAPoh1ymnuIqmE8KH2TQ3IHrvK804dR6z1FETBktpgNXABGV-RaBLx7jzzhSOlMTTIdTDS77aJDLDAQeRYU1AvBt94OjtOVq6A7yhu7DSfgwir9DPCbZ6c4aCuhz0tvjT5fopZG3fiDZ4PxAauH0EI4UiqHZOgrc3g-QxDfqeYqAUAoXuFn7GmaveqF9MpdabUVca9Uvw-ErFjvWPt79WJRAIu1zODOBIQuagpPHZ1Yw011-dds';

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
