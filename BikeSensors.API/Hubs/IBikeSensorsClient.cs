namespace PowerMeter.API.Hubs;

public interface IBikeSensorsClient
{
    Task ReceivePower(int power);
    Task ReceiveHeartRate(int speed);
}
