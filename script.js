const ACCESS_TOKEN = 'sl.u.AF5HYF74tqyZUZ1LawXBMBVA6gLNsgQ7FkaZCBlUvCGQTDxONcHDA7asm4QqGLb9dny0wLuxPZzJ9bqibYwBB204yFWzEjeNMZbG_w9Gbp50DP-tXKsv3e1hQc8z9JBsr_cANJKUETymL8atEPuR2L9DrYAEPObQK5cwAFNK2QR0mu_btV5reKFQHXpI4Q_vFLaV5jh0pqIURXiFGB8Va3F3syfpx1ISuhkICjijXLThZO03UzYhv-6x46SNWtQFvEvSHx3mrMn6D0BkpKhN440LBy_Q-ns20bjv3z2ZeB1hhSF51DwAF_j5YAyueEukBVYWvpgGGyl-CTDaPYC7jT8z_UoM2CmPoxveIOC7DS3eaPrTJAz69gGxRfmbbbvPL9wzfJ-Zfa5Kdef5KuuWTjXPw82FMKukE401P_xaDjAK8z0Ilphhz6atzLjXjZaZJW3v3rIu9XkhCretLIKFRL39cpgwnYb4C8p9FbpQE9PMP820V3M3cHbq05TjZ7dEZ1xafUDUBDl6_aE5CXwYhlIqo5i6aCUYhYTNO-_vU3GICZRdLfCxmPnTeoArVCgIr_yTEvyyFvEoUWn0xNUJvPOgn-GZkFUSiNEe9g7F0hs9kOzqo8rDJIY9XIUigzWXaNRaBr7q57dB7oBRakoqVFQbEq8iqufwAFNklx6mkGZrGDfMDgKPLOWe9IEIjAUfDjCubpZ5-tyWJfButaco8E_3O1-KYSnpNpNk5JngoeqOHDjRD6o4yctz7gt4FWO99kxyYyBr_1E2eAe9hcstFqnV2gntjYacrPE0AFxI68xL1ekz_gvU_1UsyLa0kn9bVd0jWLcAlLwYL5zgxbyjXc6SQPKogc98uHjHvuMgnwJkfvCEIfor2SnW8ztFgCHTxnd8nHDKwuDtm16p7m69Zza7DWHlZPNNcu3gaORpFOGBDdR1NxjH5qEsG5L7n9gXlEFTfTOFCBU4sXC8Jeyguu8sfrp8O9tACfg9Rb6TXJBnEVO2rdD2kq4bxq0uHvzIrHiL_QNwb-7btMuWz1OkdMSxCEf0Ht_4O--YfGrvgOvJKu_DIarDnMn6SV7EC-CeGJVuvs4RY7BbRO9EpW8dlVS88kc3BuD_4XYbq7j901dQ27PAF3aINje3u4Bq_NT_KW54M-ro_uaGe2KJ7VQSG6ng-AbunIt1BT0I57O5xSkRL7D6uuXk2V60Zl63X2hmduGyMvwDMyhMIdbNCiMKf6OfjVrreMzBt8vq9CblTgQxwe_i_yyd6P5hWMQiP2pj4RsPExm9_psiFzZTh7RSwOjzHwbPuVUusdf0RHFUJ1ky3vjwExUrCfEf5FrtmdcPSsd8zOPc-sIrnoCysvI_1I_R8a2kkLo5sWsMiwHPE9en9KbUIIpAFLWjJU0rqmsyO5SYXiIQUMVAUTPO69hwJUEU7uQp-CqTeUpoiE5ekLkSpbphSn3pNnkIJ8tBuFerFCA';

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
