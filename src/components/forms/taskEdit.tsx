import { Task } from ".prisma/client";
import { VscTrash } from "react-icons/vsc";
import { api } from "~/utils/api";

interface Props {
    task?: Task
    onRequestClose?: () => void,
}

export default function TaskEdit(props: Props) {
    const { task } = props;
    if (task == null) {
        return <></>;
    }

    const deleteMutation = api.tasks.delete.useMutation();

    const color = 'bg-blue-400';
    const textInputClass = `flex fill`
    const labelClass = "mb-2 flex flex-col";

    const context = api.useContext();
    return <div className="">
        <div className={"min-w-[350px] " + color} >
            <div className="space-x-2 p-4 flex">
                {/* Header */}
                <h1 className="grow">Edit {task.type}</h1>
                <div>Cancel</div>
                <div>Save</div>
            </div>
            <div className="p-4 flex flex-col">
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
        <div className="p-4 flex flex-col">
            <label className={labelClass}>
                <span>Group</span>
                <input type="text" id="group" className={textInputClass}></input>
            </label>

            <label className={labelClass}>
                <span>Assigned</span>
                <input type="text" id="group" className={textInputClass}></input>
            </label>

            {/* Remove button that does not work */}
            <a href="" className="text-red-800 text-center p-2" onClick={(event) => {
                event.preventDefault();
                if(task == null) {
                    return;
                }
                deleteMutation.mutate({
                    id: task.id
                }, {
                    onSuccess: () => {
                        context.tasks.invalidate();
                        if(props.onRequestClose != null) { props.onRequestClose() };
                    }
                })

                // const userId = myUser.data?.id;
                // if (userId == undefined) {
                //     return;
                // }
                // removeFromGroupMutation.mutate({
                //     userId: userId,
                //     groupId: props.group.id
                // }, {
                //     onSuccess: () => {
                //         context.users.groupMembers.invalidate();
                //         context.users.groups.invalidate();
                //         if (props.modalShown) {
                //             props.modalShown(false);
                //         }
                //     }
                // })
            }}>
                <VscTrash className="inline" /> Delete Task
            </a>

        </div>
    </div>
}