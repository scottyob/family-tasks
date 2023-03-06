import { Group, Task } from ".prisma/client";
import { ModalFormContainer } from "family-tasks/src/components/forms/modalFormContainer";
import React from "react";
import { api } from "~/utils/api";
import { TaskType } from "~/utils/enums";
import TaskEdit from "../forms/taskEdit";
import ListContainer from "./listContainer";
import { StandardListItem, TaskListItem } from "./listItems";

interface Props {
    group?: Group;
    type: TaskType;
}

type TodoStatus = "Active" | "Scheduled" | "Complete";

function FilterSelector(props: {
    status: TodoStatus;
    setStatus: (status: TodoStatus) => void;
}) {
    const selected = "underline decoration-2 underline-offset-8 text-purple-800";

    return <div className="vt323 cursor-pointer text-sm align-text-bottom p-2 space-x-2 flex absolute right-0 bottom-0">
        <div className={props.status == "Active" ? selected : ""} onClick={() => props.setStatus("Active")}>Active</div>
        <div className={props.status == "Scheduled" ? selected : ""} onClick={() => props.setStatus("Scheduled")}>Scheduled</div>
        <div className={props.status == "Complete" ? selected : ""} onClick={() => props.setStatus("Complete")}>Complete</div>
    </div>
}

export default function TasksList(props: Props) {
    const [filter, setFilter] = React.useState<TodoStatus>("Active");
    const [modifyTaskId, setModifyTaskId] = React.useState<Task | undefined>();

    // Database interactions
    const tasksQuery = api.tasks.tasksForGroupByType.useQuery({
        groupId: props.group?.id,
        type: props.type
    });
    const addTaskMutator = api.tasks.addTaskWithTitle.useMutation();

    // Determine if we're loading
    const loading = tasksQuery.data == undefined || addTaskMutator.isLoading;
    const containerStyle = "p-2 " + (loading ? "animate-pulse" : "");

    // Render a list of tasks from the server
    let tasksList = [<div key=""></div>];
    let tasks = tasksQuery.data
    if (tasks != null) {
        // Filter the tasks based on the selected filter
        switch (filter) {
            case "Active":
                tasks = tasks.filter(task => !task.complete);
                break;
            case "Complete":
                tasks = tasks.filter(task => task.complete);
                break;
            default:
                // handle invalid filter values here, if desired
                break;
        }


        tasksList = tasks.map(t => <TaskListItem key={t.id} task={t} onSelected={() => {setModifyTaskId(t)}} />);
    }

    // Callback for adding a quick task
    const context = api.useContext();
    const addTaskCallback = (title: string, done: () => void) => {
        if (props.group == null) {
            return;
        }

        addTaskMutator.mutate({
            groupId: props.group?.id,
            title: title,
            type: props.type
        }, {
            onSuccess: () => {
                done();
                context.tasks.invalidate();
            }
        })
    }

    // Render the list of tasks
    const addPlaceholder = props.group == null ? undefined : "Add a " + props.type.toString();
    return <div className={containerStyle} >
        <ModalFormContainer 
            shown={modifyTaskId !== undefined}
            setShown={(shown) => {if(!shown) {setModifyTaskId(undefined)}}}
            unpadded
        >
            <TaskEdit task={modifyTaskId} />
        </ModalFormContainer>
        <div className="flex relative">
            <h2>{props.group?.name} {props.type.toString()}s</h2>
            <FilterSelector status={filter} setStatus={setFilter} />
        </div>
        <ListContainer
            addPlaceholder={addPlaceholder}
            callback={addTaskCallback}
            error={addTaskMutator.error?.message}
        >
            {tasksList}
        </ListContainer>
    </div>
}
