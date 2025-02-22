FROM python:3.9-slim

WORKDIR /app

COPY ./BikeSensors.FakeData/requirements.txt .
COPY ./BikeSensors.FakeData/mqtt.py .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "mqtt.py"]