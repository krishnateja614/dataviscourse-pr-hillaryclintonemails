

(function () {

    // global variables:
    // emailsData contains email's text and topic probabilities
    // topicData contains the words making up each topic
    var emailData = [];
    var topicData = [];
    var masterData = [];
    var personIds = [];
    var topicData1 =[];
    var topicData2 =[];
    var topicData3 =[];
    var topicData4 =[];
    var topicData5 =[];
    var topicData6 =[];
    var topicData7 =[];
    var topicData8 =[];
    var topicData9 =[];
    var topicData10 =[];
    var topicWordData = [];

    function dataLoaded(error,master_data,email_data,topic_word_data,person_ids,topicData_1,topicData_2,topicData_3,topicData_4,topicData_5,topicData_6,topicData_7,topicData_8,topicData_9,topicData_10){
        if (error !== null) {
            alert("Couldn't load the dataset!");
        } else {
            masterData = master_data;
            emailData = email_data;
            personIds = person_ids;
            topicWordData = topic_word_data;
            topicData1 = topicData_1;
            topicData2 = topicData_2;
            topicData3 = topicData_3;
            topicData4 = topicData_4;
            topicData5 = topicData_5;
            topicData6 = topicData_6;
            topicData7 = topicData_7;
            topicData8 = topicData_8;
            topicData9 = topicData_9;
            topicData10 = topicData_10;

            init();
        }
    }

    function init() {

        var colorChoice = 'orange';
        var eventHandler = d3.dispatch("selectionChanged");

        var bubbleChartVis = new BubbleChartVis(topicWordData,eventHandler);
        var streamGraphVis = new StreamGraphVis(topicData1,'orange');
        var emailTextVis = new EmailTextVis(masterData,personIds);
        var wordCloudVis = new WordCloudVis(d3.select("#wordCloudVis"), masterData, topicData, personIds);

        selectionChanged = function(topicSelection) {
            if(topicSelection == 'topic_1'){
                streamGraphVis.onSelectionChange(topicData1);
            }
            else if(topicSelection == 'topic_2'){
                streamGraphVis.onSelectionChange(topicData2);
            }
            else if(topicSelection == 'topic_3'){
                streamGraphVis.onSelectionChange(topicData3);
            }
            else if(topicSelection == 'topic_4'){
                streamGraphVis.onSelectionChange(topicData4);
            }
            else if(topicSelection == 'topic_5'){
                streamGraphVis.onSelectionChange(topicData5);
            }
            else if(topicSelection == 'topic_6'){
                streamGraphVis.onSelectionChange(topicData6);
            }
            else if(topicSelection == 'topic_7'){
                streamGraphVis.onSelectionChange(topicData7);
            }
            else if(topicSelection == 'topic_8'){
                streamGraphVis.onSelectionChange(topicData8);
            }
            else if(topicSelection == 'topic_9'){
                streamGraphVis.onSelectionChange(topicData9);
            }
            else if(topicSelection == 'topic_10'){
                streamGraphVis.onSelectionChange(topicData10);
            }
            wordCloudVis.onSelectionChange(topicSelection);
            emailTextVis.onSelectionChange(topicSelection);
        }
    }

    function startHere(){

        queue()
            .defer(d3.csv, 'data/master_file.csv')
            .defer(d3.csv, 'data/emails_topicprobs.csv')
            .defer(d3.csv, 'data/nov_25terms.csv')
            .defer(d3.csv,'data/Persons.csv')
            .defer(d3.csv,'data/topic 1.csv')
            .defer(d3.csv,'data/topic_2.csv')
            .defer(d3.csv,'data/topic_3.csv')
            .defer(d3.csv,'data/topic_4.csv')
            .defer(d3.csv,'data/topic_5.csv')
            .defer(d3.csv,'data/topic_6.csv')
            .defer(d3.csv,'data/topic_7.csv')
            .defer(d3.csv,'data/topic_8.csv')
            .defer(d3.csv,'data/topic_9.csv')
            .defer(d3.csv,'data/topic_10.csv')
            .await(dataLoaded);
    }

    startHere();
})();


