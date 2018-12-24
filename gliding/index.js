"use strict";

const columnNames = ["date", "flightNumber", "pilotInCommand", "studentPassenger", "glider", "towReg", "towPilot", "takeOff", "towDown", "towHeight", "gliderDown", "towTime", "gliderTime", "towCost", "gliderCost", "landingFee", "totalCost", "comments"];

const $window = $(window);
const $elems = {};
for (let i = 0; i < columnNames.length; i++) {
    const col = columnNames[i];
    $elems[col] = $("." + col).first();
}

function localStorageTest() {
    const test = "test";
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}
const localStorageEnabled = localStorageTest();

function rowIsEmpty(row) {
    // make a copy of the row without the flightNumber or date columns
    row = Object.assign({}, row);
    delete row.date;
    delete row.flightNumber;

    // if every column is blank then row is empty
    return Object.values(row).every(v => v === "");
}

function getRow(index) {
    const row = {};
    for (let i = 0; i < columnNames.length; i++) {
        const col = columnNames[i];
        const val = $elems[col].find("input").eq(index).val();
        if (val) {
            row[col] = val;
        }
    }
    return row;
}

function exportToString() {
    const rows = [];
    for (let i = 0; i < columnNames.length; i++) {
        const row = getRow(i);
        if (!rowIsEmpty(row)) {
            rows.push(row);
        }
    }
    return JSON.stringify(rows);
}

function addRow(row) {
    if (!row) row = {};
    for (let i = 0; i < columnNames.length; i++) {
        const col = columnNames[i];
        $elems[col].append($("<div><input>").addClass("input-wrapper"));
        $elems[col].find("input").last().val(row[col] || "");
    }
}

function saveToLocalStorage() {
    if (localStorageEnabled) {
        localStorage.setItem("latest", exportToString());
    }
}

function loadFromLocalStorage(storageName) {
    if (localStorageEnabled) {
        const data = localStorage.getItem(storageName);
        if (data !== null) {
            const json = JSON.parse(data);
            for (let i = 0; i < json.length; i++) {
                addRow(json[i]);
            }
        }
    }
}

function getLastFlightNumber() {
    const $input = $elems.flightNumber.find("input").eq(-1);
    if ($input.length === 0) return 0;
    return parseInt($input.val());
}

function addTimeToElem(ev) {
    const $target = $(ev.target);
    if ($elems.takeOff.has($target).length || $elems.towDown.has($target).length || $elems.gliderDown.has($target).length) {
        $target.val(moment().format("HH:mm"));
        $target.trigger("keyup");
    }
}

// Long press (>350ms) = insert time for take-off/landing
var timeoutId = 0;
$window.on("mousedown", ev => timeoutId = setTimeout(addTimeToElem, 350, ev));
$window.on("mouseup mouseleave", ev => clearTimeout(timeoutId));

$window.on("keyup", ev => {
    if ($(ev.target).is("input")) {
        saveToLocalStorage();
    }
    if (!rowIsEmpty(getRow(-1))) {
        addRow({
            "date": moment().format("DD MMM"),
            "flightNumber": getLastFlightNumber() + 1
        });
    }
});

if (localStorageEnabled) {
    loadFromLocalStorage("latest");
}
addRow({
    "date": moment().format("DD MMM"),
    "flightNumber": getLastFlightNumber() + 1
});