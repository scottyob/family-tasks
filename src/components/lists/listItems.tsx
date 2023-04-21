import { type Task, type User } from ".prisma/client";
import React from "react";
import { BiCheck } from "react-icons/bi";
import { HiOutlineCalendar } from "react-icons/hi2";
import { api } from "~/utils/api";
import { Avatar } from "../avatar";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import moment from "moment";

interface Props {
  text: string;
  selected?: () => void;
}

export function StandardListItem(props: Props) {
  return (
    <div
      className="m-0.5 flex min-h-[40px]"
      onClick={() => {
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
  task: Task & { assignedTo: User | null };
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
          void context.tasks.invalidate();
          void context.users.invalidate();  // Money values has changed
        },
      }
    );
  };

  // Task completion date shown
  let dueJsx = null;
  if (task.dueDate) {
    const due = moment(task.dueDate.toISOString().slice(0, 10)).endOf("day");
    console.log("Due", due);
    const timeDelta = due.fromNow();
    const hours = due.diff(moment(), "hours");
    let color = "text-gray-400";
    if (hours < 0) {
      color = "text-red-600";
    } else if (hours < 48) {
      color = "text-orange-400";
    }
    dueJsx = (
      <div className={"flex space-x-1 text-xs font-bold " + color}>
        <HiOutlineCalendar className="inline" size={16} />
        <div>Due {timeDelta}</div>
      </div>
    );
  }

  // Task worth JSX
  const worth = `- 🪙${task.completionValue?.toString() || ''}`;


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
          <div className="grow flex-row">
            <div className={textColor}>{props.task.title} {worth}</div>
            {task.notes ? (
              <div className="prose pb-2 pt-2 text-xs">
                <ReactMarkdown>{task.notes}</ReactMarkdown>
              </div>
            ) : null}
            {dueJsx}
          </div>
          <div className="min-h-full">
            {task.assignedTo ? (
              <Avatar user={task.assignedTo} hideMoney={true} size="s" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
