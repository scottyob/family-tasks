
import { VT323 } from 'next/font/google'
import { api } from "~/utils/api";
import { useSpring, animated } from "react-spring";
import Avvvatars from 'avvvatars-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper";

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
})


function Name() {
  const name = api.users.name.useQuery().data;

  const props = useSpring({
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

  return <animated.span style={props}>{name}</animated.span>;
}

function Avatar(props: { name: string }) {
  return <div title={props.name} className="relative place-items-center">
    <div className="absolute p-1 top-0 right-0 bg-yellow-500/90 rounded-[12px]">100</div>
    <Avvvatars style="shape" size={180 / 2} value={props.name} />
  </div>
}

function PartyMembers() {
  return <div className="flex flex-row justify-around">
    <Avatar name='king.scott.2@gmail.com' />
    <Avatar name='bltaylor@gmail.com' />
  </div>;
}


function StatusSlide() {
  return <div>
    <Name />
    <Avatar name='king.scott.2@gmail.com' />
  </div>
}

function groupSlide() {
  return <></>;
}

export default function StatusBar() {
  const statusClass = vt323.className + " text-center text-lg ";

  return <>
    <Swiper
      direction={"horizontal"}
      slidesPerView={1}
      spaceBetween={30}
      mousewheel={true}
      pagination={{
        clickable: true,
      }}
      modules={[Mousewheel, Pagination]}
      className="mySwiper"
    >
      <SwiperSlide key="status"><StatusSlide /></SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
      <SwiperSlide>Slide 4</SwiperSlide>
      <SwiperSlide>Slide 5</SwiperSlide>
      <SwiperSlide>Slide 6</SwiperSlide>
      <SwiperSlide>Slide 7</SwiperSlide>
      <SwiperSlide>Slide 8</SwiperSlide>
      <SwiperSlide>Slide 9</SwiperSlide>
    </Swiper>
  </>


  return (<div className="">
    <h3 className={statusClass}>Hello <Name /></h3>
    <PartyMembers />
  </div>);
}