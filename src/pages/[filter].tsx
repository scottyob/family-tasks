import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import NavBar from "~/components/navbar";
import StatusBar from "~/components/statusbar";
import TaskList from "~/components/tasklist";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  // The selected group to filter tasks out for
  const [selectedGroup, setSelectedGroup] = React.useState<string | undefined>();

  return (
    <>
        <div>
          <StatusBar setSelectedGroup={setSelectedGroup} />
        </div>
        <div className="overflow-auto grow">
          <TaskList />
        </div>
    </>
  );
};

export default Home;
