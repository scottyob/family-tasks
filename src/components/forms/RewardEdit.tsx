import { type Reward } from "@prisma/client";
import { BasicInput, useZodForm } from "./zodForm";
import { RewardEditInput } from "~/utils/inputs";
import { VscTrash } from "react-icons/vsc";
import { api } from "~/utils/api";

interface Props {
  reward?: Reward;
  onRequestClose?: () => void;
  createInsteadOfEdit?: boolean;
}

export default function RewardEdit(props: Props) {
  const { reward, createInsteadOfEdit } = props;
  const close = props.onRequestClose;

  // Mutations for updating
  const context = api.useContext();
  const onChange = () => {
    close ? close() : undefined;
    void context.rewards.invalidate();
    void context.users.invalidate();
  };
  const updateMutation = api.rewards.update.useMutation({
    onSuccess: onChange,
  });
  const deleteMutation = api.rewards.delete.useMutation({
    onSuccess: onChange,
  });
  const customRewardMutation = api.rewards.purchase.useMutation({
    onSuccess: onChange,
  });
  const loading =
    updateMutation.isLoading ||
    deleteMutation.isLoading ||
    customRewardMutation.isLoading;

  if (!createInsteadOfEdit && !reward) {
    throw new Error("Expected a reward if we're not creating a custom one");
  }

  // Edit Form
  const methods = useZodForm({
    schema: RewardEditInput,
    mode: "onChange",
    defaultValues: {
      id: reward?.id ?? "",
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        void methods.handleSubmit((values) => {
          debugger;
          // Log a custom expense
          if (createInsteadOfEdit) {
            debugger;
            customRewardMutation.mutate(
              {
                title: values.title,
                cost: values.purchaseValue,
              },
              {
                onError: (error) => {
                  alert(error);
                },
              }
            );
            return;
          }

          // Update an existing one
          updateMutation.mutate(values, {
            onError: (error) => {
              alert(error);
            },
          });
        })(event);
      }}
    >
      <BasicInput
        fieldName="title"
        displayName="Title"
        value={reward?.title ?? ""}
        schema={RewardEditInput}
        methods={methods}
      />
      <BasicInput
        fieldName="purchaseValue"
        displayName="Cost 🪙"
        value={reward?.purchaseValue ?? "10"}
        schema={RewardEditInput}
        methods={methods}
      />

      <div
        style={{ display: "flex", marginTop: 25, justifyContent: "flex-end" }}
      >
        {!props.createInsteadOfEdit && (
          <button
            className="Button text-red-700"
            disabled={loading}
            type="button"
            onClick={(event) => {
              // Delete button pushed
              event.preventDefault();
              deleteMutation.mutate({ id: reward?.id ?? "" });
            }}
          >
            <VscTrash className="inline" /> Delete Saved Reward
          </button>
        )}
        <button
          className="Button green"
          type="submit"
          disabled={loading}
          autoFocus
        >
          Save
        </button>
      </div>
    </form>
  );
}
