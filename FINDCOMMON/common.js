let allFiles = [];

document.getElementById("excelFiles").addEventListener("change", function (e) {

    allFiles = [];

    const files = Array.from(e.target.files);

    files.forEach(file => {

        const reader = new FileReader();

        reader.onload = function (evt) {

            const workbook = XLSX.read(evt.target.result, { type: "binary" });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const jsonData = XLSX.utils.sheet_to_json(sheet);

            allFiles.push({
                fileName: file.name,
                data: jsonData
            });

            if (allFiles.length === files.length) {
                showColumnSelectors();
            }

        };

        reader.readAsBinaryString(file);

    });

});

function normalizeNumber(value) {

    if (!value) return "";

    value = value.toString().trim();

    // Sirf digits rakho
    value = value.replace(/\D/g, "");

    // Agar 91 se start ho aur 12 digits hain to +91 hata do
    if (value.length === 12 && value.startsWith("91")) {
        value = value.substring(2);
    }

    return value;
}


function showColumnSelectors() {

    let html = "";

    allFiles.forEach((file, index) => {

        let cols = Object.keys(file.data[0]);

        html += `<h3>${file.fileName}</h3>`;

        html += `<select id="col${index}">`;

        cols.forEach(col => {
            html += `<option value="${col}">${col}</option>`;
        });

        html += `</select><br><br>`;

    });

    document.getElementById("fileColumns").innerHTML = html;
}


    



function findCommon() {

    if (allFiles.length < 2) {
        alert("Please upload at least 2 Excel files.");
        return;
    }

    crossFileAnalysis();
}
   function crossFileAnalysis() {

    let result = {};

    allFiles.forEach((file, fileIndex) => {

        let selectedColumn = document.getElementById(`col${fileIndex}`).value;

        file.data.forEach(row => {

            let value = normalizeNumber(row[selectedColumn]);

            if (!value) return;

            if (!result[value]) {

                result[value] = {
                    files: [],
                    fileCount: {},
                    total: 0
                };

            }

            if (!result[value].files.includes(file.fileName)) {
                result[value].files.push(file.fileName);
            }

            result[value].fileCount[file.fileName] =
                (result[value].fileCount[file.fileName] || 0) + 1;

            result[value].total++;

        });

    });

    displayCrossResult(result);

}

function showRecords(number){

    let html = `<h3>Matching Records : ${number}</h3>`;

    allFiles.forEach((file,fileIndex)=>{

        let selectedColumn=document.getElementById(`col${fileIndex}`).value;

        let records=file.data.filter(row=>
            normalizeNumber(row[selectedColumn])===number
        );

        if(records.length===0) return;

        html+=`<h4>${file.fileName}</h4>`;

        html+="<table border='1'><tr>";

        Object.keys(records[0]).forEach(col=>{
            html+=`<th>${col}</th>`;
        });

        html+="</tr>";

        records.forEach(row=>{

            html+="<tr>";

            Object.keys(row).forEach(col=>{
                html+=`<td>${row[col]}</td>`;
            });

            html+="</tr>";

        });

        html+="</table><br>";

    });

    document.getElementById("recordDetails").innerHTML=html;

}



function displayCrossResult(result){

    let html = "<h3>Cross File Analysis</h3>";

    html += "<table border='1'>";

    html += `
    <tr>
        <th>Sr No</th>
        <th>Number</th>
        <th>Present In</th>
        <th>Files</th>
        <th>Total Count</th>
        <th>View</th>
    </tr>
    `;

    let sr = 1;

    for(let number in result){
       if (result[number].files.length < 2) {
    continue;
}

        html += "<tr>";

        html += `<td>${sr++}</td>`;

        html += `
<td>
<a href="#" onclick="showRecords('${number}'); return false;">
${number}
</a>
</td>`;

        html += `<td>${result[number].files.join(", ")}</td>`;

        html += `<td>${result[number].files.length}</td>`;

        html += `<td>${result[number].total}</td>`;

        html += `<td>
        <button onclick="showRecords('${number}')">
        View
        </button>
        </td>`;

        html += "</tr>";

    }

    html += "</table>";

    document.getElementById("output").innerHTML = html;

}




/* function displayResult(common) {

    let html = "<h3>Common Data</h3>";

    html += "<table border='1'>";
    html += "<tr>";

    html += "<th>Sr No</th>";
    html += "<th>Common Value</th>";

    allFiles.forEach(file => {
        html += `<th>${file.fileName}</th>`;
    });

    html += "<th>Total</th>";
    html += "</tr>";

    common.forEach((value, index) => {

        html += "<tr>";

        html += `<td>${index + 1}</td>`;
        html += `<td>${value}</td>`;

        let total = 0;

        allFiles.forEach((file, fileIndex) => {

            let selectedColumn = document.getElementById(`col${fileIndex}`).value;

            let count = file.data.filter(row =>
                row[selectedColumn] &&
                normalizeNumber(row[selectedColumn]) === normalizeNumber(value)
            ).length;

            total += count;

            html += `<td>${count}</td>`;

        });

        html += `<td><b>${total}</b></td>`;

        html += "</tr>";

    });

    html += "</table>";

    document.getElementById("output").innerHTML = html;
} */