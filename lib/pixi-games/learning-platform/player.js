// Player class for Pixi + Matter platformer
export class Player {
    constructor(Matter, PIXI, x, y, width, height, world, stage) {
        this.Matter = Matter;
        this.body = Matter.Bodies.rectangle(x, y, width, height, { friction: 0.001, restitution: 0.0 });
        Matter.World.add(world, this.body);

        this.gfx = new PIXI.Graphics();
        this.drawPlayerShape(width, height);
        this.gfx.x = this.body.position.x;
        this.gfx.y = this.body.position.y;
        stage.addChild(this.gfx);

        this.width = width;
        this.height = height;
        this.state = 'idle';
        this.lastDirection = 0;
        this.jumpAnim = 0;
    }

    drawPlayerShape(width, height) {
        this.gfx.clear();
        this.gfx.circle(0, 0, width / 2);
        this.gfx.fill({ color: 0x2b6cb0 });
        this.gfx.stroke({ color: 0x222222, width: 2 });
    }

    move(direction, speed) {
        if (direction === 0) {
            this.state = 'idle';
        } else if (direction === 1) {
            this.state = 'moveRight';
        } else if (direction === -1) {
            this.state = 'moveLeft';
        }
        this.lastDirection = direction;
        this.body && this.body.position &&
            this.Matter.Body.setVelocity(this.body, { x: direction * speed, y: this.body.velocity.y });
    }

    jump(jumpPower, groundY) {
        const onGround = Math.abs(this.body.velocity.y) < 1 && (this.body.position.y + this.height / 2) >= (groundY - 30);
        if (onGround) {
            this.Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: jumpPower });
            this.state = 'jump';
            this.jumpAnim = 1;
            if (typeof playSfx === 'function') {
                try { playSfx('jump'); } catch (e) { }
            }
        }
    }

    updateGraphics() {
        if (!this.gfx || !this.body) return;
        this.gfx.x = this.body.position.x;
        this.gfx.y = this.body.position.y;
        this.gfx.rotation = this.body.angle;

        // Animation: squash/stretch based on state
        let scaleX = 1, scaleY = 1;
        if (this.state === 'moveRight') {
            scaleX = 0.85; scaleY = 1.15;
        } else if (this.state === 'moveLeft') {
            scaleX = 0.85; scaleY = 1.15;
        } else if (this.state === 'jump') {
            if (this.jumpAnim > 0) {
                scaleY = 0.7 + 0.6 * Math.abs(Math.sin(this.jumpAnim * Math.PI));
                scaleX = 1.2 - 0.2 * Math.abs(Math.sin(this.jumpAnim * Math.PI));
                this.jumpAnim -= 0.08;
                if (this.jumpAnim <= 0) {
                    this.state = 'idle';
                    this.jumpAnim = 0;
                }
            }
        } else {
            scaleX = 1; scaleY = 1;
        }
        this.gfx.scale.x = scaleX;
        this.gfx.scale.y = scaleY;
    }
}
