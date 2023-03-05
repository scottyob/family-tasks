import { FaBalanceScaleLeft, FaCogs } from 'react-icons/fa';
import {HiOutlineCalendarDays} from 'react-icons/hi2';
import {BiTask} from 'react-icons/bi'
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NavBar() {
    const { asPath } = useRouter();
    const selected = 'text-blue-600';
    const unselected = 'text-gray-600';

    const menuClass = asPath.startsWith("/menu") ? selected : unselected;
    const taskClass = asPath == ("/") ? selected : unselected;
    
    return <div className="flex flex-row grow place-self-center place-items-center justify-around">
        <FaBalanceScaleLeft className="text-gray-600" size={30} />
        <HiOutlineCalendarDays className="text-gray-600" size={30} />
        <Link href={"/"}><BiTask className={taskClass} size={30} /></Link>
        <Link href={"/menu"}><FaCogs className={menuClass} size={30} /></Link>
    </div>;
}

