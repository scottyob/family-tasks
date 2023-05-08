import StatusBar from "~/components/statusbar";
import TaskList from "~/components/lists/tasksList";

export default function Today() {
    return (
        <>
            <div>
              <StatusBar />
            </div>
            <div className="overflow-auto grow">
              <TaskList filterToday={true} allAvailable={true} />
            </div>
        </>
      );
    
}