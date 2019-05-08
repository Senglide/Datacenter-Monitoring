// Script variables
var dashboardTimer, backupSettings,
    refreshSettings = {'time': dashboardSettingsOptions.get('refresh').get(defaultDashboardVariables.refresh).time * 1000, 'amount': dashboardSettingsOptions.get('refresh').get(defaultDashboardVariables.refresh).amount},
    connectionBlocks = {'prefix': dashboardSettingsOptions.get('scope').get(defaultDashboardVariables.scope).prefix, 'suffix': dashboardSettingsOptions.get('scope').get(defaultDashboardVariables.scope).suffix},
    gridDimensions = {'row': defaultDashboardVariables.row, 'column': defaultDashboardVariables.column},
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
function getGrid(rows = gridDimensions.row, columns = gridDimensions.column) {
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
    gridcells.forEach(gridcell => {
        gridcell.calculateTitleMargin();
    });
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
            if(gridcell.graphType == 'Linechart') {
                gridcell.graph.resize();
                gridcell.graph.getData(undefined, true, getAverage);    
            } else if(gridcell.graphType == 'Gauge') {
                gridcell.graph.getData(true);
            }
        }
    });
    resetTimer();
}

// Update graph every n seconds
function resetTimer() {
    dashboardTimer = setInterval(function() {
        gridcells.forEach(gridcell => {
            if(gridcell.graph) {
                if(gridcell.graphType == 'Linechart') {
                    gridcell.graph.getData(undefined, false, getAverage);
                } else if(gridcell.graphType == 'Gauge') {
                    gridcell.graph.getData(false);
                }
            }
        });
    }, refreshSettings.time);
}

// Create modal dropdowns
function createModalDropdowns() {
    dashboardSettingsOptions.forEach((settings, type) => {
        var htmlString = '<button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="' + type + 'Dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + defaultDashboardVariables[type] + '</button><div id="' + type + 'Menu" class="dropdown-menu" aria-labelledby="' + type + 'Dropdown">';
        settings.forEach((setting, key) => {
            if(type == 'row' || type == 'column') {
                htmlString += '<a class="dropdown-item">' + setting + '</a>';
            } else {
                htmlString += '<a class="dropdown-item">' + key + '</a>';
            }
        });
        htmlString += '</div>';
        var divId = '#' + type + 'Setting';
        $(divId + ' .dropdown').html(htmlString);
    });
}

// Startup script
createModalDropdowns();
var testCell = new Gridcell('r1c1');
testCell.rack = 1;
testCell.s_type = 'temp';
testCell.graphType = 'Gauge';
var connectionInfo = {'resetString': connectionBlocks.prefix + testCell.rack + '/' + testCell.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + testCell.rack + '/' + testCell.s_type + '/' + refreshSettings.amount}
// var graph = new Graph(testCell.gridcellId, testCell.rack, testCell.s_type, connectionInfo)
var graph = new Gauge(testCell.gridcellId, testCell.rack, testCell.s_type);
testCell.graph = graph;
gridcells.push(testCell)
getGrid();
resetGraphs();
$('#rowDropdown').html(gridDimensions.row);
$('#columnDropdown').html(gridDimensions.column);