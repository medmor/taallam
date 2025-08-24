// PlatformBase: creates a platform body and graphics for the platformer
export class PlatformBase {
  constructor(Matter, PIXI, def, resolveColor) {
    this.Matter = Matter;
    this.PIXI = PIXI;
    this.def = def;
    this.body = Matter.Bodies.rectangle(def.x, def.y, def.w, def.h, {
      isStatic: !!def.isStatic,
    });
    const g = new PIXI.Graphics();
    let colorVal = resolveColor(def.color || "ground");
    g.rect(-def.w / 2, -def.h / 2, def.w, def.h);
    g.fill({ color: colorVal });
    g.stroke({ width: 1, color: 0x222222 });
    g.x = def.x;
    g.y = def.y;
    this.gfx = g;
  }
}
export default PlatformBase;
