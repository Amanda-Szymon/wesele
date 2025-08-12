const ACCESS_TOKEN = 'sl.u.AF4aOZ92JnXt1-CwPc8TLvNppoLMapOKLP3vzdpYwg87LMGonQHjwX5RxGbRRKGbzSB-toSl9YS2nlpwFDnr2lDMHSwNoPuKMdRJqi9Tyarv-NiUDzN0D62-QZpd-TB4fEAIHmUaxnTC1sio4erZkGqy8q0rASp_jLUwvDvrfmxK4RT6yXZMcVKR20jf4sVnsWeY4hbXyYceJkMXuwBk0Yo3OI3nazZl5xQ149AHjBdmOcIvtAsoVZfrDyfWdQiHPN9R2FWJh9IhgvWVGDxHrpCzgfbsFrFEwf4jfyyJZKY9IOeM8mb6FQfpVN2bwYxct1PJs46qv2hKtvntknP0OXNbY2IJl7aaHGh0ES4u2ugKIzTgmjmz3IlEAk7kcef36gijh9jP1wduDq2mFFkZRZe6IY6eLWMvYkCg2nXN9iNAv3bmicMd25VXIbiIJTnudh3zfcaYTw3zEEwkc88ZZc0HLD3qhhwPZD28uPTYdFor1nTRPU6optVFjd2WVsWr-4TV3Q2xvuLhf400hIOR06nPJG-ZA5gjaKoXE7SfsFZ6mu5E6PucqbAkl4B58RHv5Llda9VbItnYeW69QIb9bVK8vS1PvgMJAwUxh7xaZDxVQsWmEu-b3s4iAJKgDcj-7DQaBymyQ6YQo2-VM2QDgoINRNYv7o8TK80uqFK71YUECVn7VV8IvJ4rHPd4p_Dj0G1Bs-mbiGwLxXuQTyBycCFM8hVVCkm6D7NJmvZGxCPed-ag9_D3jiO5WHz7u6rUgnPRCDMJpwdIHf7g4_siL6JnKhi1uuLoSEZoB01bZjXNqONdrXoAzqd0G_Cyi28PLucDSYUskykowEWIOGIJwvy9dHAhFgX5l9uXNCFgXDIqX65ZUp-s3_zXuB29eCH8nRokmIyRLT_fbcMxS5heOOf3UTKMDbrBeKUDKi88VYnbGv69b5xZsLCHcQ_iCt5KnN5VEa7OtNoT4mtOyjMHEIYEA1ydeptsrAym28jWa7Uq0WrlzmvCNsNaxQQedkWsZlPWPDs7ZtlNm6DG0TXgUpU3CbKVJNGHooDv8IF2HrM5mn_k9mtPDYeOZAS99bwF08Os6zTVb1iWEIZhOdKbzGzIk6XHu9KOzTaCZEujnDxrUijz3gEZXE1yzX6PEnnft9TS1XagIrhS0Efxk6DQmckRHcuBwBX4Y5BVoIjO6N1mU6inUgNPZeYBQ8RKuk-kWF-WX6odRexryYqay2lwnzo5jcMJao85zbBzyURXnFjFXhcX_osu7er5kmqbPzu6_vUZXSHbQciXBBKOQR_O7AMvLP6Yu6B7J_3CQ8bvlUW2BMwyDPb2_NmKSLytivz0uEPVcnOcz1eXZQLuuJy-hjHEm_PWDA60RwE_Xh94N79huhlZ1fZcM1EJUv2n10IrTzjIv7YuswN0UGm5hdEWPAM0ke154woOkCsybsvYRbk8w4n8LhtGoLbIkV51HJK2qmg';

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
