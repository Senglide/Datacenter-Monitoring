class Graph {
    // Constructor
    constructor(divId, rack, s_type, connectionSettings = undefined, detailId = undefined, isHistoryGraph = undefined) {
        // Graph global variables
        this.x, this.y, this.xAxis, this.yAxis, this.area, this.dots, this.chart, this.data, this.maxValue, this.minValue, this.clip, this.scatter, this.zoom,
        this.divId = divId,
        this.rack = rack,
        this.s_type = s_type,
        this.connectionSettings = connectionSettings,
        this.detailId = detailId,
        this.isHistoryGraph = isHistoryGraph;
        this.lines = [],
        this.margin = {top: 10, right: 10, bottom: 20, left: 30},
        this.width = $('#' + this.divId + 'Graph').width() - this.margin.left - this.margin.right,
        this.height = 200 - this.margin.top - this.margin.bottom;
    }

    // Update connectionSettings
    updateConnectionSettings() {
        this.connectionSettings = {'resetString': connectionBlocks.prefix + this.rack + '/' + this.s_type + connectionBlocks.suffix, 'refreshString': 'get_newest_readings/' + this.rack + '/' + this.s_type + '/' + refreshSettings.amount};
    }

    // Resize
    resize() {
        this.width = $('#' + this.divId + 'Graph').width() - this.margin.left - this.margin.right;
    }

    // Get data for graph
    getData(classEnv = this, resetGraph) {
        // Function variables
        var newData = {};
        // Set correct margins
        this.calculateMargins();
        // Get new data
        $.ajax({
            type: 'GET',
            url: this.prepareForData(resetGraph),
            dataType: 'json',
            success: function(response) {
                // Format new data
                Object.keys(response.all_readings).forEach(key => {
                    // Create new arrays when the graph is being reset
                    if(resetGraph) {
                        classEnv.data[key] = [];
                    }
                    newData[key] = [];
                    // Fill data arrays with incoming data
                    response.all_readings[key].forEach(reading => {
                        // Put incoming reading in the right array
                        reading.datetime = new Date(reading.date + 'T' + reading.time);
                        if(resetGraph) {
                            classEnv.data[key].unshift(reading);
                        } else {
                            newData[key].unshift(reading);
                        }
                    });
                    // Add new data to existing data
                    classEnv.data[key] = classEnv.data[key].concat(newData[key]);
                });
                // Get min and max values
                classEnv.calculateMinMax();
                // Finish composing data and call next function
                if(resetGraph) {
                    $('#' + classEnv.divId + ' .preloader').prop('hidden', true);
                    classEnv.erase();
                    classEnv.createGraph();
                } else {
                    classEnv.updateGraph();
                }
            }
        });
    }

    // Prepare arrays and decide which connectionstring to use
    prepareForData(resetGraph) {
        if(resetGraph) {
            $('#' + this.divId + ' .preloader').prop('hidden', false);
            this.data = {};
            return this.connectionSettings.resetString;
        } else { 
            Object.keys(this.data).forEach(key => {
                this.data[key] = this.data[key].slice(refreshSettings.amount, this.data[key].length);
            });
            return this.connectionSettings.refreshString;
        }
    }

    createGraph(classEnv = this) {
        // Add svg to canvas
        this.chart = d3.select('#' + this.divId + 'Graph')
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        
        // Draw axes
        this.updateAndDrawAxes();
        
        // Clip path
        this.clip = this.chart.append('defs').append('SVG:clipPath')
            .attr('id', this.divId + 'GraphClip')
            .append('SVG:rect')
            .attr('id', this.divId + 'GraphClipRect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('x', 0)
            .attr('y', 0);

        // Scatter
        this.scatter = this.chart.append('g')
            .attr('clip-path', 'url(#' + this.divId + 'GraphClip)')
            .attr('id', this.divId + 'GraphScatter');

        // Zoom
        this.zoom = d3.zoom()
            .scaleExtent([.5, 5])
            .extent([[0, 0], [this.width, this.height]])
            .on('zoom', function() { classEnv.updateZoomChart(classEnv); });

        // Define data line(s) and dots and append them to the chart
        this.dots = [];
        Object.keys(this.data).forEach((key, index) => {
            // Add area for detail view
            if(this.detailId) {
                // Define area
                this.area = d3.area()
                    .curve(d3.curveMonotoneX)
                    .x(function(d) { return classEnv.x(d.datetime); })
                    .y0(this.height)
                    .y1(function(d) { return classEnv.y(d.sensor_value); });

                // Append area to chart
                this.scatter.append('path')
                    .data(this.data[key])
                    .attr('class', 'area')
                    .attr('fill', '#69b3a2')
                    .attr('fill-opacity', .3)
                    .attr('stroke', 'none')
                    .attr('d', this.area(this.data[key]));
            }

            // Check if line exists for this rack
            if(this.detailId) {
                var rack = this.rack;
            } else {
                var rack = key.substring(0, 1);

            }
            var line;
            this.lines.forEach(lineInfo => {
                if(lineInfo.rack == rack) {
                    lineInfo.line
                        .x(function(d) { return classEnv.x(d.datetime); })
                        .y(function(d) { return classEnv.y(d.sensor_value); });
                    line = lineInfo;
                }
            });

            // Create new line if none exists for this rack
            if(!line) {
                var lineColor;
                if(this.detailId) {
                    lineColor = '#69b3a2';
                } else {
                    lineColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
                }
                line = {'rack': rack,
                        'line': d3.line()
                            .curve(d3.curveMonotoneX)
                            .x(function(d) { return classEnv.x(d.datetime); })
                            .y(function(d) { return classEnv.y(d.sensor_value); }),
                        'color': lineColor};
                
                // Store new line
                this.lines.push(line);
            }
            
            // Add line to graph
            this.scatter.append('path')
                .data(this.data[key])
                .attr('class', 'line' + index)
                .attr('fill', 'none')
                .attr('stroke', line.color)
                .attr('stroke-width', 4)
                .attr('d', line.line(this.data[key]));

            // Append dots to chart
            var dot = this.scatter.append('g')
                .selectAll('#' + this.divId + 'Graph .dot' + index)
                .data(this.data[key])
                .enter()
                .append('circle')
                    .attr('class', 'dot')
                    .attr('fill', line.color)
                    .attr('stroke', 'none')
                    .attr('cursor', 'pointer')
                    .attr('cx', function(d) { return classEnv.x(d.datetime); })
                    .attr('cy', function(d) { return classEnv.y(d.sensor_value); })
                    .attr('r', 4)
                    .attr('fill-opacity', '0')
                    .each(function(d) {
                        var head = d3.select(this);
                        if(classEnv.detailId) {
                            if(d.id == classEnv.detailId) {
                                head.attr('fill', 'green');
                            }
                        }
                    })
                    .on('mouseover', function() {
                        d3.select(this)
                            .attr('fill', 'red')
                            .attr('fill-opacity', '1');
                    })
                    .on('mouseout', function() {
                        d3.select(this).attr('fill-opacity', '0');
                    })
                    .on('click', function(d) {
                        $('#date').html('Date of sensor reading: ' + d.datetime);
                        $('#value').html('Value of sensor reading: ' + d.sensor_value);
                        $('#detailModal').modal();
                        if(!classEnv.detailId) {
                            $('#moreInfo').on('click', function() {
                                var readingDetails = {
                                    'id': d.id,
                                    'rack': rack,
                                    's_type': classEnv.s_type,
                                    'date': d.date,
                                    'time': d.time
                                };
                                sessionStorage.setItem('readingDetails', JSON.stringify(readingDetails));
                                sessionStorage.setItem('getDetails', 'true');
                                window.open('detail');
                            });
                        }
                    });

            // Store dot
            this.dots.push(dot);
        });

        // Add zoom to the chart
        d3.select('#' + this.divId + 'Graph svg').call(this.zoom);

        if(!this.detailId) {
            this.checkCheckBoxesAndColorPickers();
        }
    }

    // Zoom
    updateZoomChart(classEnv) {
        // Show reset button
        if(classEnv.detailId) {
            $('#resetDetailGraph').prop('hidden', false);
        } else {
            $('#' + classEnv.divId + ' .graphResetButton').prop('hidden', false);
        }

        // Recover the new scale
        var newX = d3.event.transform.rescaleX(classEnv.x);
        var newY = d3.event.transform.rescaleY(classEnv.y);

        // Update axes with these new boundaries
        classEnv.chart.select('#' + this.divId + 'Graph .xAxis').call(d3.axisBottom(newX));
        classEnv.chart.select('#' + this.divId + 'Graph .yAxis').call(d3.axisLeft(newY));

        // Update lines and dots
        classEnv.updateLinesAndDots(newX, newY);
    }

    // Update graph
    updateGraph() {
        // Recalculate min and max values
        this.calculateMinMax();

        // Draw axes
        this.updateAndDrawAxes();
        
        // Update lines and dots
        this.updateLinesAndDots(this.x, this.y);
    }

    // Draw axes
    updateAndDrawAxes() {
        // Set axes ranges and domains
        this.x = d3.scaleTime()
            .range([0, this.width])
            .domain(d3.extent(this.data[Object.keys(this.data)[0]], function(d) { return d.datetime; }));
        this.y = d3.scaleLinear()
            .range([this.height, 0])
            .domain([parseInt(this.minValue) - linechartSettings.get(this.s_type).delta, parseInt(this.maxValue) + linechartSettings.get(this.s_type).delta]);

        // Define axes
        this.xAxis = d3.axisBottom(this.x).ticks(15).tickSizeOuter(0);
        this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0);

        // Remove old axes
        d3.select('#' + this.divId + 'Graph .xAxis').remove();
        d3.select('#' + this.divId + 'Graph .yAxis').remove();

        // Add new X and Y axes to svg
        this.chart.append('g')
            .attr('transform', 'translate(0,' + this.height + ')')
            .attr('class', 'xAxis')
            .call(this.xAxis);
        this.chart.append('g')
            .attr('class', 'yAxis')
            .call(this.yAxis);
    }

    // Update lines and dots
    updateLinesAndDots(x, y) {
        Object.keys(this.data).forEach((key, index) => {
            // Lines
            var line = this.lines[index];
            var drawnLine = line.line
                .x(function(d) { return x(d.datetime); })
                .y(function(d) { return y(d.sensor_value); });
            this.chart.select('#' + this.divId + 'Graph .line' + index)
                .attr('stroke', line.color)
                .attr('d', drawnLine(this.data[key]));
            this.lines[index] = {'rack': line.rack, 'line': drawnLine, 'color': line.color};

            // Line legend
            if(!this.detailId) {
                this.chart.select('#legendRack' + line.rack)
                    .style('fill', line.color);
            }
            
            // Dots
            var dot = this.dots[index].data(this.data[key])
                .attr('cx', function(d) { return x(d.datetime); })
                .attr('cy', function(d) { return y(d.sensor_value); });
            this.dots[index] = dot;

            // If detailGraph then make sure the area zooms too
            if(this.detailId) {
                this.area
                    .x(function(d) { return x(d.datetime); })
                    .y1(function(d) { return y(d.sensor_value); });

                this.chart.select('.area').attr('d', this.area(this.data[key]));
            }
        });
    }

    // Erase graph drawings
    erase() {
        d3.select('#' + this.divId + 'Graph svg').remove();
    }

    // Change the color of a line
    changeLineColor(rack, color) {
        this.lines.forEach(line => {
            if(line.rack == rack) {
                line.color = color;
                this.updateGraph();
            }
        });
    }

    // Check checkboxes and colorPickers
    checkCheckBoxesAndColorPickers() {
        racks.forEach(rack => {
            if(this.rack.includes(rack)) {
                $('#' + this.divId + 'GraphRackCheck' + rack).prop('checked', true);
                $('#' + this.divId + 'GraphColorButton' + rack).prop('disabled', false);
                this.lines.forEach(line => {
                    if(line.rack == rack) {
                        $('#' + this.divId + 'GraphColorButton' + rack).css('background-color', line.color);
                    }
                });
            } else {
                $('#' + this.divId + 'GraphRackCheck' + rack).prop('checked', false);
                $('#' + this.divId + 'GraphColorButton' + rack).prop('disabled', true);
            }     
        });
    }

    // Calculate margins
    calculateMargins() {
        var loaderMargin = ($('#' + this.divId + ' .gridcellGraphColumn').width() - $('#' + this.divId + 'Graph .preloader').width()) / 2;
        $('#' + this.divId + 'Graph .preloader').css('margin-left', loaderMargin);
    }

    // Calculate min and max values
    calculateMinMax() {
        var i = 0;
        Object.keys(this.data).forEach(key => {
            this.data[key].forEach(reading => {
                if(i == 0) {
                    this.minValue = reading.sensor_value;
                    this.maxValue = reading.sensor_value;
                    i ++;
                } else {
                    if(reading.sensor_value < this.minValue) {
                        this.minValue = reading.sensor_value;
                    }
                    if(reading.sensor_value > this.maxValue) {
                        this.maxValue = reading.sensor_value;
                    }
                }
            });
        });
    }
}