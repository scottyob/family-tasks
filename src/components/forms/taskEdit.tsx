import { Task } from ".prisma/client";

interface Props {
    task?: Task
}

export default function TaskEdit(props: Props) {
    const {task} = props;
    if(task == null) {
        return <></>;
    }

    const color = 'bg-blue-400';
    const textInputClass = `block`
    const labelClass = "block mb-2";

    return <div className="">
        <div className={"min-w-[350px] " + color} >
            <div className="space-x-2 p-4 flex">
                {/* Header */}
                <div className="grow">Edit {task.type}</div>
                <div>Cancel</div>
                <div>Save</div>
            </div>
            <div className="p-2">
                {/* Important form items */}
                <label className={labelClass}>
                    <span>Title</span>
                    <input type="text" id="title" className={textInputClass}></input>
                </label>

                <label className={labelClass}>
                    <span>Notes</span>
                    <textarea id="notes" className={textInputClass}></textarea>
                </label>

            </div>
        </div>
        <div className="p-2">
            Form goes here
        </div>
    </div>
}