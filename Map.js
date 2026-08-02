// ===============================
// GLOBAL VARIABLES
// ===============================
let vehicleMarker = null;
let playbackIndex = 0;
let playbackTimer = null;
let currentLocations = [];
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
// ==========================================
// DATE PARSER
// ==========================================

function parseDate(value) {

    if (!value) return null;

    if (typeof value === "number") {

        return new Date((value - 25569) * 86400 * 1000);

    }

    let d = new Date(value);

    if (!isNaN(d)) return d;

    return null;

}

// ==========================================
// DATETIME PARSER
// ==========================================

function parseDateTime(dateValue, timeValue) {

    let date = parseDate(dateValue);

    if (!date) return null;

    if (timeValue) {

        let str = String(timeValue).trim();

        let t = str.split(":");

        date.setHours(parseInt(t[0]) || 0);
        date.setMinutes(parseInt(t[1]) || 0);
        date.setSeconds(parseInt(t[2]) || 0);

    }

    return date;

}
// ==========================================
// FILTER
// ==========================================

function passesFilter(recordDateTime, fromDate, toDate, fromTime, toTime) {

    if (!recordDateTime) return false;

    // From Date
    if (fromDate) {

        let start = new Date(fromDate);
        start.setHours(0,0,0,0);

        if (recordDateTime < start)
            return false;
    }

    // To Date
    if (toDate) {

        let end = new Date(toDate);
        end.setHours(23,59,59,999);

        if (recordDateTime > end)
            return false;
    }

    // Time
    let currentTime =
        recordDateTime.toTimeString().substring(0,5);

    if (fromTime && currentTime < fromTime)
        return false;

    if (toTime && currentTime > toTime)
        return false;

    return true;

}


document.getElementById("generateMap").addEventListener("click", generateMap);

function generateMap() {
    
    const fromDate = document.getElementById("fromDate").value;
const toDate = document.getElementById("toDate").value;
const fromTime = document.getElementById("fromTime").value;
const toTime = document.getElementById("toTime").value;

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

        const recordDateTime = parseDateTime(
    row[dateCol],
    row[timeCol]
);

if (!passesFilter(
    recordDateTime,
    fromDate,
    toDate,
    fromTime,
    toTime
)) {
    return;
}

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
    
    currentLocations = locations;
       drawMovement(locations);
    playbackIndex = 0;
document.getElementById("timelineSlider").value = 0;
showPlaybackPoint(0);
clearInterval(playbackTimer);

document.getElementById("timelineSlider").value = 0;
    document.getElementById("timelineSlider").max =
    locations.length - 1;

document.getElementById("timelineSlider").value = 0;

document.getElementById("timelineLabel").textContent =
    locations.length > 0
        ? `1 / ${locations.length}`
        : "0 / 0";
 

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

        let bgColor = "#1976d2";

if (index === 0) bgColor = "#28a745";
if (index === locations.length - 1) bgColor = "#dc3545";

const icon = L.divIcon({
    className: "number-marker",
    html: `
        <div style="
            width:32px;
            height:32px;
            border-radius:50%;
            background:${bgColor};
            color:white;
            font-weight:bold;
            text-align:center;
            line-height:32px;
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.35);
        ">
            ${index + 1}
        </div>
    `,
    iconSize: [32,32],
    iconAnchor: [16,16]
});

let marker = L.marker([loc.lat, loc.lng], {
    icon: icon
}).addTo(map);
marker.bindPopup(`
<b>Sequence:</b> ${index + 1}<br>
<b>Date:</b> ${loc.date}<br>
<b>Time:</b> ${loc.time}<br>
<b>Tower:</b> ${loc.tower}<br>
<b>Latitude:</b> ${loc.lat}<br>
<b>Longitude:</b> ${loc.lng}
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
        // Car Marker
if (vehicleMarker) {
    map.removeLayer(vehicleMarker);
}

const carIcon = L.divIcon({
    html: '<div style="font-size:40px;">🚗</div>',
    className: "",
    iconSize: [75, 75],
    iconAnchor: [35, 35]
});

vehicleMarker = L.marker(
    [locations[0].lat, locations[0].lng],
    { icon: carIcon }
).addTo(map);
        console.log("Vehicle Created:", vehicleMarker);
      updateStatistics(locations);
    }

}

function updateStatistics(locations) {

    // Total Records
    document.getElementById("totalRecords").textContent =
        excelData.length;

    // Displayed Records
    document.getElementById("displayedRecords").textContent =
        locations.length;

    // Unique Towers
    let towers = new Set();

    locations.forEach(loc => {

        if (loc.tower)
            towers.add(loc.tower);

    });

    document.getElementById("uniqueTowers").textContent =
        towers.size;

    // Distance
    let totalDistance = 0;

    for (let i = 1; i < locations.length; i++) {

        totalDistance += calculateDistance(
            locations[i - 1].lat,
            locations[i - 1].lng,
            locations[i].lat,
            locations[i].lng
        );

    }

    document.getElementById("totalDistance").textContent =
        totalDistance.toFixed(2);

}
function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

}
document.getElementById("timelineSlider").addEventListener("input", function () {

    playbackIndex = parseInt(this.value);

    showPlaybackPoint(playbackIndex);

});

function animateVehicle(from, to) {

    let duration = 1000; // 1 second
    let start = null;

    function animate(timestamp) {

        if (!start) start = timestamp;

        let progress = (timestamp - start) / duration;

        if (progress > 1) progress = 1;

        let lat = from.lat + (to.lat - from.lat) * progress;
        let lng = from.lng + (to.lng - from.lng) * progress;

        vehicleMarker.setLatLng([lat, lng]);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }

    }

    requestAnimationFrame(animate);

}





function showPlaybackPoint(index) {

    if (currentLocations.length === 0) return;

    let loc = currentLocations[index];
    console.log("Playback:", index);
console.log("Vehicle:", vehicleMarker);
 if (index === 0) {

    vehicleMarker.setLatLng([loc.lat, loc.lng]);

} else {

    animateVehicle(
        {
            lat: currentLocations[index - 1].lat,
            lng: currentLocations[index - 1].lng
        },
        {
            lat: loc.lat,
            lng: loc.lng
        }
    );

}
    map.setView([loc.lat, loc.lng], 16);

 markers.forEach(m => m.closePopup());

markers[index].openPopup();

    document.getElementById("timelineLabel").textContent =
        `${index + 1} / ${currentLocations.length}`;

}

document.getElementById("playBtn").addEventListener("click", function () {

    if (currentLocations.length === 0) return;

    clearInterval(playbackTimer);

    playbackTimer = setInterval(function () {

        playbackIndex++;

        if (playbackIndex >= currentLocations.length) {

            clearInterval(playbackTimer);
            return;

        }

        document.getElementById("timelineSlider").value = playbackIndex;

        showPlaybackPoint(playbackIndex);

    }, 1000); // 1 second per point

});

document.getElementById("pauseBtn").addEventListener("click", function () {

    clearInterval(playbackTimer);

});
document.getElementById("downloadMap").addEventListener("click", function () {

    const mapDiv = document.getElementById("map");

    domtoimage.toPng(mapDiv, {
        cacheBust: true,
        quality: 1
    })
    .then(function (dataUrl) {

        const link = document.createElement("a");

        link.download = "Suspect_Movement_Map.png";
        link.href = dataUrl;
        link.click();

    })
    .catch(function (error) {

        console.error(error);
        alert("Unable to export map.");

    });

});
