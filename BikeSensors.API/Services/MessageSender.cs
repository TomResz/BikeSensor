using BikeSensors.API.Services.Abstraction;
using Microsoft.AspNetCore.SignalR;
using PowerMeter.API.Hubs;

namespace BikeSensors.API.Services;

public class MessageSender : IMessageSender
{
    private readonly IHubContext<BikeSensorsClient, IBikeSensorsClient> _hubContext;

    public MessageSender(IHubContext<BikeSensorsClient, IBikeSensorsClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendHeartRateAsync(int heartRate) 
        => await _hubContext.Clients.All.ReceiveHeartRate(heartRate);

    public async Task SendPowerAsync(int power) 
        => await _hubContext.Clients.All.ReceivePower(power);

}
