const ACCESS_TOKEN = 'sl.u.AF5LBumkl5u6yviDqksNGWNW1TB_HtKC5qRMYD32oMrRZcgnYzxkQapqplqVr9PPfjAPCLzZOOKaP-w1Ian-oTYd5LvB7G5H9UD-I8qXlnQYT3acAZlgKugrE_P0Kgaxg25AsrkX5VOWFrq-IWjNErAW8qMSFflT_wmmYsfkBmVU_qRJaiL781U7z7qmzvvcSTF-eEYeWwDjObBP4LKEXHfjfg4yapF1rCba8Htvoeq_5TsVCE8yLyEl7mjfwdeWwW03IA0TXfb_FaD06zZf10m8swlFZWRTolmDBnUhD1nqJGG2tj_LfOdfN0KFE38xzW9yJIRYyDKTqCKV8gm_ismERnZAFjAP5o_FMHs-3KeZZLnQq6G32TclYcyV4bQoY-EVFbVAAq5Mp6WtC0Sudni4N0pn9qmkFuajQuq-cIQ7QjR-cVdwJQnqMemaKBTe_sUutQQfPaOh8FEYXdd-c1IpByDINMTB9tMmI-To2TZfXzGWZ52-UzFuMvw6ym2Ohhf72NF7AM0-IyPDDa6BYvaKhshejJL2-X8o9GzxdCvsaJHM69zGVCEGbt54S-lWwzqVS3maodlGTy7HnSCDedGq5J9cvVZuJM5Ag9DTlwyC1TBL8f1HusvOzA_dEk2rNlVqghuW1FRpRAjaNaO9ORD1VK1rCro9QqdyY6wYpywbrjSfCc8dwgaha-_rVRZvvIr6muAhcGTuIuXAyN_DWBhZQVRHPJaoaQdcq6Qjrq-H1o5qRrwP6KJcCBi5_RTTINhTMeByE2hJ9hW4hTO7ekwE5W41Ro6ueQRMlzR3pcUtZptCgxh60Qzdn8A0QZMzKisrePjMY9OfpyMC27yETjA1OK_cjsC9qhphMUS4hAQ3aB9rbHieLEqtq6ays2o33Y9o8GnRp5DMSZjZLywjv4R2wy_8SuoNChzruJdn_KNMQGfIq5deoPI-ttWaAqSX7UANyGAeDz8RcdD21W28jnbu_uO24XGI1NYy1pVJxawagd7UMpDB2-4yqRwQWftjkSOx-trXZt2CIgQCXixWt-oOQAx6iu6fXjz0fGvdJJA2HqJoAtFQZPotQYW-i89KG-XR0Bv2KScB1vCkhfsRIbNgfPzKhc0pk9xsqI0CITCMxb9kmJ3v5Q3U_3it9uMLMknTwtxFD2d10t-6stIRTdyQKmBqoOApwbkSsBslC7wh_CyCqEp-CJ754d1jE18lsypeE3qoHl2Bxdamsi0oUE6fcMerRmb0cp5gdg_oek-BCtDA6Dl-JUGu-1CnBhIIPi3p3VSwCXpPufB1AmKgp7HZrfGd3fXLNHk6vo1SFX9YMzCn4bMbO-BoRB4JwRS-GhaioNP9G2NND6pJnMko5mTUf_AwbqNWMuxk31Fg7n3FIRpYHZpNHzTSojuQyoMaL8o1UEVN6lYbwaYt1HmfeP3AzgfjiIHERiXrbRxRalC3Y-pU5tlW5Hx_CvU6Tw_axpY';

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
