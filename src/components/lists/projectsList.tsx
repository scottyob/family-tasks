import { api } from "~/utils/api";
import ListContainer from "./listContainer";
import { StandardListItem } from "./listItems";
import { useRouter } from "next/router";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FavoriteProject } from "~/utils/taskLib";

function ProjectListItem(props: { project: string; userFavorites: FavoriteProject[] }) {
  const router = useRouter();
  const favoriteMutation = api.users.setFavorites.useMutation();
  const context = api.useContext();

  // Get the current favorites from the user's profile
  const favoriteSetting = props.userFavorites.find(f => f.projectName == props.project);
  let color: "gray" | "gold" | "goldish" = "gray";
  let interactiveIcon = <FaRegStar size={20} className="text-gray-600" />
  if (favoriteSetting?.showInHome) {
    interactiveIcon = <FaRegStar size={20} className="text-yellow-800" />
    color = "gold";
  }
  else if(favoriteSetting) {
    interactiveIcon = <FaRegStar size={20} className="text-yellow-800" />
    color = "goldish";
  }

  return (
    <StandardListItem
      key={props.project}
      text={props.project}
      loading={favoriteMutation.isLoading}
      leftInteractive={
        interactiveIcon
      }
      color={color}
      selected={() => {
        void (async () => {
          await router.push(props.project);
        })();
      }}
      leftInteractiveClicked={() => {
        // Update our favorites list and call them
        let newFavorites = [...props.userFavorites];
        
        // Change it from nothing, to favorite
        if(!favoriteSetting) {
          newFavorites.push({
            projectName: props.project,
          })
        } else if(!favoriteSetting.showInHome)
        {
          favoriteSetting.showInHome = true;
        } else {
          // Delete it from our favorites all together
          newFavorites = newFavorites.filter(p => p.projectName != props.project)
        }
        favoriteMutation.mutate(newFavorites, {
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
