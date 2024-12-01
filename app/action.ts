"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * Vérifie si un utilisateur existe déjà dans la base de données,
 * et le crée si ce n'est pas le cas.
 *
 * @param {string} email - Adresse e-mail de l'utilisateur.
 * @param {string} name - Nom de l'utilisateur.
 * @returns {Promise<void>}
 */
export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existingUser && name) {
      await prisma.user.create({
        data: {
          email,
          name,
        },
      });
      console.error("Erreur lors de la vérification de l'utilisateur:");
    } else {
      console.error("Utilisateur déjà existant");
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur", error);
  }
}

/**
 * Génère un code unique composé de 6 caractères hexadécimaux.
 *
 * @returns {string} Un code unique.
 */
function generateUniqueCode(): string {
  return randomBytes(6).toString("hex");
}

/**
 * Crée un nouveau projet avec un nom, une description et un code d'invitation unique.
 *
 * @param {string} name - Le nom du projet.
 * @param {string} description - La description du projet.
 * @param {string} email - L'adresse e-mail de l'utilisateur créant le projet.
 * @returns {Promise<Project>} Le projet nouvellement créé.
 * @throws {Error} Si l'utilisateur n'est pas trouvé ou en cas d'erreur lors de la création du projet.
 */
export async function createProject(
  name: string,
  description: string,
  email: string
) {
  try {
    const inviteCode = generateUniqueCode();
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        inviteCode,
        createdById: user.id,
      },
    });
    return newProject;
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors de la création du projet");
  }
}

/**
 * Récupère la liste des projets crée par l'utilisateur dont l'email est fourni.
 *
 * @param {string} email - L'email de l'utilisateur.
 * @returns {Promise<Project[]>} La liste des projets crée par l'utilisateur.
 * @throws {Error} Si l'utilisateur n'est pas trouvé ou en cas d'erreur lors de la récupération des projets.
 */
export async function getProjectsCreatedByUser(email: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        createdBy: { email },
      },
      include: {
        tasks: {
          include: {
            user: true,
            createdBy: true,
          },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      users: project.users.map((userEntry) => userEntry.user),
    }));

    return formattedProjects;
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors de la récupération des projets");
  }
}

/**
 * Supprime un projet de la base de données par son identifiant.
 *
 * @param {string} projectId - L'identifiant du projet à supprimer.
 * @throws {Error} Si une erreur survient lors de la suppression du projet.
 */
export async function deleteProjectById(projectId: string) {
  try {
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors de la suppression du projet");
  }
}

/**
 * Ajoute un utilisateur à un projet en fonction de son code d'invitation.
 *
 * @param {string} email - L'adresse e-mail de l'utilisateur à ajouter.
 * @param {string} inviteCode - Le code d'invitation du projet.
 * @returns {Promise<string>} Une promesse qui se résout en cas de succès
 *   avec un message de confirmation, ou qui lance une erreur en cas d'erreur.
 * @throws {Error} Si le projet ou l'utilisateur n'est pas trouvé, si l'utilisateur
 *   est déjà associé au projet, ou si une erreur survient lors de la
 *   création de l'association entre l'utilisateur et le projet.
 */
export async function addUserToProject(email: string, inviteCode: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { inviteCode },
    });

    if (!project) {
      throw new Error("Projet non trouvé");
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const existingAssociation = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });

    if (existingAssociation) {
      throw new Error("Utilisateur déjà associé à ce projet");
    }

    await prisma.projectUser.create({
      data: {
        userId: user.id,
        projectId: project.id,
      },
    });

    return "Utilisateur ajouté au projet avec succès";
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

/**
 * Récupère la liste des projets associés à un utilisateur donné.
 *
 * @param {string} email - L'email de l'utilisateur.
 * @returns {Promise<Project[]>} La liste des projets associés à l'utilisateur.
 * @throws {Error} Si une erreur survient lors de la récupération des projets.
 */
export async function getProjectsAssociatedWithUser(email: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            user: {
              email,
            },
          },
        },
      },
      include: {
        tasks: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      users: project.users.map((userEntry) => userEntry.user),
    }));

    return formattedProjects;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

/**
 * Récupère un projet par son identifiant.
 *
 * @param {string} idProject - L'identifiant du projet.
 * @param {boolean} details - Si vrai, les tâches, les utilisateurs et l'utilisateur
 *   créateur du projet sont inclus dans la réponse.
 * @returns {Promise<Project>} Le projet.
 * @throws {Error} Si le projet n'est pas trouvé, ou si une erreur survient
 *   lors de la récupération du projet.
 */
export async function getProjectInfo(idProject: string, details: boolean) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: idProject,
      },
      include: details
        ? {
            tasks: {
              include: {
                user: true,
                createdBy: true,
              },
            },
            users: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            createdBy: true,
          }
        : undefined,
    });
    if (!project) {
      throw new Error("Projet introuvable");
    }
    return project;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

/**
 * Renvoie la liste des utilisateurs associés à un projet.
 *
 * @param {string} idProject - L'identifiant du projet.
 * @returns {Promise<User[]>} La liste des utilisateurs.
 * @throws {Error} Si une erreur survient lors de la r cup ration des utilisateurs.
 */
export async function getProjectUsers(idProject: string) {
  try {
    const projectWithUsers = await prisma.project.findUnique({
      where: {
        id: idProject,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
    const users =
      projectWithUsers?.users.map((projectUser) => projectUser.user) || [];
    return users;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

/**
 * Crée un nouveau task dans un projet.
 *
 * @param {string} name - Le nom du task.
 * @param {string} description - La description du task.
 * @param {Date | null} dueDate - La date de fin du task.
 * @param {string} projectId - L'identifiant du projet dans lequel cr er le task.
 * @param {string} createdByEmail - L'email de l'utilisateur qui cr e le task.
 * @param {string | undefined} assignToEmail - L'email de l'utilisateur  qui doit r cup rer le task, ou undefined pour assigner au cr ateur.
 * @returns {Promise<void>} Une promesse qui se r solved en cas de succ s.
 * @throws {Error} Si l'utilisateur cr ateur ou l'utilisateur assign  n'est pas trouv , ou en cas d'erreur lors de la cr ation du task.
 */

export async function createTask(
  name: string,
  description: string,
  dueDate: Date | null,
  projectId: string,
  createdByEmail: string,
  assignToEmail: string | undefined
) {
  try {
    const createdBy = await prisma.user.findUnique({
      where: {
        email: createdByEmail,
      },
    });

    if (!createdBy) {
      throw new Error(`Utilisateur avec l'email ${createdByEmail} introuvable`);
    }

    let assignedUserId = createdBy.id;

    if (assignToEmail) {
      const assignedUser = await prisma.user.findUnique({
        where: {
          email: assignToEmail,
        },
      });

      if (!assignedUser) {
        throw new Error(
          `Utilisateur avec l'email ${assignToEmail} introuvable`
        );
      }

      assignedUserId = assignedUser.id;
    }

    const newTask = await prisma.task.create({
      data: {
        name,
        description,
        dueDate,
        projectId,
        createdById: createdBy.id,
        userId: assignedUserId,
      },
    });
    console.log("newTask", newTask);
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function deleteTaskById(taskId: string) {
  try {
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}
