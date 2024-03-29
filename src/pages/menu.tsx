import Link from "next/link";
import UpdateUserForm from "~/components/forms/updateUserForm";
import EditGroupsList from "~/components/lists/editGroupsList";

function Group(props: { name: string, children?: React.ReactNode }) {
    return <div className="relative m-4">
        <div className="border-dotted border-2 border-indigo-600 p-2 m-2 b-1">
            <h2 className="absolute top-[-10px] left-4 bg-white">{props.name}</h2>
            <div className="mt-2">{props.children}</div>
        </div>
    </div>
}

export default function Menu() {
    return <div className="overflow-auto grow">
        {/* User settings */}
        <Group name="User Settings">
            <UpdateUserForm />
        </Group>
        <Group name="My Groups">
            <EditGroupsList />
        </Group>
        <div className="m-6">
            <Link href="/api/auth/signout">Sign Out</Link>
        </div>
    </div>
}