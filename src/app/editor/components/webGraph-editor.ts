import { yuan_image } from 'src/assets/js/thumb_image';
import GraphEditor, { G6GraphInfo, G6NodeInfo } from './graph-editor';
import G6 from '@antv/g6';
import { AppContext, EntityInfo } from 'src/app/mods/app.context';

let mouseDownEvent: any;
let mouseUpEvent: any;

export default class WebGraphEditor extends GraphEditor {
  private static _instance: WebGraphEditor;
  private templateNodes: G6NodeInfo[] = [];
  private newNode: any;

  public static get instance(): WebGraphEditor {
    if (!this._instance) {
      this._instance = new WebGraphEditor();
    } else {
      // console.log('lazy loading singleton has created');
    }
    return this._instance;
  }

  initWebGraphEvent() {}

  public setTemplateNodes(nodes: G6NodeInfo[]) {
    this.templateNodes = nodes;
  }

  public getNodeOfNews(id): any {
    for (const node of this.templateNodes) {
      if (node.id === id) {
        return node;
      }
    }
    const newNode: EntityInfo = AppContext.instance.getPublicEntity(id);
    if (newNode) {
      return {
        ...newNode,
        id: newNode.uid,
        name: newNode.name,
        type: newNode.cover ? 'imageNode' : 'customNode	',
        color: '#3382F7',
      };
    }
    return null;
  }

  public checkData() {
    this._graph.changeData(this._data);
  }

  public addMouseEvent() {
    this.G6Events();
    mouseDownEvent = this.mouseDownEvent.bind(this);
    mouseUpEvent = this.mouseUpEvent.bind(this);
    document.addEventListener('mousedown', mouseDownEvent, false); // 点击鼠标时触发事件
    document.addEventListener('mouseup', mouseUpEvent, false); // 按下键盘按键时触发事件
    document.onkeydown = (e) => {
      console.log(this.moveID);
      if (e.keyCode === 46 || e.keyCode === 8) {
        if (this.moveID) {
          this.deleteNode(this.moveID);
          this.deleteEdge(this.moveID);
          this._graph.changeData(this._data);
          this.moveID = null;
        }
      }
    };
  }

  public removeMouseEvent(): void {
    console.log('remove');
    document.removeEventListener('mousedown', mouseDownEvent, false); // 点击鼠标时触发事件
    document.removeEventListener('mouseup', mouseUpEvent, false); // 按下键盘按键时触发事件
  }

  public mouseDownEvent(event): void {
    // 鼠标左键点下
    console.log(this.data);
    const dom: any = event.target;
    if (dom.tagName === 'IMG') {
      if (this.hashNodeById(dom.id)) {
        console.log(dom.id);
        return;
      }
      const newNode = this.getNodeOfNews(dom.id);
      if (newNode) {
        console.log(newNode);
        this.newNode = newNode;
        this.open = true;
        this.defNode.style.stroke = newNode.color;
        this.showNode(this.defNode.id);
      }
      this._graph.cfg.animateCfg.duration = 10;
    }
  }

  public mouseUpEvent(event): void {
    // 鼠标左键抬起
    const dom: any = event.target;
    if (this.open) {
      this._data.nodes.forEach((node) => {
        if (node.id === this.defNode.id) {
          console.log(dom.tagName);
          if (dom.tagName === 'CANVAS') {
            const obj = {
              // ...this.newNode,
              id: this.newNode.uid
                ? this.newNode.uid
                : '-' + new Date().getTime(),
              label: this.newNode.name || this.newNode.label,
              x: 0,
              y: 0,
              type: this.newNode.type,
              cover: this.newNode.cover,
              style: {
                fill:
                  this.newNode.type === 'imageNode' ? '' : this.newNode.color,
                stroke: '#fff',
                lineWidth: 3,
                cursor: 'move',
                shadowColor: 'rgba(32, 39, 48, 0.3)',
                shadowBlur: 10,
              },
              img: this.newNode.cover,
            } as G6NodeInfo;
            obj.x = node.x;
            obj.y = node.y;
            console.log(obj);
            if (obj.img) {
              // Img存在裁剪图片
              yuan_image(obj.img).then((imgString: string) => {
                obj.img = imgString;
                this._data.nodes.push(obj);
                this._graph.changeData(this._data);
                const item = this._graph.findById(obj.id);
                this.changeGraphState('show', true);
                if (item) {
                  this._graph.refreshItem(item);
                }
                this._graph.changeData(this._data);
              });
            } else {
              this._data.nodes.push(obj);
              this._graph.changeData(this._data);
              const item = this._graph.findById(obj.id);
              this.changeGraphState('show', true);
              if (item) {
                this._graph.refreshItem(item);
              }
              this._graph.changeData(this._data);
              console.log(item);
            }
          }
        }
      });
      this.open = false;
      this.hideNode(this.defNode.id);
      // this._graph.changeData(this._data);
    }
    console.log('mouse up');
  }

  public G6Events() {
    const that = this;
    this._graph.on('edge:mousemove', (ev) => {
      that.moveID = ev.item._cfg.id;
    });
    // 读取位置
    this._graph.on('node:mousemove', (ev) => {
      // const node = ev.item;
      // g6Graph.setItemState(node, 'show', true);
      that.moveID = ev.item._cfg.id;
      if (that.open) {
        this._data.nodes.forEach((node) => {
          if (node.id === that.defNode.id) {
            node.x = ev.x;
            node.y = ev.y;
            this._graph.refreshItem(node.id);
            console.log('node update1');
          }
        });
      }
    });
    this._graph.on('canvas:mousemove', (ev) => {
      that.moveID = null;
      if (that.open) {
        this._data.nodes.forEach((node) => {
          if (node.id === that.defNode.id) {
            node.x = ev.x;
            node.y = ev.y;
            this._graph.refreshItem(node.id);
            console.log('node update1');
          }
        });
      } else {
        // that.setDefNodePosition();
      }
      that.changeSizeFun();
    });
    that._graph.on('circle-shape:mousedown', (evt) => {
      console.log('点击了小圆');
      that._graph.setMode('addEdge');
      that.changeGraphState('hide', true);
    });
    // 创建边
    that._graph.on('aftercreateedge', (e) => {
      console.log('创建边');
      e.edge._cfg.model.label = 'label';
      const edges = that._graph.save().edges;
      G6.Util.processParallelEdges(edges);
      that._graph.getEdges().forEach((edge, i) => {
        that._graph.updateItem(edge, edges[i]);
      });
      that._data.edges = edges;
    });
    // 布局完成后
    that._graph.on('afterlayout', () => {
      console.log('布局完成');
    });
  }
}
