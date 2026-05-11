import { zodResolver } from '@hookform/resolvers/zod'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Bot, Pencil, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { EmptyState } from '../../components/EmptyState'
import { EntityEditorDialog } from '../../components/EntityEditorDialog'
import { ErrorPane } from '../../components/ErrorPane'
import { FormField } from '../../components/FormField'
import { PageHeader } from '../../components/PageHeader'
import { StatusBadge } from '../../components/StatusBadge'
import { WorkspaceSplit } from '../../components/WorkspaceSplit'
import {
  fieldClassName,
  selectClassName,
  textAreaClassName,
} from '../../components/fieldStyles'
import {
  agentRoleOptions,
  agentStatusOptions,
} from '../../lib/domain'
import { useUiStore } from '../../stores/ui-store'
import { useModelsQuery } from '../models/api'
import { useAgentMutations, useAgentsQuery } from './api'

const agentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters.'),
  role: z.enum(agentRoleOptions),
  modelId: z.string().min(1, 'Choose a model.'),
  status: z.enum(agentStatusOptions),
  instructions: z.string().min(20, 'Instructions should be at least 20 characters.'),
  systemPrompt: z.string().min(20, 'System prompt should be at least 20 characters.'),
  humanCheckpoint: z.boolean(),
})

type AgentFormValues = z.infer<typeof agentSchema>

const emptyAgentForm: AgentFormValues = {
  name: '',
  role: 'lead',
  modelId: '',
  status: 'draft',
  instructions: '',
  systemPrompt: '',
  humanCheckpoint: true,
}

export function AgentsPage() {
  const compactMode = useUiStore((state) => state.compactMode)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null)
  const { data: agents = [], isLoading, error, refetch } = useAgentsQuery()
  const { data: models = [] } = useModelsQuery()
  const { createMutation, updateMutation, deleteMutation } = useAgentMutations()
  const effectiveSelectedAgentId = selectedAgentId ?? agents[0]?.id ?? null

  const selectedAgent =
    agents.find((agent) => agent.id === effectiveSelectedAgentId) ?? agents[0] ?? null

  const filteredAgents = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase()
    if (!needle) {
      return agents
    }

    return agents.filter((agent) =>
      [agent.name, agent.role, agent.instructions].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    )
  }, [agents, deferredSearch])

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: emptyAgentForm,
  })

  useEffect(() => {
    if (!editorMode) {
      return
    }

    if (editorMode === 'edit' && selectedAgent) {
      form.reset({
        name: selectedAgent.name,
        role: selectedAgent.role,
        modelId: selectedAgent.modelId,
        status: selectedAgent.status,
        instructions: selectedAgent.instructions,
        systemPrompt: selectedAgent.systemPrompt,
        humanCheckpoint: selectedAgent.humanCheckpoint,
      })
      return
    }

    form.reset({
      ...emptyAgentForm,
      modelId: models[0]?.id ?? '',
    })
  }, [editorMode, form, models, selectedAgent])

  async function onSubmit(values: AgentFormValues) {
    if (editorMode === 'edit' && selectedAgent) {
      await updateMutation.mutateAsync({ id: selectedAgent.id, payload: values })
      setEditorMode(null)
      return
    }

    const created = await createMutation.mutateAsync(values)
    setSelectedAgentId(created.id)
    setEditorMode(null)
  }

  const listPanel = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input input-ghost w-full px-0 text-sm"
          placeholder="Search agents, roles, or instructions"
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditorMode('create')}>
          <Plus className="size-4" />
          Add agent
        </button>
      </div>

      {error ? <ErrorPane error={error} onRetry={() => void refetch()} /> : null}

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-32 rounded-[1.5rem]" />
            ))
          : filteredAgents.map((agent) => {
              const assignedModel = models.find((model) => model.id === agent.modelId)

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full rounded-[1.5rem] border bg-base-100 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    selectedAgent?.id === agent.id
                      ? 'border-primary/60 ring-2 ring-primary/15'
                      : 'border-base-300'
                  } ${compactMode ? 'space-y-3' : 'space-y-4'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-base-content">{agent.name}</h3>
                        <StatusBadge status={agent.status} />
                      </div>
                      <p className="mt-2 text-sm capitalize text-base-content/65">{agent.role}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {assignedModel?.provider ?? 'No model'}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-base-content/70 line-clamp-2">{agent.instructions}</p>
                </button>
              )
            })}
      </div>
    </div>
  )

  const detailPanel = selectedAgent ? (
    <div className="space-y-4 rounded-[1.5rem] border border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Agent profile
          </p>
          <h3 className="mt-2 text-2xl font-semibold">{selectedAgent.name}</h3>
          <p className="mt-2 text-sm capitalize text-base-content/65">{selectedAgent.role}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditorMode('edit')}>
            <Pencil className="size-4" />
            Edit
          </button>
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm"
            onClick={() => void deleteMutation.mutateAsync(selectedAgent.id)}
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-base-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
            Runtime model
          </p>
          <p className="mt-3 text-sm font-medium">
            {models.find((model) => model.id === selectedAgent.modelId)?.name ?? 'Unassigned'}
          </p>
        </div>
        <div className="rounded-2xl bg-base-200/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
            Human checkpoint
          </p>
          <p className="mt-3 text-sm font-medium">
            {selectedAgent.humanCheckpoint ? 'Required before escalation' : 'Autonomous within approved scope'}
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-base-300 bg-base-200/30 p-5">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-base-content/50">
          Working instruction
        </h4>
        <p className="mt-3 text-sm leading-7 text-base-content/80">{selectedAgent.instructions}</p>
      </div>

      <div className="rounded-[1.5rem] border border-base-300 bg-neutral p-5 text-neutral-content">
        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-content/60">
          System prompt
        </h4>
        <p className="mt-3 text-sm leading-7 text-neutral-content/85">{selectedAgent.systemPrompt}</p>
      </div>
    </div>
  ) : (
    <EmptyState
      title="Add your first agent"
      description="Seed the collaboration layer with specialists before wiring them into teams and model policies."
      icon={<Bot className="size-7" />}
      action={
        <button type="button" className="btn btn-primary" onClick={() => setEditorMode('create')}>
          Create agent
        </button>
      }
    />
  )

  return (
    <>
      <PageHeader
        eyebrow="Agents"
        title="Agent management built around explicit responsibility"
        description="Create specialists with chosen models, clear instructions, and human checkpoints that make review part of the operating model instead of an afterthought."
      />
      <WorkspaceSplit primary={listPanel} secondary={detailPanel} />

      <EntityEditorDialog
        open={editorMode !== null}
        mode={editorMode ?? 'create'}
        title={editorMode === 'edit' ? 'Edit agent' : 'Add agent'}
        description="Shared entity editor shell with domain-specific fields for role, model, and behavioral constraints."
        submitLabel={editorMode === 'edit' ? 'Save agent' : 'Create agent'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        error={(createMutation.error ?? updateMutation.error) ?? null}
        onClose={() => setEditorMode(null)}
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Agent name" error={form.formState.errors.name?.message}>
            <input className={fieldClassName} {...form.register('name')} />
          </FormField>
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <select className={selectClassName} {...form.register('role')}>
              {agentRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Chosen model" error={form.formState.errors.modelId?.message}>
            <select className={selectClassName} {...form.register('modelId')}>
              <option value="">Select a model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" error={form.formState.errors.status?.message}>
            <select className={selectClassName} {...form.register('status')}>
              {agentStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Instruction" hint="Visible mission for the agent" error={form.formState.errors.instructions?.message}>
          <textarea className={textAreaClassName} {...form.register('instructions')} />
        </FormField>

        <FormField label="System prompt" hint="Behavioral baseline" error={form.formState.errors.systemPrompt?.message}>
          <textarea className={textAreaClassName} {...form.register('systemPrompt')} />
        </FormField>

        <label className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200/60 px-4 py-3">
          <span>
            <span className="block text-sm font-medium">Require human checkpoint</span>
            <span className="mt-1 block text-xs text-base-content/55">
              Recommended for lead, architecture, and review-oriented agents.
            </span>
          </span>
          <input type="checkbox" className="toggle toggle-primary" {...form.register('humanCheckpoint')} />
        </label>
      </EntityEditorDialog>
    </>
  )
}