import { api } from "~/utils/api";
import ListContainer from "./listContainer";
import { StandardListItem } from "./listItems";
import { useRouter } from "next/router";
import { FaRegStar, FaStar } from "react-icons/fa";

function ProjectListItem(props: { project: string; userFavorites: string[] }) {
  const router = useRouter();
  const favoriteMutation = api.users.setFavorites.useMutation();
  const context = api.useContext();

  // Get the current favorites from the user's profile
  const favorites = new Set(props.userFavorites);
  const p = props.project;
  const favorite = favorites.has(p);

  return (
    <StandardListItem
      key={p}
      text={p}
      loading={favoriteMutation.isLoading}
      leftInteractive={
        favorites.has(p) ? <FaStar size={20} className="text-yellow-800" /> : <FaRegStar size={20} className="text-gray-600" />
      }
      color={favorite ? "gold" : "gray"}
      selected={() => {
        void (async () => {
          await router.push(p);
        })();
      }}
      leftInteractiveClicked={() => {
        // Update our favorites list and call them
        const setFavorite = !favorite;
        const newFavorites = new Set(favorites);
        if(!setFavorite) {
          newFavorites.delete(p);
        } else {
          newFavorites.add(p);
        }
        favoriteMutation.mutate({favorites: [...newFavorites].sort()}, {
          onSuccess: () => {
            void context.users.invalidate();
          }
        })
      }}
    />
  );
}

export default function ProjectsList() {
  // Get a list of all the projects from the database
  const projectsQuery = api.tasks.getProjects.useQuery();

  // Get the current user
  const user = api.users.currentUser.useQuery().data;

  // Generate our list of projects
  const loading = !(projectsQuery.data && user);
  let projectsJsx = null;
  if (!loading) {
    const favorites = JSON.parse(user.favoriteProjects ?? "[]") as string[];

    const projects = projectsQuery.data.sort();
    projectsJsx = projects.map((p) => (
      <ProjectListItem key={p} project={p} userFavorites={favorites} />
    ));
  }

  return <ListContainer isLoading={loading}>{projectsJsx}</ListContainer>;
}
