
function main() {
    initTable()
    initModelStream()
}



function initModelStream() {
    const submitPoint = document.querySelector('#s-point')
    const submitAll = document.querySelector('#s-all')

    submitPoint.addEventListener("click", handleModelReq)
    submitPoint.custom = false
    submitAll.addEventListener("click", handleModelBatchReq)
}

async function handleModelReq(e) {

    // Disable buttons to prevent mass submissions
    toggleSubmitButtons(false)
    
    // Gather selection information if pred singular point
    let submitData = {};
    let custom = e.currentTarget.custom;
    let model = document.getElementById("model-select").value
    if (custom) {
        // Handle Custom point
    } else {
        // Handle Selected Table Data
        if (!rowSelected) {
            alert("Please select a data point if using a singular classifier.")
            toggleSubmitButtons(true)
            return
        } else {
            for (let i = 0; i < tableHeaders.length; i ++) {
                submitData[dataHeaders[i]] = rowSelected.childNodes[i + 1].innerHTML
            }
        }
    }

    // Enable singular point result view
    if (resultTableLoaded) { await removeResultTable() }

    // Show samples requests
    document.querySelector('#curl pre code').innerHTML = `
curl -X POST \\
    -H "Content-Type: application/json" \\
    -d '{
        "PassengerId": "${submitData.PassengerId}",
        "Pclass": "${submitData.Pclass}",
        "Name": "${submitData.Name}",
        "Sex": "${submitData.Sex}",
        "Age": "${submitData.Age}",
        "SibSp": "${submitData.SibSp}",
        "Parch": "${submitData.Parch}",
        "Ticket": "${submitData.Ticket}",
        "Fare": "${submitData.Fare}",
        "Cabin": "${submitData.Cabin}",
        "Embarked": "${submitData.Embarked}"
    }' \\
    "127.0.0.1:5000/api/model?model=${model}"  
`
    document.querySelector('#python pre code').innerHTML = `
import requests
res = requests.post(
    url="http://127.0.0.1:5000/api/model",
    params = {
        "model": "${model}"
    },
    headers = {
        "Content-Type": "application/json"
    },
    json = {
        "PassengerId": "${submitData.PassengerId}",
        "Pclass": "${submitData.Pclass}",
        "Name": "${submitData.Name}",
        "Sex": "${submitData.Sex}",
        "Age": "${submitData.Age}",
        "SibSp": "${submitData.SibSp}",
        "Parch": "${submitData.Parch}",
        "Ticket": "${submitData.Ticket}",
        "Fare": "${submitData.Fare}",
        "Cabin": "${submitData.Cabin}",
        "Embarked": "${submitData.Embarked}"
    }
)
`
    document.querySelector('#javascript pre code').innerHTML = `
fetch( "/api/model?" + new URLSearchParams({
        model: ${model}
    }) , {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "PassengerId": "${submitData.PassengerId}",
            "Pclass": "${submitData.Pclass}",
            "Name": "${submitData.Name}",
            "Sex": "${submitData.Sex}",
            "Age": "${submitData.Age}",
            "SibSp": "${submitData.SibSp}",
            "Parch": "${submitData.Parch}",
            "Ticket": "${submitData.Ticket}",
            "Fare": "${submitData.Fare}",
            "Cabin": "${submitData.Cabin}",
            "Embarked": "${submitData.Embarked}"
        })
    }
)
`
    document.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el);
    });

    // Inidicate Loading and request type
    document.getElementById("identifier").innerHTML = submitData.PassengerId
    document.getElementById("pred-val").innerHTML = "Loading..."
    document.getElementById("act-val").innerHTML = submitData.Survived
    document.getElementById("result-dataset").innerHTML = "titanic.csv"
    document.getElementById("result-model").innerHTML = model
    document.getElementById("result-target").innerHTML = custom ? "point (custom)" : "point"

    // Call model
    try {
        let modelPrediction = await callModel(model, submitData);
        
        // Inject results into page
        document.getElementById("pred-val").innerHTML = modelPrediction.prediction ?? "ERROR"
    } catch (error) {
        document.getElementById("pred-val").innerHTML = "ERROR"
    }

    // Re-enable buttons
    toggleSubmitButtons(true)
}

async function handleModelBatchReq() {

    // Disable buttons to prevent mass submissions
    toggleSubmitButtons(false)

    // Enable singular point result view
    if (resultTableLoaded) { await removeResultTable() }

    // Gather all table elements
    let model = document.getElementById("model-select").value
    let submitData = [tableHeaders, ...data]

    // Inidicate Loading and request type
    document.getElementById("identifier").innerHTML = "Loading..."
    document.getElementById("pred-val").innerHTML = "Loading..."
    document.getElementById("act-val").innerHTML = "Loading..."
    document.getElementById("result-dataset").innerHTML = "titanic.csv"
    document.getElementById("result-model").innerHTML = model
    document.getElementById("result-target").innerHTML = "all"

    // Show samples requests
    const headersCleaned = tableHeaders.toString().replace("Survived,", "").replace("ked,", "ked")
    document.querySelector('#curl pre code').innerHTML = `
curl -X POST \\
    -H "Content-Type: application/json" \\
    -d '[
        [${headersCleaned}],
        [${data[0]}],
        [${data[1]}],
        [${data[2]}],
        <...>
    ]' \\
    "127.0.0.1:5000/api/model?model=${model}"  
`
    document.querySelector('#python pre code').innerHTML = `
import requests
res = requests.post(
    url="http://127.0.0.1:5000/api/model",
    params = {
        "model": "${model}"
    },
    headers = {
        "Content-Type": "application/json"
    },
    json = [
        [${headersCleaned}],
        [${data[0]}],
        [${data[1]}],
        [${data[2]}],
        <...>
    ]
)
`
    document.querySelector('#javascript pre code').innerHTML = `
fetch( "/api/model?" + new URLSearchParams({
        model: ${model}
    }) , {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify([
            [${headersCleaned}],
            [${data[0]}],
            [${data[1]}],
            [${data[2]}],
            <...>
        ])
    }
)
`
    document.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el);
    });
    
    // Show results if res is good otherwise show errors
    try {
        let rawResponse = await callModel(model, submitData);

        let curatedResults = [];
        for (let i = 0; i < data.length; i ++) {
            const correct = data[i][1];
            const prediction = rawResponse["prediction"][i] ?? "ERROR";
            const identifier = i + 1;
            curatedResults.push([identifier, prediction, correct]);
        }
        allPointsResultsData = curatedResults;
        if (!resultTableLoaded) {
            initResultTable()
        }
        renderResultTable();
    } catch {
        document.getElementById("pred-val").innerHTML = "ERROR"
    }

    // Re-enable buttons
    toggleSubmitButtons(true)

}

async function callModel(model, submitData) {
    const res = await fetch( "/api/model?" + new URLSearchParams({
            model: model
        }) , {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(submitData)
        }
    )
    return await res.json()
}

function toggleSubmitButtons(toggleOn) {
    const sBT = document.getElementById("s-point")
    const aBT = document.getElementById("s-all")
    if (toggleOn) {
        sBT.removeAttribute("disabled")
        aBT.removeAttribute("disabled")
        sBT.classList.add("submit-bt")
        aBT.classList.add("submit-bt")
        sBT.classList.remove("disabled")
        aBT.classList.remove("disabled")
    } else {
        sBT.setAttribute("disabled", true)
        aBT.setAttribute("disabled", true)
        sBT.classList.remove("submit-bt")
        aBT.classList.remove("submit-bt")
        sBT.classList.add("disabled")
        aBT.classList.add("disabled")
    }
}

// Table Pagination Data
let data, table;
let sortAsc = false;
const pageSize = 10;
let curPage = 1;
let rowSelected;
let tableHeaders;

async function initTable() {
  
    // Select table
    headers = document.querySelector('#titanic-table thead tr');
    table = document.querySelector('#titanic-table tbody');
    
    // Obtain data
    let res = await fetch('/api/data');
    data = await res.json();
    dataHeaders = data.shift();

    // Load Table
    headers.innerHTML = `<th></th><th>${dataHeaders.join('</th><th>')}</th>`;
    tableHeaders = dataHeaders;
    renderTable();
    
    // Add pagination listeners
    document.querySelector('#firstButton').addEventListener('click', firstPage, false);
    document.querySelector('#nextButton').addEventListener('click', nextPage, false);
    document.querySelector('#prevButton').addEventListener('click', previousPage, false);
    document.querySelector('#lastButton').addEventListener('click', lastPage, false);
    document.querySelector("#page-input").addEventListener("input", (e) => {
        if (e.data) {
            const inputedNum = parseInt(document.querySelector("#page-input").value)
            if (inputedNum > data.length / pageSize) {
                curPage = data.length / pageSize
            } else if (inputedNum < 1) {
                curPage = 1;
            } else {
                curPage = parseInt(document.querySelector("#page-input").value)
            }
            try {
                renderTable();
            } catch {
                curPage = 1;
                renderTable();
            }
        }
    })
}
  
function renderTable() {

    // Calculate displayed tables
    let result = '';
    data.filter((row, index) => {
        let start = (curPage-1)*pageSize;
        let end = curPage*pageSize;
        if(index >= start && index < end) return true;
    }).forEach(rowData => {
        radioBT = `<td><label><input class="radio-selector" type="radio" id='pid${rowData[0] - 1}' name="optradio"></label></td>`
        result += `<tr>${radioBT}<td>${rowData.join('</td><td>')}</td></tr>`
    });
    table.innerHTML = result;

    // Track user selected rows
    modelRows = document.getElementsByTagName("tr")
    for (let i = 1; i < 11; i ++) {
        modelRows[i].addEventListener("click", () => {
            // Remove old row selection
            if (rowSelected && rowSelected !== modelRows[i]) {
                rowSelected.querySelector("input").setAttribute("checked", false)
            }

            // Set new row selection
            rowSelected = modelRows[i]
            rowSelected.querySelector("input").setAttribute("checked", true)
        })
    }

    // Update table page number
    let inputValue = parseInt(document.querySelector("#page-input").value)
    if (inputValue !== curPage) {
        document.querySelector("#page-input").value = parseInt(curPage)
    }
}


function firstPage() {
    curPage = 1;
    renderTable();
}
function previousPage() {
    if(curPage > 1) curPage--;
    renderTable();
}
function nextPage() {
    if((curPage * pageSize) < data.length) curPage++;
    renderTable();
}
function lastPage() {
    curPage = data.length / pageSize;
    renderTable()
}

// TResult able Pagination Data
let allPointsResultsData, resultTable;
let curResultPage = 1;
let resultTableLoaded = false;

async function initResultTable() {
  
    // Select table and load
    resultTable = document.querySelector('#result-table tbody');

    // Load table arrows
    document.getElementById("results").innerHTML += `
    <div class="pagination-wrap" id="result-pagination">
        <button class="pagination-bt" id="firstButtonResult"><span class="material-symbols-outlined">first_page</span></button> 
        <button class="pagination-bt" id="prevButtonResult"><span class="material-symbols-outlined">chevron_left</span></button> 
        <input class="pagination-in" id="result-page-input" type="number" value="1">
        <button class="pagination-bt" id="nextButtonResult"><span class="material-symbols-outlined">chevron_right</span></button>
        <button class="pagination-bt" id="lastButtonResult"><span class="material-symbols-outlined">last_page</span></button> 
    </div>`
    
    // Add pagination listeners
    document.querySelector('#firstButtonResult').addEventListener('click', firstPageResult, false);
    document.querySelector('#nextButtonResult').addEventListener('click', nextPageResult, false);
    document.querySelector('#prevButtonResult').addEventListener('click', previousPageResult, false);
    document.querySelector('#lastButtonResult').addEventListener('click', lastPageResult, false);
    document.querySelector("#result-page-input").addEventListener("input", (e) => {
        if (e.data) {
            const inputedNum = parseInt(document.querySelector("#result-page-input").value)
            if (inputedNum > data.length / pageSize) {
                curResultPage = data.length / pageSize
            } else if (inputedNum < 1) {
                curResultPage = 1;
            } else {
                curResultPage = parseInt(document.querySelector("#result-page-input").value)
            }
            try {
                renderResultTable();
            } catch {
                curResultPage = 1;
                renderResultTable();
            }
        }
    })
    renderResultTable();
    resultTableLoaded = true;
}
  
function renderResultTable() {

    // Calculate displayed tables
    let result = '';
    allPointsResultsData.filter((row, index) => {
        let start = (curResultPage-1)*pageSize;
        let end = curResultPage*pageSize;
        if(index >= start && index < end) return true;
    }).forEach(rowData => {
        result += `<tr><td>${rowData.join('</td><td>')}</td></tr>`
    });
    document.querySelector('#result-table tbody').innerHTML = result;
    resultTable = document.querySelector('#result-table tbody')

    // Update table page number
    let inputValue = parseInt(document.querySelector("#result-page-input").value)
    if (inputValue !== curResultPage) {
        document.querySelector("#result-page-input").value = parseInt(curResultPage)
    }
}

async function removeResultTable() {
    document.querySelector('#result-table tbody').innerHTML = `
    <tr>
        <td id="identifier">...</td>
        <td id="pred-val">...</td>
        <td id="act-val">...</td>
    </tr>
    `
    document.getElementById("result-pagination").remove()
    resultTableLoaded = false;
}

function firstPageResult() {
    curResultPage = 1;
    renderResultTable();
}
function previousPageResult() {
    if(curResultPage > 1) curResultPage--;
    renderResultTable();
}
function nextPageResult() {
    if((curResultPage * pageSize) < allPointsResultsData.length) curResultPage++;
    renderResultTable();
}
function lastPageResult() {
    curResultPage = allPointsResultsData.length / pageSize;
    renderResultTable()
}

main()