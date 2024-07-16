import StatusBar from "~/components/projectBar";
import TaskList from "~/components/lists/tasksList";

export default function Today() {
    return (
        <>
            <div>
              <StatusBar currentProject="Started & Due" />
            </div>
            <div className="overflow-auto grow">
              <TaskList />
            </div>
        </>
      );
    
}