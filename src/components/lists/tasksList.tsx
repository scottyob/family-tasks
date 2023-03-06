import { Group } from ".prisma/client";
import { api } from "~/utils/api";
import { TaskType } from "~/utils/enums";
import ListContainer from "./listContainer";
import {StandardListItem, TaskListItem} from "./listItems";

interface Props {
    group?: Group;
    type: TaskType;
}

export default function TasksList(props: Props) {
    const tasksQuery = api.tasks.tasksForGroupByType.useQuery({
        groupId: props.group?.id,
        type: props.type
    });
    const addTaskMutator = api.tasks.addTaskWithTitle.useMutation();

    // Determine if we're loading
    const loading = tasksQuery.data == undefined || addTaskMutator.isLoading;
    const containerStyle = "p-2 " + (loading ? "animate-pulse" : "");
    
    // Render a list of tasks from the server
    let tasks = [<div key=""></div>];
    if(tasksQuery.data != null) {
        
        tasks = tasksQuery.data.map(t => <TaskListItem key={t.id} task={t} />);
    }

    // Callback for adding a quick task
    const context = api.useContext();
    const addTaskCallback = (title: string, done: () => void) => {
        if(props.group == null) {
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
        <h2>{props.group?.name} {props.type.toString()}s</h2>
        <ListContainer 
            addPlaceholder={addPlaceholder}
            callback={addTaskCallback}
            error={addTaskMutator.error?.message}
        >
            {tasks}
        </ListContainer>
    </div>
}