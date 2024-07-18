import { VscTrash } from "react-icons/vsc";
import { api } from "~/utils/api";
import { TaskEditInput } from "~/utils/inputs";
import { BasicInput, useZodForm } from "./zodForm";
import { type Task } from "~/utils/taskLib";

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

  if (allProjects.isLoading) {
    return <p>Loading...</p>;
  }

  // Build a list of projects to auto-complete
  const projectsMap = new Map();
  allProjects.data?.forEach((p) => {
    projectsMap.set(p, '');
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
      }}    >
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
      {/* <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="due"
        displayName="Due By"
        value={task.due ?? null}
      /> */}

      {/* TODO:  Typeahead for groups */}
      {/* <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="groupId"
        displayName="Group"
        value={task.groupId}
        options={allGroups.data?.reduce((map, obj) => {
          map.set(obj.id, obj.name);
          return map;
        }, new Map<string, string>())}
      /> */}

      {/* TODO:  Put back in task worth at some point */}
      {/* <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="completionValue"
        displayName="Worth 🪙"
        value={task.completionValue}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="offsetValue"
        displayName="Penalty 🪙"
        value={task.offsetValue}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="offsetType"
        displayName="Pentalty"
        value={task.offsetType}
        options={
          new Map(
            Object.entries({
              Same: "None",
              Increase: "🪙 Increase",
              Decrease: "🪙 Decrease",
            })
          )
        }
      /> */}

      <div
        style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
      >
        <button
          className="Button green"
          type="submit"
          disabled={editMutation.isLoading}
          autoFocus
        >
          Save
        </button>
      </div>
    </form>
  );
}
