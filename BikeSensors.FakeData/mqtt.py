import paho.mqtt.client as mqtt
import random
import os
import sys
import asyncio
import signal

sys.stdout.reconfigure(line_buffering=True)

BROKER = os.getenv("BROKER", "localhost")
PORT = 1883

POWER_TOPIC = "sensors/power"
HEART_RATE_TOPIC = "sensors/heartrate"

HEART_RATE_DELAY = float(os.getenv("HEART_RATE_DELAY", 2.0))
POWER_DELAY = float(os.getenv("POWER_DELAY", 0.5))

client_id = f"publisher-{random.randint(1000, 9999)}"
print(f"Broker: {BROKER}")

client = mqtt.Client(client_id)

running = True

def signal_handler(signum, frame):
    global running
    print(f"Received signal {signum}, shutting down...")
    running = False

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

try:
    client.connect(BROKER, PORT, 60)
except Exception as e:
    print(f"Failed to connect to broker: {e}")
    sys.exit(1)

client.loop_start()

async def publish_power():
    while running:
        try:
            number = random.randint(150, 300)
            client.publish(POWER_TOPIC, str(number))
            print(f"Sent: {number} to topic: {POWER_TOPIC}")
            await asyncio.sleep(POWER_DELAY)
        except Exception as e:
            print(f"Error in publishing power: {e}")
            break

async def publish_heart_rate():
    while running:
        try:
            heart_rate = random.randint(120, 160)
            client.publish(HEART_RATE_TOPIC, str(heart_rate))
            print(f"Sent: {heart_rate} to topic: {HEART_RATE_TOPIC}")
            await asyncio.sleep(HEART_RATE_DELAY)
        except Exception as e:
            print(f"Error in publishing heart rate: {e}")
            break

async def main():
    try:
        power_task = asyncio.create_task(publish_power())
        heart_rate_task = asyncio.create_task(publish_heart_rate())
        
        while running:
            await asyncio.sleep(1)
        
        power_task.cancel()
        heart_rate_task.cancel()
        
        try:
            await power_task
            await heart_rate_task
        except asyncio.CancelledError:
            print("Tasks cancelled successfully")
            
    except KeyboardInterrupt:
        print("\nReceived shutdown signal...")
    finally:
        print("Shutting down...")
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"Error in asyncio loop: {e}")
        client.loop_stop()
        client.disconnect()
        sys.exit(1)