// Script variables
var dashboardTimer,
    getAverage = false,
    doResetGrid = false,
    refreshSettings = {'time': 300000, 'amount': 30},
    connectionBlocks = {'prefix': 'get_newest_readings/', 'suffix': '/90'},
    backupSettings = {'refresh': refreshSettings, 'connection': connectionBlocks},
    gridDimensions = {'rows': 0, 'columns': 0},
    racks = [1, 2, 3]
    s_types = ['Temperature', 'Humidity'],
    gridcells = [];

// Grid change handlers
$('#rowMenu a').click(function() {
    gridDimensions.rows = parseInt($(this).text());
    doResetGrid = true;
    $('#rowDropdown').html(gridDimensions.rows);
});
$('#columnMenu a').click(function() {
    gridDimensions.columns = parseInt($(this).text());
    doResetGrid = true;
    $('#columnDropdown').html(gridDimensions.columns);
});

// Refresh toggle click handler
$('#refreshMenu a').click(function() {
    switch($(this).text()) {
        case '10 Seconds':
            refreshSettings.time = 10000;
            refreshSettings.amount = 1;
            break;
        case '5 Minutes':
            refreshSettings.time = 300000;
            refreshSettings.amount = 30;
            break;
    }
    $('#refreshDropdown').html($(this).text());
});

// Interval toggle click handler
$('#scopeMenu a').click(function() {
    switch($(this).text()) {
        case '15 Minutes':
            connectionBlocks.prefix = 'get_newest_readings/';
            connectionBlocks.suffix = '/90'
            getAverage = false;
            break;
        case '1 Hour':
            connectionBlocks.prefix = 'get_newest_readings/';
            connectionBlocks.suffix = '/360'
            getAverage = true;
            break;
        case '1 Day':
            connectionBlocks.prefix = 'get_todays_readings/';
            connectionBlocks.suffix = '';
            getAverage = true;
            break;
    }
    $('#scopeDropdown').html($(this).text());
});

// Save settings click handler
$('#saveSettings button').click(function() {
    if($(this).text() == 'Cancel') {
        refreshSettings = backupSettings.refresh;
        connectionSettings = backupSettings.connection;
    } else {
        if(doResetGrid) {
            resetGrid();
            doResetGrid = false;
        }
        if(gridcells.length > 0) {
            gridcells.forEach(gridcell => {
                if(gridcell.graph) {
                    gridcell.graph.connectionSettings.refreshString = 'get_newest_readings/' + gridcell.graph.rack + '/' + gridcell.graph.s_type + '/' + refreshSettings.amount;
                    gridcell.graph.connectionSettings.resetString = connectionBlocks.prefix + gridcell.graph.rack + '/' + gridcell.graph.s_type + connectionBlocks.suffix;
                }
            });
        }
        backupSettings.refresh = refreshSettings
        backupSettings.connection = connectionBlocks
        resetGraphs();
    }
    $('#settingsModal').modal('toggle');
});

// Create dashboard grid
function getGrid(rows = gridDimensions.rows, columns = gridDimensions.columns) {
    var gridString = '';
    for(var i = 1; i <= rows; i++) {
        gridString += '<div class="row">';
        for(var j = 1; j <= columns; j++) {
            var gridcellId = 'r' + i + 'c' + j;
            var gridcell = new Gridcell(gridcellId);
            gridcells.push({'gridcellId': gridcellId, 'gridcell': gridcell});
            gridString += '<div' + ' id="' + gridcellId + '" class="columns ' + getColumnClass(columns) + '">';
            gridString += gridcell.getHtml();
            gridString += '</div>';
        }
        gridString += '</div>';
    }
    $('#gridArea').html(gridString);
}

// Define column width
function getColumnClass(columns) {
    switch(columns) {
        case 1:
            return 'col-md-12';
        case 2:
            return 'col-md-6';
        case 3:
            return 'col-md-4';
    }
}

// Reset dashboard grid
function resetGrid() {
    gridcells = [];
    getGrid();
}

// Reset timer and data array
function resetGraphs() {
    if(dashboardTimer) {
        clearInterval(dashboardTimer);
    }
    gridcells.forEach(gridcell => {
        if(gridcell.graph) {
            gridcell.graph.getData(undefined, true, getAverage);
        }
    });
    resetTimer();
}

// Update graph every n seconds
function resetTimer() {
    dashboardTimer = setInterval(function() {
        gridcells.forEach(gridcell => {
            if(gridcell.graph) {
                gridcell.graph.getData(undefined, false, getAverage);
            }
        });
    }, refreshSettings.time);
}

// Graph setup handler
$('#gridArea').on('click', '.gridcellDropdown a' ,function() {
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == $(this).parent().parent().parent().parent().attr('id')) {
            if($(this).attr('class').includes('rackDropdown-item')) {
                gridcell.rack = parseInt($(this).text().substring(5, 6));
                $(this).parent().siblings('button').text('Rack ' + gridcell.rack);
            } else {
                switch($(this).text()) {
                    case 'Temperature':
                        gridcell.s_type = 'temp';
                        break;
                    case 'Humidity':
                        gridcell.s_type = 'hum';
                        break;
                }
                $(this).parent().siblings('button').text($(this).text());
            }
            if(gridcell.rack && gridcell.s_type) {
                if(gridcell.graph) {
                    gridcell.graph.rack = gridcell.rack;
                    gridcell.graph.s_type = gridcell.s_type;
                    gridcell.graph.updateConnectionSettings();
                } else {
                    var connectionInfo = {'resetString': connectionBlocks.prefix + gridcell.rack + '/' + gridcell.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + gridcell.rack + '/' + gridcell.s_type + '/' + refreshSettings.amount}
                    var graph = new Graph(gridcell.gridcellId, gridcell.rack, gridcell.s_type, connectionInfo)
                    gridcell.graph = graph;
                }
                resetGraphs();
            }
        }
    });
});

// Startup script
getGrid();