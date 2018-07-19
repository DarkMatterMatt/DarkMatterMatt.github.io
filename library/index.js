"use strict";

// function to push a download (e.g. browsingHistory.csv)
function download(filename, downloadText) {
    // create a "a" tag to download
    var elem = document.createElement("a");
    
    // add data and filename, make it invisible
    elem.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(downloadText));
    elem.setAttribute("download", filename);
    elem.style.display = "none";
    
    // add the element, click it to download, then remove it
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

// important elements
var delimiterPanel = document.getElementById("delimiter_panel");
var convertElem    = document.getElementById("convert");
var resetElem      = document.getElementById("reset");
var downloadElem   = document.getElementById("download");
var textareaElem   = document.getElementById("textarea");

// convert button click handler
convertElem.addEventListener("click", function(ev) {
    // get which delimiter is pressed (from radio buttons)
    var delimiter = document.querySelector("input[name='delimiter']:checked").value;
    var delimiterLookup = {
        "comma": ",",
        "pipe": "|",
        "tab": "\t"
    }
    delimiter = delimiterLookup[delimiter];

    // get data to process from the textarea, do nothing if there isn't any
    var data = textareaElem.value;
    if (!data.trim())
        return;
    
    // if the data is copy-pasted, there may be garbage at the start, remove it
    data = data.replace("Return To Previous Screen Clear Saved Records", "");
    
    // each section may wrap over multiple lines (indented by tabs + spaces), join onto one line
    data = data.replace(/\n[ \t\r]+/g, " ");
    
    // each record is split by a blank newline
    if (data.indexOf("\n\n") === -1) {
        data = data.replace(/Record/g, "\nRecord");
    }
    var books = data.split("\n\n");
    
    // regular expression to extract record number from the record line
    var regRecord = new RegExp(/Record (\d+)/);
    
    // array to hold the books processed, starts with a title line
    var booksProcessed = [["Record #", "Author", "Title", "Publication Info"].join(delimiter)];
    
    // loop through all books
    for (var i = 0; i < books.length; i++) {
        // if there is no info, don't try process it
        var book = books[i];
        if (!book) {
            continue;
        }
        
        // book info
        var record = ""; // record number
        var author = []; // author
        var title  = []; // title
        var pub    = []; // publication info

        // each line has a new piece of information
        var lines = book.split("\n");
        
        // loop through info
        for (var j = 0; j < lines.length; j++) {
            var line = lines[j];
            
            // handle line with the record number
            if (line.startsWith("Record")) {
                var match = line.match(regRecord);
                if (match) {
                    record = match[1];
                }
            }
            // handle line with the author
            else if (line.startsWith("AUTHOR")) {
                author.push(line.replace("AUTHOR", "").trim());
            }
            // handle line with the title
            else if (line.startsWith("TITLE")) {
                title.push(line.replace("TITLE", "").trim());
            }
            // handle line with publication info
            else if (line.startsWith("PUB INFO")) {
                pub.push(line.replace("PUB INFO", "").trim());
            }
        }
        
        // join array of information into a string (single field in CSV)
        author = author.join(", ");
        title  = title.join(", ");
        pub    = pub.join(", ");
        
        // CSV files have quotes double quoted, and quotes around each field (if there is a comma in the field)
        if (delimiter == ",") {
            if (author.indexOf(",") !== -1) {
                author = '"' + author.replace(/"/g, '""') + '"';
            }
            if (title.indexOf(",") !== -1) {
                title = '"' + title.replace(/"/g, '""') + '"';
            }
            if (pub.indexOf(",") !== -1) {
                pub = '"' + pub.replace(/"/g, '""') + '"';
            }
        }
        
        // add the processed book to the list
        booksProcessed.push([record, author, title, pub].join(delimiter));
    }
    // 
    textareaElem.value = booksProcessed.join("\n");
    
    // show/hide relavant buttons & options
    delimiterPanel.classList.add("invisible");
    convertElem.classList.add("w3-hide");
    resetElem.classList.remove("w3-hide");
    if (delimiter == ",")
        downloadElem.classList.remove("w3-hide");
});

// reset button click handler
resetElem.addEventListener("click", function(ev) {
    textareaElem.value = "";
    
    // show/hide relavant buttons & options
    delimiterPanel.classList.remove("invisible");
    convertElem.classList.remove("w3-hide");
    resetElem.classList.add("w3-hide");
    downloadElem.classList.add("w3-hide");
});

// download button click handler
downloadElem.addEventListener("click", function(ev) {
    download("browsingHistory.csv", textareaElem.value);
});