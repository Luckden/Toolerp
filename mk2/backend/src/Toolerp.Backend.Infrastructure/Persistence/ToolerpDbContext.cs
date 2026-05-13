using Microsoft.EntityFrameworkCore;
using Toolerp.Backend.Application.Common.Interfaces;
using Toolerp.Backend.Domain.Entities;

namespace Toolerp.Backend.Infrastructure.Persistence;

public sealed class ToolerpDbContext(DbContextOptions<ToolerpDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ToolerpDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}