// Script variables
var dashboardTimer, backupSettings,
    refreshSettings = {'time': 300000, 'amount': 30},
    connectionBlocks = {'prefix': 'get_newest_readings/', 'suffix': '/90'},
    gridDimensions = {'rows': 1, 'columns': 1},
    gridcells = [];

// Set backup settings
function setBackupSettings() {
    backupSettings = {
        'grid': {
            'dimensions': gridDimensions,
            'rowString': $('#rowDropdown').text(),
            'columnString': $('#columnDropdown').text()
        },
        'controls': {
            'refresh': refreshSettings,
            'connect': connectionBlocks,
            'refreshString': $('#refreshDropdown').text(),
            'scopeString': $('#scopeDropdown').text()
        }
    };
}

// Create dashboard grid
function getGrid(rows = gridDimensions.rows, columns = gridDimensions.columns) {
    var gridString = '';
    for(var i = 1; i <= rows; i++) {
        gridString += '<div class="row">';
        for(var j = 1; j <= columns; j++) {
            var gridcellId = 'r' + i + 'c' + j;
            var newGridcell = null;
            if(gridcells.length > 0) {
                gridcells.forEach(gridcell => {
                    if(gridcell.gridcellId == gridcellId) {
                        newGridcell = gridcell;
                    }
                });
            }
            if(newGridcell == null) {
                newGridcell = new Gridcell(gridcellId);
                gridcells.push(newGridcell);
            }
            gridString += '<div' + ' id="' + gridcellId + '" class="columns ' + getColumnClass(columns) + '">';
            gridString += newGridcell.getHtml();
            gridString += '</div>';
        }
        gridString += '</div>';
    }
    $('#gridArea').html(gridString);
    $('.graphTab').attr('src', '/static/dashboard/images/chart-area.svg');
    $('.settingsTab').attr('src', '/static/dashboard/images/cogs.svg');
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
            gridcell.graph.resize();
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

// Testing

// Startup script
var testCell = new Gridcell('r1c1');
testCell.rack = 1;
testCell.s_type = 'temp';
var connectionInfo = {'resetString': connectionBlocks.prefix + testCell.rack + '/' + testCell.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + testCell.rack + '/' + testCell.s_type + '/' + refreshSettings.amount}
var graph = new Graph(testCell.gridcellId, testCell.rack, testCell.s_type, connectionInfo)
testCell.graph = graph;
gridcells.push(testCell)
getGrid();
$('#' + testCell.gridcellId + 'Title').html('Rack ' + testCell.rack + ': ' + s_types.get(testCell.s_type));
resetGraphs();