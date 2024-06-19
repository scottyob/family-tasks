import { type Task } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function TaskDetails(props: { task: Task, onClose: () => void }) {
  return (
    <Dialog.Root open={true} onOpenChange={(open) => {
        if(!open) {
            props.onClose();
        }
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">
            {props.task.title}
          </Dialog.Title>

          <button className="rounded-xl bg-blue-300 p-2 m-2 block w-full">Complete On</button>
          <button className="rounded-xl bg-blue-300 p-2 m-2 block w-full">Edit</button>
          <button className="rounded-xl bg-blue-300 p-2 m-2 block w-full">History</button>

          <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
