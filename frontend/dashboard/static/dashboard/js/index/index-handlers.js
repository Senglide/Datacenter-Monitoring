// Grid change handlers
$('#rowMenu a').click(function() {
    gridDimensions.row = parseInt($(this).text());
    $('#rowDropdown').html(gridDimensions.row);
});
$('#columnMenu a').click(function() {
    gridDimensions.column = parseInt($(this).text());
    $('#columnDropdown').html(gridDimensions.column);
});

// Refresh toggle click handler
$('#refreshMenu a').click(function() {
    refreshSettings.time = dashboardSettingsOptions.get('refresh').get($(this).text()).time * 1000;
    refreshSettings.amount = dashboardSettingsOptions.get('refresh').get($(this).text()).amount;
    $('#refreshDropdown').html($(this).text());
});

// Interval toggle click handler
$('#scopeMenu a').click(function() {
    connectionBlocks.prefix = dashboardSettingsOptions.get('scope').get($(this).text()).prefix;
    connectionBlocks.suffix = dashboardSettingsOptions.get('scope').get($(this).text()).suffix;
    getAverage =  dashboardSettingsOptions.get('scope').get($(this).text()).getAverage;
    $('#scopeDropdown').html($(this).text());
});

// Open settings click handler
$('#settingsTrigger').click(function() {
    setBackupSettings();
});

// Save settings click handler
$('#saveSettings button').click(function() {
    if($(this).text() == 'Cancel') {
        gridDimensions = backupSettings.grid.dimensions;
        refreshSettings = backupSettings.controls.refresh;
        connectionBlocks = backupSettings.controls.connect;
        $('#rowDropdown').html(backupSettings.grid.rowString);
        $('#columnDropdown').html(backupSettings.grid.columnString);
        $('#refreshDropdown').html(backupSettings.controls.refreshString);
        $('#scopeDropdown').html(backupSettings.controls.scopeString);
    } else {
        for(var i = 0; i < gridcells.length; i++) { 
            if(parseInt(gridcells[i].gridcellId.substring(1, 2)) > gridDimensions.rows || parseInt(gridcells[i].gridcellId.substring(3)) > gridDimensions.columns) {
                gridcells.splice(i, 1);
            }
        }
        getGrid();
        if(gridcells.length > 0) {
            gridcells.forEach(gridcell => {
                if(gridcell.graph && gridcell.graphType == 'Linechart') {
                    gridcell.graph.connectionSettings.refreshString = 'get_newest_readings/' + gridcell.graph.rack + '/' + gridcell.graph.s_type + '/' + refreshSettings.amount;
                    gridcell.graph.connectionSettings.resetString = connectionBlocks.prefix + gridcell.graph.rack + '/' + gridcell.graph.s_type + connectionBlocks.suffix;
                }
            });
        }
        setBackupSettings();
        resetGraphs();
    }
    $('#settingsModal').modal('toggle');
});

// Graph setup handler
$('#gridArea').on('click', '.gridcellDropdown a' , function() {
    gridcells.forEach(gridcell => {
        var originalGraphType;
        if(gridcell.gridcellId == $(this).parent().parent().parent().parent().parent().parent().attr('id')) {
            // Check which dropdown has been clicked and set value
            if($(this).attr('class').includes('rackDropdown-item')) {
                gridcell.rack = parseInt($(this).text());
            } else if($(this).attr('class').includes('typeDropdown-item')) {
                gridcell.s_type = s_types.get($(this).text());
            } else {
                originalGraphType = gridcell.graphType;
                gridcell.graphType = $(this).text();
            }
            $(this).parent().siblings('button').text($(this).text());
            // Check if all the requirements for a graph have been fulfilled
            if(gridcell.rack && gridcell.s_type && gridcell.graphType) {
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
                    $('#' + gridcell.gridcellId + 'Title').html('Rack ' + gridcell.rack + ': ' + s_types.get(gridcell.s_type));
                }
                gridcell.calculateTitleMargin();
                resetGraphs();
            }
        }
    });
});

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

// Nav click handler
$('#detailLink').click(function() {
    sessionStorage.setItem('getDetails', 'false');
});