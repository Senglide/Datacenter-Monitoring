// Grid change handlers
$('#rowMenu a').click(function() {
    gridDimensions.rows = parseInt($(this).text());
    $('#rowDropdown').html(gridDimensions.rows);
});
$('#columnMenu a').click(function() {
    gridDimensions.columns = parseInt($(this).text());
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
            var today = new Date();
            connectionBlocks.prefix = 'get_readings_by_date/';
            connectionBlocks.suffix = '/' + today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
            getAverage = true;
            break;
    }
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
                if(gridcell.graph) {
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
$('#gridArea').on('click', '.gridcellDropdown a' ,function() {
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == $(this).parent().parent().parent().parent().parent().parent().attr('id')) {
            if($(this).attr('class').includes('rackDropdown-item')) {
                gridcell.rack = parseInt($(this).text());
                $(this).parent().siblings('button').text(gridcell.rack);
            } else {
                gridcell.s_type = s_types.get($(this).text());
                $(this).parent().siblings('button').text($(this).text());
            }
            if(gridcell.rack && gridcell.s_type) {
                if(gridcell.graph) {
                    gridcell.graph.rack = gridcell.rack;
                    gridcell.graph.s_type = gridcell.s_type;
                    gridcell.graph.updateConnectionSettings();
                } else {
                    var connectionInfo = {'resetString': connectionBlocks.prefix + gridcell.rack + '/' + gridcell.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + gridcell.rack + '/' + gridcell.s_type + '/' + refreshSettings.amount};
                    var graph = new Graph(gridcell.gridcellId, gridcell.rack, gridcell.s_type, connectionInfo, undefined);
                    gridcell.graph = graph;
                }
                $('#' + gridcell.gridcellId + 'Title').html('Rack ' + gridcell.rack + ': ' + s_types.get(gridcell.s_type));
                resetGraphs();
            }
        }
    });
});