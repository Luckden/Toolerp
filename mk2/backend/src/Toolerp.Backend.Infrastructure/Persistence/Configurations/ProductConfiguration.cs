using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Toolerp.Backend.Domain.Entities;
using Toolerp.Backend.Domain.ValueObjects;

namespace Toolerp.Backend.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(product => product.Id);

        builder.Property(product => product.Id)
            .HasConversion(productId => productId.Value, value => new ProductId(value))
            .ValueGeneratedNever();

        builder.Property(product => product.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(product => product.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(product => product.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(product => product.CreatedUtc)
            .IsRequired();

        builder.HasIndex(product => product.Name)
            .IsUnique();

        builder.Ignore(product => product.DomainEvents);
    }
}