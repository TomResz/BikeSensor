#include <Arduino.h>
#include "secrets.h"
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEClient.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <BLE2902.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

static BLEUUID serviceUUIDPower((uint16_t)0x1818);   
static BLEUUID serviceUUIDHeartRate((uint16_t)0x180D);

static BLEUUID charUUIDPower((uint16_t)0x2A63);
static BLEUUID charUUIDHeartRate((uint16_t)0x2A37);

static boolean doConnectPower = false;
static boolean doConnectHeartRate = false;
static boolean connectedPower = false;
static boolean connectedHeartRate = false;

static BLEAdvertisedDevice *powerMeterDevice = nullptr;
static BLEAdvertisedDevice *heartRateDevice = nullptr;

static BLERemoteCharacteristic *pRemoteCharacteristicPower = nullptr;
static BLERemoteCharacteristic *pRemoteCharacteristicHeartRate = nullptr;

void setupWiFi()
{
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
}

void sendDataToMqtt(char *data, char *topic)
{
  mqttClient.publish(topic, data);
}

void connectToPowerMeter()
{
  BLEClient *pClient = BLEDevice::createClient();
  if (pClient->connect(powerMeterDevice))
  {
    Serial.println("Connected to power meter.");
    BLERemoteService *pRemoteService = pClient->getService(serviceUUIDPower);
    if (pRemoteService)
    {
      pRemoteCharacteristicPower = pRemoteService->getCharacteristic(charUUIDPower);
      if (pRemoteCharacteristicPower && pRemoteCharacteristicPower->canNotify())
      {
        pRemoteCharacteristicPower->registerForNotify(
            [](BLERemoteCharacteristic *pCharacteristic, uint8_t *pData, size_t length, bool isNotify)
            {
              int16_t power = pData[2] | (pData[3] << 8);
              Serial.print("Power: ");
              Serial.print(power);
              Serial.println(" W");
              char buffer[6];
              sprintf(buffer, "%d", power);
              sendDataToMqtt(buffer, "sensors/power");
            });
      }
      connectedPower = true;
    }
  }
  else
  {
    Serial.println("Failed to connect to power meter.");
  }
}

void connectToHeartRateMonitor()
{
  BLEClient *pClient = BLEDevice::createClient();
  if (pClient->connect(heartRateDevice))
  {
    Serial.println("Connected to heart rate monitor.");
    BLERemoteService *pRemoteService = pClient->getService(serviceUUIDHeartRate);
    if (pRemoteService)
    {
      pRemoteCharacteristicHeartRate = pRemoteService->getCharacteristic(charUUIDHeartRate);
      if (pRemoteCharacteristicHeartRate && pRemoteCharacteristicHeartRate->canNotify())
      {
        pRemoteCharacteristicHeartRate->registerForNotify(
            [](BLERemoteCharacteristic *pCharacteristic, uint8_t *pData, size_t length, bool isNotify)
            {
              uint8_t heartRate = pData[1];
              Serial.print("Heart Rate: ");
              Serial.print(heartRate);
              Serial.println(" BPM");
              char buffer[6];
              sprintf(buffer, "%d", heartRate);
              sendDataToMqtt(buffer, "sensors/heartrate");
            });
      }
      connectedHeartRate = true;
    }
  }
  else
  {
    Serial.println("Failed to connect to heart rate monitor.");
  }
}

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks
{
  void onResult(BLEAdvertisedDevice advertisedDevice)
  {
    if (advertisedDevice.haveServiceUUID())
    {
      if (advertisedDevice.isAdvertisingService(serviceUUIDPower))
      {
        Serial.println("Found power meter!");
        powerMeterDevice = new BLEAdvertisedDevice(advertisedDevice);
        doConnectPower = true;
      }
      if (advertisedDevice.isAdvertisingService(serviceUUIDHeartRate))
      {
        Serial.println("Found heart rate monitor!");
        heartRateDevice = new BLEAdvertisedDevice(advertisedDevice);
        doConnectHeartRate = true;
      }
    }

    if (powerMeterDevice && heartRateDevice)
    {
      BLEDevice::getScan()->stop();
    }
  }
};

void setup()
{
  Serial.begin(115200);
  BLEDevice::init("");

  setupWiFi();
  mqttClient.setServer(serverIP, mqttPort);

  BLEScan *pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->start(5, false);
}

void reconnect()
{
  while (!mqttClient.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (mqttClient.connect("ESP32Client"))
    {
      Serial.println("connected");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop()
{
  if (doConnectPower && !connectedPower)
  {
    connectToPowerMeter();
    doConnectPower = false;
  }

  if (doConnectHeartRate && !connectedHeartRate)
  {
    connectToHeartRateMonitor();
    doConnectHeartRate = false;
  }

  if (!mqttClient.connected())
  {
    reconnect();
  }
  mqttClient.loop();
  delay(500);
}
