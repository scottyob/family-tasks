import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import NavBar from "~/components/navbar";
import StatusBar from "~/components/statusbar";
import TaskList from "~/components/tasklist";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  

  return (
    <>
        <div>
          <StatusBar />
        </div>
        <div className="overflow-auto grow">
          <TaskList />
        </div>
    </>
  );
};

export default Home;
