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


const Home: NextPage = () => {
  // The selected group to filter tasks out for
  const router = useRouter();
  const {filter, group: groupArray} = router.query;

  const [selectedGroup, setSelectedGroup] = React.useState<Group | undefined>();
  const selectedGroupId = Array.isArray(groupArray) ? groupArray[0] : undefined;
  // debugger;

  const updateGroup = (group: (Group | undefined)) => {
    let url = '/' + filter;
    if(group !== undefined) {
      url += '/' + group.id;
    }
    router.push(url, undefined, { shallow: true });
    setSelectedGroup(group);
  }

  const taskType = filter as TaskType ?? TaskType.Task

  return (
    <>
        <div>
          <StatusBar selectedGroupId={selectedGroupId} setSelectedGroup={updateGroup} />
        </div>
        <div className="overflow-auto grow">
          <TaskList group={selectedGroup} type={taskType} />
        </div>
    </>
  );
};

export default Home;
