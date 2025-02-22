using BikeSensors.API.Services.Abstraction;
using BikeSensors.API.Services;
using PowerMeter.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();


builder.Services.AddSignalR();
builder.Services.AddScoped<IMessageSender, MessageSender>();
builder.Services.AddSingleton<IMQTTService, MQTTService>();

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

//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();
app.MapHub<BikeSensorsClient>("/hubs/sensors");


app.Run();
