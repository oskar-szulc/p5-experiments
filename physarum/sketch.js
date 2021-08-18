// p5js version is based on https://johanneshoff.com/physarum/

const weight = [
  1 / 16, 1 / 8, 1 / 16,
  1 / 8, 1 / 4, 1 / 8,
  1 / 16, 1 / 8, 1 / 16,
];

let regenerate_next = true;

const agents = [];
let trail;

let gfx;
let W;
let H;

let settings;

function sim_step(agents, trail, mouseX, mouseY) {
  function index(x, y) {
    return x + y * W;
  }

  function step_sense_and_rotate() {
    for (let agent of agents) {
      function sense_relative_angle(theta) {
        return trail[index(
          Math.round(agent.x + Math.cos(agent.heading + theta) * settings.sensor_distance),
          Math.round(agent.y + Math.sin(agent.heading + theta) * settings.sensor_distance)
        )];
      }

      const sense_left = sense_relative_angle(settings.sensor_angle);
      const sense_middle = sense_relative_angle(0);
      const sense_right = sense_relative_angle(-settings.sensor_angle);

      const modified_turning = (settings.random_turning ? (Math.random() * 0.5 + 0.5) : 1) * settings.turning_speed;
      let option = -1;

      if (sense_middle > sense_left && sense_middle > sense_right) {
        // no change
        option = 0;
      } else if (sense_left > sense_right) {
        option = 1;
        agent.heading += modified_turning;
      } else if (sense_right > sense_left) {
        option = 2;
        agent.heading -= modified_turning;
      } else {
        option = 3;
        agent.heading += Math.round(Math.random() * 2 - 1) * settings.turning_speed;
      }
    }
  }

  function step_move() {
    for (let agent of agents) {
      agent.x += settings.speed * Math.cos(agent.heading);
      agent.y += settings.speed * Math.sin(agent.heading);
      if (settings.wrap_around) {
        agent.x = (agent.x + W) % W;
        agent.y = (agent.y + H) % H;
      }
    }
  }

  function step_deposit() {
    for (let agent of agents) {
      const x = Math.round(agent.x);
      const y = Math.round(agent.y);
      if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1)
        continue;

      trail[index(x, y)] += settings.deposit_amount;
    }
  }

  function step_diffuse_and_decay() {
    let old_trail = Float32Array.from(trail);
    for (let y = 1; y < H - 1; ++y) {
      for (let x = 1; x < W - 1; ++x) {
        const diffused_value = (
          old_trail[index(x - 1, y - 1)] * weight[0] +
          old_trail[index(x, y - 1)] * weight[1] +
          old_trail[index(x + 1, y - 1)] * weight[2] +
          old_trail[index(x - 1, y)] * weight[3] +
          old_trail[index(x, y)] * weight[4] +
          old_trail[index(x + 1, y)] * weight[5] +
          old_trail[index(x - 1, y + 1)] * weight[6] +
          old_trail[index(x, y + 1)] * weight[7] +
          old_trail[index(x + 1, y + 1)] * weight[8]
        );

        trail[index(x, y)] = Math.min(1.0, diffused_value * settings.decay_factor);
      }
    }
  }

  step_sense_and_rotate();
  step_move();
  step_deposit();
  step_diffuse_and_decay();
  return trail;
}

function render(trail, agents) {
  gfx.loadPixels();
  const max_brightness = settings.highlight_agents ? 50 : 255;
  let i = 0;
  for (let y = 0; y < W; ++y) {
    for (let x = 0; x < H; ++x) {
      const value = trail[i];
      const brightness = Math.floor(value * max_brightness);

      let colorshift = { r: 0, g: 0, b: 0 };
      gfx.pixels[i * 4 + 0] = brightness + colorshift.r;
      gfx.pixels[i * 4 + 1] = brightness + colorshift.g;
      gfx.pixels[i * 4 + 2] = brightness + colorshift.b;
      gfx.pixels[i * 4 + 3] = 255;
      i++;
    }
  }

  if (settings.highlight_agents) {
    for (let agent of agents) {
      let color = [0, 0, 0];
      switch (agent.last_option) {
        case 0: color = [150, 50, 50]; break; // straight
        case 1: color = [50, 150, 50]; break; // right
        case 2: color = [50, 50, 150]; break; // left
        case 3: color = [255, 255, 255]; break; // indecisive
      }
      gfx.pixels[(Math.floor(agent.x) + Math.floor(agent.y) * W) * 4 + 0] = color[0];
      gfx.pixels[(Math.floor(agent.x) + Math.floor(agent.y) * W) * 4 + 1] = color[1];
      gfx.pixels[(Math.floor(agent.x) + Math.floor(agent.y) * W) * 4 + 2] = color[2];
    }
  }
  gfx.updatePixels();
}

function regenerate() {
  agents.splice(0, agents.length); // empty list

  // if (settings.start_in_circle) {
  //   const radius = Math.min(W, H) * 0.3;
  //   for (let i = 0; i < settings.num_agents; ++i) {
  //     const t = 2 * Math.PI * i / settings.num_agents;
  //     agents.push({
  //       x: Math.cos(t) * radius + W / 2,
  //       y: Math.sin(t) * radius + H / 2,
  //       heading: t - Math.PI / 2,
  //     });
  //   }
  // } else {
  for (let i = 0; i < settings.num_agents; ++i) {
    agents.push({
      x: Math.random() * W,
      y: Math.random() * H,
      heading: Math.random() * 2 * Math.PI, // radians
    });
  }
  // }
  regenerate_next = false;
}

function reset() {
  trail = new Float32Array(W * H);
  regenerate();
}

function setup() {
  W = 400;
  H = 400;

  settings = {
    sensor_distance: 3,
    sensor_angle: radians(10), // radians
    turning_speed: radians(10), // radians
    speed: 1,
    decay_factor: 0.9,
    deposit_amount: 0.2,
    num_agents: 5000,
    start_in_circle: false, // otherwise start randomly
    highlight_agents: false,
    random_turning: false, // randomly turn within the limits of turning_speed
    wrap_around: true,
  }

  createCanvas(windowWidth, windowHeight);
  trail = new Float32Array(W * H);
  gfx = createGraphics(W, H);
  gfx.pixelDensity(1);
}

function draw() {
  if (regenerate_next) {
    regenerate();
  }
  trail = sim_step(agents, trail, mouseX, mouseY);
  render(trail, agents);

  image(gfx, 0, 0, width, height);
}