import ProjectsList from "~/components/lists/projectsList";
import { api } from "~/utils/api";
import { vt323 } from "~/utils/fonts";
import StatusBar from "~/components/projectBar";

const className = {
  header: "flex w-full text-3xl font-bold text-green-800 " + vt323.className,
  btn: "border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500",
  btnGroup: "first:rounded-s-lg last:rounded-e-lg",
  btnInactive: "bg-white",
  btnSelected: "bg-gray-100",
};

export default function NavPage() {
  // Get a list of the users and the current user
  const allUsers = api.tasks.getUsers.useQuery().data;
  const currentUser = api.users.currentUser.useQuery().data;
  const context = api.useContext();
  const setUser = api.users.setUser.useMutation({
    onSuccess: () => {
      void context.invalidate();
    },
  });

  const loading = !allUsers || !currentUser;

  return (
    <div>
      {/* Header */}
      <div>
        <StatusBar currentProject="Inbox / Started / Due" />
      </div>

      <div className="p-4">
        <h2 className={"p-2 " + (loading ? "animate-pulse" : "")}>
          Current User
        </h2>
        <div
          className={"inline-flex rounded-md shadow-sm " + className.btnGroup}
          role="group"
        >
          {currentUser &&
            allUsers?.map((u) => (
              <button
                key={u}
                type="button"
                className={
                  className.btn +
                  " " +
                  (currentUser.name == u
                    ? className.btnSelected
                    : className.btnInactive)
                }
                onClick={() => {
                  // Set the current user to be the one we've got
                  setUser.mutate(u);
                }}
              >
                {u}
              </button>
            ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="p-4">
        <h2 className="p-2">Favorite Projects</h2>
        <ProjectsList />
      </div>
    </div>
  );
}
