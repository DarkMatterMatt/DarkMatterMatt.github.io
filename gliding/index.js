"use strict";

const $window = $(window);
const $date = $(".date").first();
const $flightNumber = $(".num").first();
const $pilotInCommand = $(".pic").first();
const $studentPassenger = $(".passenger").first();
const $glider = $(".glider-reg").first();
const $towReg = $(".tow-reg").first();
const $towPilot = $(".tow-pilot").first();
const $takeOff = $(".take-off").first();
const $towDown = $(".tow-down").first();
const $towHeight = $(".tow-height").first();
const $gliderDown = $(".glider-down").first();
const $towTime = $(".tow-time").first();
const $gliderTime = $(".glider-time").first();
const $towCost = $(".tow-cost").first();
const $gliderCost = $(".glider-cost").first();
const $landingFee = $(".landing-fee").first();
const $totalCost = $(".total-cost").first();
const $comments = $(".comments").first();

function localStorageTest() {
    var test = "test";
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
    row = Object.assign({}, row);
    delete row.date;
    delete row.flightNumber;
    return Object.values(row).every(function (value) {
        return value === "";
    });
}

function getRow(index) {
    return {
        "date": $date.find("input").eq(index).val(),
        "flightNumber": $flightNumber.find("input").eq(index).val(),
        "pilotInCommand": $pilotInCommand.find("input").eq(index).val(),
        "studentPassenger": $studentPassenger.find("input").eq(index).val(),
        "glider": $glider.find("input").eq(index).val(),
        "towReg": $towReg.find("input").eq(index).val(),
        "towPilot": $towPilot.find("input").eq(index).val(),
        "takeOff": $takeOff.find("input").eq(index).val(),
        "towDown": $towDown.find("input").eq(index).val(),
        "towHeight": $towHeight.find("input").eq(index).val(),
        "gliderDown": $gliderDown.find("input").eq(index).val(),
        "towTime": $towTime.find("input").eq(index).val(),
        "gliderTime": $gliderTime.find("input").eq(index).val(),
        "towCost": $towCost.find("input").eq(index).val(),
        "gliderCost": $gliderCost.find("input").eq(index).val(),
        "landingFee": $landingFee.find("input").eq(index).val(),
        "totalCost": $totalCost.find("input").eq(index).val(),
        "comments": $comments.find("input").eq(index).val(),
    };
}

function exportToString() {
    const rows = [];
    const numRows = $date.find("input").length;
    for (let i = 0; i < numRows; i++) {
        const row = getRow(i);
        if (!rowIsEmpty(row)) {
            rows.push(row);
        }
    }
    return JSON.stringify(rows);
}

function addRow(row) {
    $date.append($("<div><input>").addClass("input-wrapper"));
    $flightNumber.append($("<div><input>").addClass("input-wrapper"));
    $pilotInCommand.append($("<div><input>").addClass("input-wrapper"));
    $studentPassenger.append($("<div><input>").addClass("input-wrapper"));
    $glider.append($("<div><input>").addClass("input-wrapper"));
    $towReg.append($("<div><input>").addClass("input-wrapper"));
    $towPilot.append($("<div><input>").addClass("input-wrapper"));
    $takeOff.append($("<div><input>").addClass("input-wrapper"));
    $towDown.append($("<div><input>").addClass("input-wrapper"));
    $towHeight.append($("<div><input>").addClass("input-wrapper"));
    $gliderDown.append($("<div><input>").addClass("input-wrapper"));
    $towTime.append($("<div><input>").addClass("input-wrapper"));
    $gliderTime.append($("<div><input>").addClass("input-wrapper"));
    $towCost.append($("<div><input>").addClass("input-wrapper"));
    $gliderCost.append($("<div><input>").addClass("input-wrapper"));
    $landingFee.append($("<div><input>").addClass("input-wrapper"));
    $totalCost.append($("<div><input>").addClass("input-wrapper"));
    $comments.append($("<div><input>").addClass("input-wrapper"));

    $date.find("input").last().val(row.date);
    $flightNumber.find("input").last().val(row.flightNumber);
    $pilotInCommand.find("input").last().val(row.pilotInCommand);
    $studentPassenger.find("input").last().val(row.studentPassenger);
    $glider.find("input").last().val(row.glider);
    $towReg.find("input").last().val(row.towReg);
    $towPilot.find("input").last().val(row.towPilot);
    $takeOff.find("input").last().val(row.takeOff);
    $towDown.find("input").last().val(row.towDown);
    $towHeight.find("input").last().val(row.towHeight);
    $gliderDown.find("input").last().val(row.gliderDown);
    $towTime.find("input").last().val(row.towTime);
    $gliderTime.find("input").last().val(row.gliderTime);
    $towCost.find("input").last().val(row.towCost);
    $gliderCost.find("input").last().val(row.gliderCost);
    $landingFee.find("input").last().val(row.landingFee);
    $totalCost.find("input").last().val(row.totalCost);
    $comments.find("input").last().val(row.comments);
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
    const $input = $flightNumber.find("input").eq(-2);
    if ($input.length === 0) return 0;
    return parseInt($input.val());
}

function addBlankRow() {
    $date.append($("<div><input>").addClass("input-wrapper"));
    $flightNumber.append($("<div><input>").addClass("input-wrapper"));
    $pilotInCommand.append($("<div><input>").addClass("input-wrapper"));
    $studentPassenger.append($("<div><input>").addClass("input-wrapper"));
    $glider.append($("<div><input>").addClass("input-wrapper"));
    $towReg.append($("<div><input>").addClass("input-wrapper"));
    $towPilot.append($("<div><input>").addClass("input-wrapper"));
    $takeOff.append($("<div><input>").addClass("input-wrapper"));
    $towDown.append($("<div><input>").addClass("input-wrapper"));
    $towHeight.append($("<div><input>").addClass("input-wrapper"));
    $gliderDown.append($("<div><input>").addClass("input-wrapper"));
    $towTime.append($("<div><input>").addClass("input-wrapper"));
    $gliderTime.append($("<div><input>").addClass("input-wrapper"));
    $towCost.append($("<div><input>").addClass("input-wrapper"));
    $gliderCost.append($("<div><input>").addClass("input-wrapper"));
    $landingFee.append($("<div><input>").addClass("input-wrapper"));
    $totalCost.append($("<div><input>").addClass("input-wrapper"));
    $comments.append($("<div><input>").addClass("input-wrapper"));

    $date.find("input").last().val(moment().format("DD MMM"));
    $flightNumber.find("input").last().val(getLastFlightNumber() + 1);
}

function addTimeToElem(ev) {
    const $target = $(ev.target);
    if ($takeOff.has($target).length || $towDown.has($target).length || $gliderDown.has($target).length) {
        $target.val(moment().format("HH:mm"));
        $target.trigger("keypress");
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
        addBlankRow();
    }
});

if (localStorageEnabled) {
    loadFromLocalStorage("latest");
}
addBlankRow();