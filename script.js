const ACCESS_TOKEN = 'sl.u.AF_Y5AsNOamjcPYLTm0aWvlD-C0T6uDJ6B_fOD6dq-UFS_e7_97yeXdgafOBP404sPo91NzHuYBFlSywfXyZ9P85gXkx4czV3dO8my4wMuV-eF1TyVT8avj13GJk17kPy407QKuHqQ0E9ddMPyY59wSd2dDMSbVZhAQXNmQ7TogPsqMS9Pt557p-J54IBSg5QZfMUy0tWygBWYk8pE4lT25xbvG51b2LQx_dwZ1FBvr6nT_J2ScrEC_aIq4TeaI2qonjGJLNoOe3C2ve8p49-KshNKbm2IBT1L3seu2ZgJQJWtgCmn0I3JKC4wp8TgDO_Vu--qnN-8PP7Q1LduJO_BMiwHWhLpXD-K3qMy5C2JwwByLhKQ_jrIOfGj35ySJAMdvGqs2wBBWuWECxbc74EF5qXuAqLqWDpmQDaiVvP2h0Ru3HbfgCXa9Q9ZXHunPbcbRj4j4VNCPo_s7Y_GdBJrkDMB-9QRnd-P7feSTyGbhI_oXP-CbpK4QXFVz9Y3D8nG99E8FaKt2lQ9SR7XwslMud7KjTTwNCdtPuN3JEIPWqO-1__bPWMLBBOuN0fmfSDmwEnOxC51NvG1mLHR-FzT6ZbsGnx-ZQPezihUYv5Y_GfGjTDT6tSJATX3BbCTiu6OVjoYEJA834gWAqCcRcVZaFZOq7fwnl6CNNEBoHPwnm-3ciKeMrzlc8PU98ubCiAqy0JEneMeU7Dbp6XvsKGCBnU8hkLWjQj-wfKNYEmT-J1WBlxXlpVBKY87sVLt0PYb5_7moBNS93xrwnF90oUzgVZYII1_RvJnjUyya57uzLUpAq0JP3ZPwZwRVms6cBB_e9jE_KDWXVImxPREsE0VUwDO7kw83g77IENafZoILu-dFmoZXiyNovKBhf0DqAgZV4xK5VBv52YJ-qrnVR1DFbIseSUv0c-MXS7V2ExzM4FgKxWBLVLKGcDXBQzGBPAaiBH_bDz-JpmxVM7NR_jzSixhr2_zq0gGx9cOhnUgmewvaxyX2SsWS7pnKLgIx81C380AtIT5u4kd7_Jorw0z81qwQmaqdUx5oPj7QJpqmey54hr-GwLxyDMWJG5sn1o0-yCPUJX44c9RVIkdbQox367wLLJ9UP7Vf_7r9xCHkAU_9HO8byOgWT3BDzu7zpc42EM1bIatmryk7wwAzmU_L5jpMbW1gG_NI_EwXhYPxL2xoCiFDhdGNnjCZFe5NbQOPNH3dvGdRvtXOWWwQabME6ONmQ1O-gGJV6d2ocNCvINPX8xlGqNmn0-WHQJLltdmbFoaPdUV5YFU74orw3v5jehlvDJF3JClQ3WiJBYP79mzF7JO5npKstThYZPcHzUE8eEbfoX0ix_erm4a2ZfaoQ7Boi-xsFF4-EeaRWJ8Ojc_L_SvY82QBpRSJ-Eecnf0rx6KVxEO_ehkTa4-24jW9QffN9v2sHvPbwR0BSRufSJQ';

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
