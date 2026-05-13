using Toolerp.Backend.Domain.Entities;

namespace Toolerp.Backend.Application.Features.Products.Interfaces;

public interface IProductRepository
{
    Task AddAsync(Product product, CancellationToken cancellationToken = default);

    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
}