using Toolerp.Backend.Domain.Common;
using Toolerp.Backend.Domain.Events;
using Toolerp.Backend.Domain.ValueObjects;

namespace Toolerp.Backend.Domain.Entities;

public sealed class Product : Entity<ProductId>, IAggregateRoot
{
    private Product()
    {
    }

    private Product(ProductId id, string name, string description, decimal price)
    {
        Id = id;
        Name = name;
        Description = description;
        Price = price;
        CreatedUtc = DateTime.UtcNow;

        RaiseDomainEvent(new ProductCreatedDomainEvent(id));
    }

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public decimal Price { get; private set; }

    public DateTime CreatedUtc { get; private set; }

    public static Product Create(string name, string description, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Product name is required.", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException("Product description is required.", nameof(description));
        }

        if (price <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(price), "Price must be greater than zero.");
        }

        return new Product(ProductId.New(), name.Trim(), description.Trim(), decimal.Round(price, 2, MidpointRounding.AwayFromZero));
    }
}