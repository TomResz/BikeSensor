import paho.mqtt.client as mqtt
import random
import os
import sys
import threading

sys.stdout.reconfigure(line_buffering=True)

BROKER = os.getenv("BROKER", "localhost")
DELAY = float(os.getenv("DELAY", 1))
PORT = 1883
POWER_TOPIC = "sensors/power"
HEART_RATE_TOPIC = "sensors/heartrate"

client_id = f"publisher-{random.randint(1000, 9999)}"
print(f"Broker: {BROKER}")
print(f"Delay: {DELAY}")

shutdown_event = threading.Event()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker!")
    else:
        print(f"Connection error, code: {rc}")

client = mqtt.Client(client_id)
client.on_connect = on_connect

try:
    client.connect(BROKER, PORT, 60)
except Exception as e:
    print(f"Failed to connect to broker: {e}")
    sys.exit(1)

client.loop_start()

try:
    while not shutdown_event.is_set():
        number = random.randint(150, 300)
        heart_rate = random.randint(120, 160)
        client.publish(POWER_TOPIC, str(number))
        client.publish(HEART_RATE_TOPIC, str(heart_rate))
        print(f"Sent: {number} to topic: {POWER_TOPIC}")
        print(f"Sent: {heart_rate} to topic: {HEART_RATE_TOPIC}")
        shutdown_event.wait(timeout=DELAY)
except Exception as e:
    print(f"Error in publishing loop: {e}")
finally:
    print("Shutting down...")
    client.loop_stop()
    client.disconnect()
    sys.exit(0)