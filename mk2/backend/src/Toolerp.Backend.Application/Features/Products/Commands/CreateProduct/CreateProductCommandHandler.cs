using MediatR;
using Toolerp.Backend.Application.Common.Exceptions;
using Toolerp.Backend.Application.Common.Interfaces;
using Toolerp.Backend.Application.Features.Products.Dtos;
using Toolerp.Backend.Application.Features.Products.Interfaces;
using Toolerp.Backend.Domain.Entities;

namespace Toolerp.Backend.Application.Features.Products.Commands.CreateProduct;

public sealed class CreateProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    CreateProductCommandValidator validator) : IRequestHandler<CreateProductCommand, ProductDto>
{
    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        validator.ValidateAndThrow(request);

        var normalizedName = request.Name.Trim();
        if (await productRepository.ExistsByNameAsync(normalizedName, cancellationToken))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                [nameof(request.Name)] = ["A product with the same name already exists."]
            });
        }

        var product = Product.Create(normalizedName, request.Description, request.Price);

        await productRepository.AddAsync(product, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProductDto(product.Id.Value, product.Name, product.Description, product.Price, product.CreatedUtc);
    }
}