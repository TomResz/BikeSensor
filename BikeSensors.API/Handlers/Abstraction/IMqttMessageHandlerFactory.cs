namespace BikeSensors.API.Handlers.Abstraction;

public interface IMqttMessageHandlerFactory
{
    IMqttMessageHandler? CreateHandler(string topic);
}
