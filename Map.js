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
