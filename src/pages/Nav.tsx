import Link from "next/link";
import { FaHome } from "react-icons/fa";
import ProjectsList from "~/components/lists/projectsList";
import { vt323 } from "~/utils/fonts";

const className = {
  header: "flex w-full text-3xl font-bold text-green-800 " + vt323.className,
};

export default function NavPage() {
  return (
    <div>
      {/* Header */}
      <div className={className["header"]}>
        <div className="p-4 pl-8">
          <Link href="/Today">
            <FaHome />
          </Link>
        </div>
        <div className="flex-grow justify-self-center p-4 text-center">
          Projects and Settings
        </div>
      </div>

      {/* Projects List */}
      <ProjectsList />
    </div>
  );
}
