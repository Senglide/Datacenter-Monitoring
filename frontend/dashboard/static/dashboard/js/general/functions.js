// Compose full graph string
function getRackString() {
    var rackString = '';
    racks.forEach((rack, index) => {
        if(index != racks.length - 1) {
            rackString += rack + '-';
        } else {
            rackString += rack;
        }
    })
    return rackString;
}

// Reset graph after zoom handler
$('#gridArea').on('click', '.graphResetButton i' , function() {
    gridcells.forEach(gridcell => {
        if(gridcell.gridcellId == $(this).parents().eq(4).attr('id')) {
            gridcell.graph.updateGraph();
            $('#' + gridcell.gridcellId + ' .graphResetButton').prop('hidden', true);
        }
    });
});

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