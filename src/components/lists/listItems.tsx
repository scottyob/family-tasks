import { Task, User } from ".prisma/client";
import React from "react";
import { BiCheck } from "react-icons/bi";
import { HiOutlineCalendar } from "react-icons/hi2";
import { VscCircleLargeFilled } from "react-icons/vsc";
import { api } from "~/utils/api";
import { Avatar } from "../avatar";
const moment = require("moment");

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
  task: Task & {assignedTo: User | null};
  onSelected?: () => void;
}

export function TaskListItem(props: CheckedListItemProps) {
  const updateFlagged = api.tasks.setCompleted.useMutation();
  const { task } = props;

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

  // Task Toggle
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

  // Task completion date shown
  let due = null;
  if (task.dueDate) {
    const timeDelta = moment(task.dueDate).fromNow();
    const hours = moment(task.dueDate).diff(moment(), "hours");
    // alert(days);
    let color = "text-gray-400";
    if (hours < 0) {
      color = "text-red-600";
    } else if (hours < 48) {
      color = "text-orange-400";
    }
    due = (
      <div className={"flex space-x-1 text-xs font-bold " + color}>
        <HiOutlineCalendar className="inline" size={16} />
        <div>Due {timeDelta}</div>
      </div>
    );
  }

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
          <div className="flex-row grow">
            <div className={textColor}>{props.task.title}</div>
            {task.notes ? (
              <div className="pb-2 pt-2 text-xs">{task.notes}</div>
            ) : null}
            {due}
          </div>
          <div className="min-h-full">
            {task.assignedTo ? <Avatar user={task.assignedTo} hideMoney={true} size="s" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
