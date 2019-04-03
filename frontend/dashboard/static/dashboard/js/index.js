// Graph dimensions
var margin = {top: 10, right: 30, bottom: 30, left: 50},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

// Set ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define axes
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

// Define arealine
var arealine = d3.area()
    .x(function(d) { return x(d.datetime); })
    .y0(y(0))
    .y1(function(d) { return y(d.sensor_value); });

// Add svg to canvas
var chart = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Update graph every n seconds
function startUpdates() {
    setInterval(function() {
        getData(updateGraph);
    }, 5000);
}

// Get data for graph
function getData(nextFunction) {
    $.ajax({
        type: 'GET',
        url: 'get_newest_readings',
        dataType: 'json',
        success: function(response) {
            // Format data
            var data = response.readings;
            data.forEach(reading => {
                reading.datetime = new Date(reading.datetime);
            });
            nextFunction(data);  
        }
    });
}

// Draw first graph
function drawFirstGraph(data) {
    // Domains
    x.domain(d3.extent(data, function(d) { return d.datetime; }));
    y.domain([0, d3.max(data, function(d) { return +d.sensor_value; }) + 25]);

    // Append data to chart
    chart.append('path')
        .data([data])
        .attr('class', 'areaLine')
        .attr('fill', '#cce5df')
        .attr('stroke', '#69b3a2')
        .attr('stroke-width', 1.5)
        .attr('d', arealine(data));

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
function updateGraph(data) {
    // Domains
    x.domain(d3.extent(data, function(d) { return d.datetime; }));
    y.domain([0, d3.max(data, function(d) { return +d.sensor_value; }) + 25]);

    // Select section where to apply changes
    var chart = d3.select('svg').transition();

    // Make changes
    chart.select('.areaLine')
        .duration(750)
        .attr('d', arealine(data));
    chart.select('.xAxis')
        .duration(750)
        .call(xAxis);
    chart.select('.yAxis')
        .duration(750)
        .call(yAxis);
}

// Draw first graph
getData(drawFirstGraph);
// Start update cycle
startUpdates(updateGraph);