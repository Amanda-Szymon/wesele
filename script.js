const ACCESS_TOKEN = 'sl.u.AF0WID0a5FBzaWniH2lnEEVjDl3u-FkB4ghGLHkYq50BMZKdH3cwFgtSgnm-cjsrB_uH3lFkdgk3BtbrWB5mELrmly9MbK2PDXgYka14M9fW7J8xskQ2RLtCFWGcPLmqnN0IeE8RDc8MV4Jc3vhqejuGV11s7-Xe4R9rDIDQtazlyLhK2ct-MF235VslqhBwC5nXeKwieYVh0DOEi6oM60RftsouXysJ0GR85rwvNu3VyPMDRMZgOeJtPuyslmXCNEBHD3v6tNUT04-IWKTu8rd_UIO8rjq8T8O5dKgIArlItaWkld3xp_Slkn1ruLrykeq38hNRBkoYDGlJ03JOa4abaI8fL47ko-NqvefjM79P30mpOdRKEvLskF9vQ_erOEvyPqV2ktDmPfFxdTU4Cp3c_QZGqJRDehQ6cKev2wo0ujf0q4Z-pij85W8t6foi96dYO4VFuXFrcZGCkkmNdG3VoJG_EFug5G-cupRVbRbJCZYxde7c6CpJngIUb6isBDvQ18zGZPeYOwdORHIv7h7CwO85m3fiKxir2tlgRARrojUEph29wOe5pHhkwWLg2RBGk9P3MBRFDRoWPn76eHuw9mWLi1_NPB9xnMxuu3oEmKr_jDOu4KbJg91EwRvk1UdChGdZ_e-eZGGyYnughgJsPUoxMizEl48kPeRNRCl4bDwifJRoFs0_yGleaMP4sH5WB31ecjQEtWHIT0uLDs9TFDPlXS_dFeaRgmzsDkMPOYD8KtPrYXU5Hvxcuv9wRqtKPHt03w8FpjHMy4Lj-w_ijsR21PjnlBHzElIbFx0-sM7mLWhPCY-dT09-pSBcRZ2Gaxp4OsPeGK0CRBXiKUAV7JXiRrlc354CJr6noINO31FAhSXk0brSHrPEx8rx6UcmDorkpmIAnTNYUaLK6KjsKk8PXkHSuuISgv2oBXWo-LzFu3uNsF6i0gARggRUaopKlxyPLOki6fsLIUSY1IDEVJ46mHG5wa_k3D2k562bSzFN6qev2mUwaLvBlrsf3IaItJHF8zKOu_cX3-VCDrKqhk4GzhCUiagvOmYuSOtwc9bjNhTdOkx7jHwmaV_o71KHbl74t86Cy3fnveNjgn8fgysqhfZcCG0wmVtMHA4TzA2Xgxpg3BCev-yc-d_1f7-2CQAZI0DvtBxIIusL4vFZgB-QYCC6WQh9gL2VpaAu8z-jP6cTNOuiv-66MFg2LXZpBBr4nWPLXY0BM5Cly4xDYZjDjtsTDag5QmViVxhABOhnaZuO3aPxB4rDNGTaP26i50GAbxwPGSwFPjXImhnd7Rku1n9vpTNMfLeZt5nmNDCPP7-ACWFsllV0WE4hs5r50f1NFrICrMRz8HjiwBXiTDT0w9Ia3yTBRCrLPj9E3gNSRDlHJNp-zT5dnZk63VCYtULw2vL6I8yKjw37JgMyNPz3nTSQbjX80M61WsQHkg';
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
