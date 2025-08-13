const ACCESS_TOKEN = 'sl.u.AF480MmejM05HKhkJdq_JXGHH1rC_RLRoIeoMaDf8HDyPbY2Rj33GTDFQpDoDLrjIyDzapOCJA2whUXIBFx3iRLdx0a7bnwpbVZo7nFh2eDBg904XkEI9vP4NRC67_BOg57VKa1Mbne0CgqxtQoLT8Ve5n6hScEpAyxs_dvIg_Q38u3H-6Fz5hb-Y5JJ4V7-cyY_8goxT_74TJNt0n7PgMWjAZYX531BuhI-q4MRh0ep_RIuFVxarQ-emJOBbdHc15cUQ0d4FKq9QlXL9hqp4Q6595MK8MIQ9bKcjkz46rHiOWH05ksB_tV0-pF-fYWRWUnHTi6EWtzH0ygNJDtN_2QKMWR2q-AcRJTIo25pocs5RcpcJWoVGVzvA6F8fvxyu-7-y-vr0_OKb-e_3hg-dKgRDxvHODpTpfRQlcan3wVD0pIYRVgB6106Nh74LZso6p-QHI3FTmehyp4WX4Mge3q2htgtYtoA47EAjr9Y3rZSA0SoyQmmf6whwioHiTqmI39hBmyRz8IzJdT0arfVLDuBxVibr_pkzarkOLBWbY1Nh6znZTt9PIajVoczFII0jZFxDRuuDQjSa9uX5NvbedjplQ7BpsIidkIa-Uo0yFC0xIfW_OtZQn9t5hzeGxnbN4zaN0g2_IpJXtcfPWxKZFaJGV5s0E-WeVC5f6XIwG6bnZ3f7KDWutkzRBewKIkMv0gd3FNHG8k2T9b9N0PfSvJwZKLiJBMoofS-7LQdPM7J1GQY5WoI0Ri0xDf0UYl6JTeGgNOGjna0soPrPKSnXdDGAYGy8A06gPvwzGfz_yi-zRSkKzZSUK30lQpKgvqADbCYbNqyu2vRZYQz2wp69l0ac8BxBUFiVg-OQu_RxvhXJJbt8iSe9VR_QVJKpM7Ahwe_4exPV-nl3udrbQg5ySvmjFITEczKaiuIFEovq_cJceu7lCmsrPq5mFZEnlqZ-sjRqgofEYcfywsbi-GNyVHuMPdwmTwbDMAHgjXOo4knHA2VrpHsB9DWVxx_I2PCf7WTd5NldlOOnbrzIUzD6uiUeZEFx1RVaZlP4oslasCQrBxRHH7-hT058d6MHjsVd2XN5RPvm06LgKMGvyoJ5YUoX1MaB8WydZyxC9CyxeZqmPP_lMoU0HEJVyKviso0r-B-fGFLGGCf3c3HXzI7PCfYhJFzjDkWxK0NdbK4N_a3YHclzl35eYmqkPno3pL0qsSwRhH1RA3t95hs4M3syBs6Dw8JZNO0_TVFGEszx7GwhxsvImgdCQvGLlv3T5-JZTtDvb4ROdwEDLHVXRQlG4X_R-73gQTr7EInojnwHup-BOvjztqZ82dqAIHt6siHplJiELQhk_F1rguTh2BUteY7n0wbHoGVUtccq_XM_dHpmUSSAEJ3tfeWcUsN3v8aECZoe-2xfwobSZuWShDBNsTdNKfI3hWWHBpYBTHacD4dz0n1QzQBsf1kNQOZfwAZFzI';

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
