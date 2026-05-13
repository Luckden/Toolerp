using Microsoft.Extensions.DependencyInjection;
using Toolerp.Backend.Application.Features.Products.Commands.CreateProduct;

namespace Toolerp.Backend.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
        {
            configuration.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
        });

        services.AddScoped<CreateProductCommandValidator>();

        return services;
    }
}