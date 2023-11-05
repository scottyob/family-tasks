import UserStats from "~/components/UserStats";
import { api } from "~/utils/api";
import { vt323 } from "~/utils/fonts";
import RewardsList from "~/components/lists/RewardsList";

const titleClass = vt323.className + " text-center text-lg";

export default function Purchases() {
  const user = api.users.currentUser.useQuery().data;
  const stats = user ? <UserStats user={user} /> : <></>;

  return (
    <>
      <div className={titleClass}>Spend your $$$</div>
      <div>{stats}</div>
      <div className="grow overflow-auto">
        <RewardsList />
      </div>
    </>
  );
}
