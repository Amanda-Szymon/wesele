const ACCESS_TOKEN = 'sl.u.AF7rKsJgCur8OGx3Of3HOgTYsMR4AdLh7pO2W5FRp98tWYoV2djBDUT4cfYm6whzfwG2wbcHvaTgt2KmQKUKjYzncQn1aWqHA1rCBpFs1UDgJunHpiInrzaD1i-6urvNLxKH-5XYhvCf1IesK_wY7jtVnpTfPnwyNcLQWxjv5UofS_p2i4k3lIzD0e0YNur5WaiATOibk-krCLlFEzO929wSDqFlh1GkEfrptkyTjpLmWtwTknCuRGt-CrSWuloKPMICteK_ZhYVumogJmVpewe_ULfJdEkwsKWNf3szyN6CkhepYeNl3wR5A4F161kMKwNP1NWqFm5vmFDY86i3ShtKHXQqDehNhgOAiEqgwbYRhBTkUK9MLsVGp7vCttnGKUu3NHAJFmsaBe6UM03JB84_f7uCA9VnLWvFsM90-EvV_RVHdvvxKmoTox9tAh6whJR2CczUCCMCDmuwGKR598-V6SLS81MMQtrUtwd8UYa1h2Sn1ETyAWN7cJFWsk4a7YXUc3XXt2GUblvGNKh6Tp4myJhzUwnMrkhiIznDKMTQ-QI-Y19YaoITzBKLWvlRRXRy2-hCxC2oB_P1cxDM8va-fUsJhbak4Cg4CCjfDfWEuujwipq5G7TVs5Omcnb_07T8DxqY0easBOuj__ozsFFHq-mAktUzXWCOetJSkyNS1lIQkQOec0XN7pg2AL7rNSj1SQmRyZMENE5ytqr6RZVIG0WoBLtR2aeMRmL0Fv5g8DSE3_ENHzbYq7FKZZS5p7IEcZIoDgkH_NSJBi53EHX8voQ3Pux1JzikP5L18bkWvm6QGhk3vsafJ_JH6N2_DRXbclnYCT4S0dzcR4H_ZONJj4y5KG6DPh75uIHKYcAsig8T7Zem1oVLeVCQzmMupHufNOgaERQjIrSqMeBZNNonzwpb5i5jnzRolsvzPaWR8NiLsHJnJ9f936cr_i7NkmRuDCJn-dhlenoVwbC7XpT89B6pLMTwtBFYs3S4xIzd7JuTLTgIrj3LkXOZAgF_xZ55tJ3ujeCTZ_UDMZn2blAZ5ziV2U-x26P-4v74UTeVhkIT7TGxMmJltR1ljZ7oIZ_JCjKlava--fBsCGROp_mvz1idyAerEBATGQEzIbNjZR2AJDgumRN3rE0eyHF8JMzz4kD2rpECyi18jJXYGGvBtc4N_YaTEoMUmKCSC9BtPfAHEmEczintBtaPStKnQ7rR5e3zGhrT5WrL6sEXUbi5Dv3-n3t6C8oKkq8CvizTnIhXmqIMs3F3Dsh0bkall_nu_NfjMTksY27BK_WeUl0ZaxwrkgSWW-t-5GRXtk2MEG9KKjX0CoXrWYyA9YxEJmZb9VLtwtj4pJzN9SaWQG1Rbs2yxl3prZtKOsLqUC9kCh0VAmmfRJDrfyoyl6eILVf86zTzIyrdBOjKpfVxiH-QeJX6tOjAytFTlZbE23OmtnO-gTdUB5O_xkwBlJ6ulKo';

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
