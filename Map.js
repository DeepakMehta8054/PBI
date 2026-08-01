
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

