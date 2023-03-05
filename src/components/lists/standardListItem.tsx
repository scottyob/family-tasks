interface Props {
    text: string;
    selected?: () => void;
}

export default function StandardListItem(props: Props) {
    return <div className="flex m-0.5 min-h-[40px]" onClick={(e) => {
        if (props.selected != null) { props.selected(); }
    }
    }>
        {/* Text container */}
        < div className="rounded-lg grow p-2 flex bg-white" >
            <div className="place-self-center grow flex">
                <div className="">
                    {props.text}
                </div>
            </div>
        </div >
    </div >
}