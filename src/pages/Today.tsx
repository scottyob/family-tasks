import StatusBar from "~/components/projectBar";
import TaskList from "~/components/lists/tasksList";

export default function Today() {
    return (
        <>
            <div>
              <StatusBar currentProject="Inbox / Started / Due" />
            </div>
            <div>
              <TaskList filterUserFavorites={true} title="Inbox" />
            </div>
        </>
      );
    
}