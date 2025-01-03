import { User } from "@prisma/client";
import { FC, useState } from "react";
import UserInfo from "./UserInfo";

interface AssignTaskProps {
  users: User[];
  projectId: string;
  onAssignTask: (user: User) => void;
}



/**
 * Component to assign a task to a user in a project
 *
 * Shows a dropdown list of all users in the project, and allows the user to select one
 * of them to assign the task to.
 *
 * @param {{ users: User[], projectId: string, onAssignTask: (user: User) => void }} props
 * @returns {JSX.Element}
 */
const AssignTask: FC<AssignTaskProps> = ({ users, projectId, onAssignTask }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  const handleAssign = (user: User) => {
    setSelectedUser(user);
    onAssignTask(user);
  }

  const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
  if (modal) {
    modal.close()
  }

  return (
    <div className="w-full">
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <div
        className="cursor-pointer border border-base-300 p-5 rounded-xl w-full"
        onClick={() =>
          (
            document.getElementById("my_modal_3") as HTMLDialogElement
          ).showModal()
        }
      >
        <UserInfo
          role="Assigné à"
          email={selectedUser?.email || "Personne"}
          name={selectedUser?.name || ""}
        />
      </div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-3">
            Choisissez un collaborateur
          </h3>
          <div>
            {users.map((user) => (
              <div
                onClick={() => handleAssign(user)}
                key={user.id}
                className="cursor-pointer border border-base-300 p-5 rounded-xl w-full mb-1"
              >
                <UserInfo
                  role="Assigné à"
                  email={user.email || null}
                  name={user.name || null}
                />
              </div>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AssignTask;
