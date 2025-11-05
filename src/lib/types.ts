export interface SliceState {
  id: string;
  active: boolean;
}

export interface CircleState {
  id: string;
  divisions: number;
  slices: SliceState[];
}

export interface CircleGroup {
  id: string;
  circles: CircleState[];
}

export type Mode = 'select' | 'erase' | 'drag' | 'amplify' | 'divide' | 'duplicate';

export type PickedItem = {
  type: 'slice';
  sourceGroupId: string;
  sourceCircleId: string;
  sliceIndex: number;
  divisions: number;
} | {
  type: 'group';
  sourceGroupId: string;
  divisions: number;
  sliceCount: number;
};

    