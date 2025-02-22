using BikeSensors.API.Services.Abstraction;
using MQTTnet;
using System.Text;

namespace BikeSensors.API.Services;

public class MQTTService : IMQTTService
{
    // TO DO
    // option pattern
    private const string PowerTopic = "sensors/power";
    private const string HeartRateTopic = "sensors/heartrate";
    private const string Host = "bikesensors.mqtt";
    private const int Port = 1883;

    private readonly IMqttClient _mqttClient;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MQTTService> _logger;
    public MQTTService(
        IServiceProvider serviceProvider,
        ILogger<MQTTService> logger)
    {
        var factory = new MqttClientFactory();
        _mqttClient = factory.CreateMqttClient();
        _mqttClient.ApplicationMessageReceivedAsync += OnMessageReceived;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task ConnectAsync()
    {
        var options = new MqttClientOptionsBuilder()
            .WithTcpServer(Host, Port)
            .Build();

        await _mqttClient.ConnectAsync(options);
    }

    public async Task SubscribeAsync()
    {
        await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
            .WithTopic(PowerTopic)
            .Build()
            );
        await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
            .WithTopic(HeartRateTopic)
            .Build()
        );
    }

    private async Task OnMessageReceived(MqttApplicationMessageReceivedEventArgs e)
    {
        var topic = e.ApplicationMessage.Topic;
        var payload = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);

        _logger.LogInformation($"Received message on topic {topic}: {payload}");
        using var scope = _serviceProvider.CreateScope();
        var sender = scope.ServiceProvider.GetRequiredService<IMessageSender>();

        if (topic == PowerTopic)
        {
            if (int.TryParse(payload, out int power))
            {
                await sender.SendPowerAsync(power);
                _logger.LogInformation($"Power: {power}");
                return;
            }
            _logger.LogError(message: "Invalid power format!");
        }
        else if (topic == HeartRateTopic)
        {
            if (int.TryParse(payload, out int heartRate))
            {
                await sender.SendHeartRateAsync(heartRate);
                _logger.LogInformation($"Heart Rate: {heartRate}");
            }
        }
    }


}
