#include <Wire.h>
#include <DHT.h>

// Defines:-
#define SLAVE_ADDRESS 1
#define DHTPIN 2     // what pin we're connected to
#define DHTTYPE DHT22   // DHT22

DHT dht(DHTPIN, DHTTYPE); // Initialize DHT sensor for normal 16mhz Arduino

int hum;
int temp;

void setup()
{
    dht.begin(); 
    Wire.begin(SLAVE_ADDRESS);                      // Join I2C bus with address.
    Wire.onRequest(I2CrequestHandler);                // Register request handler.
    Serial.begin(9600);
}

void loop()
{
  delay(500);

}

// Function that executes whenever data is requested by master
// This function is registered as an event, see setup()
void I2CrequestHandler()
{
  hum = dht.readHumidity();
  temp= dht.readTemperature();
  
  Wire.write(hum); // lower byte
  Wire.write(hum>>8); // upper byte

  Wire.write(temp); // lower byte
  Wire.write(temp>>8); // upper byte
}
