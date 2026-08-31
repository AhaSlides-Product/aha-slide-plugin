/** A pickable participant, identified and labelled from host-provided data. */
export interface Participant {
  id: string;
  name: string;
  emoji: string;
}

/** A formed group as written to slide attributes and read by the audience. */
export interface Group {
  id: string;
  memberIds: string[];
}

/** Slide-type-specific submission payload (the peers this participant picked). */
export interface PickAttributes {
  pickedPeerIds: string[];
}

/** Shape of the slide attributes this plugin persists. */
export interface SlideAttributes {
  groups?: Group[];
  roster?: Participant[];
  targetSize?: number;
  revealed?: boolean;
}
