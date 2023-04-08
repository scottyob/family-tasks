
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
import React from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from '~/utils/context';

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

function Avatar(props: { user: User, hideMoney?: boolean }) {
  const money = props.hideMoney ? null : <div className="absolute p-1 top-0 right-0 bg-yellow-500/90 rounded-[12px]">{props.user.gold}</div>;

  return <div title={props.user.name ?? undefined} className="relative place-items-center">
    {money}
    <img className="w-24 h-24 rounded-full p-2" src={props.user?.image ?? undefined} alt={props.user?.name ?? undefined} />
  </div>

// <Avvvatars style="shape" size={180 / 2} value={props.user.name ?? ''} />
}

function StatusSlide() {
  const user = api.users.currentUser.useQuery().data;

  let avatarSettings = <></>;
  if(user != null) {
    avatarSettings = <div className='flex'>
      <Avatar user={user} hideMoney={true} />
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

}

export default function StatusBar(props: Props) {
  const state = useAppStore();
  const router  = useRouter();

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


  let groupIndex: (number | undefined) = groups?.findIndex(g => g.id === state.filterGroup?.id) ?? -1;
  groupIndex = groupIndex === -1 ? undefined : groupIndex + 1;

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
        let grp = "";
        state.setGroup(group);
        if(group?.id != null) {
          grp = `/${group.id}`;
        }
        router.push(`/${state.filterType}${grp}`);
        
      }}
      modules={[Mousewheel, Pagination]}
      className="mySwiper"
    >
      <SwiperSlide key="status" className='h-full'><StatusSlide /></SwiperSlide>
      {groupSlides}
    </Swiper>
  </>

}