import { zodResolver } from '@hookform/resolvers/zod'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Network, Pencil, Plus, Play, Trash2, UserRoundCheck } from 'lucide-react'
import { z } from 'zod'
import { useAgentsQuery } from '../agents/api'
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
import { teamStatusOptions } from '../../lib/domain'
import type { Team, TeamDiscussion } from '../../lib/domain'
import { useUiStore } from '../../stores/ui-store'
import { useTeamMutations, useTeamsQuery } from './api'

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters.'),
  leadAgentId: z.string().min(1, 'Choose a lead agent.'),
  memberAgentIds: z.array(z.string()).max(10, 'Teams can have at most 10 members.'),
  objective: z.string().min(20, 'Objective should be at least 20 characters.'),
  status: z.enum(teamStatusOptions),
})

type TeamFormValues = z.infer<typeof teamSchema>

const emptyTeamForm: TeamFormValues = {
  name: '',
  leadAgentId: '',
  memberAgentIds: [],
  objective: '',
  status: 'forming',
}

export function TeamsPage() {
  const compactMode = useUiStore((state) => state.compactMode)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null)
  const [discussionPrompt, setDiscussionPrompt] = useState('')
  const [discussionTarget, setDiscussionTarget] = useState<'team' | 'agent'>('team')
  const [targetAgentId, setTargetAgentId] = useState('')
  const [discussion, setDiscussion] = useState<TeamDiscussion | null>(null)
  const { data: teams = [], isLoading, error, refetch } = useTeamsQuery()
  const { data: agents = [] } = useAgentsQuery()
  const { createMutation, updateMutation, deleteMutation, discussionMutation } = useTeamMutations()
  const effectiveSelectedTeamId = selectedTeamId ?? teams[0]?.id ?? null

  const selectedTeam = teams.find((team) => team.id === effectiveSelectedTeamId) ?? teams[0] ?? null

  const filteredTeams = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase()
    if (!needle) {
      return teams
    }

    return teams.filter((team) =>
      [team.name, team.objective].some((value) => value.toLowerCase().includes(needle)),
    )
  }, [deferredSearch, teams])

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: emptyTeamForm,
  })
  const watchedMembers = useWatch({
    control: form.control,
    name: 'memberAgentIds',
  }) ?? []

  useEffect(() => {
    if (!editorMode) {
      return
    }

    if (editorMode === 'edit' && selectedTeam) {
      form.reset({
        name: selectedTeam.name,
        leadAgentId: selectedTeam.leadAgentId,
        memberAgentIds: selectedTeam.memberAgentIds,
        objective: selectedTeam.objective,
        status: selectedTeam.status,
      })
      return
    }

    form.reset({
      ...emptyTeamForm,
      leadAgentId: agents[0]?.id ?? '',
    })
  }, [agents, editorMode, form, selectedTeam])

  async function onSubmit(values: TeamFormValues) {
    if (editorMode === 'edit' && selectedTeam) {
      await updateMutation.mutateAsync({ id: selectedTeam.id, payload: values })
      setEditorMode(null)
      return
    }

    const created = await createMutation.mutateAsync(values)
    setSelectedTeamId(created.id)
    setEditorMode(null)
  }

  async function runDiscussion(team: Team) {
    const result = await discussionMutation.mutateAsync({
      id: team.id,
      payload: {
        prompt: discussionPrompt,
        target: discussionTarget,
        targetAgentId: discussionTarget === 'agent' ? targetAgentId : undefined,
      },
    })
    setDiscussion(result)
  }

  const listPanel = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input input-ghost w-full px-0 text-sm"
          placeholder="Search teams or objectives"
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditorMode('create')}>
          <Plus className="size-4" />
          Add team
        </button>
      </div>

      {error ? <ErrorPane error={error} onRetry={() => void refetch()} /> : null}

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-32 rounded-[1.5rem]" />
            ))
          : filteredTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  setSelectedTeamId(team.id)
                  setDiscussion(null)
                }}
                className={`w-full rounded-[1.5rem] border bg-base-100 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedTeam?.id === team.id
                    ? 'border-primary/60 ring-2 ring-primary/15'
                    : 'border-base-300'
                } ${compactMode ? 'space-y-3' : 'space-y-4'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-base-content">{team.name}</h3>
                      <StatusBadge status={team.status} />
                    </div>
                    <p className="mt-2 text-sm text-base-content/70 line-clamp-2">{team.objective}</p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {team.memberAgentIds.length} members
                  </span>
                </div>
              </button>
            ))}
      </div>
    </div>
  )

  const detailPanel = selectedTeam ? (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Team orchestration
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{selectedTeam.name}</h3>
            <p className="mt-2 text-sm text-base-content/70">{selectedTeam.objective}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditorMode('edit')}>
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              type="button"
              className="btn btn-outline btn-error btn-sm"
              onClick={() => void deleteMutation.mutateAsync(selectedTeam.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-base-200/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
              Team lead agent
            </p>
            <p className="mt-3 text-sm font-medium">
              {agents.find((agent) => agent.id === selectedTeam.leadAgentId)?.name ?? 'Unassigned'}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-base-200/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
              Member count
            </p>
            <p className="mt-3 text-sm font-medium">{selectedTeam.memberAgentIds.length} of 10</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-base-300 bg-base-200/20 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-base-content/50">
            Assigned members
          </h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTeam.memberAgentIds.length === 0 ? (
              <span className="text-sm text-base-content/60">No members assigned yet.</span>
            ) : (
              selectedTeam.memberAgentIds.map((memberId) => (
                <span key={memberId} className="badge badge-outline gap-2 px-3 py-3">
                  <UserRoundCheck className="size-3.5" />
                  {agents.find((agent) => agent.id === memberId)?.name ?? memberId}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-base-300 bg-neutral p-6 text-neutral-content shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-content/60">
              Human-in-the-loop discussion
            </p>
            <p className="mt-2 text-sm text-neutral-content/75">
              Start a deterministic mock discussion with an explicit decision interface and final conclusion.
            </p>
          </div>
          <div className="badge badge-outline border-white/20 text-neutral-content">
            Decision interface visible
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <textarea
            value={discussionPrompt}
            onChange={(event) => setDiscussionPrompt(event.target.value)}
            className="textarea textarea-bordered min-h-28 rounded-[1.5rem] border-white/10 bg-white/8 text-neutral-content placeholder:text-neutral-content/45"
            placeholder="State the hypothesis, intended outcome, and smallest useful validation step."
          />
          <div className="space-y-3 rounded-[1.5rem] bg-white/8 p-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-neutral-content/70">Target</span>
              <select
                className="select select-bordered rounded-2xl border-white/10 bg-white/8 text-neutral-content"
                value={discussionTarget}
                onChange={(event) => setDiscussionTarget(event.target.value as 'team' | 'agent')}
              >
                <option value="team">Whole team</option>
                <option value="agent">Single agent</option>
              </select>
            </label>
            {discussionTarget === 'agent' ? (
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-neutral-content/70">Specific agent</span>
                <select
                  className="select select-bordered rounded-2xl border-white/10 bg-white/8 text-neutral-content"
                  value={targetAgentId}
                  onChange={(event) => setTargetAgentId(event.target.value)}
                >
                  <option value="">Select agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={discussionMutation.isPending || discussionPrompt.trim().length < 12}
              onClick={() => void runDiscussion(selectedTeam)}
            >
              <Play className="size-4" />
              Run discussion
            </button>
          </div>
        </div>

        {discussionMutation.error ? <div className="mt-4"><ErrorPane error={discussionMutation.error} /></div> : null}

        <div className="mt-5 rounded-[1.5rem] bg-black/12 p-4">
          {!discussion ? (
            <p className="text-sm text-neutral-content/60">
              No active discussion yet. Use this area to make the handoff from instruction to reviewed conclusion explicit.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-content/55">
                  Prompt
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-content/90">{discussion.prompt}</p>
              </div>
              {discussion.messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-content/50">
                    {message.speaker}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-content/90">{message.body}</p>
                </div>
              ))}
              <div className="rounded-[1.5rem] border border-primary/30 bg-primary/10 p-4 text-primary-content">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Conclusion
                </p>
                <p className="mt-3 text-sm leading-6 text-base-content">{discussion.conclusion}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <EmptyState
      title="Create a team workspace"
      description="Compose a lead agent and up to ten members, then drive mock collaboration through a visible review loop."
      icon={<Network className="size-7" />}
      action={
        <button type="button" className="btn btn-primary" onClick={() => setEditorMode('create')}>
          Create team
        </button>
      }
    />
  )

  return (
    <>
      <PageHeader
        eyebrow="Teams"
        title="Team management with a visible decision interface"
        description="Assign a lead agent, cap the member list, and run instruction-driven collaboration that ends in an explicit conclusion rather than an opaque thread."
      />
      <WorkspaceSplit primary={listPanel} secondary={detailPanel} />

      <EntityEditorDialog
        open={editorMode !== null}
        mode={editorMode ?? 'create'}
        title={editorMode === 'edit' ? 'Edit team' : 'Add team'}
        description="Reusable editor shell shared across domains, with team-specific controls for lead assignment, capped membership, and objective framing."
        submitLabel={editorMode === 'edit' ? 'Save team' : 'Create team'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        error={(createMutation.error ?? updateMutation.error) ?? null}
        onClose={() => setEditorMode(null)}
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Team name" error={form.formState.errors.name?.message}>
            <input className={fieldClassName} {...form.register('name')} />
          </FormField>
          <FormField label="Status" error={form.formState.errors.status?.message}>
            <select className={selectClassName} {...form.register('status')}>
              {teamStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Lead agent" error={form.formState.errors.leadAgentId?.message}>
            <select className={selectClassName} {...form.register('leadAgentId')}>
              <option value="">Select lead agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="rounded-[1.5rem] border border-base-300 bg-base-200/40 p-4 text-sm text-base-content/70">
            Team members are capped at 10 and can be instructed as a group or as a specific agent during discussion runs.
          </div>
        </div>

        <FormField label="Objective" error={form.formState.errors.objective?.message}>
          <textarea className={textAreaClassName} {...form.register('objective')} />
        </FormField>

        <FormField label="Team members" hint={`${watchedMembers.length}/10 selected`} error={form.formState.errors.memberAgentIds?.message}>
          <div className="grid gap-3 rounded-[1.5rem] border border-base-300 bg-base-200/40 p-4 md:grid-cols-2">
            {agents.map((agent) => {
              const members = watchedMembers
              const checked = members.includes(agent.id)
              const maxed = members.length >= 10 && !checked

              return (
                <label key={agent.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${maxed ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    value={agent.id}
                    checked={checked}
                    disabled={maxed}
                    onChange={(event) => {
                      form.setValue(
                        'memberAgentIds',
                        event.target.checked
                          ? [...members, agent.id]
                          : members.filter((id) => id !== agent.id),
                        { shouldValidate: true },
                      )
                    }}
                  />
                  <span className="text-sm text-base-content/85">{agent.name}</span>
                </label>
              )
            })}
          </div>
        </FormField>
      </EntityEditorDialog>
    </>
  )
}