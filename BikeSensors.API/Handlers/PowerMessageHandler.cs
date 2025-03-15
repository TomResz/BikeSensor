using BikeSensors.API.Handlers.Abstraction;
using BikeSensors.API.Services.Abstraction;

namespace BikeSensors.API.Handlers;

public class PowerMessageHandler : IMqttMessageHandler
{
    private readonly IMessageSender _messageSender;
    private readonly ILogger<PowerMessageHandler> _logger;

    public PowerMessageHandler(IMessageSender messageSender, ILogger<PowerMessageHandler> logger)
    {
        _messageSender = messageSender;
        _logger = logger;
    }

    public async Task HandleAsync(string payload)
    {
        if (int.TryParse(payload, out int power))
        {
            await _messageSender.SendPowerAsync(power);
            _logger.LogInformation($"Power: {power}");
        }
        else
        {
            _logger.LogError("Invalid power format!");
        }
    }
}
