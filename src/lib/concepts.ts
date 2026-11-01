export type Category = "3d" | "feel" | "systems" | "perf";

export const chapters: { id: Category; title: string; description: string }[] = [
  { id: "3d", title: "3D & rendering", description: "From geometry to the screen: light, rotation, visibility, and pixels." },
  { id: "feel", title: "Game feel", description: "Small changes to timing and movement that make a game feel right." },
  { id: "systems", title: "Systems", description: "Building blocks for combat, simulation, characters, and worlds." },
  { id: "perf", title: "Performance", description: "Understand the cost of a frame, then do less unnecessary work." },
];

export interface Concept {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  prompt: string;
  example: string;
  mistake: string;
  code: string;
  category: Category;
  number: number;
}

type Entry = [string, string, string, string, string, string, string, string];

const entries: Entry[] = [
  [
    "raycasting", "Raycasting", "Trace a direction. Find the first contact.",
    "A ray is an origin and a direction. Intersect it with the scene to discover the nearest surface, its distance, and its outward normal. Aim around the obstacles below: the contact dot follows the first intersection, not the end of the line.",
    "Implement hitscan using a normalized ray from the weapon. Filter out the player, choose the nearest positive intersection within range, and orient a decal using the contact normal.",
    "Use a downward ray to distinguish a grounded character from one falling past a ledge.",
    "An unnormalized direction changes the meaning of distance. Also exclude your own collider.",
    "const hit = world.castRay(origin, normalize(aim), 100);\nif (hit) spawnDecal(hit.point, hit.normal);",
  ],
  [
    "normals", "Normals", "The direction that gives a face its light.",
    "Surface normals point perpendicular to geometry. The dot product between a normal and the light direction controls diffuse brightness. Move the light in this example and watch the faces brighten as their normal arrows point toward it.",
    "Calculate diffuse light as max(0, dot(normal, lightDirection)). Normalize both vectors. Transform normals correctly when the model uses nonuniform scale.",
    "Read the upward component of a collision normal to reject walls when testing for walkable ground.",
    "A normal is a direction, not a position. Do not apply translation when transforming it.",
    "const brightness = Math.max(0, dot(normalize(normal), lightDir));\nconst walkable = normal.y > Math.cos(maxSlope);",
  ],
  [
    "level-of-detail", "Level of detail", "Spend triangles where they can be seen.",
    "A distant object needs less geometric detail because it occupies fewer pixels. LOD selects from several versions of a model using distance or projected size. Here the rotating mesh changes resolution as its distance changes.",
    "Create high, medium, and low detail meshes. Select by screen coverage and use separate enter and exit thresholds to avoid rapid switching near a boundary.",
    "Use detailed trees nearby, simpler trees in the middle distance, and flat impostors at the horizon.",
    "Switching at a single threshold can visibly flicker as the camera moves back and forth.",
    "if (distance > threshold + margin) level = lowerDetail;\nif (distance < threshold - margin) level = higherDetail;",
  ],
  [
    "frustum-culling", "Frustum culling", "Outside the view? Outside the draw list.",
    "A camera sees only a bounded region of the world. Test an object's bounding volume against that region before submitting its geometry. The moving wedge below is a top-down view of a camera; bright boxes are inside its view.",
    "Extract six frustum planes from the view-projection matrix. Reject a bounding sphere only if it is wholly outside one plane. Keep gameplay simulation separate from visibility.",
    "Cull buildings behind the camera while keeping their AI and multiplayer state alive.",
    "Testing only the object's center can hide a large object whose edge is still visible.",
    "const visible = planes.every(p => dot(p.normal, center) + p.d >= -radius);\nif (visible) draw(mesh);",
  ],
  [
    "fragment-shader", "Fragment shader", "One tiny calculation for every fragment.",
    "The GPU evaluates a fragment program across a surface to decide its final color. UV coordinates identify a location on that surface, while uniforms share values such as time. This animated field uses position and time to make a moving wave pattern.",
    "Build a procedural material in a fragment shader. Use UV coordinates and a time uniform, with exposed parameters for frequency, speed, and palette.",
    "Animate water ripples without updating a texture from the CPU every frame.",
    "Large transparent surfaces can run the same shader many times over the same pixels.",
    "float wave = sin(uv.x * frequency + uTime * speed);\nvec3 color = mix(colorA, colorB, wave * 0.5 + 0.5);",
  ],
  [
    "billboarding", "Billboarding", "A flat surface that keeps facing you.",
    "Billboards orient a quad toward the viewer rather than leaving it fixed in the world. Compare the two health bars as the viewpoint rotates: one becomes edge-on while the other stays readable.",
    "Orient world-space labels to match the camera basis. For upright foliage, rotate only around the vertical axis. Keep scale independent of rotation.",
    "Use a camera-facing quad for damage numbers floating above enemies.",
    "Calling lookAt with a local position can give incorrect rotation under a transformed parent.",
    "label.setWorldRotation(camera.worldRotation);\nlabel.position = character.position.add(offset);",
  ],
  [
    "quaternions", "Quaternions", "Blend orientation without an Euler detour.",
    "Quaternions encode a 3D orientation with four components. Spherical interpolation follows an arc between orientations, avoiding artifacts from blending separate Euler angles. These two objects compare a multi-axis detour with a smooth shortest rotation.",
    "Keep orientation as a normalized quaternion. Use slerp for transitions and correct the sign when the quaternion dot product is negative.",
    "Blend a flying vehicle's orientation toward its steering target without crossing a 360-degree discontinuity.",
    "Quaternion multiplication is order-dependent; swapping operands changes which space a turn happens in.",
    "if (dot(from, to) < 0) to = negate(to);\nrotation = normalize(slerp(from, to, progress));",
  ],
  [
    "z-fighting", "Z-fighting", "When depth cannot choose a winner.",
    "Nearly coincident surfaces can quantize to the same depth value. Their pixels then alternate as the camera moves. The left patch demonstrates conflicting layers; the right uses a separation to keep the overlay stable.",
    "Avoid coplanar geometry. Apply depth bias to decals, and use a practical camera near plane instead of an extremely small one.",
    "Place a painted road marking slightly above its road surface or render it with polygon offset.",
    "Making the near plane unnecessarily tiny wastes distant depth precision.",
    "camera.near = 0.1;\ndecal.position.addScaledVector(surfaceNormal, 0.01);",
  ],
  [
    "delta-time", "Delta time", "Measure motion in seconds, not frames.",
    "Frame duration varies with hardware and workload. Multiplying velocity by elapsed seconds keeps travel distance consistent. The two lanes below experience the same fluctuating frame rate, but only the lower one maintains its intended speed.",
    "Express velocity in units per second and timers in seconds. Use elapsed time for movement, cap unusually long frame deltas, and use exponential damping for smoothing.",
    "A runner should cover the same distance in a second at both 30 and 144 frames per second.",
    "A fixed lerp factor per frame still makes smoothing frame-rate dependent.",
    "position += speed * dt;\nvalue += (target - value) * (1 - Math.exp(-response * dt));",
  ],
  [
    "coyote-time", "Coyote time", "A little forgiveness at the ledge.",
    "Jump eligibility can linger briefly after leaving a platform. This grace window makes a near-miss input behave as the player intended. The two runners leave the same ledge, but the one with a grace timer can still jump.",
    "Remember the last grounded time. Permit a jump during a short grace period after leaving the ground, and consume that opportunity when jumping.",
    "Start with a roughly 100 ms grace window, then tune it while testing the platforming controls.",
    "If the grounded timestamp is not invalidated on jump, one press can accidentally permit a second jump.",
    "if (jumpPressed && now - lastGrounded < 0.1) {\n  velocity.y = -jumpSpeed;\n  lastGrounded = -Infinity;\n}",
  ],
  [
    "easing", "Easing", "Change the pace, not the destination.",
    "An easing curve remaps progress between zero and one. Linear motion has constant speed; cubic easing slows near the finish; a back curve overshoots. The plots and moving markers show how equal durations can feel very different.",
    "Drive the transition from elapsed time divided by duration. Apply an easing curve before interpolating start and end values. Clamp progress when the transition ends.",
    "Ease a menu panel into place with a quick start and gentle stop.",
    "Repeatedly lerping the current value is damping, not a fixed-duration tween.",
    "const t = Math.min(elapsed / duration, 1);\nconst eased = 1 - (1 - t) ** 3;\nx = start + (end - start) * eased;",
  ],
  [
    "screen-shake", "Screen shake", "Turn impact energy into camera motion.",
    "A decaying intensity value can drive temporary camera offsets. Squaring that intensity creates a gentler tail after a strong impact. Trigger an impact below to compare a harsh jitter with a smooth, fading shake.",
    "Accumulate trauma on impacts, decay it over real time, and derive additive camera offsets from continuous noise scaled by trauma squared. Provide a reduced-motion option.",
    "Use a short shake for a heavy landing, leaving the actual camera follow position untouched.",
    "Adding shake to last frame's shaken position causes drift. Always start from the unshaken pose.",
    "trauma = Math.max(0, trauma - dt);\ncamera.x = baseX + noise(time) * maxOffset * trauma ** 2;",
  ],
  [
    "squash-and-stretch", "Squash and stretch", "Let a shape express its momentum.",
    "Deforming a sprite communicates speed and impact without changing its path. Stretch during fast travel, flatten on contact, then return to the resting shape. The two balls share a bounce trajectory but only one changes shape.",
    "Animate visual scale from velocity and landing events. Compensate one axis with the inverse of the other, and leave the physics collider unchanged.",
    "Squash a hopping character at its feet on landing, then recover with a short easing curve.",
    "Scaling collision geometry with the animation can cause unexpected overlaps and impulses.",
    "visual.scale.y = stretch;\nvisual.scale.x = 1 / stretch;\ncollider.scale = originalColliderScale;",
  ],
  [
    "camera-deadzone", "Camera deadzone", "Let small steps leave the world steady.",
    "A follow camera does not need to react to every movement. A central region lets the player wander while the view stays still. Once the character crosses an edge, the camera follows only the overflow.",
    "Define a screen-space rectangle for the player. Move the camera only by the amount the player exceeds that rectangle, with optional smoothing and look-ahead.",
    "Keep the horizon steady while the player makes small adjustments near a platform edge.",
    "A deadzone that is too large hides upcoming hazards until the player is already close.",
    "const overflow = playerX - clamp(playerX, cameraX - halfWidth, cameraX + halfWidth);\ncameraX += overflow;",
  ],
  [
    "input-buffering", "Input buffering", "Remember an action until it can happen.",
    "A short input buffer stores a recent button press instead of discarding it when the character cannot act. An early jump press can then fire immediately on landing. The lower lane remembers the press; the upper lane drops it.",
    "Store a timestamp when jump is pressed. If the character becomes grounded before the buffer expires, execute one jump and clear the stored request.",
    "Allow players to press jump slightly before landing for a reliable chain of jumps.",
    "An expired or already consumed request must not trigger later.",
    "if (grounded && now - jumpPressedAt < 0.12) {\n  jump();\n  jumpPressedAt = -Infinity;\n}",
  ],
  [
    "acceleration-and-friction", "Acceleration and friction", "Build speed. Brake. Change direction.",
    "A velocity target gives movement a sense of weight. Acceleration approaches that target gradually, while friction slows the character after release. The two traces compare instant direction changes with a more controlled ramp.",
    "Move horizontal velocity toward the requested speed by acceleration times dt. Use a stronger braking rate when input reverses and a separate deceleration on release.",
    "Tune quick ground braking and weaker air control independently.",
    "Multiplying velocity by a fixed number each frame makes friction depend on frame rate.",
    "const difference = targetSpeed - velocity;\nvelocity += Math.sign(difference) * Math.min(Math.abs(difference), acceleration * dt);",
  ],
  [
    "hit-stop", "Hit stop", "Give contact a moment to register.",
    "A very brief pause at the moment of contact makes an attack easier to read. It freezes the affected actors rather than the entire interface. Compare the uninterrupted swing with the lower swing's pause at impact.",
    "Pause attacker and target simulation for a short impact-dependent duration. Continue input sampling, UI, and particles using unscaled time.",
    "Reserve longer pauses for a heavy attack or a finishing blow.",
    "Pausing every clock can prevent the timer that ends hit stop from progressing.",
    "hitStop = Math.max(0, hitStop - realDt);\nif (hitStop === 0) updateFighters(realDt);\nupdateParticles(realDt);",
  ],
  [
    "invincibility-frames", "Invincibility frames", "One hit should not become a dozen.",
    "Brief damage immunity after a hit prevents a lingering hazard from draining health every update. Flashing indicates that protected state. The lower character takes a hit, then ignores repeated contact during its timer.",
    "After accepting damage, start a short immunity timer. Ignore damage while it is positive, apply knockback once, and communicate immunity with a visual cue.",
    "Give a player time to move out of a hazard after being hurt.",
    "Do not disable all collisions if only damage immunity is intended; the floor still needs to work.",
    "if (immunity <= 0) {\n  health -= damage;\n  immunity = 0.8;\n}\nimmunity -= dt;",
  ],
  [
    "object-pooling", "Object pooling", "Recycle short-lived things.",
    "Repeatedly allocating and discarding bullets creates garbage and unpredictable cleanup work. A pool reserves reusable objects and resets them on spawn. The slots below switch between active and available instead of disappearing.",
    "Preallocate projectile instances. Acquire an inactive slot, reset every mutable field, and return it when the projectile expires. Define what happens when capacity is reached.",
    "Use a bounded pool for sparks emitted during rapid weapon fire.",
    "Stale velocity, listeners, or lifetime values can leak from an object's previous use.",
    "const bullet = pool.find(item => !item.active);\nif (bullet) Object.assign(bullet, { active: true, x, y, life: 1, vx, vy });",
  ],
  [
    "state-machine", "Finite state machine", "Explicit states. Explicit transitions.",
    "A finite state machine gives an actor one current state and a defined set of legal transitions. The diagram highlights a cycle from idle to movement to an attack. Events without a transition do not create contradictory states.",
    "Replace overlapping character booleans with a typed state and event table. Run exit and enter hooks when a legal transition changes the state.",
    "Reject an attack input while the character is in a stunned state.",
    "Changing state from multiple independent update branches can execute conflicting transitions in one frame.",
    "type State = 'idle' | 'run' | 'attack';\nconst next = transitions[state]?.[event];\nif (next) { exit(state); state = next; enter(state); }",
  ],
  [
    "hitbox-hurtbox", "Hitbox and hurtbox", "Separate the attack from the target.",
    "An attack's hitbox describes where it deals damage. A character's hurtbox describes where it can receive damage. A hit requires overlap while the attack is active. Watch the colored rectangles connect or miss as the defender ducks.",
    "Enable attack hitboxes only on active animation frames. Test them against enemy hurtboxes and keep a per-attack set of targets already damaged.",
    "A crouching pose can lower the hurtbox without altering the character's floor collider.",
    "Without target deduplication, one swing can apply damage on every overlapping frame.",
    "if (attack.active && overlaps(attack.hitbox, target.hurtbox) && !hitTargets.has(target.id)) {\n  damage(target);\n  hitTargets.add(target.id);\n}",
  ],
  [
    "pathfinding", "A* pathfinding", "Search toward the goal, not everywhere.",
    "A* ranks candidate nodes by travel cost plus an estimated remaining cost. A valid heuristic guides exploration without sacrificing the shortest path. Point to a cell in the grid to choose a new destination and reveal the search.",
    "Use A* with a Manhattan heuristic for four-direction grid movement. Store parent links to rebuild the path, skip blocked cells, and report unreachable goals.",
    "Find a route around walls for a guard navigating a tile map.",
    "An overestimating heuristic can choose a longer route. Replan when the navigation map changes.",
    "const priority = costSoFar + manhattan(node, goal);\nopen.push(node, priority);\nparent.set(neighbor, node);",
  ],
  [
    "particle-system", "Particle system", "Many small lives, one visual effect.",
    "An emitter creates particles with short lifetimes, velocity, and appearance curves. Gravity bends their motion; age changes size and opacity. The example cycles through sparks, smoke, and confetti using different parameters.",
    "Create a pooled particle emitter with tunable spawn rate, lifetime, velocity spread, gravity, drag, and color. Evaluate size and opacity from normalized age.",
    "Make a burst of sparks at a collision point using the contact normal as the emission direction.",
    "Unlimited emitters can exhaust both CPU update time and transparent fill rate.",
    "particle.vy += gravity * dt;\nparticle.x += particle.vx * dt;\nparticle.y += particle.vy * dt;\nparticle.alpha = 1 - particle.age / particle.life;",
  ],
  [
    "fixed-timestep", "Fixed timestep", "A steady clock inside a variable frame.",
    "Simulation steps need not match display frames. Accumulate elapsed time and consume it in equal slices, then interpolate for rendering. The lower spring keeps a stable rhythm even while the visible frame timing changes.",
    "Run physics with a fixed step and a capped accumulator. Save previous and current states and interpolate them for rendering. Limit catch-up steps to prevent a spiral of work.",
    "Keep a spring simulation stable when a frame takes longer than usual.",
    "Rendering the latest physics state without interpolation can look jerky at high refresh rates.",
    "accumulator += Math.min(dt, 0.25);\nwhile (accumulator >= step) {\n  simulate(step);\n  accumulator -= step;\n}\nrender(accumulator / step);",
  ],
  [
    "steering-behaviors", "Steering behaviors", "Guide velocity rather than teleporting.",
    "Steering computes a desired velocity and gradually turns the current velocity toward it. Arrival slows near a destination, while separation prevents crowds collapsing to one point. Point inside the stage to guide the group.",
    "Combine seek, arrival, and separation forces. Clamp acceleration and speed, then integrate with dt. Reduce desired speed within an arrival radius.",
    "Guide a group of friendly units toward a clicked location while keeping personal space.",
    "Normalizing a zero-length direction at the goal can produce invalid coordinates.",
    "const desired = directionToGoal * maxSpeed * Math.min(distance / slowRadius, 1);\nvelocity += clampLength(desired - velocity, maxForce) * dt;",
  ],
  [
    "tunneling", "Tunneling", "Check the journey, not only the endpoint.",
    "A fast projectile can cross a thin wall between updates. Discrete overlap tests see it on neither side of the wall at contact. The lower lane checks the swept segment and stops at the wall while the upper projectile passes through.",
    "Use a ray or shape sweep between previous and next positions for fast projectiles. Resolve the earliest contact and account for projectile radius when sweeping.",
    "Use continuous collision detection for a small, fast ball in a pinball game.",
    "More frames reduce risk but do not guarantee detection at all possible speeds.",
    "const hit = sweep(previousPosition, nextPosition, radius);\nposition = hit ? hit.point : nextPosition;",
  ],
  [
    "seeded-noise", "Seeded noise", "A world you can regenerate from a number.",
    "A seeded generator produces a repeatable sequence. Interpolated noise turns that sequence into smooth terrain, and multiple octaves add smaller features. Change the seed below to create new hills, or replay to reproduce the same ones.",
    "Generate terrain with a seeded PRNG and coherent noise. Combine octaves with increasing frequency and decreasing amplitude, and save the seed with the world.",
    "Regenerate an explored map from a saved seed rather than storing every untouched tile.",
    "Changing the random-call order changes the world. Use chunk coordinates to derive independent seeds.",
    "height = noise(x, seed)\n  + 0.5 * noise(x * 2, seed + 1)\n  + 0.25 * noise(x * 4, seed + 2);",
  ],
  [
    "frame-budget", "Frame budget", "A frame is a deadline, not a wish.",
    "At 60 Hz, a new image is due about every 16.67 milliseconds. Input, simulation, and rendering all consume resources toward that deadline. The stacked bars reveal how a single expensive system can push a frame over budget.",
    "Instrument update, physics, and rendering separately. Compare representative frame timings against the target refresh rate and investigate spikes as well as averages.",
    "Record a busy combat scene rather than profiling only an empty level.",
    "CPU timers around GPU commands measure submission, not completed GPU execution.",
    "const start = performance.now();\nupdate();\nconst updateMs = performance.now() - start;\nconst budgetMs = 1000 / targetFps;",
  ],
  [
    "draw-calls", "Draw calls", "Repeat geometry, not submission work.",
    "Each draw submission has CPU and driver overhead. Instancing renders many objects sharing geometry and material with per-instance transforms. The same field of cubes can be submitted individually or as a single group.",
    "Instance repeated meshes that share a material. Store transforms in an instance buffer and measure CPU submission cost before and after batching.",
    "Render a forest of identical low-detail trees with one instanced mesh per material.",
    "Instancing does not reduce vertex count or automatically solve transparent overdraw.",
    "for (let i = 0; i < transforms.length; i++) mesh.setMatrixAt(i, transforms[i]);\nmesh.instanceMatrix.needsUpdate = true;",
  ],
  [
    "spatial-partitioning", "Spatial partitioning", "Ask the neighborhood first.",
    "Testing every object against every other object grows quadratically. A spatial grid puts objects into cells so a broad-phase search visits nearby candidates. Bright cells follow the selected object and show its local neighborhood.",
    "Use a uniform grid for broad-phase collisions. Insert bounds into covered cells, query nearby cells, deduplicate pairs, then perform precise overlap tests.",
    "Find nearby agents for crowd separation without scanning the entire population.",
    "Large objects must occupy every cell they overlap; a center-only insertion can miss collisions.",
    "const key = `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;\ngrid.get(key)?.push(entity);\nfor (const candidate of nearbyCells) narrowPhase(entity, candidate);",
  ],
  [
    "overdraw", "Overdraw", "A pixel can be painted too many times.",
    "Overlapping translucent geometry shades the same screen region repeatedly. Particle clouds can be expensive even with few triangles. The heatmap below exposes overlap: brighter areas represent more layers.",
    "Inspect transparent overdraw. Reduce particle size and overlap, trim empty sprite borders, and consider a lower-resolution target for soft effects.",
    "Render a large smoke cloud into a half-resolution buffer, then composite it.",
    "Reducing draw calls alone will not fix a fill-rate bottleneck.",
    "const effectWidth = Math.ceil(viewWidth / 2);\nconst effectHeight = Math.ceil(viewHeight / 2);\nrenderSmoke(lowResolutionTarget);",
  ],
  [
    "time-slicing", "Time slicing", "Some decisions can wait a frame.",
    "Expensive decisions can run less frequently than visual movement. Divide agents into groups and update one group's planning each frame. The highlighted bucket rotates while every agent continues moving.",
    "Spread noncritical AI decisions across buckets. Keep movement on every frame, use elapsed time since each agent's last decision, and immediately process urgent events.",
    "Refresh distant NPC targets several times per second instead of on every render frame.",
    "Delaying collision response or critical player input makes controls feel unresponsive.",
    "for (const agent of agents) {\n  if (agent.bucket === frame % bucketCount) agent.plan();\n  agent.move(dt);\n}",
  ],
  [
    "texture-atlas", "Texture atlas", "Different sprites, one shared texture.",
    "An atlas stores several sprite images together. Each sprite selects a rectangular UV region, letting compatible sprites share a texture binding. The colored tiles below map into the same atlas and form a single batch.",
    "Pack sprites into a shared atlas with padding and extruded borders. Store UV rectangles in metadata and batch sprites with compatible shader and blend state.",
    "Draw coins, hearts, and pickup icons from one texture rather than switching textures for each.",
    "Without padding, filtering and mipmaps can sample colors from the neighboring sprite.",
    "const u = (sprite.x + localU * sprite.width) / atlas.width;\nconst v = (sprite.y + localV * sprite.height) / atlas.height;",
  ],
  [
    "chunk-streaming", "Chunk streaming", "Keep nearby worlds in memory.",
    "A large map can be divided into chunks that load around the player. A larger unload radius keeps a boundary crossing from repeatedly loading and discarding the same chunk. Move the pointer to shift the active region.",
    "Load nearby chunks asynchronously and unload them beyond a larger radius. Bound concurrent loads, cancel stale requests, and reuse chunk resources.",
    "Keep a small moving neighborhood of terrain loaded during exploration.",
    "A slow asynchronous result must not reinsert a chunk that is no longer wanted.",
    "if (distance < loadRadius) requestChunk(key);\nif (distance > unloadRadius) releaseChunk(key);\n// unloadRadius must exceed loadRadius",
  ],
];

export const concepts: Concept[] = entries.map(([slug, title, tagline, description, prompt, example, mistake, code], index) => ({
  slug, title, tagline, description, prompt, example, mistake, code,
  number: index + 1,
  category: index < 8 ? "3d" : index < 18 ? "feel" : index < 27 ? "systems" : "perf",
}));

export function conceptBySlug(slug: string): Concept | undefined {
  return concepts.find(concept => concept.slug === slug);
}

export const sitePath = (path = "/"): string => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
