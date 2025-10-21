
//
// Utility
//
export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

//
// Items
// 
export enum ItemType {
    NOTE = "note",
    IMG = "img",
    SCRAP = "scrap",
    LINE = "line"
}

export interface Item {
  type: ItemType,
  uuid: string,
  pos: Point,
  size: Size,
  isConnected: boolean; // have 1 or more connections
  isSelected?: boolean;
  isFrozen?: boolean;
}

export interface ImageItem extends Item {
  imgSrc: string;
}

export interface NoteItem extends Item {
  color: string,
  size: Size,
  text: string,
}

export interface ScrapItem extends Item {
  text: string,
  font: string,
  effect: string
}

export interface LineItem {
  start: Point,
  end: Point,
  startUuid?: string, // uuid of item at start of string
  endUuid?: string,
  uuid: string,
}

//
// Data
// 
export interface State {
  items: Record<string, Item>,
  lines: LineItem[]
}