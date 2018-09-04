"use strict";
var autocomplete;
var formElem                = document.getElementById("registration_form");
var dobDayElem              = document.querySelector("input[name=dob_day]");
var dobMonthElem            = document.querySelector("select[name=dob_month]");
var dobYearElem             = document.querySelector("input[name=dob_year]");
var dobElemForServer        = document.querySelector("input[name=F051birthdate]");
var addressElem             = document.querySelector("input[name=address]");
var streetElemForServer     = document.querySelector("input[name=full_aaddress]");
var suburbElemForServer     = document.querySelector("input[name=stre_aaddress]");
var cityElemForServer       = document.querySelector("input[name=city_aaddress]");

function getComponentsByTypeObject(address_components) {
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

// this is run when the Google Places API is loaded, it sets up the address autocomplete
google.maps.event.addDomListener(window, "load", function() {
    // starts autocomplete for the element "address"
    autocomplete = new google.maps.places.Autocomplete(
        addressElem,
        { types: ["address"] }
    );
});

formElem.addEventListener("submit", function(ev) {
    // Populate hidden DOB field
    var day = (dobDayElem.value < 10 ? "0" : "") + dobDayElem.value;
    dobElemForServer.value = day + dobMonthElem.value + dobYearElem.value;
    
    // Populate hidden address fields
    var place = autocomplete.getPlace();
    var components = getComponentsByTypeObject(place.address_components);
    var split_address = addressElem.value.split(", ");
    streetElemForServer.value = split_address[0];
    suburbElemForServer.value = split_address[1];
    cityElemForServer.value   = split_address[2] + " " + components["postal_code"];
    
    /* below code is nicer, but doesn't update when manually edited (e.g. to add a street number *
    streetElemForServer.value = components["street_number"] + " " + components["route"];
    suburbElemForServer.value = components["sublocality"];
    cityElemForServer.value = components["locality"] + " " + components["postal_code"];*/
});