// SpikeBase: creates a spike obstacle (rounded box + spikes) for the platformer
export class SpikeBase {
  constructor(Matter, PIXI, def, resolveColor) {
    this.Matter = Matter;
    this.PIXI = PIXI;
    this.def = def;
    this.bodies = [];
    this.graphics = [];
    const o = def;
    const w = o.w || 36;
    const h = o.h || 36;
    const radius = Math.min(8, Math.floor(Math.min(w, h) * 0.15));
    const spikeH = Math.max(6, Math.floor(Math.min(w, h) * 0.28));
    // The total size includes spikes on all sides
    const totalW = w + spikeH * 2;
    const totalH = h + spikeH * 2;
    // Create a single large rectangle body
    const bigBody = Matter.Bodies.rectangle(o.x, o.y, totalW, totalH, {
      isStatic: !!o.isStatic,
    });
    const damageVal =
      typeof o.damage === "number"
        ? o.damage
        : o.damage
        ? Number(o.damage) || 1
        : 1;
    try {
      bigBody.isObstacle = true;
      bigBody.damage = damageVal;
    } catch (e) {
      if (bigBody.label) bigBody.label += " obstacle";
      bigBody.damage = damageVal;
    }
    this.bodies.push({ name: (o.name || "") + "-spike", body: bigBody, def: o });
    // Draw graphics: rounded rect + spikes
    const g = new PIXI.Graphics();
    const colorVal = resolveColor(o.color || "danger");
    g.roundRect(-w / 2, -h / 2, w, h, radius);
    g.fill({ color: colorVal });
    // Draw spikes visually (same as before)
    const spacing = Math.max(
      Math.floor(spikeH * 1.2),
      Math.floor(w / Math.max(1, Math.floor(w / (spikeH * 2))))
    );
    const topCount = Math.max(1, Math.floor(w / spacing));
    for (let i = 0; i < topCount; i++) {
      const xRel = -w / 2 + spacing / 2 + i * spacing;
      const yRel = -h / 2;
      g.moveTo(xRel - spikeH / 2, yRel);
      g.lineTo(xRel + spikeH / 2, yRel);
      g.lineTo(xRel, yRel - spikeH);
      g.closePath();
    }
    const bottomCount = topCount;
    for (let i = 0; i < bottomCount; i++) {
      const xRel = -w / 2 + spacing / 2 + i * spacing;
      const yRel = h / 2;
      g.moveTo(xRel - spikeH / 2, yRel);
      g.lineTo(xRel + spikeH / 2, yRel);
      g.lineTo(xRel, yRel + spikeH);
      g.closePath();
    }
    const leftCount = Math.max(1, Math.floor(h / spacing));
    for (let i = 0; i < leftCount; i++) {
      const yRel = -h / 2 + spacing / 2 + i * spacing;
      const xRel = -w / 2;
      g.moveTo(xRel, yRel - spikeH / 2);
      g.lineTo(xRel - spikeH, yRel);
      g.lineTo(xRel, yRel + spikeH / 2);
      g.closePath();
    }
    const rightCount = leftCount;
    for (let i = 0; i < rightCount; i++) {
      const yRel = -h / 2 + spacing / 2 + i * spacing;
      const xRel = w / 2;
      g.moveTo(xRel, yRel - spikeH / 2);
      g.lineTo(xRel + spikeH, yRel);
      g.lineTo(xRel, yRel + spikeH / 2);
      g.closePath();
    }
    g.fill();
    g.setStrokeStyle(1, 0x222222, 1);
    g.stroke();
  g.x = o.x;
  g.y = o.y;
  g.zIndex = -1; // ensure spikes are behind ground/platforms
  this.graphics.push({ name: o.name || "", gfx: g, def: o });
  }
}
