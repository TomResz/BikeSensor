using BikeSensors.API.Handlers.Abstraction;
using BikeSensors.API.Services.Abstraction;

namespace BikeSensors.API.Handlers;

public class HeartRateMessageHandler : IMqttMessageHandler
{
    private readonly IMessageSender _messageSender;
    private readonly ILogger<HeartRateMessageHandler> _logger;

    public HeartRateMessageHandler(IMessageSender messageSender, ILogger<HeartRateMessageHandler> logger)
    {
        _messageSender = messageSender;
        _logger = logger;
    }

    public async Task HandleAsync(string payload)
    {
        if (int.TryParse(payload, out int heartRate))
        {
            await _messageSender.SendHeartRateAsync(heartRate);
            _logger.LogInformation($"Heart Rate: {heartRate}");
        }
    }
}
