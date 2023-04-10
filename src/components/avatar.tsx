import { Group, User } from '.prisma/client';

export function Avatar(props: { user: User, hideMoney?: boolean, size?: "s" | "l" }) {
    const money = props.hideMoney ? null : <div className="absolute p-1 top-0 right-0 bg-yellow-500/90 rounded-[12px]">{props.user.gold}</div>;
    let size = "";
    switch(props.size) {
        case "s":
            size = "w-10 h-10";
            break;
        case "l":
            size = "w-24 h-24";
            break;
    }

    return <div title={props.user.name ?? undefined} className="relative min-h-full justify-items-center place-items-center flex">
      {money}
      <img className={size + " rounded-full p-2 "} src={props.user?.image ?? undefined} alt={props.user?.name ?? undefined} />
    </div>
  }
  