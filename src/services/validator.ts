import { HttpError, RequestProps } from "@vcsc/node-core";
import { plainToInstance } from "class-transformer";
import { validate as validateSchema, ValidatorOptions, ValidationError } from "class-validator";

export class Validator {
  /**
   *
   * @param schema - schema validator
   * @returns
   */
   static validate = (schema: any, validatorOptions?: ValidatorOptions) => async (result: any, request: RequestProps) => {
    const value = result || request.body; // value will be request body as default

    const schemaValidator = plainToInstance(schema, value);

    const validationErrors: ValidationError[] = await validateSchema(schemaValidator, validatorOptions);

    const errors: any[] = [];

    if (validationErrors.length > 0) {
      validationErrors.forEach(({ property, children, constraints }) => {
        if (constraints) {
          errors.push({ [property]: constraints });
        }

        // handle nested errors
        if (children && children?.length > 0) {
          children?.forEach(({ children }) => {
            children?.forEach(({ constraints }) => {
              errors.push({ [property]: constraints });
            });
          });
        }
      });

      throw new HttpError(400, 'Please correct the following errors and try again', errors);
    }
  };
}