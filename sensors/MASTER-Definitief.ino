#include <Wire.h>

// Constants:-
const byte ledPin = 13;

#define SLAVE_ADDRESS 1
#define SLAVE_ADDRESS_2 2
#define SLAVE_ADDRESS_3 3

int SLAVES[] = {SLAVE_ADDRESS,SLAVE_ADDRESS_2,SLAVE_ADDRESS_3};
int numberSlaves = sizeof(SLAVES)/sizeof(int);


volatile int hum_a; volatile int hum_b; volatile int hum;
volatile int tem_a; volatile int tem_b; volatile int tem;
String toprint="";
void setup()
{
  pinMode(ledPin, OUTPUT);
  Wire.begin();        // join i2c bus (address optional for master)
  Serial.begin(9600);  // start serial for output
}

void loop()
{
for(int i = 0; i< numberSlaves; i++){
  static unsigned long prevMillis = 0;
  static bool ledPinState = 0;

  unsigned long currentMillis = millis();         // Get the current time.
  
  if (currentMillis - prevMillis >= 1000)         // I2C updates once per second
  {
    prevMillis = currentMillis;                 // Record the current time.
    ledPinState ^= 1;                           // Toggle the LED
    digitalWrite(ledPin, ledPinState);          //   "     "   "
    Wire.requestFrom(SLAVES[i], 4, true);         // Request 4 bytes from the slave device.
  }
    Wire.requestFrom(SLAVES[i], 4, true);
    if (Wire.available())
    {
      hum = Wire.read(); hum_b = Wire.read();

      tem = Wire.read(); tem_b = Wire.read();

      toprint += hum;
      toprint += ',';
      toprint += tem;  
      if(i != (numberSlaves-1)){
        toprint += ',';
      }     
    }
    else{
      hum = 0;
      tem = 0;
      toprint += hum;
      toprint += ',';
      toprint += tem;  
      if(i != (numberSlaves-1)){
        toprint += ',';
      }
      continue;
    }
  delay(1000);
}
Serial.println(toprint); 
toprint="";
}
