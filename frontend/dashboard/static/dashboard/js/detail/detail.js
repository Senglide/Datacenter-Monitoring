// Script variables
var detailReading, startTime, endTime, shownReadings, indeces, backupSettings, averages, graph,
    detailsLoaded = false,
    allReadings = [],
    detailSettings = {
        'scope': 7800,
        'jump': 300,
        'interval': 300,
        'numberOfTables': 1
    };

// Ajax listener to show preloader
$(document).ajaxStart(function () {
    $('#detailBody').html('<tr><td><img id="preloader" src="/static/dashboard/images/ajax-loader.gif"></td></tr>');
});

// Set backup settings
function setBackupSettings() {
    backupSettings = {
        'scope': detailSettings.scope,
        'jump': detailSettings.jump,
        'interval': detailSettings.interval,
        'numberOfTables': detailSettings.numberOfTables
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
            allReadings = [];
            detailsLoaded = false;
            generateShownReadings(response.readings, true);
            detailsLoaded = true;
        }
    });
}

// Draw the detail graph
function drawDetailGraph() {
    graph = new Graph('detail', detailReading.rack, detailReading.s_type, undefined, detailReading.id);
    graph.data = {};
    graph.data['shownDetailGraph'] = shownReadings.graph;
    graph.calculateMinMax();
    graph.erase();
    graph.createGraph();
}

// Generate timestamp table
function generateTimestampTable() {
    var htmlString = '';
    var j = 0;
    for(var i = 0; i < shownReadings[detailReading.s_type].length; i++) {
        if(i == 0) {
            htmlString += '<tr><th>&nbsp;</th></tr>';
        } else if(i == 1) {
            htmlString += '<tr><td>Average</td></tr>';
        } else {
            htmlString += '<tr><td>' + shownReadings[detailReading.s_type][j].time.substring(0, 8) + '</td></tr>';
            j ++;
        }
    }
    $('#timestampTable table').html(htmlString);
}

// Generate alarms table
function generateAlarmsTable() {
    var htmlString = '';
    var j = 0;
    for(var i = 0; i < shownReadings[detailReading.s_type].length; i++) {
        htmlString += '<tr>';
        alarm_types.forEach(alarm_type => {
            if(i == 0) {
                if(detailSettings.numberOfTables == 1) {
                    htmlString += '<th>' + alarm_type.substring(0, 1).toUpperCase() + alarm_type.substring(1, alarm_type.length) + '</th>';
                } else {
                    htmlString += '<th>' + alarm_type.substring(0, 1).toUpperCase() + '</th>';
                }
            } else if(i == 1) {
                htmlString += '<td>&nbsp;</td>';
            } else {
                htmlString += '<td>' + shownReadings[alarm_type][j].sensor_value + '</td>';
            }
        });
        if(i > 1) {
            j ++;
        }
        htmlString += '</tr>';
    }
    $('#alarmTable table').html(htmlString); 
}

// Generate value table
function generateValuesTable() {
    var htmlString = '';

    for(var i = 0; i < detailSettings.numberOfTables; i++) {
        if(detailSettings.numberOfTables == 1) {
            htmlString += '<div class="col-sm-12">';
        } else {
            htmlString += '<div class="col-sm-6">';
        }
        htmlString += '<table>';
        var j = 0;
        for(var k = 0; k < shownReadings[detailReading.s_type].length; k++) {
            htmlString += '<tr>';
            if(k == 0) {
                s_types.forEach((value, key) => {
                    if(key.includes(' ')) {
                        var headerString = '',
                            keyPieces = key.split(' ');
                        keyPieces.forEach((keyPiece, index) => {
                            if(index == 0) {
                                if(detailSettings.numberOfTables == 1) {
                                    headerString += keyPiece.substring(0, 3) + '.';
                                } else {
                                    headerString += keyPiece.substring(0, 1);
                                }
                            } else {
                                if(detailSettings.numberOfTables == 1) {
                                    headerString += ' ' + keyPiece;
                                } else {
                                    if(index == keyPieces.length - 1) {
                                        headerString += ' ' + keyPiece;
                                    } else {
                                        headerString += keyPiece.substring(0, 1).toUpperCase();
                                    }
                                }
                            }
                        });
                        htmlString += '<th>' + headerString + '</th>';
                    }
                });
            } else if(k == 1) {
                s_types.forEach((value, key) => {
                    if(!key.includes(' ')) {
                        htmlString += '<td>' + Math.round(averages[key].average) + '</td>';
                    }
                });
            } else {
                s_types.forEach((value, key) => {
                    if(!key.includes(' ')) {
                        htmlString += '<td>' + shownReadings[key][j].sensor_value + '</td>';
                    }
                });
                j ++;
            }
            htmlString += '</tr>';
        }
        htmlString += '</table></div>';
    }
    
    $('#valueTable').html(htmlString);
}

// Generate detail table with values
function generateTable() {
    $('#detailBody').html('');
    var htmlString = '';
    var k = 0;
    var types = getTableHeaders().types;
    var fullTypes = getTableHeaders().fullTypes;
    for(var i = 0; i < shownReadings[detailReading.s_type].length; i++) {
        htmlString += '<tr>';
        // Table headers row
        if(i == 0) {
            htmlString += '<td></td>';
            fullTypes.forEach(fullType => {
                var headerString = '',
                    keyPieces = fullType.split(' ');
                if(keyPieces.length > 1) {
                    keyPieces.forEach((keyPiece, index) => {
                        if(index != keyPieces.length - 1) {
                            headerString += keyPiece.substring(0, 1).toUpperCase();
                        } else {
                            headerString += ' ' + keyPiece;
                        }
                    });
                } else {
                    headerString = fullType.substring(0, 1);
                }

                htmlString += '<th>' + headerString + '</th>';
            });
        // Averages row
        } else if(i == 1) {
            htmlString += '<td>Average</td>';
            s_types.forEach((value, key) => {
                if(!key.includes(' ')) {
                    htmlString += '<td>' + Math.round(averages[key].average) + '</td>';
                }
            });
            htmlString += '<td></td><td></td>';
        // Value rows
        } else {
            var isDetailTarget = false;
            if(shownReadings[detailReading.s_type][k].id == detailReading.id) {
                htmlString += '<td class="detailTarget">' + shownReadings[detailReading.s_type][k].time.substring(0, 8) + '</td>';
                isDetailTarget = true;
            } else {
                htmlString += '<td>' + shownReadings[detailReading.s_type][k].time.substring(0, 8) + '</td>';
            }
            types.forEach(type => {
                if(k < shownReadings[type].length) {
                    if(isDetailTarget) {
                        htmlString += '<td class="detailTarget">' + shownReadings[type][k].sensor_value + '</td>';
                    } else {
                        htmlString += '<td>' + shownReadings[type][k].sensor_value + '</td>';
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
    if(detailsLoaded) {
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
}

// Adjust detail scope
function adjustDetailScope() {
    generateShownReadingObjects(false);
    detailReading.id = undefined;
    generateShownReadings(allReadings, false); 
}

// Generate empty shownReadings object
function generateShownReadingObjects(isNewData) {
    shownReadings = {};
    indeces = {};
    if(isNewData) {
        averages = {};
    }
    s_types.forEach((value, key) => {
        if(!key.includes(' ')) {
            shownReadings[key] = [];
            indeces[key] = 0;
            if(isNewData) {
                averages[key] = {'totalSum': 0, 'totalCount': 0, 'average': 0};
            }
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
        // If it is new data put every reading in the allreadings array
        if(isNewData) {
            reading.datetime = new Date(reading.date + 'T' + reading.time);
            allReadings.unshift(reading);
            if(s_types.get(reading.sensor_type)) {
                averages[reading.sensor_type].totalSum += reading.sensor_value;
                averages[reading.sensor_type].totalCount ++;
            }
        }
        var readingTime = reading.datetime.getTime();
        // Check if the reading is the selected reading
        if(!detailReading.id && detailReading.s_type == reading.sensor_type && reading.time.substring(0, 5) == detailReading.time.substring(0, 5)) {
            detailReading.id = reading.id;
        }
        // Check if the reading lies in the graph scope
        if(reading.sensor_type == detailReading.s_type && startTime < readingTime && readingTime < endTime) {
            if(isNewData) {
                shownReadings.graph.unshift(reading);
            } else {
                shownReadings.graph.push(reading);
            }
        }
        // Check if the reading lies in the detail page scope
        if((startTime < readingTime && readingTime < endTime && indeces[reading.sensor_type] == 0) || reading.id == detailReading.id) {
            var typeArray = shownReadings[reading.sensor_type];
            if(isNewData) {
                typeArray.unshift(reading);
            } else {
                typeArray.push(reading);
            }
            shownReadings[reading.sensor_type] = typeArray;
        }
        // Manage indeces so the detail page interval is applied
        indeces[reading.sensor_type] ++;
        if(indeces[reading.sensor_type] == (detailSettings.interval / 10)) {
            indeces[reading.sensor_type] = 0;
        }
    });
    // Calculate averages for new data
    if(isNewData) {
        for(var averageInfo in averages) {
            var average = averages[averageInfo];
            average.average = average.totalSum / average.totalCount;
        }
    }
    // Draw the detail page
    drawDetailGraph();
    generateTimestampTable();
    generateAlarmsTable();
    generateValuesTable();
    // generateTable();
}

// Check for complete detailReading object
function checkToGetReadings() {
    if(detailReading.rack && detailReading.date) {
        if(!detailReading.time) {
            detailReading.time = defaultDetailVariables.time;
            setPickerDatetimeValues();
        }
        if(!detailReading.s_type) {
            detailReading.s_type = defaultDetailVariables.s_type;
            $('#detailTypeDropdown').html(s_types.get(detailReading.s_type));
        }
        $('#detailPageTitle').html('Data for ' + detailReading.date + ', rack ' + detailReading.rack);
        detailReading.id = undefined;
        generateShownReadingObjects(true);
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
    generateShownReadingObjects(true);
    generateTimes();
    getDetailReadings();
} else {
    detailReading = {};
}
createRacksDropdown();
createTypesDropdown();
createSettingsModal();