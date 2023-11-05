import { api } from "~/utils/api";
import ListContainer from "./listContainer";
import { StandardListItem } from "./listItems";
import { BiCoin } from "react-icons/bi";
import { type Reward } from "@prisma/client";
import React from "react";
import { ModalFormContainer } from "../forms/modalFormContainer";
import RewardEdit from "../forms/RewardEdit";
import { vt323 } from "~/utils/fonts";

//A list of rewards that the user can purchase
export default function RewardsList() {
  // Fetch the rewards from the database
  const rewards = api.rewards.all.useQuery();

  // trpc call/mutation to make purchase
  const purchaseMutation = api.rewards.purchase.useMutation();
  const createMutation = api.rewards.create.useMutation();
  const context = api.useContext();

  // Edit a saved reward components
  const [modifyReward, setModifyReward] = React.useState<Reward | undefined>();
  let editModal = <></>;
  if (modifyReward !== undefined) {
    editModal = (
      <RewardEdit
        reward={modifyReward}
        onRequestClose={() => {
          setModifyReward(undefined);
        }}
      />
    );
  }

  // Custom reward form
  const [customRewardShown, setCustomRewardShown] = React.useState(false);
  const customModal = (
    <ModalFormContainer
      setShown={setCustomRewardShown}
      shown={customRewardShown}
      title="One-Off Custom Reward"
    >
      <RewardEdit
        createInsteadOfEdit={true}
        onRequestClose={() => setCustomRewardShown(false)}
      />
    </ModalFormContainer>
  );

  // Render
  const containerStyle = "p-2";
  return (
    <>
      {customModal}
      <ModalFormContainer
        shown={modifyReward !== undefined}
        setShown={(isShown) => {
          if (!isShown) {
            setModifyReward(undefined);
          }
        }}
      >
        {editModal}
      </ModalFormContainer>

      <div
        className={
          "flex flex-col items-center justify-center text-xl " + vt323.className
        }
      >
        <button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={() => {setCustomRewardShown(true)}}
        >
          Log Custom Reward
        </button>
        <div className="p-3">OR</div>
      </div>

      <div className={containerStyle}>
        <ListContainer
          addPlaceholder="Create a Reward Template"
          isLoading={rewards.isFetching || rewards.isLoading}
          callback={(name, done) => {
            // User added a new reward
            createMutation.mutate(
              {
                title: name,
                value: 10, // Default to 10 coind
              },
              {
                onSuccess: () => {
                  done();
                  void context.rewards.invalidate();
                },
              }
            );
          }}
        >
          {rewards.data
            ? rewards.data.map((r) => {
                // Every reward

                // The "purchase" button on the left
                let leftIcon = undefined;
                if (r.affordable) {
                  leftIcon = <BiCoin size={20} />;
                }

                const buy = () => {
                  // Purchase the reward
                  purchaseMutation.mutate(
                    {
                      title: r.title,
                      cost: Number(r.purchaseValue),
                    },
                    {
                      onSuccess: () => {
                        void context.users.invalidate();
                        void context.rewards.invalidate();
                      },
                    }
                  );
                };

                // Render the reward list
                return (
                  <StandardListItem
                    key={r.id}
                    text={r.title}
                    value={Number(r.purchaseValue)}
                    color={
                      r.affordable && !rewards.isFetching ? "green" : "gray"
                    }
                    leftInteractive={leftIcon}
                    leftInteractiveClicked={r.affordable ? buy : undefined}
                    selected={() => {
                      setModifyReward(r);
                    }}
                  />
                );
              })
            : null}
        </ListContainer>
      </div>
    </>
  );
}
