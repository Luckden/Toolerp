using MediatR;
using Toolerp.Backend.Application.Features.Products.Dtos;

namespace Toolerp.Backend.Application.Features.Products.Commands.CreateProduct;

public sealed record CreateProductCommand(string Name, string Description, decimal Price) : IRequest<ProductDto>;