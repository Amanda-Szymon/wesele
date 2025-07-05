const ACCESS_TOKEN =
  "sl.u.AF2BDujuby0R_BQE3wu3MyVS9LVjd8zT3GV8Q-Pbmezzy0uFDjMiEMdZQSnABCHynG08xMfF1b7Ej563GCtbnMX5wDM4dTW_PKr3VzmKFwVYonSzhFTSugatyM2zYrVwDCp7I0_x5KcUiudK0ugcnk81iyxrDxAtzyTZwebzkoXr3QkPpbqlQBP3sqzNj52fuJqMg926PV3_7EuiOHykvEqa6wWZNzyk9YptR10K-nT-aR0ivtmtepuN_X1iq1uqRHETmzVSDkZdlueZtXt1ItH2iElKfynz1juRAurO6SY3qKuO-a_hCd3swGY25hB7JH_FdazzRZ88iC2mdkhBiGVWZZq9PGkwItRWrojBoRSVxZ37QUP3Auzy87OBrsnQLTy7Nwww88s0B-JQJ2-Pb6SIZkpoWfeFstyGffcCq0ZyXJo4UVILa-hXtEv350oqNllMQni8ADYdxtuz7NoJGBs7ggKxC1053VVPM6vGLlnJAx1odxWaqxt5iAY284TwEleTQi553HryNrqq2tnVbQCfxEsgFsPU5O_qw0DB7Q92aWR7eLJNSVJ70MKjghLEEoi34iyPex-g4Xcf-y9WQ0z-C7XLwLF6PQsoUFU0gohPDlTrxAbhtcJuldefEmiZwJOVuWS0asUBZqtXRlKNtxygdyRnivvyUaNGvaWe9c3MNwtEoj86i9Ce_fjCPov-o-waakaDwSFdL00m4uRze1qGGo_NHVD5YoaUdP8VnQwXHcluZe9oss-WJidZGgxAoQgpNXhg4EZ6NdotnpzMi1rKXF26mQ-VFXkK2iXzndIDaxDWUK92-upO9W9RNyoDBvM54o6813ZCxERi1aVsdwehWHGiCvwi3B0PCh_1lBBzMPs8WY3x_q1OvySWYpVBTHnwTKaTN3T51pt5M7lFnqXV2QRp8haeSOGTMJXu43LhjnR9HP9WQagc1ufHZpSVuQQNSUDqZwwbZRjGDiVMSnAb8QL5E04-ysFgi2bNYRaN7r_4MhBSIG1sHdoi1I2yYV81fwPyBAepkUKtAFRMMebNlDE-nj9qiVxHI-2iNAgIHEf84SS8_HYw9rJ2I1IYe2Rf1LrWkAr8d6_cwdDajEnDCdJ7yhvnzONTpS20DTvB9Y2CbOWUy-_BJiVDVDyM0D4U-zH2zeFG6uT1t4hBMIMLb2LRPLeFIHRJPDA5U9I6pBf2zqs3VPLsayjFKZoclAtt1lWYO5P0pfScx0H36ufBCFDdwcBR0Pn5cCvMEUY4r3gnSngYwzzAcFelsGaHQYegRi-6hW8l3ZpEL5XzRvWSW4ytLC5JcgL8L5PmxM0wXEqtgqo4SFNWdSW7rlAo6BdUPZp61DB4L3n-snhVnr04xJ4E-X8W8_Fxrw1J8ZipPo12S7iI2Z2kyzfhUjIw0xAFhnAhmvVbDfOJxxbnyNA3nAzOTwgpQP7_HVCnzqbGjg"; // Replace with your actual token
const FOLDER_PATH = "/Pamiątka";

async function loadFiles() {
  const fileListDiv = document.getElementById("file-list");
  fileListDiv.innerHTML = '<div class="text-muted">Loading...</div>';

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
        limit: 50,
      }),
    }
  );

  const listData = await listRes.json();
  const files = listData.entries.filter((e) => e[".tag"] === "file");

  if (files.length === 0) {
    fileListDiv.innerHTML = '<div class="text-warning">No files found.</div>';
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
          size: "w1024h768", // 4:3 size large enough
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
    col.className = "col-6 col-sm-4 col-md-3 col-lg-2";

    col.innerHTML = `
          <div class="thumb-container">
            <img src="${url}" alt="Thumbnail">
            <div class="thumb-number">${index + 1}</div>
          </div>
        `;

    fileListDiv.appendChild(col);
  });
}

function b64ToBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length)
      .fill(0)
      .map((_, i) => slice.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
