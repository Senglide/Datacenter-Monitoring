class Graph {
    // Constructor
    constructor(divId, rack, s_type, connectionSettings, detailId) {
        // Graph global variables
        this.x, this.y, this.xAxis, this.yAxis, this.area, this.line, this.dot, this.chart, this.data, this.predictions, this.extremeData,
        this.divId = '#' + divId,
        this.rack = rack,
        this.s_type = s_type,
        this.connectionSettings = connectionSettings,
        this.detailId = detailId;
        this.margin = {top: 10, right: 30, bottom: 30, left: 50},
        this.width = $(this.divId).width() - this.margin.left - this.margin.right,
        this.height = 200 - this.margin.top - this.margin.bottom;
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
        var newData = [],
            newPredictions = [];
        // Get new data
        $.ajax({
            type: 'GET',
            url: this.prepareForData(resetGraph),
            dataType: 'json',
            success: function(response) {
                // Format new data
                response.readings.forEach(reading => {
                    reading.datetime = new Date(reading.date + 'T' + reading.time);
                    if(resetGraph) {
                        classEnv.data.unshift(reading);
                    } else {
                        newData.unshift(reading);
                    }
                });
                // Format new predictions
                response.predictions.forEach(reading => {
                    reading.datetime = new Date(reading.date + 'T' + reading.time);
                    if(resetGraph) {
                        classEnv.predictions.unshift(reading);
                    } else {
                        newPredictions.unshift(reading);
                    }
                });
                // Add new data to existing data
                classEnv.data = classEnv.data.concat(newData);
                // Add new predictions to existing predictions
                classEnv.predictions = classEnv.predictions.concat(newPredictions);
                // Get averages if necessary
                if(getAverage) {
                    classEnv.calculateExtremeData()
                } else {
                    classEnv.extremeData = classEnv.data.slice();
                }
                // Finish composing data and call next function
                if(resetGraph) {
                    classEnv.createGraph();
                } else {
                    classEnv.updateGraph();
                }
            }
        });
    }

    // Prepare arrays and decide which connectionstring to use
    prepareForData(resetGraph) {
        this.extremeData = [];
        if(resetGraph) { 
            this.data = [];
            this.predictions = [];
            return this.connectionSettings.resetString;
        } else { 
            this.data = this.data.slice(refreshSettings.amount, this.data.length);
            this.predictions = this.predictions.slice(refreshSettings.amount, this.predictions.length);
            return this.connectionSettings.refreshString;
        }
    }

    // Get the odd values from the data
    calculateExtremeData() {
        // Function variables
        var averageOfValues,
            totalOfValues = 0;
        // Calculate average value
        this.data.forEach(reading => {
            totalOfValues += reading.sensor_value;
        });
        averageOfValues = totalOfValues / this.data.length;
        // Add odd values to extremeData array
        this.data.forEach(reading => {
            if(reading.sensor_value < averageOfValues -5 || reading.sensor_value > averageOfValues + 5 || reading.id == this.detailId) {
                this.extremeData.push(reading);
            }
        });
    }

    createGraph(classEnv = this) {
        // Clear the old graph
        d3.select(classEnv.divId + ' svg').remove();

        // Set ranges
        this.x = d3.scaleTime().range([0, this.width]);
        this.y = d3.scaleLinear().range([this.height, 0]);

        // Define axes
        this.xAxis = d3.axisBottom(this.x).ticks(15).tickSizeOuter(0);
        this.yAxis = d3.axisLeft(this.y).tickSizeOuter(0);

        // Define area
        this.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return classEnv.x(d.datetime); })
            .y0(this.height)
            .y1(function(d) { return classEnv.y(d.sensor_value); });

        // Define data line
        this.line = d3.line()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return classEnv.x(d.datetime); })
            .y(function(d) { return classEnv.y(d.sensor_value); });

        // Define predictions line
        this.predictedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return classEnv.x(d.datetime); })
            .y(function(d) { return classEnv.y(d.sensor_value); });

        // Add svg to canvas
        this.chart = d3.select(this.divId + 'Graph')
            .append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        // Label for the x axis
        this.chart.append('text')             
            .attr('transform', 'translate(' + (this.width/2) + ',' + (this.height + this.margin.top + 20) + ')')
            .style('text-anchor', 'middle')
            .text('Time');

        // Label for the y axis
        this.chart.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - this.margin.left)
            .attr('x', 0 - (this.height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text(s_types.get(this.s_type));

        // Domains
        this.x.domain(d3.extent(this.data, function(d) { return d.datetime; }));
        this.y.domain([0, d3.max(this.data, function(d) { return +d.sensor_value; }) + 5]);

        // Append area to chart
        this.chart.append('path')
            .data(this.data)
            .attr('class', 'area')
            .attr('fill', '#69b3a2')
            .attr('fill-opacity', .3)
            .attr('stroke', 'none')
            .attr('d', this.area(this.data));

        // Append line to chart
        this.chart.append('path')
            .data(this.data)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', '#69b3a2')
            .attr('stroke-width', 4)
            .attr('d', this.line(this.data));

        // Append predictions line to chart
        // this.chart.append('path')
        //     .data(this.predictions)
        //     .attr('class', 'predictedLine')
        //     .attr('fill', 'none')
        //     .attr('stroke', '#FF4500')
        //     .attr('stroke-width', 4)
        //     .attr('d', this.predictedLine(this.predictions));

        // Append dots to chart
        this.dot = this.chart.append('g')
            .selectAll(this.divId + ' .dot')
            .data(this.extremeData)
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
                                'rack': classEnv.rack,
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

        // Add X and Y axis to svg
        this.chart.append('g')
            .attr('transform', 'translate(0,' + this.height + ')')
            .attr('class', 'xAxis')
            .call(this.xAxis);
        this.chart.append('g')
            .attr('class', 'yAxis')
            .call(this.yAxis);
    }

    // Update graph
    updateGraph(classEnv = this) {
        // Domains
        this.x.domain(d3.extent(this.data, function(d) { return d.datetime; }));
        this.y.domain([0, d3.max(this.data, function(d) { return +d.sensor_value; }) + 5]);

        // Select section where to apply changes
        this.chart = d3.select(this.divId + ' svg').transition();

        // Make changes
        this.chart.select(this.divId + ' .area')
            .duration(1000)
            .attr('d', this.area(this.data));
        this.chart.select(this.divId + ' .line')
            .duration(1000)
            .attr('d', this.line(this.data));
        this.chart.select(this.divId + ' .predictedLine')
            .duration(1000)
            .attr('d', this.predictedLine(this.predictions));
        this.chart.select(this.divId + ' .xAxis')
            .duration(1000)
            .call(this.xAxis);
        this.chart.select(this.divId + ' .yAxis')
            .duration(1000)
            .call(this.yAxis);

        // Update dots
        this.dot.data(this.extremeData)
            .transition()
            .duration(1000)
            .attr('cx', function(d) { return classEnv.x(d.datetime); })
            .attr('cy', function(d) { return classEnv.y(d.sensor_value); });
    }
}