const ACCESS_TOKEN = 'sl.u.AF0kWqtiNvFcub-1JsUg0Pv3tKE0XTuDRBdqUtz1PMeuEbTETWbFPpI8lnp6JeG-4awZo0l8UP15nD8sWxXI_Rg7gnCZh3gXkmCPVlGnfWS0b9YvYi-gcRdXzChQ1y_ZbZlk0HREviEoLgG8iM-xACGm1UGLmoeOmQIwcVaNUYxTsZcO_2UOp3mUjpLAwWryKu3uw1YNDZwrEVrTPx3CFYxcaRoecuxLMoq7_CliFuQcyMSzfdcyAWBj71nWRtgDX1X5igWjkS04rvHfO3eduBaBGc9jd9hD1rtqNEMa_IFS8y5IBJq29QR0D-W4WPqvw0S-u8YWAi0jBAGXeI_ZvcIm4rHGzpyXs-bDL_ujpQ77hSlLDjDlYnrL7sp_6duitXclmZZ2OImN2W1yaO2VoL-Rfxk6lc_V6qgsQfCKpjpuXu4sEKSnH6bQhSJlGcSjslfGEDfVJ5cygcENcnhiCIcPAMBsrsthXJYjxFJV59cMx9h9xj_KKFpxG9nGsv53OA7VL_EpqLDwq4OHCFtAtrnOAiQh3Euxxrd1J70fmuYXjoNpNK3ZKEmlt2cVmi3wJOTY4qjmemg2ALhHsyTL_UfSEnKuoR3NEVdUDoTh_g-bNF6EUGcTzb8DDhGUhqblFz1wWkmS3tBd6JepLWivGjXZVDT9lyuaw7r7qxlzGYC0B52s4gSLoTjQiLmBAZxGauh-b7CFiofRibSD4EYqa-xmuaqHEDTqj1ba19KwNZXv5iGcOBKzIkYeueAe88KlxMqLbbSs1a5q9-xfWzJDSzU7meSZK07IIjDSfmngbOtAjPTbW605bJznz4l1LS0hXWeoGFBjfrNU6OeAQHHpRmzP9INndmqE4pmtwkPwCyHvQffnfZ-i6sstuV4H6rpF7w7aC5ctAS_9iqSIndb9puG-ez6h1GJS40dCd9YrzCYsQ9zdkMStAs9iQSOZ3Gv5WDxpULRqS7mTylwFlg0or4T7be8JPxAScYIqA90dblvDJRm6u5SAaMwx6rpTRR86pX9iBduXgi-9xUBvTULy-33XraFkTL6ZZEopv3CQ7jGL9GxnZvzYBxj6kYzp2xTMh6DPbGynKlAAMRS39QFnsEi4CIs95xf0DNkPiwt3mG59buSBu0NgiSOKI_93mKhXd4V55x-iyTmtYoFvCA3dbOgNBhCx6se98M7oU7qXW6-sh2FdrhUD0pUspGTq7ixbklKsRkAOqcgrG07R38tlo8xLpOAKZIE0qDnwk21FeNnEccltDoy1EC7AQKQ1UKMN4XHP3JtuDYvFrWStnn_FXdiDneijZAotuYbkjETCJWzmVkIA5ISyyXZjBp-EiDQ1eZRyfCouBd-afeJmwScVIvaz_DMl22CZVHcUechsHJs10aNUznf_WV_-tvvl0dBq10V5Ws_G_Q_wj7EwzRNRk9duORn6yv8TvZDDeXaG3ae5Aw';
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
