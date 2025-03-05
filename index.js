const tl = gsap.timeline();
window.addEventListener("DOMContentLoaded", function () {
  // Animate the logo image from above
  tl.from(".display_img img", {
    duration: 1,
    y: -50,
    opacity: 0,
    ease: "power2.out",
  })
    // Animate the heading from below
    .from(
      ".display h2",
      {
        duration: 0.8,
        y: 50,
        opacity: 0,
        ease: "power2.out",
      },
      "-=0.5"
    )
    // Animate the paragraph from below
    .from(
      ".display p",
      {
        duration: 0.8,
        y: 50,
        opacity: 0,
        ease: "power2.out",
      },
      "-=0.5"
    )
    // Fade out the loading div and then update displays
    .to(
      ".display",
      {
        duration: 0.5,
        opacity: 0,
        pointerEvents: "none",
        ease: "power2.out",
        onComplete: () => {
          // Hide the loading element completely
          const loadingEl = document.querySelector(".display");
          if (loadingEl) loadingEl.style.display = "none";
          // Set the main display element to block (or remove from DOM if preferred)
          const mainDisplayEl = document.querySelector(".main-display");
          if (mainDisplayEl) {
            mainDisplayEl.style.display = "block";
            // Alternatively, to remove from DOM, uncomment the following line:
            // mainDisplayEl.parentNode.removeChild(mainDisplayEl);
          }
        },
      },
      "+=1"
    );
});

// document.addEventListener("contextmenu", function (e) {
//   e.preventDefault();
// });
// let isDevToolsOpen = false;

// function checkDevTools() {
//   const threshold = 160;
//   const widthThreshold = window.outerWidth - window.innerWidth > threshold;
//   const heightThreshold = window.outerHeight - window.innerHeight > threshold;

//   if (widthThreshold || heightThreshold) {
//     if (!isDevToolsOpen) {
//       isDevToolsOpen = true;
//       window.location.href = "error.html";
//     }
//   } else {
//     if (isDevToolsOpen) {
//       isDevToolsOpen = false;
//       window.location.href = "index.html";
//     }
//   }
// }

// // Reduced interval for faster redirection
// setInterval(checkDevTools, 50);

// document.addEventListener("keydown", function (e) {
//   // Prevent F12
//   if (e.key === "F12") {
//     e.preventDefault();
//   }
//   // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
//   if (
//     e.ctrlKey &&
//     e.shiftKey &&
//     (e.key === "I" || e.key === "J" || e.key === "C")
//   ) {
//     e.preventDefault();
//   }
//   // Prevent Ctrl+U (view source)
//   if (e.ctrlKey && e.key === "u") {
//     e.preventDefault();
//   }
// });

const sheetID = "14buYMrQOTrWOT4bCeUPbQfhBhzjJPWwESYwe63G3XSE";
const apiKey = "AIzaSyCfPW2ii5k6s2jM99CVZQ_8yKOuPjqz4Po";
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
  // Sanitize the search input using DOMPurify
  const searchInput = DOMPurify.sanitize(
    document.getElementById("searchInput").value
  ).toLowerCase();
  const sortOption = DOMPurify.sanitize(
    document.getElementById("option").value
  );
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
      img.style.objectFit = "cover";
      img.style.objectPosition = "center";
      // If the image fails to load, display fallback text
      img.onerror = function () {
        img.style.display = "none";
        img.style.objectFit = "cover";
        img.style.objectPosition = "center";
        imgContainer.textContent = row[0];
      };
      imgContainer.appendChild(img);
    } else {
      imgContainer.textContent = row[0];
    }
    // Ensure the image container acts as a relative reference
    imgContainer.style.position = "relative";
    card.appendChild(imgContainer);

    // If stock is zero, add an "Out of Stock" label and a red border
    if (parseFloat(row[5]) === 0) {
      const outOfStockLabel = document.createElement("div");
      outOfStockLabel.textContent = "Out of Stock";
      outOfStockLabel.style.position = "absolute";
      outOfStockLabel.style.top = "5px";
      outOfStockLabel.style.left = "5px";
      outOfStockLabel.style.backgroundColor = "red";
      outOfStockLabel.style.color = "white";
      outOfStockLabel.style.padding = "2px 5px";
      outOfStockLabel.style.fontSize = "12px";
      imgContainer.appendChild(outOfStockLabel);

      card.style.border = "2px solid red";
    }

    // Create Name section using row[0]
    const nameEl = document.createElement("div");
    nameEl.className = "card-name";
    nameEl.textContent = row[0];
    // Setup overlay styling so the name appears on top of the image
    nameEl.style.position = "absolute";
    nameEl.style.left = "0";
    nameEl.style.bottom = "0";
    nameEl.style.width = "100%";
    nameEl.style.color = "white";
    nameEl.style.padding = "5px";
    nameEl.style.textAlign = "center";
    nameEl.style.opacity = "1";
    imgContainer.appendChild(nameEl);

    // Create Price section from row[1]
    const priceEl = document.createElement("div");
    priceEl.className = "card-price";
    priceEl.textContent = "Our Price: " + (row[1] === "0" ? "0" : "₹" + row[1]);
    card.appendChild(priceEl);

    // Create Stock section from row[2]
    const stockEl = document.createElement("div");
    stockEl.className = "card-stock";
    stockEl.textContent =
      "Market Price: " + (row[2] === "0" ? "0" : "₹" + row[2]);

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
