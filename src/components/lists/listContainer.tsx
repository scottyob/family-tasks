import { type ReactNode, useState } from "react";
import { FaArrowAltCircleRight, FaArrowRight } from "react-icons/fa";

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
        className="group flex bg-gray-200"
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
          className="blue-800 ibg-gray-200 m-1 mr-0 grow border-none bg-gray-200 caret-pink-500 shadow-none ring-0 focus:border-none focus:shadow-none focus:ring-0 group-focus-within:bg-white"
          onChange={(event) => {
            setAddItemText(event.target.value);
          }}
        />
        <div className="m-1 ml-0 bg-gray-200 p-2 group-focus-within:bg-white">
          <button
            type="submit"
            className="min-w-[40px] rounded-lg bg-gray-300 p-1 text-white group-focus-within:bg-green-800"
          >
            <FaArrowRight size={20} className="m-auto" />
          </button>
        </div>
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
