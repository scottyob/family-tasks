import { Group } from "@prisma/client";
import { VT323 } from "next/font/google";
import React, { ReactNode, useState } from "react";
import { VscTrash } from "react-icons/vsc";
import Modal from 'react-modal';
import { api } from "~/utils/api";
import GroupMembersList from "../lists/groupMembersList";
import { ModalFormContainer, ModalProps } from "./modalFormContainer";

const vt323 = VT323({
    weight: '400',
    subsets: ['latin'],
  })
  


interface Props extends ModalProps {
    // ...ModalProps,
    group: Group,
    modalShown?: (shown: boolean) => void,
}

export default function EditGroup(props: Props) {
    const headerClass = vt323.className + " text-2xl mb-2";
    const removeFromGroupMutation = api.users.removeMemberFromGroup.useMutation();
    const myUser = api.users.currentUser.useQuery();
    const context = api.useContext();

    return <ModalFormContainer {... props }>
        <div className="min-h-[400px] flex flex-col m-2">
            {/* Members list */}
            <h1 className={headerClass}>Edit Group: {props.group.name}</h1>
            <h2 className={"font-bold " + vt323.className}>Members:</h2>
            <div className="grow">
                <GroupMembersList groupId={props.group.id} />
            </div>

            {/* Rewards??? */}

            {/* Remove button */}
            <a href="" className="text-red-800" onClick={(event) => {
                event.preventDefault();
                const userId = myUser.data?.id;
                if(userId == undefined) {
                    return;
                }
                removeFromGroupMutation.mutate({
                    userId: userId,
                    groupId: props.group.id
                }, {
                    onSuccess: () => {
                        context.users.groupMembers.invalidate();
                        context.users.groups.invalidate();
                        if(props.modalShown) {
                            props.modalShown(false);
                        }
                    }
                })
            }}>
                <VscTrash className="inline" /> Remove Self From Group
            </a>
        </div>
    </ModalFormContainer>;
}