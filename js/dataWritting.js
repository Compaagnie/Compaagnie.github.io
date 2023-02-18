var createJSON = function(){
    d3.csv("../data/T_WISE6_AggregatedData_FR.csv", d3.autotype).then(function(data){
        
        usableDataForBars = d3.merge(
            d3.map(d3.group(data.map(function(d){ 
                if (d.resultUom == "ug/L") {
                d.resultMeanValue = d.resultMeanValue/1000;
                d.resultUom = "mg/L";
                }
                return d;
            }), d => d.monitoringSiteIdentifier, d => d.observedPropertyDeterminandLabel), d=> {
                return d3.map(d[1], v => {
                return v[1].filter(function(d) {return d.phenomenonTimeReferenceYear == d3.max(v[1], x=> +x.phenomenonTimeReferenceYear)})[0];
                })
            })
        );
        byWaterBodyIdentifier = d3.map(d3.group(usableDataForBars, function(d){return(d.monitoringSiteIdentifier)}), d => d[0]);
        console.log(byWaterBodyIdentifier);
        
        downloadCSV({data:usableDataForBars})
        downloadFile(JSON.stringify(byWaterBodyIdentifier,null,' '))
        
        console.log(usableDataForBars);
    });
}

function convertArrayOfObjectsToCSV(args) {  
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}
function downloadCSV(args) {  
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: args.data
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match("/^data:text\/csv/i")) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}

function downloadURL(url, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  }
  
  function downloadFile(data) {
    var blob = new Blob([data], {type: 'text/json'});
    var url  = window.URL.createObjectURL(blob);
    downloadURL(url, "test.json");
  }
