import serial
import time
import paho.mqtt.client as paho
import RPi.GPIO as GPIO
import datetime
from easysnmp import Session

# Create an SNMP session to be used for all our requests
session1 = Session(hostname='10.140.10.9', community='RaspberryPi', version=1)
#test momenteel zelfde host
session2 = Session(hostname='10.140.10.9', community='RaspberryPi', version=1)
session3 = Session(hostname='10.140.10.9', community='RaspberryPi', version=1)

# session2 = Session(hostname='10.140.10.10', community='RaspberryPi', version=1)
# session3 = Session(hostname='10.140.10.11', community='RaspberryPi', version=1)

GPIO.setmode(GPIO.BOARD)
GPIO.setup(10, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(8, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
 
MQTT_SERVER = "10.140.10.21"
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
client1.tls_set('/etc/mosquitto/ca_certificates/ca4.crt')
client1.on_connect = on_connect
client1.on_disconnect = on_disconnect
client1.connect(MQTT_SERVER, PORT)
while not conn_flag:
	time.sleep(1)
	print("waiting", conn_flag)
	client1.loop()


while True: 
	i = 0
	currentDateTime = datetime.datetime.now()
	date = currentDateTime.date()
	timenow = currentDateTime.time()
	
	print("Publishing...")
	time.sleep(2)
	if GPIO.input(10) == GPIO.HIGH:
		print("motion alarm")
		motionAlarm = 1		
	if GPIO.input(8) == GPIO.HIGH:
		print("smoke alarm")
		smokeAlarm = 1
	
	#start by reading out the PDU's
	#use the numeric OID to get the correct values
	PDU1PowerSupply = session1.get('.1.3.6.1.4.1.318.1.1.12.1.16.0')
	PDU1Loadstatus1 = session1.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.1')
	PDU1Loadstatus2 = session1.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.2')
	PDU1LoadstatusT = session1.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.3')
	PDU1namepdu = session1.get('1.3.6.1.4.1.318.1.1.12.1.1.0')

	PDU2PowerSupply = session2.get('.1.3.6.1.4.1.318.1.1.12.1.16.0')
	PDU2Loadstatus1 = session2.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.1')
	PDU2Loadstatus2 = session2.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.2')
	PDU2LoadstatusT = session2.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.3')
	PDU2namepdu = session2.get('1.3.6.1.4.1.318.1.1.12.1.1.0')
	
	PDU3PowerSupply = session3.get('.1.3.6.1.4.1.318.1.1.12.1.16.0')
	PDU3Loadstatus1 = session3.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.1')
	PDU3Loadstatus2 = session3.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.2')
	PDU3LoadstatusT = session3.get('.1.3.6.1.4.1.318.1.1.12.2.3.1.1.2.3')
	PDU3namepdu = session3.get('1.3.6.1.4.1.318.1.1.12.1.1.0')
	
	values1 = [PDU1PowerSupply, PDU1Loadstatus1, PDU1Loadstatus2, PDU1LoadstatusT, PDU1namepdu]
	values2 = [PDU2PowerSupply, PDU2Loadstatus1, PDU2Loadstatus2, PDU2LoadstatusT, PDU2namepdu]
	values3 = [PDU3PowerSupply, PDU3Loadstatus1, PDU3Loadstatus2, PDU3LoadstatusT, PDU3namepdu]
	
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
	
		Pdu1position1 = listStrings1[i].find("'")
		Pdu1position2 = listStrings1[i].find("'", Pdu1position1 + 1)	
		Pdu2position1 = listStrings2[i].find("'")
		Pdu2position2 = listStrings2[i].find("'", Pdu2position1 + 1)		
		Pdu3position1 = listStrings3[i].find("'")
		Pdu3position2 = listStrings3[i].find("'", Pdu3position1 + 1)
	
		toSlice1 = slice(Pdu1position1+1, Pdu1position2)
		listToSend1.append(listStrings1[i][toSlice1])	
		toSlice2 = slice(Pdu2position1+1, Pdu2position2)
		listToSend2.append(listStrings2[i][toSlice2])
		toSlice3 = slice(Pdu3position1+1, Pdu3position2)
		listToSend3.append(listStrings3[i][toSlice3])

		i+=1
	
	Pdu1Power = listToSend1[0]
	Pdu1Status1 = listToSend1[1]
	Pdu1Status2 = listToSend1[2]
	Pdu1StatusT = listToSend1[3]
	Pdu1Name = listToSend1[4]

	Pdu2Power = listToSend2[0]
	Pdu2Status1 = listToSend2[1]
	Pdu2Status2 = listToSend2[2]
	Pdu2StatusT = listToSend2[3]
	Pdu2Name = listToSend2[4]
	
	Pdu3Power = listToSend3[0]
	Pdu3Status1 = listToSend3[1]
	Pdu3Status2 = listToSend3[2]
	Pdu3StatusT = listToSend3[3]
	Pdu3Name = listToSend3[4]
	
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
	sensor3_tem = pieces[5]
	
	Json = { "readings" : [ 
	{"rack": "1", "sensor_type": "temp", "sensor":"1", "sensor_value":sensor1_tem, "date":date, "time":timenow},
	{"rack": "1","sensor_type": "hum", "sensor":"1", "sensor_value":sensor1_hum, "date":date, "time":timenow},
	{"rack": "1", "sensor_type": "pdupower", "sensor":Pdu1Name, "sensor_value": Pdu1Power, "date":date, "time":timenow},
	{"rack": "1", "sensor_type": "pduStatus1", "sensor":Pdu1Name, "sensor_value": Pdu1Status1, "date":date, "time":timenow},
	{"rack": "1", "sensor_type": "pduStatus2", "sensor":Pdu1Name, "sensor_value": Pdu1Status2, "date":date, "time":timenow},
	{"rack": "1", "sensor_type": "pduStatusT", "sensor":Pdu1Name, "sensor_value": Pdu1StatusT, "date":date, "time":timenow},
	
	{"rack": "2","sensor_type": "temp", "sensor":"2", "sensor_value":sensor2_tem, "date":date, "time":timenow},
	{"rack": "2","sensor_type": "hum", "sensor":"2", "sensor_value":sensor2_hum, "date":date, "time":timenow},
	{"rack": "2", "sensor_type": "pdupower", "sensor":Pdu2Name, "sensor_value": Pdu2Power, "date":date, "time":timenow},
	{"rack": "2", "sensor_type": "pduStatus1", "sensor":Pdu2Name, "sensor_value": Pdu2Status1, "date":date, "time":timenow},
	{"rack": "2", "sensor_type": "pduStatus2", "sensor":Pdu2Name, "sensor_value": Pdu2Status2, "date":date, "time":timenow},
	{"rack": "2", "sensor_type": "pduStatusT", "sensor":Pdu2Name, "sensor_value": Pdu2StatusT, "date":date, "time":timenow},
	
	{"rack": "3","sensor_type": "temp", "sensor":"3", "sensor_value":sensor3_tem, "date":date, "time":timenow},
	{"rack": "3","sensor_type": "hum", "sensor":"3", "sensor_value":sensor3_hum, "date":date, "time":timenow},
	{"rack": "3", "sensor_type": "pdupower", "sensor":Pdu3Name, "sensor_value": Pdu3Power, "date":date, "time":timenow},
	{"rack": "3", "sensor_type": "pduStatus1", "sensor":Pdu3Name, "sensor_value": Pdu3Status1, "date":date, "time":timenow},
	{"rack": "3", "sensor_type": "pduStatus2", "sensor":Pdu3Name, "sensor_value": Pdu3Status2, "date":date, "time":timenow},
	{"rack": "3", "sensor_type": "pduStatusT", "sensor":Pdu3Name, "sensor_value": Pdu3StatusT, "date":date, "time":timenow},
	
	{"rack": "0", "sensor_type": "movement", "sensor": "1", "sensor_value": motionAlarm, "date":date, "time":timenow},
	{"rack": "0", "sensor_type": "smoke", "sensor": "1", "sensor_value": smokeAlarm, "date":date, "time":timenow}
	]}
	
	toSend = str(Json)
	client1.publish(MQTT_PATH, toSend)
	time.sleep(1)
	client1.loop()
	
	print(toSend)
	print(timenow)
	print(date)
	
	motionAlarm = 0
	smokeAlarm = 0
	