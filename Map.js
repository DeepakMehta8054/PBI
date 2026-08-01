
// Map Initialize
let map = L.map("map").setView([30.9000, 75.8573], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let excelData = [];
const fileInput = document.getElementById("excelFile");

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
        "latColumn",
        "lngColumn",
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

    let latCol = document.getElementById("latColumn").value;
    let lngCol = document.getElementById("lngColumn").value;
    let dateCol = document.getElementById("dateColumn").value;
    let timeCol = document.getElementById("timeColumn").value;
    let towerCol = document.getElementById("towerColumn").value;

    let locations = [];

    excelData.forEach(row => {

        let lat = parseFloat(row[latCol]);
        let lng = parseFloat(row[lngCol]);

        if (isNaN(lat) || isNaN(lng)) return;

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

    // Date + Time ke hisaab se sort
    locations.sort((a, b) => {
        return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`);
    });

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



