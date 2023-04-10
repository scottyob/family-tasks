import React, { ReactNode, useState } from "react";
import Modal from "react-modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

interface ModalProps {
  shown: boolean;
  title?: string;
  setShown: (isShown: boolean) => void;
  children?: ReactNode;
}

function ModalFormContainer(props: ModalProps) {
  return (
    <Dialog.Root open={props.shown} onOpenChange={props.setShown}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          {props.title ? (
            <Dialog.Title className="DialogTitle">{props.title}</Dialog.Title>
          ) : null}
          <Dialog.Description className="DialogDescription">
            Make changes.  Click save when you're done.
          </Dialog.Description>

          {props.children}
          <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  // <Modal ariaHideApp={false} style={customStyles} contentLabel="Label" isOpen={props.shown} onRequestClose={() => {
  //     props.setShown(false);
  // }}>
  //     {props.children}
  // </Modal>
}

export { ModalFormContainer };
export type { ModalProps };
