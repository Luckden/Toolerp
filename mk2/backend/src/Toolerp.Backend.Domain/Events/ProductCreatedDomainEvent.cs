using Toolerp.Backend.Domain.Common;
using Toolerp.Backend.Domain.ValueObjects;

namespace Toolerp.Backend.Domain.Events;

public sealed record ProductCreatedDomainEvent(ProductId ProductId) : IDomainEvent;