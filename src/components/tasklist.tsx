import { BiTask } from "react-icons/bi";
import {VscCircleLargeFilled} from "react-icons/vsc"

function Task(props: {title: string}) {
    return <div className="flex m-0.5 min-h-[60px]">
        {/* Left priority & done button */}
        <div className="rounded-l-lg bg-red-400 min-w-[40px] place-items-center justify-center flex">
            <VscCircleLargeFilled className="text-gray-200/40 place-self-center" size={30} />
        </div>

        {/* Text container */}
        <div className="rounded-r-lg grow p-2 flex bg-gray-50">
            <div className="place-self-center grow flex">
                <div className="">
                    {props.title}
                </div>
            </div>
        </div>
    </div>

    // return <div className="bg-gray-100 p-4 m-2 rounded-lg">
    //     I am a task
    // </div>
}

export default function TaskList() {
    return <div className="grow bg-gray-100 p-1 m-2 flex flex-col">
        <input type="text" placeholder="Add a Task" className="m-1 caret-pink-500 bg-gray-200 focus:bg-white border-none" />
        <Task title="1"/>
        <Task title="task 2"/>
        <Task title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>
        <Task title="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."/>
    </div>;
}