import Link from "next/link";
import { FaEdit, FaPlay, FaStop, FaTrash, FaUser } from "react-icons/fa";
import { api } from "~/utils/api";
import { type Task } from "~/utils/taskLib";

const className = {
  ListButton:
    "m-auto flex mb-4 items-center rounded-lg border px-5 py-2.5 text-center text-sm font-medium focus:outline-none",
  ListButtonWhite:
    "border-gray-200 bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600",
  ListButtonRed:
    "text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900",
  ButtonIcon: "pr-2",
};

export default function TaskListItemSettings(props: {
  task: Task;
  reqClose: () => void;
}) {
  const startedMutation = api.tasks.setStart.useMutation();
  const deleteMutation = api.tasks.delete.useMutation();

  const context = api.useContext();

  const stateUpdated = () => {
    void (async () => {
      await context.tasks.invalidate();
      props.reqClose();
    })();
  };

  return (
    <div className="p-4">
      <Link href={"/edit/" + (props.task.uuid as string)}>
        <button
          type="button"
          className={className.ListButton + " " + className.ListButtonWhite}
        >
          <FaEdit size={20} className={className.ButtonIcon} />
          Edit Task
        </button>
      </Link>
      <button
        type="button"
        className={className.ListButton + " " + className.ListButtonWhite}
        onClick={() => {
          // Start/Top button has been clicked
          startedMutation.mutate(
            {
              taskUuid: props.task.uuid as string,
              started: !props.task.start,
            },
            {
              onSuccess: () => stateUpdated,
            }
          );
        }}
      >
        {!props.task.start ? (
          <>
            <FaPlay size={20} className={className.ButtonIcon} />
            Start Task
          </>
        ) : (
          <>
            <FaStop size={20} className={className.ButtonIcon} />
            Stop Task
          </>
        )}
      </button>
      <button
        type="button"
        className={className.ListButton + " " + className.ListButtonWhite}
      >
        <FaUser size={20} className={className.ButtonIcon} />
        Assign Owner
      </button>
      <button
        type="button"
        className={className.ListButton + " " + className.ListButtonRed}
        onClick={() =>
          deleteMutation.mutate(
            { uuid: props.task.uuid as string },
            { onSuccess: stateUpdated }
          )
        }
      >
        <FaTrash size={20} className={className.ButtonIcon} />
        Delete Task
      </button>
    </div>
  );
}
