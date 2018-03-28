class CrashStats
{
    constructor(crashes)
    {
        this.crashes = crashes;
    }

    plot()
    {
        let crashStats_Div = d3.select("#crashStats");

        let margin = {top: 20, right: 20, bottom: 100, left: 164},
            svgBounds = crashStats_Div.node().getBoundingClientRect(),
            width = svgBounds.width - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        let svg = d3.select("#crash-plot")
            .attr("width", svgBounds.width)
            .attr("height", 450 + margin.top + margin.bottom);

        let g = d3.select("#crash-plot-group")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let xScale = d3.scaleBand()
            .domain(Array.from(monthCrashDates))
            .padding([1])
            .range([0, width]);

        //Add the x Axis
        d3.select("#xAxis")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .transition()
            .duration(1500)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        //Add the x Axis label
        let xLabel = d3.select("#xLabel").selectAll("text")
            .data(["Date"]);

        let xLabelEnter = xLabel.enter().append("text")
            .attr("class", "font-weight-bold")
            .attr("fill", "#000")
            .style("opacity", 0)
            .attr("x", width/2)
            .attr("y", -7)
            .text((d) => { return d; })
            .attr("text-anchor", "middle")
            .transition()
            .duration(1500)
            .style("opacity", 1);

        let yScale = d3.scaleTime()
            .domain([new Date(moment("00:00", "HH:mm")), new Date(moment("23:59", "HH:mm"))])
            .range([height, 0]);

        yScale.nice();

        //Add the y Axis
        d3.select("#yAxis")
            .transition()
            .duration(1500)
            .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%H:%M")));

        //Add the y Axis label
        let yLabel = d3.select("#yLabel").selectAll("text")
            .data(["Time"]);

        let yLabelEnter = yLabel.enter().append("text")
            .attr("class", "font-weight-bold text-capitalize")
            .attr("fill", "#000")
            .style("opacity", 0)
            .attr("transform", "rotate(-90)")
            .attr("x", -height/2)
            .attr("y", -width/10)
            .attr("text-anchor", "middle")
            .text((d) => { return d; })
            .transition()
            .duration(1500)
            .style("opacity", 1);

        //Add the plot points (i.e. crashes for the selected month)
        let points = g.selectAll("circle")
            .data(this.crashes);

        //Initialize tooltip
        let tip = d3.tip().attr("class", "d3-tip-node").html((d) => {
            return "Click to analyze crash";
        });

        let pointsEnter = points.enter().append("circle");
        points.exit().remove();
        points = points.merge(pointsEnter);

        points
            .transition()
            .duration(1500)
            .attr("r", 4.5)
            .attr("cx", (d) => { return xScale(d["CRASH_DATE"]); })
            .attr("cy", (d) => { return yScale(new Date(moment(d["TIMESTR"], "HH:mm"))); })
            .style("fill", (d) => { return d3.interpolateOranges(compressor(d["CSEV"]))});

        //Show environment data in modal for selected crash
        points.on('click', function (d) {

            crashStats.clearSelected();

            d3.select(this)
                .classed("selected", true);

            getEnvironmentDataFor(d);
        });

        //Invoke the tip on the plot points
        points.call(tip)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);
    }

    clearSelected()
    {
        d3.selectAll(".selected")
            .classed("selected", false);
    }
}
