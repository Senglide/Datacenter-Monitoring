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
                newGridcell.graphType = 'Linechart';
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
        gridcell.createColorPickers();
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
        setCurrentData();
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

// Create new graph for gridcell
function createNewGraph(gridcell) {
    switch(gridcell.graphType) {
        case 'Linechart':
            var connectionInfo = {'resetString': connectionBlocks.prefix + gridcell.rack + '/' + gridcell.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + gridcell.rack + '/' + gridcell.s_type + '/' + refreshSettings.amount};
            return new Graph(gridcell.gridcellId, gridcell.rack, gridcell.s_type, connectionInfo, undefined);
        case 'Gauge':
            return new Gauge(gridcell.gridcellId, gridcell.rack, gridcell.s_type);
    }
}

// Update color of a line of a graph
function updateGraphColor(colorPickerInfo) {
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == colorPickerInfo.gridcellId && gridcell.graph) {
            gridcell.colorPickers.forEach(colorPicker => {
                if(colorPicker.rack == colorPickerInfo.rack) {
                    colorPickerObject = colorPicker.picker;
                    gridcell.graph.changeLineColor(colorPickerInfo.rack, colorPickerObject.toHEXString());
                }
            }); 
        }
    });
}

// Check to draw graph
function checkToDrawGraph(gridcell, originalGraphType) {
    if(gridcell.s_type && gridcell.graphType) {
        if(gridcell.rack) {
            // If graph exists, update, else, create new
            if(gridcell.graph) {
                if(gridcell.graphType == originalGraphType) {
                    gridcell.graph.rack = gridcell.rack;
                    gridcell.graph.s_type = gridcell.s_type;
                    if(gridcell.graphType == 'Linechart') {
                        gridcell.graph.updateConnectionSettings();   
                    }
                } else {
                    gridcell.graph.erase();
                    gridcell.graph = createNewGraph(gridcell);
                }
            } else {
                gridcell.graph = createNewGraph(gridcell);
            }
            // Create new title for the gridcells
            if(gridcell.graphType == 'Gauge') {
                $('#' + gridcell.gridcellId + 'Title').html('Rack ' + gridcell.rack);
            } else {
                $('#' + gridcell.gridcellId + 'Title').html(s_types.get(gridcell.s_type));
            }
            gridcell.calculateTitleMargin();
            resetGraphs();
        } else {
            if(gridcell.graph) {
                gridcell.graph.erase();
                $('#' + gridcell.gridcellId + 'Title').html('Please configure this graph in the settings');
                gridcell.calculateTitleMargin();
            }
        }
    }
}

// Set current data
function setCurrentData() {
    var now = new Date();
    $('#dashboardDate').html(('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear());
    $('#lastUpdateTime').html(('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2));
}

// Startup script
var cell1 = new Gridcell('r1c1'),
    cell2 = new Gridcell('r2c1');
cell1.rack = '1-2-3';
cell2.rack = '1-2-3';
cell1.s_type = 'temp';
cell2.s_type = 'pduPower';
cell1.graphType = 'Linechart';
cell2.graphType = 'Linechart';
cell1.graph = new Graph(cell1.gridcellId, cell1.rack, cell1.s_type, {'resetString': connectionBlocks.prefix + cell1.rack + '/' + cell1.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + cell1.rack + '/' + cell1.s_type + '/' + refreshSettings.amount});
cell2.graph = new Graph(cell2.gridcellId, cell2.rack, cell2.s_type, {'resetString': connectionBlocks.prefix + cell2.rack + '/' + cell2.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + cell2.rack + '/' + cell2.s_type + '/' + refreshSettings.amount});
gridcells.push(cell1);
gridcells.push(cell2);
$('#rowDropdown').html(gridDimensions.row);
$('#columnDropdown').html(gridDimensions.column);
getGrid();
resetGraphs();
createModalDropdowns();
setCurrentData();