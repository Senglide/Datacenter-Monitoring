class Gridcell {
    // Constructor
    constructor(gridcellId) {
        this.rack, this.s_type, this.graph;
        this.gridcellId = gridcellId;
    }

    // Get html text
    getHtml() {
        var htmlString = '<div class="btn-group"><div class="dropdown"><button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="' + this.gridcellId + 'Rackmenu' + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Rack</button><div class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'Rackmenu' + '">';
        racks.forEach(rack => {
            htmlString += '<a class="dropdown-item rackDropdown-item">Rack ' + rack + '</a>';
        });
        htmlString += '</div></div><div class="dropdown"><button class="btn btn-secondary btn-sm dropdown-toggle" type="button" id="' + this.gridcellId + 'Typemenu' + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Type</button><div class="dropdown-menu gridcellDropdown" aria-labelledby="' + this.gridcellId + 'Typemenu' + '">';
        s_types.forEach(s_type => {
            htmlString += '<a class="dropdown-item typeDropdown-item">' + s_type + '</a>';
        });
        htmlString += '</div></div></div><div id="' + this.gridcellId + 'Graph"></div>';

        return htmlString;
    }
}