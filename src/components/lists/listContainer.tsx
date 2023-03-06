import { ReactNode, useState } from "react";

interface Props {
    addPlaceholder?: string;
    callback?: (name: string, complete: () => void) => void;
    children: ReactNode;
    error?: string;
    additionalClassNames?: string;
}

export default function ListContainer(props: Props) {
    const [addItemText, setAddItemText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    let addInput = <></>;
    let errorMsg = <></>;

    if(props.error) {
    errorMsg = <div className="text-red-500 m-tb-2">{props.error}</div>
    }

    if (props.addPlaceholder != null) {
        addInput = <form
            className="flex"
            onSubmit={(e) => {
                if(props.callback != null) {
                    setSubmitting(true);
                    props.callback(addItemText, () => {
                        setAddItemText("");
                        setSubmitting(false);
                    });
                }
                e.preventDefault();
            }}>
            <input
                type="text"
                value={addItemText}
                disabled={submitting}
                placeholder={props.addPlaceholder}
                className="grow m-1 caret-pink-500 bg-gray-200 focus:bg-white border-none"
                onChange={(event) => {
                    setAddItemText(event.target.value);
                }}
            /></form>;
    }

    return <div className={"grow min-h-[300px] bg-gray-100 flex flex-col " + props.additionalClassNames ?? ""}>
        {addInput}
        {errorMsg}
        {props.children}
    </div>
}