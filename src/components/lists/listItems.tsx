import { type User } from ".prisma/client";
import React, { type ReactElement } from "react";
import { BiCheck, BiMenu } from "react-icons/bi";
import { HiOutlineCalendar } from "react-icons/hi2";
import { FaRunning, FaCubes, FaInbox } from "react-icons/fa";
import { FaPersonDigging } from "react-icons/fa6";
import { api } from "~/utils/api";
import Markdown from "react-markdown";
import { Task } from "~/utils/taskLib";
import { DateTime, Interval } from "luxon";

interface Props {
  text: string;
  selected?: () => void;
  color?: "red" | "blue" | "green" | "gray" | "gold" | "goldish";
  value?: number;
  leftInteractive?: ReactElement;
  leftInteractiveClicked?: () => void;
  loading?: boolean;
}

export function StandardListItem(props: Props) {
  // sets the list item text color
  let bgColor = "white";
  let textColor = "black";

  switch (props.color) {
    case "red":
      bgColor = "bg-red-400";
      break;
    case "green":
      bgColor = "bg-green-400";
      break;
    case "gold":
      bgColor = "bg-yellow-400";
      break;
    case "goldish":
      bgColor = "bg-yellow-400/40";
      break;
    case "blue":
      bgColor = "bg-blue-400";
      break;
    case "gray":
      bgColor = "bg-gray-400";
      textColor = "text-gray-400";
      break;
  }

  // Creates a coin/worth associated with the list item
  let worthElement = <></>;
  if (props.value) {
    worthElement = <span>- 🪙{props.value.toString()}</span>;
  }

  const outerClassName =
    "m-0.5 flex min-h-[60px]" + (props.loading ? " animate-pulse" : "");
  return (
    <div className={outerClassName}>
      {/* Left container */}
      <div
        className={
          "flex min-w-[40px] place-items-center justify-center rounded-l-lg transition-all duration-500 " +
          bgColor
        }
        onClick={props.leftInteractiveClicked}
      >
        {/* Left Button */}
        <div className="in-w-[20px] min-h-[20px] bg-gray-200/40">
          {props.leftInteractive}
        </div>
      </div>

      {/* Text container */}
      <div
        className="flex grow rounded-r-lg bg-gray-50 p-2"
        onClick={() => {
          if (props.selected != null) {
            props.selected();
          }
        }}
      >
        <div className="flex grow place-self-center">
          <div className="frow flex-row">
            <div className={textColor}>
              {props.text} {worthElement}
            </div>
          </div>
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
  const updateFlagged = api.tasks.setComplete.useMutation();
  const { task } = props;

  let textColor = "";
  let leftIcon = <></>;

  let color = "bg-red-400 ";
  color = "bg-blue-400";
  color = "bg-gray-300";
  // color = 'bg-gray-400';

  if (task.status == "completed") {
    leftIcon = <BiCheck size={20} />;
    textColor = "text-gray-400";
    color = "bg-gray-400";
  } else if (task.status == "waiting") {
    textColor = "text-gray-400";
    color = "bg-gray-400";
  }

  // Task Toggle
  const context = api.useContext();
  const toggleFlagged = () => {
    // If the task is already complete, flag it as not
    const isComplete = task.status == "completed" ? false : true;

    // Update the task, then invalidate
    updateFlagged.mutate(
      {
        taskUuid: props.task.uuid as string,
        complete: isComplete,
      },
      {
        onSuccess: () => {
          void context.tasks.invalidate();
        },
      },
    );
  };

  // Task completion date shown
  let dueJsx = null;
  if (task.status == "waiting" || (task.due && task.status == "pending")) {
    const now = DateTime.now();
    let dueDate: DateTime<true> | DateTime<false> = DateTime.now();
    if (task.status == "waiting" && task.wait) {
      dueDate = DateTime.fromISO(task.wait);
    } else if (task.due) {
      dueDate = DateTime.fromISO(task.due); // task.dueDate
    }
    const dueInPast = now > dueDate;
    const dueIn = dueInPast
      ? Interval.fromDateTimes(dueDate, now)
      : Interval.fromDateTimes(now, dueDate);
    let hours = dueIn.length("hours");
    hours = dueInPast ? -1 * hours : hours;

    // Human readable date string.  If two weeks out from today, just show the date
    let dueDateStr = "";
    if (Math.abs(hours) > 24 * 14) {
      dueDateStr = dueDate.toLocaleString();
    } else if (Math.abs(hours) > 24) {
      dueDateStr = dueDate.toRelativeCalendar({ unit: "days" }) as string;
    } else if (Math.abs(hours) > 1) {
      dueDateStr = dueDate.toRelativeCalendar({ unit: "hours" }) as string;
    } else {
      dueDateStr = dueDate.toRelativeCalendar({ unit: "minutes" }) as string;
    }

    // Set the color based on how recent the task is
    let dateColor = "text-gray-400";
    if (task.status == "waiting") {
      color = "bg-slate-400";
    } else if (hours < 0) {
      dateColor = "text-red-600";
      color = "bg-red-400 ";
    } else if (hours < 24) {
      dateColor = "text-orange-400";
      color = "bg-red-400/80 ";
    } else if (hours < 48) {
      dateColor = "text-orange-400";
      color = "bg-orange-400/70 ";
    } else if (hours < 24 * 7) {
      // due this week
      color = "bg-orange-400/50 ";
    }
    dueJsx = (
      <div
        className={"flex space-x-1 " + dateColor}
        title={dueDate.toLocaleString()}
      >
        <HiOutlineCalendar className="inline" size={16} />
        <div>
          {task.status == "waiting" ? "Available" : "Due"} {dueDateStr}
        </div>
      </div>
    );
  }

  // Change the background color if the task has been "Started"
  let bgColor = "bg-gray-50";
  if (task.start) {
    bgColor = "bg-green-200/40";
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
        <div className={"min-h-[20px] min-w-[20px] bg-gray-200/40"}>
          {leftIcon}
        </div>
      </div>

      {/* Text container */}
      <div
        className={"flex grow rounded-r-lg p-2 " + bgColor}
        onClick={() => {
          if (props.onSelected) {
            props.onSelected();
          }
        }}
      >
        {/* Main task information */}
        <div className="flex grow place-self-center">
          <div className="grow flex-row">
            <div className={textColor}>
              {task.id}: {task.description}
            </div>
            {task.notes ? (
              <div className="prose pb-2 pt-2 text-xs">
                <Markdown>{task.notes}</Markdown>
              </div>
            ) : null}

            {/* Below task, status info */}
            <div className="flex space-x-4 text-xs font-bold text-gray-500">
              {dueJsx}

              {/* Started Status */}
              {task.start ? (
                <div className="flex space-x-1 text-green-800">
                  <FaRunning className="inline" size={16} />
                  <div>Started</div>
                </div>
              ) : null}

              {/* Project Status */}
              <div className="flex space-x-1">
                {task.project ? (
                  <FaCubes className="inline" size={16} />
                ) : (
                  <FaInbox className="inline" size={16} />
                )}
                <div>{task.project ?? "Inbox"}</div>
              </div>

              {/* Owner Status */}
              {(task.status == "pending" || task.status == "waiting") &&
                task.assignedTo && (
                  <div className="flex space-x-1">
                    <FaPersonDigging className="inline" size={16} />
                    <div>{task.assignedTo}</div>
                  </div>
                )}
            </div>
          </div>

          {/* Right hand side */}
          <div className="flex min-h-full">
            <BiMenu className="self-center" />
          </div>
        </div>
      </div>
    </div>
  );
}
