import { type User } from "@prisma/client";
import { Avatar } from "./avatar";
import { vt323 } from "~/utils/fonts";

function Stat(props: { name: string; value: string }) {
  return (
    <div className="transition">
      <strong>{props.name}:{" "}</strong>
      {props.value}
    </div>
  );
}

export default function UserStats(props: { user: User }) {
  const user = props.user;

  return (
    <div className={"flex m-auto text-xl " + vt323.className}>
      <Avatar user={user} hideMoney={true} />
      <div className="text-left">
        <Stat name="Name" value={user.name ?? ""} />
        <Stat name="💰" value={user.gold.toString()} />
      </div>
    </div>
  );
}
