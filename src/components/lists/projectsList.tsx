import { api } from "~/utils/api";
import ListContainer from "./listContainer";
import { StandardListItem } from "./listItems";
import { useRouter } from "next/router";

export default function ProjectsList() {
  const router = useRouter();

  // Get a list of all the projects from the database
  const projectsQuery = api.tasks.getProjects.useQuery();
  const loading = projectsQuery.isLoading;

  // Generate our list of projects
  let projectsJsx = null;
  if (projectsQuery.data) {
    const projects = projectsQuery.data.sort();
    projectsJsx = projects.map((p) => (
      <StandardListItem
        key={p}
        text={p}
        selected={() => {
          void (async () => {
            await router.push(p);
          })();
        }}
      />
    ));
  }

  return <ListContainer isLoading={loading}>{projectsJsx}</ListContainer>;
}
