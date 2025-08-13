const ACCESS_TOKEN = 'sl.u.AF5dfURyLTq_odQIcZ0T7oKSdGCNPqHDhYDaX-VvLvCpYKZKyWypz8c-4SfKoe6sd1rsGCscinKyeTFznaxT2euP0fXNMdWDqWTLkURap9phrBrF7GQYN23vj2_TxT9zh10_F4aYqrK09JIhR02zVNZPDpyqQUfGYBHh45xPQcc0jEMmM_V_j6-wyGCFCVONp7dF7yWY_MZyg2CQFYg3Bt_U9KbQ6Wkw039j39DPGMEzCcJzcmENEcxNiJB4gqkKtVvXjD1oRSnQnSaXJIgyrrVOtz34Lu1rE5gS8sRVBedRgJr5tai7dKhZJou2v6nhWKBSZpWqAU0LHMAPMEcxvL_A9OsxQ2EfP5DU_DotbyzjG0fE17XxniK253NnPo5uTOA5OVX1MZQeVLg0P_mktGBhGdvbdXoeM5hkJ9qGZM8ZnLniyU6gIpNOuY8gqerHUu2VKOddgzM44XoKg6uShTZf0MIkCo9Mu08elHX2PchSk3sDfQ_IK6McQ2GqOA15-AjM70FDYwG-A5Ls98nMQ4W7wmFDmIewlps_o9DhLYlVHPW4wKFhX1ggxL_nzUfd3ckyvYCbdRlwwJQd_W4ji4uV2YQNS7hrP2V7H-7tBJyAk0krLX22azNoy90N_Or8HqiYXgZzL2O6XI-hMWDUly8cCtQdvF0yJSBEXyK1yB7Zu3Tzb9RSyne_g4e6vGmueZrBea0m6jGspH-I9bGlO6-B8htmAKXXfSGZJseXQpMSIrMIw0yLYQ2YJExO7jotxG-yrMTYi4JcgKZtpLZ6CDreTbCZC5tMW1mWhF4I_skZtvrxOpk-x1z3nLp5p8rdOYwrMnUc-co-IYbqbXvnPx8j0yA-YoB_4c2QzkVtXncTVQeNQdqw97spLlfqKIZNlQp20pr-Ct157XjRR6rbo2e9M4D1r5pIgONhRQNzdPOtTsmRZt94PO3vndKNVnBhbN9Eublo7VXjMq8awRwB3xYs4bn1PXAY8T7RSY4ldI-lWoE_7GwdASiYFjGn5OXPhi8qrgxxR5OMlwqaX3A-j-jhtsb-liKftD5Bw28yStM6Ys3sgT6X-7QAIVqG84lD22IkaULRlsE_1mM-TZH1FcCjvYXqqrW4HTYDhfCO3p1sjDImO_nBx-LU3Dmr2T_GNhgZVr1BrIz9vvOCIGIlzVJiT5cHGkUZ0eFZdFGHCei2IH_waRmvM5Apdqv7ImpWAuTxapq7IoY0uhWa-3Si7KQJ81u-4jcVYEfMG0TOqur9SAsw3IjgavpXwicHElJjEMNE8OwX-Iko2YFgjSKawAjIcaaeDRTp3RdhES0XcbA-4rLT7RgMYAvCQogF3IVgLGKP59oIp29ikmSr0r5ax62s3cIs3YMeGz-3iiZrY6FiQ4lMlODJH_3GDRP6z_hrF9zq92dhqqk8Wa1agy5Rc-9jHnOY6N-6rGq15VLIjBf6xRpM2yMXQmssjJqxcJbvvE0';

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
