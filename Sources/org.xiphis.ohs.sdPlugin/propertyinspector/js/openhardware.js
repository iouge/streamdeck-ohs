/* Open Hardware Monitor helpers */

var OpenHardware = {
   getData: function (url) {
        // Return a new promise.
        return new Promise(function (resolve, reject) {
            // Do the usual XHR stuff
            var req = new XMLHttpRequest();
            // Make sure to call .open asynchronously
            req.open('GET', url, true);
    
            req.onload = function () {
                // This is called even on 404 etc
                // so check the status
                if (req.status === 200) {
                    // Resolve the promise with the response text
                    resolve(req.response);
                } else {
                    // Otherwise reject with the status text
                    // which will hopefully be a meaningful error
                    reject(Error(req.statusText));
                }
            };
    
            // Handle network errors
            req.onerror = function () {
                reject(Error('Network Error'));
            };
    
            // Make the request
            req.send();
        });
    },
    
    fetchData: function() {
        var sensors = [];
        function enumerateData(prefix, data) {
            data.FullName = prefix + data.Text;
            sensors.push(data);
            if (data.Children) {
                if (data.id > 1) {
                    prefix = data.FullName + "/";
                }
                for (const child of data.Children) {
                    enumerateData(prefix, child);
                }
            }
            return sensors;
        }
        return this.getData("http://localhost:8085/data.json")
            .then((data) => JSON.parse(data))
            .then((data) => enumerateData("", data));
    }
};