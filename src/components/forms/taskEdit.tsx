import { api } from "~/utils/api";
import { TaskEditInput } from "~/utils/inputs";
import { BasicInput, useZodForm } from "./zodForm";
import { type Task } from "~/utils/taskLib";
import { vt323 } from "~/utils/fonts";
import Link from "next/link";

interface Props {
  task: Task;
  onRequestClose?: () => void;
}

export default function TaskEdit(props: Props) {
  const { task } = props;

  const allProjects = api.tasks.getProjects.useQuery();
  const editMutation = api.tasks.edit.useMutation();
  const context = api.useContext();

  const methods = useZodForm({
    schema: TaskEditInput,
    mode: "onChange",
    defaultValues: {
      ...task,
    },
  });

  if (allProjects.isPending) {
    return <p>Loading...</p>;
  }

  // Build a list of projects to auto-complete
  const projectsMap = new Map();
  allProjects.data?.forEach((p) => {
    projectsMap.set(p, "");
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void methods.handleSubmit((values) => {
          editMutation.mutate(values, {
            onSuccess: () => {
              props.onRequestClose?.();
              void context.tasks.invalidate();
            },
            onError: (err) => {
              alert(err.message);
            },
          });
        })(event);
      }}
    >
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="description"
        displayName="Description"
        value={task.description ?? ""}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="notes"
        displayName="Notes"
        inputType="textarea"
        value={task.notes ?? ""}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="project"
        displayName="Project"
        inputType="cmdk"
        options={projectsMap}
        value={task.project ?? ""}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="due"
        displayName="Due By"
        inputType="datetime"
        value={task.due ?? null}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="wait"
        displayName="Wait Until"
        inputType="datetime"
        value={task.wait ?? null}
      />
      <hr />
      <h3 className={"pl-3 pt-2 " + vt323.className}>
        On Complete - Recurring Tasks
      </h3>
      <div className="space-y-4 p-3 pb-5">
        <p>
          When a task has been completed, you may wish this task to Recur, or
          Repeat.
        </p>
        <p>
          When the dishes are put away for example, I may wish this task to
          become available at 10am tomorrow, but due midnight, on the start of
          the following day.
        </p>
        <p>
          To do this, {"You'd"} set a wait time for <i className="font-bold">tomorrow+10hours</i> and a
          due date of <i className="font-bold">tomorrow+24hours</i>
        </p>
        <p>
          See{" "}
          <Link
            href="https://taskwarrior.org/docs/dates/#synonyms-hahahugoshortcode17s0hbhb"
            target="_blank"
            className={"text-blue-600 underline " + vt323.className}
          >
            Taskwarrior Synonyms
          </Link>{" "}
          for examples of this
        </p>
      </div>
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="completeRecurDue"
        displayName="Due"
        value={task.completeRecurDue ?? null}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="completeRecurWait"
        displayName="Wait"
        value={task.completeRecurWait ?? null}
      />

      <div
        style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
      >
        <button
          className="Button green"
          type="submit"
          disabled={editMutation.isPending}
          autoFocus
        >
          Save
        </button>
      </div>
    </form>
  );
}
