import React from "react";

interface WorkersTabHeaderProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  workerIdsCount: number;
  groupsCount: number;
}

export const WorkersTabHeader: React.FC<WorkersTabHeaderProps> = ({
  selectedTab,
  setSelectedTab,
  workerIdsCount,
  groupsCount
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setSelectedTab("groups")}
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
            selectedTab === "groups"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Grupos de Trabajo
          {groupsCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {groupsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};