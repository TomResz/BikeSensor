using BikeSensors.API.Services.Abstraction;
using BikeSensors.API.Services;
using PowerMeter.API.Hubs;
using BikeSensors.API.Options;
using BikeSensors.API.Handlers.Abstraction;
using BikeSensors.API.Handlers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MqttOptions>(builder.Configuration.GetSection("Mqtt"));


builder.Services.AddSignalR();
builder.Services.AddScoped<IMessageSender, MessageSender>();
builder.Services.AddSingleton<IMQTTService, MQTTService>();
builder.Services.AddSingleton<IMqttMessageHandlerFactory, MqttMessageHandlerFactory>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", builder =>
    {
        builder
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("*")
            .WithOrigins("http://localhost:4200")
            .AllowCredentials();
    });
});

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider.GetRequiredService<IMQTTService>();
    await service.ConnectAsync();
    await service.SubscribeAsync();
}

app.UseCors("Frontend");

app.MapHub<BikeSensorsClient>("/hubs/sensors");


app.Run();
