using Microsoft.EntityFrameworkCore;
using Toolerp.Backend.Application.Features.Products.Interfaces;
using Toolerp.Backend.Domain.Entities;
using Toolerp.Backend.Infrastructure.Persistence;

namespace Toolerp.Backend.Infrastructure.Repositories;

public sealed class ProductRepository(ToolerpDbContext dbContext) : IProductRepository
{
    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await dbContext.Products.AddAsync(product, cancellationToken);
    }

    public Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return dbContext.Products.AnyAsync(product => product.Name == name, cancellationToken);
    }
}