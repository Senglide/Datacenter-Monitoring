var detailReading, startTime, endTime, shownReadings,
    detailsLoaded = false,
    allReadings = [],
    detailSettings = {'scope': 1, 'jump': 5};

function generateShownReadingObjects() {
    shownReadings = {}
    s_types.forEach((value, key) => {
        if(!key.includes(' ')) {
            shownReadings[key] = [];
        }
    });
    shownReadings['smoke'] = [];
    shownReadings['movement'] = [];
    shownReadings['graph'] = [];
}

function generateTimes() {
    var detailReadingDate = new Date(detailReading.date + 'T' + detailReading.time)
    detailReadingDate.setHours(detailReadingDate.getHours() - 1);
    startTime = detailReadingDate.getTime();
    detailReadingDate.setHours(detailReadingDate.getHours() + 2);
    endTime = detailReadingDate.getTime();
}

function getDetailReadings() {
    $.ajax({
        type: 'GET',
        url: 'get_all_readings_by_date/' + detailReading.rack + '/' + detailReading.date,
        dataType: 'json',
        success: function(response) {
            var i = 0,
                j = 0;
            response.readings.forEach(reading => {
                reading.datetime = new Date(reading.date + 'T' + reading.time);
                allReadings.unshift(reading);
                var readingTime = reading.datetime.getTime();
                if(!detailReading.id && reading.time.substring(0, 5) == detailReading.time.substring(0, 5)) {
                    detailReading.id = reading.id;
                }
                if(reading.sensor_type == detailReading.s_type && startTime < readingTime && readingTime < endTime) {
                    shownReadings.graph.unshift(reading);
                }
                if((startTime < readingTime && readingTime < endTime && j == 0) || reading.id == detailReading.id) {
                    var typeArray = shownReadings[reading.sensor_type];
                    typeArray.unshift(reading);
                    shownReadings[reading.sensor_type] = typeArray;
                }
                i ++;
                if(i == (s_types.size / 2) + 2) {
                    i = 0;
                    j ++;
                }
                if(j == 35) {
                    j = 0;
                }
            });
            if(detailReading.s_type == 'temp') {
                drawDetailGraph();
                generateTable();
            } else {
                adjustDetailScope();
            }
            detailsLoaded = true;
        }
    });
}

function drawDetailGraph() {
    var graph = new Graph('relatedReadings', detailReading.rack, detailReading.s_type, undefined, detailReading.id);
    graph.data = shownReadings.graph;
    graph.extremeData = [];
    graph.calculateExtremeData();
    graph.createGraph();
}

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

// Nav click handler
$('.homeLink').click(function() {
    sessionStorage.setItem('getDetails', 'false');
});

// Set rack click handler
$('#detailRack').on('click', '.detailRackMenu a' , function() {
    detailReading.rack = $(this).text();
    $(this).parent().siblings('button').text('Rack ' + detailReading.rack);
    checkToGetReadings();
});

// Set type click handler
$('#detailType').on('click', '.detailTypeMenu a' , function() {
    detailReading.s_type = s_types.get($(this).text())
    $(this).parent().siblings('button').text($(this).text());
    checkToGetReadings();
});

// Set date click handler
$('#datepicker').on('change.datetimepicker', function(e) {
    var inputDate = new Date(e.date);
    var newDate = inputDate.getFullYear() + '-' + ('0' + (inputDate.getMonth() + 1)).slice(-2) + '-' + ('0' + inputDate.getDate()).slice(-2);
    if(newDate !== detailReading.date) {
        detailReading.date = newDate;
        checkToGetReadings();
    }
    
});

// Set time click handler
$('#timepicker').on('change.datetimepicker', function(e) {
    var inputTime = new Date(e.date);
    var newTime = ('0' + inputTime.getHours()).slice(-2) + ':' + ('0' + inputTime.getMinutes()).slice(-2) + ':' + ('0' + inputTime.getSeconds()).slice(-2);
    if(!detailReading.time) {
        detailReading.time = newTime;
    } else {
        if(newTime.substring(0, 5) !== detailReading.time.substring(0, 5)) {
            detailReading.time = newTime;
            checkToGetReadings();
        }
    }
});

// Previous button click handler
$('#previousButton').click(function() {
    if(detailsLoaded) {
        var currentDate = new Date(detailReading.date + 'T' + detailReading.time);
        var newDate = new Date(currentDate.getTime() - (detailSettings.jump * 60000));
        detailReading.date = newDate.getFullYear() + '-' + ('0' + (newDate.getMonth() + 1)).slice(-2) + '-' + ('0' + newDate.getDate()).slice(-2);
        detailReading.time = ('0' + newDate.getHours()).slice(-2) + ':' + ('0' + newDate.getMinutes()).slice(-2) + ':' + ('0' + newDate.getSeconds()).slice(-2);
        checkDetailScope();
    }
});

// Check if new datetime lies in scope
function checkDetailScope() {
    var detailDatetime = new Date(detailReading.date + 'T' + detailReading.time);
    var lowestDatetime = new Date(allReadings[0].date + 'T' + allReadings[0].time);
    var highestDatetime = new Date(allReadings[allReadings.length - 1].date + 'T' + allReadings[allReadings.length  - 1].time);
    if( detailDatetime < lowestDatetime || highestDatetime <  detailDatetime) {
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
    var i = 0;
    allReadings.forEach(reading => {
        var readingTime = reading.datetime.getTime();
        if(!detailReading.id && detailReading.s_type == reading.sensor_type && reading.time.substring(0, 5) == detailReading.time.substring(0, 5)) {
            detailReading.id = reading.id;
        }
        if(reading.sensor_type == detailReading.s_type && startTime < readingTime && readingTime < endTime) {
            shownReadings.graph.push(reading);
        }
        if((startTime < readingTime && readingTime < endTime && i == 0) || reading.id == detailReading.id) {
            var typeArray = shownReadings[reading.sensor_type];
            typeArray.push(reading);
            shownReadings[reading.sensor_type] = typeArray;
        }
        i ++;
        if(i == 35) {
            i = 0;
        }
    })
    drawDetailGraph();
    generateTable();
}

// Check for complete detailReading object
function checkToGetReadings() {
    if(detailReading.rack && detailReading.s_type && detailReading.date && detailReading.time) {
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
    htmlString += '</button>';
    htmlString += '<div id="detailRackMenu" class="dropdown-menu detailRackMenu" aria-labelledby="detailRackDropdown">';
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
    htmlString += '</button>';
    htmlString += '<div id="detailTypeMenu" class="dropdown-menu detailTypeMenu" aria-labelledby="detailTypeDropdown">';
    s_types.forEach(s_type => {
        if(s_type.includes(' ')) {
            htmlString += '<a class="dropdown-item">' + s_type + '</a>';
        }
    });
    htmlString += '</div>';
    $('#detailType').html(htmlString);
}

// Startup script
if(sessionStorage.getItem('getDetails') == 'true') {
    detailReading = JSON.parse(sessionStorage.getItem('readingDetails'));
    var detailDate = new Date(detailReading.date);
    var pickerDate = ('0' + detailDate.getDate()).slice(-2)  + '/' + ('0' + (detailDate.getMonth() + 1)).slice(-2) + '/' + detailDate.getFullYear();
    $('#timepicker input').val(detailReading.time.substring(0, 5));
    $('#datepicker input').val(pickerDate);
    generateShownReadingObjects();
    generateTimes();
    getDetailReadings();
} else {
    detailReading = {};
}
createRacksDropdown();
createTypesDropdown();