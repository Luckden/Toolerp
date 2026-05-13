using Toolerp.Backend.Application.Common.Exceptions;

namespace Toolerp.Backend.Application.Features.Products.Commands.CreateProduct;

public sealed class CreateProductCommandValidator
{
    public void ValidateAndThrow(CreateProductCommand command)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(command.Name))
        {
            errors[nameof(command.Name)] = ["Name is required."];
        }
        else if (command.Name.Trim().Length > 200)
        {
            errors[nameof(command.Name)] = ["Name must not exceed 200 characters."];
        }

        if (string.IsNullOrWhiteSpace(command.Description))
        {
            errors[nameof(command.Description)] = ["Description is required."];
        }
        else if (command.Description.Trim().Length > 1000)
        {
            errors[nameof(command.Description)] = ["Description must not exceed 1000 characters."];
        }

        if (command.Price <= 0)
        {
            errors[nameof(command.Price)] = ["Price must be greater than zero."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }
    }
}