document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
let isDevToolsOpen = false;

function checkDevTools() {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;

  if (widthThreshold || heightThreshold) {
    if (!isDevToolsOpen) {
      isDevToolsOpen = true;
      window.location.href = "error.html";
    }
  } else {
    if (isDevToolsOpen) {
      isDevToolsOpen = false;
      window.location.href = "index.html";
    }
  }
}

// Reduced interval for faster redirection
setInterval(checkDevTools, 50);

document.addEventListener("keydown", function (e) {
  // Prevent F12
  if (e.key === "F12") {
    e.preventDefault();
  }
  // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (
    e.ctrlKey &&
    e.shiftKey &&
    (e.key === "I" || e.key === "J" || e.key === "C")
  ) {
    e.preventDefault();
  }
  // Prevent Ctrl+U (view source)
  if (e.ctrlKey && e.key === "u") {
    e.preventDefault();
  }
});

const sheetID = "1SWxVgnorKFtuTL5X23OyTnBRLf3XioUwcyumn6_3r9Q";
const apiKey = "AIzaSyCyX7kN7bnJWADL3Oa2sR4S2MVLzqX98qg";
let sheetName = "Sheet1"; // default sheet
let range = `${sheetName}!A:Z`;

document.getElementById("btnSheet1").addEventListener("click", () => {
  sheetName = "Sheet1";
  range = `${sheetName}!A:Z`;
  fetchVegetableData();
});

document.getElementById("btnSheet2").addEventListener("click", () => {
  sheetName = "Sheet2";
  range = `${sheetName}!A:Z`;
  fetchVegetableData();
});

document.getElementById("btnSheet3").addEventListener("click", () => {
  sheetName = "Sheet3";
  range = `${sheetName}!A:Z`;
  fetchVegetableData();
});
const valueRenderOption = "FORMULA";
let vegetableData = [];

async function fetchVegetableData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}?key=${apiKey}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    vegetableData = data.values;
    updateTable();
  } catch (error) {
    document.getElementById("errorMessage").textContent =
      "Error loading data. Please try again later.";
    console.error("Error fetching data:", error);
  }
}

function updateTable() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortOption = document.getElementById("option").value;
  let filteredData = vegetableData.filter((row) =>
    row[0].toLowerCase().includes(searchInput)
  );

  if (sortOption === "price") {
    filteredData = filteredData.filter((row) => parseFloat(row[1]) > 0);
    filteredData.sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));
  } else if (sortOption === "stock") {
    filteredData = filteredData.filter((row) => parseFloat(row[2]) > 0);
    filteredData.sort((a, b) => parseFloat(b[2]) - parseFloat(a[2]));
  } else if (sortOption === "topSelling") {
    filteredData = filteredData.filter((row) => row[3] && row[3].includes("*"));
    filteredData.sort(
      (a, b) => b[3].split("*").length - a[3].split("*").length
    );
  }

  populateTable(filteredData);
}

function populateTable(rows) {
  // Get the container that will hold the cards; ensure the element with id "vegetableTable" exists
  const container = document.getElementById("vegetableTable");
  container.innerHTML = ""; // Clear existing content

  if (!rows || rows.length === 0) {
    container.innerHTML = "<div>No data available</div>";
    return;
  }

  rows.forEach((row) => {
    const card = document.createElement("div");
    card.className = "card"; // Styled via CSS

    // Create Image section
    const imgContainer = document.createElement("div");
    imgContainer.className = "card-img";
    if (row[4] && row[4].trim() !== "") {
      const img = document.createElement("img");
      img.src = row[4];
      img.alt = row[0];
      // If the image fails to load, display "no img"
      img.onerror = function () {
        img.style.display = "none";
        imgContainer.textContent = row[0];
      };
      imgContainer.appendChild(img);
    } else {
      imgContainer.textContent = row[0];
    }
    card.appendChild(imgContainer);

    // Create Name section using row[0]
    const nameEl = document.createElement("div");
    nameEl.className = "card-name";
    nameEl.textContent = row[0];
    // Set up overlay styling
    nameEl.style.position = "absolute";
    // nameEl.style.top = "0";
    nameEl.style.left = "0";
    nameEl.style.bottom = "0";

    nameEl.style.width = "100%";
    // nameEl.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    nameEl.style.color = "white";
    nameEl.style.padding = "5px";
    nameEl.style.textAlign = "center";
    nameEl.style.opacity = "1";
    // nameEl.style.transition = "opacity 0.3s";
    // Ensure the image container acts as a relative reference
    imgContainer.style.position = "relative";
    imgContainer.appendChild(nameEl);
    // Show the name overlay on hover

    // Create Price section from row[1]
    const priceEl = document.createElement("div");
    priceEl.className = "card-price";
    priceEl.textContent =
      "Price: " + (row[1] === "0" ? "0" : row[1] + "" + "Rs");
    card.appendChild(priceEl);

    // Create Stock section from row[2]
    const stockEl = document.createElement("div");
    stockEl.className = "card-stock";
    stockEl.textContent = "Stock: " + (row[2] === "0" ? "0" : row[2]);
    card.appendChild(stockEl);

    container.appendChild(card);
  });
}

document.getElementById("searchInput").addEventListener("input", updateTable);
document.getElementById("option").addEventListener("change", updateTable);

// Enable first-time data download immediately
fetchVegetableData();

// Continue fetching data every 4 seconds
setInterval(fetchVegetableData, 120 * 1000);
