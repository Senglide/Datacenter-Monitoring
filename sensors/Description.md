We want to monitor the racks in the datacenter. Therefore we will need sensors. On each rack a temperature- and humidity sensor will be placed.
we connect this sensor to an Arduino. There will be 3 racks to monitor so we use 4 Arduino's and configure them as an I²C-bus. 3 of them will
be slave devices with a sensor attached to them, 1 of them will be the master device. The data collected by the master will be send via a Serial 
connection to the Raspberry Pi. The Pi will aslo collect data from the PDU's that power the racks we are monitoring using SNMP. Finally a smoke-
and motion sensor will be placed for security reasons. When an alarm is triggered by one of these sensors the Pi will capture this alarm.
After the Pi has collected all the data he will funtion as a MQTT client/server: publishing the data to itself and making it available for other
devices on the network to collect this data. We will secure this connection with TLS.