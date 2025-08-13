const ACCESS_TOKEN = 'sl.u.AF4C7raIEta3LhSuYAlFy3v7iEZL0Q1sogl2KKrof6_feeQeA5LQoZGOKSxuQojVjaojy-IGvoI-ChrXTfSfVsXYENiOc1KqR-fsWibyfsub9I-WnR-8xT5yhVEdASUmaS4brtyvl5WfiLhl0cnzDzGh8URZBIvuMhi7v7X-AzE4anEE8JHfr2p-H0f-bwtvNz1WxJAe-L6nukPnIoIEFUCBpxPXku5XTuWV5peQB-46XsN226Bezq2wlf3zMowqB42p-de6Pmd1xwes5af86YsW2s-lZS7x-3QJb3PMv6p9_27jC7WuyKeViQ0k0KEuLLiJki7OatlEC9lcRYAOav99PTWBYa-7jHDpzAERv9UuQGhugUTMamvxDyQSWRwCh8gu5Psxl2Vw__4yfjR4X1eJuK00baXxioBuoqVSqF5xPd3jq3x_loNFvnlsyGdlQRQxaObzdsCFMhBOJbGkN7XS1t8ot8_e3lVpPM5xqywj5XFh9K8vpfuu7QHN5y_XN5lFSLlTFWOgfWP1u3To9OVUHWiDC-CAJWLmDlmWrJo0-JYDBi34D6Ssia8VNF_agwUTvSxiVtZfMlK8HqQbojUVAh4cupFZUYSBKYs7I59oO6KtAqdRqeitCyeWOwwR1oCmMIVsvQE9ESf9kiVMdBFqyZ4vxpaYR4015gmOPZcjMXn3SFdVn7Khfi-AHWJtEbtcd6NPkOkie14wWUIeKqubMTI8S9zaaIZW7H1Go58A7VObFSv_tXLFfqe29ZI1YvzDkX4OiSxkYIgnjOxIHQHnYQDcyPKPQoEhErfPBJWpzaR9KnMxaMzPUGcCuSFmQNS2RRKDfp2iYWGUGWr7_oM13k-ZrOrfTaWhg85zuoSFCPFK2f8QFJU3JWVlxJt54n2XbK2EzetMimYy4zbZutv4vwNv26h0I-vd1jadS2s9DJnazz9l2jCnFFPikUTL9uukQJvAGs1k2HE6Ms5bkiwkO2Cl93GcBLXHuHA_lquectHCEWWLPbdfeJ3Zl0A5rP4Py4jlXpFfAp2HY2HVvlfeyCzjijkMWtKsulpWhCIKY7h9axZCn_9_2Utskbvh8nA9lfw4wru5104sO5zOyqd9p_vGmARBCQGXy0wUAdVBtQpCiEF5JODOo5k2nUFQTZ7HGEh3juQEaaIHImP8Pkv8atDJgfoCG5HWD22v1lsFRDhPmNDfMI02_itAabmBQ1Xlq-5Oamm1hHr4syZWu-bfSWsQ4qwRTediToR2LqEbeBEWGKzclUYvn8ofzjup9bhD4t1BGzSr86WVZGwlTYaS4jMcrY4jXCiyMphqYQYwrakBxLFSuP0FfI9JVyOeO6HFUA4337ECY8gXyZhEgeM91luL526nPTsNPcywWQUHbeiEgF2WDTqDWkljmwzj9pJCiOqR4d-y5uA5NgKTfTHWYD25_dp1D6ThY48m0RKPJyV9OR9UItzx0bKudaH_Yi8';

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
