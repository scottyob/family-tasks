import { api } from "~/utils/api";
import ListContainer from "./listContainer";
import StandardListItem from "./standardListItem";

export default function GroupMembersList(props: { groupId: string }) {
    const membersQuery = api.users.groupMembers.useQuery({ id: props.groupId });
    const addMemberMutation = api.users.addMemberToGroup.useMutation();

    // Render the group members
    let members = <></>;
    if (membersQuery.data !== undefined) {
        const memberItems = membersQuery.data.map(m =>
            <StandardListItem text={m.id} />
        )
        members = <div>{memberItems}</div>
    }

    // add member callback
    const context = api.useContext();
    const addMemberCallback = (name: string) => {
        addMemberMutation.mutate({
            groupId: props.groupId,
            userId: name
        }, {
            onSuccess: () => {
                context.users.groupMembers.invalidate();
            }
        });
    }

    return <ListContainer
        additionalClassNames={membersQuery.isLoading ? "animate-pulse" : ""}
        addPlaceholder="Add a Member"
        callback={addMemberCallback}
        error={addMemberMutation.error?.message}
    >
        {members}
    </ListContainer>
}