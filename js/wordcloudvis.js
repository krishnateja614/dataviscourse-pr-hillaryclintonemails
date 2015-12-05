
function WordCloudVis(_parentElement, _emailData, _topicData, _personIds) {
    var self = this;
    self.parentElement = _parentElement;
    self.emailData = _emailData;
    self.topicData = _topicData;
    self.personIds = [];
    self.idData = _personIds;
    self.frequency_list = [];

    for(var i = 0; i < self.idData.length; ++i){
        self.personIds.push(self.idData[i]['Name']);
    }
    
    self.color = d3.scale.linear()
        .domain([10,15,20,25,30,35,40,45,48,50])
        .range(["#7f0000","#B30000","#d7301f","#ef6548", "#FC8D59", "#FDBB84", "#FDD49E", "#FDD49E", "#FDD49E"]);

    self.wrangleData('topic_1');
    self.updateVis();
}

WordCloudVis.prototype.wrangleData = function (topicSelected) {
    var self = this;
    self.frequency_list = [];
    self.selectedTopic = topicSelected;
    
    for(var i = 0; i < self.personIds.length; ++i){
        self.frequency_list.push({'text': self.personIds[i],'size':0.0});
    }

    for(var i = 0; i < self.emailData.length; ++i){
        var personNumber = parseInt(self.emailData[i]['SenderPersonId']);
        if(!isNaN(personNumber) && personNumber >= 0 && personNumber < self.frequency_list.length){
            var probability = parseFloat(self.emailData[i][self.selectedTopic]);
            if(probability > 0.2){
                self.frequency_list[personNumber]['size'] += probability;    
            } 
        }
    }
    self.frequency_list=self.frequency_list.sort(function(a,b) {return a.size - b.size;});
    self.frequency_list = (self.frequency_list.slice(-30)).reverse();
}

WordCloudVis.prototype.updateVis = function () {
    var self = this;
    self.svg = self.parentElement.select("svg");
    self.svg.selectAll("*").remove();
    
    d3.layout.cloud().size([450, 350])
        .words(self.frequency_list)
        .rotate(0)
        .padding(1)
        .text(function(d){return d['text'];})
        .fontSize(function(d) {
            var max_font = 50;
            if(self.topicSelected == 'topic_2'){max_font = 30;}
             var temp = Math.min(d.size*20, max_font); 
             return Math.max(15, temp);
        })
        .on("end", draw)
        .start();

    function draw(words){
    // removing SIR ji from the data
    for(var i = 0; i < words.length; ++i){
        if(words[i]['text'] == 'Sir'){words.splice(i, 1);}
    }
    
    self.svg.append("g")
        .attr("transform", "translate(200,225)")
        .selectAll("text")
        .data(words).enter().append("text")
        .style("font-size", function(d) { return d.size*0.7 + "px"; })
        .style("fill", function(d, i) { return self.color(d.size*0.7); })
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });    
    }
    
    draw(self.frequency_list);
};

WordCloudVis.prototype.onSelectionChange = function (topicSelected) {
    var self = this;
    self.wrangleData(topicSelected);
    self.updateVis();
};