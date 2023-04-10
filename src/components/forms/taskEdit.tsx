import { Task } from ".prisma/client";
import { VscTrash } from "react-icons/vsc";
import { useTRPCForm } from "trpc-form";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { TaskEditInput } from "~/utils/inputs";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicInput, useZodForm } from "./zodForm";

interface Props {
  task?: Task;
  onRequestClose?: () => void;
}

export default function TaskEdit(props: Props) {
  const { task } = props;
  if (task == null) {
    return <></>;
  }

  // Delete task action
  const deleteMutation = api.tasks.delete.useMutation();
  const context = api.useContext();
  const didDelete = () => {
    if (task == null) {
      return;
    }
    deleteMutation.mutate(
      {
        id: task.id,
      },
      {
        onSuccess: () => {
          context.tasks.invalidate();
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
  if (allGroups.isLoading) {
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
      onSubmit={methods.handleSubmit(async (values) => {
        editMutation.mutate(values, {
          onSuccess: () => {
            props.onRequestClose?.();
            context.tasks.invalidate();
          },
          onError: (err) => {
            alert(err.message);
          },
        });
      })}
    >
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="title"
        value={task.title}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="notes"
        inputType="textarea"
        value={task.notes ?? ""}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="complete"
        value={task.complete}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="dueDate"
        value={task.dueDate}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="groupId"
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
        value={task.assignedToId}
        options={groupMembers}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="completionValue"
        value={task.completionValue}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="offsetValue"
        value={task.offsetValue}
      />
      <BasicInput
        schema={TaskEditInput}
        methods={methods}
        fieldName="offsetType"
        value={task.offsetType}
        options={
          new Map(
            Object.entries({
              Same: "Same",
              Increase: "Increase",
              Decrease: "Decrease",
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
