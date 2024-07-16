import Link from "next/link";
import { FaBars, FaHome } from "react-icons/fa";
import { vt323 } from "~/utils/fonts";

const className = {
  "header": "flex w-full text-3xl font-bold text-green-800 " + vt323.className
}

export default function ProjectBar(props: { currentProject: string }) {
  return <div className={className["header"]}>
    <div className="p-4 pl-8"><Link href="/Today"><FaHome /></Link></div>
    <div className="p-4 grow text-center">{props.currentProject}</div>
    <div className="p-4 pr-8"><Link href="/Nav"><FaBars /></Link></div>
  </div>;
}
