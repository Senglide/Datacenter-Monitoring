var incoming = JSON.parse(sessionStorage.getItem('readingDetails'));
var incomingDate = new Date(incoming.datetime);
var today = incomingDate.getDate() + '-' + (incomingDate.getMonth() + 1) + '-' + incomingDate.getFullYear();
var connectionSettings = {'resetString': 'get_readings_by_date/' + incoming.rack + '/' + incoming.s_type + '/' + today, 'refreshString': ''};
var graph = new Graph('relatedReadings', incoming.rack, incoming.s_type, connectionSettings, incoming.id);
graph.getData(undefined, true, true);

// function generateTable() {
//     var htmlString = '';
//     for(var i = 0; i < 11; i++) {
//         htmlString += '<tr>';
//         for(var j = 0; j < ((s_types.size / 2) + 1); j++) {
//             if(i == 0 && j == 0) {
//                 htmlString += '<td></td>';
//             } else {
//                 var key = Object.keys(s_types)[j];
//                 if(key.includes(' ')) {
//                     htmlString += '<td>' + key + '</td>';
//                 }
                
//             }
//         }
//         htmlString += '</tr>';
//     }
//     console.log(htmlString);
//     $('#detailBody').html(htmlString);
// }

// generateTable();