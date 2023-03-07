import { Task } from ".prisma/client";
import { BiCheck } from "react-icons/bi";
import { VscCircleLargeFilled } from "react-icons/vsc";
import { api } from "~/utils/api";

interface Props {
    text: string;
    selected?: () => void;
}

export function StandardListItem(props: Props) {
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


interface CheckedListItemProps {
    task: Task
    onSelected?: () => void;
}

export function TaskListItem(props: CheckedListItemProps) {
    const updateFlagged = api.tasks.setCompleted.useMutation();

    let textColor = '';
    let leftIcon = <></>;

    let color = 'bg-red-400 ';
    color = 'bg-blue-400';
    color = 'bg-green-400';
    // color = 'bg-gray-400';

    if (props.task.complete) {
        leftIcon = <BiCheck size={20} />;
        textColor = 'text-gray-400';
        color = 'bg-gray-400'
    }

    const context = api.useContext();
    const toggleFlagged = () => {
        updateFlagged.mutate({
            taskId: props.task.id,
            completed: !props.task.complete
        }, {
            onSuccess: () => {
                context.tasks.invalidate();
            }
        })
    }

    return <div className="flex m-0.5 min-h-[60px]">
        {/* Left priority & done button */}
        <div
            className={"rounded-l-lg min-w-[40px] place-items-center justify-center flex " + color}
            onClick={toggleFlagged}
        >
            <div className="bg-gray-200/40 min-w-[20px] min-h-[20px]">{leftIcon}</div>
        </div>

        {/* Text container */}
        <div className="rounded-r-lg grow p-2 flex bg-gray-50" onClick={() => {if(props.onSelected) {props.onSelected()}}}>
            <div className="place-self-center grow flex">
                <div className={textColor}>
                    {props.task.title}
                </div>
            </div>
        </div>
    </div>

}