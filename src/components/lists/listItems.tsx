import { Task } from ".prisma/client";
import React from "react";
import { BiCheck } from "react-icons/bi";
import { VscCircleLargeFilled } from "react-icons/vsc";
import { api } from "~/utils/api";

interface Props {
  text: string;
  selected?: () => void;
}

export function StandardListItem(props: Props) {
  return (
    <div
      className="m-0.5 flex min-h-[40px]"
      onClick={(e) => {
        if (props.selected != null) {
          props.selected();
        }
      }}
    >
      {/* Text container */}
      <div className="flex grow rounded-lg bg-white p-2">
        <div className="flex grow place-self-center">
          <div className="">{props.text}</div>
        </div>
      </div>
    </div>
  );
}

interface CheckedListItemProps {
  task: Task;
  onSelected?: () => void;
}

export function TaskListItem(props: CheckedListItemProps) {
  const updateFlagged = api.tasks.setCompleted.useMutation();

  let textColor = "";
  let leftIcon = <></>;

  let color = "bg-red-400 ";
  color = "bg-blue-400";
  color = "bg-green-400";
  // color = 'bg-gray-400';

  if (props.task.complete) {
    leftIcon = <BiCheck size={20} />;
    textColor = "text-gray-400";
    color = "bg-gray-400";
  }

  const context = api.useContext();
  const toggleFlagged = () => {
    updateFlagged.mutate(
      {
        taskId: props.task.id,
        completed: !props.task.complete,
      },
      {
        onSuccess: () => {
        context.tasks.invalidate();
        },
      }
    );
  };

  return (
    <div className="m-0.5 flex min-h-[60px]">
      {/* Left priority & done button */}
      <div
        className={
          "flex min-w-[40px] place-items-center justify-center rounded-l-lg transition-all duration-500 " +
          color
        }
        onClick={toggleFlagged}
      >
        <div className="min-h-[20px] min-w-[20px] bg-gray-200/40">
          {leftIcon}
        </div>
      </div>

      {/* Text container */}
      <div
        className="flex grow rounded-r-lg bg-gray-50 p-2"
        onClick={() => {
          if (props.onSelected) {
            props.onSelected();
          }
        }}
      >
        <div className="flex grow place-self-center">
          <div className={textColor}>{props.task.title}</div>
        </div>
      </div>
    </div>
  );
}
