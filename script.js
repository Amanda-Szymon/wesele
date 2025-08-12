const ACCESS_TOKEN = 'sl.u.AF7-t3YuA0hi3_-lNrFiD6UM61GirYuMeiy8TLvqyOnRLv0aFR_iXEtkTerbgfVbQkt5r6KYsnDv7ajCZnZF5-Uxtywuv-k4UUG_cOciVgRxCZhLY-kTn9zSRRx-7NBvOkkrM6jNodjEKgRbZryuHei2Yo36YGKenzYFZ6YWPnybojMynNQrw3DSArRzlPzmldolq0a5Nx93ahU1jg_ZYFRpJ1k6D9LxzGkQNPH672ll-As-zoqkwI669vkbmOKo224d-1YXtkyS96uQJzdsHPtrp7GLolgIqcPVhhtScOK0Lv-kcRw-JG0RysP5wwpi7XY8HJPHyHEryVaa0BpjxDmSSsJ82IzaQ3is3Xy5sKM7jtVcW8K5UhwEVWdwl3c-YavDFMo3-ci6rhY7H0OzCYNJUc9PBueYBv9EjUYqo1Qq51Nit5ABy0D3hcjG85691iTs2p8qYkm_G5rVpeVu6nRgFr2OZxirj-04jfnjx3hqJkGDNEw0Y63rEtXYIkHjFEMPmpucNZpZ8jU59teCnFYyGemcc5rbfqy908llCQh96ryQAaIYiXTgEajayfzmowbM7oc17u4UxyC_Y-YavPNjw9EJZsyJKy0NkAfzn9m-RbnHl3hEqnZCJ_bLR-Zw407uwDNYJi0cFsUqtAn8eSvzVPPbIRkaZ9gzJe0vfjPhwX8hCXBImg6z53x7IHwqmaXa0YdTcZOqsUfdTaARdBHcxkMcC-MVJqdy7G1tTEpZ1rmrw5QIkr2i-QAcdm6OlpVGBpKfHxudBakLQJfIz9AFsfeVzMDkT2WEq4jceP0Vttpji8cMDIYQXmWV0NqU5ZDEdB6J1dJyPzuTTGtq89a9BeKujYLoUTrCoN2Lp1TYFr8W5jwvPQQ2ieEC9r_2XoQ657RtVJ_VYGjzJi4XQKSvhl18iVFt_2RtK_g9EfEOGY7sPo9-f2N2iXjh_WTq2zQzPj9vuRgbx0TQkv1h6I0P0zoentvZ0JHzt4lEVLHtJQ1AUo8M4Hl6lPBmx1jgMxiPXp8atgbLUGTBQPomSvJVdVjW3jlOp_McV1jdQB73nn11pEZmcaj7N0Ues5TRX9RT00fa-adieO7tGCu49IcIblPHfSXc9jtzRq4l5H3e4yQA70lC7YGRpGzhQ1SMvxCTrwbcz-ze33jJUJ2Rp9asAA9S6W8CEHATMHiZOZB3T9S-d_acU_JlN6Ma6FMPPJLDgi7ixPgylXwe5e3TRypG3aBA2SGlPTNoVKOTSHCai-FKwDOG2VcEIWHp7x_9RKL2HlQYOw7USPZURQ7fSK2eEgmXI1CdAn3jDePkuEzEEJJ46KPwwX5w6Ofncx5eD4f79Ay4fNn8jXVtatFwYv_REptTtrRboCQmCqSPwoRf_wvt2b54YlWDJ7v0ywF-OwLB8dfKAdIr-tEN3XaDJm7UNCu76vZmtLNC5g0mJ1aB5j3PQ5wrkpzDaWsI8ApvbGk';

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
