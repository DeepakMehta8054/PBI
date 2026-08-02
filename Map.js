// ===============================
// GLOBAL VARIABLES
// ===============================

let map;
let excelData = [];

let markers = [];
let movementLine = null;

const fileInput = document.getElementById("excelFile");

// ===============================
// MAP INITIALIZATION
// ===============================

function initializeMap() {

    map = L.map("map").setView([30.9000, 75.8573], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

}

initializeMap();

// ===============================
// EXCEL UPLOAD
// ===============================

fileInput.addEventListener("change", function (e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        const data = new Uint8Array(event.target.result);

        const workbook = XLSX.read(data, {
            type: "array"
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        excelData = XLSX.utils.sheet_to_json(sheet, {
            defval: ""
        });

        if (excelData.length === 0) {

            alert("Excel is empty.");

            return;
        }

        fillDropdowns(Object.keys(excelData[0]));

        alert(excelData.length + " records loaded.");

    };

    reader.readAsArrayBuffer(file);

});

// ===============================
// AUTO COLUMN DETECTION
// ===============================

function fillDropdowns(headers) {

    const dropdowns = [

        "locationColumn",
        "dateColumn",
        "timeColumn",
        "towerColumn"

    ];

    dropdowns.forEach(id => {

        const select = document.getElementById(id);

        select.innerHTML = "";

        headers.forEach(header => {

            let option = document.createElement("option");

            option.value = header;

            option.textContent = header;

            select.appendChild(option);

        });

    });

}
function fillDropdowns(headers) {

    const dropdowns = [
        "locationColumn",
        "dateColumn",
        "timeColumn",
        "towerColumn"
    ];

    dropdowns.forEach(id => {

        const select = document.getElementById(id);
        select.innerHTML = "";

        headers.forEach(header => {

            let option = document.createElement("option");

            option.value = header;
            option.textContent = header;

            select.appendChild(option);

        });

    });

    // Auto Detect Columns
    autoSelectColumn(
        "locationColumn",
        ["location", "latlong", "lat long", "coordinates", "coord", "gps", "maps", "google", "loc"]
    );

    autoSelectColumn(
        "dateColumn",
        ["date", "event date", "call date", "cdr date"]
    );

    autoSelectColumn(
        "timeColumn",
        ["time", "event time", "call time", "cdr time"]
    );

    autoSelectColumn(
        "towerColumn",
        ["tower", "tower id", "cell", "cell id", "cgi", "ecgi", "site"]
    );

}
function parseLocation(value) {

    if (!value) return null;

    value = String(value).trim();

    // Google Maps URL
    let match = value.match(/q=([-0-9.]+),\s*([-0-9.]+)/i);

    if (match) {
        return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
        };
    }

    // Latitude Longitude (space/comma)
    let numbers = value.match(/-?\d+(\.\d+)?/g);

    if (numbers && numbers.length >= 2) {

        return {
            lat: parseFloat(numbers[0]),
            lng: parseFloat(numbers[1])
        };

    }

    return null;

}

document.getElementById("generateMap").addEventListener("click", generateMap);

function generateMap() {
    alert("Generate Map Clicked");

    if (excelData.length === 0) {
        alert("Please upload an Excel file.");
        return;
    }

    const locationCol = document.getElementById("locationColumn").value;
    const dateCol = document.getElementById("dateColumn").value;
    const timeCol = document.getElementById("timeColumn").value;
    const towerCol = document.getElementById("towerColumn").value;

    const locations = [];

    excelData.forEach(row => {

        const location = parseLocation(row[locationCol]);

        if (!location) return;

        locations.push({
            lat: location.lat,
            lng: location.lng,
            date: row[dateCol],
            time: row[timeCol],
            tower: row[towerCol]
        });

    });
locations.sort((a, b) => {

    let d1 = parseDateTime(a.date, a.time);
    let d2 = parseDateTime(b.date, b.time);

    return d1 - d2;

});

    drawMovement(locations);

}


function autoSelectColumn(selectId, keywords) {

    const select = document.getElementById(selectId);

    for (let i = 0; i < select.options.length; i++) {

        let text = select.options[i].text.toLowerCase();

        for (let keyword of keywords) {

            if (text.includes(keyword)) {

                select.selectedIndex = i;
                return;

            }

        }

    }

}


function drawMovement(locations) {

    // Purane markers remove
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Purani line remove
    if (movementLine) {
        map.removeLayer(movementLine);
    }

    let latlngs = [];

    locations.forEach((loc, index) => {

        let marker = L.marker([loc.lat, loc.lng]).addTo(map);

        marker.bindPopup(`
            <b>Sequence:</b> ${index + 1}<br>
            <b>Date:</b> ${loc.date}<br>
            <b>Time:</b> ${loc.time}<br>
            <b>Tower:</b> ${loc.tower}
        `);

        markers.push(marker);

        latlngs.push([loc.lat, loc.lng]);

    });

    movementLine = L.polyline(latlngs, {
        color: "blue",
        weight: 4
    }).addTo(map);

    if (latlngs.length > 0) {
        map.fitBounds(movementLine.getBounds());
    }

}
