"use client";

import { getProjectInfo } from "@/app/action";
import ProjectComponent from "@/app/components/ProjectComponent";
import UserInfo from "@/app/components/UserInfo";
import Wrapper from "@/app/components/Wrapper";
import { Project } from "@/type";
import { useUser } from "@clerk/nextjs";
import { CopyPlus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
/**
 * Page affichant les détails d'un projet
 *
 * @param {{ params: Promise<{ projectId: string }> }} props
 * @returns {JSX.Element}
 */
const page = ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchInfos = async (projectId: string) => {
    try {
      const project = await getProjectInfo(projectId, true);
      setProject(project);
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
    getId();
  }, [params]);

  useEffect(() => {
    if (project && project.tasks && email) {
      const counts = {
        todo: project.tasks.filter((task) => task.status === "To Do").length,
        inProgress: project.tasks.filter(
          (task) => task.status === "In Progress"
        ).length,
        done: project.tasks.filter((task) => task.status === "Done").length,
        assigned: project.tasks.filter((task) => task.user?.email !== email)
          .length,
      };
    }
  }, [params]);

  const filteredTasks = project?.tasks?.filter(
    (task) => {
      const statusFilter = !statusFilter || task.status === statusFilter;
      const assignedMatch = !statusFilter || task?.user?.email === email;
      return statusFilter && assignedMatch;
    }
  );

  return (
    <Wrapper>
      <div className="md:flex md:flex-row flex-col">
        <div className="md:w-1/4">
          <div className="p-5 border border-base-300 rounded-xl mb-6">
            <UserInfo
              role="Créé par"
              email={project?.createdBy?.email || null}
              name={project?.createdBy?.name || null}
            />
          </div>
          <div className="w-full">
            {project && (
              <ProjectComponent
                project={project}
                admin={0}
                style={false}
              ></ProjectComponent>
            )}
          </div>
        </div>
        <div className="mt-6 md:ml-6 md:mt-0 md:w-3/4">
          <div className="md:flex md:justify-between">
            <div className="flex flex-col">
              <div className="space-x-2 mt-2">
                <button>
                  <SlidersHorizontal className="w-4" /> Tous ({
                    project?.tasks?.length || 0})
                </button>
              </div>
              <div className="space-x-2 mt-2"></div>
            </div>
            <Link
              href={`/new-tasks/${projectId}`}
              className="btn btn-sm mt-2 md:mt-0"
            >
              Nouvelle tâche
              <CopyPlus className="w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
