declare module "dagre" {
  export interface GraphLabel {
    width?: number;
    height?: number;
    rankdir?: "TB" | "BT" | "LR" | "RL";
    marginx?: number;
    marginy?: number;
    nodesep?: number;
    ranksep?: number;
    edgesep?: number;
  }

  export interface NodeLabel {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  }

  export interface EdgeLabel {
    [key: string]: unknown;
  }

  export class Graph {
    constructor(options?: { directed?: boolean; multigraph?: boolean; compound?: boolean });
    setGraph(label: GraphLabel): void;
    graph(): GraphLabel | undefined;
    setDefaultEdgeLabel(callback: () => EdgeLabel): void;
    setNode(v: string, label: NodeLabel): void;
    node(v: string): NodeLabel | undefined;
    setEdge(v: string, w: string, label?: EdgeLabel): void;
    edge(v: string, w: string): EdgeLabel | undefined;
    nodes(): string[];
    edges(): Array<{ v: string; w: string }>;
    hasNode(v: string): boolean;
    hasEdge(v: string, w: string): boolean;
  }

  export const graphlib: {
    Graph: typeof Graph;
  };

  export function layout(g: Graph): void;
}
