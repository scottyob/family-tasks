import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import NavBar from "~/components/navbar";
import StatusBar from "~/components/statusbar";
import TaskList from "~/components/lists/tasksList";

import { api } from "~/utils/api";
import { Group } from ".prisma/client";
import { TaskType } from "~/utils/enums";
import { useRouter } from "next/router";
import { FilterContext } from "~/utils/context";


const Home: NextPage = () => {
  // The selected group to filter tasks out for
  const {group, filterType} = React.useContext(FilterContext);
  const taskType = filterType as TaskType ?? TaskType.Task;

  return (
    <>
        <div>
          <StatusBar key={group} />
        </div>
        <div className="overflow-auto grow">
          <TaskList groupId={group} type={taskType} />
        </div>
    </>
  );
};

export default Home;
