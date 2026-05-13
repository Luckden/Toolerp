using Scalar.AspNetCore;
using Toolerp.Backend.Api.Middleware;
using Toolerp.Backend.Application;
using Toolerp.Backend.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapSwagger("/openapi/{documentName}.json");
    app.MapScalarApiReference(options => options
        .WithTitle("Toolerp Backend API")
        .WithOpenApiRoutePattern("/openapi/{documentName}.json")
        .DisableAgent());
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();

public partial class Program;
