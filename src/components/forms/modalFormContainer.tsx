import React, { ReactNode, useState } from "react";
import Modal from 'react-modal';


interface ModalProps {
    shown: boolean;
    setShown: (isShown: boolean) => void;
    children?: ReactNode;
}

function ModalFormContainer(props: ModalProps) {
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    return <Modal ariaHideApp={false} style={customStyles} contentLabel="Label" isOpen={props.shown} onRequestClose={() => {
        props.setShown(false);
    }}>
        {props.children}
    </Modal>
}

export {
    ModalFormContainer
};
export type { ModalProps };
