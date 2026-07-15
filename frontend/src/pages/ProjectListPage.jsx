import { useState } from 'react'
import { FolderPlus, FolderKanban } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import EmptyState from '../components/common/EmptyState'
import ProjectCard from '../components/project/ProjectCard'
import ProjectForm from '../components/project/ProjectForm'
import ProjectEmployeeList from '../components/project/ProjectEmployeeList'
import { useApiState } from '../hooks/useApiState'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { projectService } from '../api/projectService'
import { MANAGER_ROLES } from '../utils/constants'

export default function ProjectListPage() {
  const { role } = useAuth()
  const toast = useToast()
  const canManage = MANAGER_ROLES.includes(role)

  const { data: projectsResp, loading, error, refetch } = useApiState(
    () => projectService.list({ page_size: 100 }),
    []
  )
  const projects = projectsResp?.items || projectsResp?.results || projectsResp || []

  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [employeesModal, setEmployeesModal] = useState(null)
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [projectEmployees, setProjectEmployees] = useState([])

  const openCreate = () => {
    setEditingProject(null)
    setFormOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (editingProject) {
        await projectService.update(editingProject.id, values)
        toast.success('Project updated.')
      } else {
        await projectService.create(values)
        toast.success('Project created.')
      }
      setFormOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not save project.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectService.remove(deleteTarget.id)
      toast.success(`${deleteTarget.name} was deleted.`)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Could not delete this project.')
    } finally {
      setDeleting(false)
    }
  }

  const openEmployees = async (project) => {
    setEmployeesModal(project)
    setEmployeesLoading(true)
    try {
      const data = await projectService.getEmployees(project.id)
      setProjectEmployees(data?.items || data?.results || data || [])
    } catch {
      toast.error('Could not load employees for this project.')
      setProjectEmployees([])
    } finally {
      setEmployeesLoading(false)
    }
  }

  return (
    <AppLayout title="Projects">
      <div className="animate-fadeup mx-auto max-w-[1180px] space-y-4">
        <div className="flex justify-end">
          {canManage && (
            <Button icon={FolderPlus} onClick={openCreate}>
              Add project
            </Button>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
            <LoadingSpinner label="Loading projects..." />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
            <ErrorState message={error} onRetry={refetch} />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white shadow-card">
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description={canManage ? 'Create your first project to start mapping employees.' : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                canManage={canManage}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onViewEmployees={openEmployees}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingProject ? 'Edit project' : 'Add project'}
      >
        <ProjectForm
          initialValues={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <Modal
        open={!!employeesModal}
        onClose={() => setEmployeesModal(null)}
        title={`Employees on ${employeesModal?.name || ''}`}
        size="lg"
      >
        {employeesLoading ? (
          <LoadingSpinner label="Loading employees..." />
        ) : (
          <ProjectEmployeeList employees={projectEmployees} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this project?"
        message={`"${deleteTarget?.name}" will be permanently deleted. Employees mapped to it will need to be reassigned.`}
        confirmLabel="Delete project"
        loading={deleting}
      />
    </AppLayout>
  )
}