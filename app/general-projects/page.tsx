"use client"

import { useEffect, useState } from 'react'
import React from 'react'
import Wrapper from '../components/Wrapper'
import { SquarePlus } from "lucide-react"
import { toast } from 'react-toastify'
import { addUserToProject, getProjectsAssociatedWithUser } from '../action'
import { useUser } from '@clerk/nextjs'
import { Project } from '@prisma/client'
import EmptyState from '../components/EmptyState'
import ProjectComponent from '../components/ProjectComponent'


const page = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const [inviteCode, setInviteCode] = useState('')
  const [associatedProjects, setAssociatedProjects] = useState<Project[]>([])

  const fetchProjects = async (email: string) => {
    try {
      const associated = await getProjectsAssociatedWithUser(email)
      setAssociatedProjects(associated)

    } catch (error) {
      toast.error('Erreur lors du chargement des projets:');

    }
  }


  useEffect(() => {
    if (email) {
      fetchProjects(email)
    }
  }, [email])


  const handleSubmit = async () => {
    try {
      if (inviteCode != "") {
        await addUserToProject(email, inviteCode)
        toast.success('Vous êtes maintenant membre du projet')
      } else {
        toast.error('Il manque le code du projet')
      }

    } catch (error) {
      toast.error('Code invalide ou vous appartenez déjà au projet')
    }

  }


  return (
    <Wrapper>
      <div className='flex'>
        <div className='mb-4'>
          <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Code d'invitation" className='input input-bordered p-2 w-full' />
        </div>
        <button className="btn btn-primary ml-4" onClick={handleSubmit}>
          Rejoindre <SquarePlus className="w-4" />
        </button>

      </div>

      <div>
        {associatedProjects.length > 0 ? (
          <ul className="w-full grid md:grid-cols-3 gap-6">
            {associatedProjects.map((project) => (
              <li key={project.id}>
                <ProjectComponent project={project} admin={0} style={true}></ProjectComponent>
              </li>
            ))}
          </ul>
        ) : (
          <div>
            <EmptyState
              imageSrc='/empty-project.png'
              imageAlt="Picture of an empty project"
              message="Aucun projet Associer"
            />
          </div>
        )}

      </div>
    </Wrapper>
  )
}

export default page