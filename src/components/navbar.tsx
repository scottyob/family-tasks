import { FaBalanceScaleLeft, FaCogs } from 'react-icons/fa';
import {HiOutlineCalendarDays} from 'react-icons/hi2';
import {BiTask} from 'react-icons/bi'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export default function NavBar() {
    const [suffix, setSuffix] = React.useState("");

    const { asPath } = useRouter();
    const selected = 'text-blue-600';
    const unselected = 'text-gray-600';

    const habbitsClass = asPath.startsWith("/Habit") ? selected : unselected;
    const dailiesClass = asPath.startsWith("/Daily") ? selected : unselected;
    const taskClass = asPath.startsWith("/Task") ? selected : unselected;
    const menuClass = asPath.startsWith("/menu") ? selected : unselected;

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
        <Link href={"/Habit" + suffix}><FaBalanceScaleLeft className={habbitsClass} size={30} /></Link>
        <Link href={"/Daily" + suffix}><HiOutlineCalendarDays className={dailiesClass} size={30} /></Link>
        <Link href={"/Task" + suffix}><BiTask className={taskClass} size={30} /></Link>
        <Link href={"/menu"}><FaCogs className={menuClass} size={30} /></Link>
    </div>;
}

