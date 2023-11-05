import { type ReactNode, useState } from "react";

interface Props {
  addPlaceholder?: string;
  callback?: (name: string, complete: () => void) => void;
  children?: ReactNode;
  error?: string;
  additionalClassNames?: string;
  isLoading?: boolean;
}

export default function ListContainer(props: Props) {
  const [addItemText, setAddItemText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  let addInput = <></>;
  let errorMsg = <></>;

  const className =
    "grow min-h-[300px] bg-gray-100 flex flex-col " +
    (props.additionalClassNames ?? "") +
    (props.isLoading ? " animate-pulse" : "");

  if (props.error) {
    errorMsg = <div className="m-tb-2 text-red-500">{props.error}</div>;
  }

  if (props.addPlaceholder != null) {
    addInput = (
      <form
        className="flex"
        onSubmit={(e) => {
          if (props.callback != null) {
            setSubmitting(true);
            props.callback(addItemText, () => {
              setAddItemText("");
              setSubmitting(false);
            });
          }
          e.preventDefault();
        }}
      >
        <input
          type="text"
          value={addItemText}
          disabled={submitting}
          placeholder={props.addPlaceholder}
          className="m-1 grow border-none bg-gray-200 caret-pink-500 focus:bg-white"
          onChange={(event) => {
            setAddItemText(event.target.value);
          }}
        />
      </form>
    );
  }

  return (
    <div className={className}>
      {addInput}
      {errorMsg}
      {props.children}
    </div>
  );
}
