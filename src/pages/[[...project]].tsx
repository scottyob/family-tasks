import { type NextPage } from "next";
import React, {  } from "react";
import ProjectBar from "~/components/projectBar";
import TaskList from "~/components/lists/tasksList";
import { useRouter } from "next/router";


const Home: NextPage = () => {

  // TODO:  Need to parse the Project from the URL
  const router = useRouter();
  const project = router.query['project']?.[0] as string;

  return (
    <>
        <div>
          <ProjectBar currentProject={project} />
        </div>
        <div className="overflow-auto grow">
          <TaskList project={project} />
        </div>
    </>
  );
};

export default Home;
