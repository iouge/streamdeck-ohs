/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help you quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

/**
 * The 'connected' event is sent to your plugin, after the plugin's instance
 * is registered with Stream Deck software. It carries the current websocket
 * and other information about the current environmet in a JSON object
 * You can use it to subscribe to events you want to use in your plugin.
 */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
    //var data = Utils.getData("http://localhost:8085/data.json");
    //console.log("data: " + data);

    // Subscribe to the willAppear and other events
    $SD.on('org.xiphis.ohs.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('org.xiphis.ohs.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('org.xiphis.ohs.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
    $SD.on('org.xiphis.ohs.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('org.xiphis.ohs.action.propertyInspectorDidAppear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
    });
    $SD.on('org.xiphis.ohs.action.propertyInspectorDidDisappear', (jsonObj) => {
        console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
    });
};

// ACTIONS

const action = {
    type: 'org.xiphis.ohs.action',
    cache: {},
    timer: 0,
    data: {},

    onDidReceiveSettings: function(jsn) {
        const settings = jsn.payload.settings;
        const sensor = this.cache[jsn.context];

        if (!settings || !sensor) return;

        if (settings.hasOwnProperty('sensor_name')) {
            const sensorName = settings.sensor_name;
            if (sensor) {
                sensor.setSensorName(sensorName);
                this.cache[jsn.context] = sensor;
            }
        }

        if (settings.hasOwnProperty('sensor_type')) {
            if (sensor) {
                sensor.setSensorType(settings.sensor_type);
            }
        }

        if (settings.hasOwnProperty('sensor_foreground')) {
            if (sensor) {
                sensor.setSensorForeground(settings.sensor_foreground);
            }
        }

        if (settings.hasOwnProperty('sensor_background')) {
            if (sensor) {
                sensor.setSensorBackground(settings.sensor_background);
            }
        }

        /**
         * In this example we put a HTML-input element with id='mynameinput'
         * into the Property Inspector's DOM. If you enter some data into that
         * input-field it get's saved to Stream Deck persistently and the plugin
         * will receive the updated 'didReceiveSettings' event.
         * Here we look for this setting and use it to change the title of
         * the key.
         */

         this.setTitle(jsn);
    },

    /** 
     * The 'willAppear' event is the first event a key will receive, right before it gets
     * shown on your Stream Deck and/or in Stream Deck software.
     * This event is a good place to setup your plugin and look at current settings (if any),
     * which are embedded in the events payload.
     */

    onWillAppear: function (jsn) {
        if (!jsn.payload || !jsn.payload.hasOwnProperty('settings')) return;

        this.cache[jsn.context] = new OpenHardwareSensor(jsn);

        if (this.timer === 0) {
            const self = this;
            this.timer = setInterval(function(sx) {
                self.onMyTimer();
            }, 1000);
        }

        this.onDidReceiveSettings(jsn);
    },

    onMyTimer: function () {
        const self = this;
        var map = {};
        if (this.cache) {
            for (const [key, value] of Object.entries(this.cache)) {
                const sensor_name = value.getSensorName();
                var listeners = map[sensor_name];
                if (!listeners) {
                    listeners = [value];
                    map[sensor_name] = listeners;
                } else {
                    listeners.push(value);
                }
            }
        }
        OpenHardware.fetchData().then((sensors) => {
            for (const sensor of sensors) {
                const listeners = map[sensor.FullName];
                if (listeners) {
                    for (const listener of listeners) {
                        listener.updateValue(sensor);
                    }
                }
            }
        });
    },

    onWillDisappear: function (jsn) {
        let sensor = this.cache[jsn.context];
        if (sensor) {
            sensor.destroySensor();
            delete this.cache[jsn.context];

            if (Object.keys(this.cache).length === 0 && this.timer !== 0) {
                window.clearInterval(this.timer);
                this.timer = 0;
            }
        }
    },

    onKeyUp: function (jsn) {
        const sensor = this.cache[jsn.context];
        if (!sensor) {
            this.onWillAppear(jsn);
        } else {
            sensor.toggleSensor();
        }
    },

    onSendToPlugin: function (jsn) {
        /**
         * This is a message sent directly from the Property Inspector 
         * (e.g. some value, which is not saved to settings) 
         * You can send this event from Property Inspector (see there for an example)
         */ 

        const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
        if (sdpi_collection.value && sdpi_collection.value !== undefined) {
            this.doSomeThing({ [sdpi_collection.key] : sdpi_collection.value }, 'onSendToPlugin', 'fuchsia');            
        }
    },

    /**
     * This snippet shows how you could save settings persistantly to Stream Deck software.
     * It is not used in this example plugin.
     */

    saveSettings: function (jsn, sdpi_collection) {
        console.log('saveSettings:', jsn);
        if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
            if (sdpi_collection.value && sdpi_collection.value !== undefined) {
                this.settings[sdpi_collection.key] = sdpi_collection.value;
                console.log('setSettings....', this.settings);
                $SD.api.setSettings(jsn.context, this.settings);
            }
        }
    },

    /**
     * Here's a quick demo-wrapper to show how you could change a key's title based on what you
     * stored in settings.
     * If you enter something into Property Inspector's name field (in this demo),
     * it will get the title of your key.
     * 
     * @param {JSON} jsn // The JSON object passed from Stream Deck to the plugin, which contains the plugin's context
     * 
     */

    setTitle: function(jsn) {
        if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
            console.log("watch the key on your StreamDeck - it got a new title...", this.settings.mynameinput);
            $SD.api.setTitle(jsn.context, this.settings.mynameinput);
        }
    },

    /**
     * Finally here's a method which gets called from various events above.
     * This is just an idea on how you can act on receiving some interesting message
     * from Stream Deck.
     */

    doSomeThing: function(inJsonData, caller, tagColor) {
        console.log('%c%s', `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`, `[app.js]doSomeThing from: ${caller}`);
        // console.log(inJsonData);
    }, 
};

function OpenHardwareSensor(jsonObj) {
    var jsb = jsonObj,
        context = jsonObj.context,
        canvas = null,
        name = "",
        value = "",
        type = "text",
        background = '#181818',
        foreground = '#ff8800',
        knob;

    function createSensor(settings) {
        canvas = document.createElement('canvas');
        canvas.width = 144;
        canvas.height = 144;
    }

    function toggleSensor() {
    
    }

    function drawSensor() {
        type === "text" && value.Value && updateText();
        type === "knob" && value.Value && updateKnob();
        $SD.setImage(context, canvas.toDataURL());
    }

    function updateText() {
        const height = 144;
        const width = 144;
        const smaller = width < height ? width : height;
        const centerX = 0.5 * width;
        const centerY = 0.5 * height;
        const fontSize = 0.3 * smaller;
        const fontSizeString = fontSize.toString();
        const ctx = canvas.getContext('2d');
        const valueStr = value.Value;
        ctx.clearRect(0, 0, width, height);
        ctx.font = fontSizeString + 'px sans-serif';
        ctx.fillStyle = foreground;
        ctx.strokeStyle = background;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3;
        ctx.strokeText(valueStr, centerX, centerY);
        ctx.lineWidth = 1;
        ctx.fillText(valueStr, centerX, centerY);
    }

    function updateKnob() {
        if (!knob) {
            knob = pureknob.createKnob(144, 144);
            knob._canvas = canvas;
            knob.resize = function() {};
            knob.setProperty("angleStart", -0.75 * Math.PI);
            knob.setProperty("angleEnd", 0.75 * Math.PI);
            knob.setProperty("colorBG", background);
            knob.setProperty("colorFG", foreground);
            knob.setProperty("trackWidth", 0.4);
            knob.setProperty("fnValueToString", function(ignore) {
                return value.Value;
            })
        }
        knob.setProperty("valMin", parseFloat(value.Min));
        knob.setProperty("valMax", parseFloat(value.Max));
        knob.setProperty("val", parseFloat(value.Value));
        knob.commit();
    }

    function getSensorName() {
        return name;
    }

    function setSensorName(sensor_name) {
        name = sensor_name;
        drawSensor();
    }

    function setSensorType(sensorType) {
        type = sensorType;
        drawSensor();
    }

    function getSensorType() {
        return type;
    }

    function setSensorForeground(fg) {
        foreground = fg;
        if (knob) {
            knob.setProperty("colorFG", foreground);
        }
        drawSensor();
    }

    function setSensorBackground(bg) {
        background = bg;
        if (knob) {
            knob.setProperty("colorBG", background);
        }
        drawSensor();
    }

    function updateValue(sensorValue) {
        value = sensorValue;
        drawSensor();
    }

    function destroySensor() {
    }

    createSensor();
    return {
        destroySensor: destroySensor,
        updateValue: updateValue,
        setSensorName: setSensorName,
        getSensorName: getSensorName,
        setSensorType: setSensorType,
        getSensorType: getSensorType,
        setSensorBackground: setSensorBackground,
        setSensorForeground: setSensorForeground
    }
}

