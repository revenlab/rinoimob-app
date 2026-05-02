export enum TriggerType {
  LEAD_CREATED = 'LEAD_CREATED',
  LEAD_STATUS_CHANGED = 'LEAD_STATUS_CHANGED',
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_COMPLETED = 'TASK_COMPLETED',
  LEAD_NO_ACTIVITY = 'LEAD_NO_ACTIVITY'
}

export enum ConditionType {
  LEAD_STATUS_IS = 'LEAD_STATUS_IS',
  LEAD_ASSIGNED_TO = 'LEAD_ASSIGNED_TO',
  TASK_OVERDUE = 'TASK_OVERDUE',
  CUSTOM_FIELD_VALUE = 'CUSTOM_FIELD_VALUE'
}

export enum ActionType {
  SEND_WHATSAPP = 'SEND_WHATSAPP',
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_TASK = 'CREATE_TASK',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  UPDATE_LEAD_STATUS = 'UPDATE_LEAD_STATUS',
  ASSIGN_LEAD = 'ASSIGN_LEAD',
  WAIT = 'WAIT'
}

export enum WhatsappRecipientType {
  LEAD = 'LEAD',
  ASSIGNED_USER = 'ASSIGNED_USER',
  CUSTOM_NUMBER = 'CUSTOM_NUMBER'
}

export interface SendWhatsappActionParams {
  instanceId: string
  recipientType: WhatsappRecipientType | string
  recipientValue?: string        // For CUSTOM_NUMBER
  recipientPhone?: string        // For ASSIGNED_USER (optional override)
  message?: string
  messageTemplate?: string
}

export enum NodeType {
  TRIGGER = 'TRIGGER',
  CONDITION = 'CONDITION',
  ACTION = 'ACTION',
  END = 'END'
}

export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: {
    triggerType?: TriggerType
    conditionType?: ConditionType
    actionType?: ActionType
    parameters?: Record<string, any>
    label?: string
  }
}

export interface WorkflowEdge {
  source: string
  target: string
  label?: string
  id?: string
}

export interface WorkflowConfig {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface AutomationWorkflow {
  id: string
  name: string
  description?: string
  isActive: boolean
  workflowConfig: WorkflowConfig
  version: number
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateAutomationWorkflowRequest {
  name: string
  description?: string
  workflowConfig: WorkflowConfig
}

export interface UpdateAutomationWorkflowRequest {
  name?: string
  description?: string
  workflowConfig?: WorkflowConfig
  isActive?: boolean
}

export interface TestWorkflowRequest {
  triggerEvent: string
  triggerData: Record<string, any>
}

export interface AutomationExecution {
  id: string
  workflowId: string
  triggerEvent: string
  executionPath: string[]
  status: WorkflowExecutionStatus
  errorMessage?: string
  resultData?: Record<string, any>
  createdAt: Date
  completedAt?: Date
}
