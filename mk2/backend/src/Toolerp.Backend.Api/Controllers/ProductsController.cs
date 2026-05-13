using MediatR;
using Microsoft.AspNetCore.Mvc;
using Toolerp.Backend.Application.Features.Products.Commands.CreateProduct;
using Toolerp.Backend.Application.Features.Products.Dtos;

namespace Toolerp.Backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController(ISender sender) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductCommand command, CancellationToken cancellationToken)
    {
        var product = await sender.Send(command, cancellationToken);
        return Created($"/api/products/{product.Id}", product);
    }
}