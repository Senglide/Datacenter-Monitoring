// Script variables
var data = [];

// Graph dimensions
var margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Set ranges
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

// Define axes
var xAxis = d3.axisBottom(x).ticks(15).tickSizeOuter(0),
    yAxis = d3.axisLeft(y).tickSizeOuter(0);

// Define area
var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.datetime); })
    .y0(height)
    .y1(function(d) { return y(d.sensor_value); });

// Define line
var line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.datetime); })
    .y(function(d) { return y(d.sensor_value); });

// Define dot
var dot;

// Add svg to canvas
var chart = d3.select('#graph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Update graph every n seconds
function startUpdates() {
    setInterval(function() {
        getData(updateGraph);
    }, 300000);
}

// Get data for graph
function getData(nextFunction) {
    $.ajax({
        type: 'GET',
        url: 'get_newest_readings',
        dataType: 'json',
        success: function(response) {
            // Format data
            response.readings.forEach(reading => {
                reading.datetime = new Date(reading.datetime);
                data.push(reading);
            });
            // Call next function
            nextFunction();  
        }
    });
}

// Draw first graph
function drawFirstGraph() {
    // Domains
    x.domain(d3.extent(data, function(d) { return d.datetime; }));
    y.domain([0, d3.max(data, function(d) { return +d.sensor_value; }) + 15]);

    // Append area to chart
    chart.append('path')
        .data(data)
        .attr('class', 'area')
        .attr('fill', '#69b3a2')
        .attr('fill-opacity', .3)
        .attr('stroke', 'none')
        .attr('d', area(data));

    // Append line to chart
    chart.append('path')
        .data(data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', '#69b3a2')
        .attr('stroke-width', 4)
        .attr('d', line(data));

    // Append dots to chart
    dot = chart.append('g')
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
            .attr('class', 'dot')
            .attr('fill', 'red')
            .attr('stroke', 'none')
            .attr('cursor', 'pointer')
            .attr('cx', function(d) { return x(d.datetime); })
            .attr('cy', function(d) { return y(d.sensor_value); })
            .attr('r', 5)
            .on('click', function(d) {
                $('#date').html('Date of sensor reading: ' + d.datetime);
                $('#value').html('Value of sensor reading: ' + d.sensor_value);
                $('#detailModal').modal();
            });

    // Add X and Y axis to svg
    chart.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'xAxis')
        .call(xAxis);
    chart.append('g')
        .attr('class', 'yAxis')
        .call(yAxis);
}

// Update graph
function updateGraph() {
    // Domains
    x.domain(d3.extent(data, function(d) { return d.datetime; }));
    y.domain([0, d3.max(data, function(d) { return +d.sensor_value; }) + 15]);

    // Select section where to apply changes
    var chart = d3.select('svg').transition();

    // Make changes
    chart.select('.area')
        .duration(750)
        .attr('d', area(data));
    chart.select('.line')
        .duration(750)
        .attr('d', line(data));
    chart.select('.xAxis')
        .duration(750)
        .call(xAxis);
    chart.select('.yAxis')
        .duration(750)
        .call(yAxis);

    // Update dots
    dot.data(data)
        .transition()
        .duration(750)
        .attr('cx', function(d) { return x(d.datetime); })
        .attr('cy', function(d) { return y(d.sensor_value); });
}

// Draw first graph
getData(drawFirstGraph);
// Start update cycle
startUpdates(updateGraph);