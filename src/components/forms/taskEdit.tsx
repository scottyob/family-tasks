import { type Task } from ".prisma/client";
import { VscTrash } from "react-icons/vsc";
import { api } from "~/utils/api";
import { TaskEditInput } from "~/utils/inputs";
import { BasicInput, useZodForm } from "./zodForm";

interface Props {
  task: Task;
  onRequestClose?: () => void;
}

export default function TaskEdit(props: Props) {
  const { task } = props;


  // Delete task action
  const deleteMutation = api.tasks.delete.useMutation();
  const context = api.useContext();
  const didDelete = () => {
    deleteMutation.mutate(
      {
        id: task.id,
      },
      {
        onSuccess: () => {
          void context.tasks.invalidate();
          if (props.onRequestClose != null) {
            props.onRequestClose();
          }
        },
      }
    );
  };

  // Edit task
  const allGroups = api.users.groups.useQuery();
  const allGroupMembers = api.users.groupMembers.useQuery({ id: task.groupId });


  const editMutation = api.tasks.edit.useMutation();
  const methods = useZodForm({
    schema: TaskEditInput,
    mode: "onChange",
    defaultValues: {
      id: task.id,
    },
  });
  if (task == null || allGroups.isLoading) {
    return <p>Loading...</p>;
  }

  // Group members
  const groupMembers = allGroupMembers.data?.reduce((map, obj) => {
    map.set(obj.id, obj.name ?? "");
    return map;
  }, new Map<string, string>()) ?? new Map<string, string>();
  groupMembers.set("", "---");

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
        fieldName="title"
        displayName="Title"
        value={task.title}
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
        fieldName="complete"
        displayName="Complete"
        value={task.complete}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="dueDate"
        displayName="Due By"
        value={task.dueDate ?? null}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="groupId"
        displayName="Group"
        value={task.groupId}
        options={allGroups.data?.reduce((map, obj) => {
          map.set(obj.id, obj.name);
          return map;
        }, new Map<string, string>())}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="assignedToId"
        displayName="Assigned"
        value={task.assignedToId}
        options={groupMembers}
      />
      <BasicInput
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
      />

      <div
        style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
      >
        <button className="Button text-red-700" onClick={didDelete}>
          <VscTrash className="inline" /> Delete Task
        </button>
        <button
          className="Button green"
          type="submit"
          disabled={editMutation.isLoading}
        >
          Save
        </button>
      </div>
    </form>
  );
}
