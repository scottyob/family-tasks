/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { type Decimal } from "@prisma/client/runtime";
import { useForm, type UseFormProps } from "react-hook-form";
import { type z } from "zod";

export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}

export function BasicInput(props: {
  methods: ReturnType<typeof useZodForm>;
  schema: z.ZodObject<any, any>;
  fieldName: string;
  value: string | number | boolean | Date | null | Decimal;
  inputType?: string;
  options?: Map<string, string>,
  displayName?: string,
}) {
  const { methods, fieldName, schema } = props;
  let { inputType, value } = props;
  const errorMessage = methods.formState.errors[fieldName]?.message;

  let setValueFunction = (v: any) => v;

  if (!inputType && schema.shape[fieldName]?._def.typeName == "ZodBoolean") {
    inputType = "checkbox";
  }
  if (!inputType && props.options != null) {
    inputType = "select";
  }
  if (!inputType) {
    const obj = schema.shape[fieldName];
    if (
      obj?._def.typeName === "ZodDate" ||
      (obj?._def.innerType && obj?._def.innerType._def.typeName === "ZodDate")
    ) {
      inputType = "date";
      if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      }
      setValueFunction = (v: any) => {
        return v == "" ? null : v;
      };
    }
  }

  const inputArgs = {
    type: inputType ?? "text",
    className: "Input",
    defaultValue: value?.toString() ?? "",
    defaultChecked: inputType == "checkbox" && value == true,
    ...methods.register(fieldName, {
      setValueAs: setValueFunction,
    }),
  };

  let input;
  switch (inputType) {
    case "textarea":
      input = <textarea {...inputArgs} />;
      break;
    case "select":
      if (!props.options) {
        break;
      }

      const optionElements = Array.from(props.options.entries()).map(([key, value]) => {
        return (
          <option key={key} value={key}>
            {value}
          </option>
        );
      });

      input = <select {...inputArgs}>
        {optionElements}
      </select>
      break;
    default:
      input = <input {...inputArgs} />;
  }

  return (
    <>
      <fieldset className="Fieldset">
        <label className="Label">{props.displayName ? props.displayName : fieldName}</label>
        {input}
      </fieldset>
      {errorMessage && <p className="text-red-700">{errorMessage as string}</p>}
    </>
  );
}
