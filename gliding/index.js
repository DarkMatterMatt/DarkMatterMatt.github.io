"use strict";
/***
 * All date/times are a Unix timestamp in milliseconds (milliseconds since the Unix Epoch [Jan 1 1970 12AM UTC])
 * Flight durations are also in milliseconds
 */

const VERSION = "1.0.0".split(".");
const settings = {
    dateRenderFormat: "DD MMM",
    timeRenderFormat: "HH:mm",
    dateParseFormats: ["DD-MM", "DD-MMM", "DD-MM-YY", "DD-MMM-YY", "DD-MM-YYYY", "DD-MMM-YYYY", "YYYY-MM-DD", "D-M", "D-MMM", "D-M-YY", "D-MMM-YY", "D-M-YYYY", "D-MMM-YYYY"],
    timeParseFormats: ["HH:mm", "H-m"],
    longPressTimeMs: 350,
};
const gliders = [];
const pilots = [];
const towPlanes = [];
const towPilots = [];

let rows = []; // list of Rows (Row is a list of Cells)

class Column {
    constructor(name, renderFunction, parseFunction) {
        this.name = name;
        this.elem = document.getElementById(name);
        this.$elem = $(this.elem);
        this.render = renderFunction || (v => v);
        this.parse = parseFunction || (v => v);
    }
}

const cols = [
    new Column("flightNumber"),
    new Column("date", v => moment(v).format(settings.dateRenderFormat), v => moment(v, settings.dateParseFormats).valueOf()),
    new Column("pilotInCommand"),
    new Column("studentPassenger"),
    new Column("glider"),
    new Column("towReg"),
    new Column("towPilot"),
    new Column("takeOff", v => moment(v).format(settings.timeRenderFormat), v => moment(v, settings.timeParseFormats).valueOf()),
    new Column("towDown", v => moment(v).format(settings.timeRenderFormat), v => moment(v, settings.timeParseFormats).valueOf()),
    new Column("towHeight"),
    new Column("gliderDown", v => moment(v).format(settings.timeRenderFormat), v => moment(v, settings.timeParseFormats).valueOf()),
    new Column("towTime", v => moment.utc(Math.round(v / 60000) * 60000).format("H:mm")),
    new Column("gliderTime", v => moment.utc(Math.round(v / 60000) * 60000).format("H:mm")),
    new Column("towCost", v => "$" + v.toFixed(2), v => parseFloat(v.replace(/[^\d\.]/g, ""))),
    new Column("gliderCost", v => "$" + v.toFixed(2), v => parseFloat(v.replace(/[^\d\.]/g, ""))),
    new Column("landingFee", v => "$" + v.toFixed(2), v => parseFloat(v.replace(/[^\d\.]/g, ""))),
    new Column("totalCost", v => "$" + v.toFixed(2), v => parseFloat(v.replace(/[^\d\.]/g, ""))),
    new Column("comments")
];

class Row {
    constructor(rowIndex) {
        this.rowIndex = rowIndex;

        // create a Cell for each column
        this.cells = [];
        for (let i = 0; i < cols.length; i++) {
            this.cells.push(Cell(rowIndex, i));
        }
    }
    addToDOM() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].addToDOM();
        }
    }
    isEmpty() {
        return this.cells.every(cell => cell.val() !== "");
    }
}

class Cell {
    constructor(rowIndex, colIndex) {
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this._parse = cols[this.colIndex].parse;
        this._render = cols[this.colIndex].render;
        this._val = "";
        this.inDOM = false;

        this.$wrapperDiv = $("<div>").addClass("input-wrapper");
        this.$input = $("<input>");
        this.$wrapperDiv.append(this.$input);

        this.$input.on("change", ev => {
            // parse user input
            if (this.$input.val()) {
                this._val = this._parse(this.$input.val());
            }

            save();

            // there should always be one blank row
            if (rows[rows.length - 1].isEmpty()) {
                insertRow();
            }
        });
    }
    addToDOM() {
        cols[this.colIndex].$elem.find("div").eq(this.rowIndex).after(this.$wrapperDiv);
        this.val(this.value);
    }
    val(newValue) {
        if (newValue === undefined) {
            return this._val;
        }
        this._val = newValue;
        this.$input.val(this._render(newValue));
    }
}

const colIndexMap = {};
cols.forEach((col, i) => colIndexMap[col.name] = i);

const $window = $(window);

class Aircraft {
    /*
    reg
    owner
    manufacturer
    model
    */
    constructor(registration) {
        this.registration(registration);
    }
    getOrSet(key, value) {
        if (value == undefined) {
            return this[key];
        }
        this[key] = value;
    }
    registration(newValue) {
        return this.getOrSet("registration", newValue);
    }
    manufacturer(newValue) {
        return this.getOrSet("manufacturer", newValue);
    }
    ownerName(newValue) {
        return this.getOrSet("ownerName", newValue);
    }
    ownerUniqueId(newValue) {
        return this.getOrSet("ownerUniqueId", newValue);
    }
    model(newValue) {
        return this.getOrSet("model", newValue);
    }
}
class Pilot {
    /*
    reg
    owner
    manufacturer
    model
    */
    constructor(firstName, lastName) {
        this.firstName(firstName);
        this.lastName(this.lastName = lastName);
    }
    getOrSet(key, value) {
        if (value == undefined) {
            return this[key];
        }
        this[key] = value;
    }
    firstName(newValue) {
        return this.getOrSet("firstName", newValue);
    }
    lastName(newValue) {
        return this.getOrSet("lastName", newValue);
    }
    uniqueId(newValue) {
        return this.getOrSet("uniqueId", newValue);
    }
}
class TowPlane extends Aircraft {
    constructor(registration) {
        super(registration);
    }
}
class Glider extends Aircraft {
    constructor(registration) {
        super(registration);
    }
}
class TowPilot extends Pilot {
    constructor(firstName, lastName) {
        super(firstName, lastName);
    }
}
class GliderPilot extends Pilot {
    constructor(firstName, lastName) {
        super(firstName, lastName);
    }
}

/* RENDER */

/* entries tab */
$.contextMenu({
    selector: "#entries_tab input",
    callback: (key, options) => {
        const [rowIndex, colIndex] = getIndexesFromInput(options.$trigger);
        switch (key) {
            case "insert":
                //insertRow(rowIndex);
                break;
            case "delete":
                //deleteRow(rowIndex);
                break;
        }
    },
    items: {
        "insert": {
            name: "Insert row above",
            icon: "add"
        },
        "delete": {
            name: "Delete row",
            icon: "delete"
        }
    }
});

function getFlightNumber(rowIndex) {
    // support negative indexing
    if (rowIndex < 0) {
        rowIndex += rows.length;
    }
    // returns the last flight number, else zero
    return rows[rowIndex][colIndexMap.flightNumber].val() || 0;
}

function insertRow(newRowIndex) {
    // default behaviour is append new row
    if (newRowIndex === undefined) {
        newRowIndex = rows.length;
    }

    // adds a (almost) blank row
    // contains pre-filled date (today) and flight number (increment last flight number)
    const row = Row(newRowIndex);
    row.addToDOM();
    row.cells[colIndexMap.date].val(moment());
    row.cells[colIndexMap.flightNumber].val(newRowIndex === 0 ? 1 : getFlightNumber(newRowIndex - 1) + 1);
    
    // if inserting, then increment all rowIndexes below it
    if (newRowIndex !== rows.length) {
        for (let i = newRowIndex; i < rows.length; i++) {
            rows[i].rowIndex++;
            for (let j = 0; j < rows[i].cells.length; j++) {
                rows[i].cells[j].rowIndex++;
            }
        }
    }
    rows.splice(newRowIndex, 0, row)

    save();
}

function deleteRow(rowIndex) {
    // support negative indexing
    if (rowIndex < 0) {
        rowIndex += rows.length;
    }

    // delete it from our stored data
    rows.splice(rowIndex, 1);
    save();

    // delete HTML elements
    for (let colIndex = 0; colIndex < cols.length; colIndex++) {
        cols[colIndex].$elem.find(".input-wrapper").eq(rowIndex).remove();
    }

    // there should always be one blank row
    if (!rows.length || !rows[rows.length - 1].isEmpty()) {
        insertRow();
    }
}

function save(name) {
    // save to localStorage
    localStorage.setItem(name || "autoSave", JSON.stringify({
        "entries": rows,
        "version": VERSION
    }));
}

function load(name) {
    // make backup
    save("backupBeforeLatestLoad");

    // load from localStorage
    let data = localStorage.getItem(name || "autoSave");

    // if there is nothing, there are obviously no rows
    if (!data) {
        rows = [];
    }
    // parse data and perform any required save migrations
    else {
        data = JSON.parse(data);
        rows = migrateSave(data.entries, data.version);
    }
    // render rows, if the last row isn't blank then add a blank row
    renderEntriesTab();
    if (!rows.length || !rowIsEmpty(-1)) {
        insertRow();
    }
}

function migrateSave(save, version) {
    if (version[0] == VERSION[0]) {
        return save;
    } else {
        const message = "ERROR: migrateSave: version [" + version.join(".") + "] is not supported.";
        window.alert(message);
        throw (message);
    }
}

function insertTime(ev) {
    // get which input was clicked (row, column)
    const [rowIndex, colIndex] = getIndexesFromInput($(ev.target));

    // add current Unix timestamp, save & render
    rows[rowIndex][colIndex] = +moment();
    save();
    renderEntriesTabRowCol(rowIndex, colIndex);

    // there should always be one blank row
    if (!rowIsEmpty(-1)) {
        insertRow();
    }
}

/* data tab */


/* settings tab */



/* EVENT LISTENERS */

// tab selection
$("#tab_selection .w3-button").on("click", ev => {
    // colour the correct tab button
    $("#tab_selection .w3-indigo").removeClass("w3-indigo");
    $(ev.target).addClass("w3-indigo");

    // show the correct tab
    $(".tab").addClass("w3-hide");
    $("#" + ev.target.id.replace("_btn", "_tab")).removeClass("w3-hide");
});

// Long press (>350ms) = insert time for take-off/landing
const longPressTimeoutIds = [];
// take off
cols[colIndexMap.takeOff].$elem.on("mousedown", ev => longPressTimeoutIds[0] = setTimeout(insertTime, settings.longPressTimeMs, ev));
cols[colIndexMap.takeOff].$elem.on("mouseup mouseleave", ev => clearTimeout(longPressTimeoutIds[0]));
// tow down
cols[colIndexMap.towDown].$elem.on("mousedown", ev => longPressTimeoutIds[1] = setTimeout(insertTime, settings.longPressTimeMs, ev));
cols[colIndexMap.towDown].$elem.on("mouseup mouseleave", ev => clearTimeout(longPressTimeoutIds[1]));
// glider down
cols[colIndexMap.gliderDown].$elem.on("mousedown", ev => longPressTimeoutIds[2] = setTimeout(insertTime, settings.longPressTimeMs, ev));
cols[colIndexMap.gliderDown].$elem.on("mouseup mouseleave", ev => clearTimeout(longPressTimeoutIds[2]));

/* INIT */
load();