
import { VT323 } from 'next/font/google'
import { api } from "~/utils/api";
import { useSpring, animated } from "react-spring";
import Avvvatars from 'avvvatars-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper";
import { Group, User } from '.prisma/client';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/api/root';
import { vt323 } from '~/utils/fonts';

const titleClass = vt323.className + " text-center text-lg";
type RouterOutput = inferRouterOutputs<AppRouter>;

function Name(props: {name: string}) {
  const springProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: {
      mass: 4.7,
      tension: 170,
      friction: 30,
      precision: 0.3,
      velocity: 0
    }
  });

  return <animated.span style={springProps}>{props.name}</animated.span>;
}

function Avatar(props: { user: User }) {
  return <div title={props.user.name ?? undefined} className="relative place-items-center">
    <div className="absolute p-1 top-0 right-0 bg-yellow-500/90 rounded-[12px]">{props.user.gold}</div>
    <Avvvatars style="shape" size={180 / 2} value={props.user.name ?? ''} />
  </div>
}

function StatusSlide() {
  const user = api.users.currentUser.useQuery().data;

  let avatarSettings = <></>;
  if(user != null) {
    avatarSettings = <div className='flex'>
      <div className='m-5'>
        <Avvvatars style="shape" size={50} value={user.name ?? user.id} />
      </div>
      <div className='text-left'>
        <div><strong>Gold: </strong>{user.gold}</div>
        {/* <div><strong>Tasks: </strong></div> */}
      </div>
    </div>
  }
  

  return <div className={titleClass}>
    <div>
      Hello <Name name={user?.name ?? '...'} />
    </div>
    <div className='grow flex'>
      {avatarSettings}
    </div>
  </div>
}

function GroupSlide(props: { group: RouterOutput['users']['groups'][0] }) {
  const avatars = props.group.users.map(u => <Avatar key={u.user.id} user={u.user} />)
  return <div className={titleClass}>
    {props.group.name}
    <div className="flex justify-center space-x-4">
      {avatars}
    </div>
  </div>
}

interface Props {
  setSelectedGroup: (groupId: (Group | undefined)) => void;
  selectedGroupId?: String;
}

export default function StatusBar(props: Props) {
  const groupsQuery = api.users.groups.useQuery();
  const groups = groupsQuery.data;
  if(groups == null) {
    return <></>;
  }

  const groupSlides = <>{groups?.map(g =>
    <SwiperSlide key={g.id}>
        <GroupSlide group={g} />
      </SwiperSlide>
  )}</>

  let groupIndex: (number | undefined) = groups?.findIndex(g => g.id === props.selectedGroupId) ?? -1;
  groupIndex = groupIndex === -1 ? undefined : groupIndex + 1;

  console.log("Initial index", groupIndex);

  return <>
    <Swiper
      direction={"horizontal"}
      slidesPerView={1}
      spaceBetween={30}
      initialSlide={groupIndex}
      mousewheel={true}
      pagination={{
        clickable: true,
      }}
      onSlideChange={(swiper) => {
        // Set the group filter up the stack
        const group = groups?.[swiper.activeIndex - 1];
        console.log("New index", swiper.activeIndex);
        console.log("Group", group);

        props.setSelectedGroup(group);
      }}
      modules={[Mousewheel, Pagination]}
      className="mySwiper"
    >
      <SwiperSlide key="status" className='h-full'><StatusSlide /></SwiperSlide>
      {groupSlides}
    </Swiper>
  </>

}