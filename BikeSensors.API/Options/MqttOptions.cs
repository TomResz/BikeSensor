namespace BikeSensors.API.Options;

public class MqttOptions
{
    public int Port { get; set; }
    public string Broker { get; set; }
    public string PowerTopic { get; set; }
    public string HeartRateTopic { get; set; }
}
