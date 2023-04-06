const {
  Application,
  Assets,
  Sprite,
  Container,
  Graphics,
  Texture,
  TilingSprite,
  SCALE_MODES,
} = PIXI;

//pixi앱 생성
const _w = window.innerWidth;
const _h = window.innerHeight;
const app = new Application({
  width: _w,
  height: _h,
  backgroundColor: "0xffffff",
  antialias: true,
});
document.body.appendChild(app.view);
let points = [];
let drawing = false;
let curPos;

//그리기 중일 때의 임시 선
let tempLine = new Graphics();
let preLine = new Graphics();

//이벤트 핸들러
function handleClick(e) {
  let pos = e.data.global;
  if (!drawing) {
    points.push([pos.x, pos.y]);
    curPos = e.data.global;
    drawing = true;
  } else {
    const lastDot = points.slice(-1)[0];
    preLine.lineStyle(8, 0x111111);
    preLine.moveTo(lastDot[0], lastDot[1]);
    preLine.lineTo(pos.x, pos.y);
    points.push([pos.x, pos.y]);
    app.stage.addChild(preLine);
  }
}

function handleMove(e) {
  if (!drawing) {
    return;
  }
  const lastDot = points.slice(-1)[0];
  tempLine.clear();
  curPos = e.data.global;
  tempLine.lineStyle(8, 0x111111);
  tempLine.moveTo(lastDot[0], lastDot[1]);
  tempLine.lineTo(curPos.x, curPos.y);
}

const onKeyDown = (e) => {
  if (e.key === "Escape") {
    if (points.length > 0) {
      const first = points[0];
      const dots = points.slice(1);

      const wall = new Graphics();
      wall.lineStyle(20, 0x111111);
      wall.moveTo(first[0], first[1]);
      dots.forEach((dot) => {
        wall.lineTo(dot[0], dot[1]);
      });
      const wallContainer = new Container();
      wallContainer.addChild(wall);
      app.stage.addChild(wallContainer);

      wall.interactive = true;
      wall.hitArea = wall.getBounds();
      wall.on("mousedown", (e) => {
        wall.dragging = true;
        wall.dragData = e.data;
        const newPosition = wallContainer.toLocal(e.data.global);
        wall.draggingStart = {
          x: newPosition.x - wall.x,
          y: newPosition.y - wall.y,
        };
      });
      wall.on("mousemove", function (e) {
        if (wall.dragging) {
          const newPosition = wallContainer.toLocal(e.data.global);
          wall.x = newPosition.x - wall.draggingStart.x;
          wall.y = newPosition.y - wall.draggingStart.y;
        }
      });
      wall.on("mouseup", function (e) {
        wall.dragging = false;
      });
      //clear
      points = [];
      tempLine.clear();
      preLine.clear();
      drawing = false;
    }
  }
};

//container세팅
const texture = new Texture.from("grid.png");
const grid = new TilingSprite(texture, _w, _h);
grid.tileScale.set(0.3, 0.3);
let container = new PIXI.Container();
container.scale.set(1, 1);
container.position.set(0, 0);
container.interactive = true;
container.interactiveChildren = false;
container.hitArea = new PIXI.Rectangle(0, 0, _w, _h);
container.hitArea.width = _w;
container.hitArea.height = _h;
container.on("click", handleClick);
container.on("pointermove", handleMove);
app.stage.addChild(container);
container.addChild(grid);
app.stage.addChild(tempLine);
//이벤트 리스너
window.addEventListener("keydown", onKeyDown);
