import G6 from '@antv/g6';
import WebGraphEditor from './webGraph-editor';

export interface G6GraphInfo {
    nodes: G6NodeInfo[];
    edges: G6EdgeInfo[];
}

export interface G6NodeInfo {
    id: string;
    label: string;
    x: number;
    y: number;
    size: number[];
    type: string;
    cover: string;
    icon: string;
    color: string;
    img: string;
    style: any;
}

export interface G6EdgeInfo {
    id: string;
    label: string;
    source: string;
    target: string;
}

const fixSelectedItems = {
    fixAll: true,
    fixState: 'yourStateName', // 'selected' by default
};
const minimap = new G6.Minimap({
    size: [280, 175],
    // type: "keyShape",
});
const defNode: G6NodeInfo = {
    id: 'defNode',
    label: '',
    x: 0,
    y: 0,
    type: 'circle',
    size: [40],
    // zIndex: 0,
    style: {
        fill: 'rgba(24,144,255,0.1)',
        stroke: '#5B8FF9',
        lineWidth: 2,
        lineDash: [5],
    },
} as G6NodeInfo;

export default abstract class GraphEditor {
    protected _data: G6GraphInfo = {
        nodes: [],
        edges: [],
    };
    protected _graph;
    // protected copyNodeFun: Function;
    protected messageFun: any;
    protected changeSizeFun: any;
    protected moveID: string;
    protected open = false;
    protected defNode: G6NodeInfo = defNode;

    protected constructor() {
        const width = document.getElementById('editor').scrollWidth;
        const height = document.getElementById('editor').scrollHeight || 500;

        this._graph = new G6.Graph({
            container: 'editor',
            width,
            height,
            animate: true,
            linkCenter: true,
            plugins: [this.contextMenu(), minimap],
            minZoom: 0.6,
            maxZoom: 2,
            animateCfg: {
                duration: 10, // Number，一次动画的时长
            },
            // The sets of behavior modes
            modes: {
                // Defualt mode
                default: ['drag-node', 'drag-canvas',
                    {
                        type: 'zoom-canvas',
                        fixSelectedItems,
                    },
                ],
                // Adding node mode
                addNode: ['click-add-node'],
                // Adding edge mode
                addEdge: ['click-add-edge', 'drag-node', 'drag-canvas',
                    {
                        type: 'zoom-canvas',
                        fixSelectedItems,
                    },
                ],
            },
            defaultNode: {
                size: [40],
                clipCfg: {
                    show: true,
                    type: 'circle',
                    r: 20,
                    width: 40,
                    height: 40,
                },
                style: {
                    // fill: '#3382F7',
                    stroke: '#fff',
                    lineWidth: 3,
                    cursor: 'move',
                    shadowColor: 'rgba(32, 39, 48, 0.3)',
                    shadowBlur: 10,
                },
                labelCfg: {
                    style: {
                        fill: '#666',
                        fontSize: 14,
                        cursor: 'pointer',
                    },
                    position: 'bottom',
                },
            },
            defaultEdge: {
                type: 'quadratic',
                style: {
                    lineWidth: 2,
                    cursor: 'pointer',
                    endArrow: {
                        path: G6.Arrow.triangle(10, 15, 10),
                    },
                },
                labelCfg: {
                    autoRotate: true,
                    style: {
                        cursor: 'pointer',
                        background: {
                            fill: '#fff',
                            stroke: '#9EC9FF',
                            padding: [5, 5, 5, 5],
                            radius: 10,
                        },
                    },
                },
            },
        });
        this.g6RegisterBehavior();
        this._graph.data(this._data);
        this._graph.render();
        this._graph.changeData(this._data);
        this.hideNode(this.getdefNode().id);
        this.changeGraphState('show', true);
    }

    public contextMenu() {
        const that = this;
        const contextMenu = new G6.Menu({
            getContent(g6Graph) {
                console.log('g6Graph', g6Graph);
                if (g6Graph.item._cfg.type === 'node') {
                    return `<div style="">
                    <div class="delete" style="cursor: pointer; padding: 5px" onmouseover="this.style.background='rgba(114,195,253,0.3)';" onmouseout="this.style.background='';">删除</div>
                    </div>`;
                } else {
                    return `<div style="">
                    <div class="delete" style="cursor: pointer; padding: 5px" onmouseover="this.style.background='rgba(114,195,253,0.3)';" onmouseout="this.style.background='';">删除</div>
                    </div>`;
                }
            },
            handleMenuClick: (target, item) => {
                // document.getElementById('editor').className
                if (target.className === 'copy') {
                    // that.copyNodeFun(item._cfg.model);
                    that.messageFun('error', 'node.label');
                } else if (target.className === 'delete') {
                    if (item._cfg.type === 'node') {
                        console.log(item._cfg.id);
                        that.deleteNode(item._cfg.id);
                    } else if (item._cfg.type === 'edge') {
                        that.deleteEdge(item._cfg.id);
                    }
                    console.log(that._data);
                    // that._graph.changeData(that._data);
                }
                console.log(target.className, item);
            },
            // shouldBegin: (evt: G6Event) => console.log(evt),
            // offsetX and offsetY include the padding of the parent container
            // 需要加上父级容器的 padding-left 16 与自身偏移量 10
            offsetX: 0,
            // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
            offsetY: 0,
            // the types of items that allow the menu show up
            // 在哪些类型的元素上响应
            itemTypes: ['node', 'edge'],
        });
        return contextMenu;
    }

    public g6RegisterBehavior() {
        const that = this;
        let source: any; let target: any;
        // Register a custom behavior: click two end nodes to add an edge
        G6.registerBehavior('click-add-edge', {
            // Set the events and the corresponding responsing function for this behavior
            getEvents() {
                return {
                    // 'node:click': 'onClick', // The event is canvas:click, the responsing function is onClick
                    'node:mousedown': 'onClick', // The event is canvas:click, the responsing function is onClick
                    'node:mouseup': 'onClick', // The event is canvas:click, the responsing function is onClick
                    mousemove: 'onMousemove', // The event is mousemove, the responsing function is onMousemove
                    'edge:click': 'onEdgeClick', // The event is edge:click, the responsing function is onEdgeClick
                    'edge:mouseup': 'onEdgeClick', // The event is canvas:click, the responsing function is onClick
                };
            },
            // The responsing function for node:click defined in getEvents
            onClick(ev) {
                const self = this;
                const node = ev.item;
                const g6Graph = self.graph;
                // The position where the mouse clicks
                const point = { x: ev.x, y: ev.y };
                const model = node.getModel();
                console.log(model);
                if (self.addingEdge && self.edge) {
                    target = model.id;
                    const edge = that.getSourceByEdge(source);
                    if (source === target) { // 禁止edge连接自己
                        console.log('连接了自己');
                        self.addingEdge = false;
                        self.edge = null;
                        g6Graph.setMode('default');
                        g6Graph.changeData(that._data);
                        that.changeGraphState('show', true);
                        return false;
                    }
                    if (edge && edge.target === target) { // 禁止edge重复连接
                        self.addingEdge = false;
                        self.edge = null;
                        g6Graph.setMode('default');
                        g6Graph.changeData(that._data);
                        that.changeGraphState('show', true);
                        return false;
                    }
                    console.log('onClick1');
                    // 建立edge连线
                    self.edge._cfg.model.label = 'label';
                    console.log(self.edge);
                    g6Graph.updateItem(self.edge, {
                        target: model.id,
                    });
                    const edges = g6Graph.save().edges;
                    that._data.edges = edges;
                    g6Graph.setMode('default');
                    g6Graph.changeData(that._data);
                    self.edge = null;
                    self.addingEdge = false;
                    // that.beID = null;
                    that.changeGraphState('show', true);
                } else {
                    source = model.id;
                    console.log(source, target);
                    // Add anew edge, the end node is the current node user clicks
                    self.edge = g6Graph.addItem('edge', {
                        source: model.id,
                        target: model.id,
                    });
                    self.addingEdge = true;
                    console.log('onClick2');
                }
            },
            // The responsing function for mousemove defined in getEvents
            onMousemove(ev) {
                // console.log('onMousemove')
                const self = this;
                // The current position the mouse clicks
                const point = { x: ev.x, y: ev.y };
                if (self.addingEdge && self.edge) {
                    // Update the end node to the current node the mouse clicks
                    self.graph.updateItem(self.edge, {
                        target: point,
                    });
                }
            },
            // The responsing function for edge:click defined in getEvents
            onEdgeClick(ev) {
                console.log('onEdgeClick');
                const self = this;
                const currentEdge = ev.item;
                if (self.addingEdge && self.edge === currentEdge) {
                    self.graph.removeItem(self.edge);
                    self.edge = null;
                    self.addingEdge = false;
                }
                that._graph.setMode('default');
                that._graph.changeData(that._data);
                that.changeGraphState('show', true);
            },
        });


        // 注册自定义节点
        const nodeDefinition = {
            // 绘制节点
            drawShape(cfg, group) {
                console.log(cfg);
                const shapeType = this.shapeType;
                const style = Object.assign({}, this.getShapeStyle(cfg), {
                    x: 0,
                    y: 0,
                    r: 20,
                    width: 40,
                    height: 40,
                });
                console.log(style);
                const shape = group.addShape(shapeType, {
                    attrs: style,
                    name: 'key-shape',
                });
                // 绘制节点里面的小圆。点击这个小圆会显示tooltip
                group.addShape('image', {
                    name: 'circle-shape',
                    attr: {
                        x: 22,
                        y: -8,
                        r: 10,
                        fill: '',
                        cursor: 'pointer',
                        img: '/assets/icons/加号.png',
                        width: 15,
                        height: 15,
                        zIndex: 0,
                    }
                });
                return shape;
            },
            // 响应状态变化
            setState(name, value, item) {
                const group = item.getContainer();
                const shape = group.get('children')[1]; // 顺序根据 draw 时确定
                console.log(name, value);
                if (name === 'show') {
                    shape.attr({
                        x: 22,
                        y: -8,
                        r: 10,
                        fill: '',
                        cursor: 'pointer',
                        img: '/assets/icons/加号.png',
                        width: 15,
                        height: 15,
                        zIndex: 0,
                    });
                }
                if (name === 'hide') {
                    shape.attr({
                        x: 0,
                        y: 0,
                        r: 10,
                        fill: '',
                        cursor: 'pointer',
                        img: '',
                        width: 0,
                        height: 0,
                        zIndex: 0,
                    });
                }
            },
        };
        G6.registerNode(
            'customNode',
            nodeDefinition,
            'circle',
        );
        G6.registerNode(
            'imageNode',
            nodeDefinition,
            'image',
        );
    }



    public setData(data) {
        this._data = data;
        this._graph.changeData(this._data);
        this.hideNode(this.getdefNode().id);
        this.changeGraphState('show', true);
    }

    public get data(): G6GraphInfo {
        return this._data;
    }

    public get g6Graph(): any {
        return this._graph;
    }

    public getdefNode(): G6NodeInfo {
        return this.defNode;
    }

    public addMenuListen(messageFun: () => {}, changeSizeFun: () => {}) { // 添加回调函数
        this.messageFun = messageFun;
        this.changeSizeFun = changeSizeFun;
    }

    public showNode(id: string): void {
        const node1 = this._graph.findById(id);
        this._graph.showItem(node1);
    }

    public hideNode(id: string): void {
        const node1 = this._graph.findById(id);
        this._graph.hideItem(node1);
    }

    public getSourceByEdge(source): any {
        for (const edge of this._data.edges) {
            if (edge.source === source) {
                return edge;
            }
        }
        return null;
    }

    public getTargetByEdge(target): any {
        for (const edge of this._data.edges) {
            if (edge.target === target) {
                return edge;
            }
        }
        return null;
    }

    public deleteNode(id) {
        for (let i = 0; i < this._data.nodes.length; i++) {
            if (this._data.nodes[i].id === id) {
                this._data.nodes.splice(i, 1);
                this._graph.removeItem(id);
                break;
            }
        }
        this.deleteEdgeOfNodeID(id);
    }

    public deleteEdgeOfNodeID(id) {
        for (let i = 0; i < this._data.edges.length; i++) {
            if (this._data.edges[i].source === id || this._data.edges[i].target === id) {
                this._data.edges.splice(i, 1);
                i--;
            }
        }
    }

    public deleteEdge(id) {
        for (let i = 0; i < this._data.edges.length; i++) {
            if (this._data.edges[i].id === id) {
                this._data.edges.splice(i, 1);
                this._graph.removeItem(id);
                break;
            }
        }
    }

    public hashNodeById(id: string): boolean {
        for (const node of this._data.nodes) {
            if (node.id === id) {
                this.messageFun('error', node.label);
                return true;
            }
        }
        return false;
    }

    public changeGraphState(state: string, value: boolean) {
        this._data.nodes.forEach(d => {
            this._graph.setItemState(d.id, state, value);
        });
    }
}
