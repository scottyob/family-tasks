import { type NextPage } from "next";
import React, {  } from "react";
import StatusBar from "~/components/statusbar";
import TaskList from "~/components/lists/tasksList";

import { useAppStore } from "~/utils/context";


const Home: NextPage = () => {
  // The selected group to filter tasks out for
  const state = useAppStore();

  return (
    <>
        <div>
          <StatusBar key={state.filterGroup?.id} />
        </div>
        <div className="overflow-auto grow">
          <TaskList group={state.filterGroup} />
        </div>
    </>
  );
};

export default Home;
