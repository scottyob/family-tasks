import Link from "next/link";
import { useRouter } from "next/router";
import { FaHome } from "react-icons/fa";
import TaskEdit from "~/components/forms/taskEdit";
import { api } from "~/utils/api";
import { vt323 } from "~/utils/fonts";

const className = {
  container: "p-4 lg:max-w-lg self-center",
  header: "flex w-full text-3xl font-bold text-green-800 " + vt323.className,
  loading: "",
};

export default function EditTask() {
  const router = useRouter();
  const { uuid } = router.query;

  const tasksQuery = api.tasks.get.useQuery({});
  const task = tasksQuery.data?.find((t) => t.uuid == uuid);

  return (
    <div className={className.container}>
      {/* Header */}
      <div className={className["header"]}>
        <div className="p-4 pl-8">
          <Link href="/Today">
            <FaHome />
          </Link>
        </div>
        <div
          className={
            "flex-grow justify-self-center p-4 text-center" +
            (!task ? " loading" : "")
          }
        >
          {task ? `${task.id?.toString() ?? ""}: ${task.description ?? ""}` : "Loading..."}
        </div>
      </div>

      {/* Task Edit */}
      {task && <TaskEdit task={task} onRequestClose={() => {
        if (window.history?.length && window.history.length > 1) {
          router.back();
        } else {
          void router.replace("/");
        }
      }} />}
    </div>
  );
}
