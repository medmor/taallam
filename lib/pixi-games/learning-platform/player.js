// Player class for Pixi + Matter platformer
export class Player {
    constructor(Matter, PIXI, x, y, width, height, world, stage) {
        this.Matter = Matter;
        this.body = Matter.Bodies.rectangle(x, y, width, height, { friction: 0.001, restitution: 0.0 });
        Matter.World.add(world, this.body);

        // Prevent rotation by setting (effectively) infinite inertia if supported
        try {
            if (this.Matter.Body && typeof this.Matter.Body.setInertia === 'function') {
                this.Matter.Body.setInertia(this.body, Infinity);
            } else if (typeof this.body.inertia !== 'undefined') {
                // fallback: directly set inertia/inverseInertia
                this.body.inertia = Infinity;
                this.body.inverseInertia = 0;
            }
        } catch (e) {
            // ignore if engine doesn't support setInertia
        }

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
        this.gfx.circle(0, 0, width / 1.4);
        this.gfx.fill({ color: 0x2b6cb0 });
        this.gfx.stroke({ color: 0x222222, width: 2 });
    }

    move(direction, speed) {
        if (this.state === 'jump') return;
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
        // Prefer collision-driven grounded state when available
        const grounded = (typeof this.isGrounded === 'boolean') ? this.isGrounded : (Math.abs(this.body.velocity.y) < 1 && (this.body.position.y + this.height / 2) >= (groundY - 30));
        if (grounded) {
            this.Matter.Body.setVelocity(this.body, { x: this.body.velocity.x, y: jumpPower });
            this.state = 'jump';
            this.jumpAnim = 1;
            if (typeof playSfx === 'function') {
                try { playSfx('jump'); } catch (e) { }
            }
        }
    }

    // Attach Matter collision handlers to maintain isGrounded/supporting set
    attachCollisionHandlers(engine) {
        if (!engine || !this.body || this._collisionStart) return;
        this._supporting = new Set();
        this.isGrounded = false;
        this._collisionStart = (event) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA, b = pair.bodyB;
                if (a === this.body || b === this.body) {
                    const other = a === this.body ? b : a;
                    if (other.isStatic) {
                        this._supporting.add(other.id);
                        this.isGrounded = this._supporting.size > 0;
                    }
                }
            }
        };
        this._collisionActive = (event) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA, b = pair.bodyB;
                if (a === this.body || b === this.body) {
                    const other = a === this.body ? b : a;
                    if (other.isStatic) {
                        this._supporting.add(other.id);
                        this.isGrounded = this._supporting.size > 0;
                    }
                }
            }
        } ;
        this._collisionEnd = (event) => {
            for (const pair of event.pairs) {
                const a = pair.bodyA, b = pair.bodyB;
                if (a === this.body || b === this.body) {
                    const other = a === this.body ? b : a;
                    if (this._supporting) {
                        this._supporting.delete(other.id);
                        this.isGrounded = this._supporting.size > 0;
                    }
                }
            }
        };
        this._engine = engine;
        this.Matter.Events.on(engine, 'collisionStart', this._collisionStart);
        this.Matter.Events.on(engine, 'collisionActive', this._collisionActive);
        this.Matter.Events.on(engine, 'collisionEnd', this._collisionEnd);
    }

    detachCollisionHandlers() {
        if (!this._engine) return;
        try {
            this.Matter.Events.off(this._engine, 'collisionStart', this._collisionStart);
            this.Matter.Events.off(this._engine, 'collisionActive', this._collisionActive);
            this.Matter.Events.off(this._engine, 'collisionEnd', this._collisionEnd);
        } catch (e) { }
        this._collisionStart = null;
        this._collisionActive = null;
        this._collisionEnd = null;
        this._engine = null;
        this._supporting = new Set();
        this.isGrounded = false;
    }

    updateGraphics() {
        if (!this.gfx || !this.body) return;
        // Safety: zero angular motion so the player stays upright
        try {
            if (this.Matter.Body && typeof this.Matter.Body.setAngularVelocity === 'function') {
                this.Matter.Body.setAngularVelocity(this.body, 0);
            } else {
                this.body.angularVelocity = 0;
            }
            if (this.Matter.Body && typeof this.Matter.Body.setAngle === 'function') {
                this.Matter.Body.setAngle(this.body, 0);
            } else {
                this.body.angle = 0;
            }
        } catch (e) {
            // ignore safety failures
        }

        this.gfx.x = this.body.position.x;
        this.gfx.y = this.body.position.y;
        this.gfx.rotation = 0; // keep sprite upright
        // Animation: squash/stretch based on state
        let scaleX = 1, scaleY = 1;
        if (this.state === 'jump') {
            if (this.jumpAnim > 0) {
                scaleY = 0.7 + 0.6 * Math.abs(Math.sin(this.jumpAnim * Math.PI));
                scaleX = 1.2 - 0.2 * Math.abs(Math.sin(this.jumpAnim * Math.PI));
                this.jumpAnim -= 0.008;
                if (this.isGrounded) {
                    this.state = 'idle';
                    this.jumpAnim = 0;
                }
            }
        } else if (this.state === 'moveRight') {
            scaleX = 0.85; scaleY = 1.15;
        } else if (this.state === 'moveLeft') {
            scaleX = 0.85; scaleY = 1.15;
        } else {
            scaleX = 1; scaleY = 1;
        }
        this.gfx.scale.x = scaleX;
        this.gfx.scale.y = scaleY;
    }

    // Prefer using a world/container as the camera target. Call this each frame from your game loop.
    // worldContainer: a PIXI.Container that holds all world sprites (player, ground, items)
    // levelWidth/levelHeight: total world dimensions
    // screenWidth/screenHeight: current viewport size (app.view.width/height)
    // smooth: 0..1 lerp factor (higher = snappier)
    updateCamera(worldContainer, levelWidth, levelHeight, screenWidth, screenHeight, smooth = 0.12, opts = {}) {
        if (!this.body || !worldContainer) return;

        // If level is smaller than screen, just center the world
        const halfW = screenWidth / 2;
        const halfH = screenHeight / 2;

        // Compute the unclamped target in world coordinates (we want the camera centered on the player)
        let targetX = this.body.position.x;
        let targetY = this.body.position.y;

        // Clamp so camera doesn't show beyond level bounds
        if (levelWidth > screenWidth) {
            targetX = Math.min(Math.max(targetX, halfW), levelWidth - halfW);
        } else {
            targetX = levelWidth / 2;
        }
        if (levelHeight > screenHeight) {
            targetY = Math.min(Math.max(targetY, halfH), levelHeight - halfH);
        } else {
            targetY = levelHeight / 2;
        }

    // No ground-based clamping here; keep camera clamping limited to level bounds.

        // Smoothly move the world container pivot toward the target.
        // Using pivot + position keeps the viewport centered at (screenWidth/2, screenHeight/2)
        worldContainer.pivot.x = worldContainer.pivot.x || 0;
        worldContainer.pivot.y = worldContainer.pivot.y || 0;

        worldContainer.pivot.x += (targetX - worldContainer.pivot.x) * smooth;
        worldContainer.pivot.y += (targetY - worldContainer.pivot.y) * smooth;

        worldContainer.position.x = Math.round(screenWidth / 2);
        worldContainer.position.y = Math.round(screenHeight / 2);
    }
}
