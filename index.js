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
const range = "Sheet1!A:Z";
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
  const tableBody = document.querySelector("#vegetableTable tbody");
  tableBody.innerHTML = ""; // Clear existing rows
  if (!rows || rows.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='3'>No data available</td></tr>";
    return;
  }
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row[0]}</td>
    <td class="${row[1] === "0" ? "redtd" : ""}">${
      row[1] === "0" ? "0" : row[1]
    }</td>
    <td class="${row[2] === "0" ? "redtd" : ""}">${
      row[2] === "0" ? "0" : row[2]
    }</td>`;
    tableBody.appendChild(tr);
  });
}

document.getElementById("searchInput").addEventListener("input", updateTable);
document.getElementById("option").addEventListener("change", updateTable);

// Enable first-time data download immediately
fetchVegetableData();

// Continue fetching data every 4 seconds
setInterval(fetchVegetableData, 4 * 1000);
