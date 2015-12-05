function StreamGraphVis(topicData,colorSelected) {
    var self = this;

    self.data = topicData;
    self.displayData = [];
    self.colorSelected = colorSelected;
    self.initVis();
}

function Temp(_key, _value, _date){
    var self = this;
    self.key = _key;
    self.value = +_value;
    self.date = _date;
}

StreamGraphVis.prototype.wrangleData = function () {
    var self = this;
    var format = d3.time.format("%m/%d/%y");
    self.displayData = [];

    self.data.forEach(function(d) {
        var temp = new Temp(d.key, d.value, format.parse(d.date));
        self.displayData.push(temp);    
    });
};

StreamGraphVis.prototype.initVis = function () {
    var self = this;
    var datearray = [];
    var colorrange = [];
    if (self.colorSelected == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (self.colorSelected == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (self.colorSelected == "orange") {
        colorrange = ["#7f0000","#B30000","#d7301f","#ef6548", "#FC8D59", "#FDBB84", "#FDD49E", "#fee8c8", "#fff7ec"];
    }
    strokecolor = colorrange[0];

    var margin = {top: 0, right: 40, bottom: 50, left: 40};
    var svgBounds = document.getElementById("streamGraphVis").getBoundingClientRect();
    var height = 400;
    var width = 1000;
    var top = svgBounds.top;
    var left = svgBounds.left;
    var right = svgBounds.right;
    var bottom = svgBounds.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height-50, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.years);

    var yAxis = d3.svg.axis()
        .scale(y);

    var yAxisr = d3.svg.axis()
        .scale(y);

    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    svg = d3.select("#streamGraphVis")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var tooltip = d3.select("#tooltip")
        .attr("class", "remove")
        .style("position", "relative")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("bottom", "400px")
        .style("left","0px");

    self.wrangleData();
    
    var layers = stack(nest.entries(self.displayData));

    x.domain(d3.extent(self.displayData, function(d) { return d.date; }));
    y.domain([0, d3.max(self.displayData, function(d) { return d.y0 + d.y; })]);


svg.selectAll(".layer")
        .data(layers)
        .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); })
        
        .style("fill-opacity",0)
        .transition()
        .duration(1200)         
        .style("fill-opacity",1);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxis.orient("right"));

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.orient("left"));

    svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
            
            svg.selectAll(".layer").transition()
                .duration(150)
                .attr("opacity", function(d, j) {
                    return j != i ? 0.6 : 1;
                })})

        .on("mousemove", function(d, i) {
            
            mousex = d3.mouse(this);
            mousex = mousex[0];
            var invertedx = x.invert(mousex);
            invertedx = invertedx.getMonth() + invertedx.getDate() + invertedx.getFullYear();
            var selected = (d.values);
            var pro = " ";
            
            try{
               for (var k = 0; k < selected.length; k++) {
                    datearray[k] = selected[k].date
                    datearray[k] = datearray[k].getMonth() + datearray[k].getDate()+ datearray[k].getFullYear();
                }
                
                mousedate = datearray.indexOf(invertedx);
                if(mousedate < d.values.length && d.values[mousedate]){pro = d.values[mousedate].value;}
 
            }
            catch(err){
                pro = " ";
            }
            d3.select(this)
                .classed("hover", true)
                .attr("stroke", strokecolor)
                .attr("stroke-width", "0px"),
                
                tooltip.html( "<p>" + d.key + "<br>" +((x.invert(mousex).getMonth())+1).toString()+"/"+ ((x.invert(mousex).getDate())).toString()+"/"+x.invert(mousex).getFullYear().toString() + "<br>" + "Frequency/month: " + pro +"</p>" ).style("visibility", "visible");

        })
        .on("mouseout", function(d, i) {
            svg.selectAll(".layer")
                .transition()
                .duration(150)
                .attr("opacity", "1");
            d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px"), tooltip.html( "<p> <br> <br> <br> </p>" ).style("visibility", "hidden");
        })

    
    self.updateVis();
};

StreamGraphVis.prototype.updateVis = function () {
    var self = this;
};

StreamGraphVis.prototype.onSelectionChange = function (selectionData) {
    var self = this;
    self.data = selectionData;
    d3.select('#streamGraphVis').selectAll('*').remove();
    d3.select("#tooltip").style("visibility", "hidden");
    self.initVis();
};