let directionArrows = null;
// Map Initialize
let map = L.map("map").setView([30.9000, 75.8573], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let excelData = [];
const fileInput = document.getElementById("excelFile");
// Universal Date Parser
function parseDate(dateValue) {

    if (!dateValue) return null;

    // Excel Serial Date
    if (!isNaN(dateValue)) {
        return new Date((dateValue - 25569) * 86400 * 1000);
    }

    let str = String(dateValue).trim();

    // Replace / with -
    str = str.replace(/\//g, "-");

    let parts = str.split("-");

    if (parts.length !== 3) return null;

    let day, month, year;

    // YYYY-MM-DD
    if (parts[0].length === 4) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
    }

    // DD-MM-YYYY
    else {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
    }

    return new Date(year, month, day);

}


// Universal DateTime Parser
function parseDateTime(dateValue, timeValue) {

    let date = parseDate(dateValue);

    if (!date) return null;

    if (timeValue) {

        let time = String(timeValue).trim();

        let t = time.split(":");

        date.setHours(parseInt(t[0]) || 0);
        date.setMinutes(parseInt(t[1]) || 0);
        date.setSeconds(parseInt(t[2]) || 0);

    }

    return date;

}
function parseLocation(value) {

    if (!value) return null;

    value = String(value).trim();

    // Google Maps URL
    let match = value.match(/q=([-0-9.]+),([-0-9.]+)/);

    if (match) {
        return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
        };
    }

    // Space / comma separated
    let parts = value.split(/[\s,]+/);

    if (parts.length >= 2) {
        return {
            lat: parseFloat(parts[0]),
            lng: parseFloat(parts[1])
        };
    }

    return null;
}
function passesFilter(recordDate, recordTime, fromDate, toDate, fromTime, toTime) {

    if (!recordDate) return false;

    // Date Filter
    if (fromDate && recordDate < fromDate) return false;

    if (toDate) {

        let endDate = new Date(toDate);
        endDate.setHours(23,59,59,999);

        if (recordDate > endDate) return false;
    }

    // Time Filter
    if (fromTime || toTime) {

        let time = recordTime ? String(recordTime).substring(0,5) : "";

        if (fromTime && time < fromTime) return false;

        if (toTime && time > toTime) return false;
    }

    return true;
}
fileInput.addEventListener("change", function (e) {

    const file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = function (event) {

        const data = new Uint8Array(event.target.result);

        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        excelData = XLSX.utils.sheet_to_json(sheet);

        fillDropdowns(Object.keys(excelData[0]));

    };

    reader.readAsArrayBuffer(file);

});
function fillDropdowns(headers) {

    const selects = [
    "locationColumn",
    "dateColumn",
    "timeColumn",
    "towerColumn"
];

    selects.forEach(id => {

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
let markers = [];
let movementLine = null;

document.getElementById("generateMap").addEventListener("click", function () {

    let locationCol = document.getElementById("locationColumn").value;
    let dateCol = document.getElementById("dateColumn").value;
    let timeCol = document.getElementById("timeColumn").value;
    let towerCol = document.getElementById("towerColumn").value;
let fromDate = document.getElementById("fromDate").value;
let toDate = document.getElementById("toDate").value;
let fromTime = document.getElementById("fromTime").value;
let toTime = document.getElementById("toTime").value;

// Parse once
let fromDateObj = fromDate ? new Date(fromDate) : null;
let toDateObj = toDate ? new Date(toDate) : null;
    let locations = [];

    excelData.forEach(row => {

        let location = parseLocation(row[locationCol]);

if (!location) return;

let lat = location.lat;
let lng = location.lng;

        if (isNaN(lat) || isNaN(lng)) return;
if (lat < -90 || lat > 90) return;

if (lng < -180 || lng > 180) return;

if (!parseDateTime(row[dateCol], row[timeCol])) return;
        locations.push({
            lat: lat,
            lng: lng,
            date: row[dateCol] || "",
            time: row[timeCol] || "",
            tower: row[towerCol] || ""
        });

    });

    drawMovement(locations);

});
function drawMovement(locations) {

    // Purane markers hatao
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (movementLine) {
        map.removeLayer(movementLine);
    }
if (directionArrows) {
    map.removeLayer(directionArrows);
}
    // Date + Time ke hisaab se sort
    locations.sort((a, b) => {

    return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);

});

    let latlngs = [];

    locations.forEach((loc, index) => {
let bgColor = "#1976d2"; // Blue

if (index === 0) {
    bgColor = "#28a745"; // Start - Green
}

if (index === locations.length - 1) {
    bgColor = "#dc3545"; // End - Red
}

let icon = L.divIcon({
    className: "number-marker",
    html: `
        <div style="
            background:${bgColor};
            width:30px;
            height:30px;
            border-radius:50%;
            color:white;
            font-weight:bold;
            text-align:center;
            line-height:30px;
            border:2px solid white;
            box-shadow:0 2px 5px rgba(0,0,0,.4);
        ">
            ${index + 1}
        </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

let marker = L.marker([loc.lat, loc.lng], {
    icon: icon
}).addTo(map);;

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
directionArrows = L.polylineDecorator(movementLine, {
    patterns: [
        {
            offset: 25,
            repeat: 100,
            symbol: L.Symbol.arrowHead({
                pixelSize: 12,
                polygon: true,
                pathOptions: {
                    color: "blue",
                    fillOpacity: 1,
                    weight: 2
                }
            })
        }
    ]
}).addTo(map);
    if (latlngs.length > 0) {
        map.fitBounds(movementLine.getBounds());
    }

}



