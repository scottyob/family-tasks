import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import NavBar from "~/components/navbar";
import StatusBar from "~/components/statusbar";
import TaskList from "~/components/lists/tasksList";

import { api } from "~/utils/api";
import { Group } from ".prisma/client";
import { TaskType } from "~/utils/enums";


const Home: NextPage = () => {
  // The selected group to filter tasks out for
  const [selectedGroup, setSelectedGroup] = React.useState<Group | undefined>();

  return (
    <>
        <div>
          <StatusBar setSelectedGroup={setSelectedGroup} />
        </div>
        <div className="overflow-auto grow">
          <TaskList group={selectedGroup} type={TaskType.Task} />
        </div>
    </>
  );
};

export default Home;
