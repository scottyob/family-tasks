import { ModalFormContainer } from "~/components/forms/modalFormContainer";
import React from "react";
import { api } from "~/utils/api";
import TaskEdit from "../forms/taskEdit";
import ListContainer from "./listContainer";
import { TaskListItem } from "./listItems";
import { TaskStatus } from "taskwarrior-lib";
import { FavoriteProject, Task } from "~/utils/taskLib";
import { DateTime, Interval } from "luxon";
import TaskListItemSettings from "./taskListItemSettings";

interface Props {
  project?: string;
  filterUserFavorites?: boolean;
  title?: string;
}
type TodoStatus = "Pending" | "Waiting" | "Completed";

function FilterSelector(props: {
  status: TodoStatus;
  setStatus: (status: TodoStatus) => void;
}) {
  const selected = "underline decoration-2 underline-offset-8 text-purple-800";

  return (
    <div className="vt323 absolute bottom-0 right-0 flex cursor-pointer space-x-2 p-2 align-text-bottom text-sm">
      <div
        className={props.status == "Pending" ? selected : ""}
        onClick={() => props.setStatus("Pending")}
      >
        Pending
      </div>
      <div
        className={props.status == "Waiting" ? selected : ""}
        onClick={() => props.setStatus("Waiting")}
      >
        Waiting
      </div>
      <div
        className={props.status == "Completed" ? selected : ""}
        onClick={() => props.setStatus("Completed")}
      >
        Completed
      </div>
    </div>
  );
}

export default function TasksList(props: Props) {
  const [filter, setFilter] = React.useState<TodoStatus>("Pending");
  const [modifyTaskId, setModifyTaskId] = React.useState<Task | undefined>();
  const user = api.users.currentUser.useQuery().data;

  const className = {
    container: "p-2 max-w-lg m-auto",
    loading: "animate-pulse",
  };

  // Get a list of tasks from the database
  let getTasksFilter = undefined;
  if (props.project) {
    getTasksFilter = "project:'" + props.project + "'";
  }

  const tasksQuery = api.tasks.get.useQuery({ filter: getTasksFilter });
  const addTaskMutator = api.tasks.add.useMutation();

  // Determine if we're loading
  const loading = tasksQuery.data == undefined || addTaskMutator.isPending;
  const containerStyleClassName = [
    className.container,
    loading ? className.loading : "",
  ].join(" ");

  // Render a list of tasks from the server
  let tasks = [...(tasksQuery.data || [])] as Task[];

  if (props.filterUserFavorites) {
    let userFavoriteProjects: FavoriteProject[] = [];
    if (user?.favoriteProjects)
      userFavoriteProjects = JSON.parse(
        user.favoriteProjects
      ) as FavoriteProject[];

    // Filter the tasks out based on the user starred settings
    tasks = tasks.filter((t) => {
      // If the task is assigned to another user, prune it out
      if (t.assignedTo && t.assignedTo != user?.name) return false;

      // Tasks that don't have a project should always be shown
      if (!t.project) return true;

      const userProjectSetting = userFavoriteProjects.find(
        (s) => s.projectName == t.project
      );

      // If the user has not starred this, get it out of here.
      if (!userProjectSetting) return false;

      // If the user has starred this in any way, and it's
      // assigned to them, then show it
      if(t.assignedTo === user?.name) return true;

      // If it's always in the users inbox, show it regardless
      if (userProjectSetting.showInHome) return true;

      // And by default, show it if the task is started, or due
      if (t.start || t.due) return true;

      return false;
    });
  }

  // Filter the tasks based on the selected filter
  switch (filter) {
    case "Pending":
      tasks = tasks.filter((task) => task.status === "pending");
      break;
    case "Waiting":
      tasks = tasks.filter((task) => task.status === "waiting");
      break;
    case "Completed":
      tasks = tasks.filter((task) => task.status === "completed");
    default:
      // handle invalid filter values here, if desired
      break;
  }

  // Sort em
  tasks = tasks.sort((a: Task, b: Task) => {
    // Helper function to compare dates
    const compareDates = (
      dateA: string | undefined,
      dateB: string | undefined
    ) => {
      if (dateA === dateB) return 0;
      if (dateA == null) return 1;
      if (dateB == null) return -1;

      const compareTime =
        DateTime.fromISO(dateA).toMillis() - DateTime.fromISO(dateB).toMillis();
      return compareTime;
    };

    // First, if the tasks are complete, put them up top
    if (a.end && b.end) {
      return compareDates(b.end, a.end);
    }

    // Sorting rules:
    // - "Due" tasks sorted by due date

    // - "Started" tasks go up the top by state
    // - "Due" tasks go next
    if (a.start && !b.start) return -1;
    if (b.start && !a.start) return 1;
    if (!a.start && !b.start) {
      if (a.due && !b.due) return -1;
      if (b.due && !a.due) return 1;
    }

    // Started tasks are ordered by start date
    if (a.start && b.start) {
      return compareDates(a.start, b.start);
    }

    // Due tasks are sorted by due date
    if (a.due && b.due) return compareDates(a.due, b.due);

    return compareDates(a.entry, b.entry);
  });

  const tasksList = tasks.map((t) => (
    <TaskListItem
      key={t.uuid}
      task={t}
      onSelected={() => {
        setModifyTaskId(t);
      }}
    />
  ));

  // Callback for adding a quick task
  const context = api.useContext();
  const addTaskCallback = (title: string, done: () => void) => {
    addTaskMutator.mutate(
      {
        title: title,
        project: props.project,
      },
      {
        onSuccess: () => {
          done();
          void context.tasks.invalidate();
        },
      }
    );
  };

  // Render the list of tasks
  const addPlaceholder = "Add a Task";
  return (
    <div className={containerStyleClassName}>
      <ModalFormContainer
        shown={modifyTaskId !== undefined}
        title={modifyTaskId?.description}
        setShown={(shown) => {
          if (!shown) {
            setModifyTaskId(undefined);
          }
        }}
        descriptionHidden={true}
      >
        {modifyTaskId != null ? (
          <TaskListItemSettings
            task={modifyTaskId}
            reqClose={() => {
              setModifyTaskId(undefined);
            }}
          />
        ) : undefined}
      </ModalFormContainer>
      <div className="relative flex">
        <h2>{props.title ?? props.project}</h2>
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
  );
}
