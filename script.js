const ACCESS_TOKEN =
  "sl.u.AF2g7z5iVuB42KegiI6AMTYWqXNMr4inldFv3zLuohOnRO-p12SCJ64oEECdW1ihmherjO9POTTAeB5epx4pJOqVaXosKjIZMmO1kpX3vsCOvKC1blV2zwtJ7YzDIJ4Cg735QCk6Vz_Bhyyd_bDuyrUSfnI4QPWmAzb8VvWVrXAudeTyKi7ar4tBKwDmN_bWrYtqQo63l15N6Z7r9tUrIf-Lk_KPQXKRtEqc725yTbMcE3XvxqELZ8vuV3oy9GQMyyKcA-PrYb--BC1MkwOKqSbRRSqNuthT3leI77VIUu_q1Q8OJ6KAnTkp5eakL_43PVDEhM4HsMeQihzZbnBzMGdAe_dHrzob8spIe8u2X2-YKJypGretKrz3dAqFy39zqRRxqg3mKl2M0FVW5DuMVjkS_XZOo6PUd3mvjp52NEOwkuT6SGAfOeM_mWqcoAO4y8-YDvExkXbkA7DCdR3Vu16HuEjtv7K1yXQyzvAjcz-proQmhRAR26pXJ0mFrq7Mq81GNsfUfi3DgI-WnmfaWKNOf4G6BNM6lYUiU-vcUA_MUgHsLLgp7lv2fror20nD-vohG31jiFGMAoGcH_5lwWaXBa2lkv9WZC2M6OrxAjpucbjIjRxzqwbXawfpIGZlNu0mFbDw8wZI9GJvtV1EMNsV8b-jWlt-U6MTwYwoPu4OOA6cMgYdfNtfPTL3mYZdR9mQPwfZjb8dN_wwK_NkUY79e1tgKrKJDn77qN6avVe-8HFtleQ05043e_lit20vOEbeY6USxiVBQwYLyPZucoD4lSLy22QE6yV6Dq1LGidEEXFODYd8q0fnDNLXTx8CkEfUlkWUbJ4K4QE7mN3bJcce0uVdeIBd5BFL4OFlRo1xW6MONv1UTTRMAMEzDUdmbszSfZMqg2AEDFFMn30WuQmMYSfH2l05BuD4X9nvO5qW8p4r-G2nJ7q9KVVLy82_SpI4JeN5wSAj7M7mvsvPfi_KYEGzhUHlFANHcxP7JtOfjwbcF3SE758LPZT97rsvffOfOPPLak4rXuZuGje-JC-prA4Eekm8fRuVJktHAAeXbdGGudUxrejZVJAVY-6XZ3K_w1C1gD7cZt_pQwQPj0__BbBz1xftpLt6Vc9Ln5xzFvB8XWjlQNzC1Z6c6wuJCvK-nj9YkTLkuR7tD7604KojaFRTPF3XVHnAcYdJKoLK-sV5Wa-O-l0yfMG6U5DuB6_Cc_puHsB8VOAIGSv26HQv2WUv6hq1mlIPkupSq9-siuhQTsCpuCHt4CkMqIpmOSGOcAu7tGgXdmW-rFvy392bsa_7UNZCKQu7Bn_CmSjQ5E3zFhxGHJwPepdMVk6jp8R26WekOf8iy6NCOJUyxY5DZIMh3pIOvPVWBDrQ6O188EVi1H_GOqACQ5KCAm8nVheR4EyQg6jeQhZwRJT3ghFfGnjPcrjGWr7W3rQGh_j0LQ";
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

    files = listData.entries.filter((e) => e[".tag"] === "file");
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

    files = listData.entries.filter((e) => e[".tag"] === "file");
    if (listData.has_more) cursors[page] = listData.cursor;
  }
  allFiles = files;

  if (files.length === 0) {
    fileListDiv.innerHTML =
      '<div class="text-warning">Nie znaleziono zdjęć.</div>';
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
