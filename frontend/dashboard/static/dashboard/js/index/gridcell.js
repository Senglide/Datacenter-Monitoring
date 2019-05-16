class Gridcell {
    // Constructor
    constructor(gridcellId) {
        this.rack, this.s_type, this.graphType, this.graph,
        this.colorPickers = [],
        this.gridcellId = gridcellId;
    }

    // Get html text
    getHtml() {
        // Nav title
        // var htmlString = '<ul class="nav nav-tabs justify-content-end"><li class="nav-item">';
        // if(this.graph) {
        //     if(this.graphType == 'Gauge') {
        //         htmlString += '<h5 id="' + this.gridcellId + 'Title">Rack ' + this.rack + '</h5>';
        //     } else {
        //         htmlString += '<h5 id="' + this.gridcellId + 'Title">' + s_types.get(this.s_type) + '</h5>';
        //     }
        // } else {
        //     htmlString += '<h5 id="' + this.gridcellId + 'Title">Please configure this graph in the settings</h5>';
        // }
        // // Nav tabs
        // htmlString += '</li><li class="nav-item"><a id="' + this.gridcellId + 'Graph-tab" class="nav-link active" href="#' + this.gridcellId + 'Graph" aria-controls="' + this.gridcellId + 'Graph" role="tab" data-toggle="tab" aria-selected="false"><i class="fas fa-chart-area"></i></a></li><li class="nav-item"><a id="' + this.gridcellId + 'Settings-tab" class="nav-link" href="#' + this.gridcellId + 'Settings" aria-controls="' + this.gridcellId + 'Settings" role="tab" data-toggle="tab" aria-selected="false"><i class="fas fa-cogs"></i></a></li></ul>'
        // // Graph tab
        // htmlString += '<div id="' + this.gridcellId + 'TabContent" class="tab-content"><div id="' + this.gridcellId + 'Graph" class="tab-pane fade show active" role="tabpanel" aria-labelledby="' + this.gridcellId + 'Graph-tab"></div>';
        // // Settings tab
        // htmlString += '<div id="' + this.gridcellId + 'Settings" class="tab-pane fade" role="tabpanel" aria-labelledby="' + this.gridcellId + 'Settings-tab">';
        // // Rack section
        // htmlString += '<div class="row"><div class="col-sm-2"></div><label class="col-sm-4 col-form-label">Racks:</label><div class="col-sm-4"><div class="row">';
        // racks.forEach(rack => {
        //     htmlString += '<div class="form-group col"><label class="form-check-label" for="rackCheck' + rack + '">Rack ' + rack + '</label><div class="form-check"><input class="form-check-input" type="checkbox" value="" id="rackCheck' + rack + '"><button id="' + this.gridcellId + 'colorButton' + rack + '" style="width:20px;height:20px;margin-left:5px"></button></div></div>';
        // });
        // htmlString += '</div></div><div class="col-sm-2"></div></div>';
        // // Type section
        // htmlString += '<div class="form-group row"><div class="col-sm-2"></div><label class="col-sm-4 col-form-label">Type:</label><div class="dropdown col-sm-4"><button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="' + this.gridcellId + 'TypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
        // if(this.s_type) {
        //     htmlString += s_types.get(this.s_type);
        // } else {
        //     htmlString += 'Choose a type';
        // }
        // htmlString += '</button><div id="' + this.gridcellId + 'TypeMenu" class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'TypeDropdown">';
        // s_types.forEach(s_type => {
        //     if(s_type.includes(' ')) {
        //         htmlString += '<a class="dropdown-item typeDropdown-item">' + s_type + '</a>';
        //     }
        // });
        // htmlString += '</div></div><div class="col-sm-2"></div></div><div class="form-group row">';
        // Graph type section
        // htmlString += '<div class="col-sm-2"></div><label class="col-sm-4 col-form-label">Graph type:</label><div class="dropdown col-sm-4"><button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="' + this.gridcellId + 'graphTypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
        // if(this.graphType) {
        //     htmlString += this.graphType;
        // } else {
        //     htmlString += 'Choose a graph type';
        // }
        // htmlString += '</button><div id="' + this.gridcellId + 'graphTypeMenu" class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'graphTypeDropdown">';
        // visualOptions.get('graphType').forEach(graphType => {
        //     htmlString += '<a class="dropdown-item graphTypeDropdown-item">' + graphType + '</a>';
        // });
        // htmlString += '</div></div><div class="col-sm-2"></div></div>';
        // Closing divs
        // htmlString += '</div></div></div>';
        // return htmlString;

        // Title row
        var htmlString = '<div class="row gridcellTitleRow">';
        // Graph reset button
        htmlString += '<div class="col-sm-2"><div class="graphResetButton" hidden="true"><i class="fas fa-redo"></i></div></div>';
        // Sensor type selection button
        htmlString += '<div class="col"><button class="btn btn-outline-secondary btn-md dropdown-toggle graphTypeDropdownToggle" type="button" id="' + this.gridcellId + 'TypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
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
        //Dropdown closing divs
        htmlString += '</div></div>';
        // Title row closing div
        htmlString += '</div>';
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