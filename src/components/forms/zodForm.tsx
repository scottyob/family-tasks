/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import { useState } from "react";
import { useForm, Controller, type UseFormProps } from "react-hook-form";
import { type z } from "zod";
import { Typeahead } from "react-bootstrap-typeahead";
import { DayPicker } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";

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
  value: string | number | boolean | Date | null;
  inputType?: string;
  options?: Map<string, string>;
  displayName?: string;
}) {
  const { methods, fieldName, schema } = props;
  let { inputType, value } = props;
  const errorMessage = methods.formState.errors[fieldName]?.message;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const setValueFunction = (v: any) => v;

  if (!inputType && schema.shape[fieldName]?._def.typeName == "ZodBoolean") {
    inputType = "checkbox";
  }
  if (!inputType && props.options != null) {
    inputType = "select";
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
  // Custom input types
  switch (inputType) {
    case "textarea":
      input = <textarea {...inputArgs} />;
      break;
    case "select":
      if (!props.options) {
        break;
      }

      const optionElements = Array.from(props.options.entries()).map(
        ([key, value]) => {
          return (
            <option key={key} value={key}>
              {value}
            </option>
          );
        }
      );

      input = <select {...inputArgs}>{optionElements}</select>;
      break;
    case "cmdk":
      const projects = props.options ? [...props.options?.keys()] : [];

      input = (
        <>
          <Controller
            name={props.fieldName}
            control={methods.control}
            defaultValue={props.value?.toString()}
            render={({ field, fieldState }) => {
              return (
                <Typeahead
                  id="typeahead"
                  options={projects}
                  defaultInputValue={props.value?.toString()}
                  onInputChange={(input) => {
                    field.onChange(input);
                  }}
                  onChange={(selected) => {
                    if (selected && selected.length > 0) {
                      field.onChange(selected[0]);
                    }
                  }}
                  onBlur={field.onBlur}
                />
              );
            }}
          />
        </>
      );
      break;
    case "datetime":
      input = (
        <Controller
          name={props.fieldName}
          control={methods.control}
          render={({ field }) => {
            // Lob off the time for now.  Need to find a good supported component
            let dateTime: DateTime | undefined = undefined;

            if (field.value) {
              dateTime = DateTime.fromISO(field.value as string);
            }

            return (
              <Popover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
                <Popover.Trigger className="min-w-[50%] text-left">
                  {dateTime?.toLocaleString() ?? <i>No Date</i>}
                </Popover.Trigger>
                <Popover.Content className="bg-white">
                  <DayPicker
                    mode="single"
                    selected={dateTime?.toJSDate()}
                    onSelect={(selection) => {
                      // Convert this back to a time value
                      let newStr: string | null = null;
                      if (selection) {
                        newStr = DateTime.fromISO(selection.toISOString(), {
                          zone: "utc",
                        }).toFormat("yyyyMMdd'T'HHmmss'Z'");
                      }

                      field.onChange(newStr);
                      setCalendarOpen(false);
                    }}
                  />
                </Popover.Content>
              </Popover.Root>
            );
          }}
        />
      );
      break;
    default:
      input = <input {...inputArgs} />;
  }

  return (
    <>
      <fieldset className="Fieldset">
        <label className="Label">
          {props.displayName ? props.displayName : fieldName}
        </label>
        {input}
      </fieldset>
      {errorMessage && <p className="text-red-700">{errorMessage as string}</p>}
    </>
  );
}
