// Grid change handlers
$('#rowMenu a').click(function() {
    gridDimensions.row = parseInt($(this).text());
    $('#rowDropdown').html(gridDimensions.row);
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
        $('#refreshDropdown').html(backupSettings.controls.refreshString);
        $('#scopeDropdown').html(backupSettings.controls.scopeString);
    } else {
        for(var i = 0; i < gridcells.length; i++) { 
            if(parseInt(gridcells[i].gridcellId.substring(1, 2)) > gridDimensions.rows) {
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
        resetGraphs(gridcells);
    }
    $('#settingsModal').modal('toggle');
});

// Set gridcell type and graphType handler
$('#gridArea').on('click', '.gridcellDropdown a' , function() {
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == $(this).parents().eq(4).attr('id')) {
            // Set gridcell sensor type
            gridcell.s_type = s_types.get($(this).text());
            $(this).parent().siblings('button').text($(this).text());
            gridcell.calculateMargins();
            // Check if all the requirements for a graph have been fulfilled
            checkToDrawGraph(gridcell);
        }
    });
});

// Nav click handler
$('#detailLink').click(function() {
    sessionStorage.setItem('getDetails', 'false');
});

// Set gridcell rackString handler
$('#gridArea').on('click', '.form-check-input' , function() {
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
            // Check if all the requirements for a graph have been fulfilled
            checkToDrawGraph(gridcell);
        }
    });
});

// Reset graph after zoom handler
$('#gridArea').on('click', '.graphResetButton i' , function() {
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == $(this).parents().eq(4).attr('id')) {
            gridcell.graph.updateGraph();
            $('#' + gridcell.gridcellId + ' .graphResetButton').prop('hidden', true);
        }
    });
});