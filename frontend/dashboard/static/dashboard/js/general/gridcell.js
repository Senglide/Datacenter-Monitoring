class Gridcell {
    // Constructor
    constructor(gridcellId) {
        this.rack, this.s_type, this.graphType, this.graph,
        this.colorPickers = [],
        this.gridcellId = gridcellId;
    }

    // Get html text
    getHtml() {
        // Title row
        var htmlString = '<div class="row gridcellTitleRow">';
        // Graph reset button
        htmlString += '<div class="col-sm-2"><div class="graphResetButton" hidden="true"><i class="fas fa-redo"></i></div></div>';
        // Title column
        htmlString += '<div class="col titleCol">';
        if(this.graph && this.graph.isHistoryGraph) {
            htmlString += '<h5>' + s_types.get(this.s_type) + '</h5>';
        } else {
            // Sensor type selection button
            htmlString += '<button class="btn btn-outline-secondary btn-md dropdown-toggle graphTypeDropdownToggle" type="button" id="' + this.gridcellId + 'TypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
            if(this.graph) {
                htmlString += s_types.get(this.s_type);
            } else {
                htmlString += 'Please select a sensor type';
            }
            htmlString += '</button>';
            // Dropdown
            htmlString += '<div id="' + this.gridcellId + 'TypeMenu" class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'TypeDropdown">';
            s_types.forEach(s_type => {
                if(s_type.includes(' ')) {
                    htmlString += '<a class="dropdown-item typeDropdown-item">' + s_type + '</a>';
                }
            });
            //Dropdown closing div
            htmlString += '</div>';
        }
        // Title col and row closing divs
        htmlString += '</div></div>';
        // Graph row
        htmlString += '<div class="row">';
        // Legend column
        htmlString += '<div class="col-sm-2 graphLegend">';
        racks.forEach(rack => {
            htmlString += '<div class="row legendRow">';
            // Checkbox and label
            htmlString += '<div class="col-sm-8 legendCol"><div class="form-check"><input class="form-check-input" type="checkbox" value="" id="' + this.gridcellId + 'GraphRackCheck' + rack + '"></input>Rack ' + rack + '</div></div>';
            // Colorpicker button
            htmlString += '<div class="col-sm legendCol"><button id="' + this.gridcellId + 'GraphColorButton' + rack + '" style="width:20px;height:20px;" disabled="true"></button></div>';
            // Closing div
            htmlString += '</div>';
        });
        // Legend column closing div
        htmlString += '</div>';
        // Chart column
        htmlString += '<div id="' + this.gridcellId + 'Graph" class="col-sm gridcellGraphColumn"><img class="preloader" src="/static/dashboard/images/ajax-loader.gif" hidden="true"><div class="configMessage"></div></div>';
        // Graph row closing div
        htmlString += '</div>';

        return htmlString;
    }

    createColorPickers() {
        racks.forEach(rack => {
            var colorPicker = new jscolor(this.gridcellId + 'GraphColorButton' + rack, colorPickerOptions);
            var colorPickerInfo = JSON.stringify({'gridcellId': this.gridcellId, 'rack': rack});
            colorPicker.onFineChange = 'updateGraphColor(' + colorPickerInfo + ')';
            this.colorPickers.push({'rack': rack, 'picker': colorPicker});
        });
    }

    // Calculate margins
    calculateMargins() {
        var titleMargin = (($('#' + this.gridcellId + ' .columns').width() - $('#' + this.gridcellId + ' .graphLegend').width() - $('#' + this.gridcellId + 'TypeDropdown').width()) / 2);
        $('#' + this.gridcellId + 'TypeDropdown').css('margin-left', titleMargin);
        var messageMargin = ($('#' + this.gridcellId + 'Graph').width() - $('#' + this.gridcellId + 'Graph div').width()) / 2;
        $('#' + this.gridcellId + 'Graph div').css('margin-left', messageMargin);
    }
}