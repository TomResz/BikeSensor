namespace BikeSensors.API.Services.Abstraction;

public interface IMessageSender
{
    Task SendPowerAsync(int power);
    Task SendHeartRateAsync(int heartRate);
}