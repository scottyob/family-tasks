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

      {/* Custom form element for setting up recuring */}
      <fieldset className="Fieldset">
        <label className="Label block">Recurring</label>
        <div className="relative mt-2 rounded-md shadow-sm">
          {/* Recuring days */}
          <input type="number" {...methods.register("repeatDays")} className="Input w-full pr-20" placeholder="days" defaultValue={task.repeatDays?.toString()} />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label className="sr-only">RecurringType</label>
            {/* Type dropdown */}
            <select id="recurringType" defaultValue={task.recurringType} {...methods.register("recurringType")} className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
              <option>Once</option>
              <option>From Due Date</option>
              <option>After Completion</option>
            </select>
          </div>
        </div>
      </fieldset>
      <div>
        {methods.formState.errors.repeatDays?.message && <p className="text-red-700">{methods.formState.errors.repeatDays?.message}</p>}
      </div>


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
          autoFocus
        >
          Save
        </button>
      </div>
    </form>
  );
}
