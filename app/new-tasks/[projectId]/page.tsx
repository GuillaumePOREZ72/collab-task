"use client";

import { getProjectInfo, getProjectUsers } from "@/app/action";
import AssignTask from "@/app/components/AssignTask";
import Wrapper from "@/app/components/Wrapper";
import { Project } from "@/type";
import { User } from "@prisma/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

/**
 * Page to create a new task for a project
 *
 * @param {object} params - An object with a projectId property
 * @returns {JSX.Element} A JSX component to display the new task form
 */
const page = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [usersProject, setUsersProject] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const fetchInfos = async (projectId: string) => {
    try {
      const project = await getProjectInfo(projectId, true);
      setProject(project);

      const associatedUsers = await getProjectUsers(projectId);
      setUsersProject(associatedUsers);
    } catch (error) {
      console.error("Erreur lors du chargement du projet:", error);
    }
  };

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.projectId);
      fetchInfos(resolvedParams.projectId);
    };
  }, [params]);

  const handleUserSelected = (user: User) => {
    setSelectedUser(user);
  };
  return (
    <Wrapper>
      <div>
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href={`/project/${projectId}`}>Retour</Link>
            </li>
            <li>
              <div className="badge badge-primary">{project?.name}</div>
            </li>
          </ul>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="md:w-1/4">
            <AssignTask
              users={usersProject}
              projectId={projectId}
              onAssignTask={handleUserSelected}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="badge">A livré</span>
              <input
                type="date"
                placeholder="Date d'échéance"
                className="input input-bordered border border-base-300"
                onChange={(e) => setDueDate(new Date(e.target.value))}
              />
            </div>
          </div>
          <div className="md:w-3/4"></div>
        </div>
        {selectedUser?.name}
      </div>
    </Wrapper>
  );
};

export default page;
