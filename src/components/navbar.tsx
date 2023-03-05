import { FaBalanceScaleLeft, FaCogs } from 'react-icons/fa';
import {HiOutlineCalendarDays} from 'react-icons/hi2';
import {BiTask} from 'react-icons/bi'
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NavBar() {
    const { asPath } = useRouter();
    const selected = 'text-blue-600';
    const unselected = 'text-gray-600';

    const habbitsClass = asPath.startsWith("/habits") ? selected : unselected;
    const dailiesClass = asPath.startsWith("/dailies") ? selected : unselected;
    const taskClass = asPath == ("/tasks") ? selected : unselected;
    const menuClass = asPath.startsWith("/menu") ? selected : unselected;
    
    return <div className="flex flex-row grow place-self-center place-items-center justify-around">
        <Link href="/habits"><FaBalanceScaleLeft className={habbitsClass} size={30} /></Link>
        <Link href={"/dailies"}><HiOutlineCalendarDays className={dailiesClass} size={30} /></Link>
        <Link href={"/tasks"}><BiTask className={taskClass} size={30} /></Link>
        <Link href={"/menu"}><FaCogs className={menuClass} size={30} /></Link>
    </div>;
}

