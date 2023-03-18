import React from "react";

export type FilterContextType = {
    filterType: string;
    setFilterType: React.Dispatch<React.SetStateAction<string>>;
    group: string | undefined;
    setGroup: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const FilterContext = React.createContext<FilterContextType>({
    filterType: "Task",
    setFilterType: () => {},
    group: undefined,
    setGroup: () => {}
});