// Lookup type handler
$('#lookupTypeMenu a').click(function() {
    switch($(this).text()) {
        case 'Time range':
            $('#rangeFromRow').prop('hidden', false);
            $('#rangeToRow').prop('hidden', false);
            $('#historyTypeRow').prop('hidden', true);
            $('#historyAmountRow').prop('hidden', true);
            break;
        case 'History':
            $('#rangeFromRow').prop('hidden', true);
            $('#rangeToRow').prop('hidden', true);
            $('#historyTypeRow').prop('hidden', false);
            break;
    }
    $('#lookupTypeDropdown').html($(this).text());
});

// Set from date handler
$('#datepickerFrom').on('change.datetimepicker', function(e) {
    rangeFromDate = new Date(e.date._d);
    if(rangeToDate && rangeFromDate > rangeToDate) {
        $('#errorModal').modal('toggle');
    } else {
        checkToGetRange();
    }
});

// Set to date handler
$('#datepickerTo').on('change.datetimepicker', function(e) {
    rangeToDate = new Date(e.date._d);
    if(rangeFromDate && rangeToDate < rangeFromDate) {
        $('#errorModal').modal('toggle');
    } else {
        checkToGetRange();
    }
});

// Set history type handler
$('#historyTypeRow a').click(function() {
    $('#historyTypeDropdown').html($(this).text());
    $('#historyAmountRow').prop('hidden', false);   
    switch($(this).text()) {
        case '10 Seconds':
            generateAmountDropdown(5);
            amountOfSeconds = 10;
            break;
        case '1 Minute':
            generateAmountDropdown(59);
            amountOfSeconds = 60;
            break;
        case '1 Hour':
            generateAmountDropdown(23);
            amountOfSeconds = 3600;
            break;
        case '1 Day':
            generateAmountDropdown(6);
            amountOfSeconds = 86400;
            break;
        case '1 Week':
            generateAmountDropdown(3);
            amountOfSeconds = 604800;
            break;
        case '1 Month':
            generateAmountDropdown(11);
            amountOfSeconds = 2592000;
            break;
        case '1 Year':
            generateAmountDropdown(25);
            amountOfSeconds = 31536000;
            break;
    }
});

// Set history amount handler
$('#setupCol3').on('click', '.historyAmountDropdown-item', function() {
    multiplicationFactor = parseInt($(this).text());
    $('#historyAmountDropdown').html($(this).text());
    $('#gridArea').prop('hidden', false);
    getReadings('get_all_readings_since_date/' + getRackString() + '/' + (Math.round((new Date).getTime() / 1000) - (multiplicationFactor * amountOfSeconds)).toString());
});

// Set gridcell rackString handler
$('#graphsDiv').on('click', '.form-check-input' , function() {
    var inputRack = $(this).attr('id').substring($(this).attr('id').length - 1);
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == $(this).parents().eq(6).attr('id')) {
            var rackString;
            if(gridcell.rack) {
                rackString = gridcell.rack + '-';
            } else {
                rackString = '-'
            }
            if(rackString) {
                if(rackString.includes(inputRack)) {
                    rackString = rackString.replace(inputRack + '-', '');
                } else {
                    rackString += inputRack;
                }
            } else {
                rackString = inputRack;
            }
            if(rackString[rackString.length - 1] == '-') {
                rackString = rackString.substring(0, rackString.length - 1);
            }
            if(rackString[0] == '-') {
                rackString = rackString.substring(1, rackString.length);
            }
            gridcell.rack = rackString;
            gridcell.graph.rack = rackString;
            gridcell.graph.data = getAlteredGraphData(gridcell.gridcellId, rackString);
            gridcell.graph.erase();
            if(rackString != '') {
                gridcell.graph.calculateMinMax();
                gridcell.graph.createGraph();    
            }
        }
    });
});