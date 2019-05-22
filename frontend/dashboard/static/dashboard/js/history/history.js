var rangeFromDate, rangeToDate, allCollections, gridcells, amountOfSeconds, multiplicationFactor;

function checkToGetRange() {
    if(rangeFromDate && rangeToDate) {
        $('#gridArea').prop('hidden', false);
        getReadings('get_all_readings_by_range/' + getRackString() + '/' + Math.round((rangeFromDate.getTime() / 1000)) + '/' + Math.round((rangeToDate.getTime() / 1000)));
    }
}

// Ajax listener to show preloader
$(document).ajaxStart(function () {
    $('#gridArea').html('<img id="preloader" src="/static/dashboard/images/ajax-loader.gif">');
});

function getReadings(connectionString) {
    $.ajax({
        type: 'GET',
        url: connectionString,
        dataType: 'json',
        success: function(response) {
            createGraphs(response.all_readings);
        }
    });
}

function generateAmountDropdown(amount) {
    var htmlString = '';
    for(var i = 0; i < amount; i++) {
        htmlString += '<a class="dropdown-item historyAmountDropdown-item">' + (i + 1) + '</a>';
    }
    $('#historyAmountMenu').html(htmlString);
}

function createGraphs(data) {
    allCollections = {};
    gridcells = [];
    var htmlString = '';
    s_types.forEach((value, s_type) => {
        if(!s_type.includes(' ')) {
            var gridcell = new Gridcell(s_type);
            gridcell.s_type = s_type;
            gridcell.rack = getRackString();
            allCollections[s_type] = {};
            racks.forEach(rack => {
                allCollections[s_type][rack] = [];
            });
            Object.keys(data).forEach(key => {
                data[key].forEach(reading => {
                    if(s_type == reading.sensor_type) {
                        reading.datetime = new Date(reading.date + 'T' + reading.time);
                        allCollections[s_type][reading.rack].unshift(reading);
                    }
                });
            });
            var graph = new Graph(s_type, getRackString(), s_type, undefined, undefined, true);
            graph.data = allCollections[s_type];
            gridcell.graph = graph;
            gridcells.push(gridcell);
            htmlString += '<div id="' + s_type + '" class="row"><div class="columns col-sm">';
            htmlString += gridcell.getHtml();
            htmlString += '</div></div>';    
        }
    });
    $('#gridArea').html(htmlString);
    gridcells.forEach(gridcell => {
        gridcell.createColorPickers();
        gridcell.graph.resize();
        gridcell.graph.calculateMinMax();
        gridcell.graph.createGraph();
        gridcell.calculateMargins();
    });
}

function getAlteredGraphData(s_type, rackString) {
    var newGraphData = {};
    Object.keys(allCollections[s_type]).forEach(key => {
        if(rackString.includes(key)) {
            newGraphData[key] = allCollections[s_type][key];
        }
    });
    return newGraphData;
}

// Datepicker configuration
$('#datepickerFrom, #datepickerTo').datetimepicker({
    locale: 'nl-be'
});

// Resize graphs on window width change
$(window).resize(function () {
    if(gridcells) {
        gridcells.forEach(gridcell => {
            if(gridcell.graph) {
                gridcell.graph.erase();
                gridcell.graph.resize();
                gridcell.graph.createGraph();
                gridcell.calculateMargins();
            }
        });    
    }
});