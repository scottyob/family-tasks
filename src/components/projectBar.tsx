import Link from "next/link";
import { FaBars, FaHome } from "react-icons/fa";
import { vt323 } from "~/utils/fonts";
import { ModalFormContainer } from "./forms/modalFormContainer";
import { useState } from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const className = {
  header: "flex w-full text-3xl font-bold text-green-800 " + vt323.className,
};

export default function ProjectBar(props: { currentProject: string }) {
  // Modal container to pick the favorite project
  const [projectWindowShown, setProjectWindowShown] = useState<boolean>(false);
  const user = api.users.currentUser.useQuery().data;
  const router = useRouter();

  let projectWindow = null;

  if (user) {
    const projects = (
      JSON.parse(user.favoriteProjects ?? "[]") as string[]
    ).sort();

    const projectToLink = (isHome: boolean, p: string, title?: string) => (
      <div
        key={p}
        className={
          "m-4 rounded-lg p-3 text-center text-xl " +
          vt323.className + 
          (isHome ? " bg-yellow-100 " : " bg-slate-200 ")
        }
        onClick={() => {
          setProjectWindowShown(false);
          void (async () => {
            await router.push(p);
          })();
        }}
      >
        {title ?? p}
      </div>
    );
      

    const projectsJsx = [
      projectToLink(true, "/", "Inbox, Tasks Started & Due"),
      ...projects.map((p) => projectToLink(false, p))
    ];

    projectWindow = (
      <ModalFormContainer
        shown={projectWindowShown}
        setShown={setProjectWindowShown}
        descriptionHidden={true}
      >
        {projectsJsx}
      </ModalFormContainer>
    );
  }

  return (
    <>
      {projectWindow}
      <div className={className["header"]}>
        <div className="p-4 pl-8">
          <Link href="/Today">
            <FaHome />
          </Link>
        </div>
        <div className="grow p-4 text-center">
          <span onClick={() => setProjectWindowShown(true)}>
            {props.currentProject}
          </span>
        </div>
        <div className="p-4 pr-8">
          <Link href="/Nav">
            <FaBars />
          </Link>
        </div>
      </div>
    </>
  );
}
