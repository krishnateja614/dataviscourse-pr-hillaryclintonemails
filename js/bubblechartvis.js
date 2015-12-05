
function BubbleChartVis(data,_eventHandler) {
    var self = this;
    topic_names = ["Politics","Personal","President","Bengazhi attacks","Israel and Afghanistan","Elections","Work","Foreign Policy","Koch Brothers","Healthcare bill"];
    self.data = data;
    self.displayData_edges = []
    self.displayData_vertices = {}
    self.eventHandler = _eventHandler;
    self.topicSelected = 'topic_1';
    self.initVis();
}

BubbleChartVis.prototype.initVis = function () {
    var self = this;
    self.wrangleData();

    var svgBounds = document.getElementById("bubbleChartVis").getBoundingClientRect();
    var svgheight = svgBounds.height;
    var svgwidth = svgBounds.width;
    var force = d3.layout.force()
        .nodes(d3.values(self.displayData_vertices))
        .links(self.displayData_edges)
        .size([svgwidth, svgheight])
        .linkDistance(90)
        .charge(-315)
        .on("tick", tick)
        .start();
    var svg = d3.select("#bubbleChartVis");

    
    // building the arrows.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // adding links and arrows
    var path = svg.append("g").selectAll("path")
        .data(force.links())
        .enter().append("path")
        .style("stroke", function(d) { 
            if(d.source.name == self.topicSelected || d.target.name == self.topicSelected) {return "#7f0000";}
            return "#FC8D59"; })
        .attr("class", "link")
        .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    // add the nodes
    node.append("circle")
        .attr("r", function(d){
            if(d.name.indexOf('topic_') > -1){
                return '17px'
            }
            else{
                return '7px'
            }
        })
        .style("opacity", "1.0")
        .style("fill", function(d) { 
            if(d.name == self.topicSelected) {return "#7f0000";}
            return "#FC8D59"; })
        ;

    // add the text
    node.append("text")
        .attr("x", 15)
        .attr("dy", function(d,i){
            if(d.name.indexOf('topic_') > -1)
            {
               return "2.0em";
            }
            else
                return "0.80em"; })
        .style("font-size", function(d,i){
            if(d.name.indexOf('topic_') > -1)
            {
                return "16px";
            }
            else
                return "10px";
        })
        .text(function(d,i) {
            if(d.name.indexOf('topic_') > -1)
            {
                var index = d.name.substr(6);
                return topic_names[parseInt(index)-1];
            }
            else
                return d.name; });
    node.on("click",function(d){
        if(d.name.indexOf('topic_') > -1){
            d3.select("#bubbleChartVis").selectAll("circle").style("fill", "#FC8D59");
            d3.select(this).select("circle").style("fill", "#7f0000");
            
            d3.select("#bubbleChartVis").selectAll("path").each(function(d2, i){
                if(typeof d2['source'] != 'undefined' && typeof d2['target'] != undefined){
                    if(d2['source'].name == d.name || d2['target'].name == d.name){
                        d3.select(this).style("stroke", "#7f0000");
                    }else{
                        d3.select(this).style("stroke", "#FC8D59");
                    }
                }
            })
            self.eventHandler.on("selectionChanged",selectionChanged(d.name))
            self.topicSelected = d.name;
        }
    })

    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; });
    }
};

BubbleChartVis.prototype.wrangleData = function () {
    var self = this;
    self.filterAndAggregate();
};

BubbleChartVis.prototype.filterAndAggregate = function (){
    var self = this;
    var cnt = 0;
    var edges_count = 0;

    self.data.forEach(function(d,i){
        for(var x in d){
            self.displayData_edges.push({source :  x, target : d[x]});
            edges_count++;
        }
    })
     var nodes = {}
     self.displayData_edges.forEach(function(edge) {
     edge.source = nodes[edge.source] ||
     (nodes[edge.source] = {name: edge.source});
     edge.target = nodes[edge.target] ||
     (nodes[edge.target] = {name: edge.target});
     });
    self.displayData_vertices = nodes;
}
