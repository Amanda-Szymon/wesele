const ACCESS_TOKEN = 'sl.u.AF5Cvba_HFixmMI8xHlfvqpm5NCbFWGeXIbSvNZYV3g9kWobocvlSXy02pffYI8iT_U8z8CtjIzVbMioXRYiUGF07tp4Rty4FPiCkmgE1W2iGWVPRw-Je5IthYIIDqrroKdLfbRWJvaenDQj4yEMpvnjrFfpO6w3SvQhi_MhI7Dvh30E0UcxaJH-9U0-vG85kiK3lf4ljua7rSkMNNlc9VrbJjf7AaCrlUdOt4JpqXy88kKBc4OsBedbYw_01NCGMRRdcbWAa8OiPaV_1YBgoXB00tNU1Klg2XGx7LaCHcqi2s300Oo41_X0GnSdfJgKs4aAkMLjga-IKr89_spnA7lO8rWvRbJMNOQX5zUqsxUa8S2QGVOFeYFa_VVHEfAjAtp7oBgWnZjSAe3lrwfn8od3VehSYuUx3digkbAl05scTgI4QNWY3VPR33ecxjkVhQpsJDdjen4rdUPdrY_KribeS9bL9pfulw6JLALr5fPXjSbPu58n5LkSCkjmo03KmYe2TaBTIUMqbBAH8g6yS1nD_egVh3vjt7nQnw63G-BpnTZc5NN9KCdpq7IXGXjZd4Vnt4cvDQ43c52em0RFwz6gEZbLroJsIJiAC98R-QOJUygRJkgW2ukYd5UQfFTR1PwEK_lcqYUWixgaYKsH5gXGIbKYKsS-l12VtEDhuUkKZqYqQrfCYtHRzFzkZsg404aKi6fzcrZ0yLXc0ysxPAdIdInQjKn5KEl3D1hKjo_WVuVSEqEihsvHV6alQLi65IGrxYPclY-cSucMoWeX7gfHMUl2ElCauUYHUjvo_DOIR6iouyDUgEWIdvgFiX1OmMorNG35CBpkyGnihj1qZ3a_JQ_7tG2-LUd7ZUdw7vSk9ovGLtiiORRJBu8KFDY2rwZRp2-xjUfSREoC7_-YK_nv-qLhRBi0gPuxDyK30Jsqy0STJesOCU1zMHADruC9Ld6pvY5XRnWA8WRjV_uKGtIs8p7XIjR-LuJhcVKniPLPQh0jqrFZYkmTQMV9xRu7lSzDfZ-a6wCH7XDtq6bas2y5BQ0W6BCGLR60lZ7y86lYR5MZ-pDXl6KAtL1Qtnx_zhZEs2BuF-bRtZlGD9KlPGwHfALFiN_IYFOyZ86MzK9kRfhaQfMS-J28UGbb20eTz8SB6XPm2W0EeTtLalWQU9WdbhzRDYGrJvGWvR3op6QLPpeBJoTtr5Ut_Rfes4jETMPPPx74DWfavkk4qMyoo5anh8Bg__JV6AmG9Iw4LI7Ah5X9M2URaY1AEvWu8cWvKZl8n6DUeu5H1BnVot8HYKY_aslTZxsEBjG0EBIoy-DHIWmr6l8E5P5P0ERpyg6PD2ludHYuJd4Yqomij7Tu6z3tApmcZ0QvCl7KUp9oh_BjeAdcXJiY6-R3wowcmLKAjKEQcIt-Ws1ks7YxzVlXJpiieehAMXnYAAT2Zei7uTCVh4F_HFjILo-T-KkPF3RKdwQ';

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
