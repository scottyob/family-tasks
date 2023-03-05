import { useMemo, useState } from "react";
import { api } from "~/utils/api";

export default function UpdateUserForm() {
    const [userName, setUserName] = useState("");
    const user = api.users.currentUser.useQuery().data;
    const nameMutation = api.users.setName.useMutation();
    useMemo(() => {
        setUserName(user?.name ?? '');
    }, [user]);

    const textClass = `mt-1 
    block
    w-full
    rounded-md
    border-gray-300
    shadow-sm
    focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`;

    return <form onSubmit={(event) => {
        nameMutation.mutate({ name: userName });
        event.preventDefault()
    }
    }>
        <label className="block">
            <span className="text-gray-700">ID</span>
            <input
                disabled={true}
                type="text" id="name" value={user?.id ?? ''} name="name" className={textClass + " bg-gray-200"} />
        </label>

        <label className="block">
            <span className="text-gray-700">Name</span>
            <input
                onChange={(event) => {
                    setUserName(event.target.value);
                }}
                disabled={nameMutation.isLoading}
                type="text" id="name" value={userName} name="name" className={textClass} />
        </label>
        <div className="grid">
            <input type="submit" value="Save" className="justify-self-end bg-green-400 rounded p-1 m-1 " />
        </div>
    </form>

}
