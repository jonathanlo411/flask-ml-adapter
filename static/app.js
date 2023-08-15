
function main() {
    initTable()
    initModelStream()
}



function initModelStream() {
    const submitPoint = document.querySelector('#s-point')
    const submitAll = document.querySelector('#s-all')

    submitPoint.addEventListener("click", handleModelReq)
    submitPoint.point = true
    submitAll.addEventListener("click", handleModelReq)
}

async function handleModelReq(e) {
    // Gather selection information if pred singular point
    let submitData = {};
    let point = e.currentTarget.point;
    let model = document.getElementById("model-select").value
    if (point) {
        if (!rowSelected) {
            alert("Please select a data point if using a singular classifier.")
        } else {
            for (let i = 0; i < tableHeaders.length; i ++) {
                submitData[dataHeaders[i]] = rowSelected.childNodes[i + 1].innerHTML
            }
        }
    } else {
        // Handle Classify All Points
    }

    // Show samples requests
    document.querySelector('#curl pre code').innerHTML = `
curl -X POST \\
    -H "Content-Type: application/json" \\
    -d '[
          {
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

    // Call model
    try {
        let modelPrediction = await callModel(model, submitData);
        
        // Inject results into page
        document.getElementById("result-dataset").innerHTML = "titanic.csv"
        document.getElementById("result-model").innerHTML = model
        document.getElementById("result-target").innerHTML = point ? "point" : "all"
        document.getElementById("identifier").innerHTML = submitData.PassengerId
        document.getElementById("pred-val").innerHTML = modelPrediction.prediction
        document.getElementById("act-val").innerHTML = submitData.Survived
    } catch (error) {
        document.getElementById("pred-val").innerHTML = "ERROR"
    }
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
}
  
function renderTable() {
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

main()