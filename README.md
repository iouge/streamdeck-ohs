
# Stream Deck: Open Hardware Monitor Sensor

A simple plugin to make available the data from [Open Hardware Monitor](https://openhardwaremonitor.org/)
 as a Javascript plugin for [Stream Deck](https://developer.elgato.com/documentation/stream-deck/).

Requires Stream Deck 4.1 or later.

# Description

`Open Hardware Monitor Sensor` is a complete plugin that
- fetch data from the running Open Hardware Monitor process
- permits multiple instances of the plugin to enable displaying multiple data points.
  
# Pictures
![StreamDeck](https://github.com/atcurtis/streamdeck-ohs/blob/master/Screenshot%202023-03-05%20230412.png?raw=true)
![App view](https://github.com/atcurtis/streamdeck-ohs/blob/master/Screenshot%202023-03-05%20230549.png?raw=true)

## Features:

Features:

- code written in Javascript
- free

----

### Pre-requisites

- Open Hardware Monitor/Libre Hardware Monitor is required to be running in the background with its HTTP port open.
- Configure your Hardware Monitor to use port 8085 ( see [openhardware.js line 19](https://github.com/atcurtis/streamdeck-ohs/blob/master/Sources/org.xiphis.ohs.sdPlugin/propertyinspector/js/openhardware.js#L19) )

### Where to find Open Hardware Monitor/Libre Hardware Monitor
- Official but outdated, Open Hardware Monitor source: [https://github.com/openhardwaremonitor/openhardwaremonitor](https://openhardwaremonitor.org/downloads/)
- Active Open Hardware Monitor fork: [https://github.com/hexagon-oss/openhardwaremonitor/releases](https://github.com/hexagon-oss/openhardwaremonitor/releases)
- Libre Hardware Monitor, another fork of Open Hardware Monitor: [https://github.com/LibreHardwareMonitor/LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor)

Note: There may be issues with using the official Open Hardware Monitor on modern computers since it has not been maintained since 2020. Please use one of the forks.

## To-Do:

- Improve properties UI
