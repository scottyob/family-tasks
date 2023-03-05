import { Group } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import EditGroup from "../forms/editGroup";
import ListContainer from "./listContainer";
import StandardListItem from "./standardListItem";

export default function EditGroupsList() {
    const groups = api.users.groups.useQuery();
    const groupAddMutation = api.users.createGroup.useMutation();
    const [errorMessage, setErrorMessage] = useState<string | undefined>()

    // For being able to edit the group
    const [groupModal, setGroupModal] = useState<Group | undefined>();
    const [groupModalShown, setGroupModalShown] = useState(false);

    let groupItems = null;

    if (groups != null) {
        groupItems = groups.data?.map((g) =>
            <StandardListItem key={g.id} text={g.name} selected={() => {
                // User has selected a group from the list
                setGroupModal(g);
                setGroupModalShown(true);
            }} />
        )
    }

    // Callback when a group is created
    const context = api.useContext();
    const createGroup = (name: string, reset: () => void) => {
        groupAddMutation.mutate({
            name: name
        }, {
            onSuccess: () => {
                context.users.groups.invalidate();
                setErrorMessage(undefined);
                reset();
            },
            onError(error) {
                setErrorMessage(error.message);
            },

        })
    }

    // Open the edit dialogue if the group is set
    let editModal = <></>;
    if(groupModal !== undefined) {
        editModal = <EditGroup key={groupModal?.id} group={groupModal} shown={groupModalShown} setShown={setGroupModalShown} />
    }

    return (<>
        {editModal}
        <ListContainer
            addPlaceholder="Create a Group"
            callback={createGroup}
            error={errorMessage}>
            {groupItems}
        </ListContainer>
    </>);
}