import { api } from "~/utils/api";
import { useSpring, animated } from "react-spring";
import { Mousewheel, Pagination, Navigation } from "swiper";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { vt323 } from "~/utils/fonts";
import React from "react";
import { useRouter } from "next/router";
import { useAppStore } from "~/utils/context";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Avatar } from "./avatar";
import UserStats from "./UserStats";

const titleClass = vt323.className + " text-center text-lg";
type RouterOutput = inferRouterOutputs<AppRouter>;

function Name(props: { name: string }) {
  const springProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: {
      mass: 4.7,
      tension: 170,
      friction: 30,
      precision: 0.3,
      velocity: 0,
    },
  });

  return <animated.span style={springProps}>{props.name}</animated.span>;
}

function StatusSlide() {
  const user = api.users.currentUser.useQuery().data;

  let avatarSettings = <></>;
  if (user != null) {
    avatarSettings = <UserStats user={user} />;
  }

  return (
    <div className={titleClass}>
      <div>
        Hello <Name name={user?.name ?? "..."} />
      </div>
      <div className="flex grow">{avatarSettings}</div>
    </div>
  );
}

function GroupSlide(props: { group: RouterOutput["users"]["groups"][0] }) {
  const avatars = props.group.users.map((u) => (
    <Avatar key={u.user.id} user={u.user} />
  ));
  return (
    <div className={titleClass}>
      {props.group.name}
      <div className="flex justify-center space-x-4 pb-6">{avatars}</div>
    </div>
  );
}

export default function StatusBar() {
  const state = useAppStore();
  const router = useRouter();

  const groupsQuery = api.users.groups.useQuery();
  const groups = groupsQuery.data;
  if (groups == null) {
    return <></>;
  }

  const groupSlides = (
    <>
      {groups?.map((g) => (
        <SwiperSlide key={g.id}>
          <GroupSlide group={g} />
        </SwiperSlide>
      ))}
    </>
  );

  let groupIndex: number | undefined =
    groups?.findIndex((g) => g.id === state.filterGroup?.id) ?? -1;
  groupIndex = groupIndex === -1 ? undefined : groupIndex + 1;

  return (
    <div>
      <Swiper
        direction={"horizontal"}
        navigation
        slidesPerView={1}
        spaceBetween={30}
        initialSlide={groupIndex}
        style={{ zIndex: 0 }}
        mousewheel={true}
        pagination={{
          clickable: true,
        }}
        onSlideChange={(swiper) => {
          // Set the group filter up the stack
          const group = groups?.[swiper.activeIndex - 1];
          let grp = "";
          state.setGroup(group);
          if (group?.id != null) {
            grp = `/${group.id}`;
          }

          void router.push(grp);
        }}
        modules={[Mousewheel, Navigation, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide key="status">
          <StatusSlide />
        </SwiperSlide>
        {groupSlides}
      </Swiper>
    </div>
  );
}
