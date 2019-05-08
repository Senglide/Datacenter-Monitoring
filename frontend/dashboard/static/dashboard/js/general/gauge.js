class Gauge {
    // Constructor
    constructor(divId, rack, s_type) {
        // Graph global variables
        this.body, this.pointerContainer, this.pointerLine, this.pointer, this.currentRotation, this.gaugeValue, this.pointerPath,
        this.divId = divId,
        this.totalSize = 200,
        this.rack = rack,
        this.s_type = s_type, 
        this.min = gaugeSettings.get(s_type).min,
        this.max = gaugeSettings.get(s_type).max,
        this.majorTicks = 5,
        this.minorTicks = 3,
        this.transitionDuration = 1000,
        this.gaugeSize = this.totalSize * 0.9,
        this.radius = this.totalSize * 0.97 / 2,
        this.cx = this.totalSize / 2,
        this.cy = this.totalSize / 2,
        this.range = this.max - this.min,
        this.warnZones = [{ from: this.min + this.range * 0.75, to: this.min + this.range * 0.9 }];
        this.errZones = [{ from: this.min + this.range * 0.9, to: this.max }];
        this.okColor = '#109618',
        this.warnColor = '#FF9900',
        this.errColor = '#DC3912',
        this.gaugeFontSize = Math.round(this.gaugeSize / 9),
        this.tickFontSize = Math.round(this.gaugeSize / 16),
        this.labelFontsize = Math.round(this.gaugeSize / 10),
        this.majorDelta = this.range / (this.majorTicks - 1),
        this.minorDelta = this.majorDelta / this.minorTicks,
        this.pointerDelta = this.range / 13;
    }

    createGauge() {
        d3.select('#' + this.divId + 'Graph svg').remove();
        $('#' + this.divId + 'Graph').addClass('gaugeContainer');

        // Create the gauge body
        this.body = d3.select('#' + this.divId + 'Graph')
            .append('svg:svg')
            .attr('class', 'gauge')
            .attr('width', this.totalSize)
            .attr('height', this.totalSize);

        // Add the outer circle
        this.body.append('svg:circle')
            .attr('cx', this.cx)
            .attr('cy', this.cy)
            .attr('r', this.radius)
            .style('fill', '#ccc')
            .style('stroke', '#000')
            .style('stroke-width', '0.5px');

        // Add the inner circle
        this.body.append('svg:circle')
            .attr('cx', this.cx)
            .attr('cy', this.cy)
            .attr('r', 0.9 * this.radius)
            .style('fill', '#fff')
            .style('stroke', '#e0e0e0')
            .style('stroke-width', '2px');

        // Add gauge label
        this.body.append('svg:text')
            .attr('x', this.cx)
            .attr('y', this.cy / 2 + this.gaugeFontSize / 2)
            .attr('dy', this.gaugeFontSize / 2)
            .attr('text-anchor', 'middle')
            .text(s_types.get(this.s_type))
            .style('font-size', this.gaugeFontSize / 1.5 + 'px')
            .style('fill', '#333')
            .style('stroke-width', '0px');

        // Add orange bands
        this.warnZones.forEach(zone => {
            this.drawBand(zone.from, zone.to, this.warnColor);
        })

        // Add red bands
        this.errZones.forEach(zone => {
            this.drawBand(zone.from, zone.to, this.errColor);
        })

        // Add ticks
        for(var majorTick = this.min; majorTick <= this.max; majorTick += this.majorDelta) {
            // Draw major ticks as a line from startpoint to endpoint
            var startpoint = this.datavalueToPoint(majorTick, 0.7);
            var endpoint = this.datavalueToPoint(majorTick, 0.85);
            this.body.append('svg:line')
                .attr('x1', startpoint.x)
                .attr('y1', startpoint.y)
                .attr('x2', endpoint.x)
                .attr('y2', endpoint.y)
                .style('stroke', '#333')
                .style('stroke-width', '2px');

            // Draw a label for the first and last major ticks starting on a point
            if(majorTick == this.min || majorTick == this.max) {
                var point = this.datavalueToPoint(majorTick, 0.63);
                this.body.append('svg:text')
                    .attr('x', point.x)
                    .attr('y', point.y)
                    .attr('dy', this.tickFontSize / 3)
                    .attr('text-anchor', majorTick == this.min ? 'start' : 'end')
                    .text(majorTick)
                    .style('font-size', this.tickFontSize + 'px')
                    .style('fill', '#333')
                    .style('stroke-width', '0px');
            }

            for(var minorTick = majorTick + this.minorDelta; minorTick < Math.min(majorTick + this.majorDelta, this.max); minorTick += this.minorDelta) {
                // Draw minor ticks as a line from startpoint to endpoint
                var startpoint = this.datavalueToPoint(minorTick, 0.75);
                var endpoint = this.datavalueToPoint(minorTick, 0.85);
                this.body.append('svg:line')
                    .attr('x1', startpoint.x)
                    .attr('y1', startpoint.y)
                    .attr('x2', endpoint.x)
                    .attr('y2', endpoint.y)
                    .style('stroke', '#666')
                    .style('stroke-width', '1px');
            }
        }

        // Add the pointer container
        this.pointerContainer = this.body.append('svg:g')
            .attr('class', 'pointerContainer');

        // Create the pointer
        this.pointerPath = this.buildPointerPath(this.gaugeValue);
        this.pointerLine = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(d3.curveBasis);

        // Add the pointer
        this.pointerContainer.selectAll('path')
            .data([this.pointerPath])
            .enter()
            .append('svg:path')
                .attr('d', this.pointerLine)
                .style('fill', '#dc3912')
                .style('stroke', '#c63310')
                .style('fill-opacity', 0.7);

        // Add the pointer base point
        this.pointerContainer.append('svg:circle')
            .attr('cx', this.cx)
            .attr('cy', this.cy)
            .attr('r', 0.12 * this.radius)
            .style('fill', '#4684EE')
            .style('stroke', '#666')
            .style('opacity', 1);

        // Add value label on the bottom of the gauge
        this.pointerContainer.append('svg:text')
            .attr('x', this.cx)
            .attr('y', this.totalSize - this.cy / 4 - this.labelFontsize)
            .attr('dy', this.labelFontsize / 2)
            .attr('text-anchor', 'middle')
            .text(this.gaugeValue)
            .style('font-size', this.labelFontsize + 'px')
            .style('fill', '#000')
            .style('stroke-width', '0px');
    }

    // Update the pointer with a new position
    updatePointer(value, classEnv = this) {
        // Function variables
        var delta, timeout, isDecreasing,
            stepValue = this.gaugeValue,
            i = 0;

        // Calculate function variables based on decreasing / increasing value and update the pointer
        if(value !== this.gaugeValue) {
            if(value < this.gaugeValue) {
                delta = this.gaugeValue - value;
                timeout = this.transitionDuration / delta;
                isDecreasing = true;
                setTimeout(transitionOneTick, timeout);
            } else if(value > this.gaugeValue) {
                delta = value - this.gaugeValue;
                timeout = this.transitionDuration / delta;
                isDecreasing = false;
                setTimeout(transitionOneTick, timeout);
            }    
        }

        // Function to update the pointer position
        function transitionOneTick() {
            // Get next step value
            if(isDecreasing) {
                stepValue --;
            } else {
                stepValue ++;
            }

            // Update the pointer with the new value
            classEnv.pointerPath = classEnv.buildPointerPath(stepValue);
            classEnv.pointerContainer.selectAll('path')
                .data([classEnv.pointerPath])
                .transition()
                .duration(timeout)
                .attr('d', classEnv.pointerLine);

            // If delta isn't reached, repeat
            i ++;
            classEnv.pointerContainer.selectAll('text').text(stepValue);
            if(i !== delta) {
                setTimeout(transitionOneTick, timeout)
            }
        }

        // Set new value classwide
        this.gaugeValue = value;
        this.pointerContainer.selectAll('text').text(this.gaugeValue);
    }

    // Calculate where to put data points
    datavalueToPoint(value, factor) {
        return {
            x: this.cx - this.radius * factor * Math.cos(this.datavalueToRadians(value)),
            y: this.cy - this.radius * factor * Math.sin(this.datavalueToRadians(value))
        };
    }

    // Recalculate a data value to a radian value
    datavalueToRadians(value) {
        return this.datavalueToDegrees(value) * Math.PI / 180;
    }

    // Recalculate a data value to degrees
    datavalueToDegrees(value) {
        return value / this.range * 270 - (this.min / this.range * 270 + 45);
    }

    // Build vector path for the gauge pointer
    buildPointerPath(value) {
        // Pointer head
        var head1 = this.datavalueToPoint(value, 0.85),
            head2 = this.datavalueToPoint(value - this.pointerDelta, 0.12),
            head3 = this.datavalueToPoint(value + this.pointerDelta, 0.12);

        // Pointer tail
        var pointerTailValue = value - (this.range * (1/(270/360)) / 2),
            tail1 = this.datavalueToPoint(pointerTailValue, 0.28),
            tail2 = this.datavalueToPoint(pointerTailValue - this.pointerDelta, 0.12),
            tail3 = this.datavalueToPoint(pointerTailValue + this.pointerDelta, 0.12);

        // Return vector coördinates
        return [head1, head2, tail3, tail1, tail2, head3, head1];
    }

    // Draw warn and err bands
    drawBand(start, end, color, classEnv = this) {
        if(start < end) {
            this.body.append('svg:path')
                .style('fill', color)
                .attr('d', d3.arc()
                    .startAngle(this.datavalueToRadians(start))
                    .endAngle(this.datavalueToRadians(end))
                    .innerRadius(0.65 * this.radius)
                    .outerRadius(0.85 * this.radius))
                    .attr('transform', function() { return 'translate(' + classEnv.cx + ', ' + classEnv.cy + ') rotate(270)' });
        }
    }

    // Get the latest data and update the gauge
    getData(isReset, classEnv = this) {
        $.ajax({
            type: 'GET',
            url: 'get_newest_readings/' + this.rack + '/' + this.s_type + '/1',
            dataType: 'json',
            success: function(response) {
                response.readings.forEach(reading => {
                    if(isReset) {
                        classEnv.gaugeValue = reading.sensor_value;
                        classEnv.createGauge();
                    } else {
                        classEnv.updatePointer(reading.sensor_value);
                    }
                });
            }
        });
    }

    // Erase gauge drawings
    erase() {
        d3.select('#' + this.divId + 'Graph svg').remove();
    }
}