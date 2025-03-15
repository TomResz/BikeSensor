namespace BikeSensors.API.Handlers.Abstraction;

public interface IMqttMessageHandler
{
    Task HandleAsync(string payload);
}
