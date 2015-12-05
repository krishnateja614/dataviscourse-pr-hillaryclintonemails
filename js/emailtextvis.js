
function EmailTextVis(_masterdata,_personIds) {
    var self = this;

    topic_names = ["Politics","Personal","President","Bengazhi attacks","Israel and Afghanistan","Elections","Work","Foreign Policy","Koch Brothers","Healthcare bill"];
    self.data = _masterdata;
    self.tempData = [];
    self.personIds = [];
    self.idData = _personIds;
    self.topicSelected = 'topic_1';
    self.displayData = new Array();
    var date;
    list_data  = [];
    var topic = ''
    for(var i = 0; i < self.idData.length; ++i){
        self.personIds.push(self.idData[i]['Name']);
    }
    self.data.forEach(function(d,i){
        var highest = 0;
        var highestIndex = -1;
        var str = ''
        var i = 0;
        for(i = 1 ; i <= 17 ; i++){
            str = 'topic_'+ i.toString();
            if(d[str] > highest){
                highest = d[str];
                highestIndex = i;
            }
        }
        var id = parseInt(d.SenderPersonId)-1;
        date = new Date(d.MetadataDateSent);
        self.tempData.push({
            senderName : self.personIds[id],
            extractedSubject : d.ExtractedSubject,
            emailContent : d.ExtractedBodyText,
            topic : 'topic_'+ highestIndex.toString(),
            date : (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
        })
    })
    self.initVis();
}
/*
Code for generating pop-up
 */
function displayContent(index){
    w2popup.open({
        title: '<p id = "popupTitle" align="center">Email from '+list_data[index].senderName+'</p>',
        body: '<div id = "popupContent" style="padding: 10px; font-size: 11px; line-height: 150%; border-style: hidden;"><h5 class="popupLabels">From: </h5>'+list_data[index].senderName+'<br/><h5 class="popupLabels">Subject: </h5>'+list_data[index].extractedSubject+'<br/><h5 class="popupLabels">Email Content:</h5>'+list_data[index].emailContent+'</div>',
        //buttons: '<button class="btn" onclick="w2popup.close();">Close</button>',
        width : 600,
        height : 400});
}

EmailTextVis.prototype.initVis = function () {
    var self = this;
    self.wrangleData();
    list_data = self.displayData;
    var index = parseInt(self.topicSelected.substr(6))-1;
    var topicName = topic_names[index];
    var header_html = '<p id="header_mail" class="navbar-brand" align ="right">Emails listed under topic : '+topicName+'</p>'
    var html = '<table class="table table-hover" id="email_table"><tbody><tr id="table_heading"><td scope="row"></td><td> </td><td>Sender</td><td>Subject</td><td>Date</td></tr>';
    for(var i=0 ; i<self.displayData.length ; i++){

        html += '<tr onclick="displayContent(\'' + i + '\')"><td scope="row"></td><td><i class="fa fa-star"></i></td><td>' + self.displayData[i].senderName + '</td><td>'+ self.displayData[i].extractedSubject + '</td><td>' + self.displayData[i].date + '</td></tr>';
    }
    html += '</tbody></table>';
    $("#email_list").append(html);
    $("#mail_header").append(header_html);
};

EmailTextVis.prototype.wrangleData = function () {
    var self = this;
    self.displayData = [];
    for(var i=0 ; i<self.tempData.length ; i++){
        if(self.tempData[i]['topic'] == self.topicSelected){
            self.displayData.push(self.tempData[i]);
        }
    }
};

EmailTextVis.prototype.onSelectionChange = function (topicSelected) {
    var self = this;
    self.topicSelected = topicSelected;
    document.getElementById('email_table').remove();
    document.getElementById('header_mail').remove();
    self.initVis();
};