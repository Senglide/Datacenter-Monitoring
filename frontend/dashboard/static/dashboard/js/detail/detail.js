// Script variables
var detailReading, startTime, endTime, shownReadings, indeces, backupSettings,
    detailsLoaded = false,
    allReadings = [],
    detailSettings = {
        'scope': 7800,
        'jump': 300,
        'interval': 300
    };

// Ajax listener to show preloader
$(document).ajaxStart(function () {
    $('#detailBody').html('<tr><td><img id="preloader" src="/static/dashboard/images/ajax-loader.gif"></td></tr>')
});

// Set backup settings
function setBackupSettings() {
    backupSettings = {
        'scope': detailSettings.scope,
        'jump': detailSettings.jump,
        'interval': detailSettings.interval
    };
}

// Generate the times that determin the page scope
function generateTimes() {
    var detailReadingDate = new Date(detailReading.date + 'T' + detailReading.time)
    startTime = new Date(detailReadingDate.getTime() - (detailSettings.scope * 1000 / 2)).getTime();
    endTime = new Date(detailReadingDate.getTime() + (detailSettings.scope * 1000 / 2)).getTime();
}

// Get all readings for a certain date
function getDetailReadings() {
    $('#detailGraph, #detailBody').html('');
    $.ajax({
        type: 'GET',
        url: 'get_all_readings_by_date/' + detailReading.rack + '/' + detailReading.date,
        dataType: 'json',
        success: function(response) {
            detailsLoaded = false;
            generateShownReadings(response.readings, true);
            detailsLoaded = true;
        }
    });
}

// Draw the detail graph
function drawDetailGraph() {
    var graph = new Graph('detail', detailReading.rack, detailReading.s_type, undefined, detailReading.id);
    graph.data = shownReadings.graph;
    graph.extremeData = [];
    graph.calculateExtremeData();
    graph.createGraph();
}

// Generate detail table with values
function generateTable() {
    $('#detailBody').html('');
    var htmlString = '';
    var k = 0;
    for(var i = 0; i < shownReadings[detailReading.s_type].length; i++) {
        htmlString += '<tr>';
        if(i == 0) {
            htmlString += '<td></td>';
            s_types.forEach((value, key) => {
                if(key.includes(' ')) {
                    htmlString += '<th>' + key + '</th>';
                }
            });
        } else {
            var isDetailTarget = false;
            if(shownReadings[detailReading.s_type][k].id == detailReading.id) {
                htmlString += '<td class="detailTarget">' + shownReadings[detailReading.s_type][k].time.substring(0, 8) + '</td>';
                isDetailTarget = true;
            } else {
                htmlString += '<td>' + shownReadings[detailReading.s_type][k].time.substring(0, 8) + '</td>';
            }
            s_types.forEach((value, key) => {
                if(!key.includes(' ')) {
                    if(k < shownReadings[key].length) {
                        if(isDetailTarget) {
                            htmlString += '<td class="detailTarget">' + shownReadings[key][k].sensor_value + '</td>';
                        } else {
                            htmlString += '<td>' + shownReadings[key][k].sensor_value + '</td>';
                        }
                    }
                }
            });
            isDetailTarget = false;
            k ++;
        }
        htmlString += '</tr>';
    }
    $('#detailBody').html(htmlString);
}

// Adjust detailReading time
function adjustDetailTime(isPreviousButton) {
    if(detailsLoaded) {
        var currentDate = new Date(detailReading.date + 'T' + detailReading.time);
        if(isPreviousButton) {
            var newDate = new Date(currentDate.getTime() - (detailSettings.jump * 1000));
        } else {
            var newDate = new Date(currentDate.getTime() + (detailSettings.jump * 1000));
        }
        detailReading.date = newDate.getFullYear() + '-' + ('0' + (newDate.getMonth() + 1)).slice(-2) + '-' + ('0' + newDate.getDate()).slice(-2);
        detailReading.time = ('0' + newDate.getHours()).slice(-2) + ':' + ('0' + newDate.getMinutes()).slice(-2) + ':' + ('0' + newDate.getSeconds()).slice(-2);
        checkDetailScope();
        setPickerDatetimeValues();
    }
}

// Check if new datetime lies in scope
function checkDetailScope() {
    var detailDatetime = new Date(detailReading.date + 'T' + detailReading.time);
    var lowestDatetime = new Date(allReadings[0].date + 'T' + allReadings[0].time);
    var highestDatetime = new Date(allReadings[allReadings.length - 1].date + 'T' + allReadings[allReadings.length  - 1].time);
    if(detailDatetime < lowestDatetime || highestDatetime <  detailDatetime) {
        checkToGetReadings();
    } else {
        generateTimes();
        adjustDetailScope();
    }
}

// Adjust detail scope
function adjustDetailScope() {
    generateShownReadingObjects();
    detailReading.id = undefined;
    generateShownReadings(allReadings, false); 
}

// Generate empty shownReadings object
function generateShownReadingObjects() {
    shownReadings = {};
    indeces = {};
    s_types.forEach((value, key) => {
        if(!key.includes(' ')) {
            shownReadings[key] = [];
            indeces[key] = 0;
        }
    });
    shownReadings['smoke'] = [];
    indeces['smoke'] = 0;
    shownReadings['movement'] = [];
    indeces['movement'] = 0;
    shownReadings['graph'] = [];
}

// Generate shown readings from all readings
function generateShownReadings(readings, isNewData) {
    readings.forEach(reading => {
        if(isNewData) {
            reading.datetime = new Date(reading.date + 'T' + reading.time);
            allReadings.unshift(reading);
        }
        var readingTime = reading.datetime.getTime();
        if(!detailReading.id && detailReading.s_type == reading.sensor_type && reading.time.substring(0, 5) == detailReading.time.substring(0, 5)) {
            detailReading.id = reading.id;
        }
        if(reading.sensor_type == detailReading.s_type && startTime < readingTime && readingTime < endTime) {
            if(isNewData) {
                shownReadings.graph.unshift(reading);
            } else {
                shownReadings.graph.push(reading);
            }
        }
        if((startTime < readingTime && readingTime < endTime && indeces[reading.sensor_type] == 0) || reading.id == detailReading.id) {
            var typeArray = shownReadings[reading.sensor_type];
            if(isNewData) {
                typeArray.unshift(reading);
            } else {
                typeArray.push(reading);
            }
            shownReadings[reading.sensor_type] = typeArray;
        }
        indeces[reading.sensor_type] ++;
        if(indeces[reading.sensor_type] == (detailSettings.interval / 10)) {
            indeces[reading.sensor_type] = 0;
        }
    });
    drawDetailGraph();
    generateTable();
}

// Check for complete detailReading object
function checkToGetReadings() {
    if(detailReading.rack && detailReading.s_type && detailReading.date) {
        if(!detailReading.time) {
            detailReading.time = '12:00:00';
            setPickerDatetimeValues();
        }
        detailReading.id = undefined;
        generateShownReadingObjects();
        generateTimes();
        getDetailReadings();
    }
}

// Date and time picker configuration
$('#datepicker').datetimepicker({
    format: 'L',
    locale: 'nl-be'
});
$('#timepicker').datetimepicker({
    format: 'LT',
    locale: 'et'
});

// Create racks dropdown
function createRacksDropdown() {
    var htmlString = '';
    htmlString += '<button class="btn btn-outline-secondary btn-sm dropdown-toggle vertical" type="button" id="detailRackDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
    if(detailReading.rack) {
        htmlString += 'Rack ' + detailReading.rack;
    } else {
        htmlString += 'Rack';
    }
    htmlString += '</button><div id="detailRackMenu" class="dropdown-menu detailRackMenu" aria-labelledby="detailRackDropdown">';
    racks.forEach(rack => {
        htmlString += '<a class="dropdown-item">' + rack + '</a>';
    });
    htmlString += '</div>';
    $('#detailRack').html(htmlString);
}

// Create types dropdown
function createTypesDropdown() {
    var htmlString = '';
    htmlString += '<button class="btn btn-outline-secondary btn-sm dropdown-toggle vertical" type="button" id="detailTypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
    if(detailReading.s_type) {
        htmlString += s_types.get(detailReading.s_type);
    } else {
        htmlString += 'Type';
    }
    htmlString += '</button><div id="detailTypeMenu" class="dropdown-menu detailTypeMenu" aria-labelledby="detailTypeDropdown">';
    s_types.forEach(s_type => {
        if(s_type.includes(' ')) {
            htmlString += '<a class="dropdown-item">' + s_type + '</a>';
        }
    });
    htmlString += '</div>';
    $('#detailType').html(htmlString);
}

// Create settings modal body
function createSettingsModal() {
    detailSettingsOptions.forEach((settings, type) => {
        var htmlString = '<button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="' + type + 'Dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + settings.get(detailSettings[type]) + '</button><div id="' + type + 'Menu" class="dropdown-menu" aria-labelledby="' + type + 'Dropdown">';
        settings.forEach((key, value) => {
            if(typeof(key) == 'string') {
                htmlString += '<a class="dropdown-item">' + key + '</a>';
            }
        });
        htmlString += '</div>'
        var divId = '#' + type + 'Setting';
        $(divId + ' .dropdown').html(htmlString);
    });
}

// Set date and timepicker values
function setPickerDatetimeValues() {
    var detailDate = new Date(detailReading.date);
    var pickerDate = ('0' + detailDate.getDate()).slice(-2)  + '/' + ('0' + (detailDate.getMonth() + 1)).slice(-2) + '/' + detailDate.getFullYear();
    $('#timepicker input').val(detailReading.time.substring(0, 5));
    $('#datepicker input').val(pickerDate);
}

// Startup script
if(sessionStorage.getItem('getDetails') == 'true') {
    detailReading = JSON.parse(sessionStorage.getItem('readingDetails'));
    setPickerDatetimeValues();
    generateShownReadingObjects();
    generateTimes();
    getDetailReadings();
} else {
    detailReading = {};
}
createRacksDropdown();
createTypesDropdown();
createSettingsModal();