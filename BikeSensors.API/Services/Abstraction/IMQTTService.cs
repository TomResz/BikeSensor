namespace BikeSensors.API.Services.Abstraction;

public interface IMQTTService
{
    Task ConnectAsync();
    Task SubscribeAsync();
}