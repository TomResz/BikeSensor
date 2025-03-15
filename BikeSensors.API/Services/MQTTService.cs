using BikeSensors.API.Handlers.Abstraction;
using BikeSensors.API.Options;
using BikeSensors.API.Services.Abstraction;
using Microsoft.Extensions.Options;
using MQTTnet;
using System.Text;

namespace BikeSensors.API.Services;

public class MQTTService : IMQTTService
{
    private readonly MqttOptions _mqttOptions;
    private readonly IMqttClient _mqttClient;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MQTTService> _logger;
    private readonly IMqttMessageHandlerFactory _handlerFactory;

    public MQTTService(
        IServiceProvider serviceProvider,
        ILogger<MQTTService> logger,
        IOptions<MqttOptions> options,
        IMqttMessageHandlerFactory handlerFactory)
    {
        var factory = new MqttClientFactory();
        _mqttOptions = options.Value;
        _mqttClient = factory.CreateMqttClient();
        _mqttClient.ApplicationMessageReceivedAsync += OnMessageReceived;
        _serviceProvider = serviceProvider;
        _logger = logger;
        _handlerFactory = handlerFactory;
    }

    public async Task ConnectAsync()
    {
        var options = new MqttClientOptionsBuilder()
            .WithTcpServer(_mqttOptions.Broker, _mqttOptions.Port)
            .Build();

        await _mqttClient.ConnectAsync(options);
    }

    public async Task SubscribeAsync()
    {
        await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
            .WithTopic(_mqttOptions.PowerTopic)
            .Build()
            );
        await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
            .WithTopic(_mqttOptions.HeartRateTopic)
            .Build()
        );
    }

    private async Task OnMessageReceived(MqttApplicationMessageReceivedEventArgs e)
    {
        var topic = e.ApplicationMessage.Topic;
        var payload = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);

        _logger.LogInformation($"Received message on topic {topic}: {payload}");

        var handler = _handlerFactory.CreateHandler(topic);

        if (handler is not null)
        {
            await handler.HandleAsync(payload);
        }
        else
        {
            _logger.LogWarning($"No handler for topic {topic}");
        }
    }


}
