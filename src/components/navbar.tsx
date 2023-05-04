import { FaCogs } from 'react-icons/fa';
import {HiOutlineClock} from 'react-icons/hi2';
import {BiTask} from 'react-icons/bi'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useAppStore } from '~/utils/context';

export default function NavBar() {
    const state = useAppStore();
    const [suffix, setSuffix] = React.useState("");

    const { asPath } = useRouter();
    const selected = 'text-blue-600';
    const unselected = 'text-gray-600';

    const todayClass = asPath == "/Today" ? selected : unselected;
    const menuClass = asPath.startsWith("/menu") ? selected : unselected;

    // If we're not in menu or today, we must be on task
    const taskClass = todayClass == selected || menuClass == selected ? unselected : selected;

    // Figure out the group suffix
    const router = useRouter();
    useEffect(() => {
        const match = router.asPath.match(/^\/([a-zA-Z]+)\/([a-fA-F0-9-]+)$/);
        let suffix = "";
        if (match) {
            const groupId = match[2];
            suffix = "/" + (groupId || "");
        }
        setSuffix(suffix);
    }, [router.asPath, router.query]);

    
    return <div className="flex flex-row grow place-self-center place-items-center justify-around">
        <Link onClick={() => {
            state.setGroup(undefined);
        }} href={"/Today"}><HiOutlineClock className={todayClass} size={30} /></Link>
        <Link href={"/" + suffix}><BiTask className={taskClass} size={30} /></Link>
        <Link href={"/menu"}><FaCogs className={menuClass} size={30} /></Link>
    </div>;
}

