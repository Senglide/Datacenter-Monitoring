class Gridcell {
    // Constructor
    constructor(gridcellId) {
        this.rack, this.s_type, this.graph;
        this.gridcellId = gridcellId;
    }

    // Get html text
    getHtml() {
        var htmlString = '<ul class="nav nav-tabs justify-content-end"><li class="nav-item">';
        if(this.rack && this.s_type) {
            htmlString += '<h5 id="' + this.gridcellId + 'Title" class="nav-link">Rack ' + this.rack + ': '  + s_types.get(this.s_type) + '</h5>';
        } else {
            htmlString += '<h5 id="' + this.gridcellId + 'Title" class="nav-link">Please configure this graph in the settings</h5>';
        }
        htmlString += '</li><li class="nav-item"><a id="' + this.gridcellId + 'Graph-tab" class="nav-link active" href="#' + this.gridcellId + 'Graph" aria-controls="testGraph" role="tab" data-toggle="tab" aria-selected="false"><i class="fas fa-chart-area"></i></a></li><li class="nav-item"><a id="' + this.gridcellId + 'Settings-tab" class="nav-link" href="#' + this.gridcellId + 'Settings" aria-controls="testSettings" role="tab" data-toggle="tab" aria-selected="false"><i class="fas fa-cogs"></i></a></li></ul><div id="' + this.gridcellId + 'TabContent" class="tab-content"><div id="' + this.gridcellId + 'Graph" class="tab-pane fade show active" role="tabpanel" aria-labelledby="' + this.gridcellId + 'Graph-tab"></div>';
        htmlString += '<div id="' + this.gridcellId + 'Settings" class="tab-pane fade" role="tabpanel" aria-labelledby="' + this.gridcellId + 'Settings-tab">';
        htmlString += '<div class="form-group row">';
        htmlString += '<div class="col-sm-2"></div>';
        htmlString += '<label class="col-sm-4 col-form-label">Rack:</label>';
        htmlString += '<div class="dropdown col-sm-4">';
        htmlString += '<button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="' + this.gridcellId + 'RackDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
        if(this.rack) {
            htmlString += this.rack;
        } else {
            htmlString += 'Choose a rack';
        }
        htmlString += '</button>';
        htmlString += '<div id="' + this.gridcellId + 'RackMenu" class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'RackDropdown">';
        racks.forEach(rack => {
            htmlString += '<a class="dropdown-item rackDropdown-item">' + rack + '</a>';
        });
        htmlString += '</div>';
        htmlString += '</div>';
        htmlString += '<div class="col-sm-2"></div>';
        htmlString += '</div>';
        htmlString += '<div class="form-group row">';
        htmlString += '<div class="col-sm-2"></div>';
        htmlString += '<label class="col-sm-4 col-form-label">Type:</label>';
        htmlString += '<div class="dropdown col-sm-4">';
        htmlString += '<button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="' + this.gridcellId + 'TypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
        if(this.s_type) {
            htmlString += s_types.get(this.s_type);
        } else {
            htmlString += 'Choose a type';
        }
        htmlString += '</button>';
        htmlString += '<div id="' + this.gridcellId + 'TypeMenu" class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'TypeDropdown">';
        s_types.forEach(s_type => {
            if(s_type.includes(' ')) {
                htmlString += '<a class="dropdown-item">' + s_type + '</a>';
            }
        });
        htmlString += '</div>';
        htmlString += '</div>';
        htmlString += '<div class="col-sm-2"></div>';
        htmlString += '</div>';
        htmlString += '</div>';
        htmlString += '</div>';
        return htmlString;
    }
}