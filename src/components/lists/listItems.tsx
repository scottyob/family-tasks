import { type Task, type User } from ".prisma/client";
import React from "react";
import { BiCheck } from "react-icons/bi";
import { HiOutlineCalendar } from "react-icons/hi2";
import { api } from "~/utils/api";
import { Avatar } from "../avatar";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { TaskWorth } from "~/utils/taskLib";
import { DateTime, Interval } from "luxon";

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
    const isComplete = !props.task.complete;
    let availableOn = undefined;

    // Calculate the date it's available on
    if (isComplete && props.task.availableInDays) {
      // Calculate the date this should be next available in.
      availableOn = DateTime.now()
        .plus({ days: Number(props.task.availableInDays) })
        .startOf("day")
        .toJSDate();
    }

    updateFlagged.mutate(
      {
        taskId: props.task.id,
        completed: isComplete,
        availableOn: availableOn,
      },
      {
        onSuccess: () => {
          void context.tasks.invalidate();
          void context.users.invalidate(); // Money values has changed
        },
      }
    );
  };

  // Task completion date shown
  let dueJsx = null;
  if (task.dueDate) {
    const now = DateTime.now();
    const dueDate = DateTime.fromSeconds(task.dueDate.getTime() / 1000); // task.dueDate
    const dueInPast = now > dueDate;
    const dueIn = dueInPast
      ? Interval.fromDateTimes(dueDate, now)
      : Interval.fromDateTimes(now, dueDate);
    let hours = dueIn.length("hours");
    hours = dueInPast ? -1 * hours : hours;

    // Human readable date string.  If two weeks out from today, just show the date
    const dueDateStr =
      Math.abs(hours) > 24 * 14
        ? dueDate.toLocaleString()
        : dueDate.toRelativeCalendar({ unit: "days" });

    let dateColor = "text-gray-400";
    if (hours < 0) {
      dateColor = "text-red-600";
      color = "bg-red-400 ";
    } else if (hours < 24) {
      dateColor = "text-orange-400";
      color = "bg-orange-400";
    } else if (hours < 48) {
      dateColor = "text-orange-400";
      color = "bg-orange-300";
    } else if (hours < 24 * 7) {
      // due this week
      color = "bg-amber-400";
    }
    dueJsx = (
      <div className={"flex space-x-1 text-xs font-bold " + dateColor}>
        <HiOutlineCalendar className="inline" size={16} />
        <div>Due {dueDateStr}</div>
      </div>
    );
  }

  // Task worth JSX
  const taskWorth = TaskWorth(task);

  let worth = <span>- 🪙{task.completionValue?.toString() || ""}</span>;
  if (taskWorth.penalty > 0) {
    worth = (
      <>
        <span>- 🪙{taskWorth.total?.toString()} </span>
        <div className="inline align-text-top text-[10px]">
          <span>({task.completionValue?.toString() || ""}</span>
          <span
            className={
              taskWorth.operator == "-" ? "text-red-600" : "text-green-500"
            }
          >
            {" "}
            {taskWorth.operator} {taskWorth.penalty}
          </span>
          )
        </div>
      </>
    );
  }
  if (taskWorth.total <= 0) {
    worth = <></>;
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
          <div className="grow flex-row">
            <div className={textColor}>
              {props.task.title} {worth}
            </div>
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
