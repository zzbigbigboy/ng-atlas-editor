import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import insertCss from 'insert-css';
import { thumb_image, yuan_image, yuan_images } from 'src/assets/js/thumb_image'
import WebGraphEditor from 'src/app/editor/components/webGraph-editor';
import { G6NodeInfo } from 'src/app/editor/components/graph-editor';
import { AppContext, EntityInfo } from '../mods/app.context';
// 我们用 insert-css 演示引入自定义样式
// 推荐将样式添加到自己的样式文件中
// 若拷贝官方代码，别忘了 npm install insert-css
insertCss(`
  .g6-tooltip {
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    font-size: 12px;
    color: #545454;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px 8px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  }
  .g6-minimap {
    position: absolute;
    top: 590px;
    left: 0px;
    z-index: 999;
  }
  .g6-minimap-container {
    // border: 1px solid #e2e2e2;
  }
  .g6-minimap-viewport {
    border: 2px solid rgb(25, 128, 255);
  }
`);
export enum BlurType {
  Node = '词条',
  Edge = '关系',
  Canvas = ''
}

const layouts = [

];

// Initial data
const data = {
  center: '',
  nodes: [],
  edges: [],
};

const newNodes: G6NodeInfo[] = [
  {
    id: 'newNode1',
    label: '人物',
    icon: '/assets/icons/圆点 (1).png',
    color: '#3382F7',
    type: 'customNode',
  } as G6NodeInfo,
  {
    id: 'newNode2',
    label: '事件',
    icon: '/assets/icons/圆点 (2).png',
    color: '#6FCF97',
    type: 'customNode',
  } as G6NodeInfo,
  {
    id: 'newNode3',
    label: '物品',
    icon: '/assets/icons/圆点 (3).png',
    color: '#F2994A',
    type: 'customNode',
  } as G6NodeInfo,
]
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less']
})
export class EditorComponent implements OnInit, OnDestroy {
  node = {} as any;
  edge = {} as any;
  nodeModel = {} as any;
  edgeModel = {} as any;
  BlurType = BlurType;
  type = BlurType.Canvas;
  newNodes = newNodes;
  copyNode = null;
  open = false;
  layouts = layouts;
  entities: EntityInfo[] = [];
  searchName = '';
  num = 20;
  beID: string = null;
  searchVisible = true;
  sizeChange = false;
  moveID: string;
  lesson: any = {} as any;
  graphInfo = {
    center: '',
    nodes: [],
    edges: [],
  };
  constructor(
    
  ) { }

  ngOnInit(): void {
    data.nodes = []; data.edges = []; data.center = '';
    this.initCallBackFun()
    WebGraphEditor.instance.setTemplateNodes(newNodes)
    this.initLesson()

    const that = this;
    // this.sizeChange = this.settings.layout.collapsed;
  }

  ngOnDestroy(): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    WebGraphEditor.instance.removeMouseEvent()
    if (g6Graph && g6Graph._cfg) {
      g6Graph.clear();
      g6Graph.destroy();
      console.log('destroy');
    }
  }

  initCallBackFun() {
    const that = this;
    WebGraphEditor.instance.addMenuListen(this.createMessage.bind(this), this.changeCanvasSize.bind(this))
  }

  createMessage(type: string, name: string): void {
    // this.message.create(type, `词条 ${name} 已经被引用`);
  }

  changeCanvasSize() {
    // if (this.settings) {
      const g6Graph = WebGraphEditor.instance.g6Graph;
    //   if (this.sizeChange !== this.settings.layout.collapsed) {
    //     const width = document.getElementById('editor').scrollWidth;
    //     const height = document.getElementById('editor').scrollHeight || 500;
    //     console.log(width, height)
    //     g6Graph.changeSize(width, height);
    //     this.sizeChange === this.settings.layout.collapsed
    //   }
    // }
  }

  initLesson() {
    // console.log(this.lesson)
    // if (this.lesson.graph) {
    //   const data1 = [];
    //   data1.map(d => {
    //     const obj: G6NodeInfo = d;
    //     const entity: EntityInfo = AppContext.instance.getPublicEntity(d.id);
    //     if (entity) {
    //       obj.img = obj.cover;
    //     }
    //     return obj;
    //   })
    //   data.nodes = data1.nodes || [];
    //   data.edges = data1.edges || [];
    //   data.center = data1.center || '';
    //   console.log(data)
    // }
    yuan_images(data.nodes, (list) => {
      data.nodes = list;
      this.initGraph();
    })
  }

  onSubmit(): void {
    console.log(data)
    if (this.lesson) {
      this.graphInfo.center = '';
      const nodes = [];
      data.nodes.map(d => {
        if (d.id !== WebGraphEditor.instance.getdefNode().id) {
          nodes.push(d)
          // nodes.push({
          //   id: d.id,
          //   name: d.label,
          //   x: d.x,
          //   y: d.y
          // });
        }
      })
      const edges = [];
      data.edges.map(d => {
        edges.push(d)
        // links.push({
        //   id: d.id,
        //   name: d.label,
        //   from: d.source,
        //   to: d.target,
        //   direction: 2,
        // });
      })
      this.graphInfo.nodes = nodes;
      this.graphInfo.edges = edges;
      console.log(this.graphInfo)
      // const graph = Base64.encode(JSON.stringify(this.graphInfo));
      history.go(-1);
      // this.lessonService.updateOne(this.lesson.uid, this.lesson.name, this.lesson.remark, graph).subscribe((result: LessonResp) => {
      //   console.log(result)
      //   history.go(-1);
      // });
    }
  }

  onBack(): void {
    history.go(-1);
  }

  onSearchList(): void {
    console.log(this.searchName)
    if (this.searchName === null || this.searchName === '') {
      this.entities = AppContext.instance.getPublicEntityOfLength(this.num);
    } else {
      this.entities = AppContext.instance.getPublicEntitysByName(this.searchName);
    }
  }

  initGraph(): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    console.log('initGraph')
    if (g6Graph && g6Graph._cfg) {
      g6Graph.clear();
      g6Graph.destroy();
      console.log('destroy')
    } else {
      for (let i = 0; i < data.nodes.length; i++) {
        if (data.nodes[i].id === WebGraphEditor.instance.getdefNode().id) {
          data.nodes.splice(i, 1)
          break;
        }
      }
    }
    data.nodes.push(WebGraphEditor.instance.getdefNode())
    WebGraphEditor.instance.setData(data);
    const that = this;
    g6Graph.on('node:click', (ev) => {
      const shape = ev.target;
      const node = ev.item;
      console.log(node)
      if (node) {
        if (node._cfg) {
          that.nodeModel = node._cfg.model;
        }
        that.node = node;
        that.type = BlurType.Node;
      }
    })
    g6Graph.on('edge:click', (ev) => {
      const shape = ev.target;
      const edge = ev.item;
      console.log(edge)
      if (edge) {
        if (edge._cfg) {
          that.edgeModel = edge._cfg.model;
        }
        that.edge = edge;
        that.type = BlurType.Edge;
      }
    })
    g6Graph.on('canvas:click', (ev) => {
      console.log('canvas:click')
      that.type = BlurType.Canvas;
      that.nodeModel = {};
      that.node = {};
      that.edge = {};
      that.edgeModel = {};
      that.beID = null;
    })
    WebGraphEditor.instance.addMouseEvent()
  }

  onBlurNodeLable(e): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    g6Graph.updateItem(this.node, this.nodeModel);
  }

  onBlurEdgeLable(e): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    g6Graph.updateItem(this.edge, this.edgeModel);
  }

  onDeleteNode(): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    if (this.type = BlurType.Node) {
      WebGraphEditor.instance.deleteNode(this.nodeModel.id);
    } else if (this.type = BlurType.Edge) {
      WebGraphEditor.instance.deleteEdge(this.edgeModel.id);
    }
    WebGraphEditor.instance.checkData();
  }

  onPasteNode(): void {
    const obj = { ...this.copyNode };
    const data = WebGraphEditor.instance.data;
    obj.id = 'node' + (data.nodes.length + 1);
    obj.x = this.copyNode.x + 20;
    obj.y = this.copyNode.y + 20;
    data.nodes.push(obj);
    WebGraphEditor.instance.setData(data);
    // WebGraphEditor.instance.checkData();
  }

  onChangeZoom(num: number): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    let zoom = g6Graph.getZoom() + num;
    const minZoom = g6Graph.getMinZoom();
    const maxZoom = g6Graph.getMaxZoom();
    if (zoom < maxZoom && zoom > minZoom) {
      g6Graph.zoomTo(zoom);
    }
  }

  onLayoutChange(): void {
    const g6Graph = WebGraphEditor.instance.g6Graph;
    // const width = document.getElementById('editor').scrollWidth;
    // const height = document.getElementById('editor').scrollHeight - 20 || 500;
    // if (value.width || value.height) {
    //   value.width = width - 300
    //   value.height = height
    // }
    g6Graph.cfg.animateCfg.duration = 500;
    g6Graph.updateLayout({
      type: 'circular',
    });
    console.log(g6Graph.cfg)
  }
}
