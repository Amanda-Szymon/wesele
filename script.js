const ACCESS_TOKEN = 'sl.u.AF6oX53b8VCyNVwbexS6o95abN5KJlHAenRYnVXhb1VaLqnpw75u1cxGYwhgj723DOaXlh4b6ZsOQhh-a9xpf4A3QmRW9vfcJmhnAR08lEukXsyk7RcZdqwZYPlnPpHm1Z7B8v3k0XITedqIGDCWPXc7o4lIzcB13QO1d9XzqY-54zHczrQJfJtAEL-Lrs6_OUcQ9k0s9rk7X87FopE4hUPmVNkxmMPrpcWUzOFHOK8VzD5jqa2xO_dcMon3OsK8b41TiQdNyl2IGoLt56UuzO6QM2csTC81hUpHb4Wgi-9MiS7AFj8zCHL_o_dAoVCzJ2rs1XFHXMKJ91EvbMrZpEH7vC8sedd8CRYld8pnZYkWBrU-t1jqwImS-z3heD2kLAajJFke7WPbFPA7d_9Fy1QaOEKW2FnRIYXNlMS-QosSJ3MbYRX07_AqZCsJLTkM994ZPmQpcR3gJYh77DLYo2DoHY9mYZrukRZmJ-tw_1JX0x_iuD2K0h-Ic2z-OZhywtwbqgFzqVECy0z9yrA5ocxD3FWS8v9KPVsDJxxxAJck31sMXkOZ-ON1yHrL43aaQaIk0Q7bsno7Lno9yybWkYu2A4WTgRm6CGLhFaiQb1ueP3BvXp9zS0jbikBR5Buzw_aOH4spkm47oGqk9PvguN88kMugGvmoAvV7MUgVO2823vkxrKOxHykCmF-r0uhk0lup-35RaxN8EE0Rf4jiEK-gjTQEXiuKl5jFSs8Nc3lWJO73m0V2aj4G6Iug4CaBpB3ukasW0k8rG7ZGjVvSHq-r0haEiNwFtVGzFitcbbBWHd3FoWJX86jcr4YFE5OdkF8olFtpsGSmL5zU3VJ7Sg5gOSDG03XUseAo63hrcLHzXEm4IlKPSa-VD5fknEDdfSlBsDRVLBMer-SwSMPX-7ZlBdmy3gI5aCfJ17Vk1NKn4PfMVgTBpZ_d0Q5jWKUbXx_x6CN5Crqe2ctsMaCAnKO7apKQha2fiLP_0WF0D-DCxcR4iVHB-69I1TZn76UmIDvUO3aAuks7DyAnUrPw6s4F0doD3AF6eC6cG0Zd8uCtA3BwM4cwtfQwvZ4KoO15hXLJXZeDdZdUXvpgaHWWcU7R6iuvLRwsB0gODb0-f-wfD6kDVDkIlBFFw66e4Y5kUw0UvRngyKDW32HxEh5AVi3dIDDMVGHliG0ndcDaRF4DzHAJB-eDDo9aiA8G7Jq0s0rOa9SS2MWhmhsYK_n9oKpojidWw4aUmiuneGi4ELmi7ndNXrzViUMTG5m1miRsycxsWRms0LVcF_c8rRxElwid4uoEl0xJDZFp7U_jS_GHIsxjp4XqKbXy8oP-RG-6QvaYkQq8tYWWaZInGKPQNK1ExOsvvC-QlME5IgLu650mP164MuRiM7-bF-kl_8CEwWjIXIzPUjnKyB65dUwgCfi7tGMtT8oXxWWM_p7eQsaYXi7mUkZsN1Phdq0SHjD_DDQ';

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
