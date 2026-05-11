import { zodResolver } from '@hookform/resolvers/zod'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { AlertTriangle, BrainCircuit, Cable, Pencil, Plus, SendHorizonal, Shield, Trash2 } from 'lucide-react'
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
  modelAuthTypeOptions,
  modelConnectionModeOptions,
  modelCapabilityOptions,
  modelDeploymentOptions,
  modelProviderOptions,
  modelStatusOptions,
} from '../../lib/domain'
import type { ChatMessage, ModelProfile } from '../../lib/domain'
import { apiMocksEnabled } from '../../lib/runtime'
import { useUiStore } from '../../stores/ui-store'
import { useModelMutations, useModelsQuery } from './api'
import { testBrowserDirectChat, testBrowserDirectConnection } from './live'

const modelSchema = z.object({
  name: z.string().min(2, 'Model name must be at least 2 characters.'),
  provider: z.enum(modelProviderOptions),
  deployment: z.enum(modelDeploymentOptions),
  connectionMode: z.enum(modelConnectionModeOptions),
  authType: z.enum(modelAuthTypeOptions),
  modelSlug: z.string().min(2, 'Model slug must be at least 2 characters.'),
  endpoint: z.string().min(5, 'Provide an endpoint or local base URL.'),
  credentialHint: z.string(),
  organization: z.string(),
  projectId: z.string(),
  region: z.string(),
  status: z.enum(modelStatusOptions),
  capabilities: z.array(z.enum(modelCapabilityOptions)).min(1, 'Select at least one capability.'),
  description: z.string().min(20, 'Describe what this model is best suited for.'),
}).superRefine((values, ctx) => {
  if (values.provider !== 'ollama' && values.connectionMode === 'browser-direct') {
    ctx.addIssue({
      code: 'custom',
      path: ['connectionMode'],
      message: 'Browser-direct mode is currently supported only for Ollama.',
    })
  }

  if (values.connectionMode === 'backend-proxy' && values.credentialHint.trim().length < 2) {
    ctx.addIssue({
      code: 'custom',
      path: ['credentialHint'],
      message: 'Add a backend credential or connector reference.',
    })
  }

  if (values.provider === 'google-gemma' && values.connectionMode === 'backend-proxy') {
    if (values.projectId.trim().length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['projectId'],
        message: 'Add a project identifier for cloud Gemma routing.',
      })
    }

    if (values.region.trim().length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['region'],
        message: 'Add a region for cloud Gemma routing.',
      })
    }
  }

  if (values.provider === 'ollama' && values.authType !== 'none') {
    ctx.addIssue({
      code: 'custom',
      path: ['authType'],
      message: 'Ollama browser-direct mode should not require browser-managed credentials.',
    })
  }
})

type ModelFormValues = z.infer<typeof modelSchema>

const emptyModelForm: ModelFormValues = {
  name: '',
  provider: 'ollama',
  deployment: 'local',
  connectionMode: 'browser-direct',
  authType: 'none',
  modelSlug: '',
  endpoint: '',
  credentialHint: '',
  organization: '',
  projectId: '',
  region: '',
  status: 'validating',
  capabilities: ['chat'],
  description: '',
}

const providerGuidance: Record<ModelProfile['provider'], {
  summary: string
  endpointHint: string
  credentialHint: string
  supportedModes: ModelFormValues['connectionMode'][]
  supportedAuthTypes: ModelFormValues['authType'][]
}> = {
  ollama: {
    summary: 'Browser-direct live tests are supported if the local Ollama daemon is reachable from the browser.',
    endpointHint: 'Usually http://localhost:11434',
    credentialHint: 'No browser-managed credential needed for typical local Ollama setups.',
    supportedModes: ['browser-direct', 'mock'],
    supportedAuthTypes: ['none'],
  },
  'github-copilot': {
    summary: 'Use a backend connector or relay. Direct browser credentials are not a safe or supported default path.',
    endpointHint: 'Relay or managed API endpoint exposed by your backend.',
    credentialHint: 'Connector or credential reference stored outside the browser.',
    supportedModes: ['backend-proxy', 'mock'],
    supportedAuthTypes: ['connector', 'oauth'],
  },
  'google-gemma': {
    summary: 'Treat hosted Gemma access as backend-proxy only unless you intentionally build a secure server-side integration.',
    endpointHint: 'Provider or relay base URL.',
    credentialHint: 'API key, service account, or connector reference stored server-side.',
    supportedModes: ['backend-proxy', 'mock'],
    supportedAuthTypes: ['api-key', 'oauth', 'connector'],
  },
  'generic-cloud': {
    summary: 'Generic cloud providers usually need a backend relay so secrets and provider policy stay outside the browser.',
    endpointHint: 'Provider or relay base URL.',
    credentialHint: 'Secret or connector reference held outside the browser.',
    supportedModes: ['backend-proxy', 'mock'],
    supportedAuthTypes: ['api-key', 'oauth', 'connector'],
  },
}

function canUseLiveBrowserPath(model: ModelProfile) {
  return model.provider === 'ollama' && model.connectionMode === 'browser-direct'
}

function requiresBackendConnector(model: ModelProfile) {
  return model.connectionMode === 'backend-proxy'
}

export function ModelsPage() {
  const compactMode = useUiStore((state) => state.compactMode)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [connectionNote, setConnectionNote] = useState<string | null>(null)
  const [liveConnectionError, setLiveConnectionError] = useState<Error | null>(null)
  const [liveChatError, setLiveChatError] = useState<Error | null>(null)
  const { data: models = [], isLoading, error, refetch } = useModelsQuery()
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    testConnectionMutation,
    testChatMutation,
  } = useModelMutations()
  const effectiveSelectedModelId = selectedModelId ?? models[0]?.id ?? null

  const selectedModel =
    models.find((model) => model.id === effectiveSelectedModelId) ?? models[0] ?? null

  const filteredModels = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase()
    if (!needle) {
      return models
    }

    return models.filter((model) =>
      [model.name, model.provider, model.modelSlug, model.description].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    )
  }, [deferredSearch, models])

  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: emptyModelForm,
  })
  const watchedProvider = useWatch({ control: form.control, name: 'provider' }) ?? 'ollama'
  const watchedConnectionMode = useWatch({ control: form.control, name: 'connectionMode' }) ?? 'browser-direct'
  const watchedAuthType = useWatch({ control: form.control, name: 'authType' }) ?? 'none'
  const watchedCapabilities = useWatch({
    control: form.control,
    name: 'capabilities',
  }) ?? []
  const currentGuidance = providerGuidance[watchedProvider]

  useEffect(() => {
    if (!editorMode) {
      return
    }

    if (editorMode === 'edit' && selectedModel) {
      form.reset({
        name: selectedModel.name,
        provider: selectedModel.provider,
        deployment: selectedModel.deployment,
        connectionMode: selectedModel.connectionMode,
        authType: selectedModel.authType,
        modelSlug: selectedModel.modelSlug,
        endpoint: selectedModel.endpoint,
        credentialHint: selectedModel.credentialHint,
        organization: selectedModel.organization,
        projectId: selectedModel.projectId,
        region: selectedModel.region,
        status: selectedModel.status,
        capabilities: selectedModel.capabilities,
        description: selectedModel.description,
      })
      return
    }

    form.reset(emptyModelForm)
  }, [editorMode, form, selectedModel])

  async function onSubmit(values: ModelFormValues) {
    if (editorMode === 'edit' && selectedModel) {
      await updateMutation.mutateAsync({ id: selectedModel.id, payload: values })
      setEditorMode(null)
      return
    }

    const created = await createMutation.mutateAsync(values)
    setSelectedModelId(created.id)
    setEditorMode(null)
  }

  async function runConnectionTest(model: ModelProfile) {
    setLiveConnectionError(null)
    setConnectionNote(null)

    try {
      if (canUseLiveBrowserPath(model)) {
        const result = await testBrowserDirectConnection(model)
        setConnectionNote(`${result.status} Checked ${new Date(result.checkedAt).toLocaleTimeString()}.`)
        return
      }

      if (requiresBackendConnector(model)) {
        setConnectionNote('This model requires a backend connector. A real connector has not been implemented in this frontend-only slice yet.')
        return
      }

      const result = await testConnectionMutation.mutateAsync(model.id)
      setConnectionNote(`${result.status} Checked ${new Date(result.checkedAt).toLocaleTimeString()}.`)
    } catch (error) {
      setLiveConnectionError(error instanceof Error ? error : new Error('Connection test failed.'))
    }
  }

  async function runChatTest() {
    if (!selectedModel || chatInput.trim().length < 4) {
      return
    }

    setLiveChatError(null)
    const prompt = chatInput.trim()
    setChatMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: prompt }])
    setChatInput('')

    try {
      if (canUseLiveBrowserPath(selectedModel)) {
        const result = await testBrowserDirectChat(selectedModel, prompt)
        setChatMessages((current) => [
          ...current,
          { id: crypto.randomUUID(), role: 'assistant', content: result.reply },
        ])
        return
      }

      if (requiresBackendConnector(selectedModel)) {
        setLiveChatError(new Error('This provider needs a backend connector before real chat tests can run from this UI.'))
        return
      }

      const result = await testChatMutation.mutateAsync({ id: selectedModel.id, prompt })
      setChatMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: result.reply },
      ])
    } catch (error) {
      setLiveChatError(error instanceof Error ? error : new Error('Chat test failed.'))
    }
  }

  const listPanel = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input input-ghost w-full px-0 text-sm"
          placeholder="Search models, providers, or capabilities"
        />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditorMode('create')}>
          <Plus className="size-4" />
          Add model
        </button>
      </div>

      {error ? <ErrorPane error={error} onRetry={() => void refetch()} /> : null}

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-32 rounded-[1.5rem]" />
            ))
          : filteredModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  setSelectedModelId(model.id)
                  setChatMessages([])
                  setConnectionNote(null)
                }}
                className={`w-full rounded-[1.5rem] border bg-base-100 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedModel?.id === model.id
                    ? 'border-primary/60 ring-2 ring-primary/15'
                    : 'border-base-300'
                } ${compactMode ? 'space-y-3' : 'space-y-4'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-base-content">{model.name}</h3>
                      <StatusBadge status={model.status} />
                    </div>
                    <p className="mt-2 text-sm capitalize text-base-content/65">
                      {model.provider.replace('-', ' ')} · {model.deployment}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                    {model.modelSlug}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((capability) => (
                    <span key={capability} className="badge badge-outline badge-sm capitalize">
                      {capability}
                    </span>
                  ))}
                </div>
              </button>
            ))}
      </div>
    </div>
  )

  const detailPanel = selectedModel ? (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Model registry
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{selectedModel.name}</h3>
            <p className="mt-2 text-sm text-base-content/65">{selectedModel.endpoint}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditorMode('edit')}>
              <Pencil className="size-4" />
              Edit
            </button>
            <button
              type="button"
              className="btn btn-outline btn-error btn-sm"
              onClick={() => void deleteMutation.mutateAsync(selectedModel.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-base-content/75">{selectedModel.description}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-base-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
              Connection mode
            </p>
            <p className="mt-3 text-sm font-medium capitalize">{selectedModel.connectionMode.replace('-', ' ')}</p>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
              Authentication
            </p>
            <p className="mt-3 text-sm font-medium capitalize">{selectedModel.authType.replace('-', ' ')}</p>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
              Credential reference
            </p>
            <p className="mt-3 text-sm font-medium">{selectedModel.credentialHint || 'None stored in UI'}</p>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-base-content/50">
              Registry status
            </p>
            <p className="mt-3 text-sm font-medium capitalize">{selectedModel.status}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selectedModel.capabilities.map((capability) => (
            <span key={capability} className="badge badge-outline capitalize">
              {capability}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-base-300 bg-base-200/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-base-content/50">
                Connectivity
              </h4>
              <p className="mt-2 text-sm text-base-content/70">
                {canUseLiveBrowserPath(selectedModel)
                  ? 'This model can be tested for real from the browser against a local Ollama daemon.'
                  : requiresBackendConnector(selectedModel)
                    ? 'This model needs a backend connector. The current frontend records the configuration but cannot complete a real cloud handshake by itself.'
                    : 'This model is in mock mode for demo and UI iteration.'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => void runConnectionTest(selectedModel)}
            >
              <Cable className="size-4" />
              {canUseLiveBrowserPath(selectedModel)
                ? 'Test live connection'
                : requiresBackendConnector(selectedModel)
                  ? 'Explain connector need'
                  : 'Simulate connection test'}
            </button>
          </div>
          {connectionNote ? <p className="mt-4 text-sm text-success">{connectionNote}</p> : null}
          {(liveConnectionError ?? testConnectionMutation.error) ? (
            <div className="mt-4">
              <ErrorPane error={liveConnectionError ?? testConnectionMutation.error ?? null} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-base-300 bg-neutral p-6 text-neutral-content shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-content/60">
              Ephemeral test chat
            </p>
            <p className="mt-2 text-sm text-neutral-content/75">
              {canUseLiveBrowserPath(selectedModel)
                ? 'Prompt the selected Ollama model without saving chat history.'
                : requiresBackendConnector(selectedModel)
                  ? 'Cloud chat is blocked here until a backend connector exists.'
                  : 'Prompt the selected model without saving chat history in demo mode.'}
            </p>
          </div>
          <span className="badge badge-outline border-white/20 text-neutral-content capitalize">
            {selectedModel.provider.replace('-', ' ')}
          </span>
        </div>

        <div className="mt-5 space-y-3 rounded-[1.5rem] bg-black/10 p-4">
          {chatMessages.length === 0 ? (
            <p className="text-sm text-neutral-content/60">
              Ask this model to summarize a risk, recommend a prompt, or simulate a response.
            </p>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ml-auto max-w-[85%] bg-primary text-primary-content'
                    : 'max-w-[90%] bg-white/10 text-neutral-content'
                }`}
              >
                {message.content}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            className="textarea textarea-bordered min-h-24 flex-1 rounded-2xl border-white/10 bg-white/8 text-neutral-content placeholder:text-neutral-content/45"
            placeholder="Test this model with a short prompt"
          />
          <button
            type="button"
            className="btn btn-primary self-end"
            disabled={testChatMutation.isPending || chatInput.trim().length < 4}
            onClick={() => void runChatTest()}
          >
            <SendHorizonal className="size-4" />
            Send
          </button>
        </div>
        {(liveChatError ?? testChatMutation.error) ? (
          <div className="mt-4">
            <ErrorPane error={liveChatError ?? testChatMutation.error ?? null} />
          </div>
        ) : null}
      </div>
    </div>
  ) : (
    <EmptyState
      title="Add your first model"
      description="Register local or cloud providers before assigning them to agents or testing them in the collaboration surface."
      icon={<BrainCircuit className="size-7" />}
      action={
        <button type="button" className="btn btn-primary" onClick={() => setEditorMode('create')}>
          Create model
        </button>
      }
    />
  )

  return (
    <>
      <PageHeader
        eyebrow="Models"
        title="Model management with explicit transport and credential boundaries"
        description="Track local and cloud models, make credential ownership explicit, and only present live tests where the browser has a real path to the provider."
      >
        <div className="alert border border-warning/30 bg-warning/10 text-warning-content shadow-sm">
          <AlertTriangle className="size-5 stroke-warning" />
          <div className="text-warning">
            <div className="font-semibold">
              {apiMocksEnabled
                ? 'Mock API transport is active for registry CRUD.'
                : 'Mock API transport is disabled.'}
            </div>
            <p className="mt-1 text-sm text-warning/80">
              Live browser-direct testing is currently implemented only for Ollama. GitHub Copilot, Google Gemma, and other cloud providers need a backend connector before this page can test them for real.
            </p>
          </div>
        </div>
      </PageHeader>
      <WorkspaceSplit primary={listPanel} secondary={detailPanel} />

      <EntityEditorDialog
        open={editorMode !== null}
        mode={editorMode ?? 'create'}
        title={editorMode === 'edit' ? 'Edit model' : 'Add model'}
        description="One reusable editor shell, domain-specific fields for providers, deployment, capabilities, and routing metadata."
        submitLabel={editorMode === 'edit' ? 'Save model' : 'Create model'}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        error={(createMutation.error ?? updateMutation.error) ?? null}
        onClose={() => setEditorMode(null)}
        onSubmit={form.handleSubmit((values) => void onSubmit(values))}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Model name" error={form.formState.errors.name?.message}>
            <input className={fieldClassName} {...form.register('name')} />
          </FormField>
          <FormField label="Provider" error={form.formState.errors.provider?.message}>
            <select className={selectClassName} {...form.register('provider')}>
              {modelProviderOptions.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Connection mode" error={form.formState.errors.connectionMode?.message}>
            <select className={selectClassName} {...form.register('connectionMode')}>
              {currentGuidance.supportedModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Authentication" error={form.formState.errors.authType?.message}>
            <select className={selectClassName} {...form.register('authType')}>
              {currentGuidance.supportedAuthTypes.map((authType) => (
                <option key={authType} value={authType}>
                  {authType}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Deployment" error={form.formState.errors.deployment?.message}>
            <select className={selectClassName} {...form.register('deployment')}>
              {modelDeploymentOptions.map((deployment) => (
                <option key={deployment} value={deployment}>
                  {deployment}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Runtime status" error={form.formState.errors.status?.message}>
            <select className={selectClassName} {...form.register('status')}>
              {modelStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>
          <div className="rounded-[1.5rem] border border-base-300 bg-base-200/40 p-4 text-sm leading-6 text-base-content/70 md:col-span-2">
            <div className="flex items-center gap-2 font-medium text-base-content">
              <Shield className="size-4 text-primary" />
              Provider guidance
            </div>
            <p className="mt-2">{currentGuidance.summary}</p>
          </div>
          <FormField label="Model slug" error={form.formState.errors.modelSlug?.message}>
            <input className={fieldClassName} {...form.register('modelSlug')} />
          </FormField>
          <FormField label="Endpoint" hint={currentGuidance.endpointHint} error={form.formState.errors.endpoint?.message}>
            <input className={fieldClassName} {...form.register('endpoint')} />
          </FormField>
        </div>

        {(watchedConnectionMode === 'backend-proxy' || watchedAuthType !== 'none') ? (
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Credential or connector reference" hint={currentGuidance.credentialHint} error={form.formState.errors.credentialHint?.message}>
              <input className={fieldClassName} {...form.register('credentialHint')} />
            </FormField>
            <FormField label="Organization or account" error={form.formState.errors.organization?.message}>
              <input className={fieldClassName} {...form.register('organization')} />
            </FormField>
            {watchedProvider === 'google-gemma' || watchedProvider === 'generic-cloud' ? (
              <>
                <FormField label="Project or tenant" error={form.formState.errors.projectId?.message}>
                  <input className={fieldClassName} {...form.register('projectId')} />
                </FormField>
                <FormField label="Region" error={form.formState.errors.region?.message}>
                  <input className={fieldClassName} {...form.register('region')} />
                </FormField>
              </>
            ) : null}
          </div>
        ) : null}

        <FormField label="Capabilities" error={form.formState.errors.capabilities?.message as string | undefined}>
          <div className="grid gap-3 rounded-[1.5rem] border border-base-300 bg-base-200/40 p-4 sm:grid-cols-2">
            {modelCapabilityOptions.map((capability) => (
              <label key={capability} className="flex items-center gap-3 text-sm text-base-content/80">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  value={capability}
                  checked={watchedCapabilities.includes(capability)}
                  onChange={(event) => {
                    const current = watchedCapabilities
                    form.setValue(
                      'capabilities',
                      event.target.checked
                        ? [...current, capability]
                        : current.filter((item) => item !== capability),
                      { shouldValidate: true },
                    )
                  }}
                />
                <span className="capitalize">{capability}</span>
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Description" error={form.formState.errors.description?.message}>
          <textarea className={textAreaClassName} {...form.register('description')} />
        </FormField>
      </EntityEditorDialog>
    </>
  )
}