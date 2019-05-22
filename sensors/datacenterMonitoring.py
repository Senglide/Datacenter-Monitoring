import serial
import time
import paho.mqtt.client as paho
import RPi.GPIO as GPIO
import datetime
from easysnmp import Session

# Create an SNMP session to be used for all our requests
session1 = Session(hostname='10.140.4.151', community='raspberryPi', version=1)
session2 = Session(hostname='10.140.4.152', community='raspberryPi', version=1)
session3 = Session(hostname='10.140.4.153', community='raspberryPi', version=1)


GPIO.setmode(GPIO.BOARD)
GPIO.setup(10, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(12, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
 
MQTT_SERVER = "10.140.4.160"
MQTT_PATH = "datacenter"
PORT = 8883
conn_flag = False

motionAlarm = 0
smokeAlarm = 0

arduino = serial.Serial('/dev/ttyACM0', 9600)

def on_connect(client, userdata, flags, rc):
	global conn_flag
	conn_flag= True
	print("connected", conn_flag)
def on_log(client, userdata, level,buf):
	print("buffer", buf)
	
def on_disconnect(client, userdata, rc):
	print("client disconnected")
	
client1 = paho.Client("publisher")
client1.on_log= on_log
client1.tls_set('/etc/mosquitto/ca_certificates/ca-JU.crt', '/etc/mosquitto/certs/client-JU.crt', '/etc/mosquitto/certs/client-JU.key')
client1.on_connect = on_connect
client1.on_disconnect = on_disconnect
client1.connect(MQTT_SERVER, PORT)
while not conn_flag:
	time.sleep(1)
	print("waiting", conn_flag)
	client1.loop()


while True: 
	i = 0
	
	
	print("Publishing...")
	time.sleep(2)
	if GPIO.input(10) == GPIO.HIGH:
		motionAlarm = 1		
	if GPIO.input(12) == GPIO.HIGH:
		smokeAlarm = 1
	
	#read out the arduino values
	data = arduino.readline()
	time.sleep(1)
	data = arduino.readline()
	
	pieces = data.split(',')
	
	sensor1_hum = pieces[0]
	sensor1_tem = pieces[1]
	sensor2_hum = pieces[2]
	sensor2_tem = pieces[3]
	sensor3_hum = pieces[4]
	sensor3_temFull = pieces[5]
	sensor3_tem = sensor3_temFull[:2]
	
	#start by reading out the pdu's
	#use the numeric OID to get the correct values
	pdu1PowerSupply = session1.get('.1.3.6.1.4.1.318.1.1.12.1.16.0')
	pdu1Loadstatus1 = session1.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.1')
	pdu1Loadstatus2 = session1.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.2')
	pdu1LoadstatusT = session1.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.3')
	pdu1namepdu = session1.get('1.3.6.1.4.1.318.1.1.12.1.1.0')

	pdu2PowerSupply = session2.get('.1.3.6.1.4.1.318.1.1.12.1.16.0')
	pdu2Loadstatus1 = session2.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.1')
	pdu2Loadstatus2 = session2.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.2')
	pdu2LoadstatusT = session2.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.3')
	pdu2namepdu = session2.get('1.3.6.1.4.1.318.1.1.12.1.1.0')
	
	pdu3PowerSupply = session3.get('.1.3.6.1.4.1.318.1.1.12.1.16.0')
	pdu3Loadstatus1 = session3.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.1')
	pdu3Loadstatus2 = session3.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.2')
	pdu3LoadstatusT = session3.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.3')
	pdu3namepdu = session3.get('1.3.6.1.4.1.318.1.1.12.1.1.0')
	
	values1 = [pdu1PowerSupply, pdu1Loadstatus1, pdu1Loadstatus2, pdu1LoadstatusT, pdu1namepdu]
	values2 = [pdu2PowerSupply, pdu2Loadstatus1, pdu2Loadstatus2, pdu2LoadstatusT, pdu2namepdu]
	values3 = [pdu3PowerSupply, pdu3Loadstatus1, pdu3Loadstatus2, pdu3LoadstatusT, pdu3namepdu]
	
	listStrings1 = []
	listStrings2 = []
	listStrings3 = []
	listToSend1 = []
	listToSend2 = []
	listToSend3 = []
	
	while i < len(values1):
		listStrings1.append(str(values1[i]))
		listStrings2.append(str(values2[i]))
		listStrings3.append(str(values3[i]))
	
		pdu1position1 = listStrings1[i].find("'")
		pdu1position2 = listStrings1[i].find("'", pdu1position1 + 1)	
		pdu2position1 = listStrings2[i].find("'")
		pdu2position2 = listStrings2[i].find("'", pdu2position1 + 1)		
		pdu3position1 = listStrings3[i].find("'")
		pdu3position2 = listStrings3[i].find("'", pdu3position1 + 1)
	
		toSlice1 = slice(pdu1position1+1, pdu1position2)
		listToSend1.append(listStrings1[i][toSlice1])	
		toSlice2 = slice(pdu2position1+1, pdu2position2)
		listToSend2.append(listStrings2[i][toSlice2])
		toSlice3 = slice(pdu3position1+1, pdu3position2)
		listToSend3.append(listStrings3[i][toSlice3])

		i+=1
	
	pdu1Power = listToSend1[0]
	pdu1Status1 = listToSend1[1]
	pdu1Status2 = listToSend1[2]
	pdu1StatusT = listToSend1[3]
	pdu1Name = listToSend1[4]

	pdu2Power = listToSend2[0]
	pdu2Status1 = listToSend2[1]
	pdu2Status2 = listToSend2[2]
	pdu2StatusT = listToSend2[3]
	pdu2Name = listToSend2[4]
	
	pdu3Power = listToSend3[0]
	pdu3Status1 = listToSend3[1]
	pdu3Status2 = listToSend3[2]
	pdu3StatusT = listToSend3[3]
	pdu3Name = listToSend3[4]
	
	
	Json = { "readings" : [ 
	{"rack": "1", "sensor_type": "temp", "sensor":"1", "sensor_value":sensor1_tem},
	{"rack": "1","sensor_type": "hum", "sensor":"1", "sensor_value":sensor1_hum},
	{"rack": "1", "sensor_type": "pduPower", "sensor":pdu1Name, "sensor_value": pdu1Power},
	{"rack": "1", "sensor_type": "pduStatus1", "sensor":pdu1Name, "sensor_value": pdu1Status1},
	{"rack": "1", "sensor_type": "pduStatus2", "sensor":pdu1Name, "sensor_value": pdu1Status2},
	{"rack": "1", "sensor_type": "pduStatusT", "sensor":pdu1Name, "sensor_value": pdu1StatusT},
	
	{"rack": "4","sensor_type": "temp", "sensor":"1", "sensor_value":sensor2_tem},
	{"rack": "4","sensor_type": "hum", "sensor":"1", "sensor_value":sensor2_hum},
	{"rack": "4", "sensor_type": "pduPower", "sensor":pdu2Name, "sensor_value": pdu2Power},
	{"rack": "4", "sensor_type": "pduStatus1", "sensor":pdu2Name, "sensor_value": pdu2Status1},
	{"rack": "4", "sensor_type": "pduStatus2", "sensor":pdu2Name, "sensor_value": pdu2Status2},
	{"rack": "4", "sensor_type": "pduStatusT", "sensor":pdu2Name, "sensor_value": pdu2StatusT},
	
	{"rack": "6","sensor_type": "temp", "sensor":"1", "sensor_value":sensor3_tem},
	{"rack": "6","sensor_type": "hum", "sensor":"1", "sensor_value":sensor3_hum},
	{"rack": "6", "sensor_type": "pduPower", "sensor":pdu3Name, "sensor_value": pdu3Power},
	{"rack": "6", "sensor_type": "pduStatus1", "sensor":pdu3Name, "sensor_value": pdu3Status1},
	{"rack": "6", "sensor_type": "pduStatus2", "sensor":pdu3Name, "sensor_value": pdu3Status2},
	{"rack": "6", "sensor_type": "pduStatusT", "sensor":pdu3Name, "sensor_value": pdu3StatusT},
	
	{"rack": "0", "sensor_type": "movement", "sensor": "1", "sensor_value": motionAlarm},
	{"rack": "0", "sensor_type": "smoke", "sensor": "1", "sensor_value": smokeAlarm}
	]}
	
	toSend = str(Json)
	client1.publish(MQTT_PATH, toSend)
	print(data)
	time.sleep(1)
	#client1.loop()
	
	motionAlarm = 0
	smokeAlarm = 0
	