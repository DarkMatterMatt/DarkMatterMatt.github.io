"use strict";
var homeAutocomplete, postalAutocomplete;
var formElem                  = document.getElementById("registration_form");
var guardianSectionElem       = document.getElementById("guardian_section");
//var guardianDobDayElem      = document.querySelector("input[name=guardian_dob_day]");
//var guardianDobMonthElem    = document.querySelector("select[name=guardian_dob_month]");
var guardianDobYearElem       = document.querySelector("input[name=guardian_dob_year]");
var guardianNameElem          = document.querySelector("input[name=guardian_name]");
var dobDayElem                = document.querySelector("input[name=dob_day]");
var dobMonthElem              = document.querySelector("select[name=dob_month]");
var dobYearElem               = document.querySelector("input[name=dob_year]");
var dobElemForServer          = document.querySelector("input[name=F051birthdate]");
var homeAddressElem           = document.querySelector("input[name=home_address]");
var homeStreetElemForServer   = document.querySelector("input[name=full_haddress2]");
var homeSuburbElemForServer   = document.querySelector("input[name=stre_haddress2]"); // why is this called "stre_aaddress"?
var homeCityElemForServer     = document.querySelector("input[name=city_haddress2]");
var postalAddressElem         = document.querySelector("input[name=postal_address]");
var postalStreetElemForServer = document.querySelector("input[name=full_aaddress]");
var postalSuburbElemForServer = document.querySelector("input[name=stre_aaddress]");
var postalCityElemForServer   = document.querySelector("input[name=city_aaddress]");

function getComponentsByTypeObject(address_components) {
    // accepts a list of google address components
    // returns an object that maps the component type to a name
    var components = {};
    for (var i = 0; i < address_components.length; i++) {
        var component = address_components[i];
        var names = {
            long_name: component.long_name,
            short_name: component.short_name
        };
        for (var j = 0; j < component.types.length; j++) {
            var type = component.types[j];
            // initialize array if it isn't already present
            if (!components.hasOwnProperty(type)) {
                components[type] = [];
            }
            // append `names` if it isn't already in the components array 
            if (JSON.stringify(components[type]).indexOf(JSON.stringify(names)) == -1) {
                components[type].push(names);
            }
        }
    }
    return components;
}

function checkMemberAge() {
    // show guardian info box if the member is younger than 18
    if (dobYearElem.value && dobMonthElem.value && dobDayElem.value) {
        // calculate age
        var today = new Date();
        var birthDate = new Date(dobYearElem.value, dobMonthElem.value - 1, dobDayElem.value);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 18) {
            guardianSectionElem.classList.remove("w3-hide");
        }
        else {
            guardianSectionElem.classList.add("w3-hide");
        }
    }
}

// show guardian info box if the member is younger than 18
dobDayElem.addEventListener("change", checkMemberAge);
dobMonthElem.addEventListener("change", checkMemberAge);
dobYearElem.addEventListener("change", checkMemberAge);

// this is run when the Google Places API is loaded, sets up the address autocomplete
google.maps.event.addDomListener(window, "load", function() {
    // starts autocomplete for the element "home_address"
    homeAutocomplete = new google.maps.places.Autocomplete(
        homeAddressElem,
        { types: ["address"], sessiontoken: uuidv4() }
    );
    // starts autocomplete for the element "postal_address"
    postalAutocomplete = new google.maps.places.Autocomplete(
        postalAddressElem,
        { types: ["address"], sessiontoken: uuidv4() }
    );
});

formElem.addEventListener("submit", function(ev) {
    // Populate hidden DOB field
    var day = (dobDayElem.value < 10 ? "0" : "") + dobDayElem.value;
    dobElemForServer.value = day + dobMonthElem.value + dobYearElem.value;
    
    // Populate hidden home address fields
    var homeSplitAddress = homeAddressElem.value.split(", ");
    homeStreetElemForServer.value = homeSplitAddress[0] || "";
    if (homeSplitAddress.length >= 3) {
        homeSuburbElemForServer.value = homeSplitAddress[1] || "";
        homeCityElemForServer.value   = homeSplitAddress[2] || "";
    }
    else {
        homeCityElemForServer.value = homeSplitAddress[1] || "";
    }
    
    // Add post code from Google Place lookup
    var homePlace = homeAutocomplete.getPlace();
    if (homePlace) {
        var homeComponents = getComponentsByTypeObject(homePlace.address_components);
        homeCityElemForServer.value += " " + (homeComponents["postal_code"][0]["short_name"] || "");
    }
    
    /* this code is nicer, but doesn't update when manually edited (e.g. to add a street number)
    homeStreetElemForServer.value = components["street_number"] + " " + components["route"];
    homeSuburbElemForServer.value = components["sublocality"];
    homeCityElemForServer.value = components["locality"] + " " + components["postal_code"];*/
    
    // Populate hidden postal address fields
    if (postalAddressElem.value) {
        var postalSplitAddress = postalAddressElem.value.split(", ");
        postalStreetElemForServer.value = postalSplitAddress[0] || "";
        if (postalSplitAddress.length >= 3) {
            postalSuburbElemForServer.value = postalSplitAddress[1] || "";
            postalCityElemForServer.value   = postalSplitAddress[2] || "";
        }
        else {
            postalCityElemForServer.value = postalSplitAddress[1] || "";
        }
        
        // Add post code from Google Place lookup
        var postalPlace = postalAutocomplete.getPlace();
        if (postalPlace) {
            var postalComponents = getComponentsByTypeObject(postalPlace.address_components);
            postalCityElemForServer.value += " " + (postalComponents["postal_code"][0]["short_name"] || "");
        }
    }
    // If postal address is empty, copy the home address
    else {
        postalStreetElemForServer.value = homeStreetElemForServer.value;
        postalSuburbElemForServer.value = homeSuburbElemForServer.value;
        postalCityElemForServer.value   = homeCityElemForServer.value;
    }
    
    // If member doesn't have a parent or guardian put the library in that field
    if (!guardianNameElem.value) {
        guardianNameElem.value = "For inquiries about this membership please talk to your community manager.";
    }
});

// don't allow birth dates that are in the future (or younger than 18 for the guardian)
var today = new Date();
dobYearElem.setAttribute("max", today.getFullYear());
guardianDobYearElem.setAttribute("max", today.getFullYear() - 18);
