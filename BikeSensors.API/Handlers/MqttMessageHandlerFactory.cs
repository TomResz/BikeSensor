using BikeSensors.API.Handlers.Abstraction;

namespace BikeSensors.API.Handlers;

public sealed class MqttMessageHandlerFactory : IMqttMessageHandlerFactory
{
    private readonly IServiceProvider _serviceProvider;

    public MqttMessageHandlerFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IMqttMessageHandler? CreateHandler(string topic)
    {
        using var scope = _serviceProvider.CreateScope();

        return topic switch
        {
            "sensors/power" => scope.ServiceProvider.GetRequiredService<PowerMessageHandler>(),
            "sensors/heartrate" => scope.ServiceProvider.GetRequiredService<HeartRateMessageHandler>(),
            _ => null
        };
    }
}
