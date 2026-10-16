export interface Run { text:string; size?:number; font?:string; bold?:boolean; italic?:boolean; color?:string; spacing?:number }
export interface Paragraph {runs:Run[];text:string;align:string;lineHeight:number;lineHeightPt:number|null;before:number;after:number;bullet:string|null;marginLeft:number;indent:number}
export interface Cell {paragraphs:Paragraph[]; fill:string; padding:number[]}
export interface Shape {id:number;x:number;y:number;w:number;h:number;rotation:number;background:boolean;type:string;fill?:string;border?:string;borderWidth?:number;geometry?:string;paragraphs?:Paragraph[];wrap?:boolean;padding?:number[];anchor?:string;fontScale?:number;role?:string;asset?:string;width?:number;height?:number;variants?:{src:string;width:number;height:number}[];columns?:number[];rows?:{height:number;cells:Cell[]}[]}
export interface Slide {number:number;title:string;background:string;shapes:Shape[]}
