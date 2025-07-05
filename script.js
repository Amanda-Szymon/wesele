const ACCESS_TOKEN = 'sl.u.AF3SrjmM_6A8Ji6FHioPzglcBVzJRnf-7GdUR25w97XoXBMowqCd7a-JjfS5mkdjfjoR4R29iileR2cRk1_UAtxEHL75HAIAoAkgL-PyKtQfYTrOSpOHcA0WW4b8fpYMNDK-tR1jadquPcJGiaZ6GLensw4iXz-Jk74tOZMpzsqWgWhzGWDpn4xOUAPRIlG87L78cHtx5Ob-9BL_bs3WRNC0tTNuV7QeVOB0vV7Ez7u0f5IcCCtCip17H3xuIxY0s3RH_3GIQE1I8NW0zAROIHCbv_ZD-yK66ZFs22YSi5uT30GWcY2UVZMf8szf27UxdQt1toDElkd5hdGmc3AzWgSQkj1orpJMK3CW4x582BAR6Itpx6u7RXiuwiyykJgbjGT_I_bKtMjdJfcfmDP1a_FHMZ4dmiuFmSSHJ0maPsVV59OFXjCf0VwNPVA76l4XneUfZZncyAFiCXWfg-bjhk3104clvmfMSMIe_KBIFrxjlWg4cY6PnrfjgYfbfVgIJTEFxYCaP3p9LFKaqWTyQ61RAsZPdThebXW5Rh5dZ5ukudPR_gKYoV-ClWU5J4M8dwWpSfweDzfQaWwMnewOiZWzLDrpKb1K45MVOYwbR7HrIpip2uTDI1d87331-0Xcgg0UWSgxskHrD-kgjqGRkz8f-fMOoNoVoT0gm_2Z3NMjwAzaHvVatg_JDuIOB-HEuyRmTe0h1_Rvebg9fJmfxKkYGISO00hRXSg34SRNIKpX1e-AccPq4Cbm1LkybrHHUjOOSPLtAMUqeaHSCHRm3c7Chx6ivrQVJ1rWvYmAAcH0DzIcwZt2RrKMJwuvazXf5ooKn0YoYB0V1LjqKG3c7RyrtR2ehQGFoBVdz0CqpEAkTu_dtJk-1SL5Bk3xzEX-7HjY24uzNnOYJfNxtLIF1Mc103E0uvC9Usnurv-ac1eTcraVlyLSCmvdCo1Hp7ffsJvzD1lpo7J1Xd6iWjRIvsqIa8p6DYTD1sNTI0HfAAPkSQr5CNy0EQ249CkKu3j-Oh6yI4UIhFpyRTJMwbdlr1_C5NRDcN4Cdg5yDuMENiv0o_McBVveQbCGjwomp27hI0F1BH7fBWsl26UmPdpEz6019r9Lu9PsT17yP6dWxQykPxSR6tk6Qx-aYBxgiMhpOV4szW4BSkGfIDRycOY0virYB7yb5BVbDZczfeiG9SeWqRFdkR_fX8C0kJtu-Els47QGkIRC7efacpBBbYO5wH-jW1eeS6XDUz68oBTQcHloVLhIoJjVaNCuQtIHvPJHsJe8f8TZR6c_rgar_R6DQgDzzdca-TURyelPuj5EWtcoGNLXcO3L3i-WuCk-TVaIk_vlhJA5FAjGsJX2fc8XnwzuD8-0YtrfPfQAth8sy7CVfNDoU5DU8BM0eHsUI5g3rZI2D7OW1dnb7_ciNSz3ULaeBJDB8mHsgKdZumxUUnAqNQ';
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
