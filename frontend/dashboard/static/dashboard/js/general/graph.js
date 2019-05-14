class Graph {
    // Constructor
    constructor(divId, rack, s_type, connectionSettings, detailId) {
        // Graph global variables
        this.x, this.y, this.xAxis, this.yAxis, this.area, this.dots, this.chart, this.data, this.extremeData, this.clip, this.scatter, this.zoom,
        this.divId = '#' + divId,
        this.rack = rack,
        this.s_type = s_type,
        this.connectionSettings = connectionSettings,
        this.detailId = detailId,
        this.lines = [],
        this.margin = {top: 10, right: 30, bottom: 30, left: this.getLeftMargin().margin},
        this.width = $(this.divId).width() - this.margin.left - this.margin.right,
        this.height = 200 - this.margin.top - this.margin.bottom;
    }

    // Decide on left margin
    getLeftMargin() {
        if(this.detailId) {
            return {'margin': 50, 'label': 0};
        } else {
            return {'margin': 150, 'label': 100};
        }
    }

    // Update connectionSettings
    updateConnectionSettings() {
        this.connectionSettings = {'resetString': 'get_newest_readings/' + this.rack + '/' + this.s_type + '/90', 'refreshString': 'get_newest_readings/' + this.rack + '/' + this.s_type + '/30'};
    }

    // Resize graph
    resize() {
        this.width = $(this.divId).width() - this.margin.left - this.margin.right,
        this.height = 200 - this.margin.top - this.margin.bottom;
    }

    // Get data for graph
    getData(classEnv = this, resetGraph, getAverage) {
        // Function variables
        var newData = {};
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
                        classEnv.data[key] = {}
                        classEnv.data[key]['readings'] = [];
                        classEnv.data[key]['extremeData'] = [];
                    }
                    newData[key] = [];
                    // Fill data arrays with incoming data
                    response.all_readings[key].forEach(reading => {
                        reading.datetime = new Date(reading.date + 'T' + reading.time);
                        if(resetGraph) {
                            classEnv.data[key].readings.unshift(reading);
                        } else {
                            newData[key].unshift(reading);
                        }
                    });
                    // Add new data to existing data
                    classEnv.data[key].readings = classEnv.data[key].readings.concat(newData[key]);
                    // Get averages if necessary
                    if(getAverage) {
                        classEnv.calculateExtremeData()
                    } else {
                        classEnv.data[key].extremeData = classEnv.data[key].readings.slice();
                    }
                });
                // Finish composing data and call next function
                if(resetGraph) {
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
            this.data = {};
            return this.connectionSettings.resetString;
        } else { 
            Object.keys(this.data).forEach(key => {
                this.data[key].readings = this.data[key].readings.slice(refreshSettings.amount, this.data[key].readings.length);
            });
            return this.connectionSettings.refreshString;
        }
    }

    // Get the odd values from the data
    calculateExtremeData() {
        Object.keys(this.data).forEach(key => {
            // Function variables
            var averageOfValues,
                totalOfValues = 0,
                delta = linechartSettings.get(this.s_type).delta;
            // Calculate average of values
            this.data[key].readings.forEach(reading => {
                totalOfValues += reading.sensor_value;
            })
            averageOfValues = totalOfValues / this.data[key].readings.length;
            // Add odd values to extremeData array
            this.data[key].readings.forEach(reading => {
                if(reading.sensor_value < averageOfValues - delta || reading.sensor_value > averageOfValues + delta || reading.id == this.detailId) {
                    this.data[key].extremeData.push(reading);
                }
            });
        });
    }

    createGraph(classEnv = this) {
        // $(this.divId + 'Graph').removeClass('gaugeContainer');

        // Add svg to canvas
        this.chart = d3.select(this.divId + 'Graph')
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
        
        // Draw axes
        this.updateAndDrawAxes();
        
        // Clip path
        this.clip = this.chart.append('defs').append('SVG:clipPath')
            .attr('id', 'clip')
            .append('SVG:rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('x', 0)
            .attr('y', 0)

        // Scatter
        this.scatter = this.chart.append('g')
            .attr('clip-path', 'url(#clip)')
            .attr('id', this.divId + 'Scatter');

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
                    .data(this.data[key].readings)
                    .attr('class', 'area')
                    .attr('fill', '#69b3a2')
                    .attr('fill-opacity', .3)
                    .attr('stroke', 'none')
                    .attr('d', this.area(this.data[key].readings));
            }

            // Check if line exists for this rack
            var rack = key.substring(0, 1);
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
                var lineColor = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
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
                .data(this.data[key].readings)
                .attr('class', 'line' + index)
                .attr('fill', 'none')
                .attr('stroke', line.color)
                .attr('stroke-width', 4)
                .attr('d', line.line(this.data[key].readings));

            // Create legend for line
            if(!this.detailId) {
                this.chart.append('rect')
                    .attr('id', 'legendRack' + rack)
                    .attr('x', -150)
                    .attr('y', 40 + (index * 25))
                    .attr('width', 20)
                    .attr('height', 20)
                    .style('fill', line.color);
                this.chart.append('text')
                    .attr('id', 'legendRackText' + rack)
                    .attr('x', -120)
                    .attr('y', 55 + (index * 25))
                    .text('Rack ' + line.rack);
            }

            // Append dots to chart
            var dot = this.scatter.append('g')
                .selectAll(this.divId + ' .dot' + index)
                .data(this.data[key].extremeData)
                .enter()
                .append('circle')
                    .attr('class', 'dot')
                    .attr('fill', 'red')
                    .attr('stroke', 'none')
                    .attr('cursor', 'pointer')
                    .attr('cx', function(d) { return classEnv.x(d.datetime); })
                    .attr('cy', function(d) { return classEnv.y(d.sensor_value); })
                    .attr('r', 3)
                    .each(function(d) {
                        var head = d3.select(this);
                        if(classEnv.detailId) {
                            if(d.id == classEnv.detailId) {
                                head.attr('fill', 'green');
                            }
                        }
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

            // Show color picker for this rack, set correct color
            $(this.divId + ' #colorButton' + rack).css('background-color', line.color);
            $(this.divId + ' #colorButton' + rack).prop('disabled', false);
            // Make sure the checkbox is ticked
            $(this.divId + ' #rackCheck' + rack).prop('checked', true);
        });

        // Label for the x axis
        this.chart.append('text')             
            .attr('transform', 'translate(' + (this.width/2) + ',' + (this.height + this.margin.top + 20) + ')')
            .style('text-anchor', 'middle')
            .text('Time');

        // Label for the y axis
        this.chart.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left + this.getLeftMargin().label)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text(s_types.get(this.s_type));

        // Add zoom to the chart
        d3.select(this.divId + ' svg').call(this.zoom);
    }

    // Zoom
    updateZoomChart(classEnv) {
        // recover the new scale
        var newX = d3.event.transform.rescaleX(classEnv.x);
        var newY = d3.event.transform.rescaleY(classEnv.y);

        // update axes with these new boundaries
        classEnv.chart.select(this.divId + ' .xAxis').call(d3.axisBottom(newX));
        classEnv.chart.select(this.divId + ' .yAxis').call(d3.axisLeft(newY));

        // Update lines and dots
        classEnv.updateLinesAndDots(newX, newY);
    }

    // Update graph
    updateGraph() {
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
            .domain(d3.extent(this.data[Object.keys(this.data)[0]].readings, function(d) { return d.datetime; }));
        this.y = d3.scaleLinear()
            .range([this.height, 0])
            .domain([linechartSettings.get(this.s_type).min - linechartSettings.get(this.s_type).delta, linechartSettings.get(this.s_type).max + linechartSettings.get(this.s_type).delta]);

        // Define axes
        this.xAxis = d3.axisBottom(this.x).ticks(15).tickSizeOuter(0);
        this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0);

        // Remove old axes
        d3.select(this.divId + ' .xAxis').remove();
        d3.select(this.divId + ' .yAxis').remove();

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
            this.chart.select(this.divId + ' .line' + index)
                .attr('stroke', line.color)
                .attr('d', drawnLine(this.data[key].readings));
            this.lines[index] = {'rack': line.rack, 'line': drawnLine, 'color': line.color};

            // Line legend
            if(!this.detailId) {
                this.chart.select('#legendRack' + line.rack)
                    .style('fill', line.color);
            }
            
            // Dots
            var dot = this.dots[index].data(this.data[key].extremeData)
                .attr('cx', function(d) { return x(d.datetime); })
                .attr('cy', function(d) { return y(d.sensor_value); });
            this.dots[index] = dot;

            // If detailGraph then make sure the area zooms too
            if(this.detailId) {
                this.area
                    .x(function(d) { return x(d.datetime); })
                    .y1(function(d) { return y(d.sensor_value); });

                this.chart.select('.area').attr('d', this.area(this.data[key].readings));
            }
        });
    }

    // Erase graph drawings
    erase() {
        d3.select(this.divId + ' svg').remove();
        this.checkColorPickers();
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

    // Disable colorPickers
    checkColorPickers() {
        racks.forEach(rack => {
            if(!$(this.divId + ' #rackCheck' + rack).prop('checked')) {
                $(this.divId + ' #colorButton' + rack).prop('disabled', true);
            }
        });
    }
}