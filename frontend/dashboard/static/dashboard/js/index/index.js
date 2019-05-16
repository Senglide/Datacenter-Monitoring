// Script variables
var dashboardTimer, backupSettings, alarmSocket,
    refreshSettings = {'time': dashboardSettingsOptions.get('refresh').get(defaultDashboardVariables.refresh).time * 1000, 'amount': dashboardSettingsOptions.get('refresh').get(defaultDashboardVariables.refresh).amount},
    connectionBlocks = {'prefix': dashboardSettingsOptions.get('scope').get(defaultDashboardVariables.scope).prefix, 'suffix': dashboardSettingsOptions.get('scope').get(defaultDashboardVariables.scope).suffix},
    gridDimensions = {'row': defaultDashboardVariables.row},
    gridcells = [];

// Set backup settings
function setBackupSettings() {
    backupSettings = {
        'grid': {
            'dimensions': gridDimensions,
            'rowString': $('#rowDropdown').text(),
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
function getGrid(rows = gridDimensions.row) {
    var gridString = '';
    for(var i = 1; i <= rows; i++) {
        var gridcellId = 'r' + i;
        gridString += '<div id="' + gridcellId + '" class="row">';
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
        gridString += '<div class="columns col">'
        gridString += newGridcell.getHtml();
        gridString += '</div></div>';
    }
    $('#gridArea').html(gridString);
    gridcells.forEach(gridcell => {
        gridcell.createColorPickers();
        if(!gridcell.graph) {
            $('#' + gridcell.gridcellId + 'Graph').html('<div>Select a rack and a sensor type to draw a graph</div>');
        }
        gridcell.calculateMargins();
    });
}

// Reset dashboard grid
function resetGrid() {
    gridcells = [];
    getGrid();
}

// Reset timer and data array
function resetGraphs(inputGridcells) {
    if(dashboardTimer) {
        clearInterval(dashboardTimer);
    }
    inputGridcells.forEach(gridcell => {
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
        setCurrentDateAndTime();
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
function checkToDrawGraph(gridcell) {
    if(gridcell.s_type && gridcell.rack) {
        // If graph exists, update, else, create new
        if(gridcell.graph) {
            gridcell.graph.rack = gridcell.rack;
            gridcell.graph.s_type = gridcell.s_type;
            gridcell.graph.updateConnectionSettings();  
            gridcell.graph.erase();
        } else {
            gridcell.graph = createNewGraph(gridcell);
        }
        $('#' + gridcell.gridcellId + 'Graph .configMessage').html('');
        resetGraphs([gridcell]); 
    } else {
        if(gridcell.graph) {
            gridcell.graph.erase();
        }
        $('#' + gridcell.gridcellId + 'Graph .configMessage').html('Select a rack and a sensor type to draw a graph');
        gridcell.calculateMargins();
    }
}

// Set current data
function setCurrentDateAndTime() {
    var now = new Date();
    $('#dashboardDate').html(('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear());
    $('#lastUpdateTime').html(('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':' + ('0' + now.getSeconds()).slice(-2));
}

// Websocket
alarmSocket = new ReconnectingEventSource('/alarmSignal/');
alarmSocket.addEventListener('message', function(e) {
    var incoming = JSON.parse(e.data);
    switch(incoming.alarm) {
        case 0:
            $('#' + incoming.a_type + 'Text').html(incoming.a_type.charAt(0).toUpperCase() + incoming.a_type.slice(1) + ' detection active');
            $('#' + incoming.a_type + 'Image img').attr('src', '/static/dashboard/images/' + incoming.a_type + '_preloader.svg');
            if(incoming.a_type == 'movement') {
                $('#' + incoming.a_type + 'Image img').attr('height', '50px');
            } else {
                $('#' + incoming.a_type + 'Image img').attr('height', '15px');
            }
            break;
        case 1:
            $('#' + incoming.a_type + 'Text').html(incoming.a_type.charAt(0).toUpperCase() + incoming.a_type.slice(1) + ' detected!');
            $('#' + incoming.a_type + 'Image img').attr('src', '/static/dashboard/images/' + incoming.a_type + '_detected.svg').attr('height', '50px');
            break;
        case 2:
            $('#' + incoming.a_type + 'Text').html(incoming.a_type.charAt(0).toUpperCase() + incoming.a_type.slice(1) + ' detection inactive');
            $('#' + incoming.a_type + 'Image img').attr('src', '/static/dashboard/images/exlamation_mark.gif').attr('height', '35px');
            break;
    }
    setCurrentDateAndTime();
}, false);

// Resize graphs on window width change
$('body').resize(function () {
    console.log('resize');
    gridcells.forEach(gridcell => {
        if(gridcell.graph) {
            gridcell.graph.resize();
        }
    });
});


// Startup script
var cell1 = new Gridcell('r1'),
    cell2 = new Gridcell('r2');
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
getGrid();
resetGraphs(gridcells);
createModalDropdowns();
setCurrentDateAndTime();