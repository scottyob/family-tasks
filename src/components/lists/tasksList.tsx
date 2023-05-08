import { type Group, type Task } from ".prisma/client";
import { ModalFormContainer } from "~/components/forms/modalFormContainer";
import React from "react";
import { api } from "~/utils/api";
import TaskEdit from "../forms/taskEdit";
import ListContainer from "./listContainer";
import { TaskListItem } from "./listItems";
import { DateTime } from "luxon";

interface Props {
    group?: Group;
    filterToday?: boolean;
    allAvailable?: boolean
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
    let before = undefined;
    const user = api.users.currentUser.useQuery().data;

    // Filter today's
    if(props.filterToday) {
        before = DateTime.now().endOf("day").toJSDate();
    }

    // Database interactions
    const tasksQuery = api.tasks.tasksForGroupByType.useQuery({
        groupId: props.group?.id,
        before,
        allAvailable: props.allAvailable,
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
            case "Scheduled":
                tasks = tasks.filter(task => !task.complete && task.dueDate != null)
            default:
                // handle invalid filter values here, if desired
                break;
        }
        // Sort em
        tasks = tasks.sort((a, b) => {
            // First, compare by userID
            if (a.assignedToId === user?.id && b.assignedToId !== user?.id) {
                return -1; // a comes first
            } else if (a.assignedToId !== user?.id && b.assignedToId === user?.id) {
                return 1; // b comes first
            } else {
                // Second, compare by due date (if available)
                if (!a.dueDate && !b.dueDate) {
                    return 0;
                } else if (!a.dueDate) {
                    return 1;
                } else if (!b.dueDate) {
                    return -1;
                } else {
                    return a.dueDate.getTime() - b.dueDate.getTime();
                }
            }
        });

        tasksList = tasks.map(t => <TaskListItem key={t.id} task={t} onSelected={() => { setModifyTaskId(t) }} />);
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
        }, {
            onSuccess: () => {
                done();
                void context.tasks.invalidate();
            }
        })
    }

    // Render the list of tasks
    const addPlaceholder = props.group == null ? undefined : "Add a Task";
    return <div className={containerStyle} >
        <ModalFormContainer
            shown={modifyTaskId !== undefined}
            title={`Edit Task}`}
            setShown={(shown) => { if (!shown) { setModifyTaskId(undefined) } }}
        >
            {modifyTaskId != null ? <TaskEdit task={modifyTaskId} onRequestClose={() => setModifyTaskId(undefined)} /> : undefined}
        </ModalFormContainer>
        <div className="flex relative">
            <h2>{props.group?.name}</h2>
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
