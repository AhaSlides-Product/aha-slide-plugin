import contract from '../contract/button.contract.json' with { type: 'json' };

export interface EnumProp {
  type: 'enum';
  values: string[];
  default: string;
  description: string;
  projectsTo: Record<string, unknown>;
  tokens: string[];
}

export interface BooleanProp {
  type: 'boolean';
  default: boolean;
  description: string;
  projectsTo: Record<string, unknown>;
  tokens: string[];
}

export interface SlotProp {
  type: 'slot';
  default: null;
  description: string;
  projectsTo: Record<string, unknown>;
  tokens: string[];
}

export type ContractProp = EnumProp | BooleanProp | SlotProp;

export interface WebComponentBinding {
  tag: string;
  package: string;
  wrapsNative: boolean;
  tier: string;
  note: string;
}

export interface ButtonContract {
  $schemaVersion: string;
  component: string;
  summary: string;
  sourceOfTruth: string;
  wraps: Record<string, { package: string; major: number; component: string }>;
  webComponent: WebComponentBinding;
  props: Record<string, ContractProp>;
  tokenBindings: { note: string; source: string; consumes: string[] };
}

export const buttonContract = contract as ButtonContract;

/** The `state` enum expands to the antd boolean props `disabled`/`loading`. */
export function expandState(state: string): { disabled: boolean; loading: boolean } {
  const prop = buttonContract.props.state as EnumProp;
  const expand = (prop.projectsTo as { expand: Record<string, { disabled: boolean; loading: boolean }> }).expand;
  const entry = expand[state];
  if (!entry) throw new Error(`Unknown Button state: ${state}`);
  return entry;
}
