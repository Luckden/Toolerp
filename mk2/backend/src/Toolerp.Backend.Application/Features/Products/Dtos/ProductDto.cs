namespace Toolerp.Backend.Application.Features.Products.Dtos;

public sealed record ProductDto(Guid Id, string Name, string Description, decimal Price, DateTime CreatedUtc);